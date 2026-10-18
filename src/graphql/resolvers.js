import { socialService } from '../domain/socialService.js';
import { store } from '../data/store.js';

export const resolvers = {
  // ==========================================
  // CONSULTAS (QUERIES)
  // ==========================================
  Query: {
    // 1. buscar_usuario
    buscarUsuario: (_root, { idOuUsername }) => {
      try {
        return socialService.buscarUsuario(idOuUsername);
      } catch (err) {
        if (err.statusCode === 404) return null;
        throw err;
      }
    },

    // 2. posts_do_usuario
    postsDoUsuario: (_root, { usuarioId }) => {
      return socialService.postsDoUsuario(usuarioId);
    },

    // 3. buscar_post
    buscarPost: (_root, { id, postId }) => {
      const targetId = id || postId;
      try {
        return socialService.buscarPost(targetId);
      } catch (err) {
        if (err.statusCode === 404) return null;
        throw err;
      }
    },

    // 4. seguidores_de / seguindo_de
    seguidoresDe: (_root, { usuarioId }) => {
      return socialService.seguidoresDe(usuarioId);
    },

    seguindoDe: (_root, { usuarioId }) => {
      return socialService.seguindoDe(usuarioId);
    },

    // 5. feed_do_usuario
    feedDoUsuario: (_root, { usuarioId, limite }) => {
      return socialService.feedDoUsuario(usuarioId, { limite: limite || 20 });
    },

    todosUsuarios: () => {
      return Array.from(store.usuarios.values());
    },
  },

  // ==========================================
  // COMANDOS (MUTATIONS)
  // ==========================================
  Mutation: {
    // 1. criar_usuario
    criarUsuario: (_root, { input }) => {
      return socialService.criarUsuario(input);
    },

    // 2. criar_post
    criarPost: (_root, { input }) => {
      return socialService.criarPost(input);
    },

    // 3. comentar
    comentar: (_root, { input }) => {
      return socialService.comentar(input);
    },

    // 4. curtir
    curtir: (_root, { input }) => {
      return socialService.curtir(input);
    },

    // 5. seguir
    seguir: (_root, { input }) => {
      return socialService.seguir(input);
    },
  },

  // ==========================================
  // RESOLVERS DE CAMPO (RELACIONAMENTOS EM GRAFO)
  // ==========================================
  Usuario: {
    perfil: (parent) => {
      if (parent.perfil) return parent.perfil;
      return store.perfis.get(parent.id) || null;
    },
    posts: (parent) => {
      return Array.from(store.posts.values())
        .filter((p) => p.autorId === parent.id)
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    },
    seguidores: (parent) => {
      return socialService.seguidoresDe(parent.id);
    },
    seguindo: (parent) => {
      return socialService.seguindoDe(parent.id);
    },
    totalPosts: (parent) => {
      if (typeof parent.totalPosts === 'number') return parent.totalPosts;
      return Array.from(store.posts.values()).filter((p) => p.autorId === parent.id).length;
    },
    totalSeguidores: (parent) => {
      if (typeof parent.totalSeguidores === 'number') return parent.totalSeguidores;
      return store.seguidores.filter((s) => s.seguidoId === parent.id).length;
    },
    totalSeguindo: (parent) => {
      if (typeof parent.totalSeguindo === 'number') return parent.totalSeguindo;
      return store.seguidores.filter((s) => s.seguidorId === parent.id).length;
    },
  },

  Post: {
    autor: (parent) => {
      if (parent.autor) return parent.autor;
      return store.usuarios.get(parent.autorId);
    },
    comentarios: (parent) => {
      if (parent.comentarios) return parent.comentarios;
      return Array.from(store.comentarios.values())
        .filter((c) => c.postId === parent.id)
        .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
    },
    curtidas: (parent) => {
      if (parent.curtidas) return parent.curtidas;
      return Array.from(store.curtidas.values())
        .filter((c) => c.postId === parent.id)
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    },
    totalCurtidas: (parent) => {
      if (typeof parent.totalCurtidas === 'number') return parent.totalCurtidas;
      return Array.from(store.curtidas.values()).filter((c) => c.postId === parent.id).length;
    },
    totalComentarios: (parent) => {
      if (typeof parent.totalComentarios === 'number') return parent.totalComentarios;
      return Array.from(store.comentarios.values()).filter((c) => c.postId === parent.id).length;
    },
  },

  Comentario: {
    autor: (parent) => {
      if (parent.autor) return parent.autor;
      return store.usuarios.get(parent.autorId);
    },
    post: (parent) => {
      if (parent.post) return parent.post;
      return store.posts.get(parent.postId);
    },
  },

  Curtida: {
    usuario: (parent) => {
      if (parent.usuario) return parent.usuario;
      return store.usuarios.get(parent.usuarioId);
    },
    post: (parent) => {
      if (parent.post) return parent.post;
      return store.posts.get(parent.postId);
    },
  },

  RelacaoSeguidor: {
    seguidor: (parent) => {
      if (parent.seguidor) return parent.seguidor;
      return store.usuarios.get(parent.seguidorId);
    },
    seguido: (parent) => {
      if (parent.seguido) return parent.seguido;
      return store.usuarios.get(parent.seguidoId);
    },
  },
};
