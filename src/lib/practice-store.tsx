import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { practices, type ChecklistPhase, type Practice } from "@/data/practices";

type Store = {
  practice: Practice;
  practices: Practice[];
  setPracticeId: (id: string) => void;
  rate: number;
  setRate: (rate: number) => void;
  goal: number;
  setGoal: (goal: number) => void;
  phases: ChecklistPhase[];
  toggleItem: (phaseId: string, itemId: string) => void;
};

const PracticeContext = createContext<Store | null>(null);

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [practiceId, setId] = useState(practices[0]!.id);
  const [rates, setRates] = useState<Record<string, number>>(() =>
    Object.fromEntries(practices.map((p) => [p.id, p.defaultRate])),
  );
  const [goals, setGoals] = useState<Record<string, number>>(() =>
    Object.fromEntries(practices.map((p) => [p.id, p.revenueGoal])),
  );
  const [checklists, setChecklists] = useState<Record<string, ChecklistPhase[]>>(() =>
    Object.fromEntries(
      practices.map((p) => [
        p.id,
        p.onboarding.map((phase) => ({ ...phase, items: phase.items.map((i) => ({ ...i })) })),
      ]),
    ),
  );

  const practice = practices.find((p) => p.id === practiceId) ?? practices[0]!;

  const setPracticeId = useCallback((id: string) => setId(id), []);
  const setRate = useCallback(
    (rate: number) => setRates((prev) => ({ ...prev, [practiceId]: rate })),
    [practiceId],
  );
  const setGoal = useCallback(
    (goal: number) => setGoals((prev) => ({ ...prev, [practiceId]: goal })),
    [practiceId],
  );
  const toggleItem = useCallback(
    (phaseId: string, itemId: string) =>
      setChecklists((prev) => ({
        ...prev,
        [practiceId]: (prev[practiceId] ?? []).map((phase) =>
          phase.id !== phaseId
            ? phase
            : {
                ...phase,
                items: phase.items.map((item) =>
                  item.id !== itemId
                    ? item
                    : {
                        ...item,
                        done: !item.done,
                        completedOn: !item.done ? "Just now" : undefined,
                      },
                ),
              },
        ),
      })),
    [practiceId],
  );

  const value = useMemo<Store>(
    () => ({
      practice,
      practices,
      setPracticeId,
      rate: rates[practiceId] ?? practice.defaultRate,
      setRate,
      goal: goals[practiceId] ?? practice.revenueGoal,
      setGoal,
      phases: checklists[practiceId] ?? [],
      toggleItem,
    }),
    [practice, practiceId, rates, goals, checklists, setPracticeId, setRate, setGoal, toggleItem],
  );

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

export function usePractice() {
  const ctx = useContext(PracticeContext);
  if (!ctx) throw new Error("usePractice must be used inside PracticeProvider");
  return ctx;
}

export function phaseStatus(phase: ChecklistPhase) {
  const done = phase.items.filter((i) => i.done).length;
  const total = phase.items.length;
  const ratio = total === 0 ? 1 : done / total;
  const status: "green" | "amber" | "red" = ratio === 1 ? "green" : ratio >= 0.5 ? "amber" : "red";
  return { done, total, ratio, status };
}
