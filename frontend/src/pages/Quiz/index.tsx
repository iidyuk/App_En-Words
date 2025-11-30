import { useState } from "react";
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
		progress,
		checkedSet,
		toggleCheck,
	} = useQuizSession();
	const [showStopConfirm, setShowStopConfirm] = useState(false);

	const cancelStop = () => setShowStopConfirm(false);

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
					<div className="mb-2 flex justify-end">
						{progress && (
							<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
								{progress.current}/{progress.total}
							</span>
						)}
					</div>
					<p className="text-sm text-slate-500">単語</p>
					<p className="mt-1 text-center text-4xl font-bold text-slate-900">
						{quiz.word.term}
					</p>
					<div className="mt-2 flex justify-center">
						<label className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
							<input
								type="checkbox"
								className="h-4 w-4"
								checked={checkedSet.has(quiz.word.id)}
								onChange={(e) => toggleCheck(quiz.word.id, e.target.checked)}
							/>
							チェックする
						</label>
					</div>

					<div className="mt-10 grid gap-3 md:grid-cols-[2fr_1fr]">
						<div className="space-y-3">
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
						<div className="flex flex-col">
							<button
								type="button"
								onClick={next}
								disabled={quiz.status === "idle"}
								className={`h-full min-h-12 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold transition ${
									quiz.status === "idle"
										? "cursor-not-allowed bg-slate-100 text-slate-400"
										: "bg-slate-900 text-white hover:bg-slate-800"
								}`}
							>
								次の問題へ
							</button>
						</div>
					</div>

					{quiz.status === "correct" && (
						<p className="mt-4 text-emerald-600">正解！</p>
					)}

					{quiz.status === "incorrect" && <p className="mt-4">不正解…</p>}

					<button
						type="button"
						onClick={() => setShowStopConfirm(true)}
						className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
					>
						中断する
					</button>
				</>
			)}

			{showStopConfirm && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
					onClick={cancelStop}
				>
					<div
						className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200"
						onClick={(e) => e.stopPropagation()}
					>
						<p className="text-sm font-semibold text-slate-900">
							結果を記録しますか？
						</p>
						<p className="mt-2 text-sm text-slate-600">
							「はい」で結果を保存し、「いいえ」で保存せずに中断します。
							キャンセルまたは背景クリックで中断せずに続行します。
						</p>
						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => {
									setShowStopConfirm(false);
									stop(false);
								}}
								className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
							>
								いいえ
							</button>
							<button
								type="button"
								onClick={() => {
									setShowStopConfirm(false);
									stop(true);
								}}
								className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
							>
								はい
							</button>
							<button
								type="button"
								onClick={() => {
									cancelStop();
								}}
								className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
							>
								キャンセル
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
