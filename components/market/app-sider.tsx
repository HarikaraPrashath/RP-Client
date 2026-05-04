"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Merge,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Compass,
  ClipboardCheck,
  Map,
  BarChart3,
  HeartPulse
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    title: "Career Guide",
    items: [
      {
        href: "/career-guide",
        label: "Career Insights",
        description: "Emotional path finding",
        icon: Compass,
      },
    ],
  },
  {
    title: "Career Preparation",
    items: [
      {
        href: "/career-preparation",
        label: "Dashboard",
        description: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/career-preparation/student-assessment",
        label: "Assessment",
        description: "Analyze your skills",
        icon: ClipboardCheck,
      },
      {
        href: "/career-preparation/personalized-roadmap",
        label: "Roadmap",
        description: "Custom career path",
        icon: Map,
      },
    ],
  },
  {
    title: "Market Analysis",
    items: [
      {
        href: "/career-market/merge-skills",
        label: "Merge skills",
        description: "Skills match summary",
        icon: Merge,
      },
      /*{
          href: "/career-market/cv_extracter",
          label: "CV extracter",
          description: "Parse and save CV",
          icon: FileSearch,
        },*/
      {
        href: "/career-market/all-trend",
        label: "All Trend",
        description: "Deep market insights",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Emotion Guide",
    items: [
      {
        href: "/Personality-career",
        label: "Emotion Pulse",
        description: "Personality assessment",
        icon: HeartPulse,
      },
    ],
  },
];

const isActiveRoute = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function AppSider({ variant }: { variant?: "light" }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-20" : "w-64",
        variant === "light" ? "bg-background" : "bg-card"
      )}
      aria-label="Section navigation"
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition">
              Mentora
            </span>
          </Link>
        )}
        {collapsed && <LayoutDashboard className="w-8 h-8 text-primary mx-auto" />}
      </div>

      <button
        type="button"
        className="absolute -right-3 top-20 bg-background border border-border rounded-full p-1 hover:bg-accent transition-colors shadow-sm"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto mt-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-4">
            {!collapsed && (
              <p className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {section.title}
              </p>
            )}
            <div className="space-y-2">
              {section.items.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={20} className={cn("shrink-0", active ? "text-primary-foreground" : "group-hover:text-primary transition-colors")} />
                    {!collapsed && (
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold whitespace-nowrap text-sm">{item.label}</span>
                        <span className={cn("text-[10px] whitespace-nowrap", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {item.description}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 mt-auto border-t border-border/50">
          <div className="bg-muted/50 rounded-2xl p-4">
            <p className="text-xs font-medium text-foreground">Need help?</p>
            <p className="text-[10px] text-muted-foreground mt-1">Check our career guides and tutorials.</p>
            <button className="mt-3 w-full text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
              View Guides
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
