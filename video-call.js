/* Medivance Video Call — real WebRTC calling via PeerJS free signaling broker */
(function () {
  const ROLE = window.MV_CALL_ROLE;           // 'doctor' | 'patient'
  const SELF_ID = window.MV_CALL_SELF_ID;      // fixed id for this role
  const PEER_ID = window.MV_CALL_PEER_ID;      // fixed id of the other party
  const PEER_NAME = window.MV_CALL_PEER_NAME;  // display name of other party

  const style = document.createElement('style');
  style.textContent = `
    #mv-call-status {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      z-index: 99998; background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;
      padding: 6px 14px; font: 500 12px 'Segoe UI', Arial, sans-serif; color: #475569;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 6px;
    }
    #mv-call-status .dot { width: 7px; height: 7px; border-radius: 50%; background: #94a3b8; }
    #mv-call-status.online .dot { background: #22c55e; }
    #mv-call-panel {
      position: fixed; inset: 0; z-index: 100000; background: rgba(15,23,42,0.85);
      display: none; align-items: center; justify-content: center;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    #mv-call-panel.open { display: flex; }
    .mv-call-card {
      background: #0f172a; border-radius: 20px; width: 420px; max-width: 92vw;
      padding: 32px 24px; text-align: center; color: #fff; box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    }
    .mv-call-avatar {
      width: 88px; height: 88px; border-radius: 50%; margin: 0 auto 16px;
      background: linear-gradient(135deg,#2563eb,#0d9488); display: flex; align-items: center;
      justify-content: center; font-size: 32px; font-weight: 700;
    }
    .mv-call-name { font-size: 18px; font-weight: 600; }
    .mv-call-sub { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .mv-pulse { width: 14px; height: 14px; border-radius: 50%; background: #22c55e; margin: 18px auto; animation: mv-pulse 1.4s infinite; }
    @keyframes mv-pulse { 0%{box-shadow:0 0 0 0 rgba(34,197,94,.6);} 100%{box-shadow:0 0 0 22px rgba(34,197,94,0);} }
    .mv-call-actions { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
    .mv-call-btn { width: 54px; height: 54px; border-radius: 50%; border: none; cursor: pointer; font-size: 20px; color: #fff; display: flex; align-items: center; justify-content: center; }
    .mv-call-btn.accept { background: #22c55e; }
    .mv-call-btn.decline, .mv-call-btn.end { background: #ef4444; }
    .mv-call-btn.mute, .mv-call-btn.cam { background: #334155; }
    .mv-call-btn.mute.active, .mv-call-btn.cam.active { background: #64748b; }
    #mv-call-active { position: fixed; inset: 0; z-index: 100000; background: #0f172a; display: none; }
    #mv-call-active.open { display: block; }
    #mv-remote-video { width: 100%; height: 100%; object-fit: cover; background: #1e293b; }
    #mv-local-video { position: absolute; bottom: 100px; right: 24px; width: 150px; height: 110px; object-fit: cover; border-radius: 12px; border: 2px solid #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    #mv-call-topbar { position: absolute; top: 20px; left: 24px; color: #fff; font-family: 'Segoe UI', Arial, sans-serif; }
    #mv-call-topbar .mv-call-name { font-size: 16px; }
    #mv-call-topbar .mv-call-sub { font-size: 12px; }
    #mv-call-toolbar { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; }
  `;
  document.head.appendChild(style);

  // Status pill
  const statusEl = document.createElement('div');
  statusEl.id = 'mv-call-status';
  statusEl.innerHTML = `<span class="dot"></span><span id="mv-call-status-text">Connecting to call service...</span>`;
  document.body.appendChild(statusEl);

  // Outgoing / incoming call panel
  const panel = document.createElement('div');
  panel.id = 'mv-call-panel';
  document.body.appendChild(panel);

  // Active call screen
  const activeScreen = document.createElement('div');
  activeScreen.id = 'mv-call-active';
  activeScreen.innerHTML = `
    <video id="mv-remote-video" autoplay playsinline></video>
    <video id="mv-local-video" autoplay playsinline muted></video>
    <div id="mv-call-topbar">
      <div class="mv-call-name">${PEER_NAME}</div>
      <div class="mv-call-sub" id="mv-call-timer">00:00</div>
    </div>
    <div id="mv-call-toolbar">
      <button class="mv-call-btn mute" id="mv-mute-btn"><i class="fa-solid fa-microphone"></i></button>
      <button class="mv-call-btn end" id="mv-end-btn"><i class="fa-solid fa-phone-slash"></i></button>
      <button class="mv-call-btn cam" id="mv-cam-btn"><i class="fa-solid fa-video"></i></button>
    </div>
  `;
  document.body.appendChild(activeScreen);

  let peer = null;
  let localStream = null;
  let currentCall = null;
  let timerInterval = null;
  let micOn = true, camOn = true;

  function setStatus(text, online) {
    document.getElementById('mv-call-status-text').textContent = text;
    statusEl.classList.toggle('online', !!online);
  }

  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function showRinging(mode) {
    panel.classList.add('open');
    if (mode === 'outgoing') {
      panel.innerHTML = `
        <div class="mv-call-card">
          <div class="mv-call-avatar">${initials(PEER_NAME)}</div>
          <div class="mv-call-name">Calling ${PEER_NAME}...</div>
          <div class="mv-call-sub">Ringing</div>
          <div class="mv-pulse"></div>
          <div class="mv-call-actions">
            <button class="mv-call-btn decline" id="mv-cancel-btn"><i class="fa-solid fa-phone-slash"></i></button>
          </div>
        </div>`;
      document.getElementById('mv-cancel-btn').onclick = endCall;
    } else {
      panel.innerHTML = `
        <div class="mv-call-card">
          <div class="mv-call-avatar">${initials(PEER_NAME)}</div>
          <div class="mv-call-name">${PEER_NAME}</div>
          <div class="mv-call-sub">Incoming video call...</div>
          <div class="mv-call-actions">
            <button class="mv-call-btn decline" id="mv-decline-btn"><i class="fa-solid fa-phone-slash"></i></button>
            <button class="mv-call-btn accept" id="mv-accept-btn"><i class="fa-solid fa-phone"></i></button>
          </div>
        </div>`;
      document.getElementById('mv-decline-btn').onclick = () => { currentCall.close(); closePanel(); };
      document.getElementById('mv-accept-btn').onclick = acceptIncoming;
    }
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.innerHTML = '';
  }

  async function getLocalStream() {
    if (localStream) return localStream;
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('mv-local-video').srcObject = localStream;
    return localStream;
  }

  function startTimer() {
    let secs = 0;
    const el = document.getElementById('mv-call-timer');
    timerInterval = setInterval(() => {
      secs++;
      const m = String(Math.floor(secs / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      el.textContent = `${m}:${s}`;
    }, 1000);
  }

  function openActiveScreen() {
    closePanel();
    activeScreen.classList.add('open');
    document.getElementById('mv-call-timer').textContent = '00:00';
    startTimer();
  }

  function endCall() {
    if (currentCall) currentCall.close();
    closePanel();
    activeScreen.classList.remove('open');
    clearInterval(timerInterval);
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    currentCall = null;
  }

  async function startOutgoingCall() {
    try {
      showRinging('outgoing');
      const stream = await getLocalStream();
      const call = peer.call(PEER_ID, stream);
      currentCall = call;
      call.on('stream', remoteStream => {
        document.getElementById('mv-remote-video').srcObject = remoteStream;
        openActiveScreen();
      });
      call.on('close', endCall);
      call.on('error', () => { setStatus(PEER_NAME + ' is currently offline', false); closePanel(); });
    } catch (err) {
      closePanel();
      alert('Camera/microphone access is needed to start a video call.');
    }
  }

  async function acceptIncoming() {
    try {
      const stream = await getLocalStream();
      currentCall.answer(stream);
      currentCall.on('stream', remoteStream => {
        document.getElementById('mv-remote-video').srcObject = remoteStream;
        openActiveScreen();
      });
      currentCall.on('close', endCall);
    } catch (err) {
      closePanel();
      alert('Could not access camera/microphone: ' + err.name + '. Click the camera icon in your browser\'s address bar and make sure camera/mic access is allowed for this page, then try again.');
    }
  }

  window.mvOpenCallPanel = function () {
    if (!peer || peer.disconnected) {
      alert('Still connecting to the call service, please try again in a moment.');
      return;
    }
    startOutgoingCall();
  };

  document.getElementById('mv-end-btn') && (document.getElementById('mv-end-btn').onclick = endCall);
  document.addEventListener('click', e => {
    if (e.target.closest('#mv-end-btn')) endCall();
    if (e.target.closest('#mv-mute-btn')) {
      micOn = !micOn;
      localStream.getAudioTracks().forEach(t => t.enabled = micOn);
      document.getElementById('mv-mute-btn').classList.toggle('active', !micOn);
      document.getElementById('mv-mute-btn').innerHTML = micOn ? '<i class="fa-solid fa-microphone"></i>' : '<i class="fa-solid fa-microphone-slash"></i>';
    }
    if (e.target.closest('#mv-cam-btn')) {
      camOn = !camOn;
      localStream.getVideoTracks().forEach(t => t.enabled = camOn);
      document.getElementById('mv-cam-btn').classList.toggle('active', !camOn);
      document.getElementById('mv-cam-btn').innerHTML = camOn ? '<i class="fa-solid fa-video"></i>' : '<i class="fa-solid fa-video-slash"></i>';
    }
  });

  // Init PeerJS (uses PeerJS's free public cloud signaling server)
  function init() {
    peer = new Peer(SELF_ID, { debug: 0 });
    peer.on('open', () => setStatus('Call service ready', true));
    peer.on('disconnected', () => setStatus('Call service disconnected — retrying...', false));
    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        setStatus('Already connected in another tab', false);
      } else {
        setStatus('Call service error: ' + err.type, false);
      }
    });
    peer.on('call', (call) => {
      currentCall = call;
      showRinging('incoming');
    });
  }

  if (typeof Peer === 'undefined') {
    setStatus('Call service failed to load', false);
  } else {
    init();
  }
})();
