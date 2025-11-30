import { useCallback, useEffect, useState } from "react";

export type QuizStat = {
	wordId: string;
	correct: number;
	incorrect: number;
};

export function useQuizStats() {
	const [stats, setStats] = useState<QuizStat[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStats = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
			const endpoint = apiBase ? `${apiBase}/quiz-stats` : "/quiz-stats";
			const response = await fetch(endpoint);

			if (!response.ok) {
				throw new Error(`Failed to load quiz stats (${response.status})`);
			}

			const payload = (await response.json()) as { stats?: QuizStat[] };
			setStats(payload.stats ?? []);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "不明なエラーが発生しました";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchStats();
	}, [fetchStats]);

	return { stats, isLoading, error, fetchStats };
}
