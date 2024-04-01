<template>
  <h1 class="text-4xl bg-gray-800 text-white text-center font-bold py-6">文字数カウンター</h1>
  <div
    class="min-h-screen bg-gray-800 pt-10 text-white flex flex-col items-center justify-top"
  >
    <textarea
      class="textarea textarea-bordered w-3/4 h-48 bg-gray-700 text-white"
      placeholder="ここにテキストを入れてください"
      v-model="text"
    ></textarea>
    <div class="mt-6">
      <table class="table-auto border-collapse border border-gray-500">
        <tbody>
          <tr>
            <td class="border border-gray-500 px-4 py-2">
              文字数（スペース含む）
            </td>
            <td class="border border-gray-500 px-4 py-2">
              {{ countCharactersIncludingSpaces }}
            </td>
          </tr>
          <tr>
            <td class="border border-gray-500 px-4 py-2">
              文字数（スペース除く）
            </td>
            <td class="border border-gray-500 px-4 py-2">
              {{ countCharactersExcludingSpaces }}
            </td>
          </tr>
          <tr>
            <td class="border border-gray-500 px-4 py-2">行数</td>
            <td class="border border-gray-500 px-4 py-2">{{ countLines }}</td>
          </tr>
          <tr>
            <td class="border border-gray-500 px-4 py-2">段落数</td>
            <td class="border border-gray-500 px-4 py-2">
              {{ countParagraphs }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: "",
    };
  },
  computed: {
    countCharactersIncludingSpaces() {
      return this.text.length;
    },
    countCharactersExcludingSpaces() {
      return this.text.replace(/\s+/g, "").length;
    },
    countLines() {
      return this.text.split(/\r\n|\r|\n/).length;
    },
    countParagraphs() {
      return this.text.split(/\n\n|\r\n\r\n/).length;
    },
  },
};
</script>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
</style>
