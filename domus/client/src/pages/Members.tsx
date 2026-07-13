import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Home, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";

type DonationForm = {
  fullName: string;
  phone: string;
  email: string;
  cpf: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

function formatCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (factor: number) => {
    const total = cpf
      .slice(0, factor - 1)
      .split("")
      .reduce((sum, digit, index) => sum + Number(digit) * (factor - index), 0);
    const result = (total * 10) % 11;

    return result === 10 ? 0 : result;
  };

  return calculateDigit(10) === Number(cpf[9]) && calculateDigit(11) === Number(cpf[10]);
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {} as { message?: string };
  }

  try {
    return JSON.parse(text) as { message?: string };
  } catch {
    return {
      message:
        "A API de cadastro não respondeu em JSON. Verifique se o servidor backend está rodando.",
    };
  }
}

export default function Members() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<DonationForm>({
    fullName: "",
    phone: "",
    email: "",
    cpf: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
  });
  const [acceptedLgpd, setAcceptedLgpd] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const errors = useMemo(() => {
    return {
      fullName: form.fullName.trim().split(/\s+/).length < 2,
      phone: onlyDigits(form.phone).length < 10,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
      cpf: !isValidCpf(form.cpf),
      street: form.street.trim().length < 3,
      number: form.number.trim().length < 1,
      neighborhood: form.neighborhood.trim().length < 2,
      city: form.city.trim().length < 2,
      lgpd: !acceptedLgpd,
    };
  }, [acceptedLgpd, form]);

  const isFormValid = !Object.values(errors).some(Boolean);

  function updateField(field: keyof DonationForm, value: string) {
    const nextValue =
      field === "cpf" ? formatCpf(value) : field === "phone" ? formatPhone(value) : value;

    setForm((current) => ({ ...current, [field]: nextValue }));
    setSubmitted(false);
    setSubmitError("");
    setSubmitMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormValid) {
      setSubmitted(false);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          cpf: form.cpf,
          address: {
            street: form.street,
            number: form.number,
            neighborhood: form.neighborhood,
            city: form.city,
          },
          acceptedLgpd,
        }),
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível salvar o cadastro.");
      }

      setSubmitted(true);
      setSubmitMessage(
        data.message ||
          "Cadastro feito com sucesso. Você será avisada para qual dia buscar a cesta."
      );
      setForm({
        fullName: "",
        phone: "",
        email: "",
        cpf: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
      });
      setAcceptedLgpd(false);
    } catch (error) {
      setSubmitted(false);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o cadastro. Tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8 flex gap-3">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/10 border border-primary/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={() => setLocation("/")}
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/10 border border-primary/20"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
      </div>

      <section className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary/60">
            Apoio do templo
          </p>
          <h1 className="font-cinzel text-4xl text-primary md:text-5xl">Doações</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Cadastre seus dados para contato e identificação responsável da contribuição.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-primary/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="font-cinzel text-2xl text-primary">
                Cadastro do cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    placeholder="Nome e sobrenome"
                    aria-invalid={errors.fullName}
                    autoComplete="name"
                    className="h-11 border-primary/20 bg-black/30"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-300">Informe nome e sobrenome.</p>
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone de contato</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      placeholder="(00) 00000-0000"
                      inputMode="tel"
                      aria-invalid={errors.phone}
                      autoComplete="tel"
                      className="h-11 border-primary/20 bg-black/30"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-300">Informe um telefone válido.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      placeholder="nome@email.com"
                      aria-invalid={errors.email}
                      autoComplete="email"
                      className="h-11 border-primary/20 bg-black/30"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-300">Informe um e-mail válido.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={form.cpf}
                    onChange={(event) => updateField("cpf", event.target.value)}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    aria-invalid={errors.cpf}
                    autoComplete="off"
                    className="h-11 border-primary/20 bg-black/30"
                  />
                  {errors.cpf && (
                    <p className="text-xs text-red-300">
                      Informe um CPF válido com 11 dígitos.
                    </p>
                  )}
                </div>

                <div className="space-y-4 rounded-md border border-primary/10 bg-black/20 p-4">
                  <h3 className="font-cinzel text-sm uppercase tracking-[0.24em] text-primary">
                    Endereço de residência
                  </h3>

                  <div className="grid gap-5 md:grid-cols-[1fr_120px]">
                    <div className="space-y-2">
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        value={form.street}
                        onChange={(event) => updateField("street", event.target.value)}
                        placeholder="Nome da rua"
                        aria-invalid={errors.street}
                        autoComplete="address-line1"
                        className="h-11 border-primary/20 bg-black/30"
                      />
                      {errors.street && (
                        <p className="text-xs text-red-300">Informe a rua.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Nº</Label>
                      <Input
                        id="number"
                        value={form.number}
                        onChange={(event) => updateField("number", event.target.value)}
                        placeholder="123"
                        aria-invalid={errors.number}
                        autoComplete="address-line2"
                        className="h-11 border-primary/20 bg-black/30"
                      />
                      {errors.number && (
                        <p className="text-xs text-red-300">Informe o número.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={form.neighborhood}
                        onChange={(event) => updateField("neighborhood", event.target.value)}
                        placeholder="Bairro"
                        aria-invalid={errors.neighborhood}
                        className="h-11 border-primary/20 bg-black/30"
                      />
                      {errors.neighborhood && (
                        <p className="text-xs text-red-300">Informe o bairro.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(event) => updateField("city", event.target.value)}
                        placeholder="Cidade"
                        aria-invalid={errors.city}
                        autoComplete="address-level2"
                        className="h-11 border-primary/20 bg-black/30"
                      />
                      {errors.city && (
                        <p className="text-xs text-red-300">Informe a cidade.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-primary/15 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="lgpd"
                      checked={acceptedLgpd}
                      onCheckedChange={(checked) => setAcceptedLgpd(checked === true)}
                      aria-invalid={errors.lgpd}
                      className="mt-1"
                    />
                    <Label htmlFor="lgpd" className="block text-sm leading-6 text-zinc-300">
                      Autorizo o tratamento dos meus dados pessoais, incluindo CPF, somente
                      para identificação do cadastro, contato sobre a doação e cumprimento de
                      obrigações legais, conforme a LGPD.
                    </Label>
                  </div>
                  {errors.lgpd && (
                    <p className="mt-3 text-xs text-red-300">
                      O consentimento LGPD é obrigatório para enviar o cadastro.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValid || submitting}
                  className="h-12 w-full bg-primary font-cinzel text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Salvando cadastro..." : "Enviar cadastro"}
                </Button>

                {submitted && (
                  <div className="flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    {submitMessage}
                  </div>
                )}

                {submitError && (
                  <div className="rounded-md border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
                    {submitError}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <aside className="space-y-5">
            <div className="border-l-2 border-primary bg-primary/5 p-6">
              <ShieldCheck className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-cinzel text-xl text-primary">Proteção de dados</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                O CPF é solicitado apenas quando necessário para identificação, registro e
                obrigações legais relacionadas à doação.
              </p>
            </div>

          </aside>
        </div>
      </section>
    </div>
  );
}
