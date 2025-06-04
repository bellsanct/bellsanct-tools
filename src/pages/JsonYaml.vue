<template>
  <h1 class="text-4xl bg-gray-800 text-white text-center font-bold py-6">
    JSON⇔YAML 変換
  </h1>
  <div class="min-h-screen bg-gray-800 pt-10 text-white flex flex-col items-center justify-top">
    <div class="flex flex-col md:flex-row w-3/4 space-y-4 md:space-y-0 md:space-x-4">
      <div class="flex-1">
        <label class="block mb-2">JSON</label>
        <textarea
          v-model="jsonText"
          class="textarea textarea-bordered w-full h-48 bg-gray-700 text-white p-2"
        ></textarea>
        <div class="flex justify-between mt-2">
          <button
            class="bg-cyan-700 hover:bg-cyan-900 text-white font-bold py-2 px-4 rounded"
            @click="jsonToYaml"
          >
            JSON → YAML
          </button>
          <button
            class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            @click="copy(jsonText)"
          >
            コピー
          </button>
        </div>
      </div>
      <div class="flex-1">
        <label class="block mb-2">YAML</label>
        <textarea
          v-model="yamlText"
          class="textarea textarea-bordered w-full h-48 bg-gray-700 text-white p-2"
        ></textarea>
        <div class="flex justify-between mt-2">
          <button
            class="bg-cyan-700 hover:bg-cyan-900 text-white font-bold py-2 px-4 rounded"
            @click="yamlToJson"
          >
            YAML → JSON
          </button>
          <button
            class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            @click="copy(yamlText)"
          >
            コピー
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      jsonText: "",
      yamlText: "",
      yamlLib: null,
    };
  },
  methods: {
    async ensureLib() {
      if (!this.yamlLib) {
        this.yamlLib = await import(
          "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm"
        );
      }
    },
    async jsonToYaml() {
      await this.ensureLib();
      try {
        const obj = JSON.parse(this.jsonText || "{}");
        this.yamlText = this.yamlLib.dump(obj);
      } catch (e) {
        alert("JSONの解析に失敗しました");
      }
    },
    async yamlToJson() {
      await this.ensureLib();
      try {
        const obj = this.yamlLib.load(this.yamlText || "");
        this.jsonText = JSON.stringify(obj, null, 2);
      } catch (e) {
        alert("YAMLの解析に失敗しました");
      }
    },
    copy(text) {
      navigator.clipboard
        .writeText(text)
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
