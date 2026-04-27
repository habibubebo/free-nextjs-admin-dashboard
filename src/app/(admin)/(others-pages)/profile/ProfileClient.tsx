"use client";

import React, { useState } from "react";
import { InstructorSession } from "@/app/actions/authActions";
import { updateInstructor } from "@/app/actions/instructorActions";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Modal } from "@/components/ui/modal";

interface ProfileClientProps {
  session: InstructorSession | null;
}

export default function ProfileClient({ session }: ProfileClientProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({ show: false, variant: "info", title: "", message: "" });

  const [formData, setFormData] = useState({
    NamaInstruktur: session?.name || "",
    Email: session?.email || "",
    Kelamin: session?.gender || "",
    Tempatlahir: session?.birthPlace || "",
    Tanggallahir: session?.birthDate || "",
    Namaibu: session?.motherName || "",
    Alamat: session?.address || "",
    password: "",
    role: session?.role || "instructor",
  });

  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (variant: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setAlertInfo({ show: true, variant, title, message });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsLoading(true);
    try {
      const res = await updateInstructor(session.id, formData);
      
      if (res.success) {
        showAlert("success", "Berhasil", "Profile berhasil diperbarui!");
        setIsEditModalOpen(false);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showAlert("error", "Gagal", res.error || "Terjadi kesalahan");
      }
    } catch (error) {
      showAlert("error", "Gagal", "Terjadi kesalahan saat menyimpan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Alert Notification */}
      {alertInfo.show && (
        <Alert
          variant={alertInfo.variant}
          title={alertInfo.title}
          message={alertInfo.message}
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Profile
          </h3>
          <Button onClick={() => setIsEditModalOpen(true)}>
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nama</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{session?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{session?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Jenis Kelamin</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{session?.gender || "-"}</p>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tempat Lahir</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{session?.birthPlace || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Lahir</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{session?.birthDate || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nama Ibu Kandung</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{session?.motherName || "-"}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Alamat</p>
          <p className="font-medium text-gray-800 dark:text-white/90">{session?.address || "-"}</p>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">
          Edit Profile
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nama</Label>
              <Input
                type="text"
                name="NamaInstruktur"
                value={formData.NamaInstruktur}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Jenis Kelamin</Label>
              <select
                name="Kelamin"
                value={formData.Kelamin}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki - Laki">Laki - Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <Label>Tempat Lahir</Label>
              <Input
                type="text"
                name="Tempatlahir"
                value={formData.Tempatlahir}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                name="Tanggallahir"
                value={formData.Tanggallahir}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Nama Ibu Kandung</Label>
              <Input
                type="text"
                name="Namaibu"
                value={formData.Namaibu}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <Label>Alamat</Label>
            <textarea
              name="Alamat"
              value={formData.Alamat}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}