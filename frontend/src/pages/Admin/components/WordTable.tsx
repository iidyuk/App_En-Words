import type { Word } from "../../../types/word";
import type { QuizStat } from "../../../hooks/useQuizStats";

const formatCount = (count: number | undefined) =>
	typeof count === "number" ? count : 0;

type Props = {
	words: Word[];
	stats?: QuizStat[];
};

export function WordTable({ words, stats = [] }: Props) {
	const statMap = new Map(stats.map((s) => [s.wordId, s]));

	return (
		<div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
			<table className="min-w-full text-left text-sm">
				<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
					<tr>
						<th className="px-4 py-2">英単語</th>
						<th className="px-4 py-2">日本語</th>
						<th className="px-4 py-2 text-right">正解</th>
						<th className="px-4 py-2 text-right">不正解</th>
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
							<td className="px-4 py-3 text-right text-emerald-700">
								{formatCount(statMap.get(word.id)?.correct)}
							</td>
							<td className="px-4 py-3 text-right text-rose-700">
								{formatCount(statMap.get(word.id)?.incorrect)}
							</td>
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
