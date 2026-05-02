import AppSider from "../../../components/market/app-sider";
import siderStyles from "../../../components/market/app-sider.module.css";
import AllTrendClient, { TrendEntry, TrendSummary } from "./AllTrendClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const emptySummary: TrendSummary = {
  windowDays: 0,
  snapshotCount: 0,
  latestAt: null,
  skills: { emerging: [], rising: [], declining: [], stable: [] },
  roles: { emerging: [], rising: [], declining: [], stable: [] },
};

const loadTrendData = async (): Promise<{ summary: TrendSummary; history: TrendEntry[] }> => {
  try {
    const [summaryRes, historyRes] = await Promise.all([
      fetch(`${API_BASE}/trends/all`, { cache: "no-store" }),
      fetch(`${API_BASE}/trends/all/history`, { cache: "no-store" }),
    ]);

    const summaryData = summaryRes.ok ? await summaryRes.json() : emptySummary;
    const historyData = historyRes.ok ? await historyRes.json() : {};
    const history = Array.isArray(historyData?.history) ? (historyData.history as TrendEntry[]) : [];

    return {
      summary: summaryData ?? emptySummary,
      history,
    };
  } catch {
    return { summary: emptySummary, history: [] };
  }
};

export default async function AllTrendPage() {
  const { summary, history } = await loadTrendData();

  return (
    <div className={siderStyles.siderLayout}>
      <AppSider variant="light" />
      <div className={siderStyles.siderContent}>
        <AllTrendClient summary={summary} history={history} />
      </div>
    </div>
  );
}
