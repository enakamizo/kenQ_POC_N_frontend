"use client";

import { useEffect, useState } from "react";

//export default function ProjectDetails({ projectId }: { projectId: string }) {
export default function ProjectDetails({
  projectId,
  setLoading,
}: {
  projectId: string;
  setLoading: (value: boolean) => void;
}) {

  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_AZURE_API_URL}/matching-results?project_id=${projectId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("プロジェクト情報の取得に失敗しました");
        }

        const data = await response.json();
        setProject(data.project);  // ← プロジェクト部分だけ使う
      } catch (error) {
        console.error("プロジェクト情報取得エラー:", error);
      } finally {
        setLoading(false); // ここでローディング終了を通知
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (!project) {
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

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-3xl font-bold mb-4">{project.project_title}</h2>

      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="mb-4">
          <p className="text-gray-600 text-sm">カテゴリ</p>
          <p className="font-medium">{project.consultation_category}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">案件内容</p>
          <p className="font-medium whitespace-pre-wrap">{project.project_content}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">研究分野</p>
          <p className="font-medium">{project.research_field}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">研究者階層</p>
          <p className="font-medium">
            {Array.isArray(project.preferred_researcher_level)
              ? project.preferred_researcher_level.join(" / ")
              : project.preferred_researcher_level?.split(",").map((level: string) => level.trim()).join(" / ")}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">募集期限</p>
          <p className="font-medium text-base">
            {project.application_deadline?.split("T")[0]}
          </p>
        </div>
      </div>
    </div>
  );
}

