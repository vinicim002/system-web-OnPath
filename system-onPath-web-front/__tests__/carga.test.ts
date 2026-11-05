import { limparTudo, lerMeta } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";

async function contar() {
  const s = criarServicosLocais();
  const opcoes = { incluirArquivados: true };
  return {
    areas: (await s.areas.listar(opcoes)).length,
    grupos: (await s.grupos.listar(opcoes)).length,
    projetos: (await s.projetos.listar(opcoes)).length,
    rotinas: (await s.rotinas.listar(opcoes)).length,
  };
}

const ESPERADO = { areas: 6, grupos: 5, projetos: 10, rotinas: 12 };

describe("dados iniciais", () => {
  beforeEach(() => limparTudo());

  it("cria os dados no primeiro uso, com a área do grupo em cada projeto", async () => {
    const servicos = criarServicosLocais();
    expect(await servicos.dados.prepararPrimeiroUso()).toEqual({ criou: true });
    expect(await contar()).toEqual(ESPERADO);
    expect(lerMeta().dadosIniciaisEm).not.toBeNull();

    const grupos = await servicos.grupos.listar();
    for (const projeto of await servicos.projetos.listar()) {
      const grupo = grupos.find((item) => item.id === projeto.grupoId);
      expect(grupo).toBeDefined();
      expect(projeto.areaId).toBe(grupo!.areaId);
    }

    const zonaSul = (await servicos.projetos.listar()).find((p) => p.nome === "Zona Sul");
    expect(zonaSul?.prioridade).toBe("alta");
  });

  it("não muda as quantidades depois de 10 chamadas", async () => {
    for (let i = 0; i < 10; i++) {
      await criarServicosLocais().dados.prepararPrimeiroUso();
    }
    expect(await contar()).toEqual(ESPERADO);
  });

  it("não duplica com chamadas simultâneas", async () => {
    const resultados = await Promise.all([
      criarServicosLocais().dados.prepararPrimeiroUso(),
      criarServicosLocais().dados.prepararPrimeiroUso(),
    ]);
    expect(resultados.filter((r) => r.criou)).toHaveLength(1);
    expect(await contar()).toEqual(ESPERADO);
  });

  it("não recria uma área arquivada", async () => {
    const servicos = criarServicosLocais();
    await servicos.dados.prepararPrimeiroUso();
    const [primeira] = await servicos.areas.listar();
    await servicos.areas.excluir(primeira.id);

    expect(await servicos.dados.prepararPrimeiroUso()).toEqual({ criou: false });
    const ativas = await servicos.areas.listar();
    expect(ativas).toHaveLength(5);
    expect(ativas.some((area) => area.nome === primeira.nome)).toBe(false);
  });
});
