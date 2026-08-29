// Family App - i18n Localization Engine (Arabic RTL & English LTR)

const translations = {
  ar: {
    appName: "Family App",
    welcomeTitle: "مرحباً بكم في عائلتنا",
    welcomeApple: "مرحباً",
    welcomeSub: "تواصل دافئ ومحادثات آمنة لجميع أفراد الأسرة",
    enterApp: "دخول التطبيق",
    chats: "المحادثات",
    calls: "المكالمات",
    status: "الحالات",
    settings: "الإعدادات",
    searchPlaceholder: "بحث في المحادثات والرسائل...",
    online: "متصل الآن",
    lastSeen: "آخر ظهور مؤخراً",
    typing: "يكتب الآن...",
    recordingVoice: "جاري تسجيل صوتي...",
    typeMessage: "اكتب رسالة...",
    send: "إرسال",
    newGroup: "إنشاء مجموعة جديدة",
    groupName: "اسم المجموعة",
    groupNamePlaceholder: "مثال: عائلة آل فلان",
    createGroup: "إنشاء المجموعة",
    chooseGroupImage: "اختيار صورة للمجموعة",
    uploadPhoto: "رفع صورة",
    voiceNote: "تسجيل صوتي",
    recordHelp: "اضغط مع الاستمرار أو انقر للتسجيل",
    recording: "تسجيل...",
    cancel: "إلغاء",
    done: "تم",
    save: "حفظ",
    mediaAttach: "إرفاق وسائط",
    photoVideo: "صور وفيديوهات",
    document: "مستند / ملف PDF",
    location: "موقعي الحالي",
    contact: "جهة اتصال",
    audioCall: "مكالمة صوتية",
    videoCall: "مكالمة فيديو",
    groupCall: "مكالمة جماعية",
    calling: "جاري الاتصال...",
    ringing: "يرن الآن...",
    callEnded: "انتهت المكالمة",
    mute: "كتم الصوت",
    speaker: "مكبر الصوت",
    flipCam: "قلب الكاميرا",
    endCall: "إنهاء",
    addStory: "إضافة حالة",
    yourStory: "حالتي",
    recentUpdates: "آخر الحالات",
    storyCaptionPlaceholder: "اكتب تعليقاً على حالتك...",
    publishStory: "نشر الحالة",
    themeMode: "مظهر التطبيق",
    darkTheme: "النمط الداكن (Obsidian Dark)",
    beigeTheme: "النمط البيج المموج (Luxury Beige)",
    language: "اللغة (Language)",
    arabic: "العربية (Arabic)",
    english: "English (الإنجليزية)",
    googleSignIn: "تسجيل الدخول عبر Google",
    googleSignedDesc: "مجهز للربط الفوري مع Firebase Google Auth",
    profile: "الملف الشخصي",
    displayName: "الاسم المعروض",
    statusBio: "الحالة / النبذة",
    chatWallpaper: "خلفية المحادثة",
    changeWallpaper: "تخصيص خلفية هذه المحادثة",
    notifications: "إشعارات التطبيق",
    enablePush: "تفعيل التنبيهات الفورية (Web Push)",
    pushActive: "الإشعارات مفعلة",
    sharedLocation: "تمت مشاركة الموقع الجغرافي",
    viewOnMap: "عرض على الخريطة",
    fileSent: "ملف مرفق",
    voiceSent: "رسالة صوتية",
    you: "أنت",
    today: "اليوم",
    yesterday: "أمس"
  },
  en: {
    appName: "Family App",
    welcomeTitle: "Welcome to our Family",
    welcomeApple: "hello",
    welcomeSub: "Warm communication and secure chats for every family member",
    enterApp: "Enter Family App",
    chats: "Chats",
    calls: "Calls",
    status: "Status",
    settings: "Settings",
    searchPlaceholder: "Search chats and messages...",
    online: "Online",
    lastSeen: "Last seen recently",
    typing: "typing...",
    recordingVoice: "recording voice note...",
    typeMessage: "Type a message...",
    send: "Send",
    newGroup: "Create New Group",
    groupName: "Group Name",
    groupNamePlaceholder: "e.g. The Family Council",
    createGroup: "Create Group",
    chooseGroupImage: "Choose Group Picture",
    uploadPhoto: "Upload Photo",
    voiceNote: "Voice Note",
    recordHelp: "Tap and hold or click to record",
    recording: "Recording...",
    cancel: "Cancel",
    done: "Done",
    save: "Save",
    mediaAttach: "Attach Media",
    photoVideo: "Photos & Videos",
    document: "Document / PDF",
    location: "Current Location",
    contact: "Contact Card",
    audioCall: "Audio Call",
    videoCall: "Video Call",
    groupCall: "Group Call",
    calling: "Calling...",
    ringing: "Ringing...",
    callEnded: "Call Ended",
    mute: "Mute",
    speaker: "Speaker",
    flipCam: "Flip Camera",
    endCall: "End Call",
    addStory: "Add Story",
    yourStory: "My Story",
    recentUpdates: "Recent Updates",
    storyCaptionPlaceholder: "Add a caption to your story...",
    publishStory: "Post Story",
    themeMode: "App Appearance",
    darkTheme: "Obsidian Dark Mode",
    beigeTheme: "Luxury Beige Wave Mode",
    language: "Language",
    arabic: "العربية (Arabic)",
    english: "English",
    googleSignIn: "Sign in with Google",
    googleSignedDesc: "Ready for Firebase Google Auth integration",
    profile: "Profile & Identity",
    displayName: "Display Name",
    statusBio: "About / Bio",
    chatWallpaper: "Chat Wallpaper",
    changeWallpaper: "Customize wallpaper for this chat",
    notifications: "App Notifications",
    enablePush: "Enable Instant Web Push Notifications",
    pushActive: "Notifications Enabled",
    sharedLocation: "Shared Geographic Location",
    viewOnMap: "View on Map",
    fileSent: "Attached File",
    voiceSent: "Voice Note",
    you: "You",
    today: "Today",
    yesterday: "Yesterday"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('family_app_lang') || 'ar';
    this.listeners = [];
  }

  get lang() {
    return this.currentLang;
  }

  setLang(newLang) {
    if (newLang !== 'ar' && newLang !== 'en') return;
    this.currentLang = newLang;
    localStorage.setItem('family_app_lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    this.notify();
  }

  t(key) {
    const dict = translations[this.currentLang] || translations.ar;
    return dict[key] || key;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentLang));
  }
}

window.i18n = new I18nManager();
