<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center">
    <h1 class="text-3xl md:text-4xl font-bold py-4">贈り物クイズ（Normal）</h1>

    <!-- Top Bar -->
    <div class="w-full max-w-5xl px-4 flex items-center justify-between">
      <div class="text-lg">
        残り時間：<span class="font-bold text-2xl tabular-nums">{{
          remaining
        }}</span
        >s
      </div>
      <div class="text-lg">
        スコア：<span class="font-bold text-2xl tabular-nums">{{ score }}</span>
      </div>
      <div class="text-sm opacity-70">SEED: {{ seed }}</div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-10 opacity-80">データ読み込み中…</div>

    <!-- Current Student & Start -->
    <div v-else class="w-full max-w-5xl px-4 mt-6">
      <div class="bg-gray-800 rounded-2xl p-4 flex items-center gap-4">
        <!-- プレイ中のみ表示 -->
        <img
          v-if="isRunning && currentStudent"
          :src="currentStudent.icon"
          :alt="currentStudent.name"
          class="w-16 h-16 rounded-full ring-2 ring-cyan-400"
        />
        <div class="flex-1">
          <div class="text-xl font-semibold">
            <template v-if="isRunning && currentStudent">
              {{ currentStudent.name }}
            </template>
            <template v-else>【ここに生徒名が表示されます】</template>
          </div>
          <div class="text-sm opacity-80 mt-5">
            Normalの遊び方 :<br />
            スタートを押すと、生徒がランダムに表示されます。その生徒に最適な通常贈り物をクリックしましょう。<br />
            1分間で可能な限り繰り返してより多くのスコアを獲得しましょう。<br />
          </div>
        </div>
        <button
          class="px-4 py-2 rounded font-semibold"
          @click="startGame"
          :disabled="isRunning"
          :class="
            isRunning
              ? 'bg-red-700 hover:bg-red-800'
              : 'bg-cyan-700 hover:bg-cyan-800'
          "
        >
          {{ isRunning ? "プレイ中…" : "スタート" }}
        </button>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div
        v-if="toast"
        class="fixed top-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg text-center z-40"
      >
        {{ toast }}
      </div>
    </transition>

    <!-- Items Grid (icons only, fixed order) -->
    <div v-if="!loading" class="w-full max-w-5xl px-4 mt-6 mb-12">
      <div class="flex flex-wrap gap-2 items-center justify-center">
        <button
          v-for="it in items"
          :key="it.id"
          class="bg-gray-800 hover:bg-gray-700 rounded-xl ring-1 ring-gray-700 hover:ring-cyan-500 transition"
          :disabled="!isRunning"
          @click="pickItem(it.id)"
          :aria-label="`item-${it.id}`"
          style="width: 65px; height: 65px"
        >
          <img
            :src="it.src"
            :alt="`item-${it.id}`"
            class="w-full aspect-square object-contain select-none pointer-events-none"
            draggable="false"
          />
        </button>
      </div>
    </div>

    <!-- Result -->
    <div
      v-if="showResult"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 p-6 rounded-2xl w-[90%] max-w-lg">
        <h2 class="text-2xl font-bold mb-4">🎉結果発表</h2>
        <p class="mb-2">
          スコア：<span class="text-3xl font-bold">{{ score }}</span>
        </p>
        <p class="mb-4">回答数：{{ statTotal }}</p>
        <div class="flex gap-3 justify-end">
          <button
            class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            @click="showResult = false"
          >
            閉じる
          </button>
          <button
            class="bg-cyan-700 hover:bg-cyan-800 px-4 py-2 rounded font-semibold"
            @click="restart"
          >
            もう一度
          </button>
          <!-- Xでシェア -->
          <a
            :href="tweetUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
          >
            Xでシェア
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadStudents, loadItems, loadAffinities } from "@/BAutils/dataLoader";

const SCORING = { small: 0, medium: 40, large: 60, huge: 80 };

function shuffleArray(arr) {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

/** prevId を先頭にしないシャッフルを作る */
function makeOrderNoRepeat(students, seed, prevId = null) {
  let tries = 0;
  while (tries < 5) {
    const arr = shuffleArray(students);
    if (!arr.length || !prevId || arr[0].id !== prevId) return arr;
    tries++;
  }
  // それでもダメなら先頭を後ろに送る
  const fallback = shuffleArray(students);
  if (fallback.length > 1 && fallback[0].id === prevId) {
    const first = fallback.shift();
    fallback.push(first);
  }
  return fallback;
}

export default {
  name: "GiftQuizBA",
  data() {
    return {
      // 設定
      duration: 60, // 1分

      // 状態
      loading: true,
      isRunning: false,
      remaining: 60,
      score: 0,

      // データ
      students: [],
      items: [],
      affinityTable: {},

      // 進行
      index: 0,
      order: [],

      // UI/統計
      toast: "",
      toastTimer: null,
      showResult: false,
      statTotal: 0,
      statPerfect: 0,
    };
  },
  computed: {
    currentStudent() {
      if (!this.order.length || this.index >= this.order.length) return null;
      return this.order[this.index];
    },
    tweetUrl() {
      const appUrl = "https://bellsanct-tools.vercel.app/BAGiftQuiz";
      const text = `贈り物クイズ（Normal）でスコア${this.score}点を獲得しました！\n回答数:${this.statTotal} \n`;
      return `https://x.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(appUrl)}`;
    },
  },
  methods: {
    async initData() {
      this.students = loadStudents();
      this.items = loadItems();
      this.affinityTable = loadAffinities();
      // 初期順（まだプレイ前なので prevId なし）
      this.order = makeOrderNoRepeat(this.students, this.seed, null);
      this.loading = false;
    },
    startGame() {
      if (this.isRunning || this.loading) return;
      // プレイ開始時に、前回の最後と被らないように順番を作る
      const prevLast = this.currentStudent ? this.currentStudent.id : null;
      this.order = makeOrderNoRepeat(this.students, this.seed, prevLast);
      this.index = 0;
      this.score = 0;
      this.remaining = this.duration;
      this.isRunning = true;
      this.showResult = false;
      this.statTotal = 0;
      this.statPerfect = 0;
      this.tick();
    },
    tick() {
      const t0 = Date.now();
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - t0) / 1000);
        this.remaining = Math.max(this.duration - elapsed, 0);
        if (this.remaining <= 0) {
          clearInterval(timer);
          this.finish();
        }
      }, 250);
    },
    finish() {
      this.isRunning = false;
      this.showResult = true;
    },
    pickItem(itemId) {
      if (!this.isRunning || !this.currentStudent) return;

      const stuId = this.currentStudent.id;
      const rank =
        (this.affinityTable[stuId] && this.affinityTable[stuId][itemId]) ||
        "small";
      const add = SCORING[rank] || 0;

      this.score += add;
      this.statTotal += 1;
      // if (rank === "huge") this.statPerfect += 1;

      this.flashToast(this.rankText(rank, add));

      // 次の生徒へ
      this.index += 1;

      // 1周しきったら、新しい周回を作る（直前と先頭が連続しないように）
      if (this.index >= this.order.length) {
        const prevId = this.order[this.order.length - 1].id;
        this.order = makeOrderNoRepeat(
          this.students,
          this.seed + Math.floor(this.statTotal / this.students.length),
          prevId
        );
        this.index = 0;
      }
    },
    rankText(rank, add) {
      switch (rank) {
        case "large":
          return `+${add}`;
        case "medium":
          return `+${add}`;
        default:
          return `+${add}`;
      }
    },
    flashToast(text) {
      this.toast = text;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => (this.toast = ""), 700);
    },
    restart() {
      this.showResult = false;
      this.startGame();
    },
  },
  async mounted() {
    try {
      await this.initData();
    } catch (e) {
      console.error(e);
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
