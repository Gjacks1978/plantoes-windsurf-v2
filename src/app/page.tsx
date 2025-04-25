"use client";

import { useState, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { format, isSameDay, isSameMonth, isAfter, startOfDay, getDate, addMonths, subMonths } from "date-fns";
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
  const { locais } = useLocais();
  
  // Estado para controlar o modal de plantão
  const [modalAberto, setModalAberto] = useState(false);
  const [plantaoParaEditar, setPlantaoParaEditar] = useState<Plantao | undefined>(undefined);

  // Funções para navegação entre meses
  function handlePrevMonth() {
    const prevMonth = subMonths(currentMonth, 1);
    setCurrentMonth(prevMonth);
  }

  function handleNextMonth() {
    const nextMonth = addMonths(currentMonth, 1);
    setCurrentMonth(nextMonth);
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

  // Função para formatar o mês/ano
  function getMonthYear(date: Date) {
    return format(date, "MMMM yyyy", { locale: ptBR });
  }
  


  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-20">
      {/* Header roxo/lilás */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-purple to-purple-light text-white px-4 pt-8 pb-6 rounded-b-3xl shadow-md mb-8">
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
      <div className="flex flex-col items-center mb-6 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-md mx-auto animate-in-fade">
          <div className="relative calendar-container">
            {/* Cabeçalho do calendário com navegação personalizada */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePrevMonth} 
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Mês anterior"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="text-sm text-gray-500 uppercase tracking-wide">
                {format(currentMonth, 'MMM yyyy', { locale: ptBR })}
              </div>
              <button 
                onClick={handleNextMonth} 
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Próximo mês"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            </div>
            
            {/* Calendário */}
            <DatePicker
              selected={date}
              onChange={(date: Date | null) => date && setDate(date)}
              inline
              locale={ptBR}
              showMonthYearPicker={false}
              showFullMonthYearPicker={false}
              showTwoColumnMonthYearPicker={false}
              showFourColumnMonthYearPicker={false}
              monthsShown={1}
              fixedHeight
              disabledKeyboardNavigation
              renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => {
                // Não renderizamos o cabeçalho padrão, pois temos o nosso próprio
                return <></>;
              }}
              renderDayContents={(day, date) => {
                if (!date) return day;
                
                // Verificar se há plantões nesta data
                const plantoesNaData = plantoes.filter(plantao => 
                  isSameDay(new Date(plantao.data), date)
                );
                
                // Encontrar os locais dos plantões para obter as cores
                const cores = plantoesNaData.map(plantao => {
                  const local = locais.find(l => l.id === plantao.local);
                  return local?.cor || "hsl(var(--purple))";
                });
                
                return (
                  <div className="relative h-8 flex flex-col items-center justify-center">
                    <div>{day}</div>
                    {plantoesNaData.length > 0 && (
                      <div className="absolute -bottom-1 flex gap-[2px] justify-center">
                        {cores.slice(0, 3).map((cor, i) => (
                          <div 
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cor }}
                          />
                        ))}
                        {plantoesNaData.length > 3 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            
            {/* Legenda */}
            <div className="mt-3 text-xs text-center text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple"></div>
                  <span>Plantões agendados</span>
                </div>
              </div>
            </div>
            
            {/* Estilos personalizados para o calendário */}
            <style jsx global>{`
              /* Estilos gerais do datepicker */
              .react-datepicker {
                font-family: inherit;
                border: none;
                border-radius: 0.5rem;
                width: 100%;
                background-color: transparent;
              }
              
              .react-datepicker__month-container {
                width: 100%;
              }
              
              /* Esconder o header padrão */
              .react-datepicker__header {
                background-color: transparent;
                border-bottom: none;
                padding-top: 0.5rem;
              }
              
              /* Estilo dos dias da semana */
              .react-datepicker__day-name {
                color: #6b7280;
                font-weight: 500;
                font-size: 0.75rem;
                width: 2rem;
                margin: 0.2rem;
              }
              
              /* Estilo dos dias */
              .react-datepicker__day {
                width: 2rem;
                height: 2rem;
                line-height: 2rem;
                margin: 0.2rem;
                border-radius: 0.375rem;
                color: #374151;
              }
              
              /* Hover nos dias */
              .react-datepicker__day:hover {
                background-color: #f3f4f6;
                border-radius: 0.375rem;
              }
              
              /* Dia selecionado */
              .react-datepicker__day--selected {
                background-color: hsl(var(--purple)) !important;
                color: white !important;
                font-weight: 500;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              
              /* Forçar o fundo roxo para a data selecionada */
              .react-datepicker__day.react-datepicker__day--selected {
                background-color: hsl(var(--purple)) !important;
                color: white !important;
              }
              
              /* Dia atual */
              .react-datepicker__day--today {
                background-color: #f3f4f6 !important;
                color: #111827 !important;
                font-weight: 500;
              }
              
              /* Dia atual quando selecionado */
              .react-datepicker__day--today.react-datepicker__day--selected {
                background-color: hsl(var(--purple)) !important;
                color: white !important;
              }
              
              /* Corrigir problema de cores */
              .react-datepicker__day {
                background-color: transparent !important;
              }
              
              /* Garantir que a data selecionada tenha fundo roxo */
              .react-datepicker__day.react-datepicker__day--keyboard-selected {
                background-color: transparent !important;
              }
              
              .react-datepicker__day.react-datepicker__day--selected {
                background-color: hsl(var(--purple)) !important;
              }
              
              /* Dias fora do mês atual */
              .react-datepicker__day--outside-month {
                color: #9ca3af;
              }
              
              /* Ajustes para dispositivos móveis */
              @media (max-width: 640px) {
                .react-datepicker__day,
                .react-datepicker__day-name {
                  width: 1.7rem;
                  height: 1.7rem;
                  line-height: 1.7rem;
                  margin: 0.1rem;
                }
              }
            `}</style>
          </div>
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
