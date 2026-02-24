// Mock personality scores for testing
export interface PersonalityScores {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

export interface CareerMatch {
  title: string
  match: number
  description: string
  skills: string[]
  whyItFits: string
  salary: string
}

export interface EmotionData {
  time: string
  emotion: string
  intensity: number
}

export const mockPersonality: PersonalityScores = {
  openness: 0.85,
  conscientiousness: 0.72,
  extraversion: 0.45,
  agreeableness: 0.68,
  neuroticism: 0.31,
}

export const mockCareers: CareerMatch[] = [
  {
    title: "Data Scientist",
    match: 0.87,
    description:
      "Analyze complex datasets to extract insights and build predictive models that drive business decisions.",
    skills: ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization"],
    whyItFits:
      "Your high openness score indicates curiosity and analytical thinking, perfect for exploring data patterns. Strong conscientiousness ensures thorough, accurate analysis.",
    salary: "$95,000 - $145,000",
  },
  {
    title: "Software Engineer",
    match: 0.78,
    description:
      "Design, develop, and maintain software applications using modern programming languages and frameworks.",
    skills: ["Java", "JavaScript", "Algorithms", "System Design", "Git"],
    whyItFits:
      "Your conscientiousness drives quality code and attention to detail. Moderate extraversion suits collaborative development while allowing focused solo work.",
    salary: "$85,000 - $140,000",
  },
  {
    title: "UX Researcher",
    match: 0.75,
    description: "Study user behavior and needs to inform product design decisions and improve user experiences.",
    skills: ["User Testing", "Survey Design", "Data Analysis", "Empathy Mapping", "Prototyping"],
    whyItFits:
      "High agreeableness helps you understand user perspectives. Your openness to new ideas makes you excellent at discovering insights.",
    salary: "$75,000 - $120,000",
  },
  {
    title: "DevOps Engineer",
    match: 0.71,
    description:
      "Automate and optimize software deployment processes, manage infrastructure, and ensure system reliability.",
    skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"],
    whyItFits:
      "Your conscientiousness ensures reliable systems. Low neuroticism helps you stay calm during production incidents and outages.",
    salary: "$90,000 - $135,000",
  },
  {
    title: "Technical Writer",
    match: 0.68,
    description: "Create clear, comprehensive documentation for technical products, APIs, and developer tools.",
    skills: ["Technical Writing", "API Documentation", "Markdown", "Content Strategy", "Editing"],
    whyItFits:
      "Your conscientiousness ensures thorough, accurate documentation. Moderate extraversion suits collaboration with engineers while working independently.",
    salary: "$65,000 - $100,000",
  },
]

export const mockEmotions: EmotionData[] = [
  { time: "0:30", emotion: "Focused", intensity: 0.8 },
  { time: "1:00", emotion: "Confident", intensity: 0.9 },
  { time: "1:30", emotion: "Thoughtful", intensity: 0.7 },
  { time: "2:00", emotion: "Engaged", intensity: 0.85 },
  { time: "2:30", emotion: "Curious", intensity: 0.75 },
  { time: "3:00", emotion: "Determined", intensity: 0.8 },
  { time: "3:30", emotion: "Enthusiastic", intensity: 0.9 },
  { time: "4:00", emotion: "Calm", intensity: 0.65 },
  { time: "4:30", emotion: "Focused", intensity: 0.85 },
  { time: "5:00", emotion: "Satisfied", intensity: 0.95 },
]

export const personalityTraitDescriptions: Record<keyof PersonalityScores, { name: string; description: string }> = {
  openness: {
    name: "Openness",
    description: "Curiosity, creativity, and willingness to try new experiences",
  },
  conscientiousness: {
    name: "Conscientiousness",
    description: "Organization, reliability, and goal-directed behavior",
  },
  extraversion: {
    name: "Extraversion",
    description: "Sociability, assertiveness, and energetic engagement with others",
  },
  agreeableness: {
    name: "Agreeableness",
    description: "Compassion, cooperation, and consideration for others",
  },
  neuroticism: {
    name: "Emotional Stability",
    description: "Calmness, resilience, and ability to handle stress (inverted neuroticism)",
  },
}
