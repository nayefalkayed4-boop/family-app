// Family App - Reactive Local Database & State Persistence Engine

const DEFAULT_AVATARS = {
  me: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  mom: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  dad: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  sara: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  ahmed: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  group: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80'
};

const DEFAULT_WALLPAPERS = [
  { id: 'default_beige', name: 'Luxury Beige', value: 'linear-gradient(180deg, rgba(247,243,235,0.95), rgba(239,232,220,0.95))' },
  { id: 'dark_obsidian', name: 'Dark Obsidian', value: 'linear-gradient(180deg, #121214, #000000)' },
  { id: 'warm_stone', name: 'Warm Stone', value: 'linear-gradient(135deg, #E6D5B8, #D8C3A5)' },
  { id: 'emerald_lux', name: 'Emerald Velvet', value: 'linear-gradient(180deg, #0A1E17, #020D09)' },
  { id: 'midnight_blue', name: 'Midnight Apple', value: 'linear-gradient(180deg, #0A1128, #000411)' },
  { id: 'cozy_pattern', name: 'Cozy Gold', value: 'radial-gradient(circle at center, #2C2A29 0%, #1A1918 100%)' }
];

const INITIAL_CHATS = [
  {
    id: 'group_family_council',
    name: 'عائلة آل الخير 🏡 (Family Council)',
    isGroup: true,
    avatar: DEFAULT_AVATARS.group,
    online: true,
    members: ['أمي (Mom)', 'أبي (Dad)', 'سارة (Sara)', 'أحمد (Ahmed)', 'أنا (Me)'],
    wallpaper: 'default_beige',
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'dad', senderName: 'أبي (Dad)', text: 'السلام عليكم ورحمة الله وبركاته يا عائلتي الجميلة. هل جهزتم لاجتماع الجمعة؟', time: '10:30 ص', type: 'text', isOutgoing: false },
      { id: 'm2', senderId: 'mom', senderName: 'أمي (Mom)', text: 'وعليكم السلام يا غالي، حضرت لكم كل ما تحبونه من أكلات إن شاء الله ❤️', time: '10:32 ص', type: 'text', isOutgoing: false },
      { id: 'm3', senderId: 'me', senderName: 'أنا', text: 'أنا بالطريق وسأحضر الحلوى معي يا أمي 🍰', time: '10:35 ص', type: 'text', isOutgoing: true },
      { id: 'm4', senderId: 'sara', senderName: 'سارة (Sara)', text: 'وصلتني صور الاجتماع السابق، سأشاركها معكم الآن!', time: '10:38 ص', type: 'text', isOutgoing: false },
      { id: 'm5', senderId: 'sara', senderName: 'سارة (Sara)', mediaUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80', text: 'صورة من لقائنا الجميل السابق 📸', time: '10:39 ص', type: 'image', isOutgoing: false }
    ]
  },
  {
    id: 'user_mom',
    name: 'أمي الحبيبة (Mom) ❤️',
    isGroup: false,
    avatar: DEFAULT_AVATARS.mom,
    online: true,
    bio: 'الجنة تحت أقدام الأمهات',
    wallpaper: 'warm_stone',
    unreadCount: 1,
    messages: [
      { id: 'mom_1', senderId: 'mom', senderName: 'أمي', text: 'صباح الخير والبركة يا حبيبي، طمني عليك هل وصلت لعملك بسلام؟', time: '08:15 ص', type: 'text', isOutgoing: false },
      { id: 'mom_2', senderId: 'me', senderName: 'أنا', text: 'الحمد لله يا ست الكل وصلت وكل الأمور ممتازة، دعواتك الطيبة لي', time: '08:20 ص', type: 'text', isOutgoing: true },
      { id: 'mom_3', senderId: 'mom', senderName: 'أمي', type: 'voice', duration: '0:14', time: '08:25 ص', isOutgoing: false, text: 'تسجيل صوتي دعاء للأبناء 🎙️' }
    ]
  },
  {
    id: 'user_dad',
    name: 'أبي الغالي (Dad) 👑',
    isGroup: false,
    avatar: DEFAULT_AVATARS.dad,
    online: false,
    bio: 'الأسرة هي السند والأمان',
    wallpaper: 'dark_obsidian',
    unreadCount: 0,
    messages: [
      { id: 'dad_1', senderId: 'dad', senderName: 'أبي', text: 'يا بني تذكر صيانة السيارة اليوم بعد الظهر.', time: 'أمس', type: 'text', isOutgoing: false },
      { id: 'dad_2', senderId: 'me', senderName: 'أنا', text: 'حاضر يا والدي، سأمر على المركز مباشرة إن شاء الله.', time: 'أمس', type: 'text', isOutgoing: true }
    ]
  },
  {
    id: 'user_sara',
    name: 'سارة أختي (Sara) 🌸',
    isGroup: false,
    avatar: DEFAULT_AVATARS.sara,
    online: true,
    bio: 'Living my best moments ✨',
    wallpaper: 'default_beige',
    unreadCount: 0,
    messages: [
      { id: 'sara_1', senderId: 'sara', senderName: 'سارة', text: 'ارسلي موقعك إذا انتهيت لنلتقي بالحديقة', time: '09:40 ص', type: 'text', isOutgoing: false },
      { id: 'sara_2', senderId: 'me', senderName: 'أنا', type: 'location', latitude: 24.7136, longitude: 46.6753, address: 'حديقة الملك فهد، الرياض', time: '09:45 ص', isOutgoing: true, text: 'موقعي الحالي' }
    ]
  },
  {
    id: 'user_ahmed',
    name: 'أحمد أخي (Ahmed) ⚡',
    isGroup: false,
    avatar: DEFAULT_AVATARS.ahmed,
    online: true,
    bio: 'Coding & Gaming 🚀',
    wallpaper: 'emerald_lux',
    unreadCount: 0,
    messages: [
      { id: 'ahmed_1', senderId: 'ahmed', senderName: 'أحمد', text: 'أرسلت لك ملف مشروع التخرج راجعه وأخبرني برأيك!', time: '11:10 ص', type: 'text', isOutgoing: false },
      { id: 'ahmed_2', senderId: 'ahmed', senderName: 'أحمد', type: 'document', fileName: 'Family_Project_Final.pdf', fileSize: '2.4 MB', time: '11:11 ص', isOutgoing: false, text: 'Family_Project_Final.pdf' }
    ]
  }
];

const INITIAL_STORIES = [
  {
    id: 'story_me',
    userId: 'me',
    userName: 'حالتي (My Story)',
    userAvatar: DEFAULT_AVATARS.me,
    hasUnseen: false,
    items: [
      { id: 'si_1', mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', caption: 'يوم هادئ على الشاطئ 🌊', time: 'منذ ساعتين' }
    ]
  },
  {
    id: 'story_mom',
    userId: 'mom',
    userName: 'أمي (Mom)',
    userAvatar: DEFAULT_AVATARS.mom,
    hasUnseen: true,
    items: [
      { id: 'si_2', mediaUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80', caption: 'طعام الغداء جاهز ومحبوب للجميع 🍲', time: 'منذ 30 دقيقة' }
    ]
  },
  {
    id: 'story_sara',
    userId: 'sara',
    userName: 'سارة (Sara)',
    userAvatar: DEFAULT_AVATARS.sara,
    hasUnseen: true,
    items: [
      { id: 'si_3', mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80', caption: 'مع العائلة في الطبيعة 🌸🌿', time: 'منذ ساعة' }
    ]
  },
  {
    id: 'story_ahmed',
    userId: 'ahmed',
    userName: 'أحمد (Ahmed)',
    userAvatar: DEFAULT_AVATARS.ahmed,
    hasUnseen: true,
    items: [
      { id: 'si_4', mediaUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80', caption: 'إنجاز رائع لفريقنا اليوم 💻🔥', time: 'منذ 3 ساعات' }
    ]
  }
];

class StorageManager {
  constructor() {
    this.chatsKey = 'family_app_chats_data';
    this.storiesKey = 'family_app_stories_data';
    this.profileKey = 'family_app_user_profile';
    this.wallpapersKey = 'family_app_wallpapers_map';
    this.themeKey = 'family_app_theme_mode';
    this.subscribers = [];
  }

  getProfile() {
    const saved = localStorage.getItem(this.profileKey);
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return {
      name: 'نايف (Nayef)',
      bio: 'أحب عائلتي دائماً وأبداً ✨',
      avatar: DEFAULT_AVATARS.me,
      email: 'nayefalkayed4@gmail.com',
      isGoogleAuth: true
    };
  }

  saveProfile(profile) {
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
    this.notify();
  }

  getTheme() {
    return localStorage.getItem(this.themeKey) || 'beige'; // default to luxury beige
  }

  setTheme(theme) {
    localStorage.setItem(this.themeKey, theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.notify();
  }

  getChats() {
    const saved = localStorage.getItem(this.chatsKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CHATS;
  }

  saveChats(chats) {
    localStorage.setItem(this.chatsKey, JSON.stringify(chats));
    this.notify();
  }

  getChatById(chatId) {
    const chats = this.getChats();
    return chats.find(c => c.id === chatId);
  }

  addMessage(chatId, message) {
    const chats = this.getChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].messages.push(message);
      chats[chatIndex].unreadCount = message.isOutgoing ? 0 : (chats[chatIndex].unreadCount + 1);
      // Move chat to top
      const chat = chats.splice(chatIndex, 1)[0];
      chats.unshift(chat);
      this.saveChats(chats);
    }
  }

  createGroup(name, avatarBase64OrUrl) {
    const chats = this.getChats();
    const newGroup = {
      id: 'group_' + Date.now(),
      name: name,
      isGroup: true,
      avatar: avatarBase64OrUrl || DEFAULT_AVATARS.group,
      online: true,
      members: ['أنا (Me)', 'أمي (Mom)', 'أبي (Dad)', 'سارة (Sara)', 'أحمد (Ahmed)'],
      wallpaper: 'default_beige',
      unreadCount: 0,
      messages: [
        {
          id: 'm_init_' + Date.now(),
          senderId: 'system',
          senderName: 'النظام',
          text: `تم إنشاء المجموعة "${name}" بنجاح 🎊`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          isOutgoing: true
        }
      ]
    };
    chats.unshift(newGroup);
    this.saveChats(chats);
    return newGroup;
  }

  setChatWallpaper(chatId, wallpaperIdOrCss) {
    const chats = this.getChats();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.wallpaper = wallpaperIdOrCss;
      this.saveChats(chats);
    }
  }

  getStories() {
    const saved = localStorage.getItem(this.storiesKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_STORIES;
  }

  saveStories(stories) {
    localStorage.setItem(this.storiesKey, JSON.stringify(stories));
    this.notify();
  }

  addStory(mediaUrl, caption) {
    const stories = this.getStories();
    const myProfile = this.getProfile();
    let myStory = stories.find(s => s.userId === 'me');
    const newStoryItem = {
      id: 'si_' + Date.now(),
      mediaUrl: mediaUrl,
      caption: caption || '',
      time: 'الآن'
    };

    if (myStory) {
      myStory.items.unshift(newStoryItem);
      myStory.userAvatar = myProfile.avatar;
      myStory.userName = myProfile.name;
    } else {
      myStory = {
        id: 'story_me_' + Date.now(),
        userId: 'me',
        userName: myProfile.name,
        userAvatar: myProfile.avatar,
        hasUnseen: false,
        items: [newStoryItem]
      };
      stories.unshift(myStory);
    }
    this.saveStories(stories);
    return myStory;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(cb => cb());
  }
}

window.appStorage = new StorageManager();
window.DEFAULT_WALLPAPERS = DEFAULT_WALLPAPERS;
window.DEFAULT_AVATARS = DEFAULT_AVATARS;
