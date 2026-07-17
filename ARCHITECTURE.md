# Arquitetura do Sistema

## Tecnologias Utilizadas
- **Linguagem:** TypeScript
- **Front-End:** React 19, Vite, Tailwind CSS, Lucide React (Ícones)
- **Back-End:** Node.js, Express
- **Banco de Dados:** MongoDB (via Prisma ORM)

## Estrutura de Diretórios
- `/src`: Código-fonte do Front-End React.
  - `/src/App.tsx`: Ponto de entrada do Front-End e definição principal da interface.
  - `/src/main.tsx`: Ponto de inicialização do React.
  - `/src/index.css`: Arquivo de estilos globais configurado com Tailwind.
- `/server.ts`: Ponto de entrada principal do Back-End Express e dos middlewares do Vite.
- `/prisma`: Configurações do banco de dados.
  - `/prisma/schema.prisma`: Onde as tabelas/coleções e relacionamentos do banco de dados são definidos.
  - `/prisma/seed.ts`: Script para povoar o banco com dados de teste.
- `/index.html`: O template HTML base da aplicação, incluindo as referências de título e ícone na guia do navegador.
- `/metadata.json`: Informações básicas do projeto para o ambiente Google AI Studio.

## Fluxo da Aplicação (Full-Stack)
Esta aplicação utiliza a técnica de servidor integrado no desenvolvimento (Vite Middleware Mode). Isso significa que, no ambiente de desenvolvimento, o servidor Express atende as rotas `/api/*` e passa qualquer outra requisição para o Vite renderizar o Front-End de forma otimizada.
Em produção (Build), o servidor atende estaticamente a pasta `dist`.

## Endpoints do Back-End (API)
1. `GET /api/products`: Recupera produtos ociosos com busca em texto e filtragens, já aplicando o cálculo de `quantidadeDisponivel`.
2. `POST /api/requests`: Cria uma nova requisição de material utilizando Prisma Transactions, garantindo que o estoque não seja furado (Reserva Virtual).
3. `POST /api/procurement-intent`: Recebe uma intenção de compra e avisa se há materiais idênticos (por nome ou CATMAT) parados no almoxarifado.
4. `GET /api/analytics`: Calcula o ROI sustentável, verificando dinheiro economizado (RDE) e carbono evitado (CO2e) com os reusos.

## Padrões Adotados
1. **Reserva Virtual:** Em vez de subtrair diretamente do estoque, toda requisição incrementa o campo `quantidadeReservada`. O cálculo da disponibilidade fica em memória (Estoque - Reservado). Só após aprovação que a transferência definitiva (ou baixa física) deve acontecer.
2. **Separação de Camadas:** Todo o processo lógico complexo e transacional acontece no Back-End. O Front-End deve ser apenas "burro" consumindo as APIs e exibindo as informações aos usuários.

## Status Atual e Próximos Passos
- **Backend:** Concluído e integrado ao MongoDB utilizando o Prisma. Os endpoints `/api/products` e `/api/requests` estão implementados com a lógica de negócio transacional e conectada à base de dados.
- **Frontend (Próxima Fase de Desenvolvimento):** O frontend atual está implementado (`App.tsx` e componentes), porém ele ainda utiliza **mock de dados** via `localStorage` (como definido na v1). O próximo passo para a equipe de desenvolvimento é **substituir o estado em memória (mock) por chamadas `fetch`** para a nossa API no Express, tornando o sistema 100% full-stack e funcional com o banco MongoDB.

