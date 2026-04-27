"use client";

import React, { useState, useEffect } from "react";
import { CourseUnit, addCourseUnit, deleteCourseUnit, updateCourseUnit } from "../../actions/courseActions";
import { ClassRoom } from "../../actions/classActions";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

export default function CourseClient({ initialData, classes }: { initialData: CourseUnit[], classes: ClassRoom[] }) {
  const [courses, setCourses] = useState<CourseUnit[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    Rombel: "",
    Uk1: "", Uk2: "", Uk3: "", Uk4: "", Uk5: "",
    Jp1: "", Jp2: "", Jp3: "", Jp4: "", Jp5: "",
    Jptotal: "0"
  });

  useEffect(() => {
    // Auto-calculate Total JP
    const total = [formData.Jp1, formData.Jp2, formData.Jp3, formData.Jp4, formData.Jp5]
      .reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    setFormData(prev => ({ ...prev, Jptotal: total.toString() }));
  }, [formData.Jp1, formData.Jp2, formData.Jp3, formData.Jp4, formData.Jp5]);

  const openAddModal = () => {
    setFormData({
      Rombel: "",
      Uk1: "", Uk2: "", Uk3: "", Uk4: "", Uk5: "",
      Jp1: "", Jp2: "", Jp3: "", Jp4: "", Jp5: "",
      Jptotal: "0"
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: CourseUnit) => {
    setFormData({
      Rombel: course.Rombel.toString(),
      Uk1: course.Uk1 || "", Uk2: course.Uk2 || "", Uk3: course.Uk3 || "", Uk4: course.Uk4 || "", Uk5: course.Uk5 || "",
      Jp1: course.Jp1 || "", Jp2: course.Jp2 || "", Jp3: course.Jp3 || "", Jp4: course.Jp4 || "", Jp5: course.Jp5 || "",
      Jptotal: course.Jptotal || "0"
    });
    setEditingId(course.Id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Rombel) return alert("Please select a class");

    const payload = { ...formData, Rombel: parseInt(formData.Rombel) };
    
    if (editingId) {
      const res = await updateCourseUnit(editingId, payload);
      if (res.success) {
        const className = classes.find(c => c.Id === payload.Rombel)?.Namarombel || "Unknown";
        setCourses(prev => prev.map(c => c.Id === editingId ? { ...payload, Id: editingId, Namarombel: className } : c));
        setIsModalOpen(false);
      } else alert(res.error);
    } else {
      const res = await addCourseUnit(payload);
      if (res.success) {
        const className = classes.find(c => c.Id === payload.Rombel)?.Namarombel || "Unknown";
        setCourses([{ ...payload, Id: res.id, Namarombel: className }, ...courses]);
        setIsModalOpen(false);
      } else alert(res.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this course unit?")) {
      const res = await deleteCourseUnit(id);
      if (res.success) {
        setCourses(prev => prev.filter(c => c.Id !== id));
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Competency Units</h2>
        <Button onClick={openAddModal}>Add New Unit</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Class (Rombel)</TableCell>
              <TableCell isHeader>Competency Units</TableCell>
              <TableCell isHeader>Total Hours</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <TableRow key={course.Id}>
                  <TableCell className="font-medium text-gray-800 dark:text-white/90">
                    {course.Namarombel}
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                      {course.Uk1 && <li>{course.Uk1} ({course.Jp1} hrs)</li>}
                      {course.Uk2 && <li>{course.Uk2} ({course.Jp2} hrs)</li>}
                      {course.Uk3 && <li>{course.Uk3} ({course.Jp3} hrs)</li>}
                      {course.Uk4 && <li>{course.Uk4} ({course.Jp4} hrs)</li>}
                      {course.Uk5 && <li>{course.Uk5} ({course.Jp5} hrs)</li>}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium">
                      {course.Jptotal} Hours
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <button onClick={() => openEditModal(course)} className="text-blue-500 hover:text-blue-700">Edit</button>
                      <button onClick={() => handleDelete(course.Id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                  No course units found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-3xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">
          {editingId ? "Edit Competency Unit" : "Add New Competency Unit"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <Label>Select Class (Rombel)</Label>
            <select
              required
              value={formData.Rombel}
              onChange={(e) => setFormData({...formData, Rombel: e.target.value})}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
            >
              <option value="">Select Class...</option>
              {classes.map(cls => (
                <option key={cls.Id} value={cls.Id}>{cls.Namarombel}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Competency Units (Max 5)</h4>
            
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-9">
                  <Input 
                    type="text" 
                    placeholder={`Unit Kompetensi ${num}`} 
                    value={formData[`Uk${num}` as keyof typeof formData]} 
                    onChange={e => setFormData({...formData, [`Uk${num}`]: e.target.value})} 
                  />
                </div>
                <div className="col-span-3">
                  <Input 
                    type="number" 
                    placeholder={`JP ${num}`} 
                    value={formData[`Jp${num}` as keyof typeof formData]} 
                    onChange={e => setFormData({...formData, [`Jp${num}`]: e.target.value})} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-gray-800 dark:text-white/90">
              Total Hours: <span className="font-bold text-brand-500 text-lg">{formData.Jptotal}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
