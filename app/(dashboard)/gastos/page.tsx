import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GastosPageActions } from "@/components/gastos/gastos-modals";
import {
  listarGastos,
  listarMoradoresAtivosParaGastos,
  listarPagamentos,
  listarResumoSaldos,
  listarTransferenciasResumo,
  removerGasto,
  removerPagamento,
} from "@/lib/actions/gastos";

type RelacaoMorador =
  | {
      id: string;
      nome: string;
    }
  | {
      id: string;
      nome: string;
    }[]
  | null
  | undefined;

type DestinoGasto = {
  id?: string;
  tipo_destino: "casa" | "morador";
  morador?: RelacaoMorador;
  morador_id?: string | null;
};

type Gasto = {
  id: string;
  nome: string;
  descricao: string | null;
  valor_total: number | string;
  categoria: string | null;
  data_gasto: string;
  pagador?: RelacaoMorador;
  destinos?: DestinoGasto[];
};

type Pagamento = {
  id: string;
  valor: number | string;
  data_pagamento: string;
  observacao: string | null;
  de_morador?: RelacaoMorador;
  para_morador?: RelacaoMorador;
};

type ResumoSaldo = {
  morador_id: string;
  nome: string;
  total_pago: number;
  total_devido: number;
  saldo: number;
};

type TransferenciaResumo = {
  de_morador_id: string;
  de_nome: string;
  para_morador_id: string;
  para_nome: string;
  valor: number;
};

function formatarMoeda(valor: number | string) {
  const numero = typeof valor === "number" ? valor : Number(valor);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(data));
}

function extrairMorador(relacao?: RelacaoMorador) {
  if (!relacao) return null;
  return Array.isArray(relacao) ? relacao[0] ?? null : relacao;
}

function formatarDestino(destinos: DestinoGasto[] = []) {
  if (!destinos.length) return "Sem destino";

  const temCasa = destinos.some((destino) => destino.tipo_destino === "casa");
  if (temCasa) return "Casa";

  const nomes = destinos
    .map((destino) => extrairMorador(destino.morador)?.nome)
    .filter((nome): nome is string => Boolean(nome));

  return nomes.length > 0 ? nomes.join(", ") : "Sem destino";
}

function getSaldoVariant(valor: number) {
  if (valor > 0) return "success" as const;
  if (valor < 0) return "danger" as const;
  return "neutral" as const;
}

async function removerGastoAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;
  await removerGasto(id);
}

async function removerPagamentoAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;
  await removerPagamento(id);
}

export default async function GastosPage() {
  const [gastosRaw, moradores, pagamentosRaw, resumoSaldosRaw, transferenciasRaw] =
    await Promise.all([
      listarGastos(),
      listarMoradoresAtivosParaGastos(),
      listarPagamentos(),
      listarResumoSaldos(),
      listarTransferenciasResumo(),
    ]);

  const gastos = (gastosRaw ?? []) as Gasto[];
  const pagamentos = (pagamentosRaw ?? []) as Pagamento[];
  const resumoSaldos = (resumoSaldosRaw ?? []) as ResumoSaldo[];
  const transferencias = (transferenciasRaw ?? []) as TransferenciaResumo[];

  const total = gastos.reduce((acc, gasto) => acc + Number(gasto.valor_total), 0);

  const totalPagamentos = pagamentos.reduce(
    (acc, pagamento) => acc + Number(pagamento.valor),
    0
  );

  const maioresCredores = resumoSaldos.filter((item) => item.saldo > 0).length;
  const maioresDevedores = resumoSaldos.filter((item) => item.saldo < 0).length;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Gastos"
        description="Controle financeiro da casa com visão de despesas, pagamentos, saldos e transferências pendentes."
        action={<GastosPageActions moradores={moradores} />}
      />

      <SectionCard
        title="Gastos lançados"
        description="No desktop você tem tabela. No celular, leitura em cards."
      >
        {gastos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
            Nenhum gasto cadastrado ainda.
          </div>
        ) : (
          <>
            <div className="hidden xl:block overflow-x-auto">
              <table className="table-dark min-w-[1100px]">
                <thead>
                  <tr>
                    <th>Gasto</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th>Quem pagou</th>
                    <th>Destino</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto) => {
                    const pagador = extrairMorador(gasto.pagador);

                    return (
                      <tr key={gasto.id}>
                        <td className="min-w-[260px]">
                          <div className="space-y-1">
                            <p className="font-semibold text-white">{gasto.nome}</p>
                            {gasto.descricao ? (
                              <p className="text-sm text-zinc-500">{gasto.descricao}</p>
                            ) : null}
                          </div>
                        </td>
                        <td>{gasto.categoria || "Sem categoria"}</td>
                        <td>{formatarData(gasto.data_gasto)}</td>
                        <td>{pagador?.nome || "Não informado"}</td>
                        <td>{formatarDestino(gasto.destinos)}</td>
                        <td className="font-semibold text-white">
                          {formatarMoeda(gasto.valor_total)}
                        </td>
                        <td>
                          <form action={removerGastoAction}>
                            <input type="hidden" name="id" value={gasto.id} />
                            <button
                              type="submit"
                              className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                            >
                              Remover
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 xl:hidden">
              {gastos.map((gasto) => {
                const pagador = extrairMorador(gasto.pagador);

                return (
                  <div
                    key={gasto.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-white">
                          {gasto.nome}
                        </h3>
                        {gasto.descricao ? (
                          <p className="text-sm leading-6 text-zinc-500">
                            {gasto.descricao}
                          </p>
                        ) : null}
                      </div>

                      <p className="text-base font-bold text-white">
                        {formatarMoeda(gasto.valor_total)}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                          Categoria
                        </p>
                        <p className="mt-1 text-sm text-zinc-200">
                          {gasto.categoria || "Sem categoria"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                          Data
                        </p>
                        <p className="mt-1 text-sm text-zinc-200">
                          {formatarData(gasto.data_gasto)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                          Quem pagou
                        </p>
                        <p className="mt-1 text-sm text-zinc-200">
                          {pagador?.nome || "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                          Destino
                        </p>
                        <p className="mt-1 text-sm text-zinc-200">
                          {formatarDestino(gasto.destinos)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <form action={removerGastoAction}>
                        <input type="hidden" name="id" value={gasto.id} />
                        <button
                          type="submit"
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                        >
                          Remover
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Quem deve para quem"
          description="Resumo direto das transferências pendentes."
        >
          {transferencias.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
              Ninguém deve nada no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {transferencias.map((item, index) => (
                <div
                  key={`${item.de_nome}-${item.para_nome}-${index}`}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-300">
                      <span className="font-semibold text-white">{item.de_nome}</span>{" "}
                      deve{" "}
                      <span className="font-semibold text-white">
                        {formatarMoeda(item.valor)}
                      </span>{" "}
                      para{" "}
                      <span className="font-semibold text-white">{item.para_nome}</span>
                    </p>
                  </div>

                  <StatusBadge variant="warning">Pendente</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Resumo de saldos"
          description="Quem está a receber, devendo ou quitado."
        >
          {resumoSaldos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
              Nenhum saldo disponível ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {resumoSaldos.map((item) => (
                <div
                  key={item.morador_id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-white">{item.nome}</h3>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge variant={getSaldoVariant(item.saldo)}>
                          {item.saldo > 0
                            ? "A receber"
                            : item.saldo < 0
                            ? "Devendo"
                            : "Quitado"}
                        </StatusBadge>
                      </div>
                    </div>

                    <p
                      className={`text-lg font-bold ${
                        item.saldo > 0
                          ? "text-emerald-300"
                          : item.saldo < 0
                          ? "text-rose-300"
                          : "text-zinc-200"
                      }`}
                    >
                      {formatarMoeda(item.saldo)}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        Pagou
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-100">
                        {formatarMoeda(item.total_pago)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        Deve
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-100">
                        {formatarMoeda(item.total_devido)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Pagamentos registrados"
        description="Transferências entre moradores já lançadas no sistema."
      >
        {pagamentos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
            Nenhum pagamento registrado ainda.
          </div>
        ) : (
          <div className="space-y-4">
            {pagamentos.map((pagamento) => {
              const deMorador = extrairMorador(pagamento.de_morador);
              const paraMorador = extrairMorador(pagamento.para_morador);

              return (
                <div
                  key={pagamento.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-white">
                        {deMorador?.nome || "Não informado"} →{" "}
                        {paraMorador?.nome || "Não informado"}
                      </h3>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <p className="text-sm text-zinc-400">
                          <span className="text-zinc-500">Valor:</span>{" "}
                          <span className="font-semibold text-white">
                            {formatarMoeda(pagamento.valor)}
                          </span>
                        </p>

                        <p className="text-sm text-zinc-400">
                          <span className="text-zinc-500">Data:</span>{" "}
                          <span className="text-zinc-200">
                            {formatarData(pagamento.data_pagamento)}
                          </span>
                        </p>
                      </div>

                      {pagamento.observacao ? (
                        <p className="text-sm leading-6 text-zinc-500">
                          {pagamento.observacao}
                        </p>
                      ) : null}
                    </div>

                    <form action={removerPagamentoAction}>
                      <input type="hidden" name="id" value={pagamento.id} />
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                      >
                        Remover
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}