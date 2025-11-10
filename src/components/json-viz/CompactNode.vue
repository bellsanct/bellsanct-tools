<template>
  <div
    :class="[
      'compact-node',
      'rounded-lg',
      'border-2',
      'border-white',
      'text-white',
      'flex',
      'items-center',
      'justify-between',
      'transition-all',
      'cursor-pointer',
      typeColor,
    ]"
    @click="handleClick"
    :style="nodeStyle"
  >
    <!-- 左側のハンドル（入力用） -->
    <Handle type="target" :position="Position.Left" />

    <!-- 2カラムレイアウト（キー:値の統合ノード） -->
    <div v-if="data.keyPart" class="flex-1 flex items-center min-w-0">
      <div class="key-column px-2 py-1 border-r border-white border-opacity-30 flex-shrink-0">
        <span class="text-xs font-semibold opacity-90">{{ data.keyPart.replace(':', '').trim() }}</span>
      </div>
      <div class="value-column px-3 py-1 flex-1 min-w-0">
        <span class="node-label truncate block">{{ data.valuePart }}</span>
      </div>
    </div>
    <!-- 通常のラベル表示 -->
    <span v-else class="node-label truncate flex-1">{{ displayLabel }}</span>
    <span v-if="isTruncated" class="expand-icon ml-1 text-xs opacity-70">...</span>

    <!-- 右側のハンドル（出力用） -->
    <Handle type="source" :position="Position.Right" />
  </div>

  <!-- モーダル: 全文表示 -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div
        class="bg-gray-800 text-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">完全な値</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div class="bg-gray-700 p-4 rounded max-h-96 overflow-auto break-words font-mono text-sm">
          {{ data.fullText || data.label }}
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="copyToClipboard"
            class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded mr-2"
          >
            コピー
          </button>
          <button
            @click="closeModal"
            class="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import { getTypeColor } from './JSONParser.js';

export default {
  name: 'CompactNode',
  components: {
    Handle,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const showModal = ref(false);
    const maxLength = 30;

    const typeColor = computed(() => getTypeColor(props.data.dataType));

    const displayLabel = computed(() => {
      const label = props.data.label || '';
      if (label.length > maxLength) {
        return label.substring(0, maxLength);
      }
      return label;
    });

    const isTruncated = computed(() => {
      const label = props.data.label || '';
      return label.length > maxLength;
    });

    const nodeStyle = computed(() => {
      // 2カラムレイアウトの場合は幅を広く
      if (props.data.keyPart) {
        return {
          minWidth: '160px',
          maxWidth: '350px',
          height: '40px',
          padding: '0',
          fontSize: '14px',
        };
      }
      // 通常のノード
      return {
        minWidth: '100px',
        maxWidth: '300px',
        height: '40px',
        padding: '8px 12px',
        fontSize: '14px',
      };
    });

    const handleClick = () => {
      if (isTruncated.value || props.data.fullText) {
        showModal.value = true;
      }
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const copyToClipboard = () => {
      const text = props.data.fullText || props.data.label;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert('コピーしました！');
        })
        .catch((err) => {
          console.error('コピーに失敗しました: ', err);
        });
    };

    return {
      showModal,
      typeColor,
      displayLabel,
      isTruncated,
      nodeStyle,
      handleClick,
      closeModal,
      copyToClipboard,
      Position, // Handleコンポーネントで使用
    };
  },
};
</script>

<style scoped>
.compact-node {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.compact-node:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.key-column {
  background-color: rgba(0, 0, 0, 0.2);
  min-width: 60px;
  max-width: 120px;
  text-align: center;
}

.value-column {
  flex: 1;
}
</style>
