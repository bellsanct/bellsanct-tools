# JSON可視化ツール - 改善実装サマリー

## 実装日時
2025-11-10

## ブランチ
`feature-jsonvisualization`

---

## 実装した改善内容

### 1. ✅ カード重複防止とレイアウト改善

**問題点**:
- 同一階層のカードが近すぎて重なる可能性があった
- カード間の間隔が固定で、多くの兄弟ノードがある場合に見づらかった

**改善内容**:
- レイアウトアルゴリズムを改善 (`JSONParser.js:calculatePosition`)
- カードの最小幅 (200px) とパディング (50px) を考慮
- 兄弟ノード数に応じて動的に間隔を調整
  - 5つ以下: 基本間隔 (250px)
  - 6つ以上: 間隔を1.2倍に拡大 (300px)
- 垂直間隔を 150px → 180px に増加 (カードの高さを考慮)

**改善前のコード**:
```javascript
function calculatePosition(depth, siblingIndex, siblingCount) {
  const ySpacing = 150;
  const xSpacing = 200;
  const y = depth * ySpacing;
  const xOffset = (siblingIndex - (siblingCount - 1) / 2) * xSpacing;
  return { x: xOffset, y };
}
```

**改善後のコード**:
```javascript
function calculatePosition(depth, siblingIndex, siblingCount) {
  const ySpacing = 180;
  const minCardWidth = 200;
  const cardPadding = 50;
  const y = depth * ySpacing;

  const baseSpacing = minCardWidth + cardPadding;
  const xSpacing = siblingCount > 5 ? baseSpacing * 1.2 : baseSpacing;

  const totalWidth = (siblingCount - 1) * xSpacing;
  const startX = -totalWidth / 2;
  const x = startX + (siblingIndex * xSpacing);

  return { x, y };
}
```

**効果**:
- カード同士が重ならない
- 同一階層のカードが適切な間隔で並列表示される
- 多くの兄弟ノードがある場合でも見やすい配置

---

### 2. ✅ ドラッグ&ドロップでJSONファイル読み込み

**問題点**:
- JSONファイルを読み込むには手動でコピー&ペーストが必要だった
- 大きなJSONファイルの場合、操作が煩雑だった

**改善内容**:
- JSON入力エリアにファイルのドラッグ&ドロップ機能を追加
- ドラッグ中は視覚的フィードバックを表示
  - 入力エリアの枠が青色に変化
  - "ここにJSONファイルをドロップ" のオーバーレイ表示
- JSONファイル (.json) のみ受け付ける
- ドロップ後、自動的に可視化を実行
- エラーハンドリング
  - 非JSONファイルの場合: エラーメッセージ表示
  - ファイル読み込みエラー: エラーメッセージ表示

**追加したUI要素**:
```vue
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
  <textarea ... />
  <div v-if="isDragging" class="absolute inset-0 ...">
    <span>ここにJSONファイルをドロップ</span>
  </div>
</div>
```

**追加した機能**:
```javascript
const isDragging = ref(false);

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleFileDrop = async (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;

  if (files.length === 0) {
    errorMessage.value = 'ファイルが選択されていません';
    return;
  }

  const file = files[0];

  if (!file.name.endsWith('.json')) {
    errorMessage.value = 'JSONファイル (.json) を選択してください';
    return;
  }

  try {
    const text = await file.text();
    jsonInput.value = text;
    visualizeJSON(); // 自動的に可視化
  } catch (error) {
    errorMessage.value = `ファイル読み込みエラー: ${error.message}`;
  }
};
```

**効果**:
- JSONファイルを簡単に読み込める
- 大きなファイルでも手軽に可視化可能
- UXの向上

---

## 技術的詳細

### 変更ファイル

1. **JSONParser.js** (`src/components/json-viz/JSONParser.js`)
   - `calculatePosition()` 関数を改善
   - 動的間隔調整ロジック追加

2. **JSONVisualization.vue** (`src/pages/JSONVisualization.vue`)
   - テンプレート: ドラッグ&ドロップエリア追加
   - スクリプト: ファイル読み込みロジック追加
   - リアクティブ変数: `isDragging` 追加
   - イベントハンドラー: `handleDragOver`, `handleDragLeave`, `handleFileDrop` 追加

### レイアウトアルゴリズムの詳細

#### 改善前の配置例 (3つの兄弟ノード)
```
x座標の計算: (siblingIndex - 1) × 200

ノード0: x = -200
ノード1: x = 0
ノード2: x = 200

間隔: 200px (固定)
```

#### 改善後の配置例 (3つの兄弟ノード)
```
baseSpacing = 250px (200 + 50)
xSpacing = 250px (3 ≤ 5 なので通常間隔)
totalWidth = 2 × 250 = 500px
startX = -250px

ノード0: x = -250
ノード1: x = 0
ノード2: x = 250

間隔: 250px (動的)
```

#### 改善後の配置例 (7つの兄弟ノード)
```
baseSpacing = 250px
xSpacing = 300px (7 > 5 なので1.2倍)
totalWidth = 6 × 300 = 1800px
startX = -900px

ノード0: x = -900
ノード1: x = -600
ノード2: x = -300
ノード3: x = 0
ノード4: x = 300
ノード5: x = 600
ノード6: x = 900

間隔: 300px (動的拡大)
```

---

## ビルド結果

### ステータス
✅ ビルド成功

### 変更サイズ
- `app.js`: 59.5 KB → 60.85 KB (+1.35 KB)
- `app.css`: 20.4 KB → 21.01 KB (+0.61 KB)

### 警告
- バンドルサイズ警告のみ (機能には影響なし)

---

## 動作確認方法

### レイアウト改善の確認

1. 開発サーバー起動
```bash
npm run serve
```

2. ブラウザで `http://localhost:8080/JSONVisualization` にアクセス

3. 以下のJSONで多くの兄弟ノードをテスト
```json
{
  "items": {
    "item1": "value1",
    "item2": "value2",
    "item3": "value3",
    "item4": "value4",
    "item5": "value5",
    "item6": "value6",
    "item7": "value7"
  }
}
```

4. 可視化実行
5. item1 ~ item7 が適切な間隔で横並びに表示されることを確認

### ドラッグ&ドロップの確認

1. テスト用JSONファイルを作成 (`test.json`)
```json
{
  "user": {
    "name": "太郎",
    "age": 25
  }
}
```

2. ブラウザでJSON可視化ツールを開く

3. `test.json` をJSON入力エリアにドラッグ

4. 入力エリアが青く光り、「ここにJSONファイルをドロップ」と表示されることを確認

5. ファイルをドロップ

6. JSONが自動的に読み込まれ、可視化が実行されることを確認

### エラーケースの確認

1. 非JSONファイル (例: `.txt`) をドロップ
   - エラーメッセージ: "JSONファイル (.json) を選択してください" が表示される

2. 不正なJSON内容のファイルをドロップ
   - エラーメッセージ: "JSON解析エラー: ..." が表示される

---

## 既知の制約事項

### レイアウト
- 非常に多くの兄弟ノード (20個以上) がある場合、横幅が広くなりすぎる可能性
  - 将来的に複数行レイアウトやグリッドレイアウトを検討

### ドラッグ&ドロップ
- ファイルサイズ制限なし (ブラウザのメモリ制限のみ)
- 複数ファイルを同時にドロップした場合、最初のファイルのみ処理

---

## 将来の拡張候補

### レイアウト関連
- [ ] 複数行レイアウト (多くの兄弟ノードを複数行に配置)
- [ ] グリッドレイアウトオプション
- [ ] レイアウトアルゴリズムの選択機能 (縦方向/横方向/放射状)
- [ ] カスタム間隔調整 (ユーザーがスライダーで調整)

### ファイル読み込み関連
- [ ] ファイル選択ダイアログ (ボタンクリックで選択)
- [ ] 複数ファイルの一括読み込み
- [ ] ファイルサイズ制限の設定
- [ ] 非JSON形式のサポート (YAML, XML等)

---

## まとめ

### 改善完了機能
✅ カード重複防止
✅ 動的レイアウト調整
✅ ドラッグ&ドロップファイル読み込み
✅ ビルド成功

### 効果
- **UX改善**: JSONファイルを簡単に読み込める
- **視認性向上**: カードが適切な間隔で配置される
- **柔軟性**: 兄弟ノード数に応じた動的調整

### 次のステップ
1. `npm run serve` で動作確認
2. 複雑なJSONで徹底的にテスト
3. 問題なければコミット・プッシュ

---

**実装者**: Claude Code
**実装日**: 2025-11-10
**ブランチ**: feature-jsonvisualization
**ステータス**: ✅ 改善完了
