# Plano de Implantação e Infraestrutura - Blackjag (com Coolify)

## 1. Avaliação de Mercado: Por que Coolify?

Ao provisionar um projeto (como o seu backend em NestJS e banco PostgreSQL) em uma VPS (Virtual Private Server), temos diferentes caminhos. É fundamental escolher um que traga **segurança, facilidade de manutenção e não aprisione você** (vendor lock-in).

### Opções Disponíveis no Mercado

1. **Bare Metal / VPS "Pura" (Docker, Nginx puro, Shell Scripts):**
   * **Prós:** Controle total, consumo levíssimo de hardware.
   * **Contras:** A configuração do CI/CD (integração contínua), renovação de SSL, backups e monitoramento terão que ser feitos do zero. Demanda alto conhecimento em Linux/DevOps.

2. **Dokku:**
   * **Prós:** O "Heroku" do mundo Open Source. Bastante robusto e estável.
   * **Contras:** A maior parte do gerenciamento é via linha de comando (CLI). Pode ser pouco visual para quem prefere uma interface.

3. **CapRover:**
   * **Prós:** Interface gráfica simples, rápido, baixo consumo de RAM.
   * **Contras:** Menor quantidade de integrações modernas; o gerenciamento de serviços complexos (como pull request previews) é limitado.

4. **Easypanel:**
   * **Prós:** Interface linda e extremamente fácil de usar. Usa Docker puro por baixo.
   * **Contras:** Algumas "features" avançadas podem ser bloqueadas na versão gratuita (premium).

5. **Coolify (A Melhor Escolha Atual):**
   * **Prós:** É a alternativa definitiva ao Vercel/Render/Heroku. 100% gratuito e open-source. Ele já fornece: **CI/CD direto do GitHub**, gerador automático de certificado **SSL**, gerenciamento de **Bancos de Dados com backup em 1 clique**, e suporta integração baseada no `Dockerfile` que você já tem ou lendo o projeto diretamente via `Nixpacks`.
   * **Contras:** A interface de controle e as rotinas do Coolify rodam na sua própria VPS, o que consome um pouco mais de CPU/RAM (Recomendado 2 a 4 GB VPS Mínima).

> [!TIP]
> **Veredito:** Você fez uma **excelente escolha** ao sugerir o Coolify. Ele vai poupar dezenas de horas de configuração de Nginx, SSL e Pipelines.

---

## 2. Infraestrutura Recomendada (VPS)

Para suportar o Control Plane do Coolify + Seu Banco PostgreSQL + O Backend NestJS + Eventualmente o Frontend Angular:

* **S.O:** Ubuntu 22.04 LTS ou Ubuntu 24.04 LTS (Um sistema "limpo", acabou de formatar).
* **RAM:** **Gargalo principal.** Recomendo no **MÍNIMO 2 GB**, mas o cenário ideal para rodar o build pesadinho do NextJS/NestJS dentro do servidor através do Coolify é **4 GB de RAM** (ex: Hetzner Cloud, DigitalOcean, Linode).
* **Armazenamento:** 40 a 50GB SSD no mínimo.

---

## 3. Comandos de Implantação e Passos

A grande vantagem do Coolify é que a maior parte da implantação **foge do terminal (comandos)** e vai para as **telas (cliques)**, gerando previsibilidade.

### Passo 3.1: Instalação do Coolify na VPS
Uma vez acessada sua VPS via SSH, e ela não tendo Nginx ou Apache rodando (seja nova), roda-se apenas o comando oficial:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```
Ao final, ele vai disponibilizar a URL (ex: `http://<IP_DA_VPS>:8000`) para você criar sua conta admin no painel.

### Passo 3.2: Configurando o Banco de Dados (PostgreSQL) no Painel
1. Criar novo Recurso > **Database** > **PostgreSQL**.
2. Definir usuário: `vcskt_db`
3. Banco: `blackjag_db`
4. Como o Coolify roda num Docker Swarm/Network interna, ele vai nos dar o **Internal Database URL** (Ex: `postgresql://vcskt_db:senhasupersecreta@postgres-xyz:5432/blackjag_db`).

### Passo 3.3: Implantando o Backend (NestJS)
Esse repositório contém um `Dockerfile`. Essa é a forma mais fácil e segura de fazer deploy no Coolify. O Coolify permite apontar diretamente para este repositório do Github.

1. Novo Recurso > **Public Repository** ou **Private Repository** (dependendo de como o código está no Github).
2. Configure as **Environment Variables** (.env) na aba apropriada. Importante mapear:
   * `DATABASE_URL` = <A URL INTERNA do PostgreSQL copiada do passo anterior>
   * Segredos do JWT, portas, etc.
3. Em *Build Pack*, escolha **Docker**. Ele detectará o seu `Dockerfile` na raiz (`/Dockerfile`).
4. (Opcional) Edite o `start command` se preciso, mas já deixamos o cmd do próprio Dockerfile fazer. Você pode expor a porta `3000`.
5. Você associa o **Domain**: ex `api.blackjag.com.br`, e diz para ele habilitar `Let's Encrypt` na caixinha de verificação. Ele vai criar o Nginx e gerar o SSL silenciosamente!

---

## User Review Required

> [!IMPORTANT]
> - Precisaremos ajustar o `Dockerfile` atual para que no build possamos compilar o prisma sem dores de cabeça nas rotinas de CI/CD pelo Coolify?
> - Você possui atualmente uma conta Cloud para provisionarmos essa VPS (como Hetzner, AWS EC2, DigitalOcean ou Contabo)?
> - A infraestrutura suportará também o Deploy do Frontend Angular na mesma máquina? (Coolify também suporta estáticos (Angular/React) perfeitamente através de integração `Nixpacks` ou Nginx-Docker-Compose).

Ao aprovar estas análises, seguimos para os próximos pequenos ajustes de código visando o preparo do Dockerfile e Primas para o deploy.
