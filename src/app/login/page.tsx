"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [companyUserName, setCompanyUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const callbackUrl = searchParams.get("callbackUrl") ?? "/register";

      const result = await signIn("credentials", {
        company_user_name: companyUserName,
        password,
        redirect: true, // NextAuthに遷移を任せる
        callbackUrl,
      });

      console.log("signIn result:", result);
    } catch (err) {
      console.error("Login error:", err);
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-12">
          <Image
            src="/研Qロゴ.png"
            alt="研Q"
            width={120}
            height={60}
            className="mx-auto"
          />
        </div>

        {/* ログインフォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* User ID */}
          <div>
            <input
              type="text"
              value={companyUserName}
              onChange={(e) => setCompanyUserName(e.target.value)}
              placeholder="User ID"
              className="w-full px-4 py-4 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              required
            />
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-4 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              required
            />
          </div>

          {/* Log In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-600 text-white py-4 rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? "ログイン中..." : "Log In"}
          </button>
        </form>

        {/* 説明文 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            アカウント、パスワードを忘れた方は担当者に連絡してください。
          </p>
        </div>
      </div>
    </div>
  );
}
