import { useWords } from "../../hooks/useWords";

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

			{!isLoading && !error && (
				<div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
					<table className="min-w-full text-left text-sm">
						<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
							<tr>
								<th className="px-4 py-2">英単語</th>
								<th className="px-4 py-2">日本語</th>
							</tr>
						</thead>
						<tbody>
							{words.map((word) => (
								<tr
									key={word.id}
									className="border-t border-slate-100 hover:bg-slate-50"
								>
									<td className="px-4 py-3 font-semibold text-slate-900">
										{word.term}
									</td>
									<td className="px-4 py-3 text-slate-700">{word.meaning}</td>
								</tr>
							))}
						</tbody>
					</table>

					{!words.length && (
						<p className="px-4 py-6 text-center text-sm text-slate-500">
							まだ単語がありません。
						</p>
					)}
				</div>
			)}
		</div>
	);
}
