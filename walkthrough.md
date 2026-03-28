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

## 7. Deploy da API NestJS de forma Contida (Isolada do docker-compose)

Para manter o seu `docker-compose.yml` (e banco de dados) perfeitamente intactos e independentes, o deploy da sua API acontecerá através de comandos Docker puros usando exclusivamente as regras embutidas no seu `Dockerfile`.

### 7.1. Sincronização do Código
O seu PC Windows deve sempre ser a fonte da verdade para o Git. Ao mudar arquivos de configuração da API, apenas "commite" tudo daqui com o botão "Sync Changes" do VS Code e vá para o seu terminal VPS.

### 7.2. Preparação na VPS (Acesso SSH)
1. Na sua VPS Linux (`root@vps-portainer`), entre na pasta oficial do repositório clonado:
   ```bash
   cd ~/projeto_blackjag
   ```
2. Baixe todo o código que você salvou no GitHub lá do Windows:
   ```bash
   git pull origin main
   ```

### 7.3. Configurando o Ambiente Silencioso de Nuvem
Sua aplicação é desenhada com segurança máxima. Ou seja, jamais exponha senhas no Github. 
Você deve criar o arquivo oculto de senhas `.env` usando o terminal do Linux da mesma pasta `~/projeto_blackjag`:
```bash
cp .env.example .env
nano .env
```
Confirme se as credenciais digitadas no `.env` do Linux batem exatamente com as do seu Banco PostgreSQL atual, adicione um valor cego para o Frontend (mesmo que ainda não o tenha) e crie uma hash gigante aleatória para o `JWT_SECRET`. Tudo o que for alterado no Linux fica cravado no Linux.

### 7.4. Compilação e Execução Manuais do Container (`Dockerfile`)

Tendo a certeza que o arquivo `Dockerfile` baixou com sucesso ao fazer o pull, utilize o Docker para interpretá-lo:

**Passo 1: Construir a imagem Node.js Estática**
Esse comando empacota a sua inteligência: o Docker puxa todos os programas necessários da internet (node_modules), roda as conversões e fecha o sistema.
```bash
docker build -t minha_api_node .
```

**Passo 2: Rodar o Container em Retaguarda (Produção)**
Pronto, imagem instanciada. Agora dê o Play no serviço acoplando o seu `.env` e espelhando na porta 3000 do mundo:
```bash
docker run -d --name container_node -p 3000:3000 --env-file .env minha_api_node
```

**Auditoria e Diagnóstico:**
Se a integração do site estiver falhando por algum motivo insólito e você precisar observar os ecos visando rastrear o IP, é só digitar no linux:
```bash
docker logs -f container_node
```
```

### 7.5. Solução de Problemas e Aprendizados do Deploy (Troubleshooting)

Durante a primeira tentativa de deploy da API NestJS dentro do container, enfrentamos o erro fatal:
`Error: Cannot find module '/app/dist/main'`

Para garantir que esse problema não volte a ocorrer no futuro, documentamos as causas raiz e as soluções aplicadas de forma permanente na arquitetura do código:

1. **Incompatibilidade da versão do Prisma (v7 vs API Clássica):**
   * **O Problema:** O código da nossa aplicação (Services, Guards, etc.) foi escrito focado na API clássica do Prisma (exportação direta do `PrismaClient` e enums de `@prisma/client`). No entanto, o `package.json` estava instalando o **Prisma 7**, que introduziu quebras dramáticas (Breaking Changes), exigindo adaptadores (Driver Adapters) e parando de exportar os enums. Isso causava mais de 40 erros silenciosos de TypeScript durante o `nest build`, impedindo a geração real da pasta `dist`.
   * **A Solução:** Realizamos o **downgrade para o Prisma 6.6.0** direto no `package.json`, que é focado em estabilidade (LTS) e compatibilidade total com a nossa base de código atual.

2. **Conflito de Compilação do TypeScript (`rootDir`):**
   * **O Problema:** O arquivo `prisma.config.ts` posicionado na raiz do projeto (gerado originalmente pelo Prisma 7) forçava o compilador TypeScript (`tsc`) a inferir o diretório raiz (`rootDir`) de forma equivocada. Sem a configuração explícita, o compilador tentava englobar tanto a pasta `/src` quanto o próprio `prisma.config.ts` na raiz, gerando a compilação final em `dist/src/main.js` em vez de `dist/main.js`.
   * **A Solução:** Removemos a funcionalidade do `prisma.config.ts` (já que o Prisma v6 lê a URL direto do `schema.prisma`), além de adicionarmos as rédeas explícitas no **`tsconfig.json`**: definindo rigorosamente o escopo de entrada (`"rootDir": "./src"`, `"include": ["src/**/*"]`). Em união, alteramos o **`dockerfile`** para sempre rodar `npm install` sem bloqueios de lockfiles super-estruturados no container em produção. Isso consertou de vez as saídas no repositório.
