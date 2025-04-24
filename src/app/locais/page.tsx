"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Tipos
type Local = {
  id: string;
  nome: string;
  endereco: string;
  cor: string;
};

// Dados mockados para exemplo
const locaisMock: Local[] = [
  {
    id: "1",
    nome: "Hospital Central",
    endereco: "Av. Principal, 1000",
    cor: "#4CAF50", // verde
  },
  {
    id: "2",
    nome: "Hospital São Lucas",
    endereco: "Rua das Flores, 123",
    cor: "#2196F3", // azul
  },
  {
    id: "3",
    nome: "Hospital Infantil",
    endereco: "Av. das Crianças, 500",
    cor: "#9C27B0", // roxo
  },
];

export default function LocaisPage() {
  const [locais, setLocais] = useState<Local[]>(locaisMock);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Locais de Plantão</h1>
        <Button className="bg-purple hover:bg-purple-dark">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      <div className="grid gap-4">
        {locais.map((local) => (
          <Card key={local.id} className="overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 w-2" 
              style={{ backgroundColor: local.cor }}
            />
            <CardContent className="p-4 pl-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{local.nome}</h3>
                  <p className="text-sm text-muted-foreground">{local.endereco}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
