import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, fieldInputClass } from "@/components/auth/FormField";
import { usePageTitle } from "@/hooks/usePageTitle";
import { authService, AuthError } from "@/services/authService";

const VINCULOS = [
  { value: "interno", label: "Corretor da Place Brokers" },
  { value: "externo", label: "Corretor parceiro (externo)" },
];

export default function RegisterPage() {
  usePageTitle("Criar conta");

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", vinculo: "", creci: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await authService.register({ ...form, role: "CORRETOR" });
      setEnviado(true);
    } catch (err) {
      if (err instanceof AuthError) {
        const erros = { ...(err.fieldErrors ?? {}) };
        if (erros.nome) erros.name = erros.nome;
        setFieldErrors(erros);
        if (erros.role) setFormError(erros.role);
        else if (err.code !== "VALIDATION_ERROR") setFormError(err.message);
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
        <h1 className="mb-1 text-xl font-medium">Cadastro enviado</h1>
        <p className="mb-6 text-sm text-ink-2">
          Recebemos seus dados. Um administrador vai analisar o cadastro
          {form.vinculo === "externo" ? " e conferir o seu CRECI" : ""}. Você poderá entrar assim que ele for aprovado.
        </p>
        <Link to="/login" className="text-sm text-gold hover:underline">
          Voltar para o login
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="mb-1 text-xl font-medium">Criar conta</h1>
      <p className="mb-6 text-sm text-ink-2">Cadastro de corretores. Sua conta fica pendente até o administrador aprovar.</p>

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

        <FormField label="Você é" error={fieldErrors.vinculo}>
          <select value={form.vinculo} onChange={handleChange("vinculo")} className={fieldInputClass(fieldErrors.vinculo)}>
            <option value="" disabled>
              Selecione...
            </option>
            {VINCULOS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </FormField>

        {form.vinculo && (
          <FormField
            label={form.vinculo === "externo" ? "CRECI (obrigatório)" : "CRECI (opcional)"}
            error={fieldErrors.creci}
          >
            <input value={form.creci} onChange={handleChange("creci")} className={fieldInputClass(fieldErrors.creci)} />
          </FormField>
        )}

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
          {submitting ? "Enviando..." : "Criar conta"}
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