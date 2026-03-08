import Link from "next/link";
import Image from "next/image";
import type { ListingWithDetails } from "@/lib/types";

interface Props {
  listing: ListingWithDetails;
}

export default function ListingCard({ listing }: Props) {
  const cover = listing.photos?.[0];
  const price = listing.price
    ? new Intl.NumberFormat("ru-RU").format(listing.price) + " ₽"
    : "Цена не указана";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">
            📷
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">
          {listing.title}
        </p>
        <p className="text-blue-600 font-bold text-sm">{price}</p>
        <div className="mt-auto pt-1 flex items-center justify-between text-xs text-gray-400">
          <span className="truncate">{listing.city ?? "Город не указан"}</span>
          {listing.categories && (
            <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs shrink-0 ml-1">
              {listing.categories.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
