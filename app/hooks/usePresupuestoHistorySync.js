"use client";
import { useEffect, useState } from "react";
import { syncBudgetHistory } from "@/modules/finance/services/budgetHistoryService";
import { useLocalDay } from "./useLocalDay";

export default function usePresupuestoHistorySync(budgets, _movements, user) {
  const month = useLocalDay().slice(0, 7);
  const ids = (budgets || []).map((b) => b.presupuestoId).filter(Boolean).sort().join(",");
  const [isSynced, setIsSynced] = useState(false);
  useEffect(() => {
    if (!user?.uid || !ids) return;
    let active = true;
    Promise.all(ids.split(",").map((id) => syncBudgetHistory(user.uid, id)))
      .then(() => { if (active) setIsSynced(true); })
      .catch(() => { if (active) setIsSynced(false); });
    return () => { active = false; };
  }, [user?.uid, ids, month]);
  return { isSynced };
}
