import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, fieldInputClass } from "@/components/auth/FormField";
import { usePageTitle } from "@/hooks/usePageTitle";
import { authService, AuthError } from "@/services/authService";

const ROLE_HOME = { admin: "/admin/dashboard", corretor: "/corretor", viabilizador: "/viabilizador" };

export default function LoginPage() {
  usePageTitle("Entrar");
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        if (err.code !== "VALIDATION_ERROR") setFormError(err.message);
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
      <p className="mb-6 text-sm text-ink-2">Acesso para administradores e corretores.</p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
          <input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange("password")}
            className={fieldInputClass(fieldErrors.password)}
          />
        </FormField>

        {formError && (
          <p role="alert" className="text-xs text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-2">
        Ainda não tem conta?{" "}
        <Link to="/register" className="text-gold hover:underline">
          Cadastre-se
        </Link>
      </p>
    </Card>
  );
}