/* Medivance AI Assistant — Floating Chat Widget (Improved Demo Version) */
(function () {

  const style = document.createElement("style");
  style.textContent = `
#mv-chat-btn{
position:fixed!important;
bottom:20px!important;
right:20px!important;
z-index:999999!important;
width:50px!important;
height:50px!important;
border-radius:50%!important;
border:none!important;
cursor:pointer!important;
display:flex!important;
align-items:center!important;
justify-content:center!important;
background:linear-gradient(135deg,#2563eb,#0d9488)!important;
box-shadow:0 10px 24px rgba(37,99,235,.35)!important;
transition:.25s;
}
#mv-chat-btn:hover{
transform:scale(1.08);
box-shadow:0 14px 28px rgba(37,99,235,.45)!important;
}
#mv-chat-btn svg{
width:22px;
height:22px;
}

#mv-chat-window{
position:fixed;
bottom:82px;
right:20px;
width:340px;
height:470px;
max-width:92vw;
max-height:75vh;
background:#fff;
border-radius:18px;
overflow:hidden;
display:flex;
flex-direction:column;
font-family:Segoe UI,Arial,sans-serif;
box-shadow:0 20px 60px rgba(0,0,0,.25);
border:1px solid #e5e7eb;
opacity:0;
visibility:hidden;
transform:translateY(20px) scale(.95);
transition:.25s;
z-index:999998;
}
#mv-chat-window.open{
opacity:1;
visibility:visible;
transform:translateY(0) scale(1);
}

#mv-chat-header{
padding:15px 16px;
display:flex;
align-items:center;
gap:10px;
background:linear-gradient(135deg,#2563eb,#0d9488);
color:#fff;
}

.mv-dot{
width:9px;
height:9px;
background:#4ade80;
border-radius:50%;
}

.mv-title{
font-size:15px;
font-weight:600;
}

.mv-sub{
font-size:11px;
opacity:.9;
}

#mv-chat-close{
margin-left:auto;
background:none;
border:none;
color:#fff;
font-size:22px;
cursor:pointer;
}

#mv-chat-body{
flex:1;
padding:15px;
overflow-y:auto;
background:#f8fafc;
display:flex;
flex-direction:column;
gap:12px;
}

.mv-row{
display:flex;
align-items:flex-end;
gap:8px;
}

.mv-avatar{
width:28px;
height:28px;
border-radius:50%;
background:linear-gradient(135deg,#2563eb,#0d9488);
display:flex;
align-items:center;
justify-content:center;
color:#fff;
font-size:13px;
flex-shrink:0;
}

.mv-msg{
padding:10px 13px;
font-size:13.5px;
line-height:1.45;
border-radius:14px;
max-width:82%;
word-wrap:break-word;
}

.mv-msg.bot{
background:#eef2ff;
color:#1e293b;
border-bottom-left-radius:4px;
}

.mv-msg.user{
background:#2563eb;
color:#fff;
border-bottom-right-radius:4px;
margin-left:auto;
}

.mv-time{
font-size:10px;
opacity:.55;
margin-top:4px;
}

.mv-typing{
display:flex;
gap:4px;
padding:10px;
margin-left:36px;
}

.mv-typing span{
width:6px;
height:6px;
background:#94a3b8;
border-radius:50%;
animation:bounce 1.2s infinite;
}

.mv-typing span:nth-child(2){animation-delay:.2s;}
.mv-typing span:nth-child(3){animation-delay:.4s;}

@keyframes bounce{
0%,60%,100%{transform:translateY(0);}
30%{transform:translateY(-4px);}
}

#mv-chat-input-row{
display:flex;
gap:8px;
padding:10px;
background:#fff;
border-top:1px solid #e5e7eb;
}

#mv-chat-input{
flex:1;
border:1px solid #cbd5e1;
border-radius:24px;
padding:10px 14px;
font-size:13px;
outline:none;
}

#mv-chat-input:focus{
border-color:#2563eb;
}

#mv-chat-send{
width:38px;
height:38px;
border:none;
border-radius:50%;
background:#2563eb;
display:flex;
align-items:center;
justify-content:center;
cursor:pointer;
transition:.2s;
}

#mv-chat-send:disabled{
opacity:.4;
cursor:not-allowed;
}

#mv-chat-send:hover:not(:disabled){
background:#1d4ed8;
}

@media(max-width:600px){
#mv-chat-btn{
width:46px!important;
height:46px!important;
bottom:16px!important;
right:16px!important;
}
#mv-chat-window{
right:10px;
left:10px;
width:auto;
bottom:72px;
}
}
`;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.id = "mv-chat-btn";
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5z"/>
</svg>`;
  document.body.appendChild(btn);

  const win = document.createElement("div");
  win.id = "mv-chat-window";

  win.innerHTML = `
<div id="mv-chat-header">
<div class="mv-dot"></div>
<div>
<div class="mv-title">Medivance Assistant</div>
<div class="mv-sub">Online now</div>
</div>
<button id="mv-chat-close">&times;</button>
</div>

<div id="mv-chat-body"></div>

<div id="mv-chat-input-row">
<input id="mv-chat-input" placeholder="Ask me anything...">
<button id="mv-chat-send" disabled>
<svg width="16" height="16" viewBox="0 0 24 24" fill="white">
<path d="M2 21L23 12 2 3v7l15 2-15 2z"/>
</svg>
</button>
</div>
`;

  document.body.appendChild(win);

  const body = document.getElementById("mv-chat-body");
  const input = document.getElementById("mv-chat-input");
  const send = document.getElementById("mv-chat-send");

  function time() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function addMsg(text, who) {

    if (who === "bot") {

      const row = document.createElement("div");
      row.className = "mv-row";

      row.innerHTML = `
<div class="mv-avatar">AI</div>
<div>
<div class="mv-msg bot">${text}</div>
<div class="mv-time">${time()}</div>
</div>`;

      body.appendChild(row);

    } else {

      const wrap = document.createElement("div");
      wrap.style.alignSelf = "flex-end";

      wrap.innerHTML = `
<div class="mv-msg user">${text}</div>
<div class="mv-time" style="text-align:right">${time()}</div>`;

      body.appendChild(wrap);
    }

    body.scrollTop = body.scrollHeight;
  }

  function typing() {
    const t = document.createElement("div");
    t.className = "mv-typing";
    t.id = "typing";

    t.innerHTML =
      "<span></span><span></span><span></span>";

    body.appendChild(t);

    body.scrollTop = body.scrollHeight;
  }

  function stopTyping() {
    const t = document.getElementById("typing");
    if (t) t.remove();
  }

  const replies = [
    {k:["appointment","book","schedule"],r:"You can book an appointment from your dashboard under 'Appointments' → 'New Appointment'. Choose your doctor and preferred time slot."},
    {k:["cancel"],r:"Go to 'My Appointments', choose the appointment and click Cancel."},
    {k:["doctor","specialist"],r:"Browse doctors by specialty in the Find a Doctor section."},
    {k:["prescription","medicine"],r:"Prescriptions are available under My Records → Prescriptions."},
    {k:["report","lab","result"],r:"Lab reports appear under My Records once uploaded by your doctor."},
    {k:["login","password"],r:"Use the Forgot Password link to securely reset your password."},
    {k:["emergency"],r:"For medical emergencies, contact your nearest emergency department or local emergency services immediately."},
    {k:["hello","hi","hey"],r:"Hi 👋 I'm the Medivance Assistant. How can I help you today?"},
    {k:["thanks"],r:"You're welcome! 😊"},
    {k:["bye"],r:"Take care! Have a great day."}
  ];

  function reply(msg) {
    const m = msg.toLowerCase();
    for (const i of replies)
      if (i.k.some(x => m.includes(x))) return i.r;

    return "I can help with appointments, prescriptions, doctors, reports, and account issues. Could you tell me a little more?";
  }

  function sendMessage() {

    if (!input.value.trim()) return;

    addMsg(input.value.trim(), "user");

    const text = input.value.trim();

    input.value = "";
    send.disabled = true;

    typing();

    setTimeout(() => {

      stopTyping();

      addMsg(reply(text), "bot");

    }, 800);

  }

  input.addEventListener("input", () => {
    send.disabled = input.value.trim() === "";
  });

  send.onclick = sendMessage;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  btn.onclick = () => {

    win.classList.toggle("open");

    if (win.classList.contains("open")) {

      input.focus();

      if (body.children.length === 0) {

        typing();

        setTimeout(() => {

          stopTyping();

          addMsg("Hi! 👋 I'm the Medivance Assistant. Ask me about appointments, prescriptions, doctors, or reports.", "bot");

        }, 600);

      }

    }

  };

  document.getElementById("mv-chat-close").onclick = () => {
    win.classList.remove("open");
  };

})();
