export type JobMeta = {
  ref?: string;
  position?: string;
  employer?: string;
  url?: string;
  type?: "image" | "text" | null;
  files?: string[];
};

export type JobView = JobMeta & {
  textSnippet?: string;
  imageFile?: string;
  skillsFound?: string[];
  overlapSkills?: string[];
  missingSkills?: string[];
  matchPercent?: number;
  jobSkillCount?: number;
  userSkillCount?: number;
  extractedText?: string;
  extractedTextFull?: string;
};
