"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import styles from "./app-sider.module.css";

const navItems = [
  {
    href: "/profile",
    label: "Profile",
    description: "Your career profile",
  },
  {
    href: "/merge-skills",
    label: "Merge skills",
    description: "Skills match summary",
  },
  {
    href: "/trends",
    label: "Trends",
    description: "Market pulse",
  },
  {
    href: "/cv_extracter",
    label: "CV extracter",
    description: "Parse and save CV",
  },
];

const isActiveRoute = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function AppSider({ variant }: { variant?: "light" }) {
  const pathname = usePathname();
  const variantClass = variant === "light" ? styles.siderLight : "";
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${styles.sider} ${variantClass} ${collapsed ? styles.siderCollapsed : ""}`}
      aria-label="Section navigation"
    >
      <div className={styles.brand}>
        <span className={styles.brandTitle}>Career hub</span>
        <span className={styles.brandTag}>Focused tools</span>
      </div>
      <button
        type="button"
        className={styles.collapseButton}
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "»" : "«"}
      </button>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.navDesc}>{item.description}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
