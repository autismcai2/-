const STORAGE_KEY = "bead-inventory-mvp-v1";
const AUTH_KEY = "bead-inventory-auth-v1";
const DEFAULT_THRESHOLD = 200;
const SUPABASE_CONFIG = window.SUPABASE_CONFIG || {};
const REMOTE_STATE_KEY = SUPABASE_CONFIG.stateKey || "default";
const STORAGE_BUCKET = SUPABASE_CONFIG.storageBucket || "pattern-covers";
let supabase = null;
let stateLoaded = false;
let saveTimer = null;
const canonicalColorHex = {
  A1: "#FAF4C8", A2: "#FFFFD5", A3: "#FEFF8B", A4: "#FBED56", A5: "#F4D738", A6: "#FEAC4C", A7: "#FE8B4C", A8: "#FFDA45",
  A9: "#FF995B", A10: "#F77C31", A11: "#FFDD99", A12: "#FE9F72", A13: "#FFC365", A14: "#FD543D", A15: "#FFF365", A16: "#FFFF9F",
  A17: "#FFE36E", A18: "#FEBE7D", A19: "#FD7C72", A20: "#FFD568", A21: "#FFE395", A22: "#F4F57D", A23: "#E6C9B7", A24: "#F7F8A2",
  A25: "#FFD67D", A26: "#FFC830", B1: "#E6EE31", B2: "#63F347", B3: "#9EF780", B4: "#5DE035", B5: "#35E352", B6: "#65E2A6",
  B7: "#3DAF80", B8: "#1C9C4F", B9: "#27523A", B10: "#95D3C2", B11: "#5D722A", B12: "#166F41", B13: "#CAEB7B", B14: "#ADE946",
  B15: "#2E5132", B16: "#C5ED9C", B17: "#9BB13A", B18: "#E6EE49", B19: "#24B88C", B20: "#C2F0CC", B21: "#156A6B", B22: "#0B3C43",
  B23: "#303A21", B24: "#EEFCA5", B25: "#4E846D", B26: "#8D7A35", B27: "#CCE1AF", B28: "#9EE5B9", B29: "#C5E254", B30: "#E2FCB1",
  B31: "#B0E792", B32: "#9CAB5A", C1: "#E8FFE7", C2: "#A9F9FC", C3: "#A0E2FB", C4: "#41CCFF", C5: "#01ACEB", C6: "#50AAF0",
  C7: "#3677D2", C8: "#0F54C0", C9: "#324BCA", C10: "#3EBCE2", C11: "#28DDDE", C12: "#1C334D", C13: "#CDE8FF", C14: "#D5FDFF",
  C15: "#22C4C6", C16: "#1557A8", C17: "#04D1F6", C18: "#1D3344", C19: "#1887A2", C20: "#176DAF", C21: "#BEDDFF", C22: "#67B4BE",
  C23: "#C8E2FF", C24: "#7CC4FF", C25: "#A9E5E5", C26: "#3CAED8", C27: "#D3DFFA", C28: "#BBCFED", C29: "#34488E", D1: "#AEB4F2",
  D2: "#858EDD", D3: "#2F54AF", D4: "#182A84", D5: "#B843C5", D6: "#AC7BDE", D7: "#8854B3", D8: "#E2D3FF", D9: "#D5B9F8",
  D10: "#361851", D11: "#B9BAE1", D12: "#DE9AD4", D13: "#B90095", D14: "#8B279B", D15: "#2F1F90", D16: "#E3E1EE", D17: "#C4D4F6",
  D18: "#A45EC7", D19: "#D8C3D7", D20: "#9C32B2", D21: "#9A009B", D22: "#333A95", D23: "#EBDAFC", D24: "#7786E5", D25: "#494FC7",
  D26: "#DFC2F8", E1: "#FDD3CC", E2: "#FEC0DF", E3: "#FFB7E7", E4: "#E8649E", E5: "#F551A2", E6: "#F13D74", E7: "#C63478",
  E8: "#FFDBE9", E9: "#E970CC", E10: "#D33793", E11: "#FCDDD2", E12: "#F78FC3", E13: "#B5006D", E14: "#FFD1BA", E15: "#F8C7C9",
  E16: "#FFF3EB", E17: "#FFE2EA", E18: "#FFC7DB", E19: "#FEBAD5", E20: "#D8C7D1", E21: "#BD9DA1", E22: "#B785A1", E23: "#937A8D",
  E24: "#E1BCE8", F1: "#FD957B", F2: "#FC3D46", F3: "#F74941", F4: "#FC283C", F5: "#E7002F", F6: "#943630", F7: "#971937",
  F8: "#BC0028", F9: "#E2677A", F10: "#8A4526", F11: "#5A2121", F12: "#FD4E6A", F13: "#F35744", F14: "#FFA9AD", F15: "#D30022",
  F16: "#FEC2A6", F17: "#E69C79", F18: "#D37C46", F19: "#C1444A", F20: "#CD9391", F21: "#F7B4C6", F22: "#FDC0D0", F23: "#F67E66",
  F24: "#E698AA", F25: "#E54B4F", G1: "#FFE2CE", G2: "#FFC4AA", G3: "#F4C3A5", G4: "#E1B383", G5: "#EDB045", G6: "#E99C17",
  G7: "#9D5B3E", G8: "#753832", G9: "#E6B483", G10: "#D98C39", G11: "#E0C593", G12: "#FFC890", G13: "#B7714A", G14: "#8D614C",
  G15: "#FCF9E0", G16: "#F2D9BA", G17: "#78524B", G18: "#FFE4CC", G19: "#E07935", G20: "#A94023", G21: "#B88558", H1: "#FDFBFF",
  H2: "#FEFFFF", H3: "#B6B1BA", H4: "#89858C", H5: "#48464E", H6: "#2F2B2F", H7: "#000000", H8: "#E7D6DB", H9: "#EDEDED",
  H10: "#EEE9EA", H11: "#CECDD5", H12: "#FFF5ED", H13: "#F5ECD2", H14: "#CFD7D3", H15: "#98A6A8", H16: "#1D1414", H17: "#F1EDED",
  H18: "#FFFDF0", H19: "#F6EFE2", H20: "#949FA3", H21: "#FFFBE1", H22: "#CACAD4", H23: "#9A9D94", M1: "#BCC6B8", M2: "#8AA386",
  M3: "#697D80", M4: "#E3D2BC", M5: "#D0CCAA", M6: "#B0A782", M7: "#B4A497", M8: "#B38281", M9: "#A58767", M10: "#C5B2BC",
  M11: "#9F7594", M12: "#644749", M13: "#D19066", M14: "#C77362", M15: "#757D78"
};
const seriesCounts = { A: 26, B: 32, C: 29, D: 26, E: 24, F: 25, G: 21, H: 23, M: 15 };
const routeNames = {
  "/": "首页",
  "/colors": "色库管理",
  "/inventory-alerts": "库存预警",
  "/restocks": "补货记录",
  "/patterns": "图纸中心",
  "/settings": "系统设置"
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const fmt = (value) => Number(value || 0).toLocaleString("zh-CN");
const today = () => new Date().toISOString().slice(0, 10);
let state = loadState();

function initialColors() {
  return Object.entries(seriesCounts).flatMap(([series, count]) => {
    return Array.from({ length: count }, (_, index) => {
      const n = index + 1;
      const code = `${series}${n}`;
      const stock = n % 17 === 0 ? 0 : n % 9 === 0 ? 80 + n * 3 : 260 + ((n * 137 + series.charCodeAt(0) * 11) % 2600);
      return { code, series, hex: canonicalColorHex[code], stock, threshold: DEFAULT_THRESHOLD, library: "MARD 221" };
    });
  });
}

function normalizeColors(colors) {
  return colors.map((color) => {
    const code = String(color.code || "").toUpperCase();
    const series = code.slice(0, 1);
    return {
      ...color,
      code,
      series,
      hex: canonicalColorHex[code] || color.hex,
      library: "MARD 221"
    };
  });
}

function defaultState() {
  const colors = initialColors();
  return {
    settings: { library: "MARD 221", defaultThreshold: DEFAULT_THRESHOLD, allowNegativeStock: false, adminPassword: "admin123" },
    colors,
    restocks: [
      { id: crypto.randomUUID(), code: "A3", quantity: 300, date: today(), note: "首批补货示例" },
      { id: crypto.randomUUID(), code: "B12", quantity: 180, date: today(), note: "" }
    ],
    patterns: [
      { id: crypto.randomUUID(), name: "草莓小兔", status: "todo", stockDeducted: false, note: "示例图纸", cover: "", items: [{ code: "A3", quantity: 120 }, { code: "H19", quantity: 80 }, { code: "B2", quantity: 90 }] },
      { id: crypto.randomUUID(), name: "向日葵杯垫", status: "doing", stockDeducted: false, note: "", cover: "", items: [{ code: "B2", quantity: 140 }, { code: "E15", quantity: 80 }, { code: "D9", quantity: 60 }] },
      { id: crypto.randomUUID(), name: "像素爱心", status: "done-deducted", stockDeducted: true, note: "", cover: "", items: [{ code: "A3", quantity: 40 }, { code: "A1", quantity: 30 }] }
    ]
  };
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultState();
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed.colors) || parsed.colors.length !== 221) return defaultState();
    parsed.colors = normalizeColors(parsed.colors);
    parsed.settings = {
      library: parsed.settings?.library || "MARD 221",
      defaultThreshold: Number(parsed.settings?.defaultThreshold ?? DEFAULT_THRESHOLD),
      allowNegativeStock: Boolean(parsed.settings?.allowNegativeStock),
      adminPassword: parsed.settings?.adminPassword || "admin123"
    };
    return parsed;
  } catch {
    return defaultState();
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueRemoteSave();
}

function canUseSupabase() {
  return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && window.supabase?.createClient);
}

function getSupabaseClient() {
  if (!canUseSupabase()) return null;
  if (!supabase) {
    supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return supabase;
}

async function loadRemoteState() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from("app_state")
    .select("payload")
    .eq("state_key", REMOTE_STATE_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data?.payload || !Object.keys(data.payload).length) return null;
  const remote = data.payload;
  if (!Array.isArray(remote.colors) || remote.colors.length !== 221) return null;
  remote.colors = normalizeColors(remote.colors);
  remote.settings = {
    library: remote.settings?.library || "MARD 221",
    defaultThreshold: Number(remote.settings?.defaultThreshold ?? DEFAULT_THRESHOLD),
    allowNegativeStock: Boolean(remote.settings?.allowNegativeStock),
    adminPassword: remote.settings?.adminPassword || "admin123"
  };
  return remote;
}

async function saveRemoteState() {
  const client = getSupabaseClient();
  if (!client || !stateLoaded) return;
  const payload = {
    ...state,
    updatedAt: new Date().toISOString()
  };
  const { error } = await client.from("app_state").upsert({
    state_key: REMOTE_STATE_KEY,
    payload
  });
  if (error) throw error;
}

function queueRemoteSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveRemoteState().catch(() => toast("云端保存失败"));
  }, 250);
}

async function hydrateState() {
  try {
    const remote = await loadRemoteState();
    if (remote) {
      state = remote;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else if (canUseSupabase()) {
      await saveRemoteState();
    }
  } catch {
    toast("云端数据加载失败，已回退到本地数据");
  } finally {
    stateLoaded = true;
    render();
  }
}

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "ok";
}

function setAuthenticated(value) {
  if (value) {
    sessionStorage.setItem(AUTH_KEY, "ok");
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
}

function colorByCode(code) {
  return state.colors.find((color) => color.code.toUpperCase() === String(code).trim().toUpperCase());
}

function statusOf(color) {
  if (color.stock <= 0) return { label: "缺货", cls: "empty" };
  if (color.stock <= color.threshold) return { label: "低库存", cls: "low" };
  return { label: "正常", cls: "ok" };
}

function patternStatusMeta(status, deducted) {
  const map = {
    todo: ["待拼", "low"],
    doing: ["进行中", "process"],
    done: ["仅完成不扣库存", "done"],
    "done-deducted": ["已拼并扣库存", "ok"]
  };
  const result = map[status] || map.todo;
  if (deducted && status !== "done-deducted") return ["已扣库存", "ok"];
  return result;
}

function alerts() {
  return state.colors
    .map((color) => {
      const pendingNeed = state.patterns
        .filter((pattern) => pattern.status === "todo" || pattern.status === "doing")
        .flatMap((pattern) => pattern.items)
        .filter((item) => item.code === color.code)
        .reduce((sum, item) => sum + item.quantity, 0);
      const shortageAmount = Math.max(pendingNeed - color.stock, 0);
      const isShortage = shortageAmount > 0;
      const isLowStock = !isShortage && color.stock <= color.threshold;
      if (!isShortage && !isLowStock) return null;
      const gap = isShortage ? shortageAmount : color.threshold;
      const suggestedBase = isShortage ? shortageAmount + color.threshold : color.threshold;
      return {
        ...color,
        alertType: isShortage ? "shortage" : "low",
        pendingNeed,
        shortageAmount,
        gap,
        suggested: roundUpToThousand(suggestedBase)
      };
    })
    .filter(Boolean);
}

function roundUpToThousand(value) {
  if (value <= 0) return 0;
  return Math.ceil(value / 1000) * 1000;
}

function route() {
  return location.hash.replace("#", "") || "/";
}

function setActiveRoute() {
  $$(".nav a").forEach((link) => link.classList.toggle("active", link.dataset.route === route()));
}

function render() {
  if (!stateLoaded && canUseSupabase()) {
    document.body.classList.add("locked");
    $("#view").innerHTML = `<section class="login-panel panel"><p class="eyebrow">云端同步</p><h1>正在加载数据</h1><p>请稍候，正在连接 Supabase。</p></section>`;
    return;
  }
  document.body.classList.toggle("locked", !isAuthenticated());
  $("#quickAddPattern").style.display = isAuthenticated() ? "" : "none";
  $("#librarySelect").style.display = isAuthenticated() ? "" : "none";
  $("#globalSearch").disabled = !isAuthenticated();
  $("#logoutButton").style.display = isAuthenticated() ? "" : "none";
  setActiveRoute();
  if (!isAuthenticated()) {
    renderLoginGate();
    return;
  }
  const path = route();
  const renderer = {
    "/": renderDashboard,
    "/colors": renderColors,
    "/inventory-alerts": renderAlerts,
    "/restocks": renderRestocks,
    "/patterns": renderPatterns,
    "/settings": renderSettings
  }[path] || renderDashboard;
  renderer();
}

function pageHead(title, desc, action = "") {
  return `<div class="page-head"><div><p class="eyebrow">MARD 221 · ${routeNames[route()] || "拼豆库存"}</p><h1>${title}</h1><p>${desc}</p></div><div class="toolbar">${action}</div></div>`;
}

function renderLoginGate() {
  $("#view").innerHTML = `
    <section class="login-panel panel">
      <p class="eyebrow">管理员入口</p>
      <h1>输入管理员密码</h1>
      <p>这是一个本地口令保护版本，先验证密码再进入库存系统。</p>
      <form id="loginForm" class="form-grid" style="margin-top:18px">
        <label class="field full">管理员密码 <small>默认密码是 admin123，进入后可在系统设置里修改</small><input name="password" type="password" required placeholder="请输入管理员密码"></label>
        <div class="field full"><button class="primary" type="submit">进入系统</button></div>
      </form>
    </section>
  `;
}

function renderDashboard() {
  const low = state.colors.filter((color) => color.stock <= color.threshold).length;
  const totalStock = state.colors.reduce((sum, color) => sum + color.stock, 0);
  const pending = state.patterns.filter((pattern) => pattern.status === "todo" || pattern.status === "doing").length;
  const deducted = state.patterns.filter((pattern) => pattern.stockDeducted).length;
  $("#view").innerHTML = `
    ${pageHead("首页", "保留轻量总览，只放判断今天要不要补货、要不要继续拼图纸的信息。", `<a class="soft-button" href="#/inventory-alerts">查看预警</a>`)}
    <div class="grid stats">
      ${stat("总色号", state.colors.length)}
      ${stat("总库存", fmt(totalStock))}
      ${stat("低库存", low)}
      ${stat("图纸数量", state.patterns.length)}
      ${stat("待拼图纸", pending)}
    </div>
    <div class="grid two-col" style="margin-top:18px">
      <section class="panel">
        <h2>最近补货记录</h2>
        <div class="list" style="margin-top:14px">
          ${state.restocks.slice(-5).reverse().map((item) => `<div class="list-item"><span><strong>${item.code}</strong> 增加 ${fmt(item.quantity)} 颗</span><span class="muted">${item.date}</span></div>`).join("") || empty("还没有补货记录")}
        </div>
      </section>
      <section class="panel">
        <h2>快捷入口</h2>
        <div class="grid three-col" style="margin-top:14px">
          <a class="card" href="#/colors"><h3>色库管理</h3><p>按系列整理 221 个色号。</p></a>
          <a class="card" href="#/restocks"><h3>补货记录</h3><p>新增、批量导入并联动库存。</p></a>
          <a class="card" href="#/patterns"><h3>图纸中心</h3><p>管理待拼、进行中和已完成。</p></a>
        </div>
      </section>
    </div>
    <div class="grid two-col" style="margin-top:18px">
      <section class="panel">
        <h2>近期图纸状态</h2>
        <div class="list" style="margin-top:14px">${state.patterns.map(patternListItem).join("")}</div>
      </section>
      <section class="panel">
        <h2>需要关注的色号</h2>
        <div class="list" style="margin-top:14px">${alerts().slice(0, 6).map((c) => `<div class="list-item"><span><span class="swatch" style="background:${c.hex}"></span><strong>${c.code}</strong> 库存 ${fmt(c.stock)}</span><span class="pill ${statusOf(c).cls}">${statusOf(c).label}</span></div>`).join("") || empty("暂时没有低库存色号")}</div>
      </section>
    </div>
  `;
}

function stat(label, value) {
  return `<div class="stat-card"><span>${label}</span><strong>${value}</strong></div>`;
}

function empty(text) {
  return `<div class="empty-state">${text}</div>`;
}

function renderColors() {
  const grouped = Object.keys(seriesCounts);
  $("#view").innerHTML = `
    ${pageHead("色库管理", "", "")}
    <div class="series-nav">${grouped.map((s) => `<button type="button" data-series-jump="${s}">${s} 系</button>`).join("")}</div>
    <div class="grid" style="margin-top:16px">
      ${grouped.map((series) => colorGroup(series)).join("")}
    </div>
  `;
  setSeriesNavActive("A");
}

function colorGroup(series) {
  const rows = state.colors.filter((color) => color.series === series);
  const midpoint = Math.ceil(rows.length / 2);
  const leftRows = rows.slice(0, midpoint);
  const rightRows = rows.slice(midpoint);
  return `<section class="panel" id="series-${series}">
    <div class="page-head" style="margin-bottom:12px"><div><h2>${series} 系</h2></div></div>
    <div class="series-table-grid">
      ${colorTable(leftRows)}
      ${rightRows.length ? colorTable(rightRows) : ""}
    </div>
  </section>`;
}

function colorRow(color) {
  const status = statusOf(color);
  return `<tr>
    <td><span class="swatch" style="background:${color.hex}"></span><strong>${color.code}</strong></td>
    <td><span class="cell-actions">${fmt(color.stock)}<button class="hover-action icon-only" aria-label="修改库存" title="修改库存" data-edit-stock="${color.code}">&#9998;</button></span></td>
    <td><span class="cell-actions">${fmt(color.threshold)}<button class="hover-action icon-only" aria-label="修改预警值" title="修改预警值" data-edit-threshold="${color.code}">&#9998;</button></span></td>
    <td><span class="pill ${status.cls}">${status.label}</span></td>
    <td><button class="hover-action danger" data-delete-color="${color.code}">删除</button></td>
  </tr>`;
}

function colorTable(rows) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>色号</th><th>总库存</th><th>预警值</th><th>状态</th><th>操作</th></tr></thead>
    <tbody>${rows.map(colorRow).join("")}</tbody>
  </table></div>`;
}

function setSeriesNavActive(series) {
  $$(".series-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.seriesJump === series);
  });
}

function renderAlerts(filter = "all") {
  const grouped = Object.keys(seriesCounts);
  $("#view").innerHTML = `
    ${pageHead("库存预警", "", "")}
    <div class="series-nav">${grouped.map((s) => `<button type="button" data-series-jump="${s}">${s} 系</button>`).join("")}</div>
    <div class="grid" style="margin-top:16px">
      ${grouped.map((series) => alertGroup(series)).join("")}
    </div>
  `;
  setSeriesNavActive("A");
}

function alertGroup(series) {
  const rows = alerts().filter((color) => color.series === series);
  if (!rows.length) return "";
  const midpoint = Math.ceil(rows.length / 2);
  return `<section class="panel" id="series-${series}">
    <div class="page-head" style="margin-bottom:12px"><div><h2>${series} 系</h2></div></div>
    <div class="series-table-grid">
      ${alertTable(rows.slice(0, midpoint))}
      ${rows.slice(midpoint).length ? alertTable(rows.slice(midpoint)) : ""}
    </div>
  </section>`;
}

function alertTable(rows) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>色号</th><th>当前库存</th><th>预警值</th><th>状态</th><th>缺口数量</th><th>建议补货</th><th>操作</th></tr></thead>
    <tbody>${rows.map(alertRow).join("")}</tbody>
  </table></div>`;
}

function alertRow(color) {
  const label = color.alertType === "shortage" ? "缺货" : "低库存";
  const cls = color.alertType === "shortage" ? "empty" : "low";
  return `<tr>
    <td><span class="swatch" style="background:${color.hex}"></span><strong>${color.code}</strong></td>
    <td>${fmt(color.stock)}</td>
    <td>${fmt(color.threshold)}</td>
    <td><span class="pill ${cls}">${label}</span></td>
    <td>${fmt(color.gap)}</td>
    <td>${fmt(color.suggested)}</td>
    <td><button class="soft-button" data-restock-code="${color.code}">加入补货</button></td>
  </tr>`;
}

function renderRestocks() {
  const alertRows = alerts().slice().sort((a, b) => {
    if (a.alertType === b.alertType) return a.code.localeCompare(b.code, "en");
    return a.alertType === "shortage" ? -1 : 1;
  });
  $("#view").innerHTML = `
    ${pageHead("补货记录", "", `<button class="primary" data-new-restock>新增补货</button>`)}
    <div class="grid two-col">
      <div class="grid" style="gap:18px">
        <section class="panel">
          <h2>批量导入</h2>
          <p>必填格式示例：A3 1000; B12 2000; M5 1000。备注为选填。</p>
          <form id="batchRestockForm" class="form-grid">
          <label class="field full">批量内容 <small>必填，色号 数量；多个用分号隔开，数量建议按 1000 填写</small><textarea name="batch" required placeholder="A3 1000; B12 2000; M5 1000"></textarea></label>
          <label class="field">补货日期 <small>必填</small><input name="date" type="date" required value="${today()}"></label>
          <label class="field">备注 <small>选填</small><input name="note" placeholder="例：周末统一补货"></label>
          <div class="field full"><button class="primary" type="submit">导入并增加库存</button></div>
          </form>
        </section>
        <section class="panel">
          <h2>补货记录表</h2>
          <div class="table-wrap compact-table" style="margin-top:14px"><table>
            <thead><tr><th>色号</th><th>补货数量</th><th>补货日期</th><th>备注</th><th>操作</th></tr></thead>
            <tbody>${renderRestockRows()}</tbody>
          </table></div>
        </section>
      </div>
      <div class="grid" style="gap:18px">
        <section class="panel">
          <h2>待补货简表</h2>
          <div class="table-wrap compact-table" style="margin-top:14px"><table>
            <thead><tr><th>色号</th><th>状态</th><th>缺口</th><th>建议补货</th></tr></thead>
            <tbody>${alertRows.map((item) => `<tr><td><span class="swatch" style="background:${item.hex}"></span><strong>${item.code}</strong></td><td><span class="pill ${item.alertType === "shortage" ? "empty" : "low"}">${item.alertType === "shortage" ? "缺货" : "低库存"}</span></td><td>${fmt(item.gap)}</td><td>${fmt(item.suggested)}</td></tr>`).join("") || `<tr><td colspan="4" class="muted">当前没有需要补货的色号</td></tr>`}</tbody>
          </table></div>
        </section>
      </div>
    </div>
  `;
}

function renderRestockRows() {
  const rows = state.restocks.slice().reverse();
  let lastBatch = null;
  return rows.map((item) => {
    const currentBatch = item.batchId || item.batchLabel || item.id;
    const divider = item.batchLabel && currentBatch !== lastBatch
      ? `<tr class="batch-divider"><td colspan="5">${item.batchLabel}</td></tr>`
      : "";
    lastBatch = item.batchLabel ? currentBatch : lastBatch;
    return `${divider}<tr><td><strong>${item.code}</strong></td><td>${fmt(item.quantity)}</td><td>${item.date}</td><td>${item.note || ""}</td><td><button class="ghost compact-action" data-edit-restock="${item.id}">编辑</button> <button class="danger-button compact-action" data-delete-restock="${item.id}">删除</button></td></tr>`;
  }).join("");
}

function renderPatterns(filter = "unfinished") {
  const patterns = state.patterns.filter((pattern) => filter === "completed" ? ["done", "done-deducted"].includes(pattern.status) : ["todo", "doing"].includes(pattern.status));
  $("#view").innerHTML = `
    ${pageHead("图纸中心", "", `<button class="primary" data-new-pattern>新增图纸</button>`)}
    <div class="tabs" data-pattern-tabs>
      ${["unfinished:未完成", "completed:已完成"].map((item) => {
        const [key, label] = item.split(":");
        return `<button class="${filter === key ? "active" : ""}" data-pattern-filter="${key}">${label}</button>`;
      }).join("")}
    </div>
    <div class="pattern-grid" style="margin-top:16px">
      ${patterns.map(patternCard).join("") || empty("还没有这个状态的图纸")}
    </div>
  `;
}

function patternCard(pattern) {
  const [label, cls] = patternStatusMeta(pattern.status, pattern.stockDeducted);
  const shortage = pattern.items.filter((item) => (colorByCode(item.code)?.stock || 0) < item.quantity).length;
  return `<article class="pattern-card">
    <div class="pattern-art">${renderPatternCover(pattern.cover)}</div>
    <h3>${pattern.name}</h3>
    <p>${pattern.items.reduce((sum, item) => sum + item.quantity, 0)} 颗 · ${pattern.items.length} 个色号</p>
    <div class="toolbar"><span class="pill ${cls}">${label}</span>${shortage ? `<span class="pill low">缺 ${shortage} 色</span>` : `<span class="pill ok">库存足够</span>`}</div>
    <div class="status-bar">
      ${[
        ["todo", "待拼"],
        ["doing", "进行中"],
        ["done", "完成不扣库存"],
        ["done-deducted", "完成并扣库存"]
      ].map(([value, text]) => `<button class="${pattern.status === value ? "active" : ""}" type="button" data-set-pattern-status="${pattern.id}|${value}">${text}</button>`).join("")}
    </div>
    <div class="toolbar"><button class="ghost" data-view-pattern="${pattern.id}">详情</button></div>
  </article>`;
}

function patternListItem(pattern) {
  const [label, cls] = patternStatusMeta(pattern.status, pattern.stockDeducted);
  return `<div class="list-item"><span><strong>${pattern.name}</strong><br><span class="muted">${pattern.items.length} 个色号</span></span><span class="pill ${cls}">${label}</span></div>`;
}

function renderSettings() {
  $("#view").innerHTML = `
    ${pageHead("系统设置", "", "")}
    <section class="panel">
      <form id="settingsForm" class="form-grid">
        <label class="field">默认色库 <small>必填，目前固定 MARD 221</small><input name="library" value="${state.settings.library}" required></label>
        <label class="field">默认预警值 <small>必填，保存后立即应用到全部色号</small><input name="defaultThreshold" type="number" min="0" value="${state.settings.defaultThreshold}" required></label>
        <label class="field">管理员密码 <small>必填，本地登录时使用</small><input name="adminPassword" type="password" value="${state.settings.adminPassword}" required></label>
        <label class="field full"><span><input name="allowNegativeStock" type="checkbox" ${state.settings.allowNegativeStock ? "checked" : ""}> 允许库存为负数</span><small>选填开关，默认关闭；关闭时扣库存会阻止低于 0。</small></label>
        <div class="field full"><button class="primary" type="submit">保存设置</button></div>
      </form>
    </section>
    <section class="panel" style="margin-top:18px">
      <h2>数据管理</h2>
      <p>这些操作会直接改动当前本地数据，执行前会再次确认。</p>
      <div class="toolbar">
        <button class="danger-button" type="button" data-admin-action="clear-stock">清空全部库存</button>
        <button class="danger-button" type="button" data-admin-action="clear-completed-patterns">清空全部已完成图纸</button>
        <button class="danger-button" type="button" data-admin-action="clear-unfinished-patterns">清空全部未完成图纸</button>
      </div>
    </section>
  `;
}

function openModal(title, body, onSubmit) {
  const modal = $("#modal");
  modal.innerHTML = `<form method="dialog" class="modal-body"><h2>${title}</h2>${body}<div class="modal-actions"><button class="ghost" value="cancel" type="button" data-close-modal>取消</button><button class="primary" value="default" type="submit">确认</button></div></form>`;
  const form = $("form", modal);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSubmit(new FormData(form));
    modal.close();
  });
  modal.showModal();
}

function openDecisionModal(title, body, actions) {
  const modal = $("#modal");
  modal.innerHTML = `<div class="modal-body"><h2>${title}</h2>${body}<div class="modal-actions">${actions.map((action) => `<button class="${action.className}" type="button" data-modal-action="${action.value}">${action.label}</button>`).join("")}</div></div>`;
  return new Promise((resolve) => {
    const handler = (event) => {
      const button = event.target.closest("[data-modal-action]");
      if (!button) return;
      modal.removeEventListener("click", handler);
      modal.close();
      resolve(button.dataset.modalAction);
    };
    modal.addEventListener("click", handler);
    modal.showModal();
  });
}

function restockForm(item = { code: "", quantity: "", date: today(), note: "" }) {
  return `<div class="form-grid" style="margin-top:14px">
    <label class="field">色号 <small>必填，例：A3</small><input name="code" required value="${item.code}" placeholder="A3"></label>
    <label class="field">补货数量 <small>必填，按 1000 为步进</small><input name="quantity" type="number" min="1000" step="1000" required value="${item.quantity}" placeholder="1000"></label>
    <label class="field">补货日期 <small>必填</small><input name="date" type="date" required value="${item.date}"></label>
    <label class="field">备注 <small>选填</small><input name="note" value="${item.note || ""}" placeholder="例：线下店补货"></label>
  </div>`;
}

function applyRestock(item, oldQuantity = 0) {
  const color = colorByCode(item.code);
  if (!color) throw new Error(`找不到色号 ${item.code}`);
  color.stock += Number(item.quantity) - Number(oldQuantity);
}

function parseBatch(text) {
  return text.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const [code, quantity] = part.split(/\s+/);
    if (!code || !quantity || !colorByCode(code) || Number(quantity) <= 0) throw new Error(`无法识别：${part}`);
    return { code: code.toUpperCase(), quantity: Number(quantity) };
  });
}

function findDuplicateBatchCodes(entries) {
  const counts = new Map();
  entries.forEach((entry) => {
    counts.set(entry.code, (counts.get(entry.code) || 0) + 1);
  });
  return Array.from(counts.entries()).filter(([, count]) => count > 1).map(([code]) => code);
}

function mergeBatchEntries(entries) {
  const merged = new Map();
  entries.forEach((entry) => {
    const current = merged.get(entry.code) || { code: entry.code, quantity: 0 };
    current.quantity += entry.quantity;
    merged.set(entry.code, current);
  });
  return Array.from(merged.values());
}

function createBatchLabel() {
  const stamp = new Date();
  const mm = String(stamp.getMonth() + 1).padStart(2, "0");
  const dd = String(stamp.getDate()).padStart(2, "0");
  const hh = String(stamp.getHours()).padStart(2, "0");
  const mi = String(stamp.getMinutes()).padStart(2, "0");
  return `批量 ${mm}-${dd} ${hh}:${mi}`;
}

function createBatchMeta() {
  return {
    batchId: crypto.randomUUID(),
    batchLabel: createBatchLabel()
  };
}

function patternForm() {
  return `<div class="form-grid" style="margin-top:14px">
    <label class="field">图纸名称 <small>必填</small><input name="name" required placeholder="例：草莓小兔"></label>
    <label class="field">状态 <small>必填</small><select name="status"><option value="todo">待拼</option><option value="doing">进行中</option><option value="done">仅完成不扣库存</option><option value="done-deducted">已拼并扣库存</option></select></label>
    <label class="field full">色号消耗 <small>必填，格式示例：A3 120; H19 80; B2 90</small><textarea name="items" required placeholder="A3 120; H19 80; B2 90"></textarea></label>
    <label class="field full upload-field">封面图片 <small>选填，不上传也可以</small><span class="upload-button">⌔ 上传封面图片<input name="cover" type="file" accept="image/*"></span></label>
    <label class="field full">备注 <small>选填</small><input name="note" placeholder="例：准备周末完成"></label>
  </div>`;
}

function renderPatternCover(cover) {
  if (cover) return `<img class="pattern-image" src="${cover}" alt="图纸封面">`;
  return `<div class="pattern-placeholder"></div>`;
}

async function uploadPatternCover(file) {
  if (!file || !file.size) return "";
  const client = getSupabaseClient();
  if (!client) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("图片读取失败"));
      reader.readAsDataURL(file);
    });
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${REMOTE_STATE_KEY}/${crypto.randomUUID()}.${ext}`;
  const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;
  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function setPatternStatus(pattern, nextStatus) {
  if (!pattern) return;
  if (nextStatus === "done-deducted") {
    deductPattern(pattern);
    return;
  }
  pattern.status = nextStatus;
  save();
  render();
  toast("图纸状态已更新");
}

function patternEditorBody(pattern) {
  return `<div class="pattern-detail-shell">
    <div class="dialog-topbar">
      <h2 class="dialog-title">${pattern.name}</h2>
      <button class="close-chip" type="button" data-close-modal aria-label="关闭">×</button>
    </div>
    <div class="grid pattern-detail-grid">
    <div class="pattern-art pattern-art-large">${renderPatternCover(pattern.cover)}</div>
    <form id="patternEditorForm" data-pattern-id="${pattern.id}" class="form-grid">
      <label class="field">图纸名称 <small>必填</small><input name="name" required value="${pattern.name}"></label>
      <label class="field">状态 <small>必填</small><select name="status">
        <option value="todo" ${pattern.status === "todo" ? "selected" : ""}>待拼</option>
        <option value="doing" ${pattern.status === "doing" ? "selected" : ""}>进行中</option>
        <option value="done" ${pattern.status === "done" ? "selected" : ""}>完成不扣库存</option>
        <option value="done-deducted" ${pattern.status === "done-deducted" ? "selected" : ""}>完成并扣库存</option>
      </select></label>
      <label class="field full upload-field">封面图片 <small>选填，不上传则保留当前图片</small><span class="upload-button">⌔ 更换封面图片<input name="cover" type="file" accept="image/*"></span></label>
      <div class="field full">
        <small>色号消耗明细，支持修改数量和删除某一行</small>
        <div class="pattern-item-editor">
          ${pattern.items.map((item, index) => `<div class="pattern-item-row">
            <input name="item_code_${index}" value="${item.code}" placeholder="A3">
            <input name="item_quantity_${index}" type="number" min="1" value="${item.quantity}" placeholder="120">
            <button class="danger-button compact-action" type="button" data-remove-pattern-row>删除</button>
          </div>`).join("")}
        </div>
        <button class="ghost compact-action" type="button" data-add-pattern-row>新增一行</button>
      </div>
      <label class="field full">备注 <small>选填</small><input name="note" value="${pattern.note || ""}"></label>
      <div class="field full" style="display:flex; justify-content:flex-end"><button class="primary" type="submit">保存修改</button></div>
    </form>
    </div>
  </div>`;
}

function collectPatternItems(form) {
  const rows = Array.from(form.querySelectorAll(".pattern-item-row"));
  if (!rows.length) throw new Error("至少保留一行色号消耗");
  const items = rows.map((row, index) => {
    const inputs = row.querySelectorAll("input");
    const code = String(inputs[0]?.value || "").trim().toUpperCase();
    const quantity = Number(inputs[1]?.value || 0);
    if (!code || !colorByCode(code) || quantity <= 0) throw new Error(`请检查第 ${index + 1} 行色号和数量`);
    return { code, quantity };
  });
  if (!items.length) throw new Error("至少保留一行色号消耗");
  return items;
}

function handleAdminAction(action) {
  const actions = {
    "clear-stock": {
      title: "清空全部库存",
      body: "<p>确认后，所有色号库存都会变成 0。</p>",
      run: () => {
        state.colors.forEach((color) => {
          color.stock = 0;
        });
      },
      toast: "已清空全部库存"
    },
    "clear-completed-patterns": {
      title: "清空全部已完成图纸",
      body: "<p>确认后，会删除所有完成不扣库存和完成并扣库存的图纸。</p>",
      run: () => {
        state.patterns = state.patterns.filter((pattern) => !["done", "done-deducted"].includes(pattern.status));
      },
      toast: "已清空全部已完成图纸"
    },
    "clear-unfinished-patterns": {
      title: "清空全部未完成图纸",
      body: "<p>确认后，会删除所有待拼和进行中的图纸。</p>",
      run: () => {
        state.patterns = state.patterns.filter((pattern) => !["todo", "doing"].includes(pattern.status));
      },
      toast: "已清空全部未完成图纸"
    }
  };
  const config = actions[action];
  if (!config) return;
  openModal(config.title, config.body, () => {
    config.run();
    save();
    render();
    toast(config.toast);
  });
}

function deductPattern(pattern) {
  if (pattern.stockDeducted) return toast("这张图纸已经扣过库存了");
  for (const item of pattern.items) {
    const color = colorByCode(item.code);
    if (!color) return toast(`找不到色号 ${item.code}`);
    if (!state.settings.allowNegativeStock && color.stock - item.quantity < 0) return toast(`${item.code} 库存不足，未扣库存`);
  }
  pattern.items.forEach((item) => {
    colorByCode(item.code).stock -= item.quantity;
  });
  pattern.status = "done-deducted";
  pattern.stockDeducted = true;
  save();
  render();
  toast("已完成并扣减库存");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;
  if (target.id === "menuToggle") $(".sidebar").classList.toggle("open");
  if (target.id === "logoutButton") {
    setAuthenticated(false);
    render();
  }
  if (target.dataset.closeModal !== undefined) $("#modal").close();
  if (target.dataset.seriesJump) {
    setSeriesNavActive(target.dataset.seriesJump);
    const section = document.getElementById(`series-${target.dataset.seriesJump}`);
    if (section) {
      const topOffset = window.innerWidth <= 980 ? 150 : 168;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY - topOffset;
      window.scrollTo({ top: Math.max(sectionTop, 0), behavior: "smooth" });
    }
  }
  if (target.dataset.editStock) {
    const color = colorByCode(target.dataset.editStock);
    openModal(`修改 ${color.code} 库存`, `<label class="field" style="margin-top:14px">总库存 <small>必填，当前 ${fmt(color.stock)}</small><input name="value" type="number" min="0" value="${color.stock}" required></label>`, (fd) => {
      color.stock = Number(fd.get("value")); save(); render(); toast("库存已更新");
    });
  }
  if (target.dataset.editThreshold) {
    const color = colorByCode(target.dataset.editThreshold);
    openModal(`修改 ${color.code} 预警值`, `<label class="field" style="margin-top:14px">预警值 <small>必填，默认 ${state.settings.defaultThreshold}</small><input name="value" type="number" min="0" value="${color.threshold}" required></label>`, (fd) => {
      color.threshold = Number(fd.get("value")); save(); render(); toast("预警值已更新");
    });
  }
  if (target.dataset.deleteColor) {
    const code = target.dataset.deleteColor;
    openModal(`删除 ${code}`, `<p>色号是基础数据，删除后会从当前色库隐藏。确定继续吗？</p>`, () => {
      state.colors = state.colors.filter((color) => color.code !== code); save(); render(); toast("色号已删除");
    });
  }
  if (target.dataset.restockCode || target.dataset.newRestock !== undefined) {
    const code = target.dataset.restockCode || "";
    openModal("新增补货", restockForm({ code, quantity: "", date: today(), note: "" }), (fd) => {
      const item = {
        id: crypto.randomUUID(),
        code: String(fd.get("code")).toUpperCase(),
        quantity: Number(fd.get("quantity")),
        date: fd.get("date"),
        note: fd.get("note"),
        ...createBatchMeta()
      };
      try { applyRestock(item); state.restocks.push(item); save(); render(); toast("补货已加入库存"); } catch (err) { toast(err.message); }
    });
  }
  if (target.dataset.editRestock) {
    const item = state.restocks.find((r) => r.id === target.dataset.editRestock);
    openModal("编辑补货", restockForm(item), (fd) => {
      const next = { ...item, code: String(fd.get("code")).toUpperCase(), quantity: Number(fd.get("quantity")), date: fd.get("date"), note: fd.get("note") };
      try { applyRestock(next, item.quantity); Object.assign(item, next); save(); render(); toast("补货记录已更新"); } catch (err) { toast(err.message); }
    });
  }
  if (target.dataset.deleteRestock) {
    const item = state.restocks.find((r) => r.id === target.dataset.deleteRestock);
    openModal("删除补货记录", `<p>删除后会从 ${item.code} 库存中减回 ${fmt(item.quantity)} 颗。</p>`, () => {
      const color = colorByCode(item.code);
      if (color) color.stock -= item.quantity;
      state.restocks = state.restocks.filter((r) => r.id !== item.id);
      save(); render(); toast("补货记录已删除");
    });
  }
  if (target.dataset.adminAction) handleAdminAction(target.dataset.adminAction);
  if (target.dataset.patternFilter) renderPatterns(target.dataset.patternFilter);
  if (target.dataset.newPattern !== undefined || target.id === "quickAddPattern") {
    openModal("新增图纸", patternForm(), (fd) => {
      (async () => {
        try {
          const items = parseBatch(fd.get("items"));
          const status = fd.get("status");
          const coverFile = $("#modal input[name='cover']")?.files?.[0];
          const cover = await uploadPatternCover(coverFile);
          const pattern = { id: crypto.randomUUID(), name: fd.get("name"), status, stockDeducted: false, note: fd.get("note"), cover, items };
          state.patterns.push(pattern);
          if (status === "done-deducted") deductPattern(pattern); else { save(); render(); toast("图纸已新增"); }
        } catch (err) { toast(err.message); }
      })();
    });
  }
  if (target.dataset.setPatternStatus) {
    const [patternId, nextStatus] = target.dataset.setPatternStatus.split("|");
    setPatternStatus(state.patterns.find((p) => p.id === patternId), nextStatus);
  }
  if (target.dataset.viewPattern) {
    const pattern = state.patterns.find((p) => p.id === target.dataset.viewPattern);
    $("#modal").innerHTML = `<div class="modal-body modal-body-scroll">${patternEditorBody(pattern)}</div>`;
    $("#modal").showModal();
  }
  if (target.dataset.addPatternRow !== undefined) {
    const editor = $("#patternEditorForm .pattern-item-editor");
    if (!editor) return;
    editor.insertAdjacentHTML("beforeend", `<div class="pattern-item-row">
      <input placeholder="A3">
      <input type="number" min="1" placeholder="120">
      <button class="danger-button compact-action" type="button" data-remove-pattern-row>删除</button>
    </div>`);
  }
  if (target.dataset.removePatternRow !== undefined) {
    target.closest(".pattern-item-row")?.remove();
  }
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "loginForm") {
    event.preventDefault();
    const fd = new FormData(event.target);
    if (String(fd.get("password")) === state.settings.adminPassword) {
      setAuthenticated(true);
      render();
      toast("已进入系统");
    } else {
      toast("管理员密码不正确");
    }
  }
  if (event.target.id === "batchRestockForm") {
    event.preventDefault();
    const fd = new FormData(event.target);
    try {
      let entries = parseBatch(fd.get("batch"));
      const duplicates = findDuplicateBatchCodes(entries);
      if (duplicates.length) {
        const choice = await openDecisionModal(
          "发现重复色号",
          `<p>这次批量导入里有重复色号：<strong>${duplicates.join("、")}</strong>。</p><p>你可以返回修改，或者让我先按色号合并数量再导入。</p>`,
          [
            { value: "cancel", label: "返回修改", className: "ghost" },
            { value: "merge", label: "合并后导入", className: "primary" }
          ]
        );
        if (choice !== "merge") return;
        entries = mergeBatchEntries(entries);
      }
      const batchMeta = createBatchMeta();
      entries.forEach((entry) => {
        const item = { id: crypto.randomUUID(), ...entry, date: fd.get("date"), note: fd.get("note"), ...batchMeta };
        applyRestock(item);
        state.restocks.push(item);
      });
      save(); render(); toast("批量补货已导入");
    } catch (err) { toast(err.message); }
  }
  if (event.target.id === "settingsForm") {
    event.preventDefault();
    const fd = new FormData(event.target);
    state.settings.library = fd.get("library");
    state.settings.defaultThreshold = Number(fd.get("defaultThreshold"));
    state.settings.adminPassword = String(fd.get("adminPassword"));
    state.settings.allowNegativeStock = fd.get("allowNegativeStock") === "on";
    state.colors.forEach((color) => {
      color.threshold = state.settings.defaultThreshold;
    });
    save(); render(); toast("设置已保存");
  }
  if (event.target.id === "patternEditorForm") {
    event.preventDefault();
    const form = event.target;
    const pattern = state.patterns.find((item) => item.id === form.dataset.patternId);
    try {
      const nextStatus = form.querySelector('select[name="status"]').value;
      pattern.name = form.querySelector('input[name="name"]').value.trim();
      pattern.note = form.querySelector('input[name="note"]').value.trim();
      pattern.items = collectPatternItems(form);
      const coverFile = form.querySelector('input[name="cover"]')?.files?.[0];
      const cover = await uploadPatternCover(coverFile);
      if (cover) pattern.cover = cover;
      $("#modal").close();
      if (nextStatus === "done-deducted" && pattern.status !== "done-deducted") {
        deductPattern(pattern);
      } else {
        pattern.status = nextStatus;
        save();
        render();
        toast("图纸已更新");
      }
    } catch (err) {
      toast(err.message);
    }
  }
});

document.addEventListener("scroll", () => {
  if (!["/colors", "/inventory-alerts"].includes(route())) return;
  const sections = Object.keys(seriesCounts)
    .map((series) => ({ series, node: document.getElementById(`series-${series}`) }))
    .filter((item) => item.node);
  const current = sections.findLast((item) => item.node.getBoundingClientRect().top <= 170) || sections[0];
  if (current) setSeriesNavActive(current.series);
}, { passive: true });

$("#globalSearch").addEventListener("input", (event) => {
  const q = event.target.value.trim().toUpperCase();
  if (!q) return;
  const color = colorByCode(q);
  const pattern = state.patterns.find((item) => item.name.includes(q) || item.note.includes(q));
  if (color) location.hash = `#/colors`;
  if (pattern) location.hash = "#/patterns";
});

window.addEventListener("hashchange", render);
render();
hydrateState();
