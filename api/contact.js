/* ============================================================
   DYNABOT CHAT — FULL FRONTEND JS (UPDATED)
   ============================================================ */

const chatIcon        = document.getElementById("chatIcon");
const chatBox         = document.getElementById("chatBox");
const chatCloseBtn    = document.getElementById("chatCloseBtn");

const userInfo        = document.getElementById("userInfo");
const userEmail       = document.getElementById("userEmail");
const userName        = document.getElementById("userName");
const startChatBtn    = document.getElementById("startChatBtn");

const chatMessages    = document.getElementById("chatMessages");
const chatInputArea   = document.getElementById("chatInputArea");
const chatInput       = document.getElementById("chatInput");
const sendChatBtn     = document.getElementById("sendChatBtn");


/* ============================================================
   OPEN / CLOSE CHAT
   ============================================================ */

chatIcon.onclick = () => {
  chatBox.classList.add("visible");
  chatInput.focus(); // Focus input when chat opens
};

chatCloseBtn.onclick = () => {
  chatBox.classList.remove("visible");

  // Reset state
  userInfo.style.display = "flex";
  chatInputArea.style.display = "none";
  chatMessages.innerHTML = "";
};


/* ============================================================
   START CHAT (Collect Email + Name)
   ============================================================ */

startChatBtn.onclick = () => {
  const email = userEmail.value.trim();
  const name  = userName.value.trim();

  if (!email || !name) {
    alert("Please enter both email and name.");
    return;
  }

  userInfo.style.display = "none";
  chatInputArea.style.display = "flex";
  
  addMessage("Dynabot", `Hello ${name}. How can I assist you today?`);
  chatInput.focus();
};


/* ============================================================
   SEND MESSAGE (Used by both button and Enter key)
   ============================================================ */

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Add user message and get the element
  const msgEl = addMessage("You", text);
  chatInput.value = "";

  // Send to backend
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail.value.trim(),
        name: userName.value.trim(),
        message: text
      })
    });

    const data = await res.json();

    if (data.success) {
      // Add checkmark to user message instead of a separate bot message
      msgEl.innerHTML += ' <span style="color: var(--accent); font-size: 0.8rem; margin-left: 6px;">✓ delivered</span>';
    } else {
      addMessage("Dynabot", "❌ Failed to send your message.");
    }

  } catch (err) {
    addMessage("Dynabot", "❌ Error sending message.");
  }
}

// Send button click
sendChatBtn.onclick = sendMessage;

// Enter key to send (Shift+Enter for new line if you want to add that later)
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});


/* ============================================================
   MESSAGE RENDERING
   ============================================================ */

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = "chat-msg";
  msg.innerHTML = `<b>${sender}</b> ${text}`;
  chatMessages.appendChild(msg);
  
  // Scroll to bottom with a small delay to ensure it works
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 0);
  
  return msg; // Return element so we can add the delivered checkmark
}
