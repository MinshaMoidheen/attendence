import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Next.js Attendance Punch | TailAdmin - Next.js Dashboard Template",
    description:
      "This is Next.js Attendance Punch page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
  };

export default function AttendancePunch() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Attendance Punch" />
    </div>
  );
}