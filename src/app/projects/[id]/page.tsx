"use client";

import { useEffect, useState } from "react";
import ProjectDetails from "@/components/ProjectDetails";
import MatchedResearchers from "@/components/MatchedResearchers";

export default function ProjectPage({ params }: { params: { id: string } }) {
    const projectId = params.id;
    const [projectData, setProjectData] = useState<any>(null);
    const [loadingProject, setLoadingProject] = useState(true);
    const [loadingResearchers, setLoadingResearchers] = useState(true);
    const isLoading = loadingProject || loadingResearchers;

    useEffect(() => {
        const storedData = localStorage.getItem("projectData");
        if (storedData) {
            setProjectData(JSON.parse(storedData));
        }
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg mt-10">

            {/* ✅ 共通ローディングモーダル */}
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

            {/* 上段：案件の詳細 */}
            {projectData ? (
                <ProjectDetails projectId={projectId} setLoading={setLoadingProject} />
            ) : (
                <p>Loading...</p>
            )}

            {/* 下段：おすすめの研究者リスト */}
            <MatchedResearchers projectId={projectId} setLoading={setLoadingResearchers} />
        </div>
    );
}
