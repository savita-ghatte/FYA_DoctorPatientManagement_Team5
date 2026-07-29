/* Medivance AI Assistant — floating chat widget (demo mode: scripted replies) */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    #mv-chat-btn {
      position: fixed !important; bottom: 18px !important; right: 18px !important; z-index: 999999 !important;
      width: 44px !important; height: 44px !important; max-width: 44px !important; max-height: 44px !important;
      border-radius: 50% !important; flex-shrink: 0 !important;
      background: linear-gradient(135deg,#2563eb,#0d9488) !important;
      box-shadow: 0 6px 18px rgba(37,99,235,0.35) !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      cursor: pointer !important; border: none !important; transition: transform .2s ease, box-shadow .2s ease !important;
    }
    #mv-chat-btn:hover { transform: scale(1.08) !important; box-shadow: 0 8px 22px rgba(37,99,235,0.5) !important; }
    #mv-chat-btn svg { width: 20px !important; height: 20px !important; }
    @media (max-width: 600px) {
      #mv-chat-btn { width: 40px !important; height: 40px !important; max-width: 40px !important; max-height: 40px !important; bottom: 14px !important; right: 14px !important; }
      #mv-chat-btn svg { width: 18px !important; height: 18px !important; }
    }
    #mv-chat-window {
      position: fixed; bottom: 70px; right: 18px; z-index: 99999;
      width: 330px; max-width: 90vw; height: 450px; max-height: 70vh;
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 16px 48px rgba(0,0,0,0.25);
      display: none; flex-direction: column;
      font-family: 'Segoe UI', Arial, sans-serif;
      border: 1px solid #e2e8f0;
    }
    #mv-chat-window.open { display: flex; }
    #mv-chat-header {
      background: linear-gradient(135deg,#2563eb,#0d9488);
      color: #fff; padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #mv-chat-header .mv-title { font-weight: 600; font-size: 15px; }
    #mv-chat-header .mv-sub { font-size: 11px; opacity: 0.85; }
    #mv-chat-header .mv-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }
    #mv-chat-close { margin-left: auto; background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; line-height: 1; }
    #mv-chat-body { flex: 1; overflow-y: auto; padding: 14px; background: #f8fafc; display: flex; flex-direction: column; gap: 10px; }
    .mv-msg { max-width: 82%; padding: 9px 12px; border-radius: 12px; font-size: 13.5px; line-height: 1.4; }
    .mv-msg.bot { align-self: flex-start; background: #eef2ff; color: #1e293b; border-bottom-left-radius: 4px; }
    .mv-msg.user { align-self: flex-end; background: #2563eb; color: #fff; border-bottom-right-radius: 4px; }
    .mv-typing { align-self: flex-start; display: flex; gap: 4px; padding: 10px 12px; }
    .mv-typing span { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; animation: mv-bounce 1.2s infinite; }
    .mv-typing span:nth-child(2) { animation-delay: .2s; }
    .mv-typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes mv-bounce { 0%,60%,100%{transform:translateY(0);} 30%{transform:translateY(-4px);} }
    #mv-chat-input-row { display: flex; border-top: 1px solid #e2e8f0; padding: 10px; gap: 8px; background: #fff; }
    #mv-chat-input { flex: 1; border: 1px solid #cbd5e1; border-radius: 20px; padding: 8px 14px; font-size: 13px; outline: none; }
    #mv-chat-input:focus { border-color: #2563eb; }
    #mv-chat-send { background: #2563eb; border: none; color: #fff; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    #mv-chat-send:hover { background: #1d4ed8; }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'mv-chat-btn';
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
  document.body.appendChild(btn);

  const win = document.createElement('div');
  win.id = 'mv-chat-window';
  win.innerHTML = `
    <div id="mv-chat-header">
      <span class="mv-dot"></span>
      <div>
        <div class="mv-title">Medivance Assistant</div>
        <div class="mv-sub">Online now</div>
      </div>
      <button id="mv-chat-close">&times;</button>
    </div>
    <div id="mv-chat-body"></div>
    <div id="mv-chat-input-row">
      <input id="mv-chat-input" type="text" placeholder="Ask me anything..." />
      <button id="mv-chat-send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
      </button>
    </div>
  `;
  document.body.appendChild(win);

  const body = win.querySelector('#mv-chat-body');
  const input = win.querySelector('#mv-chat-input');

  function addMsg(text, who) {
    const el = document.createElement('div');
    el.className = 'mv-msg ' + who;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'mv-typing';
    el.id = 'mv-typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() {
    const el = document.getElementById('mv-typing-indicator');
    if (el) el.remove();
  }

  // Scripted knowledge base — keyword matched
  const replies = [
    { k: ['appointment', 'book', 'schedule'], r: "You can book an appointment from your dashboard under 'Appointments' → 'New Appointment'. Choose your doctor and preferred time slot, and you'll get a confirmation instantly." },
    { k: ['cancel'], r: "To cancel an appointment, go to 'My Appointments', select the upcoming one, and click 'Cancel'. You'll get a confirmation and the slot will open up for others." },
    { k: ['doctor', 'specialist'], r: "You can browse available doctors by specialty on the 'Find a Doctor' section of your dashboard, along with their ratings and available time slots." },
    { k: ['prescription', 'medicine', 'medication'], r: "Your prescriptions are available under 'My Records' → 'Prescriptions'. You can also request a refill directly from there, and your doctor will review it." },
    { k: ['report', 'result', 'lab'], r: "Lab reports and test results show up under 'My Records' as soon as your doctor uploads them, and you'll get a notification too." },
    { k: ['password', 'login', 'log in', 'account'], r: "If you're having trouble logging in, use the 'Forgot Password' link on the login page to reset it securely via your registered email." },
    { k: ['emergency', 'urgent'], r: "For medical emergencies, please contact your nearest emergency room or call your local emergency number directly — this assistant is only for general navigation help, not emergency response." },
    { k: ['hi', 'hello', 'hey'], r: "Hi there! 👋 I'm the Medivance Assistant. I can help you with appointments, prescriptions, reports, and general navigation. What do you need help with?" },
    { k: ['thank', 'thanks'], r: "You're very welcome! Let me know if there's anything else I can help with." },
    { k: ['bye', 'goodbye'], r: "Take care! Feel free to reach out anytime you need help navigating Medivance." },
  ];

  function getReply(msg) {
    const lower = msg.toLowerCase();
    for (const item of replies) {
      if (item.k.some(word => lower.includes(word))) return item.r;
    }
    return "Thanks for your message! I can help with appointments, prescriptions, doctor search, lab reports, and account issues — could you tell me a bit more about what you need?";
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMsg(getReply(text), 'bot');
    }, 700 + Math.random() * 600);
  }

  win.querySelector('#mv-chat-send').addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  btn.addEventListener('click', () => {
    win.classList.toggle('open');
    if (win.classList.contains('open') && body.children.length === 0) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addMsg("Hi! 👋 I'm the Medivance Assistant. Ask me about appointments, prescriptions, doctors, or reports.", 'bot');
      }, 600);
    }
  });
  win.querySelector('#mv-chat-close').addEventListener('click', () => win.classList.remove('open'));
})();

