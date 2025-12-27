import Link from "next/link";
import styles from "./page.module.css";

type JobMeta = {
  ref?: string;
  position?: string;
  employer?: string;
  url?: string;
  type?: "image" | "text" | null;
  files?: string[];
};

type JobView = JobMeta & {
  textSnippet?: string;
  imageFile?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const loadJobs = async (): Promise<JobView[]> => {
  try {
    const res = await fetch(`${API_BASE}/jobs`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
    return jobs as JobView[];
  } catch {
    return [];
  }
};

export default async function JobsPage() {
  const jobs = await loadJobs();
  const imageAds = jobs.filter((job) => job.imageFile);
  const textAds = jobs.filter((job) => !job.imageFile);

  const renderList = (items: JobView[]) => (
    <div className={styles.list}>
      {items.map((job, index) => (
        <article key={`${job.ref ?? "job"}-${index}`} className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.jobTitle}>{job.position ?? "Untitled role"}</h2>
              <p className={styles.employer}>{job.employer ?? "Unknown employer"}</p>
            </div>
            <span className={styles.refBadge}>{job.ref ?? "No ref"}</span>
          </div>

          {job.imageFile ? (
            <img
              className={styles.imagePreview}
              src={`${API_BASE}/jobs/file?name=${encodeURIComponent(job.imageFile)}`}
              alt={job.position ?? "Job ad"}
            />
          ) : null}

          {job.textSnippet ? <p className={styles.textSnippet}>{job.textSnippet}</p> : null}

          <div className={styles.cardFooter}>
            {job.url ? (
              <a className={styles.link} href={job.url} target="_blank" rel="noreferrer">
                View on TopJobs
              </a>
            ) : (
              <span className={styles.muted}>No external link</span>
            )}

            {job.files && job.files.length > 0 ? (
              <div className={styles.files}>
                {job.files.map((file) => (
                  <a
                    key={file}
                    className={styles.fileLink}
                    href={`${API_BASE}/jobs/file?name=${encodeURIComponent(file)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {file}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Jobs</h1>
        <p className={styles.lead}>Browse the latest scraped ads.</p>
      </header>

      {jobs.length === 0 ? (
        <section className={styles.listIntro}>
          <p>
            No ads found. Run the scraper to generate{" "}
            <code className={styles.inlineCode}>scr_output/topjobs_ads/metadata.json</code> and
            refresh this page.
          </p>
        </section>
      ) : (
        <>
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Text ads</h2>
              <p className={styles.sectionHint}>
                {textAds.length} {textAds.length === 1 ? "item" : "items"}
              </p>
            </div>
            {textAds.length === 0 ? (
              <p className={styles.muted}>No text ads available.</p>
            ) : (
              renderList(textAds)
            )}
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Image ads</h2>
              <p className={styles.sectionHint}>
                {imageAds.length} {imageAds.length === 1 ? "item" : "items"}
              </p>
            </div>
            {imageAds.length === 0 ? (
              <p className={styles.muted}>No image ads available.</p>
            ) : (
              renderList(imageAds)
            )}
          </section>
        </>
      )}

      <div className={styles.actions}>
        <Link href="/profile" className={styles.cta}>
          Go to Profile
        </Link>
      </div>
    </div>
  );
}
