"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useCreateUserMutation } from "@/store/userApiSlice";
import { useState, useEffect } from "react";
import Alert from "@/components/ui/alert/Alert";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/authentication";
import { useRouter } from "next/navigation";

interface Employees {
    email: string;
    password: string;
    designation: string;
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
}

export default function AddEmployee() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Employees>({
        defaultValues: {
            workingHours: {
                punchin: { from: "", to: "" },
                punchout: { from: "", to: "" }
            }
        }
    });


    const [createUser, {isLoading: isUserCreating}] = useCreateUserMutation();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const currentUser = useSelector(selectUser);
    const router = useRouter();

    console.log("current ser",currentUser)

    // Check if user is authenticated
    useEffect(() => {
        if (!currentUser?.id) {
            setError("User not authenticated. Please login again.");
        }
    }, [currentUser]);

    const onSubmit = async (data: Employees) => {
        setError("");
        setSuccess("");
        
        // Check if current user is available
        if (!currentUser?.id) {
            setError("User not authenticated. Please login again.");
            return;
        }
        
        console.log("Employee data:", data);
        console.log("Current user:", currentUser);
        
        // Validate time formats
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(data.workingHours.punchin.from) || 
            !timeRegex.test(data.workingHours.punchin.to) ||
            !timeRegex.test(data.workingHours.punchout.from) || 
            !timeRegex.test(data.workingHours.punchout.to)) {
            setError("Please enter valid time format (HH:MM)");
            return;
        }

        // Validate time ranges
        if (data.workingHours.punchin.from >= data.workingHours.punchin.to) {
            setError("Punch in 'From' time must be before 'To' time");
            return;
        }

        if (data.workingHours.punchout.from >= data.workingHours.punchout.to) {
            setError("Punch out 'From' time must be before 'To' time");
            return;
        }

        const userData = {
            email: data.email,
            password: data.password,
            designation: data.designation,
            refAdmin: currentUser.id, // Use current user's ID as refAdmin
            workingHours: data.workingHours
        };

        try {
            const response = await createUser(userData);
            console.log("Response:", response);

           
      reset();
      
      // Redirect to coordinates list after 2 seconds
      setTimeout(() => {
        router.push('/employees');
      }, 2000);
            
            if ('data' in response && response.data) {
                setSuccess("Employee created successfully!");
                reset();
            } else if ('error' in response) {
                const errorData = response.error as any;
                setError(errorData?.data?.message || "Failed to create employee");
            }
        } catch (err: any) {
            console.error("Error creating employee:", err);
            setError(err?.message || "An error occurred while creating employee");
        }
    };

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Add Employee" />
            <div className="max-w-6xl mx-auto">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full space-y-6 p-6 bg-white shadow-lg rounded-2xl"
                >
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

                    {/* Admin Info */}
                    {currentUser?.id && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Admin:</strong> {currentUser.name} ({currentUser.email})
                                <br />
                                <span className="text-xs text-blue-600">
                                    This employee will be assigned to you as the admin.
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter Email"
                                {...register("email", { 
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email format"
                                    }
                                })}
                            />
                            {errors.email && (
                                <span className="text-red-500 text-sm">{errors.email.message}</span>
                            )}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter Password"
                                {...register("password", { 
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters"
                                    }
                                })}
                            />
                            {errors.password && (
                                <span className="text-red-500 text-sm">{errors.password.message}</span>
                            )}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="designation">Designation <span className="text-red-500">*</span></Label>
                            <Input
                                id="designation"
                                type="text"
                                placeholder="Enter Designation"
                                {...register("designation", { 
                                    required: "Designation is required",
                                    maxLength: {
                                        value: 50,
                                        message: "Designation must be less than 50 characters"
                                    }
                                })}
                            />
                            {errors.designation && (
                                <span className="text-red-500 text-sm">{errors.designation.message}</span>
                            )}
                        </div>

                        
                    </div>

                    {/* Working Hours Section */}
                    <div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
    Working Hours
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Punch In */}
    <div className="space-y-2">
      <h4 className="text-md font-medium text-gray-700">
        Punch In Times <span className="text-red-500">*</span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="punchin-from">From</Label>
          <Input
            id="punchin-from"
            type="time"
            placeholder="HH:MM"
            {...register("workingHours.punchin.from", {
              required: "Punch in from time is required",
              pattern: {
                value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: "Invalid time format (HH:MM)",
              },
            })}
          />
          {errors.workingHours?.punchin?.from && (
            <span className="text-red-500 text-sm">
              {errors.workingHours.punchin.from.message}
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="punchin-to">To</Label>
          <Input
            id="punchin-to"
            type="time"
            placeholder="HH:MM"
            {...register("workingHours.punchin.to", {
              required: "Punch in to time is required",
              pattern: {
                value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: "Invalid time format (HH:MM)",
              },
            })}
          />
          {errors.workingHours?.punchin?.to && (
            <span className="text-red-500 text-sm">
              {errors.workingHours.punchin.to.message}
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Punch Out */}
    <div className="space-y-2">
      <h4 className="text-md font-medium text-gray-700">
        Punch Out Times <span className="text-red-500">*</span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="punchout-from">From</Label>
          <Input
            id="punchout-from"
            type="time"
            placeholder="HH:MM"
            {...register("workingHours.punchout.from", {
              required: "Punch out from time is required",
              pattern: {
                value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: "Invalid time format (HH:MM)",
              },
            })}
          />
          {errors.workingHours?.punchout?.from && (
            <span className="text-red-500 text-sm">
              {errors.workingHours.punchout.from.message}
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="punchout-to">To</Label>
          <Input
            id="punchout-to"
            type="time"
            placeholder="HH:MM"
            {...register("workingHours.punchout.to", {
              required: "Punch out to time is required",
              pattern: {
                value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: "Invalid time format (HH:MM)",
              },
            })}
          />
          {errors.workingHours?.punchout?.to && (
            <span className="text-red-500 text-sm">
              {errors.workingHours.punchout.to.message}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
</div>


                    {/* Form Buttons */}
                    <div className="w-1/4 flex gap-4 pt-4">
                        <Button 
                            type="submit" 
                            className="flex-1" 
                            variant="primary" 
                            size="sm"
                            disabled={isUserCreating || !currentUser?.id}
                        >
                            {isUserCreating ? "Adding..." : "Add Employee"}
                        </Button>
                        <Button 
                            type="button" 
                            className="flex-1" 
                            variant="outline" 
                            onClick={() => reset()} 
                            size="sm"
                            disabled={!currentUser?.id}
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
