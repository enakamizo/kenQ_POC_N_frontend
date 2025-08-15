# NextAuth認証機能 統合記録

## 実装日
2025年8月4日

## 追加したファイル
1. `src/auth.ts` - NextAuth設定ファイル
2. `src/app/api/auth/[...nextauth]/route.ts` - NextAuth APIルート
3. `.env.local` - 環境変数設定

## 変更したファイル
1. `package.json` - next-auth, axios依存関係追加
2. `src/app/layout.tsx` - SessionProvider追加
3. `src/app/login/page.tsx` - NextAuth signIn対応、元のUIデザイン維持

## 環境変数設定
```bash
NEXTAUTH_SECRET=qGRQdQ8VjvzL4PzfzbOmpwK0lIGPsBMZKEbqeXNu71I=
NEXT_PUBLIC_API_URL=https://app-advanced3-test1-h5fzgna4c4gtbnaq.canadacentral-01.azurewebsites.net
NEXT_PUBLIC_AZURE_API_URL=https://app-kenq-1-azf7d4eje9cgaah2.canadacentral-01.azurewebsites.net
```

## テストユーザー
- ユーザー名: `testuser`
- パスワード: `password123`
- ユーザーID: 2

## 新規ユーザー登録コマンド
```bash
curl -X POST "https://app-advanced3-test1-h5fzgna4c4gtbnaq.canadacentral-01.azurewebsites.net/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "company_user_name": "新しいユーザー名",
    "password": "新しいパスワード", 
    "company_id": 1
  }'
```

## 今後の予定タスク
- 認証ガード（未ログイン時のページアクセス制限）
- ログアウト機能
- パスワードリセット機能
- 新規登録画面
- バックエンド統合（auth_test → 本番環境）

## デプロイ情報
- GitHub: https://github.com/enakamizo/kenQ-app-frontend.git
- Azure App Service: app-kenq-2
- デプロイ方式: Azure Deployment Center（GitHub連携）