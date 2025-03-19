<template>
  <h1 class="text-4xl bg-gray-800 text-white text-center font-bold py-6">
    HTML/CSS/JS Minify & 復元ツール
  </h1>
  <div
    class="min-h-screen bg-gray-800 pt-10 text-white flex flex-col items-center justify-top"
  >
    <div class="w-3/4 mb-2">
      <label class="block text-lg">モード選択:</label>
      <select
        v-model="selectedMode"
        class="w-full bg-gray-700 text-white p-2 rounded"
      >
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="js">JavaScript</option>
      </select>
    </div>

    <div class="mt-2 mb-6 w-3/4">
      <div class="flex border-b border-gray-600">
        <button
          class="flex-1 p-2 text-center bg-gray-700 hover:bg-gray-600"
          :class="{ 'bg-gray-900': activeTab === 'minify' }"
          @click="activeTab = 'minify'"
        >
          圧縮(Minify)
        </button>
        <button
          class="flex-1 p-2 text-center bg-gray-700 hover:bg-gray-600"
          :class="{ 'bg-gray-900': activeTab === 'format' }"
          @click="activeTab = 'format'"
        >
          復元(Clean)
        </button>
      </div>
    </div>

    <textarea
      class="textarea textarea-bordered w-3/4 h-48 bg-gray-700 text-white p-4"
      placeholder="ここにコードを入力してください"
      v-model="inputCode"
    ></textarea>

    <div class="mt-6 w-3/4 flex justify-end space-x-4">
      <button
        v-if="activeTab === 'minify'"
        class="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
        @click="minifyCode"
      >
        圧縮する
      </button>
      <button
        v-if="activeTab === 'format'"
        class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
        @click="formatCode"
      >
        復元する
      </button>
    </div>

    <div class="mt-6 w-3/4">
      <h2 class="text-2xl font-bold">出力結果</h2>
      <div class="relative">
        <button
          class="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded"
          @click="copyToClipboard"
        >
          コピー
        </button>
        <pre
          class="bg-gray-900 text-white p-4 mt-2 rounded break-words whitespace-pre-wrap"
          style="min-height: 200px"
          >{{ outputCode }}</pre
        >
      </div>
    </div>
  </div>
</template>

<script>
import prettier from "prettier/standalone";
import parserHtml from "prettier/parser-html";
import parserCss from "prettier/parser-postcss";
import parserJs from "prettier/parser-babel";
import csso from "csso";
import { minify } from "terser";

export default {
  data() {
    return {
      inputCode: "",
      outputCode: "",
      activeTab: "minify",
      selectedMode: "html",
    };
  },
  methods: {
    async minifyCode() {
      try {
        let result = this.inputCode;
        if (this.selectedMode === "html") {
          result = result.replace(/\s+/g, " ").trim();
        } else if (this.selectedMode === "css") {
          result = csso.minify(result).css;
        } else if (this.selectedMode === "js") {
          const minified = await minify(result, { toplevel: true });
          result = minified.code || "";
        }
        this.outputCode = result;
      } catch (error) {
        console.error("Minify Error:", error);
      }
    },
    async formatCode() {
      try {
        let result = this.inputCode;
        if (this.selectedMode === "html") {
          result = prettier.format(result, {
            parser: "html",
            plugins: [parserHtml],
          });
        } else if (this.selectedMode === "css") {
          result = prettier.format(result, {
            parser: "css",
            plugins: [parserCss],
          });
        } else if (this.selectedMode === "js") {
          result = prettier.format(result, {
            parser: "babel",
            plugins: [parserJs],
          });
        }
        this.outputCode = result;
      } catch (error) {
        console.error("Format Error:", error);
      }
    },
    copyToClipboard() {
      navigator.clipboard
        .writeText(this.outputCode)
        .then(() => {
          alert("コピーしました！");
        })
        .catch((err) => {
          console.error("コピーに失敗しました: ", err);
        });
    },
  },
};
</script>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
</style>
