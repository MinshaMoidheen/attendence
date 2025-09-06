"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCreateAttendanceCoordinateMutation } from "@/store/attendanceApiSlice";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/authentication";
import { useRouter } from "next/navigation";

// Form data type
interface CreateCoordinateFormData {
  desc: string;
  latitude: number;
  longitude: number;
  radius: number;
  
}

export default function AddAttendanceCoordinate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const router = useRouter();
  const currentUser = useSelector(selectUser);
  const [createCoordinate] = useCreateAttendanceCoordinateMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CreateCoordinateFormData>({
    defaultValues: {
      desc: "",
      latitude: 0,
      longitude: 0,
      radius: 100
     
    }
  });

  const watchedValues = watch();

  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCurrentLocation(location);
          setValue('latitude', location.latitude);
          setValue('longitude', location.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, [setValue]);

  // Client-side validation
  const validateForm = (data: CreateCoordinateFormData): string | null => {
    if (!data.desc.trim()) {
      return "Description is required";
    }
    if (data.desc.length > 200) {
      return "Description must be less than 200 characters";
    }
    if (data.latitude < -90 || data.latitude > 90) {
      return "Latitude must be between -90 and 90";
    }
    if (data.longitude < -180 || data.longitude > 180) {
      return "Longitude must be between -180 and 180";
    }
    if (data.radius < 1 || data.radius > 10000) {
      return "Radius must be between 1 and 10000 meters";
    }
   
    return null;
  };

  const onSubmit = async (data: CreateCoordinateFormData) => {
    if (!currentUser?.id) {
      setError("User not authenticated. Please login again.");
      return;
    }

    // Client-side validation
    const validationError = validateForm(data);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const coordinateData = {
        ...data,
        adminId: currentUser.id
      };

      console.log("Creating coordinate with data:", coordinateData);
      console.log("Current user:", currentUser);
      
      const result = await createCoordinate(coordinateData).unwrap();
      console.log("Coordinate created successfully:", result);

      setSuccess("Attendance coordinate created successfully!");
      
      // Reset form
      reset();
      
      // Redirect to coordinates list after 2 seconds
      setTimeout(() => {
        router.push('/attendance-coordinates');
      }, 2000);

    } catch (err: any) {
      console.error("Error creating coordinate:", err);
      console.error("Error details:", {
        status: err?.status,
        data: err?.data,
        message: err?.message,
        originalStatus: err?.originalStatus,
        error: err?.error
      });
      
      let errorMessage = "Failed to create attendance coordinate";
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.status === 400) {
        errorMessage = "Invalid data provided. Please check your input.";
      } else if (err?.status === 401) {
        errorMessage = "Authentication required. Please login again.";
      } else if (err?.status === 403) {
        errorMessage = "You don't have permission to create coordinates.";
      } else if (err?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setValue('latitude', currentLocation.latitude);
      setValue('longitude', currentLocation.longitude);
    }
  };

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Add Attendance Coordinate" />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl p-8">
         

          {/* Error and Success Messages */}
          {error && (
            <Alert
              variant="error"
              title="Error"
              message={error}
            />
          )}
          {success && (
            <Alert
              variant="success"
              title="Success"
              message={success}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    {...register('desc', { required: true })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Main Office, Branch Office, etc."
                    required
                  />
                </div>

                
              </div>
            </div>

            {/* Location Coordinates */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Location Coordinates
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    {...register('latitude', { valueAsNumber: true, required: true })}
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 40.7128"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    {...register('longitude', { valueAsNumber: true, required: true })}
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., -74.0060"
                    required
                  />
                </div>
              </div>

              {currentLocation && (
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    onClick={useCurrentLocation}
                    variant="outline"
                    size="sm"
                  >
                    Use Current Location
                  </Button>
                  <span className="text-sm text-gray-600">
                    Current: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>

            {/* Radius and Status */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radius (meters) *
                  </label>
                  <input
                    {...register('radius', { valueAsNumber: true, required: true })}
                    type="number"
                    min="1"
                    max="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 100"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Employees must be within this radius to punch in/out
                  </p>
                </div>

                
              </div>
            </div>

           

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                size="md"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => reset()}
                variant="outline"
                size="md"
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Coordinate"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
