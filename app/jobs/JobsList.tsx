"use client";

import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";
import Link from "next/link";
import { Button, Modal } from "antd";
import { useMemo, useState } from "react";
import styles from "./page.module.css";
import type { JobView } from "./types";

type ModalState = {
  open: boolean;
  job: JobView | null;
};

export default function JobsList({ jobs, apiBase }: { jobs: JobView[]; apiBase: string }) {
  const [modalState, setModalState] = useState<ModalState>({ open: false, job: null });
  const [query, setQuery] = useState("");
  const [minMatch, setMinMatch] = useState(0);
  const [adType, setAdType] = useState<"all" | "image" | "text">("all");

  const openModal = (job: JobView) => {
    setModalState({ open: true, job });
  };

  const closeModal = () => {
    setModalState({ open: false, job: null });
  };

  const renderChips = (items: string[], className?: string, max = 7) => {
    if (!items || items.length === 0) {
      return <span className={styles.muted}>None</span>;
    }
    const shown = items.slice(0, max);
    const extra = items.length - shown.length;
    return (
      <div className={styles.chipRow}>
        {shown.map((item, itemIndex) => (
          <span key={`${item}-${itemIndex}`} className={className ?? styles.chip}>
            {item}
          </span>
        ))}
        {extra > 0 ? <span className={styles.chipMore}>+{extra} more</span> : null}
      </div>
    );
  };

  const ranked = useMemo(() => {
    return [...jobs].sort((a, b) => (b.matchPercent ?? -1) - (a.matchPercent ?? -1));
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked.filter((job) => {
      const score = job.matchPercent ?? 0;
      const typeMatch =
        adType === "all" ? true : adType === "image" ? Boolean(job.imageFile) : !job.imageFile;
      if (!typeMatch || score < minMatch) return false;
      if (!q) return true;
      const haystack = [job.position, job.employer, ...(job.skillsFound ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [ranked, query, minMatch, adType]);

  const withScore = ranked.filter((job) => typeof job.matchPercent === "number");
  const avgMatch =
    withScore.length > 0
      ? Math.round(
          withScore.reduce((sum, job) => sum + (job.matchPercent ?? 0), 0) / withScore.length
        )
      : 0;

  const renderList = (items: JobView[]) => (
    <div className={styles.list}>
      {items.map((job, index) => (
        <article key={`${job.ref ?? "job"}-${index}`} className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.refText}>{job.ref ?? "No ref"}</p>
              <h2 className={styles.jobTitle}>{job.position ?? "Untitled role"}</h2>
              <p className={styles.employer}>{job.employer ?? "Unknown employer"}</p>
            </div>
            <div className={styles.scoreBox}>
              <strong>
                {typeof job.matchPercent === "number" ? `${Math.round(job.matchPercent)}%` : "--"}
              </strong>
              <span>match</span>
            </div>
          </div>

          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.max(0, Math.min(100, job.matchPercent ?? 0))}%` }}
            />
          </div>

          {job.imageFile ? (
            <img
              className={styles.imagePreview}
              src={`${apiBase}/jobs/file?name=${encodeURIComponent(job.imageFile)}`}
              alt={job.position ?? "Job ad"}
            />
          ) : null}

          {job.textSnippet ? <p className={styles.textSnippet}>{job.textSnippet}</p> : null}

          {job.imageFile ? (
            <div className={styles.extractedActionRow}>
              <Button type="default" size="small" onClick={() => openModal(job)}>
                View extracted text
              </Button>
            </div>
          ) : null}

          <section className={styles.skillsBlock}>
            <div className={styles.skillRow}>
              <span className={styles.skillLabel}>Extracted skills</span>
              {renderChips(job.skillsFound ?? [], styles.chipFound)}
            </div>
            <div className={styles.skillRow}>
              <span className={styles.skillLabel}>Missing skills</span>
              {renderChips(job.missingSkills ?? [], styles.chipMissing, 5)}
            </div>
            <div className={styles.skillRow}>
              <span className={styles.skillLabel}>Overlap</span>
              {renderChips(job.overlapSkills ?? [], styles.chipOverlap, 5)}
            </div>
          </section>

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
                {job.files.slice(0, 1).map((file) => (
                  <a
                    key={file}
                    className={styles.fileLink}
                    href={`${apiBase}/jobs/file?name=${encodeURIComponent(file)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {file}
                  </a>
                ))}
                {job.files.length > 1 ? (
                  <span className={styles.muted}>+{job.files.length - 1} more file(s)</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <>
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
          <section className={styles.toolbar}>
            <div className={styles.metricPill}>
              <strong>{jobs.length}</strong>
              <span>Total jobs</span>
            </div>
            <div className={styles.metricPill}>
              <strong>{avgMatch}%</strong>
              <span>Avg match</span>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
              placeholder="Search title, company, skill..."
              aria-label="Search jobs"
            />
            <select
              className={styles.select}
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              aria-label="Minimum match"
            >
              <option value={0}>All scores</option>
              <option value={40}>40%+</option>
              <option value={60}>60%+</option>
              <option value={75}>75%+</option>
            </select>
            <select
              className={styles.select}
              value={adType}
              onChange={(e) => setAdType(e.target.value as "all" | "image" | "text")}
              aria-label="Ad type"
            >
              <option value="all">All ads</option>
              <option value="text">Text only</option>
              <option value="image">Image only</option>
            </select>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Ranked jobs</h2>
              <p className={styles.sectionHint}>
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </p>
            </div>
            {filtered.length === 0 ? <p className={styles.muted}>No jobs match these filters.</p> : renderList(filtered)}
          </section>
        </>
      )}

      <div className={styles.actions}>
        <Link href="/profile" className={styles.cta}>
          Go to Profile
        </Link>
      </div>

      <Modal
        open={modalState.open}
        title={modalState.job?.position ?? "Extracted text"}
        onCancel={closeModal}
        footer={null}
        width={720}
      >
        <div className={styles.modalMeta}>
          <span className={styles.modalEmployer}>{modalState.job?.employer ?? "Unknown employer"}</span>
          <span className={styles.modalRef}>{modalState.job?.ref ?? "No ref"}</span>
        </div>
        <p className={styles.modalText}>
          {modalState.job?.extractedTextFull
            ? modalState.job.extractedTextFull
            : modalState.job?.extractedText
              ? modalState.job.extractedText
              : "No OCR text available."}
        </p>
      </Modal>
    </>
  );
}

