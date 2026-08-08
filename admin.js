const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const password = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");
const gallery = document.getElementById("gallery");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const notice = document.getElementById("notice");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");
const preview = document.getElementById("preview");
const previewImage = document.getElementById("previewImage");
const closePreview = document.getElementById("closePreview");

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  let data = {};
  try { data = await response.json(); } catch {}

  if (!response.ok) {
    throw new Error(data.error || `Erro ${response.status}`);
  }

  return data;
}

function showLogin() {
  loginView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
}

function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
}

function formatBytes(value) {
  const n = Number(value || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function getSession(pathname) {
  const name = pathname.split("/").pop() || "";
  const withoutExt = name.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  const noSuffix = withoutExt.replace(/-[a-zA-Z0-9]{8,}$/, "");
  const parts = noSuffix.split("-");
  return parts.slice(2).join("-") || "sem_sessao";
}

async function loadCaptures() {
  try {
    notice.classList.add("hidden");

    const data = await api("/api/admin/list");
    const items = data.items || [];

    count.textContent =
      items.length === 1
        ? "1 captura carregada."
        : `${items.length} capturas carregadas.`;

    if (data.hasMore) {
      notice.textContent =
        "Existem mais capturas no armazenamento. Esta tela exibe as 200 mais recentes.";
      notice.classList.remove("hidden");
    }

    gallery.innerHTML = "";
    empty.classList.toggle("hidden", items.length !== 0);

    for (const item of items) {
      const article = document.createElement("article");
      article.className = "card";

      const img = document.createElement("img");
      img.className = "thumb";
      img.loading = "lazy";
      img.alt = "Captura AirDraw";
      img.src = `/api/admin/file?pathname=${encodeURIComponent(item.pathname)}`;

      img.addEventListener("click", () => {
        previewImage.src = img.src;
        preview.showModal();
      });

      const meta = document.createElement("div");
      meta.className = "meta";

      const title = document.createElement("strong");
      title.textContent = "Sessão: " + getSession(item.pathname);

      const date = document.createElement("small");
      date.textContent = new Date(item.uploadedAt).toLocaleString("pt-BR");

      const size = document.createElement("small");
      size.textContent = formatBytes(item.size);

      const remove = document.createElement("button");
      remove.textContent = "Excluir captura";

      remove.addEventListener("click", async () => {
        if (!confirm("Excluir esta captura permanentemente?")) return;

        remove.disabled = true;

        try {
          await api("/api/admin/delete", {
            method: "DELETE",
            body: JSON.stringify({ pathname: item.pathname })
          });

          await loadCaptures();
        } catch (error) {
          alert(error.message);
          remove.disabled = false;
        }
      });

      meta.append(title, date, size, remove);
      article.append(img, meta);
      gallery.append(article);
    }
  } catch (error) {
    if (/autorizado/i.test(error.message)) {
      showLogin();
    } else {
      count.textContent = error.message;
    }
  }
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  loginMessage.textContent = "";

  try {
    await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password: password.value })
    });

    password.value = "";
    showDashboard();
    await loadCaptures();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

refreshBtn.addEventListener("click", loadCaptures);

logoutBtn.addEventListener("click", async () => {
  try {
    await api("/api/admin/logout", { method: "POST" });
  } finally {
    showLogin();
  }
});

closePreview.addEventListener("click", () => preview.close());

preview.addEventListener("click", event => {
  if (event.target === preview) preview.close();
});

(async () => {
  try {
    const me = await api("/api/admin/me");

    if (me.authenticated) {
      showDashboard();
      await loadCaptures();
    } else {
      showLogin();
    }
  } catch {
    showLogin();
  }
})();
