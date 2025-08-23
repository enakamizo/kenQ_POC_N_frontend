"use client";

import { useEffect, useState } from "react";
import ProjectDetails from "@/components/ProjectDetails";
import MatchedResearchers from "@/components/MatchedResearchers";

export default function ProjectPage({ params }: { params: { id: string } }) {
    const projectId = params.id;
    const [projectData, setProjectData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showBackConfirm, setShowBackConfirm] = useState(false);

    useEffect(() => {
        // localStorageから保存されたプロジェクトデータを取得
        const storedData = localStorage.getItem(`project_${projectId}`);
        if (storedData) {
            const data = JSON.parse(storedData);
            setProjectData(data);
            console.log("Loaded project data:", data);
        } else {
            console.error("Project data not found for ID:", projectId);
        }
        setLoading(false);
    }, [projectId]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
        );
    }

    if (!projectData) {
        return (
            <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg mt-10">
                <p>プロジェクトデータが見つかりません。</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg mt-10">
            {/* 上段：案件の詳細 */}
            <ProjectDetails projectId={projectId} setLoading={() => {}} />

            {/* 下段：おすすめの研究者リスト */}
            <MatchedResearchers projectId={projectId} setLoading={() => {}} />
            
            {/* 新規登録に戻るリンク */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => setShowBackConfirm(true)}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                    ← 新規登録に戻る
                </button>
            </div>

            {/* 情報源の表示 */}
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                    *情報源は<a href="https://kaken.nii.ac.jp/ja/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">https://kaken.nii.ac.jp/ja/</a>より
                </p>
            </div>

            {/* 新規作成に戻る確認モーダル */}
            {showBackConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">新規作成に戻る確認</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            新規作成に戻りますか？このページから離れると、レコメンドされた研究者の情報は失われます。
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowBackConfirm(false)}
                                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                いいえ
                            </button>
                            <button
                                onClick={() => window.location.href = '/register'}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                            >
                                はい
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
