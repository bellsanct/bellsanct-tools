/* eslint-disable no-undef */ // これでこのファイルだけ no-undef を無効化できる
// ↑全体を無効化したくないなら ↓だけを採用

// JSON import
import studentsRaw from "@/assets/BA/students.json";
import itemsRaw from "@/assets/BA/items.json";
import affinitiesRaw from "@/assets/BA/affinities.json";

/** Vite / webpack 両対応の BASE */
function getBaseUrl() {
  // Vite
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.BASE_URL
  ) {
    return import.meta.env.BASE_URL;
  }
  // webpack (Vue CLI)
  if (typeof process !== "undefined" && process.env) {
    if (process.env.BASE_URL) return process.env.BASE_URL;
    if (process.env.VUE_APP_BASE_URL) return process.env.VUE_APP_BASE_URL;
    if (process.env.BASE) return process.env.BASE;
  }
  // webpack の公開パス
  // eslint-disable-next-line no-undef
  if (
    typeof __webpack_public_path__ !== "undefined" &&
    __webpack_public_path__
  ) {
    // eslint-disable-next-line no-undef
    return __webpack_public_path__;
  }
  return "/";
}

const BASE = getBaseUrl().replace(/\/+$/, ""); // 末尾スラッシュ除去

function publicUrl(p) {
  return `${BASE}/${String(p).replace(/^\/+/, "")}`;
}

function resolveStudentIcon(filename) {
  return publicUrl(`assets/BA/students/${filename}`);
}
function resolveItemIcon(filename) {
  return publicUrl(`assets/BA/items/${filename}`);
}

export function loadStudents() {
  return studentsRaw.map((s) => ({
    id: s.id,
    name: s.name,
    icon: resolveStudentIcon(s.iconFilename),
  }));
}

export function loadItems() {
  return itemsRaw.map((it) => ({
    id: it.id,
    src: resolveItemIcon(it.filename),
  }));
}

export function loadAffinities() {
  const table = {};
  for (const [stu, map] of Object.entries(affinitiesRaw)) {
    table[stu] = {};
    for (const [itemId, rank] of Object.entries(map)) {
      table[stu][Number(itemId)] = rank;
    }
  }
  return table;
}
