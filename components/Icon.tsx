import { BookOpen, Landmark, ReceiptText, BarChart3, FileText, TrendingUp, type LucideProps } from "lucide-react";
const map = { BookOpen, Landmark, ReceiptText, BarChart3, FileText, TrendingUp };
export default function Icon({ name, ...p }: { name: string } & LucideProps) {
  const C = map[name as keyof typeof map] ?? BookOpen;
  return <C {...p} />;
}
