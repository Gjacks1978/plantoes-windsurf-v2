"use client";

import { useState, useMemo, useEffect } from "react";
import { ptBR } from "date-fns/locale";
import { format, isSameDay, isSameMonth, isAfter, startOfDay, getDate } from "date-fns";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlantoes } from "@/contexts/PlantoesContext";
import { useLocais } from "@/contexts/LocaisContext";
import { Plantao, Local } from "@/types";
import { PlantaoFormDialog } from "@/components/plantoes/plantao-form-dialog";
import { toast } from "sonner";

// Componente de Card de Plantão com informações do local

interface PlantaoCardProps {
  plantao: Plantao;
  onEdit: (plantao: Plantao) => void;
  onDelete: (plantao: Plantao) => void;
}

function PlantaoCard({ plantao, onEdit, onDelete }: PlantaoCardProps) {
  const formattedDate = format(plantao.data, "dd/MM/yyyy", { locale: ptBR });
  const { locais } = useLocais();
  
  // Encontrar o local do plantão
  const localInfo = locais.find(l => l.id === plantao.local);
  
  return (
    <Card className="mb-3 animate-in-slide relative overflow-hidden">
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: localInfo?.cor || "hsl(var(--purple))" }}
      />
      <CardContent className="p-4 pl-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{plantao.title}</h3>
            <p className="text-sm text-muted-foreground">{localInfo?.nome || "Local não encontrado"}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={plantao.pago ? "bg-success/20 text-success border-success/30" : ""}>
              {plantao.pago ? "Pago" : "Pendente"}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(plantao)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(plantao)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm mt-2 flex justify-between items-center">
          <div className="text-muted-foreground">
            {plantao.horaInicio} - {plantao.horaFim}
          </div>
          <div className="font-medium">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plantao.valor)}
          </div>
        </div>
      </CardContent>
    </Card>
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
      <div className="flex flex-col items-center mb-6 px-4">
        <div className="w-full max-w-md mx-auto animate-in-fade overflow-hidden">
          <CustomCalendar 
            date={date} 
            onDateChange={(newDate) => setDate(newDate)} 
            plantoes={plantoes} 
            locais={locais} 
          />
        </div>
      </div>

      {/* Lista de plantões */}
      <div className="mt-6">
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
