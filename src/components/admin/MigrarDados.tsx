import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Ajuste os nomes das tabelas e campos conforme sua estrutura
const tabelas = [
  { nome: 'locais', chave: 'locais-app-dados' },
  { nome: 'plantoes', chave: 'plantoes-app-dados' },
];

export default function MigrarDados() {
  const [migrando, setMigrando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const migrar = async () => {
    setMigrando(true);
    let totalMigrado = 0;
    for (const tabela of tabelas) {
      const dadosLocais = localStorage.getItem(tabela.chave);
      if (dadosLocais) {
        try {
          const dados = JSON.parse(dadosLocais);
          if (Array.isArray(dados) && dados.length > 0) {
            const { error } = await supabase.from(tabela.nome).insert(dados);
            if (error) {
              toast.error(`Erro ao migrar para ${tabela.nome}: ${error.message}`);
            } else {
              totalMigrado += dados.length;
              toast.success(`${dados.length} registros migrados para ${tabela.nome}`);
            }
          }
        } catch (e) {
          toast.error(`Erro ao processar dados de ${tabela.nome}`);
        }
      }
    }
    setMigrando(false);
    setResultado(`Migração concluída. Total migrado: ${totalMigrado}`);
  };

  return (
    <div className="p-4 border rounded shadow max-w-md mx-auto mt-8">
      <h2 className="font-bold text-lg mb-2">Migrar dados do localStorage para Supabase</h2>
      <button
        className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 disabled:opacity-50"
        onClick={migrar}
        disabled={migrando}
      >
        {migrando ? 'Migrando...' : 'Migrar Dados'}
      </button>
      {resultado && <p className="mt-4 text-green-700">{resultado}</p>}
      <p className="text-xs text-gray-500 mt-2">Execute esta ação apenas uma vez após a atualização do app.</p>
    </div>
  );
}
