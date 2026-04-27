import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Exports an array of objects to an Excel file and triggers a download.
 */
export function exportToExcel(data: any[], fileName: string) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * Exports an array of objects to a PDF file with a table and triggers a download.
 */
export function exportToPDF(data: any[], fileName: string, title: string) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const doc = new jsPDF("landscape");
  
  // Add Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Extract columns (keys of the first object)
  const columns = Object.keys(data[0]).map(key => ({
    header: key.charAt(0).toUpperCase() + key.slice(1),
    dataKey: key
  }));

  // Create table
  autoTable(doc, {
    columns: columns,
    body: data,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] }
  });

  doc.save(`${fileName}.pdf`);
}
