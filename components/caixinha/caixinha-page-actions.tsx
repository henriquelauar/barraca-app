"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ContaFixaCaixinha,
  MoradorCaixinha,
} from "@/lib/actions/caixinha";
import { ModalShell } from "@/components/caixinha/modal-shell";
import { EditFixedExpensesForm } from "@/components/caixinha/edit-fixed-expenses-form";
import { AddCompraForm } from "@/components/caixinha/add-compra-form";

type CaixinhaPageActionsProps = {
  contas: ContaFixaCaixinha[];
  moradores: MoradorCaixinha[];
  mesReferencia: string;
};

export function CaixinhaPageActions({
  contas,
  moradores,
  mesReferencia,
}: CaixinhaPageActionsProps) {
  const [fixedModalOpen, setFixedModalOpen] = useState(false);
  const [compraModalOpen, setCompraModalOpen] = useState(false);

  return (
    <>
      <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
        <Button onClick={() => setCompraModalOpen(true)}>
          Nova compra
        </Button>

        <Button
          onClick={() => setFixedModalOpen(true)}
          variant="outline"
        >
          Editar fixas
        </Button>
      </div>

      <ModalShell
        open={fixedModalOpen}
        onClose={() => setFixedModalOpen(false)}
        title="Editar contas fixas"
        description="Esses valores serão salvos somente neste mês."
      >
        <EditFixedExpensesForm contas={contas} mesReferencia={mesReferencia}onSuccess={() => setFixedModalOpen(false)} />
      </ModalShell>

      <ModalShell
        open={compraModalOpen}
        onClose={() => setCompraModalOpen(false)}
        title="Nova compra variável"
        description="Esse lançamento será salvo somente neste mês."
      >
        <AddCompraForm moradores={moradores} mesReferencia={mesReferencia} onSuccess={() => setCompraModalOpen(false)} />
      </ModalShell>
    </>
  );
}