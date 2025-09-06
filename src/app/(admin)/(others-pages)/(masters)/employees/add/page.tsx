"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ReusableForm } from "@/components/form/ReusableForm";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useCreateUserMutation } from "@/store/userApiSlice";
import { asyncThunkCreator } from "@reduxjs/toolkit";

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
    const { register, handleSubmit, reset } = useForm<Employees>({
        defaultValues: {
            workingHours: {
                punchin: { from: "", to: "" },
                punchout: { from: "", to: "" }
            }
        }
    });

    const [createUser, {isLoading: isUserCreating}] = useCreateUserMutation(); 

    const onSubmit = async (data: Employees) => {
        console.log("Employee data:", data);
        const userData = {
            email: data.email,
            password: data.password,
            designation: data.designation,
            workingHours: data.workingHours
        }
        const responce = await createUser(userData);
        console.log("Responce:", responce);
    };

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Add Employee" />
            <div className="max-w-6xl mx-auto">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full space-y-6 p-6 bg-white shadow-lg rounded-2xl"
                >
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter Email"
                                onChange={register("email", { required: true }).onChange}
                                onBlur={register("email", { required: true }).onBlur}
                                name={register("email", { required: true }).name}
                                ref={register("email", { required: true }).ref}
                            />
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter Password"
                                onChange={register("password", { required: true }).onChange}
                                onBlur={register("password", { required: true }).onBlur}
                                name={register("password", { required: true }).name}
                                ref={register("password", { required: true }).ref}
                            />
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input
                                id="designation"
                                type="text"
                                placeholder="Enter Designation"
                                onChange={register("designation", { required: true }).onChange}
                                onBlur={register("designation", { required: true }).onBlur}
                                name={register("designation", { required: true }).name}
                                ref={register("designation", { required: true }).ref}
                            />
                        </div>
                    </div>

                    {/* Working Hours Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Working Hours</h3>
                        
                        {/* Punch In Times */}
                        <div className="space-y-2">
                            <h4 className="text-md font-medium text-gray-700">Punch In Times</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="punchin-from">From</Label>
                                    <Input
                                        id="punchin-from"
                                        type="time"
                                        placeholder="HH:MM"
                                        onChange={register("workingHours.punchin.from", { required: true }).onChange}
                                        onBlur={register("workingHours.punchin.from", { required: true }).onBlur}
                                        name={register("workingHours.punchin.from", { required: true }).name}
                                        ref={register("workingHours.punchin.from", { required: true }).ref}
                                    />
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="punchin-to">To</Label>
                                    <Input
                                        id="punchin-to"
                                        type="time"
                                        placeholder="HH:MM"
                                        onChange={register("workingHours.punchin.to", { required: true }).onChange}
                                        onBlur={register("workingHours.punchin.to", { required: true }).onBlur}
                                        name={register("workingHours.punchin.to", { required: true }).name}
                                        ref={register("workingHours.punchin.to", { required: true }).ref}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Punch Out Times */}
                        <div className="space-y-2">
                            <h4 className="text-md font-medium text-gray-700">Punch Out Times</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="punchout-from">From</Label>
                                    <Input
                                        id="punchout-from"
                                        type="time"
                                        placeholder="HH:MM"
                                        onChange={register("workingHours.punchout.from", { required: true }).onChange}
                                        onBlur={register("workingHours.punchout.from", { required: true }).onBlur}
                                        name={register("workingHours.punchout.from", { required: true }).name}
                                        ref={register("workingHours.punchout.from", { required: true }).ref}
                                    />
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="punchout-to">To</Label>
                                    <Input
                                        id="punchout-to"
                                        type="time"
                                        placeholder="HH:MM"
                                        onChange={register("workingHours.punchout.to", { required: true }).onChange}
                                        onBlur={register("workingHours.punchout.to", { required: true }).onBlur}
                                        name={register("workingHours.punchout.to", { required: true }).name}
                                        ref={register("workingHours.punchout.to", { required: true }).ref}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="w-1/4 flex gap-4 pt-4">
                        <Button type="submit" className="flex-1" variant="primary" size="sm"
                        disabled={isUserCreating}>
                            {isUserCreating ? "Adding..." : "Add Employee"}
                        </Button>
                        <Button type="button" className="flex-1" variant="outline" onClick={() => reset()} size="sm">
                            Clear
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
