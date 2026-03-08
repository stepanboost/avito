"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

export default function NewListingPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, [supabase]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    setFiles(selected);
    const urls: string[] = [];
    for (let i = 0; i < Math.min(selected.length, 5); i++) {
      urls.push(URL.createObjectURL(selected[i]));
    }
    setPreviews(urls);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check if user is banned
    const { data: profile } = await supabase
      .from("profiles")
      .select("banned")
      .eq("id", user.id)
      .single();

    if (profile?.banned) {
      setError("Ваш аккаунт заблокирован");
      setLoading(false);
      return;
    }

    // Insert listing first to get ID
    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        price: price ? parseFloat(price) : null,
        category_id: categoryId || null,
        city: city || null,
        photos: [],
        status: "active",
      })
      .select()
      .single();

    if (insertError || !listing) {
      setError("Ошибка при создании объявления");
      setLoading(false);
      return;
    }

    // Upload photos
    const photoUrls: string[] = [];
    if (files) {
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${listing.id}/${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(path, file, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("listing-photos")
            .getPublicUrl(path);
          photoUrls.push(urlData.publicUrl);
        }
      }
    }

    // Update listing with photos
    if (photoUrls.length > 0) {
      await supabase
        .from("listings")
        .update({ photos: photoUrls })
        .eq("id", listing.id);
    }

    router.push(`/listings/${listing.id}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Новое объявление</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Фотографии (до 5 штук)
          </label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-28 cursor-pointer hover:border-blue-400 transition">
            <span className="text-gray-400 text-sm">Нажмите для выбора</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {previews.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {previews.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-200"
                />
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Что продаёте?"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Расскажите подробнее..."
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Цена (₽)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0 — бесплатно"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Категория
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Город
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Москва"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Публикуем..." : "Опубликовать"}
        </button>
      </form>
    </div>
  );
}
