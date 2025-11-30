import { useWords } from "../../hooks/useWords";
import { WordTable } from "./components/WordTable";

export function AdminPage() {
	const { words, isLoading, error, fetchWords } = useWords();
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
					onClick={() => void fetchWords()}
					className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
				>
					再読み込み
				</button>
			</div>

			{isLoading && <p className="mt-6 text-sm text-slate-500">読込中…</p>}
			{error && (
				<p className="mt-6 text-sm text-rose-700">
					読み込みに失敗しました: {error}
				</p>
			)}

			{!isLoading && !error && <WordTable words={words} />}
		</div>
	);
}
