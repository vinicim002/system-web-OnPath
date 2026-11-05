import { Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACESSO_RAPIDO } from "@/features/login/acessoRapido";
import { t } from "@/i18n";

type Erros = { email?: string; senha?: string };

const emailValido = z.email();

/** Tela de login só visual: não autentica, não guarda sessão e não bloqueia rotas (constituição 1.3.0). */
export function Login() {
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Erros>({});

  function entrar(dados: { email: string; senha: string }) {
    const novosErros: Erros = {};
    if (!emailValido.safeParse(dados.email.trim()).success) novosErros.email = t("login.erros.email");
    if (dados.senha === "") novosErros.senha = t("login.erros.senha");
    setErros(novosErros);
    if (Object.keys(novosErros).length === 0) navegar("/");
  }

  function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    entrar({ email, senha });
  }

  function acessoRapido() {
    setEmail(ACESSO_RAPIDO.email);
    setSenha(ACESSO_RAPIDO.senha);
    entrar(ACESSO_RAPIDO);
  }

  return (
    <main className="flex min-h-full items-center justify-center bg-cinza-50 p-6">
      <div className="flex w-full max-w-90 flex-col gap-6 rounded-xl border bg-branco p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo altura={32} />
          <div className="flex flex-col gap-1">
            <h1 className="text-subtitulo font-semibold">{t("login.titulo")}</h1>
            <p className="text-cinza-600">{t("login.subtitulo")}</p>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={aoEnviar} noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("login.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              aria-invalid={erros.email !== undefined}
              aria-describedby={erros.email ? "erro-email" : undefined}
            />
            {erros.email && (
              <p id="erro-email" className="text-pequeno text-cinza-700">
                {erros.email}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha">{t("login.senha")}</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              aria-invalid={erros.senha !== undefined}
              aria-describedby={erros.senha ? "erro-senha" : undefined}
            />
            {erros.senha && (
              <p id="erro-senha" className="text-pequeno text-cinza-700">
                {erros.senha}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            {t("login.entrar")}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-pequeno text-cinza-500">
          <span className="h-px flex-1 bg-cinza-200" />
          {t("login.ou")}
          <span className="h-px flex-1 bg-cinza-200" />
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={acessoRapido}>
          <Zap />
          {t("login.acessoRapido")}
        </Button>

        <p className="text-center text-pequeno text-cinza-500">{t("login.aviso")}</p>
      </div>
    </main>
  );
}
