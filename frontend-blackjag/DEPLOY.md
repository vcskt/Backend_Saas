# BlackJag Frontend - Documentação Oficial

Bem-vindo à arquitetura Frontend BlackJag estruturada em Angular (v17+) + PO UI e TailwindCSS.

## 1. Primeiros Passos (Localhost)

Para executar este projeto em sua máquina local para testes e desenvolvimento:

1. **Abra o terminal na pasta raiz** (`frontend-blackjag`).
2. Digite: `npm install` (Para instalar todas as dependências).
3. Inicie o servidor: `npm run start`
4. Acesse: [http://localhost:4200](http://localhost:4200)

## 2. Configurações de Ambiente (Backend)

O frontend precisa saber onde o NestJS backend está rodando. Isso é gerenciado pelo ambiente `environment`. O Angular CLI moderno unificou essa estrutura se assim desejado. Os endpoints base são controlados via:
* **Desenvolvimento Local:** O arquivo `src/environments/environment.ts` aponta para seu container `http://localhost:3000/api`.
* **Produção:** Pode apontar para `https://api.blackjag.com`.

## 3. Estruturação do Código (Feature-Based & Clean Code)

A estrutura do diretório `/src` garante enorme escalabilidade de longo prazo:

* **`/core`**: Coração lógico da aplicação. Aqui reside o singleton `AuthService`, interceptadores da rede (injeção do `Bearer JWT` automático) e as lógicas de tratamento global de erros da API NestJS. Não coloque interfaces gráficas aqui.
* **`/shared`**: Componentes burros (Dump Components) que apenas recebem `@Input()` ou Pipes e não chamam serviços complexos sozinhos (ex: loading spinners, cards de produtos reutilizáveis). 
* **`/features/public`**: Tudo que o cliente final enxerga. Renderizado de forma leve e com alto apelo visual (Graças ao `TailwindCSS` nativo do `/src/styles.scss`).
* **`/features/admin`**: Painel Restrito de alta velocidade e gerenciamento em massa de tela. Aqui nós injetamos unicamente todo o poder visual utilitário e maduro do TOTVS `PO UI`.

## 4. Otimização e Deploy para VPS

Assim como conteinerizamos o backend NestJS, o frontend também fará sua transição de forma eficiente usando **Nginx**.

1. **Rodar Build de Produção Localmente**: 
   Apenas digite: 
   ```bash
   npm run build
   ```
   *Isso criará uma pasta chamada `dist/frontend-blackjag` cheia de arquivos compactados e pesados com cache busting.*

2. **Na sua VPS**:
   Seu servidor Linux `vps-portainer` usa o Nginx. Para expor o frontend ao mundo:
   
   A) Transfira ou faça o `git pull` da pasta `/dist/frontend-blackjag/browser` gerada do servidor.
   
   B) Ajuste seu `nginx.conf`:
   ```nginx
   server {
       listen 80;
       server_name blackjag.com www.blackjag.com;
       root /var/www/blackjag;
       index index.html;

       # O pulo do gato para Angular SPA (Single Page Applications)
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Proxear o /api invisívelmente para o NestJS local (Segurança máxima)
       location /api {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
       }
   }
   ```
3. **Certificados HTTPS Automáticos**:
   Com o site ativo em IP limpo (porta 80 sem SSL), você executa dentro da VPS o comando único:
   ```bash
   sudo certbot --nginx -d blackjag.com -d www.blackjag.com
   ```
   *E o site Angular ganha o selinho verde permanente associado à hospedagem*.
