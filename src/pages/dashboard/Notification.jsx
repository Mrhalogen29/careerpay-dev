import React, { useState, useEffect } from "react";
import EquityLoading from "../../components/dashboard/EquityLoading";
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  Loader2,
  AlertCircle,
  CreditCard,
  Users,
  Wallet,
  PieChart,
  Settings,
} from "lucide-react";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notification";

const TYPE_ICON = {
  payroll: CreditCard,
  employee: Users,
  financing: Wallet,
  equity: PieChart,
  system: Settings,
};

const TYPE_COLOR = {
  payroll: "bg-blue-100 text-blue-600",
  employee: "bg-green-100 text-green-600",
  financing: "bg-orange-100 text-orange-600",
  equity: "bg-purple-100 text-purple-600",
  system: "bg-gray-100 text-gray-600",
};

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Notification({ setActivePage }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      setError("");
      const res = await getMyNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      } else throw new Error(res.message || "Failed to load notifications.");
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = window.setInterval(() => fetchNotifications(true), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const handleClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
    if (notification.link && setActivePage) {
      setActivePage(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const backButton = (
    <button
      type="button"
      onClick={() => setActivePage("dashboard")}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <ArrowLeft size={18} aria-hidden="true" />
      Back to dashboard
    </button>
  );

  if (loading) {
    return <div className="mx-auto max-w-3xl p-8 lg:p-12">{backButton}<EquityLoading label="Loading notifications…" /></div>;
  }

  return (
    <div className="p-8 lg:p-12 space-y-8 max-w-3xl mx-auto animate-fadeIn">
      {backButton}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Notifications
          </h1>
          <p className="text-gray-500 font-medium">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 bg-white text-gray-700 px-5 py-3 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={16} /> {error}
          <button type="button" onClick={() => fetchNotifications()} className="ml-auto underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || Bell;
              const color = TYPE_COLOR[n.type] || TYPE_COLOR.system;
              return (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left flex items-start gap-4 p-6 hover:bg-gray-50 transition-all ${
                    !n.isRead ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-gray-900">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
