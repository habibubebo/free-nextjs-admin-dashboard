"use client";

import React, { useState } from "react";
import { InstructorSession, logoutInstructor } from "../actions/authActions";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import { updateInstructorPassword } from "../actions/authActions";

interface Props {
  session: InstructorSession;
}

export default function InstructorDashboardClient({ session }: Props) {
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logoutInstructor();
    router.push("/instructor-login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Password baru tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      const result = await updateInstructorPassword(session.id, newPassword);
      
      if (result.success) {
        setPasswordSuccess("Password berhasil diubah");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(result.error || "Gagal mengubah password");
      }
    } catch (error: any) {
      setPasswordError("Terjadi kesalahan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Instructor Dashboard</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
              Ubah Password
            </Button>
            <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-8">Profile Akun</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nama Lengkap</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{session.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Username</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{session.username}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{session.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Jenis Kelamin</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{session.gender}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tempat Lahir</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{session.birthPlace || "-"}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tanggal Lahir</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{session.birthDate || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nama Ibu</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{session.motherName || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alamat</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{session.address || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
            <p className="text-2xl font-bold text-brand-500">Aktif</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ID Instruktur</p>
            <p className="text-2xl font-bold text-blue-500">{session.id}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Role</p>
            <p className={`text-2xl font-bold ${session.role === 'superadmin' ? 'text-red-500' : 'text-green-500'}`}>
              {session.role === 'superadmin' ? 'Superadmin' : 'Instructor'}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Ubah Password</h3>
        
        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{passwordError}</p>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{passwordSuccess}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label>Password Baru</Label>
            <Input
              type="password"
              placeholder="Masukkan password baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>Konfirmasi Password</Label>
            <Input
              type="password"
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
