/** Baixa um objeto como arquivo JSON. */
export function baixarJson(nomeArquivo: string, objeto: unknown): void {
  const blob = new Blob([JSON.stringify(objeto, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Abre a escolha de arquivo e devolve o texto do JSON, ou `null` se o usuário cancelar. */
export function escolherArquivoJson(): Promise<string | null> {
  return new Promise((resolver, rejeitar) => {
    const entrada = document.createElement("input");
    entrada.type = "file";
    entrada.accept = "application/json,.json";
    entrada.style.display = "none";

    const terminar = () => entrada.remove();

    entrada.addEventListener("cancel", () => {
      terminar();
      resolver(null);
    });
    entrada.addEventListener("change", () => {
      const arquivo = entrada.files?.[0];
      terminar();
      if (!arquivo) {
        resolver(null);
        return;
      }
      const leitor = new FileReader();
      leitor.onload = () => resolver(String(leitor.result ?? ""));
      leitor.onerror = () => rejeitar(leitor.error);
      leitor.readAsText(arquivo);
    });

    document.body.appendChild(entrada);
    entrada.click();
  });
}
