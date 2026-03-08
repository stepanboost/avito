interface Props {
  name: string;
}

const colors: Record<string, string> = {
  transport: "bg-blue-100 text-blue-700",
  electronics: "bg-purple-100 text-purple-700",
  clothing: "bg-pink-100 text-pink-700",
  realty: "bg-green-100 text-green-700",
  jobs: "bg-yellow-100 text-yellow-700",
  services: "bg-orange-100 text-orange-700",
  home: "bg-teal-100 text-teal-700",
  other: "bg-gray-100 text-gray-600",
};

export default function CategoryBadge({ name }: Props) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.other}`}>
      {name}
    </span>
  );
}
