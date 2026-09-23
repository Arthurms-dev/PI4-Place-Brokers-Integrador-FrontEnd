import Link from "next/link";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-medium">Place Brokers</h1>
        <p className="mt-2 text-ink-2">Landing page em construção.</p>
        <Link href="/admin/dashboard" className="mt-6 inline-block text-gold hover:underline">
          Ir para o painel admin
        </Link>
      </div>
    </main>
  );
}