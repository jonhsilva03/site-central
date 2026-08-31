import { redirect } from "next/navigation";
import { AdminShell } from "./admin-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const { data: permitido, error: erroPermissao } = await supabase.rpc(
    "is_admin",
  );

  if (erroPermissao || !permitido) {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "Administrador";

  return <AdminShell email={email}>{children}</AdminShell>;
}
