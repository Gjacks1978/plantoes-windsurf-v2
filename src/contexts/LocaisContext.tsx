"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Local } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Dados iniciais para exemplo
const locaisIniciais: Local[] = [
  {
    id: "1",
    nome: "Hospital Central",
    endereco: "Av. Principal, 1000",
    cor: "#4CAF50", // verde
  },
  {
    id: "2",
    nome: "Hospital São Lucas",
    endereco: "Rua das Flores, 123",
    cor: "#2196F3", // azul
  },
  {
    id: "3",
    nome: "Hospital Infantil",
    endereco: "Av. das Crianças, 500",
    cor: "#9C27B0", // roxo
  },
];

// Interface do contexto
interface LocaisContextType {
  locais: Local[];
  adicionarLocal: (local: Omit<Local, "id">) => void;
  atualizarLocal: (id: string, local: Partial<Local>) => void;
  removerLocal: (id: string) => void;
  obterLocalPorId: (id: string) => Local | undefined;
}

// Criação do contexto
const LocaisContext = createContext<LocaisContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useLocais = () => {
  const context = useContext(LocaisContext);
  if (!context) {
    throw new Error("useLocais deve ser usado dentro de um LocaisProvider");
  }
  return context;
};

// Provider do contexto
export function LocaisProvider({ children }: { children: ReactNode }) {
  // Estado para armazenar os locais
  const [locais, setLocais] = useState<Local[]>([]);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const locaisArmazenados = localStorage.getItem("plantoes-locais");
    if (locaisArmazenados) {
      setLocais(JSON.parse(locaisArmazenados));
    } else {
      // Inicializar com array vazio se não houver dados armazenados
      setLocais([]);
    }
  }, []);

  // Salvar dados no localStorage quando mudar
  useEffect(() => {
    // Apenas salvar se houver locais (evitar salvar array vazio inicial)
    // Ou se o array estiver vazio APÓS uma remoção (para persistir o estado vazio)
    const locaisArmazenados = localStorage.getItem("plantoes-locais");
    if (locais.length > 0 || (locais.length === 0 && locaisArmazenados)) {
      localStorage.setItem("plantoes-locais", JSON.stringify(locais));
    } else if (locais.length === 0 && !locaisArmazenados) {
      // Se iniciou vazio e não há nada salvo, não salva nada ainda
    } else {
      // Caso especial: se o array está vazio e havia dados antes, remove a chave
      localStorage.removeItem("plantoes-locais");
    }
  }, [locais]);

  // Adicionar um novo local
  const adicionarLocal = (local: Omit<Local, "id">) => {
    const novoLocal = {
      ...local,
      id: uuidv4(),
    };
    setLocais((prev) => [...prev, novoLocal]);
  };

  // Atualizar um local existente
  const atualizarLocal = (id: string, local: Partial<Local>) => {
    setLocais((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...local } : item))
    );
  };

  // Remover um local
  const removerLocal = (id: string) => {
    setLocais((prev) => prev.filter((local) => local.id !== id));
  };

  // Obter um local pelo ID
  const obterLocalPorId = (id: string) => {
    return locais.find((local) => local.id === id);
  };

  // Valor do contexto
  const value = {
    locais,
    adicionarLocal,
    atualizarLocal,
    removerLocal,
    obterLocalPorId,
  };

  return (
    <LocaisContext.Provider value={value}>{children}</LocaisContext.Provider>
  );
}
