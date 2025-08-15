"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

//export default function MatchedResearchers({ projectId }: { projectId: string }) {
export default function MatchedResearchers({
  projectId,
  setLoading,
}: {
  projectId: string;
  setLoading: (value: boolean) => void;
}) {
  console.log("📌 現在の project_id:", projectId); 
  const [researchers, setResearchers] = useState<any[]>([]);
  const [selectedResearchers, setSelectedResearchers] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedResearcher, setSelectedResearcher] = useState<any | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        // localStorageからマッチング結果を取得
        const storedData = localStorage.getItem(`project_${projectId}`);
        if (storedData) {
          const data = JSON.parse(storedData);
          console.log("MatchedResearchers - 研究者データ:", data.matchingResults.matched_researchers);
          console.log("MatchedResearchers - 研究者数:", data.matchingResults.matched_researchers?.length);
          setResearchers(data.matchingResults.matched_researchers || []);
          setProjectTitle(data.projectData.title || "");
          setLoading(false);
          return;
        }
        
        // フォールバック: APIから取得
        const apiUrl = `${process.env.NEXT_PUBLIC_AZURE_API_URL}/matching-results?project_id=${projectId}`;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        console.log("🔍 APIレスポンス", data);
        console.log("🔍 プロジェクトタイトル:", data.matchings?.[0]?.project?.project_title);
        //console.log("🔍 サンプル研究者データ:", data.matchings?.[0]?.researcher);
        console.log("🔍 サンプル研究者データ:", JSON.stringify(data.matchings?.[0]?.researcher, null, 2));

        setProjectTitle(data.project?.project_title || "");

        const uniqueResearchers = Array.from(
          new Map(
            data.matchings.map((item: any) => [
              item.researcher.researcher_id,
              {
                ...item.researcher,
                //researcher_number: item.researcher.researcher_number,
                matching_reason: item.matching_reason,
                matching_status: item.matching_status,
                hasNewMessage: item.has_new_message || false,
                chat_id: item.chat_id || null
              },
            ])
          ).values()
        );
        setResearchers(uniqueResearchers);
      } catch (error) {
        console.error("研究者データの取得エラー:", error);
      } finally {
        setLoading(false); // ローディング解除
      }
    };
    fetchResearchers();
  }, [projectId]);

  const handleInfoClick = (researcher: any) => {
    setSelectedResearcher(researcher);
    setShowInfoModal(true);
  };

  const handleCheckboxChange = (researcherId: string) => {
    setSelectedResearchers((prev) =>
      prev.includes(researcherId)
        ? prev.filter((id) => id !== researcherId)
        : [...prev, researcherId]
    );
  };

  const handleShowMatchingReason = (reason: string) => {
    setSelectedReason(reason);
    setShowReasonModal(true);
  };

  const handleOffer = async () => {
    if (selectedResearchers.length === 0) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AZURE_API_URL}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: Number(projectId),
          researcher_ids: selectedResearchers.map(id => Number(id)),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send offers: ${response.statusText}`);
      }

      setShowPopup(true);
    } catch (error) {
      console.error("❌ オファー送信エラー:", error);
      alert("オファー送信に失敗しました。もう一度お試しください。");
    }
  };

  // CSV出力
  // お気に入り機能
  const handleToggleFavorite = async (researcherId: string) => {
    console.log("🌟 お気に入り切り替え - researcher_id:", researcherId, "project_id:", projectId);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_AZURE_API_URL}/favorites`;
      const requestBody = {
        researcher_id: Number(researcherId),
        project_id: Number(projectId),
      };
      
      console.log("🌟 API URL:", apiUrl);
      console.log("🌟 Request body:", requestBody);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("🌟 Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🌟 Response error:", errorText);
        throw new Error(`Failed to toggle favorite: ${response.status} ${response.statusText}`);
      }

      // お気に入り状態を更新
      setFavorites((prev) => {
        const newFavorites = prev.includes(researcherId)
          ? prev.filter((id) => id !== researcherId)
          : [...prev, researcherId];
        console.log("🌟 Updated favorites:", newFavorites);
        return newFavorites;
      });
      
      console.log("🌟 お気に入り切り替え成功");
    } catch (error) {
      console.error("❌ お気に入り切り替えエラー:", error);
      alert("お気に入りの切り替えに失敗しました。詳細はコンソールを確認してください。");
    }
  };

  const handleExportCSV = () => {
    console.log("📊 CSV出力開始 - researchers.length:", researchers.length);
    console.log("📊 Researchers data:", researchers);
    
    if (researchers.length === 0) {
      console.log("📊 研究者データが空のため、CSV出力をスキップ");
      alert("エクスポートする研究者データがありません。");
      return;
    }

    const headers = [
      "研究者ID",
      "氏名",
      "氏名（ローマ字）",
      "ふりがな",
      "所属",
      "部署",
      "職位",
      "専門分野",
      "キーワード",
      "マッチング理由",
      "科研url"
    ];

    const rows = researchers.map((r) => {
      const researcherId = r.researcher_info?.researcher_id || r.matching_id;
      const kakenNumber = researcherId.toString().padStart(13, '0');
      const kakenUrl = `https://nrid.nii.ac.jp/ja/nrid/${kakenNumber}`;

      return [
        researcherId,
        r.researcher_info?.name || r.researcher_name || "―",
        r.researcher_name_alphabet || "―",
        r.researcher_name_kana || "―",
        r.researcher_info?.university || r.researcher_affiliation_current || "―",
        r.researcher_info?.affiliation || r.researcher_department_current || "―",
        r.researcher_info?.position || r.researcher_position_current || "―",
        r.research_field_pi || "―",
        r.keywords_pi || "―",
        r.matching_reason || "―",
        kakenUrl,
      ];
    });

    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) =>
              `"${String(cell).replace(/"/g, '""')}"`
            )
            .join(",")
        )
        .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const sanitizedTitle =
      projectTitle && projectTitle.trim() !== ""
        ? "_" + projectTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 30)
        : "無題";

    //link.setAttribute("download", `研究者一覧_${projectId}${sanitizedTitle}.csv`);
    link.setAttribute("download", `研究者一覧_${sanitizedTitle}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  console.log("MatchedResearchers - render時のresearchers:", researchers);
  console.log("MatchedResearchers - render時の研究者数:", researchers.length);

  return (
    <div className="relative mb-4 mt-6">
      <div className="pl-6">
        <h3 className="text-xl font-bold">おすすめの研究者リスト</h3>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">氏名</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[200px]">大学</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-40">学部</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-24">職位</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">詳細</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 w-24">マッチング理由</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16">お気に入り</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {researchers.map((researcher: any) => (
              <tr key={researcher.researcher_info?.researcher_id || researcher.matching_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{researcher.researcher_info?.name}</td>
                <td className="px-4 py-3 text-gray-700">
                  {researcher.researcher_info?.university}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {researcher.researcher_info?.affiliation || "―"}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {researcher.researcher_info?.position || "―"}
                </td>
                <td className="px-4 py-3 text-center">
                  <a 
                    href={`https://nrid.nii.ac.jp/ja/nrid/${(researcher.researcher_info?.researcher_id || researcher.matching_id).toString().padStart(13, '0')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                  >
                    詳細
                  </a>
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition" 
                    onClick={() => handleShowMatchingReason(researcher.matching_reason)}
                  >
                    理由
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => handleToggleFavorite(researcher.researcher_info?.researcher_id || researcher.matching_id)}
                    className={`transition text-lg ${
                      favorites.includes(researcher.researcher_info?.researcher_id || researcher.matching_id)
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-gray-400 hover:text-yellow-500"
                    }`}
                  >
                    {favorites.includes(researcher.researcher_info?.researcher_id || researcher.matching_id) ? "★" : "☆"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 下部ボタン */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => {
            // お気に入り登録処理（選択された研究者がいる場合）
            if (favorites.length === 0) {
              alert("お気に入りに登録する研究者を選択してください（星マークをクリック）");
              return;
            }
            alert(`${favorites.length}人の研究者をお気に入りに登録しました！`);
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          お気に入り登録する
        </button>
        <button
          onClick={handleExportCSV}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
        >
          CSV出力
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
            <h2 className="text-xl font-bold mb-4">オファーしました！</h2>
            <button
              onClick={() => router.push("/mypage")}
              className="w-full py-3 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-600 transition duration-200"
            >
              マイページを見る
            </button>
          </div>
        </div>
      )}

      {showReasonModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg text-gray-800">
            <h2 className="text-xl font-semibold mb-4">マッチング理由</h2>
            <p className="mb-6 whitespace-pre-wrap">{selectedReason}</p>
            <button
              onClick={() => setShowReasonModal(false)}
              className="w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {showInfoModal && selectedResearcher && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-lg text-gray-800 overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-semibold mb-4">研究者情報</h2>
            <div className="space-y-2 text-sm whitespace-pre-wrap">
              <p><strong>氏名：</strong>{selectedResearcher.researcher_name}（{selectedResearcher.researcher_name_kana}）</p>
              <p><strong>所属：</strong>{selectedResearcher.researcher_affiliation_current}</p>
              <p><strong>部署：</strong>{selectedResearcher.researcher_department_current}</p>
              <p><strong>職位：</strong>{selectedResearcher.researcher_position_current || "―"}</p>
              <p><strong>専門分野：</strong>{selectedResearcher.research_field_pi}</p>
              <p><strong>過去の所属歴：</strong>{selectedResearcher.researcher_affiliations_past}</p>
            </div>
            <button
              onClick={() => router.push(`/researcher/${selectedResearcher.researcher_id}`)}
              className="w-full py-2 bg-blue-800 text-white rounded hover:bg-blue-500 transition"
            >
              詳細を見る
            </button>
            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
