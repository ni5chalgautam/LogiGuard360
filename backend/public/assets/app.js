/* LogiGuard360 Frontend (Vanilla HTML/CSS/JS) - FIXED auth sync
   Key fix:
   - Always read token/user/apiBase from localStorage when needed
   - Use absolute redirects (/login.html, /index.html) to avoid path issues
*/

const LG = (() => {
  const DEFAULT_API = "/api";

  const state = {
    apiBase: localStorage.getItem("lg_api_base") || DEFAULT_API,
    token: localStorage.getItem("lg_token") || "",
    user: (() => { try { return JSON.parse(localStorage.getItem("lg_user") || "null"); } catch { return null; } })()
  };

  // ✅ Always keep state synced with localStorage (prevents "page closes instantly")
  function sync() {
    state.apiBase = localStorage.getItem("lg_api_base") || DEFAULT_API;
    state.token = localStorage.getItem("lg_token") || "";
    try { state.user = JSON.parse(localStorage.getItem("lg_user") || "null"); }
    catch { state.user = null; }
  }

  function saveAuth(token, user){
    // Accept token from different key names just in case
    const t = token || "";
    state.token = t;
    state.user = user || null;

    if (t) localStorage.setItem("lg_token", t);
    else localStorage.removeItem("lg_token");

    if (user) localStorage.setItem("lg_user", JSON.stringify(user));
    else localStorage.removeItem("lg_user");
  }

  function setApiBase(url){
    const u = (url || DEFAULT_API).trim();
    state.apiBase = u;
    localStorage.setItem("lg_api_base", u);
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[m]));
  }

  function toast(type, message){
    const host = document.querySelector(".lg-toast") || (() => {
      const d = document.createElement("div");
      d.className = "lg-toast";
      document.body.appendChild(d);
      return d;
    })();

    const card = document.createElement("div");
    card.className = "lg-card";
    card.style.borderColor = type === "error" ? "rgba(255,0,110,0.35)" : "rgba(0,245,255,0.18)";
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
        <div>
          <div style="font-weight:950; margin-bottom:6px;">${type === "error" ? "Error" : "Notice"}</div>
          <div class="lg-note">${escapeHtml(message || "")}</div>
        </div>
        <button class="lg-btn ${type === "error" ? "danger" : ""}" style="padding:8px 10px;">Close</button>
      </div>
    `;
    host.appendChild(card);
    card.querySelector("button").onclick = () => card.remove();
    setTimeout(() => { if(card.isConnected) card.remove(); }, 6000);
  }

  // ✅ fixed: always re-check localStorage
  function isAuthed(){
    sync();
    return !!state.token;
  }

  function canonicalRole(raw){
    const r = String(raw || "").toLowerCase().replace(/\s+/g,"");
    if(!r) return "logisticsStaff";
    if(r.includes("system") && r.includes("admin")) return "systemAdministrator";
    if(r === "admin" || r === "administrator") return "systemAdministrator";
    if(r.includes("warehouse") && r.includes("manager")) return "warehouseManager";
    if(r.includes("logistics") && r.includes("staff")) return "logisticsStaff";
    return raw;
  }

  function role(){
    sync();
    return canonicalRole(state.user?.role);
  }

  function userId(){
    sync();
    return state.user?.userId || state.user?._id || state.user?.id || "";
  }

  function logout(){
    saveAuth("", null);
    window.location.href = "/login.html";
  }

  async function requestOne(path, { method="GET", body, headers } = {}){
    sync();
    const url = state.apiBase.replace(/\/$/, "") + "/" + String(path).replace(/^\//, "");
    const h = Object.assign({ "Content-Type": "application/json" }, headers || {});
    if(state.token) h["Authorization"] = "Bearer " + state.token;

    const res = await fetch(url, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if(!res.ok){
      const msg = data?.message || data?.error || (typeof data === "string" ? data : "Request failed");
      throw new Error(msg);
    }
    return data;
  }

  async function request(pathOrPaths, opts){
    const paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
    let lastErr = null;
    for(const p of paths){
      try{
        return await requestOne(p, opts);
      }catch(err){
        lastErr = err;
      }
    }
    throw lastErr || new Error("Request failed");
  }

  const NAV = [
    { label: "Dashboard", href: "index.html", icon: "fa-gauge-high", roles: ["systemAdministrator","warehouseManager","logisticsStaff"] },
    { label: "Training", href: "training.html", icon: "fa-graduation-cap", roles: ["systemAdministrator","warehouseManager","logisticsStaff"] },
    { label: "Warehouse", href: "warehouse.html", icon: "fa-warehouse", roles: ["systemAdministrator","warehouseManager","logisticsStaff"] },
    { label: "Reports", href: "reports.html", icon: "fa-chart-column", roles: ["systemAdministrator","warehouseManager", "logisticsStaff"] },
    { label: "Feedback", href: "feedback.html", icon: "fa-flag", roles: ["systemAdministrator","warehouseManager","logisticsStaff"] },
    { label: "Hotspot Detector", href: "hotspot_detector.html", icon: "fa-crosshairs", roles: ["systemAdministrator","warehouseManager"] },
    { label: "Manage Users", href: "admin_users.html", icon: "fa-users-gear", roles: ["systemAdministrator"] },
    { label: "System Audit", href: "admin_audit.html", icon: "fa-shield-halved", roles: ["systemAdministrator"] },
    { label: "Configure Warehouse", href: "manager_config.html", icon: "fa-screwdriver-wrench", roles: ["warehouseManager"] },
    { label: "Appendix", href: "appendix.html", icon: "fa-book", roles: ["systemAdministrator","warehouseManager","logisticsStaff"], section: "Resources" },
  ];

  function injectShell(){
    sync();
    const current = window.location.pathname.split("/").pop() || "index.html";

    const sidebar = document.createElement("aside");
    sidebar.className = "lg-sidebar";
    sidebar.innerHTML = `
      <a class="lg-brand" href="index.html" aria-label="Go to Home">
        <span class="dot"></span>
        <div>
          <div class="title">LogiGuard360</div>
          <span class="sub">${escapeHtml(state.user?.username || "User")} • ${escapeHtml(role())}</span>
        </div>
      </a>
      <div class="lg-side-section">Navigation</div>
      <div class="lg-side-nav"></div>
      <div class="lg-side-section">Account</div>
      <button class="lg-btn danger" id="lg-logout" style="width: calc(100% - 12px); margin: 6px;">Sign out</button>
    `;

    const topbar = document.createElement("header");
    topbar.className = "lg-topbar";
    topbar.innerHTML = `
      <div class="lg-top-left">
        <a class="lg-logo" href="index.html">
          <i class="fa-solid fa-shield-halved"></i>
          <span>LogiGuard360</span>
        </a>

        <form class="lg-search" id="lg-search-form" role="search">
          <i class="fa-solid fa-magnifying-glass" style="color: var(--lg-dim);"></i>
          <input type="text" id="lg-search" placeholder="Search: training, warehouse, reports, users... (Enter)" />
        </form>

        <nav class="lg-top-links" aria-label="Top Navigation"></nav>
      </div>

      <div class="lg-top-right">
        <span class="lg-pill" title="API Base URL">API: ${escapeHtml(state.apiBase)}</span>
        <a class="lg-btn primary" href="login.html" id="lg-login-btn"><i class="fa-solid fa-right-to-bracket"></i> Login / Create</a>
      </div>
    `;

    document.body.classList.add("lg-shell");
    document.body.prepend(sidebar);
    document.body.prepend(topbar);

    const allowed = NAV.filter(n => (n.roles || []).includes(role()));
    const resources = allowed.filter(n => n.section === "Resources");
    const main = allowed.filter(n => !n.section);

    sidebar.querySelector(".lg-side-nav").innerHTML = main.map(n => `
      <a class="lg-side-link ${n.href === current ? "active" : ""}" href="${n.href}">
        <i class="fa-solid ${n.icon}"></i>
        <span>${n.label}</span>
      </a>
    `).join("");

    if(resources.length){
      const sec = document.createElement("div");
      sec.innerHTML = `
        <div class="lg-side-section">Resources</div>
        ${resources.map(n => `
          <a class="lg-side-link ${n.href === current ? "active" : ""}" href="${n.href}">
            <i class="fa-solid ${n.icon}"></i>
            <span>${n.label}</span>
          </a>
        `).join("")}
      `;
      sidebar.insertBefore(sec, sidebar.querySelector(".lg-side-section:nth-of-type(2)"));
    }

    const topHost = topbar.querySelector(".lg-top-links");
    const topSet = main.filter(n => ["Dashboard","Training","Warehouse","Reports"].includes(n.label));
    topHost.innerHTML = topSet.map(n => `
      <a class="lg-top-link ${n.href === current ? "active" : ""}" href="${n.href}">${n.label}</a>
    `).join("");

    const loginBtn = topbar.querySelector("#lg-login-btn");
    if(isAuthed()){
      loginBtn.classList.remove("primary");
      loginBtn.classList.add("danger");
      loginBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
      loginBtn.href = "#";
      loginBtn.onclick = (e) => { e.preventDefault(); logout(); };
    }

    sidebar.querySelector("#lg-logout").onclick = logout;

    const searchForm = topbar.querySelector("#lg-search-form");
    const searchInput = topbar.querySelector("#lg-search");
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = String(searchInput.value || "").trim().toLowerCase();
      if(!query) return;
      window.location.href = "training.html?q=" + encodeURIComponent(query);
    });
  }

  function requireAuth(){
    if(!isAuthed()){
      window.location.href = "/login.html";
      return false;
    }
    return true;
  }

  function requireRole(allowedRoles){
    if(!requireAuth()) return false;
    if(!allowedRoles.includes(role())){
      window.location.href = "/unauthorized.html";
      return false;
    }
    return true;
  }

  return { state, sync, setApiBase, request, saveAuth, role, userId, isAuthed, logout, toast, injectShell, requireAuth, requireRole };
})();

document.addEventListener("DOMContentLoaded", () => {
  const protectedPage = document.body.getAttribute("data-protected") === "true";
  if(protectedPage){
    if(!LG.requireAuth()) return;
    LG.injectShell();
  }
});
