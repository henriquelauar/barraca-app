import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CaixinhaPageActions } from "@/components/caixinha/caixinha-page-actions";
import {
  listarComprasCaixinha,
  listarContasFixasCaixinha,
  listarMoradoresAtivosCaixinha,
  removerCompraCaixinha,
  CompraCaixinha,
} from "@/lib/actions/caixinha";
import { calcularResumoCaixinha } from "@/lib/utils/caixinha";

function primeiroDiaDoMes(data = new Date()) {
  return new Date(data.getFullYear(), data.getMonth(), 1).toISOString().slice(0, 10);
}

function formatarMoeda(valor: number | string) {
  const numero = typeof valor === "number" ? valor : Number(valor);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(numero);
}

function formatarMesExtenso(mesISO: string) {
  const [ano, mes] = mesISO.split("-").map(Number);
  const data = new Date(ano, mes - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(data);
}

function extrairMorador(relacao?: CompraCaixinha["pagador"]) {
  if (!relacao) return null;
  return Array.isArray(relacao) ? relacao[0] ?? null : relacao;
}

function listarNomesDivisao(compra: CompraCaixinha) {
  const divisoes = Array.isArray(compra.divisoes) ? compra.divisoes : [];

  const nomes = divisoes
    .map((item) => extrairMorador(item.morador))
    .filter(
      (
        morador
      ): morador is {
        id: string;
        nome: string;
        ordem_exibicao?: number | null;
      } => Boolean(morador?.id)
    )
    .sort((a, b) => {
      const ordemA = a.ordem_exibicao ?? 999;
      const ordemB = b.ordem_exibicao ?? 999;

      if (ordemA !== ordemB) {
        return ordemA - ordemB;
      }

      return a.nome.localeCompare(b.nome, "pt-BR");
    })
    .map((morador) => morador.nome);

  return nomes.join(", ");
}

function getSaldoVariant(valor: number) {
  if (valor < 0) return "success" as const;
  if (valor > 0) return "danger" as const;
  return "neutral" as const;
}

async function removerCompraAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await removerCompraCaixinha(id);
}

function CompactTable({
  headers,
  children,
  minWidth = "min-w-[640px]",
}: {
  headers: string[];
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${minWidth} text-sm`}>
        <thead>
          <tr className="border-b border-zinc-800 text-left text-[11px] uppercase tracking-wide text-zinc-500">
            {headers.map((header) => (
              <th key={header} className="px-2.5 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function MobileInfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}

export default async function CaixinhaPage() {
  const mesReferencia = primeiroDiaDoMes();

  const [moradores, contasFixas, compras] = await Promise.all([
    listarMoradoresAtivosCaixinha(),
    listarContasFixasCaixinha(mesReferencia),
    listarComprasCaixinha(mesReferencia),
  ]);

  const resumo = calcularResumoCaixinha({
    moradores,
    contasFixas,
    compras,
  });

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Caixinha"
        description={`Fechamento de ${formatarMesExtenso(mesReferencia)}.`}
        action={
          <CaixinhaPageActions
            contas={contasFixas}
            moradores={moradores}
            mesReferencia={mesReferencia}
          />
        }
      />

      <SectionCard title="Resumo" description="Totais do mês.">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Fixo</p>
            <p className="mt-1 text-sm font-semibold text-white md:text-lg">
              {formatarMoeda(resumo.total_fixo)}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Variável</p>
            <p className="mt-1 text-sm font-semibold text-white md:text-lg">
              {formatarMoeda(resumo.total_variavel)}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Geral</p>
            <p className="mt-1 text-sm font-semibold text-white md:text-lg">
              {formatarMoeda(resumo.total_geral)}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contas fixas" description="Valores deste mês.">
        {contasFixas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-4 text-sm text-zinc-400">
            Nenhuma conta fixa cadastrada.
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {contasFixas.map((conta) => (
                <div
                key={conta.id}
                className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5"
                >
                <p className="line-clamp-2 text-[11px] font-medium leading-4 text-white">
                    {conta.nome}
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-200">
                    {formatarMoeda(conta.valor)}
                </p>
                </div>
            ))}
            </div>
        )}
      </SectionCard>

      <SectionCard title="Compras variáveis" description="Lançamentos deste mês.">
        {compras.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-4 text-sm text-zinc-400">
            Nenhuma compra variável cadastrada neste mês.
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <CompactTable
                headers={["Compra", "Pagador", "Divisão", "Valor", "Ações"]}
                minWidth="min-w-[860px]"
              >
                {compras.map((compra) => {
                  const pagador = extrairMorador(compra.pagador);

                  return (
                    <tr
                      key={compra.id}
                      className="border-b border-zinc-900 last:border-0"
                    >
                      <td className="px-2.5 py-2 font-medium text-white">
                        {compra.nome_compra}
                      </td>
                      <td className="px-2.5 py-2 text-zinc-300">
                        {compra.quem_pagou_tipo === "casa"
                          ? "Casa"
                          : pagador?.nome ?? "Morador"}
                      </td>
                      <td className="px-2.5 py-2 text-zinc-400">
                        {listarNomesDivisao(compra)}
                      </td>
                      <td className="px-2.5 py-2 text-zinc-300">
                        {formatarMoeda(compra.valor)}
                      </td>
                      <td className="px-2.5 py-2">
                        <form action={removerCompraAction}>
                          <input type="hidden" name="id" value={compra.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-rose-500/20 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/10"
                          >
                            Remover
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </CompactTable>
            </div>

            <div className="grid gap-2 lg:hidden">
              {compras.map((compra) => {
                const pagador = extrairMorador(compra.pagador);

                return (
                  <div
                    key={compra.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {compra.nome_compra}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {formatarMoeda(compra.valor)}
                        </p>
                      </div>

                      <form action={removerCompraAction}>
                        <input type="hidden" name="id" value={compra.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-rose-500/20 px-2 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/10"
                        >
                          Remover
                        </button>
                      </form>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      <MobileInfoRow
                        label="Pagador"
                        value={
                          compra.quem_pagou_tipo === "casa"
                            ? "Casa"
                            : pagador?.nome ?? "Morador"
                        }
                      />
                      <MobileInfoRow
                        label="Divisão"
                        value={listarNomesDivisao(compra)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="Fechamento" description="Saldo por morador neste mês.">
        {resumo.resumo.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-4 text-sm text-zinc-400">
            Nenhum morador ativo encontrado.
          </div>
        ) : (
          <>
            <div className="hidden lg:block rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
              <CompactTable
                headers={["Morador", "Base", "Reajuste", "Saldo"]}
                minWidth="min-w-[760px]"
              >
                {resumo.resumo.map((item) => (
                  <tr
                    key={item.morador_id}
                    className="border-b border-zinc-900 last:border-0"
                  >
                    <td className="px-2.5 py-2 font-medium text-white">
                      {item.nome}
                    </td>
                    <td className="px-2.5 py-2 text-zinc-300">
                      {formatarMoeda(item.valor_base)}
                    </td>
                    <td className="px-2.5 py-2 text-zinc-300">
                      {formatarMoeda(item.reajuste)}
                    </td>
                    <td className="px-2.5 py-2 font-semibold text-white">
                      {formatarMoeda(item.valor_final)}
                    </td>
                  </tr>
                ))}
              </CompactTable>
            </div>

            <div className="grid gap-2 lg:hidden">
              {resumo.resumo.map((item) => (
                <div
                  key={item.morador_id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {item.nome}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Base: {formatarMoeda(item.valor_base)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                        Reajuste
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {formatarMoeda(item.reajuste)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                        Saldo
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {formatarMoeda(item.valor_final)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}