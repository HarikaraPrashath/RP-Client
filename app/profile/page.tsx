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
            href="/profile"
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
      return <MarketTrendsContent data={profileData?.careerMarket} />;
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

function MarketTrendsContent({ data }: { data: any }) {
  if (!data || Object.keys(data).length === 0) return <p className="text-gray-500">No Market Insights saved yet.</p>;
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6">Market Trends Overview</h2>
      <div className="p-4 bg-gray-50 rounded-lg mb-4">
        <p className="font-bold text-gray-500 uppercase text-xs">Role Focus</p>
        <p className="text-xl font-bold text-gray-900">{data.career}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold mb-2">Current Skill Match</h3>
          <div className="flex flex-wrap gap-2">
            {data.studentGap?.have?.map((s: string) => (
              <span key={s} className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-2">Skills to Acquire</h3>
          <div className="flex flex-wrap gap-2">
            {data.studentGap?.missing?.map((s: any) => (
              <span key={s.skill} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-sm">{s.skill}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}