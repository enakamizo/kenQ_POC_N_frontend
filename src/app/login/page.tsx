"use client";

import { useState } from "react";
//import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation"; //追加

export default function LoginPage() {
  console.log('signIn function:', typeof signIn);
  
//  const router = useRouter();
  const [companyUserName, setCompanyUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams(); //追加

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log('=== Login attempt started ===');
    console.log('Username:', companyUserName);
    console.log('Password length:', password.length);

//    try {
//      console.log('Calling signIn...');
//      const result = await signIn("credentials", {
//        company_user_name: companyUserName,
//        password,
//        redirect: false,
//      });
//      
//      console.log('signIn result:', result);
//
//      if (result?.error) {
//        setError("ログインに失敗しました。ユーザー名とパスワードを確認してください。");
//        console.error("Login failed:", result.error);
//      } else {
//        console.log('=== Login success, redirecting to /register ===');
//        // router.push("/mypage"); //ログイン後の遷移先をマイページから案件登録に変更
//        router.push("/register");
//      }
//    } catch (err) {
//      console.error("Login error:", err);
//      setError("エラーが発生しました。もう一度お試しください。");
//    } finally {
//      setIsLoading(false);
//    }
//  };

    // 追加
    try {
      console.log('Calling signIn...');

      // URLに ?callbackUrl=... が付いていればそれを優先、無ければ既定ページへ
      const callbackUrl = searchParams.get("callbackUrl") ?? "/register";

      await signIn("credentials", {
        company_user_name: companyUserName,
        password,
        redirect: true,        // ← ここを true に：NextAuth にリダイレクトを任せる
        callbackUrl,           // ← ここで遷移先を指定
      });

      // redirect:true のため、ここ以降は基本的に実行されません
    } catch (err) {
      console.error("Login error:", err);
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }; // ← ここが必要！

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
      
      <p className="text-center text-base text-gray-500 mt-3">
        パスワードを忘れた方は{" "}
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-blue-600 font-medium cursor-default"
        >
          こちら
        </a>
      </p>
      
      <div className="flex items-center justify-center mt-3">
        <hr className="w-1/4 border-gray-300" />
        <span className="mx-3 text-gray-500 text-base">or</span>
        <hr className="w-1/4 border-gray-300" />
      </div>
      
      <div className="flex justify-center gap-8 mt-3">
        <img
          src="/Google.png"
          alt="Google login"
          className="w-28 h-auto cursor-pointer"
          onClick={() => alert("Googleログイン未実装")}
        />
        <img
          src="/Facebook.png"
          alt="Facebook login"
          className="w-28 h-auto cursor-pointer"
          onClick={() => alert("Facebookログイン未実装")}
        />
      </div>
      
      <p className="text-center text-base text-gray-500 mt-3">
        アカウントをお持ちでない方は{" "}
        <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 font-medium">
          新規登録
        </a>
      </p>
    </div>
  );
}
