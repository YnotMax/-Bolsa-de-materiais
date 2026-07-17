# Bolsa de Materiais

## Visão Geral
O **Bolsa de Materiais** é uma aplicação web Full-Stack desenvolvida para facilitar a redistribuição, reuso e gestão inteligente de materiais e equipamentos ociosos entre diferentes secretarias ou departamentos de uma organização (foco inicial no setor público). 

O objetivo principal é evitar compras redundantes, reduzir o desperdício, gerar economia aos cofres públicos (Redução de Despesa Estimada - RDE) e promover a sustentabilidade (redução de emissões de CO2).

## O Que Foi Feito Até Agora
1. **Configuração Full-Stack:** 
   - Servidor Node.js + Express + Vite + React.
   - Linguagem principal: TypeScript.
2. **Integração de Banco de Dados:**
   - Integração com **MongoDB** utilizando **Prisma ORM**.
   - Resolução de problemas com a URL de conexão do MongoDB (correção automática de formato no `server.ts`).
3. **Modelagem de Dados (Schema):**
   - Criação de entidades como `Usuario`, `Secretaria`, `Produto`, `Requisicao` e `ItemRequisicao`.
   - Seed populando o banco de dados com dados de laboratório (TRL3).
4. **Construção dos 4 Pilares da API:**
   - **Pilar A:** Vitrine e Busca Inteligente (Fuzzy Matching e cálculo em tempo real do estoque líquido).
   - **Pilar B:** Motor de Aprovação e Reserva Virtual (Garantia de concorrência com transações locais).
   - **Pilar C:** Alerta de Ociosidade no Planejamento de Compras (Cruza intenção de compra com estoque disponível na rede).
   - **Pilar D:** Relatórios de Desempenho e ESG (Cálculo de emissões de CO2 poupadas e impacto financeiro).
5. **Front-End:**
   - Tela com componentes React utilizando Tailwind CSS.
   - Customização visual e inserção do ícone e título na guia do navegador.

## Como Iniciar
Consulte o arquivo [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes técnicos de como rodar e colaborar com o projeto.

## Arquitetura
Consulte o arquivo [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes técnicos sobre a base de código.
