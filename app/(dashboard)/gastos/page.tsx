import { AddGastoForm } from "@/components/gastos/add-gasto-form";
import { AddPagamentoForm } from "@/components/gastos/add-pagamento-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  listarGastos,
  listarMoradoresAtivosParaGastos,
  listarPagamentos,
  listarResumoSaldos,
  listarTransferenciasResumo,
  removerGasto,
  removerPagamento,
} from "@/lib/actions/gastos";

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

function formatarDestino(
  destinos: Array<{
    tipo_destino: "casa" | "morador";
    morador?: { nome: string } | { nome: string }[] | null;
  }>
) {
  if (!destinos?.length) return "Sem destino";

  const temCasa = destinos.some((destino) => destino.tipo_destino === "casa");
  if (temCasa) return "Casa";

  const nomes = destinos
    .map((destino) => {
      const morador = destino.morador;
      if (Array.isArray(morador)) return morador[0]?.nome;
      return morador?.nome;
    })
    .filter(Boolean);

  return nomes.join(", ");
}

function getSaldoVariant(valor: number) {
  if (valor > 0) return "success";
  if (valor < 0) return "danger";
  return "neutral";
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
  const [gastos, moradores, pagamentos, resumoSaldos, transferencias] =
    await Promise.all([
      listarGastos(),
      listarMoradoresAtivosParaGastos(),
      listarPagamentos(),
      listarResumoSaldos(),
      listarTransferenciasResumo(),
    ]);

  const total = gastos.reduce((acc, gasto) => acc + Number(gasto.valor_total), 0);
  const totalPagamentos = pagamentos.reduce(
    (acc, pagamento) => acc + Number(pagamento.valor),
    0
  );
  const maioresCredores = resumoSaldos.filter((item) => item.saldo > 0).length;
  const maioresDevedores = resumoSaldos.filter((item) => item.saldo < 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos"
        description="Registre despesas, acompanhe saldos, visualize quem deve para quem e controle as quitações da Barraca Armada."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total em gastos"
          value={formatarMoeda(total)}
          helper="Soma de todos os gastos registrados"
        />
        <StatCard
          title="Pagamentos registrados"
          value={formatarMoeda(totalPagamentos)}
          helper="Transferências já lançadas"
        />
        <StatCard
          title="Credores"
          value={maioresCredores}
          helper="Moradores com saldo positivo"
        />
        <StatCard
          title="Devedores"
          value={maioresDevedores}
          helper="Moradores com saldo negativo"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Adicionar gasto"
          description="Cadastre uma nova despesa e escolha quem pagou e para quem ela se aplica."
        >
          <div className="module-bar-green mb-5" />
          <AddGastoForm moradores={moradores} />
        </SectionCard>

        <SectionCard
          title="Registrar pagamento"
          description="Lance quitações entre moradores para ajustar os saldos."
        >
          <div className="module-bar-green mb-5" />
          <AddPagamentoForm moradores={moradores} />
        </SectionCard>
      </div>

      <SectionCard
        title="Resumo de saldos"
        description="Visão consolidada do que cada morador pagou, deve e do saldo atual."
      >
        {resumoSaldos.length === 0 ? (
          <div className="empty-state">Nenhum saldo disponível ainda.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resumoSaldos.map((item) => (
              <div
                key={item.morador_id}
                className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{item.nome}</p>
                  <StatusBadge variant={getSaldoVariant(item.saldo) as any}>
                    {item.saldo > 0
                      ? "A receber"
                      : item.saldo < 0
                      ? "Devendo"
                      : "Quitado"}
                  </StatusBadge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Pagou</span>
                    <span className="font-medium text-slate-900">
                      {formatarMoeda(item.total_pago)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Deve</span>
                    <span className="font-medium text-slate-900">
                      {formatarMoeda(item.total_devido)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                    <span className="font-medium text-slate-700">Saldo</span>
                    <span
                      className={`font-semibold ${
                        item.saldo > 0
                          ? "text-emerald-600"
                          : item.saldo < 0
                          ? "text-rose-600"
                          : "text-slate-700"
                      }`}
                    >
                      {formatarMoeda(item.saldo)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Quem deve para quem"
        description="Encontro de contas simplificado para facilitar as quitações."
      >
        {transferencias.length === 0 ? (
          <div className="empty-state">Ninguém deve nada no momento.</div>
        ) : (
          <div className="space-y-3">
            {transferencias.map((item, index) => (
              <div
                key={`${item.de_morador_id}-${item.para_morador_id}-${index}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="text-sm text-slate-700">
                  <strong>{item.de_nome}</strong> deve{" "}
                  <strong>{formatarMoeda(item.valor)}</strong> para{" "}
                  <strong>{item.para_nome}</strong>
                </div>

                <StatusBadge variant="warning">Pendente</StatusBadge>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={`Lista de gastos (${gastos.length})`}
        description="Todos os gastos registrados com informações de pagador, destino e valor."
      >
        {gastos.length === 0 ? (
          <div className="empty-state">Nenhum gasto cadastrado ainda.</div>
        ) : (
          <div className="data-table-wrapper">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Gasto</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th>Quem pagou</th>
                    <th>Destino</th>
                    <th className="text-right">Valor</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {gastos.map((gasto) => {
                    const pagador = Array.isArray(gasto.pagador)
                      ? gasto.pagador[0]
                      : gasto.pagador;

                    return (
                      <tr key={gasto.id}>
                        <td>
                          <div>
                            <p className="font-medium text-slate-900">
                              {gasto.nome}
                            </p>
                            {gasto.descricao ? (
                              <p className="mt-1 text-xs text-slate-500">
                                {gasto.descricao}
                              </p>
                            ) : null}
                          </div>
                        </td>

                        <td>
                          <StatusBadge variant="info">
                            {gasto.categoria || "Sem categoria"}
                          </StatusBadge>
                        </td>

                        <td>{formatarData(gasto.data_gasto)}</td>

                        <td>{pagador?.nome || "Não informado"}</td>

                        <td>{formatarDestino(gasto.destinos || [])}</td>

                        <td className="text-right font-semibold text-slate-900">
                          {formatarMoeda(gasto.valor_total)}
                        </td>

                        <td className="text-right">
                          <form action={removerGastoAction}>
                            <input type="hidden" name="id" value={gasto.id} />
                            <Button type="submit" variant="destructive" size="sm">
                              Remover
                            </Button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={`Histórico de pagamentos (${pagamentos.length})`}
        description="Pagamentos já registrados entre moradores."
      >
        {pagamentos.length === 0 ? (
          <div className="empty-state">
            Nenhum pagamento registrado ainda.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quem pagou</th>
                    <th>Quem recebeu</th>
                    <th>Data</th>
                    <th>Observação</th>
                    <th className="text-right">Valor</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {pagamentos.map((pagamento) => {
                    const deMorador = Array.isArray(pagamento.de_morador)
                      ? pagamento.de_morador[0]
                      : pagamento.de_morador;

                    const paraMorador = Array.isArray(pagamento.para_morador)
                      ? pagamento.para_morador[0]
                      : pagamento.para_morador;

                    return (
                      <tr key={pagamento.id}>
                        <td>{deMorador?.nome || "Morador"}</td>
                        <td>{paraMorador?.nome || "Morador"}</td>
                        <td>{formatarData(pagamento.data_pagamento)}</td>
                        <td>{pagamento.observacao || "—"}</td>
                        <td className="text-right font-semibold text-slate-900">
                          {formatarMoeda(pagamento.valor)}
                        </td>
                        <td className="text-right">
                          <form action={removerPagamentoAction}>
                            <input type="hidden" name="id" value={pagamento.id} />
                            <Button type="submit" variant="destructive" size="sm">
                              Remover
                            </Button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}