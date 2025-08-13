"use client";

import { useRouter } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import { useState } from "react";

export default function ConfirmForm() {
    const router = useRouter();
    const { formData } = useFormContext(); // `formData` を取得
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ 案件登録APIに送信する処理
    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);
        console.log("✅ 大学名:", formData.university);
        console.log("📦 university:", formData.university);
        console.log("📦 typeof:", typeof formData.university);

        const apiBaseUrl = process.env.NEXT_PUBLIC_AZURE_API_URL;

        try {
            const response = await fetch(
                //"https://app-kenq-1-azf7d4eje9cgaah2.canadacentral-01.azurewebsites.net/project-registration",  // 本番環境用
                // "http://127.0.0.1:8000/project-registration",　//ローカル環境用
                `${apiBaseUrl}/project-registration`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        company_user_id: 1, // ← とりあえず追加！
                        project_title: formData.title || "未入力",
                        consultation_category: formData.category || "未選択",
                        project_content: formData.background || "未入力",
                        industry: formData.industry || "未選択",
                        business_description: formData.businessDescription || "未入力",

                        university:
                        Array.isArray(formData.university)
                            ? formData.university.length >= 85
                            ? "全大学"
                            : formData.university.filter(Boolean)  // ← 空文字や null を除去
                            : "未選択",

                        research_field: formData.researchField || "未選択",
                        preferred_researcher_level: Array.isArray(formData.researcherLevel)
                            ? formData.researcherLevel
                            : formData.researcherLevel ? [formData.researcherLevel] : [],
                        application_deadline: formData.deadline || "未設定",
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Project registered:", data);

            if (data.project_id) {
            // ✅ `projectData` に `formData` も保存
                const projectData = {
                    ...formData, // ✅ 以前の `formData` を保持
                    project_id: data.project_id, // ✅ API からの `project_id` を追加
                };
                localStorage.setItem("projectData", JSON.stringify(projectData)); // ✅ `localStorage` に保存
                setShowPopup(true); // ✅ ポップアップを表示
            } else {
                throw new Error("No project_id received");
            }
        } catch (err: any) {
            console.error("Error registering project:", err);
            setError(err.message);
        } finally {
        setIsLoading(false);
    }
};

    // ✅ 研究者リストに進む
    const handleGoToResearchers = () => {
        const storedData = localStorage.getItem("projectData");
        const projectData = storedData ? JSON.parse(storedData) : null;
        const projectId = projectData?.project_id || "1"; // `project_id` を取得

        router.push(`/projects/${projectId}`); // ✅ `/projects/[id]` に遷移
    };

    return (
        <div className="bg-white p-6 rounded-lg max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">下記内容にて案件を作成しました</h1>
            <div className="bg-white p-6 rounded-md">

                {/* 依頼のカテゴリー */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">依頼のカテゴリー</label>
                    <p className="bg-white p-2 border border-gray-300 rounded-md">{formData.category || "未選択"}</p>
                </div>

                {/* 案件のタイトル */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">案件タイトル（40文字以内）</label>
                    <p className="bg-white p-2 border border-gray-300 rounded-md">{formData.title || "未入力"}</p>
                </div>

                {/* 依頼背景 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">案件内容</label>
                    <p className="bg-white p-2 border border-gray-300 rounded-md">{formData.background || "未入力"}</p>
                </div>

                {/* 業種 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">業種</label>
                    <p className="bg-white p-2 border border-gray-300 rounded-md">{formData.industry || "未選択"}</p>
                </div>

                {/* 事業内容 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">事業内容</label>
                    <p className="bg-white p-2 border border-gray-300 rounded-md">{formData.businessDescription || "未入力"}</p>
                </div>

                {/* 大学 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">大学</label>
                    <p className="bg-white p-2 border border-gray-300 rounded-md">
                    {Array.isArray(formData.university)
                        ? formData.university.join(" / ")
                        : formData.university || "未選択"}
                    </p>
                </div>

                {/* 研究分野 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">研究分野</label>
                    <p className="bg-white p-2 border border-gray-300 rounded-md">{formData.researchField || "未選択"}</p>
                </div>

                {/* 研究者階層 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">研究者階層</label>
                    <p className="bg-white p-2 border border-gray-300 rounded-md">
                        {Array.isArray(formData.researcherLevel)
                            ? formData.researcherLevel.join(" / ")
                            : formData.researcherLevel || "未選択"}
                    </p>
                </div>

                {/* 募集期限 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">募集期限</label>
                    <p className="bg-white p-2 border border-gray-300 rounded-md">{formData.deadline || "未設定"}</p>
                </div>
            </div>

            {/* エラーメッセージ */}
            {error && <p className="text-red-500 mt-4 text-center">エラー: {error}</p>}

            {/* ボタン配置 */}
            <div className="mt-6 flex justify-center space-x-6">
                <button
                    onClick={handleConfirm}
                    className={`w-40 py-3 rounded-lg shadow-md transition duration-200 ${
                        isLoading ? "bg-blue-400 text-white font-semibold cursor-not-allowed" : "bg-blue-400 text-white font-semibold hover:bg-blue-500"
                    }`}
                    disabled={isLoading}
                >
                    {isLoading ? "登録中..." : "登録を確定する"}
                </button>
                <button
                    onClick={() => router.push("/register")}
                    className="w-40 py-3 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition duration-200"
                >
                    修正する
                </button>
            </div>

            {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                <p className="text-lg font-medium mb-4">しばらくお待ちください</p>
                <svg
                    className="animate-spin h-10 w-10 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    />
                    <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                </svg>
                </div>
            </div>
            )}

            {/* ✅ ポップアップ（モーダル） */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
                        <h2 className="text-xl font-bold mb-4">案件を登録しました</h2>
                        <button
                            onClick={handleGoToResearchers}
                            className="w-full py-3 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500 transition duration-200"
                        >
                            研究者リストに進む
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

