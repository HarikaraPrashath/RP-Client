"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type SignupErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRules = useMemo(
    () => [
      { label: "At least 8 characters", passes: password.length >= 8 },
      { label: "One uppercase letter", passes: /[A-Z]/.test(password) },
      { label: "One lowercase letter", passes: /[a-z]/.test(password) },
      { label: "One number", passes: /\d/.test(password) },
    ],
    [password]
  );

  const validate = () => {
    const nextErrors: SignupErrors = {};
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    const passwordIssues = passwordRules.filter((rule) => !rule.passes);
    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (passwordIssues.length > 0) {
      nextErrors.password = "Password does not meet all requirements.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password && confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrors((prev) => ({
          ...prev,
          form: data?.message || "Sign up failed. Please review your details.",
        }));
        return;
      }

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
            <p className={styles.kicker}>Get started</p>
            <h1 className={styles.title}>Create your CV_extracter account</h1>
            <p className={styles.lead}>
              Set up a workspace in seconds and organize every resume into a clean profile.
            </p>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoTitle}>Upload once</span>
                <span className={styles.infoText}>
                  Bring in your CV and let the system extract the details.
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoTitle}>Review quickly</span>
                <span className={styles.infoText}>
                  Validate experience, skills, and education in one view.
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoTitle}>Stay updated</span>
                <span className={styles.infoText}>
                  Keep your profile fresh with every new document you add.
                </span>
              </div>
            </div>
          </section>

          <section className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>Sign up</h2>
              <p>Use your email to create a new account.</p>
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
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </label>
              <div className={styles.rules}>
                {passwordRules.map((rule) => (
                  <div
                    key={rule.label}
                    className={`${styles.ruleItem} ${rule.passes ? styles.ruleMet : ""}`}
                  >
                    {rule.label}
                  </div>
                ))}
              </div>
              <label className={styles.field}>
                <span className={styles.label}>Confirm password</span>
                <input
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                {errors.confirmPassword && (
                  <span className={styles.errorText}>{errors.confirmPassword}</span>
                )}
              </label>
              {errors.form && <p className={styles.formError}>{errors.form}</p>}
              <button className={styles.primaryBtn} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>
            <p className={styles.legal}>
              By continuing you agree to our terms of service and privacy policy.
            </p>
            <div className={styles.formFooter}>
              <span>Already have an account?</span>
              <Link className={styles.link} href="/login">
                Sign in
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
