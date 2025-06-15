import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

const host = "0.0.0.0";
const port = 3000;
const app = express();


let equipes = [];
let jogadores = [];
let usuarios = [
    { username: "admin", password: "123" }
];

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "M1nh4Ch4v3S3cr3t4",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 15,
        httpOnly: true,
        secure: false
    }
}));
app.use(cookieParser());


const estiloGlobal = `
    <style>
    :root {
        --cor-primaria: #2C5F9E;   /* Azul principal (rede) */
        --cor-secundaria: #5C8EDC; /* Azul claro complementar */
        --cor-fundo: #F2F5F9;      /* Fundo claro */
        --cor-texto: #333;
        --cor-card: #FFFFFF;
        --cor-borda: #DCE3EB;
        --cor-hover: #1F4B81;
        --cor-erro: #D62828;
        --cor-sucesso: #4BB543;
    }

    body {
        font-family: 'Segoe UI', sans-serif;
        background-color: var(--cor-fundo);
        color: var(--cor-texto);
        margin: 0;
        padding: 0;
    }

    .navbar {
        background: var(--cor-primaria);
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .navbar-brand {
        font-weight: bold;
        font-size: 1.5rem;
        color: #fff;
    }

    .nav-link {
        color: #fff;
        text-decoration: none;
        margin-left: 1rem;
        transition: 0.3s;
    }

    .nav-link:hover {
        color: #d0e2ff;
    }

    .container {
        max-width: 1000px;
        margin: auto;
        padding: 20px;
    }

    .card {
        background: var(--cor-card);
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        padding: 20px;
        margin-bottom: 20px;
        border-left: 4px solid var(--cor-primaria);
    }

    .card-header {
        font-weight: bold;
        font-size: 1.2rem;
        margin-bottom: 10px;
        color: var(--cor-primaria);
    }

    .btn-primary, .btn-secondary {
        padding: 0.6rem 1.4rem;
        border: none;
        border-radius: 20px;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
    }

    .btn-primary {
        background: var(--cor-primaria);
        color: white;
    }

    .btn-primary:hover {
        background: var(--cor-hover);
    }

    .btn-secondary {
        background: var(--cor-secundaria);
        color: white;
    }

    .btn-secondary:hover {
        background: #4075c4;
    }

    input, select, textarea {
        width: 100%;
        padding: 0.6rem;
        border: 1px solid var(--cor-borda);
        border-radius: 6px;
        margin-top: 8px;
        margin-bottom: 16px;
        font-size: 1rem;
    }

    .alert-error {
        background-color: var(--cor-erro);
        color: white;
        padding: 0.75rem;
        border-radius: 6px;
    }

    .alert-success {
        background-color: var(--cor-sucesso);
        color: white;
        padding: 0.75rem;
        border-radius: 6px;
    }

    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, var(--cor-primaria), var(--cor-secundaria));
    }

    .login-card {
        background: var(--cor-card);
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 400px;
    }

    .login-title {
        color: var(--cor-primaria);
        text-align: center;
        font-size: 2rem;
        margin-bottom: 20px;
    }

    @media (max-width: 768px) {
        .navbar {
            flex-direction: column;
            align-items: flex-start;
        }

        .nav-link {
            margin: 0.5rem 0;
        }

        .container {
            padding: 10px;
        }
    }
</style>

`;

function verificarAutenticacao(requisicao, resposta, next) {
    if (requisicao.session.logado) {
        next();
    } else {
        resposta.redirect("/login");
    }
}

app.get("/", verificarAutenticacao, (requisicao, resposta) => {
    const ultimoLogin = requisicao.cookies.ultimoLogin;
    

    const totalEquipes = equipes.length;
    const totalJogadores = jogadores.length;
    
    resposta.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <title>Vôlei Manager</title>
                ${estiloGlobal}
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark">
                    <div class="container">
                        <a class="navbar-brand" href="#">
                            <span class="volley-icon"></span>Vôlei Manager
                        </a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/cadastroEquipe">
                                        <i class="fas fa-users me-1"></i>Equipes
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/cadastroJogador">
                                        <i class="fas fa-user me-1"></i>Jogadores
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">
                                        <i class="fas fa-sign-out-alt me-1"></i>Sair
                                    </a>
                                </li>
                            </ul>
                            ${ultimoLogin ? `<span class="last-login ms-3">Último acesso: ${ultimoLogin}</span>` : ''}
                        </div>
                    </div>
                </nav>
                
                <div class="container mt-5">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="mb-0"><i class="fas fa-volleyball-ball me-2"></i>Resumo</h3>
                                </div>
                                <div class="card-body">
                                    <p class="lead">Bem-vindo, ${requisicao.session.usuario}!</p>
                                    <div class="d-flex justify-content-between">
                                        <div class="text-center p-3 bg-light rounded">
                                            <h4>${totalEquipes}</h4>
                                            <p class="mb-0"><i class="fas fa-users me-1"></i>Equipes</p>
                                        </div>
                                        <div class="text-center p-3 bg-light rounded">
                                            <h4>${totalJogadores}</h4>
                                            <p class="mb-0"><i class="fas fa-user me-1"></i>Jogadores</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="mb-0"><i class="fas fa-tachometer-alt me-2"></i>Ações Rápidas</h3>
                                </div>
                                <div class="card-body">
                                    <a href="/cadastroEquipe" class="btn btn-primary btn-lg w-100 mb-3">
                                        <i class="fas fa-plus me-2"></i>Cadastrar Equipe
                                    </a>
                                    <a href="/cadastroJogador" class="btn btn-primary btn-lg w-100">
                                        <i class="fas fa-user-plus me-2"></i>Cadastrar Jogador
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${equipes.length > 0 ? `
                    <div class="card mt-4">
                        <div class="card-header">
                            <h3 class="mb-0"><i class="fas fa-list me-2"></i>Equipes Cadastradas</h3>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Técnico</th>
                                            <th>Telefone</th>
                                            <th>Jogadores</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${equipes.map(equipe => {
                                            const jogadoresEquipe = jogadores.filter(j => j.equipeId === equipe.id);
                                            return `
                                                <tr>
                                                    <td>${equipe.nome}</td>
                                                    <td>${equipe.tecnico}</td>
                                                    <td>${equipe.telefone}</td>
                                                    <td>${jogadoresEquipe.length}/6</td>
                                                    <td>
                                                        <a href="/detalhesEquipe/${equipe.id}" class="btn btn-sm btn-primary">
                                                            <i class="fas fa-eye me-1"></i>Detalhes
                                                        </a>
                                                        <a href="/editarEquipe/${equipe.id}" class="btn btn-sm btn-secondary">
                                                            <i class="fas fa-edit me-1"></i>Editar
                                                        </a>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    // Ativar tooltips
                    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
                    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                        return new bootstrap.Tooltip(tooltipTriggerEl)
                    });
                </script>
            </body>
        </html>
    `);
});


app.get("/login", (requisicao, resposta) => {
    resposta.send(`
    <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <title>Acessar Sistema</title>
            ${estiloGlobal}
        </head>
        <body>
            <div class="login-container">
                <div class="login-card">
                    <h1 class="login-title">
                        <span class="volley-icon"></span>Vôlei Manager
                    </h1>
                    <form action="/login" method="post">
                        <div class="mb-3">
                            <label for="usuario" class="form-label"><i class="fas fa-user me-1"></i>Usuário</label>
                            <input type="text" class="form-control form-control-lg" id="usuario" name="usuario" required>
                        </div>
                        <div class="mb-4">
                            <label for="senha" class="form-label"><i class="fas fa-lock me-1"></i>Senha</label>
                            <input type="password" class="form-control form-control-lg" id="senha" name="senha" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 btn-lg">
                            <i class="fas fa-sign-in-alt me-2"></i>Entrar
                        </button>
                    </form>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
    </html>
    `);
});

app.post("/login", (requisicao, resposta) => {
    const usuario = requisicao.body.usuario;
    const senha = requisicao.body.senha;
    
    const user = usuarios.find(u => u.username === usuario && u.password === senha);
    
    if (user) {
        requisicao.session.logado = true;
        requisicao.session.usuario = usuario;
        const dataHoraAtuais = new Date();
        resposta.cookie('ultimoLogin', dataHoraAtuais.toLocaleString(), { 
            maxAge: 1000 * 60 * 60 * 24 * 30 
        });
        resposta.redirect("/");
    } else {
        resposta.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <title>Acessar Sistema</title>
                ${estiloGlobal}
            </head>
            <body>
                <div class="login-container">
                    <div class="login-card">
                        <h1 class="login-title">
                            <span class="volley-icon"></span>Vôlei Manager
                        </h1>
                        <div class="alert alert-error mb-4">
                            <i class="fas fa-exclamation-circle me-2"></i>Usuário ou senha inválidos!
                        </div>
                        <form action="/login" method="post">
                            <div class="mb-3">
                                <label for="usuario" class="form-label"><i class="fas fa-user me-1"></i>Usuário</label>
                                <input type="text" class="form-control form-control-lg" id="usuario" name="usuario" required>
                            </div>
                            <div class="mb-4">
                                <label for="senha" class="form-label"><i class="fas fa-lock me-1"></i>Senha</label>
                                <input type="password" class="form-control form-control-lg" id="senha" name="senha" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 btn-lg">
                                <i class="fas fa-sign-in-alt me-2"></i>Entrar
                            </button>
                        </form>
                    </div>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
        `);
    }
});

app.get("/logout", (requisicao, resposta) => {
    requisicao.session.destroy();
    resposta.redirect("/login");
});


app.get("/cadastroEquipe", verificarAutenticacao, (requisicao, resposta) => {
    const ultimoLogin = requisicao.cookies.ultimoLogin;
    
    resposta.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <title>Cadastro de Equipe</title>
                ${estiloGlobal}
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark">
                    <div class="container">
                        <a class="navbar-brand" href="/">
                            <span class="volley-icon"></span>Vôlei Manager
                        </a>
                        <div class="collapse navbar-collapse">
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">
                                        <i class="fas fa-home me-1"></i>Home
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/cadastroJogador">
                                        <i class="fas fa-user me-1"></i>Jogadores
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">
                                        <i class="fas fa-sign-out-alt me-1"></i>Sair
                                    </a>
                                </li>
                            </ul>
                            ${ultimoLogin ? `<span class="last-login ms-3">Último acesso: ${ultimoLogin}</span>` : ''}
                        </div>
                    </div>
                </nav>
                
                <div class="container mt-4">
                    <div class="card">
                        <div class="card-header">
                            <h2 class="mb-0"><i class="fas fa-users me-2"></i>Cadastrar Nova Equipe</h2>
                        </div>
                        <div class="card-body">
                            <form method="POST" action="/cadastroEquipe">
                                <div class="row g-3">
                                    <div class="col-md-12">
                                        <label for="nome" class="form-label">
                                            <i class="fas fa-tag me-1"></i>Nome da Equipe
                                        </label>
                                        <input type="text" class="form-control" id="nome" name="nome" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="tecnico" class="form-label">
                                            <i class="fas fa-user-tie me-1"></i>Técnico Responsável
                                        </label>
                                        <input type="text" class="form-control" id="tecnico" name="tecnico" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="telefone" class="form-label">
                                            <i class="fas fa-phone me-1"></i>Telefone do Técnico
                                        </label>
                                        <input type="tel" class="form-control" id="telefone" name="telefone" required>
                                    </div>
                                    <div class="col-12 mt-4">
                                        <button type="submit" class="btn btn-primary me-2">
                                            <i class="fas fa-save me-1"></i>Salvar Equipe
                                        </button>
                                        <a href="/" class="btn btn-secondary">
                                            <i class="fas fa-arrow-left me-1"></i>Voltar
                                        </a>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    ${equipes.length > 0 ? `
                    <div class="card mt-4">
                        <div class="card-header">
                            <h3 class="mb-0"><i class="fas fa-list me-2"></i>Equipes Cadastradas</h3>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Técnico</th>
                                            <th>Telefone</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${equipes.map(equipe => `
                                            <tr>
                                                <td>${equipe.nome}</td>
                                                <td>${equipe.tecnico}</td>
                                                <td>${equipe.telefone}</td>
                                                <td>
                                                    <a href="/detalhesEquipe/${equipe.id}" class="btn btn-sm btn-primary">
                                                        <i class="fas fa-eye me-1"></i>Detalhes
                                                    </a>
                                                    <a href="/editarEquipe/${equipe.id}" class="btn btn-sm btn-secondary">
                                                        <i class="fas fa-edit me-1"></i>Editar
                                                    </a>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);
});

app.post("/cadastroEquipe", verificarAutenticacao, (requisicao, resposta) => {
    const equipe = {
        id: Date.now().toString(),
        nome: requisicao.body.nome,
        tecnico: requisicao.body.tecnico,
        telefone: requisicao.body.telefone
    };
    
    equipes.push(equipe);
    resposta.redirect("/cadastroEquipe");
});

app.get("/cadastroJogador", verificarAutenticacao, (requisicao, resposta) => {
    const ultimoLogin = requisicao.cookies.ultimoLogin;
    
    resposta.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <title>Cadastro de Jogador</title>
                ${estiloGlobal}
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark">
                    <div class="container">
                        <a class="navbar-brand" href="/">
                            <span class="volley-icon"></span>Vôlei Manager
                        </a>
                        <div class="collapse navbar-collapse">
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">
                                        <i class="fas fa-home me-1"></i>Home
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/cadastroEquipe">
                                        <i class="fas fa-users me-1"></i>Equipes
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">
                                        <i class="fas fa-sign-out-alt me-1"></i>Sair
                                    </a>
                                </li>
                            </ul>
                            ${ultimoLogin ? `<span class="last-login ms-3">Último acesso: ${ultimoLogin}</span>` : ''}
                        </div>
                    </div>
                </nav>
                
                <div class="container mt-4">
                    <div class="card">
                        <div class="card-header">
                            <h2 class="mb-0"><i class="fas fa-user-plus me-2"></i>Cadastrar Novo Jogador</h2>
                        </div>
                        <div class="card-body">
                            <form method="POST" action="/cadastroJogador">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label for="nome" class="form-label">
                                            <i class="fas fa-user me-1"></i>Nome do Jogador
                                        </label>
                                        <input type="text" class="form-control" id="nome" name="nome" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="numero" class="form-label">
                                            <i class="fas fa-tshirt me-1"></i>Número da Camisa
                                        </label>
                                        <input type="number" class="form-control" id="numero" name="numero" min="1" max="99" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="dataNascimento" class="form-label">
                                            <i class="fas fa-calendar-alt me-1"></i>Data de Nascimento
                                        </label>
                                        <input type="date" class="form-control" id="dataNascimento" name="dataNascimento" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="altura" class="form-label">
                                            <i class="fas fa-ruler-vertical me-1"></i>Altura (cm)
                                        </label>
                                        <input type="number" class="form-control" id="altura" name="altura" min="100" max="250" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="genero" class="form-label">
                                            <i class="fas fa-venus-mars me-1"></i>Gênero
                                        </label>
                                        <select class="form-select" id="genero" name="genero" required>
                                            <option value="">Selecione</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Feminino">Feminino</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="posicao" class="form-label">
                                            <i class="fas fa-volleyball-ball me-1"></i>Posição
                                        </label>
                                        <select class="form-select" id="posicao" name="posicao" required>
                                            <option value="">Selecione a posição</option>
                                            <option value="Levantador">Levantador</option>
                                            <option value="Oposto">Oposto</option>
                                            <option value="Ponteiro">Ponteiro</option>
                                            <option value="Central">Central</option>
                                            <option value="Líbero">Líbero</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="equipeId" class="form-label">
                                            <i class="fas fa-users me-1"></i>Equipe
                                        </label>
                                        <select class="form-select" id="equipeId" name="equipeId" required>
                                            <option value="">Selecione uma equipe</option>
                                            ${equipes.map(equipe => `
                                                <option value="${equipe.id}">${equipe.nome}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="col-12 mt-4">
                                        <button type="submit" class="btn btn-primary me-2">
                                            <i class="fas fa-save me-1"></i>Salvar Jogador
                                        </button>
                                        <a href="/" class="btn btn-secondary">
                                            <i class="fas fa-arrow-left me-1"></i>Voltar
                                        </a>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    ${jogadores.length > 0 ? `
                    <div class="card mt-4">
                        <div class="card-header">
                            <h3 class="mb-0"><i class="fas fa-list me-2"></i>Jogadores Cadastrados</h3>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Nº</th>
                                            <th>Idade</th>
                                            <th>Altura</th>
                                            <th>Gênero</th>
                                            <th>Posição</th>
                                            <th>Equipe</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${jogadores.map(jogador => {
                                            const equipeJogador = equipes.find(e => e.id === jogador.equipeId);
                                            const idade = jogador.dataNascimento ? 
                                                Math.floor((new Date() - new Date(jogador.dataNascimento)) / (1000 * 60 * 60 * 24 * 365.25)) : 
                                                'N/A';
                                            
                                            return `
                                                <tr>
                                                    <td>${jogador.nome}</td>
                                                    <td>${jogador.numero || '-'}</td>
                                                    <td>${idade}</td>
                                                    <td>${jogador.altura ? jogador.altura + ' cm' : '-'}</td>
                                                    <td>${jogador.genero || '-'}</td>
                                                    <td>${jogador.posicao || '-'}</td>
                                                    <td>${equipeJogador ? equipeJogador.nome : 'Sem equipe'}</td>
                                                    <td>
                                                        <a href="/editarJogador/${jogador.id}" class="btn btn-sm btn-secondary">
                                                            <i class="fas fa-edit me-1"></i>Editar
                                                        </a>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);
});


app.post("/cadastroJogador", verificarAutenticacao, (requisicao, resposta) => {
    const equipeId = requisicao.body.equipeId;
    const equipe = equipes.find(e => e.id === equipeId);
    
    if (!equipe) {
        return resposta.redirect("/cadastroJogador");
    }
    
    const jogadoresEquipe = jogadores.filter(j => j.equipeId === equipeId);
    if (jogadoresEquipe.length >= 6) {
        return resposta.send(`
            <script>
                alert("Esta equipe já possui o número máximo de jogadores (6)");
                window.location.href = "/cadastroJogador";
            </script>
        `);
    }
    
    const jogador = {
        id: Date.now().toString(),
        nome: requisicao.body.nome,
        numero: requisicao.body.numero,
        dataNascimento: requisicao.body.dataNascimento,
        altura: requisicao.body.altura,
        genero: requisicao.body.genero,
        posicao: requisicao.body.posicao,
        equipeId: equipeId
    };
    
    jogadores.push(jogador);
    resposta.redirect("/cadastroJogador");
});


app.get("/detalhesEquipe/:id", verificarAutenticacao, (requisicao, resposta) => {
    const equipeId = requisicao.params.id;
    const equipe = equipes.find(e => e.id === equipeId);
    const ultimoLogin = requisicao.cookies.ultimoLogin;
    
    if (!equipe) {
        return resposta.redirect("/");
    }
    
    const jogadoresEquipe = jogadores.filter(j => j.equipeId === equipeId);
    
    resposta.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <title>Detalhes da Equipe</title>
                ${estiloGlobal}
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark">
                    <div class="container">
                        <a class="navbar-brand" href="/">
                            <span class="volley-icon"></span>Vôlei Manager
                        </a>
                        <div class="collapse navbar-collapse">
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">
                                        <i class="fas fa-home me-1"></i>Home
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/cadastroEquipe">
                                        <i class="fas fa-users me-1"></i>Equipes
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">
                                        <i class="fas fa-sign-out-alt me-1"></i>Sair
                                    </a>
                                </li>
                            </ul>
                            ${ultimoLogin ? `<span class="last-login ms-3">Último acesso: ${ultimoLogin}</span>` : ''}
                        </div>
                    </div>
                </nav>
                
                <div class="container mt-4">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h2 class="mb-0"><i class="fas fa-users me-2"></i>${equipe.nome}</h2>
                                <span class="badge bg-primary">
                                    ${jogadoresEquipe.length}/6 jogadores
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong><i class="fas fa-user-tie me-2"></i>Técnico:</strong> ${equipe.tecnico}</p>
                                    <p><strong><i class="fas fa-phone me-2"></i>Telefone:</strong> ${equipe.telefone}</p>
                                </div>
                                <div class="col-md-6 text-end">
                                    <a href="/cadastroJogador?equipeId=${equipe.id}" class="btn btn-primary">
                                        <i class="fas fa-user-plus me-2"></i>Adicionar Jogador
                                    </a>
                                </div>
                            </div>
                            
                            <h4 class="mt-4"><i class="fas fa-users me-2"></i>Jogadores</h4>
                            
                            ${jogadoresEquipe.length > 0 ? `
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nº</th>
                                            <th>Nome</th>
                                            <th>Idade</th>
                                            <th>Altura</th>
                                            <th>Gênero</th>
                                            <th>Posição</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${jogadoresEquipe.map(jogador => {
                                            const idade = jogador.dataNascimento ? 
                                                Math.floor((new Date() - new Date(jogador.dataNascimento)) / (1000 * 60 * 60 * 24 * 365.25)) : 
                                                'N/A';
                                            
                                            return `
                                                <tr>
                                                    <td>${jogador.numero || '-'}</td>
                                                    <td>${jogador.nome}</td>
                                                    <td>${idade}</td>
                                                    <td>${jogador.altura ? jogador.altura + ' cm' : '-'}</td>
                                                    <td>${jogador.genero || '-'}</td>
                                                    <td>${jogador.posicao || '-'}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                            ` : '<div class="alert alert-secondary mt-3"><i class="fas fa-info-circle me-2"></i>Nenhum jogador cadastrado nesta equipe.</div>'}
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <a href="/cadastroEquipe" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>Voltar
                        </a>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);
});

app.get("/detalhesEquipe/:id", verificarAutenticacao, (requisicao, resposta) => {
    const equipeId = requisicao.params.id;
    const equipe = equipes.find(e => e.id === equipeId);
    const ultimoLogin = requisicao.cookies.ultimoLogin;
    
    if (!equipe) {
        return resposta.redirect("/");
    }
    
    const jogadoresEquipe = jogadores.filter(j => j.equipeId === equipeId);
    
    resposta.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <title>Detalhes da Equipe</title>
                ${estiloGlobal}
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark">
                    <div class="container">
                        <a class="navbar-brand" href="/">
                            <span class="volley-icon"></span>Vôlei Manager
                        </a>
                        <div class="collapse navbar-collapse">
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">
                                        <i class="fas fa-home me-1"></i>Home
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/cadastroEquipe">
                                        <i class="fas fa-users me-1"></i>Equipes
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">
                                        <i class="fas fa-sign-out-alt me-1"></i>Sair
                                    </a>
                                </li>
                            </ul>
                            ${ultimoLogin ? `<span class="last-login ms-3">Último acesso: ${ultimoLogin}</span>` : ''}
                        </div>
                    </div>
                </nav>
                
                <div class="container mt-4">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h2 class="mb-0"><i class="fas fa-users me-2"></i>${equipe.nome}</h2>
                                <span class="badge bg-primary">
                                    ${jogadoresEquipe.length}/6 jogadores
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong><i class="fas fa-user-tie me-2"></i>Técnico:</strong> ${equipe.tecnico}</p>
                                    <p><strong><i class="fas fa-phone me-2"></i>Telefone:</strong> ${equipe.telefone}</p>
                                </div>
                                <div class="col-md-6 text-end">
                                    <a href="/cadastroJogador?equipeId=${equipe.id}" class="btn btn-primary">
                                        <i class="fas fa-user-plus me-2"></i>Adicionar Jogador
                                    </a>
                                </div>
                            </div>
                            
                            <h4 class="mt-4"><i class="fas fa-users me-2"></i>Jogadores</h4>
                            
                            ${jogadoresEquipe.length > 0 ? `
                            <div class="row mt-3">
                                ${jogadoresEquipe.map(jogador => `
                                    <div class="col-md-6">
                                        <div class="card jogador-card mb-3">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between">
                                                    <h5>${jogador.nome}</h5>
                                                    <span class="badge bg-secondary">${jogador.posicao}</span>
                                                </div>
                                                <p class="mb-1"><strong><i class="fas fa-birthday-cake me-2"></i>Idade:</strong> ${jogador.idade}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            ` : '<div class="alert alert-secondary mt-3"><i class="fas fa-info-circle me-2"></i>Nenhum jogador cadastrado nesta equipe.</div>'}
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <a href="/cadastroEquipe" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>Voltar
                        </a>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);
});


app.listen(port, host, () => {
    console.log(`Servidor em execução em http://${host}:${port}/`);
});