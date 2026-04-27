"use client";

import React, { useState, useEffect } from "react";
import { Attendance, addStudentAttendanceBulk, addInstructorAttendanceBulk, deleteAttendance, updateAttendance, getAttendanceByPage } from "../../actions/attendanceActions";
import { Student } from "../../actions/studentActions";
import { Instructor } from "../../actions/instructorActions";
import { ClassRoom } from "../../actions/classActions";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import MultiSelect from "@/components/form/MultiSelect";
import { useSession } from "@/hooks/useSession";
import { isSuperAdmin } from "@/lib/roleUtils";
import Alert from "@/components/ui/alert/Alert";

interface Props {
  initialData: Attendance[];
  totalRecords: number;
  students: Student[];
  instructors: Instructor[];
  classes: ClassRoom[];
}

export default function AttendanceClient({ initialData, totalRecords, students, instructors, classes }: Props) {
  const { session, loading } = useSession();
  const [attendances, setAttendances] = useState<Attendance[]>(initialData);
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAtt, setEditingAtt] = useState<Attendance | null>(null);
  const [editFormData, setEditFormData] = useState({ Tgl: "", Jam: "", Jeniskursus: "", Materi: "" });

  // Helper function to get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Student Form State
  const [sDate, setSDate] = useState(getCurrentDate());
  const [sTime, setSTime] = useState(getCurrentTime());
  const [sCourseType, setSCourseType] = useState("");
  const [sInstructorId, setSInstructorId] = useState<string>("");
  const [sSessionCount, setSSessionCount] = useState(1);
  const [sMaterials, setSMaterials] = useState<string[]>([""]);  
  const [sNipds, setSNipds] = useState<string[]>([]);

  // Instructor Self Attendance State
  const [iSelfDate, setISelfDate] = useState(getCurrentDate());
  const [iSelfTime, setISelfTime] = useState(getCurrentTime());

  // Instructor Form State
  const [iDate, setIDate] = useState(getCurrentDate());
  const [iTime, setITime] = useState(getCurrentTime());
  const [iIds, setIIds] = useState<string[]>([]);

  // Alert State
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({ show: false, variant: "info", title: "", message: "" });

  const showAlert = (variant: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setAlertInfo({ show: true, variant, title, message });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 5000);
  };

  // Initialize instructor ID for instructor user
  useEffect(() => {
    if (session && !isSuperAdmin(session)) {
      setSInstructorId(session.id.toString());
    }
  }, [session]);

  // Update time every second for real-time display
  useEffect(() => {
    const timer = setInterval(() => {
      setSTime(getCurrentTime());
      setITime(getCurrentTime());
      setISelfTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  

  // Handle page change
  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    const newData = await getAttendanceByPage(session?.id, newPage);
    setAttendances(newData);
  };

  // Initialize instructor ID for instructor user
  useState(() => {
    if (session && !isSuperAdmin(session)) {
      setSInstructorId(session.id.toString());
    }
  });

  const handleSessionCountChange = (count: number) => {
    const safeCount = Math.max(1, count);
    setSSessionCount(safeCount);
    setSMaterials(prev => {
      const next = [...prev];
      while (next.length < safeCount) next.push("");
      return next.slice(0, safeCount);
    });
  };

  const handleMaterialChange = (idx: number, value: string) => {
    setSMaterials(prev => prev.map((m, i) => i === idx ? value : m));
  };

  // MultiSelect Options — hanya siswa aktif (Status === 1)
  const studentOptions = students
    .filter(s => s.Status === 1)
    .map(s => ({
      value: s.Nipd.toString(),
      text: s.Nama,
      selected: false
    }));

  // Handler saat siswa dipilih: auto-fill Jenis Kursus dari siswa pertama yg dipilih
  const handleStudentSelectionChange = (selectedNipds: string[]) => {
    setSNipds(selectedNipds);
    if (selectedNipds.length > 0) {
      const firstNipd = parseInt(selectedNipds[0]);
      const selectedStudent = students.find(s => s.Nipd === firstNipd);
      if (selectedStudent && selectedStudent.Jeniskursus) {
        setSCourseType(selectedStudent.Jeniskursus.toString());
      }
    } else {
      setSCourseType("");
    }
  };

  const instructorOptions = instructors.map(i => ({
    value: i.Id.toString(),
    text: i.NamaInstruktur,
    selected: false
  }));

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sInstructorId) return showAlert("warning", "Peringatan", "Pilih instruktur terlebih dahulu");
    if (sNipds.length === 0) return showAlert("warning", "Peringatan", "Pilih minimal satu siswa");

    for (let i = 0; i < sSessionCount; i++) {
      const res = await addStudentAttendanceBulk({
        date: sDate,
        time: sTime,
        courseType: sCourseType,
        instructorId: parseInt(sInstructorId),
        material: sMaterials[i] || "",
        studentNipds: sNipds.map(id => parseInt(id))
      });
      if (!res.success) {
        showAlert("error", "Gagal", `Gagal menyimpan sesi ${i + 1}: ${res.error}`);
        return;
      }
    }

    showAlert("success", "Berhasil", `${sSessionCount} sesi absensi berhasil disimpan!`);
    setTimeout(() => window.location.reload(), 2000);
  };

  const handleInstructorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (iIds.length === 0) return showAlert("warning", "Peringatan", "Pilih minimal satu instruktur");

    const res = await addInstructorAttendanceBulk({
      date: iDate,
      time: iTime,
      instructorIds: iIds.map(id => parseInt(id))
    });

    if (res.success) {
      showAlert("success", "Berhasil", "Kehadiran instruktur berhasil disimpan!");
      setTimeout(() => window.location.reload(), 2000);
    } else {
      showAlert("error", "Gagal", res.error || "Terjadi kesalahan");
    }
  };

  const handleInstructorSelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return showAlert("error", "Error", "Session tidak ditemukan");

    const res = await addInstructorAttendanceBulk({
      date: iSelfDate,
      time: iSelfTime,
      instructorIds: [session.id]
    });

    if (res.success) {
      showAlert("success", "Berhasil", "Kehadiran Anda berhasil dicatat!");
      setTimeout(() => window.location.reload(), 2000);
    } else {
      showAlert("error", "Gagal", res.error || "Terjadi kesalahan");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data kehadiran ini?")) {
      const res = await deleteAttendance(id);
      if (res.success) {
        setAttendances(prev => prev.filter(a => a.Id !== id));
        showAlert("success", "Berhasil", "Data kehadiran berhasil dihapus!");
      } else {
        showAlert("error", "Gagal", res.error || "Terjadi kesalahan");
      }
    }
  };

  const openEditModal = (att: Attendance) => {
    setEditingAtt(att);
    const tglDate = new Date(att.Tgl);
    const dateStr = tglDate.toISOString().split("T")[0];
    const timeStr = tglDate.toTimeString().slice(0, 5);
    
    setEditFormData({
      Tgl: dateStr,
      Jam: timeStr,
      Jeniskursus: att.Jeniskursus ? att.Jeniskursus.toString() : (att.Nipd === 0 ? "INSTRUCTOR" : ""),
      Materi: att.Materi || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAtt) return;
    
    const dataToSave = {
      Tgl: editFormData.Tgl,
      Jam: editFormData.Jam,
      Jeniskursus: editFormData.Jeniskursus === "INSTRUCTOR" ? null : editFormData.Jeniskursus,
      Materi: editFormData.Materi
    };
    
    const res = await updateAttendance(editingAtt.Id, dataToSave);
    if (res.success) {
      setAttendances(prev => prev.map(a => a.Id === editingAtt.Id ? { ...a, Tgl: `${editFormData.Tgl}T${editFormData.Jam}:00`, Jeniskursus: dataToSave.Jeniskursus, Materi: editFormData.Materi } : a));
      setIsEditModalOpen(false);
      showAlert("success", "Berhasil", "Data kehadiran berhasil diperbarui!");
    } else {
      showAlert("error", "Gagal", res.error || "Terjadi kesalahan");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-[#737686]">Loading...</div>;
  }

  const isSuperAdminUser = session && isSuperAdmin(session);
  const isInstructorUser = session && !isSuperAdminUser;

  const tabs = [];
  if (isSuperAdminUser) {
    tabs.push("Input Student Attendance", "Input Instructor Attendance", "Attendance History");
  } else if (isInstructorUser) {
    tabs.push("My Attendance", "My Attendance Report");
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e5]" style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
      {/* Alert Notification */}
      {alertInfo.show && (
        <div className="mb-4">
          <Alert
            variant={alertInfo.variant}
            title={alertInfo.title}
            message={alertInfo.message}
          />
        </div>
      )}
      
      <div className="border-b border-[#e0e3e5] flex overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === idx 
                ? "border-[#2563eb] text-[#2563eb]" 
                : "border-transparent text-[#737686] hover:text-[#191c1e]"
            }`}
            onClick={() => setActiveTab(idx)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Superadmin: Input Student Attendance */}
        {isSuperAdminUser && activeTab === 0 && (
          <form onSubmit={handleStudentSubmit} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={sDate} onChange={(e) => setSDate(e.target.value)} required />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={sTime} onChange={(e) => setSTime(e.target.value)} required />
              </div>
            </div>

            <div>
              <Label>Instructor (Teacher)</Label>
              <select
                required
                value={sInstructorId}
                onChange={(e) => setSInstructorId(e.target.value)}
                className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb] focus:ring-[#2563eb]/10"
              >
                <option value="">Select Instructor...</option>
                {instructors.map(inst => (
                  <option key={inst.Id} value={inst.Id}>{inst.NamaInstruktur}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Class (Jenis Kursus)</Label>
              <select
                required
                value={sCourseType}
                onChange={(e) => setSCourseType(e.target.value)}
                className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb] focus:ring-[#2563eb]/10"
              >
                <option value="">-- Otomatis dari siswa dipilih --</option>
                {classes.map(c => (
                  <option key={c.Id} value={c.Id.toString()}>{c.Namarombel}</option>
                ))}
              </select>
              {sCourseType && (
                <p className="mt-1 text-xs text-brand-500">
                  ✓ Kelas terisi otomatis dari siswa yang dipilih
                </p>
              )}
            </div>

            <div>
              <Label>Jumlah Sesi</Label>
              <input
                type="number"
                min={1}
                max={20}
                value={sSessionCount}
                onChange={(e) => handleSessionCountChange(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb] focus:ring-[#2563eb]/10"
              />
            </div>

            <div className="space-y-3">
              {sMaterials.map((mat, idx) => (
                <div key={idx}>
                  <Label>
                    {sSessionCount > 1 ? `Materi Sesi ${idx + 1}` : "Material / Topic"}
                  </Label>
                  <Input
                    type="text"
                    value={mat}
                    onChange={(e) => handleMaterialChange(idx, e.target.value)}
                    required
                    placeholder={`e.g. Grammar Fundamentals${sSessionCount > 1 ? ` (Sesi ${idx + 1})` : ""}`}
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <MultiSelect
                label="Select Students / Peserta (Aktif)"
                options={studentOptions}
                onChange={handleStudentSelectionChange}
                defaultSelected={[]}
              />
            </div>

            <Button type="submit">Save Student Attendance</Button>
          </form>
        )}

        {/* Superadmin: Input Instructor Attendance */}
        {isSuperAdminUser && activeTab === 1 && (
          <form onSubmit={handleInstructorSubmit} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={iDate} onChange={(e) => setIDate(e.target.value)} required />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={iTime} onChange={(e) => setITime(e.target.value)} required />
              </div>
            </div>

            <div className="mb-4">
              <MultiSelect
                label="Select Instructors/Employees"
                options={instructorOptions}
                onChange={setIIds}
                defaultSelected={[]}
              />
            </div>

            <Button type="submit">Save Instructor Attendance</Button>
          </form>
        )}

        {/* Superadmin: Attendance History OR Instructor: Attendance History */}
        {(isSuperAdminUser && activeTab === 2) || (isInstructorUser && activeTab === 1) ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Date</TableCell>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Name</TableCell>
                  <TableCell isHeader>Course/Role</TableCell>
                  <TableCell isHeader>Material</TableCell>
                  {isSuperAdminUser && <TableCell isHeader>Actions</TableCell>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.length > 0 ? (
                  attendances.map((att) => (
                    <TableRow key={att.Id}>
                      <TableCell>{new Date(att.Tgl).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${att.Nipd === 0 ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-[#ecfdf3] text-[#027a48]'}`}>
                          {att.Nipd === 0 ? "Employee/Instructor" : "Student"}
                        </span>
                      </TableCell>
                      <TableCell>{att.Nipd === 0 ? att.NamaInstruktur : att.NamaSiswa}</TableCell>
                      <TableCell>{att.NamaRombel || att.Jeniskursus}</TableCell>
                      <TableCell>{att.Materi || "-"}</TableCell>
                      {isSuperAdminUser && (
                        <TableCell>
                          <div className="flex gap-3">
                            <button onClick={() => openEditModal(att)} className="text-[#2563eb] hover:text-[#1d4ed8]">Edit</button>
                            <button onClick={() => handleDelete(att.Id)} className="text-[#f04438] hover:text-[#d92d20]">Delete</button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isSuperAdminUser ? 6 : 5} className="text-center text-[#737686] py-4">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {totalRecords > recordsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-[#737686]">
                  Page {currentPage} of {Math.ceil(totalRecords / recordsPerPage)} ({totalRecords} total records)
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalRecords / recordsPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Instructor: My Attendance & Input Student Attendance */}
        {isInstructorUser && activeTab === 0 && (
          <div className="space-y-8">
            {/* Self Attendance */}
            <form onSubmit={handleInstructorSelfSubmit} className="space-y-5 max-w-2xl">
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4 mb-6">
                <p className="text-sm text-[#1d4ed8]">
                  <strong>Recording attendance for:</strong> {session?.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    value={iSelfDate} 
                    onChange={(e) => setISelfDate(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input 
                    type="time" 
                    value={iSelfTime} 
                    onChange={(e) => setISelfTime(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <Button type="submit">Record My Attendance</Button>
            </form>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Student Attendance - Instructor limited to logged-in account */}
            <form onSubmit={handleStudentSubmit} className="space-y-5 max-w-2xl">
              <div className="bg-[#ecfdf3] border border-[#a7f3d0] rounded-lg p-4 mb-6">
                <p className="text-sm text-[#027a48]">
                  <strong>Input Student Attendance</strong> - Teacher: {session?.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={sDate} onChange={(e) => setSDate(e.target.value)} required />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={sTime} onChange={(e) => setSTime(e.target.value)} required />
                </div>
              </div>

              <div>
                <Label>Instructor (Teacher)</Label>
                <select
                  required
                  value={sInstructorId}
                  onChange={(e) => setSInstructorId(e.target.value)}
                  className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb] focus:ring-[#2563eb]/10"
                >
                  <option value="">Select Instructor...</option>
                  {instructors
                    .filter(inst => inst.Id === session?.id)
                    .map(inst => (
                      <option key={inst.Id} value={inst.Id}>{inst.NamaInstruktur}</option>
                    ))}
                </select>
              </div>
              
              <div>
                <Label>Class (Jenis Kursus)</Label>
                <select
                  required
                  value={sCourseType}
                  onChange={(e) => setSCourseType(e.target.value)}
                  className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb] focus:ring-[#2563eb]/10"
                >
                  <option value="">-- Otomatis dari siswa dipilih --</option>
                  {classes.map(c => (
                    <option key={c.Id} value={c.Id.toString()}>{c.Namarombel}</option>
                  ))}
                </select>
                {sCourseType && (
                  <p className="mt-1 text-xs text-[#2563eb]">
                    ✓ Kelas terisi otomatis dari siswa yang dipilih
                  </p>
                )}
              </div>

              <div>
                <Label>Jumlah Sesi</Label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={sSessionCount}
                  onChange={(e) => handleSessionCountChange(parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb] focus:ring-[#2563eb]/10"
                />
              </div>

              <div className="space-y-3">
                {sMaterials.map((mat, idx) => (
                  <div key={idx}>
                    <Label>
                      {sSessionCount > 1 ? `Materi Sesi ${idx + 1}` : "Material / Topic"}
                    </Label>
                    <Input
                      type="text"
                      value={mat}
                      onChange={(e) => handleMaterialChange(idx, e.target.value)}
                      required
                      placeholder={`e.g. Grammar Fundamentals${sSessionCount > 1 ? ` (Sesi ${idx + 1})` : ""}`}
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <MultiSelect
                  label="Select Students / Peserta (Aktif)"
                  options={studentOptions}
                  onChange={handleStudentSelectionChange}
                  defaultSelected={[]}
                />
              </div>

              <Button type="submit">Save Student Attendance</Button>
            </form>
          </div>
        )}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-md p-6">
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#191c1e" }}>Edit Attendance Record</h3>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" required value={editFormData.Tgl} onChange={e => setEditFormData({...editFormData, Tgl: e.target.value})} />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" required value={editFormData.Jam} onChange={e => setEditFormData({...editFormData, Jam: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>Course/Role</Label>
            <select
              className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm"
              required 
              value={editFormData.Jeniskursus} 
              onChange={e => setEditFormData({...editFormData, Jeniskursus: e.target.value})}
            >
              <option value="">Select Class / Role...</option>
              {classes.map(c => (
                <option key={c.Id} value={c.Id.toString()}>{c.Namarombel}</option>
              ))}
              <option value="INSTRUCTOR">Instructor / Staff</option>
            </select>
          </div>
          <div>
            <Label>Material</Label>
            <Input type="text" value={editFormData.Materi} onChange={e => setEditFormData({...editFormData, Materi: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
