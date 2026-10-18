import { store } from './store.js';

export function seedDatabase() {
  store.reset();

  const agora = new Date();
  const subMinutos = (min) => new Date(agora.getTime() - min * 60000).toISOString();

  // 1. Usuários
  const usuarios = [
    {
      id: 'usr-alice',
      username: 'alice',
      nome: 'Alice Silva',
      email: 'alice@exemplo.com',
      criadoEm: subMinutos(120),
    },
    {
      id: 'usr-bob',
      username: 'bob',
      nome: 'Bob Santos',
      email: 'bob@exemplo.com',
      criadoEm: subMinutos(100),
    },
    {
      id: 'usr-carlos',
      username: 'carlos',
      nome: 'Carlos Oliveira',
      email: 'carlos@exemplo.com',
      criadoEm: subMinutos(80),
    },
  ];

  for (const u of usuarios) {
    store.usuarios.set(u.id, u);
  }

  // 2. Perfis
  const perfis = [
    {
      usuarioId: 'usr-alice',
      bio: 'Engenheira de Software apaixonada por arquiteturas distribuídas e APIs.',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=alice',
      localizacao: 'Natal, RN - Brasil',
      site: 'https://alice.dev',
    },
    {
      usuarioId: 'usr-bob',
      bio: 'Entusiasta de GraphQL e sistemas em tempo real.',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=bob',
      localizacao: 'São Paulo, SP - Brasil',
      site: 'https://bobsantos.tech',
    },
    {
      usuarioId: 'usr-carlos',
      bio: 'Estudante de Ciência da Computação e fã de protocolos web.',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=carlos',
      localizacao: 'Recife, PE - Brasil',
      site: 'https://carlos.io',
    },
  ];

  for (const p of perfis) {
    store.perfis.set(p.usuarioId, p);
  }

  // 3. Posts
  const posts = [
    {
      id: 'post-1',
      autorId: 'usr-alice',
      conteudo: 'Explorando as diferenças práticas entre REST e GraphQL hoje na Atividade 02!',
      criadoEm: subMinutos(60),
    },
    {
      id: 'post-2',
      autorId: 'usr-bob',
      conteudo: 'O problema do over-fetching é real. GraphQL resolve isso permitindo que o cliente escolha os campos.',
      criadoEm: subMinutos(40),
    },
    {
      id: 'post-3',
      autorId: 'usr-alice',
      conteudo: 'Mas não se esqueçam do cache HTTP nativo do REST com ETags e CDN!',
      criadoEm: subMinutos(20),
    },
  ];

  for (const post of posts) {
    store.posts.set(post.id, post);
  }

  // 4. Comentários
  const comentarios = [
    {
      id: 'com-1',
      postId: 'post-1',
      autorId: 'usr-bob',
      texto: 'Sensacional, Alice! Essa comparação lado a lado deixa tudo muito claro.',
      criadoEm: subMinutos(50),
    },
    {
      id: 'com-2',
      postId: 'post-1',
      autorId: 'usr-carlos',
      texto: 'Concordo totalmente! Excelente domínio para o estudo de APIs.',
      criadoEm: subMinutos(45),
    },
    {
      id: 'com-3',
      postId: 'post-2',
      autorId: 'usr-alice',
      texto: 'Verdade, Bob. No mobile a economia de dados do GraphQL faz muita diferença.',
      criadoEm: subMinutos(30),
    },
  ];

  for (const com of comentarios) {
    store.comentarios.set(com.id, com);
  }

  // 5. Curtidas
  const curtidas = [
    {
      id: 'curt-1',
      postId: 'post-1',
      usuarioId: 'usr-bob',
      criadoEm: subMinutos(55),
    },
    {
      id: 'curt-2',
      postId: 'post-1',
      usuarioId: 'usr-carlos',
      criadoEm: subMinutos(48),
    },
    {
      id: 'curt-3',
      postId: 'post-2',
      usuarioId: 'usr-alice',
      criadoEm: subMinutos(35),
    },
  ];

  for (const curt of curtidas) {
    store.curtidas.set(curt.id, curt);
  }

  // 6. Seguidores
  // Bob segue Alice, Carlos segue Alice, Alice segue Bob
  store.seguidores.push(
    {
      id: 'seg-1',
      seguidorId: 'usr-bob',
      seguidoId: 'usr-alice',
      criadoEm: subMinutos(90),
    },
    {
      id: 'seg-2',
      seguidorId: 'usr-carlos',
      seguidoId: 'usr-alice',
      criadoEm: subMinutos(70),
    },
    {
      id: 'seg-3',
      seguidorId: 'usr-alice',
      seguidoId: 'usr-bob',
      criadoEm: subMinutos(65),
    }
  );

  console.log('[Seed] Banco de dados inicializado com sucesso.');
}
