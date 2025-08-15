# バックエンド置き換えガイド

新しいバックエンドができた時に置き換える箇所をまとめています。

## 環境変数（.env.local）

```bash
# 現在
NEXT_PUBLIC_API_URL=https://app-advanced3-test1-h5fzgna4c4gtbnaq.canadacentral-01.azurewebsites.net

# 新しいバックエンドのURLに置き換える
NEXT_PUBLIC_API_URL=新しいバックエンドのURL
```

## 認証設定（src/auth.ts）

38行目のAPI URLを確認:
```typescript
const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
```

## APIエンドポイント

- 現在使用: `/auth/login`
- 新しいバックエンドで同じエンドポイントを使用するか確認が必要

## 確認事項

1. 新しいバックエンドの認証エンドポイントのパス
2. リクエスト/レスポンス形式が同じかどうか
3. セッション管理方法（JWT設定は変更不要の可能性が高い）