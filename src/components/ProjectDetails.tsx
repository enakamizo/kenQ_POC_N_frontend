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
        // localStorageからプロジェクトデータを取得
        const storedData = localStorage.getItem(`project_${projectId}`);
        if (storedData) {
          const data = JSON.parse(storedData);
          console.log("ProjectDetails - 取得したデータ:", data.projectData);
          setProject(data.projectData);
          setLoading(false);
          return;
        }
        
        // フォールバック: APIから取得（404エラーが予想される）
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

  console.log("ProjectDetails - render時のproject:", project);

  return (
    <div className="mb-8">
      {/* 案件情報の枠 */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        {/* 案件タイトル - 枠内上部に配置 */}
        <h1 className="text-xl font-bold text-black mb-4">{project.title}</h1>

        {/* 案件内容セクション */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">案件内容</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm mb-4">{project.background}</p>
        </div>

        {/* 間仕切り線 */}
        <hr className="border-gray-300 mb-4" />

        {/* 詳細情報 - 2列レイアウト */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左列 */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">業種</h3>
              <p className="text-gray-700 text-sm">{project.industry || '食料品'}</p>
            </div>
            
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">大学</h3>
              <p className="text-gray-700 text-sm">全大学 (118校)</p>
            </div>
          </div>

          {/* 右列 */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">事業内容</h3>
              <p className="text-gray-700 text-sm">{project.businessDescription || '食子会社、アイスクリーム事業、ヨーグルト・乳酸菌事業、冷凍事業'}</p>
            </div>
            
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">研究者階層</h3>
              <p className="text-gray-700 text-sm">教授／准教授／助教／講師／助教授／助手／研究員／特任教授／特任助教／主任研究員</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

