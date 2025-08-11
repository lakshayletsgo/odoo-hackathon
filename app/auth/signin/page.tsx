import EnhancedAuthForm from "@/components/enhanced-auth-form"

export default function SignInPage() {
  return (
    <EnhancedAuthForm 
      mode="signin"
      title="Welcome back"
      description="Sign in to your QuickCourt account"
    />
  )
}
