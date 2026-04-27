"use client";

import React, { useState } from "react";
import { Instructor, addInstructor, updateInstructor, deleteInstructor } from "../../actions/instructorActions";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

export default function InstructorClient({ initialData }: { initialData: Instructor[] }) {
  const [instructors, setInstructors] = useState<Instructor[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Instructor, "Id">>({
    NamaInstruktur: "",
    Kelamin: "Laki-laki",
    Tempatlahir: "",
    Tanggallahir: "",
    Namaibu: "",
    Alamat: "",
    Email: "",
    username: "",
    password: "",
    role: "instructor",
  });

  const handleOpenModal = (instructor?: Instructor) => {
    if (instructor) {
      setEditingId(instructor.Id);
      setFormData({
        NamaInstruktur: instructor.NamaInstruktur,
        Kelamin: instructor.Kelamin,
        Tempatlahir: instructor.Tempatlahir,
        Tanggallahir: instructor.Tanggallahir,
        Namaibu: instructor.Namaibu,
        Alamat: instructor.Alamat,
        Email: instructor.Email,
        username: instructor.Email,
        password: "",
        role: instructor.role || "instructor",
      });
    } else {
      setEditingId(null);
      setFormData({
        NamaInstruktur: "",
        Kelamin: "Laki-laki",
        Tempatlahir: "",
        Tanggallahir: "",
        Namaibu: "",
        Alamat: "",
        Email: "",
        username: "",
        password: "",
        role: "instructor",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.Email && !formData.password && editingId) {
      alert("Password harus diisi jika mengubah email");
      return;
    }
    
    if (editingId) {
      const res = await updateInstructor(editingId, formData);
      if (res.success) {
        setInstructors((prev) =>
          prev.map((i) => (i.Id === editingId ? { ...formData, Id: editingId } : i))
        );
        setIsModalOpen(false);
      } else {
        alert(res.error || "Gagal mengupdate instruktur");
      }
    } else {
      const res = await addInstructor(formData);
      if (res.success) {
        window.location.reload(); 
      } else {
        alert(res.error || "Gagal menambah instruktur");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this instructor?")) {
      const res = await deleteInstructor(id);
      if (res.success) {
        setInstructors((prev) => prev.filter((i) => i.Id !== id));
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5]" style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: "20px", fontWeight: 600, lineHeight: "28px", color: "#191c1e" }}>Instructors</h2>
        <Button onClick={() => handleOpenModal()}>Add Instructor</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Name</TableCell>
              <TableCell isHeader>Gender</TableCell>
              <TableCell isHeader>Birth</TableCell>
              <TableCell isHeader>Email</TableCell>
              <TableCell isHeader>Role</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors.map((instructor) => (
              <TableRow key={instructor.Id}>
                <TableCell style={{ color: "#191c1e" }}>{instructor.NamaInstruktur}</TableCell>
                <TableCell style={{ color: "#434655" }}>{instructor.Kelamin}</TableCell>
                <TableCell style={{ color: "#434655" }}>{instructor.Tempatlahir}, {instructor.Tanggallahir}</TableCell>
                <TableCell style={{ color: "#434655" }}>{instructor.Email}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    instructor.role === 'superadmin' 
                      ? 'bg-[#fef3f2] text-[#b42318]' 
                      : 'bg-[#eff6ff] text-[#2563eb]'
                  }`}>
                    {instructor.role === 'superadmin' ? 'Superadmin' : 'Instructor'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(instructor)} className="text-[#2563eb] hover:text-[#1d4ed8]">Edit</button>
                    <button onClick={() => handleDelete(instructor.Id)} className="text-[#f04438] hover:text-[#d92d20]">Delete</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg p-6">
        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", color: "#191c1e" }}>
          {editingId ? "Edit Instructor" : "Add Instructor"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input type="text" value={formData.NamaInstruktur} onChange={(e) => setFormData({ ...formData, NamaInstruktur: e.target.value })} required />
          </div>
          <div>
            <Label>Gender</Label>
            <select
              className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb] focus:ring-[#2563eb]/10"
              value={formData.Kelamin}
              onChange={(e) => setFormData({ ...formData, Kelamin: e.target.value })}
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Place of Birth</Label>
              <Input type="text" value={formData.Tempatlahir} onChange={(e) => setFormData({ ...formData, Tempatlahir: e.target.value })} />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={formData.Tanggallahir} onChange={(e) => setFormData({ ...formData, Tanggallahir: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Mother's Name</Label>
            <Input type="text" value={formData.Namaibu} onChange={(e) => setFormData({ ...formData, Namaibu: e.target.value })} />
          </div>
          <div>
            <Label>Address</Label>
            <Input type="text" value={formData.Alamat} onChange={(e) => setFormData({ ...formData, Alamat: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input 
              type="email" 
              value={formData.Email} 
              onChange={(e) => setFormData({ ...formData, Email: e.target.value, username: e.target.value })} 
              required
            />
            <p className="text-xs text-[#737686] mt-1">Email akan digunakan sebagai username untuk login</p>
          </div>
          <div>
            <Label>Password {editingId && "(Wajib diisi jika mengubah email)"}</Label>
            <Input 
              type="password" 
              placeholder={editingId ? "Wajib diisi jika mengubah email" : "Enter password"}
              value={formData.password || ""} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required={!editingId}
            />
          </div>
          <div>
            <Label>Role</Label>
            <select
              className="w-full rounded-lg border border-[#c3c6d7] bg-[#f2f4f6] px-4 py-3 text-sm text-[#191c1e] focus:outline-none focus:border-[#2563eb] focus:ring-[#2563eb]/10"
              value={formData.role || "instructor"}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'superadmin' | 'instructor' })}
            >
              <option value="instructor">Instructor</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}