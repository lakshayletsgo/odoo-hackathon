"use client";

import EnhancedAuthForm from "@/components/enhanced-auth-form";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/signInImage.jpg"
          alt="QuickCourt Sign In"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-8 left-8 text-white">
          
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <EnhancedAuthForm
            mode="signin"
            title="Welcome back"
            description="Sign in to your QuickCourt account"
          />
        </div>
      </div>
    </div>
  );
}
