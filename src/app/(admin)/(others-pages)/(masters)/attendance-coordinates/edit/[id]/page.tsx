"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useGetAttendanceCoordinatesQuery, useUpdateAttendanceCoordinateMutation } from "@/store/attendanceApiSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface EditCoordinateFormData {
  desc: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function EditAttendanceCoordinatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const coordinateId = params.id;
  
  const [formData, setFormData] = useState<EditCoordinateFormData>({
    desc: "",
    latitude: 0,
    longitude: 0,
    radius: 100
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API hooks
  const { data: coordinatesData, refetch } = useGetAttendanceCoordinatesQuery();
  const [updateCoordinate, { isLoading: isUpdating }] = useUpdateAttendanceCoordinateMutation();

  // Find the coordinate to edit
  const coordinate = coordinatesData?.attendanceCoordinates?.find(coord => coord._id === coordinateId);

  useEffect(() => {
    if (coordinate) {
      setFormData({
        desc: coordinate.desc,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        radius: coordinate.radius
      });
      setIsLoading(false);
    } else if (coordinatesData && !isLoading) {
      setError("Coordinate not found");
      setIsLoading(false);
    }
  }, [coordinate, coordinatesData, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateCoordinate({
        coordinateId,
        ...formData
      }).unwrap();
      
      router.push('/attendance-coordinates');
    } catch (err: any) {
      console.error("Error updating coordinate:", err);
      setError(err?.data?.message || "Failed to update coordinate");
    }
  };

  const handleCancel = () => {
    router.push('/attendance-coordinates');
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Attendance Coordinate" />
        <div className="space-y-6">
          <ComponentCard title="Edit Attendance Coordinate">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading coordinate...</span>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  if (error || !coordinate) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Attendance Coordinate" />
        <div className="space-y-6">
          <ComponentCard title="Edit Attendance Coordinate">
            <Alert
              variant="error"
              title="Error"
              message={error || "Coordinate not found"}
            />
            <div className="mt-4">
              <Button
                onClick={handleCancel}
                variant="primary"
                size="sm"
              >
                Back to Coordinates
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Attendance Coordinate" />
      <div className="space-y-6">
        <ComponentCard title="Edit Attendance Coordinate">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter coordinate description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radius (meters) *
                </label>
                <input
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter radius in meters"
                  min="1"
                  max="10000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter latitude"
                  min="-90"
                  max="90"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter longitude"
                  min="-180"
                  max="180"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Coordinate"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
