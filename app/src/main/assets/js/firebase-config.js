/**
 * Family App - Firebase Services Integration Bridge
 * Ready for drop-in credentials (Firebase Auth, Firestore, Cloud Storage).
 * 
 * To connect to your live Firebase project:
 * 1. Fill in `firebaseConfig` object below.
 * 2. Set `isLiveFirebaseConnected = true`.
 */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-family-app.firebaseapp.com",
  projectId: "your-family-app",
  storageBucket: "your-family-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

class FirebaseService {
  constructor() {
    this.isLiveConnected = false;
    this.currentUser = null;
    this.authProvider = null;
  }

  /**
   * Initializes Firebase App SDK if libraries are loaded
   */
  async init() {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      try {
        firebase.initializeApp(firebaseConfig);
        this.isLiveConnected = true;
        console.log("[FirebaseService] Firebase initialized successfully.");
      } catch (err) {
        console.warn("[FirebaseService] Running in local/offline bridge mode:", err.message);
      }
    } else {
      console.log("[FirebaseService] Operating in local responsive mock/bridge mode.");
    }
  }

  /**
   * Google Sign-In Provider
   * Triggers Firebase Google Auth popup or redirects
   */
  async signInWithGoogle() {
    if (this.isLiveConnected && typeof firebase !== 'undefined') {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        this.currentUser = result.user;
        return {
          success: true,
          user: {
            name: result.user.displayName,
            email: result.user.email,
            avatar: result.user.photoURL,
            uid: result.user.uid
          }
        };
      } catch (error) {
        console.error("[FirebaseService] Google Sign-In error:", error);
        throw error;
      }
    } else {
      // Clean, seamless fallback for instant demonstration
      const demoUser = {
        name: 'نايف الكايد (Nayef Alkayed)',
        email: 'nayefalkayed4@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        uid: 'user_google_' + Date.now(),
        isGoogleAuth: true
      };
      this.currentUser = demoUser;
      window.appStorage.saveProfile(demoUser);
      return { success: true, user: demoUser, isSimulated: true };
    }
  }

  /**
   * Upload media/file to Firebase Cloud Storage
   */
  async uploadFile(fileBlobOrDataUrl, path = 'family_media') {
    if (this.isLiveConnected && typeof firebase !== 'undefined') {
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(`${path}/${Date.now()}_file`);
      const snapshot = await fileRef.put(fileBlobOrDataUrl);
      const downloadUrl = await snapshot.ref.getDownloadURL();
      return downloadUrl;
    } else {
      // In offline / preview mode, returns the base64 or object URL directly
      return typeof fileBlobOrDataUrl === 'string' 
        ? fileBlobOrDataUrl 
        : URL.createObjectURL(fileBlobOrDataUrl);
    }
  }

  /**
   * Real-time listener for Firestore chat messages
   */
  subscribeToChat(chatId, onMessageReceived) {
    if (this.isLiveConnected && typeof firebase !== 'undefined') {
      const db = firebase.firestore();
      return db.collection('chats').doc(chatId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              onMessageReceived(change.doc.data());
            }
          });
        });
    } else {
      // Local fallback subscriber
      return window.appStorage.subscribe(() => {
        const chat = window.appStorage.getChatById(chatId);
        if (chat && chat.messages.length > 0) {
          const lastMsg = chat.messages[chat.messages.length - 1];
          onMessageReceived(lastMsg);
        }
      });
    }
  }
}

window.firebaseService = new FirebaseService();
