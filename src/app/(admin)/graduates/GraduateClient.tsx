"use client";

import React, { useState } from "react";
import { Graduate, EligibleStudent, updateGraduate, addGraduate } from "../../actions/graduateActions";
import { Instructor } from "../../actions/instructorActions";
import { Profil } from "../../actions/profilActions";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { generateCertificate, generateBulkCertificate, previewCertificate } from "@/utils/certificate";

interface Props {
  initialData: Graduate[];
  eligibleStudents: EligibleStudent[];
  instructors: Instructor[];
  profil: Profil | null;
}

export default function GraduateClient({ initialData, eligibleStudents, instructors, profil }: Props) {
  const [graduates, setGraduates] = useState<Graduate[]>(initialData);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(graduates.length / itemsPerPage);
  const paginatedGraduates = graduates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGrad, setEditingGrad] = useState<Graduate | null>(null);
  const [editFormData, setEditFormData] = useState({
    Tglcetak: "", n1: "", n2: "", n3: "", n4: "", n5: ""
  });

  // Add Graduate State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof eligibleStudents[0] | null>(null);
  const [addFormData, setAddFormData] = useState({
    nipd: "",
    instrukturId: "",
    tgllulus: new Date().toISOString().split("T")[0],
    tglcetak: new Date().toISOString().split("T")[0],
    n1: "", n2: "", n3: "", n4: "", n5: ""
  });

  const handleStudentSelect = (nipd: string) => {
    const student = eligibleStudents.find(s => s.Nipd.toString() === nipd) ?? null;
    setSelectedStudent(student);
    setAddFormData(prev => ({
      ...prev,
      nipd,
      n1: "", n2: "", n3: "", n4: "", n5: ""
    }));
  };

  // Derived: unit kompetensi labels for selected student
  const ukLabels = selectedStudent
    ? [
        selectedStudent.Uk1 || "",
        selectedStudent.Uk2 || "",
        selectedStudent.Uk3 || "",
        selectedStudent.Uk4 || "",
        selectedStudent.Uk5 || "",
      ].filter(uk => uk.trim() !== "" && uk.trim() !== "-")
    : [];
  const hasUkData = ukLabels.length > 0;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.nipd) return alert("Pilih siswa terlebih dahulu");
    if (!addFormData.instrukturId) return alert("Pilih instruktur terlebih dahulu");
    setIsAddLoading(true);
    const res = await addGraduate({
      nipd: parseInt(addFormData.nipd),
      instrukturId: parseInt(addFormData.instrukturId),
      tgllulus: addFormData.tgllulus,
      tglcetak: addFormData.tglcetak,
      n1: addFormData.n1, n2: addFormData.n2, n3: addFormData.n3,
      n4: addFormData.n4, n5: addFormData.n5,
    });
    setIsAddLoading(false);
    if (res.success) {
      alert("Data lulusan berhasil ditambahkan!");
      window.location.reload();
    } else {
      alert(res.error);
    }
  };


  // Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewGrad, setPreviewGrad] = useState<Graduate | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handlePreviewCertificate = async (grad: Graduate) => {
    setIsPreviewLoading(true);
    try {
      setPreviewGrad(grad);
      const url = await previewCertificate({
        nipd: grad.Nipd,
        studentName: grad.NamaPeserta || "Nama Peserta",
        ttl: grad.Ttl || "-",
        tglmasuk: grad.Tglmasuk || "",
        tgllulus: grad.Tgllulus || "",
        tglcetak: grad.Tglcetak || new Date().toISOString().split("T")[0],
        courseName: grad.NamaRombel || "Program Kursus",
        instructorName: grad.NamaInstruktur || "Instruktur",
        namaLembaga: profil?.Namalkp || "Lembaga Kursus dan Pelatihan Cendekia Utama",
        alamatLembaga: profil?.Alamat || "",
        teleponLembaga: profil?.Telepon || "",
        kotaLembaga: profil?.Kota || "Blitar",
        kepalaLembaga: profil?.Kepala || "",
        nipKepala: profil?.NIP_Kepala || "",
        grades: { n1: grad.n1, n2: grad.n2, n3: grad.n3, n4: grad.n4, n5: grad.n5 },
        units: { uk1: grad.Uk1, uk2: grad.Uk2, uk3: grad.Uk3, uk4: grad.Uk4, uk5: grad.Uk5 },
        hours: { jp1: grad.Jp1, jp2: grad.Jp2, jp3: grad.Jp3, jp4: grad.Jp4, jp5: grad.Jp5 }
      });
      setPreviewUrl(url);
    } catch (e) {
      alert("Gagal membuat preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewGrad(null);
  };

  const handleRefreshPreview = async () => {
    if (!previewGrad) return;
    setIsPreviewLoading(true);
    try {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = await previewCertificate({
        nipd: previewGrad.Nipd,
        studentName: previewGrad.NamaPeserta || "Nama Peserta",
        ttl: previewGrad.Ttl || "-",
        tglmasuk: previewGrad.Tglmasuk || "",
        tgllulus: previewGrad.Tgllulus || "",
        tglcetak: previewGrad.Tglcetak || new Date().toISOString().split("T")[0],
        courseName: previewGrad.NamaRombel || "Program Kursus",
        instructorName: previewGrad.NamaInstruktur || "Instruktur",
        namaLembaga: profil?.Namalkp || "Lembaga Kursus dan Pelatihan Cendekia Utama",
        alamatLembaga: profil?.Alamat || "",
        teleponLembaga: profil?.Telepon || "",
        kotaLembaga: profil?.Kota || "Blitar",
        kepalaLembaga: profil?.Kepala || "",
        nipKepala: profil?.NIP_Kepala || "",
        grades: { n1: previewGrad.n1, n2: previewGrad.n2, n3: previewGrad.n3, n4: previewGrad.n4, n5: previewGrad.n5 },
        units: { uk1: previewGrad.Uk1, uk2: previewGrad.Uk2, uk3: previewGrad.Uk3, uk4: previewGrad.Uk4, uk5: previewGrad.Uk5 },
        hours: { jp1: previewGrad.Jp1, jp2: previewGrad.Jp2, jp3: previewGrad.Jp3, jp4: previewGrad.Jp4, jp5: previewGrad.Jp5 }
      });
      setPreviewUrl(url);
    } catch (e) {
      alert("Gagal refresh preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Bulk Certificate State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedBulkIds, setSelectedBulkIds] = useState<number[]>([]);
  const [bulkSearch, setBulkSearch] = useState("");

  const filteredBulkGrads = graduates.filter(g =>
    (g.NamaPeserta || "").toLowerCase().includes(bulkSearch.toLowerCase())
  );

  const toggleBulkSelect = (id: number) => {
    setSelectedBulkIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const allIds = filteredBulkGrads.map(g => g.Id);
    const allSelected = allIds.every(id => selectedBulkIds.includes(id));
    if (allSelected) {
      setSelectedBulkIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedBulkIds(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleBulkDownload = async () => {
    const selectedGrads = graduates.filter(g => selectedBulkIds.includes(g.Id));
    const certData = selectedGrads.map(grad => ({
      nipd: grad.Nipd,
      studentName: grad.NamaPeserta || "Nama Peserta",
      ttl: grad.Ttl || "-",
      tglmasuk: grad.Tglmasuk || "",
      tgllulus: grad.Tgllulus || "",
      tglcetak: grad.Tglcetak || new Date().toISOString().split("T")[0],
      courseName: grad.NamaRombel || "Program Kursus",
      instructorName: grad.NamaInstruktur || "Instruktur",
      namaLembaga: profil?.Namalkp || "Lembaga Kursus dan Pelatihan Cendekia Utama",
      alamatLembaga: profil?.Alamat || "Jl. Veteran 44 Telp./Fax (0342) 802113 Blitar",
      teleponLembaga: profil?.Telepon || "",
      kotaLembaga: profil?.Kota || "Blitar",
      kepalaLembaga: profil?.Kepala || "Dra. Lies Suprihatin",
      nipKepala: profil?.NIP_Kepala || "",
      grades: { n1: grad.n1, n2: grad.n2, n3: grad.n3, n4: grad.n4, n5: grad.n5 },
      units: { uk1: grad.Uk1, uk2: grad.Uk2, uk3: grad.Uk3, uk4: grad.Uk4, uk5: grad.Uk5 },
      hours: { jp1: grad.Jp1, jp2: grad.Jp2, jp3: grad.Jp3, jp4: grad.Jp4, jp5: grad.Jp5 }
    }));
    await generateBulkCertificate(certData);
    setIsBulkModalOpen(false);
    setSelectedBulkIds([]);
  };

  const openEditModal = (grad: Graduate) => {
    setEditingGrad(grad);
    setEditFormData({
      Tglcetak: grad.Tglcetak ? new Date(grad.Tglcetak).toISOString().split("T")[0] : "",
      n1: grad.n1 || "",
      n2: grad.n2 || "",
      n3: grad.n3 || "",
      n4: grad.n4 || "",
      n5: grad.n5 || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrad) return;
    const res = await updateGraduate(editingGrad.Id, editFormData);
    if (res.success) {
      setGraduates(prev => prev.map(g => g.Id === editingGrad.Id ? { ...g, ...editFormData } : g));
      setIsEditModalOpen(false);
    } else alert(res.error);
  };

  const handleExportExcel = () => {
    const dataToExport = graduates.map(g => ({
      ID: g.Id,
      "Student ID (NIPD)": g.Nipd,
      "Student Name": g.NamaPeserta || "Unknown",
      "Graduation Date": g.Tgllulus,
      "Instructor": g.NamaInstruktur || "Unknown",
      "Score 1": g.n1,
      "Score 2": g.n2,
    }));
    exportToExcel(dataToExport, "Graduates_Report");
  };

  const handleExportPDF = () => {
    const dataToExport = graduates.map(g => ({
      NIPD: g.Nipd,
      Name: g.NamaPeserta || "Unknown",
      Date: g.Tgllulus,
      Instructor: g.NamaInstruktur || "Unknown",
    }));
    exportToPDF(dataToExport, "Graduates_Report", "List of Graduates");
  };

  const handleGenerateCertificate = async (grad: Graduate) => {
    await generateCertificate({
      nipd: grad.Nipd,
      studentName: grad.NamaPeserta || "Nama Peserta",
      ttl: grad.Ttl || "-",
      tglmasuk: grad.Tglmasuk || "",
      tgllulus: grad.Tgllulus || "",
      tglcetak: grad.Tglcetak || new Date().toISOString().split("T")[0],
      courseName: grad.NamaRombel || "Program Kursus",
      instructorName: grad.NamaInstruktur || "Instruktur",
      namaLembaga: profil?.Namalkp || "Lembaga Kursus dan Pelatihan Cendekia Utama",
      alamatLembaga: profil?.Alamat || "Jl. Veteran 44 Telp./Fax (0342) 802113 Blitar",
      teleponLembaga: profil?.Telepon || "",
      kotaLembaga: profil?.Kota || "Blitar",
      kepalaLembaga: profil?.Kepala || "Dra. Lies Suprihatin",
      nipKepala: profil?.NIP_Kepala || "",
      grades: { n1: grad.n1, n2: grad.n2, n3: grad.n3, n4: grad.n4, n5: grad.n5 },
      units: { uk1: grad.Uk1, uk2: grad.Uk2, uk3: grad.Uk3, uk4: grad.Uk4, uk5: grad.Uk5 },
      hours: { jp1: grad.Jp1, jp2: grad.Jp2, jp3: grad.Jp3, jp4: grad.Jp4, jp5: grad.Jp5 }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5]" style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: "20px", fontWeight: 600, lineHeight: "28px", color: "#191c1e" }}>Graduates</h2>
        <div className="flex gap-3">
        <Button onClick={() => {
            setIsAddModalOpen(true);
            setSelectedStudent(null);
            setAddFormData({ nipd: "", instrukturId: "", tgllulus: new Date().toISOString().split("T")[0], tglcetak: new Date().toISOString().split("T")[0], n1: "", n2: "", n3: "", n4: "", n5: "" });
          }}>
            + Tambah Lulusan
          </Button>
          <Button variant="outline" onClick={() => { setIsBulkModalOpen(true); setSelectedBulkIds([]); setBulkSearch(""); }}>Bulk Certificate</Button>
          <Button variant="outline" onClick={handleExportExcel}>Export Excel</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Student Name</TableCell>
              <TableCell isHeader>Class / Course</TableCell>
              <TableCell isHeader>Graduation Date</TableCell>
              <TableCell isHeader>Instructor</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGraduates.length > 0 ? (
              paginatedGraduates.map((grad) => (
                <TableRow key={grad.Id}>
                  <TableCell>{grad.NamaPeserta || `NIPD: ${grad.Nipd}`}</TableCell>
                  <TableCell>{grad.NamaRombel || "-"}</TableCell>
                  <TableCell>
                    {grad.Tgllulus ? new Date(grad.Tgllulus).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{grad.NamaInstruktur || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* Edit Grades */}
                      <div className="relative group">
                        <button
                          onClick={() => openEditModal(grad)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#2563eb] hover:bg-[#eff6ff] transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                          Edit Nilai
                        </span>
                      </div>
                      {/* Preview */}
                      <div className="relative group">
                        <button
                          onClick={() => handlePreviewCertificate(grad)}
                          disabled={isPreviewLoading}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#12b76a] hover:bg-[#ecfdf3] transition-colors disabled:opacity-40"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                          Preview Sertifikat
                        </span>
                      </div>
                      {/* Download PDF */}
                      <div className="relative group">
                        <button
                          onClick={() => handleGenerateCertificate(grad)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                          Download PDF
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[#737686] py-4">
                  No graduates found in the database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-[#737686]">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, graduates.length)} of {graduates.length} entries
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm font-medium text-[#434655]">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Graduate Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-lg p-6">
        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", color: "#191c1e" }}>Tambah Data Lulusan</h3>
        {eligibleStudents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#737686]">
              Tidak ada siswa lulus (status 2) yang belum terdaftar sebagai lulusan.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setIsAddModalOpen(false)}>Tutup</Button>
          </div>
        ) : (
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <Label>Pilih Siswa (Status Lulus)</Label>
              <select
                required
                value={addFormData.nipd}
                onChange={e => handleStudentSelect(e.target.value)}
                className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="">-- Pilih Siswa --</option>
                {eligibleStudents.map(s => (
                  <option key={s.Nipd} value={s.Nipd}>{s.Nama}</option>
                ))}
              </select>
            </div>

            {/* Info kelas otomatis saat siswa dipilih */}
            {selectedStudent && (
              <div className="rounded-lg bg-[#eff6ff] border border-[#bfdbfe] px-4 py-3 space-y-1">
                <p className="text-xs font-semibold text-[#2563eb] uppercase tracking-wide">Info Siswa</p>
                <p className="text-sm text-[#191c1e] font-medium">{selectedStudent.Nama}</p>
                <p className="text-xs text-[#737686]">
                  Pelatihan: <span className="font-medium text-[#434655]">{selectedStudent.NamaRombel || "-"}</span>
                </p>
              </div>
            )}

            <div>
              <Label>Instruktur</Label>
              <select
                required
                value={addFormData.instrukturId}
                onChange={e => setAddFormData({ ...addFormData, instrukturId: e.target.value })}
                className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="">-- Pilih Instruktur --</option>
                {instructors.map(i => (
                  <option key={i.Id} value={i.Id}>{i.NamaInstruktur}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tanggal Lulus</Label>
                <Input type="date" required value={addFormData.tgllulus} onChange={e => setAddFormData({ ...addFormData, tgllulus: e.target.value })} />
              </div>
              <div>
                <Label>Tanggal Cetak</Label>
                <Input type="date" required value={addFormData.tglcetak} onChange={e => setAddFormData({ ...addFormData, tglcetak: e.target.value })} />
              </div>
            </div>

            {/* Nilai: hanya tampil jika ada unit kompetensi */}
            {hasUkData ? (
              <div>
                <p className="text-sm font-medium text-[#434655] mb-2">Nilai Unit Kompetensi</p>
                <div className="grid grid-cols-2 gap-3">
                  {ukLabels.map((label, idx) => {
                    const key = (["n1", "n2", "n3", "n4", "n5"] as const)[idx];
                    return (
                      <div key={key}>
                        <Label>{label}</Label>
                        <Input
                          type="text"
                          placeholder="Nilai..."
                          value={addFormData[key]}
                          onChange={e => setAddFormData({ ...addFormData, [key]: e.target.value })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : selectedStudent ? (
              <p className="text-xs text-gray-400 italic">
                Tidak ada unit kompetensi untuk pelatihan ini — bagian nilai dikosongkan.
              </p>
            ) : null}

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isAddLoading}>
                {isAddLoading ? "Menyimpan..." : "Simpan Lulusan"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-md p-6">
        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", color: "#191c1e" }}>Edit Grades &amp; Print Date</h3>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <Label>Print Date (Tgl Cetak)</Label>
            <Input type="date" required value={editFormData.Tglcetak} onChange={e => setEditFormData({...editFormData, Tglcetak: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{editingGrad?.Uk1 || "Grade 1"}</Label>
              <Input type="text" value={editFormData.n1} onChange={e => setEditFormData({...editFormData, n1: e.target.value})} />
            </div>
            <div>
              <Label>{editingGrad?.Uk2 || "Grade 2"}</Label>
              <Input type="text" value={editFormData.n2} onChange={e => setEditFormData({...editFormData, n2: e.target.value})} />
            </div>
            <div>
              <Label>{editingGrad?.Uk3 || "Grade 3"}</Label>
              <Input type="text" value={editFormData.n3} onChange={e => setEditFormData({...editFormData, n3: e.target.value})} />
            </div>
            <div>
              <Label>{editingGrad?.Uk4 || "Grade 4"}</Label>
              <Input type="text" value={editFormData.n4} onChange={e => setEditFormData({...editFormData, n4: e.target.value})} />
            </div>
            <div>
              <Label>{editingGrad?.Uk5 || "Grade 5"}</Label>
              <Input type="text" value={editFormData.n5} onChange={e => setEditFormData({...editFormData, n5: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Certificate Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} className="max-w-lg p-6">
        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", color: "#191c1e" }}>Bulk Download Certificate</h3>
        <div className="mb-4">
          <Input 
            type="text" 
            placeholder="Search graduate name..." 
            value={bulkSearch}
            onChange={e => setBulkSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded"
            checked={filteredBulkGrads.length > 0 && filteredBulkGrads.every(g => selectedBulkIds.includes(g.Id))}
            onChange={selectAllFiltered}
          />
          <span className="text-sm text-[#434655]">Select All ({filteredBulkGrads.length})</span>
          <span className="ml-auto text-sm font-medium text-[#2563eb]">{selectedBulkIds.length} selected</span>
        </div>
        <div className="max-h-64 overflow-y-auto border border-[#e0e3e5] rounded-lg divide-y">
          {filteredBulkGrads.map(grad => (
            <label key={grad.Id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f7f9fb] cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded"
                checked={selectedBulkIds.includes(grad.Id)}
                onChange={() => toggleBulkSelect(grad.Id)}
              />
              <div>
                <p className="text-sm font-medium text-[#191c1e]">{grad.NamaPeserta || `NIPD: ${grad.Nipd}`}</p>
                <p className="text-xs text-[#737686]">{grad.NamaRombel || "-"}</p>
              </div>
            </label>
          ))}
          {filteredBulkGrads.length === 0 && (
            <p className="text-center text-[#737686] py-4 text-sm">No graduates found.</p>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkDownload} 
            disabled={selectedBulkIds.length === 0}
          >
            Download {selectedBulkIds.length} Certificate{selectedBulkIds.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-black/80">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900">
            <span className="text-white font-semibold text-sm">Preview Sertifikat</span>
            <div className="flex items-center gap-3">
              {/* Refresh icon button */}
              <button
                onClick={handleRefreshPreview}
                disabled={isPreviewLoading}
                title="Refresh Preview"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isPreviewLoading ? "animate-spin" : ""}
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = previewUrl;
                  a.download = "Sertifikat_Preview.pdf";
                  a.click();
                }}
                className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-lg font-medium"
              >
                Download PDF
              </button>
              <button
                onClick={closePreview}
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
          <iframe
            src={previewUrl}
            className="flex-1 w-full border-0"
            title="Preview Sertifikat"
          />
        </div>
      )}
    </div>
  );
}
