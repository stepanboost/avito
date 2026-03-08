"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-blue-600 shrink-0">
          Барахолка
        </Link>

        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/listings/new"
            className="hidden sm:flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
          >
            + Подать объявление
          </Link>

          {user ? (
            <>
              <Link
                href="/profile"
                className="px-3 py-1.5 text-gray-700 hover:text-blue-600 transition"
              >
                Кабинет
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-gray-500 hover:text-red-500 transition"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-3 py-1.5 text-gray-700 hover:text-blue-600 transition"
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
