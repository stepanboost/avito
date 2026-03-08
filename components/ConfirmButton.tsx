"use client";

interface ConfirmButtonProps {
  action: string;
  label: string;
  confirmText?: string;
  className?: string;
}

export default function ConfirmButton({
  action,
  label,
  confirmText = "Вы уверены?",
  className,
}: ConfirmButtonProps) {
  return (
    <form action={action} method="post">
      <button
        type="submit"
        className={className}
        onClick={(e) => {
          if (!confirm(confirmText)) e.preventDefault();
        }}
      >
        {label}
      </button>
    </form>
  );
}
