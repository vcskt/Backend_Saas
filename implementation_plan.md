# Projeto de Backend e Infraestrutura - Blackjag

Este documento detalha o plano de infraestrutura, arquitetura, segurança e modelagem inicial do banco de dados para o seu projeto com frontend em Angular.

## Arquitetura e Tecnologias Sugeridas

Como o frontend será em Angular, recomendo as seguintes tecnologias:

*   **Infraestrutura:** VPS Linux (Ubuntu 22.04 LTS ou 24.04 LTS recomendado).
*   **Gerenciamento de Containers:** Docker e Docker Compose (facilita o deploy e controle de serviços).
*   **Proxy Reverso / Web Server:** Nginx (dentro do ou fora do Docker) para gerenciar certificados SSL e roteamento de requisições entre o frontend e a API.
*   **Banco de Dados:** PostgreSQL (conteinerizado via Docker).
*   **Backend:** **NestJS / Node.js** (Fortemente Recomendado). É um framework focado em arquitetura modular que utiliza TypeScript por padrão, tornando-o excelente para quem já usa Angular, pois a sintaxe e a organização são muito parecidas (Injeção de dependências, Módulos, Controllers/Componentes). *(Outras alternativas: Express.js (Node), FastAPI (Python), Spring Boot (Java))*.

## ⚠️ Questões em Aberto

Nenhuma. A linguagem de backend escolhida foi o **NestJS** (Node.js/TypeScript).

## Segurança da API

Sua intuição sobre o **JWT (JSON Web Token)** está corretíssima! Ele é o padrão de mercado para autenticação stateless (sem sessão física no servidor). No entanto, o backend precisa de várias camadas de segurança:

1.  **Autenticação JWT & Refresh Tokens:** Para identificar os usuários e manter acessos contínuos de forma segura.
2.  **HTTPS (SSL/TLS):** Criptografia da comunicação entre o Angular e o Backend. Configurado no Nginx via `Certbot/Let's Encrypt`.
3.  **CORS (Cross-Origin Resource Sharing):** Configuraremos o backend para rejeitar requisições que não venham exclusivamente da URL oficial do seu Angular.
4.  **Criptografia de Senhas (Hashing):** Senhas nunca são guardadas em texto. O backend criará _hashes_ irreversíveis (ex: usando a biblioteca `bcrypt` ou `argon2`).
5.  **Limitação de Taxa (Rate Limiting):** Para prevenir ataques de Força Bruta (tentar senhas repetidamente) ou DDoS na sua VPS.
6.  **Validação e Sanitização:** Barrar requisições maliciosas evitando ataques de *SQL Injection* e vulnerabilidades nos endpoints.
7.  **Segurança da VPS e Docker:** O banco de dados PostgreSQL não deixará portas abertas diretamente para a internet. Tudo passará pela rede interna do Docker ou via o proxy Nginx.

## Passos para a Infraestrutura (VPS)

Conforme seu pedido, começaremos pela VPS, seguindo esta ordem assim que você aprovar:

1.  **Acesso e Atualização do Servidor:** Acessar a máquina, atualizar o SO e instalar dependências essenciais.
2.  **Firewall Básica (UFW):** Garantir que apenas as portas essenciais (como 80, 443 e 22 para SSH) estejam abertas.
3.  **Instalação do Docker e Docker Compose:** A base para a nossa arquitetura.
4.  **Subir o Banco de Dados:** Criar os volumes seguros para o banco de dados PostgreSQL.
5.  **Infraestrutura Web:** Preparar o Nginx e solicitar os certificados SSL para o domínio `blackjag`.

## Modelagem Inicial de Dados (PostgreSQL)

Baseado nos requisitos, assim que formos para a criação de tabelas:

*   **Users** (Acessos):
    *   `id`, `nome`, `email`, `senha_hash`, `role` ("ADMIN" ou "USER").
*   **Clients** (Cadastro de clientes geral):
    *   `id`, `nome`, `documento`, `telefone`, `endereco`, etc.
*   **News** (Notícias): *Acesso de escrita focado em ADMIN.*
    *   `id`, `titulo`, `conteudo`, `admin_id` (FK de Users).
*   **Comments** (Comentários sobre clientes): *Acesso restrito ADMIN.*
    *   `id`, `client_id` (FK de Clients), `conteudo`, `admin_id` (FK de Users).
*   **Stores** (Lojas): *Apenas para usuários normais (USER).*
    *   `id`, `user_id` (FK de Users), `nome_loja`, `descricao`.
