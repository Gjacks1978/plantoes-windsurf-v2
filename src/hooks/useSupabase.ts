import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Hook genérico para buscar dados do Supabase
type TransformFn<T> = (dados: any[]) => T[];
export function useFetchData<T>(
  tabela: string,
  transformarDados: TransformFn<T>,
  ordenarPor?: string
) {
  const [dados, setDados] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setCarregando(true);
        let query = supabase.from(tabela).select('*');
        if (ordenarPor) {
          query = query.order(ordenarPor);
        }
        const { data, error } = await query;
        if (error) throw error;
        if (data) setDados(transformarDados(data));
      } catch (error: any) {
        const erroDetalhado = typeof error === 'object' ? JSON.stringify(error) : String(error);
        console.error(`Erro ao carregar dados de ${tabela}:`, erroDetalhado);
        setErro(erroDetalhado);
        toast.error(`Não foi possível carregar os dados de ${tabela}. Verifique sua conexão, variáveis de ambiente e as policies do Supabase.`);
        // Fallback: tentar localStorage
        const dadosLocais = localStorage.getItem(`${tabela}-app-dados`);
        if (dadosLocais) {
          try {
            const dados = JSON.parse(dadosLocais);
            setDados(transformarDados(dados));
          } catch (e) {
            console.error('Erro ao carregar dados do localStorage:', e);
          }
        }
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, [tabela, ordenarPor, transformarDados]);
  return { dados, carregando, erro };
}

// Funções genéricas para CRUD
export const supabaseActions = {
  async adicionar<T>(tabela: string, dados: any): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(tabela)
        .insert([dados])
        .select()
        .single();
      if (error) throw error;
      toast.success('Item adicionado com sucesso!');
      return data as T;
    } catch (error: any) {
      console.error(`Erro ao adicionar em ${tabela}:`, error);
      toast.error('Não foi possível adicionar o item');
      return null;
    }
  },
  async atualizar(tabela: string, id: string, dados: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(tabela)
        .update(dados)
        .eq('id', id);
      if (error) throw error;
      toast.success('Item atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error(`Erro ao atualizar em ${tabela}:`, error);
      toast.error('Não foi possível atualizar o item');
      return false;
    }
  },
  async remover(tabela: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(tabela)
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Item removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error(`Erro ao remover de ${tabela}:`, error);
      toast.error('Não foi possível remover o item');
      return false;
    }
  }
};
