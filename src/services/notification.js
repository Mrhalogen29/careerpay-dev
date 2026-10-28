import API from "./api";

// Get notifications for the logged-in user (optionally unread only)
export const getMyNotifications = async (unreadOnly = false) => {
  const res = await API.get("/notifications", {
    params: unreadOnly ? { unreadOnly: "true" } : {},
  });
  return res.data;
};

// Mark a single notification as read
export const markAsRead = async (id) => {
  const res = await API.patch(`/notifications/${id}/read`);
  window.dispatchEvent(new Event("notifications-changed"));
  return res.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const res = await API.patch("/notifications/read-all");
  window.dispatchEvent(new Event("notifications-changed"));
  return res.data;
};
