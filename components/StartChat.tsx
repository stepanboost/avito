"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChatWindow from "./ChatWindow";

interface Props {
  listingId: string;
  sellerId: string;
  sellerName: string;
  currentUserId: string | null;
}

export default function StartChat({ listingId, sellerId, sellerName, currentUserId }: Props) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleStartChat() {
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listingId)
      .eq("buyer_id", currentUserId)
      .single();

    if (existing) {
      setConversationId(existing.id);
      setLoading(false);
      return;
    }

    // Create new conversation
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: currentUserId,
        seller_id: sellerId,
      })
      .select()
      .single();

    if (newConv) {
      setConversationId(newConv.id);
    }
    setLoading(false);
  }

  if (conversationId) {
    return (
      <ChatWindow
        conversationId={conversationId}
        currentUserId={currentUserId!}
        otherUserName={sellerName}
      />
    );
  }

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? "Открываем чат..." : "Написать продавцу"}
    </button>
  );
}
