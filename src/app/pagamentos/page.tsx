"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Filter, Search } from "lucide-react";
import { usePlantoes } from "@/contexts/PlantoesContext";
import { useLocais } from "@/contexts/LocaisContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PagamentosPage() {
  const { plantoes, marcarComoPago } = usePlantoes();
  const { locais } = useLocais();
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [filtroLocal, setFiltroLocal] = useState("todos");
  
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
        // Filtro por local
        if (filtroLocal !== "todos") return plantao.local === filtroLocal;
        return true;
      })
      .filter(plantao => {
        // Filtro por busca (título ou local)
        if (!busca) return true;
        
        const localNome = locais.find(l => l.id === plantao.local)?.nome || "";
        const dataFormatada = format(new Date(plantao.data), "dd/MM/yyyy", { locale: ptBR });
        
        return (
          plantao.title.toLowerCase().includes(busca.toLowerCase()) ||
          localNome.toLowerCase().includes(busca.toLowerCase()) ||
          dataFormatada.includes(busca)
        );
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()); // Ordenar por data decrescente
  }, [plantoes, filtro, busca, filtroLocal, locais]);
  
  // Calcular totais
  const totais = useMemo(() => {
    const valorTotal = plantoes.reduce((acc, p) => acc + p.valor, 0);
    const valorPago = plantoes.filter(p => p.pago).reduce((acc, p) => acc + p.valor, 0);
    const valorPendente = valorTotal - valorPago;
    
    return { valorTotal, valorPago, valorPendente };
  }, [plantoes]);
  
  // Marcar um plantão como pago
  const handleMarcarComoPago = (id: string) => {
    marcarComoPago(id);
    toast.success("Plantão marcado como pago!");
  };
  
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.valorTotal)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.valorPago)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.valorPendente)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros e busca */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantão..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pagos">Pagos</SelectItem>
              <SelectItem value="pendentes">Pendentes</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filtroLocal} onValueChange={setFiltroLocal}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os locais</SelectItem>
              {locais.map(local => (
                <SelectItem key={local.id} value={local.id}>{local.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Lista de plantões */}
      <div className="space-y-4">
        {plantoesFiltrados.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Nenhum plantão encontrado com os filtros selecionados.
          </p>
        ) : (
          plantoesFiltrados.map(plantao => {
            const localInfo = locais.find(l => l.id === plantao.local);
            return (
              <Card key={plantao.id} className="relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1" 
                  style={{ backgroundColor: localInfo?.cor || "hsl(var(--primary))" }}
                />
                <CardContent className="p-4 pl-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{plantao.title}</h3>
                        <Badge variant={plantao.pago ? "outline" : "secondary"} className={plantao.pago ? "bg-green-500/10 text-green-500 border-green-500/30" : ""}>
                          {plantao.pago ? "Pago" : "Pendente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{localInfo?.nome || "Local não encontrado"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(plantao.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        {" • "}
                        {plantao.horaInicio} - {plantao.horaFim}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plantao.valor)}
                      </div>
                      {!plantao.pago && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-8"
                          onClick={() => handleMarcarComoPago(plantao.id)}
                        >
                          <Check className="h-3 w-3 mr-1" /> Marcar como pago
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
