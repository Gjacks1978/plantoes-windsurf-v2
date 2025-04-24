"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import { Plus, Edit, Trash2 } from "lucide-react";
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
  
  // Estado para controlar o modal de plantão
  const [modalAberto, setModalAberto] = useState(false);
  const [plantaoParaEditar, setPlantaoParaEditar] = useState<Plantao | undefined>(undefined);

  // Navegação de mês
  function handlePrevMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setDate(null);
  }
  function handleNextMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setDate(null);
  }

  // Obter plantões com base na data selecionada ou no mês atual
  const plantoesDodia = date ? obterPlantoesPorData(date) : [];
  
  // Obter plantões do mês atual
  const plantoesDoMes = obterPlantoesPorMes(
    currentMonth.getMonth(),
    currentMonth.getFullYear()
  );
  
  // Obter próximos plantões (a partir de hoje)
  const hoje = new Date();
  const proximosPlantoes = plantoes
    .filter(p => p.data >= hoje)
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .slice(0, 5); // Limitar a 5 próximos plantões
  
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

  // Função para formatar o mês/ano
  function getMonthYear(date: Date) {
    return format(date, "MMMM yyyy", { locale: ptBR });
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-20">
      {/* Header roxo/lilás */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-purple to-purple-light text-white px-4 pt-8 pb-6 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-purple-dark/30 transition">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="text-2xl font-bold tracking-tight capitalize select-none">
            {getMonthYear(currentMonth)}
          </h1>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-purple-dark/30 transition">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>

      {/* Calendário centralizado */}
      <div className="flex flex-col items-center mt-[-2.5rem] mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-xs animate-in-fade">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={ptBR}
            className="w-full"
            modifiersClassNames={{
              selected: "!bg-purple !text-white !font-bold",
              today: "!border-purple !text-purple-dark",
            }}
            showOutsideDays={false}
          />
        </div>
      </div>

      {/* Lista de plantões */}
      <div className="mt-6">
        {date ? (
          <>
            <h2 className="text-lg font-medium mb-3">
              Plantões em {format(date, "dd 'de' MMMM", { locale: ptBR })}
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
