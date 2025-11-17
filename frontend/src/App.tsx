import { useMemo, useState } from "react";

type Word = {
	id: number;
	term: string;
	meaning: string;
	example: string;
	level: "basic" | "intermediate" | "advanced";
};

const WORDS: Word[] = [
	{
		id: 1,
		term: "resilient",
		meaning: "困難な状況から素早く回復する、タフな",
		example: "She remained resilient despite the repeated setbacks.",
		level: "advanced",
	},
	{
		id: 2,
		term: "ingenuity",
		meaning: "創意工夫、独創性",
		example: "The engineer's ingenuity led to a more efficient design.",
		level: "advanced",
	},
	{
		id: 3,
		term: "curiosity",
		meaning: "好奇心、知りたいという欲求",
		example: "Children often learn the fastest because of their curiosity.",
		level: "basic",
	},
	{
		id: 4,
		term: "comprehensive",
		meaning: "包括的な、広範囲にわたる",
		example: "We conducted a comprehensive review of the vocabulary list.",
		level: "intermediate",
	},
	{
		id: 5,
		term: "refine",
		meaning: "洗練する、磨きをかける",
		example: "Let's refine the study plan for better results.",
		level: "intermediate",
	},
];

const levelLabel: Record<Word["level"], string> = {
	basic: "基礎",
	intermediate: "応用",
	advanced: "上級",
};

function App() {
	const [query, setQuery] = useState("");

	const filteredWords = useMemo(() => {
		const normalized = query.toLowerCase().trim();
		if (!normalized) {
			return WORDS;
		}

		return WORDS.filter((word) =>
			[word.term, word.meaning, word.example]
				.join(" ")
				.toLowerCase()
				.includes(normalized),
		);
	}, [query]);

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
			<div className="mx-auto max-w-4xl">
				<header className="mb-10 text-center">
					<p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
						EN WORDS
					</p>
					<h1 className="mt-3 text-4xl font-bold text-brand-900">
						英単語コレクション
					</h1>
					<p className="mt-4 text-base text-slate-500">
						Tailwind CSS
						のユーティリティを使って、ボキャブラリー学習に便利なリストを素早く整えました。
					</p>
				</header>

				<section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
					<label
						htmlFor="word-query"
						className="text-sm font-medium text-slate-600"
					>
						単語を検索
					</label>
					<input
						id="word-query"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="例) resi, 工夫, review ..."
						className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
					/>
					<p className="mt-2 text-xs text-slate-400">
						英単語・日本語・例文から部分一致で検索できます。
					</p>
				</section>

				<section className="space-y-4">
					{filteredWords.map((word) => (
						<article
							key={word.id}
							className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
						>
							<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
								<div>
									<h2 className="text-2xl font-semibold text-brand-700">
										{word.term}
									</h2>
									<p className="mt-1 text-slate-600">{word.meaning}</p>
								</div>
								<span className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1 text-sm font-semibold text-brand-600">
									{levelLabel[word.level]}
								</span>
							</div>
							<p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
								{word.example}
							</p>
						</article>
					))}

					{filteredWords.length === 0 && (
						<div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-100">
							検索条件に一致する単語がありません。別のキーワードを試してみてください。
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

export default App;
