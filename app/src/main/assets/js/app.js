/**
 * Family App - Main Controller & UI Coordinator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Managers
  window.i18n.setLang(window.i18n.lang);
  window.appStorage.setTheme(window.appStorage.getTheme());
  window.firebaseService.init();

  let activeChatId = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let recordStartTime = null;
  let recordTimerInterval = null;
  let activeStoryIndex = 0;
  let activeStoryItemIndex = 0;
  let storyProgressTimer = null;

  // DOM Elements
  const splashScreen = document.getElementById('splash-screen');
  const chatListView = document.getElementById('view-chats');
  const callsListView = document.getElementById('view-calls');
  const statusListView = document.getElementById('view-status');
  const settingsListView = document.getElementById('view-settings');
  const activeChatView = document.getElementById('active-chat-view');
  
  const storiesStrip = document.getElementById('stories-strip');
  const chatListContainer = document.getElementById('chat-list-container');
  const messagesContainer = document.getElementById('chat-messages-container');
  const chatInputBox = document.getElementById('chat-input-box');
  const btnSendMsg = document.getElementById('btn-send-msg');
  const btnVoiceRecord = document.getElementById('btn-voice-record');
  const recordingOverlay = document.getElementById('recording-bar-overlay');
  const recordingTimeDisplay = document.getElementById('recording-time-display');

  // Dismiss Splash Screen after 2.8s
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.classList.add('fade-out');
      setTimeout(() => splashScreen.style.display = 'none', 800);
    }
  }, 2800);

  if (splashScreen) {
    splashScreen.addEventListener('click', () => {
      splashScreen.classList.add('fade-out');
      setTimeout(() => splashScreen.style.display = 'none', 800);
    });
  }

  // Render Core UI
  function renderAll() {
    renderStoriesStrip();
    renderChatList();
    renderCallsList();
    renderStatusView();
    renderSettingsView();
    updateLocalizedStrings();
  }

  // --- 1. STORIES STRIP & VIEWER ---
  function renderStoriesStrip() {
    const stories = window.appStorage.getStories();
    const myProfile = window.appStorage.getProfile();

    let html = `
      <div class="story-item-node" id="btn-add-story-strip">
        <div class="story-avatar-ring">
          <img src="${myProfile.avatar}" alt="My Story" />
          <div class="add-story-plus">+</div>
        </div>
        <span class="story-user-label">${window.i18n.t('yourStory')}</span>
      </div>
    `;

    stories.forEach((story, idx) => {
      if (story.userId === 'me') return;
      const ringClass = story.hasUnseen ? 'unseen' : 'seen';
      html += `
        <div class="story-item-node" data-story-idx="${idx}">
          <div class="story-avatar-ring ${ringClass}">
            <img src="${story.userAvatar}" alt="${story.userName}" />
          </div>
          <span class="story-user-label">${story.userName}</span>
        </div>
      `;
    });

    storiesStrip.innerHTML = html;

    // Attach listeners
    document.getElementById('btn-add-story-strip')?.addEventListener('click', () => {
      openModal('modal-add-story');
    });

    storiesStrip.querySelectorAll('.story-item-node[data-story-idx]').forEach(node => {
      node.addEventListener('click', () => {
        const idx = parseInt(node.getAttribute('data-story-idx'));
        openStoryViewer(idx);
      });
    });
  }

  function openStoryViewer(storyIndex) {
    const stories = window.appStorage.getStories();
    const story = stories[storyIndex];
    if (!story || !story.items.length) return;

    activeStoryIndex = storyIndex;
    activeStoryItemIndex = 0;

    const modal = document.getElementById('story-viewer-modal');
    modal.classList.add('active');

    renderStoryItem();
  }

  function renderStoryItem() {
    const stories = window.appStorage.getStories();
    const story = stories[activeStoryIndex];
    const item = story.items[activeStoryItemIndex];

    document.getElementById('story-viewer-user-name').textContent = story.userName;
    document.getElementById('story-viewer-user-avatar').src = story.userAvatar;
    document.getElementById('story-viewer-time').textContent = item.time;
    document.getElementById('story-viewer-img').src = item.mediaUrl;
    document.getElementById('story-viewer-caption').textContent = item.caption || '';
    document.getElementById('story-viewer-caption').style.display = item.caption ? 'block' : 'none';

    // Progress Bars
    const progressRow = document.getElementById('story-progress-row');
    progressRow.innerHTML = story.items.map((_, i) => {
      const fillWidth = i < activeStoryItemIndex ? '100%' : (i === activeStoryItemIndex ? '0%' : '0%');
      return `<div class="story-progress-segment"><div class="story-progress-fill" id="story-seg-${i}" style="width: ${fillWidth};"></div></div>`;
    }).join('');

    // Animate current segment
    if (storyProgressTimer) clearInterval(storyProgressTimer);
    let progress = 0;
    const currentSeg = document.getElementById(`story-seg-${activeStoryItemIndex}`);

    storyProgressTimer = setInterval(() => {
      progress += 2;
      if (currentSeg) currentSeg.style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(storyProgressTimer);
        nextStoryItem();
      }
    }, 100);
  }

  function nextStoryItem() {
    const stories = window.appStorage.getStories();
    const story = stories[activeStoryIndex];
    if (activeStoryItemIndex < story.items.length - 1) {
      activeStoryItemIndex++;
      renderStoryItem();
    } else if (activeStoryIndex < stories.length - 1) {
      activeStoryIndex++;
      activeStoryItemIndex = 0;
      renderStoryItem();
    } else {
      closeStoryViewer();
    }
  }

  function closeStoryViewer() {
    if (storyProgressTimer) clearInterval(storyProgressTimer);
    const modal = document.getElementById('story-viewer-modal');
    modal.classList.remove('active');
  }

  document.getElementById('btn-close-story')?.addEventListener('click', closeStoryViewer);
  document.getElementById('story-viewer-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'story-viewer-modal' || e.target.classList.contains('story-content-body')) {
      nextStoryItem();
    }
  });

  // --- 2. CHAT LIST RENDERING ---
  function renderChatList() {
    const chats = window.appStorage.getChats();
    if (!chatListContainer) return;

    chatListContainer.innerHTML = chats.map(chat => {
      const lastMsg = chat.messages[chat.messages.length - 1];
      const timeStr = lastMsg ? lastMsg.time : '';
      let msgPreview = lastMsg ? (lastMsg.text || (lastMsg.type === 'voice' ? '🎙️ ' + window.i18n.t('voiceSent') : '📎 ' + window.i18n.t('fileSent'))) : '';
      
      const unreadHtml = chat.unreadCount > 0 
        ? `<span class="chat-unread-badge">${chat.unreadCount}</span>` 
        : '';

      const onlineDot = chat.online && !chat.isGroup 
        ? `<span class="online-dot"></span>` 
        : '';

      return `
        <div class="chat-card-item" data-chat-id="${chat.id}">
          <div class="chat-avatar-wrapper">
            <img src="${chat.avatar}" alt="${chat.name}" />
            ${onlineDot}
          </div>
          <div class="chat-info-col">
            <div class="chat-info-row-top">
              <span class="chat-partner-name">${chat.name}</span>
              <span class="chat-last-time">${timeStr}</span>
            </div>
            <div class="chat-info-row-bottom">
              <span class="chat-last-msg">${msgPreview}</span>
              ${unreadHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    chatListContainer.querySelectorAll('.chat-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-chat-id');
        openChat(id);
      });
    });
  }

  // --- 3. ACTIVE CHAT VIEW & 3D BUBBLES ---
  function openChat(chatId) {
    activeChatId = chatId;
    const chat = window.appStorage.getChatById(chatId);
    if (!chat) return;

    chat.unreadCount = 0;
    window.appStorage.saveChats(window.appStorage.getChats());

    document.getElementById('chat-room-avatar').src = chat.avatar;
    document.getElementById('chat-room-name').textContent = chat.name;
    document.getElementById('chat-room-status').textContent = chat.isGroup 
      ? `${chat.members.length} ${window.i18n.lang === 'ar' ? 'أعضاء' : 'members'}` 
      : (chat.online ? window.i18n.t('online') : window.i18n.t('lastSeen'));

    // Apply custom wallpaper
    const wallpaperDef = DEFAULT_WALLPAPERS.find(w => w.id === chat.wallpaper);
    messagesContainer.style.background = wallpaperDef ? wallpaperDef.value : (chat.wallpaper || 'var(--bg-primary)');

    renderMessages(chat);
    activeChatView.classList.add('opened');
  }

  function renderMessages(chat) {
    const myProfile = window.appStorage.getProfile();
    messagesContainer.innerHTML = chat.messages.map(msg => {
      const isOut = msg.isOutgoing;
      const rowClass = isOut ? 'outgoing' : 'incoming';
      const senderHeader = (!isOut && chat.isGroup) ? `<div class="bubble-sender-name">${msg.senderName}</div>` : '';

      let bodyContent = '';
      if (msg.type === 'text') {
        bodyContent = `<div class="bubble-text">${escapeHtml(msg.text)}</div>`;
      } else if (msg.type === 'image') {
        bodyContent = `
          <img src="${msg.mediaUrl}" class="bubble-image-preview" alt="Image" />
          ${msg.text ? `<div class="bubble-text" style="margin-top:6px;">${escapeHtml(msg.text)}</div>` : ''}
        `;
      } else if (msg.type === 'voice') {
        bodyContent = `
          <div class="bubble-voice-note">
            <button class="voice-play-btn" onclick="playVoiceAudio('${msg.id}')">▶</button>
            <div class="voice-waveform-canvas">
              <div class="waveform-bar" style="height: 12px;"></div>
              <div class="waveform-bar" style="height: 22px;"></div>
              <div class="waveform-bar" style="height: 18px;"></div>
              <div class="waveform-bar" style="height: 26px;"></div>
              <div class="waveform-bar" style="height: 15px;"></div>
              <div class="waveform-bar" style="height: 20px;"></div>
            </div>
            <span style="font-size:11px;opacity:0.8;">${msg.duration || '0:07'}</span>
          </div>
          ${msg.audioUrl ? `<audio id="audio-${msg.id}" src="${msg.audioUrl}" preload="auto"></audio>` : ''}
        `;
      } else if (msg.type === 'location') {
        bodyContent = `
          <div class="bubble-location-card" onclick="window.open('https://maps.google.com/?q=${msg.latitude},${msg.longitude}', '_blank')">
            <div class="location-map-preview">
              <span style="font-size:24px;">📍</span>
            </div>
            <div style="padding: 8px 10px; font-size: 12px; font-weight: 600;">
              ${escapeHtml(msg.address || window.i18n.t('sharedLocation'))}
            </div>
          </div>
        `;
      } else if (msg.type === 'document') {
        bodyContent = `
          <div class="bubble-file-attachment">
            <span style="font-size:22px;">📄</span>
            <div>
              <div style="font-size: 13px; font-weight: 600;">${escapeHtml(msg.fileName || 'Document.pdf')}</div>
              <div style="font-size: 10px; opacity: 0.7;">${msg.fileSize || '1.5 MB'}</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="chat-bubble-row ${rowClass}">
          ${!isOut ? `<img src="${chat.avatar}" class="bubble-avatar" alt="${msg.senderName}" />` : ''}
          <div class="chat-bubble">
            ${senderHeader}
            ${bodyContent}
            <div class="bubble-meta">
              <span>${msg.time}</span>
              ${isOut ? '<span>✓✓</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  window.playVoiceAudio = function(msgId) {
    const audio = document.getElementById(`audio-${msgId}`);
    if (audio) {
      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    } else {
      // Synthesize demo speech beep for demonstration
      window.callsService.startRingingSound();
      setTimeout(() => window.callsService.stopRingingSound(), 1200);
    }
  };

  // Close Active Chat
  document.getElementById('btn-close-chat')?.addEventListener('click', () => {
    activeChatView.classList.remove('opened');
    activeChatId = null;
    renderChatList();
  });

  // --- 4. SEND MESSAGE LOGIC ---
  function sendTextMessage() {
    const text = chatInputBox.value.trim();
    if (!text || !activeChatId) return;

    const myProfile = window.appStorage.getProfile();
    const newMsg = {
      id: 'm_' + Date.now(),
      senderId: 'me',
      senderName: myProfile.name,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isOutgoing: true
    };

    window.appStorage.addMessage(activeChatId, newMsg);
    chatInputBox.value = '';
    
    const chat = window.appStorage.getChatById(activeChatId);
    renderMessages(chat);

    // Simulate Warm Family Reply after 2 seconds
    simulateFamilyResponse(activeChatId);
  }

  btnSendMsg?.addEventListener('click', sendTextMessage);
  chatInputBox?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendTextMessage();
  });

  function simulateFamilyResponse(chatId) {
    setTimeout(() => {
      const currentChat = window.appStorage.getChatById(chatId);
      if (!currentChat) return;

      const replyPhrases = window.i18n.lang === 'ar' ? [
        'الله يسعدك ويحفظك يا غالي ❤️',
        'تسلم يا رب، كلنا ننتظرك بفارغ الصبر 🏡',
        'وصلت رسالتك الجميلة، بارك الله فيك ✨',
        'سمعاً وطاعة، كل الأمور جاهزة بإذن الله 🌸'
      ] : [
        'May God bless you, dear! ❤️',
        'Thank you so much, we are waiting for you at home 🏡',
        'Got your message, having a great family time! ✨',
        'Sounds wonderful, everything is ready 🌸'
      ];

      const randomText = replyPhrases[Math.floor(Math.random() * replyPhrases.length)];
      const responder = currentChat.isGroup ? 'أمي (Mom)' : currentChat.name;

      const replyMsg = {
        id: 'rep_' + Date.now(),
        senderId: 'partner',
        senderName: responder,
        text: randomText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isOutgoing: false
      };

      window.appStorage.addMessage(chatId, replyMsg);
      if (activeChatId === chatId) {
        renderMessages(currentChat);
      }

      window.notifications.showPush(
        `${responder} (${currentChat.name})`,
        randomText,
        currentChat.avatar
      );
    }, 2200);
  }

  // --- 5. VOICE NOTE RECORDER ---
  let recordingSeconds = 0;
  btnVoiceRecord?.addEventListener('click', async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const durationStr = `0:${String(recordingSeconds).padStart(2, '0')}`;

          const myProfile = window.appStorage.getProfile();
          const voiceMsg = {
            id: 'v_' + Date.now(),
            senderId: 'me',
            senderName: myProfile.name,
            type: 'voice',
            duration: durationStr,
            audioUrl: audioUrl,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOutgoing: true
          };

          window.appStorage.addMessage(activeChatId, voiceMsg);
          const chat = window.appStorage.getChatById(activeChatId);
          renderMessages(chat);
          stream.getTracks().forEach(t => t.stop());
        };

        mediaRecorder.start();
        recordingSeconds = 0;
        recordingOverlay.style.display = 'flex';
        recordingTimeDisplay.textContent = '00:00';

        recordTimerInterval = setInterval(() => {
          recordingSeconds++;
          recordingTimeDisplay.textContent = `00:${String(recordingSeconds).padStart(2, '0')}`;
        }, 1000);
      } catch (err) {
        // Fallback simulated voice note
        recordingSeconds = 5;
        const myProfile = window.appStorage.getProfile();
        const voiceMsg = {
          id: 'v_' + Date.now(),
          senderId: 'me',
          senderName: myProfile.name,
          type: 'voice',
          duration: '0:06',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOutgoing: true
        };
        window.appStorage.addMessage(activeChatId, voiceMsg);
        renderMessages(window.appStorage.getChatById(activeChatId));
        window.notifications.showToast(window.i18n.t('voiceSent'), 'تم إرسال التسجيل الصوتي');
      }
    } else if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      clearInterval(recordTimerInterval);
      recordingOverlay.style.display = 'none';
    }
  });

  document.getElementById('btn-cancel-recording')?.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      clearInterval(recordTimerInterval);
      recordingOverlay.style.display = 'none';
      audioChunks = [];
    }
  });

  // --- 6. ATTACHMENTS (Images, Files, Location) ---
  document.getElementById('btn-chat-attach')?.addEventListener('click', () => {
    openModal('modal-media-attach');
  });

  // Photo / Video File Input
  const fileInputPhoto = document.getElementById('input-file-photo');
  fileInputPhoto?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && activeChatId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const myProfile = window.appStorage.getProfile();
        const imgMsg = {
          id: 'img_' + Date.now(),
          senderId: 'me',
          senderName: myProfile.name,
          type: 'image',
          mediaUrl: event.target.result,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOutgoing: true
        };
        window.appStorage.addMessage(activeChatId, imgMsg);
        renderMessages(window.appStorage.getChatById(activeChatId));
        closeModal('modal-media-attach');
      };
      reader.readAsDataURL(file);
    }
  });

  // Document File Input
  const fileInputDoc = document.getElementById('input-file-doc');
  fileInputDoc?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && activeChatId) {
      const myProfile = window.appStorage.getProfile();
      const docMsg = {
        id: 'doc_' + Date.now(),
        senderId: 'me',
        senderName: myProfile.name,
        type: 'document',
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOutgoing: true
      };
      window.appStorage.addMessage(activeChatId, docMsg);
      renderMessages(window.appStorage.getChatById(activeChatId));
      closeModal('modal-media-attach');
    }
  });

  // Send Location
  document.getElementById('btn-send-location')?.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const myProfile = window.appStorage.getProfile();
          const locMsg = {
            id: 'loc_' + Date.now(),
            senderId: 'me',
            senderName: myProfile.name,
            type: 'location',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            address: 'موقعي المباشر (Live Location)',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOutgoing: true
          };
          window.appStorage.addMessage(activeChatId, locMsg);
          renderMessages(window.appStorage.getChatById(activeChatId));
          closeModal('modal-media-attach');
        },
        () => {
          // Fallback location
          const myProfile = window.appStorage.getProfile();
          const locMsg = {
            id: 'loc_' + Date.now(),
            senderId: 'me',
            senderName: myProfile.name,
            type: 'location',
            latitude: 24.7136,
            longitude: 46.6753,
            address: 'الرياض، المملكة العربية السعودية',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOutgoing: true
          };
          window.appStorage.addMessage(activeChatId, locMsg);
          renderMessages(window.appStorage.getChatById(activeChatId));
          closeModal('modal-media-attach');
        }
      );
    }
  });

  // --- 7. AUDIO & VIDEO CALL TRIGGERS ---
  document.getElementById('btn-call-audio-chat')?.addEventListener('click', () => {
    if (!activeChatId) return;
    const chat = window.appStorage.getChatById(activeChatId);
    window.callsService.startCall({
      callerName: chat.name,
      avatar: chat.avatar,
      isVideo: false,
      isGroup: chat.isGroup
    });
  });

  document.getElementById('btn-call-video-chat')?.addEventListener('click', () => {
    if (!activeChatId) return;
    const chat = window.appStorage.getChatById(activeChatId);
    window.callsService.startCall({
      callerName: chat.name,
      avatar: chat.avatar,
      isVideo: true,
      isGroup: chat.isGroup
    });
  });

  document.getElementById('btn-call-hangup')?.addEventListener('click', () => {
    window.callsService.endCall();
  });
  document.getElementById('btn-call-mute')?.addEventListener('click', () => {
    window.callsService.toggleMute();
  });
  document.getElementById('btn-call-video')?.addEventListener('click', () => {
    window.callsService.toggleVideo();
  });
  document.getElementById('btn-call-speaker')?.addEventListener('click', () => {
    window.callsService.toggleSpeaker();
  });

  // --- 8. GROUP CREATION WITH IMAGE PICKER ---
  document.getElementById('fab-new-group')?.addEventListener('click', () => {
    openModal('modal-new-group');
  });

  let newGroupAvatarData = null;
  const groupAvatarInput = document.getElementById('input-group-avatar');
  groupAvatarInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        newGroupAvatarData = event.target.result;
        document.getElementById('preview-group-avatar').src = newGroupAvatarData;
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btn-submit-create-group')?.addEventListener('click', () => {
    const name = document.getElementById('input-group-name').value.trim();
    if (!name) {
      alert(window.i18n.t('groupNamePlaceholder'));
      return;
    }
    const newGroup = window.appStorage.createGroup(name, newGroupAvatarData);
    closeModal('modal-new-group');
    renderChatList();
    openChat(newGroup.id);
    window.notifications.showToast('Family App', `تم إنشاء "${name}" بنجاح 🎊`);
  });

  // --- 9. CHAT WALLPAPER SELECTOR ---
  document.getElementById('btn-chat-wallpaper-settings')?.addEventListener('click', () => {
    openWallpaperModal();
  });

  function openWallpaperModal() {
    const chat = window.appStorage.getChatById(activeChatId);
    if (!chat) return;

    const grid = document.getElementById('wallpaper-selection-grid');
    grid.innerHTML = DEFAULT_WALLPAPERS.map(wp => `
      <div class="wallpaper-chip ${chat.wallpaper === wp.id ? 'active-wp' : ''}" 
           style="background: ${wp.value};" 
           data-wp-id="${wp.id}" 
           title="${wp.name}">
      </div>
    `).join('');

    grid.querySelectorAll('.wallpaper-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const wpId = chip.getAttribute('data-wp-id');
        window.appStorage.setChatWallpaper(activeChatId, wpId);
        const wpDef = DEFAULT_WALLPAPERS.find(w => w.id === wpId);
        messagesContainer.style.background = wpDef ? wpDef.value : 'var(--bg-primary)';
        closeModal('modal-chat-wallpaper');
        window.notifications.showToast(window.i18n.t('chatWallpaper'), 'تم تحديث خلفية المحادثة');
      });
    });

    openModal('modal-chat-wallpaper');
  }

  // --- 10. STATUS / STORIES VIEW & PUBLISHING ---
  function renderStatusView() {
    const stories = window.appStorage.getStories();
    const myStory = stories.find(s => s.userId === 'me');
    const myProfile = window.appStorage.getProfile();

    const myStoryCard = document.getElementById('status-my-story-card');
    if (myStoryCard) {
      myStoryCard.innerHTML = `
        <div class="chat-avatar-wrapper">
          <img src="${myProfile.avatar}" alt="Me" />
          <div class="add-story-plus">+</div>
        </div>
        <div class="chat-info-col">
          <div class="chat-partner-name">${window.i18n.t('yourStory')}</div>
          <div class="chat-last-msg">${myStory?.items?.length ? myStory.items[0].time : window.i18n.t('addStory')}</div>
        </div>
      `;
      myStoryCard.onclick = () => openModal('modal-add-story');
    }

    const recentList = document.getElementById('status-recent-list');
    if (recentList) {
      recentList.innerHTML = stories.filter(s => s.userId !== 'me').map((story, i) => `
        <div class="chat-card-item" onclick="window.appOpenStory(${i + 1})">
          <div class="chat-avatar-wrapper">
            <div class="story-avatar-ring ${story.hasUnseen ? 'unseen' : 'seen'}" style="width:52px;height:52px;">
              <img src="${story.userAvatar}" alt="${story.userName}" />
            </div>
          </div>
          <div class="chat-info-col">
            <div class="chat-partner-name">${story.userName}</div>
            <div class="chat-last-msg">${story.items[0]?.time || ''} • ${story.items[0]?.caption || 'Story'}</div>
          </div>
        </div>
      `).join('');
    }
  }

  window.appOpenStory = (index) => openStoryViewer(index);

  // Add Story Upload & Publish
  let newStoryMediaData = null;
  const storyMediaInput = document.getElementById('input-story-media');
  storyMediaInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        newStoryMediaData = event.target.result;
        document.getElementById('preview-story-media').src = newStoryMediaData;
        document.getElementById('preview-story-media').style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btn-publish-story')?.addEventListener('click', () => {
    const caption = document.getElementById('input-story-caption').value.trim();
    const media = newStoryMediaData || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80';
    window.appStorage.addStory(media, caption);
    closeModal('modal-add-story');
    renderStoriesStrip();
    renderStatusView();
    window.notifications.showToast(window.i18n.t('status'), 'تم نشر الحالة بنجاح 🌟');
  });

  // --- 11. CALLS TAB VIEW ---
  function renderCallsList() {
    const callsContainer = document.getElementById('calls-list-container');
    if (!callsContainer) return;

    const demoCalls = [
      { name: 'أمي الحبيبة (Mom)', avatar: DEFAULT_AVATARS.mom, isVideo: true, time: 'اليوم، 11:20 ص', isIncoming: true, isMissed: false },
      { name: 'أبي الغالي (Dad)', avatar: DEFAULT_AVATARS.dad, isVideo: false, time: 'اليوم، 09:15 ص', isIncoming: false, isMissed: false },
      { name: 'عائلة آل الخير 🏡', avatar: DEFAULT_AVATARS.group, isVideo: true, time: 'أمس، 08:30 م', isIncoming: true, isMissed: false },
      { name: 'سارة أختي (Sara)', avatar: DEFAULT_AVATARS.sara, isVideo: false, time: 'أمس، 04:10 م', isIncoming: true, isMissed: true }
    ];

    callsContainer.innerHTML = demoCalls.map(c => `
      <div class="chat-card-item">
        <div class="chat-avatar-wrapper">
          <img src="${c.avatar}" alt="${c.name}" />
        </div>
        <div class="chat-info-col">
          <div class="chat-partner-name">${c.name}</div>
          <div class="chat-last-msg" style="color: ${c.isMissed ? 'var(--accent-red)' : 'var(--text-secondary)'}">
            ${c.isIncoming ? '↙ واردة' : '↗ صادرة'} • ${c.time}
          </div>
        </div>
        <button class="icon-btn" onclick="window.callsService.startCall({callerName: '${c.name}', avatar: '${c.avatar}', isVideo: ${c.isVideo}})">
          ${c.isVideo ? '📹' : '📞'}
        </button>
      </div>
    `).join('');
  }

  // --- 12. SETTINGS VIEW (Theme, Language, Google Login, Profile) ---
  function renderSettingsView() {
    const profile = window.appStorage.getProfile();
    const currentTheme = window.appStorage.getTheme();
    const currentLang = window.i18n.lang;

    document.getElementById('settings-profile-avatar').src = profile.avatar;
    document.getElementById('settings-profile-name').textContent = profile.name;
    document.getElementById('settings-profile-bio').textContent = profile.bio;
    document.getElementById('settings-profile-email').textContent = profile.email || 'Google Connected';

    // Theme selector UI
    const themeSelect = document.getElementById('select-app-theme');
    if (themeSelect) themeSelect.value = currentTheme;

    // Lang selector UI
    const langSelect = document.getElementById('select-app-lang');
    if (langSelect) langSelect.value = currentLang;
  }

  // Language Change Event
  document.getElementById('select-app-lang')?.addEventListener('change', (e) => {
    window.i18n.setLang(e.target.value);
    renderAll();
  });

  // Theme Change Event
  document.getElementById('select-app-theme')?.addEventListener('change', (e) => {
    window.appStorage.setTheme(e.target.value);
  });

  // Google Sign-In Trigger
  document.getElementById('btn-google-sign-in')?.addEventListener('click', async () => {
    try {
      const res = await window.firebaseService.signInWithGoogle();
      renderSettingsView();
      window.notifications.showToast('Google Sign-In', `مرحباً بك ${res.user.name}`);
    } catch (err) {
      alert('Google Auth: ' + err.message);
    }
  });

  // Push Notification Permission Trigger
  document.getElementById('btn-enable-push-notifications')?.addEventListener('click', async () => {
    await window.notifications.requestPermission();
  });

  // Profile Edit Modal
  document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
    const profile = window.appStorage.getProfile();
    document.getElementById('input-edit-profile-name').value = profile.name;
    document.getElementById('input-edit-profile-bio').value = profile.bio;
    document.getElementById('preview-edit-profile-avatar').src = profile.avatar;
    openModal('modal-edit-profile');
  });

  let editProfileAvatarData = null;
  document.getElementById('input-edit-profile-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        editProfileAvatarData = event.target.result;
        document.getElementById('preview-edit-profile-avatar').src = editProfileAvatarData;
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btn-save-profile')?.addEventListener('click', () => {
    const name = document.getElementById('input-edit-profile-name').value.trim();
    const bio = document.getElementById('input-edit-profile-bio').value.trim();
    const profile = window.appStorage.getProfile();
    profile.name = name || profile.name;
    profile.bio = bio || profile.bio;
    if (editProfileAvatarData) profile.avatar = editProfileAvatarData;
    window.appStorage.saveProfile(profile);
    closeModal('modal-edit-profile');
    renderSettingsView();
    renderStoriesStrip();
    window.notifications.showToast(window.i18n.t('profile'), 'تم تحديث البيانات الشخصية');
  });

  // --- 13. BOTTOM NAVIGATION SWITCHING ---
  const navTabs = document.querySelectorAll('.nav-tab-item');
  const views = {
    'tab-chats': chatListView,
    'tab-calls': callsListView,
    'tab-status': statusListView,
    'tab-settings': settingsListView
  };

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetViewId = tab.getAttribute('data-tab');
      Object.values(views).forEach(v => v.classList.remove('active'));
      if (views[targetViewId]) {
        views[targetViewId].classList.add('active');
      }

      if (targetViewId === 'tab-status') renderStatusView();
      if (targetViewId === 'tab-calls') renderCallsList();
      if (targetViewId === 'tab-settings') renderSettingsView();
    });
  });

  // --- 14. MODAL HELPERS ---
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('show');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
  }

  window.closeModal = closeModal;
  window.openModal = openModal;

  document.querySelectorAll('.apple-modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });

  function updateLocalizedStrings() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      const key = elem.getAttribute('data-i18n');
      elem.textContent = window.i18n.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
      const key = elem.getAttribute('data-i18n-placeholder');
      elem.placeholder = window.i18n.t(key);
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initial Run
  renderAll();
});
