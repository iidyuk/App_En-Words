import type { Word } from "../../../types/word";

type Props = {
	words: Word[];
};

export function WordTable({ words }: Props) {
	return (
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
	);
}
