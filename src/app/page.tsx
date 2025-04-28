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
  titulo?: string;
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
        // Usar a função do contexto para obter plantões do mês correto
        return obterPlantoesPorMes(mesAtualFmt, anoAtualFmt)
          .sort((a, b) => {
            const dataA = new Date(a.data);
            const dataB = new Date(b.data);
            return dataA.getTime() - dataB.getTime() || parseInt(a.horaInicio.replace(":", ""), 10) - parseInt(b.horaInicio.replace(":", ""), 10);
          });
     }
     return []; // Não calcula para mês atual aqui
  }, [plantoes, mesAtualFmt, anoAtualFmt, isPastMonthView, isFutureMonthView, obterPlantoesPorMes]);

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
    setPlantaoParaEditar(undefined);
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
    <div className="min-h-screen bg-[#f5f6fa] pb-24">
      {/* Calendário */}
      <div className="bg-white shadow-sm mb-4 pb-2 sticky top-0 z-10">
          <CustomCalendar
            date={date}
            onDateChange={setDate}
            plantoes={plantoes}
            locais={locais}
          />
      </div>

      {/* --- Lógica de Exibição dos Plantões --- */}
      <div className="pb-6">
        {/* Cenário 1: Mês Passado */}
        {isPastMonthView && (
          renderPlantaoList(
            plantoesDoMesInteiro,
            `Plantões realizados em ${format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}`,
            "Nenhum plantão realizado neste mês."
          )
        )}

        {/* Cenário 2: Mês Futuro */}
        {isFutureMonthView && (
          renderPlantaoList(
            plantoesDoMesInteiro,
            `Plantões agendados para ${format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}`,
            "Nenhum plantão agendado para este mês."
          )
        )}

        {/* Cenário 3: Mês Atual */}
        {isCurrentMonthView && (
          <>
            {/* 3a: Mês Atual - Nenhuma data selecionada */}
            {!date && (
              <>
                {/* Adicionar plantões de hoje quando nenhuma data estiver selecionada */}
                {renderPlantaoList(
                  plantoes.filter(p => isSameDay(new Date(p.data), hoje))
                    .sort((a, b) => parseInt(a.horaInicio.replace(":", ""), 10) - parseInt(b.horaInicio.replace(":", ""), 10)),
                  "Plantões de hoje",
                  "Nenhum plantão hoje."
                )}
                {renderPlantaoList(plantoesFuturosNoMesAtual, "Próximos plantões", "Nenhum próximo plantão neste mês.")}
                {renderPlantaoList(plantoesPassadosNoMesAtual, "Plantões passados", "Nenhum plantão passado neste mês.")}
                {plantoesFuturosNoMesAtual.length === 0 && 
                 plantoesPassadosNoMesAtual.length === 0 && 
                 plantoes.filter(p => isSameDay(new Date(p.data), hoje)).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-3 px-4">Nenhum plantão neste mês.</p>
                 )}
              </>
            )}

            {/* 3b: Mês Atual - Data de HOJE selecionada */}
            {date && isTodaySelected && (
              <>
                {renderPlantaoList(plantoesDoDiaSelecionado, "Plantões de hoje", "Nenhum plantão hoje.")}
                {plantoesFuturosNoMesAtual.length > 0 && renderPlantaoList(plantoesFuturosNoMesAtual, "Próximos plantões", "")}
              </>
            )}

            {/* 3c: Mês Atual - Outra data (NÃO HOJE) selecionada */}
            {date && !isTodaySelected && (
              <>
                {renderPlantaoList(plantoesDoDiaSelecionado,
                  `Plantões em ${format(date, "dd 'de' MMMM", { locale: ptBR })}`,
                  `Nenhum plantão agendado para ${format(date, "dd/MM")}.`
                )}
                 {isBefore(date, hoje) && plantoesPassadosNoMesAtual.length > 0 && renderPlantaoList(plantoesPassadosNoMesAtual, "Outros plantões passados", "")}
                 {isAfter(date, hoje) && plantoesFuturosNoMesAtual.length > 0 && renderPlantaoList(plantoesFuturosNoMesAtual, "Outros plantões futuros", "")}
                  {plantoesDoDiaSelecionado.length === 0 &&
                   ((isBefore(date, hoje) && plantoesPassadosNoMesAtual.length === 0) ||
                    (isAfter(date, hoje) && plantoesFuturosNoMesAtual.length === 0)) && (
                      <p className="text-muted-foreground text-sm text-center py-3 px-4">Nenhum outro plantão relevante neste mês.</p>
                  )}
              </>
            )}
          </>
        )}
      </div>

      {/* Botão Flutuante */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          onClick={abrirModalAdicionar}
          aria-label="Adicionar Plantão"
        >
          <Plus className="h-6 w-6" />
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
