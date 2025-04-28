"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LimparDadosPage() {
  const [cleared, setCleared] = useState(false);
  const router = useRouter();

  const limparDados = () => {
    if (confirm("ATENÇÃO: Todos os dados serão apagados permanentemente. Continuar?")) {
      try {
        // Clear plantoes data - using the correct key from PlantoesContext
        localStorage.removeItem('plantoes-dados');
        
        // Clear locais data - using the correct key from LocaisContext
        localStorage.removeItem('plantoes-locais');
        
        // Force reload to reinitialize the app with empty data
        toast.success("Todos os dados foram apagados com sucesso!");
        setCleared(true);
        
        // Reload the page after a short delay to reinitialize contexts
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (error) {
        // Show error message
        toast.error("Erro ao limpar dados: " + (error as Error).message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f6fa] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">Limpar Dados do Aplicativo</CardTitle>
          <CardDescription className="text-center">
            Esta ação irá remover todos os plantões e locais cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-5xl mb-4">🗑️</div>
          <p className="mb-4">
            Esta página irá limpar todos os dados do aplicativo Plantões, incluindo todos os plantões e locais cadastrados. 
            Esta ação não pode ser desfeita.
          </p>
          <p className="font-bold mb-6">Tem certeza que deseja continuar?</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push("/")}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={limparDados}
            disabled={cleared}
          >
            {cleared ? "Dados Apagados" : "Limpar Todos os Dados"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
