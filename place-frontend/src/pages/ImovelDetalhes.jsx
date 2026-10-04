import { useParams, Link } from "react-router-dom";
import { MOCK_PROPERTIES } from "../data/imoveis";

export default function ImovelDetalhes() {
  const { id } = useParams();
  const imovel = MOCK_PROPERTIES.find((item) => item.id === Number(id));

  if (!imovel) {
    return (
      <div className="min-h-screen bg-[#0b132b] text-white p-10 text-center flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Imóvel não encontrado!</h2>
        <Link to="/" className="text-blue-400 hover:underline">
          Voltar para o início
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b132b] text-white p-6 max-w-4xl mx-auto font-sans">
      <Link to="/" className="text-blue-400 hover:underline mb-6 inline-block font-medium">
        ← Voltar para o início
      </Link>

      <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/50 p-6">
        <img
          src={imovel.image}
          alt={imovel.title}
          className="w-full h-80 object-cover rounded-lg mb-6"
        />
        
        <span className="text-xs font-semibold px-3 py-1 bg-blue-900/60 text-blue-300 rounded-md">
          {imovel.type}
        </span>

        <h1 className="text-3xl font-bold mt-3 mb-1 text-white">{imovel.title}</h1>
        <p className="text-slate-400 text-lg mb-6">{imovel.city}</p>

        <div className="bg-slate-900/60 p-4 rounded-lg flex justify-between items-center mb-6 border border-slate-700/50">
          <span className="text-slate-300 font-medium">
            {imovel.bedrooms} quartos • {imovel.area}
          </span>
          <span className="text-2xl font-bold text-green-400">{imovel.price}</span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">Descrição</h3>
        <p className="text-slate-300 leading-relaxed">{imovel.description}</p>
      </div>
    </div>
  );
}