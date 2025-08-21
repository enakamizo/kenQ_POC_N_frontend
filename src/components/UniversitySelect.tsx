"use client";
import React, { useEffect, useState } from "react";
import universitiesBySubregion from "@/data/universities_by_subregion.json";

type UniversitySelectProps = {
    value: string[];
    onChange: (selected: string[], allSelected?: boolean) => void;
};

// お気に入りの大学リスト
const favoriteUniversities = [
    "東京大学", "大阪大学",
    "東京科学大学", "慶應義塾大学"
];

export default function UniversitySelect({ value, onChange }: UniversitySelectProps) {
    const allUniversities = Object.values(universitiesBySubregion).flat();
    
    // Initialize state based on the value prop
    const getInitialState = () => {
        if (value?.includes("全大学")) {
            return {
                selectedUniversities: allUniversities,
                selectionMode: 'all' as const
            };
        }
        return {
            selectedUniversities: value || [],
            selectionMode: 'none' as const
        };
    };
    
    const initialState = getInitialState();
    const [selectedUniversities, setSelectedUniversities] = useState<string[]>(initialState.selectedUniversities);
    const [selectionMode, setSelectionMode] = useState<'none' | 'all' | 'favorites' | 'regions'>(initialState.selectionMode);

    // Handle value prop changes from parent
    useEffect(() => {
        if (value?.includes("全大学") && selectionMode !== 'all') {
            setSelectedUniversities(allUniversities);
            setSelectionMode('all');
        } else if (!value?.includes("全大学") && value) {
            setSelectedUniversities(value);
            if (selectionMode === 'all') {
                setSelectionMode('none');
            }
        }
    }, [value]);

    useEffect(() => {
        const allSelected = allUniversities.every((u) => selectedUniversities.includes(u));
        onChange(
            allSelected ? ["全大学"] : selectedUniversities,
            allSelected
        );
    }, [selectedUniversities]);

    const handleToggleUniversity = (univ: string) => {
        setSelectedUniversities((prev) => {
            if (prev.includes(univ)) {
                // 選択を解除
                return prev.filter((u) => u !== univ);
            } else {
                // エリア選択時は20校制限をチェック
                if (selectionMode === 'regions' && prev.length >= 20) {
                    return prev; // 20校を超える場合は追加しない
                }
                return [...prev, univ];
            }
        });
    };

    const handleSelectAll = () => {
        const isAllSelected = selectionMode === 'all';
        if (isAllSelected) {
            setSelectedUniversities([]);
            setSelectionMode('none');
        } else {
            setSelectedUniversities(allUniversities);
            setSelectionMode('all');
        }
    };

    const handleSelectFavorites = () => {
        const isFavoritesSelected = selectionMode === 'favorites';
        if (isFavoritesSelected) {
            setSelectionMode('none');
            setSelectedUniversities([]);
        } else {
            setSelectionMode('favorites');
            // Clear previous selections and set only favorite universities
            setSelectedUniversities(favoriteUniversities);
        }
    };

    const handleSelectRegions = () => {
        const isRegionsSelected = selectionMode === 'regions';
        if (isRegionsSelected) {
            setSelectionMode('none');
            setSelectedUniversities([]);
        } else {
            setSelectionMode('regions');
            setSelectedUniversities([]);
        }
    };

    const handleToggleRegion = (region: string, universities: string[]) => {
        const allRegionSelected = universities.every((u) => selectedUniversities.includes(u));
        setSelectedUniversities((prev) => {
            const newSelected = new Set(prev);
            if (allRegionSelected) {
                // 地域の選択を解除
                universities.forEach((u) => newSelected.delete(u));
            } else {
                // 地域を選択（20校制限をチェック）
                const newUniversities = universities.filter(u => !newSelected.has(u));
                if (selectionMode === 'regions' && newSelected.size + newUniversities.length > 20) {
                    // 20校を超える場合は追加しない
                    return Array.from(newSelected);
                }
                universities.forEach((u) => newSelected.add(u));
            }
            return Array.from(newSelected);
        });
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
            {/* 選択オプション */}
            <div className="space-y-3">
                {/* 全大学を選択 */}
                <div>
                    <label className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={selectionMode === 'all'}
                            onChange={handleSelectAll}
                            className="w-4 h-4"
                        />
                        <span>全大学を選択（{allUniversities.length}校）</span>
                    </label>
                </div>

                {/* お気に入りの大学 */}
                <div>
                    <label className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={selectionMode === 'favorites'}
                            onChange={handleSelectFavorites}
                            className="w-4 h-4"
                        />
                        <span>お気に入りの大学</span>
                    </label>
                </div>

                {/* お気に入り大学の詳細表示 */}
                {selectionMode === 'favorites' && (
                    <div className="ml-6 mt-3 bg-white p-4 rounded border">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {favoriteUniversities.map((univ) => (
                                <label key={univ} className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedUniversities.includes(univ)}
                                        onChange={() => handleToggleUniversity(univ)}
                                        className="w-4 h-4"
                                    />
                                    <span>{univ}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* エリアから選択 */}
                <div>
                    <label className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={selectionMode === 'regions'}
                            onChange={handleSelectRegions}
                            className="w-4 h-4"
                        />
                        <span>エリアから選択（20校まで）</span>
                    </label>
                </div>

                {/* エリア選択の詳細表示 */}
                {selectionMode === 'regions' && (
                    <div className="ml-6 mt-3 bg-white p-4 rounded border max-h-96 overflow-y-auto">
                        {/* 20校制限の警告メッセージ */}
                        {selectedUniversities.length >= 20 && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center">
                                <div className="w-4 h-4 border border-red-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                    <span className="text-red-600 text-xs">!</span>
                                </div>
                                <span className="text-sm text-red-700">
                                    エリア選択時は20校までしか選択できません。現在の選択数: {selectedUniversities.length}校
                                </span>
                            </div>
                        )}
                        {Object.entries(universitiesBySubregion).map(([region, universities]) => {
                            const allRegionSelected = universities.every((u) =>
                                selectedUniversities.includes(u)
                            );

                            return (
                                <div key={region} className="mb-4">
                                    <div className="font-medium mb-2 flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={allRegionSelected}
                                            onChange={() => handleToggleRegion(region, universities)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">{region}</span>
                                    </div>
                                    <div className="ml-6 grid grid-cols-3 gap-x-4 gap-y-1">
                                        {universities.map((univ) => {
                                            const isSelected = selectedUniversities.includes(univ);
                                            const isDisabled = !isSelected && selectedUniversities.length >= 20;
                                            return (
                                                <label key={univ} className={`flex items-center space-x-2 text-xs ${isDisabled ? 'text-gray-400' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleUniversity(univ)}
                                                        disabled={isDisabled}
                                                        className="w-3 h-3"
                                                    />
                                                    <span>{univ}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 選択された大学数 */}
            <div className="mt-6 pt-4 border-t border-gray-300">
                <p className="text-sm font-medium">
                    選択された大学: {selectedUniversities.length}校
                    {selectionMode === 'regions' && (
                        <span className="ml-2 text-green-600">
                            （20校まであと{Math.max(0, 20 - selectedUniversities.length)}校）
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}



