export type EventoTipo =
  | "social"
  | "formatura"
  | "reuniao"
  | "escolha"
  | "almoco"
  | "aniversario"
  | "hospedagem_republica"
  | "aluguel_espaco_festa"
  | "outro";

export type PresencaStatus = "pendente" | "vai" | "nao_vai";

export type Evento = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: EventoTipo;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type EventoPresenca = {
  id: string;
  evento_id: string;
  morador_id: string;
  status: PresencaStatus;
  observacao: string | null;
  respondido_em: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type EventoPresencaComMorador = EventoPresenca & {
  morador: {
    id: string;
    nome: string;
  };
};

export type EventoComPresencas = Evento & {
  presencas: EventoPresencaComMorador[];
};

export type EventosStats = {
  total: number;
  proximos: number;
  passados: number;
  hoje: number;
  noMes: number;
  pendentesResposta: number;
};

export type EventosPageData = {
  todos: EventoComPresencas[];
  proximos: EventoComPresencas[];
  passados: EventoComPresencas[];
  eventosDoMes: EventoComPresencas[];
  stats: EventosStats;
};
