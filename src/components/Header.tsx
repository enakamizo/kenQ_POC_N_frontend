"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between p-4 shadow-md bg-white">
      {/* 研Qロゴ */}
      <div className="text-xl font-bold">
        <Link href="/">
          <img src="/研Qロゴ.png" alt="研Qのロゴ" className="h-10" />
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex space-x-4">
        {/* マイページ */}
        {/* <Link href="/mypage" className="flex items-center">
          <img src="/マイページロゴ.png" alt="マイページ" className="h-6 w-6 mr-1" />
          マイページ
        </Link> */}

        {/* 案件登録 */}
        {/* <Link 
          href="/register" 
          className={`flex items-center border-b-2 ${
            pathname.startsWith("/register") ? "border-black" : "border-transparent"
          }`}
        >
          <img src="/案件登録ロゴ.png" alt="案件登録" className="h-6 w-6 mr-1" />
          新規登録
        </Link> */}

        {/* メッセージ */}
        {/* <Link href="/messages" className="flex items-center">
          <img src="/Gmail Logo.png" alt="メッセージ" className="h-6 w-6 mr-1" />
          メッセージ
        </Link> */}
      </nav>

      {/* ユーザー情報 */}
      <div className="flex items-center space-x-2">
        {/* 新着の合図 (lamp) */}
        <img src="/lamp.png" alt="新着通知" className="h-5 w-5" />

        {/* ユーザー名 */}
        <span>森明 諭</span>

        {/* ユーザー画像 */}
        <img src="/研Q_事業者ユーザ_写真.png" alt="User Avatar" className="w-8 h-8 rounded-full" />
      </div>
    </header>
  );
};

export default Header;

