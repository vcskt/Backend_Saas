# Documentação de Implementação - Servidor Cópia Prod. (VPS)

Esta documentação registra todos os passos já executados para a configuração da VPS Linux (identificada como `vps-portainer`), transformando-a de um servidor básico em um host pronto para rodar nossa API NestJS e Banco de Dados.

> [!NOTE]
> Tudo foi preparado com foco em segurança (bloqueios contra *Bruteforce*) e escalabilidade (arquitetura totalmente conteinerizada com Docker).

## 1. Resolução de Acesso SSH e Firewall

O servidor estava operando com um bloqueio rígido do sistema de segurança devido a tentativas sucessivas e agressivas de envio de múltiplas chaves SSH pelo lado do Windows. 

* **Solução aplicada no Windows**: Configuramos a conexão para forçar apenas a inserção de Senha ignorando chaves (prevenindo que o IP local `192.168.5.50` fosse novamente banido).
  ```bash
  ssh -o PubkeyAuthentication=no vcskt@192.168.5.14
  ```

## 2. Preparação do Servidor (OS e Pacotes Básicos)

Com o acesso restabelecido, instalamos as ferramentas essenciais para downloads seguros.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl apt-transport-https -y
```

## 3. Instalação do Motor Docker

Toda a nossa stack (PostgreSQL + NestJS + Nginx) vai rodar em Docker para agilidade e redução de incompatibilidades entre máquinas.
O usuário `vcskt` recebeu permissões de administração sobre containers (`docker group`), evitando a necessidade extrema de usar a conta privilegiada `root` o tempo todo.

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

## 4. Setup Banco de Dados Containerizado (PostgreSQL)

O nosso Banco de Dados Oficial está em pé usando a versão `15-alpine` (uma versão levíssima de sistema operacional base para banco). 

> [!IMPORTANT]
> Configuramos um **Volume Persistente** (`postgres_data`). Isso atesta que se algum dia o container for deletado sem querer, todos os seus dados dos clientes, notícias e as lojas estão guardados intocáveis no HD do Ubuntu.

A estrutura definida no arquivo `/home/vcskt/projeto_blackjag/docker-compose.yml` final foi:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: blackjag_postgres
    restart: always # (Sobe o container sozinho se o servidor reiniciar ou faltar luz)
    environment:
      POSTGRES_USER: vcskt_db
      POSTGRES_PASSWORD: super_password123
      POSTGRES_DB: backend_db
    ports:
      - "5432:5432" # (Acessível na rede local para facilitar o seu acesso no DBeaver/PgAdmin, mas passará depois pelo Firewall)
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

O container foi levantado e está atualmente online.

## 5. Liberação de Conexão Externa para Banco de Dados

Conforme os ajustes locais no arquivo `docker-compose.yml`, a porta padrão de acesso ao banco externo foi modificada (exemplo para `15432:5432`). 
Como bloqueamos a VPS com o UFW (Firewall) na Etapa 2, tornou-se necessário fatiar e permitir o tráfego desta porta customizada para que um computador Windows (através de SGBDs como DBeaver ou PgAdmin) pudesse gerir as tabelas:

```bash
# Liberação de porta no Firewall Linux
sudo ufw allow 15432/tcp
sudo ufw reload
```

Com a regra inserida, a gestão dos dados passa a ser possível via:
*   **IP Host:** `192.168.5.14`
*   **Porta (nova):** `15432`
*   **Usuário/Senha:** Valores atualizados de forma customizada no arquivo `.yml` do repositório.

---

A fase puramente de infraestrutura foi concluída, validada e está totalmente operacional.

## 6. Criação do Ambiente de Código Node.js (NestJS e ORM)

Após validada as fundações da VPS, iniciou-se o fluxo de Desenvolvimento Backend nativo (`D:\GitHub\Sites\Backend_Saas`).

* **Configuração da Base NestJS**: Toda a fundação arquitetural da API foi gerada pelo comando `@nestjs/cli new`. Isso incluiu os empacotadores, o `eslint` e criação do diretório vital `/src`.
* **O ORM Prisma**: Instalamos o framework de banco de dados `Prisma` (Versão v7.x). Ele conecta as entidades do NestJS ao Postgres remoto de forma coesa (Type Safe).
* **Modelagem e Migração**: Criamos o arquivo relacional de todas as regras documentadas no projeto dentro de `prisma/schema.prisma` (Tabelas de Acessos, Users, Lojas, etc). Rodamos a versão de sincronização `dev init_database` - onde o Prisma conectou pelo seu IP `192.168.5.14` e subiu permanentemente tudo lá nas tabelas do Postgres.

> [!NOTE]
> **Ajuste Técnico da String**: Na configuração do Prisma 7, criamos o arquivo de suporte `prisma.config.ts` para integrar com o `.env` (onde convertemos o `@` da sua senha do banco para `%40`). Isso blindou perfeitamente o framework do Backend para nunca falhar na leitura dessa senha forte por conflitos!

## 7. Deploy na VPS e Configuração de SSL (HTTPS)

Esta etapa descreve como levar o código concluído para a VPS e habilitar a conexão segura (HTTPS) através do Nginx.

### 7.1. Sincronização do Código (No seu PC)
1. Certifique-se de que o Git ignorou os arquivos sensíveis (`.env`, `docker-compose.yml`).
2. Faça o commit das alterações:
   ```bash
   git add .
   git commit -m "feat: backend completo com nestjs, auth e docker"
   git push origin main
   ```

### 7.2. Preparação na VPS (Acesso SSH)
1. Acesse sua VPS: `ssh seu_usuario@192.168.5.14`
2. Navegue até a pasta do projeto: `cd ~/caminho_do_projeto`
3. Atualize o código: `git pull origin main`
4. Crie o arquivo de ambiente:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Preencha a senha do banco e crie uma senha forte e longa para o `JWT_SECRET`.*

### 7.3. Geração de Certificado SSL (Nginx)

Como o IP atual (`192.168.5.14`) é uma rede local, temos duas abordagens. Uma para testes imediatos (Local) e outra para Produção Real na Internet (Let's Encrypt). O Nginx espera os certificados na pasta `./nginx/ssl`.

**Opção A) Local / Homologação (Auto-assinado)**
Útil para testar HTTPS na sua rede local hoje mesmo.
Na VPS, dentro da pasta do projeto, rode:
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./nginx/ssl/privkey.pem -out ./nginx/ssl/fullchain.pem -subj "/CN=blackjag.com.br"
```
*(Isso gerará os arquivos `privkey.pem` e `fullchain.pem` falsos para o Nginx não quebrar ao subir).*

**Opção B) Produção Real na Internet (Let's Encrypt / Certbot)**
Requer que o domínio `blackjag.com.br` em um registrador web (ex: Registro.br) aponte para o IP **Público** da sua VPS e que a porta 80 esteja liberada para a internet.
Na VPS:
1. Instale o Certbot:
   ```bash
   sudo apt update
   sudo apt install certbot -y
   ```
2. Pare qualquer serviço na porta 80 (se o Nginx já estiver rodando):
   ```bash
   sudo docker stop blackjag_nginx
   ```
3. Gere o certificado (o Certbot fará um desafio provando que você é dono do domínio):
   ```bash
   sudo certbot certonly --standalone -d blackjag.com.br -d www.blackjag.com.br
   ```
4. Se der sucesso, crie atalhos (symlinks) dos certificados para a pasta do nosso Nginx:
   ```bash
   mkdir -p ./nginx/ssl
   sudo ln -s /etc/letsencrypt/live/blackjag.com.br/fullchain.pem ./nginx/ssl/fullchain.pem
   sudo ln -s /etc/letsencrypt/live/blackjag.com.br/privkey.pem ./nginx/ssl/privkey.pem
   ```

### 7.4. Subindo o Sistema Todo
Com o `.env` configurado e os certificados HTTPS lá na pasta `./nginx/ssl/`, execute o Docker:

```bash
# Faz o "build" da imagem Node.js/Nest e reinicia os serviços
docker compose up -d --build
```

Para verificar se tudo ligou corretamenete:
```bash
docker compose logs -f api
docker compose logs -f nginx
```
