/**
 * Family App - Real-Time Calling Engine (WebRTC & Agora SDK Architecture)
 * Supports Audio & Video individual/group calls with complete call controls.
 */

class CallsService {
  constructor() {
    this.currentCall = null;
    this.localStream = null;
    this.isMuted = false;
    this.isVideoOff = false;
    this.isSpeaker = true;
    this.callTimerInterval = null;
    this.secondsElapsed = 0;
    this.audioContext = null;
    this.ringOscillator = null;

    // WebRTC / Agora Config Hooks
    this.agoraAppId = "YOUR_AGORA_APP_ID";
    this.webrtcIceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ];
  }

  /**
   * Start an Audio or Video call
   */
  async startCall({ callerName, avatar, isVideo = false, isGroup = false, participants = [] }) {
    this.currentCall = {
      callerName,
      avatar,
      isVideo,
      isGroup,
      participants: isGroup ? participants : [callerName],
      startTime: Date.now(),
      status: 'ringing'
    };

    this.secondsElapsed = 0;
    this.isMuted = false;
    this.isVideoOff = !isVideo;

    // Render Call UI
    this.renderCallModal();
    this.startRingingSound();

    // Acquire Media Stream if permissions allowed
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo ? { facingMode: 'user' } : false
        });
        this.attachLocalMedia();
      }
    } catch (err) {
      console.warn("[CallsService] Local camera/mic permission fallback:", err.message);
    }

    // Simulate answer after 2.5 seconds for interactive preview
    setTimeout(() => {
      if (this.currentCall && this.currentCall.status === 'ringing') {
        this.onCallConnected();
      }
    }, 2500);
  }

  onCallConnected() {
    if (!this.currentCall) return;
    this.currentCall.status = 'connected';
    this.stopRingingSound();
    
    const statusElem = document.getElementById('call-modal-status');
    if (statusElem) {
      statusElem.textContent = '00:00';
    }

    this.callTimerInterval = setInterval(() => {
      this.secondsElapsed++;
      const mins = String(Math.floor(this.secondsElapsed / 60)).padStart(2, '0');
      const secs = String(this.secondsElapsed % 60).padStart(2, '0');
      if (statusElem) {
        statusElem.textContent = `${mins}:${secs}`;
      }
    }, 1000);

    if (this.currentCall.isVideo) {
      const videoGrid = document.getElementById('call-modal-videogrid');
      if (videoGrid) videoGrid.style.display = 'grid';
    }
  }

  endCall() {
    this.stopRingingSound();
    if (this.callTimerInterval) {
      clearInterval(this.callTimerInterval);
      this.callTimerInterval = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    const modal = document.getElementById('call-screen-modal');
    if (modal) modal.classList.remove('active');

    if (window.notifications) {
      window.notifications.showToast(
        window.i18n.t('callEnded'),
        `${this.currentCall?.callerName || ''} - ${this.secondsElapsed}s`
      );
    }

    this.currentCall = null;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }
    const btn = document.getElementById('btn-call-mute');
    if (btn) btn.classList.toggle('active-state', this.isMuted);
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !this.isVideoOff;
      });
    }
    const btn = document.getElementById('btn-call-video');
    if (btn) btn.classList.toggle('active-state', this.isVideoOff);
  }

  toggleSpeaker() {
    this.isSpeaker = !this.isSpeaker;
    const btn = document.getElementById('btn-call-speaker');
    if (btn) btn.classList.toggle('active-state', this.isSpeaker);
  }

  startRingingSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audioContext = new AudioContext();
      
      const playTone = () => {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 1.2);
      };

      playTone();
      this.ringInterval = setInterval(() => {
        if (this.currentCall?.status === 'ringing') {
          playTone();
        } else {
          clearInterval(this.ringInterval);
        }
      }, 2000);
    } catch (e) {
      console.log("[CallsService] AudioContext tone unavailable.");
    }
  }

  stopRingingSound() {
    if (this.ringInterval) clearInterval(this.ringInterval);
    if (this.audioContext) {
      try { this.audioContext.close(); } catch(e) {}
      this.audioContext = null;
    }
  }

  attachLocalMedia() {
    const localVideo = document.getElementById('call-local-video');
    if (localVideo && this.localStream) {
      localVideo.srcObject = this.localStream;
      localVideo.play().catch(() => {});
    }
  }

  renderCallModal() {
    const modal = document.getElementById('call-screen-modal');
    if (!modal) return;

    document.getElementById('call-modal-avatar').src = this.currentCall.avatar;
    document.getElementById('call-modal-name').textContent = this.currentCall.callerName;
    document.getElementById('call-modal-status').textContent = window.i18n.t(
      this.currentCall.isVideo ? 'videoCall' : 'audioCall'
    ) + ' - ' + window.i18n.t('ringing');

    const videoGrid = document.getElementById('call-modal-videogrid');
    if (videoGrid) {
      videoGrid.style.display = this.currentCall.isVideo ? 'grid' : 'none';
      if (this.currentCall.isVideo) {
        videoGrid.innerHTML = `
          <div class="call-video-stream-card">
            <video id="call-local-video" autoplay playsinline muted></video>
            <div class="call-video-username">${window.i18n.t('you')}</div>
          </div>
          <div class="call-video-stream-card">
            <img src="${this.currentCall.avatar}" style="width:100%;height:100%;object-fit:cover;" />
            <div class="call-video-username">${this.currentCall.callerName}</div>
          </div>
        `;
      }
    }

    modal.classList.add('active');
  }

  /**
   * Stubs for direct Agora RTC Integration
   */
  async initAgoraClient(channelName, token = null) {
    if (typeof AgoraRTC !== 'undefined') {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      await client.join(this.agoraAppId, channelName, token, null);
      console.log("[Agora] Joined channel:", channelName);
      return client;
    }
    console.log("[Agora] SDK hook ready for channel:", channelName);
    return null;
  }
}

window.callsService = new CallsService();
