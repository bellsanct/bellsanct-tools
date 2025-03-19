<template>
  <div class="min-h-screen bg-gray-800 text-white">
    <header class="py-6 text-center">
      <h1 class="text-4xl font-bold">適当なツール置き場</h1>
    </header>
    <div class="container mx-auto px-4">
      <!-- ツールカードのグリッド -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Minifyツール -->
        <div class="bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col">
          <div class="flex items-center mb-4">
            <span class="text-4xl mr-3">✒</span>
            <h2 class="text-2xl font-semibold">Minify/Cleanツール</h2>
          </div>
          <p class="mb-4">
            HTML/CSS/JSの簡易的な圧縮・復元を行うことができるツールです
          </p>
          <router-link
            to="/MinifyTool"
            class="mt-auto inline-block bg-cyan-700 hover:bg-cyan-900 text-white text-center font-bold py-2 px-4 rounded"
          >
            Minify/Cleanツールを試す
          </router-link>
        </div>
        <!-- 文字数カウンターカード -->
        <div class="bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col">
          <div class="flex items-center mb-4">
            <span class="text-4xl mr-3">🔢</span>
            <h2 class="text-2xl font-semibold">文字数カウンター</h2>
          </div>
          <p class="mb-4">
            入力テキストの文字数（スペース有無）、行数、段落数をカウントするツールです。
          </p>
          <router-link
            to="/CharCalc"
            class="mt-auto inline-block bg-cyan-700 hover:bg-cyan-900 text-white text-center font-bold py-2 px-4 rounded"
          >
            文字数カウンターを試す
          </router-link>
        </div>
        <!-- Markdownビュワーカード -->
        <div class="bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col">
          <div class="flex items-center mb-4">
            <span class="text-4xl mr-3">📄</span>
            <h2 class="text-2xl font-semibold">Markdownビュワー</h2>
          </div>
          <p class="mb-4">
            Markdown形式のテキストをレンダリングして表示するツールです。書いた内容をリアルタイムで確認できます。
          </p>
          <a
            href="https://bellsanct.github.io/markdown-editor/"
            class="mt-auto inline-block bg-cyan-700 hover:bg-cyan-900 text-white text-center font-bold py-2 px-4 rounded"
          >
            Markdownビュワーを試す
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ToolOverview",
};
</script>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
</style>
