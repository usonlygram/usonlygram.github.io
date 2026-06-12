import { createStore } from "./store.js";

const state = {
  route: "feed",
  postsShown: 3,
  activePostId: null,
  slideshowIndex: 0,
  slideshowTimer: null,
  slideshowPlaying: true,
  touchStartX: 0
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const formatDate = (date) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));

const daysTogether = (startDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  return Math.max(0, Math.floor((today - start) / 86400000));
};

const iconHeart = (liked) => (liked ? "♥" : "♡");

const observeReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting)),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((element) => observer.observe(element));
};

const renderParticles = () => {
  const field = $("#particleField");
  for (let index = 0; index < 44; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty("--duration", `${8 + Math.random() * 10}s`);
    particle.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    particle.style.animationDelay = `${Math.random() * -12}s`;
    field.appendChild(particle);
  }
};

const renderFeed = (store) => {
  const list = $("#feedList");
  const visiblePosts = store.data.posts.slice(0, state.postsShown);
  list.innerHTML = visiblePosts
    .map((post) => {
      const liked = store.isLiked(post.id);
      return `
        <article class="post-card reveal" data-post-id="${post.id}">
          <div class="post-media">
            <img src="${post.image}" alt="${post.alt}" loading="lazy" />
          </div>
          <div class="post-body">
            <div class="post-meta">
              <div>
                <h3>${post.title}</h3>
                <span>${post.location}</span>
              </div>
              <span class="post-date">${formatDate(post.date)}</span>
            </div>
            <p class="post-caption">${post.caption}</p>
            <div class="post-actions">
              <button class="heart-button ${liked ? "is-liked" : ""}" type="button" data-like="${post.id}" aria-label="Curtir ${post.title}">
                <span>${iconHeart(liked)}</span><span data-like-count="${post.id}">${store.getLikeCount(post.id)}</span>
              </button>
              <button class="comment-button" type="button" data-comments="${post.id}">Comentários (${store.getComments(post.id).length})</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  $("#loadMoreButton").hidden = state.postsShown >= store.data.posts.length;
  observeReveal();
};

const renderProfile = (store) => {
  const { couple, posts } = store.data;
  const days = daysTogether(couple.relationshipStart);
  $("#heroDays").textContent = days;
  $("#profile").innerHTML = `
    <article class="profile-card reveal">
      <div class="profile-avatar-wrap">
        <img class="profile-avatar" src="${couple.avatar}" alt="Retrato ilustrado do casal" />
      </div>
      <div>
        <p class="eyebrow">${couple.handle}</p>
        <h1>${couple.names}</h1>
        <p>${couple.bio}</p>
        <div class="profile-stats" aria-label="Resumo do perfil">
          <div class="stat"><strong>${posts.length}</strong><span>memórias</span></div>
          <div class="stat"><strong>${formatDate(couple.relationshipStart)}</strong><span>início</span></div>
          <div class="stat"><strong>${days}</strong><span>dias juntos</span></div>
          <div class="stat"><strong>${couple.stats.trips}</strong><span>viagens</span></div>
        </div>
      </div>
    </article>
  `;
};

const renderTimeline = (store) => {
  $("#timeline").innerHTML = `
    <div class="timeline-list">
      ${store.data.posts
        .map(
          (post) => `
        <article class="timeline-card reveal">
          <figure><img src="${post.image}" alt="${post.alt}" loading="lazy" /></figure>
          <div>
            <p class="timeline-meta">${new Date(`${post.date}T12:00:00`).getFullYear()} · ${formatDate(post.date)}</p>
            <h2>${post.title}</h2>
            <p>${post.caption}</p>
          </div>
        </article>`
        )
        .join("")}
    </div>
  `;
};

const renderStory = (store) => {
  const { couple } = store.data;
  const days = daysTogether(couple.relationshipStart);
  $("#story").innerHTML = `
    <div class="hero-panel reveal">
      <div>
        <p class="eyebrow">nossa jornada</p>
        <h1>Cada dia com você é uma vitória.</h1>
        <p>Desde o primeiro encontro até agora, cada momento foi uma escolha de ficar perto e construir algo bonito juntos.</p>
      </div>
      <div class="hero-card" aria-label="Dias juntos">
        <span>${days}</span>
        <small>dias juntos</small>
      </div>
    </div>
    <div class="story-list">
      ${store.data.story
        .map(
          (item) => `
        <article class="story-block reveal">
          <div class="story-copy">
            <p class="eyebrow">${item.date ? formatDate(item.date) : "nossa história"}</p>
            <h2>${item.title}</h2>
            <p>${item.text}</p>
          </div>
          <div class="story-image"><img src="${item.image}" alt="${item.title}" loading="lazy" /></div>
        </article>`
        )
        .join("")}
    </div>
  `;
};

const renderGallery = (store, filter = "todos") => {
  const tags = ["todos", ...new Set(store.data.posts.flatMap((post) => post.tags))];
  const posts = filter === "todos" ? store.data.posts : store.data.posts.filter((post) => post.tags.includes(filter));
  $("#gallery").innerHTML = `
    <div class="gallery-toolbar" aria-label="Filtros da galeria">
      ${tags.map((tag) => `<button class="filter-button ${tag === filter ? "is-active" : ""}" type="button" data-filter="${tag}">${tag}</button>`).join("")}
    </div>
    <div class="gallery-grid">
      ${posts
        .map(
          (post, index) => `
        <figure class="gallery-item reveal" style="--ratio: ${index % 2 ? "1 / 1" : "4 / 5"}">
          <img src="${post.image}" alt="${post.alt}" loading="lazy" />
          <figcaption>${post.title}</figcaption>
        </figure>`
        )
        .join("")}
    </div>
  `;
  observeReveal();
};

const renderLetters = (store) => {
  $("#letters").innerHTML = `
    <div class="hero-panel reveal">
      <div>
        <p class="eyebrow">cartas do coração</p>
        <h1>Palavras que eternizam o que sentimos.</h1>
        <p>Cada carta é um pedaço do nosso coração posto em papel, mensagens que guardamos para sempre.</p>
      </div>
    </div>
    <div class="letters-list">
      ${store.cartas
        .map(
          (carta) => `
        <article class="letter-card reveal">
          <div class="letter-image">
            <img src="${carta.imagem}" alt="${carta.titulo}" loading="lazy" />
          </div>
          <div class="letter-content">
            <p class="letter-number">${carta.numero}</p>
            <p class="letter-date">${formatDate(carta.data)}</p>
            <h3>${carta.titulo}</h3>
            <p class="letter-resumo">${carta.resumo}</p>
            <button class="letter-button" type="button" data-letter-id="${carta.id}" aria-label="Ler ${carta.titulo}">Ler Carta Completa</button>
          </div>
        </article>`
        )
        .join("")}
    </div>
  `;
  observeReveal();
};

const setRoute = (route) => {
  state.route = route;
  $$(".page").forEach((page) => page.classList.toggle("is-visible", page.dataset.page === route));
  $$(".nav-link").forEach((link) => link.classList.toggle("is-active", link.dataset.route === route));
  $(`#${route}`)?.focus({ preventScroll: true });
};

const openComments = (store, postId) => {
  state.activePostId = postId;
  const post = store.data.posts.find((item) => item.id === postId);
  $("#commentsTitle").textContent = `Comentários · ${post.title}`;
  renderComments(store);
  $("#commentsModal").showModal();
};

const openLetter = (store, letterId) => {
  const carta = store.cartas.find((item) => item.id === parseInt(letterId));
  if (!carta) {
    console.error('Carta não encontrada:', letterId);
    return;
  }
  $("#letterTitle").textContent = carta.titulo;
  $("#letterContent").innerHTML = `
    <div class="letter-view">
      <div class="letter-header">
        <p class="letter-number">${carta.numero}</p>
        <p class="letter-date">${formatDate(carta.data)}</p>
        <h2>${carta.titulo}</h2>
      </div>
      <div class="letter-image">
        <img src="${carta.imagem}" alt="${carta.titulo}" />
      </div>
      <div class="letter-text">
        ${carta.texto.split('\n\n').map(p => `<p>${p}</p>`).join('')}
      </div>
    </div>
  `;
  $("#letterModal").showModal();
};

const renderComments = (store) => {
  const comments = store.getComments(state.activePostId);
  $("#commentsList").innerHTML = comments.length
    ? comments.map((comment) => `<article class="comment"><strong>${comment.author}</strong><p>${comment.text}</p><small>${comment.createdAt}</small></article>`).join("")
    : `<p class="comment">Seja o primeiro a deixar uma memória aqui.</p>`;
};

const renderMemorySlide = (store) => {
  const post = store.data.posts[state.slideshowIndex];
  $("#memorySlide").style.backgroundImage = `url("${post.image}")`;
  $("#memoryCaption").innerHTML = `<p class="eyebrow">${formatDate(post.date)}</p><h2>${post.title}</h2><p>${post.caption}</p>`;
};

const stepMemory = (store, direction) => {
  state.slideshowIndex = (state.slideshowIndex + direction + store.data.posts.length) % store.data.posts.length;
  renderMemorySlide(store);
};

const playMemory = (store) => {
  clearInterval(state.slideshowTimer);
  if (state.slideshowPlaying) {
    state.slideshowTimer = setInterval(() => stepMemory(store, 1), 5200);
  }
  $("#playMemory").textContent = state.slideshowPlaying ? "Pausar" : "Reproduzir";
};

const bindEvents = (store) => {
  document.addEventListener("click", (event) => {
    const routeLink = event.target.closest("[data-route]");
    if (routeLink) {
      event.preventDefault();
      history.replaceState(null, "", `#${routeLink.dataset.route}`);
      setRoute(routeLink.dataset.route);
    }

    const likeButton = event.target.closest("[data-like]");
    if (likeButton) {
      const result = store.toggleLike(likeButton.dataset.like);
      likeButton.classList.toggle("is-liked", result.liked);
      likeButton.classList.add("burst");
      likeButton.querySelector("span").textContent = iconHeart(result.liked);
      $(`[data-like-count="${likeButton.dataset.like}"]`).textContent = result.count;
      setTimeout(() => likeButton.classList.remove("burst"), 650);
    }

    const commentsButton = event.target.closest("[data-comments]");
    if (commentsButton) openComments(store, commentsButton.dataset.comments);

    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) renderGallery(store, filterButton.dataset.filter);

    const letterButton = event.target.closest("[data-letter-id]");
    if (letterButton) openLetter(store, letterButton.dataset.letterId);
  });

  $("#loadMoreButton").addEventListener("click", () => {
    state.postsShown += 3;
    renderFeed(store);
  });

  $("#closeComments").addEventListener("click", () => $("#commentsModal").close());
  $("#closeLetter").addEventListener("click", () => $("#letterModal").close());
  $("#commentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#commentInput");
    store.addComment(state.activePostId, input.value.trim());
    input.value = "";
    renderComments(store);
    renderFeed(store);
  });

  $("#contrastToggle").addEventListener("click", () => document.body.classList.toggle("high-contrast"));

  $("#memoryModeButton").addEventListener("click", () => {
    $("#memoryMode").classList.add("is-open");
    $("#memoryMode").setAttribute("aria-hidden", "false");
    state.slideshowPlaying = true;
    renderMemorySlide(store);
    playMemory(store);
  });

  $("#closeMemoryMode").addEventListener("click", () => {
    $("#memoryMode").classList.remove("is-open");
    $("#memoryMode").setAttribute("aria-hidden", "true");
    clearInterval(state.slideshowTimer);
  });

  $("#prevMemory").addEventListener("click", () => stepMemory(store, -1));
  $("#nextMemory").addEventListener("click", () => stepMemory(store, 1));
  $("#playMemory").addEventListener("click", () => {
    state.slideshowPlaying = !state.slideshowPlaying;
    playMemory(store);
  });

  window.addEventListener("keydown", (event) => {
    if (!$("#memoryMode").classList.contains("is-open")) return;
    if (event.key === "ArrowRight") stepMemory(store, 1);
    if (event.key === "ArrowLeft") stepMemory(store, -1);
    if (event.key === "Escape") $("#closeMemoryMode").click();
  });

  window.addEventListener("touchstart", (event) => {
    state.touchStartX = event.touches[0].clientX;
  }, { passive: true });

  window.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].clientX - state.touchStartX;
    if (Math.abs(delta) < 80) return;
    const routes = ["feed", "profile", "timeline", "story", "gallery"];
    const current = routes.indexOf(state.route);
    const next = routes[Math.min(routes.length - 1, Math.max(0, current + (delta < 0 ? 1 : -1)))];
    setRoute(next);
  }, { passive: true });
};

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
  }
};

const init = async () => {
  renderParticles();
  const store = await createStore();
  renderProfile(store);
  renderTimeline(store);
  renderStory(store);
  try {
    renderLetters(store);
  } catch (e) {
    console.error('Erro ao renderizar cartas:', e);
  }
  renderGallery(store);
  renderFeed(store);
  bindEvents(store);
  observeReveal();
  setRoute(location.hash.replace("#", "") || "feed");
  registerServiceWorker();
  setTimeout(() => $("#splash").classList.add("is-hidden"), 1500);
};

init();
