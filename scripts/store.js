const STORAGE_KEY = "usonlygram-state-v1";

const readTextMap = (text) => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const [id, value] = line.split("=");
      if (id) acc[id] = Number(value || 0);
      return acc;
    }, {});
};

const readComments = (text) => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const [postId, ...body] = line.split("|");
      if (!postId || !body.length) return acc;
      acc[postId] = acc[postId] || [];
      acc[postId].push({ author: "Nós", text: body.join("|"), createdAt: "memória salva" });
      return acc;
    }, {});
};

const loadPersisted = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const persist = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const createStore = async () => {
  const [posts, likesText, commentsText, cartasData] = await Promise.all([
    fetch("./data/posts.json").then((response) => response.json()),
    fetch("./data/likes.txt").then((response) => response.text()),
    fetch("./data/comments.txt").then((response) => response.text()),
    fetch("./data/cartas.json").then((response) => response.json())
  ]);

  const seed = {
    likes: readTextMap(likesText),
    liked: {},
    comments: readComments(commentsText)
  };

  let state = {
    ...seed,
    ...loadPersisted()
  };

  state.likes = { ...seed.likes, ...(state.likes || {}) };
  state.comments = { ...seed.comments, ...(state.comments || {}) };
  state.liked = state.liked || {};

  const save = () => persist({ likes: state.likes, liked: state.liked, comments: state.comments });

  return {
    data: posts,
    cartas: cartasData.cartas || [],
    getLikeCount(postId) {
      return state.likes[postId] || 0;
    },
    isLiked(postId) {
      return Boolean(state.liked[postId]);
    },
    toggleLike(postId) {
      const liked = !state.liked[postId];
      state.liked[postId] = liked;
      state.likes[postId] = Math.max(0, (state.likes[postId] || 0) + (liked ? 1 : -1));
      save();
      return { liked, count: state.likes[postId] };
    },
    getComments(postId) {
      return state.comments[postId] || [];
    },
    addComment(postId, text) {
      const comment = {
        author: "Você",
        text,
        createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
      };
      state.comments[postId] = [...(state.comments[postId] || []), comment];
      save();
      return comment;
    }
  };
};
