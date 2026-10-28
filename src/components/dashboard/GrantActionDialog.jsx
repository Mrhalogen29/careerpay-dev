import { useEffect, useRef, useState } from "react";
import { deleteEquityGrant, updateEquityGrant } from "../../services/equity";
import EquityLoading from "./EquityLoading";

export default function GrantActionDialog({ mode, grant, employeeName, onClose, onSaved, onDeleted }) {
  const dialogRef = useRef(null);
  const pendingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    strikePrice: grant.strikePrice ?? "",
    currentFMV: grant.currentFMV ?? "",
    notes: grant.notes ?? "",
    status: grant.status ?? "active",
    reason: "",
  });
  const deleting = mode === "delete";
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  function change(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (pendingRef.current) return;
    setError("");
    if (deleting && !form.reason.trim()) {
      setError("Enter a reason for deleting this grant.");
      return;
    }
    const payload = { notes: form.notes, status: form.status };
    if (!deleting) {
      for (const field of ["strikePrice", "currentFMV"]) {
        if (String(form[field]).trim() === "") {
          if (grant[field] != null) {
            setError("Prices cannot be cleared. Enter a non-negative amount.");
            return;
          }
          continue;
        }
        const value = Number(form[field]);
        if (!Number.isFinite(value) || value < 0) {
          setError("Prices must be valid non-negative amounts.");
          return;
        }
        payload[field] = value;
      }
    }
    pendingRef.current = true;
    setSaving(true);
    try {
      const response = deleting
        ? await deleteEquityGrant(grant._id, form.reason.trim())
        : await updateEquityGrant(grant._id, payload);
      if (!response?.success) throw new Error(response?.message || "The change could not be saved.");
      // Require explicit deletion acknowledgement rather than treating the old
      // termination-only endpoint as a successful permanent deletion.
      if (deleting && response.deleted !== true) throw new Error("The server did not confirm permanent deletion. Refresh the grant before trying again.");
      if (deleting) onDeleted(grant._id);
      else onSaved(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      pendingRef.current = false;
      setSaving(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600";
  return (
    <dialog ref={dialogRef} aria-labelledby="grant-action-title" aria-describedby="grant-action-description" onCancel={(event) => { event.preventDefault(); if (!pendingRef.current) onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/50 sm:p-8">
      <h2 id="grant-action-title" className="text-2xl font-semibold">{deleting ? "Delete grant" : "Adjust grant"}</h2>
      <p id="grant-action-description" className="mt-2 text-sm text-gray-600">{employeeName} · Grant {grant._id}</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} aria-busy={saving} className="mt-6">
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
          {deleting ? <>
            <p>This permanently deletes this grant and its vesting schedule. This cannot be undone.</p>
            <label className="block text-sm font-medium">Reason for deletion<textarea name="reason" required maxLength={2000} value={form.reason} onChange={change} rows={3} className={inputClass} /></label>
          </> : <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Strike price (₦)<input name="strikePrice" type="number" min="0" step="any" value={form.strikePrice} onChange={change} className={inputClass} /></label>
              <label className="block text-sm font-medium">Fair market value (₦)<input name="currentFMV" type="number" min="0" step="any" value={form.currentFMV} onChange={change} className={inputClass} /></label>
            </div>
            <label className="block text-sm font-medium">Status<select name="status" value={form.status} onChange={change} className={inputClass}>{(["pending", "declined"].includes(grant.status) ? [grant.status, "terminated", "cancelled"] : ["active", "fully_vested", "terminated", "cancelled"]).map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>
            <label className="block text-sm font-medium">Notes<textarea name="notes" maxLength={5000} value={form.notes} onChange={change} rows={4} className={inputClass} /></label>
            <p className="text-sm text-gray-500">The share count and vesting schedule are fixed for this grant.</p>
          </>}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-5 py-2 hover:bg-gray-50">Cancel</button>
            <button type="submit" className={`rounded-lg px-5 py-2 font-semibold text-white ${deleting ? "bg-red-700 hover:bg-red-800" : "bg-[#0B2545] hover:bg-blue-900"}`}>{saving ? <EquityLoading inline label={deleting ? "Deleting grant…" : "Saving changes…"} /> : deleting ? "Delete grant permanently" : "Save changes"}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
