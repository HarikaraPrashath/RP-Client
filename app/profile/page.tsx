"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLogout } from "../../hook/useLogout";

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
  { id: "prediction", label: "Career Prediction" },
  { id: "emotional", label: "Emotional Intel" },
  { id: "market", label: "Market Trends" },
];

export default function ProfilePage() {
  const { logout } = useLogout();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("career");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = (): void => {
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
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
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
          <TabContent activeTab={activeTab} />
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
}

function ProfileBanner({ user, initial }: ProfileBannerProps) {
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
}

function TabContent({ activeTab }: TabContentProps) {
  switch (activeTab) {
    case "career":
      return <CareerGuideContent />;
    case "prediction":
      return <CareerPredictionContent />;
    case "emotional":
      return <EmotionalIntelContent />;
    case "market":
      return <MarketTrendsContent />;
    default:
      return null;
  }
}

// Tab content components
function CareerGuideContent() {
  return (
    <section className="text-gray-700">
      <h2 className="text-2xl font-semibold mb-4">Career Guide</h2>
      <p className="text-lg">Career Guide content goes here.</p>
    </section>
  );
}

function CareerPredictionContent() {
  return (
    <section className="text-gray-700">
      <h2 className="text-2xl font-semibold mb-4">Career Prediction</h2>
      <p className="text-lg">Career Prediction content goes here.</p>
    </section>
  );
}

function EmotionalIntelContent() {
  return (
    <section className="text-gray-700">
      <h2 className="text-2xl font-semibold mb-4">Emotional Intelligence</h2>
      <p className="text-lg">Emotional Intelligence insights will appear here.</p>
    </section>
  );
}

function MarketTrendsContent() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Market Trends Overview</h2>
      <div className="rounded-xl overflow-hidden shadow-lg bg-white">
        <Image
          src="/ccf3aca3-6970-4094-94ec-7b525a4523ee.png"
          alt="Market trends visualization showing key industry insights"
          width={1200}
          height={600}
          className="w-full h-auto"
          priority
        />
      </div>
    </section>
  );
}