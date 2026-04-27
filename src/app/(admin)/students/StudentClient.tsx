"use client";

import React, { useState } from "react";
import { Student, updateStudentStatus, updateStudent, addStudent, deleteStudent } from "../../actions/studentActions";
import { ClassRoom } from "../../actions/classActions";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

export default function StudentClient({ initialData, classes }: { initialData: Student[], classes: ClassRoom[] }) {
  const [students, setStudents] = useState<Student[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    Nama: "",
    Kelamin: "L",
    Nipd: 0,
    Nik: "",
    Nokk: "",
    Jeniskursus: 0,
    Kelas: "",
    Ttl: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredStudents = students.filter(s => 
    s.Nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Nik?.includes(searchTerm) ||
    s.Nokk?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openEditModal = (student: Student) => {
    let kelaminCode = "";
    if (student.Kelamin) {
      const kelamin = student.Kelamin.trim().toLowerCase();
      if (kelamin.includes("perempuan")) {
        kelaminCode = "P";
      } else if (kelamin.includes("laki")) {
        kelaminCode = "L";
      }
    }
    
    const formattedStudent = {
      ...student,
      Kelamin: kelaminCode
    };
    setEditingStudent(formattedStudent);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    let kelaminFull = editingStudent.Kelamin;
    if (editingStudent.Kelamin === "L") {
      kelaminFull = "Laki - Laki";
    } else if (editingStudent.Kelamin === "P") {
      kelaminFull = "Perempuan";
    }
    
    const dataToSave = {
      ...editingStudent,
      Kelamin: kelaminFull
    };
    
    const res = await updateStudent(editingStudent.Id, dataToSave);
    if (res.success) {
      setStudents(prev => prev.map(s => s.Id === editingStudent.Id ? dataToSave : s));
      setIsEditModalOpen(false);
    } else alert(res.error);
  };

  const handleVerify = async (id: number) => {
    const student = students.find(s => s.Id === id);
    if (!student) return;
    
    let newStatus = student.Status;
    if (student.Status === 0) {
      newStatus = 1;
    } else if (student.Status === 1) {
      newStatus = 0;
    } else if (student.Status === 2) {
      newStatus = 1;
    }
    
    const res = await updateStudentStatus(id, newStatus);
    if (res.success) {
      setStudents(prev => prev.map(s => s.Id === id ? { ...s, Status: newStatus } : s));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      const res = await deleteStudent(id);
      if (res.success) {
        setStudents(prev => prev.filter(s => s.Id !== id));
      } else {
        alert(res.error);
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.Nama) return alert("Please enter student name");
    if (!newStudent.Nipd) return alert("Please enter NIPD");
    
    let kelaminFull = newStudent.Kelamin;
    if (newStudent.Kelamin === "L") {
      kelaminFull = "Laki - Laki";
    } else if (newStudent.Kelamin === "P") {
      kelaminFull = "Perempuan";
    }
    
    const dataToSave = {
      ...newStudent,
      Kelamin: kelaminFull
    };
    
    const res = await addStudent(dataToSave);
    if (res.success) {
      alert("Student added successfully");
      setIsAddModalOpen(false);
      setNewStudent({
        Nama: "",
        Kelamin: "L",
        Nipd: 0,
        Nik: "",
        Nokk: "",
        Jeniskursus: 0,
        Kelas: "",
        Ttl: ""
      });
      window.location.reload();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5]" style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: "20px", fontWeight: 600, lineHeight: "28px", color: "#191c1e" }}>Students</h2>
        <div className="flex gap-4 items-center">
          <div className="w-64">
            <Input 
              type="text" 
              placeholder="Search by name, NIK..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>Add Student</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Name</TableCell>
              <TableCell isHeader>Gender</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <TableRow key={student.Id}>
                  <TableCell style={{ color: "#191c1e" }}>{student.Nama}</TableCell>
                  <TableCell style={{ color: "#434655" }}>{student.Kelamin}</TableCell>
                  <TableCell>
                    <Badge color={student.Status === 1 ? "success" : student.Status === 2 ? "info" : "error"} size="sm">
                      {student.Status === 1 ? "Aktif" : student.Status === 2 ? "Lulus" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVerify(student.Id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          student.Status === 1 ? 'bg-[#12b76a]' : 
                          student.Status === 2 ? 'bg-[#2563eb]' : 
                          'bg-[#f04438]'
                        }`}
                        title={student.Status === 1 ? "Active" : student.Status === 2 ? "Graduated" : "Inactive"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            student.Status === 1 || student.Status === 2 ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      
                      <button 
                        onClick={() => openEditModal(student)} 
                        className="text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(student.Id)} 
                        className="text-[#f04438] hover:text-[#d92d20] transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-[#737686] py-4">
                  No students found in the database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p style={{ fontSize: "14px", color: "#737686" }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
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

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-2xl p-6">
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#191c1e", marginBottom: "16px" }}>Edit Student</h3>
        {editingStudent && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input type="text" value={editingStudent.Nama} onChange={e => setEditingStudent({...editingStudent, Nama: e.target.value})} />
              </div>
              <div>
                <Label>Gender</Label>
                <select 
                  className="w-full rounded-lg border border-[#c3c6d7] bg-transparent px-4 py-3 text-sm"
                  value={editingStudent.Kelamin || ""} 
                  onChange={e => setEditingStudent({...editingStudent, Kelamin: e.target.value})}
                >
                  <option value="">Select Gender...</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <Label>NIPD</Label>
                <Input type="number" value={editingStudent.Nipd} onChange={e => setEditingStudent({...editingStudent, Nipd: parseInt(e.target.value)})} />
              </div>
              <div>
                <Label>NIK</Label>
                <Input type="text" value={editingStudent.Nik} onChange={e => setEditingStudent({...editingStudent, Nik: e.target.value})} />
              </div>
              <div>
                <Label>No KK</Label>
                <Input type="text" value={editingStudent.Nokk} onChange={e => setEditingStudent({...editingStudent, Nokk: e.target.value})} />
              </div>
              <div>
                <Label>Status</Label>
                <select 
                  className="w-full rounded-lg border border-[#c3c6d7] bg-transparent px-4 py-3 text-sm"
                  value={editingStudent.Status} 
                  onChange={e => setEditingStudent({...editingStudent, Status: parseInt(e.target.value)})}
                >
                  <option value={0}>Nonaktif</option>
                  <option value={1}>Aktif</option>
                  <option value={2}>Lulus</option>
                </select>
              </div>
              <div>
                <Label>Class</Label>
                <select 
                  className="w-full rounded-lg border border-[#c3c6d7] bg-transparent px-4 py-3 text-sm"
                  value={editingStudent.Jeniskursus} 
                  onChange={e => setEditingStudent({...editingStudent, Jeniskursus: parseInt(e.target.value)})}
                >
                  <option value={0}>Select Class...</option>
                  {classes.map(c => (
                    <option key={c.Id} value={c.Id}>{c.Namarombel}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Class Type (Kelas)</Label>
                <Input type="text" value={editingStudent.Kelas} onChange={e => setEditingStudent({...editingStudent, Kelas: e.target.value})} />
              </div>
              <div>
                <Label>Place & Date of Birth (Ttl)</Label>
                <Input type="text" value={editingStudent.Ttl} onChange={e => setEditingStudent({...editingStudent, Ttl: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-2xl p-6">
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#191c1e", marginBottom: "16px" }}>Add New Student</h3>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input 
                type="text" 
                required
                value={newStudent.Nama || ""} 
                onChange={e => setNewStudent({...newStudent, Nama: e.target.value})} 
                placeholder="Enter student name"
              />
            </div>
            <div>
              <Label>Gender</Label>
              <select 
                className="w-full rounded-lg border border-[#c3c6d7] bg-transparent px-4 py-3 text-sm" 
                value={newStudent.Kelamin || "L"} 
                onChange={e => setNewStudent({...newStudent, Kelamin: e.target.value})}
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <Label>NIPD *</Label>
              <Input 
                type="number" 
                required
                value={newStudent.Nipd || ""} 
                onChange={e => setNewStudent({...newStudent, Nipd: parseInt(e.target.value) || 0})} 
                placeholder="Enter NIPD"
              />
            </div>
            <div>
              <Label>NIK</Label>
              <Input 
                type="text" 
                value={newStudent.Nik || ""} 
                onChange={e => setNewStudent({...newStudent, Nik: e.target.value})} 
                placeholder="Enter NIK"
              />
            </div>
            <div>
              <Label>No KK</Label>
              <Input 
                type="text" 
                value={newStudent.Nokk || ""} 
                onChange={e => setNewStudent({...newStudent, Nokk: e.target.value})} 
                placeholder="Enter No KK"
              />
            </div>
            <div>
              <Label>Class</Label>
              <select 
                className="w-full rounded-lg border border-[#c3c6d7] bg-transparent px-4 py-3 text-sm"
                value={newStudent.Jeniskursus || 0} 
                onChange={e => setNewStudent({...newStudent, Jeniskursus: parseInt(e.target.value) || 0})}
              >
                <option value={0}>Select Class...</option>
                {classes.map(c => (
                  <option key={c.Id} value={c.Id}>{c.Namarombel}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Class Type (Kelas)</Label>
              <Input 
                type="text" 
                value={newStudent.Kelas || ""} 
                onChange={e => setNewStudent({...newStudent, Kelas: e.target.value})} 
                placeholder="Enter class type"
              />
            </div>
            <div>
              <Label>Place & Date of Birth (Ttl)</Label>
              <Input 
                type="text" 
                value={newStudent.Ttl || ""} 
                onChange={e => setNewStudent({...newStudent, Ttl: e.target.value})} 
                placeholder="e.g. Jakarta, 01-01-2000"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Student</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}