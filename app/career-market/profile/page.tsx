"use client";
import { EditOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { authHeader } from "../../../lib/auth";
import { useLogout } from "../../../hook/useLogout";
import AppSider from "../../../components/market/app-sider";
import siderStyles from "../../../components/market/app-sider.module.css";

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
  careerGuide?: any;
  careerPrep?: any;
  careerMarket?: any;
  careerEmotion?: any;
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

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const Button = ({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-3.5 text-sm",
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-card text-foreground hover:bg-muted shadow-sm",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    danger: "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
  };

  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...props} />
  );
};

const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx("rounded-2xl bg-card shadow-sm ring-1 ring-border/60", className)}
    {...props}
  />
);

const SectionCard = ({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
    <div className="mt-4">{children}</div>
  </Card>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
    {children}
  </span>
);

const TextField = ({
  label,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) => (
  <label className={cx("block space-y-1.5", className)}>
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <input
      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
      {...props}
    />
    {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
  </label>
);

const TextArea = ({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) => (
  <label className={cx("block space-y-1.5", className)}>
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <textarea
      className="min-h-[96px] w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      {...props}
    />
  </label>
);

const CheckboxField = ({
  label,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string }) => (
  <label className={cx("flex items-start gap-2 text-sm", className)}>
    <input
      type="checkbox"
      className="mt-0.5 size-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
      {...props}
    />
    <span className="text-foreground">{label}</span>
  </label>
);

const ModalShell = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  widthClassName = "max-w-2xl",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClassName?: string;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onMouseDown={onClose} />
      <div
        className={cx(
          "relative w-full overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border",
          widthClassName
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            Close
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-border/70 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

type SkillGroupKey = "Languages" | "Frameworks" | "Tools" | "Other";
const groupSkills = (skills: string[]) => {
  const languages = new Set([
    "javascript",
    "typescript",
    "python",
    "java",
    "c",
    "c++",
    "c#",
    "go",
    "rust",
    "php",
    "kotlin",
    "swift",
    "sql",
    "r",
    "dart",
  ]);
  const frameworks = new Set([
    "react",
    "next.js",
    "nextjs",
    "node.js",
    "nodejs",
    "express",
    "nestjs",
    "django",
    "flask",
    "fastapi",
    "spring",
    "spring boot",
    "laravel",
    "vue",
    "angular",
    "svelte",
    "tailwind",
  ]);
  const tools = new Set([
    "git",
    "github",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "figma",
    "jira",
    "notion",
    "postgres",
    "mysql",
    "mongodb",
    "redis",
    "linux",
  ]);

  const result: Record<SkillGroupKey, string[]> = {
    Languages: [],
    Frameworks: [],
    Tools: [],
    Other: [],
  };

  skills
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((skill) => {
      const key = skill.toLowerCase();
      if (languages.has(key)) result.Languages.push(skill);
      else if (frameworks.has(key)) result.Frameworks.push(skill);
      else if (tools.has(key)) result.Tools.push(skill);
      else result.Other.push(skill);
    });

  (Object.keys(result) as SkillGroupKey[]).forEach((k) => {
    result[k] = Array.from(new Set(result[k])).sort((a, b) => a.localeCompare(b));
  });

  return result;
};

const Timeline = ({
  items,
  emptyText,
}: {
  items: Array<{ key: string; title: string; meta?: string; body?: React.ReactNode }>;
  emptyText: string;
}) => {
  if (!items.length) return <p className="text-sm text-muted-foreground">{emptyText}</p>;

  return (
    <ol className="relative space-y-5 border-l border-border/70 pl-6">
      {items.map((item) => (
        <li key={item.key} className="relative">
          <span className="absolute -left-[9px] top-1.5 grid size-4 place-items-center rounded-full bg-primary/15 ring-2 ring-primary/20">
            <span className="size-1.5 rounded-full bg-primary" />
          </span>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-foreground">{item.title}</div>
              {item.meta ? <div className="text-xs text-muted-foreground">{item.meta}</div> : null}
            </div>
            {item.body ? <div className="text-sm text-foreground/90">{item.body}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useLogout();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showCVAd, setShowCVAd] = useState(true);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
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

  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [editingRecommendationIndex, setEditingRecommendationIndex] = useState<number | null>(null);

  const [skills, setSkills] = useState<string[]>([]);
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState("");

  const [projects, setProjects] = useState<string[]>([]);
  const [showProjectsForm, setShowProjectsForm] = useState(false);
  const [projectsDraft, setProjectsDraft] = useState("");

  const [certifications, setCertifications] = useState<string[]>([]);
  const [showCertificationsForm, setShowCertificationsForm] = useState(false);
  const [certificationsDraft, setCertificationsDraft] = useState("");


  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [recommendationDraft, setRecommendationDraft] = useState<Recommendation>(
    emptyRecommendation
  );
  const [careerGuide, setCareerGuide] = useState<any>(null);
  const [careerPrep, setCareerPrep] = useState<any>(null);
  const [careerMarket, setCareerMarket] = useState<any>(null);
  const [careerEmotion, setCareerEmotion] = useState<any>(null);
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [projectEditDraft, setProjectEditDraft] = useState("");
  const [projectEditRange, setProjectEditRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [bestMatch, setBestMatch] = useState<BestMatch | null>(null);
  const [topMatches, setTopMatches] = useState<TopMatch[]>([]);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);

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

  const handleOpenMergeSkills = async () => {
    if (mergeLoading) return;
    setMergeLoading(true);
    setMergeError(null);
    const keyword = basics.position.trim();
    let shouldNavigate = true;

    try {
      const res = await fetch(`${API_BASE}/jobs/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          keyword,
          userSkills: skills.map((skill) => skill.trim()).filter(Boolean),
          force: false,
        }),
        cache: "no-store",
      });
      if (res.status === 401) {
        shouldNavigate = false;
        router.push("/Auth/login");
        return;
      }
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        setMergeError(detail?.detail || "Unable to refresh jobs. Showing last saved data.");
      }
    } catch {
      setMergeError("Unable to refresh jobs. Showing last saved data.");
    } finally {
      setMergeLoading(false);
      if (shouldNavigate) {
        router.push("/career-market/merge-skills");
      }
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
          router.push("/Auth/login");
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
        setCareerGuide(data?.careerGuide || null);
        setCareerPrep(data?.careerPrep || null);
        setCareerMarket(data?.careerMarket || null);
        setCareerEmotion(data?.careerEmotion || null);
      } catch {
        // No-op; use local defaults.
      } finally {
        if (!ignore) setIsPageLoading(false);
      }
    };

    loadProfile();
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
    const nextExperiences =
      editingExperienceIndex === null
        ? [...experiences, experienceDraft]
        : experiences.map((item, index) =>
          index === editingExperienceIndex ? experienceDraft : item
        );
    setExperiences(nextExperiences);
    setExperienceDraft(emptyExperience);
    setShowExperienceForm(false);
    setEditingExperienceIndex(null);
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
    const parsed = parseLineItems(skillsDraft);
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
      .map((line) => line.replace(/^[-*â€¢\u2022]\s*/, "").trim())
      .filter(Boolean);

  const saveRecommendation = () => {
    const hasContent = recommendationDraft.quote.trim() || recommendationDraft.author.trim();
    if (!hasContent) return;
    const nextRecommendations =
      editingRecommendationIndex === null
        ? [...recommendations, recommendationDraft]
        : recommendations.map((item, index) =>
          index === editingRecommendationIndex ? recommendationDraft : item
        );
    setRecommendations(nextRecommendations);
    setRecommendationDraft(emptyRecommendation);
    setShowRecommendationForm(false);
    setEditingRecommendationIndex(null);
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

  const skillGroups = useMemo(() => groupSkills(skills), [skills]);
  const [expandedSkillGroups, setExpandedSkillGroups] = useState<
    Partial<Record<SkillGroupKey, boolean>>
  >({});

  if (isPageLoading) {
    return (
      <div className={siderStyles.siderLayout}>
        <AppSider variant="light" />
        <div className={siderStyles.siderContent}>
          <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center">
            <div className="relative flex justify-center items-center">
              <div className="absolute animate-ping w-24 h-24 rounded-full bg-blue-400 opacity-20"></div>
              <div className="absolute animate-pulse w-20 h-20 rounded-full bg-indigo-400 opacity-40"></div>
              <div className="relative z-10 w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 animate-bounce">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-10 space-y-2 text-center">
              <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">Gathering Your Profile</h3>
              <p className="text-sm text-gray-500 font-medium animate-pulse">Loading your skills and experiences...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isProfileIncomplete = skills.length === 0 && experiences.length === 0 && educationItems.length === 0;
  const shouldShowAd = showCVAd && isProfileIncomplete;

  return (
    <div className={siderStyles.siderLayout}>
      <AppSider variant="light" />
      <div className={siderStyles.siderContent}>
        <div className="min-h-screen bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
            {shouldShowAd && (
              <Card className="p-5 relative mb-6">
                <button
                  onClick={() => setShowCVAd(false)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close ad"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pr-8">
                  <div>
                    <h2 className="mt-1 text-base font-semibold tracking-tight">Auto-fill from your CV</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Paste your resume once. We’ll pre-fill sections and keep your profile consistent.
                    </p>
                  </div>
                  <Link href="/career-market/cv_extracter">
                    <Button variant="primary">Open CV extractor</Button>
                  </Link>
                </div>
              </Card>
            )}

            <Card className="p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/15">
                      {(basics.firstName?.[0] || "J") + (basics.lastName?.[0] || "D")}
                    </div>

                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h1 className="truncate text-xl font-semibold tracking-tight">{displayName}</h1>
                      <span className="text-sm text-muted-foreground">
                        {basics.position || "Add current position"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {basics.headline || "Add a headline that shows your direction"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{metaLine}</span>
                      <span className="text-border">•</span>
                      <span>{basics.contactEmail || "Add contact email"}</span>
                    </div>
                  </div>
                </div>

                <div className="relative" ref={settingsRef}>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen((prev) => !prev)}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-background hover:bg-muted transition-colors"
                    title="Settings"
                    aria-label="Open settings menu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>

                  {isSettingsOpen && (
                    <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-border bg-background shadow-lg py-1 animate-in fade-in slide-in-from-top-2">
                      <button
                        type="button"
                        onClick={() => { openBasicsModal(); setIsSettingsOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                      >
                        <EditOutlined className="text-muted-foreground" />
                        Edit Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => { resetSections(); setIsSettingsOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        Reset Sections
                      </button>
                      <div className="my-1 border-t border-border" />
                      <button
                        type="button"
                        onClick={() => { logout(); setIsSettingsOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/40 px-4 py-3 ring-1 ring-border/60">
                  <p className="text-xs font-medium text-muted-foreground">Current</p>
                  <p className="mt-1 text-sm font-medium">
                    {basics.showCurrentCompany ? basics.position || "Add position" : "Hidden"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/40 px-4 py-3 ring-1 ring-border/60">
                  <p className="text-xs font-medium text-muted-foreground">Education</p>
                  <p className="mt-1 text-sm font-medium">
                    {basics.showSchool ? basics.school || "Add education" : "Hidden"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/40 px-4 py-3 ring-1 ring-border/60">
                  <p className="text-xs font-medium text-muted-foreground">Focus</p>
                  <p className="mt-1 text-sm font-medium">{basics.industry || "Choose an industry"}</p>
                </div>
              </div>
            </Card>

            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              <main className="space-y-6 lg:col-span-8">
                <SectionCard
                  title="About"
                  description="A short summary that helps recruiters understand your goals."
                  actions={
                    !isEditingAbout ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAboutDraft(about);
                          setIsEditingAbout(true);
                        }}
                      >
                        {about ? "Edit" : "Add"}
                      </Button>
                    ) : null
                  }
                >
                  {isEditingAbout ? (
                    <div className="space-y-3">
                      <TextArea
                        label="Summary"
                        rows={4}
                        value={aboutDraft}
                        onChange={(event) => setAboutDraft(event.target.value)}
                        placeholder="Example: Final-year IT student focused on frontend engineering and AI toolsâ€¦"
                      />
                      <div className="flex items-center gap-2">
                        <Button variant="primary" onClick={saveAbout}>
                          Save
                        </Button>
                        <Button variant="ghost" onClick={() => setIsEditingAbout(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/90">
                      {about ||
                        "Tell employers what you're learning right now and what kind of opportunities you want."}
                    </p>
                  )}
                </SectionCard>

                <SectionCard
                  title="Experience"
                  description="Roles, internships, or leadership experiences."
                  actions={
                    !showExperienceForm ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setExperienceDraft(emptyExperience);
                          setEditingExperienceIndex(null);
                          setShowExperienceForm(true);
                        }}
                      >
                        Add
                      </Button>
                    ) : null
                  }
                >
                  {showExperienceForm ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextField
                          label="Role"
                          value={experienceDraft.role}
                          onChange={(event) =>
                            setExperienceDraft((prev) => ({ ...prev, role: event.target.value }))
                          }
                          placeholder="Frontend Intern"
                        />
                        <TextField
                          label="Company"
                          value={experienceDraft.company}
                          onChange={(event) =>
                            setExperienceDraft((prev) => ({ ...prev, company: event.target.value }))
                          }
                          placeholder="Company / Organization"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextField
                          label="Type"
                          value={experienceDraft.type}
                          onChange={(event) =>
                            setExperienceDraft((prev) => ({ ...prev, type: event.target.value }))
                          }
                          placeholder="Internship / Part-time"
                        />
                        <TextField
                          label="Dates"
                          value={experienceDraft.dates}
                          onChange={(event) =>
                            setExperienceDraft((prev) => ({ ...prev, dates: event.target.value }))
                          }
                          placeholder="2025 — 2026"
                        />
                      </div>
                      <TextArea
                        label="Summary (bullets supported)"
                        rows={3}
                        value={experienceDraft.summary}
                        onChange={(event) =>
                          setExperienceDraft((prev) => ({ ...prev, summary: event.target.value }))
                        }
                        placeholder="- Shipped X feature\n- Improved Y by 30%"
                      />
                      <div className="flex items-center gap-2">
                        <Button variant="primary" onClick={saveExperience}>
                          Save
                        </Button>
                        <Button variant="ghost" onClick={() => setShowExperienceForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className={cx(showExperienceForm ? "mt-6" : "")}>
                    <Timeline
                      emptyText="Add your most recent roles and accomplishments."
                      items={experiences.map((experience) => {
                        const title = experience.role || "Role";
                        const meta = [
                          experience.company || "Company",
                          experience.type ? experience.type : "",
                          experience.dates ? experience.dates : "",
                        ]
                          .filter(Boolean)
                          .join(" · ");
                        const bullets = experience.summary ? splitBullets(experience.summary) : [];
                        const body =
                          bullets.length > 1 ? (
                            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
                              {bullets.map((bullet, index) => (
                                <li key={`${title}-${index}`}>{bullet}</li>
                              ))}
                            </ul>
                          ) : experience.summary ? (
                            <p className="text-sm text-foreground/90">{experience.summary}</p>
                          ) : undefined;
                        return {
                          key: `${experience.role}-${experience.company}-${experience.dates}`,
                          title,
                          meta,
                          body,
                        };
                      })}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Education"
                  description="University, courses, and other learning milestones."
                  actions={
                    !showEducationForm ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEducationDraft(emptyEducation);
                          setEditingEducationIndex(null);
                          setShowEducationForm(true);
                        }}
                      >
                        Add
                      </Button>
                    ) : null
                  }
                >
                  {showEducationForm ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextField
                          label="School"
                          value={educationDraft.school}
                          onChange={(event) =>
                            setEducationDraft((prev) => ({ ...prev, school: event.target.value }))
                          }
                          placeholder="University"
                        />
                        <TextField
                          label="Degree"
                          value={educationDraft.degree}
                          onChange={(event) =>
                            setEducationDraft((prev) => ({ ...prev, degree: event.target.value }))
                          }
                          placeholder="BSc in IT"
                        />
                      </div>
                      <TextField
                        label="Dates"
                        value={educationDraft.dates}
                        onChange={(event) =>
                          setEducationDraft((prev) => ({ ...prev, dates: event.target.value }))
                        }
                        placeholder="2022 — 2026"
                      />
                      <div className="flex items-center gap-2">
                        <Button variant="primary" onClick={saveEducation}>
                          Save
                        </Button>
                        <Button variant="ghost" onClick={() => setShowEducationForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className={cx(showEducationForm ? "mt-6" : "")}>
                    <Timeline
                      emptyText="Add your university or certifications that matter for your goal."
                      items={educationItems.map((education) => ({
                        key: `${education.school}-${education.degree}-${education.dates}`,
                        title: education.school || "School",
                        meta: education.dates || "",
                        body: education.degree ? <p>{education.degree}</p> : undefined,
                      }))}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Skills"
                  description="Grouped to reduce clutter and help matching."
                  actions={
                    !showSkillsForm ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSkillsDraft(skills.join("\n"));
                          setShowSkillsForm(true);
                        }}
                      >
                        {skills.length ? "Edit" : "Add"}
                      </Button>
                    ) : null
                  }
                >
                  {showSkillsForm ? (
                    <div className="space-y-3">
                      <TextArea
                        label="Skills (one per line)"
                        rows={5}
                        value={skillsDraft}
                        onChange={(event) => setSkillsDraft(event.target.value)}
                        placeholder="React\nNext.js\nTypeScript"
                      />
                      <div className="flex items-center gap-2">
                        <Button variant="primary" onClick={saveSkills}>
                          Save
                        </Button>
                        <Button variant="ghost" onClick={() => setShowSkillsForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : skills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      List the tools you are comfortable using. We’ll match them to jobs.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {(Object.keys(skillGroups) as SkillGroupKey[]).map((groupKey) => {
                        const groupItems = skillGroups[groupKey];
                        if (!groupItems.length) return null;
                        const expanded = Boolean(expandedSkillGroups[groupKey]);
                        const visible = expanded ? groupItems : groupItems.slice(0, 10);
                        const hasMore = groupItems.length > visible.length;

                        return (
                          <div key={groupKey}>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold text-muted-foreground">{groupKey}</p>
                              {hasMore ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    setExpandedSkillGroups((prev) => ({
                                      ...prev,
                                      [groupKey]: !expanded,
                                    }))
                                  }
                                >
                                  {expanded ? "Show less" : `Show more (${groupItems.length})`}
                                </Button>
                              ) : null}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {visible.map((skill) => (
                                <Pill key={`${groupKey}-${skill}`}>{skill}</Pill>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Projects"
                  description="Short, scannable cards with tech highlights."
                  actions={
                    !showProjectsForm ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setProjectsDraft(projects.join("\n"));
                          setShowProjectsForm(true);
                        }}
                      >
                        {projects.length ? "Edit" : "Add"}
                      </Button>
                    ) : null
                  }
                >
                  {showProjectsForm ? (
                    <div className="space-y-3">
                      <TextArea
                        label="Projects (paste lines)"
                        rows={6}
                        value={projectsDraft}
                        onChange={(event) => setProjectsDraft(event.target.value)}
                        placeholder="Project title\nTech stack: ...\nDescription: ...\nhttps://..."
                      />
                      <div className="flex items-center gap-2">
                        <Button variant="primary" onClick={saveProjects}>
                          Save
                        </Button>
                        <Button variant="ghost" onClick={() => setShowProjectsForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : organizedProjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Showcase 2â€“4 projects that match the roles you're targeting.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {organizedProjects.map((project, idx) => {
                        const title = project.title || "Project";
                        const techDetail = project.details.find((d) => isTechLabel(d.label));
                        const descriptionDetail =
                          project.details.find((d) => /description|summary|objective/i.test(d.label || "")) ||
                          project.details.find((d) => !d.label && isLikelyDescription(d.text));
                        const techStack = techDetail?.text
                          ? techDetail.text
                            .split(/,|Â·|\|/)
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .slice(0, 6)
                          : [];

                        return (
                          <Card key={`${title}-${idx}`} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{title}</p>
                                {descriptionDetail?.text ? (
                                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                    {descriptionDetail.text}
                                  </p>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openProjectEdit(project)}
                                >
                                  Edit
                                </Button>
                                {project.link ? (
                                  <a href={project.link} target="_blank" rel="noreferrer">
                                    <Button size="sm" variant="secondary">
                                      View
                                    </Button>
                                  </a>
                                ) : null}
                              </div>
                            </div>

                            {techStack.length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {techStack.map((t) => (
                                  <Pill key={`${title}-${t}`}>{t}</Pill>
                                ))}
                              </div>
                            ) : null}

                            {project.details.length ? (
                              <ul className="mt-3 space-y-1 text-sm text-foreground/90">
                                {project.details
                                  .filter((d) => d !== techDetail && d !== descriptionDetail)
                                  .slice(0, 2)
                                  .map((detail, index) => (
                                    <li key={`${title}-${index}`} className="text-muted-foreground">
                                      {detail.label ? (
                                        <span className="font-medium text-foreground">{detail.label}:</span>
                                      ) : null}{" "}
                                      {detail.text}
                                    </li>
                                  ))}
                              </ul>
                            ) : null}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Certifications"
                  description="Certificates, awards, and references."
                  actions={
                    !showCertificationsForm ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCertificationsDraft(certifications.join("\n"));
                          setShowCertificationsForm(true);
                        }}
                      >
                        {certifications.length ? "Edit" : "Add"}
                      </Button>
                    ) : null
                  }
                >
                  {showCertificationsForm ? (
                    <div className="space-y-3">
                      <TextArea
                        label="Items (one per line)"
                        rows={4}
                        value={certificationsDraft}
                        onChange={(event) => setCertificationsDraft(event.target.value)}
                        placeholder="AWS Cloud Practitioner\nGoogle UX Design Certificate"
                      />
                      <div className="flex items-center gap-2">
                        <Button variant="primary" onClick={saveCertifications}>
                          Save
                        </Button>
                        <Button variant="ghost" onClick={() => setShowCertificationsForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : certificationsList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add certifications, licenses, or awards that boost your profile.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {certificationsList.map((cert, idx) => (
                          <li
                            key={`${cert}-${idx}`}
                            className="rounded-xl bg-muted/40 px-3 py-2 text-sm ring-1 ring-border/60"
                          >
                            {cert}
                          </li>
                        ))}
                      </ul>

                      {referencesList.length ? (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">References</p>
                          <ul className="mt-2 grid gap-2">
                            {referencesList.map((reference, idx) => (
                              <li
                                key={`${reference}-${idx}`}
                                className="rounded-xl bg-muted/40 px-3 py-2 text-sm ring-1 ring-border/60"
                              >
                                {reference}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Recommendations"
                  description="Feedback that builds trust (short and specific)."
                  actions={
                    !showRecommendationForm ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRecommendationDraft(emptyRecommendation);
                          setEditingRecommendationIndex(null);
                          setShowRecommendationForm(true);
                        }}
                      >
                        Add
                      </Button>
                    ) : null
                  }
                >
                  {showRecommendationForm ? (
                    <div className="space-y-3">
                      <TextArea
                        label="Quote"
                        rows={4}
                        value={recommendationDraft.quote}
                        onChange={(event) =>
                          setRecommendationDraft((prev) => ({ ...prev, quote: event.target.value }))
                        }
                        placeholder="â€œStrong ownership and great communicationâ€¦â€"
                      />
                      <TextField
                        label="Author"
                        value={recommendationDraft.author}
                        onChange={(event) =>
                          setRecommendationDraft((prev) => ({ ...prev, author: event.target.value }))
                        }
                        placeholder="Name, Title"
                      />
                      <div className="flex items-center gap-2">
                        <Button variant="primary" onClick={saveRecommendation}>
                          Save
                        </Button>
                        <Button variant="ghost" onClick={() => setShowRecommendationForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {recommendations.length === 0 && !showRecommendationForm ? (
                    <p className="text-sm text-muted-foreground">
                      Add endorsements or feedback from teammates.
                    </p>
                  ) : recommendations.length ? (
                    <div className="space-y-3">
                      {recommendations.map((recommendation, index) => (
                        <Card key={`${recommendation.author}-${index}`} className="p-4">
                          <p className="text-sm text-foreground/90">{recommendation.quote}</p>
                          {recommendation.author ? (
                            <p className="mt-2 text-xs font-medium text-muted-foreground">â€” {recommendation.author}</p>
                          ) : null}
                        </Card>
                      ))}
                    </div>
                  ) : null}
                </SectionCard>
              </main>

              <aside className="space-y-6 lg:col-span-4">
                <SectionCard
                  title="Open to"
                  description="Helps the AI tailor guidance and matches."
                  actions={
                    <Button size="sm" variant="ghost" aria-label="Edit open to">
                      <EditOutlined />
                    </Button>
                  }
                >
                  <p className="text-sm text-foreground/90">Frontend engineering, AI tooling, UI systems.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill>Internships</Pill>
                    <Pill>Junior roles</Pill>
                    <Pill>Remote / Hybrid</Pill>
                  </div>
                </SectionCard>


                <SectionCard title="Recommendations" description="Tailored career guidance and insights.">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-indigo-500/10 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-500/15">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {careerGuide?.top_1_prediction ? "AI Career Guide" : "No recommendations"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {careerGuide?.top_1_prediction
                          ? `Top match: ${careerGuide.top_1_prediction}`
                          : "Get tailored roadmaps and market insights."}
                      </p>
                      <div className="mt-3">
                        <Link href="/recommendation">
                          <Button size="sm" variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-indigo-200 shadow-lg">
                            {careerGuide?.top_1_prediction ? "Open Insights" : "Generate Now"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Top matched job" description="Based on your skills + target role.">
                  {bestMatch ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{bestMatch.position || "Untitled role"}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {bestMatch.employer || "Unknown employer"}
                            {bestMatch.ref ? ` Â· ${bestMatch.ref}` : ""}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
                          {bestMatch.match_percent}% match
                        </span>
                      </div>
                      {bestMatch.url ? (
                        <a href={bestMatch.url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="secondary">
                            View
                          </Button>
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No ranked job yet. Run skill insights to generate matches.
                    </p>
                  )}
                </SectionCard>

                <SectionCard title="Skill insights" description="Gap analysis and job demand signals.">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Compare your skills against live job demand and see what to learn next.
                    </p>
                    <Button variant="primary" onClick={handleOpenMergeSkills} disabled={mergeLoading}>
                      {mergeLoading ? "Running analysis..." : "Open skill insights"}
                    </Button>
                    {mergeError ? <p className="text-sm text-destructive">{mergeError}</p> : null}
                  </div>
                </SectionCard>

                <SectionCard title="Trends" description="Track skills and roles over time.">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">Spot opportunities early.</p>
                    <Link href="/career-market/trends">
                      <Button size="sm" variant="secondary">
                        Open
                      </Button>
                    </Link>
                  </div>
                </SectionCard>

                <SectionCard title="All matches" description="Your top saved job matches.">
                  {topMatches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No ranked jobs yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {topMatches.slice(0, 6).map((job, idx) => (
                        <li
                          key={`${job.ref || "job"}-${idx}`}
                          className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2 ring-1 ring-border/60"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{job.position || "Untitled role"}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {job.employer || "Unknown employer"}
                              {job.ref ? ` Â· ${job.ref}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/15">
                              {job.match_percent}%
                            </span>
                            {job.url ? (
                              <a href={job.url} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="ghost">
                                  View
                                </Button>
                              </a>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              </aside>
            </div>
          </div>

          <ModalShell
            open={isBasicsModalOpen}
            title="Edit profile"
            description="Update the basics shown on your public profile."
            onClose={() => setIsBasicsModalOpen(false)}
            footer={
              <>
                <Button variant="ghost" onClick={() => setIsBasicsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={saveBasics}>
                  Save changes
                </Button>
              </>
            }
          >
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground">* Indicates required</p>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Name</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="First name*"
                    value={basicsDraft.firstName}
                    onChange={(event) =>
                      setBasicsDraft((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                  />
                  <TextField
                    label="Last name*"
                    value={basicsDraft.lastName}
                    onChange={(event) =>
                      setBasicsDraft((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                  />
                </div>
                <TextField
                  label="Additional name"
                  value={basicsDraft.additionalName}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({ ...prev, additionalName: event.target.value }))
                  }
                />
                <TextField
                  label="Name pronunciation"
                  disabled
                  placeholder="Add using mobile app"
                  hint="This can only be added using our mobile app."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold">Headline</h4>
                  <Button size="sm" variant="ghost" type="button">
                    Get AI suggestions
                  </Button>
                </div>
                <TextArea
                  label="Headline*"
                  rows={3}
                  value={basicsDraft.headline}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({ ...prev, headline: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Current position</h4>
                <TextField
                  label="Position*"
                  value={basicsDraft.position}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({ ...prev, position: event.target.value }))
                  }
                />
                <Button size="sm" variant="ghost" type="button">
                  + Add new position
                </Button>
                <CheckboxField
                  label="Show current company in my intro"
                  checked={basicsDraft.showCurrentCompany}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({
                      ...prev,
                      showCurrentCompany: event.currentTarget.checked,
                    }))
                  }
                />
                <TextField
                  label="Industry"
                  value={basicsDraft.industry}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({ ...prev, industry: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Education</h4>
                <TextField
                  label="School"
                  value={basicsDraft.school}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({ ...prev, school: event.target.value }))
                  }
                />
                <Button size="sm" variant="ghost" type="button">
                  + Add new education
                </Button>
                <CheckboxField
                  label="Show school in my intro"
                  checked={basicsDraft.showSchool}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({
                      ...prev,
                      showSchool: event.currentTarget.checked,
                    }))
                  }
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Location</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Country/Region"
                    value={basicsDraft.country}
                    onChange={(event) =>
                      setBasicsDraft((prev) => ({ ...prev, country: event.target.value }))
                    }
                  />
                  <TextField
                    label="City"
                    value={basicsDraft.city}
                    onChange={(event) =>
                      setBasicsDraft((prev) => ({ ...prev, city: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Contact</h4>
                <TextField
                  label="Email"
                  value={basicsDraft.contactEmail}
                  onChange={(event) =>
                    setBasicsDraft((prev) => ({ ...prev, contactEmail: event.target.value }))
                  }
                />
                <Button size="sm" variant="ghost" type="button" aria-label="Edit contact info">
                  <EditOutlined /> Contact info
                </Button>
              </div>
            </div>
          </ModalShell>

          <ModalShell
            open={isProjectEditOpen}
            title="Edit project"
            description="Edits the raw lines for this project entry."
            onClose={closeProjectEdit}
            widthClassName="max-w-xl"
            footer={
              <>
                <Button variant="ghost" onClick={closeProjectEdit}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={saveProjectEdit}>
                  Save
                </Button>
              </>
            }
          >
            <TextArea
              label="Project details"
              rows={8}
              value={projectEditDraft}
              onChange={(event) => setProjectEditDraft(event.target.value)}
              placeholder="Edit this project details"
            />
          </ModalShell>
        </div>
      </div>
    </div>
  );
}
