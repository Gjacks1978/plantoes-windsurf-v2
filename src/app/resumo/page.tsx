"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, Pie, Cell, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { usePlantoes } from "@/contexts/PlantoesContext";
import { useLocais } from "@/contexts/LocaisContext";
import { format, getMonth, getYear, eachMonthOfInterval, differenceInHours } from "date-fns";
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
  const { locais } = useLocais();
  
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
    
    return Array.from(locaisMap.entries()).map(([id, data]) => {
      const localInfo = locais.find(l => l.id === id);
      return {
        id,
        name: localInfo?.nome || id,
        value: data.count,
        valor: data.valor
      };
    });
  }, [dadosMesSelecionado, locais]);
  
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
  
  // Renderizador customizado para o rótulo do gráfico de pizza
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <div className="space-y-6 pb-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Resumo</h1>
        
        {/* Seletor de período */}
        <div className="flex flex-wrap gap-2">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-[130px] bg-white shadow-sm">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mês</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={mesSelecionado.toString()} onValueChange={(value) => setMesSelecionado(Number(value))}>
            <SelectTrigger className="w-[130px] bg-white shadow-sm">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Janeiro</SelectItem>
              <SelectItem value="1">Fevereiro</SelectItem>
              <SelectItem value="2">Março</SelectItem>
              <SelectItem value="3">Abril</SelectItem>
              <SelectItem value="4">Maio</SelectItem>
              <SelectItem value="5">Junho</SelectItem>
              <SelectItem value="6">Julho</SelectItem>
              <SelectItem value="7">Agosto</SelectItem>
              <SelectItem value="8">Setembro</SelectItem>
              <SelectItem value="9">Outubro</SelectItem>
              <SelectItem value="10">Novembro</SelectItem>
              <SelectItem value="11">Dezembro</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={anoSelecionado.toString()} onValueChange={(value) => setAnoSelecionado(Number(value))}>
            <SelectTrigger className="w-[100px] bg-white shadow-sm">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(ano => (
                <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Card de resumo consolidado */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple">
                  <path d="M12 8v4l3 3"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{format(new Date(anoSelecionado, mesSelecionado, 1), 'MMMM yyyy', { locale: ptBR })}</h3>
                <p className="text-xs text-muted-foreground">Resumo do mês selecionado</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto">
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                  <p className="text-sm font-medium text-muted-foreground">Plantões</p>
                </div>
                <div className="text-xl font-bold">{dadosMesSelecionado.plantoes}</div>
                <p className="text-xs text-muted-foreground">agendados</p>
              </div>
              
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <p className="text-sm font-medium text-muted-foreground">Horas</p>
                </div>
                <div className="text-xl font-bold">{dadosMesSelecionado.horas}</div>
                <p className="text-xs text-muted-foreground">trabalhadas</p>
              </div>
              
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple">
                    <path d="M2 17a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v0a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v0Z"/>
                    <path d="M12 17v-5"/>
                    <path d="M8 12h8"/>
                    <path d="M2 7a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v0a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v0Z"/>
                  </svg>
                  <p className="text-sm font-medium text-muted-foreground">Valor</p>
                </div>
                <div className="text-xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesSelecionado.valorTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesSelecionado.valorPago)}</span> pagos
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="mensal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="mensal" className="data-[state=active]:bg-white data-[state=active]:text-purple-dark data-[state=active]:shadow-sm">Mensal</TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-white data-[state=active]:text-purple-dark data-[state=active]:shadow-sm">Histórico</TabsTrigger>
          <TabsTrigger value="ano" className="data-[state=active]:bg-white data-[state=active]:text-purple-dark data-[state=active]:shadow-sm">Ano</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mensal" className="space-y-4 mt-6">
          {/* Gráfico de distribuição por local */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold">Distribuição por Local</CardTitle>
              <p className="text-xs text-muted-foreground">Plantões por local no mês selecionado</p>
            </CardHeader>
            <CardContent className="pt-4">
              {dadosPorLocal.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosPorLocal}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosPorLocal.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [
                      `${value} plantões`, 
                      name
                    ]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-muted/10 rounded-lg">
                  <p className="text-muted-foreground mb-1">Sem dados para exibir</p>
                  <p className="text-xs text-muted-foreground">Adicione plantões para visualizar estatísticas</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Gráfico de valor por hora */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold">Valor por Hora</CardTitle>
              <p className="text-xs text-muted-foreground">Comparação entre horas trabalhadas e valor/hora</p>
            </CardHeader>
            <CardContent className="pt-4">
              {dadosMesSelecionado.plantoesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosMesSelecionado.plantoesData.map(p => ({
                    id: p.id,
                    horas: calcularDuracaoPlantao(p.horaInicio, p.horaFim),
                    valor: p.valor,
                    valorPorHora: p.valor / calcularDuracaoPlantao(p.horaInicio, p.horaFim)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="id" hide />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: 'none' }}
                      formatter={(value, name) => {
                        if (name === 'horas') return `${value} horas`;
                        if (name === 'valorPorHora') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number) + '/h';
                        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number);
                      }} 
                    />
                    <Legend iconType="circle" />
                    <Line yAxisId="left" type="monotone" dataKey="horas" stroke="#8884d8" name="Horas" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="valorPorHora" stroke="#82ca9d" name="Valor/Hora" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-muted/10 rounded-lg">
                  <p className="text-muted-foreground mb-1">Sem dados para exibir</p>
                  <p className="text-xs text-muted-foreground">Adicione plantões para visualizar estatísticas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historico" className="space-y-4 mt-6">
          {/* Gráfico de histórico anual */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold">Histórico Anual ({anoSelecionado})</CardTitle>
              <p className="text-xs text-muted-foreground">Comparação mensal de plantões e valores</p>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosHistoricoAnual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: 'none' }}
                    formatter={(value, name) => {
                      if (name === 'plantoes') return `${value} plantões`;
                      if (name === 'horas') return `${value} horas`;
                      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number);
                    }} 
                  />
                  <Legend iconType="circle" />
                  <Bar yAxisId="left" dataKey="plantoes" fill="#8884d8" name="Plantões" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="valor" fill="#82ca9d" name="Valor Total" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Gráfico de tendência anual */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold">Tendência Anual ({anoSelecionado})</CardTitle>
              <p className="text-xs text-muted-foreground">Evolução dos valores ao longo do ano</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col items-center justify-center py-10 bg-muted/10 rounded-lg">
                <p className="text-muted-foreground mb-1">Em desenvolvimento</p>
                <p className="text-xs text-muted-foreground">Dados do trimestre serão exibidos aqui em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ano" className="space-y-4 mt-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold">Resumo Anual ({anoSelecionado})</CardTitle>
              <p className="text-xs text-muted-foreground">Visão geral consolidada do ano</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col items-center justify-center py-10 bg-muted/10 rounded-lg">
                <p className="text-muted-foreground mb-1">Em desenvolvimento</p>
                <p className="text-xs text-muted-foreground">Relatório anual completo disponível em breve</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg font-semibold">Melhores Meses</CardTitle>
                <p className="text-xs text-muted-foreground">Meses com maior faturamento</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center justify-center py-10 bg-muted/10 rounded-lg">
                  <p className="text-muted-foreground mb-1">Em desenvolvimento</p>
                  <p className="text-xs text-muted-foreground">Disponível em breve</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg font-semibold">Locais Mais Rentáveis</CardTitle>
                <p className="text-xs text-muted-foreground">Locais com melhor valor/hora</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center justify-center py-10 bg-muted/10 rounded-lg">
                  <p className="text-muted-foreground mb-1">Em desenvolvimento</p>
                  <p className="text-xs text-muted-foreground">Disponível em breve</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
