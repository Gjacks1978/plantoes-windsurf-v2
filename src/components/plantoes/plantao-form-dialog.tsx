"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocais } from "@/contexts/LocaisContext";
import { usePlantoes } from "@/contexts/PlantoesContext";
import { Plantao } from "@/types";

interface PlantaoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plantaoParaEditar?: Plantao;
}

export function PlantaoFormDialog({ isOpen, onClose, plantaoParaEditar }: PlantaoFormDialogProps) {
  const { locais } = useLocais();
  const { adicionarPlantao, atualizarPlantao } = usePlantoes();
  const editando = !!plantaoParaEditar;

  // Estado do formulário
  const [localId, setLocalId] = useState(plantaoParaEditar?.local || "");
  const [data, setData] = useState<Date>(plantaoParaEditar?.data || new Date());
  const [horaInicio, setHoraInicio] = useState(plantaoParaEditar?.horaInicio || "07:00");
  const [horaFim, setHoraFim] = useState(plantaoParaEditar?.horaFim || "19:00");
  const [valor, setValor] = useState(plantaoParaEditar?.valor?.toString() || "");
  const [pago, setPago] = useState(plantaoParaEditar?.pago || false);
  const [observacoes, setObservacoes] = useState(plantaoParaEditar?.observacoes || "");
  const [repetir, setRepetir] = useState("nao"); // Novo estado para repetição

  // Estado de validação
  const [erros, setErros] = useState<Record<string, string>>({});

  // Resetar formulário
  const resetarFormulario = () => {
    setLocalId("");
    setData(new Date());
    setHoraInicio("07:00");
    setHoraFim("19:00");
    setValor("");
    setPago(false);
    setObservacoes("");
    setRepetir("nao");
    setErros({});
  };

  // Fechar modal
  const handleClose = () => {
    resetarFormulario();
    onClose();
  };

  // Validar formulário
  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!localId) {
      novosErros.localId = "Selecione um local";
    }

    if (!data) {
      novosErros.data = "Selecione uma data";
    }

    if (!horaInicio) {
      novosErros.horaInicio = "Informe a hora de início";
    }

    if (!horaFim) {
      novosErros.horaFim = "Informe a hora de término";
    }

    if (valor && (isNaN(Number(valor)) || Number(valor) < 0)) {
      novosErros.valor = "Informe um valor válido";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Salvar plantão
  const handleSalvar = () => {
    if (!validarFormulario()) {
      return;
    }

    const plantaoData = {
      title: locais.find(l => l.id === localId)?.nome || "Plantão", // Usar nome do local como título
      local: localId,
      data,
      horaInicio,
      horaFim,
      valor: valor ? Number(valor) : 0, // Valor opcional
      pago,
      observacoes: observacoes.trim() || undefined,
    };

    if (editando && plantaoParaEditar) {
      atualizarPlantao(plantaoParaEditar.id, plantaoData);
    } else {
      // Adicionar plantão único ou repetido
      if (repetir === "nao") {
        adicionarPlantao(plantaoData);
      } else {
        // Implementar lógica de repetição baseada na opção selecionada
        const repeticoes = {
          "semanal": 4,  // 4 semanas
          "quinzenal": 2, // 2 repetições (30 dias)
          "mensal": 3,   // 3 meses
        }[repetir] || 1;
        
        // Adicionar o plantão original
        adicionarPlantao(plantaoData);
        
        // Adicionar as repetições
        for (let i = 1; i <= repeticoes; i++) {
          const novaData = new Date(data);
          
          if (repetir === "semanal") {
            novaData.setDate(novaData.getDate() + (7 * i)); // Adicionar semanas
          } else if (repetir === "quinzenal") {
            novaData.setDate(novaData.getDate() + (15 * i)); // Adicionar 15 dias
          } else if (repetir === "mensal") {
            novaData.setMonth(novaData.getMonth() + i); // Adicionar meses
          }
          
          adicionarPlantao({
            ...plantaoData,
            data: novaData
          });
        }
      }
    }

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar Plantão" : "Novo Plantão"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Edite as informações do plantão abaixo."
              : "Preencha as informações para adicionar um novo plantão."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Local */}
          <div className="grid gap-2">
            <Label htmlFor="local" className={erros.localId ? "text-destructive" : ""}>
              Local
            </Label>
            <Select value={localId} onValueChange={setLocalId}>
              <SelectTrigger className={erros.localId ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione um local" />
              </SelectTrigger>
              <SelectContent>
                {locais.map((local) => (
                  <SelectItem key={local.id} value={local.id}>
                    {local.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.localId && <p className="text-xs text-destructive">{erros.localId}</p>}
          </div>

          {/* Data */}
          <div className="grid gap-2">
            <Label className={erros.data ? "text-destructive" : ""}>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !data && "text-muted-foreground",
                    erros.data && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data ? format(data, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={data}
                  onSelect={(date) => date && setData(date)}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {erros.data && <p className="text-xs text-destructive">{erros.data}</p>}
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="horaInicio" className={erros.horaInicio ? "text-destructive" : ""}>
                Início
              </Label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className={erros.horaInicio ? "border-destructive" : ""}
              />
              {erros.horaInicio && <p className="text-xs text-destructive">{erros.horaInicio}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="horaFim" className={erros.horaFim ? "text-destructive" : ""}>
                Término
              </Label>
              <Input
                id="horaFim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className={erros.horaFim ? "border-destructive" : ""}
              />
              {erros.horaFim && <p className="text-xs text-destructive">{erros.horaFim}</p>}
            </div>
          </div>

          {/* Valor (opcional) */}
          <div className="grid gap-2">
            <Label htmlFor="valor" className={erros.valor ? "text-destructive" : ""}>
              Valor (R$) - Opcional
            </Label>
            <Input
              id="valor"
              type="number"
              min="0"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className={erros.valor ? "border-destructive" : ""}
              placeholder="Deixe em branco se não souber"
            />
            {erros.valor && <p className="text-xs text-destructive">{erros.valor}</p>}
          </div>

          {/* Repetir plantão */}
          {!editando && (
            <div className="grid gap-2">
              <Label htmlFor="repetir">Repetir plantão</Label>
              <Select value={repetir} onValueChange={setRepetir}>
                <SelectTrigger id="repetir">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao">Não repetir</SelectItem>
                  <SelectItem value="semanal">Semanalmente (4 semanas)</SelectItem>
                  <SelectItem value="quinzenal">Quinzenalmente (30 dias)</SelectItem>
                  <SelectItem value="mensal">Mensalmente (3 meses)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status de pagamento */}
          <div className="flex items-center justify-between">
            <Label htmlFor="pago">Plantão pago</Label>
            <Switch id="pago" checked={pago} onCheckedChange={setPago} />
          </div>

          {/* Observações */}
          <div className="grid gap-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Input
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
