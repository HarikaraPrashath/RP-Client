'use client';

import React, { useState } from 'react';
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
  LayoutDashboard,
  ChevronRight,
  Home
} from 'lucide-react';

function CareerPreparation() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedRole, setSelectedRole] = useState('data-science');
  const [activeTab, setActiveTab] = useState('dashboard');

  const careerRoles = [
    {
      id: 'data-science',
      title: 'Data Science',
      description: 'Analyze complex data sets and extract meaningful insights to drive business decisions.',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity',
      description: 'Protect systems, networks, and programs from digital attacks and unauthorized access.',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'web-development',
      title: 'Web Development',
      description: 'Build and maintain websites and web applications for various platforms and devices.',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'ai-engineering',
      title: 'AI Engineering',
      description: 'Design, develop, and implement artificial intelligence models and systems.',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const roadmapFeatures = [
    {
      title: 'Skill Assessment',
      description: 'Evaluation of your current skills to identify areas for growth and development.',
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: 'Internship Path',
      description: 'Step-by-step guidance to prepare for and secure internship opportunities.',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your readiness for internships with clear progress indicators.',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: 'Career Guidance',
      description: 'Expert advice to help you navigate your career path successfully.',
      icon: <Users className="w-6 h-6" />
    }
  ];

  const handleTryService = () => {
    router.push('/career-preparation/student-assessment');
  };

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
                  pathname === item.href || (item.id === 'dashboard' && pathname === '/career-preparation')
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className={`${pathname === item.href || (item.id === 'dashboard' && pathname === '/career-preparation') ? 'text-blue-700' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.name}</span>
                {pathname === item.href || (item.id === 'dashboard' && pathname === '/career-preparation') ? (
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Path to Career Success
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Step-by-step guidance to help you grow your skills and secure internship opportunities in the IT industry.
          </p>
        </div>

        {/* Career Role Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Career Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {careerRoles.map((role) => (
              <div
                key={role.id}
                className={`bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedRole === role.id 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center mb-4`}>
                  <div className="text-white">
                    {role.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - System Features */}
          <div className="lg:col-span-2 space-y-8">
            {/* System Overview */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Career Path Analysis</h2>
                  <p className="text-gray-600 mb-6">
                    Our system evaluates your skills, interests, and goals to create a personalized path that helps you grow professionally and secure internship opportunities.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Personalized skill development plan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Internship readiness assessment</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Industry-aligned career guidance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalized Roadmaps */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Internship-Focused Roadmaps</h2>
                  <p className="text-gray-600 mb-6">
                    Step-by-step guidance to build the skills and experience needed to secure competitive internship opportunities in your chosen field.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Skill-building milestones</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Internship preparation tasks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Personalized growth path</span>
                    </div>
                  </div>
                  <button
                    onClick={handleTryService}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    Start Assessment <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Continuous Monitoring */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Internship Readiness Tracking</h2>
                  <p className="text-gray-600 mb-6">
                    Monitor your progress toward internship readiness with clear indicators of your preparedness for real-world industry experience.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Internship readiness score</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Skill gap analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Personalized improvement recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Features & CTA */}
          <div className="space-y-8">
            {/* Key Features */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">System Features</h3>
              <div className="space-y-4">
                {roadmapFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethical Framework */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ethical Framework</h3>
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-10 h-10 text-green-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Responsible Data Handling</h4>
                  <p className="text-sm text-gray-600">
                    We prioritize ethical data handling and privacy protection throughout your career journey.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="w-10 h-10 text-blue-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Expert Validation</h4>
                  <p className="text-sm text-gray-600">
                    All recommendations are validated by IT specialists and psychologists for relevance.
                  </p>
                </div>
              </div>
            </div>

            {/* Success Metrics */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Bridging the Gap</h3>
              <p className="mb-6 text-blue-100">
                Our comprehensive framework bridges the gap between educational preparation and employment by providing a data-backed, structured journey toward professional success.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">Industry-aligned skill development</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">Personalized career insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">Expert-validated guidance</span>
                </div>
              </div>
              <button
                onClick={handleTryService}
                className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Assessment <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}

export default CareerPreparation;