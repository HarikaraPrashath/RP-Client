"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  Sparkles,
  Target,
  Briefcase,
  Heart,
  ArrowRight,
  Check,
  TrendingUp,
  Users,
  Zap,
  ChartColumnDecreasing,
  GraduationCap,
  Rocket,
  ChartNoAxesCombined,
  Store
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in-down">
            <div className="w-10 h-10 ">
              <Image
                src="logo.png"
                alt="Logo"
                width={120}
                height={120}
                className=" "
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mentora
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#services"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Services
            </a>
            <a
              href="#features"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              About
            </a>
            <a
              href="#transform"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Transform Your Career
            </a>
            <a
              href="#pricing"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <Link href="/trends" className="text-foreground/70 hover:text-foreground transition-colors">
              Trend Radar
            </Link>
            <Link href="/merge-skills" className="text-foreground/70 hover:text-foreground transition-colors">
              Merge Skills
            </Link>
          </div>
          <button
            type="button"
            className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft"></div>
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div
                className="inline-block animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2 justify-start">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Welcome to the Future of Careers
                  </span>
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              </div>

              <h1
                className="text-5xl md:text-8xl font-bold animate-fade-in-up "
                style={{ animationDelay: "0.4s" }}
              >
                Shape Your
                <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent py-3">
                  Career Journey
                </span>
              </h1>

              <p
                className="text-lg text-foreground/70 max-w-2xl animate-fade-in-up "
                style={{ animationDelay: "0.6s" }}
              >
                Transform your career path with AI-powered guidance,
                comprehensive preparation, real marketplace opportunities, and
                emotional support. All in one intelligent platform designed for
                your success.
              </p>

              <div
                className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.8s" }}
              >
                <a href="#services">
                  <button
                    type="button"
                    className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    Start Your Journey <ArrowRight className="w-5 h-5" />
                  </button>
                </a>

                <button
                  type="button"
                  className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all duration-300"
                >
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Animated Career Elements */}
            <div className="relative h-full min-h-96 hidden lg:flex items-center justify-center">
              {/* Background animated circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-64 h-64 border-2 border-primary/20 rounded-full animate-spin-slow"></div>
                <div
                  className="absolute w-80 h-80 border-2 border-accent/20 rounded-full animate-spin-reverse"
                  style={{ animationDuration: "20s" }}
                ></div>
              </div>

              {/* Center icon */}
              <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                <ChartNoAxesCombined className="w-12 h-12 text-white" />
              </div>

              {/* Orbiting career elements */}
              <div className="absolute inset-0">
                {/* Career Guide - Top */}
                <div
                  className="absolute w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg animate-orbit-top"
                  style={{
                    top: "5%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    animation: "orbit-vertical 8s linear infinite",
                  }}
                >
                  <Target className="w-8 h-8 text-primary" />
                </div>

                {/* Career Preparation - Right */}
                <div
                  className="absolute w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    top: "50%",
                    right: "5%",
                    transform: "translateY(-50%)",
                    animation: "orbit-right 8s linear infinite",
                  }}
                >
                  <Zap className="w-8 h-8 text-accent" />
                </div>

                {/* Career Marketplace - Bottom */}
                <div
                  className="absolute w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    bottom: "5%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    animation: "orbit-bottom 8s linear infinite",
                  }}
                >
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>

                {/* Career Emotion Guide - Left */}
                <div
                  className="absolute w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    top: "50%",
                    left: "5%",
                    transform: "translateY(-50%)",
                    animation: "orbit-left 8s linear infinite",
                  }}
                >
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
              </div>

              {/* Floating stats */}
              <div
                className="absolute bottom-12 left-8 bg-white rounded-xl p-4 shadow-lg animate-fade-in-up"
                style={{ animationDelay: "1.2s" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">50K+ Data</span>
                </div>
                <p className="text-xs text-foreground/70">
                  Transforming careers daily
                </p>
              </div>

              <div
                className="absolute top-12 right-8 bg-white rounded-xl p-4 shadow-lg animate-fade-in-up"
                style={{ animationDelay: "1.4s" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-sm">95% Success</span>
                </div>
                <p className="text-xs text-foreground/70">
                  Career goals achieved
                </p>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-primary/50" />
          </div>
        </div>
      </section>

      {/* Add keyframe animations to globals.css */}
      <style>{`
        @keyframes orbit-vertical {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-20px); }
        }

        @keyframes orbit-right {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(20px); }
        }

        @keyframes orbit-bottom {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(20px); }
        }

        @keyframes orbit-left {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(-20px); }
        }
      `}</style>

      {/* Services Section */}
      <section
        id="services"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-primary/5 to-background"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Four Core Services
            </h2>
            <p className="text-lg text-foreground/70">
              Comprehensive tools for every stage of your career transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Career Guide */}
            <div
              className="group animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative h-full bg-white rounded-2xl p-8 border border-primary/10 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    Career Guide
                  </h3>
                  <p className="text-foreground/70 mb-4">
                    Personalized career path recommendations powered by AI.
                    Discover opportunities aligned with your skills and
                    aspirations.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">
                        AI-powered path recommendations
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">
                        Skills gap analysis
                      </span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/career-guide"
                  className="inline-block mt-6 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white text-center rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Try Service
                </Link>
              </div>
            </div>

            {/* Career Preparation */}
            <div
              className="group animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="relative h-full bg-white rounded-2xl p-8 border border-accent/10 hover:border-accent/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    Career Preparation
                  </h3>
                  <p className="text-foreground/70 mb-4">
                    Master interview techniques, resume building, and
                    professional skills with interactive courses and real-time
                    feedback.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">
                        Interview coaching
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">
                        Resume optimization
                      </span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/career-preparation"
                  className="inline-block mt-6 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white text-center rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Try Service
                </Link>
              </div>
            </div>

            {/* Career Marketplace */}
            <div
              className="group animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="relative h-full bg-white rounded-2xl p-8 border border-secondary/10 hover:border-secondary/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    Career Marketplace
                  </h3>
                  <p className="text-foreground/70 mb-4">
                    Connect with top employers, explore curated opportunities,
                    and showcase your profile to companies actively hiring
                    talent.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">
                        Job matching algorithm
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">
                        Direct employer connections
                      </span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/login"
                  className="inline-block mt-6 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white text-center rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Try Service
                </Link>
              </div>
            </div>

            {/* Career Emotion Guide */}
            <div
              className="group animate-fade-in-up"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="relative h-full bg-white rounded-2xl p-8 border border-accent/10 hover:border-accent/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    Career Emotion Guide
                  </h3>
                  <p className="text-foreground/70 mb-4">
                    Navigate career challenges with emotional intelligence
                    coaching. Manage stress, build confidence, and thrive
                    professionally and personally.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">
                        Emotional intelligence training
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">
                        Wellness resources
                      </span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/personality-prediction"
                  className="inline-block mt-6 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white text-center rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Try Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transform Your Career Section */}
      <section
        id="transform"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-accent/5 to-background"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Transform Your Career in 3 Simple Steps
            </h2>
            <p className="text-lg text-foreground/70">
              Our proven methodology helps you achieve career excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Assess & Discover",
                desc: "Take our comprehensive career assessment to identify your strengths, skills, and ideal career paths aligned with your values.",
                icon: <ChartColumnDecreasing />,
              },
              {
                step: "02",
                title: "Learn & Prepare",
                desc: "Access personalized learning paths with expert courses, interview prep, and professional development resources.",
                icon: <GraduationCap />,
              },
              {
                step: "03",
                title: "Connect & Succeed",
                desc: "Connect with opportunities that match your profile, apply with confidence, and launch your dream career.",
                icon: <Rocket />,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.2 * idx}s` }}
              >
                <div className="relative">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl opacity-20"></div>
                  <div className="relative bg-white rounded-2xl p-8 border border-primary/10 hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="text-4xl font-bold text-primary/20 mb-4">
                      {item.step}
                    </div>
                    <div className="text-9xl mb-4">{item.icon}</div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground text-primary">
                      {item.title}
                    </h3>
                    <p className="text-foreground/70">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How Mentora Works
            </h2>
            <p className="text-lg text-foreground/70">
              Experience the power of intelligent career transformation
            </p>
          </div>
          <div className="flex flex-wrap gap-6 animate-slide-in-left">
            {[
              {
                title: "AI Career Analysis",
                points: [
                  "Deep skill assessment",
                  "Market demand analysis",
                  "Career path projections",
                ],
              },
              {
                title: "Personalized Learning",
                points: [
                  "Custom course recommendations",
                  "Real-time skill tracking",
                  "Expert mentorship",
                ],
              },
              {
                title: "Job Matching",
                points: [
                  "Algorithm-powered matches",
                  "Company culture alignment",
                  "Salary benchmarking",
                ],
              },
              {
                title: "Emotional Support",
                points: [
                  "Wellness coaching",
                  "Confidence building",
                  "Stress management",
                ],
              },
            ].map((section, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-primary/10 hover:shadow-lg transition-all duration-300 w-full md:w-[calc(50%-12px)]"
              >
                <h4 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {idx + 1}
                  </div>
                  {section.title}
                </h4>

                <ul className="space-y-2">
                  {section.points.map((point, pidx) => (
                    <li
                      key={pidx}
                      className="flex items-center gap-2 text-foreground/70 text-sm"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-primary/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Choose Mentora?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "AI-Powered Intelligence",
                    desc: "Machine learning algorithms personalize your entire experience",
                  },
                  {
                    title: "Real Opportunities",
                    desc: "Access thousands of verified job listings from top companies",
                  },
                  {
                    title: "Expert Mentorship",
                    desc: "Learn from industry leaders through live sessions and recorded content",
                  },
                  {
                    title: "24/7 Support",
                    desc: "Get instant answers with our AI chatbot and expert support team",
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-foreground/70">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-slide-in-right">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl opacity-20 blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-12 border border-primary/20">
                  <div className="w-full h-64 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                    <Image
                      src="giphy.gif"
                      alt="tt gif"
                      width={800}
                      height={200}
                      className="object-contain rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { num: "50K+", label: "Active Users Data" },
              { num: "10K+", label: "Market Trend" },
              { num: "95%", label: "Success Rate" },
              { num: "24/7", label: "Available Support" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-white animate-fade-in-up"
                style={{ animationDelay: `${0.1 * idx}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.num}
                </div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-foreground/70">
              Real transformations from professionals like you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Mitchell",
                role: "Product Manager",
                company: "Tech Innovations Inc",
                quote:
                  "Mentora helped me transition from software developer to product manager. The structured guidance and emotional support made all the difference.",
                rating: 5,
              },
              {
                name: "James Chen",
                role: "Data Scientist",
                company: "AI Analytics Corp",
                quote:
                  "The interview preparation course was game-changing. I landed my dream job at a FAANG company within 3 months of joining Mentora.",
                rating: 5,
              },
              {
                name: "Priya Kapoor",
                role: "UX Designer",
                company: "Design Studios Global",
                quote:
                  "The career marketplace connected me with amazing opportunities. The personalized recommendations saved me countless hours of job hunting.",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-primary/10 hover:shadow-xl transition-all duration-300 animate-fade-in-up hover:-translate-y-2"
                style={{ animationDelay: `${0.2 * idx}s` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-foreground/80 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-primary/10 pt-4">
                  <h4 className="font-bold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-foreground/60">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-primary font-semibold">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-foreground/70">
              Choose the plan that fits your career journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "Forever",
                desc: "Perfect for exploring your career options",
                features: [
                  "Career assessment",
                  "Basic job search",
                  "Limited courses",
                  "Email support",
                  "Community access",
                ],
                cta: "Get Started",
                highlighted: false,
              },
              {
                name: "Professional",
                price: "$29",
                period: "/month",
                desc: "For serious career advancement",
                features: [
                  "Everything in Starter",
                  "Unlimited courses",
                  "Interview coaching",
                  "Priority support",
                  "1-on-1 mentorship",
                  "Portfolio builder",
                  "Resume optimizer",
                ],
                cta: "Start Free Trial",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "pricing",
                desc: "For organizations and teams",
                features: [
                  "Everything in Professional",
                  "Team management",
                  "Custom integrations",
                  "Dedicated support",
                  "Advanced analytics",
                  "Custom branding",
                  "API access",
                ],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-8 animate-fade-in-up transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-primary to-accent text-white border-0 transform scale-105 shadow-2xl"
                    : "bg-white border border-primary/10 hover:shadow-lg"
                }`}
                style={{ animationDelay: `${0.2 * idx}s` }}
              >
                {plan.highlighted && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    plan.highlighted ? "text-white" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mb-6 text-sm ${
                    plan.highlighted ? "text-white/80" : "text-foreground/70"
                  }`}
                >
                  {plan.desc}
                </p>
                <div className="mb-6">
                  <span
                    className={`text-4xl font-bold ${
                      plan.highlighted ? "text-white" : "text-primary"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ml-2 ${
                      plan.highlighted ? "text-white/80" : "text-foreground/60"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                <button
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-white text-primary hover:shadow-lg"
                      : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
                  }`}
                >
                  {plan.cta}
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <li
                      key={fidx}
                      className={`flex items-start gap-3 text-sm ${
                        plan.highlighted
                          ? "text-white/90"
                          : "text-foreground/70"
                      }`}
                    >
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? "text-white" : "text-primary"
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-foreground/70">
              Everything you need to know about Mentora
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does Mentora's AI career analysis work?",
                a: "Our AI analyzes your skills, experience, education, and preferences against millions of job profiles and market trends to recommend personalized career paths with data-driven insights.",
              },
              {
                q: "Can I switch plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll adjust your billing accordingly.",
              },
              {
                q: "What if I don't find a job within 90 days?",
                a: "We offer a 90-day job placement guarantee for our Professional plan members. If you don't land a role, we'll extend your membership for free.",
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. We use enterprise-grade encryption, comply with GDPR and CCPA, and never sell your data to third parties. Your privacy is our priority.",
              },
              {
                q: "Do you offer corporate training?",
                a: "Yes! Our Enterprise plan includes team management, custom integrations, and dedicated support for organizations. Contact our sales team for details.",
              },
              {
                q: "What support options are available?",
                a: "We offer email support for all plans, priority support for Professional members, and dedicated account managers for Enterprise customers. Live chat available 24/7.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${0.1 * idx}s` }}
              >
                <summary className="p-6 cursor-pointer font-semibold text-foreground hover:text-primary transition-colors flex items-center justify-between">
                  <span>{faq.q}</span>
                  <span className="text-primary ml-4">+</span>
                </summary>
                <div className="px-6 pb-6 text-foreground/70 border-t border-primary/10">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-10 rounded-3xl"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance text-foreground">
            Your Future Starts Today
          </h2>
          <p className="text-lg text-foreground/70 mb-8 text-balance">
            Join thousands of professionals transforming their careers. Get
            started free and experience the Mentora difference.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#services">
              <button type="button" className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                Start Your Transformation <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Mentora</h3>
              <p className="text-white/70">
                Transforming careers, empowering futures.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/70 text-sm">
            <p>&copy; 2025 Mentora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main >
  )
}
