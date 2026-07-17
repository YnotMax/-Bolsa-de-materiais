# Guia de Contribuição

Bem-vindo(a) ao projeto Bolsa de Materiais! Este guia é destinado aos desenvolvedores parceiros que atuarão na manutenção e criação de novas funcionalidades do projeto.

## Pré-requisitos
- Node.js (v18+)
- Conta no MongoDB Atlas (ou um servidor MongoDB local em execução).
- Uma URL de conexão (`DATABASE_URL`) fornecida pelo MongoDB.

## Primeiros Passos

1. **Dependências:** 
   Certifique-se de instalar os pacotes (ou caso o ambiente já instale automaticamente, aguarde o carregamento):
   ```bash
   npm install
   ```

2. **Variáveis de Ambiente:**
   Existe um arquivo chamado `.env`. Caso ele não exista, crie um baseado no `.env.example`.
   - Configure a variável `DATABASE_URL` no `.env` com a sua String de conexão do MongoDB.
   - **IMPORTANTE:** Certifique-se de adicionar o nome do banco de dados na sua URL (ex: `mongodb+srv://user:pass@cluster.net/bolsa_materiais?retryWrites=true...`). O código no `server.ts` possui uma trava de segurança e tenta arrumar URLs vazias, mas é melhor configurar corretamente.
   - Você precisará configurar o IP do seu ambiente de desenvolvimento (ou `0.0.0.0/0`) no "Network Access" do MongoDB Atlas para que ele aceite as requisições.

3. **Banco de Dados (Prisma):**
   Antes de rodar a aplicação pela primeira vez ou quando o `schema.prisma` for alterado, você precisa atualizar as tipagens e aplicar as mudanças:
   ```bash
   npx prisma generate
   ```
   
   Para povoar (semeadura inicial) os dados de testes:
   ```bash
   npm run seed
   ```

4. **Rodando a Aplicação Localmente:**
   Para rodar o servidor Express com o React empacotado:
   ```bash
   npm run dev
   ```
   A aplicação vai rodar localmente no endereço padrão (geralmente `http://localhost:3000`).

## Boas Práticas
- **Comentários:** Se você criar lógicas complexas, adicione comentários em português claro.
- **Responsividade:** Todas as interfaces (React/Tailwind) devem ser pensadas Mobile-first e devem ficar bonitas em diferentes tamanhos de tela.
- **Full-Stack e Segurança:** Chaves de banco de dados ou lógicas cruciais não devem vazar para o cliente (NUNCA coloque credenciais dentro da pasta `/src`). Tudo deve passar pelo Express em `/server.ts`.
- **Limpeza de Código:** Evite agrupar tudo em um único arquivo, se for possível, exporte componentes filhos no React para arquivos em `src/components/`.
