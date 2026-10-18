import { Router } from 'express';
import { socialService, DomainError } from '../domain/socialService.js';

export const restRouter = Router();

// Middleware de tratamento para asyncHandler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Índice de rotas REST
restRouter.get('/', (req, res) => {
  res.json({
    nome: 'API REST - Rede Social Simplificada',
    versao: '1.0.0',
    comandos: [
      { operacao: 'criar_usuario', metodo: 'POST', rota: '/api/usuarios', body: ['username', 'nome', 'email', 'bio', 'avatarUrl', 'localizacao', 'site'] },
      { operacao: 'criar_post', metodo: 'POST', rota: '/api/posts', body: ['autorId', 'conteudo'] },
      { operacao: 'comentar', metodo: 'POST', rota: '/api/posts/:postId/comentarios', body: ['autorId', 'texto'] },
      { operacao: 'curtir', metodo: 'POST', rota: '/api/posts/:postId/curtidas', body: ['usuarioId'] },
      { operacao: 'seguir', metodo: 'POST', rota: '/api/usuarios/:usuarioId/seguir', body: ['seguidorId'] },
    ],
    consultas: [
      { operacao: 'buscar_usuario', metodo: 'GET', rota: '/api/usuarios/:idOuUsername' },
      { operacao: 'posts_do_usuario', metodo: 'GET', rota: '/api/usuarios/:usuarioId/posts' },
      { operacao: 'buscar_post', metodo: 'GET', rota: '/api/posts/:postId' },
      { operacao: 'seguidores_de', metodo: 'GET', rota: '/api/usuarios/:usuarioId/seguidores' },
      { operacao: 'seguindo_de', metodo: 'GET', rota: '/api/usuarios/:usuarioId/seguindo' },
      { operacao: 'conexoes (ambos)', metodo: 'GET', rota: '/api/usuarios/:usuarioId/conexoes' },
      { operacao: 'feed_do_usuario', metodo: 'GET', rota: '/api/usuarios/:usuarioId/feed' },
    ],
  });
});

// ==========================================
// COMANDOS REST (Operações de Escrita)
// ==========================================

/**
 * 1. criar_usuario
 * POST /api/usuarios
 */
restRouter.post(
  '/usuarios',
  asyncHandler((req, res) => {
    const { username, nome, email, bio, avatarUrl, localizacao, site } = req.body;
    const usuario = socialService.criarUsuario({ username, nome, email, bio, avatarUrl, localizacao, site });
    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário criado com sucesso.',
      dados: usuario,
    });
  })
);

/**
 * 2. criar_post
 * POST /api/posts
 */
restRouter.post(
  '/posts',
  asyncHandler((req, res) => {
    const { autorId, conteudo } = req.body;
    const post = socialService.criarPost({ autorId, conteudo });
    res.status(201).json({
      sucesso: true,
      mensagem: 'Post criado com sucesso.',
      dados: post,
    });
  })
);

/**
 * 3. comentar
 * POST /api/posts/:postId/comentarios
 * (Suporta também POST /api/comentarios com postId no body)
 */
restRouter.post(
  '/posts/:postId/comentarios',
  asyncHandler((req, res) => {
    const { postId } = req.params;
    const { autorId, texto } = req.body;
    const comentario = socialService.comentar({ postId, autorId, texto });
    res.status(201).json({
      sucesso: true,
      mensagem: 'Comentário publicado com sucesso.',
      dados: comentario,
    });
  })
);

restRouter.post(
  '/comentarios',
  asyncHandler((req, res) => {
    const { postId, autorId, texto } = req.body;
    const comentario = socialService.comentar({ postId, autorId, texto });
    res.status(201).json({
      sucesso: true,
      mensagem: 'Comentário publicado com sucesso.',
      dados: comentario,
    });
  })
);

/**
 * 4. curtir
 * POST /api/posts/:postId/curtidas
 */
restRouter.post(
  '/posts/:postId/curtidas',
  asyncHandler((req, res) => {
    const { postId } = req.params;
    const { usuarioId } = req.body;
    const curtida = socialService.curtir({ postId, usuarioId });
    const statusCode = curtida.jaExistia ? 200 : 201;
    res.status(statusCode).json({
      sucesso: true,
      mensagem: curtida.jaExistia ? 'Post já havia sido curtido por este usuário.' : 'Post curtido com sucesso.',
      dados: curtida,
    });
  })
);

/**
 * 5. seguir
 * POST /api/usuarios/:usuarioId/seguir (onde :usuarioId é quem será seguido)
 * ou POST /api/seguidores
 */
restRouter.post(
  '/usuarios/:usuarioId/seguir',
  asyncHandler((req, res) => {
    const seguidoId = req.params.usuarioId;
    const { seguidorId } = req.body;
    const relacao = socialService.seguir({ seguidorId, seguidoId });
    const statusCode = relacao.jaExistia ? 200 : 201;
    res.status(statusCode).json({
      sucesso: true,
      mensagem: relacao.jaExistia ? 'Você já seguia este usuário.' : 'Usuário seguido com sucesso.',
      dados: relacao,
    });
  })
);

restRouter.post(
  '/seguidores',
  asyncHandler((req, res) => {
    const { seguidorId, seguidoId } = req.body;
    const relacao = socialService.seguir({ seguidorId, seguidoId });
    const statusCode = relacao.jaExistia ? 200 : 201;
    res.status(statusCode).json({
      sucesso: true,
      mensagem: relacao.jaExistia ? 'Você já seguia este usuário.' : 'Usuário seguido com sucesso.',
      dados: relacao,
    });
  })
);

// ==========================================
// CONSULTAS REST (Operações de Leitura)
// ==========================================

/**
 * 1. buscar_usuario
 * GET /api/usuarios/:idOuUsername
 */
restRouter.get(
  '/usuarios/:idOuUsername',
  asyncHandler((req, res) => {
    const { idOuUsername } = req.params;
    const usuario = socialService.buscarUsuario(idOuUsername);
    res.json({
      sucesso: true,
      dados: usuario,
    });
  })
);

/**
 * 2. posts_do_usuario
 * GET /api/usuarios/:usuarioId/posts
 */
restRouter.get(
  '/usuarios/:usuarioId/posts',
  asyncHandler((req, res) => {
    const { usuarioId } = req.params;
    const posts = socialService.postsDoUsuario(usuarioId);
    res.json({
      sucesso: true,
      total: posts.length,
      dados: posts,
    });
  })
);

/**
 * 3. buscar_post
 * GET /api/posts/:postId
 */
restRouter.get(
  '/posts/:postId',
  asyncHandler((req, res) => {
    const { postId } = req.params;
    const post = socialService.buscarPost(postId);
    res.json({
      sucesso: true,
      dados: post,
    });
  })
);

/**
 * 4. seguidores_de / seguindo_de
 * GET /api/usuarios/:usuarioId/seguidores
 * GET /api/usuarios/:usuarioId/seguindo
 * GET /api/usuarios/:usuarioId/conexoes
 */
restRouter.get(
  '/usuarios/:usuarioId/seguidores',
  asyncHandler((req, res) => {
    const { usuarioId } = req.params;
    const seguidores = socialService.seguidoresDe(usuarioId);
    res.json({
      sucesso: true,
      total: seguidores.length,
      dados: seguidores,
    });
  })
);

restRouter.get(
  '/usuarios/:usuarioId/seguindo',
  asyncHandler((req, res) => {
    const { usuarioId } = req.params;
    const seguindo = socialService.seguindoDe(usuarioId);
    res.json({
      sucesso: true,
      total: seguindo.length,
      dados: seguindo,
    });
  })
);

restRouter.get(
  '/usuarios/:usuarioId/conexoes',
  asyncHandler((req, res) => {
    const { usuarioId } = req.params;
    const seguidores = socialService.seguidoresDe(usuarioId);
    const seguindo = socialService.seguindoDe(usuarioId);
    res.json({
      sucesso: true,
      dados: {
        totalSeguidores: seguidores.length,
        totalSeguindo: seguindo.length,
        seguidores,
        seguindo,
      },
    });
  })
);

/**
 * 5. feed_do_usuario
 * GET /api/usuarios/:usuarioId/feed
 */
restRouter.get(
  '/usuarios/:usuarioId/feed',
  asyncHandler((req, res) => {
    const { usuarioId } = req.params;
    const limite = req.query.limite ? parseInt(req.query.limite, 10) : 20;
    const feed = socialService.feedDoUsuario(usuarioId, { limite });
    res.json({
      sucesso: true,
      total: feed.length,
      dados: feed,
    });
  })
);

// Middleware de erros para o roteador REST
restRouter.use((err, req, res, next) => {
  const statusCode = err instanceof DomainError ? err.statusCode : 500;
  res.status(statusCode).json({
    sucesso: false,
    erro: {
      nome: err.name || 'Error',
      mensagem: err.message || 'Erro interno no servidor.',
      status: statusCode,
    },
  });
});
