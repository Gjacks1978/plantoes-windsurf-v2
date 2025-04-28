"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ptBR } from "date-fns/locale";
import { format, isSameDay, isSameMonth, isAfter, startOfDay, getDate } from "date-fns";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { usePlantoes } from "@/contexts/PlantoesContext";
import { useLocais } from "@/contexts/LocaisContext";
import { Plantao, Local } from "@/types";
import { PlantaoFormDialog } from "@/components/plantoes/plantao-form-dialog";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";

// Componente de Card de Plantão com informações do local

interface PlantaoCardProps {
  plantao: Plantao;
  onEdit: (plantao: Plantao) => void;
  onDelete: (plantao: Plantao) => void;
}

function PlantaoCard({ plantao, onEdit, onDelete }: PlantaoCardProps) {
  const { atualizarPlantao } = usePlantoes();
  const formattedDate = format(plantao.data, "dd/MM/yyyy", { locale: ptBR });
  const { locais } = useLocais();
  const [offset, setOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Encontrar o local do plantão
  const localInfo = locais.find(l => l.id === plantao.local);
  
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
          onDelete(plantao);
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
          <div 
            className="absolute left-0 top-0 bottom-0 w-1" 
            style={{ backgroundColor: localInfo?.cor || "hsl(var(--purple))" }}
          />
          <CardContent className="py-1 px-4 pl-6">
            <div className="flex justify-between items-start mb-0.5">
              <div>
                <h3 className="font-medium text-purple-dark">{plantao.title}</h3>
                <p className="text-xs text-muted-foreground">{localInfo?.nome || "Local não encontrado"}</p>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-sm font-semibold text-slate-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plantao.valor)}
                </div>
                <Badge variant="outline" className={`text-xs py-0 px-2 ${plantao.pago ? "bg-success/20 text-success border-success/30" : "bg-amber-500/20 text-amber-700 border-amber-500/30"}`}>
                  {plantao.pago ? "Pago" : "Pendente"}
                </Badge>
                <div className="mt-1" onClick={(e) => {
                  e.stopPropagation(); // Evitar que o clique propague para o card
                  const novoStatus = !plantao.pago;
                  atualizarPlantao(plantao.id, { ...plantao, pago: novoStatus });
                  toast.success(`Plantão marcado como ${novoStatus ? 'pago' : 'pendente'}`);
                }}>
                  <Switch 
                    checked={plantao.pago} 
                    className="scale-90 data-[state=checked]:bg-success"
                  />
                </div>
              </div>
            </div>
            <div className="text-xs mt-0.5 flex justify-start items-center">
              <div className="text-muted-foreground">
                {plantao.horaInicio} - {plantao.horaFim}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente Página Principal
export default function Home() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { plantoes, obterPlantoesPorData, obterPlantoesPorMes, removerPlantao } = usePlantoes();
  const { locais } = useLocais();
  
  // Estado para controlar o modal de plantão
  const [modalAberto, setModalAberto] = useState(false);
  const [plantaoParaEditar, setPlantaoParaEditar] = useState<Plantao | undefined>(undefined);

  // Função para navegação entre meses
  function handlePrevMonth() {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  // Obter plantões com base na data selecionada ou no mês atual
  const plantoesDodia = date ? obterPlantoesPorData(date) : [];
  
  // Obter plantões do mês atual
  const plantoesDoMes = obterPlantoesPorMes(
    currentMonth.getMonth(),
    currentMonth.getFullYear()
  );
  
  // Obter próximos plantões do mês atual (a partir de hoje)
  const hoje = new Date();
  const proximosPlantoes = useMemo(() => {
    return plantoes
      .filter(p => {
        // Filtrar plantões que são do mês atual e a partir de hoje
        return isSameMonth(p.data, currentMonth) && isAfter(p.data, startOfDay(hoje));
      })
      .sort((a, b) => a.data.getTime() - b.data.getTime())
      .slice(0, 5); // Limitar a 5 próximos plantões
  }, [plantoes, currentMonth, hoje]);
  
  // Abrir modal para adicionar plantão
  const abrirModalAdicionar = () => {
    setPlantaoParaEditar(undefined);
    setModalAberto(true);
  };
  
  // Abrir modal para editar plantão
  const abrirModalEditar = (plantao: Plantao) => {
    setPlantaoParaEditar(plantao);
    setModalAberto(true);
  };
  
  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false);
    setPlantaoParaEditar(undefined);
  };
  
  // Excluir plantão
  const excluirPlantao = (plantao: Plantao) => {
    if (confirm(`Tem certeza que deseja excluir o plantão "${plantao.title}"?`)) {
      removerPlantao(plantao.id);
      toast.success("Plantão excluído com sucesso!");
    }
  };

  // Função para formatar o mês/ano (mantida para uso futuro)
  function getMonthYear(date: Date) {
    return format(date, "MMMM yyyy", { locale: ptBR });
  }
  


  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-20">
      {/* Removemos o header roxo/lilás para deixar apenas o calendário com topo roxo */}

      {/* Calendário centralizado */}
      <div className="mb-6 px-4">
        <h1 className="text-2xl font-semibold mb-3 text-center">Plantões</h1>
        <div className="w-full mx-auto animate-in-fade overflow-hidden">
          <CustomCalendar 
            date={date} 
            onDateChange={(newDate) => setDate(newDate)} 
            plantoes={plantoes} 
            locais={locais} 
          />
        </div>
      </div>

      {/* Lista de plantões */}
      <div className="mt-6 px-4">
        {date ? (
          <>
            <h2 className="text-lg font-medium mb-3">
              Plantões em {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ''}
            </h2>
            
            {plantoesDodia.length > 0 ? (
              plantoesDodia.map((plantao) => (
                <PlantaoCard
                  key={plantao.id}
                  plantao={plantao}
                  onEdit={abrirModalEditar}
                  onDelete={excluirPlantao}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm mb-6">
                Nenhum plantão nesta data
              </p>
            )}
            
            <h2 className="text-lg font-medium mb-3 mt-6">
              Próximos plantões
            </h2>
            
            {proximosPlantoes.length > 0 ? (
              proximosPlantoes.map((plantao) => (
                <PlantaoCard
                  key={plantao.id}
                  plantao={plantao}
                  onEdit={abrirModalEditar}
                  onDelete={excluirPlantao}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhum plantão agendado
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium mb-3">
              Plantões em {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            
            {plantoesDoMes.length > 0 ? (
              plantoesDoMes.map((plantao) => (
                <PlantaoCard
                  key={plantao.id}
                  plantao={plantao}
                  onEdit={abrirModalEditar}
                  onDelete={excluirPlantao}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm mb-6">
                Nenhum plantão neste mês
              </p>
            )}
            
            <h2 className="text-lg font-medium mb-3 mt-6">
              Próximos plantões
            </h2>
            
            {proximosPlantoes.length > 0 ? (
              proximosPlantoes.map((plantao) => (
                <PlantaoCard
                  key={plantao.id}
                  plantao={plantao}
                  onEdit={abrirModalEditar}
                  onDelete={excluirPlantao}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhum plantão agendado
              </p>
            )}
          </>
        )}
      </div>

      {/* Botão flutuante para adicionar plantão */}
      <Button
        className="fixed bottom-24 right-6 z-40 bg-purple hover:bg-purple-dark text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center text-3xl p-0"
        style={{ boxShadow: '0 8px 24px 0 rgba(149,76,230,0.25)' }}
        aria-label="Adicionar Plantão"
        onClick={abrirModalAdicionar}
      >
        <Plus size={32} />
      </Button>
      
      {/* Modal de formulário de plantão */}
      <PlantaoFormDialog 
        isOpen={modalAberto} 
        onClose={fecharModal} 
        plantaoParaEditar={plantaoParaEditar} 
      />
    </div>
  );
}
