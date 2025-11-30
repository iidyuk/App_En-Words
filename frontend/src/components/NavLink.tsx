import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

type Props = {
	to: string;
	label: string;
};

export function NavLink({ to, label }: Props) {
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
