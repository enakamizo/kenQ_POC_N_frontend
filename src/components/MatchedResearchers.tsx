"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';

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
  const [projectData, setProjectData] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoriteConfirm, setShowFavoriteConfirm] = useState(false);
  const [showFavoriteSuccess, setShowFavoriteSuccess] = useState(false);
  const [expandedReasons, setExpandedReasons] = useState<string[]>([]);

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
          setProjectData(data.projectData || null);
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
  // マッチング理由の展開/折りたたみ
  const toggleReasonExpansion = (researcherId: string) => {
    setExpandedReasons(prev => 
      prev.includes(researcherId) 
        ? prev.filter(id => id !== researcherId)
        : [...prev, researcherId]
    );
  };

  // ローカルお気に入り選択切り替え（☆ボタン用）
  const handleToggleFavoriteLocal = (researcherId: string) => {
    console.log("🌟 ローカルお気に入り切り替え - researcher_id:", researcherId);
    setFavorites((prev) => {
      const newFavorites = prev.includes(researcherId)
        ? prev.filter((id) => id !== researcherId)
        : [...prev, researcherId];
      console.log("🌟 Updated local favorites:", newFavorites);
      return newFavorites;
    });
  };

  // お気に入り登録API実行（下部ボタン用）
  const handleSubmitFavorites = async () => {
    if (favorites.length === 0) {
      alert("お気に入りに登録する研究者を選択してください（星マークをクリック）");
      return;
    }

    console.log("🌟 お気に入り一括登録開始 - favorites:", favorites, "project_id:", projectId);
    
    try {
      for (const researcherId of favorites) {
        const researcher = researchers.find(r => 
          (r.researcher_info?.researcher_id || r.matching_id).toString() === researcherId
        );
        
        const apiUrl = `${process.env.NEXT_PUBLIC_AZURE_API_URL}/favorites`;
        const requestBody = {
          researcher_id: Number(researcherId),
          project_id: Number(projectId),
          matching_id: researcher?.matching_id || Number(researcherId),
          favorite_status: 1, // 1 = add to favorites
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
          throw new Error(`Failed to register favorite: ${response.status} ${response.statusText}`);
        }
      }
      
      setShowFavoriteConfirm(false);
      setShowFavoriteSuccess(true);
      console.log("🌟 お気に入り一括登録成功");
      
    } catch (error) {
      console.error("❌ お気に入り登録エラー:", error);
      setShowFavoriteConfirm(false);
      alert("お気に入りの登録に失敗しました。詳細はコンソールを確認してください。");
    }
  };

  const handleExportExcel = () => {
    console.log("📊 Excel出力開始 - researchers.length:", researchers.length);
    console.log("📊 Researchers data:", researchers);
    
    if (researchers.length === 0) {
      console.log("📊 研究者データが空のため、Excel出力をスキップ");
      alert("エクスポートする研究者データがありません。");
      return;
    }

    // 新しいワークブックを作成
    const wb = XLSX.utils.book_new();

    // 案件情報のワークシート
    const projectInfo = [
      ["案件情報"],
      ["案件タイトル", projectData?.title || ""],
      ["案件内容", projectData?.background || ""],
      ["業種", projectData?.industry || "食料品"],
      ["事業内容", projectData?.businessDescription || "食子会社、アイスクリーム事業、ヨーグルト・乳酸菌事業、冷凍事業"],
      ["大学", "全大学 (118校)"],
      ["研究者階層", "教授／准教授／助教／講師／助教授／助手／研究員／特任教授／特任助教／主任研究員"]
    ];
    
    const projectWS = XLSX.utils.aoa_to_sheet(projectInfo);
    
    // 案件情報シートのフォントを設定
    const projectRange = XLSX.utils.decode_range(projectWS['!ref'] || 'A1');
    for (let R = projectRange.s.r; R <= projectRange.e.r; ++R) {
      for (let C = projectRange.s.c; C <= projectRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (projectWS[cellAddress]) {
          if (!projectWS[cellAddress].s) projectWS[cellAddress].s = {};
          projectWS[cellAddress].s.font = {
            name: "游ゴシック",
            sz: 11,
            family: 1,
            charset: 128
          };
        }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, projectWS, "案件情報");

    // 研究者一覧のワークシート
    const researcherHeaders = [
      "氏名",
      "所属",
      "部署",
      "職位",
      "研究者情報",
      "マッチング理由",
      "お気に入り登録"
    ];

    const researcherRows = researchers.map((r) => {
      const researcherId = r.researcher_info?.researcher_id || r.matching_id;
      const kakenNumber = researcherId.toString().padStart(12, '0');
      const kakenUrl = `https://nrid.nii.ac.jp/ja/nrid/1${kakenNumber}`;
      const isFavorite = favorites.includes(researcherId.toString()) ? "登録済み" : "未登録";

      return [
        r.researcher_info?.name || r.researcher_name || "―",
        r.researcher_info?.university || r.researcher_affiliation_current || "―",
        r.researcher_info?.affiliation || r.researcher_department_current || "―",
        r.researcher_info?.position || r.researcher_position_current || "―",
        kakenUrl,
        r.researcher_info?.explanation || r.explanation || r.matching_reason || "―",
        isFavorite
      ];
    });

    const researcherData = [researcherHeaders, ...researcherRows];
    const researcherWS = XLSX.utils.aoa_to_sheet(researcherData);
    
    // 研究者一覧シートのフォントを設定
    const researcherRange = XLSX.utils.decode_range(researcherWS['!ref'] || 'A1');
    for (let R = researcherRange.s.r; R <= researcherRange.e.r; ++R) {
      for (let C = researcherRange.s.c; C <= researcherRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (researcherWS[cellAddress]) {
          if (!researcherWS[cellAddress].s) researcherWS[cellAddress].s = {};
          researcherWS[cellAddress].s.font = {
            name: "游ゴシック",
            sz: 11,
            family: 1,
            charset: 128
          };
        }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, researcherWS, "研究者一覧");

    // ファイル名を新しい形式に変更
    const sanitizedTitle =
      projectTitle && projectTitle.trim() !== ""
        ? "_" + projectTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 30)
        : "無題";

    const filename = `${projectId}${sanitizedTitle}.xlsx`;

    // Excelファイルをダウンロード
    XLSX.writeFile(wb, filename);
  };

  console.log("MatchedResearchers - render時のresearchers:", researchers);
  console.log("MatchedResearchers - render時の研究者数:", researchers.length);
  
  // 最初の研究者のデータ構造を詳しく確認
  if (researchers.length > 0) {
    console.log("📋 サンプル研究者の詳細データ構造:", JSON.stringify(researchers[0], null, 2));
    console.log("📋 サンプル研究者のresearcher_info.explanation:", researchers[0].researcher_info?.explanation);
    console.log("📋 サンプル研究者のexplanation:", researchers[0].explanation);
    console.log("📋 サンプル研究者のmatching_reason:", researchers[0].matching_reason);
  }

  return (
    <div className="relative mb-4 mt-6">
      <div className="pl-6">
        <h3 className="text-xl font-bold">研究者一覧</h3>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm border-collapse table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-gray-700 w-20 whitespace-nowrap">氏名</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-700 w-32 whitespace-nowrap">所属</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-700 w-32 whitespace-nowrap">学部</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-700 w-16 whitespace-nowrap">職位</th>
              <th className="px-3 py-3 text-center font-semibold text-gray-700 w-24 whitespace-nowrap">研究者情報</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-700 w-48 whitespace-nowrap">マッチング理由</th>
              <th className="px-3 py-3 text-center font-semibold text-gray-700 w-20 whitespace-nowrap">お気に入り</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {researchers.map((researcher: any) => (
              <tr key={researcher.researcher_info?.researcher_id || researcher.matching_id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{researcher.researcher_info?.name}</td>
                <td className="px-3 py-3 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                  {researcher.researcher_info?.university}
                </td>
                <td className="px-3 py-3 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                  {researcher.researcher_info?.affiliation || "―"}
                </td>
                <td className="px-3 py-3 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                  {researcher.researcher_info?.position || "―"}
                </td>
                <td className="px-3 py-3 text-center">
                  <a 
                    href={`https://nrid.nii.ac.jp/ja/nrid/1${(researcher.researcher_info?.researcher_id || researcher.matching_id).toString().padStart(12, '0')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-1.5 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition whitespace-nowrap"
                    style={{ fontSize: '10px' }}
                  >
                    プロフィール
                    <svg className="ml-1 w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </td>
                <td className="px-3 py-3 text-gray-700 text-xs">
                  {(() => {
                    const researcherId = (researcher.researcher_info?.researcher_id || researcher.matching_id).toString();
                    const fullReason = researcher.researcher_info?.explanation || 
                                     researcher.explanation || 
                                     researcher.matching_reason || 
                                     "―";
                    const isExpanded = expandedReasons.includes(researcherId);
                    
                    // 30文字で切って2行表示用のテキストを作成（1行20文字×2行に調整）
                    const getPreviewText = (text: string) => {
                      if (text.length <= 30) return text;
                      const firstLine = text.substring(0, 20);
                      const secondLine = text.substring(20, 30) + "...";
                      return `${firstLine}\n${secondLine}`;
                    };
                    
                    const previewText = getPreviewText(fullReason);
                    
                    return (
                      <div className="relative">
                        <div className="flex items-start">
                          <span className={isExpanded ? "whitespace-pre-wrap leading-tight" : "whitespace-pre-line leading-tight"}>{isExpanded ? fullReason : previewText}</span>
                          {fullReason.length > 30 && (
                            <button
                              onClick={() => toggleReasonExpansion(researcherId)}
                              className="ml-1 text-blue-500 hover:text-blue-700 transition text-xs flex-shrink-0"
                            >
                              {isExpanded ? "−" : "＋"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-3 py-3 text-center">
                  <button 
                    onClick={() => handleToggleFavoriteLocal((researcher.researcher_info?.researcher_id || researcher.matching_id).toString())}
                    className={`transition text-base ${
                      favorites.includes((researcher.researcher_info?.researcher_id || researcher.matching_id).toString())
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-gray-400 hover:text-yellow-500"
                    }`}
                  >
                    {favorites.includes((researcher.researcher_info?.researcher_id || researcher.matching_id).toString()) ? "★" : "☆"}
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
            if (favorites.length === 0) {
              alert("お気に入りに登録する研究者を選択してください（星マークをクリック）");
              return;
            }
            setShowFavoriteConfirm(true);
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          お気に入り登録する
        </button>
        <button
          onClick={handleExportExcel}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
        >
          Excel出力
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

      {/* お気に入り登録確認ポップアップ */}
      {showFavoriteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">お気に入り登録確認</h2>
            <p className="text-gray-600 mb-6">お気に入りの研究者を登録しますか？</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowFavoriteConfirm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                いいえ
              </button>
              <button
                onClick={handleSubmitFavorites}
                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}

      {/* お気に入り登録成功ポップアップ */}
      {showFavoriteSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">お気に入り登録完了</h2>
            <p className="text-gray-600 mb-6">{favorites.length}人の研究者をお気に入りに登録しました！</p>
            <button
              onClick={() => {
                setShowFavoriteSuccess(false);
                // お気に入り選択はリセットしない（黄色い星を保持）
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
