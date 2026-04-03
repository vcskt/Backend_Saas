# Guia Passo a Passo: Implantação da Infraestrutura Blackjag com Coolify

Este documento detalha estritamente todos os comandos e passos necessários (do zero até o sistema em produção) para colocar a aplicação no ar, começando pela preparação do servidor.

---

## Passo 1: Preparação da VPS e Firewall de Segurança

A primeira etapa é proteger a sua máquina. Não podemos instalar nada sem antes garantir que as portas cruciais do servidor estejam corretamente isoladas para evitar que robôs ou atacantes tenham acesso. O Coolify lidará internamente com o roteamento, então só precisamos liberar explicitamente aquilo que a internet toda deverá enxergar:

Logue via SSH na sua nova VPS:
```bash
ssh root@<SEU_IP_AQUI>
```

Em seguida, garanta que o UFW (Uncomplicated Firewall) do Ubuntu/Debian esteja atualizado e libere apenas as portas vitais:

```bash
# 1. Atualizar a listagem de pacotes básicos
apt update && apt upgrade -y

# 2. Permitir SSH (Porta 22) - CRÍTICO! Se não fizer isso, você perderá acesso ao servidor amanhã.
ufw allow 22/tcp

# 3. Permitir HTTP (Para direcionamentos sem SSL / Validação da CA do roteador do web server)
ufw allow 80/tcp

# 4. Permitir HTTPS (Conexão via SSL/TLS segura - onde sua API e o site rodam)
ufw allow 443/tcp

# 5. Ligar de fato a proteção do Firewall
ufw enable
```
*(Confirme digitando `y` quando o sistema perguntar se pode interromper as conexões atuais)*.

> [!TIP]
> A API e o Banco de dados rodam nas portas "3000" e "5432" dentro dos containers, mas graças ao *Nginx Proxy/Traefik* do próprio Coolify, você **NÃO precisa abrir portas extras** no firewall como 3000 ou 5432. O tráfego entra pela porta 443 de forma segura e o sistema interno orquestra para o respectivo contêiner!

---

## Passo 2: Instalação do Coolify

Com a máquina protegida, rodamos o comando absoluto que baixa, formata e instala todo o Control Plane do Coolify, assim como instaladores e Docker subjacentes.

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```
> Aguarde em média 5 a 10 minutos. O script configurará os contêineres de painel administrativo sozinhos. Quando terminar, no terminal, aparecerá uma URL para você abrir no seu navegador. Normalmente será `http://<SEU_IP_DA_VPS>:8000`.

---

## Passo 3: Configuração Inicial Visual (Painel Coolify)

Feche o terminal. A partir daqui, usaremos o Mouse!

1. Acesse no navegador: `http://<IP_DA_SUA_MÁQUINA>:8000`
2. Na tela de boas-vindas, **crie a conta Admin** ("Register" o usuário root do painel).
3. Na área **"Keys & Tokens",** clique na integração "GitHub App" para conectar a sua conta do GitHub. (Isso é muito mais seguro e fácil do que chaves SSH, e te avisa nas abas de Deploy, permitindo que cada push em `main` refaça o ambiente sozinho).
4. Crie um **Novo Projeto** com o nome `Blackjag`.
5. Crie um **Ambiente / Environment** chamado `Production`.

---

## Passo 4: Criando os Containers, Na Ordem Certa

Todos os recursos criaremos no Menu > *Projetos > Blackjag > Production > "+" Add New Resource*.

### 1️⃣ Database Postgres
* **Tipo:** Database -> PostgreSQL
* Especifique as senhas e a base: `blackjag_db`. 
* **Importante:** NÃO ative o "Make connection Public".
* Clique no Deploy.
* Guarde o link gerado: **`Internal Database URL`** (parecido com `postgresql://xyz...:5432/...`)

### 2️⃣ Backend (NestJS - API)
* **Tipo:** Application -> GitHub (Private/Public Repo)
* Selecione seu repositório: `Backend_Saas`.
* **Build Pack:** Selecione **`Dockerfile`**.
* Vá na tela "Environment Variables / Secrets" e cadastre:
    * `DATABASE_URL` (com o link copiado no passo do postgres acima)
    * `FRONTEND_URL` = `https://blackjag.com.br`
    * `PORT` = `3000`
    * `JWT_SECRET` = _(uma senha aleatória grande de letras e minúsculas)_
* Cancele qualquer Exposed Port deixando-as em branco, mantendo o tráfego oculto. Na aba principal em Domains, coloque: `https://api.blackjag.com.br` (ele ativará SSL na hora de ligar).
* Clique no **Deploy**. (O backend decolará primeiro).

### 3️⃣ Frontend (Angular - Aplicação)
* **Tipo:** Application -> GitHub
* Selecione novamente seu repositório: `Backend_Saas`
* Na tela de configuração base do app, edite: **Base Directory** para `/frontend-blackjag`.
* **Build Pack:** Selecione **`Nixpacks`** (Ideal para compilar estáticos SPAs NPM).
* Na aba de variáveis (.env), coloque `apiUrl` = `https://api.blackjag.com.br` se exigido pelo ambiente do angular.
* Na aba de Domains: `https://blackjag.com.br,https://www.blackjag.com.br` (SSL ativado automático).
* Aperte **Deploy**.

**Pronto! Sua infraestrutura, com Banco de Dados e as 2 aplicações, estarão online e seguras.** Toda vez que subirem commits no Github deste repositório, os apps específicos serão recompilados e substituídos sem cair!
