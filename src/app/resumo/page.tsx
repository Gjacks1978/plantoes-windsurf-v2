"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Dados mockados para exemplo
const dadosMensais = [
  { mes: "Jan", plantoes: 10, horas: 120, valor: 12000 },
  { mes: "Fev", plantoes: 8, horas: 96, valor: 9600 },
  { mes: "Mar", plantoes: 12, horas: 144, valor: 14400 },
  { mes: "Abr", plantoes: 9, horas: 108, valor: 10800 },
  { mes: "Mai", plantoes: 11, horas: 132, valor: 13200 },
  { mes: "Jun", plantoes: 10, horas: 120, valor: 12000 },
];

// Dados do mês atual
const dadosMesAtual = {
  plantoes: 9,
  horas: 108,
  valorTotal: 10800,
  valorPago: 7200,
  valorPendente: 3600,
};

export default function ResumoPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Resumo Financeiro</h1>

      <Tabs defaultValue="mes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mes">Mês</TabsTrigger>
          <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
          <TabsTrigger value="ano">Ano</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mes" className="space-y-4 mt-4">
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Plantões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dadosMesAtual.plantoes}</div>
                <p className="text-xs text-muted-foreground mt-1">Total no mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Horas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dadosMesAtual.horas}h</div>
                <p className="text-xs text-muted-foreground mt-1">Total no mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.valorTotal)}
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-success">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.valorPago)} pago
                  </span>
                  <span className="text-warning">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.valorPendente)} pendente
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
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosMesAtual.valorTotal / dadosMesAtual.plantoes)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Valor médio</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráfico */}
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Histórico de Valores</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosMensais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="valor" name="Valor" fill="hsl(var(--purple))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trimestre" className="space-y-4 mt-4">
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Dados do Trimestre</CardTitle>
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
