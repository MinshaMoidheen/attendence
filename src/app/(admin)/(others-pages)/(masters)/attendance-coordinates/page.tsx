"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne, { Column } from "@/components/tables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useGetAttendanceCoordinatesQuery, useDeleteAttendanceCoordinateMutation } from "@/store/attendanceApiSlice";
import Link from "next/link";

interface CoordinateData {
  id: string; // Add id field for BasicTableOne compatibility
  _id: string;
  desc: string;
  latitude: number;
  longitude: number;
  radius: number;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

export default function AttendanceCoordinatesPage() {

  // API hooks
  const { data: coordinatesData, isLoading, error, refetch } = useGetAttendanceCoordinatesQuery();
  const [deleteCoordinate, { isLoading: isDeleting }] = useDeleteAttendanceCoordinateMutation();


  console.log("coordinatesData",coordinatesData)

  const columns: Column<CoordinateData>[] = [
    { 
      header: "Description", 
      accessor: "desc",
      render: (value) => (
        <span className="text-blue-600 font-medium">{value}</span>
      )
    },
    { 
      header: "Location", 
      accessor: "latitude",
      render: (_, coordinate) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {coordinate.latitude.toFixed(6)}, {coordinate.longitude.toFixed(6)}
          </div>
          <div className="text-gray-500 text-xs">
            Lat: {coordinate.latitude.toFixed(6)}
          </div>
        </div>
      )
    },
    { 
      header: "Radius", 
      accessor: "radius",
      render: (value) => (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          {value}m
        </span>
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
          <Link href={`/attendance-coordinates/edit/${id}`}>
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
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      )
    }
  ];


  const handleDelete = async (coordinateId: string) => {
    if (window.confirm("Are you sure you want to delete this attendance coordinate?")) {
      try {

        console.log("coordinateId",coordinateId)
        await deleteCoordinate(coordinateId).unwrap();
        refetch();
      } catch (err: any) {
        console.error("Error deleting coordinate:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Attendance Coordinates" />
        <div className="space-y-6">
          <ComponentCard title="Attendance Coordinates" actions="/attendance-coordinates/add">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading coordinates...</span>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Attendance Coordinates" />
        <div className="space-y-6">
          <ComponentCard title="Attendance Coordinates" actions="/attendance-coordinates/add">
            <Alert
              variant="error"
              title="Error"
              message="Failed to load attendance coordinates. Please try again."
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

  const coordinates = (coordinatesData?.attendanceCoordinates || []).map((coordinate: any) => ({
    ...coordinate,
    id: coordinate._id // Map _id to id for BasicTableOne compatibility
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Attendance Coordinates" />
      <div className="space-y-6">
        <ComponentCard title="Attendance Coordinates" actions="/attendance-coordinates/add">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {coordinates.length} of {coordinatesData?.total || 0} coordinates
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
          
          <BasicTableOne columns={columns} data={coordinates} />
        </ComponentCard>
      </div>

    </div>
  );
}
