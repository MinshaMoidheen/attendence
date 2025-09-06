"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useGetAttendanceCoordinatesQuery, useUpdateAttendanceCoordinateMutation, useDeleteAttendanceCoordinateMutation } from "@/store/attendanceApiSlice";
import type { AttendanceCoordinate } from "@/store/attendanceApiSlice";
import Link from "next/link";

export default function AttendanceCoordinatesPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCoordinate, setEditingCoordinate] = useState<AttendanceCoordinate | null>(null);
  const [formData, setFormData] = useState({
    desc: "",
    latitude: 0,
    longitude: 0,
    radius: 100
  });

  // API hooks
  const { data: coordinatesData, isLoading, error, refetch } = useGetAttendanceCoordinatesQuery();
  const [updateCoordinate, { isLoading: isUpdating }] = useUpdateAttendanceCoordinateMutation();
  const [deleteCoordinate, { isLoading: isDeleting }] = useDeleteAttendanceCoordinateMutation();


  const handleEdit = (coordinate: AttendanceCoordinate) => {
    setEditingCoordinate(coordinate);
    setFormData({
      desc: coordinate.desc,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      radius: coordinate.radius
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoordinate) return;
    
    try {
      await updateCoordinate({
        coordinateId: editingCoordinate._id,
        ...formData
      }).unwrap();
      setIsEditModalOpen(false);
      setEditingCoordinate(null);
      setFormData({ desc: "", latitude: 0, longitude: 0, radius: 100 });
      refetch();
    } catch (err: any) {
      console.error("Error updating coordinate:", err);
    }
  };

  const handleDelete = async (coordinateId: string) => {
    if (window.confirm("Are you sure you want to delete this attendance coordinate?")) {
      try {
        await deleteCoordinate(coordinateId).unwrap();
        refetch();
      } catch (err: any) {
        console.error("Error deleting coordinate:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Attendance Coordinates" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Attendance Coordinates" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Coordinates</h1>
          <Link href="/attendance-coordinates/add">
            <Button
              variant="primary"
              size="md"
            >
              Add New Coordinate
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <Alert
            variant="error"
            title="Error"
            message="Failed to load attendance coordinates"
          />
        )}

        {/* Coordinates List */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Radius (m)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coordinatesData?.coordinates?.map((coordinate) => (
                  <tr key={coordinate._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {coordinate.desc}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coordinate.latitude.toFixed(6)}, {coordinate.longitude.toFixed(6)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coordinate.radius}m
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(coordinate.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(coordinate)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(coordinate._id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Attendance Coordinate</h3>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      value={formData.desc}
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Radius (meters)</label>
                    <input
                      type="number"
                      value={formData.radius}
                      onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingCoordinate(null);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
