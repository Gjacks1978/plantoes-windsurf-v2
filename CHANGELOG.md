# CHANGELOG - Projeto Plantoes

## [0.2.0] - 2025-04-24

### Adicionado
- Implementação do Context API para gerenciamento de estado global
- Criação de contextos separados para Plantões e Locais
- Persistência de dados usando localStorage
- Implementação das páginas principais:
  - Locais: Gerenciamento de hospitais/locais de plantão
  - Resumo: Dashboard financeiro com gráficos e estatísticas
  - Ajustes: Configurações do app
- Navegação inferior funcional entre todas as páginas
- Componentes para exibição de plantões e locais
- Tipos TypeScript para estruturas de dados principais

### Corrigido
- Correção de problemas de estilização com Tailwind CSS
- Downgrade do Tailwind CSS v4 (beta) para v3.4.1 (estável)
- Resolução de conflitos de configuração do PostCSS
- Correção de erros de navegação e rotas

### Detalhes Técnicos
- Context API para gerenciamento de estado
- Persistência com localStorage
- Integração com shadcn/ui para componentes de UI
- Estrutura de tipos TypeScript para modelo de dados

## [0.1.0] - 2025-04-19

### Adicionado
- Inicialização do projeto Next.js com TypeScript
- Configuração do Tailwind CSS v4
- Inicialização do shadcn/ui com tema "Neutral"
- Estruturação do diretório src/app
- Configuração do ESLint

### Detalhes Técnicos
- Framework: Next.js (versão 15.3.1) com App Router
- Gerenciador de pacotes: pnpm
- TypeScript: Versão 5.8.3
- Estrutura de diretórios: src/ com app/ para o App Router
- UI: shadcn/ui com tema base Neutral
- Repositório Git inicializado e primeiro commit realizado

### Referências de Design
- Design clean e moderno
- Paleta de cores: tons de cinza, branco e roxo
- Interface mobile-first
- Calendários interativos
- Cards para exibição de informações

### Próximos Passos
- Criação das páginas principais (Plantões, Locais, Resumo, Ajustes) ✅
- Implementação do calendário interativo ✅
- Criação do sistema de cadastro e exibição de plantões ✅
- Implementação da navegação por tab bar inferior ✅
- Implementação de modais para adicionar/editar plantões e locais
- Melhorias na página de resumo financeiro
- Implementação de autenticação (futuro)

### Notas
- O projeto foi reiniciado do zero para aplicar melhorias estruturais
- A URL do repositório GitHub: https://github.com/Gjacks1978/plantoes-windsurf
