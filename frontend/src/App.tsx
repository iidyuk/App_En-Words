import { useCallback, useEffect, useState } from "react";

type Word = {
	id: string;
	term: string;
	meaning: string;
};

type Option = {
	id: string;
	text: string;
	isCorrect: boolean;
};

type QuizState = {
	word: Word;
	options: Option[];
	status: "idle" | "correct" | "incorrect";
	selectedId: string | null;
};

type ApiWord = {
	id: number | string | null;
	wordEn: string;
	jpTranslations?: { wordJp: string }[];
};

const pickRandomWord = (words: Word[]) =>
	words[Math.floor(Math.random() * words.length)];

const createOptions = (word: Word, words: Word[]): Option[] => {
	const distractors = words
		.filter((item) => item.id !== word.id)
		.sort(() => Math.random() - 0.5)
		.slice(0, 3);

	const candidates = [...distractors, word].map((entry) => ({
		id: entry.id,
		text: entry.meaning,
		isCorrect: entry.id === word.id,
	}));

	return candidates.sort(() => Math.random() - 0.5);
};

const createQuiz = (words: Word[]): QuizState => {
	const word = pickRandomWord(words);
	return {
		word,
		options: createOptions(word, words),
		status: "idle",
		selectedId: null,
	};
};

function useQuiz(words: Word[]) {
	const [quiz, setQuiz] = useState<QuizState | null>(null);

	useEffect(() => {
		if (!words.length) {
			setQuiz(null);
			return;
		}
		setQuiz(createQuiz(words));
	}, [words]);

	const choose = (option: Option) => {
		setQuiz((prev) => {
			if (!prev || prev.status !== "idle") {
				return prev;
			}

			return {
				...prev,
				status: option.isCorrect ? "correct" : "incorrect",
				selectedId: option.id,
			};
		});
	};

	const next = () => {
		if (!words.length) {
			return;
		}
		setQuiz(createQuiz(words));
	};

	return { quiz, choose, next };
}

function App() {
	const [words, setWords] = useState<Word[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { quiz, choose, next } = useQuiz(words);

	const fetchWords = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
			const endpoint = apiBase ? `${apiBase}/words` : "/words";
			const response = await fetch(endpoint);

			if (!response.ok) {
				throw new Error(`Failed to load words (${response.status})`);
			}

			const payload = (await response.json()) as {
				words?: ApiWord[];
			};

			const mapped = (payload.words ?? [])
				.map((word) => {
					if (!word?.wordEn) {
						return null;
					}

					const meaning = word.jpTranslations?.[0]?.wordJp;

					if (!meaning) {
						return null;
					}

					return {
						id: String(word.id ?? word.wordEn),
						term: word.wordEn,
						meaning,
					};
				})
				.filter(Boolean) as Word[];

			setWords(mapped);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "不明なエラーが発生しました";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchWords();
	}, [fetchWords]);

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
			<header className="mb-8 text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
					EN WORDS
				</p>
				{/* <h1 className="mt-3 text-2xl font-bold">英単語クイズ</h1> */}
			</header>

			<div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
				{isLoading && <p className="text-center text-sm">問題を読み込み中…</p>}

				{error && (
					<div className="space-y-3 text-center">
						<p className="text-sm text-rose-700">
							問題を読み込みできませんでした: {error}
						</p>
						<button
							type="button"
							onClick={() => void fetchWords()}
							className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
						>
							再読み込み
						</button>
					</div>
				)}

				{!isLoading && !error && !quiz && (
					<p className="text-center text-sm text-slate-500">
						表示できる問題がありません。
					</p>
				)}

				{quiz && (
					<>
						<p className="text-sm text-slate-500">単語</p>
						<p className="mt-1 text-center text-4xl font-bold text-slate-900">
							{quiz.word.term}
						</p>

						<div className="mt-10 space-y-3">
							{quiz.options.map((option) => {
								const disabled = quiz.status !== "idle";
								const isSelected = quiz.selectedId === option.id;
								const showCorrect =
									quiz.status === "incorrect" && option.isCorrect;

								let stateClasses = "bg-slate-100 text-slate-900";

								if (quiz.status === "correct" && isSelected) {
									stateClasses = "bg-emerald-100 text-emerald-700";
								}

								if (showCorrect) {
									stateClasses = "bg-rose-100 text-rose-700";
								}

								return (
									<button
										key={option.id}
										type="button"
										onClick={() => choose(option)}
										disabled={disabled}
										className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
											disabled ? "cursor-default" : "hover:bg-slate-200"
										} ${stateClasses}`}
									>
										{option.text}
									</button>
								);
							})}
						</div>

						{quiz.status === "correct" && (
							<p className="mt-4 text-emerald-600">正解！</p>
						)}

						{quiz.status === "incorrect" && (
							<p className="mt-4">不正解…</p>
						)}

						{quiz.status !== "idle" && (
							<button
								type="button"
								onClick={next}
								className="mt-4 text-sm font-semibold text-slate-900 underline"
							>
								次の問題へ
							</button>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default App;
