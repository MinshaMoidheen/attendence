import SignInForm from "@/components/auth/SignInForm";
import AuthRedirect from "@/components/auth/AuthRedirect";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - TailAdmin Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

export default function SignIn() {
  return (
    <AuthRedirect>
      <SignInForm />
    </AuthRedirect>
  );
}