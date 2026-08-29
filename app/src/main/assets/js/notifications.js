/**
 * Family App - Web Push Notification & In-App Toast Dispatcher
 */

class NotificationManager {
  constructor() {
    this.toastTimer = null;
  }

  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showToast(
          window.i18n.t('pushActive'),
          'تم تفعيل إشعارات Family App بنجاح'
        );
        return true;
      }
    }
    this.showToast('Family App', 'الإشعارات مفعلة عبر التطبيق الداخلي');
    return false;
  }

  showPush(title, body, icon = null) {
    // 1. Web Push Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          icon: icon || 'res/drawable/ic_family_logo.jpg'
        });
      } catch (e) {}
    }

    // 2. In-App Banner
    this.showToast(title, body);
  }

  showToast(title, message) {
    const toast = document.getElementById('in-app-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastBody = document.getElementById('toast-body');

    if (!toast || !toastTitle || !toastBody) return;

    if (this.toastTimer) clearTimeout(this.toastTimer);

    toastTitle.textContent = title;
    toastBody.textContent = message;

    toast.classList.add('show');

    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }
}

window.notifications = new NotificationManager();
