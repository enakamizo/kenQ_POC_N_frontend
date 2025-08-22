"use client";

import { useEffect, useState } from "react";
import ProjectDetails from "@/components/ProjectDetails";
import MatchedResearchers from "@/components/MatchedResearchers";

export default function ProjectPage({ params }: { params: { id: string } }) {
    const projectId = params.id;
    const [projectData, setProjectData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
        );
    }

    if (!projectData) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg mt-10">
                <p>プロジェクトデータが見つかりません。</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg mt-10">
            {/* 上段：案件の詳細 */}
            <ProjectDetails projectId={projectId} setLoading={() => {}} />

            {/* 下段：おすすめの研究者リスト */}
            <MatchedResearchers projectId={projectId} setLoading={() => {}} />
            
            {/* 新規登録に戻るリンク */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => window.location.href = '/register'}
                    className="text-gray-600 hover:text-gray-800 transition underline"
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
        </div>
    );
}
