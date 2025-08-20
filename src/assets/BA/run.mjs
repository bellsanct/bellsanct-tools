#!/usr/bin/env node
/**
 * wikiテーブルHTML → affinities.json 変換バッチ（ESM）
 *
 * 使い方:
 *   node parse-wikiru-affinities.mjs <table.html> <items.json> <students.json> --out <affinities.json>
 *
 * 入力:
 * - table.html     : wiki のテーブル要素のみ（<tr>…</tr> の塊）
 * - items.json     : [{ "id": 0, "name": "ウェーブキャットの枕", "filename": "0.png" }, ...]
 * - students.json  : [{ "id": "airi", "name": "アイリ", "iconFilename": "airi.png" }, ...]
 *
 * 出力:
 * - affinities.json:
 *    {
 *      "airi": { "8": "large", "12": "medium" },
 *      "atsuko": { ... }
 *    }
 *
 * ルール:
 *  - 背景色 #F8EEFF -> 'large', #EEFFF8 -> 'medium' （他は無視）
 *  - 生徒名は students.json の name と突合（括弧・空白・全半角ゆれ吸収、括弧削除版も許容）
 *  - アイテム名は items.json の name と突合（同様に正規化）。見つからない場合は "部分一致"で補完。
 */

import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

// -------- CLI --------
const [htmlPath, itemsPath, studentsPath, ...rest] = process.argv.slice(2);
if (!htmlPath || !itemsPath || !studentsPath) {
  console.error(
    "Usage: node parse-wikiru-affinities.mjs <table.html> <items.json> <students.json> [--out affinities.json]"
  );
  process.exit(1);
}
const outPath = getArg(rest, "--out", "affinities.json");

function getArg(argv, flag, def) {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : def;
}

// -------- Helpers: 正規化 --------
// 全角→半角括弧、波ダッシュゆれ、全空白削除
function normalizeParen(s = "") {
  return s.replace(/（/g, "(").replace(/）/g, ")");
}
function normalizeWaveDash(s = "") {
  // 波ダッシュの異体字を統一（〜 U+301C, ～ U+FF5E, ~）
  return s.replace(/[〜～]/g, "~");
}
function stripParenAll(s = "") {
  // 全ての括弧内を除去（複数あってもOK）
  return normalizeParen(s).replace(/\([^()]*\)/g, "");
}
function normCore(s) {
  return normalizeWaveDash(normalizeParen(String(s || "")))
    .replace(/\u00A0/g, " ") // nbsp→space
    .replace(/\s+/g, "") // 全空白削除
    .trim();
}
function normFull(s) {
  // フル正規化（記号の一部も丸め込みたい場合、ここで追記）
  return normCore(s);
}

// 部分一致の評価（より長い候補を優先）
function pickBestPartialMatch(normTarget, candidates) {
  if (!candidates.length) return null;
  // 最長 name（文字数が多い = より具体的）を優先
  candidates.sort((a, b) => b.normName.length - a.normName.length);
  // 先頭を採用、同点が複数なら曖昧なので null を返す
  if (
    candidates.length >= 2 &&
    candidates[0].normName.length === candidates[1].normName.length
  ) {
    return null; // ambiguous
  }
  return candidates[0];
}

// -------- 背景色 → ランク --------
const COLOR2RANK = {
  F8EEFF: "large",
  EEFFF8: "medium",
};

// -------- Load Files --------
const html = fs.readFileSync(htmlPath, "utf8");
const items = JSON.parse(fs.readFileSync(itemsPath, "utf8"));
const students = JSON.parse(fs.readFileSync(studentsPath, "utf8"));

// items: name (正規化) -> { id, rawName, normName }
const itemsIndex = new Map();
const itemsIndexNoParen = new Map();
for (const it of items) {
  if (!it || typeof it.id === "undefined" || !it.name) {
    console.warn("⚠️ items.json 行に id/name がありません:", it);
    continue;
  }
  const id = Number(it.id);
  const raw = String(it.name);
  const n1 = normFull(raw);
  const n2 = normFull(stripParenAll(raw));
  itemsIndex.set(n1, { id, rawName: raw, normName: n1 });
  itemsIndexNoParen.set(n2, { id, rawName: raw, normName: n2 });
}

// students: name (正規化) -> { id, rawName }
const studentsIndex = new Map();
const studentsIndexNoParen = new Map();
for (const s of students) {
  if (!s || !s.id || !s.name) {
    console.warn("⚠️ students.json 行に id/name がありません:", s);
    continue;
  }
  const id = String(s.id);
  const raw = String(s.name);
  const n1 = normFull(raw);
  const n2 = normFull(stripParenAll(raw));
  studentsIndex.set(n1, { id, rawName: raw });
  studentsIndexNoParen.set(n2, { id, rawName: raw });
}

// -------- Parse HTML --------
const $ = cheerio.load(html);
const out = {}; // { [studentId]: { [itemId]: 'medium'|'large' } }

$("tr").each((_, tr) => {
  const $tds = $(tr).find("> td");
  if ($tds.length === 0) return;

  // 1列目: 生徒名（<a>複数なら連結）
  const $first = $tds.eq(0);
  const linkTexts = $first
    .find("a")
    .map((__, a) => $(a).text())
    .get();
  const rawName = (
    linkTexts.length ? linkTexts.join("") : $first.text() || ""
  ).trim();
  if (!rawName) return;

  // 生徒ID解決（正規化 → だめなら括弧削除）
  let stuRec = studentsIndex.get(normFull(rawName));
  if (!stuRec)
    stuRec = studentsIndexNoParen.get(normFull(stripParenAll(rawName)));
  if (!stuRec) {
    console.warn(`⚠️ 生徒名が students.json で見つかりません: "${rawName}"`);
    return;
  }
  const studentId = stuRec.id;
  if (!out[studentId]) out[studentId] = {};

  // 2列目以降：背景色→ランク + 画像<title>→ アイテム名解決
  $tds.slice(1).each((__, td) => {
    const style = $(td).attr("style") || "";
    const m = style.match(/background-color\s*:\s*#([0-9a-fA-F]{6})/i);
    const hex = m ? m[1].toUpperCase() : null;
    const rank = COLOR2RANK[hex];
    if (!rank) return; // 指定色以外は無視（= small）

    const $imgs = $(td).find("img[title]");
    if ($imgs.length === 0) return;

    // 1セルに複数imgがあるケースもあるので、最後の title を採用
    const titles = $imgs
      .map((___, im) => $(im).attr("title") || "")
      .get()
      .filter(Boolean);
    const titleRaw = titles.length ? titles[titles.length - 1] : "";
    if (!titleRaw) return;

    // アイテムID解決
    let itemRec = itemsIndex.get(normFull(titleRaw));
    if (!itemRec)
      itemRec = itemsIndexNoParen.get(normFull(stripParenAll(titleRaw)));

    // 見つからない場合は "部分一致" で補完（両方向）
    if (!itemRec) {
      const normTitle = normFull(titleRaw);
      const partials = [];
      for (const rec of itemsIndex.values()) {
        if (
          rec.normName.includes(normTitle) ||
          normTitle.includes(rec.normName)
        ) {
          partials.push(rec);
        }
      }
      if (!partials.length) {
        // 括弧削除タイトルでも試す
        const normTitle2 = normFull(stripParenAll(titleRaw));
        for (const rec of itemsIndexNoParen.values()) {
          if (
            rec.normName.includes(normTitle2) ||
            normTitle2.includes(rec.normName)
          ) {
            partials.push(rec);
          }
        }
      }
      const picked = pickBestPartialMatch(normFull(titleRaw), partials);
      if (picked) {
        itemRec = picked;
      } else {
        console.warn(
          `⚠️ items.json に一致/部分一致が見つかりません: "${titleRaw}"`
        );
      }
    }

    if (!itemRec) return;

    out[studentId][itemRec.id] = rank;
  });
});

// -------- Write Out --------
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log("✅ Wrote:", outPath);
