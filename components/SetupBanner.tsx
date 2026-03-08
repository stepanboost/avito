"use client";

import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function SetupBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
        <span className="text-amber-600 font-semibold shrink-0">⚙️ Требуется настройка Supabase</span>
        <ol className="text-amber-700 flex flex-wrap gap-x-4 gap-y-1 list-none">
          <li>1. Создайте проект на <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">supabase.com</a></li>
          <li>2. Запустите <code className="bg-amber-100 px-1 rounded">supabase/schema.sql</code> в SQL Editor</li>
          <li>3. Создайте Storage bucket <code className="bg-amber-100 px-1 rounded">listing-photos</code> (public)</li>
          <li>4. Заполните <code className="bg-amber-100 px-1 rounded">.env.local</code> своими ключами</li>
        </ol>
      </div>
    </div>
  );
}
