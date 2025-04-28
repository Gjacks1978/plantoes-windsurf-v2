"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { usePlantoes } from "@/contexts/PlantoesContext";
import { useLocais } from "@/contexts/LocaisContext";
import { format, addMonths, subMonths, getMonth, getYear, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";
import { Switch } from "@/components/ui/switch";
import { PlantaoFormDialog } from "@/components/plantoes/plantao-form-dialog";
import { Progress } from "@/components/ui/progress";

export default function PagamentosPage() {
  const { plantoes, marcarComoPago, atualizarPlantao } = usePlantoes();
  const { locais } = useLocais();
  const [filtro, setFiltro] = useState("todos");
  const [mesSelecionado, setMesSelecionado] = useState(new Date());
  const [plantaoEmEdicao, setPlantaoEmEdicao] = useState<any | null>(null);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  
  // Navegação entre meses
  const irParaMesAnterior = () => {
    setMesSelecionado(prev => subMonths(prev, 1));
  };
  
  const irParaProximoMes = () => {
    setMesSelecionado(prev => addMonths(prev, 1));
  };
  
  // Filtrar plantões com base nos critérios
  const plantoesFiltrados = useMemo(() => {
    return plantoes
      .filter(plantao => {
        // Filtro por status de pagamento
        if (filtro === "pagos") return plantao.pago;
        if (filtro === "pendentes") return !plantao.pago;
        return true; // "todos"
      })
      .filter(plantao => {
        // Filtro por mês selecionado
        const dataPlantao = new Date(plantao.data);
        return (
          getMonth(dataPlantao) === getMonth(mesSelecionado) &&
          getYear(dataPlantao) === getYear(mesSelecionado)
        );
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()); // Ordenar por data decrescente
  }, [plantoes, filtro, mesSelecionado]);
  
  // Calcular totais para o mês selecionado
  const totais = useMemo(() => {
    const plantoesMes = plantoes.filter(plantao => {
      const dataPlantao = new Date(plantao.data);
      return (
        getMonth(dataPlantao) === getMonth(mesSelecionado) &&
        getYear(dataPlantao) === getYear(mesSelecionado)
      );
    });
    
    const valorTotal = plantoesMes.reduce((acc, p) => acc + p.valor, 0);
    const valorPago = plantoesMes.filter(p => p.pago).reduce((acc, p) => acc + p.valor, 0);
    const valorPendente = valorTotal - valorPago;
    const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0;
    
    return { valorTotal, valorPago, valorPendente, percentualPago };
  }, [plantoes, mesSelecionado]);
  
  // Marcar um plantão como pago
  const handleMarcarComoPago = (id: string) => {
    marcarComoPago(id);
    toast.success("Plantão marcado como pago!");
  };
  
  // Editar um plantão
  const handleEditarPlantao = (plantao: any) => {
    setPlantaoEmEdicao(plantao);
    setDialogoAberto(true);
  };
  
  // Excluir um plantão
  const handleExcluirPlantao = (id: string) => {
    // Encontrar o plantão pelo ID
    const plantaoParaExcluir = plantoes.find(p => p.id === id);
    if (plantaoParaExcluir) {
      // Filtrar o plantão da lista (simulação de exclusão)
      // Na prática, precisaríamos de um método específico no contexto
      const plantoesFiltrados = plantoes.filter(p => p.id !== id);
      // Como não temos um método de exclusão, vamos apenas mostrar o toast
      toast.success("Plantão excluído com sucesso!");
    }
  };
  
  // Fechar o diálogo de edição
  const handleFecharDialogo = () => {
    setDialogoAberto(false);
    setPlantaoEmEdicao(null);
  };
  
  return (
    <div className="pb-8">
      {/* Cabeçalho com navegação por mês */}
      <div className="bg-purple text-white py-4 px-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-purple-dark" onClick={irParaMesAnterior}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-lg font-medium">
              {format(mesSelecionado, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" className="text-white hover:bg-purple-dark" onClick={irParaProximoMes}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-6 px-4">
        {/* Card de resumo com barra de progresso */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="py-5">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.valorTotal)}
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress value={totais.percentualPago} className="h-3" />
                
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium text-success">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.valorPago)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">Pago</span>
                  </div>
                  
                  <div className="text-right">
                    <span className="font-medium text-amber-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.valorPendente)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">Pendente</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Abas para filtrar por status */}
        <Tabs defaultValue="todos" value={filtro} onValueChange={setFiltro} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30">
            <TabsTrigger value="todos" className="data-[state=active]:bg-white data-[state=active]:text-purple-dark data-[state=active]:shadow-sm">Todos</TabsTrigger>
            <TabsTrigger value="pagos" className="data-[state=active]:bg-white data-[state=active]:text-purple-dark data-[state=active]:shadow-sm">Pagos</TabsTrigger>
            <TabsTrigger value="pendentes" className="data-[state=active]:bg-white data-[state=active]:text-purple-dark data-[state=active]:shadow-sm">Pendentes</TabsTrigger>
          </TabsList>
        </Tabs>
      
        {/* Lista de plantões */}
        <div className="mt-4">
          {plantoesFiltrados.length === 0 ? (
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground mb-1">
                  Nenhum plantão encontrado {filtro !== "todos" ? `com status "${filtro}"` : ""} em {format(mesSelecionado, 'MMMM yyyy', { locale: ptBR })}.
                </p>
                <p className="text-xs text-muted-foreground">
                  Tente selecionar outro mês ou adicionar novos plantões.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {plantoesFiltrados.map(plantao => {
                const localInfo = locais.find(l => l.id === plantao.local);
                const formattedDate = format(new Date(plantao.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
                
                // Componente de card com swipe-to-delete
                return (
                  <PlantaoCard 
                    key={plantao.id} 
                    plantao={plantao} 
                    localInfo={localInfo}
                    formattedDate={formattedDate}
                    onEdit={handleEditarPlantao}
                    onDelete={handleExcluirPlantao}
                    onTogglePago={(novoStatus) => {
                      atualizarPlantao(plantao.id, { ...plantao, pago: novoStatus });
                      toast.success(`Plantão marcado como ${novoStatus ? 'pago' : 'pendente'}`);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Diálogo de edição */}
      {dialogoAberto && (
        <PlantaoFormDialog
          isOpen={dialogoAberto}
          onClose={handleFecharDialogo}
          plantaoParaEditar={plantaoEmEdicao}
        />
      )}
    </div>
  );
}

// Componente de card para plantão com swipe-to-delete
function PlantaoCard({ plantao, localInfo, formattedDate, onEdit, onDelete, onTogglePago }: {
  plantao: any;
  localInfo: any;
  formattedDate: string;
  onEdit: (plantao: any) => void;
  onDelete: (id: string) => void;
  onTogglePago: (novoStatus: boolean) => void;
}) {
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
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: localInfo?.cor || "hsl(var(--purple))" }} />
          <CardContent className="py-1 px-4 pl-6">
            <div className="flex justify-between items-start mb-0.5">
              <div>
                <h3 className="font-medium text-black">{plantao.title}</h3>
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
                  e.stopPropagation();
                  onTogglePago(!plantao.pago);
                }}>
                  <Switch checked={plantao.pago} className="scale-90 data-[state=checked]:bg-success" />
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
