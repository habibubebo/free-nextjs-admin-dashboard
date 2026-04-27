"use client";

import React, { useState, useEffect } from "react";
import { Attendance } from "../../actions/attendanceActions";
import { useSession } from "@/hooks/useSession";
import { isSuperAdmin } from "@/lib/roleUtils";

interface Props {
  initialData: Attendance[];
  totalRecords: number;
}

type FilterTab = "today" | "week" | "month";
type ScheduleStatus = "scheduled" | "ongoing" | "completed" | "cancelled";

interface ScheduleItem extends Attendance {
  status: ScheduleStatus;
}

export default function ScheduleClient({ initialData, totalRecords }: Props) {
  const { session, loading } = useSession();
  const [activeTab, setActiveTab] = useState<FilterTab>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const itemsWithStatus: ScheduleItem[] = initialData.map((item, index) => {
      const now = new Date();
      const itemDate = new Date(item.Tgl);
      const hours = itemDate.getHours();
      
      let status: ScheduleStatus = "scheduled";
      if (itemDate.toDateString() === now.toDateString()) {
        if (hours <= now.getHours()) {
          status = hours >= now.getHours() - 1 && hours <= now.getHours() + 1 ? "ongoing" : "completed";
        }
      } else if (itemDate < now) {
        status = "completed";
      }
      
      return { ...item, status };
    });
    setSchedules(itemsWithStatus);
  }, [initialData]);

  const filteredSchedules = schedules.filter((schedule) => {
    const now = new Date();
    const scheduleDate = new Date(schedule.Tgl);
    
    let dateMatch = false;
    switch (activeTab) {
      case "today":
        dateMatch = scheduleDate.toDateString() === now.toDateString();
        break;
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        dateMatch = scheduleDate >= weekStart && scheduleDate <= weekEnd;
        break;
      case "month":
        dateMatch = scheduleDate.getMonth() === now.getMonth() && scheduleDate.getFullYear() === now.getFullYear();
        break;
    }
    
    if (!dateMatch) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        schedule.NamaSiswa?.toLowerCase().includes(query) ||
        schedule.NamaInstruktur?.toLowerCase().includes(query) ||
        schedule.NamaRombel?.toLowerCase().includes(query) ||
        schedule.Materi?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "ongoing":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-600";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status: ScheduleStatus) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "ongoing":
        return "Ongoing";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
  };

  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Training Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your training sessions</p>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search schedule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 flex gap-2 pb-4 overflow-x-auto">
          {(["today", "week", "month"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              {tab === "today" ? "Today" : tab === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 pb-24">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-brand-500">
              {filteredSchedules.filter((s) => s.status === "scheduled").length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-green-500">
              {filteredSchedules.filter((s) => s.status === "ongoing").length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ongoing</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-gray-500">
              {filteredSchedules.filter((s) => s.status === "completed").length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {paginatedSchedules.length > 0 ? (
            paginatedSchedules.map((schedule) => (
              <div
                key={schedule.Id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(schedule.Tgl)} • {formatTime(schedule.Tgl)}
                    </p>
                    <h3 className="font-semibold text-gray-800 dark:text-white mt-1">
                      {schedule.NamaRombel || schedule.Jeniskursus || "General Training"}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(schedule.status)}`}>
                    {getStatusText(schedule.status)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {schedule.NamaInstruktur || "Instructor"}
                    </p>
                  </div>
                  
                  {schedule.Materi && (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {schedule.Materi}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No schedules found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalRecords > recordsPerPage && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {Math.ceil(filteredSchedules.length / recordsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= Math.ceil(filteredSchedules.length / recordsPerPage)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}