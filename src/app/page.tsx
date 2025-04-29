"use client";

import { useState, useMemo } from 'react';
import { format, isSameDay, isSameMonth, isAfter, isBefore, startOfDay, startOfMonth, endOfMonth, getDate, addDays, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { usePlantoes } from '@/contexts/PlantoesContext';
import { useLocais } from '@/contexts/LocaisContext';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { Button } from '@/components/ui/button';
import PlantaoCard from '@/components/plantoes/plantao-card';
import { PlantaoFormDialog } from '@/components/plantoes/plantao-form-dialog';
import { toast } from 'sonner';

interface Plantao {
  id: string;
  title: string;
  local: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  valor?: number;
  status?: string;
  observacoes?: string;
  pago?: boolean;
  corPlantao?: string;
}

export default function Home() {
  const {
    plantoes,
    adicionarPlantao,
    atualizarPlantao,
    removerPlantao,
    obterPlantoesPorData,
    obterPlantoesPorMes,
    marcarComoPago
  } = usePlantoes();
  const { locais } = useLocais();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [date, setDate] = useState<Date | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [plantaoParaEditar, setPlantaoParaEditar] = useState<any | undefined>(undefined);

  const hoje = useMemo(() => startOfDay(new Date()), []);

  // --- Variáveis Booleanas Auxiliares ---
  const isPastMonthView = useMemo(() => {
    const startOfCurrentCalendarMonth = startOfMonth(currentMonth);
    const startOfCurrentRealMonth = startOfMonth(hoje);
    return isBefore(startOfCurrentCalendarMonth, startOfCurrentRealMonth);
  }, [currentMonth, hoje]);

  const isFutureMonthView = useMemo(() => {
    const startOfCurrentCalendarMonth = startOfMonth(currentMonth);
    const startOfCurrentRealMonth = startOfMonth(hoje);
    return isAfter(startOfCurrentCalendarMonth, startOfCurrentRealMonth);
  }, [currentMonth, hoje]);

  const isCurrentMonthView = useMemo(() => {
    return !isPastMonthView && !isFutureMonthView;
  }, [isPastMonthView, isFutureMonthView]);

  const isTodaySelected = useMemo(() => {
    return date ? isSameDay(date, hoje) : false;
  }, [date, hoje]);

  const mesAtualFmt = useMemo(() => currentMonth.getMonth(), [currentMonth]);
  const anoAtualFmt = useMemo(() => currentMonth.getFullYear(), [currentMonth]);

  // --- Hooks useMemo para Listas de Plantões ---
  const plantoesDoDiaSelecionado = useMemo(() => {
    if (!date) return [];
    return plantoes
      .filter((p) => isSameDay(new Date(p.data), date))
      .sort((a, b) => parseInt(a.horaInicio.replace(":", ""), 10) - parseInt(b.horaInicio.replace(":", ""), 10));
  }, [date, plantoes]);

  const plantoesDoMesInteiro = useMemo(() => {
     // Para meses passados/futuros, mostra todos do mês
     if (isPastMonthView || isFutureMonthView) {
        // Filtrar diretamente pelo ano e mês usando o objeto Date
        return plantoes
          .filter(p => {
            // Verificar se p.data é um objeto Date válido
            if (!(p.data instanceof Date) || isNaN(p.data.getTime())) {
                console.warn("[plantoesDoMesInteiro] Skipping plantao due to invalid Date object:", p);
                return false;
            }
            
            const plantaoYear = p.data.getFullYear();
            const plantaoMonth = p.data.getMonth(); // JS months are 0-indexed

            // Compare with the viewed month/year
            return plantaoYear === anoAtualFmt && plantaoMonth === mesAtualFmt;
          })
          .sort((a, b) => {
            // Sorting logic remains the same
            const dataA = a.data; // Already Date objects
            const dataB = b.data;
            // Add checks for invalid dates before getTime
            if (isNaN(dataA.getTime()) || isNaN(dataB.getTime())) return 0; 
            return dataA.getTime() - dataB.getTime() || parseInt(a.horaInicio.replace(":", ""), 10) - parseInt(b.horaInicio.replace(":", ""), 10);
          });
     }
     return []; // Não calcula para mês atual aqui
  }, [plantoes, mesAtualFmt, anoAtualFmt, isPastMonthView, isFutureMonthView]);

  // Plantões passados NO MÊS ATUAL (até ontem, relativo a hoje ou data selecionada)
  const plantoesPassadosNoMesAtual = useMemo(() => {
    if (!isCurrentMonthView) return [];
    // Se hoje estiver selecionado, tecnicamente não há "passados" neste contexto de separação
    if (isTodaySelected) return [];

    // Limite superior é o início do dia de hoje OU o início da data selecionada (se houver)
    const limiteSuperior = date ? startOfDay(date) : startOfDay(hoje);

    return plantoes
      .filter(p => {
         const plantaoDayStart = startOfDay(new Date(p.data));
         // Verifica se o plantão está DENTRO do mês visualizado E ANTES do limite superior
         return isWithinInterval(plantaoDayStart, { 
             start: startOfMonth(currentMonth), 
             end: endOfMonth(currentMonth) 
         }) &&
         isBefore(plantaoDayStart, limiteSuperior);
      })
      .sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataB.getTime() - dataA.getTime() || parseInt(b.horaInicio.replace(":", ""), 10) - parseInt(a.horaInicio.replace(":", ""), 10);
      }); // Mais recentes primeiro
  }, [plantoes, currentMonth, hoje, isCurrentMonthView, date, isTodaySelected]);

  // Plantões futuros NO MÊS ATUAL (a partir de amanhã, relativo a hoje ou data selecionada)
  const plantoesFuturosNoMesAtual = useMemo(() => {
    if (!isCurrentMonthView) return [];

    // Limite inferior é o início do dia SEGUINTE a hoje OU o início do dia SEGUINTE à data selecionada
    const limiteInferior = startOfDay(addDays(date || hoje, 1));

    return plantoes
      .filter(p => {
        const plantaoDayStart = startOfDay(new Date(p.data));
        // Verifica se o plantão está DENTRO do mês visualizado E NÃO É ANTES do limite inferior (ou seja, é igual ou depois)
        return isWithinInterval(plantaoDayStart, { 
            start: startOfMonth(currentMonth), 
            end: endOfMonth(currentMonth) 
        }) &&
        !isBefore(plantaoDayStart, limiteInferior);
      })
      .sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataA.getTime() - dataB.getTime() || parseInt(a.horaInicio.replace(":", ""), 10) - parseInt(b.horaInicio.replace(":", ""), 10);
      });
  }, [plantoes, currentMonth, hoje, isCurrentMonthView, date]);

  // --- Handlers ---
  const abrirModalAdicionar = () => {
    if (date) {
      setPlantaoParaEditar({
        data: date,
        local: '',
        horaInicio: '07:00',
        horaFim: '19:00',
        valor: 0,
        pago: false,
        observacoes: ''
      });
    } else {
      setPlantaoParaEditar(undefined);
    }
    setModalAberto(true);
  };

  const abrirModalEditar = (plantao: Plantao) => {
    setPlantaoParaEditar(plantao);
    setModalAberto(true);
  };

  const excluirPlantao = (id: string) => {
    try {
      removerPlantao(id);
      toast.success("Plantão removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover plantão.");
      console.error("Erro ao remover plantão:", error);
    }
  };

  const handleTogglePago = (id: string) => {
    try {
      marcarComoPago(id);
    } catch (error) {
      toast.error("Erro ao atualizar status de pagamento.");
      console.error("Erro ao marcar como pago:", error);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setPlantaoParaEditar(undefined);
  };

  // --- Funções de Renderização Auxiliares ---
  const renderPlantaoList = (lista: Plantao[], titulo: string, mensagemVazia: string) => {
    if (!lista || lista.length === 0) {
       return null;
    }
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700 px-4">{titulo}</h2>
        <div className="space-y-3 px-4">
          {lista.map((plantao) => (
            <PlantaoCard
              key={plantao.id}
              plantao={plantao}
              local={locais.find(l => l.id === plantao.local)}
              onEdit={() => abrirModalEditar(plantao)}
              onDelete={() => excluirPlantao(plantao.id)}
              onTogglePago={() => handleTogglePago(plantao.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-36">
      {/* Título */}
      <div className="w-full max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-black mb-4 mt-6">Meus Plantões</h1>
      </div>


      {/* Calendário */}
      <div className="shadow-sm mb-4 pb-2 w-full max-w-2xl mx-auto px-4">
          <CustomCalendar
            date={date}
            onDateChange={(newDate: Date | null) => { 
                // If clicking the same date, deselect it
                if (date && newDate && isSameDay(newDate, date)) {
                  setDate(null);
                } else {
                  // Set to new date or null (already handles null correctly)
                  setDate(newDate); 
                  // If a date is selected, update the viewed month to match it
                  if (newDate) {
                    setCurrentMonth(startOfMonth(newDate));
                  }
                }
            }}
            month={currentMonth} 
            onMonthChange={setCurrentMonth} 
            plantoes={plantoes}
            locais={locais}
          />
      </div>

      {/* --- Lógica de Exibição dos Plantões --- */}
      <div className="pb-6">
        {/* Cenário 1 & 2: Mês Passado ou Futuro - Usa a lista pré-filtrada */}        
        {(isPastMonthView || isFutureMonthView) && (
          plantoesDoMesInteiro.length > 0 ? (
            renderPlantaoList(
              plantoesDoMesInteiro, 
              `Plantões em ${format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}`,
              "Nenhum plantão encontrado neste mês."
            )
          ) : (
            <div className="text-center text-muted-foreground py-10 text-base">Nenhum plantão neste mês.</div>
          )
        )}

        {/* Cenário 3: Mês Atual */}        
        {isCurrentMonthView && (
          <>
            {/* Subcenário 3.1: Data específica selecionada */}
            {date && !isTodaySelected && (
                renderPlantaoList(
                    plantoesDoDiaSelecionado,
                    `Plantões em ${format(date, "dd 'de' MMMM", { locale: ptBR })}`,
                    "Nenhum plantão neste dia."
                )
            )}

            {/* Subcenário 3.2: Nenhuma data selecionada (ou hoje selecionado) - mostra Hoje, Futuros, Passados */}
            {(!date || isTodaySelected) && (
              <>
                {renderPlantaoList(
                  plantoesDoDiaSelecionado, 
                  isTodaySelected ? `Plantões de Hoje (${format(hoje, "dd/MM")})` : `Plantões de Hoje (${format(hoje, "dd/MM")})`, 
                  "Nenhum plantão hoje."
                )}
                {renderPlantaoList(
                  plantoesFuturosNoMesAtual,
                  "Próximos plantões no mês",
                  ""
                )}
                {renderPlantaoList(
                  plantoesPassadosNoMesAtual,
                  "Plantões passados no mês",
                  ""
                )}
                {/* Se todas as listas estiverem vazias, mostra mensagem */}
                {plantoesDoDiaSelecionado.length === 0 && plantoesFuturosNoMesAtual.length === 0 && plantoesPassadosNoMesAtual.length === 0 && (
                  <div className="text-center text-muted-foreground py-10 text-base">Nenhum plantão neste mês.</div>
                )}
              </>
            )}
            
            {/* Subcenário 3.3: Data passada selecionada (não hoje) - mostra Passados e Futuros */}
            {date && !isTodaySelected && isBefore(date, hoje) && (
                <>
                    {renderPlantaoList(
                        plantoesFuturosNoMesAtual,
                        "Próximos plantões no mês (após data selecionada)",
                        ""
                    )}
                    {renderPlantaoList(
                        plantoesPassadosNoMesAtual,
                        "Plantões passados no mês (antes da data selecionada)",
                        ""
                    )}
                    {/* Se ambas as listas estiverem vazias, mostra mensagem */}
                    {plantoesFuturosNoMesAtual.length === 0 && plantoesPassadosNoMesAtual.length === 0 && (
                      <div className="text-center text-muted-foreground py-10 text-base">Nenhum plantão neste mês.</div>
                    )}
                </>
            )}

            {/* Subcenário 3.4: Data futura selecionada - mostra Futuros e Passados */}
            {date && !isTodaySelected && isAfter(date, hoje) && (
                 <>
                     {renderPlantaoList(
                        plantoesFuturosNoMesAtual.filter(p => !isSameDay(new Date(p.data), date)),
                        "Outros próximos plantões no mês",
                        ""
                     )}
                     {renderPlantaoList(
                         plantoesPassadosNoMesAtual,
                         "Plantões passados no mês",
                         ""
                     )}
                     {/* Se ambas as listas estiverem vazias, mostra mensagem */}
                     {plantoesFuturosNoMesAtual.filter(p => !isSameDay(new Date(p.data), date)).length === 0 && plantoesPassadosNoMesAtual.length === 0 && (
                       <div className="text-center text-muted-foreground py-10 text-base">Nenhum plantão neste mês.</div>
                     )}
                 </>
            )}
          </>
        )}
      </div>

      {/* Botão Flutuante Redondo Fixo (igual Locais) */}
      <div className="fixed bottom-32 right-6 z-30">
        <Button
          size="icon"
          className="rounded-full h-16 w-16 bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex items-center justify-center"
          onClick={abrirModalAdicionar}
          aria-label="Adicionar Plantão"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>

      {/* Modal de Adicionar/Editar Plantão */}
      <PlantaoFormDialog
        isOpen={modalAberto}
        onClose={fecharModal}
        plantaoParaEditar={plantaoParaEditar}
      />
    </div>
  );
}
