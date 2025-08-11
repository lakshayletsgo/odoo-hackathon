import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin?redirectUrl=/admin");
  }

  if ((session.user as any)?.role !== "ADMIN" || (session.user as any)?.isBanned) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
