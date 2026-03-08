import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import StartChat from "@/components/StartChat";
import OwnerActions from "@/components/OwnerActions";
import type { ListingWithDetails } from "@/lib/types";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch listing
  const { data: listing } = await supabase
    .from("listings")
    .select("*, categories(*), profiles(id, name, city, phone)")
    .eq("id", id)
    .single();

  if (!listing || listing.status === "deleted") notFound();

  // Fetch similar listings (same category, exclude current)
  const { data: similar } = listing.category_id
    ? await supabase
        .from("listings")
        .select("*, categories(*), profiles(id, name, city)")
        .eq("status", "active")
        .eq("category_id", listing.category_id)
        .neq("id", id)
        .limit(4)
    : { data: [] };

  const isOwner = user?.id === listing.user_id;
  const isSelf = user?.id === listing.user_id;

  const price = listing.price
    ? new Intl.NumberFormat("ru-RU").format(listing.price) + " ₽"
    : "Бесплатно";

  const photos: string[] = listing.photos ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Photo gallery */}
        {photos.length > 0 ? (
          <div className="flex gap-1 overflow-x-auto bg-gray-100">
            {photos.map((src, i) => (
              <div key={i} className="relative shrink-0 w-full sm:w-96 aspect-[4/3]">
                <Image
                  src={src}
                  alt={`${listing.title} — фото ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 384px"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 aspect-[4/3] flex items-center justify-center text-gray-300 text-6xl">
            📷
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Title & price */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
            <p className="text-2xl font-bold text-blue-600 mt-1">{price}</p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            {listing.city && (
              <span className="flex items-center gap-1">📍 {listing.city}</span>
            )}
            {listing.categories && (
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                {listing.categories.name}
              </span>
            )}
            <span className="text-xs">
              {new Date(listing.created_at).toLocaleDateString("ru-RU")}
            </span>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="font-semibold text-sm text-gray-700 mb-1">Описание</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {/* Seller info */}
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Продавец</p>
            <p className="font-medium text-sm">{listing.profiles?.name ?? "Аноним"}</p>
            {listing.profiles?.city && (
              <p className="text-xs text-gray-400">{listing.profiles.city}</p>
            )}
          </div>

          {/* Actions */}
          {isOwner ? (
            <div className="flex gap-2">
              <OwnerActions listingId={id} status={listing.status} />
            </div>
          ) : (
            <StartChat
              listingId={id}
              sellerId={listing.user_id}
              sellerName={listing.profiles?.name ?? "Продавец"}
              currentUserId={user?.id ?? null}
            />
          )}
        </div>
      </div>

      {/* Similar listings */}
      {similar && similar.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-800 mb-3">Похожие объявления</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similar.map((item) => (
              <ListingCard key={item.id} listing={item as ListingWithDetails} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
