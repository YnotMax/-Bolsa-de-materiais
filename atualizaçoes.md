# 🚀 Registro de Atualizações (Changelog)

Este arquivo documenta todas as implementações e melhorias recentes realizadas no projeto **Bolsa de Materiais**.

## 🎨 Melhorias de UI/UX (Interface)

- **Layout de Listagem (Estilo AliExpress) + Alternador de Visualização (Lista / Grade):** 
  - A visualização padrão dos itens na vitrine é em **lista horizontal**, com foto na lateral e detalhes à direita.
  - Adicionamos um **alternador de exibição (Lista vs Grade)** no topo dos resultados utilizando os botões circulares padronizados do **Gov.BR DS** (`Button circle size="small"`).
  - Corrigimos o layout no **Modo Grade** para que nenhum botão ou valor monetário ("Economia Estimada") seja cortado na tela, reorganizando as estatísticas e os botões em duas linhas limpas e bem distribuídas.
- **Filtros Interativos em Botões (Pills):**
  - Antigas caixas de seleção (dropdowns) foram substituídas por botões (tags/pills) para um clique mais ágil.
  - O estilo visual dos botões inativos foi ajustado para ter contorno (variante *secundária* do Gov.BR), garantindo uma estética muito mais profissional e organizada, com quebras de linha responsivas.
- **Decomposição do Lote (Detalhamento por Estado de Conservação):**
  - Agora o sistema exibe não apenas a quantidade total disponível, mas a **decomposição detalhada dos estados do lote** (ex: *15 un. (10 Boas, 5 Regulares)* ou *140 Novas*).
  - Essa informação é destacada tanto nos cards da Vitrine (Modo Lista e Modo Grade) quanto dentro do modal de detalhes do produto.
- **Atalhos Rápidos de Busca:**
  - Inserida uma barra de atalhos rápidos logo abaixo da pesquisa principal com termos altamente procurados (ex: Cadeira, Mesa, Monitor, Armário), bastando um clique para filtrar toda a lista.

## 🔐 Perfis e Autenticação (Admin)

- **Criação do Perfil de Administrador:**
  - Adicionado suporte nativo à role `admin` no sistema.
- **Painel de Gerenciamento & Auditoria de Transações (Gestor Admin):**
  - Adicionado um painel exclusivo de **Auditoria em Tempo Real** na aba de *Placar & Relatórios* visível ao logar como **Gestor Central (SMA)**.
  - Exibe a linha do tempo completa das ações dos servidores no sistema: logons, requisições de remanejamento, cadastros de excedentes no estoque, liberações e interceptações de intenção de compra pela Trava Sistêmica.
- **Novo Login de Teste:**
  - Criado o usuário **Gestor Central (SMA)** na tela inicial de Login, que simula o perfil de Administrador.
- **Acesso Global aos Dados:**
  - O Administrador visualiza um header exclusivo indicando sua permissão ("Administrador") e tem acesso amplo às telas de **Trâmites e Aprovações** (Workflow) e aos **Relatórios e Placar ESG** abrangendo o escopo de todas as secretarias.

## 📦 Variedade de Itens e Banco de Dados (Mock)

Para enriquecer a experiência visual da vitrine e validar os novos filtros com consistência, injetamos uma série de novos materiais ociosos tanto no backend (`server.ts`) quanto no mock do frontend (`data.ts`):

1. **Armário de Aço 2 Portas** (Categoria: Mobiliário | Estado: Bom)
2. **Fragmentadora de Papel Secreta** (Categoria: Outros | Estado: Sucata)
3. **Mesa de Reunião Redonda** (Categoria: Mobiliário | Estado: Regular)
4. **Quadro Branco Magnético** (Categoria: Materiais de Escritório | Estado: Bom)
5. **Mouse Óptico USB** (Categoria: Informática | Estado: Novo)


