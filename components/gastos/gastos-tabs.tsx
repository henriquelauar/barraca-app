"use client";

import { useMemo, useState } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";

type Morador = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  user_id?: string | null;
};

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

type DivisaoGasto = {
  id?: string;
  valor_devido?: number | string;
  valor_pago?: number | string;
  morador?: RelacaoMorador;
};

type Gasto = {
  id: string;
  nome: string;
  valor_total: number | string;
  data_gasto: string;
  criado_por?: string | null;
  pagador?: RelacaoMorador;
  destinos?: DestinoGasto[];
  divisoes?: DivisaoGasto[];
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

type GastosTabsProps = {
  moradores: Morador[];
  gastos: Gasto[];
  pagamentos: Pagamento[];
  resumoSaldos: ResumoSaldo[];
  transferencias: TransferenciaResumo[];
  currentMoradorId: string | null;
  currentMoradorNome: string | null;
  totalGastos: number;
  totalPagamentos: number;
  maioresCredores: number;
  maioresDevedores: number;
  onRemoverGasto: (id: string) => Promise<void>;
  onRemoverPagamento: (id: string) => Promise<void>;
};

type Aba = "meu-resumo" | "geral" | "pagamentos";

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
  if (!destinos.length) return "Sem divisão";

  const nomes = destinos
    .map((destino) => extrairMorador(destino.morador)?.nome)
    .filter((nome): nome is string => Boolean(nome));

  return nomes.length > 0 ? nomes.join(", ") : "Sem divisão";
}

function getSaldoVariant(valor: number) {
  if (valor > 0) return "success" as const;
  if (valor < 0) return "danger" as const;
  return "neutral" as const;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
      {text}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative";
}) {
  const valueClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "negative"
      ? "text-rose-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>
      {hint ? <p className="mt-2 text-sm text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function GastosTabs({
  moradores,
  gastos,
  pagamentos,
  resumoSaldos,
  transferencias,
  currentMoradorId,
  currentMoradorNome,
  totalGastos,
  totalPagamentos,
  maioresCredores,
  maioresDevedores,
  onRemoverGasto,
  onRemoverPagamento,
}: GastosTabsProps) {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("meu-resumo");

  const meuResumo = useMemo(() => {
    const meuSaldo =
      resumoSaldos.find((item) => item.morador_id === currentMoradorId) ?? null;

    const euDevo = transferencias.filter(
      (item) => item.de_morador_id === currentMoradorId
    );

    const devemParaMim = transferencias.filter(
      (item) => item.para_morador_id === currentMoradorId
    );

    const gastosRelacionados = gastos.filter((gasto) => {
      const pagador = extrairMorador(gasto.pagador);
      const estouNosDestinos = (gasto.destinos ?? []).some(
        (destino) => destino.morador_id === currentMoradorId
      );

      return pagador?.id === currentMoradorId || estouNosDestinos;
    });

    const totalDevo = euDevo.reduce((acc, item) => acc + Number(item.valor), 0);
    const totalRecebo = devemParaMim.reduce(
      (acc, item) => acc + Number(item.valor),
      0
    );

    return {
      meuSaldo,
      euDevo,
      devemParaMim,
      gastosRelacionados,
      totalDevo,
      totalRecebo,
    };
  }, [currentMoradorId, gastos, resumoSaldos, transferencias]);

  function nomeCriador(moradorId?: string | null) {
    if (!moradorId) return "Não identificado";
    if (moradorId === currentMoradorId) return "Você";

    const morador = moradores.find((item) => item.id === moradorId);
    return morador?.nome || "Não identificado";
  }

  return (
    <div className="space-y-6">
      <div className="top-[92px] z-30 -mx-1 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/90 p-1 backdrop-blur">
        <div className="flex min-w-max gap-1">
          <button
            type="button"
            onClick={() => setAbaAtiva("meu-resumo")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              abaAtiva === "meu-resumo"
                ? "bg-amber-500 text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            Meu resumo
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("geral")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              abaAtiva === "geral"
                ? "bg-amber-500 text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            Geral
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("pagamentos")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              abaAtiva === "pagamentos"
                ? "bg-amber-500 text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            Pagamentos
          </button>
        </div>
      </div>

      {abaAtiva === "meu-resumo" ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Você tem a receber"
              value={formatarMoeda(meuResumo.totalRecebo)}
              tone="positive"
              hint="Total que outros moradores ainda precisam te pagar."
            />
            <StatCard
              label="Você deve"
              value={formatarMoeda(meuResumo.totalDevo)}
              tone="negative"
              hint="Total pendente de pagamentos seus para a casa."
            />
            <StatCard
              label="Saldo líquido"
              value={formatarMoeda(meuResumo.meuSaldo?.saldo ?? 0)}
              tone={
                (meuResumo.meuSaldo?.saldo ?? 0) > 0
                  ? "positive"
                  : (meuResumo.meuSaldo?.saldo ?? 0) < 0
                  ? "negative"
                  : "default"
              }
              hint={
                currentMoradorNome
                  ? `Resumo consolidado de ${currentMoradorNome}.`
                  : "Seu saldo consolidado."
              }
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Você deve"
              description="Cobranças pendentes que precisam ser acertadas por você."
            >
              {meuResumo.euDevo.length === 0 ? (
                <EmptyState text="Você não tem pagamentos pendentes no momento." />
              ) : (
                <div className="space-y-3">
                  {meuResumo.euDevo.map((item, index) => (
                    <div
                      key={`${item.de_morador_id}-${item.para_morador_id}-${index}`}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-zinc-300">
                            Você deve{" "}
                            <span className="font-semibold text-white">
                              {formatarMoeda(item.valor)}
                            </span>{" "}
                            para{" "}
                            <span className="font-semibold text-white">
                              {item.para_nome}
                            </span>
                          </p>
                        </div>

                        <StatusBadge variant="warning">Pendente</StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Devem para você"
              description="Valores que outros moradores ainda precisam te pagar."
            >
              {meuResumo.devemParaMim.length === 0 ? (
                <EmptyState text="Ninguém está te devendo no momento." />
              ) : (
                <div className="space-y-3">
                  {meuResumo.devemParaMim.map((item, index) => (
                    <div
                      key={`${item.de_morador_id}-${item.para_morador_id}-${index}`}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-zinc-300">
                            <span className="font-semibold text-white">
                              {item.de_nome}
                            </span>{" "}
                            te deve{" "}
                            <span className="font-semibold text-white">
                              {formatarMoeda(item.valor)}
                            </span>
                          </p>
                        </div>

                        <StatusBadge variant="success">A receber</StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Gastos que te impactam"
            description="Lançamentos recentes em que você participou ou foi quem pagou."
          >
            {meuResumo.gastosRelacionados.length === 0 ? (
              <EmptyState text="Nenhum gasto relacionado a você foi encontrado." />
            ) : (
              <div className="space-y-4">
                {meuResumo.gastosRelacionados.map((gasto) => {
                  const pagador = extrairMorador(gasto.pagador);
                  const podeRemover = gasto.criado_por === currentMoradorId;

                  return (
                    <div
                      key={gasto.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <h3 className="text-base font-semibold text-white">
                              {gasto.nome}
                            </h3>
                            <p className="text-xs text-zinc-500">
                              Criado por {nomeCriador(gasto.criado_por)}
                            </p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <p className="text-sm text-zinc-400">
                              <span className="text-zinc-500">Data:</span>{" "}
                              <span className="text-zinc-200">
                                {formatarData(gasto.data_gasto)}
                              </span>
                            </p>
                            <p className="text-sm text-zinc-400">
                              <span className="text-zinc-500">Quem pagou:</span>{" "}
                              <span className="text-zinc-200">
                                {pagador?.nome || "Não informado"}
                              </span>
                            </p>
                            <p className="text-sm text-zinc-400 sm:col-span-2">
                              <span className="text-zinc-500">Dividido com:</span>{" "}
                              <span className="text-zinc-200">
                                {formatarDestino(gasto.destinos)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 md:items-end">
                          <p className="text-lg font-bold text-white">
                            {formatarMoeda(gasto.valor_total)}
                          </p>

                          {podeRemover ? (
                            <form
                              action={async () => {
                                await onRemoverGasto(gasto.id);
                              }}
                            >
                              <button
                                type="submit"
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                              >
                                Remover
                              </button>
                            </form>
                          ) : (
                            <p className="text-xs text-zinc-500">
                              Só quem criou pode remover.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      ) : null}

      {abaAtiva === "geral" ? (
        <div className="space-y-6">

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Quem deve para quem"
              description="Resumo direto das transferências pendentes."
            >
              {transferencias.length === 0 ? (
                <EmptyState text="Ninguém deve nada no momento." />
              ) : (
                <div className="space-y-3">
                  {transferencias.map((item, index) => (
                    <div
                      key={`${item.de_nome}-${item.para_nome}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm text-zinc-300">
                          <span className="font-semibold text-white">
                            {item.de_nome}
                          </span>{" "}
                          deve{" "}
                          <span className="font-semibold text-white">
                            {formatarMoeda(item.valor)}
                          </span>{" "}
                          para{" "}
                          <span className="font-semibold text-white">
                            {item.para_nome}
                          </span>
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
                <EmptyState text="Nenhum saldo disponível ainda." />
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-1 lg:grid-cols-2">
                  {resumoSaldos.map((item) => (
                    <div
                      key={item.morador_id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-white">
                            {item.nome}
                          </h3>
                        </div>

                        <StatusBadge variant={getSaldoVariant(item.saldo)}>
                          {item.saldo > 0
                            ? "A receber"
                            : item.saldo < 0
                            ? "Devendo"
                            : "Quitado"}
                        </StatusBadge>
                      </div>

                      <p
                        className={`mt-3 text-xl font-bold ${
                          item.saldo > 0
                            ? "text-emerald-300"
                            : item.saldo < 0
                            ? "text-rose-300"
                            : "text-zinc-200"
                        }`}
                      >
                        {formatarMoeda(item.saldo)}
                      </p>

                      <div className="mt-3 space-y-2">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                            Pagou
                          </p>
                          <p className="mt-1 text-sm font-semibold text-zinc-100">
                            {formatarMoeda(item.total_pago)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
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
            title="Gastos lançados"
            description="Lista completa dos gastos da república."
          >
            {gastos.length === 0 ? (
              <EmptyState text="Nenhum gasto cadastrado ainda." />
            ) : (
              <div className="space-y-4">
                {gastos.map((gasto) => {
                  const pagador = extrairMorador(gasto.pagador);
                  const podeRemover = gasto.criado_por === currentMoradorId;

                  return (
                    <div
                      key={gasto.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <h3 className="text-base font-semibold text-white">
                              {gasto.nome}
                            </h3>
                            <p className="text-xs text-zinc-500">
                              Criado por {nomeCriador(gasto.criado_por)}
                            </p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <p className="text-sm text-zinc-400">
                              <span className="text-zinc-500">Data:</span>{" "}
                              <span className="text-zinc-200">
                                {formatarData(gasto.data_gasto)}
                              </span>
                            </p>
                            <p className="text-sm text-zinc-400">
                              <span className="text-zinc-500">Quem pagou:</span>{" "}
                              <span className="text-zinc-200">
                                {pagador?.nome || "Não informado"}
                              </span>
                            </p>
                            <p className="text-sm text-zinc-400 sm:col-span-2">
                              <span className="text-zinc-500">Dividido com:</span>{" "}
                              <span className="text-zinc-200">
                                {formatarDestino(gasto.destinos)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 md:items-end">
                          <p className="text-lg font-bold text-white">
                            {formatarMoeda(gasto.valor_total)}
                          </p>

                          {podeRemover ? (
                            <form
                              action={async () => {
                                await onRemoverGasto(gasto.id);
                              }}
                            >
                              <button
                                type="submit"
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                              >
                                Remover
                              </button>
                            </form>
                          ) : (
                            <p className="text-xs text-zinc-500">
                              Só quem criou pode remover.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      ) : null}

      {abaAtiva === "pagamentos" ? (
        <SectionCard
          title="Pagamentos registrados"
          description="Transferências entre moradores já lançadas no sistema."
        >
          {pagamentos.length === 0 ? (
            <EmptyState text="Nenhum pagamento registrado ainda." />
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

                      <form
                        action={async () => {
                          await onRemoverPagamento(pagamento.id);
                        }}
                      >
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
      ) : null}
    </div>
  );
}