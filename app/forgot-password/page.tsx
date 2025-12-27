"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ForgotErrors = {
  email?: string;
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ForgotErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const validate = () => {
    const nextErrors: ForgotErrors = {};
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
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
    setStatusMessage("");

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setErrors((prev) => ({
          ...prev,
          form: data?.message || "We could not send a reset link. Try again.",
        }));
        return;
      }

      setStatusMessage(data?.message || "Check your inbox for a reset link.");
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
        <section className={styles.card}>
          <p className={styles.kicker}>Reset access</p>
          <h1 className={styles.title}>Forgot your password?</h1>
          <p className={styles.lead}>
            Enter your email and we will send you a link to reset your password.
          </p>
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
            {errors.form && <p className={styles.formError}>{errors.form}</p>}
            {statusMessage && <p className={styles.status}>{statusMessage}</p>}
            <button className={styles.primaryBtn} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
          <div className={styles.footer}>
            <Link className={styles.link} href="/login">
              Back to sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
