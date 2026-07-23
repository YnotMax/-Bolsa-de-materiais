# Contexto do Projeto: Bolsa de Materiais (PoC TRL3)

Este arquivo serve como base de conhecimento (System Instructions / Contexto) para que Inteligências Artificiais e Desenvolvedores entendam rapidamente a arquitetura, regras de negócio e o estado atual da aplicação.

## 🎯 Objetivo Principal
O projeto Bolsa de Materiais foi estruturado para ser uma solução de alto impacto e rápida adoção para a Prefeitura de Florianópolis (PMF). O objetivo principal é erradicar o desperdício de dinheiro público conectando secretarias que possuem materiais ociosos com secretarias que precisam desses materiais, evitando novas compras desnecessárias.

## 🏗️ Arquitetura e Engenharia (Stack Tecnológica)
Adotamos uma arquitetura full-stack moderna e desacoplada, utilizando o padrão Data Mapper para adaptar um sistema de inventário comercial para a realidade do setor público:

- **Frontend:** React + Vite (Single-Page Application), garantindo navegação fluida e sem recarregamentos.
- **Backend:** Node.js com Express, servindo como a camada de regras de negócio e integrações.
- **Banco de Dados:** MongoDB (NoSQL) gerenciado através do Prisma ORM.

### O Padrão de Adaptação (Data Mapper)
Removemos qualquer lógica financeira (como gateways de pagamento) e convertemos os perfis de acesso:
- *Store Owner* ➔ **Gestor Central** (SMA)
- *Supplier* ➔ **Secretaria Cedente** (dona do bem ocioso)
- *Client* ➔ **Secretaria Requisitante** (quem precisa do bem)

## 🎨 Conceito Visual e Identidade Institucional (gov.br DS)
A interface foi estruturada com foco em acessibilidade e transparência ativa:
- **Acessibilidade Nativa (eMAG e WCAG 2.1 AA):** Elementos em container de alto contraste, menus espaçados com áreas de toque seguras e suporte para navegação via teclado.
- **Paleta Institucional:** Azul-asfalto profundo (`#002F5A`), Verde de sucesso (`#006D35`), Ouro-alerta (`#FFCC00`).
- **Tags de Conservação Semânticas (Decreto Estadual nº 45.242/2009):**
  - **Novo:** Verde institucional (`#008844`)
  - **Bom:** Verde suave (`#2E9D62`)
  - **Regular:** Dourado (`#FFCC00`) com texto preto
  - **Péssimo:** Vermelho alerta (`#D93B3B`)
  - **Sucata:** Cinza neutro (`#737373`)
- **Tipografia:** Libre Franklin para cabeçalhos e Noto Sans para textos.

## 📂 Módulos Funcionais Implementados (Os Cinco Pilares)

1. **Vitrine Virtual de Bens Ociosos (Catálogo):**
   - **Busca Fuzzy Inteligente:** Cruzamento em tempo real por nome, categoria, CATMAT ou patrimônio.
   - **Filtros Incrementais Dinâmicos:** Filtros por Categoria, Secretaria e Estado de Conservação.
   - **Mitigação de CLS:** Botão "Carregar Mais" substitui a paginação clássica.
   - **Detalhes do Produto:** Visualização completa em modal.

2. **Carrinho de Remanejamento e Formulários:**
   - **Reserva Limitada:** Restringe a requisição à disponibilidade real (Estoque Líquido).
   - **Justificativa de Uso:** Exigência de justificativa detalhada para auditar a finalidade pública (mínimo de 10 caracteres).
   - **Validação Institucional:** E-mail do servidor estritamente validado (`@pmf.sc.gov.br`).

3. **Trava Sistêmica e Alerta Proativo de Compras:**
   - **Simulação de Compras:** Intercepta intenções de licitação (Nova Lei de Licitações - 14.133/2021).
   - **Bloqueio Ativo:** Sugere o remanejamento imediato se houver bem ocioso correspondente.
   - **Auditoria de Recusa:** Exige justificativa formal de no mínimo 15 caracteres caso o gestor burle a trava.

4. **Orquestrador de Workflow (Trâmites e Aprovação):**
   - **Aprovação Baseada em Papéis:** Alternador de perfil entre Cedente e Requisitante.
   - **Recusas Estruturadas:** Motivos de rejeição catalogados, impedindo recusas arbitrárias.
   - **Sincronização de Inventário:** Baixa física automática após homologação da transferência.

5. **Placar de Economia e ESG (Gamificação):**
   - **Redução de Despesa Estimada (RDE):** Dinheiro público economizado.
   - **Indicador Sustentável ESG:** Emissões de CO₂e evitadas (Selo Verde).
   - **Leaderboard:** Ranking das secretarias mais eficientes.

## ⚙️ Diferenciais de Engenharia
- **Reserva Otimista de Estoque (Transacional):** Ao submeter um pedido, o backend subtrai matematicamente da "disponibilidade virtual" (`I_disponivel = I_fisico - I_reservado`) prevenindo o "estoque fantasma".
- **Banco de Dados Semeado:** Script (`prisma/seed.ts`) permite povoar o banco rapidamente para demonstrações TRL3.
- **Preparado para Nuvem:** Configurações de compilação via `Vite` e `esbuild` para rodar Cliente e Servidor em contêineres Docker de forma segura e otimizada (Vite Middleware Mode).
- **Sem Lock-in Financeiro:** Código livre de módulos comerciais, faturamentos ou dependências de e-commerce convencionais (como Stripe).

## 🚀 Status Recente
- Integração de Banco de Dados MongoDB ativa e funcional via Prisma ORM (`DATABASE_URL`).
- Endpoint `GET /api/products` funcional. Endpoint de requisições `POST /api/requests` configurado com transações Prisma.
- Configurações do navegador (Favicon de 'pacote' e Título 'Bolsa de Materiais') aplicadas no `index.html`.
- O Frontend ainda utiliza persistência em `localStorage` (como definido no MVP inicial) e o próximo passo de desenvolvimento será conectar totalmente os estados React aos endpoints do Express.

## 🤖 Diretrizes e Instruções Obrigatórias para Agentes de IA

1. **Design System (gov.br DS):**
   - Todas as telas e componentes devem seguir estritamente o **Gov.BR Design System** (`@govbr-ds/core`), cujas implementações de componentes React estão localizadas em `src/components/` (ex: `Button.tsx`, `Input.tsx`, `Header.tsx`, `Modal.tsx`).
   - Acessibilidade e padronização visual governamental (WCAG 2.1 AA / eMAG) são prioritárias.

2. **Lista de Afazeres (`AFAZERES.md`):**
   - O arquivo [`AFAZERES.md`](file:///d:/estudos/Hackaton/desafio%2014/AFAZERES.md) contém o backlog completo e o checklist de tarefas (TODO) a serem realizadas no projeto.

3. **Atualização Obrigatória do Registro de Alterações (`atualizaçoes.md`):**
   - **REGRA CRÍTICA:** Qualquer nova alteração, refatoração, melhoria de UI ou funcionalidade implementada pelo agente de IA DEVE ser documentada e atualizada no arquivo [`atualizaçoes.md`](file:///d:/estudos/Hackaton/desafio%2014/atualiza%C3%A7oes.md) imediatamente após a sua conclusão.
