import { Navigate, Route, Routes } from "react-router-dom";
import { NavLink } from "./components/NavLink";
import { AdminPage } from "./pages/Admin";
import { QuizPage } from "./pages/Quiz";
import { QuizSessionProvider } from "./providers/QuizSessionProvider";

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

			<QuizSessionProvider>
				<main className="mx-auto max-w-5xl px-4 py-10">
					<Routes>
						<Route path="/" element={<QuizPage />} />
						<Route path="/admin" element={<AdminPage />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
			</QuizSessionProvider>
		</div>
	);
}

export default App;
