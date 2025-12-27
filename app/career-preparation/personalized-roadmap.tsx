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
    name: string;
    email: string;
    age: number;
  };
  academicBackground: {
    educationLevel: string;
    major: string;
    gpa: number;
    graduationYear: number;
  };
  technicalSkills: {
    programming: string[];
    databases: string[];
    frameworks: string[];
    tools: string[];
  };
  psychologicalTraits: {
    workStyle: string;
    communication: string;
    problemSolving: string;
    teamwork: string;
    adaptability: string;
  };
  careerInterests: {
    preferredRoles: string[];
    workEnvironment: string;
    salaryExpectation: string;
    longTermGoals: string;
  };
}

interface CareerPrediction {
  role: string;
  matchPercentage: number;
  description: string;
  keySkills: string[];
  averageSalary: string;
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

  useEffect(() => {
    // Load assessment data from sessionStorage
    const savedAssessmentData = sessionStorage.getItem('assessmentData');
    if (savedAssessmentData) {
      const parsedData: AssessmentData = JSON.parse(savedAssessmentData);
      setAssessmentData(parsedData);
      
      // Generate career prediction and roadmap based on assessment data
      const prediction = generateCareerPrediction(parsedData);
      const generatedRoadmap = generateCareerRoadmap(parsedData, prediction);
      
      setCareerPrediction(prediction);
      setRoadmap(generatedRoadmap);
      setLoading(false);
    } else {
      // If no assessment data, redirect to assessment page
      router.push('/career-preparation/student-assessment');
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
      
      // Check if preferred roles include this role
      if (data.careerInterests.preferredRoles.includes(role.name)) {
        score += 50;
      }
      
      // Check technical skills match
      role.keySkills.forEach(skill => {
        if (
          data.technicalSkills.programming.some(p => p.toLowerCase().includes(skill.toLowerCase())) ||
          data.technicalSkills.frameworks.some(f => f.toLowerCase().includes(skill.toLowerCase())) ||
          data.technicalSkills.tools.some(t => t.toLowerCase().includes(skill.toLowerCase()))
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
      averageSalary: bestMatch.averageSalary,
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
          { title: 'Introduction to Computer Science', type: 'course' },
          { title: 'Programming Fundamentals Project', type: 'project' }
        ],
        completed: false
      },
      {
        id: 'technical',
        title: 'Develop Technical Expertise',
        description: 'Gain in-depth knowledge of the technologies and tools used in your field.',
        duration: '3-4 months',
        skills: prediction.keySkills.slice(0, 3),
        resources: [
          { title: 'Advanced Technical Course', type: 'course' },
          { title: 'Technical Certification', type: 'certification' }
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
          { title: 'Capstone Project', type: 'project' },
          { title: 'Internship or Freelance Work', type: 'project' }
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
          { title: 'Specialization Course', type: 'course' },
          { title: 'Industry Conference', type: 'article' }
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
          { title: 'Career Development Workshop', type: 'course' },
          { title: 'Professional Certification', type: 'certification' }
        ],
        completed: false
      }
    ];

    return {
      title: `${prediction.role} Career Path`,
      description: `A personalized roadmap to become a successful ${prediction.role} based on your skills, interests, and goals.`,
      totalDuration: '17-24 months',
      milestones: baseMilestones
    };
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
    
    const roadmapText = `
Personalized Career Roadmap
===========================

Career: ${careerPrediction.role}
Match: ${careerPrediction.matchPercentage}%
Total Duration: ${roadmap.totalDuration}

Description:
${roadmap.description}

Milestones:
${roadmap.milestones.map((milestone, index) => `
${index + 1}. ${milestone.title} (${milestone.duration})
   ${milestone.description}
   Skills: ${milestone.skills.join(', ')}
   Resources: ${milestone.resources.map(r => r.title).join(', ')}
   Status: ${milestone.completed ? 'Completed' : 'Pending'}
`).join('\n')}

Generated by AI-Powered Career Guidance System
    `;
    
    const blob = new Blob([roadmapText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${careerPrediction.role.replace(/\s+/g, '_')}_Roadmap.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                  
                  <h3 className="font-bold text-gray-900 mb-2">Average Salary</h3>
                  <p className="text-gray-600 text-sm">{careerPrediction.averageSalary}</p>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Key Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {careerPrediction.keySkills.map((skill, index) => (
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
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 flex items-center gap-2">
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
          
          {roadmap.milestones.map((milestone, index) => (
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
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                              Start <Play className="w-3 h-3" />
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

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="mb-6 text-blue-100">
            Start with the first milestone in your personalized roadmap and track your progress as you develop the skills needed for your dream career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
              Start First Milestone <ArrowRight className="w-4 h-4" />
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