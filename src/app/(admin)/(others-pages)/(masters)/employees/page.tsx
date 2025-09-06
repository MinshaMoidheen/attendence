import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne, { Column } from "@/components/tables/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Employees",
    description:
      "This is Next.js Employees page",
  };

  interface Employees {
    id: number,
    name: string,
    email: string,
    phone: number,
  }

  const employees: Employees[] = [
    { id: 1, name: "sabii", email: "sabi@gmail.com", phone: 9876543210 },
    { id: 2, name: "arun", email: "arun@gmail.com", phone: 9876543210 },
  ];

  const columns: Column<Employees>[] = [  
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
  ]

export default function Employees() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Employees" />
      <div className="space-y-6">
        <ComponentCard title="Employees" actions="/employees/add">
            <BasicTableOne columns={columns} data={employees} />
        </ComponentCard>
      </div>
    </div>
  );
}