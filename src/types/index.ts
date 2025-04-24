// Tipos comuns usados em todo o app

// Tipo para um local de plantão (hospital)
export type Local = {
  id: string;
  nome: string;
  endereco: string;
  cor: string;
};

// Tipo para um plantão
export type Plantao = {
  id: string;
  title: string;
  local: string; // ID do local
  data: Date;
  horaInicio: string;
  horaFim: string;
  valor: number;
  pago: boolean;
  observacoes?: string;
};

// Tipo para resumo financeiro mensal
export type ResumoMensal = {
  mes: number;
  ano: number;
  totalPlantoes: number;
  totalHoras: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
};
