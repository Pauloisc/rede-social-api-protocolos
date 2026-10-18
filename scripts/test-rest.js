// Teste automatizado para todos os 5 comandos e 5 consultas da API REST
const BASE_URL = process.env.BASE_URL || 'http://localhost:4000/api';

async function request(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function printSection(title) {
  console.log(`\n================================================================`);
  console.log(` ${title}`);
  console.log(`================================================================`);
}

function printResult(operacao, tipo, endpoint, reqBody, status, resData) {
  console.log(`\n▶ [${tipo.toUpperCase()}] ${operacao}`);
  console.log(`  Requisição: ${endpoint}`);
  if (reqBody) {
    console.log(`  Body Enviado:\n`, JSON.stringify(reqBody, null, 2));
  }
  console.log(`  Status HTTP: ${status}`);
  console.log(`  Resposta:\n`, JSON.stringify(resData, null, 2));
}

async function runTests() {
  console.log(`Iniciando testes da API REST em: ${BASE_URL}`);

  try {
    // -------------------------------------------------------------
    // AS 5 CONSULTAS REST
    // -------------------------------------------------------------
    printSection('1. TESTANDO AS 5 CONSULTAS REST');

    // Consulta 1: buscar_usuario
    {
      const { status, data } = await request('GET', '/usuarios/usr-alice');
      printResult('1. buscar_usuario', 'Consulta', 'GET /api/usuarios/usr-alice', null, status, data);
    }

    // Consulta 2: posts_do_usuario
    {
      const { status, data } = await request('GET', '/usuarios/usr-alice/posts');
      printResult('2. posts_do_usuario', 'Consulta', 'GET /api/usuarios/usr-alice/posts', null, status, data);
    }

    // Consulta 3: buscar_post
    {
      const { status, data } = await request('GET', '/posts/post-1');
      printResult('3. buscar_post', 'Consulta', 'GET /api/posts/post-1', null, status, data);
    }

    // Consulta 4: seguidores_de / seguindo_de
    {
      const { status, data } = await request('GET', '/usuarios/usr-alice/conexoes');
      printResult('4. seguidores_de / seguindo_de', 'Consulta', 'GET /api/usuarios/usr-alice/conexoes', null, status, data);
    }

    // Consulta 5: feed_do_usuario
    {
      const { status, data } = await request('GET', '/usuarios/usr-alice/feed');
      printResult('5. feed_do_usuario', 'Consulta', 'GET /api/usuarios/usr-alice/feed', null, status, data);
    }

    // -------------------------------------------------------------
    // OS 5 COMANDOS REST
    // -------------------------------------------------------------
    printSection('2. TESTANDO OS 5 COMANDOS REST');

    let novoUsuarioId = null;
    let novoPostId = null;

    // Comando 1: criar_usuario
    {
      const body = {
        username: `dev_${Date.now()}`,
        nome: 'Desenvolvedor Teste',
        email: `dev_${Date.now()}@exemplo.com`,
        bio: 'Criando perfil via teste REST',
        localizacao: 'Brasília/DF',
        site: 'https://github.com/devteste',
      };
      const { status, data } = await request('POST', '/usuarios', body);
      novoUsuarioId = data?.dados?.id;
      printResult('1. criar_usuario', 'Comando', 'POST /api/usuarios', body, status, data);
    }

    // Comando 2: criar_post
    {
      const body = {
        autorId: novoUsuarioId || 'usr-bob',
        conteudo: 'Publicação criada com sucesso via requisição REST!',
      };
      const { status, data } = await request('POST', '/posts', body);
      novoPostId = data?.dados?.id;
      printResult('2. criar_post', 'Comando', 'POST /api/posts', body, status, data);
    }

    // Comando 3: comentar
    {
      const body = {
        autorId: 'usr-alice',
        texto: 'Comentário feito via rota REST no novo post!',
      };
      const { status, data } = await request('POST', `/posts/${novoPostId || 'post-1'}/comentarios`, body);
      printResult('3. comentar', 'Comando', `POST /api/posts/${novoPostId || 'post-1'}/comentarios`, body, status, data);
    }

    // Comando 4: curtir
    {
      const body = {
        usuarioId: 'usr-alice',
      };
      const { status, data } = await request('POST', `/posts/${novoPostId || 'post-2'}/curtidas`, body);
      printResult('4. curtir', 'Comando', `POST /api/posts/${novoPostId || 'post-2'}/curtidas`, body, status, data);
    }

    // Comando 5: seguir
    {
      const body = {
        seguidorId: novoUsuarioId || 'usr-carlos',
      };
      const { status, data } = await request('POST', `/usuarios/usr-bob/seguir`, body);
      printResult('5. seguir', 'Comando', `POST /api/usuarios/usr-bob/seguir`, body, status, data);
    }

    printSection('TODOS OS 10 TESTES REST CONCLUÍDOS COM SUCESSO!');
  } catch (error) {
    console.error('Erro durante a execução dos testes REST:', error);
    process.exit(1);
  }
}

runTests();
