'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  BookOpen,
  Target,
  User,
  GraduationCap,
  Code,
  Heart,
  ArrowRight,
  CheckCircle,
  LayoutDashboard,
  ChevronRight,
  Home,
  FileText
} from 'lucide-react';

interface AssessmentData {
  personalInfo: {
    name: string;
    email: string;
    age: number;
    phone: string;
    location: string;
    gender: string;
    languages: string[];
  };
  academicBackground: {
    educationLevel: string;
    major: string;
    gpa: number;
    graduationYear: number;
    institution: string;
    currentYear: number;
    currentSemester: string;
    expectedGraduationYear: string;
    projects: Array<{
      name: string;
      rating: string;
    }>;
   };
  technicalSkills: {
    programming: string[];
    programmingLevel: { [key: string]: string };
    databases: string[];
    frameworks: string[];
    tools: string[];
    cloudPlatforms: string[];
    methodologies: string[];
  };
  psychologicalTraits: {
    workStyle: string;
    communication: string;
    problemSolving: string;
    teamwork: string;
    adaptability: string;
    leadership: string;
    stressManagement: string;
    motivation: string;
    learningStyle: string;
  };
  careerInterests: {
    preferredRoles: string[];
    workEnvironment: string;
    salaryExpectation: string;
    longTermGoals: string;
    industryPreference: string[];
    workLifeBalance: string;
    companySize: string;
    relocation: string;
  };
}

interface ValidationErrors {
  personalInfo: {
    name?: string;
    email?: string;
    age?: string;
    phone?: string;
    location?: string;
    gender?: string;
    languages?: string;
  };
  academicBackground: {
    educationLevel?: string;
    major?: string;
    institution?: string;
    gpa?: string;
    currentYear?: string;
    currentSemester?: string;
    expectedGraduationYear?: string;
  };
  technicalSkills: {
    programming?: string;
  };
  psychologicalTraits: {
    workStyle?: string;
    communication?: string;
    problemSolving?: string;
    teamwork?: string;
    adaptability?: string;
    leadership?: string;
    stressManagement?: string;
    motivation?: string;
    learningStyle?: string;
  };
  careerInterests: {
    preferredRoles?: string;
    workEnvironment?: string;
    salaryExpectation?: string;
    longTermGoals?: string;
    industryPreference?: string;
    workLifeBalance?: string;
    companySize?: string;
    relocation?: string;
  };
}

const programmingLanguages = [
  'Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
  'TypeScript', 'Rust', 'Scala', 'Perl', 'MATLAB', 'R', 'SQL', 'HTML/CSS', 'Bash', 'PowerShell'
];

const databaseSkills = [
  'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'SQL Server', 'Redis', 'Firebase',
  'SQLite', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'Neo4j', 'MariaDB'
];

const frameworks = [
  'React', 'Angular', 'Vue.js', 'Django', 'Flask', 'Spring', 'Node.js', 'Express.js', '.NET',
  'Next.js', 'Nuxt.js', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'Flutter', 'React Native', 'TensorFlow'
];

const tools = [
  'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jira', 'Figma',
  'VS Code', 'IntelliJ IDEA', 'Postman', 'Slack', 'Trello', 'Confluence', 'Jenkins', 'GitLab'
];

const cloudPlatforms = [
  'Amazon Web Services (AWS)', 'Microsoft Azure', 'Google Cloud Platform (GCP)',
  'IBM Cloud', 'Oracle Cloud', 'Alibaba Cloud', 'Heroku', 'DigitalOcean'
];

const methodologies = [
  'Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps', 'CI/CD', 'Test-Driven Development',
  'Behavior-Driven Development', 'Pair Programming', 'Code Review'
];

const careerRoles = [
  'Data Scientist', 'Cybersecurity Analyst', 'Web Developer', 'AI Engineer',
  'Software Engineer', 'DevOps Engineer', 'UI/UX Designer', 'Product Manager',
  'Machine Learning Engineer', 'Cloud Architect', 'Database Administrator', 'Network Engineer',
  'Security Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Mobile App Developer', 'Quality Assurance Engineer', 'Systems Analyst', 'IT Consultant'
];

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Government', 'E-commerce',
  'Gaming', 'Media & Entertainment', 'Consulting', 'Manufacturing', 'Telecommunications'
];

const languages = [
  'Sinhala', 'Tamil', 'English'
];

const majorOptions = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Computing and Software Systems',
  'Data Science',
  'Network Engineering',
  'Cyber Security',
  'Information Security',
  'Cloud Computing',
  'Interactive Media',
  'Management Information Systems',
  'Business Information Technology'
];

const sriLankanUniversities = [
  'University of Colombo',
  'University of Peradeniya',
  'University of Sri Jayewardenepura',
  'University of Kelaniya',
  'University of Moratuwa',
  'University of Jaffna',
  'University of Ruhuna',
  'Eastern University, Sri Lanka',
  'South Eastern University of Sri Lanka',
  'Rajarata University of Sri Lanka',
  'Sabaragamuwa University of Sri Lanka',
  'Wayamba University of Sri Lanka',
  'Uva Wellassa University',
  'University of Vavuniya',
  'Sri Lanka Institute of Information Technology (SLIIT)',
  'NSBM Green University',
  'SLTC Research University',
  'Informatics Institute of Technology (IIT)',
  'ICBT Campus',
  'Horizon Campus'
];

function StudentAssessment() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({
    personalInfo: {},
    academicBackground: {},
    technicalSkills: {},
    psychologicalTraits: {},
    careerInterests: {}
  });
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    personalInfo: {
      name: '',
      email: '',
      age: 0,
      phone: '',
      location: '',
      gender: '',
      languages: []
    },
    academicBackground: {
      educationLevel: '',
      major: '',
      gpa: 0,
      graduationYear: 0,
      institution: '',
      currentYear: 0,
      currentSemester: '',
      expectedGraduationYear: '',
      projects: []
    },
    technicalSkills: {
      programming: [],
      programmingLevel: {},
      databases: [],
      frameworks: [],
      tools: [],
      cloudPlatforms: [],
      methodologies: []
    },
    psychologicalTraits: {
      workStyle: '',
      communication: '',
      problemSolving: '',
      teamwork: '',
      adaptability: '',
      leadership: '',
      stressManagement: '',
      motivation: '',
      learningStyle: ''
    },
    careerInterests: {
      preferredRoles: [],
      workEnvironment: '',
      salaryExpectation: '',
      longTermGoals: '',
      industryPreference: [],
      workLifeBalance: '',
      companySize: '',
      relocation: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validatePersonalInfo = () => {
    const newErrors: ValidationErrors['personalInfo'] = {};
    
    if (!assessmentData.personalInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!assessmentData.personalInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assessmentData.personalInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!assessmentData.personalInfo.age || assessmentData.personalInfo.age < 16 || assessmentData.personalInfo.age > 65) {
      newErrors.age = 'Please enter a valid age between 16 and 65';
    }
    
    if (assessmentData.personalInfo.phone && !/^[+]?[\d\s-()]+$/.test(assessmentData.personalInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (assessmentData.personalInfo.languages.length === 0) {
      newErrors.languages = 'Please select at least one language';
    }
    
    setErrors(prev => ({ ...prev, personalInfo: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateAcademicBackground = () => {
    const newErrors: ValidationErrors['academicBackground'] = {};
    
    if (!assessmentData.academicBackground.educationLevel) {
      newErrors.educationLevel = 'Education level is required';
    }
    
    if (!assessmentData.academicBackground.major.trim()) {
      newErrors.major = 'Major/Field of study is required';
    }
    
    if (!assessmentData.academicBackground.institution.trim()) {
      newErrors.institution = 'Institution name is required';
    }
    
    if (!assessmentData.academicBackground.gpa || assessmentData.academicBackground.gpa < 0 || assessmentData.academicBackground.gpa > 4) {
      newErrors.gpa = 'Please enter a valid GPA between 0 and 4.0';
    }
    
    if (!assessmentData.academicBackground.currentYear || assessmentData.academicBackground.currentYear < 1 || assessmentData.academicBackground.currentYear > 4) {
      newErrors.currentYear = 'Please enter a valid academic year (1-4)';
    }
    
    if (!assessmentData.academicBackground.expectedGraduationYear) {
      newErrors.expectedGraduationYear = 'Expected graduation year is required';
    }
    
    setErrors(prev => ({ ...prev, academicBackground: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateTechnicalSkills = () => {
    const newErrors: ValidationErrors['technicalSkills'] = {};
    
    if (assessmentData.technicalSkills.programming.length === 0) {
      newErrors.programming = 'Please select at least one programming language';
    }
    
    setErrors(prev => ({ ...prev, technicalSkills: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePsychologicalTraits = () => {
    const newErrors: ValidationErrors['psychologicalTraits'] = {};
    const traits = assessmentData.psychologicalTraits;
    
    if (!traits.workStyle) newErrors.workStyle = 'Work style is required';
    if (!traits.communication) newErrors.communication = 'Communication style is required';
    if (!traits.problemSolving) newErrors.problemSolving = 'Problem solving approach is required';
    if (!traits.teamwork) newErrors.teamwork = 'Teamwork preference is required';
    if (!traits.adaptability) newErrors.adaptability = 'Adaptability level is required';
    if (!traits.leadership) newErrors.leadership = 'Leadership style is required';
    if (!traits.stressManagement) newErrors.stressManagement = 'Stress management approach is required';
    if (!traits.motivation) newErrors.motivation = 'Motivation is required';
    if (!traits.learningStyle) newErrors.learningStyle = 'Learning style is required';
    
    setErrors(prev => ({ ...prev, psychologicalTraits: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateCareerInterests = () => {
    const newErrors: ValidationErrors['careerInterests'] = {};
    const interests = assessmentData.careerInterests;
    
    if (interests.preferredRoles.length === 0) {
      newErrors.preferredRoles = 'Please select at least one preferred career role';
    }
    
    if (!interests.workEnvironment) newErrors.workEnvironment = 'Work environment preference is required';
    if (!interests.salaryExpectation) newErrors.salaryExpectation = 'Salary expectation is required';
    if (!interests.longTermGoals.trim()) newErrors.longTermGoals = 'Long-term goals are required';
    if (interests.industryPreference.length === 0) {
      newErrors.industryPreference = 'Please select at least one industry preference';
    }
    if (!interests.workLifeBalance) newErrors.workLifeBalance = 'Work-life balance preference is required';
    if (!interests.companySize) newErrors.companySize = 'Company size preference is required';
    if (!interests.relocation) newErrors.relocation = 'Relocation preference is required';
    
    setErrors(prev => ({ ...prev, careerInterests: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return validatePersonalInfo();
      case 2:
        return validateAcademicBackground();
      case 3:
        return validateTechnicalSkills();
      case 4:
        return validatePsychologicalTraits();
      case 5:
        return validateCareerInterests();
      default:
        return true;
    }
  };

  const handlePersonalInfoChange = (field: string, value: string | number | string[]) => {
    setAssessmentData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleAcademicChange = (field: string, value: string | number | string[]) => {
    setAssessmentData(prev => ({
      ...prev,
      academicBackground: {
        ...prev.academicBackground,
        [field]: value
      }
    }));
  };

  const handleTechnicalSkillsChange = (category: keyof AssessmentData['technicalSkills'], skill: string) => {
    setAssessmentData(prev => {
      // Handle programming level separately
      if (category === 'programmingLevel') {
        return {
          ...prev,
          technicalSkills: {
            ...prev.technicalSkills,
            programmingLevel: {
              ...prev.technicalSkills.programmingLevel,
              [skill]: prev.technicalSkills.programmingLevel[skill] || 'Beginner'
            }
          }
        };
      }
      
      // Handle array-based skills
      const currentSkills = prev.technicalSkills[category] as string[];
        const updatedSkills = currentSkills.includes(skill)
          ? currentSkills.filter((s: string) => s !== skill)
          : [...currentSkills, skill];
      
      return {
        ...prev,
        technicalSkills: {
          ...prev.technicalSkills,
          [category]: updatedSkills
        }
      };
    });
  };

  const handleProgrammingLevelChange = (language: string, level: string) => {
    setAssessmentData(prev => ({
      ...prev,
      technicalSkills: {
        ...prev.technicalSkills,
        programmingLevel: {
          ...prev.technicalSkills.programmingLevel,
          [language]: level
        }
      }
    }));
  };

  const handlePsychologicalChange = (trait: string, value: string) => {
    setAssessmentData(prev => ({
      ...prev,
      psychologicalTraits: {
        ...prev.psychologicalTraits,
        [trait]: value
      }
    }));
  };

  const handleCareerInterestChange = (field: string, value: string | string[]) => {
    setAssessmentData(prev => ({
      ...prev,
      careerInterests: {
        ...prev.careerInterests,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps before submission
    const isPersonalInfoValid = validatePersonalInfo();
    const isAcademicValid = validateAcademicBackground();
    const isTechnicalValid = validateTechnicalSkills();
    const isPsychologicalValid = validatePsychologicalTraits();
    const isCareerValid = validateCareerInterests();
    
    if (isPersonalInfoValid && isAcademicValid && isTechnicalValid && isPsychologicalValid && isCareerValid) {
      setIsSubmitting(true);
      
      // Simulate API call to process assessment
      setTimeout(() => {
        // Store assessment data in sessionStorage for the roadmap page
        sessionStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        setIsSubmitting(false);
        router.push('/career-preparation/personalized-roadmap');
      }, 2000);
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              step === currentStep ? 'bg-blue-500 text-white' : 
              step < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            <span className="text-xs text-gray-600">
              {step === 1 && 'Personal'}
              {step === 2 && 'Academic'}
              {step === 3 && 'Technical'}
              {step === 4 && 'Psychological'}
              {step === 5 && 'Career'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={assessmentData.personalInfo.name}
            onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.personalInfo.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
            required
          />
          {errors.personalInfo.name && (
            <p className="mt-1 text-sm text-red-600">{errors.personalInfo.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={assessmentData.personalInfo.email}
            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.personalInfo.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
            required
          />
          {errors.personalInfo.email && (
            <p className="mt-1 text-sm text-red-600">{errors.personalInfo.email}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={assessmentData.personalInfo.phone}
            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.personalInfo.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your phone number"
          />
          {errors.personalInfo.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.personalInfo.phone}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <input
            type="number"
            value={assessmentData.personalInfo.age || ''}
            onChange={(e) => handlePersonalInfoChange('age', parseInt(e.target.value) || 0)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.personalInfo.age ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your age"
            min="16"
            max="65"
            required
          />
          {errors.personalInfo.age && (
            <p className="mt-1 text-sm text-red-600">{errors.personalInfo.age}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={assessmentData.personalInfo.location}
            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="City, Country"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={assessmentData.personalInfo.gender}
            onChange={(e) => handlePersonalInfoChange('gender', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">Languages Spoken</label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {languages.map((lang) => (
              <label key={lang} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessmentData.personalInfo.languages.includes(lang)}
                  onChange={() => {
                    const currentLanguages = assessmentData.personalInfo.languages;
                    const updatedLanguages = currentLanguages.includes(lang)
                      ? currentLanguages.filter(l => l !== lang)
                      : [...currentLanguages, lang];
                    handlePersonalInfoChange('languages', updatedLanguages);
                  }}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{lang}</span>
              </label>
            ))}
          </div>
          {errors.personalInfo.languages && (
            <p className="mt-1 text-sm text-red-600">{errors.personalInfo.languages}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderAcademicBackground = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Background</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
          <select
            value={assessmentData.academicBackground.educationLevel}
            onChange={(e) => handleAcademicChange('educationLevel', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.academicBackground.educationLevel ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select education level</option>
            <option value="high-school">High School</option>
            <option value="associate">Associate Degree</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
          </select>
          {errors.academicBackground.educationLevel && (
            <p className="mt-1 text-sm text-red-600">{errors.academicBackground.educationLevel}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Major/Field of Study</label>
          <select
            value={assessmentData.academicBackground.major}
            onChange={(e) => handleAcademicChange('major', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.academicBackground.major ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select your major</option>
            {majorOptions.map((major) => (
              <option key={major} value={major}>{major}</option>
            ))}
          </select>
          {errors.academicBackground.major && (
            <p className="mt-1 text-sm text-red-600">{errors.academicBackground.major}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
          <select
            value={assessmentData.academicBackground.institution}
            onChange={(e) => handleAcademicChange('institution', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.academicBackground.institution ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select your institution</option>
            {sriLankanUniversities.map((university) => (
              <option key={university} value={university}>{university}</option>
            ))}
          </select>
          {errors.academicBackground.institution && (
            <p className="mt-1 text-sm text-red-600">{errors.academicBackground.institution}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GPA (out of 4.0)</label>
          <input
            type="number"
            value={assessmentData.academicBackground.gpa || ''}
            onChange={(e) => handleAcademicChange('gpa', parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.academicBackground.gpa ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your GPA"
            min="0"
            max="4"
            step="0.1"
            required
          />
          {errors.academicBackground.gpa && (
            <p className="mt-1 text-sm text-red-600">{errors.academicBackground.gpa}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Academic Year</label>
          <select
            value={assessmentData.academicBackground.graduationYear || ''}
            onChange={(e) => handleAcademicChange('currentYear', parseInt(e.target.value) || 0)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.academicBackground.currentYear ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select academic year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
          <select
            value={assessmentData.academicBackground.currentSemester || ''}
            onChange={(e) => handleAcademicChange('currentSemester', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Graduation Year</label>
          <select
            value={assessmentData.academicBackground.expectedGraduationYear || ''}
            onChange={(e) => handleAcademicChange('expectedGraduationYear', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select graduation year</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Academic Projects</label>
          <textarea
            value={assessmentData.academicBackground.projects.join(', ')}
            onChange={(e) => handleAcademicChange('projects', e.target.value.split(',').map(project => project.trim()).filter(project => project))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            placeholder="e.g., E-commerce Website, Machine Learning Model, Mobile App"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple projects with commas</p>
        </div>
      </div>
    </div>
  );

  const renderTechnicalSkills = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Skills</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Programming Languages</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {programmingLanguages.map((lang) => (
              <label key={lang} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessmentData.technicalSkills.programming.includes(lang)}
                  onChange={() => handleTechnicalSkillsChange('programming', lang)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{lang}</span>
              </label>
            ))}
          </div>
          {errors.technicalSkills.programming && (
            <p className="mt-1 text-sm text-red-600">{errors.technicalSkills.programming}</p>
          )}
          
          {assessmentData.technicalSkills.programming.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Programming Proficiency Levels</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assessmentData.technicalSkills.programming.map((lang) => (
                  <div key={lang} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{lang}</span>
                    <select
                      value={assessmentData.technicalSkills.programmingLevel[lang] || 'Beginner'}
                      onChange={(e) => handleProgrammingLevelChange(lang, e.target.value)}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Databases</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {databaseSkills.map((db) => (
              <label key={db} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessmentData.technicalSkills.databases.includes(db)}
                  onChange={() => handleTechnicalSkillsChange('databases', db)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{db}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Frameworks & Libraries</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {frameworks.map((framework) => (
              <label key={framework} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessmentData.technicalSkills.frameworks.includes(framework)}
                  onChange={() => handleTechnicalSkillsChange('frameworks', framework)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{framework}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Tools & Technologies</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tools.map((tool) => (
              <label key={tool} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessmentData.technicalSkills.tools.includes(tool)}
                  onChange={() => handleTechnicalSkillsChange('tools', tool)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{tool}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Cloud Platforms</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cloudPlatforms.map((platform) => (
              <label key={platform} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessmentData.technicalSkills.cloudPlatforms.includes(platform)}
                  onChange={() => handleTechnicalSkillsChange('cloudPlatforms', platform)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{platform}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Development Methodologies</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {methodologies.map((method) => (
              <label key={method} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessmentData.technicalSkills.methodologies.includes(method)}
                  onChange={() => handleTechnicalSkillsChange('methodologies', method)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{method}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPsychologicalTraits = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Psychological Traits & Work Style</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work Style</label>
          <select
            value={assessmentData.psychologicalTraits.workStyle}
            onChange={(e) => handlePsychologicalChange('workStyle', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select your work style</option>
            <option value="independent">Independent Worker</option>
            <option value="collaborative">Collaborative Team Player</option>
            <option value="leadership">Natural Leader</option>
            <option value="analytical">Analytical Thinker</option>
            <option value="creative">Creative Innovator</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
          <select
            value={assessmentData.psychologicalTraits.communication}
            onChange={(e) => handlePsychologicalChange('communication', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select communication style</option>
            <option value="direct">Direct and To-the-Point</option>
            <option value="diplomatic">Diplomatic and Tactful</option>
            <option value="supportive">Supportive and Encouraging</option>
            <option value="analytical">Analytical and Detailed</option>
            <option value="inspiring">Inspiring and Motivational</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Problem Solving Approach</label>
          <select
            value={assessmentData.psychologicalTraits.problemSolving}
            onChange={(e) => handlePsychologicalChange('problemSolving', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select problem solving approach</option>
            <option value="logical">Logical and Systematic</option>
            <option value="creative">Creative and Innovative</option>
            <option value="collaborative">Collaborative and Team-based</option>
            <option value="intuitive">Intuitive and Instinctive</option>
            <option value="data-driven">Data-Driven and Analytical</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teamwork Preference</label>
          <select
            value={assessmentData.psychologicalTraits.teamwork}
            onChange={(e) => handlePsychologicalChange('teamwork', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select teamwork preference</option>
            <option value="leader">Team Leader</option>
            <option value="contributor">Active Contributor</option>
            <option value="facilitator">Team Facilitator</option>
            <option value="specialist">Technical Specialist</option>
            <option value="flexible">Flexible Role Player</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leadership Style</label>
          <select
            value={assessmentData.psychologicalTraits.leadership}
            onChange={(e) => handlePsychologicalChange('leadership', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select leadership style</option>
            <option value="authoritative">Authoritative - Direct and decisive</option>
            <option value="democratic">Democratic - Collaborative and inclusive</option>
            <option value="coaching">Coaching - Focus on development</option>
            <option value="servant">Servant - Support team first</option>
            <option value="visionary">Visionary - Inspire with future goals</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stress Management</label>
          <select
            value={assessmentData.psychologicalTraits.stressManagement}
            onChange={(e) => handlePsychologicalChange('stressManagement', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select stress management approach</option>
            <option value="excellent">Excellent - Thrive under pressure</option>
            <option value="good">Good - Manage stress effectively</option>
            <option value="moderate">Moderate - Need some support</option>
            <option value="structured">Prefer Structured Environments</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Motivation</label>
          <select
            value={assessmentData.psychologicalTraits.motivation}
            onChange={(e) => handlePsychologicalChange('motivation', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select primary motivation</option>
            <option value="achievement">Achievement - Reaching goals</option>
            <option value="recognition">Recognition - Being acknowledged</option>
            <option value="learning">Learning - Acquiring new skills</option>
            <option value="impact">Impact - Making a difference</option>
            <option value="autonomy">Autonomy - Independence in work</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
          <select
            value={assessmentData.psychologicalTraits.learningStyle}
            onChange={(e) => handlePsychologicalChange('learningStyle', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select learning style</option>
            <option value="visual">Visual - Learn through seeing</option>
            <option value="auditory">Auditory - Learn through listening</option>
            <option value="kinesthetic">Kinesthetic - Learn by doing</option>
            <option value="reading">Reading/Writing - Learn through text</option>
            <option value="social">Social - Learn in groups</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Adaptability</label>
          <select
            value={assessmentData.psychologicalTraits.adaptability}
            onChange={(e) => handlePsychologicalChange('adaptability', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select adaptability level</option>
            <option value="high">Highly Adaptable - Thrive in changing environments</option>
            <option value="medium">Moderately Adaptable - Adjust with some time</option>
            <option value="structured">Prefer Structured Environments</option>
            <option value="specialized">Specialized in Specific Areas</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderCareerInterests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Career Interests & Goals</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Career Roles</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {careerRoles.map((role) => (
              <label key={role} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessmentData.careerInterests.preferredRoles.includes(role)}
                  onChange={() => {
                    const currentRoles = assessmentData.careerInterests.preferredRoles;
                    const updatedRoles = currentRoles.includes(role)
                      ? currentRoles.filter(r => r !== role)
                      : [...currentRoles, role];
                    handleCareerInterestChange('preferredRoles', updatedRoles);
                  }}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{role}</span>
              </label>
            ))}
          </div>
          {errors.careerInterests.preferredRoles && (
            <p className="mt-1 text-sm text-red-600">{errors.careerInterests.preferredRoles}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Industry Preferences</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {industries.map((industry) => (
              <label key={industry} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessmentData.careerInterests.industryPreference.includes(industry)}
                  onChange={() => {
                    const currentIndustries = assessmentData.careerInterests.industryPreference;
                    const updatedIndustries = currentIndustries.includes(industry)
                      ? currentIndustries.filter(i => i !== industry)
                      : [...currentIndustries, industry];
                    handleCareerInterestChange('industryPreference', updatedIndustries);
                  }}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{industry}</span>
              </label>
            ))}
          </div>
          {errors.careerInterests.industryPreference && (
            <p className="mt-1 text-sm text-red-600">{errors.careerInterests.industryPreference}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Work Environment</label>
          <select
            value={assessmentData.careerInterests.workEnvironment}
            onChange={(e) => handleCareerInterestChange('workEnvironment', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.careerInterests.workEnvironment ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select preferred work environment</option>
            <option value="startup">Startup - Fast-paced, dynamic</option>
            <option value="corporate">Corporate - Structured, established</option>
            <option value="remote">Remote - Work from anywhere</option>
            <option value="hybrid">Hybrid - Mix of office and remote</option>
            <option value="freelance">Freelance - Project-based work</option>
          </select>
          {errors.careerInterests.workEnvironment && (
            <p className="mt-1 text-sm text-red-600">{errors.careerInterests.workEnvironment}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work-Life Balance Preference</label>
          <select
            value={assessmentData.careerInterests.workLifeBalance}
            onChange={(e) => handleCareerInterestChange('workLifeBalance', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.careerInterests.workLifeBalance ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select work-life balance preference</option>
            <option value="career-focused">Career-focused - Willing to work extra hours</option>
            <option value="balanced">Balanced - Equal priority to work and personal life</option>
            <option value="life-focused">Life-focused - Strict work hours boundaries</option>
            <option value="flexible">Flexible - Adapt as needed</option>
          </select>
          {errors.careerInterests.workLifeBalance && (
            <p className="mt-1 text-sm text-red-600">{errors.careerInterests.workLifeBalance}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Size Preference</label>
          <select
            value={assessmentData.careerInterests.companySize}
            onChange={(e) => handleCareerInterestChange('companySize', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.careerInterests.companySize ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select company size preference</option>
            <option value="startup">Startup (1-50 employees)</option>
            <option value="small">Small (51-200 employees)</option>
            <option value="medium">Medium (201-1000 employees)</option>
            <option value="large">Large (1001-5000 employees)</option>
            <option value="enterprise">Enterprise (5000+ employees)</option>
          </select>
          {errors.careerInterests.companySize && (
            <p className="mt-1 text-sm text-red-600">{errors.careerInterests.companySize}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Relocation Preference</label>
          <select
            value={assessmentData.careerInterests.relocation}
            onChange={(e) => handleCareerInterestChange('relocation', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.careerInterests.relocation ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select relocation preference</option>
            <option value="willing">Willing to relocate for the right opportunity</option>
            <option value="consider">Would consider relocation with support</option>
            <option value="limited">Limited relocation - specific locations only</option>
            <option value="not-willing">Not willing to relocate</option>
          </select>
          {errors.careerInterests.relocation && (
            <p className="mt-1 text-sm text-red-600">{errors.careerInterests.relocation}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Salary Expectation (Annual)</label>
          <select
            value={assessmentData.careerInterests.salaryExpectation}
            onChange={(e) => handleCareerInterestChange('salaryExpectation', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.careerInterests.salaryExpectation ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select salary expectation</option>
            <option value="entry">$40,000 - $60,000 (Entry Level)</option>
            <option value="mid">$60,000 - $90,000 (Mid Level)</option>
            <option value="senior">$90,000 - $130,000 (Senior Level)</option>
            <option value="lead">$130,000+ (Lead/Expert Level)</option>
          </select>
          {errors.careerInterests.salaryExpectation && (
            <p className="mt-1 text-sm text-red-600">{errors.careerInterests.salaryExpectation}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Long-term Career Goals</label>
          <textarea
            value={assessmentData.careerInterests.longTermGoals}
            onChange={(e) => handleCareerInterestChange('longTermGoals', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.careerInterests.longTermGoals ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Describe your long-term career aspirations and goals..."
            required
          />
          {errors.careerInterests.longTermGoals && (
            <p className="mt-1 text-sm text-red-600">{errors.careerInterests.longTermGoals}</p>
          )}
        </div>
      </div>
    </div>
  );

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/career-preparation' },
    { id: 'assessment', name: 'Student Assessment', icon: <FileText className="w-5 h-5" />, href: '/career-preparation/student-assessment' },
    { id: 'roadmap', name: 'Personalized Roadmap', icon: <Target className="w-5 h-5" />, href: '/career-preparation/personalized-roadmap' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex-shrink-0 hidden md:block">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">Career Prep</h2>
              <p className="text-xs text-gray-500">AI Guidance System</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className={`${pathname === item.href ? 'text-blue-700' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.name}</span>
                {pathname === item.href ? (
                  <ChevronRight className="w-4 h-4 ml-auto text-blue-700" />
                ) : null}
              </Link>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Mobile menu button */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <button className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white">
          <LayoutDashboard className="w-6 h-6" />
        </button>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Student Assessment</h1>
            <p className="text-lg text-gray-600">
              Complete this comprehensive assessment to receive personalized career guidance and roadmap
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit}>
              {renderStepIndicator()}
              
              <div className="mb-8">
                {currentStep === 1 && renderPersonalInfo()}
                {currentStep === 2 && renderAcademicBackground()}
                {currentStep === 3 && renderTechnicalSkills()}
                {currentStep === 4 && renderPsychologicalTraits()}
                {currentStep === 5 && renderCareerInterests()}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-3">
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Processing...' : 'Generate My Career Roadmap'} <Brain className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentAssessment;
