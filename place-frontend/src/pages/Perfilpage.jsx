import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { authService } from "@/services/authService";
import { atualizarPerfil } from "@/services/session";

export default function PerfilPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [nome, setNome] = useState(user.name);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagem("");
    setErro("");
    try {
      await atualizarPerfil({ nome });
      setMensagem("Perfil atualizado.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  function sair() {
    authService.logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="mx-auto max-w-md space-y-4.5">
      <header>
        <h1 className="text-[28px] font-semibold">Meu perfil</h1>
        <p className="mt-1.5 text-[13px] text-ink-2">{user.role}</p>
      </header>

      <form onSubmit={salvar} className="flex flex-col gap-4 rounded-xl border border-line bg-card p-4">
        <label className="block text-xs text-ink-2">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-line bg-card-2 px-3.5 text-sm text-ink outline-none focus:border-gold"
          />
        </label>

        <label className="block text-xs text-ink-2">
          E-mail
          <input
            value={user.email ?? ""}
            disabled
            className="mt-1.5 h-10 w-full rounded-lg border border-line bg-card-2 px-3.5 text-sm text-ink-3"
          />
        </label>

        {mensagem && <p className="text-xs text-ok">{mensagem}</p>}
        {erro && <p className="text-xs text-danger">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-gold-gradient py-3 text-[13px] font-medium text-[#1a1408] disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <button
        type="button"
        onClick={sair}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-danger/40 py-3 text-[13px] font-medium text-danger hover:bg-danger/10"
      >
        <Icon name="arrowRight" className="size-4" /> Sair da conta
      </button>
    </div>
  );
}