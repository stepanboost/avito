import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ConfirmButton from "@/components/ConfirmButton";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") redirect("/");

  // Fetch all listings (active + sold + deleted)
  const { data: listings } = await supabase
    .from("listings")
    .select("*, categories(*), profiles(id, name)")
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch all users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const totalActive = listings?.filter((l) => l.status === "active").length ?? 0;
  const totalUsers = profiles?.length ?? 0;
  const bannedUsers = profiles?.filter((p) => p.banned).length ?? 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Панель администратора</h1>
        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
          ADMIN
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalActive}</p>
          <p className="text-xs text-gray-500 mt-1">Активных объявлений</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalUsers}</p>
          <p className="text-xs text-gray-500 mt-1">Пользователей</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{bannedUsers}</p>
          <p className="text-xs text-gray-500 mt-1">Заблокированных</p>
        </div>
      </div>

      {/* Listings table */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">Объявления</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Объявление</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Продавец</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Дата</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings?.map((listing) => {
                  const cover = listing.photos?.[0];
                  return (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {cover ? (
                              <Image src={cover} alt="" fill className="object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-300">📷</div>
                            )}
                          </div>
                          <Link
                            href={`/listings/${listing.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1 max-w-[200px]"
                          >
                            {listing.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {listing.profiles?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            listing.status === "active"
                              ? "bg-green-100 text-green-700"
                              : listing.status === "sold"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {listing.status === "active" ? "Активно"
                            : listing.status === "sold" ? "Продано"
                            : "Удалено"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(listing.created_at).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-4 py-3">
                        {listing.status !== "deleted" && (
                          <ConfirmButton
                            action={`/api/listings/${listing.id}/delete`}
                            label="Удалить"
                            confirmText="Удалить объявление?"
                            className="text-xs text-red-500 hover:text-red-700 transition"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">Пользователи</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Имя</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Город</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Роль</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Статус</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{profile.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{profile.id.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{profile.city ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          profile.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          profile.banned
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {profile.banned ? "Заблокирован" : "Активен"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {profile.id !== user.id && profile.role !== "admin" && (
                        <form
                          action={`/api/admin/users/${profile.id}/ban`}
                          method="post"
                        >
                          <button
                            type="submit"
                            className={`text-xs transition ${
                              profile.banned
                                ? "text-green-600 hover:text-green-800"
                                : "text-red-500 hover:text-red-700"
                            }`}
                          >
                            {profile.banned ? "Разблокировать" : "Заблокировать"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
