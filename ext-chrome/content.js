(() => {
  if (document.getElementById("fc-root")) return;

  const STORAGE_KEY = "chatEverywhere_v4";

  const loadData = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  };

  const stored = loadData();

  const state = {
    open: false,
    tab: "chat",
    messages: stored.messages || [],
    groups: stored.groups || [
      { name: "BSIT-3", members: 12, icon: "🎓" },
      { name: "Capstone Group", members: 6, icon: "👥" },
      { name: "Project Team", members: 5, icon: "💻" },
      { name: "Friends", members: 8, icon: "❤️" },
      { name: "Family", members: 4, icon: "🏠" }
    ],
    notes: stored.notes || "",
    todos: stored.todos || [],
    mediaFilter: "All",
    pendingFiles: [],
    shareText: "",
    tool: "Calculator"
  };

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages: state.messages,
        groups: state.groups,
        notes: state.notes,
        todos: state.todos
      }));
    } catch (error) {
      console.warn("Chat Everywhere could not save data.", error);
    }
  };

  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  const root = document.createElement("div");
  root.id = "fc-root";

  root.innerHTML = `
    <button id="fc-fab" title="Open Chat Everywhere" aria-label="Open chat">✦</button>

    <section id="fc-dashboard" hidden>
      <header class="fc-header">
        <div class="fc-logo">☁</div>
        <div class="fc-brand">
          <strong>Chat Everywhere</strong>
          <small>Your quick workspace</small>
        </div>
        <div class="fc-header-actions">
          <button id="fc-min" title="Minimize">−</button>
          <button id="fc-max" title="Resize">⛶</button>
          <button id="fc-close" title="Close">×</button>
        </div>
      </header>

      <nav class="fc-top-tabs">
        <button class="fc-tab active" data-tab="chat">
          <span class="fc-tab-icon">▤</span><span>Chat</span>
        </button>
        <button class="fc-tab" data-tab="media">
          <span class="fc-tab-icon">▧</span><span>Media</span>
        </button>
        <button class="fc-tab" data-tab="groups">
          <span class="fc-tab-icon">♧</span><span>Groups</span>
        </button>
        <button class="fc-tab" data-tab="shares">
          <span class="fc-tab-icon">↗</span><span>Shares</span>
        </button>
        <button class="fc-tab" data-tab="tools">
          <span class="fc-tab-icon">⌘</span><span>Tools</span>
        </button>
      </nav>

      <main class="fc-tab-content">
        <section class="fc-tab-page active" id="fc-page-chat">
          <div class="fc-page-heading">
            <h2>Chat</h2>
            <p>Your conversation, right here.</p>
          </div>
          <div class="fc-chat-body">
            <div class="fc-day">Today</div>
            <div id="fc-messages" class="fc-messages"></div>
          </div>
          <div id="fc-pending" class="fc-pending"></div>
          <div class="fc-composer">
            <input id="fc-file-input" type="file" multiple hidden
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.xlsx,.pptx">
            <button id="fc-attach" class="fc-round" title="Attach files">+</button>
            <input id="fc-message-input" placeholder="Type a message..." autocomplete="off">
            <button id="fc-emoji" class="fc-emoji" title="Add emoji">☺</button>
            <button id="fc-send" class="fc-send" title="Send message">➤</button>
          </div>
          <div id="fc-dropzone" class="fc-dropzone">
            <span class="fc-cloud">☁</span>
            <b>Drag & drop images, videos, or files here</b>
            <small>or click to choose files</small>
          </div>
        </section>

        <section class="fc-tab-page" id="fc-page-media" hidden>
          <div class="fc-page-heading">
            <h2>Media Library</h2>
            <p>Your images, videos, and shared files.</p>
          </div>
          <div class="fc-mini-tabs" id="fc-media-filters">
            <button class="active" data-filter="All">All</button>
            <button data-filter="Images">Images</button>
            <button data-filter="Videos">Videos</button>
            <button data-filter="Files">Files</button>
          </div>
          <div id="fc-media-grid" class="fc-media-grid"></div>
          <button id="fc-upload" class="fc-primary fc-wide">↑ Upload Files</button>
        </section>

        <section class="fc-tab-page" id="fc-page-groups" hidden>
          <div class="fc-page-heading">
            <h2>Groups</h2>
            <p>Organize your groups in one place.</p>
          </div>
          <div class="fc-group-actions">
            <input id="fc-group-search" placeholder="Search groups...">
            <button id="fc-create-group" class="fc-primary">+ Create Group</button>
          </div>
          <div id="fc-groups" class="fc-groups"></div>
        </section>

        <section class="fc-tab-page" id="fc-page-shares" hidden>
          <div class="fc-page-heading">
            <h2>Shares</h2>
            <p>Share text or links using your browser.</p>
          </div>
          <div class="fc-card">
            <label for="fc-share-text">Share Text or Link</label>
            <textarea id="fc-share-text" maxlength="500"
              placeholder="Write or paste something to share..."></textarea>
            <div class="fc-char-count"><span id="fc-share-count">0</span>/500</div>
            <div class="fc-share-actions">
              <button id="fc-copy" class="fc-secondary">▢ Copy Text</button>
              <button id="fc-native-share" class="fc-secondary">↗ Share</button>
              <button id="fc-send-chat" class="fc-primary">➤ Send to Chat</button>
            </div>
            <div id="fc-share-status" class="fc-status"></div>
          </div>
          <div class="fc-card">
            <h3>Share a File</h3>
            <p>Choose a file or drag it into the area below.</p>
            <div id="fc-share-drop" class="fc-dropzone">
              <span class="fc-cloud">☁</span>
              <b>Choose or drop a file</b>
              <small>Images, videos, documents, and more</small>
              <button id="fc-share-file" class="fc-primary">Choose File</button>
            </div>
          </div>
        </section>

        <section class="fc-tab-page" id="fc-page-tools" hidden>
          <div class="fc-page-heading">
            <h2>Quick Tools</h2>
            <p>Five useful tools, right in your chat.</p>
          </div>
          <div class="fc-tool-grid">
            <button class="fc-tool-card violet selected" data-tool="Calculator">
              <span>▦</span><b>Calculator</b><small>Basic calculator</small>
            </button>
            <button class="fc-tool-card pink" data-tool="Notes">
              <span>▤</span><b>Notes</b><small>Write your notes</small>
            </button>
            <button class="fc-tool-card mint" data-tool="To-do List">
              <span>☑</span><b>To-do List</b><small>Manage your tasks</small>
            </button>
            <button class="fc-tool-card blue" data-tool="Word Counter">
              <span>▣</span><b>Word Counter</b><small>Count words and characters</small>
            </button>
            <button class="fc-tool-card orange" data-tool="Text Case">
              <span>Aa</span><b>Text Case Converter</b><small>UPPERCASE, lowercase, Title Case</small>
            </button>
          </div>
          <div id="fc-tool-detail" class="fc-tool-detail"></div>
        </section>
      </main>
    </section>
  `;

  document.documentElement.appendChild(root);

  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const dashboard = $("#fc-dashboard");
  const fileInput = $("#fc-file-input");
  const messagesEl = $("#fc-messages");

  // Object URLs are temporary previews for the current page session.
  const objectURLs = [];

  function makeFileRecord(file) {
    const url = URL.createObjectURL(file);
    objectURLs.push(url);
    return {
      name: file.name,
      type: file.type || "",
      size: file.size || 0,
      url
    };
  }

  function timeNow() {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function showDashboard(show) {
    state.open = show;
    dashboard.hidden = !show;
    $("#fc-fab").classList.toggle("active", show);
    if (show) renderCurrentPage();
  }

  $("#fc-fab").addEventListener("click", () => showDashboard(!state.open));
  $("#fc-close").addEventListener("click", () => showDashboard(false));
  $("#fc-min").addEventListener("click", () => showDashboard(false));
  $("#fc-max").addEventListener("click", () => dashboard.classList.toggle("fc-expanded"));

  function switchTab(tab) {
    state.tab = tab;

    $$(".fc-tab").forEach(button => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });

    $$(".fc-tab-page").forEach(page => {
      const active = page.id === `fc-page-${tab}`;
      page.hidden = !active;
      page.classList.toggle("active", active);
    });

    renderCurrentPage();
  }

  $$(".fc-tab").forEach(button => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  function renderCurrentPage() {
    if (state.tab === "chat") {
      renderChat();
      renderPending();
    }
    if (state.tab === "media") renderMedia();
    if (state.tab === "groups") renderGroups();
    if (state.tab === "tools") renderTool();
  }

  // CHAT
  function renderChat() {
    messagesEl.innerHTML = `
      <div class="fc-incoming">
        <div class="fc-avatar">✦</div>
        <div class="fc-bubble">Hi! 👋<br>How can I help you today?</div>
      </div>
      ${state.messages.map(message => `
        <article class="fc-outgoing">
          ${message.text ? `<div class="fc-bubble">${esc(message.text)}</div>` : ""}
          ${(message.files || []).map(file => {
            if (file.type.startsWith("image/")) {
              return `<div class="fc-attachment"><img src="${file.url}" alt="${esc(file.name)}"><small>${esc(file.name)}</small></div>`;
            }
            if (file.type.startsWith("video/")) {
              return `<div class="fc-attachment"><video controls src="${file.url}"></video><small>${esc(file.name)}</small></div>`;
            }
            return `<a class="fc-file-card" href="${file.url}" download="${esc(file.name)}">
              <span class="fc-file-icon">📄</span>
              <span><b>${esc(file.name)}</b><small>${(file.size / 1024).toFixed(1)} KB · Download</small></span>
            </a>`;
          }).join("")}
          <small class="fc-time">${esc(message.time)} ✓✓</small>
        </article>
      `).join("")}
    `;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderPending() {
    $("#fc-pending").innerHTML = state.pendingFiles.map((file, index) => `
      <div class="fc-pending-item">
        <span>${esc(file.name)}</span>
        <button type="button" data-remove-file="${index}" aria-label="Remove file">×</button>
      </div>
    `).join("");

    $$("[data-remove-file]").forEach(button => {
      button.addEventListener("click", () => {
        state.pendingFiles.splice(Number(button.dataset.removeFile), 1);
        renderPending();
      });
    });
  }

  function sendMessage() {
    const input = $("#fc-message-input");
    const text = input.value.trim();

    if (!text && state.pendingFiles.length === 0) return;

    state.messages.push({
      text,
      files: state.pendingFiles.map(makeFileRecord),
      time: timeNow()
    });

    state.pendingFiles = [];
    input.value = "";
    save();
    renderChat();
    renderPending();
  }

  function addPendingFiles(files) {
    state.pendingFiles.push(...Array.from(files || []));
    renderPending();
  }

  $("#fc-send").addEventListener("click", sendMessage);
  $("#fc-message-input").addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  $("#fc-attach").addEventListener("click", () => fileInput.click());
  $("#fc-emoji").addEventListener("click", () => {
    const input = $("#fc-message-input");
    input.value += " 😊";
    input.focus();
  });

  fileInput.addEventListener("change", event => {
    addPendingFiles(event.target.files);
    fileInput.value = "";
  });

  // Drag-and-drop works inside the Chat conversation.
  const dropzone = $("#fc-dropzone");
  [dropzone, messagesEl].forEach(element => {
    element.addEventListener("dragover", event => {
      event.preventDefault();
      dropzone.classList.add("dragging");
    });

    element.addEventListener("dragleave", event => {
      if (!element.contains(event.relatedTarget)) {
        dropzone.classList.remove("dragging");
      }
    });

    element.addEventListener("drop", event => {
      event.preventDefault();
      dropzone.classList.remove("dragging");
      addPendingFiles(event.dataTransfer.files);
      switchTab("chat");
    });
  });

  dropzone.addEventListener("click", () => fileInput.click());

  // MEDIA
  function allMedia() {
    return state.messages.flatMap(message => message.files || []);
  }

  function renderMedia() {
    const filtered = allMedia().filter(file => {
      if (state.mediaFilter === "Images") return file.type.startsWith("image/");
      if (state.mediaFilter === "Videos") return file.type.startsWith("video/");
      if (state.mediaFilter === "Files") {
        return !file.type.startsWith("image/") && !file.type.startsWith("video/");
      }
      return true;
    });

    $("#fc-media-grid").innerHTML = filtered.length
      ? filtered.map(file => {
          if (file.type.startsWith("image/")) {
            return `<a class="fc-media-item" href="${file.url}" target="_blank" rel="noopener">
              <img src="${file.url}" alt="${esc(file.name)}">
              <small>${esc(file.name)}</small>
            </a>`;
          }
          if (file.type.startsWith("video/")) {
            return `<div class="fc-media-item">
              <video controls src="${file.url}"></video>
              <small>${esc(file.name)}</small>
            </div>`;
          }
          return `<a class="fc-media-file" href="${file.url}" download="${esc(file.name)}">
            📄 <span>${esc(file.name)}</span><small>${(file.size / 1024).toFixed(1)} KB</small>
          </a>`;
        }).join("")
      : `<div class="fc-empty">No media yet. Upload or send a file in Chat to see it here.</div>`;
  }

  $("#fc-media-filters").querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      state.mediaFilter = button.dataset.filter;
      $("#fc-media-filters").querySelectorAll("button").forEach(item => {
        item.classList.toggle("active", item === button);
      });
      renderMedia();
    });
  });

  $("#fc-upload").addEventListener("click", () => fileInput.click());

  // GROUPS
  function renderGroups() {
    const search = $("#fc-group-search").value.trim().toLowerCase();
    const groups = state.groups.filter(group => group.name.toLowerCase().includes(search));

    $("#fc-groups").innerHTML = groups.length
      ? groups.map(group => `
          <div class="fc-group-row">
            <span class="fc-group-icon">${esc(group.icon || "👥")}</span>
            <span class="fc-group-info">
              <b>${esc(group.name)}</b>
              <small>${Number(group.members) || 1} members</small>
            </span>
            <span class="fc-group-dot"></span>
          </div>
        `).join("")
      : `<div class="fc-empty">No groups found.</div>`;
  }

  $("#fc-group-search").addEventListener("input", renderGroups);

  $("#fc-create-group").addEventListener("click", () => {
    const name = prompt("Enter a name for your new group:");
    if (!name || !name.trim()) return;

    state.groups.push({
      name: name.trim(),
      members: 1,
      icon: "👥"
    });

    save();
    renderGroups();
  });

  // SHARES
  $("#fc-share-text").addEventListener("input", event => {
    state.shareText = event.target.value;
    $("#fc-share-count").textContent = event.target.value.length;
  });

  function shareStatus(message) {
    $("#fc-share-status").textContent = message;
  }

  $("#fc-copy").addEventListener("click", async () => {
    if (!state.shareText.trim()) return shareStatus("Enter text or a link first.");

    try {
      await navigator.clipboard.writeText(state.shareText);
      shareStatus("Copied to clipboard!");
    } catch {
      $("#fc-share-text").select();
      shareStatus("Press Ctrl+C to copy the selected text.");
    }
  });

  $("#fc-native-share").addEventListener("click", async () => {
    if (!state.shareText.trim()) return shareStatus("Enter text or a link first.");

    if (navigator.share) {
      try {
        await navigator.share({ text: state.shareText });
        shareStatus("Share dialog opened.");
      } catch (error) {
        if (error.name !== "AbortError") shareStatus("Sharing was not completed.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(state.shareText);
        shareStatus("Browser sharing is unavailable here; text copied instead.");
      } catch {
        shareStatus("Your browser does not support sharing this content.");
      }
    }
  });

  $("#fc-send-chat").addEventListener("click", () => {
    if (!state.shareText.trim()) return shareStatus("Enter text or a link first.");

    state.messages.push({
      text: state.shareText.trim(),
      files: [],
      time: timeNow()
    });

    state.shareText = "";
    $("#fc-share-text").value = "";
    $("#fc-share-count").textContent = "0";

    save();
    shareStatus("Message added to Chat.");
  });

  $("#fc-share-file").addEventListener("click", () => fileInput.click());

  const shareDrop = $("#fc-share-drop");
  shareDrop.addEventListener("click", event => {
    if (event.target.closest("button")) fileInput.click();
    else fileInput.click();
  });

  shareDrop.addEventListener("dragover", event => {
    event.preventDefault();
    shareDrop.classList.add("dragging");
  });

  shareDrop.addEventListener("dragleave", () => shareDrop.classList.remove("dragging"));

  shareDrop.addEventListener("drop", event => {
    event.preventDefault();
    shareDrop.classList.remove("dragging");
    addPendingFiles(event.dataTransfer.files);
    switchTab("chat");
  });

  // TOOLS
  function calculate(expression) {
    const source = expression.replace(/\s+/g, "");
    if (!source || source.length > 100) throw Error("Invalid expression");

    const tokens = source.match(/\d*\.?\d+|[()+\-*/%]/g);
    if (!tokens || tokens.join("") !== source) throw Error("Invalid expression");

    let pos = 0;

    function parseExpression() {
      let value = parseTerm();
      while (tokens[pos] === "+" || tokens[pos] === "-") {
        const operator = tokens[pos++];
        const rhs = parseTerm();
        value = operator === "+" ? value + rhs : value - rhs;
      }
      return value;
    }

    function parseTerm() {
      let value = parseFactor();
      while (["*", "/", "%"].includes(tokens[pos])) {
        const operator = tokens[pos++];
        const rhs = parseFactor();
        if ((operator === "/" || operator === "%") && rhs === 0) {
          throw Error("Cannot divide by zero");
        }
        if (operator === "*") value *= rhs;
        if (operator === "/") value /= rhs;
        if (operator === "%") value %= rhs;
      }
      return value;
    }

    function parseFactor() {
      const token = tokens[pos];

      if (token === "+" || token === "-") {
        pos++;
        const value = parseFactor();
        return token === "-" ? -value : value;
      }

      if (token === "(") {
        pos++;
        const value = parseExpression();
        if (tokens[pos++] !== ")") throw Error("Missing closing parenthesis");
        return value;
      }

      if (!token || !/^\d*\.?\d+$/.test(token)) throw Error("Invalid expression");

      pos++;
      return Number(token);
    }

    const result = parseExpression();
    if (pos !== tokens.length || !Number.isFinite(result)) {
      throw Error("Invalid expression");
    }
    return result;
  }

  function renderTool() {
    const detail = $("#fc-tool-detail");

    if (state.tool === "Calculator") {
      detail.innerHTML = `
        <h3>Calculator</h3>
        <p>Use numbers and basic operators: +, −, ×, ÷, %, and parentheses.</p>
        <form id="fc-calc-form">
          <input id="fc-calc-input" placeholder="Example: (12 + 8) / 2" autocomplete="off">
          <button class="fc-primary" type="submit">Calculate</button>
        </form>
        <div id="fc-calc-result" class="fc-result"></div>
      `;

      $("#fc-calc-form").addEventListener("submit", event => {
        event.preventDefault();
        try {
          $("#fc-calc-result").textContent = String(calculate($("#fc-calc-input").value));
        } catch {
          $("#fc-calc-result").textContent = "Please enter a valid arithmetic expression.";
        }
      });
    }

    if (state.tool === "Notes") {
      detail.innerHTML = `
        <h3>Notes</h3>
        <textarea id="fc-notes-input" placeholder="Write your notes here...">${esc(state.notes)}</textarea>
        <small>Your notes are saved in this browser.</small>
      `;

      $("#fc-notes-input").addEventListener("input", event => {
        state.notes = event.target.value;
        save();
      });
    }

    if (state.tool === "To-do List") {
      detail.innerHTML = `
        <h3>To-do List</h3>
        <form id="fc-todo-form">
          <input id="fc-todo-input" placeholder="Add a task..." required>
          <button class="fc-primary" type="submit">+ Add Task</button>
        </form>
        <div id="fc-todo-items">
          ${state.todos.map((todo, index) => `
            <label class="fc-todo-row">
              <input type="checkbox" data-check="${index}" ${todo.done ? "checked" : ""}>
              <span class="${todo.done ? "done" : ""}">${esc(todo.text)}</span>
              <button type="button" data-delete="${index}" aria-label="Delete task">×</button>
            </label>
          `).join("")}
        </div>
      `;

      $("#fc-todo-form").addEventListener("submit", event => {
        event.preventDefault();
        const text = $("#fc-todo-input").value.trim();
        if (!text) return;
        state.todos.push({ text, done: false });
        save();
        renderTool();
      });

      $$("[data-check]").forEach(input => {
        input.addEventListener("change", () => {
          state.todos[Number(input.dataset.check)].done = input.checked;
          save();
          renderTool();
        });
      });

      $$("[data-delete]").forEach(button => {
        button.addEventListener("click", () => {
          state.todos.splice(Number(button.dataset.delete), 1);
          save();
          renderTool();
        });
      });
    }

    if (state.tool === "Word Counter") {
      detail.innerHTML = `
        <h3>Word Counter</h3>
        <textarea id="fc-word-input" placeholder="Type or paste your text here..."></textarea>
        <div id="fc-word-result" class="fc-result">0 words · 0 characters</div>
      `;

      $("#fc-word-input").addEventListener("input", event => {
        const value = event.target.value;
        const trimmed = value.trim();
        const words = trimmed ? trimmed.split(/\s+/).length : 0;
        $("#fc-word-result").textContent = `${words} words · ${value.length} characters`;
      });
    }

    if (state.tool === "Text Case") {
      detail.innerHTML = `
        <h3>Text Case Converter</h3>
        <textarea id="fc-case-input" placeholder="Enter your text..."></textarea>
        <div class="fc-case-actions">
          <button data-case="upper">UPPERCASE</button>
          <button data-case="lower">lowercase</button>
          <button data-case="title">Title Case</button>
        </div>
        <textarea id="fc-case-output" placeholder="Converted text appears here..." readonly></textarea>
        <button id="fc-case-copy" class="fc-secondary">Copy Result</button>
      `;

      $$("[data-case]").forEach(button => {
        button.addEventListener("click", () => {
          const text = $("#fc-case-input").value;
          const mode = button.dataset.case;

          $("#fc-case-output").value =
            mode === "upper" ? text.toUpperCase()
            : mode === "lower" ? text.toLowerCase()
            : text.toLowerCase().replace(/\b\p{L}/gu, letter => letter.toUpperCase());
        });
      });

      $("#fc-case-copy").addEventListener("click", async () => {
        const output = $("#fc-case-output");
        try {
          await navigator.clipboard.writeText(output.value);
        } catch {
          output.focus();
          output.select();
          document.execCommand("copy");
        }
      });
    }
  }

  $$(".fc-tool-card").forEach(button => {
    button.addEventListener("click", () => {
      state.tool = button.dataset.tool;
      $$(".fc-tool-card").forEach(card => {
        card.classList.toggle("selected", card === button);
      });
      renderTool();
    });
  });

  renderChat();
  renderPending();
  renderMedia();
  renderGroups();
  renderTool();
})();