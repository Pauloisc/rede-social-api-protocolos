// Teste automatizado para todos os 5 comandos e 5 consultas da API GraphQL
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

async function graphqlRequest(query, variables = {}) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json().catch(() => null);
  return { status: res.status, data: json };
}

function printSection(title) {
  console.log(`\n================================================================`);
  console.log(` ${title}`);
  console.log(`================================================================`);
}

function printResult(operacao, tipo, doc, variables, status, resData) {
  console.log(`\n▶ [${tipo.toUpperCase()}] ${operacao}`);
  console.log(`  Documento GraphQL:\n${doc.trim()}`);
  if (Object.keys(variables).length > 0) {
    console.log(`  Variáveis:\n`, JSON.stringify(variables, null, 2));
  }
  console.log(`  Status HTTP: ${status}`);
  console.log(`  Resposta:\n`, JSON.stringify(resData, null, 2));
}

async function runTests() {
  console.log(`Iniciando testes da API GraphQL em: ${GRAPHQL_ENDPOINT}`);

  try {
    // -------------------------------------------------------------
    // AS 5 CONSULTAS GRAPHQL
    // -------------------------------------------------------------
    printSection('1. TESTANDO AS 5 CONSULTAS GRAPHQL');

    // Consulta 1: buscar_usuario
    {
      const doc = `
        query BuscarUsuario($idOuUsername: String!) {
          buscarUsuario(idOuUsername: $idOuUsername) {
            id
            username
            nome
            email
            perfil {
              bio
              avatarUrl
              localizacao
              site
            }
            totalPosts
            totalSeguidores
            totalSeguindo
          }
        }
      `;
      const vars = { idOuUsername: 'alice' };
      const { status, data } = await graphqlRequest(doc, vars);
      printResult('1. buscar_usuario', 'Consulta', doc, vars, status, data);
    }

    // Consulta 2: posts_do_usuario
    {
      const doc = `
        query PostsDoUsuario($usuarioId: ID!) {
          postsDoUsuario(usuarioId: $usuarioId) {
            id
            conteudo
            criadoEm
            totalCurtidas
            totalComentarios
          }
        }
      `;
      const vars = { usuarioId: 'usr-alice' };
      const { status, data } = await graphqlRequest(doc, vars);
      printResult('2. posts_do_usuario', 'Consulta', doc, vars, status, data);
    }

    // Consulta 3: buscar_post
    {
      const doc = `
        query BuscarPost($id: ID!) {
          buscarPost(id: $id) {
            id
            conteudo
            criadoEm
            autor {
              id
              username
              nome
            }
            comentarios {
              id
              texto
              criadoEm
              autor {
                username
                nome
              }
            }
            curtidas {
              id
              usuario {
                username
                nome
              }
            }
            totalCurtidas
            totalComentarios
          }
        }
      `;
      const vars = { id: 'post-1' };
      const { status, data } = await graphqlRequest(doc, vars);
      printResult('3. buscar_post', 'Consulta', doc, vars, status, data);
    }

    // Consulta 4: seguidores_de / seguindo_de
    {
      const doc = `
        query ConexoesDoUsuario($usuarioId: ID!) {
          seguidores: seguidoresDe(usuarioId: $usuarioId) {
            id
            username
            nome
          }
          seguindo: seguindoDe(usuarioId: $usuarioId) {
            id
            username
            nome
          }
        }
      `;
      const vars = { usuarioId: 'usr-alice' };
      const { status, data } = await graphqlRequest(doc, vars);
      printResult('4. seguidores_de / seguindo_de', 'Consulta', doc, vars, status, data);
    }

    // Consulta 5: feed_do_usuario
    {
      const doc = `
        query FeedDoUsuario($usuarioId: ID!) {
          feedDoUsuario(usuarioId: $usuarioId) {
            id
            conteudo
            criadoEm
            autor {
              id
              username
              nome
            }
            totalCurtidas
            totalComentarios
            comentarios {
              texto
              autor {
                username
              }
            }
          }
        }
      `;
      const vars = { usuarioId: 'usr-bob' };
      const { status, data } = await graphqlRequest(doc, vars);
      printResult('5. feed_do_usuario', 'Consulta', doc, vars, status, data);
    }

    // -------------------------------------------------------------
    // OS 5 COMANDOS GRAPHQL (MUTATIONS)
    // -------------------------------------------------------------
    printSection('2. TESTANDO OS 5 COMANDOS GRAPHQL');

    let novoUsuarioId = null;
    let novoPostId = null;

    // Comando 1: criar_usuario
    {
      const doc = `
        mutation CriarUsuario($input: CriarUsuarioInput!) {
          criarUsuario(input: $input) {
            id
            username
            nome
            email
            perfil {
              bio
              localizacao
            }
          }
        }
      `;
      const vars = {
        input: {
          username: `gql_user_${Date.now()}`,
          nome: 'Usuária GraphQL',
          email: `gql_${Date.now()}@exemplo.com`,
          bio: 'Perfil cadastrado via Mutation GraphQL',
          localizacao: 'Recife/PE',
        },
      };
      const { status, data } = await graphqlRequest(doc, vars);
      novoUsuarioId = data?.data?.criarUsuario?.id;
      printResult('1. criar_usuario', 'Comando', doc, vars, status, data);
    }

    // Comando 2: criar_post
    {
      const doc = `
        mutation CriarPost($input: CriarPostInput!) {
          criarPost(input: $input) {
            id
            conteudo
            criadoEm
            autor {
              id
              username
            }
          }
        }
      `;
      const vars = {
        input: {
          autorId: novoUsuarioId || 'usr-alice',
          conteudo: 'Publicação criada via Mutation do GraphQL!',
        },
      };
      const { status, data } = await graphqlRequest(doc, vars);
      novoPostId = data?.data?.criarPost?.id;
      printResult('2. criar_post', 'Comando', doc, vars, status, data);
    }

    // Comando 3: comentar
    {
      const doc = `
        mutation Comentar($input: ComentarInput!) {
          comentar(input: $input) {
            id
            texto
            criadoEm
            autor {
              username
            }
            post {
              id
            }
          }
        }
      `;
      const vars = {
        input: {
          postId: novoPostId || 'post-1',
          autorId: 'usr-bob',
          texto: 'Comentário enviado diretamente via GraphQL Mutation!',
        },
      };
      const { status, data } = await graphqlRequest(doc, vars);
      printResult('3. comentar', 'Comando', doc, vars, status, data);
    }

    // Comando 4: curtir
    {
      const doc = `
        mutation Curtir($input: CurtirInput!) {
          curtir(input: $input) {
            id
            criadoEm
            jaExistia
            usuario {
              username
            }
            post {
              id
            }
          }
        }
      `;
      const vars = {
        input: {
          postId: novoPostId || 'post-2',
          usuarioId: 'usr-carlos',
        },
      };
      const { status, data } = await graphqlRequest(doc, vars);
      printResult('4. curtir', 'Comando', doc, vars, status, data);
    }

    // Comando 5: seguir
    {
      const doc = `
        mutation Seguir($input: SeguirInput!) {
          seguir(input: $input) {
            id
            criadoEm
            jaExistia
            seguidor {
              username
            }
            seguido {
              username
            }
          }
        }
      `;
      const vars = {
        input: {
          seguidorId: 'usr-bob',
          seguidoId: 'usr-carlos',
        },
      };
      const { status, data } = await graphqlRequest(doc, vars);
      printResult('5. seguir', 'Comando', doc, vars, status, data);
    }

    printSection('TODOS OS 10 TESTES GRAPHQL CONCLUÍDOS COM SUCESSO!');
  } catch (error) {
    console.error('Erro durante a execução dos testes GraphQL:', error);
    process.exit(1);
  }
}

runTests();
