import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErroOnPath } from "@/dados/erros";
import { limparTudo } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";

async function capturarErro(promessa: Promise<unknown>): Promise<ErroOnPath> {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof ErroOnPath) return erro;
    throw erro;
  }
  throw new Error("era esperado um ErroOnPath");
}

let instante = Date.parse("2026-11-05T12:00:00.000Z");

/** Avança o relógio 1 minuto, para que cada operação tenha uma data diferente. */
function passarUmMinuto() {
  instante += 60_000;
  vi.setSystemTime(instante);
}

describe("serviço da caixa", () => {
  beforeEach(() => {
    limparTudo();
    vi.useFakeTimers({ toFake: ["Date"] });
    passarUmMinuto();
  });

  afterEach(() => vi.useRealTimers());

  it("captura só com texto e tira os espaços das pontas", async () => {
    const { itensCaixa } = criarServicosLocais();
    const item = await itensCaixa.capturar("  ideia  ");

    expect(item.conteudo).toBe("ideia");
    expect(item.status).toBe("novo");
    expect(item.arquivadoEm).toBeNull();
    expect(await itensCaixa.listarNovos()).toEqual([item]);
  });

  it("mantém as quebras de linha", async () => {
    const { itensCaixa } = criarServicosLocais();
    const item = await itensCaixa.capturar("linha 1\nlinha 2");
    expect(item.conteudo).toBe("linha 1\nlinha 2");
  });

  it("recusa texto vazio ou só com espaços, sem gravar nada", async () => {
    const { itensCaixa } = criarServicosLocais();
    for (const texto of ["", "   ", "\n\t "]) {
      const erro = await capturarErro(itensCaixa.capturar(texto));
      expect(erro.codigo).toBe("dados_invalidos");
    }
    expect(await itensCaixa.listar({ incluirArquivados: true })).toEqual([]);
  });

  it("lista os novos do mais novo para o mais antigo", async () => {
    const { itensCaixa } = criarServicosLocais();
    const primeiro = await itensCaixa.capturar("primeiro");
    passarUmMinuto();
    const segundo = await itensCaixa.capturar("segundo");
    passarUmMinuto();
    const terceiro = await itensCaixa.capturar("terceiro");

    expect((await itensCaixa.listarNovos()).map((item) => item.id)).toEqual([
      terceiro.id,
      segundo.id,
      primeiro.id,
    ]);
  });

  it("desempata itens criados no mesmo instante pela ordem de criação", async () => {
    const { itensCaixa } = criarServicosLocais();
    const a = await itensCaixa.capturar("a");
    const b = await itensCaixa.capturar("b");
    expect((await itensCaixa.listarNovos()).map((item) => item.id)).toEqual([b.id, a.id]);
  });

  it("descartar grava a situação e o arquivamento juntos", async () => {
    const { itensCaixa } = criarServicosLocais();
    const item = await itensCaixa.capturar("ideia");
    passarUmMinuto();
    const descartado = await itensCaixa.descartar(item.id);

    expect(descartado.status).toBe("descartado");
    expect(descartado.arquivadoEm).toBe(new Date(instante).toISOString());
    expect(await itensCaixa.listarNovos()).toEqual([]);
    expect(await itensCaixa.listar()).toEqual([]);
    expect(await itensCaixa.listarDescartados()).toEqual([descartado]);
  });

  it("excluir é o mesmo que descartar", async () => {
    const { itensCaixa } = criarServicosLocais();
    const item = await itensCaixa.capturar("ideia");
    await itensCaixa.excluir(item.id);

    const [descartado] = await itensCaixa.listarDescartados();
    expect(descartado?.id).toBe(item.id);
    expect(descartado?.status).toBe("descartado");
  });

  it("descartar de novo não muda o item", async () => {
    const { itensCaixa } = criarServicosLocais();
    const item = await itensCaixa.capturar("ideia");
    const descartado = await itensCaixa.descartar(item.id);
    passarUmMinuto();
    expect(await itensCaixa.descartar(item.id)).toEqual(descartado);
  });

  it("recuperar volta para novo, na mesma posição", async () => {
    const { itensCaixa } = criarServicosLocais();
    const primeiro = await itensCaixa.capturar("primeiro");
    passarUmMinuto();
    const segundo = await itensCaixa.capturar("segundo");
    passarUmMinuto();
    const terceiro = await itensCaixa.capturar("terceiro");

    await itensCaixa.descartar(segundo.id);
    passarUmMinuto();
    const recuperado = await itensCaixa.recuperar(segundo.id);

    expect(recuperado.status).toBe("novo");
    expect(recuperado.arquivadoEm).toBeNull();
    expect((await itensCaixa.listarNovos()).map((item) => item.id)).toEqual([
      terceiro.id,
      segundo.id,
      primeiro.id,
    ]);
    expect(await itensCaixa.listarDescartados()).toEqual([]);
  });

  it("recuperar um item novo não muda o item", async () => {
    const { itensCaixa } = criarServicosLocais();
    const item = await itensCaixa.capturar("ideia");
    passarUmMinuto();
    expect(await itensCaixa.recuperar(item.id)).toEqual(item);
  });

  it("lista os descartados do descarte mais recente para o mais antigo", async () => {
    const { itensCaixa } = criarServicosLocais();
    const a = await itensCaixa.capturar("a");
    const b = await itensCaixa.capturar("b");
    const c = await itensCaixa.capturar("c");
    passarUmMinuto();
    await itensCaixa.descartar(b.id);
    passarUmMinuto();
    await itensCaixa.descartar(a.id);

    expect((await itensCaixa.listarDescartados()).map((item) => item.id)).toEqual([a.id, b.id]);
    expect((await itensCaixa.listarNovos()).map((item) => item.id)).toEqual([c.id]);
  });

  it("edita o texto e recusa texto vazio", async () => {
    const { itensCaixa } = criarServicosLocais();
    const item = await itensCaixa.capturar("ideia");
    const alterado = await itensCaixa.alterar(item.id, { conteudo: "  ideia melhor " });
    expect(alterado.conteudo).toBe("ideia melhor");

    const erro = await capturarErro(itensCaixa.alterar(item.id, { conteudo: "  " }));
    expect(erro.codigo).toBe("dados_invalidos");
    expect((await itensCaixa.obter(item.id)).conteudo).toBe("ideia melhor");
  });

  it("dá nao_encontrado para id inexistente", async () => {
    const { itensCaixa } = criarServicosLocais();
    const id = "00000000-0000-4000-8000-000000000000";
    expect((await capturarErro(itensCaixa.descartar(id))).codigo).toBe("nao_encontrado");
    expect((await capturarErro(itensCaixa.recuperar(id))).codigo).toBe("nao_encontrado");
  });

  it("a cópia exportada inclui os descartados", async () => {
    const { itensCaixa, dados } = criarServicosLocais();
    const item = await itensCaixa.capturar("ideia");
    await itensCaixa.descartar(item.id);

    const copia = await dados.exportar();
    expect(copia.colecoes.itensCaixa).toEqual([
      expect.objectContaining({ id: item.id, status: "descartado" }),
    ]);
  });
});
