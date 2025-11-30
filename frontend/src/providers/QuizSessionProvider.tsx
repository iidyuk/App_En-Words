import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import type { Word } from "../types/word";
import { useWords } from "../hooks/useWords";

type QuizStatus = "idle" | "in_progress" | "completed" | "stopped";

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

type QuizSessionContextValue = {
	words: Word[];
	isLoading: boolean;
	error: string | null;
	fetchWords: () => Promise<void> | void;
	groupOptions: { id: string; name: string; count: number }[];
	selectedGroupId: string;
	setSelectedGroupId: (value: string) => void;
	status: QuizStatus;
	quiz: QuizState | null;
	start: () => void;
	choose: (option: Option) => void;
	next: () => void;
	stop: () => void;
};

const QuizSessionContext = createContext<QuizSessionContextValue | null>(null);

const shuffle = <T,>(items: T[]) =>
	[...items].sort(() => Math.random() - 0.5);

const createOptions = (word: Word, words: Word[]): Option[] => {
	const distractors = shuffle(
		words.filter((item) => item.id !== word.id),
	).slice(0, 3);

	const candidates = [...distractors, word].map((entry) => ({
		id: entry.id,
		text: entry.meaning,
		isCorrect: entry.id === word.id,
	}));

	return shuffle(candidates);
};

export function QuizSessionProvider({ children }: { children: ReactNode }) {
	const { words, isLoading, error, fetchWords } = useWords();
	const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
	const [status, setStatus] = useState<QuizStatus>("idle");
	const [activePool, setActivePool] = useState<Word[]>([]);
	const [, setDeck] = useState<Word[]>([]);
	const [quiz, setQuiz] = useState<QuizState | null>(null);

	const groupOptions = useMemo(() => {
		const groups = new Map<string, { id: string; name: string; count: number }>();
		for (const word of words) {
			if (!word.groupId) continue;
			const current = groups.get(word.groupId);
			if (current) {
				current.count += 1;
			} else {
				groups.set(word.groupId, {
					id: word.groupId,
					name: word.groupName ?? word.groupId,
					count: 1,
				});
			}
		}
		return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
	}, [words]);

	const filteredWords = useMemo(() => {
		if (selectedGroupId === "all") return words;
		return words.filter((word) => word.groupId === selectedGroupId);
	}, [words, selectedGroupId]);

	const start = useCallback(() => {
		if (!filteredWords.length) {
			setStatus("completed");
			setQuiz(null);
			setDeck([]);
			setActivePool([]);
			return;
		}

		const shuffled = shuffle(filteredWords);
		const [first, ...rest] = shuffled;

		setActivePool(shuffled);
		setDeck(rest);
		setQuiz({
			word: first,
			options: createOptions(first, shuffled),
			status: "idle",
			selectedId: null,
		});
		setStatus("in_progress");
	}, [filteredWords]);

	const choose = useCallback((option: Option) => {
		setQuiz((prev) => {
			if (!prev || status !== "in_progress") return prev;
			if (prev.status !== "idle") return prev;
			return {
				...prev,
				status: option.isCorrect ? "correct" : "incorrect",
				selectedId: option.id,
			};
		});
	}, [status]);

	const next = useCallback(() => {
		setDeck((prevDeck) => {
			if (prevDeck.length === 0) {
				setQuiz(null);
				setStatus("completed");
				return [];
			}

			const [nextWord, ...rest] = prevDeck;
			setQuiz({
				word: nextWord,
				options: createOptions(nextWord, activePool.length ? activePool : prevDeck),
				status: "idle",
				selectedId: null,
			});
			return rest;
		});
	}, [activePool]);

	const stop = useCallback(() => {
		setStatus("stopped");
		setQuiz(null);
		setDeck([]);
		setActivePool([]);
	}, []);

	const value = useMemo(
		() => ({
			words,
			isLoading,
			error,
			fetchWords,
			groupOptions,
			selectedGroupId,
			setSelectedGroupId,
			status,
			quiz,
			start,
			choose,
			next,
			stop,
		}),
		[
			words,
			isLoading,
			error,
			fetchWords,
			groupOptions,
			selectedGroupId,
			status,
			quiz,
			start,
			choose,
			next,
			stop,
		],
	);

	return (
		<QuizSessionContext.Provider value={value}>
			{children}
		</QuizSessionContext.Provider>
	);
}

export const useQuizSession = () => {
	const context = useContext(QuizSessionContext);
	if (!context) {
		throw new Error("useQuizSession must be used within QuizSessionProvider");
	}
	return context;
};
