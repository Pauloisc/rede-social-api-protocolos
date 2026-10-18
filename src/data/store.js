import crypto from 'node:crypto';

// Banco de dados em memória para a rede social
class InMemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.usuarios = new Map();     // id -> Usuario
    this.perfis = new Map();       // usuarioId -> Perfil
    this.posts = new Map();        // id -> Post
    this.comentarios = new Map();  // id -> Comentario
    this.curtidas = new Map();     // id -> Curtida
    this.seguidores = [];          // Array<{ id, seguidorId, seguidoId, criadoEm }>
  }

  generateId() {
    return crypto.randomUUID();
  }
}

export const store = new InMemoryStore();
