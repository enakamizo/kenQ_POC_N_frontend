console.log('=== Middleware file loaded ===');
import { withAuth } from "next-auth/middleware";

export default withAuth(
  () => {
    // 認証されていれば何もしない（pass-through）
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // デバッグ用ログ（後で削除予定）
        console.log('Middleware - URL:', req.nextUrl.pathname, 'Token:', !!token);
        return !!token; // トークンがあればOK
      },
    },
    pages: {
      signIn: "/login", // ログインページへリダイレクト
    },
  }
);

// このミドルウェアを適用するルートパターン
export const config = {
  matcher: ["/mypage", "/projects/:path*", "/researcher/:path*", "/register/:path*"],
};