"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setAuthToken } from "../../lib/auth";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: LoginErrors = {};
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, remember }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setErrors((prev) => ({
          ...prev,
          form: data?.detail || "Sign in failed. Check your credentials and try again.",
        }));
        return;
      }

      setAuthToken(data?.token || "");
      router.push("/profile");
    } catch {
      setErrors((prev) => ({
        ...prev,
        form: "We could not reach the server. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.authGrid}>
          <section className={styles.infoCard}>
            <p className={styles.kicker}>CV_extracter</p>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.lead}>
              Sign in to continue building structured profiles from every new resume you receive.
            </p>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoTitle}>Fast parsing</span>
                <span className={styles.infoText}>
                  Upload a CV and review the extracted sections in minutes.
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoTitle}>Profile ready</span>
                <span className={styles.infoText}>
                  Keep your headline, experience, and skills synchronized.
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoTitle}>Secure workspace</span>
                <span className={styles.infoText}>
                  Save drafts and return to them anytime from your dashboard.
                </span>
              </div>
            </div>
          </section>

          <section className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>Sign in</h2>
              <p>Use the email connected to your CV_extracter account.</p>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Password</span>
                <input
                  className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </label>
              <div className={styles.formRow}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  Remember me
                </label>
                <Link className={styles.linkBtn} href="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              {errors.form && <p className={styles.formError}>{errors.form}</p>}
              <button className={styles.primaryBtn} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <div className={styles.formFooter}>
              <span>New here?</span>
              <Link className={styles.link} href="/signup">
                Create an account
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
