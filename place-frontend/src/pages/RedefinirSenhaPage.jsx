import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/auth/FormField";
import PasswordField from "@/components/auth/PasswordField";
import { usePageTitle } from "@/hooks/usePageTitle";
import { authService, AuthError } from "@/services/authService";

function LinkInvalido({ mensagem }) {
  return (
    <Card>
      <h1 className="mb-2 text-xl font-medium">Link inválido</h1>
      <p role="alert" className="text-sm leading-relaxed text-ink-2">{mensagem}</p>
      <Link to="/esqueci-senha" className="mt-6 block text-center text-sm text-gold hover:underline">Pedir um novo link</Link>
    </Card>
  );
}

export default function RedefinirSenhaPage() {
  usePageTitle("Criar nova senha");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Guarda o token e tira da barra de endereço (não fica no histórico nem é compartilhado sem querer).
  const [token] = useState(() => params.get("token") ?? "");
  const [form, setForm] = useState({ novaSenha: "", confirmarSenha: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [linkInvalido, setLinkInvalido] = useState(token ? "" : "Este endereço não tem o código de redefinição. Abra o link direto do e-mail ou peça um novo.");
  const [pronto, setPronto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.has("token")) navigate("/redefinir-senha", { replace: true });
  }, [params, navigate]);

  const handleChange = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await authService.redefinirSenha({ token, ...form });
      setPronto(true);
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === "TOKEN_INVALIDO") setLinkInvalido(err.message);
        setFieldErrors(err.fieldErrors ?? {});
        if (!["VALIDATION_ERROR", "TOKEN_INVALIDO"].includes(err.code)) setFormError(err.message);
      } else {
        setFormError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (linkInvalido) return <LinkInvalido mensagem={linkInvalido} />;

  if (pronto) {
    return (
      <Card>
        <h1 className="mb-2 text-xl font-medium">Senha alterada</h1>
        <p role="status" className="text-sm leading-relaxed text-ink-2">Pronto! Agora é só entrar com a senha nova.</p>
        <Button className="mt-6 w-full" onClick={() => navigate("/login", { replace: true })}>Ir para o login</Button>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="mb-1 text-xl font-medium">Criar nova senha</h1>
      <p className="mb-6 text-sm text-ink-2">Use pelo menos 8 caracteres. Depois de salvar, as outras sessões abertas da sua conta são encerradas.</p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Nova senha" error={fieldErrors.novaSenha}>
          <PasswordField autoComplete="new-password" autoFocus value={form.novaSenha} onChange={handleChange("novaSenha")} error={fieldErrors.novaSenha} />
        </FormField>

        <FormField label="Confirmar nova senha" error={fieldErrors.confirmarSenha}>
          <PasswordField autoComplete="new-password" value={form.confirmarSenha} onChange={handleChange("confirmarSenha")} error={fieldErrors.confirmarSenha} />
        </FormField>

        {formError && <p role="alert" className="text-xs text-danger">{formError}</p>}

        <Button type="submit" disabled={submitting} className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </Card>
  );
}
