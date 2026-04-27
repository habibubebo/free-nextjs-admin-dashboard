import React from "react";
export const metadata = {
  title: "Student Registration",
  description: "Register for a course",
};
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-900">

      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 dark:bg-gray-800 dark:border dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6 dark:text-white">Student Registration</h1>
        <RegisterClient />
      </div>
    </div>
  );
}
