import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { FormField } from "@/components/auth/FormField";
import PasswordField from "@/components/auth/PasswordField";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AUTH_CHANGE_EVENT } from "@/lib/authToken";
import { authService } from "@/services/authService";
import { alterarSenha } from "@/services/session";

const VAZIO = { senhaAtual: "", novaSenha: "", confirmarSenha: "" };

/** Primeiro login de um acesso criado pelo admin: só segue depois de trocar a senha temporária. */
export default function TrocaSenhaObrigatoria({ user }) {
  usePageTitle("Crie sua senha");
  const navigate = useNavigate();
  const [form, setForm] = useState(VAZIO);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [salvando, setSalvando] = useState(false);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function salvar(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSalvando(true);
    try {
      await alterarSenha(form);
      setForm(VAZIO);
      // Busca o usuário de novo: sem a marca de senha temporária, o painel abre.
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch (err) {
      setFieldErrors(err?.fieldErrors ?? {});
      if (!Object.keys(err?.fieldErrors ?? {}).length) setFormError(err?.message ?? "Não foi possível salvar agora. Tente de novo.");
      setSalvando(false);
    }
  }

  function sair() {
    authService.logout();
    navigate("/login", { replace: true });
  }

  const primeiroNome = (user?.name ?? "").trim().split(/\s+/)[0];

  return (
    <div className="pb-auth grid min-h-screen place-items-center px-4 py-12 sm:px-6">
      <main className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="h-10" />
        </div>
        <Card>
          <h1 className="mb-1 text-xl font-medium">{primeiroNome ? `Bem-vindo(a), ${primeiroNome}` : "Crie sua senha"}</h1>
          <p className="mb-6 text-sm leading-relaxed text-ink-2">
            Você entrou com a senha temporária que o administrador passou. Antes de continuar, crie a sua senha (pelo menos 8 caracteres).
          </p>

          <form onSubmit={salvar} noValidate className="flex flex-col gap-4">
            <FormField label="Senha temporária" error={fieldErrors.senhaAtual}>
              <PasswordField autoComplete="current-password" autoFocus value={form.senhaAtual} onChange={mudar("senhaAtual")} error={fieldErrors.senhaAtual} />
            </FormField>
            <FormField label="Nova senha" error={fieldErrors.novaSenha}>
              <PasswordField autoComplete="new-password" value={form.novaSenha} onChange={mudar("novaSenha")} error={fieldErrors.novaSenha} />
            </FormField>
            <FormField label="Confirmar nova senha" error={fieldErrors.confirmarSenha}>
              <PasswordField autoComplete="new-password" value={form.confirmarSenha} onChange={mudar("confirmarSenha")} error={fieldErrors.confirmarSenha} />
            </FormField>

            {formError && <p role="alert" className="text-xs text-danger">{formError}</p>}

            <Button type="submit" disabled={salvando} className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">
              {salvando ? "Salvando..." : "Salvar e continuar"}
            </Button>
          </form>
          <button type="button" onClick={sair} className="mt-4 block w-full text-center text-sm text-ink-2 hover:text-ink hover:underline">
            Sair
          </button>
        </Card>
      </main>
    </div>
  );
}
