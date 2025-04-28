"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Bell, Moon, Sun, LogOut, Trash2, AlertCircle } from "lucide-react";
import { usePlantoes } from "@/contexts/PlantoesContext";
import { useLocais } from "@/contexts/LocaisContext";
import { toast } from "sonner";

export default function AjustesPage() {
  const { plantoes } = usePlantoes();
  const { locais } = useLocais();
  const [temaEscuro, setTemaEscuro] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Função para exportar dados
  const exportarDados = () => {
    try {
      // Criar objeto com todos os dados
      const dados = {
        plantoes,
        locais,
        versao: "1.0.0",
        dataExportacao: new Date().toISOString()
      };
      
      // Converter para JSON
      const dadosJSON = JSON.stringify(dados, null, 2);
      
      // Criar blob e link para download
      const blob = new Blob([dadosJSON], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Criar elemento de link e simular clique
      const a = document.createElement("a");
      a.href = url;
      a.download = `plantoes-backup-${new Date().toLocaleDateString().replace(/\//g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar dados. Tente novamente.");
    }
  };
  
  // Função para importar dados
  const importarDados = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const conteudo = e.target?.result as string;
          const dados = JSON.parse(conteudo);
          
          // Verificar se o arquivo tem o formato esperado
          if (!dados.plantoes || !dados.locais) {
            throw new Error("Formato de arquivo inválido");
          }
          
          // Armazenar no localStorage
          localStorage.setItem("plantoes-dados", JSON.stringify(dados.plantoes));
          localStorage.setItem("locais-dados", JSON.stringify(dados.locais));
          
          toast.success("Dados importados com sucesso! Recarregue a página para ver as alterações.");
          
          // Recarregar a página para aplicar as alterações
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          console.error("Erro ao processar arquivo:", error);
          toast.error("Erro ao processar arquivo. Verifique se o formato é válido.");
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      toast.error("Erro ao importar dados. Tente novamente.");
    } finally {
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  // Função para apagar todos os dados
  const apagarTodosDados = () => {
    try {
      localStorage.removeItem("plantoes-dados");
      localStorage.removeItem("locais-dados");
      
      toast.success("Todos os dados foram apagados! Recarregue a página para ver as alterações.");
      
      // Recarregar a página para aplicar as alterações
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Erro ao apagar dados:", error);
      toast.error("Erro ao apagar dados. Tente novamente.");
    }
  };
  return (
    <div className="space-y-6 px-4">
      <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência do aplicativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tema-escuro">Tema escuro</Label>
                  <div className="text-sm text-muted-foreground">
                    Ativar modo escuro
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Switch 
                    id="tema-escuro" 
                    checked={temaEscuro}
                    onCheckedChange={setTemaEscuro}
                  />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure suas preferências de notificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notif-plantao">Lembrete de plantão</Label>
                  <div className="text-sm text-muted-foreground">
                    Receber notificação antes do plantão
                  </div>
                </div>
                <Switch id="notif-plantao" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notif-pagamento">Pagamentos pendentes</Label>
                  <div className="text-sm text-muted-foreground">
                    Receber notificação sobre pagamentos pendentes
                  </div>
                </div>
                <Switch id="notif-pagamento" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dados" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar dados</CardTitle>
              <CardDescription>Exporte ou importe seus dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={exportarDados}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar todos os dados
                </Button>
                
                <div>
                  <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={importarDados}
                    style={{ display: 'none' }}
                    id="import-file"
                  />
                  <Button 
                    variant="outline" 
                    className="justify-start w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Importar dados
                  </Button>
                </div>
                
                <div className="pt-2 mt-2 border-t">
                  <div className="flex items-center gap-2 mb-2 text-amber-500">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-xs">A importação substituirá todos os dados atuais</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formatos suportados: .json<br />
                    Tamanho máximo: 10MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de perigo</CardTitle>
              <CardDescription>Ações irreversíveis para sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  if (window.confirm("Tem certeza? Esta ação não pode ser desfeita e irá apagar permanentemente todos os seus dados.")) {
                    apagarTodosDados();
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Apagar todos os dados
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
