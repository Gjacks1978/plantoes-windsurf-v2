"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocais } from "@/contexts/LocaisContext";
import { Local } from "@/types";

interface LocalFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  localParaEditar?: Local;
}

export function LocalFormDialog({ isOpen, onClose, localParaEditar }: LocalFormDialogProps) {
  const { adicionarLocal, atualizarLocal } = useLocais();
  const editando = !!localParaEditar;

  // Estado do formulário
  const [nome, setNome] = useState(localParaEditar?.nome || "");
  const [endereco, setEndereco] = useState(localParaEditar?.endereco || "");
  const [cor, setCor] = useState(localParaEditar?.cor || "#6E28DC"); // Cor padrão (roxo)

  // Estado de validação
  const [erros, setErros] = useState<Record<string, string>>({});

  // Resetar formulário
  const resetarFormulario = () => {
    setNome("");
    setEndereco("");
    setCor("#6E28DC");
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

    if (!nome.trim()) {
      novosErros.nome = "O nome é obrigatório";
    }

    if (!endereco.trim()) {
      novosErros.endereco = "O endereço é obrigatório";
    }

    if (!cor) {
      novosErros.cor = "Selecione uma cor";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Salvar local
  const handleSalvar = () => {
    if (!validarFormulario()) {
      return;
    }

    const localData = {
      nome: nome.trim(),
      endereco: endereco.trim(),
      cor,
    };

    if (editando && localParaEditar) {
      atualizarLocal(localParaEditar.id, localData);
    } else {
      adicionarLocal(localData);
    }

    handleClose();
  };

  // Cores predefinidas para seleção rápida
  const coresPredefinidas = [
    "#4CAF50", // verde
    "#2196F3", // azul
    "#9C27B0", // roxo
    "#F44336", // vermelho
    "#FF9800", // laranja
    "#795548", // marrom
    "#607D8B", // azul acinzentado
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar Local" : "Novo Local"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Edite as informações do local de plantão abaixo."
              : "Preencha as informações para adicionar um novo local de plantão."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nome */}
          <div className="grid gap-2">
            <Label htmlFor="nome" className={erros.nome ? "text-destructive" : ""}>
              Nome
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={erros.nome ? "border-destructive" : ""}
              placeholder="Hospital Central"
            />
            {erros.nome && <p className="text-xs text-destructive">{erros.nome}</p>}
          </div>

          {/* Endereço */}
          <div className="grid gap-2">
            <Label htmlFor="endereco" className={erros.endereco ? "text-destructive" : ""}>
              Endereço
            </Label>
            <Input
              id="endereco"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className={erros.endereco ? "border-destructive" : ""}
              placeholder="Av. Principal, 1000"
            />
            {erros.endereco && <p className="text-xs text-destructive">{erros.endereco}</p>}
          </div>

          {/* Cor */}
          <div className="grid gap-2">
            <Label htmlFor="cor" className={erros.cor ? "text-destructive" : ""}>
              Cor
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="cor"
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className={`w-12 h-10 p-1 ${erros.cor ? "border-destructive" : ""}`}
              />
              <Input
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="font-mono"
                placeholder="#RRGGBB"
              />
            </div>
            {erros.cor && <p className="text-xs text-destructive">{erros.cor}</p>}
          </div>

          {/* Cores predefinidas */}
          <div className="grid gap-2">
            <Label>Cores predefinidas</Label>
            <div className="flex flex-wrap gap-2">
              {coresPredefinidas.map((corPredefinida) => (
                <button
                  key={corPredefinida}
                  type="button"
                  className={`w-8 h-8 rounded-full border ${
                    cor === corPredefinida ? "ring-2 ring-offset-2 ring-purple" : ""
                  }`}
                  style={{ backgroundColor: corPredefinida }}
                  onClick={() => setCor(corPredefinida)}
                  aria-label={`Selecionar cor ${corPredefinida}`}
                />
              ))}
            </div>
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
