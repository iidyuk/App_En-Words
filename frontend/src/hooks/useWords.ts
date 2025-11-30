import { useCallback, useEffect, useState } from "react";
import type { Word } from "../types/word";

type ApiWord = {
	id: number | string | null;
	wordEn: string;
	jpTranslations?: { wordJp: string }[];
	wordGroup?: {
		id: number | string | null;
		name: string | null;
	};
	checked?: boolean;
};

export function useWords() {
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
						groupId: word.wordGroup?.id
							? String(word.wordGroup.id)
							: undefined,
						groupName: word.wordGroup?.name ?? undefined,
						checked: Boolean(word.checked),
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
