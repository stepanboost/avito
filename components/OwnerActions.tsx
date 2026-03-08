"use client";

import ConfirmButton from "@/components/ConfirmButton";

export default function OwnerActions({
  listingId,
  status,
}: {
  listingId: string;
  status: string;
}) {
  return (
    <>
      {status === "active" && (
        <form action={`/api/listings/${listingId}/sold`} method="post">
          <button
            type="submit"
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
          >
            Отметить проданным
          </button>
        </form>
      )}
      <ConfirmButton
        action={`/api/listings/${listingId}/delete`}
        label="Удалить"
        confirmText="Удалить объявление?"
        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition"
      />
    </>
  );
}
