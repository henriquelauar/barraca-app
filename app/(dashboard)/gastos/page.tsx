import { PageHeader } from "@/components/ui/page-header";
import { GastosPageActions } from "@/components/gastos/gastos-modals";
import { GastosTabs } from "@/components/gastos/gastos-tabs";
import { createClient } from "@/lib/supabase/server";
import {
  listarGastos,
  listarMoradoresAtivosParaGastos,
  listarPagamentos,
  listarResumoSaldos,
  listarTransferenciasResumo,
  removerGasto,
  removerPagamento,
} from "@/lib/actions/gastos";

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

function formatarMoeda(valor: number | string) {
  const numero = typeof valor === "number" ? valor : Number(valor);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [gastosRaw, moradoresRaw, pagamentosRaw, resumoSaldosRaw, transferenciasRaw] =
    await Promise.all([
      listarGastos(),
      listarMoradoresAtivosParaGastos(),
      listarPagamentos(),
      listarResumoSaldos(),
      listarTransferenciasResumo(),
    ]);

  const moradores = (moradoresRaw ?? []) as Morador[];
  const gastos = (gastosRaw ?? []) as Gasto[];
  const pagamentos = (pagamentosRaw ?? []) as Pagamento[];
  const resumoSaldos = (resumoSaldosRaw ?? []) as ResumoSaldo[];
  const transferencias = (transferenciasRaw ?? []) as TransferenciaResumo[];

  const moradorAtual =
    moradores.find((morador) => morador.user_id === user?.id) ?? null;

  const total = gastos.reduce((acc, gasto) => acc + Number(gasto.valor_total), 0);
  const totalPagamentos = pagamentos.reduce(
    (acc, pagamento) => acc + Number(pagamento.valor),
    0
  );

  const maioresCredores = resumoSaldos.filter((item) => item.saldo > 0).length;
  const maioresDevedores = resumoSaldos.filter((item) => item.saldo < 0).length;

  const saldoAtual =
    resumoSaldos.find((item) => item.morador_id === moradorAtual?.id) ?? null;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="top-0 z-40 -mx-4 border-b border-zinc-800 bg-[rgb(9,9,11)]/92 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
        <PageHeader
          title="Gastos"
          description={
            saldoAtual
              ? `Seu saldo atual: ${formatarMoeda(saldoAtual.saldo)}`
              : "Controle financeiro da casa com despesas, pagamentos e saldos."
          }
          action={
            <GastosPageActions
              moradores={moradores}
              currentMoradorId={moradorAtual?.id ?? null}
              currentMoradorNome={moradorAtual?.nome ?? null}
            />
          }
        />
      </div>

      <GastosTabs
        moradores={moradores}
        gastos={gastos}
        pagamentos={pagamentos}
        resumoSaldos={resumoSaldos}
        transferencias={transferencias}
        currentMoradorId={moradorAtual?.id ?? null}
        currentMoradorNome={moradorAtual?.nome ?? null}
        totalGastos={total}
        totalPagamentos={totalPagamentos}
        maioresCredores={maioresCredores}
        maioresDevedores={maioresDevedores}
        onRemoverGasto={async (id) => {
          "use server";
          const formData = new FormData();
          formData.set("id", id);
          await removerGastoAction(formData);
        }}
        onRemoverPagamento={async (id) => {
          "use server";
          const formData = new FormData();
          formData.set("id", id);
          await removerPagamentoAction(formData);
        }}
      />
    </div>
  );
}