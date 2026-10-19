import { usePageTitle } from "@/hooks/usePageTitle";

export default function ComingSoonPage() {
  usePageTitle("Em construção");
  return (
    <div className="grid flex-1 place-items-center py-20 text-center">
      <div>
        <h1 className="text-xl font-medium">Em construção</h1>
        <p className="mt-2 text-sm text-ink-2">Esta tela ainda será desenvolvida.</p>
      </div>
    </div>
  );
}