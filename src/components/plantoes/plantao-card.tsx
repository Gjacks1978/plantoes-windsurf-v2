"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { Plantao, Local } from '@/types';

interface PlantaoCardProps {
  plantao: Plantao;
  onEdit: (plantao: Plantao) => void;
  onDelete: (id: string) => void;
  onTogglePago?: (id: string) => void;
  local?: Local;
}

export default function PlantaoCard({ plantao, onEdit, onDelete, onTogglePago, local }: PlantaoCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Formatar data do plantão
  const dataFormatada = format(new Date(plantao.data), "dd 'de' MMMM", { locale: ptBR });
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
          onDelete(plantao.id);
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
        <Card className="animate-in-slide relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit(plantao)}>
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: local?.cor || "hsl(var(--purple))" }} />
          <CardContent className="py-1 px-4 pl-6">
            <div className="flex justify-between items-start mb-0.5">
              <div>
                <h3 className="font-medium text-black">{plantao.title || `Plantão em ${local?.nome || 'Local não especificado'}`}</h3>
                <p className="text-xs text-muted-foreground">{local?.nome || "Local não encontrado"}</p>
                <p className="text-xs text-muted-foreground">{dataFormatada}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-sm font-semibold text-slate-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plantao.valor || 0)}
                </div>
                <Badge variant="outline" className={`text-xs py-0 px-2 ${plantao.pago ? "bg-success/20 text-success border-success/30" : "bg-amber-500/20 text-amber-700 border-amber-500/30"}`}>
                  {plantao.pago ? "Pago" : "Pendente"}
                </Badge>
                {onTogglePago && (
                  <div className="mt-1" onClick={(e) => {
                    e.stopPropagation(); // Evitar que o clique propague para o card
                    onTogglePago(plantao.id);
                  }}>
                    <Switch 
                      checked={plantao.pago} 
                      className="scale-90 data-[state=checked]:bg-success"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
