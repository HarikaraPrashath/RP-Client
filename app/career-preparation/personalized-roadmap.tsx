'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Target,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  Lightbulb,
  Award,
  UserCheck,
  FileText,
  Calendar,
  ChevronLeft,
  Download,
  Share,
  Play,
  Check,
  LayoutDashboard,
  ChevronRight,
  Home
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

interface CareerPrediction {
  role: string;
  matchPercentage: number;
  description: string;
  keySkills: string[];
  internshipQuality: number;
  growthOutlook: string;
}

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  resources: {
    title: string;
    type: 'course' | 'project' | 'certification' | 'article';
    link?: string;
  }[];
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  link?: string;
  completed: boolean;
}

interface CareerRoadmap {
  title: string;
  description: string;
  totalDuration: string;
  milestones: RoadmapMilestone[];
}

function PersonalizedRoadmap() {
  const router = useRouter();
  const pathname = usePathname();
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [careerPrediction, setCareerPrediction] = useState<CareerPrediction | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMilestone, setActiveMilestone] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCourses, setShowCourses] = useState(false);

  useEffect(() => {
    // Load assessment data from sessionStorage
    const savedAssessmentData = sessionStorage.getItem('assessmentData');
    const savedCareerPrediction = sessionStorage.getItem('careerPrediction');
    
    try {
      if (savedAssessmentData && savedCareerPrediction) {
        const parsedData: AssessmentData = JSON.parse(savedAssessmentData);
        const apiResponse = JSON.parse(savedCareerPrediction);
        
        console.log('📊 Using assessment data:');
        console.log('Assessment Data:', parsedData);
        console.log('API Response:', apiResponse);
        
        setAssessmentData(parsedData);
        
        // Convert API response to CareerPrediction format
        // Use dynamic values from API if available, otherwise use defaults
        const careerPrediction: CareerPrediction = {
          role: apiResponse.predicted_career || 'Software Engineer',
          matchPercentage: apiResponse.match_percentage || 85, // Use API value if available
          description: apiResponse.description || `A professional role as a ${apiResponse.predicted_career || 'Software Engineer'} based on your assessment.`,
          keySkills: apiResponse.key_skills || ['Programming', 'Problem Solving', 'Communication', 'Teamwork'], // Use API skills if available
          internshipQuality: apiResponse.internship_quality || 75, // Use API value if available
          growthOutlook: apiResponse.growth_outlook || 'High growth potential' // Use API value if available
        };
        
        setCareerPrediction(careerPrediction);
        
        // Generate roadmap based on prediction
        const generatedRoadmap = generateCareerRoadmap(parsedData, careerPrediction);
        setRoadmap(generatedRoadmap);
        
        // Generate recommended courses
        const recommendedCourses = generateRecommendedCourses(parsedData, careerPrediction);
        setCourses(recommendedCourses);
        setLoading(false);
      } else {
        // If no assessment data, redirect to assessment page
        console.log('❌ No assessment data found, redirecting to assessment page');
        router.push('/career-preparation/student-assessment');
      }
    } catch (error) {
      console.error('❌ Error processing session data:', error);
      setLoading(false);
    }
  }, [router]);

  const generateCareerPrediction = (data: AssessmentData): CareerPrediction => {
    // This is a simplified algorithm for demonstration
    // In a real application, this would involve more complex ML algorithms
    
    const roles = [
      {
        name: 'Data Scientist',
        description: 'Analyze complex data sets and extract meaningful insights to drive business decisions.',
        keySkills: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
        averageSalary: '$95,000 - $130,000',
        growthOutlook: 'Very High (31% growth by 2030)'
      },
      {
        name: 'Cybersecurity Analyst',
        description: 'Protect systems, networks, and programs from digital attacks and unauthorized access.',
        keySkills: ['Network Security', 'Risk Assessment', 'Incident Response', 'Security Tools'],
        averageSalary: '$85,000 - $120,000',
        growthOutlook: 'High (33% growth by 2030)'
      },
      {
        name: 'AI Engineer',
        description: 'Design, develop, and implement artificial intelligence models and systems.',
        keySkills: ['Machine Learning', 'Deep Learning', 'Python', 'Neural Networks'],
        averageSalary: '$110,000 - $150,000',
        growthOutlook: 'Very High (38% growth by 2030)'
      },
      {
        name: 'Software Engineer',
        description: 'Design, develop, and maintain software applications and systems.',
        keySkills: ['Programming', 'Algorithms', 'Software Architecture', 'Debugging'],
        averageSalary: '$90,000 - $130,000',
        growthOutlook: 'High (22% growth by 2030)'
      }
    ];

    // Simple scoring based on skills and interests
    let bestMatch = roles[0];
    let highestScore = 0;

    roles.forEach(role => {
      let score = 0;
      
      // Check if work environment matches the role
      if (data.careerInterests.workEnvironment) {
        // Add score based on work environment preference
        score += 20;
      }
      
      // Check if career information is provided
      if (data.career.stressManagement && data.career.learningStyle && data.career.internship && data.career.projects && data.career.certifications) {
        // Add score for having complete career information
        score += 15;
      }
      
      // Check technical skills match
      role.keySkills.forEach(skill => {
        if (
          data.technicalSkills.programming.some(p => p.toLowerCase().includes(skill.toLowerCase())) ||
          data.technicalSkills.frameworks.some(f => f.toLowerCase().includes(skill.toLowerCase())) ||
          data.technicalSkills.databases.some(d => d.toLowerCase().includes(skill.toLowerCase())) ||
          data.technicalSkills.cloudPlatforms.some(c => c.toLowerCase().includes(skill.toLowerCase()))
        ) {
          score += 10;
        }
      });
      
      // Add some randomness for demo purposes
      score += Math.floor(Math.random() * 20);
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = role;
      }
    });

    return {
      role: bestMatch.name,
      matchPercentage: Math.min(95, 70 + Math.floor(Math.random() * 25)),
      description: bestMatch.description,
      keySkills: bestMatch.keySkills,
      internshipQuality: Math.min(95, 70 + Math.floor(Math.random() * 25)),
      growthOutlook: bestMatch.growthOutlook
    };
  };

  const generateCareerRoadmap = (data: AssessmentData, prediction: CareerPrediction): CareerRoadmap => {
    // Generate a personalized roadmap based on the career prediction
    const baseMilestones: RoadmapMilestone[] = [
      {
        id: 'foundation',
        title: 'Build Strong Foundation',
        description: 'Master the core concepts and skills required for your career path.',
        duration: '2-3 months',
        skills: ['Core Programming', 'Computer Science Fundamentals', 'Problem Solving'],
        resources: [
          { title: 'Harvard CS50: Introduction to Computer Science', type: 'course' },
          { title: 'Python for Everybody by University of Michigan', type: 'course' },
          { title: 'The Complete Web Developer Bootcamp', type: 'course' },
          { title: 'Build a Simple Calculator Project', type: 'project' },
          { title: 'Computer Science Essentials by edX', type: 'certification' },
          { title: 'Programming Fundamentals Article Series', type: 'article' }
        ],
        completed: false
      },
      {
        id: 'technical',
        title: 'Develop Technical Expertise',
        description: 'Gain in-depth knowledge of the technologies and tools used in your field.',
        duration: '3-4 months',
        skills: (prediction.keySkills || []).slice(0, 3),
        resources: [
          { title: 'Advanced Data Structures and Algorithms', type: 'course' },
          { title: 'Database Design and Management', type: 'course' },
          { title: 'Cloud Computing Fundamentals', type: 'course' },
          { title: 'Build a Full-Stack Application', type: 'project' },
          { title: 'AWS Certified Developer Associate', type: 'certification' },
          { title: 'Tech Industry Trends Report', type: 'article' }
        ],
        completed: false
      },
      {
        id: 'practical',
        title: 'Gain Practical Experience',
        description: 'Apply your knowledge through real-world projects and experiences.',
        duration: '4-6 months',
        skills: ['Project Management', 'Team Collaboration', 'Real-world Problem Solving'],
        resources: [
          { title: 'Capstone Project: Build a Complete System', type: 'project' },
          { title: 'Open Source Contribution Guide', type: 'course' },
          { title: 'Agile Project Management', type: 'course' },
          { title: 'Internship Preparation Workshop', type: 'course' },
          { title: 'Freelance Platform Setup Guide', type: 'article' },
          { title: 'Team Collaboration Tools Mastery', type: 'certification' }
        ],
        completed: false
      },
      {
        id: 'specialization',
        title: 'Specialize and Advance',
        description: 'Develop specialized skills and expertise in your chosen area.',
        duration: '6-8 months',
        skills: ['Specialized Technologies', 'Advanced Techniques', 'Industry Best Practices'],
        resources: [
          { title: 'Advanced Machine Learning Specialization', type: 'course' },
          { title: 'Cybersecurity Professional Certificate', type: 'certification' },
          { title: 'AI Engineering Masterclass', type: 'course' },
          { title: 'Software Architecture Patterns', type: 'course' },
          { title: 'Industry Conference Proceedings', type: 'article' },
          { title: 'Build a Specialized Tech Project', type: 'project' }
        ],
        completed: false
      },
      {
        id: 'professional',
        title: 'Launch Your Career',
        description: 'Prepare for and launch your professional career in your chosen field.',
        duration: '2-3 months',
        skills: ['Resume Building', 'Interview Skills', 'Professional Networking'],
        resources: [
          { title: 'Technical Interview Preparation', type: 'course' },
          { title: 'Professional Resume Building Workshop', type: 'course' },
          { title: 'Networking for Tech Professionals', type: 'course' },
          { title: 'Personal Branding for Developers', type: 'course' },
          { title: 'Industry-Recognized Certification', type: 'certification' },
          { title: 'Job Search Strategies in Tech', type: 'article' }
        ],
        completed: false
      }
    ];

    return {
      title: `${prediction?.role || 'Career'} Career Path`,
      description: `A personalized roadmap to become a successful ${prediction?.role || 'professional'} based on your skills, interests, and goals.`,
      totalDuration: '17-24 months',
      milestones: baseMilestones
    };
  };

  const generateRecommendedCourses = (data: AssessmentData, prediction: CareerPrediction): Course[] => {
    // Generate courses based on career prediction and assessment data
    const baseCourses: Course[] = [
      {
        id: 'intro-course',
        title: 'Introduction to Computer Science',
        description: 'Learn the fundamentals of computer science and programming.',
        duration: '4 weeks',
        difficulty: 'Beginner',
        category: 'Fundamentals',
        link: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
        completed: false
      },
      {
        id: 'programming-course',
        title: 'Programming Fundamentals',
        description: 'Master the core programming concepts and problem-solving techniques.',
        duration: '6 weeks',
        difficulty: 'Beginner',
        category: 'Programming',
        link: 'https://www.coursera.org/learn/python-for-everybody',
        completed: false
      },
      {
        id: 'data-structures',
        title: 'Data Structures and Algorithms',
        description: 'Understand essential data structures and algorithms for efficient programming.',
        duration: '8 weeks',
        difficulty: 'Intermediate',
        category: 'Computer Science',
        link: 'https://www.coursera.org/learn/data-structures',
        completed: false
      },
      {
        id: 'web-development',
        title: 'Web Development Basics',
        description: 'Learn to build modern web applications using HTML, CSS, and JavaScript.',
        duration: '10 weeks',
        difficulty: 'Beginner',
        category: 'Web Development',
        link: 'https://www.udemy.com/course/the-complete-web-developer-in-2020/',
        completed: false
      },
      {
        id: 'database-course',
        title: 'Database Management Systems',
        description: 'Learn how to design, implement, and manage databases effectively.',
        duration: '6 weeks',
        difficulty: 'Intermediate',
        category: 'Databases',
        link: 'https://www.coursera.org/learn/databases',
        completed: false
      }
    ];

    // Add role-specific courses
    if (prediction.role === 'Data Scientist') {
      baseCourses.push(
        {
          id: 'statistics-course',
          title: 'Statistics for Data Science',
          description: 'Master statistical concepts and methods for data analysis.',
          duration: '8 weeks',
          difficulty: 'Intermediate',
          category: 'Data Science',
          link: 'https://www.coursera.org/learn/statistics-with-python',
          completed: false
        },
        {
          id: 'ml-course',
          title: 'Machine Learning Fundamentals',
          description: 'Introduction to machine learning algorithms and applications.',
          duration: '12 weeks',
          difficulty: 'Advanced',
          category: 'Machine Learning',
          link: 'https://www.coursera.org/learn/machine-learning',
          completed: false
        }
      );
    } else if (prediction.role === 'Cybersecurity Analyst') {
      baseCourses.push(
        {
          id: 'security-fundamentals',
          title: 'Cybersecurity Fundamentals',
          description: 'Learn the core concepts of cybersecurity and information protection.',
          duration: '8 weeks',
          difficulty: 'Intermediate',
          category: 'Cybersecurity',
          link: 'https://www.coursera.org/learn/introduction-cyber-security',
          completed: false
        },
        {
          id: 'network-security',
          title: 'Network Security',
          description: 'Understand network protocols and security measures.',
          duration: '10 weeks',
          difficulty: 'Advanced',
          category: 'Cybersecurity',
          link: 'https://www.coursera.org/learn/network-security',
          completed: false
        }
      );
    } else if (prediction.role === 'AI Engineer') {
      baseCourses.push(
        {
          id: 'ai-fundamentals',
          title: 'Artificial Intelligence Fundamentals',
          description: 'Introduction to AI concepts, techniques, and applications.',
          duration: '10 weeks',
          difficulty: 'Intermediate',
          category: 'Artificial Intelligence',
          link: 'https://www.coursera.org/learn/artificial-intelligence',
          completed: false
        },
        {
          id: 'deep-learning',
          title: 'Deep Learning and Neural Networks',
          description: 'Advanced deep learning techniques and neural network architectures.',
          duration: '12 weeks',
          difficulty: 'Advanced',
          category: 'Deep Learning',
          link: 'https://www.coursera.org/learn/neural-networks-deep-learning',
          completed: false
        }
      );
    } else if (prediction.role === 'Software Engineer') {
      baseCourses.push(
        {
          id: 'software-design',
          title: 'Software Design Patterns',
          description: 'Learn common design patterns and best practices in software development.',
          duration: '8 weeks',
          difficulty: 'Intermediate',
          category: 'Software Engineering',
          link: 'https://www.coursera.org/learn/software-design',
          completed: false
        },
        {
          id: 'system-design',
          title: 'System Design Fundamentals',
          description: 'Design scalable and efficient software systems.',
          duration: '10 weeks',
          difficulty: 'Advanced',
          category: 'Software Engineering',
          link: 'https://www.coursera.org/learn/system-design',
          completed: false
        }
      );
    }

    return baseCourses;
  };

  const toggleCourseCompletion = (courseId: string) => {
    const updatedCourses = courses.map(course => ({
      ...course,
      completed: course.id === courseId ? !course.completed : course.completed
    }));
    setCourses(updatedCourses);
  };

  const redirectToRoadmapSh = () => {
    window.open('https://roadmap.sh', '_blank');
  };

  const toggleMilestoneCompletion = (milestoneId: string) => {
    if (!roadmap) return;
    
    const updatedMilestones = roadmap.milestones.map(milestone => ({
      ...milestone,
      completed: milestone.id === milestoneId ? !milestone.completed : milestone.completed
    }));
    
    setRoadmap({
      ...roadmap,
      milestones: updatedMilestones
    });
  };

  const downloadRoadmap = () => {
    if (!roadmap || !careerPrediction) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Create HTML content for the PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${careerPrediction.role} Career Roadmap</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 10px;
        }
        h2 {
          color: #1d4ed8;
          margin-top: 30px;
        }
        h3 {
          color: #1e40af;
          margin-top: 20px;
        }
        .milestone {
          border-left: 3px solid #2563eb;
          padding-left: 15px;
          margin: 20px 0;
        }
        .skills {
          background-color: #f0f9ff;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
        }
        .match-percentage {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-weight: bold;
        }
        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #e5e7eb;
          border-radius: 10px;
          margin: 10px 0;
        }
        .progress-fill {
          height: 100%;
          background-color: #2563eb;
          border-radius: 10px;
          width: ${careerPrediction.matchPercentage}%;
        }
        .footer {
          margin-top: 50px;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${careerPrediction.role} Career Roadmap</h1>
      
      <h2>Personalized Career Roadmap</h2>
      
      <div class="match-percentage">Match: ${careerPrediction.matchPercentage}%</div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      
      <p><strong>Total Duration:</strong> ${roadmap.totalDuration}</p>
      
      <h2>Description</h2>
      <p>${roadmap.description}</p>
      
      <h2>Key Skills</h2>
      <div class="skills">
        ${careerPrediction.keySkills.map(skill => `<span>${skill}</span>`).join(' • ')}
      </div>
      
      <h2>Career Details</h2>
      <p><strong>Growth Outlook:</strong> ${careerPrediction.growthOutlook}</p>
      <p><strong>Internship Quality:</strong> ${careerPrediction.internshipQuality}%</p>
      
      <h2>Career Milestones</h2>
      ${roadmap.milestones.map((milestone, index) => `
        <div class="milestone">
          <h3>${index + 1}. ${milestone.title} (${milestone.duration})</h3>
          <p><strong>Description:</strong> ${milestone.description}</p>
          <p><strong>Skills:</strong> ${milestone.skills.join(', ')}</p>
          <p><strong>Resources:</strong> ${milestone.resources.map(r => r.title).join(', ')}</p>
          <p><strong>Status:</strong> ${milestone.completed ? 'Completed' : 'Pending'}</p>
        </div>
      `).join('')}
      
      <div class="footer">
        *Generated by AI-Powered Career Guidance System*
      </div>
      
      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background-color: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Download as PDF</button>
        <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">Click the button above and select "Save as PDF" in the print dialog</p>
      </div>
    </body>
    </html>
    `;
    
    // Write the HTML content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const shareRoadmap = () => {
    if (!roadmap || !careerPrediction) return;
    
    const shareText = `Check out my personalized career roadmap for becoming a ${careerPrediction.role}! Match: ${careerPrediction.matchPercentage}%. Total duration: ${roadmap.totalDuration}.`;
    const shareUrl = window.location.href;
    
    // Create share URLs for different platforms
    const shareUrls = {
      email: `mailto:?subject=My Personalized Career Roadmap&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };
    
    // Create a simple share dialog
    const shareDialog = document.createElement('div');
    shareDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    shareDialog.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">Share Your Roadmap</h3>
        <div class="grid grid-cols-2 gap-3">
          <a href="${shareUrls.email}" target="_blank" class="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
            </div>
            <span class="text-sm">Email</span>
          </a>
          <a href="${shareUrls.whatsapp}" target="_blank" class="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <span class="text-sm">WhatsApp</span>
          </a>
          <a href="${shareUrls.twitter}" target="_blank" class="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
            <div class="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </div>
            <span class="text-sm">Twitter</span>
          </a>
          <a href="${shareUrls.linkedin}" target="_blank" class="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <span class="text-sm">LinkedIn</span>
          </a>
          <a href="${shareUrls.facebook}" target="_blank" class="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
            <div class="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.989C16.343 19.128 20 14.991 20 10z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <span class="text-sm">Facebook</span>
          </a>
        </div>
        <button class="mt-4 w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200" onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    
    document.body.appendChild(shareDialog);
    
    // Close dialog when clicking outside
    shareDialog.addEventListener('click', (e) => {
      if (e.target === shareDialog) {
        shareDialog.remove();
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Assessment</h2>
          <p className="text-gray-600">Generating your personalized career roadmap...</p>
        </div>
      </div>
    );
  }

  if (!assessmentData || !careerPrediction || !roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">We couldn't load your assessment data. Please try again.</p>
          <button
            onClick={() => router.push('/career-preparation/student-assessment')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
          >
            Return to Assessment
          </button>
        </div>
      </div>
    );
  }

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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Career Preparation
            </button>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Personalized Career Roadmap
            </h1>
            <p className="text-lg text-gray-600">
              Based on your assessment, we've created a customized roadmap to help you become a {careerPrediction.role}.
            </p>
          </div>

        {/* Career Prediction Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Target className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{careerPrediction.role}</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                    style={{ width: `${careerPrediction.matchPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900">{careerPrediction.matchPercentage}%</span>
              </div>
              <p className="text-gray-600 text-sm">Match with your profile</p>
            </div>
            
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm mb-4">{careerPrediction.description}</p>
                  
                  <h3 className="font-bold text-gray-900 mb-2">Internship Quality</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                        style={{ width: `${careerPrediction.internshipQuality}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{careerPrediction.internshipQuality}%</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Key Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(careerPrediction.keySkills || []).map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2">Growth Outlook</h3>
                  <p className="text-gray-600 text-sm">{careerPrediction.growthOutlook}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Overview */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{roadmap.title}</h2>
            <div className="flex gap-3">
              <button
                onClick={downloadRoadmap}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={shareRoadmap}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 flex items-center gap-2"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">{roadmap.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Total Duration: {roadmap.totalDuration}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>5 Milestones</span>
            </div>
          </div>
        </div>

        {/* Roadmap Milestones */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Career Journey</h2>
          
          {(roadmap?.milestones || []).map((milestone, index) => (
            <div 
              key={milestone.id}
              className={`bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                activeMilestone === milestone.id 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${milestone.completed ? 'bg-green-50 border-green-200' : ''}`}
              onClick={() => setActiveMilestone(activeMilestone === milestone.id ? null : milestone.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  milestone.completed 
                    ? 'bg-green-500' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                  {milestone.completed ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{milestone.duration}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMilestoneCompletion(milestone.id);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          milestone.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {milestone.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{milestone.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-900 mb-2">Skills to Develop</h4>
                    <div className="flex flex-wrap gap-2">
                      {milestone.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {activeMilestone === milestone.id && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Recommended Resources</h4>
                      <div className="space-y-2">
                        {milestone.resources.map((resource, resourceIndex) => (
                          <div key={resourceIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              resource.type === 'course' ? 'bg-blue-100 text-blue-600' :
                              resource.type === 'project' ? 'bg-green-100 text-green-600' :
                              resource.type === 'certification' ? 'bg-purple-100 text-purple-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {resource.type === 'course' && <BookOpen className="w-4 h-4" />}
                              {resource.type === 'project' && <Target className="w-4 h-4" />}
                              {resource.type === 'certification' && <Award className="w-4 h-4" />}
                              {resource.type === 'article' && <FileText className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{resource.title}</h5>
                              <p className="text-xs text-gray-600 capitalize">{resource.type}</p>
                            </div>
                            <button
                              onClick={() => {
                                // Open appropriate website based on resource type
                                if (resource.type === 'course') {
                                  window.open('https://www.coursera.org', '_blank');
                                } else if (resource.type === 'project') {
                                  window.open('https://github.com', '_blank');
                                } else if (resource.type === 'certification') {
                                  window.open('https://www.coursera.org/professional-certificates', '_blank');
                                } else {
                                  window.open('https://medium.com', '_blank');
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                            >
                              Learn More <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommended Courses Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended Courses</h2>
            <button
              onClick={() => setShowCourses(!showCourses)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 flex items-center gap-2"
            >
              {showCourses ? 'Hide Courses' : 'Show Courses'} <Play className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Based on your career path as a {careerPrediction.role}, we've selected these courses to help you develop the necessary skills.
          </p>
          
          {showCourses && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(courses || []).map((course) => (
                <div
                  key={course.id}
                  className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                    course.completed
                      ? 'bg-green-50 border-green-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          course.difficulty === 'Beginner' ? 'bg-blue-100 text-blue-800' :
                          course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {course.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <button
                        onClick={() => toggleCourseCompletion(course.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-2 ${
                          course.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {course.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className="text-xs text-gray-500">
                        {course.completed ? 'Completed' : 'Mark Complete'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {course.completed ? 'Course Completed!' : 'Start Learning'}
                    </span>
                    <button
                      onClick={() => course.link && window.open(course.link, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      Start Course <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Roadmap.sh Recommendation */}
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Need More Learning Resources?</h3>
                <p className="text-indigo-100">
                  Check out roadmap.sh for comprehensive learning roadmaps across various tech domains.
                </p>
              </div>
              <button
                onClick={redirectToRoadmapSh}
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Visit roadmap.sh <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="mb-6 text-blue-100">
            Start with the first milestone in your personalized roadmap and track your progress as you develop the skills needed for your dream career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setShowCourses(true);
                // Open the first course if available
                if (courses.length > 0 && courses[0].link) {
                  window.open(courses[0].link, '_blank');
                } else {
                  window.open('https://www.coursera.org', '_blank');
                }
              }}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              Start First Course <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Schedule Reminder
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default PersonalizedRoadmap;