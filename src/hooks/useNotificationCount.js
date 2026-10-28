import { useEffect, useState } from "react";
import { getMyNotifications } from "../services/notification";

export default function useNotificationCount(userId) {
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    let active = true;
    const refresh = () => getMyNotifications(true).then((response) => {
      if (active && response.success) setUnreadCount(response.unreadCount || 0);
    }).catch(() => { /* Errors are shown on the notifications page. */ });
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("notifications-changed", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("notifications-changed", refresh);
    };
  }, [userId]);
  return unreadCount;
}
