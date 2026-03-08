import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));

  // Check if admin or owner
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  let query = supabase.from("listings").update({ status: "deleted" }).eq("id", id);
  if (!isAdmin) query = query.eq("user_id", user.id);

  await query;

  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
