import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CopiaDados } from "@/dados/contratos";
import { ErroOnPath, type CodigoErro } from "@/dados/erros";
import { limparTudo } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";
import { NOMES_COLECOES } from "@/dados/tipos";

function instantaneo(): Record<string, string | null> {
  const resultado: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i)!;
    if (chave.startsWith("onpath:") && chave !== "onpath:v1:meta") {
      resultado[chave] = localStorage.getItem(chave);
    }
  }
  return resultado;
}

async function codigoDoErro(promessa: Promise<unknown>): Promise<CodigoErro> {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof ErroOnPath) return erro.codigo;
    throw erro;
  }
  throw new Error("era esperado um ErroOnPath");
}

async function prepararComArquivado(): Promise<CopiaDados> {
  const servicos = criarServicosLocais();
  await servicos.dados.prepararPrimeiroUso();
  const [area] = await servicos.areas.listar();
  await servicos.areas.excluir(area.id);
  await servicos.itensCaixa.criar({ conteudo: "Ligar para o banco", status: "novo" });
  return servicos.dados.exportar();
}

describe("cópia dos dados", () => {
  beforeEach(() => limparTudo());

  it("exporta e importa 100% dos registros, inclusive arquivados", async () => {
    const copia = await prepararComArquivado();
    expect(copia.formato).toBe("onpath-copia");
    expect(Object.keys(copia.colecoes).sort()).toEqual([...NOMES_COLECOES].sort());
    expect(copia.colecoes.areas.some((area) => area.arquivadoEm !== null)).toBe(true);

    limparTudo();

    const servicos = criarServicosLocais();
    const { registros } = await servicos.dados.importar(JSON.stringify(copia));
    expect(registros).toBe(6 + 5 + 10 + 12 + 1);
    for (const nome of NOMES_COLECOES) {
      expect(await servicos[nome].listar({ incluirArquivados: true })).toEqual(copia.colecoes[nome]);
    }
  });

  it("não recria os dados iniciais depois de importar", async () => {
    const copia = await prepararComArquivado();
    limparTudo();
    const servicos = criarServicosLocais();
    await servicos.dados.importar(copia);
    expect(await servicos.dados.prepararPrimeiroUso()).toEqual({ criou: false });
    expect(await servicos.areas.listar()).toHaveLength(5);
  });

  describe("recusa cópias inválidas sem alterar os dados", () => {
    let copia: CopiaDados;
    let antes: Record<string, string | null>;

    beforeEach(async () => {
      copia = await prepararComArquivado();
      antes = instantaneo();
    });

    const casos: [string, () => unknown, CodigoErro][] = [
      ["texto que não é JSON", () => "isto não é json", "copia_invalida"],
      ["formato errado", () => ({ ...copia, formato: "outro" }), "copia_invalida"],
      ["versão mais nova", () => ({ ...copia, versao: 2 }), "copia_versao_desconhecida"],
      [
        "coleção faltando",
        () => {
          const { tarefas: _tarefas, ...resto } = copia.colecoes;
          return { ...copia, colecoes: resto };
        },
        "copia_invalida",
      ],
      [
        "referência quebrada",
        () => ({
          ...copia,
          colecoes: {
            ...copia.colecoes,
            grupos: copia.colecoes.grupos.map((grupo, i) =>
              i === 0 ? { ...grupo, areaId: "00000000-0000-4000-8000-000000000000" } : grupo,
            ),
          },
        }),
        "copia_referencia_quebrada",
      ],
      ["package.json qualquer", () => ({ name: "app", version: "1.0.0" }), "copia_invalida"],
    ];

    it.each(casos)("%s", async (_nome, montar, codigo) => {
      const servicos = criarServicosLocais();
      expect(await codigoDoErro(servicos.dados.importar(montar()))).toBe(codigo);
      expect(instantaneo()).toEqual(antes);
    });
  });

  it("mantém os dados se o armazenamento falhar no meio da importação", async () => {
    const copia = await prepararComArquivado();
    const servicos = criarServicosLocais();
    await servicos.itensCaixa.criar({ conteudo: "Só existe agora", status: "novo" });
    const antes = instantaneo();

    const original = Storage.prototype.setItem;
    let chamadas = 0;
    const espiao = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      chave: string,
      valor: string,
    ) {
      chamadas += 1;
      if (chamadas === 5) throw new DOMException("cheio", "QuotaExceededError");
      return original.call(this, chave, valor);
    });

    try {
      expect(await codigoDoErro(servicos.dados.importar(copia))).toBe("armazenamento_indisponivel");
    } finally {
      espiao.mockRestore();
    }
    expect(chamadas).toBeGreaterThanOrEqual(5);
    expect(instantaneo()).toEqual(antes);
  });
});
