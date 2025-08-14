"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [companyUserName, setCompanyUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const callbackUrl = searchParams.get("callbackUrl") ?? "/register";
      await signIn("credentials", {
        company_user_name: companyUserName,
        password,
        redirect: true,
        callbackUrl,
      });
      // redirect:true ならここには基本戻ってきません
    } catch (err) {
      console.error(err);
      setError("エラーが発生しました。もう一度お試しください。");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ロゴ＆タイトル */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/研Qロゴ.png"
            alt="研Qロゴ"
            width={64}
            height={64}
            className="mb-4"
            priority
          />
          <h1 className="text-4xl font-semibold tracking-wide text-slate-800">
            研Q
          </h1>
        </div>

        {/* フォームカード */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          {error && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </p>
          )}

          {/* User ID */}
          <div className="mb-4">
            <input
              type="text"
              value={companyUserName}
              onChange={(e) => setCompanyUserName(e.target.value)}
              placeholder="User ID"
              autoComplete="username"
              className="w-full h-12 px-4 rounded-md border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 focus:border-slate-400"
              required
            />
          </div>

          {/* Password + 目アイコン（インラインSVG） */}
          <div className="mb-6 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full h-12 pr-12 pl-4 rounded-md border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 focus:border-slate-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              className="absolute inset-y-0 right-2 flex items-center px-2 rounded-md hover:bg-slate-100 focus:outline-none"
            >
              {showPassword ? (
                // EyeOff
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.46-1.06 1.1-2.06 1.88-2.94" />
                  <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8-.54 1.24-1.33 2.4-2.3 3.4" />
                  <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                  <path d="M1 1l22 22" />
                </svg>
              ) : (
                // Eye
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Log In */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-md bg-slate-600 text-white font-medium hover:bg-slate-700 disabled:opacity-60 transition"
          >
            {isLoading ? "ログイン中..." : "Log In"}
          </button>

          {/* 注意書き */}
          <p className="mt-6 text-center text-sm text-slate-500">
            アカウント、パスワードを忘れた方は担当者に連絡してください。
          </p>
        </form>
      </div>
    </div>
  );
}
