"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Researcher {
    researcher_id: number;
    researcher_name: string;
    researcher_name_kana: string;
    researcher_name_alphabet: string;
    researcher_affiliation_current: string;
    researcher_department_current: string;
    researcher_position_current: string;
    research_field_pi: string;
    keywords_pi: string;
    researcher_affiliations_past: string;
}

export default function ResearcherPage({ params }: { params: { id: string } }) {
    const router = useRouter(); 
    const researcherId = params.id;
    const [researcher, setResearcher] = useState<Researcher | null>(null);

    useEffect(() => {
        if (researcherId) {
            const apiUrl = `${process.env.NEXT_PUBLIC_AZURE_API_URL}/researcher-information?researcher_id=${researcherId}`;
            console.log("Fetching researcher from:", apiUrl);

            fetch(apiUrl)
            .then((res) => {
                if (!res.ok) throw new Error(`API Error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log("✅ researcher data:", data.researcher);
                setResearcher(data.researcher); // 🔧 ← ここが大事！
            })
            .catch((err) => console.error("Error fetching researcher:", err));
        }
    }, [researcherId]);

    if (!researcher) return <p>Loading...</p>;

    const handleShowMatchingReason = (researcherId: string) => {
        console.log(`Matching reason requested for researcher ID: ${researcherId}`);
        // ここにモーダルを開く処理を追加予定
    };

    return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 text-[20px] leading-relaxed">
        <h1 className="text-2xl font-bold mb-4">
        {researcher.researcher_name}（{researcher.researcher_name_kana}）
        </h1>
        <p className="text-gray-600 mb-2">
        <strong>所属：</strong>{researcher.researcher_affiliation_current}
        </p>
        <p className="text-gray-600 mb-2">
        <strong>部署：</strong>{researcher.researcher_department_current}
        </p>
        <p className="text-gray-600 mb-2">
        <strong>職位：</strong>{researcher.researcher_position_current}
        </p>
        <p className="text-gray-600 mb-2 whitespace-pre-wrap">
        <strong>専門分野：</strong>{researcher.research_field_pi}
        </p>
        <p className="text-gray-600 mb-2 whitespace-pre-wrap">
        <strong>過去の所属歴：</strong>{researcher.researcher_affiliations_past}
        </p>
        <p className="text-gray-600 mb-2 whitespace-pre-wrap">
        <strong>キーワード：</strong>{researcher.keywords_pi}
        </p>

        {/* ✅ もどるボタン */}
            <div className="mt-10 text-center">
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                    もどる
                </button>
            </div>
        </div>
    );
}
