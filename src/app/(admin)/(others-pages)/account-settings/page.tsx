"use client";

import React, { useState } from "react";
import { useSession } from "@/hooks/useSession";
import { updateInstructorEmail, checkUsernameExists } from "@/app/actions/authActions";
import { updateInstructorPassword } from "@/app/actions/authActions";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function AccountSettingsPage() {
  const { session, loading } = useSession();
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

  // Email change state
  const [email, setEmail] = useState(session?.email || "");
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return showAlert("error", "Error", "Session tidak ditemukan");
    if (!email) return showAlert("warning", "Peringatan", "Email tidak boleh kosong");

    setIsEmailLoading(true);
    try {
      // Check if username (email) already exists
      const usernameExists = await checkUsernameExists(email, session.id);
      if (usernameExists) {
        showAlert("error", "Gagal", "Email sudah digunakan oleh akun lain");
        setIsEmailLoading(false);
        return;
      }

      // Update email in both akun and instruktur tables
      const res = await updateInstructorEmail(session.id, email);
      
      if (res.success) {
        showAlert("success", "Berhasil", "Email berhasil diperbarui!");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showAlert("error", "Gagal", res.error || "Terjadi kesalahan");
      }
    } catch (error) {
      showAlert("error", "Gagal", "Terjadi kesalahan saat mengubah email");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return showAlert("error", "Error", "Session tidak ditemukan");
    if (!currentPassword) return showAlert("warning", "Peringatan", "Masukkan password saat ini");
    if (!newPassword) return showAlert("warning", "Peringatan", "Masukkan password baru");
    if (newPassword.length < 6) return showAlert("warning", "Peringatan", "Password minimal 6 karakter");
    if (newPassword !== confirmPassword) return showAlert("error", "Gagal", "Konfirmasi password tidak cocok");

    setIsPasswordLoading(true);
    try {
      const res = await updateInstructorPassword(session.id, newPassword);
      
      if (res.success) {
        showAlert("success", "Berhasil", "Password berhasil diperbarui!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showAlert("error", "Gagal", res.error || "Terjadi kesalahan");
      }
    } catch (error) {
      showAlert("error", "Gagal", "Terjadi kesalahan saat mengubah password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Account Settings" />
      
      <div className="space-y-6">
        {/* Alert Notification */}
        {alertInfo.show && (
          <Alert
            variant={alertInfo.variant}
            title={alertInfo.title}
            message={alertInfo.message}
          />
        )}

        {/* Change Email Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Ubah Email
          </h3>
          <form onSubmit={handleEmailChange} className="space-y-5 max-w-xl">
            <div>
              <Label>Email Baru</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email baru"
                required
              />
            </div>
            <Button type="submit" disabled={isEmailLoading}>
              {isEmailLoading ? "Menyimpan..." : "Ubah Email"}
            </Button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Ubah Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-5 max-w-xl">
            <div>
              <Label>Password Saat Ini</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                required
              />
            </div>
            <div>
              <Label>Password Baru</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru (min. 6 karakter)"
                required
              />
            </div>
            <div>
              <Label>Konfirmasi Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                required
              />
            </div>
            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? "Menyimpan..." : "Ubah Password"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}