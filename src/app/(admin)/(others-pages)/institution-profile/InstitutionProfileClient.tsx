"use client";

import React, { useState } from "react";
import { Profil, updateProfil } from "../../../actions/profilActions";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

interface InstitutionProfileClientProps {
  initialData: Profil | null;
}

export default function InstitutionProfileClient({ initialData }: InstitutionProfileClientProps) {
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({ show: false, variant: "info", title: "", message: "" });

  const [formData, setFormData] = useState({
    Namalkp: initialData?.Namalkp || "",
    Alamat: initialData?.Alamat || "",
    Kelurahan: initialData?.Kelurahan || "",
    Kecamatan: initialData?.Kecamatan || "",
    Kota: initialData?.Kota || "",
    Provinsi: initialData?.Provinsi || "",
    Rt: initialData?.Rt || "",
    Rw: initialData?.Rw || "",
    Kodepos: initialData?.Kodepos || "",
    Namayayasan: initialData?.Namayayasan || "",
    Telepon: initialData?.Telepon || "",
    Nofax: initialData?.Nofax || "",
    Email: initialData?.Email || "",
    Npsn: initialData?.Npsn || "",
    Website: initialData?.Website || "",
    Logo: initialData?.Logo || "",
    Warna_Primary: initialData?.Warna_Primary || "#3C4D69",
    Kepala: initialData?.Kepala || "",
    NIP_Kepala: initialData?.NIP_Kepala || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (variant: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setAlertInfo({ show: true, variant, title, message });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await updateProfil(formData);
      
      if (res.success) {
        showAlert("success", "Berhasil", "Profil lembaga berhasil diperbarui!");
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
      <PageBreadcrumb pageTitle="Profil Lembaga" />
      
      <div className="space-y-6">
        {alertInfo.show && (
          <Alert
            variant={alertInfo.variant}
            title={alertInfo.title}
            message={alertInfo.message}
          />
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Profil Lembaga
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Nama Lembaga</Label>
                <Input
                  type="text"
                  name="Namalkp"
                  value={formData.Namalkp}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label>Nama Yayasan</Label>
                <Input
                  type="text"
                  name="Namayayasan"
                  value={formData.Namayayasan}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Telepon</Label>
                <Input
                  type="text"
                  name="Telepon"
                  value={formData.Telepon}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Fax</Label>
                <Input
                  type="text"
                  name="Nofax"
                  value={formData.Nofax}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>NPSN</Label>
                <Input
                  type="text"
                  name="Npsn"
                  value={formData.Npsn}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  type="text"
                  name="Website"
                  value={formData.Website}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Nama Kepala Lembaga</Label>
                <Input
                  type="text"
                  name="Kepala"
                  value={formData.Kepala}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>NIP Kepala</Label>
                <Input
                  type="text"
                  name="NIP_Kepala"
                  value={formData.NIP_Kepala}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Alamat</Label>
                <textarea
                  name="Alamat"
                  value={formData.Alamat}
                  onChange={(e) => setFormData(prev => ({ ...prev, Alamat: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
                />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kelurahan</Label>
                    <Input
                      type="text"
                      name="Kelurahan"
                      value={formData.Kelurahan}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Kecamatan</Label>
                    <Input
                      type="text"
                      name="Kecamatan"
                      value={formData.Kecamatan}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kota/Kabupaten</Label>
                    <Input
                      type="text"
                      name="Kota"
                      value={formData.Kota}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Provinsi</Label>
                    <Input
                      type="text"
                      name="Provinsi"
                      value={formData.Provinsi}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>RT</Label>
                    <Input
                      type="text"
                      name="Rt"
                      value={formData.Rt}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>RW</Label>
                    <Input
                      type="text"
                      name="Rw"
                      value={formData.Rw}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Kodepos</Label>
                    <Input
                      type="text"
                      name="Kodepos"
                      value={formData.Kodepos}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo and Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>URL Logo</Label>
                <Input
                  type="text"
                  name="Logo"
                  value={formData.Logo}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                />
                {formData.Logo && (
                  <div className="mt-2">
                    <img 
                      src={formData.Logo} 
                      alt="Logo Preview" 
                      className="h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Warna Primary</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="Warna_Primary"
                    value={formData.Warna_Primary}
                    onChange={handleInputChange}
                    className="h-12 w-20 cursor-pointer rounded-lg border border-gray-300"
                  />
                  <Input
                    type="text"
                    name="Warna_Primary"
                    value={formData.Warna_Primary}
                    onChange={handleInputChange}
                    className="w-32"
                  />
                </div>
                <div 
                  className="mt-2 h-8 w-full rounded-lg"
                  style={{ backgroundColor: formData.Warna_Primary }}
                ></div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}