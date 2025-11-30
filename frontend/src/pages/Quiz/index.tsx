import { useEffect, useState } from "react";
import { useWords } from "../../hooks/useWords";
import type { Word } from "../../types/word";
import { OptionButton } from "./components/OptionButton";
import type { Option } from "./types";

type QuizState = {
	word: Word;
	options: Option[];
	status: "idle" | "correct" | "incorrect";
	selectedId: string | null;
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

export function QuizPage() {
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

							return (
								<OptionButton
									key={option.id}
									option={option}
									disabled={disabled}
									isSelected={isSelected}
									showCorrect={showCorrect}
									onChoose={choose}
								/>
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
