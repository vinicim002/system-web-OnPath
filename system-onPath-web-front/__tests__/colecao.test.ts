import { ErroOnPath } from "@/dados/erros";
import { limparTudo } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";

async function capturar(promessa: Promise<unknown>): Promise<ErroOnPath> {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof ErroOnPath) return erro;
    throw erro;
  }
  throw new Error("era esperado um ErroOnPath");
}

describe("serviço de coleção local", () => {
  beforeEach(() => limparTudo());

  it("cria, lista e obtém", async () => {
    const { areas } = criarServicosLocais();
    const area = await areas.criar({ nome: "Trabalho", cor: "#525252", ordem: 0 });

    expect(area.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(area.criadoEm).toBe(area.atualizadoEm);
    expect(area.arquivadoEm).toBeNull();
    expect(await areas.listar()).toEqual([area]);
    expect(await areas.obter(area.id)).toEqual(area);
  });

  it("altera sem mexer nos campos comuns", async () => {
    const { areas } = criarServicosLocais();
    const area = await areas.criar({ nome: "Trabalho", cor: "#525252", ordem: 0 });
    const alterada = await areas.alterar(area.id, {
      nome: "Emprego",
      id: "outro",
    } as unknown as { nome: string });

    expect(alterada.id).toBe(area.id);
    expect(alterada.nome).toBe("Emprego");
    expect(alterada.criadoEm).toBe(area.criadoEm);
    expect(await areas.obter(area.id)).toEqual(alterada);
  });

  it("excluir arquiva, e recuperar desfaz", async () => {
    const { areas } = criarServicosLocais();
    const area = await areas.criar({ nome: "Trabalho", cor: "#525252", ordem: 0 });

    await areas.excluir(area.id);
    expect(await areas.listar()).toEqual([]);
    const todas = await areas.listar({ incluirArquivados: true });
    expect(todas).toHaveLength(1);
    expect(todas[0].arquivadoEm).not.toBeNull();

    const recuperada = await areas.recuperar(area.id);
    expect(recuperada.arquivadoEm).toBeNull();
    expect(await areas.listar()).toHaveLength(1);
  });

  it("gera nao_encontrado para id inexistente", async () => {
    const { areas } = criarServicosLocais();
    const id = "00000000-0000-4000-8000-000000000000";
    for (const operacao of [areas.obter(id), areas.alterar(id, {}), areas.excluir(id), areas.recuperar(id)]) {
      expect((await capturar(operacao)).codigo).toBe("nao_encontrado");
    }
  });

  it("gera dados_invalidos só com os nomes dos campos", async () => {
    const { areas, grupos } = criarServicosLocais();
    const erro = await capturar(areas.criar({ nome: "", cor: "#000", ordem: -1 }));

    expect(erro.codigo).toBe("dados_invalidos");
    expect(erro.detalhes).toEqual({ campos: ["nome", "ordem"] });
    expect(erro.mensagem).toMatch(/inválidos/);

    const area = await areas.criar({ nome: "Pessoal", cor: "#000", ordem: 0 });
    const erroGrupo = await capturar(grupos.criar({ areaId: area.id, nome: "X", limiteAtivos: -1 }));
    expect(erroGrupo.detalhes).toEqual({ campos: ["limiteAtivos"] });
    expect(await areas.listar()).toHaveLength(1);
  });

  it("projetos herdam a área do grupo (RN01)", async () => {
    const { areas, grupos, projetos } = criarServicosLocais();
    const trabalho = await areas.criar({ nome: "Trabalho", cor: "#000", ordem: 0 });
    const pessoal = await areas.criar({ nome: "Pessoal", cor: "#000", ordem: 1 });
    const grupoTrabalho = await grupos.criar({ areaId: trabalho.id, nome: "A", limiteAtivos: 1 });
    const grupoPessoal = await grupos.criar({ areaId: pessoal.id, nome: "B", limiteAtivos: 1 });

    const projeto = await projetos.criar({
      grupoId: grupoTrabalho.id,
      nome: "App",
      prioridade: "media",
      status: "ativo",
      posicaoFila: 0,
    });
    expect(projeto.areaId).toBe(trabalho.id);
    expect(projeto.metaId).toBeNull();

    const movido = await projetos.alterar(projeto.id, { grupoId: grupoPessoal.id });
    expect(movido.areaId).toBe(pessoal.id);
  });

  it("persiste depois de recriar o serviço", async () => {
    const primeiro = criarServicosLocais();
    const area = await primeiro.areas.criar({ nome: "Trabalho", cor: "#000", ordem: 0 });

    const segundo = criarServicosLocais();
    expect(await segundo.areas.obter(area.id)).toEqual(area);
  });
});
