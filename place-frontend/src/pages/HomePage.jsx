import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";

// Mock data de imóveis para demonstração no front
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
      {/* Topo / Hero */}
      <header className="px-6 pt-10 pb-6 max-w-5xl mx-auto text-center w-full">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Place Brokers
        </h1>
        <p className="mt-2 text-slate-300">
          Encontre os melhores imóveis e conecte-se aos melhores corretores.
        </p>

        {/* Link original para Login preservado */}
        <div className="mt-4">
          <Link to="/login" className="text-gold hover:underline text-sm font-medium">
            Acesso restrito (administrador ou corretor)
          </Link>
        </div>

        {/* Formulário de Busca */}
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

      {/* Resultados de Imóveis */}
      <main className="flex-1 px-6 max-w-6xl mx-auto w-full my-8">
        <h2 className="text-xl font-semibold mb-6 border-b border-slate-800 pb-2 text-slate-200">
          {searched ? "Resultados da Busca" : "Imóveis em Destaque"}
        </h2>

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-500 transition-all flex flex-col"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-900/60 text-blue-300 rounded-md">
                      {item.type}
                    </span>
                    <h3 className="text-lg font-bold mt-2 mb-1 text-white">{item.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{item.city}</p>
                  </div>
                  <div className="border-t border-slate-700/50 pt-3 mt-2 flex justify-between items-center">
                    <span className="text-sm text-slate-300">
                      {item.bedrooms} quartos • {item.area}
                    </span>
                    <span className="text-lg font-bold text-green-400">
                      {item.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p>Nenhum imóvel encontrado. Tente pesquisar por outro termo.</p>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>© 2026 Place Brokers. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}