"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Plantao } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { isSameDay, format } from "date-fns";
import { toast } from "sonner";

// Chave para armazenamento no localStorage
const STORAGE_KEY = "plantoes-app-dados";

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
  resetarDados: () => void; // Nova função para resetar dados
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

// Função para verificar se o localStorage está disponível
const isLocalStorageAvailable = () => {
  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error("localStorage não está disponível:", e);
    return false;
  }
};

// Função auxiliar para salvar no localStorage
const salvarNoLocalStorage = (plantoes: Plantao[]) => {
  if (!isLocalStorageAvailable()) {
    console.error("Não foi possível salvar: localStorage não disponível");
    return;
  }

  try {
    // Serializa explicitamente as datas para strings ISO antes de salvar
    const dadosSerializados = JSON.stringify(plantoes, (key, value) => {
      // Se for uma data, converte para string ISO
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
    localStorage.setItem(STORAGE_KEY, dadosSerializados);
    console.log("Plantões salvos no localStorage:", plantoes.length);
  } catch (error) {
    console.error("Erro ao salvar plantões no localStorage:", error);
    toast.error("Erro ao salvar dados. Verifique o console.");
  }
};

// Função para carregar dados do localStorage
const carregarDoLocalStorage = (): Plantao[] => {
  if (!isLocalStorageAvailable()) {
    console.error("Não foi possível carregar: localStorage não disponível");
    return plantoesIniciais;
  }

  try {
    const dadosArmazenados = localStorage.getItem(STORAGE_KEY);
    if (!dadosArmazenados) {
      console.log("Nenhum dado encontrado no localStorage, usando dados iniciais");
      return plantoesIniciais;
    }

    // Converter as strings de data para objetos Date
    const dados = JSON.parse(dadosArmazenados, (key, value) => {
      if (key === 'data' && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });

    console.log("Plantões carregados do localStorage:", dados.length);
    return Array.isArray(dados) ? dados : plantoesIniciais;
  } catch (error) {
    console.error("Erro ao carregar plantões do localStorage:", error);
    toast.error("Erro ao carregar dados. Usando dados iniciais.");
    return plantoesIniciais;
  }
};

// Provider do contexto
export function PlantoesProvider({ children }: { children: ReactNode }) {
  // Estado para armazenar os plantões
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    if (!initialized) {
      const dadosCarregados = carregarDoLocalStorage();
      setPlantoes(dadosCarregados);
      
      // Se carregou os dados iniciais, salva-os no localStorage
      if (dadosCarregados === plantoesIniciais) {
        salvarNoLocalStorage(plantoesIniciais);
      }
      
      setInitialized(true);
    }
  }, [initialized]);

  // Adicionar um novo plantão
  const adicionarPlantao = (plantao: Omit<Plantao, "id">) => {
    try {
      // Garantir que a data seja um objeto Date válido
      let dataPlantao = plantao.data;
      if (!(dataPlantao instanceof Date) || isNaN(dataPlantao.getTime())) {
        console.warn("Data inválida ao adicionar plantão, usando data atual");
        dataPlantao = new Date();
      }

      const novoPlantao: Plantao = {
        ...plantao,
        data: dataPlantao,
        id: uuidv4(),
      };

      const novosPlantoes = [...plantoes, novoPlantao];
      setPlantoes(novosPlantoes);
      salvarNoLocalStorage(novosPlantoes);
      console.log("Plantão adicionado:", novoPlantao);
      toast.success("Plantão adicionado com sucesso!");
      return novoPlantao;
    } catch (error) {
      console.error("Erro ao adicionar plantão:", error);
      toast.error("Erro ao adicionar plantão.");
      return null;
    }
  };

  // Atualizar um plantão existente
  const atualizarPlantao = (id: string, plantao: Partial<Plantao>) => {
    try {
      // Verificar se o plantão existe
      const plantaoExistente = plantoes.find(p => p.id === id);
      if (!plantaoExistente) {
        console.error("Plantão não encontrado para atualização:", id);
        toast.error("Plantão não encontrado.");
        return false;
      }

      // Garantir que a data seja válida, se fornecida
      if (plantao.data && (!(plantao.data instanceof Date) || isNaN(plantao.data.getTime()))) {
        console.warn("Data inválida ao atualizar plantão, mantendo data original");
        plantao.data = plantaoExistente.data;
      }

      const novosPlantoes = plantoes.map(item => 
        item.id === id ? { ...item, ...plantao } : item
      );
      
      setPlantoes(novosPlantoes);
      salvarNoLocalStorage(novosPlantoes);
      console.log("Plantão atualizado:", id);
      toast.success("Plantão atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar plantão:", error);
      toast.error("Erro ao atualizar plantão.");
      return false;
    }
  };

  // Remover um plantão
  const removerPlantao = (id: string) => {
    try {
      const novosPlantoes = plantoes.filter(plantao => plantao.id !== id);
      setPlantoes(novosPlantoes);
      salvarNoLocalStorage(novosPlantoes);
      console.log("Plantão removido:", id);
      toast.success("Plantão removido com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao remover plantão:", error);
      toast.error("Erro ao remover plantão.");
      return false;
    }
  };

  // Obter um plantão pelo ID
  const obterPlantaoPorId = (id: string) => {
    return plantoes.find(plantao => plantao.id === id);
  };

  // Obter plantões por data
  const obterPlantoesPorData = (data: Date) => {
    if (!data || !(data instanceof Date) || isNaN(data.getTime())) {
      console.warn("Data inválida ao obter plantões por data");
      return [];
    }

    return plantoes.filter(plantao => {
      try {
        // Garantir que a data do plantão seja um objeto Date válido
        const plantaoDate = plantao.data instanceof Date ? 
          plantao.data : new Date(plantao.data);
        
        if (isNaN(plantaoDate.getTime())) {
          console.warn("Data inválida no plantão:", plantao.id);
          return false;
        }
        
        return isSameDay(plantaoDate, data);
      } catch (error) {
        console.error("Erro ao processar data do plantão:", plantao.id, error);
        return false;
      }
    });
  };

  // Obter plantões por mês
  const obterPlantoesPorMes = (mes: number, ano: number) => {
    if (mes < 0 || mes > 11 || !Number.isInteger(mes) || !Number.isInteger(ano)) {
      console.warn("Mês ou ano inválidos ao obter plantões por mês");
      return [];
    }

    return plantoes.filter(plantao => {
      try {
        // Garantir que a data do plantão seja um objeto Date válido
        const plantaoDate = plantao.data instanceof Date ? 
          plantao.data : new Date(plantao.data);
        
        if (isNaN(plantaoDate.getTime())) {
          console.warn("Data inválida no plantão:", plantao.id);
          return false;
        }
        
        return plantaoDate.getMonth() === mes && plantaoDate.getFullYear() === ano;
      } catch (error) {
        console.error("Erro ao processar data do plantão:", plantao.id, error);
        return false;
      }
    });
  };

  // Marcar um plantão como pago
  const marcarComoPago = (id: string) => {
    return atualizarPlantao(id, { pago: true });
  };

  // Resetar dados para os valores iniciais
  const resetarDados = () => {
    try {
      setPlantoes(plantoesIniciais);
      salvarNoLocalStorage(plantoesIniciais);
      console.log("Dados resetados para valores iniciais");
      toast.success("Dados resetados com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao resetar dados:", error);
      toast.error("Erro ao resetar dados.");
      return false;
    }
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
    resetarDados,
  };

  return (
    <PlantoesContext.Provider value={value}>{children}</PlantoesContext.Provider>
  );
}
