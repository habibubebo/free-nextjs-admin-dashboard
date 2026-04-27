"use client";

import React, { useState } from "react";
import { registerStudent } from "../actions/registerAction";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

export default function RegisterClient() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await registerStudent(formData);
    
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Registration failed.");
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-success-100 text-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Registration Successful!</h2>
        <p className="text-gray-500 dark:text-gray-400">Your registration has been submitted and is pending verification.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-error-50 text-error-600 rounded-lg text-sm">{error}</div>}
      
      <div>
        <Label>Full Name</Label>
        <Input type="text" name="Nama" required placeholder="Enter your full name" />
      </div>

      <div>
        <Label>Gender</Label>
        <select
          name="Kelamin"
          required
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
        >
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>

      <div>
        <Label>NIK</Label>
        <Input type="text" name="Nik" required placeholder="16-digit NIK" />
      </div>

      <div>
        <Label>No. KK</Label>
        <Input type="text" name="Nokk" required placeholder="16-digit No. KK" />
      </div>

      <div>
        <Label>Place and Date of Birth</Label>
        <Input type="text" name="Ttl" required placeholder="e.g. Jakarta, 17 Agustus 2000" />
      </div>

      <Button type="submit" className="w-full justify-center">Register Now</Button>
    </form>
  );
}
