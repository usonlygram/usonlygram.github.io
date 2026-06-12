# UsOnlyGRAM

Rede social privada, estática e instalável para celebrar memórias de casal. O projeto foi feito para GitHub Pages usando apenas HTML, CSS e JavaScript, sem backend.

## Publicar no GitHub Pages

O GitHub Pages precisa receber o conteúdo desta pasta como site estático. O arquivo `index.html` deve ficar na raiz publicada.

### Opção 1: repositório só para o UsOnlyGRAM

1. Crie um repositório no GitHub, por exemplo `usonlygram`.
2. Copie todo o conteúdo de `outputs/usonlygram` para a raiz desse repositório.
3. Faça commit e push para a branch `main`.
4. No GitHub, abra `Settings > Pages`.
5. Em `Build and deployment`, selecione `Deploy from a branch`.
6. Em `Branch`, escolha `main` e `/root`.
7. Clique em `Save`.
8. Aguarde o GitHub gerar o link, normalmente algo como `https://seuusuario.github.io/usonlygram/`.

### Opção 2: publicar dentro de outro repositório

1. Copie a pasta `outputs/usonlygram` para o repositório.
2. Renomeie essa pasta para `docs`.
3. Faça commit e push.
4. Em `Settings > Pages`, escolha a branch `main` e a pasta `/docs`.
5. Clique em `Save`.

Depois de publicar, abra o link do Pages e aguarde o primeiro carregamento. O PWA e o service worker funcionam corretamente em `https` ou `localhost`, e o GitHub Pages já usa `https`.

## Adicionar fotos e memórias

1. Coloque as imagens em `fotos`.
2. Nomeie as fotos datadas no padrão `dd-mm-aaaa-descricao.jpeg`, por exemplo:

```text
23-12-2023-primeiro-encontro.jpeg
18-10-2025-primeira-viagem-a-dois.jpeg
```

3. Fotos com nome `WhatsApp Image...` entram como `Nossos momentos`.
4. Depois de adicionar fotos, rode novamente o importador local:

```powershell
cd C:\Users\gusta\Documents\Codex\2026-06-11\projeto-usonlygram-crie-uma-rede-social
C:\Users\gusta\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe work\import-photos.cjs
```

## Likes e comentários

`data/likes.txt` e `data/comments.txt` funcionam como dados iniciais. Como GitHub Pages não permite gravar arquivos no servidor pelo navegador, novos likes e comentários ficam persistidos no `localStorage` do dispositivo. A camada de dados está isolada em `scripts/store.js`, pronta para trocar por uma API futuramente.

## Música do modo Nossas Memórias

Coloque um `.mp3` em `assets/music` e troque o `src` do elemento `<audio>` em `index.html`.

## Estrutura

- `assets/images`: placeholders e imagens auxiliares.
- `assets/icons`: logo e ícones do app/PWA.
- `assets/music`: música opcional.
- `fotos`: fotos reais do casal.
- `data`: posts, likes e comentários iniciais.
- `scripts`: app e store.
- `styles`: CSS principal.
