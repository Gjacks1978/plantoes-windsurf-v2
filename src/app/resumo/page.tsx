"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, Pie, Cell, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { usePlantoes } from "@/contexts/PlantoesContext";
import { format, getMonth, getYear, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, addHours, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Cores para os gráficos
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
const RADIAN = Math.PI / 180;

export default function ResumoPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes");
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  
  const { plantoes } = usePlantoes();
  
  // Função para calcular a duração de um plantão em horas
  const calcularDuracaoPlantao = (horaInicio: string, horaFim: string) => {
    const [inicioHora, inicioMinuto] = horaInicio.split(':').map(Number);
    const [fimHora, fimMinuto] = horaFim.split(':').map(Number);
    
    const inicio = new Date();
    inicio.setHours(inicioHora, inicioMinuto, 0);
    
    const fim = new Date();
    fim.setHours(fimHora, fimMinuto, 0);
    
    // Se a hora de fim for menor que a de início, significa que termina no dia seguinte
    if (fim < inicio) {
      fim.setDate(fim.getDate() + 1);
    }
    
    return differenceInHours(fim, inicio);
  };
  
  // Dados do mês selecionado
  const dadosMesSelecionado = useMemo(() => {
    const plantoesDoMes = plantoes.filter(plantao => {
      const dataPlantao = new Date(plantao.data);
      return getMonth(dataPlantao) === mesSelecionado && getYear(dataPlantao) === anoSelecionado;
    });
    
    const totalHoras = plantoesDoMes.reduce((acc, plantao) => {
      return acc + calcularDuracaoPlantao(plantao.horaInicio, plantao.horaFim);
    }, 0);
    
    const valorTotal = plantoesDoMes.reduce((acc, plantao) => acc + plantao.valor, 0);
    const valorPago = plantoesDoMes.filter(p => p.pago).reduce((acc, plantao) => acc + plantao.valor, 0);
    const valorPendente = valorTotal - valorPago;
    
    return {
      plantoes: plantoesDoMes.length,
      horas: totalHoras,
      valorTotal,
      valorPago,
      valorPendente,
      plantoesData: plantoesDoMes
    };
  }, [plantoes, mesSelecionado, anoSelecionado]);
  
  // Dados para o gráfico de distribuição por local
  const dadosPorLocal = useMemo(() => {
    const locaisMap = new Map();
    
    dadosMesSelecionado.plantoesData.forEach(plantao => {
      if (locaisMap.has(plantao.local)) {
        const local = locaisMap.get(plantao.local);
        local.count += 1;
        local.valor += plantao.valor;
      } else {
        locaisMap.set(plantao.local, { count: 1, valor: plantao.valor });
      }
    });
    
    return Array.from(locaisMap.entries()).map(([id, data]) => ({
      id,
      name: id, // Idealmente substituir pelo nome do local
      value: data.count,
      valor: data.valor
    }));
  }, [dadosMesSelecionado]);
  
  // Dados para o gráfico de histórico anual
  const dadosHistoricoAnual = useMemo(() => {
    const meses = eachMonthOfInterval({
      start: new Date(anoSelecionado, 0, 1),
      end: new Date(anoSelecionado, 11, 31)
    });
    
    return meses.map(mes => {
      const plantoesDoMes = plantoes.filter(plantao => {
        const dataPlantao = new Date(plantao.data);
        return getMonth(dataPlantao) === getMonth(mes) && getYear(dataPlantao) === anoSelecionado;
      });
      
      const totalHoras = plantoesDoMes.reduce((acc, plantao) => {
        return acc + calcularDuracaoPlantao(plantao.horaInicio, plantao.horaFim);
      }, 0);
      
      const valorTotal = plantoesDoMes.reduce((acc, plantao) => acc + plantao.valor, 0);
      
      return {
        mes: format(mes, 'MMM', { locale: ptBR }),
        plantoes: plantoesDoMes.length,
        horas: totalHoras,
        valor: valorTotal
      };
    });
  }, [plantoes, anoSelecionado]);
  
  // Dados para o gráfico de status de pagamento
  const dadosStatusPagamento = useMemo(() => [
    { name: 'Pago', value: dadosMesSelecionado.valorPago },
    { name: 'Pendente', value: dadosMesSelecionado.valorPendente }
  ], [dadosMesSelecionado]);
  
  // Lista de anos disponíveis para seleção
  const anosDisponiveis = useMemo(() => {
    const anos = new Set(plantoes.map(plantao => getYear(new Date(plantao.data))));
    const anoAtual = new Date().getFullYear();
    anos.add(anoAtual); // Garantir que o ano atual esteja na lista
    return Array.from(anos).sort((a, b) => b - a); // Ordenar decrescente
  }, [plantoes]);
  
  // Renderizador customizado para o rótulo do gráfico de pizza
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Resumo Financeiro</h1>

      <div className="flex justify-between items-center mb-4">
        <Select value={anoSelecionado.toString()} onValueChange={(value) => setAnoSelecionado(parseInt(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {anosDisponiveis.map(ano => (
              <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={mesSelecionado.toString()} onValueChange={(value) => setMesSelecionado(parseInt(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({length: 12}, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {format(new Date(2021, i, 1), 'MMMM', { locale: ptBR })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumo" className="space-y-4 mt-4">
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Plantões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dadosMesSelecionado.plantoes}</div>
                <p className="text-xs text-muted-foreground mt-1">Total no mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Horas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dadosMesSelecionado.horas}h</div>
                <p className="text-xs text-muted-foreground mt-1">Total no mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesSelecionado.valorTotal)}
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesSelecionado.valorPago)} pago
                  </span>
                  <span className="text-orange-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesSelecionado.valorPendente)} pendente
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Média por Plantão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dadosMesSelecionado.plantoes > 0 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesSelecionado.valorTotal / dadosMesSelecionado.plantoes)
                    : 'R$ 0,00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Valor médio</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráfico de status de pagamento */}
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Status de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {dadosMesSelecionado.valorTotal > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dadosStatusPagamento}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosStatusPagamento.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#fb923c'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-10 text-muted-foreground">Sem dados para exibir</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="graficos" className="space-y-4 mt-4">
          {/* Gráfico de distribuição por local */}
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Distribuição por Local</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {dadosPorLocal.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosPorLocal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'value') return `${value} plantões`;
                      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number);
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="value" fill="#8884d8" name="Quantidade" />
                    <Bar yAxisId="right" dataKey="valor" fill="#82ca9d" name="Valor Total" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-10 text-muted-foreground">Sem dados para exibir</p>
              )}
            </CardContent>
          </Card>
          
          {/* Gráfico de horas trabalhadas vs valor */}
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Horas vs Valor</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {dadosMesSelecionado.plantoes > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosMesSelecionado.plantoesData.map(p => ({
                    id: p.id,
                    horas: calcularDuracaoPlantao(p.horaInicio, p.horaFim),
                    valor: p.valor,
                    valorPorHora: p.valor / calcularDuracaoPlantao(p.horaInicio, p.horaFim)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" hide />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'horas') return `${value} horas`;
                      if (name === 'valorPorHora') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number) + '/h';
                      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number);
                    }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="horas" stroke="#8884d8" name="Horas" />
                    <Line yAxisId="right" type="monotone" dataKey="valorPorHora" stroke="#82ca9d" name="Valor/Hora" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-10 text-muted-foreground">Sem dados para exibir</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historico" className="space-y-4 mt-4">
          {/* Gráfico de histórico anual */}
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Histórico Anual ({anoSelecionado})</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosHistoricoAnual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'plantoes') return `${value} plantões`;
                    if (name === 'horas') return `${value} horas`;
                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number);
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="plantoes" fill="#8884d8" name="Plantões" />
                  <Bar yAxisId="right" dataKey="valor" fill="#82ca9d" name="Valor Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Gráfico de tendência anual */}
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Tendência Anual ({anoSelecionado})</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="text-center text-muted-foreground py-8">
                Dados do trimestre serão exibidos aqui.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ano" className="space-y-4 mt-4">
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Dados do Ano</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="text-center text-muted-foreground py-8">
                Dados do ano serão exibidos aqui.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
