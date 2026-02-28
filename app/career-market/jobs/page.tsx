import styles from "./page.module.css";
import JobsList from "./JobsList";
import type { JobView } from "./types";

type RankedJob = {
  ref?: string;
  skills_found?: string[];
  overlap?: string[];
  missing?: string[];
  match_percent?: number;
  job_skill_count?: number;
  user_skill_count?: number;
  text_excerpt?: string;
  text_full?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const loadJobs = async (): Promise<JobView[]> => {
  try {
    const [jobsRes, rankedRes] = await Promise.all([
      fetch(`${API_BASE}/jobs`, { cache: "no-store" }),
      fetch(`${API_BASE}/ranked`, { cache: "no-store" }),
    ]);

    if (!jobsRes.ok) return [];
    const jobsData = await jobsRes.json();
    const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : [];

    const rankedData = rankedRes.ok ? await rankedRes.json() : {};
    const ranked = Array.isArray(rankedData?.ranked) ? (rankedData.ranked as RankedJob[]) : [];
    const rankedMap = new Map(
      ranked
        .map((job) => [String(job.ref ?? ""), job] as const)
        .filter(([key]) => key.length > 0)
    );

    return (jobs as JobView[]).map((job) => {
      const refKey = String(job.ref ?? "");
      const rankedJob = refKey ? rankedMap.get(refKey) : undefined;
      return {
        ...job,
        skillsFound: rankedJob?.skills_found ?? [],
        overlapSkills: rankedJob?.overlap ?? [],
        missingSkills: rankedJob?.missing ?? [],
        matchPercent: rankedJob?.match_percent,
        jobSkillCount: rankedJob?.job_skill_count,
        userSkillCount: rankedJob?.user_skill_count,
        extractedText: rankedJob?.text_excerpt ?? "",
        extractedTextFull: rankedJob?.text_full ?? "",
      };
    });
  } catch {
    return [];
  }
};

export default async function JobsPage() {
  const jobs = await loadJobs();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Jobs</h1>
        <p className={styles.lead}>Browse the latest scraped ads.</p>
      </header>
      <JobsList jobs={jobs} apiBase={API_BASE} />
    </div>
  );
}
