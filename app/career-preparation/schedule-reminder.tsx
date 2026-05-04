"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  GraduationCap,
  AlertTriangle,
  Calendar,
  Filter,
  ChevronRight,
  Home,
  Bell,
  Brain,
  LayoutDashboard,
  X,
  Check,
  Star,
  RotateCcw,
  FileText,
  Target,
  Save,
  Flag,
  CalendarDays,
} from "lucide-react";
import NotificationToast from "@/components/career-preparation/Notification";

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: "task" | "deadline" | "interview" | "meeting" | "study" | "other";
  priority: "low" | "medium" | "high";
  completed: boolean;
  reminderTime: number; // minutes before the event
  recurring: boolean;
  recurringType?: "daily" | "weekly" | "monthly";
  createdAt: string;
}

function ScheduleReminder() {
  const router = useRouter();
  const pathname = usePathname();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "completed" | "overdue"
  >("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      type?: "info" | "success" | "warning" | "error";
    }>
  >([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    category: "task" as Reminder["category"],
    priority: "medium" as Reminder["priority"],
    reminderTime: 15,
    recurring: false,
    recurringType: "weekly" as Reminder["recurringType"],
  });

  // Load saved reminders from browser storage when the component mounts.
  // This keeps the user's reminders persistent across page reloads.
  useEffect(() => {
    // Load reminders from localStorage
    const savedReminders = localStorage.getItem("careerReminders");
    if (savedReminders) {
      try {
        const parsed = JSON.parse(savedReminders);
        setReminders(parsed);
      } catch (error) {
        console.error("Error loading reminders:", error);
      }
    }
  }, []);

  // Persist reminder changes to localStorage whenever the reminder list updates.
  // This ensures the latest reminders are stored locally for future visits.
  useEffect(() => {
    // Save reminders to localStorage whenever reminders change
    localStorage.setItem("careerReminders", JSON.stringify(reminders));
  }, [reminders]);

  // Check for upcoming reminders every minute
  // Periodically check scheduled reminders and show notifications for upcoming events.
  // This triggers browser or in-app alerts when reminders become due.
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      reminders.forEach((reminder) => {
        if (reminder.completed) return;

        const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
        const reminderTime = new Date(
          reminderDateTime.getTime() - reminder.reminderTime * 60 * 1000,
        );

        // Check if reminder time has passed and notification hasn't been shown recently
        if (now >= reminderTime && now < reminderDateTime) {
          const lastNotified = localStorage.getItem(
            `reminder_${reminder.id}_notified`,
          );
          const lastNotifiedTime = lastNotified ? new Date(lastNotified) : null;

          // Only show notification if we haven't shown one in the last 5 minutes
          if (
            !lastNotifiedTime ||
            now.getTime() - lastNotifiedTime.getTime() > 5 * 60 * 1000
          ) {
            showNotification(
              `Reminder: ${reminder.title}`,
              `You have a ${reminder.category} scheduled for ${reminder.time} on ${new Date(reminder.date).toLocaleDateString()}`,
              "info",
            );
            localStorage.setItem(
              `reminder_${reminder.id}_notified`,
              now.toISOString(),
            );
          }
        }
      });
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000);

    return () => clearInterval(interval);
  }, [reminders]);

  // Handle add/edit reminder form submission.
  // This creates a new reminder or updates an existing one, then resets the form.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }

    const newReminder: Reminder = {
      id: editingReminder ? editingReminder.id : Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      category: formData.category,
      priority: formData.priority,
      completed: editingReminder ? editingReminder.completed : false,
      reminderTime: formData.reminderTime,
      recurring: formData.recurring,
      recurringType: formData.recurringType,
      createdAt: new Date().toISOString(),
    };

    if (editingReminder) {
      setReminders((prev) =>
        prev.map((r) => (r.id === editingReminder.id ? newReminder : r)),
      );
      setEditingReminder(null);
    } else {
      setReminders((prev) => [...prev, newReminder]);
    }

    // Reset form
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      category: "task",
      priority: "medium",
      reminderTime: 15,
      recurring: false,
      recurringType: "weekly",
    });
    setShowAddForm(false);
  };

  // Load an existing reminder into the form for editing.
  // This allows the user to update reminder details without creating a new entry.
  const handleEdit = (reminder: Reminder) => {
    setFormData({
      title: reminder.title,
      description: reminder.description,
      date: reminder.date,
      time: reminder.time,
      category: reminder.category,
      priority: reminder.priority,
      reminderTime: reminder.reminderTime,
      recurring: reminder.recurring,
      recurringType: reminder.recurringType || "weekly",
    });
    setEditingReminder(reminder);
    setShowAddForm(true);
  };

  // Remove a reminder permanently after user confirmation.
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      setReminders((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Toggle the completed state of a reminder.
  // This lets users mark tasks as done or undo completion.
  const toggleComplete = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)),
    );
  };

  // Add an in-app notification and optionally show a browser notification.
  // This is used for reminder alerts and message feedback in the UI.
  const showNotification = (
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, title, message, type }]);

    // Browser notification
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new window.Notification(title, {
          body: message,
          icon: "/favicon.ico",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body: message, icon: "/favicon.ico" });
          }
        });
      }
    }
  };

  // Remove a notification from the visible list.
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Choose icon based on reminder category for display in the UI.
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "task":
        return <CheckCircle className="w-4 h-4" />;
      case "deadline":
        return <Clock className="w-4 h-4" />;
      case "interview":
        return <Briefcase className="w-4 h-4" />;
      case "meeting":
        return <Users className="w-4 h-4" />;
      case "study":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  // Choose color classes based on reminder category for visual grouping.
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "task":
        return "bg-blue-100 text-blue-800";
      case "deadline":
        return "bg-red-100 text-red-800";
      case "interview":
        return "bg-green-100 text-green-800";
      case "meeting":
        return "bg-purple-100 text-purple-800";
      case "study":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Choose text color by priority so high-priority reminders stand out.
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  // Check if a reminder has already passed and is not completed.
  const isOverdue = (reminder: Reminder) => {
    if (reminder.completed) return false;
    const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
    return reminderDateTime < new Date();
  };

  // Check if a reminder is due within the next 24 hours and not completed.
  const isUpcoming = (reminder: Reminder) => {
    if (reminder.completed) return false;
    const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
    const now = new Date();
    const diffInHours =
      (reminderDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours > 0 && diffInHours <= 24;
  };

  const filteredReminders = reminders
    .filter((reminder) => {
      const matchesFilter = (() => {
        switch (filter) {
          case "completed":
            return reminder.completed;
          case "overdue":
            return isOverdue(reminder);
          case "upcoming":
            return isUpcoming(reminder);
          default:
            return true;
        }
      })();

      const matchesCategory =
        selectedCategory === "all" || reminder.category === selectedCategory;

      return matchesFilter && matchesCategory;
    })
    .sort((a, b) => {
      const aDateTime = new Date(`${a.date}T${a.time}`);
      const bDateTime = new Date(`${b.date}T${b.time}`);
      return aDateTime.getTime() - bDateTime.getTime();
    });

  const sidebarItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/career-preparation",
    },
    {
      id: "assessment",
      name: "Student Assessment",
      icon: <FileText className="w-5 h-5" />,
      href: "/career-preparation/student-assessment",
    },
    {
      id: "roadmap",
      name: "Personalized Roadmap",
      icon: <Target className="w-5 h-5" />,
      href: "/career-preparation/personalized-roadmap",
    },
    {
      id: "schedule",
      name: "Schedule Reminder",
      icon: <Calendar className="w-5 h-5" />,
      href: "/career-preparation/schedule-reminder",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

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
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`${pathname === item.href ? "text-blue-700" : "text-gray-500"}`}
                >
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
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Career Preparation
            </button>

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Schedule Reminder
                </h1>
                <p className="text-lg text-gray-600">
                  Stay organized with personalized reminders for your career
                  journey
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if ("Notification" in window) {
                      Notification.requestPermission().then((permission) => {
                        if (permission === "granted") {
                          showNotification(
                            "Notifications Enabled",
                            "You will now receive browser notifications for reminders.",
                            "success",
                          );
                        } else {
                          showNotification(
                            "Notifications Denied",
                            "Browser notifications are disabled.",
                            "warning",
                          );
                        }
                      });
                    } else {
                      showNotification(
                        "Not Supported",
                        "Browser notifications are not supported in this browser.",
                        "error",
                      );
                    }
                  }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  Enable Notifications
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Reminder
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reminders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reminders.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reminders.filter((r) => r.completed).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reminders.filter((r) => isUpcoming(r)).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reminders.filter((r) => isOverdue(r)).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Reminders</option>
                  <option value="upcoming">Upcoming (24h)</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="task">Task</option>
                  <option value="deadline">Deadline</option>
                  <option value="interview">Interview</option>
                  <option value="meeting">Meeting</option>
                  <option value="study">Study</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add/Edit Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingReminder ? "Edit Reminder" : "Add New Reminder"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingReminder(null);
                      setFormData({
                        title: "",
                        description: "",
                        date: "",
                        time: "",
                        category: "task",
                        priority: "medium",
                        reminderTime: 15,
                        recurring: false,
                        recurringType: "weekly",
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter reminder title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter description (optional)"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time *
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value as Reminder["category"],
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="task">Task</option>
                        <option value="deadline">Deadline</option>
                        <option value="interview">Interview</option>
                        <option value="meeting">Meeting</option>
                        <option value="study">Study</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            priority: e.target.value as Reminder["priority"],
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reminder Time (minutes before)
                    </label>
                    <input
                      type="number"
                      value={formData.reminderTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          reminderTime: parseInt(e.target.value) || 15,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="1440"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={formData.recurring}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          recurring: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="recurring"
                      className="text-sm text-gray-700"
                    >
                      Recurring reminder
                    </label>
                  </div>

                  {formData.recurring && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recurring Type
                      </label>
                      <select
                        value={formData.recurringType}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            recurringType: e.target
                              .value as Reminder["recurringType"],
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingReminder ? "Update" : "Save"} Reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingReminder(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reminders List */}
          <div className="space-y-4">
            {filteredReminders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No reminders found
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === "all"
                    ? "Create your first reminder to stay organized!"
                    : `No ${filter} reminders found.`}
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Reminder
                </button>
              </div>
            ) : (
              filteredReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`bg-white rounded-xl p-6 border shadow-sm transition-all duration-300 ${
                    reminder.completed
                      ? "border-green-200 bg-green-50"
                      : isOverdue(reminder)
                        ? "border-red-200 bg-red-50"
                        : isUpcoming(reminder)
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleComplete(reminder.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        reminder.completed
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {reminder.completed && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-semibold ${
                              reminder.completed
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {reminder.title}
                          </h3>
                          {reminder.description && (
                            <p
                              className={`text-sm mt-1 ${
                                reminder.completed
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {reminder.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(reminder.category)}`}
                          >
                            {getCategoryIcon(reminder.category)}
                            <span className="ml-1 capitalize">
                              {reminder.category}
                            </span>
                          </span>
                          <Flag
                            className={`w-4 h-4 ${getPriorityColor(reminder.priority)}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {new Date(reminder.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{reminder.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bell className="w-4 h-4" />
                          <span>{reminder.reminderTime} min before</span>
                        </div>
                        {reminder.recurring && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {reminder.recurringType}
                          </span>
                        )}
                      </div>

                      {isOverdue(reminder) && !reminder.completed && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Overdue</span>
                        </div>
                      )}

                      {isUpcoming(reminder) && !reminder.completed && (
                        <div className="flex items-center gap-2 text-yellow-600 text-sm mb-3">
                          <Clock className="w-4 h-4" />
                          <span>Upcoming soon</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(reminder)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit reminder"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleReminder;
