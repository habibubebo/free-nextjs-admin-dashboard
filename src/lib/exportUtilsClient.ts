'use client';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { AttendanceReport, InstructorMonthlyReport } from '@/app/actions/attendanceReportActions';

export function exportStudentReportToExcel(report: AttendanceReport) {
  const workbook = XLSX.utils.book_new();
  
  // Sheet 1: Summary
  const summaryData = [
    ['Student Attendance Report'],
    [],
    ['Name', report.name],
    ['Total Sessions', report.totalSessions],
    ['Status', report.status],
    ['Certificate Status', report.certificateStatus],
    [],
    ['Instructors'],
    ...report.instructors.map(i => [i]),
    [],
    ['Materials Learned'],
    ...report.materials.map(m => [m]),
    [],
    ['Attendance Dates'],
    ...report.attendanceDates.map(d => [d])
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Sheet 2: Attendance Details
  const attendanceData = [
    ['No', 'Date', 'Material'],
    ...report.attendanceDates.map((date, idx) => [
      idx + 1,
      date,
      report.materials[idx] || ''
    ])
  ];
  
  const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceData);
  attendanceSheet['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance');
  
  XLSX.writeFile(workbook, `Student_Report_${report.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportInstructorReportToExcel(report: InstructorMonthlyReport) {
  const workbook = XLSX.utils.book_new();
  
  // Sheet 1: Summary
  const summaryData = [
    ['Instructor Attendance Report'],
    [],
    ['Name', report.name],
    ['Total Sessions (All Time)', report.totalSessionsAllTime],
    []
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Sheet 2: Monthly Details
  const monthlyData: any[] = [['Month', 'Total Sessions', 'Students', 'Sessions per Student']];
  
  report.monthlyData.forEach(month => {
    monthlyData.push([
      `${month.month} ${month.year}`,
      month.totalSessions,
      month.students.length,
      ''
    ]);
    
    month.students.forEach(student => {
      monthlyData.push([
        '',
        '',
        student.studentName,
        student.totalSessions
      ]);
      
      student.sessions.forEach(session => {
        monthlyData.push([
          '',
          '',
          `  ${session.date}`,
          session.material
        ]);
      });
    });
    
    monthlyData.push(['', '', '', '']);
  });
  
  const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
  monthlySheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Details');
  
  XLSX.writeFile(workbook, `Instructor_Report_${report.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportStudentReportToPDF(report: AttendanceReport) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;
  
  // Title
  doc.setFontSize(16);
  doc.text('Student Attendance Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;
  
  // Summary Info
  doc.setFontSize(11);
  doc.text(`Name: ${report.name}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Total Sessions: ${report.totalSessions}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Status: ${report.status}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Certificate Status: ${report.certificateStatus}`, 15, yPosition);
  yPosition += 12;
  
  // Instructors
  doc.setFontSize(12);
  doc.text('Instructors:', 15, yPosition);
  yPosition += 6;
  doc.setFontSize(10);
  report.instructors.forEach(instructor => {
    doc.text(`• ${instructor}`, 20, yPosition);
    yPosition += 5;
  });
  yPosition += 8;
  
  // Attendance Table Header
  doc.setFontSize(12);
  doc.text('Attendance & Materials:', 15, yPosition);
  yPosition += 8;
  
  // Table Header
  doc.setFontSize(10);
  doc.setFillColor(66, 139, 202);
  doc.setTextColor(255, 255, 255);
  
  const colWidths = [15, 60, 80];
  const startX = 15;
  
  // Header row
  doc.rect(startX, yPosition - 5, colWidths[0], 6, 'F');
  doc.rect(startX + colWidths[0], yPosition - 5, colWidths[1], 6, 'F');
  doc.rect(startX + colWidths[0] + colWidths[1], yPosition - 5, colWidths[2], 6, 'F');
  
  doc.text('No', startX + 2, yPosition);
  doc.text('Date', startX + colWidths[0] + 3, yPosition);
  doc.text('Material', startX + colWidths[0] + colWidths[1] + 3, yPosition);
  
  yPosition += 8;
  
  // Table Body
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  report.attendanceDates.forEach((date, idx) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 15;
    }
    
    // Draw row background (alternating colors)
    if (idx % 2 === 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(startX, yPosition - 4, colWidths[0] + colWidths[1] + colWidths[2], 5, 'F');
    }
    
    // Draw borders
    doc.setDrawColor(200, 200, 200);
    doc.rect(startX, yPosition - 4, colWidths[0], 5);
    doc.rect(startX + colWidths[0], yPosition - 4, colWidths[1], 5);
    doc.rect(startX + colWidths[0] + colWidths[1], yPosition - 4, colWidths[2], 5);
    
    // Draw text
    doc.setTextColor(0, 0, 0);
    doc.text((idx + 1).toString(), startX + 2, yPosition);
    doc.text(date, startX + colWidths[0] + 3, yPosition);
    doc.text(report.materials[idx] || '-', startX + colWidths[0] + colWidths[1] + 3, yPosition);
    
    yPosition += 6;
  });
  
  doc.save(`Student_Report_${report.name}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportInstructorReportToPDF(report: InstructorMonthlyReport) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;
  
  // Title
  doc.setFontSize(16);
  doc.text('Instructor Attendance Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;
  
  // Summary Info
  doc.setFontSize(11);
  doc.text(`Name: ${report.name}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Total Sessions (All Time): ${report.totalSessionsAllTime}`, 15, yPosition);
  yPosition += 12;
  
  // Monthly Data
  report.monthlyData.forEach((month, monthIdx) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 15;
    }
    
    doc.setFontSize(12);
    doc.text(`${month.month} ${month.year} - ${month.totalSessions} Sessions`, 15, yPosition);
    yPosition += 8;
    
    // Students and sessions for this month
    doc.setFontSize(9);
    month.students.forEach((student, studentIdx) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 15;
      }
      
      // Student name header
      doc.setFillColor(230, 230, 230);
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, yPosition - 4, 170, 5, 'F');
      doc.rect(15, yPosition - 4, 170, 5);
      
      doc.setFont('', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(student.studentName, 18, yPosition);
      doc.setFont('', 'normal');
      
      yPosition += 7;
      
      // Table header for this student
      doc.setFillColor(66, 139, 202);
      doc.setTextColor(255, 255, 255);
      
      const colWidths = [80, 90];
      const startX = 15;
      
      // Header row
      doc.rect(startX, yPosition - 4, colWidths[0], 5, 'F');
      doc.rect(startX + colWidths[0], yPosition - 4, colWidths[1], 5, 'F');
      
      doc.text('Date', startX + 3, yPosition);
      doc.text('Material', startX + colWidths[0] + 3, yPosition);
      
      yPosition += 6;
      
      // Sessions for this student
      doc.setTextColor(0, 0, 0);
      student.sessions.forEach((session, sessionIdx) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = 15;
        }
        
        // Alternating row colors
        if (sessionIdx % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(startX, yPosition - 4, colWidths[0] + colWidths[1], 5, 'F');
        }
        
        // Draw borders
        doc.setDrawColor(200, 200, 200);
        doc.rect(startX, yPosition - 4, colWidths[0], 5);
        doc.rect(startX + colWidths[0], yPosition - 4, colWidths[1], 5);
        
        // Draw text
        doc.text(session.date, startX + 3, yPosition);
        doc.text(session.material, startX + colWidths[0] + 3, yPosition);
        
        yPosition += 5;
      });
      
      yPosition += 6;
    });
    
    yPosition += 8;
  });
  
  doc.save(`Instructor_Report_${report.name}_${new Date().toISOString().split('T')[0]}.pdf`);
}
