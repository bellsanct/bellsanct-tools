# JSON可視化ツール - Mindomoスタイル仕様書

## 実装日時
2025-11-10

## ブランチ
`feature-jsonvisualization`

---

## 変更概要

**現在**: カードベースの縦方向階層レイアウト (家系図スタイル)
**変更後**: Mindomoスタイルの横方向マインドマップレイアウト

---

## 確定仕様

### 1. ノードの表示内容 ✅

**選択: オプションB - 値のみ表示**

```
user
├─ 太郎
├─ 25
└─ address
    └─ 東京
```

**表示ルール**:
- **プリミティブ値**: 値のみ表示 (キー名なし)
  - `"name": "太郎"` → `太郎`
  - `"age": 25` → `25`
  - `"active": true` → `true`

- **オブジェクト**: キー名のみ表示
  - `"user": {...}` → `user`

- **配列**: キー名のみ表示
  - `"hobbies": [...]` → `hobbies`

**エッジのラベル**: キー名を表示
- 親ノード → 子ノード の接続線に、元のキー名をラベル表示
- 例: `user` → `太郎` (接続線に "name" と表示)

---

### 2. データ型の表示 ✅

**選択: オプションA - データ型を色で表現のみ**

**カラーマッピング** (既存と同じ):

| データ型 | 背景色 | Tailwindクラス |
|---------|-------|---------------|
| string | 青 | `bg-blue-600` |
| number | 緑 | `bg-green-600` |
| boolean | 黄 | `bg-yellow-600` |
| null | グレー | `bg-gray-600` |
| array | 紫 | `bg-purple-600` |
| object | ピンク | `bg-pink-600` |

**型テキスト削除**: `[string]`, `[number]` などの表示は削除

---

### 3. オブジェクト/配列の表現 ✅

**選択: オプションA - 単純なラベル**

```
user
├─ 太郎
├─ hobbies
│   ├─ 読書
│   └─ 映画
```

**表示形式**:
- オブジェクト: キー名のみ (`user`)
- 配列: キー名のみ (`hobbies`)
- **要素数は表示しない** (オプションAのため)

---

### 4. ノードのサイズとスタイル ✅

**選択: オプションA - 小さな長方形 (Mindomoスタイル)**

```
┌────────────┐
│ name: 太郎 │  ← ただし「値のみ」なので実際は「太郎」
└────────────┘
```

**ノードスタイル仕様**:
- **形状**: 長方形 (角丸)
- **幅**: 自動調整 (内容に応じて、最小100px、最大300px)
- **高さ**: 固定 (40px)
- **パディング**: 上下8px、左右12px
- **フォントサイズ**: 14px (現在より小さく)
- **ボーダー**: 2px白色 (既存と同じ)
- **ホバーエフェクト**: 維持

**削除する要素**:
- 区切り線 (`<hr>`)
- データ型テキスト (`[string]`)
- キー・バリューの区別表示

---

### 5. 配列のインデックス表示 ✅

**選択: オプションA - インデックスを表示**

```
hobbies
├─ [0]: 読書
├─ [1]: 映画
```

**表示形式**:
- 配列要素のノード: `[0]`, `[1]`, `[2]` ...
- エッジラベル: インデックスを表示

---

### 6. 長い値の扱い ✅

**選択: オプションB - 文字数制限 (30文字まで) + クリックで展開**

```
┌──────────────────────────────┐
│ これは非常に長い説明文で...  │  ← クリック可能
└──────────────────────────────┘
```

**実装詳細**:
- **30文字まで表示**: 超える場合は `...` で省略
- **クリックで展開**: ノードをクリックすると全文表示
  - モーダル表示
  - またはノードが一時的に拡大
  - またはツールチップ表示
- **視覚的ヒント**: 省略されている場合はノードに小さなアイコン表示 (`...` または `▼`)

---

### 7. レイアウト方向 ✅

**変更: 縦方向 → 横方向**

**現在** (縦方向、Top to Bottom):
```
         [root]
            |
         [user]
            |
      ┌─────┴─────┐
   [name]       [age]
```

**変更後** (横方向、Left to Right):
```
            ┌─ [太郎]
            |
[root] ─ [user] ─┼─ [25]
            |
            └─ [address] ─ [東京]
```

**レイアウト仕様**:
- **方向**: 左から右へ展開
- **ルートノード**: 最左端
- **階層**: 右に行くほど深い階層
- **X座標**: `depth × 250px` (右へ)
- **Y座標**: 兄弟ノード間の垂直間隔を動的調整

---

## データ変換ルール

### 入力JSON例
```json
{
  "user": {
    "name": "太郎",
    "age": 25,
    "address": {
      "city": "東京"
    }
  },
  "hobbies": ["読書", "映画"]
}
```

### 出力ノード構造

#### ノード定義
```javascript
[
  {
    id: "root",
    type: "compactNode",
    data: {
      label: "root",           // ルートは特殊
      value: null,
      dataType: "object",
      fullText: null           // 省略なし
    },
    position: { x: 0, y: 0 }
  },
  {
    id: "root.user",
    type: "compactNode",
    data: {
      label: "user",           // オブジェクトはキー名
      value: null,
      dataType: "object",
      fullText: null
    },
    position: { x: 250, y: 0 }
  },
  {
    id: "root.user.name",
    type: "compactNode",
    data: {
      label: "太郎",           // 値のみ
      value: "太郎",
      dataType: "string",
      fullText: "太郎"         // 30文字以内なので同じ
    },
    position: { x: 500, y: -100 }
  },
  {
    id: "root.user.age",
    type: "compactNode",
    data: {
      label: "25",             // 値のみ
      value: 25,
      dataType: "number",
      fullText: "25"
    },
    position: { x: 500, y: 0 }
  },
  {
    id: "root.user.address",
    type: "compactNode",
    data: {
      label: "address",        // オブジェクトはキー名
      value: null,
      dataType: "object",
      fullText: null
    },
    position: { x: 500, y: 100 }
  },
  {
    id: "root.user.address.city",
    type: "compactNode",
    data: {
      label: "東京",           // 値のみ
      value: "東京",
      dataType: "string",
      fullText: "東京"
    },
    position: { x: 750, y: 100 }
  },
  {
    id: "root.hobbies",
    type: "compactNode",
    data: {
      label: "hobbies",        // 配列はキー名
      value: null,
      dataType: "array",
      fullText: null
    },
    position: { x: 250, y: 200 }
  },
  {
    id: "root.hobbies[0]",
    type: "compactNode",
    data: {
      label: "[0]",            // 配列インデックス
      value: "読書",
      dataType: "string",
      fullText: "読書"
    },
    position: { x: 500, y: 180 }
  },
  {
    id: "root.hobbies[1]",
    type: "compactNode",
    data: {
      label: "[1]",            // 配列インデックス
      value: "映画",
      dataType: "string",
      fullText: "映画"
    },
    position: { x: 500, y: 220 }
  }
]
```

#### エッジ定義 (ラベル付き)
```javascript
[
  { id: "e-root-user", source: "root", target: "root.user", label: "user" },
  { id: "e-user-name", source: "root.user", target: "root.user.name", label: "name" },
  { id: "e-user-age", source: "root.user", target: "root.user.age", label: "age" },
  { id: "e-user-address", source: "root.user", target: "root.user.address", label: "address" },
  { id: "e-address-city", source: "root.user.address", target: "root.user.address.city", label: "city" },
  { id: "e-root-hobbies", source: "root", target: "root.hobbies", label: "hobbies" },
  { id: "e-hobbies-0", source: "root.hobbies", target: "root.hobbies[0]", label: "[0]" },
  { id: "e-hobbies-1", source: "root.hobbies", target: "root.hobbies[1]", label: "[1]" }
]
```

---

## レイアウトアルゴリズム

### 横方向レイアウト (Left to Right)

```javascript
function calculatePosition(depth, siblingIndex, siblingCount) {
  const xSpacing = 250;        // 階層間の水平間隔
  const minNodeHeight = 60;    // ノードの最小高さ
  const verticalPadding = 20;  // ノード間の垂直パディング

  // X座標: 深さに応じて右へ
  const x = depth * xSpacing;

  // Y座標: 兄弟ノード間の垂直配置
  const baseSpacing = minNodeHeight + verticalPadding;
  const ySpacing = siblingCount > 5 ? baseSpacing * 1.2 : baseSpacing;

  const totalHeight = (siblingCount - 1) * ySpacing;
  const startY = -totalHeight / 2;
  const y = startY + (siblingIndex * ySpacing);

  return { x, y };
}
```

**配置例** (3つの兄弟ノード):
```
depth=1, siblings=3

ノード0: x=250, y=-80   (上)
ノード1: x=250, y=0     (中央)
ノード2: x=250, y=80    (下)
```

---

## コンポーネント設計

### 新規作成ファイル

#### 1. CompactNode.vue
**責務**: Mindomoスタイルのコンパクトノード

**Props**:
```javascript
{
  data: {
    label: String,       // 表示テキスト
    value: Any,          // 元の値
    dataType: String,    // データ型
    fullText: String     // 省略前の全文 (30文字以上の場合)
  }
}
```

**テンプレート**:
```vue
<div
  :class="['compact-node', typeColor]"
  @click="handleClick"
>
  <span class="node-label">{{ displayLabel }}</span>
  <span v-if="isTruncated" class="expand-icon">...</span>
</div>
```

**スタイル**:
```css
.compact-node {
  min-width: 100px;
  max-width: 300px;
  height: 40px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid white;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-icon {
  margin-left: 4px;
  font-size: 10px;
  opacity: 0.7;
}
```

**機能**:
- 30文字制限の適用
- クリックで全文表示 (モーダルまたはツールチップ)
- データ型別カラーリング

---

### 更新ファイル

#### 1. JSONParser.js
**変更内容**:
- `calculatePosition()`: 横方向レイアウトに変更
- `parseRecursive()`:
  - ノードタイプを `compactNode` に統一
  - `data.label` の生成ロジック変更 (値のみ/キー名のみ)
  - `data.fullText` の追加 (30文字以上の場合)
- エッジに `label` プロパティ追加

#### 2. JSONVisualization.vue
**変更内容**:
- カスタムノードの登録: `PrimitiveCard`, `ObjectCard` → `CompactNode`
- Vue Flow の設定: デフォルトビューポート調整 (横方向に対応)
- エッジラベルの表示設定

---

## UI変更点まとめ

### ノード表示

| 要素 | 現在 | 変更後 |
|-----|------|--------|
| サイズ | 大きなカード (幅自動、高さ大) | コンパクトノード (幅100-300px、高さ40px) |
| 表示内容 | キー + 値 + 型 | 値のみ (または キー名のみ) |
| データ型 | `[string]` テキスト | 色のみ |
| 長い値 | 制限なし | 30文字 + `...` + クリック展開 |

### レイアウト

| 要素 | 現在 | 変更後 |
|-----|------|--------|
| 方向 | 縦 (Top to Bottom) | 横 (Left to Right) |
| ルート位置 | 上端中央 | 左端中央 |
| 階層展開 | 下へ | 右へ |
| 兄弟配置 | 水平並び | 垂直並び |

### エッジ

| 要素 | 現在 | 変更後 |
|-----|------|--------|
| ラベル | なし | キー名表示 |
| スタイル | シンプルな実線 | シンプルな実線 (維持) |

---

## 実装手順

### Phase 1: CompactNodeコンポーネント作成
- [ ] `CompactNode.vue` 作成
- [ ] 30文字制限ロジック実装
- [ ] クリック展開機能実装 (モーダル)
- [ ] データ型別スタイリング

### Phase 2: JSONParser更新
- [ ] 横方向レイアウトアルゴリズム実装
- [ ] ラベル生成ロジック変更 (値のみ/キー名のみ)
- [ ] `fullText` プロパティ追加
- [ ] エッジラベル生成

### Phase 3: JSONVisualization更新
- [ ] `CompactNode` 登録
- [ ] 旧カードコンポーネント削除
- [ ] エッジラベル表示設定
- [ ] デフォルトビューポート調整

### Phase 4: テストと調整
- [ ] サンプルJSONで動作確認
- [ ] レイアウト調整
- [ ] クリック展開機能テスト

---

## ビジュアル完成イメージ

```
                        ┌─ [太郎]  (name)
                        |
[root] ─ [user] ────────┼─ [25]  (age)
   |                    |
   |                    └─ [address] ─ [東京]  (city)
   |
   └─ [hobbies] ───┬─ [[0]]  (読書)
                   |
                   └─ [[1]]  (映画)
```

**特徴**:
- 左から右へ展開
- 値のみ表示 (プリミティブ)
- キー名のみ表示 (オブジェクト/配列)
- エッジにキー名ラベル
- コンパクトなノード
- 色でデータ型を表現

---

## まとめ

### 確定仕様
✅ **表示内容**: 値のみ (プリミティブ) / キー名のみ (オブジェクト/配列)
✅ **データ型**: 色のみで表現
✅ **オブジェクト/配列**: 単純なラベル (要素数なし)
✅ **ノードスタイル**: 小さな長方形 (40px高さ)
✅ **配列インデックス**: `[0]`, `[1]` 表示
✅ **長い値**: 30文字制限 + クリック展開
✅ **レイアウト**: 横方向 (Left to Right)

### 次のアクション
1. CompactNodeコンポーネント実装
2. JSONParser更新 (横方向レイアウト)
3. JSONVisualization更新
4. テストと調整

---

**作成日**: 2025-11-10
**ステータス**: ✅ 仕様確定
**承認**: ユーザー確認済み
