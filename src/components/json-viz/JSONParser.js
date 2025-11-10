/**
 * JSONParser.js
 * JSON文字列をVue Flowのノード・エッジ構造に変換するユーティリティ
 * Mindomoスタイル (横方向レイアウト、値のみ表示)
 * 完全な線の通過領域計算で重なりゼロを実現
 */

/**
 * データ型を判定
 * @param {*} value - 判定対象の値
 * @returns {string} データ型 ("string", "number", "boolean", "null", "array", "object")
 */
function getDataType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * データ型に応じたTailwindカラークラスを返す
 * @param {string} dataType - データ型
 * @returns {string} Tailwindカラークラス
 */
export function getTypeColor(dataType) {
  const colorMap = {
    string: 'bg-blue-600',
    number: 'bg-green-600',
    boolean: 'bg-yellow-600',
    null: 'bg-gray-600',
    array: 'bg-purple-600',
    object: 'bg-pink-600',
  };
  return colorMap[dataType] || 'bg-gray-600';
}

/**
 * 値を文字列に変換
 * @param {*} value - 値
 * @returns {string} 文字列表現
 */
function formatValue(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
}

/**
 * ノードのラベルを生成
 * @param {string} key - キー名
 * @param {*} value - 値
 * @param {string} dataType - データ型
 * @returns {string} ラベル
 */
function generateLabel(key, value, dataType) {
  // オブジェクトと配列はキー名のみ
  if (dataType === 'object' || dataType === 'array') {
    return key;
  }

  // プリミティブ値は値のみ表示
  return formatValue(value);
}

/**
 * サブツリーの高さを計算（再帰的）
 * @param {*} obj - JSONオブジェクト
 * @param {Map} subtreeHeightCache - サブツリー高さのキャッシュ
 * @param {string} path - 現在のパス
 * @returns {number} サブツリーの必要な高さ（ピクセル）
 */
function calculateSubtreeHeight(obj, subtreeHeightCache, path) {
  const dataType = getDataType(obj);
  const isComplex = dataType === 'object' || dataType === 'array';

  if (!isComplex) {
    // リーフノード: ノードの高さのみ
    const height = 40; // CompactNodeの高さ
    subtreeHeightCache.set(path, height);
    return height;
  }

  // 子要素のサブツリー高さを再帰的に計算
  let totalHeight = 0;
  const nodeHeight = 40;
  const minSpacing = 20; // ノード間の最小間隔
  const groupSpacing = 40; // グループ間の動的余白

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const itemDataType = getDataType(item);

      // プリミティブ値の場合は1ノード（[index]: value統合形式）
      if (itemDataType !== 'object' && itemDataType !== 'array') {
        totalHeight += nodeHeight;
      } else {
        // 複雑な値の場合は通常通り
        const childPath = `${path}.[${index}]`;
        const childHeight = calculateSubtreeHeight(item, subtreeHeightCache, childPath);
        totalHeight += childHeight;
      }

      if (index < obj.length - 1) {
        totalHeight += Math.max(minSpacing, groupSpacing);
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj);
    keys.forEach((childKey, index) => {
      const childValue = obj[childKey];
      const childDataType = getDataType(childValue);

      // プリミティブ値の場合は1ノード（key: value統合形式）
      if (childDataType !== 'object' && childDataType !== 'array') {
        totalHeight += nodeHeight;
      } else {
        // 複雑な値の場合は通常通り
        const childPath = `${path}.${childKey}`;
        const childHeight = calculateSubtreeHeight(childValue, subtreeHeightCache, childPath);
        totalHeight += childHeight;
      }

      if (index < keys.length - 1) {
        totalHeight += Math.max(minSpacing, groupSpacing);
      }
    });
  }

  // このノードのサブツリー全体の高さを保存
  const subtreeHeight = Math.max(totalHeight, nodeHeight);
  subtreeHeightCache.set(path, subtreeHeight);
  return subtreeHeight;
}

/**
 * 再帰的にJSONをノード構造に変換（サブツリー高さベース配置）
 * @param {*} obj - JSONオブジェクト
 * @param {string} key - キー名
 * @param {string} parentPath - 親のパス
 * @param {number} depth - 深さ
 * @param {number} startY - この兄弟グループの開始Y座標
 * @param {Map} subtreeHeightCache - サブツリー高さのキャッシュ
 * @param {Array} nodes - ノード配列 (参照渡し)
 * @param {Array} edges - エッジ配列 (参照渡し)
 * @returns {number} このノードが占有した高さ
 */
function parseRecursiveWithHeight(
  obj,
  key,
  parentPath,
  depth,
  startY,
  subtreeHeightCache,
  nodes,
  edges
) {
  const currentPath = parentPath ? `${parentPath}.${key}` : key;
  const dataType = getDataType(obj);
  const isComplex = dataType === 'object' || dataType === 'array';

  // このノードのサブツリー高さを取得
  const subtreeHeight = subtreeHeightCache.get(currentPath) || 40;

  // X座標: 深さに応じて配置
  const xSpacing = 280;
  const x = depth * xSpacing;

  // Y座標: サブツリーの中央に配置
  const y = startY + subtreeHeight / 2;

  // ラベルを生成
  const label = generateLabel(key, obj, dataType);
  const fullText = isComplex ? null : formatValue(obj);

  // ノードを生成
  const node = {
    id: currentPath,
    type: 'compactNode',
    position: { x, y },
    sourcePosition: 'right', // ノードの右端から線を出す
    targetPosition: 'left', // ノードの左端に線を入れる
    data: {
      label,
      value: isComplex ? null : obj,
      dataType,
      fullText,
    },
  };

  nodes.push(node);

  // 親ノードとのエッジを生成 (rootは除外)
  if (parentPath) {
    edges.push({
      id: `e-${parentPath}-${currentPath}`,
      source: parentPath,
      target: currentPath,
      type: 'step', // 直角の直線
      animated: false,
    });
  }

  // 子要素を再帰的に処理
  if (isComplex) {
    let childStartY = startY;
    const nodeHeight = 40;
    const minSpacing = 20;
    const groupSpacing = 40;

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemDataType = getDataType(item);

        // プリミティブ値の場合は統合ノード
        if (itemDataType !== 'object' && itemDataType !== 'array') {
          const itemNodeId = `${currentPath}.[${index}]`;
          const itemNode = {
            id: itemNodeId,
            type: 'compactNode',
            position: { x: (depth + 1) * xSpacing, y: childStartY },
            sourcePosition: 'right',
            targetPosition: 'left',
            data: {
              label: `[${index}]: ${formatValue(item)}`,
              keyPart: `[${index}]: `,
              valuePart: formatValue(item),
              value: item,
              dataType: itemDataType,
              fullText: formatValue(item),
            },
          };
          nodes.push(itemNode);

          // エッジを作成
          edges.push({
            id: `e-${currentPath}-${itemNodeId}`,
            source: currentPath,
            target: itemNodeId,
            type: 'step',
            animated: false,
          });

          // 次の子の開始Y座標を更新
          childStartY += nodeHeight + Math.max(minSpacing, groupSpacing);
        } else {
          // 複雑な値の場合は通常通り
          const childPath = `${currentPath}.[${index}]`;
          const childSubtreeHeight = subtreeHeightCache.get(childPath) || nodeHeight;

          // 子ノードを配置
          parseRecursiveWithHeight(
            item,
            `[${index}]`,
            currentPath,
            depth + 1,
            childStartY,
            subtreeHeightCache,
            nodes,
            edges
          );

          // 次の子の開始Y座標を更新
          childStartY += childSubtreeHeight + Math.max(minSpacing, groupSpacing);
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      keys.forEach((childKey) => {
        const childValue = obj[childKey];
        const childDataType = getDataType(childValue);

        // プリミティブ値の場合は統合ノード
        if (childDataType !== 'object' && childDataType !== 'array') {
          const propNodeId = `${currentPath}.${childKey}`;
          const propNode = {
            id: propNodeId,
            type: 'compactNode',
            position: { x: (depth + 1) * xSpacing, y: childStartY },
            sourcePosition: 'right',
            targetPosition: 'left',
            data: {
              label: `${childKey}: ${formatValue(childValue)}`,
              keyPart: `${childKey}: `,
              valuePart: formatValue(childValue),
              value: childValue,
              dataType: childDataType,
              fullText: formatValue(childValue),
            },
          };
          nodes.push(propNode);

          // エッジを作成
          edges.push({
            id: `e-${currentPath}-${propNodeId}`,
            source: currentPath,
            target: propNodeId,
            type: 'step',
            animated: false,
          });

          // 次の子の開始Y座標を更新
          childStartY += nodeHeight + Math.max(minSpacing, groupSpacing);
        } else {
          // 複雑な値の場合は通常通り親子関係
          const childPath = `${currentPath}.${childKey}`;
          const childSubtreeHeight = subtreeHeightCache.get(childPath) || nodeHeight;

          // 子ノードを配置
          parseRecursiveWithHeight(
            childValue,
            childKey,
            currentPath,
            depth + 1,
            childStartY,
            subtreeHeightCache,
            nodes,
            edges
          );

          // 次の子の開始Y座標を更新
          childStartY += childSubtreeHeight + Math.max(minSpacing, groupSpacing);
        }
      });
    }
  }

  return subtreeHeight;
}

/**
 * JSON文字列をパースしてVue Flowのノード・エッジに変換
 * @param {string} jsonString - JSON文字列
 * @returns {{nodes: Array, edges: Array}} ノードとエッジの配列
 * @throws {Error} JSON構文エラー
 */
export function parseJSON(jsonString) {
  try {
    const jsonObject = JSON.parse(jsonString);
    const nodes = [];
    const edges = [];

    // 第1パス: サブツリー高さを事前計算
    const subtreeHeightCache = new Map();
    calculateSubtreeHeight(jsonObject, subtreeHeightCache, 'root');

    // 第2パス: サブツリー高さに基づいてノードを配置
    parseRecursiveWithHeight(
      jsonObject,
      'root',
      '',
      0,
      0, // startY = 0
      subtreeHeightCache,
      nodes,
      edges
    );

    return { nodes, edges };
  } catch (error) {
    throw new Error(`JSON解析エラー: ${error.message}`);
  }
}
