import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne, { Column } from "@/components/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};


interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

// Define the table data using the interface
const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
  },
];

const columns: Column<Order>[] = [
  { header: "ID", accessor: "id" },
  { 
    header: "User", 
    accessor: "user",
    render: (user: Order['user']) => (
      <div className="flex items-center gap-3">
        <img
          src={user.image}
          alt={user.name}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
        </div>
      </div>
    )
  },
  { header: "Project Name", accessor: "projectName" },
  { 
    header: "Team", 
    accessor: "team",
    render: (team: Order['team']) => (
      <div className="flex -space-x-2">
        {team.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Team member ${index + 1}`}
            className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
          />
        ))}
      </div>
    )
  },
  { header: "Budget", accessor: "budget" },
  { 
    header: "Status", 
    accessor: "status",
    render: (status: string) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === 'Active' 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : status === 'Pending'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      }`}>
        {status}
      </span>
    )
  },
]

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne columns={columns} data={tableData} />
        </ComponentCard>
      </div>
    </div>
  );
}
