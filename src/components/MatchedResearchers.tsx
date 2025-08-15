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

  const router = useRouter();

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
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
  const handleExportCSV = () => {
    if (researchers.length === 0) return;

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
    const kakenNumber = r.researcher_id.toString().padStart(8, '0');
    const kakenUrl = `https://nrid.nii.ac.jp/ja/nrid/10000${kakenNumber}`;

      return [
      r.researcher_id,
      r.researcher_name,
      r.researcher_name_alphabet,
      r.researcher_name_kana,
      r.researcher_affiliation_current,
      r.researcher_department_current,
      r.researcher_position_current,
      r.research_field_pi,
      r.keywords_pi,
      r.matching_reason,
      kakenUrl, //
    ]});

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

  return (
    <div className="relative mb-4 mt-6">
      <div className="inline-flex items-center gap-3  pl-6">
        <h3 className="text-xl font-bold">おすすめの研究者リスト</h3>
        <button
          onClick={handleExportCSV}
          className="px-4 py-1 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition text-sm font-semibold"
        >
          CSV出力
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-none">
        <table className="w-full text-sm text-left border-collapse table-fixed">
          <thead className="bg-gray-100 text-xs">
            <tr className="border-b">
              <th className="p-2 w-[125px] whitespace-nowrap text-base">名 前</th>
              <th className="p-2 min-w-[280px] break-words text-base">所 属</th>
              <th className="p-2 w-[120px] text-left text-sm">部署<br />職位</th>
              <th className="p-2 w-[90px] text-center text-sm">研究者<br />情報</th>
              <th className="p-2 w-[90px] text-center text-sm">マッチング<br />理由</th>
              <th className="p-2 w-[70px] text-center text-lg">✔</th>
              <th className="p-2 w-[100px] text-center text-sm">オファー<br />状況</th>
              <th className="p-2 w-[70px] text-center text-lg">
                <img src="/Gmail Logo.png" alt="チャット" className="h-5 w-5 mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {researchers.map((researcher: any) => (
              <tr key={researcher.researcher_id} className="border-b">
                <td className="p-2 break-words max-w-[140px]">{researcher.researcher_name}</td>
                <td className="p-2 pr-1 break-words whitespace-nowrap text-sm">
                  {researcher.researcher_affiliation_current}
                </td>
                <td className="p-2 pl-1 text-left align-middle text-sm leading-tight break-words max-w-[150px]">
                  <div className="text-xs text-gray-600 break-words">{researcher.researcher_department_current || "―"}</div>
                  <div className="font-medium">{researcher.researcher_position_current || "―"}</div>
                </td>
                <td className="p-2 text-center">
                  <button onClick={() => handleInfoClick(researcher)} className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">info</button>
                </td>
                <td className="p-2 text-center">
                  <button className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => handleShowMatchingReason(researcher.matching_reason)}>why</button>
                </td>
                <td className="p-2 text-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 border-gray-400 accent-gray-600 rounded focus:ring-gray-500" />
                </td>
                <td className="p-2 text-center">
                  {researcher.matching_status === 0 && (
                    <button
                      onClick={() => handleCheckboxChange(researcher.researcher_id)}
                      className={`px-2 py-1 text-sm text-white rounded hover:opacity-90 ${
                        selectedResearchers.includes(researcher.researcher_id)
                          ? "bg-gray-500"
                          : "bg-gray-400 hover:bg-gray-500"
                      }`}
                    >
                      オファー
                    </button>
                  )}

                  {researcher.matching_status === 1 && <span className="text-gray-500">オファー中</span>}
                  {researcher.matching_status === 2 && <span className="text-green-600 font-bold">成立</span>}
                  {researcher.matching_status === 3 && <span className="text-gray-500">不成立</span>}
                  {researcher.matching_status === 4 && <span className="text-blue-600">オファー有</span>}
                </td>
                <td className="p-2 text-center">
                  {researcher.matching_status === 2 && researcher.chat_id && (
                    <a href={`/chat/${researcher.chat_id}`} className="text-xl">
                      {researcher.hasNewMessage ? "📩" : "✉"}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleOffer}
          disabled={selectedResearchers.length === 0}
          className={`px-6 py-2 rounded-lg shadow-md transition duration-200 text-lg font-semibold ${
            selectedResearchers.length === 0
              ? "bg-gray-300 text-white cursor-not-allowed"
              : "bg-gray-400 text-white hover:bg-gray-500"
          }`}
        >
          オファーする
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
