"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLogout } from "../../hook/useLogout";
import { generateRecommendationReport } from "../../lib/recommendation-generator";
import { authHeader } from "../../lib/auth";

// Types
interface User {
  name?: string;
  email?: string;
}

interface Tab {
  id: string;
  label: string;
}

// Constants
const TABS: Tab[] = [
  { id: "career", label: "Career Guide" },
  { id: "prep", label: "Career Preparation" },
  { id: "emotional", label: "Emotional Intel" },
  { id: "market", label: "Market Trends" },
];

export default function ProfilePage() {
  const { logout } = useLogout();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("career");
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async (): Promise<void> => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setIsLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const name = parsedUser.name || parsedUser.user?.name;
      const email = parsedUser.email || parsedUser.user?.email;

      setUser({ name, email });

      // Fetch aggregated profile from backend
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiBase}/profile`, {
        credentials: "include",
        headers: { ...authHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      } else {
        console.warn("Failed to fetch profile data", res.status);
        if (res.status === 401) {
          // session expired
        }
      }
    } catch (error) {
      console.error("Failed to parse user / load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitial = (): string => {
    if (!user) return "U";
    return (user.name || user.email || "U")[0].toUpperCase();
  };

  const getWelcomeName = (): string => {
    if (!user?.name) return "User";
    return user.name.split(" ")[0];
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading profile...</p>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600 text-lg mb-4">No user found</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );

  if (isLoading) return renderLoadingState();
  if (!user) return renderEmptyState();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        userName={getWelcomeName()}
        onLogout={logout}
      />

      {/* Profile Banner */}
      <ProfileBanner
        user={user}
        initial={getUserInitial()}
        profileData={profileData}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <TabNavigation
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="mt-8">
          <TabContent activeTab={activeTab} profileData={profileData} />
        </div>

        {/* Home Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-900 
                     text-white font-medium rounded-lg transition duration-200 
                     focus:ring-4 focus:ring-gray-300 shadow-lg hover:shadow-xl
                     transform hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

// Sub-components
interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/recommendation"
            className="text-xl font-bold text-gray-800 hover:text-gray-600 transition"
          >
            FutureEdu
          </Link>

          <div className="flex items-center gap-4">
            {/* Home Button in Header */}
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 
                       rounded-lg font-medium transition flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>

            <span className="text-gray-700 font-medium">
              Welcome, {userName} 👋
            </span>

            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg 
                       font-medium transition focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

interface ProfileBannerProps {
  user: User;
  initial: string;
  profileData?: any;
}

function ProfileBanner({ user, initial, profileData }: ProfileBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white text-indigo-600 
                        flex items-center justify-center text-3xl sm:text-4xl font-bold
                        shadow-lg">
            {initial}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {user.name || "User"}
            </h1>
            <p className="text-blue-100 mt-1">
              {user.email || "No email provided"}
            </p>
            <button
              onClick={() => generateRecommendationReport(user, profileData)}
              className="mt-4 px-6 py-2 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-gray-100 transition shadow-sm"
            >
              Recommendation report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="border-b border-gray-200" aria-label="Profile tabs">
      <div className="flex space-x-8 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 text-sm font-medium border-b-2 transition whitespace-nowrap
              ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

interface TabContentProps {
  activeTab: string;
  profileData?: any;
}

function TabContent({ activeTab, profileData }: TabContentProps) {
  switch (activeTab) {
    case "career":
      return <CareerGuideContent data={profileData?.careerGuide} />;
    case "prep":
      return <CareerPredictionContent data={profileData?.careerPrep} />;
    case "emotional":
      return <EmotionalIntelContent data={profileData?.careerEmotion} />;
    case "market":
      return <MarketTrendsContent data={profileData?.careerMarket} fullProfile={profileData} />;
    default:
      return null;
  }
}

// Tab content components
function CareerGuideContent({ data }: { data: any }) {
  if (!data || Object.keys(data).length === 0) return <p className="text-gray-500">No Career Guide insights saved yet.</p>;
  return (
    <section className="text-gray-700 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-blue-900">Career Guide Recommendation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-bold text-gray-500 uppercase text-xs">Top Match</p>
          <p className="text-xl font-bold text-gray-900">{data.top_1_prediction}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-bold text-gray-500 uppercase text-xs">Other Matches</p>
          <p className="text-gray-800">{data.top_3_predictions?.join(", ")}</p>
        </div>
      </div>
      {data.guidance && (
        <div className="mt-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
          <p className="whitespace-pre-wrap">{data.guidance}</p>
        </div>
      )}
    </section>
  );
}

function CareerPredictionContent({ data }: { data: any }) {
  if (!data || Object.keys(data).length === 0) return <p className="text-gray-500">No Preparation Roadmap saved yet.</p>;
  return (
    <section className="text-gray-700 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-900">Personalized Learning Roadmap</h2>
      {data.roadmap?.milestones?.map((m: any, idx: number) => (
        <div key={idx} className="mb-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">{idx + 1}</div>
          <div>
            <h3 className="font-bold text-lg">{m.title}</h3>
            <p className="text-sm text-gray-500">{m.description}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              {m.skills?.map((skill: string) => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function EmotionalIntelContent({ data }: { data: any }) {
  if (!data || Object.keys(data).length === 0) return <p className="text-gray-500">No Emotional Insights saved yet.</p>;
  const topCareer = data.topCareers?.[0];
  return (
    <section className="text-gray-700 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-emerald-900">Emotional Intelligence Results</h2>
      <p className="text-lg font-medium">Emotional Match: <span className="font-bold text-emerald-600">{topCareer?.career}</span> ({(topCareer?.confidence || 0) * 100}%)</p>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Qualitative Insights</h3>
        <ul className="list-disc pl-5 space-y-1">
          {data.insights?.map((ins: string, idx: number) => (
            <li key={idx} className="text-gray-600">{ins}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function MarketTrendsContent({ data, fullProfile }: { data: any, fullProfile?: any }) {
  if (!data || (!data.allTrend && !data.mergeSkills)) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 mb-4">No Market or Skill Radar insights saved yet.</p>
        <div className="flex justify-center gap-4">
          <Link href="/career-market/all-trend" className="text-blue-600 hover:underline text-sm font-medium">Analyze Market Trends</Link>
          <Link href="/career-market/merge-skills" className="text-indigo-600 hover:underline text-sm font-medium">Check Skill Radar</Link>
        </div>
      </div>
    );
  }

  const { allTrend, mergeSkills } = data;

  // --- Data Extraction & Synthesis ---

  const targetRole = mergeSkills?.career || "your target role";
  const matchScore = mergeSkills?.averageMatch ? Math.round(mergeSkills.averageMatch) : 0;
  const coverage = mergeSkills?.marketCoverage ? Math.round(mergeSkills.marketCoverage) : 0;

  // Find target role growth from allTrend.topPromising
  const targetTrend = allTrend?.topPromising?.find((p: any) =>
    p.name.toLowerCase().includes(targetRole.toLowerCase()) ||
    targetRole.toLowerCase().includes(p.name.toLowerCase())
  );
  const growth = targetTrend ? Math.round(targetTrend.growth) : 18; // fallback realistic growth
  const industry = targetTrend ? targetTrend.name : "Technology";

  // Find missing skills
  let missingSkill = "key technologies";
  let allRecSkills: string[] = [];
  if (mergeSkills?.roadmap) {
    allRecSkills = Object.values(mergeSkills.roadmap).flatMap((r: any) => r.recommended_skills || []);
    if (allRecSkills.length > 0) missingSkill = allRecSkills[0];
  }

  // Find urgent skills (missing AND rising/emerging)
  let urgentSkill = missingSkill;
  let isRising = false;
  if (allTrend?.rising && allRecSkills.length > 0) {
    const risingTerms = allTrend.rising.map((r: any) => r.term.toLowerCase());
    const risingGaps = allRecSkills.filter((s: string) => risingTerms.includes(s.toLowerCase()));
    if (risingGaps.length > 0) {
      urgentSkill = risingGaps[0];
      isRising = true;
    }
  }

  // Find advantage skills
  const userSkills = fullProfile?.profile?.skills || [];
  const advantageSkill = userSkills.length > 0 ? userSkills[0] : "your core technical foundation";
  const experienceLevel = fullProfile?.profile?.experience || "your current experience level";

  return (
    <div className="space-y-6">

      {/* 1. The "You vs. The Market" Executive Summary */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Executive Summary: You vs. The Market
        </h2>
        <p className="text-blue-50 text-lg leading-relaxed">
          Your current background gives you a <strong className="text-white">{matchScore}% readiness</strong> for <strong className="text-white capitalize">{targetRole}</strong>.
          This is an excellent position, as the market for {targetRole} is currently experiencing a <strong className="text-emerald-400">+{growth}% surge</strong>.
          You have strong market coverage ({coverage}%), but bridging the gap in <strong className="text-white">{missingSkill}</strong> will significantly increase your competitiveness.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 2. Skill Urgency & Value Proposition */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-red-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h3 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
            <span className="text-xl">⚠️</span> High Value Gap
          </h3>
          <p className="text-gray-700">
            You are missing <strong className="text-red-600">{urgentSkill}</strong>.
            This skill is currently a <span className="font-semibold">{isRising ? "rising" : "high-demand"} technology</span> in the global market.
            Learning it now will give you an immediate competitive advantage over other candidates.
          </p>
          <div className="mt-4">
            <Link href="/career-market/merge-skills" className="inline-block px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-lg transition">
              View Learning Roadmap &rarr;
            </Link>
          </div>
        </section>

        {/* 3. "Your Advantage" Highlights */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <h3 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
            <span className="text-xl">🔥</span> Your Market Edge
          </h3>
          <p className="text-gray-700">
            You already possess solid experience in <strong className="text-emerald-600">{advantageSkill}</strong>,
            which is currently categorized as a high-demand asset in the top-promising <strong className="capitalize">{industry}</strong> sector.
          </p>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
              Keep leveraging this!
            </span>
          </div>
        </section>

      </div>

      {/* 4. Career Trajectory Forecast */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-indigo-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Career Trajectory Forecast
        </h3>

        <div className="relative pt-8 pb-4 px-4">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
          <div className="absolute left-0 top-1/2 w-2/3 h-1 bg-indigo-500 -translate-y-1/2 rounded-full"></div>

          <div className="relative flex justify-between items-center z-10">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-indigo-500 rounded-full ring-4 ring-white"></div>
              <span className="mt-2 text-xs font-bold text-gray-500 uppercase">Now</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-indigo-500 rounded-full ring-4 ring-white"></div>
              <span className="mt-2 text-xs font-bold text-indigo-600 uppercase">3 Months</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-gray-200 rounded-full ring-4 ring-white"></div>
              <span className="mt-2 text-xs font-bold text-gray-400 uppercase">6-12 Months</span>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
          Based on <strong className="text-gray-800">{experienceLevel}</strong> and the high momentum of <strong className="capitalize">{targetRole}</strong>,
          completing your recommended learning roadmap will position you optimally for mid-to-senior level opportunities during the upcoming hiring surge.
        </p>
      </section>

    </div>
  );
}