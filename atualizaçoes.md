# 🚀 Registro de Atualizações (Changelog)

Este arquivo documenta todas as implementações e melhorias recentes realizadas no projeto **Bolsa de Materiais**.

## 🎨 Melhorias de UI/UX (Interface)

- **Layout de Listagem (Estilo AliExpress) + Alternador de Visualização (Lista / Grade):** 
  - A visualização padrão dos itens na vitrine é em **lista horizontal**, com foto na lateral e detalhes à direita.
  - Adicionamos um **alternador de exibição (Lista vs Grade)** no topo dos resultados utilizando os botões circulares padronizados do **Gov.BR DS** (`Button circle size="small"`).
  - Corrigimos o layout no **Modo Grade** para que nenhum botão ou valor monetário ("Economia Estimada") seja cortado na tela, reorganizando as estatísticas e os botões em duas linhas limpas e bem distribuídas.
- **Filtros Interativos em Botões (Pills) & Scroll Independente:**
  - Substituímos os selects por botões (tags/pills) com contorno oficial.
  - Corrigido o problema onde os últimos botões de "Estado de Conservação" ficavam escondidos no final da página: a barra de filtros lateral agora possui **altura ajustada à tela (`max-h`) e rolagem própria e independente (`overflow-y-auto`)**, sem exigir a rolagem da página toda.
- **Reorganização do Botão de Resetar Busca:**
  - Removido o botão solitário "Resetar Busca" que ficava perdido no card de apresentação superior.
  - O botão **"Limpar Filtros & Busca"** agora aparece de forma muito mais intuitiva diretamente na **seção da barra de pesquisa e atalhos rápidos**, aparecendo somente quando há algum filtro ou busca ativa.
- **Atalhos Rápidos de Busca:**
  - Inserida uma barra de atalhos rápidos logo abaixo da pesquisa principal com termos altamente procurados (ex: Cadeira, Mesa, Monitor, Armário), bastando um clique para filtrar toda a lista.
- **Remoção do Card de Apresentação:**
  - O card de boas-vindas ("Catálogo de Bens Ociosos") foi removido do topo da tela da Vitrine para priorizar o espaço da barra de busca e dos atalhos rápidos, tornando a interface mais limpa e focada na ação.

## 🔐 Perfis e Autenticação (Admin)

- **Criação do Perfil de Administrador:**
  - Adicionado suporte nativo à role `admin` no sistema.
- **Painel de Gerenciamento & Auditoria de Transações (Padrão Gov.BR DS):**
  - O painel exclusivo de auditoria do **Gestor Central (SMA)** foi completamente redesenhado para seguir estritamente o **Gov.BR Design System** (`br-card bg-white`, tipografia institucional, cores de marca `#002F5A` e tags semânticas eMAG/WCAG 2.1 AA).
  - Exibe a tabela institucional com carimbo de data/hora, órgão municipal solicitante, ações realizadas e status oficial (Trava Sistêmica, Cessão, Requisição, Homologação).
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

## 🛒 Funcionalidades Avançadas de Remanejamento

- **Matriz de Reservas por Secretaria e Estado (Disponibilidade Consolidada):**
  - O Modal de Detalhes do Produto foi reescrito para substituir a simples aprovação de um "lote isolado" por uma poderosa **Tabela de Matriz de Disponibilidade**.
  - O sistema agora agrupa automaticamente **todos os itens com o mesmo código CATMAT** da prefeitura inteira e apresenta uma visão cruzada entre:
    - **Linhas:** Órgão/Secretaria Cedente (ex: SME, SMS, SMA).
    - **Colunas:** Os 5 Estados de Conservação oficiais (**Novo, Bom, Regular, Péssimo, Sucata**), exibindo cabeçalhos com o mesmo design visual (cores e badges) dos filtros e cards, facilitando a identificação imediata pelo usuário.
  - **Carrinho Inteligente por Célula:** O usuário clica na célula desejada, seleciona precisamente a quantidade que deseja através do controle interativo `[-] [+]` e clica em **Adicionar**. É possível reservar múltiplos itens idênticos de diferentes secretarias e estados, tudo na mesma tela!
