# RESUMO DO PROJETO PLANTOES

## Visão Geral
O aplicativo "plantoes" é uma solução mobile-first para médicos gerenciarem seus plantões, com foco em organização, controle financeiro e facilidade de uso. Desenvolvido com tecnologias modernas, o app oferece uma interface intuitiva e funcionalidades essenciais para o gerenciamento eficiente de plantões médicos.

## Stack Tecnológica
- **Framework**: Next.js 15.3.1 com App Router
- **Linguagem**: TypeScript 5.8.3
- **Estilização**: Tailwind CSS 3.4.1 + shadcn/ui (tema Neutral)
- **Gerenciador de Estado**: Context API do React
- **Persistência**: localStorage (primeira fase)
- **Gerenciador de Pacotes**: pnpm
- **Componentes UI**: shadcn/ui, Lucide React (ícones)
- **Gráficos**: Recharts
- **Notificações**: Sonner

## Funcionalidades Implementadas

### Navegação
- Barra de navegação inferior com 4 seções principais:
  - Plantões (calendário)
  - Locais (hospitais)
  - Resumo (financeiro)
  - Ajustes

### Gerenciamento de Estado
- Context API com contextos separados:
  - `PlantoesContext`: gerencia dados de plantões
  - `LocaisContext`: gerencia dados de locais/hospitais
  - `AppProvider`: combina os contextos em um provider global

### Páginas Principais
1. **Página Inicial (Plantões)**
   - Calendário interativo
   - Visualização de plantões por data
   - Botão flutuante para adicionar plantões

2. **Página de Locais**
   - Lista de hospitais/locais de plantão
   - Informações de nome, endereço e cor associada
   - Opções para editar e excluir

3. **Página de Resumo**
   - Cards com informações financeiras
   - Gráficos de valores e horas trabalhadas
   - Filtros por período (mês, trimestre, ano)

4. **Página de Ajustes**
   - Configurações de aparência
   - Configurações de notificações
   - Gerenciamento de dados (exportar/importar)

### Persistência de Dados
- Armazenamento local usando localStorage
- Carregamento automático de dados na inicialização
- Salvamento automático quando os dados mudam

## Estado Atual do Desenvolvimento
O projeto está em fase funcional com as principais telas implementadas e um sistema de gerenciamento de estado completo. Os dados são persistidos localmente e a navegação entre páginas está funcionando corretamente. O design segue as diretrizes estabelecidas, com uma interface clean e moderna usando a paleta de cores definida (tons de roxo, cinza e branco).

## Próximos Passos

### Curto Prazo
- Implementar modais para adicionar/editar plantões
- Implementar modais para adicionar/editar locais
- Melhorar a página de resumo financeiro com mais gráficos e estatísticas
- Adicionar validação de formulários com React Hook Form + Zod

### Médio Prazo
- Implementar exportação/importação de dados
- Adicionar tema escuro
- Melhorar a experiência móvel com gestos e animações
- Implementar notificações para lembrar de plantões

### Longo Prazo
- Implementar autenticação de usuários
- Sincronização com backend (Firebase ou similar)
- Versão PWA para instalação em dispositivos
- Funcionalidades premium (relatórios avançados, backup na nuvem)

## Desafios Superados
- Correção de problemas de estilização com Tailwind CSS
- Downgrade do Tailwind CSS v4 (beta) para v3.4.1 (estável)
- Resolução de conflitos de configuração do PostCSS
- Implementação de um sistema de gerenciamento de estado eficiente

## Conclusão
O projeto "plantoes" está progredindo bem, com uma base sólida estabelecida e as principais funcionalidades implementadas. A arquitetura escolhida permite fácil extensão e manutenção, preparando o caminho para futuras implementações como autenticação e sincronização com backend.
