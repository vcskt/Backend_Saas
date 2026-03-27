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

---

> [!TIP]
> **O Que Faremos Agora:**
> A "Estrada de Produção" está pronta 🛣️!
> 
> O próximo passo é virarmos a cabeça para o lado "Programador", criando aqui no VS Code/Windows o coração da nossa API com o **NestJS** (Módulos de Usuários, JWT, Segurança de Rotas, etc.), conectá-la a esse banco que criamos e, ao final, jogar esse código empacotado para o Servidor. Tudo isso com o Docker em mente!
