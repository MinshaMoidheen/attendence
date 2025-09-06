"use client";

import { useForm, SubmitHandler, FieldValues, Path, DefaultValues } from "react-hook-form";
import Input from "./input/InputField";
import Button from "../ui/button/Button";
import Label from "./Label";

type FieldConfig = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

interface ReusableFormProps<T extends FieldValues> {
  fields: FieldConfig[];
  onSubmit: SubmitHandler<T>;
  defaultValues?: DefaultValues<T>;
  submitText?: string;
  className?: string;
}

export function ReusableForm<T extends FieldValues>({
  fields,
  onSubmit,
  defaultValues,
  submitText = "Submit",
  className = "",
}: ReusableFormProps<T>) {
  const { register, handleSubmit, reset } = useForm<T>({ defaultValues });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`w-full space-y-6 p-6 bg-white shadow-lg rounded-2xl ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {fields.map((field) => {
          const registration = register(field.name as Path<T>, {
            required: field.required,
          });
          
          return (
            <div key={field.name} className="flex flex-col space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                onChange={registration.onChange}
                onBlur={registration.onBlur}
                name={registration.name}
                ref={registration.ref}
              />
            </div>
          );
        })}
      </div>
      <div className="w-1/4 flex gap-4 pt-4">
        <Button type="submit" className="flex-1" variant="primary" size="sm">
          {submitText}
        </Button>
        <Button type="button" className="flex-1" variant="outline" onClick={() => reset()} size="sm">
          Clear
        </Button>
      </div>
    </form>
  );
}