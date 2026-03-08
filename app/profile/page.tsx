import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { ListingWithDetails, ConversationWithDetails } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // My listings
  const { data: myListings } = await supabase
    .from("listings")
    .select("*, categories(*), profiles(id, name, city)")
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  // My conversations (as buyer or seller)
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      listings(id, title, photos),
      buyer:profiles!conversations_buyer_id_fkey(id, name),
      seller:profiles!conversations_seller_id_fkey(id, name)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const activeCount = myListings?.filter((l) => l.status === "active").length ?? 0;
  const soldCount = myListings?.filter((l) => l.status === "sold").length ?? 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
          {profile?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">{profile?.name ?? "Без имени"}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          {profile?.city && (
            <p className="text-xs text-gray-400">📍 {profile.city}</p>
          )}
        </div>
        <div className="text-right text-sm">
          <p className="text-gray-500">
            Активных: <span className="font-semibold text-green-600">{activeCount}</span>
          </p>
          <p className="text-gray-500">
            Продано: <span className="font-semibold text-gray-600">{soldCount}</span>
          </p>
        </div>
      </div>

      {/* My listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Мои объявления</h2>
          <Link
            href="/listings/new"
            className="text-sm text-blue-600 hover:underline"
          >
            + Добавить
          </Link>
        </div>

        {myListings && myListings.length > 0 ? (
          <div className="space-y-2">
            {myListings.map((listing) => {
              const cover = listing.photos?.[0];
              const price = listing.price
                ? new Intl.NumberFormat("ru-RU").format(listing.price) + " ₽"
                : "Бесплатно";
              return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="flex gap-3 bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {cover ? (
                      <Image src={cover} alt="" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xl">📷</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{listing.title}</p>
                    <p className="text-blue-600 text-sm font-semibold">{price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          listing.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {listing.status === "active" ? "Активно" : "Продано"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(listing.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200 text-gray-400">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm">У вас пока нет объявлений</p>
            <Link
              href="/listings/new"
              className="inline-block mt-3 text-sm text-blue-600 hover:underline"
            >
              Создать первое
            </Link>
          </div>
        )}
      </div>

      {/* My conversations */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">Мои диалоги</h2>

        {conversations && conversations.length > 0 ? (
          <div className="space-y-2">
            {(conversations as ConversationWithDetails[]).map((conv) => {
              const isbuyer = conv.buyer_id === user.id;
              const otherUser = isbuyer ? conv.seller : conv.buyer;
              const cover = (conv.listings as { photos?: string[] } | null)?.photos?.[0];
              return (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  otherUserName={otherUser?.name ?? "Аноним"}
                  cover={cover}
                  currentUserId={user.id}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200 text-gray-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">Диалогов пока нет</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationItem({
  conv,
  otherUserName,
  cover,
  currentUserId,
}: {
  conv: ConversationWithDetails;
  otherUserName: string;
  cover?: string;
  currentUserId: string;
}) {
  const listingTitle = (conv.listings as { title?: string } | null)?.title ?? "Объявление удалено";
  const listingId = conv.listing_id;

  return (
    <Link
      href={`/listings/${listingId}#chat`}
      className="flex gap-3 bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition"
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {cover ? (
          <Image src={cover} alt="" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">📷</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">{otherUserName}</p>
        <p className="text-xs text-gray-400 truncate">{listingTitle}</p>
      </div>
      <span className="text-xs text-gray-300 shrink-0 self-start mt-1">
        {new Date(conv.created_at).toLocaleDateString("ru-RU")}
      </span>
    </Link>
  );
}
