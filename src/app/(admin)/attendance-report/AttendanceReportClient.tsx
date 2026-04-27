"use client";

import React, { useState, useRef, useEffect } from "react";
import { getStudentAttendanceReport, getInstructorAttendanceReport, AttendanceReport, InstructorMonthlyReport } from "../../actions/attendanceReportActions";
import { exportStudentReportToExcel, exportInstructorReportToExcel, exportStudentReportToPDF, exportInstructorReportToPDF } from "@/lib/exportUtilsClient";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";

interface Props {
  students: any[];
  instructors: any[];
}

export default function AttendanceReportClient({ students, instructors }: Props) {
  const [reportType, setReportType] = useState<"student" | "instructor">("student");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [filteredList, setFilteredList] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [report, setReport] = useState<AttendanceReport | InstructorMonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentList = reportType === "student" ? students : instructors;
  const displayName = reportType === "student" ? "Nama" : "NamaInstruktur";

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.trim() === "") {
      setFilteredList(currentList);
    } else {
      const filtered = currentList.filter(item =>
        item[displayName].toLowerCase().includes(value.toLowerCase())
      );
      setFilteredList(filtered);
    }
    
    setShowDropdown(true);
  };

  // Handle item selection from dropdown
  const handleSelectItem = (item: any) => {
    setSelectedId(item.Id);
    setSearchInput(item[displayName]);
    setShowDropdown(false);
  };

  // Handle report type change
  const handleReportTypeChange = (type: "student" | "instructor") => {
    setReportType(type);
    setSelectedId(null);
    setSearchInput("");
    setFilteredList([]);
    setReport(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update filtered list when report type changes
  useEffect(() => {
    setFilteredList(currentList);
  }, [reportType, currentList]);

  const handleGenerateReport = async () => {
    if (!selectedId) return alert("Please select a name");
    
    setLoading(true);
    try {
      let result;
      if (reportType === "student") {
        result = await getStudentAttendanceReport(selectedId);
      } else {
        result = await getInstructorAttendanceReport(selectedId);
      }
      
      if (result) {
        setReport(result);
      } else {
        alert("No data found");
        setReport(null);
      }
    } catch (error) {
      alert("Error generating report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isInstructorReport = (report: any): report is InstructorMonthlyReport => {
    return report?.type === "instructor" && report?.monthlyData;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">Attendance Report</h2>
        
        {/* Report Type Selection */}
        <div className="mb-6">
          <Label>Report Type</Label>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => handleReportTypeChange("student")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportType === "student"
                  ? "bg-brand-500 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Student Report
            </button>
            <button
              onClick={() => handleReportTypeChange("instructor")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportType === "instructor"
                  ? "bg-brand-500 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Instructor Report
            </button>
          </div>
        </div>

        {/* Name Selection with Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative" ref={dropdownRef}>
            <Label>{reportType === "student" ? "Select Student" : "Select Instructor"}</Label>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Search ${reportType === "student" ? "student" : "instructor"}...`}
              value={searchInput}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:ring-brand-500"
            />
            
            {/* Dropdown List */}
            {showDropdown && filteredList.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {filteredList.map((item) => (
                  <button
                    key={item.Id}
                    onClick={() => handleSelectItem(item)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-800 dark:text-white/90 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    {item[displayName]}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleGenerateReport} disabled={!selectedId || loading}>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="p-6">
          {/* Export Buttons */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                if (isInstructorReport(report)) {
                  exportInstructorReportToExcel(report);
                } else {
                  exportStudentReportToExcel(report);
                }
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
            <button
              onClick={() => {
                if (isInstructorReport(report)) {
                  exportInstructorReportToPDF(report);
                } else {
                  exportStudentReportToPDF(report);
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download PDF
            </button>
          </div>

          {/* Header Info */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{report.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isInstructorReport(report) ? "Total Sessions (All Time)" : "Total Sessions"}
                </p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {isInstructorReport(report) ? report.totalSessionsAllTime : report.totalSessions}
                </p>
              </div>
              {!isInstructorReport(report) && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <Badge color={report.status === "Aktif" ? "success" : report.status === "Lulus" ? "info" : "error"} size="sm">
                      {report.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Certificate Status</p>
                    <Badge color={report.certificateStatus === "Sudah Cetak" ? "success" : "warning"} size="sm">
                      {report.certificateStatus}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Student Report */}
          {!isInstructorReport(report) && (
            <>
              {/* Instructors */}
              {report.instructors.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Instructors</h3>
                  <div className="space-y-2">
                    {report.instructors.map((instructor, idx) => (
                      <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">{instructor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendance & Materials Combined Table */}
              {report.attendanceDates.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Attendance & Materials</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell isHeader>No</TableCell>
                          <TableCell isHeader>Date</TableCell>
                          <TableCell isHeader>Material</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.attendanceDates.map((date, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{date}</TableCell>
                            <TableCell>{report.materials[idx] || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Statistics Chart */}
              {report.attendanceDates.length > 0 && (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Attendance Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Sessions</p>
                      <p className="text-3xl font-bold text-brand-500">{report.totalSessions}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Unique Materials</p>
                      <p className="text-3xl font-bold text-green-500">{report.materials.length}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Instructors</p>
                      <p className="text-3xl font-bold text-blue-500">{report.instructors.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Instructor Report */}
          {isInstructorReport(report) && (
            <div className="space-y-8">
              {/* Last Month Calendar Resume */}
              {report.lastMonthCalendar && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                    📅 Resume Bulan {report.lastMonthCalendar.month} {report.lastMonthCalendar.year}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.lastMonthCalendar.days.map((day, dayIdx) => (
                      <div key={dayIdx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Day Header */}
                        <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3">
                          <p className="font-semibold text-white text-sm">{day.dayOfWeek}</p>
                          <p className="text-white/90 text-xs">{day.date}</p>
                        </div>
                        
                        {/* Sessions */}
                        <div className="p-4 space-y-3">
                          {day.sessions.length > 0 ? (
                            day.sessions.map((session, sessionIdx) => (
                              <div key={sessionIdx} className="border-l-4 border-brand-500 pl-3">
                                <div className="flex justify-between items-center mb-2">
                                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                                    🕐 {session.time}
                                  </p>
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold">
                                    {session.students.length}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {session.students.map((student, studentIdx) => (
                                    <div key={studentIdx} className="flex items-center gap-2">
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                                        {student.number}
                                      </span>
                                      <span className="text-sm text-gray-700 dark:text-gray-300">{student.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">Tidak ada sesi</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Data */}
              {report.monthlyData.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Detail Bulanan</h3>
                  
                  {report.monthlyData.map((monthData, monthIdx) => (
                    <div key={monthIdx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                      {/* Month Header */}
                      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {monthData.month} {monthData.year}
                          </h3>
                          <Badge color="info" size="sm">
                            {monthData.totalSessions} Sessions
                          </Badge>
                        </div>
                      </div>

                      {/* Students in this month */}
                      {monthData.students.length > 0 ? (
                        <div className="space-y-4">
                          {monthData.students.map((student, studentIdx) => (
                            <div key={studentIdx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold text-gray-800 dark:text-white">{student.studentName}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">NIPD: {student.studentId}</p>
                                </div>
                                <Badge color="success" size="sm">
                                  {student.totalSessions} Sessions
                                </Badge>
                              </div>

                              {/* Sessions for this student */}
                              <div className="mt-3 space-y-2">
                                {student.sessions.map((session, sessionIdx) => (
                                  <div key={sessionIdx} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                    <span className="text-gray-700 dark:text-gray-300">{session.date}</span>
                                    <span className="text-gray-600 dark:text-gray-400">{session.material}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No student attendance records for this month</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!report && selectedId && !loading && (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No data found for the selected {reportType}
        </div>
      )}
    </div>
  );
}
