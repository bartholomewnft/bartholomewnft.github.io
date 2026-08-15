// ============================================================
// GANTI URL DI BAWAH INI DENGAN URL WEB APP DARI GOOGLE APPS SCRIPT
// (didapat setelah Deploy > New deployment > Web app)
// ============================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzwmJgdmqGhoB2HkJxdpzAUn_phTh3ed7hWJxRZQvOQyGVMM9t2d6rtMMHflxrbOTnL/exec";

// ---- state ----
// state disimpan di localStorage supaya tidak hilang kalau user reload halaman
const STORAGE_KEY = "clearance-tasks-v1";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      task1: false,
      task2: false,
      task3: false,
      commentLink: "",
    };
  } catch {
    return { task1: false, task2: false, task3: false, commentLink: "" };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// ---- DOM refs ----
const taskEls = {
  1: document.getElementById("task-1"),
  2: document.getElementById("task-2"),
  3: document.getElementById("task-3"),
};
const badgeEls = {
  1: document.getElementById("badge-1"),
  2: document.getElementById("badge-2"),
  3: document.getElementById("badge-3"),
};
const confirmBtns = document.querySelectorAll(".confirm-btn");
const commentLinkInput = document.getElementById("comment-link");
const idForm = document.getElementById("wl-form");
const submitBtn = document.getElementById("submit-btn");
const handleInput = document.getElementById("handle");
const walletInput = document.getElementById("wallet");
const statusEl = document.getElementById("form-status");

// ---- render ----
function render() {
  // Task 1
  setTaskUI(1, state.task1, true);

  // Task 2 unlocked only if task1 done
  setTaskUI(2, state.task2, state.task1);

  // Task 3 unlocked only if task2 done
  setTaskUI(3, state.task3, state.task2);
  commentLinkInput.disabled = !state.task2;
  commentLinkInput.value = state.commentLink;

  // Task 3's confirm button also requires a non-empty comment link
  const confirmBtn3 = document.querySelector('.confirm-btn[data-task="3"]');
  confirmBtn3.disabled = !state.task2 || state.commentLink.trim() === "";

  // Section 02 unlocks only if all 3 tasks done
  const allDone = state.task1 && state.task2 && state.task3;
  idForm.dataset.locked = allDone ? "false" : "true";
  handleInput.disabled = !allDone;
  walletInput.disabled = !allDone;
  submitBtn.disabled = !allDone;
  submitBtn.innerHTML = allDone
    ? "Submit Filing"
    : 'Complete All Tasks First <span class="ext">↗</span>';
}

function setTaskUI(n, done, unlocked) {
  const el = taskEls[n];
  const badge = badgeEls[n];
  const btn = document.querySelector(`.confirm-btn[data-task="${n}"]`);

  if (done) {
    el.dataset.state = "done";
    badge.textContent = "VERIFIED";
    badge.classList.add("verified");
    btn.classList.add("checked");
  } else if (unlocked) {
    el.dataset.state = "active";
    badge.textContent = "LOCKED";
    badge.classList.remove("verified");
    btn.classList.remove("checked");
  } else {
    el.dataset.state = "locked";
    badge.textContent = "LOCKED";
    badge.classList.remove("verified");
    btn.classList.remove("checked");
  }

  if (n !== 3) {
    btn.disabled = !unlocked;
  }
}

// ---- events ----
confirmBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const n = btn.dataset.task;
    const key = `task${n}`;
    state[key] = !state[key];
    saveState(state);
    render();
  });
});

commentLinkInput.addEventListener("input", (e) => {
  state.commentLink = e.target.value;
  // kalau link dikosongkan lagi setelah verified, batalkan verifikasi task 3
  if (state.commentLink.trim() === "") {
    state.task3 = false;
  }
  saveState(state);
  render();
});

idForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (idForm.dataset.locked === "true") return;

  statusEl.textContent = "";
  statusEl.className = "form-status";
  submitBtn.disabled = true;
  const originalLabel = submitBtn.textContent;
  submitBtn.textContent = "Submitting...";

  const formData = new FormData();
  formData.append("handle", handleInput.value);
  formData.append("wallet", walletInput.value);
  formData.append("commentLink", state.commentLink);
  formData.append("task1_followed", state.task1 ? "yes" : "no");
  formData.append("task2_likeRT", state.task2 ? "yes" : "no");
  formData.append("task3_comment", state.task3 ? "yes" : "no");

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result.result === "success") {
      statusEl.textContent = "Filing submitted. The Orchard will review manually.";
      statusEl.classList.add("success");
      idForm.reset();
      localStorage.removeItem(STORAGE_KEY);
      state = loadState();
      render();
      submitBtn.textContent = "Filed ✓";
      return;
    } else {
      throw new Error(result.error || "Gagal mengirim data");
    }
  } catch (err) {
    statusEl.textContent = "Terjadi kesalahan. Silakan coba lagi.";
    statusEl.classList.add("error");
    console.error(err);
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});

// ---- init ----
render();
