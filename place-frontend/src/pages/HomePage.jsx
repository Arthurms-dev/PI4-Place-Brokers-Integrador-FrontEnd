import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function HomePage() {
  usePageTitle("");
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-medium">Place Brokers</h1>
        <p className="mt-2 text-ink-2">Landing page em construção.</p>
        <Link to="/login" className="mt-6 inline-block text-gold hover:underline">
          Acesso restrito (administrador ou corretor)
        </Link>
      </div>
    </main>
  );
}