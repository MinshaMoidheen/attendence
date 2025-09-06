"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCreateTaskMutation } from "@/store/taskApiSlice";
import { useGetAllUserQuery } from "@/store/userApiSlice";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/authentication";

interface CreateTaskFormData {
  fromUserId: string;
  toUserId: string;
  description: string;
  shortDesc: string;
  timeAndDate: string;
}

interface Employee {
  _id: string;
  email: string;
  designation: string;
}

export default function AddTask() {
  const router = useRouter();
  const currentUser = useSelector(selectUser);

  const [formData, setFormData] = useState<CreateTaskFormData>({
    fromUserId: "",
    toUserId: "",
    description: "",
    shortDesc: "",
    timeAndDate: "",
    
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const { 
    data: employeesData, 
    isLoading: isLoadingEmployees 
  } = useGetAllUserQuery({ page: 1, limit: 100 });

  // Set default date to current date and time and fromUserId
  useEffect(() => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFormData(prev => ({
      ...prev,
      fromUserId: currentUser?.id || "",
      timeAndDate: localDateTime
    }));
  }, [currentUser]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.toUserId) {
      newErrors.toUserId = "Employee is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    if (!formData.shortDesc.trim()) {
      newErrors.shortDesc = "Short description is required";
    } else if (formData.shortDesc.length > 200) {
      newErrors.shortDesc = "Short description must be less than 200 characters";
    }

    if (!formData.timeAndDate) {
      newErrors.timeAndDate = "Date and time is required";
    } else {
      const selectedDate = new Date(formData.timeAndDate);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.timeAndDate = "Date and time must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTaskFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted with data:", formData);
    
    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    try {
      console.log("Creating task with:", formData);
      const result = await createTask(formData).unwrap();
      
      console.log("Task created successfully:", result);
      router.push("/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const employees = employeesData?.users || [];

  if (isLoadingEmployees) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Add Task" />
        <div className="space-y-6">
          <ComponentCard title="Add Task">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading employees...</span>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Task" />
      <div className="space-y-6">
        <ComponentCard title="Add Task">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Selection */}
            <div>
              <label htmlFor="toUserId" className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Employee *
              </label>
              <select
                id="toUserId"
                value={formData.toUserId}
                onChange={(e) => handleInputChange("toUserId", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.toUserId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select an employee</option>
                {employees.map((employee: Employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.email} - {employee.designation}
                  </option>
                ))}
              </select>
              {errors.toUserId && (
                <p className="mt-1 text-sm text-red-600">{errors.toUserId}</p>
              )}
            </div>

            {/* Short Description */}
            <div>
              <label htmlFor="shortDesc" className="block text-sm font-medium text-gray-700 mb-2">
                Short Description *
              </label>
              <input
                type="text"
                id="shortDesc"
                value={formData.shortDesc}
                onChange={(e) => handleInputChange("shortDesc", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.shortDesc ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter short description (max 200 characters)"
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.shortDesc ? (
                  <p className="text-sm text-red-600">{errors.shortDesc}</p>
                ) : (
                  <div></div>
                )}
                <p className="text-xs text-gray-500">
                  {formData.shortDesc.length}/200
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter detailed description (max 1000 characters)"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-600">{errors.description}</p>
                ) : (
                  <div></div>
                )}
                <p className="text-xs text-gray-500">
                  {formData.description.length}/1000
                </p>
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="timeAndDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date and Time *
              </label>
              <input
                type="datetime-local"
                id="timeAndDate"
                value={formData.timeAndDate}
                onChange={(e) => handleInputChange("timeAndDate", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.timeAndDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.timeAndDate && (
                <p className="mt-1 text-sm text-red-600">{errors.timeAndDate}</p>
              )}
            </div>

            {/* Current User Info */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Task Assignment Info</h3>
              <div className="text-sm text-gray-600">
                <p><strong>Assigned by:</strong> {currentUser?.email || 'Current User'}</p>
                {/* <p><strong>User ID:</strong> {currentUser?.id || 'N/A'}</p> */}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/tasks")}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
