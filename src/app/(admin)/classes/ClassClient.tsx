"use client";

import React, { useState } from "react";
import { ClassRoom, addClass, updateClass, deleteClass } from "../../actions/classActions";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

export default function ClassClient({ initialData }: { initialData: ClassRoom[] }) {
  const [classes, setClasses] = useState<ClassRoom[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    Namarombel: "",
    Kelas: "",
    Jumlahpeserta: "",
    Ruangan: ""
  });

  const resetForm = () => {
    setFormData({ Namarombel: "", Kelas: "", Jumlahpeserta: "", Ruangan: "" });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (cls: ClassRoom) => {
    setFormData({
      Namarombel: cls.Namarombel || "",
      Kelas: cls.Kelas || "",
      Jumlahpeserta: cls.Jumlahpeserta || "",
      Ruangan: cls.Ruangan || ""
    });
    setEditingId(cls.Id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const res = await updateClass(editingId, formData);
      if (res.success) {
        setClasses(prev => prev.map(c => c.Id === editingId ? { ...formData, Id: editingId } : c));
        setIsModalOpen(false);
      } else alert(res.error);
    } else {
      const res = await addClass(formData);
      if (res.success) {
        setClasses([{ ...formData, Id: res.id }, ...classes]);
        setIsModalOpen(false);
      } else alert(res.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this class?")) {
      const res = await deleteClass(id);
      if (res.success) {
        setClasses(prev => prev.filter(c => c.Id !== id));
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5]" style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: "20px", fontWeight: 600, lineHeight: "28px", color: "#191c1e" }}>Training Classes</h2>
        <Button onClick={openAddModal}>Add New Class</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Class Name</TableCell>
              <TableCell isHeader>Level / Type</TableCell>
              <TableCell isHeader>Capacity</TableCell>
              <TableCell isHeader>Room</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length > 0 ? (
              classes.map((cls) => (
                <TableRow key={cls.Id}>
                  <TableCell>{cls.Namarombel}</TableCell>
                  <TableCell>{cls.Kelas}</TableCell>
                  <TableCell>{cls.Jumlahpeserta}</TableCell>
                  <TableCell>{cls.Ruangan}</TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <button onClick={() => openEditModal(cls)} className="text-[#2563eb] hover:text-[#1d4ed8]">Edit</button>
                      <button onClick={() => handleDelete(cls.Id)} className="text-[#f04438] hover:text-[#d92d20]">Delete</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[#737686] py-4">
                  No classes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md p-6">
        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", color: "#191c1e" }}>
          {editingId ? "Edit Class" : "Add New Class"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Class Name</Label>
            <Input 
              type="text" 
              required 
              value={formData.Namarombel} 
              onChange={e => setFormData({...formData, Namarombel: e.target.value})} 
              placeholder="e.g. Web Dev Batch 1"
            />
          </div>
          <div>
            <Label>Level / Type (Kelas)</Label>
            <Input 
              type="text" 
              required 
              value={formData.Kelas} 
              onChange={e => setFormData({...formData, Kelas: e.target.value})} 
              placeholder="e.g. Beginner"
            />
          </div>
          <div>
            <Label>Capacity (Jumlah Peserta)</Label>
            <Input 
              type="number" 
              required 
              value={formData.Jumlahpeserta} 
              onChange={e => setFormData({...formData, Jumlahpeserta: e.target.value})} 
              placeholder="e.g. 20"
            />
          </div>
          <div>
            <Label>Room (Ruangan)</Label>
            <Input 
              type="text" 
              required 
              value={formData.Ruangan} 
              onChange={e => setFormData({...formData, Ruangan: e.target.value})} 
              placeholder="e.g. Lab A"
            />
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
