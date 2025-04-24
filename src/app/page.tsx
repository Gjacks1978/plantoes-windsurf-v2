"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlantoes } from "@/contexts/PlantoesContext";
import { useLocais } from "@/contexts/LocaisContext";
import { Plantao, Local } from "@/types";

// Componente de Card de Plantão com informações do local

function PlantaoCard({ plantao }: { plantao: Plantao }) {
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
          </div>
          <Badge variant="outline" className={plantao.pago ? "bg-success/20 text-success border-success/30" : ""}>
            {plantao.pago ? "Pago" : "Pendente"}
          </Badge>
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
  const { plantoes, obterPlantoesPorData } = usePlantoes();

  // Navegação de mês
  function handlePrevMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setDate(null);
  }
  function handleNextMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setDate(null);
  }

  // Plantões do dia selecionado
  const plantoesDodia = date ? obterPlantoesPorData(date) : [];

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

      {/* Lista de plantões do dia */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Selecione um dia"}
        </h2>
        {plantoesDodia.length === 0 ? (
          <div className="text-gray-400 text-center py-8 animate-in-fade">
            Nenhum plantão neste dia.
          </div>
        ) : (
          <div className="space-y-4">
            {plantoesDodia.map((plantao) => (
              <Card
                key={plantao.id}
                className="rounded-2xl shadow-md border-0 px-0 py-0 animate-in-slide relative overflow-hidden"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl"
                  style={{ backgroundColor: plantao.cor || "rgb(var(--purple))" }}
                />
                <CardContent className="p-4 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-base text-gray-900">
                        {plantao.title}
                      </h3>
                      <p className="text-xs text-gray-500">{plantao.local}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={plantao.pago ? "bg-success/20 text-success border-success/30" : "bg-warning/20 text-warning border-warning/30"}
                    >
                      {plantao.pago ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                  <div className="text-xs mt-2 flex justify-between items-center">
                    <div className="text-gray-500">
                      {plantao.horaInicio} - {plantao.horaFim}
                    </div>
                    <div className="font-semibold text-gray-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plantao.valor)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Botão flutuante para adicionar plantão */}
      <Button
        className="fixed bottom-24 right-6 z-40 bg-purple hover:bg-purple-dark text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center text-3xl p-0"
        style={{ boxShadow: '0 8px 24px 0 rgba(149,76,230,0.25)' }}
        aria-label="Adicionar Plantão"
        // TODO: Implementar modal para adicionar plantão
      >
        <Plus size={32} />
      </Button>
    </div>
  );
}
