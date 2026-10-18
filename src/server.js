import express from 'express';
import cors from 'cors';
import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { restRouter } from './rest/routes.js';
import { seedDatabase } from './data/seed.js';

// Inicializa banco em memória com dados de exemplo
seedDatabase();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota raiz: Painel informativo e links rápidos
app.get('/', (req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Atividade 02 - Protocolos de API (REST vs GraphQL)</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
        h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .card h2 { margin-top: 0; color: #0f172a; }
        a.btn { display: inline-block; background: #2563eb; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
        a.btn:hover { background: #1d4ed8; }
        code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
        ul { padding-left: 20px; }
        li { margin-bottom: 6px; }
        .badge { background: #10b981; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Rede Social Simplificada <span class="badge">Atividade 02</span></h1>
      <p>Servidor unificado expondo o mesmo domínio de rede social em dois protocolos: <strong>REST</strong> e <strong>GraphQL</strong>.</p>
      
      <div class="card">
        <h2>1. Protocolo REST</h2>
        <p>Acesse os endpoints REST em <code>/api</code> com verbos HTTP semânticos (GET, POST).</p>
        <p><strong>Exemplos:</strong></p>
        <ul>
          <li><code>GET /api/usuarios/usr-alice</code> (buscar_usuario)</li>
          <li><code>GET /api/usuarios/usr-alice/feed</code> (feed_do_usuario)</li>
          <li><code>GET /api/posts/post-1</code> (buscar_post)</li>
        </ul>
        <a class="btn" href="/api" target="_blank">Acessar Índice da API REST</a>
      </div>

      <div class="card">
        <h2>2. Protocolo GraphQL</h2>
        <p>Acesse o endpoint único <code>/graphql</code> com o <strong>GraphiQL Playground</strong> interativo no navegador para testar consultas (Queries) e comandos (Mutations) em tempo real com autocompletar e documentação do Schema.</p>
        <a class="btn" style="background: #e10098;" href="/graphql" target="_blank">Abrir GraphiQL Playground</a>
      </div>

      <div class="card">
        <h2>Instruções Rápidas de Teste Automatizado</h2>
        <p>Para testar todas as 10 operações em cada protocolo no terminal:</p>
        <pre><code>npm run test:rest      # Executa os 5 comandos e 5 consultas REST
npm run test:graphql   # Executa os 5 comandos e 5 consultas GraphQL
npm run test:all       # Executa testes completos em ambos os protocolos</code></pre>
      </div>
    </body>
    </html>
  `);
});

// Monta as rotas REST em /api
app.use('/api', restRouter);

// Configura o Yoga GraphQL com Schema e GraphiQL Playground
const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: '/graphql',
  graphiql: true,
});

// Monta o GraphQL em /graphql
app.use(yoga.graphqlEndpoint, yoga);

// Inicializa o servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` Servidor de Protocolos (Atividade 02) iniciado com sucesso!`);
  console.log(` - Painel Web:       http://localhost:${PORT}`);
  console.log(` - API REST:         http://localhost:${PORT}/api`);
  console.log(` - GraphQL (GraphiQL): http://localhost:${PORT}/graphql`);
  console.log(`================================================================`);
});

export default app;
