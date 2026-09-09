// All backend communication lives here. Components never call fetch directly.
const BASE = "/api";

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${options.method || "GET"} ${path} → ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const api = {
  listBooks: (params = {}) => req("/books?" + new URLSearchParams(params)),
  importBooks: (q) => req("/books/import?" + new URLSearchParams({ q }), { method: "POST" }),
  getShelf: () => req("/shelf"),
  updateShelf: (bookId, body) => req(`/shelf/${bookId}`, { method: "PUT", body: JSON.stringify(body) }),
  removeFromShelf: (bookId) => req(`/shelf/${bookId}`, { method: "DELETE" }),
  dismiss: (bookId) => req(`/dismiss/${bookId}`, { method: "POST" }),
  getPreferences: () => req("/preferences"),
  setPreferences: (genres) => req("/preferences", { method: "PUT", body: JSON.stringify({ genres }) }),
  getRecommendations: () => req("/recommendations"),
};
