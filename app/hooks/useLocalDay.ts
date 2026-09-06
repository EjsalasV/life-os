import { useEffect, useState } from "react";
import { getTodayKey } from "@/app/utils/helpers";

export function useLocalDay() {
  const [day, setDay] = useState(() => getTodayKey());
  useEffect(() => {
    const update = () => setDay(getTodayKey());
    const timer = setInterval(update, 30_000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => { clearInterval(timer); window.removeEventListener("focus", update); document.removeEventListener("visibilitychange", update); };
  }, []);
  return day;
}
