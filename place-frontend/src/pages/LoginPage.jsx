import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, fieldInputClass } from "@/components/auth/FormField";
import PasswordField from "@/components/auth/PasswordField";
import { useFocoNoPrimeiroErro } from "@/components/auth/useFocoNoPrimeiroErro";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ROLE_HOME } from "@/lib/areas";
import { authService, AuthError } from "@/services/authService";

export default function LoginPage() {
  usePageTitle("Entrar");
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);
  useFocoNoPrimeiroErro(formRef, fieldErrors);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      const { user } = await authService.login(form);
      navigate(ROLE_HOME[user.role] ?? "/", { replace: true });
    } catch (err) {
      if (err instanceof AuthError) {
        setFieldErrors(err.fieldErrors ?? {});
        // Conta recusada: explica que basta pedir a reabertura (antes isso ficava no cadastro).
        if (err.code === "ACCOUNT_REJECTED") setFormError(`${err.message} Peça a reabertura da análise; não é preciso criar outra conta.`);
        else if (err.code !== "VALIDATION_ERROR") setFormError(err.message);
      } else {
        setFormError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h1 className="mb-1 text-xl font-medium">Área restrita</h1>
      <p className="mb-6 text-sm text-ink-2">Acesso para a equipe e parceiros da Place Brokers.</p>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="E-mail" error={fieldErrors.email}>
          <input
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={handleChange("email")}
            className={fieldInputClass(fieldErrors.email)}
          />
        </FormField>

        <FormField label="Senha" error={fieldErrors.password}>
          <PasswordField
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange("password")}
            error={fieldErrors.password}
          />
        </FormField>

        {/* O e-mail já digitado vai junto pelo estado da navegação (nunca pela URL). */}
        <Link to="/esqueci-senha" state={{ email: form.email }} className="-mt-3 -mr-2 inline-flex min-h-11 items-center self-end px-2 text-xs text-ink-2 hover:text-gold hover:underline">
          Esqueci minha senha
        </Link>

        {formError && (
          <p role="alert" className="text-xs text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-ink-2">
        Ainda não tem conta?{" "}
        <Link to="/register" className="inline-flex min-h-11 items-center px-1 text-gold hover:underline">
          Cadastre-se
        </Link>
      </p>
    </Card>
  );
}
