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

  // Check admin role
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url), { status: 303 });
  }

  // Toggle ban status
  const { data: target } = await supabase
    .from("profiles")
    .select("banned")
    .eq("id", id)
    .single();

  await supabase
    .from("profiles")
    .update({ banned: !target?.banned })
    .eq("id", id);

  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}
