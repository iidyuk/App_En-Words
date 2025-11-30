import { useMemo, useState } from "react";
import { useWords } from "../../hooks/useWords";
import { useQuizStats } from "../../hooks/useQuizStats";
import { WordTable } from "./components/WordTable";

export function AdminPage() {
	const { words, isLoading, error, fetchWords } = useWords();
	const {
		stats,
		isLoading: isLoadingStats,
		error: statsError,
		fetchStats,
	} = useQuizStats();
	const total = words.length;
	const [selectedGroupId, setSelectedGroupId] = useState<string>("all");

	const groupOptions = useMemo(() => {
		const groups = new Map<string, { id: string; name: string }>();
		for (const word of words) {
			if (!word.groupId) continue;
			if (!groups.has(word.groupId)) {
				groups.set(word.groupId, {
					id: word.groupId,
					name: word.groupName ?? word.groupId,
				});
			}
		}
		return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
	}, [words]);

	const filteredWords = useMemo(() => {
		if (selectedGroupId === "all") return words;
		return words.filter((word) => word.groupId === selectedGroupId);
	}, [words, selectedGroupId]);

	const selectedGroupLabel =
		selectedGroupId === "all"
			? "すべて"
			: groupOptions.find((g) => g.id === selectedGroupId)?.name ?? selectedGroupId;

	return (
		<div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-sm text-slate-500">登録語彙</p>
					<p className="text-2xl font-bold text-slate-900">{total} words</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="text-right">
						<p className="text-xs text-slate-500">表示グループ</p>
						<select
							className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
							value={selectedGroupId}
							onChange={(e) => setSelectedGroupId(e.target.value)}
						>
							<option value="all">すべて</option>
							{groupOptions.map((group) => (
								<option key={group.id} value={group.id}>
									{group.name}
								</option>
							))}
						</select>
					</div>
					<button
						type="button"
						onClick={() => {
							void fetchWords();
							void fetchStats();
						}}
						className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
					>
						再読み込み
					</button>
				</div>
			</div>

			<p className="mt-2 text-sm text-slate-600">
				選択中: <span className="font-semibold text-slate-900">{selectedGroupLabel}</span>
			</p>

			{(isLoading || isLoadingStats) && (
				<p className="mt-6 text-sm text-slate-500">読込中…</p>
			)}
			{(error || statsError) && (
				<p className="mt-6 text-sm text-rose-700">
					読み込みに失敗しました: {error || statsError}
				</p>
			)}

			{!isLoading && !error && !isLoadingStats && !statsError && (
				<WordTable words={filteredWords} stats={stats} />
			)}
		</div>
	);
}
