"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [companyUserName, setCompanyUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // URLの ?callbackUrl=... を優先。無ければ /register に遷移
      const callbackUrl = searchParams.get("callbackUrl") ?? "/register";

      await signIn("credentials", {
        company_user_name: companyUserName,
        password,
        redirect: true,   // NextAuth にリダイレクトを任せる
        callbackUrl,
      });
      // redirect:true のため通常ここ以降は実行されません
    } catch (err) {
      console.error("Login error:", err);
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <img src="/研Qロゴ.png" alt="研Q" className="w-[200px] h-24 mb-12" />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 w-full max-w-md">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-6 w-full max-w-md" onSubmit={handleSubmit}>
        <input
          id="companyUserName"
          name="companyUserName"
          type="text"
          placeholder="ユーザー名"
          required
          value={companyUserName}
          onChange={(e) => setCompanyUserName(e.target.value)}
          className="border border-gray-400 rounded-md px-6 py-4 text-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          id="password"
          name="password"
          type="password"
          placeholder="パスワード"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-400 rounded-md px-6 py-4 text-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gray-700 text-white rounded py-4 text-xl font-semibold hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isLoading ? "ログイン中..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
