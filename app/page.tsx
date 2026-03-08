import { createClient } from "@/lib/supabase/server";
import ListingCard from "@/components/ListingCard";
import type { ListingWithDetails, Category } from "@/lib/types";
import Link from "next/link";

interface SearchParams {
  category?: string;
  city?: string;
  q?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Build listings query
  let query = supabase
    .from("listings")
    .select("*, categories(*), profiles(id, name, city)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(48);

  if (params.category) {
    const cat = categories?.find((c: Category) => c.slug === params.category);
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  const { data: listings } = await query;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={params.q}
          placeholder="Поиск объявлений..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="city"
          defaultValue={params.city}
          placeholder="Город"
          className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Найти
        </button>
      </form>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link
          href="/"
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
            !params.category
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          Все
        </Link>
        {categories?.map((cat: Category) => (
          <Link
            key={cat.slug}
            href={`/?category=${cat.slug}`}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
              params.category === cat.slug
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Listings grid */}
      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing as ListingWithDetails} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-lg font-medium">Объявлений не найдено</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
          <Link
            href="/listings/new"
            className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Подать первое объявление
          </Link>
        </div>
      )}
    </div>
  );
}
