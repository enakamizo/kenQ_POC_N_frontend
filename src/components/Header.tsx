"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    // ログアウト処理（localStorageクリアなど）
    localStorage.clear();
    // ログイン画面に遷移
    router.push("/login");
  };

  return (
    <>
    <header className="flex items-center justify-between p-4 shadow-md bg-white">
      {/* 研Qロゴ */}
      <div className="text-xl font-bold">
        <Link href="/">
          <img src="/研Qロゴ.png" alt="研Qのロゴ" className="h-10" />
        </Link>
      </div>

      {/* 中央エリア（スペース確保用） */}
      <div className="flex-1"></div>

      {/* 右側のユーザーエリア */}
      <div className="flex items-center gap-6">
        {/* 新規登録リンク */}
        <button
          onClick={() => router.push("/register")}
          className="text-gray-700 hover:text-gray-900 transition"
        >
          新規登録
        </button>
        
        {/* ユーザー名 */}
        <span className="text-gray-700">森明 輪</span>
        
        {/* ログアウトアイコン */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="text-gray-700 hover:text-gray-900 transition"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
          >
            <path 
              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>

    {/* ログアウト確認ポップアップ */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full mx-4">
          <h2 className="text-lg font-semibold mb-4">ログアウト確認</h2>
          <p className="text-gray-600 mb-6">ログアウトしますか？</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              いいえ
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              はい
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default Header;

