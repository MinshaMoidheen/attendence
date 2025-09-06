"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne, { Column } from "@/components/tables/BasicTableOne";
import { useGetAllUserQuery, useDeleteUserMutation } from "@/store/userApiSlice";
import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Link from "next/link";

interface Employee {
  id: string; // Add id field for BasicTableOne compatibility
  _id: string;
  email: string;
  designation: string;
  refAdmin: {
    _id: string;
    name: string;
    email: string;
    company: string;
  };
  workingHours: {
    punchin: {
      from: string;
      to: string;
    };
    punchout: {
      from: string;
      to: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}



export default function Employees() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const offset = (currentPage - 1) * limit;

  const { 
    data: apiResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllUserQuery({ 
    page: currentPage, 
    limit 
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  console.log("apiResponse",apiResponse)

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        console.log("userId", userId);
        await deleteUser(userId).unwrap();
        refetch();
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee. Please try again.");
      }
    }
  };

  const columns: Column<Employee>[] = [
    { 
      header: "Email", 
      accessor: "email",
      render: (value) => (
        <span className="text-blue-600 font-medium">{value}</span>
      )
    },
    { 
      header: "Designation", 
      accessor: "designation",
      render: (value) => (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          {value}
        </span>
      )
    },
    { 
      header: "Admin", 
      accessor: "refAdmin",
      render: (refAdmin) => (
        <div>
          <div className="font-medium text-gray-900">{refAdmin?.name}</div>
          <div className="text-sm text-gray-500">{refAdmin?.company}</div>
        </div>
      )
    },
    { 
      header: "Working Hours", 
      accessor: "workingHours",
      render: (workingHours) => (
        <div className="text-sm">
          <div className="text-green-600">
            In: {workingHours?.punchin?.from} - {workingHours?.punchin?.to}
          </div>
          <div className="text-red-600">
            Out: {workingHours?.punchout?.from} - {workingHours?.punchout?.to}
          </div>
        </div>
      )
    },
    { 
      header: "Created", 
      accessor: "createdAt",
      render: (value) => (
        <span className="text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: "_id",
      render: (id) => (
        <div className="flex space-x-2">
          <Link href={`/employees/edit/${id}`}>
            <Button
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )
    }
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Employees" />
        <div className="space-y-6">
          <ComponentCard title="Employees" actions="/employees/add">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading employees...</span>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Employees" />
        <div className="space-y-6">
          <ComponentCard title="Employees" actions="/employees/add">
            <Alert
              variant="error"
              title="Error"
              message="Failed to load employees. Please try again."
            />
            <div className="mt-4">
              <Button
                onClick={() => refetch()}
                variant="primary"
                size="sm"
              >
                Retry
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  const employees = (apiResponse?.users || []).map((user: any) => ({
    ...user,
    id: user._id // Map _id to id for BasicTableOne compatibility
  }));
  const pagination = apiResponse?.pagination;

  return (
    <div>
      <PageBreadcrumb pageTitle="Employees" />
      <div className="space-y-6">
        <ComponentCard title="Employees" actions="/employees/add">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {employees.length} of {apiResponse?.total || 0} employees
              </div>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
              >
                Refresh
              </Button>
            </div>
          </div>
          
          <BasicTableOne columns={columns} data={employees} />
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasMore}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}