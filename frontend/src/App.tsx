import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";

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

function useWords() {
	const [words, setWords] = useState<Word[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

	return { words, isLoading, error, fetchWords };
}

function NavLink({ to, label }: { to: string; label: string }) {
	const location = useLocation();
	const isActive = useMemo(() => {
		if (to === "/") {
			return location.pathname === "/";
		}
		return location.pathname.startsWith(to);
	}, [location.pathname, to]);

	return (
		<Link
			to={to}
			className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
				isActive
					? "bg-slate-900 text-white"
					: "text-slate-700 hover:bg-slate-200"
			}`}
		>
			{label}
		</Link>
	);
}

function QuizPage() {
	const { words, isLoading, error, fetchWords } = useWords();
	const { quiz, choose, next } = useQuiz(words);

	return (
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

					{quiz.status === "incorrect" && <p className="mt-4">不正解…</p>}

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
	);
}

function AdminPage() {
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

function App() {
	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<header className="border-b border-slate-200 bg-white/80 backdrop-blur">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
							EN WORDS
						</p>
						<p className="text-sm font-semibold text-slate-900">
							Vocabulary Trainer
						</p>
					</div>
					<nav className="flex items-center gap-2">
						<NavLink to="/" label="クイズ" />
						<NavLink to="/admin" label="管理" />
					</nav>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-4 py-10">
				<Routes>
					<Route path="/" element={<QuizPage />} />
					<Route path="/admin" element={<AdminPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;
