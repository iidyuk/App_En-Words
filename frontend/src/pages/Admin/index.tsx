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

	return (
		<div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-sm text-slate-500">登録語彙</p>
					<p className="text-2xl font-bold text-slate-900">{total} words</p>
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

			{(isLoading || isLoadingStats) && (
				<p className="mt-6 text-sm text-slate-500">読込中…</p>
			)}
			{(error || statsError) && (
				<p className="mt-6 text-sm text-rose-700">
					読み込みに失敗しました: {error || statsError}
				</p>
			)}

			{!isLoading && !error && !isLoadingStats && !statsError && (
				<WordTable words={words} stats={stats} />
			)}
		</div>
	);
}
