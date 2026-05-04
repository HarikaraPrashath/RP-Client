'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FileText,
  Clock,
  AlertCircle
} from 'lucide-react';

interface AssessmentData {
  personalInfo: {
    gender: string;
    languages: string[];
  };
  academicBackground: {
    educationLevel: string;
    major: string;
    gpa: number;
    currentYear: number;
    currentSemester: string;
  };
  technicalSkills: {
    programming: string[];
    frameworks: string[];
    databases: string[];
    cloudPlatforms: string[];
  };
  psychologicalTraits: {
    stressManagement: string;
    learningStyle: string;
  };
  careerInterests: {
    workEnvironment: string;
    workLifeBalance: string;
  };
  career: {
    stressManagement: string;
    learningStyle: string;
    internship: string;
    projects: string;
    certifications: string;
  };
}

interface ValidationErrors {
  personalInfo: {
    gender?: string;
    languages?: string;
  };
  academicBackground: {
    educationLevel?: string;
    major?: string;
    gpa?: string;
    currentYear?: string;
    currentSemester?: string;
  };
  technicalSkills: {
    programming?: string;
  };
  psychologicalTraits: {
    stressManagement?: string;
    learningStyle?: string;
  };
  careerInterests: {
    workEnvironment?: string;
    workLifeBalance?: string;
  };
  career: {
    stressManagement?: string;
    learningStyle?: string;
    internship?: string;
    projects?: string;
    certifications?: string;
  };
}

const softwareDevelopment = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'C#', 'PHP', 'Ruby', 'Go',
  'Swift', 'Kotlin', 'Rust', 'Scala', 'HTML5', 'CSS3', 'React', 'Next.js', 'Vue.js',
  'Angular', 'Svelte', 'Node.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI',
  'Spring Boot', 'Laravel', 'ASP.NET', '.NET Core', 'REST API', 'GraphQL',
  'Microservices', 'JWT Authentication', 'OAuth', 'Git', 'GitHub', 'GitLab',
  'Webpack', 'Vite', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Redux'
];

const dataAndAI = [
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'Pandas', 'NumPy',
  'Matplotlib', 'SciPy', 'Jupyter Notebook', 'Tableau', 'Power BI', 'Excel',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
  'Scikit-learn', 'OpenCV', 'Natural Language Processing', 'LLMs', 'Hugging Face',
  'LangChain', 'OpenAI API', 'ChatGPT', 'Claude', 'Gemini', 'Prompt Engineering',
  'RAG', 'AI Agents', 'Vector Databases', 'Pinecone', 'FAISS'
];

const cloudAndDevOps = [
  'AWS', 'Microsoft Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes',
  'Jenkins', 'GitHub Actions', 'GitLab CI/CD', 'Terraform', 'Ansible', 'Helm',
  'Prometheus', 'Grafana', 'Nginx', 'Apache', 'Linux', 'Ubuntu', 'CentOS',
  'CI/CD', 'Infrastructure as Code', 'Cloudflare', 'Vercel', 'Netlify',
  'DigitalOcean', 'Heroku', 'Firebase Hosting'
];
const cybersecurityAndNetworking = [
  'Kali Linux', 'Metasploit', 'Nmap', 'Wireshark', 'Burp Suite', 'Splunk',
  'SIEM', 'Firewalls', 'Penetration Testing', 'Ethical Hacking', 'Encryption',
  'IAM', 'Cloud Security', 'SOC', 'Incident Response', 'OWASP', 'TCP/IP',
  'DNS', 'DHCP', 'VPN', 'Routing', 'Switching', 'Cisco', 'Juniper',
  'Fortinet', 'Load Balancing', 'Network Security', 'MikroTik'
];

const designAndEmergingTech = [
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Canva', 'Sketch',
  'Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Typography',
  'Blockchain', 'Ethereum', 'Solidity', 'Web3.js', 'Smart Contracts', 'DeFi',
  'Arduino', 'Raspberry Pi', 'ESP32', 'Embedded Systems', 'IoT', 'MQTT',
  'PCB Design', 'Robotics', 'Unity', 'Unreal Engine', 'Blender', 'ARKit',
  'ARCore', 'Virtual Reality', 'Augmented Reality', 'Google Analytics',
  'SEO Tools', 'SEMrush', 'Ahrefs', 'Content Strategy'
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

// Timer and step configuration
const TOTAL_TIME_SECONDS = 600; // 10 minutes
const STEPS_COUNT = 5;
const TIME_PER_STEP = TOTAL_TIME_SECONDS / STEPS_COUNT; // 120 seconds per step

// Questions count per step for progress tracking
const QUESTIONS_PER_STEP = {
  1: 2, // Personal Info: gender, languages
  2: 5, // Academic: education, major, GPA, year, semester
  3: 4, // Technical: programming, databases, frameworks, cloud
  4: 2, // Career Interests: work environment, work-life balance
  5: 5  // Career: stress, learning style, internship, projects, certifications
};

function StudentAssessment() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME_SECONDS);
  const [stepTimeRemaining, setStepTimeRemaining] = useState(TIME_PER_STEP);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  const [errors, setErrors] = useState<ValidationErrors>({
    personalInfo: {},
    academicBackground: {},
    technicalSkills: {},
    psychologicalTraits: {},
    careerInterests: {},
    career: {}
  });
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    personalInfo: {
      gender: '',
      languages: []
    },
    academicBackground: {
      educationLevel: '',
      major: '',
      gpa: 0,
      currentYear: 0,
      currentSemester: ''
    },
    technicalSkills: {
      programming: [],
      frameworks: [],
      databases: [],
      cloudPlatforms: []
    },
    psychologicalTraits: {
      stressManagement: '',
      learningStyle: ''
    },
    careerInterests: {
      workEnvironment: '',
      workLifeBalance: ''
    },
    career: {
      stressManagement: '',
      learningStyle: '',
      internship: '',
      projects: '',
      certifications: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
      
      setStepTimeRemaining((prev) => {
        if (prev <= 1) {
          // Move to next step when step time expires
          if (currentStep < STEPS_COUNT) {
            handleStepTimeUp();
            return TIME_PER_STEP;
          } else {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, currentStep]);

  // Show warning when step time is low (30 seconds remaining)
  useEffect(() => {
    if (stepTimeRemaining <= 30) {
      setShowTimeWarning(true);
    } else {
      setShowTimeWarning(false);
    }
  }, [stepTimeRemaining]);

  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false);
    // Auto-submit the form
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  }, []);

  const handleStepTimeUp = useCallback(() => {
    if (currentStep < STEPS_COUNT) {
      nextStep();
    }
  }, [currentStep]);

  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const getTotalQuestions = () => Object.values(QUESTIONS_PER_STEP).reduce((a, b) => a + b, 0);
  
  const getCompletedQuestions = () => {
    let completed = 0;
    // Step 1: Personal Info
    if (assessmentData.personalInfo.gender) completed++;
    if (assessmentData.personalInfo.languages.length > 0) completed++;
    
    // Step 2: Academic
    if (assessmentData.academicBackground.educationLevel) completed++;
    if (assessmentData.academicBackground.major) completed++;
    if (assessmentData.academicBackground.gpa > 0) completed++;
    if (assessmentData.academicBackground.currentYear > 0) completed++;
    if (assessmentData.academicBackground.currentSemester) completed++;
    
    // Step 3: Technical
    if (assessmentData.technicalSkills.programming.length > 0) completed++;
    if (assessmentData.technicalSkills.databases.length > 0) completed++;
    if (assessmentData.technicalSkills.frameworks.length > 0) completed++;
    if (assessmentData.technicalSkills.cloudPlatforms.length > 0) completed++;
    
    // Step 4: Career Interests
    if (assessmentData.careerInterests.workEnvironment) completed++;
    if (assessmentData.careerInterests.workLifeBalance) completed++;
    
    // Step 5: Career
    if (assessmentData.career.stressManagement) completed++;
    if (assessmentData.career.learningStyle) completed++;
    if (assessmentData.career.internship) completed++;
    if (assessmentData.career.projects) completed++;
    if (assessmentData.career.certifications) completed++;
    
    return completed;
  };

  const getCurrentStepCompletedQuestions = () => {
    let completed = 0;
    switch (currentStep) {
      case 1:
        if (assessmentData.personalInfo.gender) completed++;
        if (assessmentData.personalInfo.languages.length > 0) completed++;
        break;
      case 2:
        if (assessmentData.academicBackground.educationLevel) completed++;
        if (assessmentData.academicBackground.major) completed++;
        if (assessmentData.academicBackground.gpa > 0) completed++;
        if (assessmentData.academicBackground.currentYear > 0) completed++;
        if (assessmentData.academicBackground.currentSemester) completed++;
        break;
      case 3:
        if (assessmentData.technicalSkills.programming.length > 0) completed++;
        if (assessmentData.technicalSkills.databases.length > 0) completed++;
        if (assessmentData.technicalSkills.frameworks.length > 0) completed++;
        if (assessmentData.technicalSkills.cloudPlatforms.length > 0) completed++;
        break;
      case 4:
        if (assessmentData.careerInterests.workEnvironment) completed++;
        if (assessmentData.careerInterests.workLifeBalance) completed++;
        break;
      case 5:
        if (assessmentData.career.stressManagement) completed++;
        if (assessmentData.career.learningStyle) completed++;
        if (assessmentData.career.internship) completed++;
        if (assessmentData.career.projects) completed++;
        if (assessmentData.career.certifications) completed++;
        break;
    }
    return completed;
  };

  // Validation functions
  const validatePersonalInfo = () => {
    const newErrors: ValidationErrors['personalInfo'] = {};
    
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
    
    if (!assessmentData.academicBackground.gpa || assessmentData.academicBackground.gpa < 0 || assessmentData.academicBackground.gpa > 4) {
      newErrors.gpa = 'Please enter a valid GPA between 0 and 4.0';
    }
    
    if (!assessmentData.academicBackground.currentYear || assessmentData.academicBackground.currentYear < 1 || assessmentData.academicBackground.currentYear > 4) {
      newErrors.currentYear = 'Please enter a valid academic year (1-4)';
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
    
    if (!traits.stressManagement) newErrors.stressManagement = 'Stress management approach is required';
    if (!traits.learningStyle) newErrors.learningStyle = 'Learning style is required';
    
    setErrors(prev => ({ ...prev, psychologicalTraits: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateCareerInterests = () => {
    const newErrors: ValidationErrors['careerInterests'] = {};
    const interests = assessmentData.careerInterests;
    
    if (!interests.workEnvironment) newErrors.workEnvironment = 'Work environment preference is required';
    if (!interests.workLifeBalance) newErrors.workLifeBalance = 'Work-life balance preference is required';
    
    setErrors(prev => ({ ...prev, careerInterests: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateCareer = () => {
    const newErrors: ValidationErrors['career'] = {};
    const career = assessmentData.career;
    
    if (!career.stressManagement.trim()) newErrors.stressManagement = 'Stress management approach is required';
    if (!career.learningStyle.trim()) newErrors.learningStyle = 'Learning style is required';
    if (!career.internship.trim()) newErrors.internship = 'Internship experience is required';
    if (
      career.projects === undefined ||
      career.projects === '' ||
      Number(career.projects) < 0
    ) {
      newErrors.projects = 'Number of projects is required';
    }
    if (!career.certifications.trim()) newErrors.certifications = 'Certifications information is required';
    
    setErrors(prev => ({ ...prev, career: newErrors }));
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
        return validateCareerInterests();
      case 5:
        return validateCareer();
      default:
        return true;
    }
  };

  const handlePersonalInfoChange = (field: string, value: string | number | string[]) => {
    // Format the value based on its type
    let formattedValue: string | number | string[] = value;
    if (typeof value === 'string') {
      formattedValue = value.trim();
    } else if (typeof value === 'number') {
      formattedValue = value;
    } else if (Array.isArray(value)) {
      formattedValue = value;
    }
    
    console.log(`Personal Info Change - Field: ${field}, Value:`, formattedValue);
    
    setAssessmentData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: formattedValue
      }
    }));
  };

  const handleAcademicChange = (field: string, value: string | number | string[]) => {
    // Format the value based on its type
    let formattedValue: string | number | string[] = value;
    if (typeof value === 'string') {
      formattedValue = value.trim();
    } else if (typeof value === 'number') {
      formattedValue = value;
    } else if (Array.isArray(value)) {
      formattedValue = value;
    }
    
    console.log(`Academic Background Change - Field: ${field}, Value:`, formattedValue);
    
    setAssessmentData(prev => ({
      ...prev,
      academicBackground: {
        ...prev.academicBackground,
        [field]: formattedValue
      }
    }));
  };

  const handleTechnicalSkillsChange = (category: keyof AssessmentData['technicalSkills'], skill: string) => {
    console.log(`Technical Skills Change - Category: ${category}, Skill: ${skill}`);
    
    setAssessmentData(prev => {
      // Handle array-based skills
      const currentSkills = prev.technicalSkills[category] as string[];
      const updatedSkills = currentSkills.includes(skill)
        ? currentSkills.filter(s => s !== skill)
        : [...currentSkills, skill];
      
      console.log(`${category} Skills - Updated:`, updatedSkills);
      
      return {
        ...prev,
        technicalSkills: {
          ...prev.technicalSkills,
          [category]: updatedSkills
        }
      };
    });
  };


  const handlePsychologicalChange = (trait: string, value: string) => {
    const formattedValue = value.trim();
    console.log(`Psychological Trait Change - Trait: ${trait}, Value: ${formattedValue}`);
    
    setAssessmentData(prev => ({
      ...prev,
      psychologicalTraits: {
        ...prev.psychologicalTraits,
        [trait]: formattedValue
      }
    }));
  };

  const handleCareerInterestChange = (field: string, value: string | string[]) => {
    // Format the value based on its type
    let formattedValue: string | string[] = value;
    if (typeof value === 'string') {
      formattedValue = value.trim();
    } else if (Array.isArray(value)) {
      formattedValue = value;
    }
    
    console.log(`Career Interest Change - Field: ${field}, Value:`, formattedValue);
    
    setAssessmentData(prev => ({
      ...prev,
      careerInterests: {
        ...prev.careerInterests,
        [field]: formattedValue
      }
    }));
  };

  const handleCareerChange = (field: string, value: string | number) => {
    let formattedValue: string | number = value;
    if (typeof value === 'string') {
      formattedValue = value.trim();
    }
    
    console.log(`Career Change - Field: ${field}, Value: ${formattedValue}`);
    
    setAssessmentData(prev => ({
      ...prev,
      career: {
        ...prev.career,
        [field]: formattedValue
      }
    }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate all steps
  const isPersonalInfoValid = validatePersonalInfo();
  const isAcademicValid = validateAcademicBackground();
  const isTechnicalValid = validateTechnicalSkills();
  const isCareerInterestsValid = validateCareerInterests();
  const isCareerValid = validateCareer();

  if (isPersonalInfoValid && isAcademicValid && isTechnicalValid && isCareerInterestsValid && isCareerValid) {
    setIsSubmitting(true);

    try {
      // Log for debugging
      console.log('=== FORM SUBMISSION DATA ===');
      console.log('Full data:', assessmentData);

      // Replace with your backend API URL
      const API_URL = 'http://127.0.0.1:8000/predict';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Backend Response:', data);

      // Store assessment data in sessionStorage for the roadmap page
      sessionStorage.setItem('assessmentData', JSON.stringify(assessmentData));
      
      // Store the career prediction from the API response
      sessionStorage.setItem('careerPrediction', JSON.stringify(data));

      // Navigate to personalized roadmap
      router.push('/career-preparation/personalized-roadmap');
    } catch (error) {
      console.error('Submission Error:', error);
      alert('Failed to submit assessment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  } else {
    alert('Please fix all validation errors before submitting.');
  }
};


  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setStepTimeRemaining(TIME_PER_STEP); // Reset step timer for new step
      setShowTimeWarning(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setStepTimeRemaining(TIME_PER_STEP); // Reset step timer when going back
      setShowTimeWarning(false);
    }
  };

  const renderStepIndicator = () => {
    const totalQuestions = getTotalQuestions();
    const completedQuestions = getCompletedQuestions();
    const currentStepCompleted = getCurrentStepCompletedQuestions();
    const currentStepTotal = QUESTIONS_PER_STEP[currentStep as keyof typeof QUESTIONS_PER_STEP];
    
    return (
      <div className="mb-8">
        {/* Timer Display */}
        <div className="flex justify-between items-center mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${showTimeWarning ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Time Remaining</p>
              <p className={`text-2xl font-bold ${showTimeWarning ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Step Time</p>
            <p className={`text-xl font-bold ${showTimeWarning ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(stepTimeRemaining)}
            </p>
          </div>
        </div>

        {/* Time Warning */}
        {showTimeWarning && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Hurry up! Time is running out for this step!</span>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex justify-between mb-4">
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
                {step === 4 && 'Interests'}
                {step === 5 && 'Career'}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}
          />
        </div>
        
        {/* Progress Text */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Overall: <span className="font-semibold text-blue-600">{completedQuestions}/{totalQuestions}</span> questions completed
          </span>
          <span className="text-gray-600">
            Step {currentStep}: <span className="font-semibold text-indigo-600">{currentStepCompleted}/{currentStepTotal}</span> answered
          </span>
        </div>
        
        {/* Remaining in Current Step */}
        <p className="text-xs text-gray-500 mt-1 text-center">
          {currentStepTotal - currentStepCompleted} question(s) remaining in current step
        </p>
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
      <p className="text-sm text-gray-600 mb-2">Select the option before answering the questions below.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <p className="text-sm text-gray-600 mb-2">Select the option before answering the questions below.</p>
      
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
            <option value="">Select your education level</option>
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
            <option value="">Select your major/field of study</option>
            {majorOptions.map((major) => (
              <option key={major} value={major}>{major}</option>
            ))}
          </select>
          {errors.academicBackground.major && (
            <p className="mt-1 text-sm text-red-600">{errors.academicBackground.major}</p>
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
            value={assessmentData.academicBackground.currentYear || ''}
            onChange={(e) => handleAcademicChange('currentYear', parseInt(e.target.value) || 0)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.academicBackground.currentYear ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select your academic year</option>
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
            <option value="">Select your current semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>
        
      </div>
    </div>
  );

  const renderTechnicalSkills = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Skills</h2>
      <p className="text-sm text-gray-600 mb-2">Select the option before answering the technical skill questions below.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Programming Languages</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {softwareDevelopment.map((lang) => (
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
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Databases</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dataAndAI.map((db) => (
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
            {cloudAndDevOps.map((framework) => (
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
          <label className="block text-sm font-medium text-gray-700 mb-3">Cloud Platforms</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cybersecurityAndNetworking.map((platform) => (
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
        
      </div>
    </div>
  );

  const renderPsychologicalTraits = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Psychological Traits</h2>
      <p className="text-sm text-gray-600 mb-2">Select the option before answering the psychological trait questions below.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stress Management</label>
          <select
            value={assessmentData.psychologicalTraits.stressManagement}
            onChange={(e) => handlePsychologicalChange('stressManagement', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select your stress management style</option>
            <option value="excellent">Excellent - Thrive under pressure</option>
            <option value="good">Good - Manage stress effectively</option>
            <option value="moderate">Moderate - Need some support</option>
            <option value="structured">Prefer Structured Environments</option>
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
            <option value="">Select your learning style</option>
            <option value="visual">Visual - Learn through seeing</option>
            <option value="auditory">Auditory - Learn through listening</option>
            <option value="kinesthetic">Kinesthetic - Learn by doing</option>
            <option value="reading">Reading/Writing - Learn through text</option>
            <option value="social">Social - Learn in groups</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderCareerInterests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Career Interests</h2>
      <p className="text-sm text-gray-600 mb-2">Select the option before answering the questions below.</p>
      
      <div className="space-y-6">
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
            <option value="">Select your preferred work environment</option>
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
            <option value="">Select your work-life balance preference</option>
            <option value="career-focused">Career-focused - Willing to work extra hours</option>
            <option value="balanced">Balanced - Equal priority to work and personal life</option>
            <option value="life-focused">Life-focused - Strict work hours boundaries</option>
            <option value="flexible">Flexible - Adapt as needed</option>
          </select>
          {errors.careerInterests.workLifeBalance && (
            <p className="mt-1 text-sm text-red-600">{errors.careerInterests.workLifeBalance}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderCareer = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Career Information</h2>
      <p className="text-sm text-gray-600 mb-2">Select the option before answering the questions below.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stress Management Approach</label>
          <select
            value={assessmentData.career.stressManagement}
            onChange={(e) => handleCareerChange('stressManagement', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.career.stressManagement ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select your stress management approach</option>
            <option value="excellent">Excellent - Thrive under pressure</option>
            <option value="good">Good - Manage stress effectively</option>
            <option value="moderate">Moderate - Need some support</option>
            <option value="structured">Prefer Structured Environments</option>
          </select>
          {errors.career.stressManagement && (
            <p className="mt-1 text-sm text-red-600">{errors.career.stressManagement}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
          <select
            value={assessmentData.career.learningStyle}
            onChange={(e) => handleCareerChange('learningStyle', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.career.learningStyle ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select your learning style</option>
            <option value="kinesthetic">Kinesthetic - Learn by doing</option>
            <option value="auditory">Auditory - Learn through listening</option>
            <option value="visual">Visual - Learn through seeing</option>
            <option value="reading">Reading/Writing - Learn through text</option>
            <option value="social">Social - Learn in groups</option>
          </select>
          {errors.career.learningStyle && (
            <p className="mt-1 text-sm text-red-600">{errors.career.learningStyle}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Internship Experience</label>
          <select
            value={assessmentData.career.internship}
            onChange={(e) => handleCareerChange('internship', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.career.internship ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select your internship experience</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.career.internship && (
            <p className="mt-1 text-sm text-red-600">{errors.career.internship}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Real World Projects Completed (Count)</label>
          <input
            type="number"
            value={assessmentData.career.projects}
            onChange={(e) => handleCareerChange('projects', parseInt(e.target.value) || 0)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.career.projects ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter number of projects completed"
            min="0"
            required
          />
          {errors.career.projects && (
            <p className="mt-1 text-sm text-red-600">{errors.career.projects}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
          <select
            value={assessmentData.career.certifications}
            onChange={(e) => handleCareerChange('certifications', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.career.certifications ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select your certifications</option>
            <option value="google">Google</option>
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
            <option value="coursera">Coursera</option>
          </select>
          {errors.career.certifications && (
            <p className="mt-1 text-sm text-red-600">{errors.career.certifications}</p>
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
            <p className="text-lg text-gray-600 mb-2">
              Complete this comprehensive assessment to receive personalized career guidance and roadmap
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-sm">
              <Clock className="w-4 h-4" />
              <span>You have <strong>10 minutes</strong> ({TIME_PER_STEP/60} min per step)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit}>
              {renderStepIndicator()}
              
              <div className="mb-8">
                {currentStep === 1 && renderPersonalInfo()}
                {currentStep === 2 && renderAcademicBackground()}
                {currentStep === 3 && renderTechnicalSkills()}
                {currentStep === 4 && renderCareerInterests()}
                {currentStep === 5 && renderCareer()}
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