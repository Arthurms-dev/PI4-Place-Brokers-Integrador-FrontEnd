import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, fieldInputClass } from "@/components/auth/FormField";
import { usePageTitle } from "@/hooks/usePageTitle";
import { authService, AuthError } from "@/services/authService";

const ROLES = [
  { value: "CORRETOR", label: "Corretor" },
  { value: "ADMIN", label: "Administrador" },
];

export default function RegisterPage() {
  usePageTitle("Criar conta");
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "" });
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
      await authService.register(form);
      navigate("/login", { replace: true });
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
      <h1 className="mb-1 text-xl font-medium">Criar conta</h1>
      <p className="mb-6 text-sm text-ink-2">Cadastro para administradores e corretores.</p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Nome completo" error={fieldErrors.name}>
          <input value={form.name} onChange={handleChange("name")} className={fieldInputClass(fieldErrors.name)} />
        </FormField>

        <FormField label="E-mail" error={fieldErrors.email}>
          <input
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={handleChange("email")}
            className={fieldInputClass(fieldErrors.email)}
          />
        </FormField>

        <FormField label="Perfil" error={fieldErrors.role}>
          <select value={form.role} onChange={handleChange("role")} className={fieldInputClass(fieldErrors.role)}>
            <option value="" disabled>
              Selecione…
            </option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Senha" error={fieldErrors.password}>
          <input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange("password")}
            className={fieldInputClass(fieldErrors.password)}
          />
        </FormField>

        <FormField label="Confirmar senha" error={fieldErrors.confirmPassword}>
          <input
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            className={fieldInputClass(fieldErrors.confirmPassword)}
          />
        </FormField>

        {formError && (
          <p role="alert" className="text-xs text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Criando conta…" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-2">
        Já tem conta?{" "}
        <Link to="/login" className="text-gold hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}