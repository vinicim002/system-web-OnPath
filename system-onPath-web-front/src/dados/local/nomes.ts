/** Chave para comparar nomes sem diferenciar maiúsculas, acentos e espaços nas pontas. */
export function chaveDeNome(texto: string): string {
  return texto
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}
