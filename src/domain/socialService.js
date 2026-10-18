import { store } from '../data/store.js';

export class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'DomainError';
    this.statusCode = statusCode;
  }
}

export const socialService = {
  // ==========================================
  // COMANDOS (Mutations / Ações de escrita)
  // ==========================================

  /**
   * 1. criar_usuario
   * Cria um novo usuário e inicializa seu perfil associado.
   */
  criarUsuario({ username, nome, email, bio = '', avatarUrl = '', localizacao = '', site = '' }) {
    if (!username || !nome || !email) {
      throw new DomainError('Campos obrigatórios: username, nome e email.', 400);
    }

    const usernameNormalizado = username.trim().toLowerCase();
    const emailNormalizado = email.trim().toLowerCase();

    // Valida unicidade de username e email
    for (const u of store.usuarios.values()) {
      if (u.username.toLowerCase() === usernameNormalizado) {
        throw new DomainError(`Username "${username}" já está em uso.`, 409);
      }
      if (u.email.toLowerCase() === emailNormalizado) {
        throw new DomainError(`Email "${email}" já está cadastrado.`, 409);
      }
    }

    const id = store.generateId();
    const criadoEm = new Date().toISOString();

    const novoUsuario = {
      id,
      username: usernameNormalizado,
      nome: nome.trim(),
      email: emailNormalizado,
      criadoEm,
    };

    const novoPerfil = {
      usuarioId: id,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameNormalizado}`,
      localizacao: localizacao.trim(),
      site: site.trim(),
    };

    store.usuarios.set(id, novoUsuario);
    store.perfis.set(id, novoPerfil);

    return {
      ...novoUsuario,
      perfil: novoPerfil,
    };
  },

  /**
   * 2. criar_post
   * Cria uma nova publicação associada a um autor existente.
   */
  criarPost({ autorId, conteudo }) {
    if (!autorId || !conteudo) {
      throw new DomainError('Campos obrigatórios: autorId e conteudo.', 400);
    }

    const autor = store.usuarios.get(autorId);
    if (!autor) {
      throw new DomainError(`Autor com ID "${autorId}" não encontrado.`, 404);
    }

    if (conteudo.trim().length === 0) {
      throw new DomainError('O conteúdo do post não pode ser vazio.', 400);
    }

    const id = store.generateId();
    const criadoEm = new Date().toISOString();

    const novoPost = {
      id,
      autorId,
      conteudo: conteudo.trim(),
      criadoEm,
    };

    store.posts.set(id, novoPost);

    return {
      ...novoPost,
      autor,
      totalCurtidas: 0,
      totalComentarios: 0,
    };
  },

  /**
   * 3. comentar
   * Adiciona um comentário a um post existente.
   */
  comentar({ postId, autorId, texto }) {
    if (!postId || !autorId || !texto) {
      throw new DomainError('Campos obrigatórios: postId, autorId e texto.', 400);
    }

    const post = store.posts.get(postId);
    if (!post) {
      throw new DomainError(`Post com ID "${postId}" não encontrado.`, 404);
    }

    const autor = store.usuarios.get(autorId);
    if (!autor) {
      throw new DomainError(`Autor com ID "${autorId}" não encontrado.`, 404);
    }

    if (texto.trim().length === 0) {
      throw new DomainError('O comentário não pode ser vazio.', 400);
    }

    const id = store.generateId();
    const criadoEm = new Date().toISOString();

    const novoComentario = {
      id,
      postId,
      autorId,
      texto: texto.trim(),
      criadoEm,
    };

    store.comentarios.set(id, novoComentario);

    return {
      ...novoComentario,
      autor,
      post,
    };
  },

  /**
   * 4. curtir
   * Registra a curtida de um usuário em um post. Idempotente: se já curtiu, não duplica.
   */
  curtir({ postId, usuarioId }) {
    if (!postId || !usuarioId) {
      throw new DomainError('Campos obrigatórios: postId e usuarioId.', 400);
    }

    const post = store.posts.get(postId);
    if (!post) {
      throw new DomainError(`Post com ID "${postId}" não encontrado.`, 404);
    }

    const usuario = store.usuarios.get(usuarioId);
    if (!usuario) {
      throw new DomainError(`Usuário com ID "${usuarioId}" não encontrado.`, 404);
    }

    // Verifica se já curtiu
    for (const c of store.curtidas.values()) {
      if (c.postId === postId && c.usuarioId === usuarioId) {
        return {
          id: c.id,
          postId,
          usuarioId,
          criadoEm: c.criadoEm,
          jaExistia: true,
          usuario,
          post,
        };
      }
    }

    const id = store.generateId();
    const criadoEm = new Date().toISOString();

    const novaCurtida = {
      id,
      postId,
      usuarioId,
      criadoEm,
    };

    store.curtidas.set(id, novaCurtida);

    return {
      ...novaCurtida,
      jaExistia: false,
      usuario,
      post,
    };
  },

  /**
   * 5. seguir
   * Estabelece relação de seguidor entre dois usuários.
   */
  seguir({ seguidorId, seguidoId }) {
    if (!seguidorId || !seguidoId) {
      throw new DomainError('Campos obrigatórios: seguidorId e seguidoId.', 400);
    }

    if (seguidorId === seguidoId) {
      throw new DomainError('Um usuário não pode seguir a si mesmo.', 400);
    }

    const seguidor = store.usuarios.get(seguidorId);
    if (!seguidor) {
      throw new DomainError(`Usuário seguidor com ID "${seguidorId}" não encontrado.`, 404);
    }

    const seguido = store.usuarios.get(seguidoId);
    if (!seguido) {
      throw new DomainError(`Usuário a ser seguido com ID "${seguidoId}" não encontrado.`, 404);
    }

    // Verifica se já segue
    const jaSegue = store.seguidores.find(
      (s) => s.seguidorId === seguidorId && s.seguidoId === seguidoId
    );

    if (jaSegue) {
      return {
        ...jaSegue,
        jaExistia: true,
        seguidor,
        seguido,
      };
    }

    const novoSeguidorRel = {
      id: store.generateId(),
      seguidorId,
      seguidoId,
      criadoEm: new Date().toISOString(),
    };

    store.seguidores.push(novoSeguidorRel);

    return {
      ...novoSeguidorRel,
      jaExistia: false,
      seguidor,
      seguido,
    };
  },

  // ==========================================
  // CONSULTAS (Queries / Ações de leitura)
  // ==========================================

  /**
   * 1. buscar_usuario
   * Busca um usuário pelo ID ou pelo username com seu perfil e contadores.
   */
  buscarUsuario(idOuUsername) {
    if (!idOuUsername) {
      throw new DomainError('Informe o id ou username do usuário.', 400);
    }

    let usuario = store.usuarios.get(idOuUsername);
    if (!usuario) {
      for (const u of store.usuarios.values()) {
        if (u.username.toLowerCase() === idOuUsername.toLowerCase()) {
          usuario = u;
          break;
        }
      }
    }

    if (!usuario) {
      throw new DomainError(`Usuário "${idOuUsername}" não encontrado.`, 404);
    }

    const perfil = store.perfis.get(usuario.id) || null;
    const totalPosts = Array.from(store.posts.values()).filter((p) => p.autorId === usuario.id).length;
    const totalSeguidores = store.seguidores.filter((s) => s.seguidoId === usuario.id).length;
    const totalSeguindo = store.seguidores.filter((s) => s.seguidorId === usuario.id).length;

    return {
      ...usuario,
      perfil,
      totalPosts,
      totalSeguidores,
      totalSeguindo,
    };
  },

  /**
   * 2. posts_do_usuario
   * Lista todos os posts criados por um determinado usuário.
   */
  postsDoUsuario(usuarioId) {
    const usuario = store.usuarios.get(usuarioId);
    if (!usuario) {
      throw new DomainError(`Usuário com ID "${usuarioId}" não encontrado.`, 404);
    }

    const posts = Array.from(store.posts.values())
      .filter((p) => p.autorId === usuarioId)
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
      .map((post) => this._enriquecerPost(post));

    return posts;
  },

  /**
   * 3. buscar_post
   * Busca um post específico pelo ID, detalhando autor, comentários e curtidas.
   */
  buscarPost(postId) {
    const post = store.posts.get(postId);
    if (!post) {
      throw new DomainError(`Post com ID "${postId}" não encontrado.`, 404);
    }

    return this._enriquecerPostCompleto(post);
  },

  /**
   * 4. seguidores_de / seguindo_de
   * Lista os seguidores de um usuário e as pessoas que ele segue.
   */
  seguidoresDe(usuarioId) {
    const usuario = store.usuarios.get(usuarioId);
    if (!usuario) {
      throw new DomainError(`Usuário com ID "${usuarioId}" não encontrado.`, 404);
    }

    const conexoes = store.seguidores.filter((s) => s.seguidoId === usuarioId);
    return conexoes.map((c) => {
      const seguidor = store.usuarios.get(c.seguidorId);
      const perfil = store.perfis.get(c.seguidorId);
      return {
        ...seguidor,
        perfil,
        desde: c.criadoEm,
      };
    });
  },

  seguindoDe(usuarioId) {
    const usuario = store.usuarios.get(usuarioId);
    if (!usuario) {
      throw new DomainError(`Usuário com ID "${usuarioId}" não encontrado.`, 404);
    }

    const conexoes = store.seguidores.filter((s) => s.seguidorId === usuarioId);
    return conexoes.map((c) => {
      const seguido = store.usuarios.get(c.seguidoId);
      const perfil = store.perfis.get(c.seguidoId);
      return {
        ...seguido,
        perfil,
        desde: c.criadoEm,
      };
    });
  },

  /**
   * 5. feed_do_usuario
   * Retorna os posts das pessoas que o usuário segue + seus próprios posts, ordenados por data.
   */
  feedDoUsuario(usuarioId, { limite = 20 } = {}) {
    const usuario = store.usuarios.get(usuarioId);
    if (!usuario) {
      throw new DomainError(`Usuário com ID "${usuarioId}" não encontrado.`, 404);
    }

    // IDs das pessoas seguidas
    const seguidosIds = store.seguidores
      .filter((s) => s.seguidorId === usuarioId)
      .map((s) => s.seguidoId);

    // Feed inclui posts de quem ele segue + seus próprios posts
    const autoresPermitidos = new Set([usuarioId, ...seguidosIds]);

    const feed = Array.from(store.posts.values())
      .filter((p) => autoresPermitidos.has(p.autorId))
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
      .slice(0, limite)
      .map((post) => this._enriquecerPostCompleto(post));

    return feed;
  },

  // ==========================================
  // HELPERS INTERNOS DE ENRIQUECIMENTO
  // ==========================================

  _enriquecerPost(post) {
    const autor = store.usuarios.get(post.autorId);
    const perfil = store.perfis.get(post.autorId);
    const totalCurtidas = Array.from(store.curtidas.values()).filter((c) => c.postId === post.id).length;
    const totalComentarios = Array.from(store.comentarios.values()).filter((c) => c.postId === post.id).length;

    return {
      ...post,
      autor: {
        ...autor,
        perfil,
      },
      totalCurtidas,
      totalComentarios,
    };
  },

  _enriquecerPostCompleto(post) {
    const base = this._enriquecerPost(post);

    const comentarios = Array.from(store.comentarios.values())
      .filter((c) => c.postId === post.id)
      .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm))
      .map((comentario) => {
        const autorComentario = store.usuarios.get(comentario.autorId);
        const perfilAutor = store.perfis.get(comentario.autorId);
        return {
          ...comentario,
          autor: {
            ...autorComentario,
            perfil: perfilAutor,
          },
        };
      });

    const curtidas = Array.from(store.curtidas.values())
      .filter((c) => c.postId === post.id)
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
      .map((curtida) => {
        const usuarioCurtida = store.usuarios.get(curtida.usuarioId);
        return {
          ...curtida,
          usuario: usuarioCurtida,
        };
      });

    return {
      ...base,
      comentarios,
      curtidas,
    };
  },
};
