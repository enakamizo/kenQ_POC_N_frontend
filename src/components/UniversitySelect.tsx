"use client";
import React, { useEffect, useState } from "react";
import universitiesBySubregion from "@/data/universities_by_subregion.json";

type UniversitySelectProps = {
    value: string[];
    onChange: (selected: string[], allSelected?: boolean) => void;
};

export default function UniversitySelect({ value, onChange }: UniversitySelectProps) {
    const allUniversities = Object.values(universitiesBySubregion).flat(); // ✅ 修正点: useEffectの前に移動
    const [selectedUniversities, setSelectedUniversities] = useState<string[]>(value || []);
    const [showRegions, setShowRegions] = useState(false); // ✅ 修正点: エリア選択表示用

    useEffect(() => {
        const allSelected = allUniversities.every((u) =>
        selectedUniversities.includes(u)
        );
        onChange(
        allSelected ? ["全大学"] : selectedUniversities, // ✅ 修正点: 全大学選択時は "全大学" を送信
        allSelected
        );
    }, [selectedUniversities]); // ✅ 修正点: allUniversitiesは外に出したので依存配列から除外

    const handleToggleUniversity = (univ: string) => {
        setSelectedUniversities((prev) =>
        prev.includes(univ) ? prev.filter((u) => u !== univ) : [...prev, univ]
        );
    };

    const handleSelectAll = () => {
        const allSelected = allUniversities.every((u) =>
        selectedUniversities.includes(u)
        );
        setSelectedUniversities(allSelected ? [] : allUniversities); // ✅ 全大学か空に
    };

    return (
        <div className="space-y-4">
        {/* 全大学選択 */}
        <div>
            <label className="inline-flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={allUniversities.every((u) => selectedUniversities.includes(u))}
                    onChange={handleSelectAll}
                />
                <span>全大学を選択（国立大{allUniversities.length}校）</span>
            </label>
        </div>

        {/* エリアから選ぶ */}
        <div>
            <label className="inline-flex items-center space-x-2">
            <input
                type="checkbox"
                checked={showRegions}
                onChange={() => setShowRegions(!showRegions)}
            />
            <span>エリアから選択</span>
            </label>
        </div>

        {showRegions &&
            Object.entries(universitiesBySubregion).map(([region, universities]) => {
                const allRegionSelected = universities.every((u) =>
                    selectedUniversities.includes(u)
                    );

                const handleToggleRegion = () => {
                    setSelectedUniversities((prev) => {
                        const newSelected = new Set(prev);
                        if (allRegionSelected) {
                            universities.forEach((u) => newSelected.delete(u));
                        } else {
                            universities.forEach((u) => newSelected.add(u));
                        }
                        return Array.from(newSelected);
                    });
                };

            return (
                <div key={region}>
                    <div className="font-bold mt-4 flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={allRegionSelected}
                            onChange={handleToggleRegion}
                        />
                        <span>{region}</span>
                    </div>
                    <div className="pl-4 mt-1">
                        <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                            {universities.map((univ) => (
                                <label key={univ} className="inline-flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedUniversities.includes(univ)}
                                        onChange={() => handleToggleUniversity(univ)}
                                    />
                                    <span>{univ}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            );
        })}

        {/* チップ形式表示はコメントアウト */}
        <div>
            <p className="font-semibold mt-6">選択された大学: {selectedUniversities.length} 校</p>
                {/*
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUniversities.map((u) => (
                        <div
                            key={u}
                            className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm"
                        >
                        <span className="mr-2">{u}</span>
                        <button
                            type="button"
                            className="focus:outline-none"
                            onClick={() => handleToggleUniversity(u)}
                        >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95a1 1 0 011.414-1.414L10 8.586z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                */}
            </div>
        </div>
    );
}



