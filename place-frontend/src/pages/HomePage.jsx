import { useEffect, useState } from "react";
import { registrarEvento } from "@/services/eventos";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
// Logo da Empresa
import logoImg from "../assets/logo.png";
import { MOCK_PROPERTIES } from "../data/imoveis";

export default function HomePage() {
  usePageTitle("Início");
  useEffect(() => { registrarEvento({ tipo: "visualizacao_site" }); }, []);
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
        <img 
          src={logoImg} 
          alt="Place Brokers" 
          className="h-16 w-auto mx-auto mb-4 object-contain" 
        />
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

      <main className="flex-1 px-6 max-w-6xl mx-auto w-full my-8">
        <h2 className="text-xl font-semibold mb-6 border-b border-slate-800 pb-2 text-slate-200">
          {searched ? "Resultados da Busca" : "Imóveis em Destaque"}
        </h2>

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-900/60 text-blue-300 rounded-md">
                      {item.type}
                    </span>
                    <h3 className="text-lg font-bold mt-2 mb-1 text-white">{item.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{item.city}</p>
                    
                    <div className="border-t border-slate-700/50 pt-3 mt-2 flex justify-between items-center">
                      <span className="text-sm text-slate-300">{item.bedrooms} quartos • {item.area}</span>
                      <span className="text-lg font-bold text-green-400">{item.price}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    to={`/imoveis/${item.id}`}
                    className="block w-full text-center py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p>Nenhum imóvel encontrado. Tente pesquisar por outro termo.</p>
          </div>
        )}

        <section className="mt-16 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-1 uppercase tracking-wide border-b border-blue-500/30 pb-2 inline-block">
                Atendimento
              </h2>

              <div className="mt-4 space-y-4 text-slate-300">
                <div>
                  <h3 className="text-sm font-semibold text-white">Fale conosco</h3>
                  <p className="text-xs text-slate-400">Envie sua dúvida, sugestão ou solicitação:</p>
                  <a href="mailto:suporte@placebrokers.com.br" className="text-sm text-blue-400 hover:underline">
                    suporte@placebrokers.com.br
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">Teleatendimento / WhatsApp</h3>
                  <p className="text-sm text-slate-300">(81) 98888-8888</p>
                  <span className="text-xs text-slate-400">(08h às 18h)</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">Horário de Funcionamento</h3>
                  <p className="text-xs text-slate-400">Segunda a Sexta-feira: 08h às 18h</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-slate-700/50 pt-6 md:pt-0 md:pl-8">
              <p className="text-sm font-medium text-slate-300 mb-4">Siga nossas redes sociais:</p>
              
              <div className="flex gap-4">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="Instagram"
                  className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 hover:text-white transition-all hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="TikTok"
                  className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 hover:text-white transition-all hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.32 1.56-1.28 2.56.02.93.53 1.82 1.32 2.3 1.03.65 2.4.63 3.39-.06.81-.55 1.28-1.52 1.27-2.52.01-4.78 0-9.56.01-14.34z"/>
                  </svg>
                </a>

                <a 
                  href="mailto:suporte@placebrokers.com.br" 
                  aria-label="E-mail de Suporte"
                  className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 hover:text-white transition-all hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>© 2026 Place Brokers. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}