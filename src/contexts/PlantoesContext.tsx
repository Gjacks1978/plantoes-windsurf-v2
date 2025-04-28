"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Plantao } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { isSameDay, format } from "date-fns";

// Dados iniciais para exemplo
const plantoesIniciais: Plantao[] = [
  {
    id: "1",
    title: "Plantão UTI",
    local: "1", // ID do Hospital Central
    data: new Date(),
    horaInicio: "07:00",
    horaFim: "19:00",
    valor: 1200,
    pago: true,
  },
  {
    id: "2",
    title: "Plantão Emergência",
    local: "2", // ID do Hospital São Lucas
    data: new Date(),
    horaInicio: "19:00",
    horaFim: "07:00",
    valor: 1500,
    pago: false,
  },
  {
    id: "3",
    title: "Plantão Pediatria",
    local: "3", // ID do Hospital Infantil
    data: new Date(new Date().setDate(new Date().getDate() + 1)), // Amanhã
    horaInicio: "07:00",
    horaFim: "19:00", 
    valor: 1300,
    pago: false,
  },
];

// Interface do contexto
interface PlantoesContextType {
  plantoes: Plantao[];
  adicionarPlantao: (plantao: Omit<Plantao, "id">) => void;
  atualizarPlantao: (id: string, plantao: Partial<Plantao>) => void;
  removerPlantao: (id: string) => void;
  obterPlantaoPorId: (id: string) => Plantao | undefined;
  obterPlantoesPorData: (data: Date) => Plantao[];
  obterPlantoesPorMes: (mes: number, ano: number) => Plantao[];
  marcarComoPago: (id: string) => void;
}

// Criação do contexto
const PlantoesContext = createContext<PlantoesContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const usePlantoes = () => {
  const context = useContext(PlantoesContext);
  if (!context) {
    throw new Error("usePlantoes deve ser usado dentro de um PlantoesProvider");
  }
  return context;
};

// Provider do contexto
export function PlantoesProvider({ children }: { children: ReactNode }) {
  // Estado para armazenar os plantões
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const plantoesArmazenados = localStorage.getItem("plantoes-dados");
    if (plantoesArmazenados) {
      // Converter as strings de data para objetos Date
      const dados = JSON.parse(plantoesArmazenados, (key, value) => {
        // Verificar se a propriedade é 'data' e o valor é uma string
        if (key === 'data' && typeof value === 'string') {
          return new Date(value);
        }
        return value;
      });
      setPlantoes(dados);
    } else {
      // Inicializar com array vazio se não houver dados armazenados
      setPlantoes([]);
    }
  }, []);

  // Salvar dados no localStorage quando mudar
  useEffect(() => {
    // Apenas salvar se houver plantões (evitar salvar array vazio inicial)
    // Ou se o array estiver vazio APÓS uma remoção (para persistir o estado vazio)
    const plantoesArmazenados = localStorage.getItem("plantoes-dados");
    if (plantoes.length > 0 || (plantoes.length === 0 && plantoesArmazenados)) {
      localStorage.setItem("plantoes-dados", JSON.stringify(plantoes));
    } else if (plantoes.length === 0 && !plantoesArmazenados) {
      // Se iniciou vazio e não há nada salvo, não salva nada ainda
    } else {
       // Caso especial: se o array está vazio e havia dados antes, remove a chave
       localStorage.removeItem("plantoes-dados");
    }
  }, [plantoes]);

  // Adicionar um novo plantão
  const adicionarPlantao = (plantao: Omit<Plantao, "id">) => {
    const novoPlantao = {
      ...plantao,
      id: uuidv4(),
    };
    setPlantoes((prev) => [...prev, novoPlantao]);
  };

  // Atualizar um plantão existente
  const atualizarPlantao = (id: string, plantao: Partial<Plantao>) => {
    setPlantoes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...plantao } : item))
    );
  };

  // Remover um plantão
  const removerPlantao = (id: string) => {
    setPlantoes((prev) => prev.filter((plantao) => plantao.id !== id));
  };

  // Obter um plantão pelo ID
  const obterPlantaoPorId = (id: string) => {
    return plantoes.find((plantao) => plantao.id === id);
  };

  // Obter plantões por data
  const obterPlantoesPorData = (data: Date) => {
    return plantoes.filter((plantao) => isSameDay(plantao.data, data));
  };

  // Obter plantões por mês
  const obterPlantoesPorMes = (mes: number, ano: number) => {
    return plantoes.filter((plantao) => {
      const dataPlantao = new Date(plantao.data);
      return dataPlantao.getMonth() === mes && dataPlantao.getFullYear() === ano;
    });
  };

  // Marcar um plantão como pago
  const marcarComoPago = (id: string) => {
    atualizarPlantao(id, { pago: true });
  };

  // Valor do contexto
  const value = {
    plantoes,
    adicionarPlantao,
    atualizarPlantao,
    removerPlantao,
    obterPlantaoPorId,
    obterPlantoesPorData,
    obterPlantoesPorMes,
    marcarComoPago,
  };

  return (
    <PlantoesContext.Provider value={value}>{children}</PlantoesContext.Provider>
  );
}
