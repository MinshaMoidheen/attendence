import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Employee",
  description: "Add a new employee to the system",
};

export default function AddEmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}