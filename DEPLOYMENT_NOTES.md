# デプロイ前の設定変更メモ

## CORS回避のためのプロキシ設定（開発時のみ）

デプロイ前に以下の変更を**必ず元に戻してください**：

### 1. next.config.mjs
**変更箇所：** 5-24行目のrewrites設定をコメントアウト
```javascript
// デプロイ時はこの部分をコメントアウト
/*
async rewrites() {
  return [
    {
      source: '/api/ai-diagnosis',
      destination: `https://app-kenq-7-h7gre0afdgdbbzhy.canadacentral-01.azurewebsites.net/ai-diagnosis`,
    },
    // ... 他のproxy設定
  ];
},
*/
```

### 2. src/components/RequestForm.tsx
**変更箇所：** 102行目のAPI呼び出し
```javascript
// 現在（開発時）
const response = await fetch(`/api/ai-diagnosis`, {

// デプロイ時に戻す
const response = await fetch(`${apiBaseUrl}/ai-diagnosis`, {
```

### 3. その他のコンポーネント
他のAPIコールも同様に`/api/`から`${apiBaseUrl}/`形式に戻す

---
**作業日：** 2025-08-12
**担当：** Claude Code