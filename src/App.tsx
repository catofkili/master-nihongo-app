import { ReactNode, useState } from "react";
import { BookMarked, Brain, Home, LibraryBig, Moon, RotateCcw, Scale, Sun } from "lucide-react";
import { Dashboard } from "./pages/Dashboard";
import { Library } from "./pages/Library";
import { GrammarDetail } from "./pages/GrammarDetail";
import { QuizPage } from "./pages/QuizPage";
import { ReviewPage } from "./pages/ReviewPage";
import { MistakeBook } from "./pages/MistakeBook";
import { ComparisonPage } from "./pages/ComparisonPage";
import { useStudyStore } from "./hooks/useStudyStore";

type Page = "dashboard" | "library" | "detail" | "quiz" | "review" | "mistakes" | "comparison";

const navItems: { page: Page; label: string; icon: ReactNode }[] = [
  { page: "dashboard", label: "Dashboard", icon: <Home size={17} /> },
  { page: "library", label: "Library", icon: <LibraryBig size={17} /> },
  { page: "quiz", label: "Quiz", icon: <Brain size={17} /> },
  { page: "review", label: "Review", icon: <RotateCcw size={17} /> },
  { page: "mistakes", label: "Mistakes", icon: <BookMarked size={17} /> },
  { page: "comparison", label: "Compare", icon: <Scale size={17} /> }
];

export default function App() {
  const store = useStudyStore();
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedGrammarId, setSelectedGrammarId] = useState("wa");
  const [notice, setNotice] = useState("");

  const openGrammar = (id: string) => {
    setSelectedGrammarId(id);
    setPage("detail");
  };

  const addMistake = (
    grammarId: string,
    questionId: string,
    prompt: string,
    userAnswer: string,
    correctAnswer: string,
    explanation: string
  ) => {
    store.addMistake({ grammarId, questionId, prompt, userAnswer, correctAnswer, explanation });
    store.addToReview(grammarId);
  };

  const markLearnedWithNotice = (id: string) => {
    store.markLearned(id);
    setNotice("已标记为掌握，并保存到本地进度。");
    window.setTimeout(() => setNotice(""), 1800);
  };

  const renderPage = () => {
    if (page === "dashboard") {
      return (
        <Dashboard
          reviewCount={store.dueReviews.length}
          mistakeCount={store.mistakes.length}
          levelProgress={store.levelProgress}
          getMastery={store.getMastery}
          onOpenGrammar={openGrammar}
          onMarkLearned={markLearnedWithNotice}
          onStartSession={() => setPage("review")}
        />
      );
    }
    if (page === "library") {
      return <Library getMastery={store.getMastery} onOpenGrammar={openGrammar} onMarkLearned={markLearnedWithNotice} />;
    }
    if (page === "detail") {
      return (
        <GrammarDetail
          grammarId={selectedGrammarId}
          getMastery={store.getMastery}
          onBack={() => setPage("library")}
          onPractice={() => setPage("quiz")}
          onLearned={markLearnedWithNotice}
          onReview={store.addToReview}
          onMistake={addMistake}
        />
      );
    }
    if (page === "quiz") {
      return <QuizPage onMistake={addMistake} />;
    }
    if (page === "review") {
      return (
        <ReviewPage
          dueReviews={store.dueReviews}
          onReviewResult={store.recordReview}
          onMistake={addMistake}
        />
      );
    }
    if (page === "mistakes") {
      return <MistakeBook mistakes={store.mistakes} onRemove={store.removeMistake} />;
    }
    return <ComparisonPage />;
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-100/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            onClick={() => setPage("dashboard")}
            className="focus-ring flex items-center gap-3 rounded-md text-left"
          >
            <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-600 font-bold text-white">
              文
            </span>
            <span>
              <span className="block font-bold text-stone-950 dark:text-zinc-50">Grammar Trainer</span>
              <span className="block text-xs text-stone-500 dark:text-zinc-400">small daily Japanese reps</span>
            </span>
          </button>
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                  page === item.page
                    ? "bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                    : "text-stone-600 hover:bg-stone-200 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={() => store.setDarkMode(!store.darkMode)}
              className="focus-ring inline-flex shrink-0 items-center justify-center rounded-md px-3 py-2 text-stone-600 hover:bg-stone-200 dark:text-zinc-300 dark:hover:bg-zinc-900"
              title="Toggle dark mode"
            >
              {store.darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{renderPage()}</main>
      {notice && (
        <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {notice}
        </div>
      )}
    </div>
  );
}
