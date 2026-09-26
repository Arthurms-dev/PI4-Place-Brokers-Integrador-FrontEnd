import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";

const MOCK_PROPERTIES = [
  {
    id: 1,
    title: "Apartamento de Luxo em Boa Viagem",
    type: "Apartamento",
    city: "Recife",
    price: "R$ 750.000",
    bedrooms: 3,
    area: "110 m²",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    title: "Casa em Condomínio Fechado",
    type: "Casa",
    city: "Jaboatão dos Guararapes",
    price: "R$ 1.200.000",
    bedrooms: 4,
    area: "280 m²",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    title: "Flat Moderno Próximo ao Mar",
    type: "Flat",
    city: "Recife",
    price: "R$ 380.000",
    bedrooms: 1,
    area: "45 m²",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
  },
];

export default function HomePage() {
  usePageTitle("Início");

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProperties, setFilteredProperties] = useState(MOCK_PROPERTIES);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e?.preventDefault();
    setSearched(true);

    if (!searchTerm.trim()) {
      setFilteredProperties(MOCK_PROPERTIES);
      return;
    }

    const results = MOCK_PROPERTIES.filter(
      (property) =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProperties(results);
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-white flex flex-col justify-between font-sans">
      <header className="px-6 pt-10 pb-6 max-w-5xl mx-auto text-center w-full">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Place Brokers
        </h1>
        <p className="mt-2 text-slate-300">
          Encontre os melhores imóveis e conecte-se aos melhores corretores.
        </p>

        <div className="mt-4">
          <Link to="/login" className="text-gold hover:underline text-sm font-medium">
            Acesso restrito (administrador ou corretor)
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mt-8">
          <input
            type="text"
            id="propertySearch"
            placeholder="Digite a cidade, bairro ou tipo de imóvel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Buscar imóvel
          </button>
        </form>
      </header>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>© 2026 Place Brokers. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}