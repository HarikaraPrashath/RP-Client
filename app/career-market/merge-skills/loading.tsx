"use client";

import { Skeleton } from "antd";
import styles from "../skills/page.module.css";

export default function MergeSkillsLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.gradientOne} />
      <div className={styles.gradientTwo} />
      <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <Skeleton
              active
              title={{ width: 140 }}
              paragraph={{ rows: 2, width: ["70%", "55%"] }}
            />
            <div className={styles.heroChips}>
              <Skeleton.Button active size="small" style={{ width: 140 }} />
              <Skeleton.Button active size="small" style={{ width: 160 }} />
              <Skeleton.Button active size="small" style={{ width: 130 }} />
            </div>
          </div>
          <div className={styles.heroOrb}>
            <div className={styles.orbRing}>
              <div className={styles.orbCore}>
                <Skeleton.Avatar active size={72} shape="circle" />
                <Skeleton
                  active
                  title={false}
                  paragraph={{ rows: 2, width: ["60%", "40%"] }}
                />
              </div>
            </div>
          </div>
        </header>

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <Skeleton
              active
              title={{ width: 120 }}
              paragraph={{ rows: 2, width: ["85%", "65%"] }}
            />
          </div>
          <div className={styles.statCard}>
            <Skeleton
              active
              title={{ width: 130 }}
              paragraph={{ rows: 2, width: ["40%", "70%"] }}
            />
          </div>
          <div className={styles.statCard}>
            <Skeleton
              active
              title={{ width: 170 }}
              paragraph={{ rows: 2, width: ["45%", "75%"] }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
