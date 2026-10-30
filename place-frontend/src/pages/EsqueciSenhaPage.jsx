import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, fieldInputClass } from "@/components/auth/FormField";
import { usePageTitle } from "@/hooks/usePageTitle";
import { authService, AuthError } from "@/services/authService";

export default function EsqueciSenhaPage() {
  usePageTitle("Esqueci minha senha");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [enviado, setEnviado] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      const r = await authService.esqueciSenha(email);
      setEnviado(r.message ?? "Se este e-mail estiver cadastrado, enviamos um link para criar uma senha nova.");
    } catch (err) {
      if (err instanceof AuthError) {
        setFieldErrors(err.fieldErrors ?? {});
        if (err.code !== "VALIDATION_ERROR") setFormError(err.message);
      } else {
        setFormError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (enviado) {
    return (
      <Card>
        <h1 className="mb-2 text-xl font-medium">Confira seu e-mail</h1>
        <p role="status" className="text-sm leading-relaxed text-ink-2">{enviado}</p>
        <p className="mt-3 text-xs leading-relaxed text-ink-3">O link vale por 1 hora. Se não chegar em alguns minutos, você pode pedir de novo.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/login" className="text-center text-sm text-gold hover:underline">Voltar para o login</Link>
          <button type="button" onClick={() => setEnviado("")} className="text-xs text-ink-2 hover:text-ink">
            Usar outro e-mail
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="mb-1 text-xl font-medium">Esqueci minha senha</h1>
      <p className="mb-6 text-sm text-ink-2">Digite o e-mail da sua conta. Vamos mandar um link para você criar uma senha nova.</p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="E-mail" error={fieldErrors.email}>
          <input
            type="email"
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldInputClass(fieldErrors.email)}
          />
        </FormField>

        {formError && <p role="alert" className="text-xs text-danger">{formError}</p>}

        <Button type="submit" disabled={submitting} className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Enviando..." : "Enviar link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-2">
        Lembrou a senha?{" "}
        <Link to="/login" className="text-gold hover:underline">Entrar</Link>
      </p>
    </Card>
  );
}
