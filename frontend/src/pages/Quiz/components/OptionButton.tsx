import type { Option } from "../types";

type Props = {
	option: Option;
	disabled: boolean;
	isSelected: boolean;
	showCorrect: boolean;
	onChoose: (option: Option) => void;
};

export function OptionButton({
	option,
	disabled,
	isSelected,
	showCorrect,
	onChoose,
}: Props) {
	let stateClasses = "bg-slate-100 text-slate-900";

	if (showCorrect) {
		stateClasses = "bg-rose-100 text-rose-700";
	}

	if (isSelected && !showCorrect) {
		stateClasses = "bg-emerald-100 text-emerald-700";
	}

	return (
		<button
			type="button"
			onClick={() => onChoose(option)}
			disabled={disabled}
			className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
				disabled ? "cursor-default" : "hover:bg-slate-200"
			} ${stateClasses}`}
		>
			{option.text}
		</button>
	);
}
