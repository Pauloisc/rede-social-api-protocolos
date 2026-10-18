export const typeDefs = /* GraphQL */ `
  # ==========================================
  # ENTIDADES DO DOMÍNIO
  # ==========================================

  type Perfil {
    usuarioId: ID!
    bio: String
    avatarUrl: String
    localizacao: String
    site: String
  }

  type Usuario {
    id: ID!
    username: String!
    nome: String!
    email: String!
    criadoEm: String!
    perfil: Perfil
    posts: [Post!]!
    seguidores: [Usuario!]!
    seguindo: [Usuario!]!
    totalPosts: Int!
    totalSeguidores: Int!
    totalSeguindo: Int!
  }

  type Post {
    id: ID!
    autorId: ID!
    autor: Usuario!
    conteudo: String!
    criadoEm: String!
    comentarios: [Comentario!]!
    curtidas: [Curtida!]!
    totalCurtidas: Int!
    totalComentarios: Int!
  }

  type Comentario {
    id: ID!
    postId: ID!
    post: Post!
    autorId: ID!
    autor: Usuario!
    texto: String!
    criadoEm: String!
  }

  type Curtida {
    id: ID!
    postId: ID!
    post: Post!
    usuarioId: ID!
    usuario: Usuario!
    criadoEm: String!
    jaExistia: Boolean
  }

  type RelacaoSeguidor {
    id: ID!
    seguidorId: ID!
    seguidor: Usuario!
    seguidoId: ID!
    seguido: Usuario!
    criadoEm: String!
    jaExistia: Boolean
  }

  # ==========================================
  # INPUTS PARA OS COMANDOS (MUTATIONS)
  # ==========================================

  input CriarUsuarioInput {
    username: String!
    nome: String!
    email: String!
    bio: String
    avatarUrl: String
    localizacao: String
    site: String
  }

  input CriarPostInput {
    autorId: ID!
    conteudo: String!
  }

  input ComentarInput {
    postId: ID!
    autorId: ID!
    texto: String!
  }

  input CurtirInput {
    postId: ID!
    usuarioId: ID!
  }

  input SeguirInput {
    seguidorId: ID!
    seguidoId: ID!
  }

  # ==========================================
  # 5 CONSULTAS (QUERIES) OBRIGATÓRIAS
  # ==========================================

  type Query {
    # 1. buscar_usuario
    buscarUsuario(idOuUsername: String!): Usuario

    # 2. posts_do_usuario
    postsDoUsuario(usuarioId: ID!): [Post!]!

    # 3. buscar_post
    buscarPost(id: ID!, postId: ID): Post

    # 4. seguidores_de e seguindo_de
    seguidoresDe(usuarioId: ID!): [Usuario!]!
    seguindoDe(usuarioId: ID!): [Usuario!]!

    # 5. feed_do_usuario
    feedDoUsuario(usuarioId: ID!, limite: Int): [Post!]!

    # Consulta utilitária para listar todos os usuários cadastrados
    todosUsuarios: [Usuario!]!
  }

  # ==========================================
  # 5 COMANDOS (MUTATIONS) OBRIGATÓRIOS
  # ==========================================

  type Mutation {
    # 1. criar_usuario
    criarUsuario(input: CriarUsuarioInput!): Usuario!

    # 2. criar_post
    criarPost(input: CriarPostInput!): Post!

    # 3. comentar
    comentar(input: ComentarInput!): Comentario!

    # 4. curtir
    curtir(input: CurtirInput!): Curtida!

    # 5. seguir
    seguir(input: SeguirInput!): RelacaoSeguidor!
  }
`;
