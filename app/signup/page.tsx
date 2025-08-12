import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
      {/* Signup Form Container */}
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Join our sports booking platform
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
