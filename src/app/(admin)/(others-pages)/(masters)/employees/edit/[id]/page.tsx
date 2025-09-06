"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

console.log("Edit Employee page loaded");
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useGetUserByIdQuery, useUpdateUserMutation } from "@/store/userApiSlice";

interface WorkingHours {
  punchin: {
    from: string;
    to: string;
  };
  punchout: {
    from: string;
    to: string;
  };
}

interface Employee {
  _id: string;
  email: string;
  designation: string;
  refAdmin: {
    _id: string;
    name: string;
    email: string;
    company: string;
  };
  workingHours: WorkingHours;
  createdAt: string;
  updatedAt: string;
}

interface UpdateEmployeeFormData {
  email: string;
  designation: string;
  workingHours: WorkingHours;
}

export default function EditEmployee() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [formData, setFormData] = useState<UpdateEmployeeFormData>({
    email: "",
    designation: "",
    workingHours: {
      punchin: { from: "", to: "" },
      punchout: { from: "", to: "" }
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { 
    data: employeeData, 
    isLoading, 
    error 
  } = useGetUserByIdQuery(employeeId);

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  console.log("Edit Employee - employeeId:", employeeId);
  console.log("Edit Employee - employeeData:", employeeData);
  console.log("Edit Employee - isLoading:", isLoading);
  console.log("Edit Employee - error:", error);

  // Populate form when employee data is loaded
  useEffect(() => {
    if (employeeData?.user) {
      const employee = employeeData.user as Employee;
      setFormData({
        email: employee.email,
        designation: employee.designation,
        workingHours: employee.workingHours
      });
    }
  }, [employeeData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    // Validate working hours
    if (!formData.workingHours.punchin.from) {
      newErrors["punchin.from"] = "Punch in from time is required";
    }
    if (!formData.workingHours.punchin.to) {
      newErrors["punchin.to"] = "Punch in to time is required";
    }
    if (!formData.workingHours.punchout.from) {
      newErrors["punchout.from"] = "Punch out from time is required";
    }
    if (!formData.workingHours.punchout.to) {
      newErrors["punchout.to"] = "Punch out to time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

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
      console.log("Updating user with:", { userId: employeeId, body: formData });
      const result = await updateUser({
        userId: employeeId,
        body: formData
      }).unwrap();
      
      console.log("Update successful:", result);
      router.push("/employees");
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Employee" />
        <div className="space-y-6">
          <ComponentCard title="Edit Employee">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading employee...</span>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Employee" />
        <div className="space-y-6">
          <ComponentCard title="Edit Employee">
            <Alert
              variant="error"
              title="Error"
              message="Failed to load employee. Please try again."
            />
            <div className="mt-4">
              <Button
                onClick={() => router.push("/employees")}
                variant="primary"
                size="sm"
              >
                Back to Employees
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Employee" />
      <div className="space-y-6">
        <ComponentCard title="Edit Employee">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                Designation *
              </label>
              <input
                type="text"
                id="designation"
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.designation ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter designation"
              />
              {errors.designation && (
                <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
              )}
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Working Hours</h3>
              
              {/* Punch In Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="punchin.from" className="block text-sm font-medium text-gray-700 mb-2">
                    Punch In From *
                  </label>
                  <input
                    type="time"
                    id="punchin.from"
                    value={formData.workingHours.punchin.from}
                    onChange={(e) => handleInputChange("punchin.from", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors["punchin.from"] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors["punchin.from"] && (
                    <p className="mt-1 text-sm text-red-600">{errors["punchin.from"]}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="punchin.to" className="block text-sm font-medium text-gray-700 mb-2">
                    Punch In To *
                  </label>
                  <input
                    type="time"
                    id="punchin.to"
                    value={formData.workingHours.punchin.to}
                    onChange={(e) => handleInputChange("punchin.to", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors["punchin.to"] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors["punchin.to"] && (
                    <p className="mt-1 text-sm text-red-600">{errors["punchin.to"]}</p>
                  )}
                </div>
              </div>

              {/* Punch Out Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="punchout.from" className="block text-sm font-medium text-gray-700 mb-2">
                    Punch Out From *
                  </label>
                  <input
                    type="time"
                    id="punchout.from"
                    value={formData.workingHours.punchout.from}
                    onChange={(e) => handleInputChange("punchout.from", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors["punchout.from"] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors["punchout.from"] && (
                    <p className="mt-1 text-sm text-red-600">{errors["punchout.from"]}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="punchout.to" className="block text-sm font-medium text-gray-700 mb-2">
                    Punch Out To *
                  </label>
                  <input
                    type="time"
                    id="punchout.to"
                    value={formData.workingHours.punchout.to}
                    onChange={(e) => handleInputChange("punchout.to", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors["punchout.to"] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors["punchout.to"] && (
                    <p className="mt-1 text-sm text-red-600">{errors["punchout.to"]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/employees")}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
