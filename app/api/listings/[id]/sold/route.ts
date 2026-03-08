import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/auth/login", "http://localhost"));

  await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.redirect(new URL(`/listings/${id}`, "http://localhost"), { status: 303 });
}
