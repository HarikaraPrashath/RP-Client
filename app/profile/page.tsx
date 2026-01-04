"use client";

import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";
import { EditOutlined } from "@ant-design/icons";
import { Checkbox, Input, Modal } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { authHeader } from "../../lib/auth";
import styles from "./page.module.css";
import AppSider from "../../components/app-sider";
import siderStyles from "../../components/app-sider.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Experience = {
  role: string;
  company: string;
  type: string;
  dates: string;
  summary: string;
};

type Education = {
  school: string;
  degree: string;
  dates: string;
};

type Recommendation = {
  quote: string;
  author: string;
};

type ProjectDetail = {
  label?: string;
  text: string;
};

type ProjectEntry = {
  title: string;
  details: ProjectDetail[];
  link?: string;
  startIndex: number;
  endIndex: number;
};

type BestMatch = {
  position: string;
  employer: string;
  match_percent: number;
  url?: string;
  ref?: string;
};
type TopMatch = BestMatch;

type CvFile = {
  id: string;
  originalName: string;
  size: number;
  uploadedAt: string | null;
  viewUrl: string;
};

type Basics = {
  firstName: string;
  lastName: string;
  additionalName: string;
  headline: string;
  position: string;
  industry: string;
  school: string;
  country: string;
  city: string;
  contactEmail: string;
  showCurrentCompany: boolean;
  showSchool: boolean;
};

type ProfilePayload = {
  basics: Basics;
  about: string;
  experiences: Experience[];
  educationItems: Education[];
  skills: string[];
  projects: string[];
  certifications: string[];
  recommendations: Recommendation[];
};

const emptyExperience: Experience = {
  role: "",
  company: "",
  type: "",
  dates: "",
  summary: "",
};

const emptyEducation: Education = {
  school: "",
  degree: "",
  dates: "",
};

const emptyRecommendation: Recommendation = {
  quote: "",
  author: "",
};

const projectLabelPrefixes = [
  "technology",
  "tech stack",
  "tech",
  "stack",
  "tools",
  "role",
  "responsibilities",
  "objective",
  "description",
  "summary",
  "project",
  "features",
  "framework",
  "language",
  "languages",
];

const roleLinePattern =
  /^(team leader|teamlead|lead|developer|engineer|member|intern|contributor|manager|designer|architect)\b/i;

const genericTitlePattern = /(stack|development)\b/i;

const isUrl = (value: string) =>
  /^(https?:\/\/\S+|www\.\S+|\S+\.\S+\/\S+)/i.test(value) || /github\.com/i.test(value);

const isUrlContinuation = (value: string) =>
  /^[?&]|^m=|^t=/i.test(value.trim());

const stripUrlContinuationPrefix = (value: string) => {
  if (!isUrlContinuation(value)) return value;
  const stripped = value.replace(/^(?:[?&]|m=|t=)\S*(?:[.,]\s+|\s+)/i, "");
  return stripped.trim() ? stripped.trim() : value;
};

const sanitizeTitle = (value: string) => {
  const trimmed = value.trim();
  return stripUrlContinuationPrefix(trimmed).trim();
};

const normalizeProjectLines = (lines: string[]) => {
  const normalized: string[] = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/^projects?$/i.test(trimmed) || /^rojects$/i.test(trimmed)) {
      return;
    }
    const prev = normalized[normalized.length - 1];
    if (prev && isUrl(prev) && isUrlContinuation(trimmed)) {
      normalized[normalized.length - 1] = `${prev}${trimmed}`;
      return;
    }
    const sanitized = stripUrlContinuationPrefix(trimmed);
    if (!sanitized) return;
    normalized.push(sanitized);
  });
  return normalized;
};

const isLabelLine = (value: string) =>
  projectLabelPrefixes.some((prefix) => value.toLowerCase().startsWith(prefix));

const isRoleLine = (value: string) => roleLinePattern.test(value.trim());

const isGenericTitle = (value: string) => genericTitlePattern.test(value);

const isLikelyDescription = (value: string) =>
  value.length > 90 || /[.!?]$/.test(value);

const isTechLabel = (value?: string) =>
  Boolean(value && /tech|technology|tools|stack/i.test(value));

const isTechFragment = (value: string) =>
  !/[:/]/.test(value) &&
  value.length <= 30 &&
  !/(online|system|project|application|frontend|backend|design|delivery|interface|management|store)/i.test(
    value
  );

const isTitleCandidate = (value: string) =>
  !isUrl(value) && !isLabelLine(value) && !isRoleLine(value) && !isLikelyDescription(value);

const parseProjectDetail = (line: string): ProjectDetail => {
  const splitIndex = line.indexOf(":");
  if (splitIndex > -1) {
    const label = line.slice(0, splitIndex).trim();
    const text = line.slice(splitIndex + 1).trim();
    if (label && text) {
      return { label, text };
    }
  }
  return { text: line };
};

const buildProjectEntries = (lines: string[]): ProjectEntry[] => {
  const entries: ProjectEntry[] = [];
  let current: Omit<ProjectEntry, "startIndex" | "endIndex"> | null = null;
  let currentStart = 0;
  let currentEnd = 0;

  const flushCurrent = () => {
    if (!current) return;
    if (!current.title && current.details.length > 0) {
      const firstDetail = current.details.shift();
      if (firstDetail) {
        current.title = firstDetail.text;
      }
    }
    if (current.title || current.details.length > 0 || current.link) {
      entries.push({ ...current, startIndex: currentStart, endIndex: currentEnd });
    }
    current = null;
  };

  const startCurrent = (title: string, index: number) => {
    current = { title, details: [] };
    currentStart = index;
    currentEnd = index;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (isUrl(trimmed)) {
      if (!current) {
        startCurrent("Project", index);
      }
      if (!current) {
        return;
      }
      currentEnd = index;
      if (current.link) {
        current.details.push({ text: trimmed });
      } else {
        current.link = trimmed;
      }
      flushCurrent();
      return;
    }

    if (isUrlContinuation(trimmed)) {
      return;
    }

    const prevIsUrl = Boolean(current?.link);
    const cleanedLine = prevIsUrl ? trimmed : stripUrlContinuationPrefix(trimmed);
    if (!cleanedLine) return;

    if (
      isGenericTitle(cleanedLine) &&
      (!current || (!current.title && current.details.length === 0))
    ) {
      if (!current) {
        startCurrent("", index);
      }
      if (!current) {
        return;
      }
      currentEnd = index;
      current.details.push({ label: "Area", text: cleanedLine });
      return;
    }

    if (isTitleCandidate(cleanedLine)) {
      if (!current) {
        startCurrent(sanitizeTitle(cleanedLine), index);
        return;
      }
      currentEnd = index;
      if (!current.title) {
        current.title = sanitizeTitle(cleanedLine);
        return;
      }
      if (
        current.title &&
        current.details.length === 0 &&
        !current.link &&
        !isGenericTitle(current.title) &&
        cleanedLine.length < 40
      ) {
        current.title = `${current.title}, ${sanitizeTitle(cleanedLine)}`;
        return;
      }
      if (current.title && isGenericTitle(current.title) && !current.link) {
        current.details.unshift({ label: "Area", text: current.title });
        current.title = sanitizeTitle(cleanedLine);
        return;
      }
      if (current.title && (current.details.length > 0 || current.link)) {
        flushCurrent();
        startCurrent(sanitizeTitle(cleanedLine), index);
        return;
      }
    }

    if (!current) {
      startCurrent("", index);
    }
    if (!current) {
      return;
    }
    currentEnd = index;
    if (isRoleLine(cleanedLine)) {
      current.details.push({ label: "Role", text: cleanedLine });
    } else if (
      current.details.length > 0 &&
      isTechLabel(current.details[current.details.length - 1].label) &&
      isTechFragment(cleanedLine)
    ) {
      current.details[current.details.length - 1].text += `, ${cleanedLine}`;
    } else {
      current.details.push(parseProjectDetail(cleanedLine));
    }
  });

  flushCurrent();
  return entries;
};

export default function ProfilePage() {
  const router = useRouter();
  const defaultBasics: Basics = {
    firstName: "",
    lastName: "",
    additionalName: "",
    headline: "",
    position: "",
    industry: "",
    school: "",
    country: "",
    city: "",
    contactEmail: "",
    showCurrentCompany: true,
    showSchool: true,
  };

  const [basics, setBasics] = useState(defaultBasics);
  const [basicsDraft, setBasicsDraft] = useState(defaultBasics);
  const [isBasicsModalOpen, setIsBasicsModalOpen] = useState(false);
  const [about, setAbout] = useState("");
  const [aboutDraft, setAboutDraft] = useState("");
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [experienceDraft, setExperienceDraft] = useState<Experience>(emptyExperience);

  const [educationItems, setEducationItems] = useState<Education[]>([]);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [educationDraft, setEducationDraft] = useState<Education>(emptyEducation);
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);

  const [skills, setSkills] = useState<string[]>([]);
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState("");

  const [projects, setProjects] = useState<string[]>([]);
  const [showProjectsForm, setShowProjectsForm] = useState(false);
  const [projectsDraft, setProjectsDraft] = useState("");

  const [certifications, setCertifications] = useState<string[]>([]);
  const [showCertificationsForm, setShowCertificationsForm] = useState(false);
  const [certificationsDraft, setCertificationsDraft] = useState("");

  const [cvFile, setCvFile] = useState<CvFile | null>(null);
  const [cvLoading, setCvLoading] = useState(true);
  const [cvError, setCvError] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [recommendationDraft, setRecommendationDraft] = useState<Recommendation>(
    emptyRecommendation
  );
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [projectEditDraft, setProjectEditDraft] = useState("");
  const [projectEditRange, setProjectEditRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [bestMatch, setBestMatch] = useState<BestMatch | null>(null);
  const [topMatches, setTopMatches] = useState<TopMatch[]>([]);

  const connectionsLabel = "500+ connections";
  const displayName = [
    basics.firstName,
    basics.additionalName,
    basics.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Add your name";
  const locationLabel = [basics.city, basics.country].filter(Boolean).join(", ");
  const metaLine = locationLabel
    ? `${locationLabel} - ${connectionsLabel}`
    : `Add location - ${connectionsLabel}`;

  const formatSize = (bytes: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const cvMeta = cvFile
    ? [
        cvFile.originalName,
        cvFile.size ? formatSize(cvFile.size) : "",
        cvFile.uploadedAt ? new Date(cvFile.uploadedAt).toLocaleDateString() : "",
      ]
        .filter(Boolean)
        .join(" - ")
    : "";
  const cvViewUrl = cvFile ? `${API_BASE}${cvFile.viewUrl}` : "";

  const persistProfile = async (overrides?: Partial<ProfilePayload>) => {
    const payload: ProfilePayload = {
      basics,
      about,
      experiences,
      educationItems,
      skills,
      projects,
      certifications,
      recommendations,
      ...overrides,
    };
    try {
      await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
    } catch {
      // Intentionally ignored; keep edits local if the API fails.
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: authHeader(),
        });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (ignore) return;
        if (data?.basics) {
          setBasics((prev) => ({ ...prev, ...data.basics }));
          setBasicsDraft((prev) => ({ ...prev, ...data.basics }));
        }
        setAbout(data?.about ?? "");
        setAboutDraft(data?.about ?? "");
        setExperiences(Array.isArray(data?.experiences) ? data.experiences : []);
        setEducationItems(Array.isArray(data?.educationItems) ? data.educationItems : []);
        setSkills(Array.isArray(data?.skills) ? data.skills : []);
        setProjects(Array.isArray(data?.projects) ? data.projects : []);
        setCertifications(Array.isArray(data?.certifications) ? data.certifications : []);
        setRecommendations(Array.isArray(data?.recommendations) ? data.recommendations : []);
      } catch {
        // No-op; use local defaults.
      }
    };

    loadProfile();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadCv = async () => {
      setCvLoading(true);
      setCvError(null);
      try {
        const res = await fetch(`${API_BASE}/cv`);
        if (!res.ok) {
          throw new Error("Failed to load CV");
        }
        const data = await res.json();
        if (ignore) return;
        setCvFile(data?.file ?? null);
      } catch {
        if (!ignore) {
          setCvError("Unable to load CV.");
        }
      } finally {
        if (!ignore) {
          setCvLoading(false);
        }
      }
    };

    loadCv();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadBest = async () => {
      try {
        const res = await fetch(`${API_BASE}/ranked/summary`);
        if (!res.ok) return;
        const data = await res.json();
        if (ignore) return;
        if (data?.best) {
          setBestMatch({
            position: data.best.position || "",
            employer: data.best.employer || "",
            match_percent: data.best.match_percent ?? 0,
            url: data.best.url || "",
            ref: data.best.ref || "",
          });
        }
        if (Array.isArray(data?.top)) {
          setTopMatches(
            data.top.map((item: any) => ({
              position: item.position || "",
              employer: item.employer || "",
              match_percent: item.match_percent ?? 0,
              url: item.url || "",
              ref: item.ref || "",
            })),
          );
        }
      } catch {
        // show nothing if it fails
      }
    };
    loadBest();
    return () => {
      ignore = true;
    };
  }, []);

  const openBasicsModal = () => {
    setBasicsDraft(basics);
    setIsBasicsModalOpen(true);
  };

  const saveBasics = () => {
    const trimmed: Basics = {
      firstName: basicsDraft.firstName.trim(),
      lastName: basicsDraft.lastName.trim(),
      additionalName: basicsDraft.additionalName.trim(),
      headline: basicsDraft.headline.trim(),
      position: basicsDraft.position.trim(),
      industry: basicsDraft.industry.trim(),
      school: basicsDraft.school.trim(),
      country: basicsDraft.country.trim(),
      city: basicsDraft.city.trim(),
      contactEmail: basicsDraft.contactEmail.trim(),
      showCurrentCompany: basicsDraft.showCurrentCompany,
      showSchool: basicsDraft.showSchool,
    };
    setBasics(trimmed);
    setBasicsDraft(trimmed);
    setIsBasicsModalOpen(false);
    persistProfile({ basics: trimmed });
  };

  const saveAbout = () => {
    const trimmed = aboutDraft.trim();
    if (!trimmed) return;
    setAbout(trimmed);
    setAboutDraft(trimmed);
    setIsEditingAbout(false);
    persistProfile({ about: trimmed });
  };

  const saveExperience = () => {
    const hasContent =
      experienceDraft.role.trim() || experienceDraft.company.trim() || experienceDraft.summary.trim();
    if (!hasContent) return;
    const nextExperiences = [...experiences, experienceDraft];
    setExperiences(nextExperiences);
    setExperienceDraft(emptyExperience);
    setShowExperienceForm(false);
    persistProfile({ experiences: nextExperiences });
  };

  const saveEducation = () => {
    const hasContent = educationDraft.school.trim() || educationDraft.degree.trim();
    if (!hasContent) return;
    const nextEducation =
      editingEducationIndex === null
        ? [...educationItems, educationDraft]
        : educationItems.map((item, index) =>
            index === editingEducationIndex ? educationDraft : item
          );
    setEducationItems(nextEducation);
    setEducationDraft(emptyEducation);
    setShowEducationForm(false);
    setEditingEducationIndex(null);
    persistProfile({ educationItems: nextEducation });
  };

  const saveSkills = () => {
    const parsed = skillsDraft
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    if (parsed.length === 0) return;
    setSkills(parsed);
    setShowSkillsForm(false);
    persistProfile({ skills: parsed });
  };

  const parseLineItems = (value: string) =>
    value
      .split(/\n|,|;|\u2022/)
      .map((item) => item.trim())
      .filter(Boolean);

  const parseProjectLines = (value: string) =>
    normalizeProjectLines(
      value
        .split(/\n+|;|\u2022/)
        .map((item) => item.replace(/\f/g, "").trim())
        .filter(Boolean)
    );

  const saveProjects = () => {
    const parsed = parseProjectLines(projectsDraft);
    if (parsed.length === 0) return;
    setProjects(parsed);
    setShowProjectsForm(false);
    persistProfile({ projects: parsed });
  };

  const saveCertifications = () => {
    const parsed = parseLineItems(certificationsDraft);
    if (parsed.length === 0) return;
    setCertifications(parsed);
    setShowCertificationsForm(false);
    persistProfile({ certifications: parsed });
  };

  const splitBullets = (value: string) =>
    value
      .split(/\n+/)
      .map((line) => line.replace(/^[-*•\u2022]\s*/, "").trim())
      .filter(Boolean);

  const saveRecommendation = () => {
    const hasContent = recommendationDraft.quote.trim() || recommendationDraft.author.trim();
    if (!hasContent) return;
    const nextRecommendations = [...recommendations, recommendationDraft];
    setRecommendations(nextRecommendations);
    setRecommendationDraft(emptyRecommendation);
    setShowRecommendationForm(false);
    persistProfile({ recommendations: nextRecommendations });
  };

  const openProjectEdit = (project: ProjectEntry) => {
    setProjectEditDraft(projects.slice(project.startIndex, project.endIndex + 1).join("\n"));
    setProjectEditRange({ start: project.startIndex, end: project.endIndex });
    setIsProjectEditOpen(true);
  };

  const saveProjectEdit = () => {
    if (!projectEditRange) return;
    const parsed = parseProjectLines(projectEditDraft);
    const nextProjects = [
      ...projects.slice(0, projectEditRange.start),
      ...parsed,
      ...projects.slice(projectEditRange.end + 1),
    ];
    setProjects(nextProjects);
    setIsProjectEditOpen(false);
    setProjectEditRange(null);
    setProjectEditDraft("");
    persistProfile({ projects: nextProjects });
  };

  const closeProjectEdit = () => {
    setIsProjectEditOpen(false);
    setProjectEditRange(null);
    setProjectEditDraft("");
  };

  const resetSections = () => {
    if (!window.confirm("Reset experience, education, skills, projects, certifications, and recommendations?")) {
      return;
    }
    setExperiences([]);
    setEducationItems([]);
    setSkills([]);
    setProjects([]);
    setCertifications([]);
    setRecommendations([]);
    setShowExperienceForm(false);
    setShowEducationForm(false);
    setShowSkillsForm(false);
    setShowProjectsForm(false);
    setShowCertificationsForm(false);
    setShowRecommendationForm(false);
    setExperienceDraft(emptyExperience);
    setEducationDraft(emptyEducation);
    setEditingEducationIndex(null);
    setSkillsDraft("");
    setProjectsDraft("");
    setCertificationsDraft("");
    setRecommendationDraft(emptyRecommendation);
    persistProfile({
      experiences: [],
      educationItems: [],
      skills: [],
      projects: [],
      certifications: [],
      recommendations: [],
    });
  };

  const { certificationsList, referencesList } = useMemo(() => {
    const markerIndex = certifications.findIndex((item) => /^references$/i.test(item));
    if (markerIndex === -1) {
      return { certificationsList: certifications, referencesList: [] };
    }
    return {
      certificationsList: certifications.slice(0, markerIndex),
      referencesList: certifications.slice(markerIndex + 1),
    };
  }, [certifications]);

  const organizedProjects = useMemo(
    () => buildProjectEntries(projects),
    [projects]
  );

  return (
    <div className={siderStyles.siderLayout}>
      <AppSider variant="light" />
      <div className={siderStyles.siderContent}>
        <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.noticeCard}>
          <div>
            <h2 className={styles.noticeTitle}>Auto-fill from your CV</h2>
            <p className={styles.noticeText}>
              You can still add everything manually, but CV_extracter can parse your resume and
              pre-fill these sections in seconds.
            </p>
          </div>
          <Link href="/cv_extracter" className={styles.noticeButton}>
            Go to CV_extracter
          </Link>
        </section>
        <section className={styles.profileCard}>
          <button
            className={styles.profileEdit}
            type="button"
            aria-label="Edit profile"
            onClick={openBasicsModal}
          >
            <EditOutlined />
          </button>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>JD</div>
            <span className={styles.openTag}>Open to work</span>
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileHeader}>
              <div>
                <h1 className={styles.name}>{displayName}</h1>
                <p className={styles.headline}>{basics.headline || "Add a headline"}</p>
                <p className={styles.meta}>{metaLine}</p>
              </div>
            </div>
            <div className={styles.profileHighlights}>
              <div className={styles.highlight}>
                <span className={styles.highlightLabel}>Current</span>
                <span>
                  {basics.showCurrentCompany
                    ? basics.position || "Add current position"
                    : "Hidden"}
                </span>
              </div>
              <div className={styles.highlight}>
                <span className={styles.highlightLabel}>Education</span>
                <span>
                  {basics.showSchool
                    ? basics.school || "Add education"
                    : "Hidden"}
                </span>
              </div>
              <div className={styles.highlight}>
                <span className={styles.highlightLabel}>Contact</span>
                <span>{basics.contactEmail || "Add contact info"}</span>
              </div>
            </div>
            <div className={styles.profileActions}>
              <button className={styles.resetBtn} type="button" onClick={resetSections}>
                Reset sections
              </button>
            </div>
          </div>
        </section>

        <div className={styles.grid}>
          <main className={styles.mainCol}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>About</h2>
                {!isEditingAbout && (
                  <button
                    className={styles.linkBtn}
                    type="button"
                    aria-label={about ? "Edit about" : "Add about"}
                    onClick={() => {
                      setAboutDraft(about);
                      setIsEditingAbout(true);
                    }}
                  >
                    {about ? <EditOutlined /> : "Add"}
                  </button>
                )}
              </div>
              {isEditingAbout ? (
                <div className={styles.formStack}>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder="Write a short summary about your work."
                    value={aboutDraft}
                    onChange={(event) => setAboutDraft(event.target.value)}
                  />
                  <div className={styles.formActions}>
                    <button className={styles.primaryBtn} type="button" onClick={saveAbout}>
                      Save
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => setIsEditingAbout(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : about ? (
                <p className={styles.cardBody}>{about}</p>
              ) : (
                <p className={styles.emptyText}>Add a short summary about your work and focus areas.</p>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Experience</h2>
                {!showExperienceForm && (
                  <button
                    className={styles.linkBtn}
                    type="button"
                    onClick={() => {
                      setExperienceDraft(emptyExperience);
                      setShowExperienceForm(true);
                    }}
                  >
                    Add
                  </button>
                )}
              </div>
              {showExperienceForm && (
                <div className={styles.formStack}>
                  <div className={styles.formRow}>
                    <input
                      className={styles.input}
                      placeholder="Role"
                      value={experienceDraft.role}
                      onChange={(event) =>
                        setExperienceDraft((prev) => ({ ...prev, role: event.target.value }))
                      }
                    />
                    <input
                      className={styles.input}
                      placeholder="Company"
                      value={experienceDraft.company}
                      onChange={(event) =>
                        setExperienceDraft((prev) => ({ ...prev, company: event.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.formRow}>
                    <input
                      className={styles.input}
                      placeholder="Employment type"
                      value={experienceDraft.type}
                      onChange={(event) =>
                        setExperienceDraft((prev) => ({ ...prev, type: event.target.value }))
                      }
                    />
                    <input
                      className={styles.input}
                      placeholder="Dates"
                      value={experienceDraft.dates}
                      onChange={(event) =>
                        setExperienceDraft((prev) => ({ ...prev, dates: event.target.value }))
                      }
                    />
                  </div>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    placeholder="Summary"
                    value={experienceDraft.summary}
                    onChange={(event) =>
                      setExperienceDraft((prev) => ({ ...prev, summary: event.target.value }))
                    }
                  />
                  <div className={styles.formActions}>
                    <button className={styles.primaryBtn} type="button" onClick={saveExperience}>
                      Save
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => setShowExperienceForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {experiences.length === 0 && !showExperienceForm ? (
                <p className={styles.emptyText}>Add your most recent roles and accomplishments.</p>
              ) : (
                <div className={styles.timeline}>
                  {experiences.map((experience) => (
                    <div key={`${experience.role}-${experience.company}`} className={styles.timelineItem}>
                      <div className={styles.timelineLogo}>EX</div>
                      <div>
                        <h3>{experience.role || "Role"}</h3>
                        <p className={styles.timelineMeta}>
                          {(experience.company || "Company") + (experience.type ? ` - ${experience.type}` : "")}
                        </p>
                        {experience.dates && <p className={styles.timelineMeta}>{experience.dates}</p>}
                        {experience.summary && (() => {
                          const bullets = splitBullets(experience.summary);
                          if (bullets.length > 1) {
                            return (
                              <ul className={styles.bulletList}>
                                {bullets.map((bullet, index) => (
                                  <li key={`${experience.role}-${index}`} className={styles.bulletItem}>
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return <p className={styles.timelineBody}>{experience.summary}</p>;
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Education</h2>
                {!showEducationForm && (
                  <button
                    className={styles.linkBtn}
                    type="button"
                    onClick={() => {
                      setEducationDraft(emptyEducation);
                      setEditingEducationIndex(null);
                      setShowEducationForm(true);
                    }}
                  >
                    Add
                  </button>
                )}
              </div>
              {showEducationForm && (
                <div className={styles.formStack}>
                  <div className={styles.formRow}>
                    <input
                      className={styles.input}
                      placeholder="School"
                      value={educationDraft.school}
                      onChange={(event) =>
                        setEducationDraft((prev) => ({ ...prev, school: event.target.value }))
                      }
                    />
                    <input
                      className={styles.input}
                      placeholder="Degree"
                      value={educationDraft.degree}
                      onChange={(event) =>
                        setEducationDraft((prev) => ({ ...prev, degree: event.target.value }))
                      }
                    />
                  </div>
                  <input
                    className={styles.input}
                    placeholder="Dates"
                    value={educationDraft.dates}
                    onChange={(event) =>
                      setEducationDraft((prev) => ({ ...prev, dates: event.target.value }))
                    }
                  />
                  <div className={styles.formActions}>
                    <button className={styles.primaryBtn} type="button" onClick={saveEducation}>
                      Save
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => {
                        setShowEducationForm(false);
                        setEditingEducationIndex(null);
                        setEducationDraft(emptyEducation);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {educationItems.length === 0 && !showEducationForm ? (
                <p className={styles.emptyText}>Add your schools, degrees, or certifications.</p>
              ) : (
                <div className={styles.timeline}>
                  {educationItems.map((education, index) => (
                    <div key={`${education.school}-${education.degree}`} className={styles.timelineItem}>
                      <div className={styles.timelineLogo}>ED</div>
                      <div>
                        <div className={styles.timelineHeader}>
                          <h3>{education.school || "School"}</h3>
                          <button
                            className={styles.timelineEditBtn}
                            type="button"
                            aria-label={`Edit ${education.school || "education"}`}
                            onClick={() => {
                              setEducationDraft(education);
                              setEditingEducationIndex(index);
                              setShowEducationForm(true);
                            }}
                          >
                            <EditOutlined />
                          </button>
                        </div>
                        {education.degree && <p className={styles.timelineMeta}>{education.degree}</p>}
                        {education.dates && <p className={styles.timelineMeta}>{education.dates}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Skills</h2>
                {!showSkillsForm && (
                  <button
                    className={styles.linkBtn}
                    type="button"
                    aria-label={skills.length ? "Edit skills" : "Add skills"}
                    onClick={() => {
                      setSkillsDraft(skills.join(", "));
                      setShowSkillsForm(true);
                    }}
                  >
                    {skills.length ? <EditOutlined /> : "Add"}
                  </button>
                )}
              </div>
              {showSkillsForm && (
                <div className={styles.formStack}>
                  <input
                    className={styles.input}
                    placeholder="Add skills separated by commas"
                    value={skillsDraft}
                    onChange={(event) => setSkillsDraft(event.target.value)}
                  />
                  <div className={styles.formActions}>
                    <button className={styles.primaryBtn} type="button" onClick={saveSkills}>
                      Save
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => setShowSkillsForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {!showSkillsForm && skills.length === 0 && (
                <p className={styles.emptyText}>Add the skills you want recruiters to notice.</p>
              )}
              {skills.length > 0 && !showSkillsForm && (
                <div className={styles.skillGrid}>
                  {skills.map((skill) => (
                    <span key={skill} className={styles.skillPill}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Projects</h2>
                {!showProjectsForm && (
                  <button
                    className={styles.linkBtn}
                    type="button"
                    aria-label={projects.length ? "Edit projects" : "Add projects"}
                    onClick={() => {
                      setProjectsDraft(projects.join("\n"));
                      setShowProjectsForm(true);
                    }}
                  >
                    {projects.length ? <EditOutlined /> : "Add"}
                  </button>
                )}
              </div>
              {showProjectsForm && (
                <div className={styles.formStack}>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder="Add one project per line"
                    value={projectsDraft}
                    onChange={(event) => setProjectsDraft(event.target.value)}
                  />
                  <div className={styles.formActions}>
                    <button className={styles.primaryBtn} type="button" onClick={saveProjects}>
                      Save
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => setShowProjectsForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {!showProjectsForm && projects.length === 0 && (
                <p className={styles.emptyText}>Add projects or case studies from your CV.</p>
              )}
              {projects.length > 0 && !showProjectsForm && (
                <div className={styles.projectGrid}>
                  {organizedProjects.map((project, index) => (
                    <div key={`${project.title}-${index}`} className={styles.projectCard}>
                      <div className={styles.projectHeader}>
                        <h3 className={styles.projectTitle}>
                          {project.title || `Project ${index + 1}`}
                        </h3>
                        <div className={styles.projectActions}>
                          <button
                            className={styles.projectActionBtn}
                            type="button"
                            aria-label={`Edit ${project.title || `Project ${index + 1}`}`}
                            onClick={() => openProjectEdit(project)}
                          >
                            <EditOutlined />
                            Edit
                          </button>
                          {project.link && (
                            <a
                              className={styles.projectActionLink}
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View link
                            </a>
                          )}
                        </div>
                      </div>
                      {project.details.length > 0 && (
                        <ul className={styles.projectMetaList}>
                          {project.details.map((detail, detailIndex) => (
                            <li
                              key={`${project.title}-${detailIndex}`}
                              className={styles.projectMetaItem}
                            >
                              {detail.label && (
                                <span className={styles.projectLabel}>{detail.label}:</span>
                              )}
                              <span>{detail.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Certifications</h2>
                {!showCertificationsForm && (
                  <button
                    className={styles.linkBtn}
                    type="button"
                    aria-label={certifications.length ? "Edit certifications" : "Add certifications"}
                    onClick={() => {
                      setCertificationsDraft(certifications.join("\n"));
                      setShowCertificationsForm(true);
                    }}
                  >
                    {certifications.length ? <EditOutlined /> : "Add"}
                  </button>
                )}
              </div>
              {showCertificationsForm && (
                <div className={styles.formStack}>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder="Add one certification per line"
                    value={certificationsDraft}
                    onChange={(event) => setCertificationsDraft(event.target.value)}
                  />
                  <div className={styles.formActions}>
                    <button className={styles.primaryBtn} type="button" onClick={saveCertifications}>
                      Save
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => setShowCertificationsForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {!showCertificationsForm && certifications.length === 0 && (
                <p className={styles.emptyText}>Add certifications and courses from your CV.</p>
              )}
              {certificationsList.length > 0 && !showCertificationsForm && (
                <ul className={styles.bulletList}>
                  {certificationsList.map((cert, index) => (
                    <li key={`${cert}-${index}`} className={styles.bulletItem}>
                      {cert}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {referencesList.length > 0 && (
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>References</h2>
                </div>
                <ul className={styles.bulletList}>
                  {referencesList.map((ref, index) => (
                    <li key={`${ref}-${index}`} className={styles.bulletItem}>
                      {ref}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Recommendations</h2>
                {!showRecommendationForm && (
                  <button
                    className={styles.linkBtn}
                    type="button"
                    onClick={() => {
                      setRecommendationDraft(emptyRecommendation);
                      setShowRecommendationForm(true);
                    }}
                  >
                    Add
                  </button>
                )}
              </div>
              {showRecommendationForm && (
                <div className={styles.formStack}>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    placeholder="Recommendation quote"
                    value={recommendationDraft.quote}
                    onChange={(event) =>
                      setRecommendationDraft((prev) => ({ ...prev, quote: event.target.value }))
                    }
                  />
                  <input
                    className={styles.input}
                    placeholder="Author name"
                    value={recommendationDraft.author}
                    onChange={(event) =>
                      setRecommendationDraft((prev) => ({ ...prev, author: event.target.value }))
                    }
                  />
                  <div className={styles.formActions}>
                    <button className={styles.primaryBtn} type="button" onClick={saveRecommendation}>
                      Save
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => setShowRecommendationForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {recommendations.length === 0 && !showRecommendationForm ? (
                <p className={styles.emptyText}>Add endorsements or feedback from teammates.</p>
              ) : (
                <div className={styles.quoteList}>
                  {recommendations.map((recommendation, index) => (
                    <div key={`${recommendation.author}-${index}`} className={styles.quote}>
                      <p>{recommendation.quote}</p>
                      {recommendation.author && <span>- {recommendation.author}</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className={styles.sideCol}>
            <section className={`${styles.card} ${styles.openToCard}`}>
              <div className={styles.cardHeader}>
                <h2>Open to</h2>
                <button className={styles.linkBtn} type="button" aria-label="Edit open to">
                  <EditOutlined />
                </button>
              </div>
              <p className={styles.cardBody}>Frontend engineering, AI tooling, UI systems.</p>
            </section>

            <section className={`${styles.card} ${styles.featuredCard}`}>
              <div className={styles.cardHeader}>
                <h2>Featured</h2>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureThumb}>CV</div>
                <div>
                  <p className={styles.featureTitle}>
                    {cvLoading ? "Loading CV" : cvFile ? "Latest CV" : "No CV uploaded"}
                  </p>
                  <p className={styles.featureMeta}>
                    {cvLoading
                      ? "Fetching your most recent upload."
                      : cvError
                        ? cvError
                        : cvFile
                          ? cvMeta
                          : "Upload a CV to store it here."}
                  </p>
                  {!cvLoading && !cvError && cvFile && (
                    <a
                      className={styles.featureLink}
                      href={cvViewUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View CV
                    </a>
                  )}
                  {!cvLoading && !cvError && !cvFile && (
                    <Link className={styles.featureLink} href="/cv_extracter">
                      Upload CV
                    </Link>
                  )}
                </div>
              </div>
            </section>

            <section className={`${styles.card} ${styles.topMatchCard}`}>
              <div className={styles.cardHeader}>
                <h2>Top matched job</h2>
              </div>
              {bestMatch ? (
                <div className={styles.bestMatch}>
                  <div>
                    <p className={styles.bestMatchRole}>
                      {bestMatch.position || "Untitled role"}
                      <span className={styles.bestBadge}>{bestMatch.match_percent}% match</span>
                    </p>
                    <p className={styles.bestMatchMeta}>
                      {bestMatch.employer || "Unknown employer"}
                      {bestMatch.ref ? ` · ${bestMatch.ref}` : ""}
                    </p>
                  </div>
                  {bestMatch.url ? (
                    <a
                      className={styles.featureLink}
                      href={bestMatch.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on TopJobs
                    </a>
                  ) : null}
                </div>
              ) : (
                <p className={styles.cardBody}>No ranked job yet. Run skills ranking to view.</p>
              )}
            </section>

            <section className={`${styles.card} ${styles.skillInsightsCard}`}>
              <div className={styles.cardHeader}>
                <h2>Skill insights</h2>
              </div>
              <p className={styles.cardBody}>
                Compare your skills against live job demand and see your gap analysis.
              </p>
              <Link className={`${styles.featureLink} ${styles.skillInsightsCta}`} href="/merge-skills">
                Open merge-skills
              </Link>
            </section>

            <section className={`${styles.card} ${styles.trendsCard}`}>
              <div className={styles.cardHeader}>
                <h2>Trends</h2>
              </div>
              <p className={styles.cardBody}>
                View job and skill trends over time to spot opportunities.
              </p>
              <Link className={styles.featureLink} href="/trends">
                Open trends
              </Link>
            </section>

            <section className={`${styles.card} ${styles.allMatchesCard}`}>
              <div className={styles.cardHeader}>
                <h2>All top matches</h2>
              </div>
              {topMatches.length === 0 ? (
                <p className={styles.cardBody}>No ranked jobs yet.</p>
              ) : (
                <ul className={styles.bestList}>
                  {topMatches.map((job, idx) => (
                    <li key={`${job.ref || "job"}-${idx}`} className={styles.bestListItem}>
                      <div>
                        <p className={styles.bestListRole}>{job.position || "Untitled role"}</p>
                        <p className={styles.bestListMeta}>
                          {job.employer || "Unknown employer"}
                          {job.ref ? ` · ${job.ref}` : ""}
                        </p>
                      </div>
                      <div className={styles.bestListRight}>
                        <span className={styles.bestBadge}>{job.match_percent}%</span>
                        {job.url ? (
                          <a
                            className={styles.bestListLink}
                            href={job.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </div>
      <Modal
        title="Edit profile"
        open={isBasicsModalOpen}
        onCancel={() => setIsBasicsModalOpen(false)}
        onOk={saveBasics}
        okText="Save"
        width={640}
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        <div className={styles.modalBody}>
          <p className={styles.modalNote}>* Indicates required</p>

          <div className={styles.modalSection}>
            <h3 className={styles.modalTitle}>Name</h3>
            <div className={styles.modalRow}>
              <label className={styles.modalField}>
                <span className={styles.modalLabel}>First name*</span>
                <Input
                  value={basicsDraft.firstName}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                />
              </label>
              <label className={styles.modalField}>
                <span className={styles.modalLabel}>Last name*</span>
                <Input
                  value={basicsDraft.lastName}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                />
              </label>
            </div>
            <label className={styles.modalField}>
              <span className={styles.modalLabel}>Additional name</span>
              <Input
                value={basicsDraft.additionalName}
                onChange={(event) =>
                  setBasicsDraft((prev) => ({ ...prev, additionalName: event.target.value }))
                }
              />
            </label>
            <label className={styles.modalField}>
              <span className={styles.modalLabel}>Name pronunciation</span>
              <Input disabled placeholder="Add using mobile app" />
              <span className={styles.modalHint}>
                This can only be added using our mobile app.
              </span>
            </label>
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.modalTitle}>Headline</h3>
            <label className={styles.modalField}>
              <span className={styles.modalLabel}>Headline*</span>
              <Input.TextArea
                rows={3}
                value={basicsDraft.headline}
                onChange={(event) =>
                  setBasicsDraft((prev) => ({ ...prev, headline: event.target.value }))
                }
              />
            </label>
            <button className={styles.modalLink} type="button">Get AI suggestions</button>
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.modalTitle}>Current position</h3>
            <label className={styles.modalField}>
              <span className={styles.modalLabel}>Position*</span>
              <Input
                value={basicsDraft.position}
                onChange={(event) =>
                  setBasicsDraft((prev) => ({ ...prev, position: event.target.value }))
                }
              />
            </label>
            <button className={styles.modalLink} type="button">+ Add new position</button>
            <Checkbox
              checked={basicsDraft.showCurrentCompany}
              onChange={(event) =>
                setBasicsDraft((prev) => ({ ...prev, showCurrentCompany: event.target.checked }))
              }
            >
              Show current company in my intro
            </Checkbox>
            <label className={styles.modalField}>
              <span className={styles.modalLabel}>Industry</span>
              <Input
                value={basicsDraft.industry}
                onChange={(event) =>
                  setBasicsDraft((prev) => ({ ...prev, industry: event.target.value }))
                }
              />
            </label>
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.modalTitle}>Education</h3>
            <label className={styles.modalField}>
              <span className={styles.modalLabel}>School</span>
              <Input
                value={basicsDraft.school}
                onChange={(event) =>
                  setBasicsDraft((prev) => ({ ...prev, school: event.target.value }))
                }
              />
            </label>
            <button className={styles.modalLink} type="button">+ Add new education</button>
            <Checkbox
              checked={basicsDraft.showSchool}
              onChange={(event) =>
                setBasicsDraft((prev) => ({ ...prev, showSchool: event.target.checked }))
              }
            >
              Show school in my intro
            </Checkbox>
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.modalTitle}>Location</h3>
            <label className={styles.modalField}>
              <span className={styles.modalLabel}>Country/Region</span>
              <Input
                value={basicsDraft.country}
                onChange={(event) =>
                  setBasicsDraft((prev) => ({ ...prev, country: event.target.value }))
                }
              />
            </label>
            <label className={styles.modalField}>
              <span className={styles.modalLabel}>City</span>
              <Input
                value={basicsDraft.city}
                onChange={(event) =>
                  setBasicsDraft((prev) => ({ ...prev, city: event.target.value }))
                }
              />
            </label>
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.modalTitle}>Contact info</h3>
            <label className={styles.modalField}>
              <span className={styles.modalLabel}>Email</span>
              <Input
                value={basicsDraft.contactEmail}
                onChange={(event) =>
                  setBasicsDraft((prev) => ({ ...prev, contactEmail: event.target.value }))
                }
              />
            </label>
            <button className={styles.modalLink} type="button" aria-label="Edit contact info">
              <EditOutlined /> Contact info
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        title="Edit project"
        open={isProjectEditOpen}
        onCancel={closeProjectEdit}
        onOk={saveProjectEdit}
        okText="Save"
        width={560}
      >
        <Input.TextArea
          rows={8}
          value={projectEditDraft}
          onChange={(event) => setProjectEditDraft(event.target.value)}
          placeholder="Edit this project details"
        />
      </Modal>
        </div>
      </div>
    </div>
  );
}
