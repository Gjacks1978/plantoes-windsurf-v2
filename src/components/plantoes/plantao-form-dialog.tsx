"use client";

import { useState, useEffect } from "react";
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
  plantaoParaEditar?: Plantao | null;
}

export function PlantaoFormDialog({ isOpen, onClose, plantaoParaEditar }: PlantaoFormDialogProps) {
  const { locais } = useLocais();
  const { adicionarPlantao, atualizarPlantao } = usePlantoes();
  const editando = !!plantaoParaEditar;

  // Estado do formulário
  const [localId, setLocalId] = useState("");

  // Sincronizar localId com a lista de locais e plantaoParaEditar
  useEffect(() => {
    if (plantaoParaEditar && plantaoParaEditar.local) {
      setLocalId(plantaoParaEditar.local);
    } else if (locais.length > 0) {
      setLocalId(locais[0].id);
    } else {
      setLocalId("");
    }
  }, [isOpen, plantaoParaEditar, locais]);

  const [data, setData] = useState<Date>(plantaoParaEditar?.data || new Date());
  const [horaInicio, setHoraInicio] = useState(plantaoParaEditar?.horaInicio || "07:00");
  const [horaFim, setHoraFim] = useState(plantaoParaEditar?.horaFim || "19:00");
  const [valor, setValor] = useState(plantaoParaEditar?.valor !== undefined ? plantaoParaEditar.valor.toString() : "0");
  const [pago, setPago] = useState(plantaoParaEditar?.pago !== undefined ? plantaoParaEditar.pago : false);
  const [observacoes, setObservacoes] = useState(plantaoParaEditar?.observacoes || "");
  const [repetir, setRepetir] = useState("nao"); // Novo estado para repetição
  const [diasSemana, setDiasSemana] = useState<string[]>([]); // Estado para dias da semana selecionados

  // Atualiza os campos ao abrir para edição
  useEffect(() => {
    if (plantaoParaEditar) {
      setLocalId(plantaoParaEditar.local ?? (locais.length === 1 ? locais[0].id : ""));
      setData(plantaoParaEditar.data ?? new Date());
      setHoraInicio(plantaoParaEditar.horaInicio ?? "07:00");
      setHoraFim(plantaoParaEditar.horaFim ?? "19:00");
      setValor(
        plantaoParaEditar.valor !== undefined && plantaoParaEditar.valor !== null
          ? plantaoParaEditar.valor.toString()
          : "0"
      );
      setPago(plantaoParaEditar.pago === true);
      setObservacoes(plantaoParaEditar.observacoes ?? "");
      // ... outros campos se houver
    } else {
      setLocalId(locais.length === 1 ? locais[0].id : "");
      setData(new Date());
      setHoraInicio("07:00");
      setHoraFim("19:00");
      setValor("0");
      setPago(false);
      setObservacoes("");
    }
  }, [plantaoParaEditar, isOpen, locais]);

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
    setDiasSemana([]);
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
      novosErros.local = "Selecione um local";
    }

    if (!data) {
      novosErros.data = "Selecione uma data";
    }

    if (!horaInicio) {
      novosErros.horaInicio = "Informe a hora de início";
    }

    if (!horaFim) {
      novosErros.horaFim = "Informe a hora de fim";
    }

    if (valor && (isNaN(Number(valor)) || Number(valor) < 0)) {
      novosErros.valor = "Valor inválido";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Salvar plantão
  const handleSalvar = () => {
    if (!validarFormulario()) {
      return;
    }

    // Garantir que a data seja um objeto Date válido
    const dataValida = data instanceof Date && !isNaN(data.getTime()) ? data : new Date();
    
    const plantaoData = {
      // log para depuração
      // eslint-disable-next-line no-console
      ...(console.log('[handleSalvar] plantaoData', {
        title: locais.find(l => l.id === localId)?.nome || "Plantão",
        local: localId,
        data,
        horaInicio,
        horaFim,
        valor: valor ? Number(valor) : 0,
        pago,
        observacoes: observacoes.trim() || undefined,
      }) || {}),
      title: locais.find(l => l.id === localId)?.nome || "Plantão", // Usar nome do local como título
      local: localId, // Usando 'local' para compatibilidade com PlantoesContext
      data: dataValida,
      horaInicio,
      horaFim,
      valor: valor ? Number(valor) : 0, // Valor opcional
      pago,
      observacoes: observacoes.trim() || undefined,
    };
    
    console.log("Dados do plantão a serem salvos:", plantaoData);


    if (editando && plantaoParaEditar && plantaoParaEditar.id) {
      // Atualizar o plantão original
      console.log("Atualizando plantão com ID:", plantaoParaEditar.id);
      atualizarPlantao(plantaoParaEditar.id, plantaoData);
      
      // Se o usuário escolheu repetir, cria novos plantões a partir deste
      if (repetir !== "nao") {
        // Cria novos plantões com base na opção de repetição
        if (repetir === "dias-semana") {
          // Repetição por dias da semana
          if (diasSemana.length > 0) {
            const diaOriginal = data.getDay();
            const diasSemanaNumeros = diasSemana.map(dia => {
              const map: Record<string, number> = { "dom": 0, "seg": 1, "ter": 2, "qua": 3, "qui": 4, "sex": 5, "sab": 6 };
              return map[dia];
            });
            
            // Criar plantões para os próximos 28 dias (4 semanas)
            for (let i = 1; i <= 28; i++) {
              const novaData = new Date(data);
              novaData.setDate(novaData.getDate() + i);
              
              // Verificar se o dia da semana está entre os selecionados
              if (diasSemanaNumeros.includes(novaData.getDay())) {
                adicionarPlantao({
                  ...plantaoData,
                  data: novaData
                });
              }
            }
          }
        } else if (repetir === "diario") {
          // Repetição diária
          for (let i = 1; i <= 7; i++) {
            const novaData = new Date(data);
            novaData.setDate(novaData.getDate() + i);
            
            adicionarPlantao({
              ...plantaoData,
              data: novaData
            });
          }
        } else {
          // Repetição semanal, quinzenal ou mensal
          const repeticoes = {
            "semanal": 4,  // 4 semanas
            "quinzenal": 2, // 2 repetições (30 dias)
            "mensal": 3,   // 3 meses
          }[repetir] || 1;
          
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
    } else {
      // Adicionar plantão único ou repetido
      if (repetir === "nao") {
        console.log('[handleSalvar] Chamando adicionarPlantao', plantaoData);
        adicionarPlantao(plantaoData);
        console.log('[handleSalvar] Após adicionarPlantao');
      } else if (repetir === "dias-semana") {
        // Repetir nos dias da semana selecionados por 4 semanas
        if (diasSemana.length > 0) {
          // Adicionar o plantão original se for um dos dias selecionados
          const diaOriginal = data.getDay();
          const diasSemanaNumeros = diasSemana.map(dia => {
            const map: Record<string, number> = { "dom": 0, "seg": 1, "ter": 2, "qua": 3, "qui": 4, "sex": 5, "sab": 6 };
            return map[dia];
          });
          
          if (diasSemanaNumeros.includes(diaOriginal)) {
            adicionarPlantao(plantaoData);
          }
          
          // Criar plantões para os próximos 28 dias (4 semanas)
          for (let i = 1; i <= 28; i++) {
            const novaData = new Date(data);
            novaData.setDate(novaData.getDate() + i);
            
            // Verificar se o dia da semana está entre os selecionados
            if (diasSemanaNumeros.includes(novaData.getDay())) {
              adicionarPlantao({
                ...plantaoData,
                data: novaData
              });
            }
          }
        }
      } else if (repetir === "diario") {
        // Repetir diariamente por 7 dias
        adicionarPlantao(plantaoData); // Adicionar o plantão original
        
        for (let i = 1; i <= 7; i++) {
          const novaData = new Date(data);
          novaData.setDate(novaData.getDate() + i);
          
          adicionarPlantao({
            ...plantaoData,
            data: novaData
          });
        }
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

  console.log('[PlantaoFormDialog] locais:', locais, 'localId:', localId);
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
    <Label htmlFor="local" className={erros.local ? "text-destructive" : ""}>
      Local
    </Label>
    <Select value={localId} onValueChange={setLocalId}>
      <SelectTrigger className={erros.local ? "border-destructive" : ""}>
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
          <div className="grid gap-2">
            <Label htmlFor="repetir">{editando ? "Repetir a partir deste plantão" : "Repetir plantão"}</Label>
            <Select value={repetir} onValueChange={setRepetir}>
              <SelectTrigger id="repetir">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao">Não repetir</SelectItem>
                <SelectItem value="diario">Diariamente (7 dias)</SelectItem>
                <SelectItem value="dias-semana">Dias da semana (4 semanas)</SelectItem>
                <SelectItem value="semanal">Semanalmente (4 semanas)</SelectItem>
                <SelectItem value="quinzenal">Quinzenalmente (30 dias)</SelectItem>
                <SelectItem value="mensal">Mensalmente (3 meses)</SelectItem>
              </SelectContent>
            </Select>
            {editando && (
              <p className="text-xs text-muted-foreground">
                Novas repetições serão criadas a partir da data deste plantão, sem alterar o plantão original.
              </p>
            )}
          </div>
          
          {/* Seletor de dias da semana (aparece apenas quando "Dias da semana" é selecionado) */}
          {repetir === "dias-semana" && (
            <div className="grid gap-2">
              <Label>Selecione os dias</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "dom", label: "Dom" },
                  { id: "seg", label: "Seg" },
                  { id: "ter", label: "Ter" },
                  { id: "qua", label: "Qua" },
                  { id: "qui", label: "Qui" },
                  { id: "sex", label: "Sex" },
                  { id: "sab", label: "Sáb" }
                ].map((dia) => (
                  <Button
                    key={dia.id}
                    type="button"
                    variant={diasSemana.includes(dia.id) ? "default" : "outline"}
                    className={`h-9 w-9 p-0 ${diasSemana.includes(dia.id) ? 'bg-purple hover:bg-purple-dark text-white' : ''}`}
                    onClick={() => {
                      if (diasSemana.includes(dia.id)) {
                        setDiasSemana(diasSemana.filter(d => d !== dia.id));
                      } else {
                        setDiasSemana([...diasSemana, dia.id]);
                      }
                    }}
                  >
                    {dia.label}
                  </Button>
                ))}
              </div>
              {diasSemana.length === 0 && repetir === "dias-semana" && (
                <p className="text-xs text-amber-500">Selecione pelo menos um dia da semana</p>
              )}
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
          <Button onClick={handleSalvar} className="bg-purple hover:bg-purple-dark text-white">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
