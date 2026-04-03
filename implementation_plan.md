# Arquitetura e Estrutura no Coolify - Blackjag

Você precisará hospedar 3 elementos principais: **Banco de Dados (PostgreSQL)**, **Backend (NestJS)** e **Frontend (Angular)**. Como notei que seu frontend está dentro da pasta `frontend-blackjag`, estamos lidando com uma estrutura de **Monorepo** (tudo no mesmo repositório do GitHub).

A grande vantagem do Coolify é que ele suporta perfeitamente repositórios Monorepo (onde o back e o front moram no mesmo repositório, mas em pastas diferentes). Você não precisa criar vários `docker-compose` complexos. O próprio Coolify orquestrará os containers de forma independente na mesma rede.

## 1. O "Projeto" e "Ambiente" no Coolify
No painel do Coolify, a melhor prática é:
* **Projeto:** `Blackjag`
* **Ambiente (Environment):** `Production`

Tudo que criarmos ficará dentro deste ambiente, garantindo que os containers conversem nativamente através da rede interna (Docker Network) segura do Coolify.

## 2. Ordem de Criação dos Containers (O Melhor Caminho)

Abaixo estão os 3 "recursos" (containers) que você criará dentro do ambiente `Production` do Coolify, exatamente **nesta ordem**.

### 📦 1º Container: Banco de Dados (PostgreSQL)
É o primeiro a ser criado, pois o Backend vai precisar da URL dele para subir corretamente.
* **Tipo no Coolify:** Database > PostgreSQL.
* **Por que é o melhor caminho?** Criar usando a ferramenta nativa de banco do Coolify (em vez de um Dockerfile customizado) habilita funcionalidades avançadas automáticas, como **Backups Agendados** (fazer backup do BD para a Nuvem de 1 em 1 dia, por exemplo) com apenas 1 clique.
* **Portas:** Apenas acessível internamente pelo backend, sem expor a porta 5432 publicamente (garante máxima segurança contra invasões).
* **Parâmetros Base:**
  * User: `vcskt_db`
  * database: `blackjag_db`

### ⚙️ 2º Container: Backend (Instância NestJS)
Após o banco estar rodando, o Coolify te dará a URL Interna do banco (ex: `postgresql://vcskt_db:senha_forte@postgres-xyz:5432/blackjag_db`). Usaremos ela no Backend.
* **Tipo no Coolify:** Application > GitHub Repository.
* **Base Directory:** `/` (Raiz do repositório, onde está o código NestJS e o `Dockerfile`).
* **Build Pack:** `Docker` (Ele vai ler o seu `Dockerfile` atual, rodar o `npm run build`, gerar o Prisma e finalmente subir o container via `node dist/main`).
* **Domínio:** `api.seu-dominio.com.br` (SSL ativado)
* **Variáveis de Ambiente (.env):** Adicionar a variável `DATABASE_URL` no painel, apontando para o banco criado no passo anterior.

### 🎨 3º Container: Frontend (Aplicação Angular)
O Angular exige apenas um servidor de arquivos estáticos (como Nginx) para entregar a tela para o navegador do cliente. O Coolify lidará com isso de forma brilhante se configurarmos as pastas certas.
* **Tipo no Coolify:** Application > GitHub Repository (o mesmo repositório do Backend).
* **Base Directory:** `/frontend-blackjag` (O Coolify olhará apenas para esta sub-pasta).
* **Build Pack:** `Nixpacks` (Recomendado). A ferramenta inteligênte Nixpacks reconhecerá que é um pacote Node (Angular/NPM) e fará o build estático (`ng build`). 
    * Caso prefira o modo "Docker puro", nós também poderemos criar um Nginx-Dockerfile dentro da pasta do frontend futuramente. Mas a Build Nativa Estática do Coolify costuma ser suficiente e super rápida.
* **Domínio:** `app.seu-dominio.com.br` (SSL ativado)
* **Variáveis de Ambiente:** Aqui você pode configurar para onde o Angular aponta na hora de chamar a API (`apiUrl = https://api.seu-dominio.com.br`).

---

## 3. Resumo da Topologia Mapeada

Ao fazer isso, a nuvem gerenciada estará assim:

1. O Cliente acessa `app.blackjag...` na web.
2. O servidor encaminha de forma segura (SSL/HTTPS gerado automaticamente pelo Coolify Host) para o **Container do Frontend Angular**.
3. O Frontend fará chamadas autenticadas para `api.blackjag...`.
4. O servidor recebe, passa pelo SSL e encaminha para o **Container Rest API (NestJS)**.
5. O NestJS valida as entradas (Prisma) e fala com segurança com o **Container PostgreSQL** (através da rede virtual encriptada inacessível publicamente).

> [!IMPORTANT]
> **Vantagens Finais:** Nenhuma necessidade de orquestrar certificados manualmente. Código pushado no `main` do GitHub fará o build e atualizará apenas as partes afetadas, gerando `Zero-Downtime Deploy` (o sistema nunca sai do ar na hora de atualizar).

Aprova essa estrutura e modelagem de containers? Se sim, posso recomendar qual seria a sua máquina inicial na provedora Cloud de sua escolha e podemos adaptar seus arquivos (`Dockerfile`, `.env` do backend) para essa modelagem.
