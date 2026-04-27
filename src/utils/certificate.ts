import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface CertificateData {
  nipd: number;
  studentName: string;
  ttl: string;
  tglmasuk: string;
  tgllulus: string;
  tglcetak: string;
  courseName: string;
  instructorName: string;
  namaLembaga: string;
  alamatLembaga: string;
  teleponLembaga: string;
  kotaLembaga: string;
  kepalaLembaga: string;
  nipKepala: string;
  grades?: { n1?: string; n2?: string; n3?: string; n4?: string; n5?: string };
  units?: { uk1?: string; uk2?: string; uk3?: string; uk4?: string; uk5?: string };
  hours?: { jp1?: string; jp2?: string; jp3?: string; jp4?: string; jp5?: string };
}

// Format tanggal ke "DD Bulan YYYY" dalam bahasa Indonesia
function formatTanggal(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const bulan = [
      "Januari","Februari","Maret","April","Mei","Juni",
      "Juli","Agustus","September","Oktober","November","Desember"
    ];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

// Nomor sertifikat: NIPD/CU/TAHUN/A
function formatNomorSertifikat(nipd: number, tglcetak: string): string {
  const tahun = tglcetak
    ? new Date(tglcetak).getFullYear()
    : new Date().getFullYear();
  return `${nipd}/CU/${tahun}/A`;
}

// ============================================================
// KONFIGURASI POSISI TEKS - Edit di sini untuk menyesuaikan
// Satuan: mm (A4 landscape = 297mm x 210mm)
// ============================================================
const POS = {
  // Halaman 1 - Sertifikat
  cert: {
    nomorSertifikat:  { x: "center", y: 76 },
    pimpinan:         { x: "center", y: 92 },
    menerangkan:      { x: "center", y: 96 },
    namaPeserta:      { x: "center", y: 98 },
    lahirDi:          { x: "center", y: 106 },
    dinyatakan:       { x: "center", y: 132 },
    kompeten:         { x: "center", y: 143 },
    teksKursus1:      { x: "center", y: 128 },
    teksKursus2:      { x: "center", y: 134 },
    teksKursus3:      { x: "center", y: 140 },
    ttdKotaTanggal:   { x: 233,      y: 152 },
    ttdPimpinan:      { x: 229,      y: 182 },
    ttdNamaKepala:    { x: 229,      y: 200 },
  },
  // Halaman 2 - Unit Kompetensi
  transcript: {
    nomorInduk:       { x: 55, y: 35 },
    nama:             { x: 55, y: 43 },
    program:          { x: 55, y: 51 },
    tabelStartY:      59,
    ttdLabel:         { x: 229, y: 152 }, // "Instruktur / Penguji"
    ttdNama:          { x: 229, y: 174 }, // nama instruktur
  },
};
// ============================================================

// Fetch image dari public folder dan konversi ke base64
async function loadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function drawCertificatePage(doc: jsPDF, data: CertificateData) {
  const w = doc.internal.pageSize.getWidth();  // 297mm landscape A4
  const h = doc.internal.pageSize.getHeight(); // 210mm landscape A4

  // ── BACKGROUND IMAGE ────────────────────────────────────────────────────────
  try {
    const bgBase64 = await loadImageAsBase64("/images/certia.png");
    doc.addImage(bgBase64, "PNG", 0, 0, w, h);
  } catch (e) {
    console.warn("Background certia.png tidak ditemukan, lanjut tanpa background");
  }

  // ── NOMOR SERTIFIKAT ────────────────────────────────────────────────────────
  const nomorSert = formatNomorSertifikat(data.nipd, data.tglcetak);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(`No. ${nomorSert}`, w / 2, POS.cert.nomorSertifikat.y, { align: "center" });

  // ── TEKS PEMBUKA ────────────────────────────────────────────────────────────
  // doc.setFont("helvetica", "normal");
  // doc.setFontSize(11);
  // doc.setTextColor(30, 30, 30);
  // doc.text(`Pimpinan ${data.namaLembaga}`, w / 2, POS.cert.pimpinan.y, { align: "center" });
  // doc.text("menerangkan bahwa", w / 2, POS.cert.menerangkan.y, { align: "center" });

  // ── NAMA PESERTA (kursif besar) ─────────────────────────────────────────────
  doc.setFont("vivaldi", "bolditalic");
  doc.setFontSize(32);
  doc.setTextColor(20, 20, 20);
  doc.text(data.studentName, w / 2, POS.cert.namaPeserta.y, { align: "center" });

  // ── TEMPAT LAHIR ────────────────────────────────────────────────────────────
  doc.setFont("ebrima", "normal");
  doc.setFontSize(13);
  doc.setTextColor(32, 32, 32);
  doc.text(`Lahir Di ${data.ttl}`, w / 2, POS.cert.lahirDi.y, { align: "center" });

  // ── DINYATAKAN ──────────────────────────────────────────────────────────────
  // doc.text("dinyatakan", w / 2, POS.cert.dinyatakan.y, { align: "center" });

  // ── KOMPETEN ────────────────────────────────────────────────────────────────
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(26);
  // doc.setTextColor(20, 20, 20);
  // doc.text("KOMPETEN", w / 2, POS.cert.kompeten.y, { align: "center" });

  // ── TEKS KURSUS ─────────────────────────────────────────────────────────────
  const tglMulai = formatTanggal(data.tglmasuk);
  const tglSelesai = formatTanggal(data.tgllulus);
  doc.text(
    `telah mengikuti kursus komputer Program ${data.courseName}`,
    w / 2, POS.cert.teksKursus1.y, { align: "center" }
  );
  doc.text(
    `yang dilaksanakan tanggal ${tglMulai} sampai dengan ${tglSelesai}`,
    w / 2, POS.cert.teksKursus2.y, { align: "center" }
  );
  doc.text(
    `di Lembaga Kursus dan Pelatihan ${data.namaLembaga}.`,
    w / 2, POS.cert.teksKursus3.y, { align: "center" }
  );

  // ── TANGGAL & TANDA TANGAN (kanan bawah) ────────────────────────────────────
  const kota = data.kotaLembaga || "Blitar";
  const tglCetak = formatTanggal(data.tglcetak);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 31, 31);
  doc.text(`${kota}, ${tglCetak}`, POS.cert.ttdKotaTanggal.x, POS.cert.ttdKotaTanggal.y, { align: "center" });

  // doc.setFont("helvetica", "normal");
  // doc.setFontSize(10);
  // doc.text("PIMPINAN", POS.cert.ttdPimpinan.x, POS.cert.ttdPimpinan.y, { align: "center" });

  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(11);
  // doc.text(data.kepalaLembaga || "", POS.cert.ttdNamaKepala.x, POS.cert.ttdNamaKepala.y, { align: "center" });
}

async function drawTranscriptPage(doc: jsPDF, data: CertificateData) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // ── BACKGROUND IMAGE ────────────────────────────────────────────────────────
  try {
    const bgBase64 = await loadImageAsBase64("/images/certib.png");
    doc.addImage(bgBase64, "PNG", 0, 0, w, h);
  } catch (e) {
    console.warn("Background certib.png tidak ditemukan, lanjut tanpa background");
  }

  // ── INFO PESERTA ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("Nomor Induk", 25, POS.transcript.nomorInduk.y);
  doc.text("Nama", 25, POS.transcript.nama.y);
  doc.text("Program", 25,POS.transcript.program.y);
  
  doc.text(`: ${data.nipd}`, POS.transcript.nomorInduk.x, POS.transcript.nomorInduk.y);
  doc.text(`: ${data.studentName.toUpperCase()}`, POS.transcript.nama.x, POS.transcript.nama.y);
  doc.text(`: ${data.courseName}`, POS.transcript.program.x, POS.transcript.program.y);

  // ── TABEL UNIT KOMPETENSI ────────────────────────────────────────────────────
  const tableData: (string | { content: string; styles: object })[][] = [];
  let totalJp = 0;
  let no = 1;

  const unitEntries = [
    { uk: data.units?.uk1, jp: data.hours?.jp1, n: data.grades?.n1 },
    { uk: data.units?.uk2, jp: data.hours?.jp2, n: data.grades?.n2 },
    { uk: data.units?.uk3, jp: data.hours?.jp3, n: data.grades?.n3 },
    { uk: data.units?.uk4, jp: data.hours?.jp4, n: data.grades?.n4 },
    { uk: data.units?.uk5, jp: data.hours?.jp5, n: data.grades?.n5 },
  ];

  for (const entry of unitEntries) {
    if (entry.uk && entry.uk.trim() !== "" && entry.uk.trim() !== "-") {
      const jpVal = parseFloat(entry.jp || "0") || 0;
      totalJp += jpVal;
      tableData.push([
        { content: `${no}.`, styles: { halign: "center", fontStyle: "bold" } },
        { content: entry.uk, styles: { fontStyle: "bold" } },
        { content: `${entry.jp || "-"}`, styles: { halign: "center", fontStyle: "bold" } },
        { content: entry.n || "-", styles: { halign: "center", fontStyle: "bold" } },
      ]);
      no++;
    }
  }

  // Baris JUMLAH
  tableData.push([
    { content: "", styles: {} },
    { content: "JUMLAH", styles: { halign: "center", fontStyle: "bold" } },
    { content: `${totalJp} JP`, styles: { halign: "center", fontStyle: "bold" } },
    { content: "", styles: {} },
  ]);

  autoTable(doc, {
    startY: POS.transcript.tabelStartY,
    head: [[
      { content: "No", styles: { halign: "center" } },
      { content: "Unit Kompetensi", styles: { halign: "center" } },
      { content: "Waktu", styles: { halign: "center" } },
      { content: "Nilai", styles: { halign: "center" } },
    ]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [20, 20, 20],
      fontStyle: "bold",
      lineColor: [80, 80, 80],
      lineWidth: 0.9,
      fontSize: 11,
    },
    bodyStyles: {
      textColor: [20, 20, 20],
      lineColor: [80, 80, 80],
      lineWidth: 0.9,
      fontSize: 11,
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 110 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
    },
    margin: { left: 25, right: 95 },
  });

  // ── TANDA TANGAN INSTRUKTUR ──────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("Instruktur / Penguji", POS.transcript.ttdLabel.x, POS.transcript.ttdLabel.y, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.instructorName, POS.transcript.ttdNama.x, POS.transcript.ttdNama.y, { align: "center" });
}

// Buat doc PDF dan kembalikan sebagai blob URL (untuk preview di iframe)
export async function buildCertificateDoc(data: CertificateData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  await drawCertificatePage(doc, data);

  const hasUnits = data.units && (
    data.units.uk1 || data.units.uk2 || data.units.uk3 ||
    data.units.uk4 || data.units.uk5
  );

  if (hasUnits) {
    doc.addPage();
    await drawTranscriptPage(doc, data);
  }

  return doc;
}

// Preview: kembalikan blob URL tanpa auto-download
export async function previewCertificate(data: CertificateData): Promise<string> {
  const doc = await buildCertificateDoc(data);
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

// Download PDF
export async function generateCertificate(data: CertificateData) {
  const doc = await buildCertificateDoc(data);
  doc.save(`Sertifikat_${data.nipd}_${data.studentName.replace(/\s+/g, "_")}.pdf`);
}

export async function generateBulkCertificate(items: CertificateData[]) {
  if (items.length === 0) return;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  for (let i = 0; i < items.length; i++) {
    const data = items[i];
    if (i > 0) doc.addPage();
    await drawCertificatePage(doc, data);

    const hasUnits = data.units && (
      data.units.uk1 || data.units.uk2 || data.units.uk3 ||
      data.units.uk4 || data.units.uk5
    );

    if (hasUnits) {
      doc.addPage();
      await drawTranscriptPage(doc, data);
    }
  }

  doc.save(`Sertifikat_Bulk_${items.length}_peserta.pdf`);
}
