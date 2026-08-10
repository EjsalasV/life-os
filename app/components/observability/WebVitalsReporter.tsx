"use client";

import { useReportWebVitals } from "next/web-vitals";
import { reportWebVital } from "@/services/observability/reporter";

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => reportWebVital(metric as unknown as Record<string, unknown>));
  return null;
}
