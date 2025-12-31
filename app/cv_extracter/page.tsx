"use client";

import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";
import type { UploadProps } from "antd";
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Empty,
  Image,
  Layout,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  CheckCircleFilled,
  CopyOutlined,
  DownloadOutlined,
  InboxOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type FileInfo = {
  file?: File;
  preview?: string;
  error?: string;
};

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

type ParsedContacts = {
  emails?: string[];
  phones?: string[];
  urls?: string[];
  linkedin?: string[];
  github?: string[];
};

type ParsedCv = {
  name?: string | null;
  title?: string | null;
  contacts?: ParsedContacts | null;
  skills?: string[] | null;
  sections?: Record<string, string> | null;
  raw_text?: string | null;
  meta?: {
    method?: string;
    quality?: {
      char_count?: number;
      line_count?: number;
    };
  } | null;
  cvId?: string | null;
};

const emptyProfile: ProfilePayload = {
  basics: {
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
  },
  about: "",
  experiences: [],
  educationItems: [],
  skills: [],
  projects: [],
  certifications: [],
  recommendations: [],
};

const cleanText = (value?: string | null) => (typeof value === "string" ? value.trim() : "");

const limitText = (value: string, max = 800) => {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
};

const splitName = (value?: string | null) => {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return { firstName: "", lastName: "", additionalName: "" };
  }

  if (cleaned.includes(",")) {
    const [lastName, rest] = cleaned.split(",").map((part) => part.trim());
    const restTokens = rest ? rest.split(/\s+/).filter(Boolean) : [];
    return {
      firstName: restTokens[0] || "",
      lastName: lastName || "",
      additionalName: restTokens.slice(1).join(" "),
    };
  }

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length === 1) {
    return { firstName: tokens[0], lastName: "", additionalName: "" };
  }
  if (tokens.length === 2) {
    return { firstName: tokens[0], lastName: tokens[1], additionalName: "" };
  }
  return {
    firstName: tokens[0],
    lastName: tokens[tokens.length - 1],
    additionalName: tokens.slice(1, -1).join(" "),
  };
};

const parseSkillsText = (text: string) =>
  text
    .split(/\n|,|;|\u2022/)
    .map((skill) => skill.trim())
    .filter(Boolean);

const isUrlContinuation = (value: string) =>
  /^[?&]|^m=|^t=/i.test(value.trim());

const stripUrlContinuationPrefix = (value: string) => {
  if (!isUrlContinuation(value)) return value;
  const stripped = value.replace(/^(?:[?&]|m=|t=)\S*(?:[.,]\s+|\s+)/i, "");
  return stripped.trim() ? stripped.trim() : "";
};

const parseSectionList = (text: string) =>
  text
    .split(/\n{2,}/)
    .flatMap((chunk) => chunk.split(/\n/))
    .map((line) => line.replace(/^(?:[-*]|\u2022)\s*/, "").trim())
    .map((line) => stripUrlContinuationPrefix(line))
    .filter(Boolean);

const extractDates = (text: string) => {
  const patterns = [
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*(?:-|-|to)\s*(?:Present|Current|\d{4})/i,
    /\b(19|20)\d{2}\s*(?:-|-|to)\s*(?:Present|Current|(19|20)\d{2})/i,
    /\b(19|20)\d{2}\b/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return "";
};

const extractRoleCompany = (line: string) => {
  const firstSentence = line.split(".")[0].trim();
  if (!firstSentence) return { role: "", company: "" };
  if (firstSentence.includes(" at ")) {
    const [role, company] = firstSentence.split(" at ");
    return { role: role.trim(), company: company.trim() };
  }
  if (firstSentence.includes(" - ")) {
    const [role, company] = firstSentence.split(" - ");
    return { role: role.trim(), company: company.trim() };
  }
  if (firstSentence.includes(" | ")) {
    const [role, company] = firstSentence.split(" | ");
    return { role: role.trim(), company: company.trim() };
  }
  return { role: firstSentence.trim(), company: "" };
};

const buildExperiences = (text: string): Experience[] => {
  const chunks = text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  return chunks.map((chunk) => {
    const lines = chunk.split(/\n/).map((line) => line.trim()).filter(Boolean);
    const { role, company } = extractRoleCompany(lines[0] || "");
    const dates = extractDates(chunk);
    const summaryLines = lines.slice(1).filter((line) => line !== dates);
    return {
      role,
      company,
      type: "",
      dates,
      summary: summaryLines.join("\n") || chunk,
    };
  });
};

const buildEducationItems = (text: string): Education[] => {
  const chunks = text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk) => {
    const lines = chunk.split(/\n/).map((line) => line.trim()).filter(Boolean);
    const dates = extractDates(chunk);
    const filtered = dates ? lines.filter((line) => line !== dates) : lines;
    if (filtered.length <= 1) {
      return { school: "", degree: filtered[0] || "", dates };
    }
    return {
      school: filtered[0] || "",
      degree: filtered.slice(1).join(" "),
      dates,
    };
  });
};

const normalizeProfile = (profile?: Partial<ProfilePayload> | null): ProfilePayload => {
  if (!profile) return emptyProfile;
  return {
    ...emptyProfile,
    ...profile,
    basics: {
      ...emptyProfile.basics,
      ...(profile.basics ?? {}),
    },
    experiences: Array.isArray(profile.experiences) ? profile.experiences : [],
    educationItems: Array.isArray(profile.educationItems) ? profile.educationItems : [],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    projects: Array.isArray(profile.projects) ? profile.projects : [],
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    recommendations: Array.isArray(profile.recommendations) ? profile.recommendations : [],
  };
};

const buildProfileFromParsed = (
  parsed: ParsedCv,
  existing?: Partial<ProfilePayload> | null
): ProfilePayload => {
  const base = normalizeProfile(existing);
  const nameParts = splitName(parsed.name);
  const headline = cleanText(parsed.title);
  const summaryText = cleanText(parsed.sections?.summary);
  const experienceText = cleanText(parsed.sections?.experience);
  const educationText = cleanText(parsed.sections?.education);
  const skillsText = cleanText(parsed.sections?.skills);
  const projectsText = cleanText(parsed.sections?.projects || parsed.sections?.project);
  const certificationsText = cleanText(
    parsed.sections?.certifications || parsed.sections?.certification
  );
  const parsedSkills = Array.isArray(parsed.skills) ? parsed.skills : [];
  const skillsFromText = skillsText ? parseSkillsText(skillsText) : [];
  const contactEmail = parsed.contacts?.emails?.[0] || "";

  const nextBasics: Basics = {
    ...base.basics,
    firstName: nameParts.firstName || base.basics.firstName,
    lastName: nameParts.lastName || base.basics.lastName,
    additionalName: nameParts.additionalName || base.basics.additionalName,
    headline: headline || base.basics.headline,
    position: headline || base.basics.position,
    contactEmail: contactEmail || base.basics.contactEmail,
  };

  const nextAbout =
    summaryText || base.about || limitText(cleanText(parsed.raw_text), 800);

  const nextExperiences = experienceText ? buildExperiences(experienceText) : base.experiences;
  const nextEducation = educationText ? buildEducationItems(educationText) : base.educationItems;
  const nextSkills =
    parsedSkills.length > 0
      ? parsedSkills
      : skillsFromText.length > 0
        ? skillsFromText
        : base.skills;
  const nextProjects = projectsText ? parseSectionList(projectsText) : base.projects;
  const nextCertifications = certificationsText
    ? parseSectionList(certificationsText)
    : base.certifications;

  if (!nextBasics.school && nextEducation.length > 0) {
    nextBasics.school = nextEducation[0].school || nextEducation[0].degree;
  }

  return {
    basics: nextBasics,
    about: nextAbout,
    experiences: nextExperiences,
    educationItems: nextEducation,
    skills: nextSkills,
    projects: nextProjects,
    certifications: nextCertifications,
    recommendations: base.recommendations,
  };
};

export default function Profile() {
  const [fileInfo, setFileInfo] = useState<FileInfo>({});
  const [parsed, setParsed] = useState<ParsedCv | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [showJson, setShowJson] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const sampleParsed = {
    name: "Jane Developer",
    title: "AI Engineer",
    contacts: {
      emails: ["jane@example.com"],
      phones: ["+1 555 0100"],
      urls: ["https://jane.dev"],
      linkedin: ["https://linkedin.com/in/jane"],
      github: ["https://github.com/jane"],
    },
    skills: ["Python", "Machine Learning", "NLP", "Pandas", "PyTorch"],
    sections: {
      experience: "Senior AI Engineer at ExampleCorp. Built models.",
      education: "M.S. Computer Science",
    },
    raw_text: "Sample extracted text...",
    meta: { method: "sample", quality: { char_count: 420, line_count: 25 } },
  };

  const handleFile = (file: File) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      setFileInfo({ error: "Only PDF or image files are allowed." });
      return;
    }

    const preview = isImage ? URL.createObjectURL(file) : undefined;
    setFileInfo((prev) => {
      if (prev.preview) URL.revokeObjectURL(prev.preview);
      return { file, preview, error: undefined };
    });
    setParsed(null);
    setApiError(null);
    setStatus("idle");
    setShowJson(true);
  };

  const clearFile = () => {
    setFileInfo((prev) => {
      if (prev.preview) URL.revokeObjectURL(prev.preview);
      return {};
    });
    setParsed(null);
    setApiError(null);
    setStatus("idle");
  };

  useEffect(() => {
    return () => {
      if (fileInfo.preview) URL.revokeObjectURL(fileInfo.preview);
    };
  }, [fileInfo.preview]);

  const sizeLabel = useMemo(() => {
    if (!fileInfo.file) return "";
    const kb = fileInfo.file.size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }, [fileInfo.file]);

  const parseOnServer = async () => {
    if (!fileInfo.file) {
      setApiError("Select a file first.");
      setStatus("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInfo.file);

    setApiError(null);
    setStatus("loading");

    try {
      const res = await fetch(`${API_BASE}/parse`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        const messageText = data?.error || "Failed to parse CV";
        const detail = data?.detail ? ` - ${data.detail}` : "";
        throw new Error(`${messageText}${detail}`);
      }
      setParsed(data);
      setStatus("done");
      setShowJson(true);
    } catch (err: any) {
      setStatus("error");
      setApiError(err?.message || "Failed to parse CV");
    }
  };

  const copyJson = async () => {
    if (!parsed) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
      messageApi.success("Copied to clipboard");
    } catch (err) {
      messageApi.error("Failed to copy");
    }
  };

  const downloadJson = () => {
    if (!parsed) return;
    const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${parsed.name ? parsed.name.replace(/\s+/g, "_").toLowerCase() : "cv_extracter"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const useSampleData = () => {
    setParsed(sampleParsed);
    setStatus("done");
    setShowJson(true);
  };

  const saveToProfile = async () => {
    if (!parsed) return;
    setSavingProfile(true);
    try {
      let existingProfile: Partial<ProfilePayload> | null = null;
      try {
        const existingRes = await fetch(`${API_BASE}/profile`);
        if (existingRes.ok) {
          existingProfile = (await existingRes.json()) as Partial<ProfilePayload>;
        }
      } catch {
        existingProfile = null;
      }

      const payload = buildProfileFromParsed(parsed, existingProfile);
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      messageApi.success("Saved to profile.");
      router.push("/profile");
    } catch (err: any) {
      messageApi.error(err?.message || "Unable to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadProps: UploadProps = {
    accept: ".pdf,image/*",
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      handleFile(file as File);
      return false;
    },
  };

  const sectionItems = parsed?.sections
    ? Object.entries(parsed.sections).map(([key, value]) => ({
        key,
        label: key.replace(/^\w/, (c) => c.toUpperCase()),
        children: <pre className={styles.textBlock}>{String(value)}</pre>,
      }))
    : [];

  return (
    <div className={styles.page}>
      {contextHolder}
      <Layout className={styles.layout}>
        <Content className={styles.content}>
          <Card className={styles.hero}>
            <Space direction="vertical" size={8}>
              <Text className={styles.kicker}>CV parsing</Text>
              <Title level={2} className={styles.heroTitle}>
                Extract CV details into a structured profile
              </Title>
              <Paragraph className={styles.heroLead}>
                Upload a PDF resume or CV image. We extract contact info, skills, and
                section summaries so you can review before publishing.
              </Paragraph>
              <Space wrap>
                <Tag color="blue">LinkedIn-ready</Tag>
                <Tag color="geekblue">ATS-friendly</Tag>
                <Tag color="cyan">20 MB max</Tag>
              </Space>
            </Space>
          </Card>

          <Card className={styles.card}>
            <Row gutter={[24, 24]} className={styles.mainRow}>
              <Col xs={24} lg={24}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <Space direction="vertical" size={0}>
                      <Text className={styles.step}>Step 1</Text>
                      <Text strong>Upload your document</Text>
                    </Space>
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>Choose file</Button>
                    </Upload>
                  </div>
                  <Upload.Dragger {...uploadProps} className={styles.dragger}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className={styles.dragTitle}>Drag & drop your CV</p>
                    <p className={styles.dragHint}>PDF or image files up to 20 MB.</p>
                  </Upload.Dragger>

                  <div className={styles.uploadFoot}>
                    {fileInfo.error && (
                      <Alert type="error" message={fileInfo.error} showIcon />
                    )}
                    {fileInfo.file ? (
                      <div className={styles.fileRow}>
                        <div>
                          <Text strong>{fileInfo.file.name}</Text>
                          <div className={styles.fileMeta}>
                            {fileInfo.file.type || "Unknown type"} - {sizeLabel}
                          </div>
                        </div>
                        <Space wrap>
                          <Button onClick={clearFile}>Remove</Button>
                          <Button
                            type="primary"
                            onClick={parseOnServer}
                            loading={status === "loading"}
                            disabled={!fileInfo.file}
                          >
                            Parse & extract
                          </Button>
                        </Space>
                      </div>
                    ) : (
                      <Alert
                        type="info"
                        message="No file selected yet. Drop a PDF CV or an image to get started."
                        showIcon
                      />
                    )}
                    {fileInfo.preview && (
                      <div className={styles.previewWrap}>
                        <Image src={fileInfo.preview} alt="Preview" width={200} />
                      </div>
                    )}
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={24}>
                <div className={`${styles.section} ${styles.sectionRight}`}>
                  <div className={styles.sectionHeader}>
                    <Space direction="vertical" size={0}>
                      <Text className={styles.step}>Step 2</Text>
                      <Text strong>Parsed CV</Text>
                    </Space>
                    <Button onClick={() => setShowJson((value) => !value)} disabled={!parsed}>
                      {showJson ? "Hide JSON" : "Show JSON"}
                    </Button>
                  </div>
                  <Space direction="vertical" size="large" className={styles.resultsStack}>
                    {(apiError || status === "loading") && (
                      <Space direction="vertical" size={12}>
                        {apiError && <Alert type="error" message={apiError} showIcon />}
                        {status === "loading" && (
                          <Alert type="info" message="Running parser..." showIcon />
                        )}
                      </Space>
                    )}

                    {parsed ? (
                      <Space direction="vertical" size="large">
                        <div className={styles.resultHeader}>
                          <Space wrap>
                            {parsed.meta?.method && (
                              <Tag color="blue">Method: {parsed.meta.method}</Tag>
                            )}
                            {parsed.meta?.quality?.char_count && (
                              <Tag color="cyan">Characters: {parsed.meta.quality.char_count}</Tag>
                            )}
                          </Space>
                          <Space wrap>
                            <Button icon={<CopyOutlined />} onClick={copyJson}>
                              Copy JSON
                            </Button>
                            <Button icon={<DownloadOutlined />} onClick={downloadJson}>
                              Download JSON
                            </Button>
                            <Button
                              type="primary"
                              icon={<SaveOutlined />}
                              onClick={saveToProfile}
                              loading={savingProfile}
                            >
                              Save to profile
                            </Button>
                            {status === "done" && (
                              <Tag icon={<CheckCircleFilled />} color="success">
                                Parsed
                              </Tag>
                            )}
                          </Space>
                        </div>

                        <Row gutter={[16, 16]}>
                          <Col xs={24} md={12}>
                            <Card size="small" className={styles.summaryCard}>
                              <div className={styles.summaryLabel}>Name</div>
                              <div className={styles.summaryValue}>
                                {parsed.name || "Not detected"}
                              </div>
                            </Card>
                          </Col>
                          <Col xs={24} md={12}>
                            <Card size="small" className={styles.summaryCard}>
                              <div className={styles.summaryLabel}>Title</div>
                              <div className={styles.summaryValue}>
                                {parsed.title || "Not detected"}
                              </div>
                            </Card>
                          </Col>
                          <Col xs={24} md={12}>
                            <Card size="small" className={styles.summaryCard}>
                              <div className={styles.summaryLabel}>Emails</div>
                              <div className={styles.summaryValue}>
                                {parsed.contacts?.emails?.length
                                  ? parsed.contacts.emails.join(", ")
                                  : "Not found"}
                              </div>
                            </Card>
                          </Col>
                          <Col xs={24} md={12}>
                            <Card size="small" className={styles.summaryCard}>
                              <div className={styles.summaryLabel}>Phones</div>
                              <div className={styles.summaryValue}>
                                {parsed.contacts?.phones?.length
                                  ? parsed.contacts.phones.join(", ")
                                  : "Not found"}
                              </div>
                            </Card>
                          </Col>
                          <Col xs={24}>
                            <Card size="small" className={styles.summaryCard}>
                              <div className={styles.summaryLabel}>Skills</div>
                              <div className={styles.skillTags}>
                                {(parsed.skills || []).length
                                  ? (parsed.skills || []).slice(0, 18).map((skill: string) => (
                                      <Tag key={skill}>{skill}</Tag>
                                    ))
                                  : "None detected"}
                              </div>
                            </Card>
                          </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                          <Col xs={24} md={12}>
                            <Card size="small" className={styles.summaryCard}>
                              <div className={styles.summaryLabel}>Sections</div>
                              <div className={styles.summaryValue}>
                                {parsed.sections
                                  ? Object.keys(parsed.sections).slice(0, 6).join(", ")
                                  : "Not segmented"}
                              </div>
                            </Card>
                          </Col>
                          <Col xs={24} md={12}>
                            <Card size="small" className={styles.summaryCard}>
                              <div className={styles.summaryLabel}>Extraction</div>
                              <div className={styles.summaryValue}>
                                {parsed.meta?.quality?.line_count ?? "N/A"} lines
                              </div>
                            </Card>
                          </Col>
                        </Row>

                        <Descriptions
                          title="Details"
                          bordered
                          size="small"
                          column={1}
                          className={styles.descriptions}
                        >
                          <Descriptions.Item label="Emails">
                            {parsed.contacts?.emails?.length
                              ? parsed.contacts.emails.join(", ")
                              : "Not found"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Phones">
                            {parsed.contacts?.phones?.length
                              ? parsed.contacts.phones.join(", ")
                              : "Not found"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Web">
                            {parsed.contacts?.urls?.length
                              ? parsed.contacts.urls.join(", ")
                              : "Not found"}
                          </Descriptions.Item>
                          <Descriptions.Item label="LinkedIn">
                            {parsed.contacts?.linkedin?.length
                              ? parsed.contacts.linkedin.join(", ")
                              : "Not found"}
                          </Descriptions.Item>
                          <Descriptions.Item label="GitHub">
                            {parsed.contacts?.github?.length
                              ? parsed.contacts.github.join(", ")
                              : "Not found"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Method">
                            {parsed.meta?.method || "Unknown"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Characters">
                            {parsed.meta?.quality?.char_count ?? "N/A"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Lines">
                            {parsed.meta?.quality?.line_count ?? "N/A"}
                          </Descriptions.Item>
                        </Descriptions>

                        {sectionItems.length > 0 && (
                          <div>
                            <Divider orientation="left">Section details</Divider>
                            <Collapse items={sectionItems} />
                          </div>
                        )}

                        {parsed.raw_text && (
                          <div>
                            <Divider orientation="left">Extracted text</Divider>
                            <pre className={styles.textBlock}>{parsed.raw_text}</pre>
                          </div>
                        )}

                        {showJson && (
                          <pre className={styles.jsonBox}>
                            {JSON.stringify(parsed, null, 2)}
                          </pre>
                        )}
                      </Space>
                    ) : (
                    <Empty
                      description="Upload a CV and run the parser to see structured results here."
                    />
                    )}
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </Content>
      </Layout>
    </div>
  );
}
