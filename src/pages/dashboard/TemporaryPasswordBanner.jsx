import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { changePassword } from "../../services/auth";

const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function TemporaryPasswordBanner({ user, onDone }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("tempPwBannerDismissed") === "1";
    } catch {
      return false;
    }
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user?.mustChangePassword || (dismissed && !open && !success)) {
    return null;
  }

  const later = () => {
    try {
      sessionStorage.setItem("tempPwBannerDismissed", "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!STRONG.test(form.next)) {
      setError(
        "New password must be at least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.",
      );
      return;
    }
    if (form.next !== form.confirm) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        currentPassword: form.current,
        newPassword: form.next,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not change password",
      );
    } finally {
      setSaving(false);
    }
  };

  const input =
    "w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm";

  return (
    <>
      {!open && !success && (
        <div className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex items-center gap-2">
            <KeyRound size={18} />
            <span>
              You are using a temporary password. Change it now to secure your
              account.
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Change password
            </button>
            <button
              onClick={later}
              className="rounded-lg border border-amber-300 px-4 py-2 font-medium hover:bg-amber-100"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {(open || success) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {success ? (
              <div className="text-center">
                <h2 className="mb-2 text-lg font-bold text-gray-900">
                  Password changed
                </h2>
                <p className="mb-6 text-sm text-gray-600">
                  Please sign in again with your new password.
                </p>
                <button
                  onClick={onDone}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Sign in
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Change your password
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <input
                  type="password"
                  placeholder="Temporary (current) password"
                  value={form.current}
                  onChange={(e) =>
                    setForm({ ...form, current: e.target.value })
                  }
                  className={input}
                  required
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={form.next}
                  onChange={(e) => setForm({ ...form, next: e.target.value })}
                  className={input}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                  className={input}
                  required
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save new password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
