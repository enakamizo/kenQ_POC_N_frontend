"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import UniversitySelect from "@/components/UniversitySelect";
import universitiesBySubregion from "@/data/universities_by_subregion.json";

const allResearcherLevels = [
  "教授", "准教授", "助教", "講師", "助教授", "助手",
  "研究員", "特任助教", "主任研究員", "特任教授",
];

type FormDataType = {
  category: string;
  title: string;
  background: string;
  industry: string;        // ✅追加
  businessDescription: string; // ✅追加
  university: string[];      // ✅追加
  researchField: string;
  researcherLevel: string[];
  deadline: string;
};

type RequestFormProps = {
  onSubmit?: (data: FormDataType) => void;
};

export default function RequestForm({ onSubmit }: RequestFormProps) {
  const router = useRouter();
  const { formData, setFormData } = useFormContext();

  const initialData: FormDataType = {
    category: "",
    title: "",
    background: "",
    industry: "",
    businessDescription: "",
    university: [],
    researchField: "",
    researcherLevel: [...allResearcherLevels],
    deadline: "",
  };

  const [localFormData, setLocalFormData] = useState<FormDataType>(formData || initialData);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // ←診断中に「しばらくお待ちください。」を表示するため
  const [validationError, setValidationError] = useState<string | null>(null); // ←AIアシストのため５つの項目すべてに入力してもらう注意を表示するため

  // ✅ モーダル表示と診断結果を管理
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);

  // ✅ 選択した大学を formData に反映
  useEffect(() => {
    if (JSON.stringify(formData.university) !== JSON.stringify(selectedUniversities)) {
      setFormData(prev => ({ ...prev, university: selectedUniversities }));
    }
  }, [selectedUniversities]);

  // ✅ formData をもとに localFormData や selectedUniversities を初期化
  useEffect(() => {
  setLocalFormData(formData);

    let universityArray =
    Array.isArray(formData.university)
      ? formData.university
      : formData.university
      ? [formData.university]
      : [];

  // ✅ "全大学" が含まれていたら、85校に展開
  if (universityArray.includes("全大学")) {
    const universityList85 = Object.values(universitiesBySubregion).flat();
    setSelectedUniversities(universityList85);
  } else {
    setSelectedUniversities(universityArray);
  }
}, []);

  const handleDiagnosis = () => {
    // 必須5項目の簡易バリデーション
    if (
      !localFormData.category ||
      !localFormData.title ||
      !localFormData.background ||
      !localFormData.industry ||
      !localFormData.businessDescription
    ) {
      setValidationError("必須項目（上段5項目）をすべて入力してください。");
      return;
    }

    setShowConfirmModal(true);
  };

  const applyDiagnosisResult = () => {
    if (diagnosisResult) {
      setLocalFormData(prev => ({ ...prev, background: diagnosisResult }));
      setFormData(prev => ({ ...prev, background: diagnosisResult }));
      setShowModal(false);
    }
  };

  const executeDiagnosis = async () => {
    console.log("送信内容", localFormData);
    setShowConfirmModal(false);
    setLoading(true); // ← しばらくお待ちください。の表示のため

    try {
      //const response = await fetch("https://app-kenq-1-azf7d4eje9cgaah2.canadacentral-01.azurewebsites.net/ai-diagnosis", {
      const apiBaseUrl = process.env.NEXT_PUBLIC_AZURE_API_URL;
      console.log("Environment check:", {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_AZURE_API_URL: process.env.NEXT_PUBLIC_AZURE_API_URL,
        apiBaseUrl: apiBaseUrl
      });

      if (!apiBaseUrl) {
        throw new Error("API URLが設定されていません。環境変数を確認してください。");
      }
      
      const response = await fetch(`${apiBaseUrl}/ai-diagnosis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consultation_category: localFormData.category,
          project_title: localFormData.title,
          project_content: localFormData.background,
          industry: localFormData.industry,
          business_description: localFormData.businessDescription,
          //university: localFormData.university || "",
          university: Array.isArray(formData.university)
            ? formData.university
            : formData.university ? [formData.university] : [],
          research_field: localFormData.researchField || "",
          preferred_researcher_level: Array.isArray(formData.researcherLevel)
            ? formData.researcherLevel
            : formData.researcherLevel ? [formData.researcherLevel] : [],
          application_deadline:
            localFormData.deadline && localFormData.deadline.trim() !== ""
              ? localFormData.deadline
              : "2099-12-31", // ←★ここが重要
          company_user_id: 1, // ←ログイン中の企業ユーザーID（仮で 1 を設定）
        }),
      });

      if (!response.ok) {
        const errText = await response.text(); // ←エラーメッセージの中身も取れるように
        throw new Error("AI診断APIエラー: " + errText);
      }

      const result = await response.json();
      console.log("診断結果", result.message); // ★ここ
      setDiagnosisResult(result || "診断結果が取得できませんでした");
      setShowModal(true);
    } catch (error) {
      console.error("診断エラー:", error);
      setDiagnosisResult("診断中にエラーが発生しました");
      setShowModal(true);
    } finally {
      setLoading(false); // ← しばらくお待ちください。の表示のため
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(localFormData);
    } else {
      router.push("/register/confirm");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg">

      {/* === 上段ブロック: カテゴリー〜AI課題診断 === */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-6 border border-blue-300">
        {/* 依頼のカテゴリー */}
        <div>
          <label className="block text-sm font-medium mb-1">依頼カテゴリー <span className="text-red-500">*</span></label>
          <div className="space-y-2">
            {["ヒアリング", "壁打ち", "共同研究開発"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="category"
                  value={option}
                  onChange={handleChange}
                  checked={localFormData.category === option}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 案件のタイトル */}
        <div>
          <label className="block text-sm font-medium mb-1">案件タイトル（40文字以内） <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            value={localFormData.title}
            onChange={handleChange}
            maxLength={40}
            placeholder="タイトルを入力してください"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <div className="text-right -mt-1 mb-2">
            <span className="text-xs text-gray-400">
              {localFormData.title.length}/40文字
            </span>
          </div>
        </div>

      {/* 案件内容 */}
      <div>
        <label className="block text-sm font-medium mb-1">案件内容（1000文字以内）<span className="text-red-500">*</span></label>
        <textarea
          name="background"
          value={localFormData.background}
          onChange={handleChange}
          placeholder="案件内容を記載してください"
          maxLength={1000}
          className="w-full p-2 border border-gray-300 rounded-lg"
          rows={4}
        />
        <div className="text-right -mt-1 mb-2">
          <span className="text-xs text-gray-400">
            {localFormData.background.length}/1000文字
          </span>
        </div>
      </div>

      {/* 業種 */}
      <div>
        <label className="block text-sm font-medium mb-1">業種</label>
        <select
          name="industry"
          value={localFormData.industry}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="">選択してください</option>
          <option value="水産・農林業">水産・農林業</option>
          <option value="鉱業">鉱業</option>
          <option value="建設業">建設業</option>
          <option value="食料品">食料品</option>
          <option value="繊維製品">繊維製品</option>
          <option value="パルプ・紙">パルプ・紙</option>
          <option value="化学">化学</option>
          <option value="医薬品">医薬品</option>
          <option value="石油・石炭製品">石油・石炭製品</option>
          <option value="ゴム製品">ゴム製品</option>
          <option value="ガラス・土石製品">ガラス・土石製品</option>
          <option value="鉄鋼">鉄鋼</option>
          <option value="非鉄金属">非鉄金属</option>
          <option value="金属製品">金属製品</option>
          <option value="機械">機械</option>
          <option value="電気機器">電気機器</option>
          <option value="輸送用機器">輸送用機器</option>
          <option value="精密機器">精密機器</option>
          <option value="その他製品">その他製品</option>
          <option value="電気・ガス業">電気・ガス業</option>
          <option value="陸運業">陸運業</option>
          <option value="海運業">海運業</option>
          <option value="空運業">空運業</option>
          <option value="倉庫・運輸関連業">倉庫・運輸関連業</option>
          <option value="情報・通信業">情報・通信業</option>
          <option value="卸売業">卸売業</option>
          <option value="小売業">小売業</option>
          <option value="銀行業">銀行業</option>
          <option value="証券、商品先物取引業">証券、商品先物取引業</option>
          <option value="保険業">保険業</option>
          <option value="その他金融業">その他金融業</option>
          <option value="不動産業">不動産業</option>
          <option value="サービス業">サービス業</option>
        </select>
      </div>

      {/* 事業内容 */}
      <div className="relative">
        <label className="block text-sm font-medium mb-1">事業内容（100文字以内）</label>
        <textarea
          name="businessDescription"
          value={localFormData.businessDescription}
          onChange={handleChange}
          placeholder="事業内容を記載してください"
          maxLength={100}
          className="w-full p-2 border border-gray-300 rounded-lg resize-none"
          rows={3}
        />
        <div className="text-right -mt-1 mb-2">
          <span className="text-xs text-gray-400">
            {localFormData.businessDescription.length}/100文字
          </span>
        </div>

        {/* 入力欄の外側・右下にボタンを配置 */}
        <div className="flex flex-col items-center mt-6 space-y-2">
          <p className="text-xs text-gray-800 text-center">
            案件登録内容のブラッシュアップにAIアシスト機能をご活用ください。
          </p>
          <button
            type="button"
            onClick={handleDiagnosis}
            className="bg-blue-400 hover:bg-blue-500 text-white text-sm font-semibold py-1 px-3 rounded"
          >
            案件入力AIアシスト
          </button>
        </div>

        {/* AI診断確認ポップアップ */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-lg">✨</span>
                </div>
                <h2 className="text-lg font-semibold">AIアシスト - 案件内容の最適化</h2>
              </div>
              <p className="text-gray-700 mb-4">
                AIが現在の案件内容を分析し、より効果的で魅力的な案件を案内内容を提案します。
              </p>
              <p className="text-gray-600 text-sm mb-6">
                現在入力されている内容をAIが分析し、より魅力的で効果的な案件を案内内容を提案します。
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  onClick={() => setShowConfirmModal(false)}
                >
                  キャンセル
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                  onClick={executeDiagnosis}
                >
                  <span>✨</span>
                  AI診断を実行
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-lg">✨</span>
                </div>
                <h2 className="text-lg font-semibold">AIアシスト - 案件内容の最適化</h2>
              </div>
              <p className="text-gray-700 mb-4">
                AIが現在の案件内容を分析し、より効果的で魅力的な案件を案内内容を提案します。
              </p>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">提案案件内容</label>
                  <span className="text-xs text-gray-400">
                    {diagnosisResult?.length || 0}/1000文字
                  </span>
                </div>
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-sm text-gray-800">{diagnosisResult}</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  onClick={() => setShowModal(false)}
                >
                  キャンセル
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={applyDiagnosisResult}
                >
                  提案を適用
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-lg">✨</span>
                </div>
                <h2 className="text-lg font-semibold">AIアシスト - 案件内容の最適化</h2>
              </div>
              <p className="text-gray-700 mb-6">
                AIが現在の案件内容を分析し、より効果的で魅力的な案件を案内内容を提案します。
              </p>
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-10 w-10 text-blue-500 mb-4"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <p className="text-gray-600 text-center">AIが案件内容を分析中...</p>
              </div>
            </div>
          </div>
        )}

        {validationError && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <p className="text-lg font-medium mb-4">{validationError}</p>
              <button
                className="px-4 py-2 bg-blue-400 text-white font-semibold rounded hover:bg-blue-500"
                onClick={() => setValidationError(null)}
              >
                OK
              </button>
            </div>
          </div>
        )}

      </div>
    </div>

      {/* === 下段ブロック: 大学〜確認ボタン === */}
      {/* 大学 */}
      <div>
        <label className="block text-sm font-medium mb-1">大学</label>
        <div className="p-4 rounded-lg border border-gray-300">
          <UniversitySelect
            value={
              Array.isArray(formData.university) &&
              formData.university.length === 1 &&
              formData.university[0] === "全大学"
                ? Object.values(universitiesBySubregion).flat()
                : formData.university || []
            }
            onChange={(value) => {
              const allUniversityNames = Object.values(universitiesBySubregion).flat();
              const isAllSelected = value.length === allUniversityNames.length;
              const updated = isAllSelected ? ["全大学"] : value;

              setFormData({ ...formData, university: updated });
              setLocalFormData((prev) => ({ ...prev, university: updated }));
              setSelectedUniversities(updated);
            }}
          />
        </div>
      </div>

     {/* 研究分野 */}
      <div>
        <label className="block text-sm font-medium mb-1">研究分野</label>
        <select
          name="researchField"
          value={localFormData.researchField}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="">選択してください</option>
          <option value="ライフサイエンス">ライフサイエンス</option>
          <option value="情報通信">情報通信</option>
          <option value="環境・農学">環境・農学</option>
          <option value="ナノテク・材料">ナノテク・材料</option>
          <option value="エネルギー">エネルギー</option>
          <option value="ものづくり技術">ものづくり技術</option>
          <option value="社会基盤">社会基盤</option>
          <option value="フロンティア">フロンティア</option>
          <option value="人文・社会">人文・社会</option>
          <option value="自然科学一般">自然科学一般</option>
          <option value="その他">その他</option>
        </select>
      </div>

      {/* 研究者階層 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          研究者階層 <span className="text-red-500">*</span>
        </label>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
          {/* 上段：すべて選択 */}
          <div className="mb-4 pb-4 border-b border-gray-300">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={localFormData.researcherLevel.length === allResearcherLevels.length}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const updatedLevels = isChecked ? allResearcherLevels : [];
                  setLocalFormData(prev => ({ ...prev, researcherLevel: updatedLevels }));
                  setFormData(prev => ({ ...prev, researcherLevel: updatedLevels }));
                }}
                className="w-4 h-4"
              />
              <span>すべて選択</span>
            </label>
          </div>

          {/* 下段：研究者階層チェックボックス（2列レイアウト） */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {allResearcherLevels.map((level) => (
              <label key={level} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  name="researcherLevel"
                  value={level}
                  checked={localFormData.researcherLevel.includes(level)}
                  onChange={(e) => {
                    const value = e.target.value;
                    const isChecked = e.target.checked;
                    const updatedLevels = isChecked
                      ? [...localFormData.researcherLevel, value]
                      : localFormData.researcherLevel.filter(item => item !== value);

                    setLocalFormData(prev => ({ ...prev, researcherLevel: updatedLevels }));
                    setFormData(prev => ({ ...prev, researcherLevel: updatedLevels }));
                  }}
                  className="w-4 h-4"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex justify-center">
        <button type="submit" className="bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-900">
          案件登録
        </button>
      </div>

    </form>
  );
}


