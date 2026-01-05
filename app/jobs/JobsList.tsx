"use client";

import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";
import Link from "next/link";
import { Button, Modal } from "antd";
import { useState } from "react";
import styles from "./page.module.css";
import type { JobView } from "./types";

type ModalState = {
  open: boolean;
  job: JobView | null;
};

export default function JobsList({ jobs, apiBase }: { jobs: JobView[]; apiBase: string }) {
  const [modalState, setModalState] = useState<ModalState>({ open: false, job: null });

  const imageAds = jobs.filter((job) => job.imageFile);
  const textAds = jobs.filter((job) => !job.imageFile);

  const openModal = (job: JobView) => {
    setModalState({ open: true, job });
  };

  const closeModal = () => {
    setModalState({ open: false, job: null });
  };

  const renderChips = (items: string[], className?: string) => {
    if (!items || items.length === 0) {
      return <span className={styles.muted}>None</span>;
    }
    return (
      <div className={styles.chipRow}>
        {items.map((item, itemIndex) => (
          <span key={`${item}-${itemIndex}`} className={className ?? styles.chip}>
            {item}
          </span>
        ))}
      </div>
    );
  };

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
              <span className={styles.skillLabel}>Match</span>
              <span className={styles.skillValue}>
                {typeof job.matchPercent === "number"
                  ? `${job.matchPercent.toFixed(0)}%`
                  : "Not scored"}
              </span>
            </div>
            <div className={styles.skillRow}>
              <span className={styles.skillLabel}>Extracted skills</span>
              {renderChips(job.skillsFound ?? [], styles.chipFound)}
            </div>
            <div className={styles.skillRow}>
              <span className={styles.skillLabel}>Missing skills</span>
              {renderChips(job.missingSkills ?? [], styles.chipMissing)}
            </div>
            <div className={styles.skillRow}>
              <span className={styles.skillLabel}>Overlap</span>
              {renderChips(job.overlapSkills ?? [], styles.chipOverlap)}
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
                {job.files.map((file) => (
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
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Text ads</h2>
              <p className={styles.sectionHint}>
                {textAds.length} {textAds.length === 1 ? "item" : "items"}
              </p>
            </div>
            {textAds.length === 0 ? <p className={styles.muted}>No text ads available.</p> : renderList(textAds)}
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Image ads</h2>
              <p className={styles.sectionHint}>
                {imageAds.length} {imageAds.length === 1 ? "item" : "items"}
              </p>
            </div>
            {imageAds.length === 0 ? <p className={styles.muted}>No image ads available.</p> : renderList(imageAds)}
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

