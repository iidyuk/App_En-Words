import { useMemo, useState } from "react";

type Word = {
	id: number;
	term: string;
	meaning: string;
};

const WORDS: Word[] = [
	{ id: 1, term: "resilient", meaning: "困難な状況から素早く回復する、タフな" },
	{ id: 2, term: "ingenuity", meaning: "創意工夫、独創性" },
	{ id: 3, term: "curiosity", meaning: "好奇心、知りたいという欲求" },
	{ id: 4, term: "comprehensive", meaning: "包括的な、広範囲にわたる" },
	{ id: 5, term: "refine", meaning: "洗練する、磨きをかける" },
	{ id: 6, term: "versatile", meaning: "多才な、多用途の" },
];

type Option = {
	id: number;
	text: string;
	isCorrect: boolean;
};

type QuizState = {
	word: Word;
	options: Option[];
	status: "idle" | "correct" | "incorrect";
	selectedId: number | null;
};

const getRandomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

const createOptions = (word: Word): Option[] => {
	const distractors = WORDS.filter((item) => item.id !== word.id)
		.sort(() => Math.random() - 0.5)
		.slice(0, 3);

	const candidates = [...distractors, word].map((entry) => ({
		id: entry.id,
		text: entry.meaning,
		isCorrect: entry.id === word.id,
	}));

	return candidates.sort(() => Math.random() - 0.5);
};

function useQuiz() {
	const initialQuiz = useMemo<QuizState>(() => {
		const word = getRandomWord();
		return {
			word,
			options: createOptions(word),
			status: "idle",
			selectedId: null,
		};
	}, []);

	const [quiz, setQuiz] = useState<QuizState>(initialQuiz);

	const choose = (option: Option) => {
		if (quiz.status !== "idle") {
			return;
		}

		setQuiz((prev) => ({
			...prev,
			status: option.isCorrect ? "correct" : "incorrect",
			selectedId: option.id,
		}));
	};

	const next = () => {
		const word = getRandomWord();
		setQuiz({
			word,
			options: createOptions(word),
			status: "idle",
			selectedId: null,
		});
	};

	return { quiz, choose, next };
}

function App() {
	const { quiz, choose, next } = useQuiz();

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
			<header className="mb-8 text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
					EN WORDS
				</p>
				{/* <h1 className="mt-3 text-2xl font-bold">英単語クイズ</h1> */}
			</header>

			<div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
				<p className="text-sm text-slate-500">単語</p>
				<p className="mt-1 text-center text-4xl font-bold text-slate-900">
					{quiz.word.term}
				</p>

				<div className="mt-10 space-y-3">
					{quiz.options.map((option) => {
						const disabled = quiz.status !== "idle";
						const isSelected = quiz.selectedId === option.id;
						const showCorrect = quiz.status === "incorrect" && option.isCorrect;

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
						className=""
					>
						次の問題へ
					</button>
				)}
			</div>
		</div>
	);
}

export default App;
