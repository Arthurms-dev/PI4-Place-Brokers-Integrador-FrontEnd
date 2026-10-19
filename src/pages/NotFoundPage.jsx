import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Página não encontrada");
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-medium">Página não encontrada</h1>
        <p className="mt-2 text-ink-2">O endereço acessado não existe.</p>
        <Link to="/" className="mt-6 inline-block text-gold hover:underline">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}