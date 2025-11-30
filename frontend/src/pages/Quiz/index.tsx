import { OptionButton } from "./components/OptionButton";
import { useQuizSession } from "../../providers/QuizSessionProvider";

export function QuizPage() {
	const {
		quiz,
		choose,
		next,
		status,
		start,
		stop,
		groupOptions,
		selectedGroupId,
		setSelectedGroupId,
		isLoading,
		error,
		fetchWords,
	} = useQuizSession();

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

			{!isLoading && !error && status !== "in_progress" && (
				<div className="space-y-4">
					<div>
						<label className="text-sm text-slate-600">出題グループ</label>
						<select
							className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
							value={selectedGroupId}
							onChange={(e) => setSelectedGroupId(e.target.value)}
						>
							<option value="all">すべて</option>
							{groupOptions.map((group) => (
								<option key={group.id} value={group.id}>
									{group.name}（{group.count}）
								</option>
							))}
						</select>
					</div>
					<button
						type="button"
						onClick={() => start()}
						className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
						disabled={isLoading}
					>
						スタート
					</button>
					{!groupOptions.length && (
						<p className="text-center text-sm text-slate-500">
							表示できるグループがありません。
						</p>
					)}
				</div>
			)}

			{status === "in_progress" && quiz && (
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

					<button
						type="button"
						onClick={() => stop()}
						className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
					>
						中断する
					</button>
				</>
			)}
		</div>
	);
}
