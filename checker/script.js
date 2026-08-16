// ============================================================
// checker/script.js
// Reads checker/eligible.json (a plain array of wallet addresses)
// and tells the visitor whether their wallet is inscribed.
//
// To add / remove wallets: edit eligible.json only. This file
// never needs to change for a routine whitelist update.
// ============================================================

const DATA_URL = "eligible.json";

const walletInput = document.getElementById("wallet-check");
const checkBtn = document.getElementById("check-btn");
const resultEl = document.getElementById("check-result");
const hintEl = document.getElementById("check-hint");
const countEl = document.getElementById("ledger-count");

let ledger = null; // Set of lowercase wallet addresses, once loaded
let loadFailed = false;

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const ENS_RE = /^[a-z0-9-]+\.eth$/i;

function normalise(raw) {
  return raw.trim().toLowerCase();
}

function looksValid(value) {
  return ADDRESS_RE.test(value) || ENS_RE.test(value);
}

async function loadLedger() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Bad response");
    const list = await res.json();
    ledger = new Set(list.map((w) => String(w).trim().toLowerCase()));
    if (countEl) countEl.textContent = ledger.size.toLocaleString("en-US");
  } catch (err) {
    loadFailed = true;
    if (countEl) countEl.textContent = "unknown";
    console.error("Could not load eligible.json", err);
  }
}

function showResult(state, { title, copy, echo }) {
  resultEl.hidden = false;
  resultEl.className = "check-result is-" + state;

  const sealGlyph = state === "eligible" ? "✓" : state === "ineligible" ? "✕" : "!";

  resultEl.innerHTML = `
    <div class="seal" aria-hidden="true">${sealGlyph}</div>
    <p class="verdict">${title}</p>
    <p class="verdict-copy">${copy}</p>
    ${echo ? `<span class="wallet-echo">${echo}</span>` : ""}
  `;
}

async function runCheck() {
  const raw = walletInput.value;
  const value = normalise(raw);

  if (!value) {
    hintEl.textContent = "Enter a wallet address or ENS name first.";
    walletInput.focus();
    return;
  }

  if (!looksValid(value)) {
    hintEl.textContent = "";
    showResult("invalid", {
      title: "This Bears No Familiar Mark",
      copy: "That does not resemble a wallet address or an .eth name. Check for typos and present it again.",
      echo: escapeHtml(raw.trim()),
    });
    return;
  }

  hintEl.textContent = "";
  checkBtn.disabled = true;
  checkBtn.textContent = "Consulting the Ledger…";

  if (ledger === null && !loadFailed) {
    await loadLedger();
  }

  checkBtn.disabled = false;
  checkBtn.textContent = "Consult the Ledger";

  if (loadFailed) {
    showResult("invalid", {
      title: "The Ledger Is Sealed Shut",
      copy: "The record could not be reached. Refresh the page and try again in a moment.",
    });
    return;
  }

  if (ledger.has(value)) {
    showResult("eligible", {
      title: "Thou Art Named Among the Elect",
      copy: "This wallet is inscribed in the sealed record. Await further word from the Order.",
      echo: escapeHtml(value),
    });
  } else {
    showResult("ineligible", {
      title: "No Record Found",
      copy: "This wallet does not appear in the sealed ledger. If you believe this to be an error, reach out through the Order's official channels.",
      echo: escapeHtml(value),
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

checkBtn.addEventListener("click", runCheck);
walletInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runCheck();
});
walletInput.addEventListener("input", () => {
  hintEl.textContent = "";
});

// Warm the ledger in the background so the first check feels instant.
loadLedger();
