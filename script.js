const API_URL = "https://tibo-api-production.up.railway.app"; // or your deployed URL
let token = null;
// Switch between login and register
document.getElementById("show-register").addEventListener("click", () => {
  document.querySelector(".auth-container").style.display = "none";
  document.querySelector(".register-container").style.display = "block";
});

document.getElementById("show-login").addEventListener("click", () => {
  document.querySelector(".register-container").style.display = "none";
  document.querySelector(".auth-container").style.display = "block";
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Berhasil daftar! Silakan login.");
      document.querySelector(".register-container").style.display = "none";
      document.querySelector(".auth-container").style.display = "block";
    } else {
      alert(data.error || "Gagal daftar");
    }
  } catch (err) {
    alert("Gagal konek ke server");
  }
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      token = data.token;
      document.querySelector(".auth-container").style.display = "none";
      document.querySelector(".chat-container").style.display = "flex";
      document.querySelector(".profile-container").style.display = "block";
      getProfile();
    } else {
      alert(data.error || "Login gagal");
    }
  } catch (err) {
    alert("Gagal konek ke server");
  }
});

document.getElementById("download-progress-btn").addEventListener("click", async () => {
  if (!token) {
    alert("Kamu harus login dulu untuk mengunduh progres.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/export-learned`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tibo-learned.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert(data.error || "Gagal mengekspor data");
    }
  } catch (err) {
    alert("Terjadi kesalahan saat mengunduh data.");
  }
});


document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("chat-input").value;
  if (!input.trim()) return;

  addMessage("user", input);
  document.getElementById("chat-input").value = "";

  const log = document.getElementById("chat-log");
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot typing-indicator";
  typingDiv.innerText = "Tibo sedang mengetik...";
  log.appendChild(typingDiv);
  log.scrollTop = log.scrollHeight;

  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message: input })
  });

  const data = await res.json();

  setTimeout(() => {
    log.removeChild(typingDiv);
    addMessage("bot", data.response);
  }, 600);
});


function addMessage(role, text) {
  const log = document.getElementById("chat-log");
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "message-content";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  log.appendChild(wrapper);
  log.scrollTop = log.scrollHeight;
}


document.getElementById("logout-btn").addEventListener("click", () => {
  token = null;
  document.querySelector(".auth-container").style.display = "block";
  document.querySelector(".chat-container").style.display = "none";
  document.querySelector(".profile-container").style.display = "none";
  document.getElementById("chat-log").innerHTML = "";
});

async function getProfile() {
  try {
    const res = await fetch(`${API_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    document.getElementById("welcome-text").textContent = `Hi, ${data.user.name}!`;
  } catch (err) {
    console.warn("Profile gagal dimuat");
  }
}
