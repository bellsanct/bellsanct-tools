<template>
  <div class="min-h-screen bg-gray-800 text-white">
    <!-- ヘッダー -->
    <h1 class="text-4xl bg-gray-900 text-white text-center font-bold py-6">
      JSON 可視化ツール
    </h1>

    <!-- 入力セクション -->
    <div class="container mx-auto px-4 py-6">
      <div class="mb-4">
        <label class="block mb-2 text-lg">
          JSON 入力
          <span class="text-sm text-gray-400 ml-2">(JSONファイルをドラッグ&ドロップ可能)</span>
        </label>
        <div
          class="relative"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleFileDrop"
        >
          <textarea
            v-model="jsonInput"
            :class="[
              'w-full h-32 bg-gray-700 text-white p-4 rounded-lg border-2 focus:outline-none font-mono text-sm transition-colors',
              isDragging ? 'border-cyan-400 bg-gray-600' : 'border-gray-600 focus:border-cyan-500'
            ]"
            placeholder='{"user": {"name": "太郎", "age": 25}}'
          ></textarea>
          <div
            v-if="isDragging"
            class="absolute inset-0 bg-cyan-500 bg-opacity-10 border-2 border-cyan-400 border-dashed rounded-lg flex items-center justify-center pointer-events-none"
          >
            <span class="text-cyan-400 font-bold text-lg">ここにJSONファイルをドロップ</span>
          </div>
        </div>
      </div>

      <!-- ボタン群 -->
      <div class="flex gap-4 mb-4">
        <button
          @click="visualizeJSON"
          class="bg-cyan-700 hover:bg-cyan-900 text-white font-bold py-2 px-6 rounded transition"
        >
          可視化実行
        </button>
        <button
          @click="loadSample"
          class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded transition"
        >
          サンプル読み込み
        </button>
        <button
          @click="clearCanvas"
          class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded transition"
        >
          クリア
        </button>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="errorMessage" class="bg-red-600 text-white p-4 rounded-lg mb-4">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Vue Flow キャンバス -->
    <div class="container mx-auto px-4 pb-6">
      <div class="bg-gray-900 rounded-lg border-2 border-gray-700" style="height: 600px">
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :default-viewport="{ zoom: 0.8, x: 100, y: 300 }"
          :min-zoom="0.2"
          :max-zoom="2"
          class="vue-flow-container"
        >
          <!-- カスタムノードの登録 -->
          <template #node-compactNode="{ data }">
            <CompactNode :data="data" />
          </template>

          <!-- 背景グリッド -->
          <Background pattern-color="#4B5563" :gap="16" />

          <!-- ズーム/パンコントロール -->
          <Controls />
        </VueFlow>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { parseJSON } from '@/components/json-viz/JSONParser.js';
import CompactNode from '@/components/json-viz/CompactNode.vue';

// Vue Flow のスタイル
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

export default {
  name: 'JSONVisualization',
  components: {
    VueFlow,
    Background,
    Controls,
    CompactNode,
  },
  setup() {
    const jsonInput = ref('');
    const nodes = ref([]);
    const edges = ref([]);
    const errorMessage = ref('');
    const isDragging = ref(false);

    // JSON可視化実行
    const visualizeJSON = () => {
      errorMessage.value = '';

      if (!jsonInput.value.trim()) {
        errorMessage.value = 'JSONを入力してください';
        return;
      }

      try {
        const result = parseJSON(jsonInput.value);
        nodes.value = result.nodes;
        edges.value = result.edges;
      } catch (error) {
        errorMessage.value = error.message;
        nodes.value = [];
        edges.value = [];
      }
    };

    // サンプルJSON読み込み
    const loadSample = () => {
      const sampleJSON = {
        user: {
          name: '太郎',
          age: 25,
          active: true,
          address: {
            city: '東京',
            country: '日本',
          },
        },
        hobbies: ['読書', '映画', '音楽'],
        scores: [85, 92, 78],
      };
      jsonInput.value = JSON.stringify(sampleJSON, null, 2);
      visualizeJSON();
    };

    // クリア
    const clearCanvas = () => {
      jsonInput.value = '';
      nodes.value = [];
      edges.value = [];
      errorMessage.value = '';
    };

    // ドラッグオーバー時の処理
    const handleDragOver = () => {
      isDragging.value = true;
    };

    // ドラッグリーブ時の処理
    const handleDragLeave = () => {
      isDragging.value = false;
    };

    // ファイルドロップ時の処理
    const handleFileDrop = async (event) => {
      isDragging.value = false;
      errorMessage.value = '';

      const files = event.dataTransfer.files;
      if (files.length === 0) {
        errorMessage.value = 'ファイルが選択されていません';
        return;
      }

      const file = files[0];

      // JSONファイルかチェック
      if (!file.name.endsWith('.json')) {
        errorMessage.value = 'JSONファイル (.json) を選択してください';
        return;
      }

      try {
        const text = await file.text();
        jsonInput.value = text;
        // 自動的に可視化を実行
        visualizeJSON();
      } catch (error) {
        errorMessage.value = `ファイル読み込みエラー: ${error.message}`;
      }
    };

    return {
      jsonInput,
      nodes,
      edges,
      errorMessage,
      isDragging,
      visualizeJSON,
      loadSample,
      clearCanvas,
      handleDragOver,
      handleDragLeave,
      handleFileDrop,
    };
  },
};
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

.vue-flow-container {
  height: 100%;
  width: 100%;
}

/* エッジのスタイル */
.vue-flow__edge-path {
  stroke: #9ca3af;
  stroke-width: 2;
}

.vue-flow__edge.animated path {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

/* ステップエッジ(直角)のスタイル */
.vue-flow__edge-step {
  stroke: #9ca3af;
  stroke-width: 2;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}
</style>
