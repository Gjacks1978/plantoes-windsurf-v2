"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocais } from "@/contexts/LocaisContext";
import { Local } from "@/types";
import { LocalFormDialog } from "@/components/locais/local-form-dialog";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";

// Interface para as props do card de local
interface LocalCardProps {
  local: Local;
  onEdit: (local: Local) => void;
  onDelete: (local: Local) => void;
}

// Componente de card para exibir um local
function LocalCard({ local, onEdit, onDelete }: LocalCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Configuração do swipe
  const swipeHandlers = useSwipeable({
    onSwiping: (event) => {
      if (event.dir === "Left") {
        // Limitar o arrasto para no máximo 100px
        const newOffset = Math.min(Math.abs(event.deltaX), 100);
        setOffset(newOffset);
      }
    },
    onSwipedLeft: (event) => {
      if (Math.abs(event.deltaX) >= 100) {
        // Se arrastou mais de 100px, inicia a animação de exclusão
        setIsDeleting(true);
        setTimeout(() => {
          onDelete(local);
        }, 300); // Aguardar a animação terminar antes de excluir
      } else {
        // Se não arrastou o suficiente, volta para a posição original
        setOffset(0);
      }
    },
    onSwipedRight: () => {
      // Volta para a posição original
      setOffset(0);
    },
    trackMouse: false,
    trackTouch: true
  });
  
  // Estilo para o card baseado no offset
  const cardStyle = {
    transform: `translateX(-${offset}px)`,
    transition: isDeleting ? 'transform 0.3s ease, opacity 0.3s ease' : 'transform 0.1s ease',
    opacity: isDeleting ? 0 : 1
  };
  
  // Estilo para o fundo de exclusão
  const deleteBackgroundStyle = {
    opacity: offset > 0 ? 1 : 0,
    transition: 'opacity 0.2s ease'
  };
  
  return (
    <div className="relative mb-1.5 overflow-hidden">
      {/* Fundo vermelho com ícone de lixeira */}
      <div 
        className="absolute inset-0 flex items-center justify-end bg-red-500 text-white pr-4"
        style={deleteBackgroundStyle}
      >
        <Trash2 className="h-6 w-6" />
      </div>
      
      {/* Card deslizável */}
      <div style={cardStyle} {...swipeHandlers}>
        <Card 
          className="overflow-hidden relative cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onEdit(local)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-2" 
            style={{ backgroundColor: local.cor }}
          />
          <CardContent className="py-1 px-4 pl-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-black">{local.nome}</h3>
                <p className="text-xs text-muted-foreground">{local.endereco}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
