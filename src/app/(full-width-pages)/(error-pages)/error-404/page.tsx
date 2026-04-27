import GridShape from "@/components/common/GridShape";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Error 404 | Lembaga Pelatihan Cendekia Utama",
  description: "Page not found",
};

export default function Error404() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-[#f7f9fb]">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "32px", color: "#191c1e" }}>
          ERROR 404
        </h1>

        <Image
          src="/images/error/404.svg"
          alt="404"
          className="dark:hidden"
          width={472}
          height={152}
        />
        <Image
          src="/images/error/404-dark.svg"
          alt="404"
          className="hidden dark:block"
          width={472}
          height={152}
        />

        <p style={{ fontSize: "16px", fontWeight: 400, lineHeight: "24px", color: "#434655", marginTop: "40px", marginBottom: "24px" }}>
          We can't seem to find the page you are looking for!
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-[#c3c6d7] bg-white px-5 py-3.5 text-sm font-medium text-[#434655] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#f2f4f6]"
        >
          Back to Home Page
        </Link>
      </div>
      <p style={{ fontSize: "14px", color: "#737686" }} className="absolute text-sm text-center -translate-x-1/2 bottom-6 left-1/2">
        &copy; {new Date().getFullYear()} - Lembaga Pelatihan Cendekia Utama
      </p>
    </div>
  );
}