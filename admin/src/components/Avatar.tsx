import { API_URL } from "@/lib/api";

interface Props {
  name: string;
  url?: string | null;
  size?: number;
}

// Round avatar: the uploaded image, or the first letters of the name
export default function Avatar({ name, url, size = 36 }: Props) {
  const box = { width: size, height: size };
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`${API_URL}${url}`} alt={name} style={box} className="washed flex-none rounded-full object-cover" />;
  }
  return (
    <span
      style={{ ...box, fontSize: size * 0.34 }}
      className="grid flex-none place-items-center rounded-full bg-sage-300 font-bold text-sage-900"
    >
      {name.slice(0, 2).toUpperCase() || "?"}
    </span>
  );
}
