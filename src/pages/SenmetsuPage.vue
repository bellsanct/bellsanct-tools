<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center">
    <div class="w-11/12 md:w-5/6 lg:w-3/4 xl:w-2/3">
      <div class="flex items-center justify-between py-6">
        <h1 class="text-3xl md:text-4xl font-bold">DnF 妖怪殲滅 可視化</h1>
        <button
          @click="showInfo = true"
          aria-label="使い方と計算の解説"
          class="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-500 text-gray-300 hover:text-white hover:border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          i
        </button>
      </div>

      <!-- 入力 -->
      <div class="bg-gray-800 rounded-lg p-4 md:p-6">
        <h2 class="text-2xl font-semibold mb-4">入力</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm opacity-80 mb-1"
              >z: 交換可能残痕の単価（ゴールド）</label
            >
            <input
              type="number"
              min="0"
              step="1"
              v-model.number="z"
              class="w-full bg-gray-700 text-white p-2 rounded"
            />
          </div>
          <div>
            <label class="block text-sm opacity-80 mb-1"
              >t: 手がかり相場（ゴールド）</label
            >
            <input
              type="number"
              min="0"
              step="1"
              v-model.number="t"
              class="w-full bg-gray-700 text-white p-2 rounded"
            />
          </div>
          <div>
            <label class="block text-sm opacity-80 mb-1"
              >c: 帰属残痕の変換割合（%）</label
            >
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              v-model.number="c"
              class="w-full bg-gray-700 text-white p-2 rounded"
            />
          </div>
        </div>
      </div>

      <!-- 計算結果 -->
      <div class="bg-gray-800 rounded-lg p-4 md:p-6">
        <h2 class="text-2xl font-semibold mb-3">計算結果</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-lg">
          <div>
            <div class="opacity-70 text-sm">
              1周当たりの交換可能残痕の期待個数
            </div>
            <div class="font-semibold">{{ fmt(A) }}</div>
          </div>
          <div>
            <div class="opacity-70 text-sm">獲得量</div>
            <div class="font-semibold">{{ fmt(gain) }}</div>
          </div>
          <div>
            <div class="opacity-70 text-sm">粗利</div>
            <div
              :class="
                profit >= 0
                  ? 'text-green-400 font-semibold'
                  : 'text-red-400 font-semibold'
              "
            >
              {{ fmt(profit) }}
            </div>
          </div>
        </div>
      </div>

      <!-- グラフ -->
      <div class="bg-gray-800 rounded-lg p-4 md:p-6">
        <h2 class="text-2xl font-semibold mb-4">
          z を横軸、獲得量 を縦軸にした可視化
        </h2>
        <div class="overflow-x-auto">
          <svg
            :width="svg.w"
            :height="svg.h"
            role="img"
            aria-label="profit chart"
          >
            <!-- 背景 -->
            <rect
              :x="svg.padL"
              :y="svg.padT"
              :width="plotW"
              :height="plotH"
              fill="#111827"
            />

            <!-- 正の領域（損益分岐線より下、粗利>=0） -->
            <path :d="fillPathPositive" fill="rgba(34,197,94,0.12)" />

            <!-- 軸 -->
            <line
              :x1="svg.padL"
              :y1="svg.h - svg.padB"
              :x2="svg.padL + plotW"
              :y2="svg.h - svg.padB"
              stroke="#9ca3af"
            />
            <line
              :x1="svg.padL"
              :y1="svg.padT"
              :x2="svg.padL"
              :y2="svg.padT + plotH"
              stroke="#9ca3af"
            />

            <!-- z 目盛り -->
            <template v-for="tick in zTicks" :key="'z' + tick">
              <line
                :x1="sx(tick)"
                :x2="sx(tick)"
                :y1="svg.h - svg.padB"
                :y2="svg.h - svg.padB + 6"
                stroke="#9ca3af"
              />
              <text
                :x="sx(tick)"
                :y="svg.h - svg.padB + 18"
                fill="#9ca3af"
                font-size="10"
                text-anchor="middle"
              >
                {{ short(tick) }}
              </text>
            </template>

            <!-- t 目盛り -->
            <template v-for="tick in tTicks" :key="'t' + tick">
              <line
                :x1="svg.padL - 6"
                :x2="svg.padL"
                :y1="sy(tick)"
                :y2="sy(tick)"
                stroke="#9ca3af"
              />
              <text
                :x="svg.padL - 8"
                :y="sy(tick) + 3"
                fill="#9ca3af"
                font-size="10"
                text-anchor="end"
              >
                {{ short(tick) }}
              </text>
            </template>

            <!-- 獲得量の直線（y = 240,000 + 期待個数·z） -->
            <line
              :x1="sx(0)"
              :y1="sy(bIntercept)"
              :x2="sx(zMax)"
              :y2="sy(lineAtZMax)"
              stroke="#60a5fa"
              stroke-width="2"
            />
            <text
              :x="sx(0) + 6"
              :y="sy(bIntercept) - 6"
              fill="#93c5fd"
              font-size="10"
            >
              周当たりゴールド期待値
            </text>

            <!-- コスト（t）の水平線 -->
            <line
              :x1="sx(0)"
              :y1="sy(t)"
              :x2="sx(zMax)"
              :y2="sy(t)"
              stroke="#ef4444"
              stroke-dasharray="4 4"
            />
            <text :x="sx(0) + 6" :y="sy(t) - 6" fill="#fca5a5" font-size="10">
              手がかりの値段
            </text>

            <!-- 現在点（縦軸は獲得量） -->
            <circle
              :cx="sx(z)"
              :cy="sy(gain)"
              r="5"
              :fill="profit >= 0 ? '#22c55e' : '#ef4444'"
              stroke="#fff"
              stroke-width="1"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Info Modal -->
    <div
      v-if="showInfo"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/60"
        @click="showInfo = false"
        aria-hidden="true"
      ></div>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="使い方と計算の解説"
        class="relative bg-gray-800 rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[80vh] overflow-y-auto p-5"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">使い方と計算の解説</h3>
          <button
            @click="showInfo = false"
            aria-label="閉じる"
            class="text-gray-300 hover:text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            ×
          </button>
        </div>
        <div class="mt-4 space-y-3 text-sm leading-6 opacity-90">
          <p>
            このツールは、z（交換可能残痕の単価）、t（手がかり相場）、c（帰属残痕の変換割合[%]）から獲得量と粗利を可視化します。
          </p>
          <p>
            計算式: 獲得量 = 240,000 + (3 + 4.6×(c/100))·z、 粗利 = 獲得量 - t。
          </p>
          <p>
            “1周当たりの交換可能残痕の期待個数” = 3 + 4.6×(c/100)。例えば c=100%
            のとき 期待個数=7.6 なので、獲得量 = 240,000 + 7.6·z になります。
          </p>
          <p>
            チャートは横軸が z、縦軸が 獲得量。青線は 獲得量 = 240,000 +
            期待個数·z、赤い破線はコスト t
            です。青線が赤線より上にある領域が黒字（粗利 ≥ 0）です。
          </p>
          <p>
            範囲は z: 0〜{{ short(zMax) }}, t: 0〜{{
              short(tMax)
            }}。必要に応じて z と t を変更し、c は 0〜100% で指定してください。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SenmetsuPage",
  data() {
    return {
      // 入力値
      z: 11000, // 交換可能残痕の単価（ゴールド）
      t: 290000, // 手がかり相場（ゴールド）
      c: 100, // 帰属残痕の変換割合（%）
      // グラフ設定
      zMax: 50000, // z: 0〜50,000
      tMax: 500000, // 縦軸（獲得量）: 0〜500,000
      svg: { w: 720, h: 420, padL: 56, padR: 16, padT: 20, padB: 34 },
      showInfo: false,
    };
  },
  mounted() {
    // 後方互換: 旧仕様（c∈[0,1]）を％へ補正
    if (Number.isFinite(this.c) && this.c <= 1) {
      this.c = Math.round(this.c * 100);
    }
    if (!Number.isFinite(this.c)) this.c = 0;
    if (this.c < 0) this.c = 0;
    if (this.c > 100) this.c = 100;
  },
  computed: {
    // 1周当たりの交換可能残痕の期待個数 = 3 + 4.6×(c/100)
    A() {
      const raw = isFinite(this.c) ? Math.max(this.c, 0) : 0;
      const ratio = raw <= 1 ? Math.min(raw, 1) : Math.min(raw, 100) / 100;
      const v = 3 + 4.6 * ratio;
      return Math.round(v * 100) / 100;
    },
    // 獲得量 = 240000 + A·z
    gain() {
      const gz = 240000 + this.A * (isFinite(this.z) ? Math.max(this.z, 0) : 0);
      return Math.round(gz);
    },
    // 粗利 = 獲得量 - t
    profit() {
      const tt = isFinite(this.t) ? Math.max(this.t, 0) : 0;
      return Math.round(this.gain - tt);
    },
    // SVG 補助
    plotW() {
      return this.svg.w - this.svg.padL - this.svg.padR;
    },
    plotH() {
      return this.svg.h - this.svg.padT - this.svg.padB;
    },
    bIntercept() {
      // z=0 のときの t
      return 240000;
    },
    lineAtZMax() {
      return 240000 + this.A * this.zMax;
    },

    // 軸目盛り
    zTicks() {
      const step = this.zMax / 5;
      return Array.from({ length: 6 }, (_, i) => Math.round(i * step));
    },
    tTicks() {
      const step = this.tMax / 5;
      return Array.from({ length: 6 }, (_, i) => Math.round(i * step));
    },
    // 正の領域塗りつぶし（獲得量 >= t の範囲）
    fillPathPositive() {
      if (!(this.A > 0)) return "";
      const yGain0 = this.bIntercept;
      const yGainMax = this.lineAtZMax;
      // 右端まで到達しても t を超えない場合は塗らない
      if (yGain0 < this.t && yGainMax < this.t) return "";
      // 破線 t との交点 z*
      const zStarRaw = (this.t - 240000) / this.A;
      const zStart = isFinite(zStarRaw)
        ? Math.max(0, Math.min(this.zMax, zStarRaw))
        : 0;
      const points = [];
      // 下辺（t の水平線）
      points.push([this.sx(zStart), this.sy(this.t)]);
      points.push([this.sx(this.zMax), this.sy(this.t)]);
      // 上辺（獲得量の直線）
      points.push([this.sx(this.zMax), this.sy(yGainMax)]);
      points.push([this.sx(zStart), this.sy(240000 + this.A * zStart)]);
      return `M ${points.map((p) => p.join(",")).join(" L ")} Z`;
    },
  },
  methods: {
    // スケール関数: データ -> 画面座標
    sx(z) {
      const x = Math.min(Math.max(z, 0), this.zMax);
      return this.svg.padL + (x / this.zMax) * this.plotW;
    },
    sy(t) {
      const y = Math.min(Math.max(t, 0), this.tMax);
      // SVG の y は下に行くほど大きいので反転
      return this.svg.padT + (1 - y / this.tMax) * this.plotH;
    },
    fmt(n) {
      const v = Number.isFinite(n) ? Math.round(n) : 0;
      return v.toLocaleString();
    },
    short(n) {
      if (!isFinite(n)) return String(n);
      if (n >= 1_000_000) return `${Math.round(n / 100000) / 10}M`;
      if (n >= 1000) return `${Math.round(n / 100) / 10}k`;
      return `${n}`;
    },
  },
};
</script>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
</style>
