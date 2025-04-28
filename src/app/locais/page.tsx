"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocais } from "@/contexts/LocaisContext";
import { Local } from "@/types";
import { LocalFormDialog } from "@/components/locais/local-form-dialog";
import { toast } from "sonner";

// Interface para as props do card de local
interface LocalCardProps {
  local: Local;
  onEdit: (local: Local) => void;
  onDelete: (local: Local) => void;
}

// Componente de card para exibir um local
function LocalCard({ local, onEdit, onDelete }: LocalCardProps) {
  return (
    <Card className="overflow-hidden relative">
      <div 
        className="absolute left-0 top-0 bottom-0 w-2" 
        style={{ backgroundColor: local.cor }}
      />
      <CardContent className="p-4 pl-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{local.nome}</h3>
            <p className="text-sm text-muted-foreground">{local.endereco}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(local)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(local)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LocaisPage() {
  const { locais, removerLocal } = useLocais();
  
  // Estado para controlar o modal de local
  const [modalAberto, setModalAberto] = useState(false);
  const [localParaEditar, setLocalParaEditar] = useState<Local | undefined>(undefined);

  // Abrir modal para adicionar local
  const abrirModalAdicionar = () => {
    setLocalParaEditar(undefined);
    setModalAberto(true);
  };

  // Abrir modal para editar local
  const abrirModalEditar = (local: Local) => {
    setLocalParaEditar(local);
    setModalAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false);
    setLocalParaEditar(undefined);
  };

  // Excluir local
  const excluirLocal = (local: Local) => {
    // Verificar se há plantões associados a este local (implementação futura)
    if (confirm(`Tem certeza que deseja excluir o local "${local.nome}"?`)) {
      removerLocal(local.id);
      toast.success("Local excluído com sucesso!");
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Locais de Plantão</h1>
        <Button 
          className="bg-purple hover:bg-purple-dark"
          onClick={abrirModalAdicionar}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {locais.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum local cadastrado. Clique em "Adicionar" para cadastrar um novo local.
        </div>
      ) : (
        <div className="grid gap-4">
          {locais.map((local) => (
            <LocalCard 
              key={local.id} 
              local={local} 
              onEdit={abrirModalEditar}
              onDelete={excluirLocal}
            />
          ))}
        </div>
      )}
      
      {/* Modal de formulário de local */}
      <LocalFormDialog 
        isOpen={modalAberto} 
        onClose={fecharModal} 
        localParaEditar={localParaEditar} 
      />
    </div>
  );
}
