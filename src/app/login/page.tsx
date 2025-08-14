"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

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
        redirect: false, // 自分で遷移させる
        callbackUrl,
      });

      console.log("signIn result:", result);
      console.log("callbackUrl:", callbackUrl);

      if (result && !(result as any).error) {
        console.log("Success! Redirecting to:", callbackUrl);
        console.log("Before window.location.href");
        window.location.href = callbackUrl;
        console.log("After window.location.href");
        return;
      } else {
        console.log("signIn failed:", result);
      }

      setError("ログインに失敗しました。ユーザー名とパスワードを確認してください。");
    } catch (err) {
      console.error("Login error:", err);
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl mb-6">ログイン</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block mb-1">ユーザー名</label>
          <input
            type="text"
            value={companyUserName}
            onChange={(e) => setCompanyUserName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
