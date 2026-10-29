import { useState, useEffect } from "react";
import {
  Building2,
  CalendarDays,
  Banknote,
  SlidersHorizontal,
  Info,
  Save,
  Loader2,
} from "lucide-react";
import {
  getCompanyDetails,
  updateCompanyDetails,
  updateCompanySettings,
} from "../../services/company";

// Used when a company was created before these settings existed
const DEFAULT_PAYROLL = {
  payFrequency: "monthly",
  payDayRule: "last-working-day",
  paymentDay: 25,
  payWeekday: 5,
  cutoffDay: 25,
  multiCurrencyEnabled: false,
  autoCalculateOnCutoff: true,
  autoApprove: false,
  lockAfterApproval: true,
  allowRetroactiveAdjustments: false,
  approverRole: "founder",
  dataRetentionMonths: 24,
};

const TABS = [
  { id: "profile", title: "Company Profile", icon: Building2 },
  { id: "frequency", title: "Pay Frequency", icon: CalendarDays },
  { id: "currency", title: "Base Currency", icon: Banknote },
  { id: "payroll", title: "Payroll Settings", icon: SlidersHorizontal },
];

const FREQUENCIES = [
  {
    value: "monthly",
    title: "Monthly",
    desc: "Paid once per month - most common",
    badge: "Recommended",
  },
  {
    value: "bi-weekly",
    title: "Bi-Weekly",
    desc: "Paid every two weeks (26 cycles / year)",
    badge: "26 runs/yr",
  },
  {
    value: "weekly",
    title: "Weekly",
    desc: "Paid every week (52 cycles / year)",
    badge: "52 runs/yr",
  },
];

const CURRENCIES = [
  {
    code: "NGN",
    flag: "NG",
    name: "Nigerian Naira (₦)",
    desc: "Primary currency — local statutory compliance",
    badge: "Statutory",
  },
  {
    code: "USD",
    flag: "US",
    name: "US Dollar ($)",
    desc: "For international or remote staff contracts",
  },
  {
    code: "GBP",
    flag: "GB",
    name: "British Pound (£)",
    desc: "For UK-based employees or parent company",
  },
  {
    code: "EUR",
    flag: "EU",
    name: "Euro (€)",
    desc: "For European-contracted employees",
  },
];

const WEEKDAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
];

const INDUSTRIES = [
  { value: "software", label: "Tech" },
  { value: "banking", label: "Banking" },
  { value: "construction", label: "Construction" },
  { value: "manufacturer", label: "Manufacturer" },
];

const APPROVERS = [
  { value: "founder", label: "Founder only" },
  { value: "founder-admin", label: "Founder and Admin" },
];

const MONTH_PAY_DAYS = [1, 5, 10, 15, 20, 25, 28];
const CUTOFF_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
const RETENTION_OPTIONS = [12, 24, 36, 60];

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Style tokens (modelled on the Chrome settings page) ────────────────────
const CARD =
  "bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]";
const ROW =
  "flex items-center justify-between gap-4 px-6 py-3 min-h-[60px] border-b border-[#e8eaed] last:border-b-0";
const CONTROL =
  "h-9 w-full sm:w-[260px] px-3 rounded-lg border border-[#dadce0] bg-white text-sm text-[#202124] outline-none focus:border-[#1D4EFF] focus:ring-1 focus:ring-[#1D4EFF] cursor-pointer";
const INPUT =
  "h-10 w-full px-3 rounded-lg border border-[#dadce0] bg-white text-sm text-[#202124] outline-none focus:border-[#1D4EFF] focus:ring-1 focus:ring-[#1D4EFF]";

// ─── Building blocks ────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <section className="mb-8">
      {title && (
        <h2 className="text-base font-medium text-[#202124] mb-3">{title}</h2>
      )}
      {children}
    </section>
  );
}

function Row({ title, desc, note, children }) {
  return (
    <div className={ROW}>
      <div className="min-w-0">
        <p className="text-sm text-[#202124]">{title}</p>
        {desc && <p className="text-xs text-[#5f6368] mt-0.5">{desc}</p>}
        {note && <p className="text-xs text-amber-700 mt-1">{note}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// Chrome-style switch: slim track with a larger thumb
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-[34px] h-[14px] rounded-full transition-colors ${
        checked ? "bg-[#a8c0ff]" : "bg-[#bdc1c6]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute -top-[3px] left-0 w-5 h-5 rounded-full shadow transition-transform ${
          checked
            ? "translate-x-[14px] bg-[#1D4EFF]"
            : "bg-white border border-[#dadce0]"
        }`}
      />
    </button>
  );
}

function ToggleRow({ title, desc, checked, onChange, disabled, note }) {
  return (
    <Row title={title} desc={desc} note={note}>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </Row>
  );
}

function RadioRow({ selected, onSelect, leading, title, desc, badge }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`${ROW} w-full text-left transition-colors ${
        selected ? "bg-[#f4f8ff]" : "bg-white hover:bg-[#f1f3f4]"
      }`}
    >
      <span className="flex items-center gap-4 min-w-0">
        <span
          className={`shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
            selected ? "border-[#1D4EFF]" : "border-[#5f6368]"
          }`}
        >
          {selected && <span className="w-2 h-2 rounded-full bg-[#1D4EFF]" />}
        </span>
        {leading}
        <span className="min-w-0">
          <span className="block text-sm text-[#202124]">{title}</span>
          <span className="block text-xs text-[#5f6368] mt-0.5">{desc}</span>
        </span>
      </span>
      {badge && (
        <span className="shrink-0 text-xs px-3 py-1 rounded-full bg-[#f1f3f4] text-[#5f6368]">
          {badge}
        </span>
      )}
    </button>
  );
}

function CardFooter({ label, saving, onClick, type = "button" }) {
  return (
    <div className="flex justify-end px-6 py-3 border-t border-[#e8eaed]">
      <button
        type={type}
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-2 h-9 px-5 rounded-full bg-[#1D4EFF] hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="animate-spin" size={15} />
        ) : (
          <Save size={15} />
        )}
        {saving ? "Saving..." : label}
      </button>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CompanySettings() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    industry: "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
  });
  const [payroll, setPayroll] = useState(DEFAULT_PAYROLL);
  const [baseCurrency, setBaseCurrency] = useState("NGN");

  const setP = (patch) => setPayroll((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCompanyDetails();
        if (!res.success) throw new Error("Failed to load company details");
        const c = res.data;
        // Older records may have stored the address as one string
        const addr =
          typeof c.address === "string"
            ? { street: c.address }
            : c.address || {};
        setProfile({
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
          industry: c.industry || "",
          street: addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          country: addr.country || "Nigeria",
          postalCode: addr.postalCode || "",
        });
        setPayroll({ ...DEFAULT_PAYROLL, ...(c.payrollSettings || {}) });
        setBaseCurrency(c.baseCurrency || "NGN");
      } catch (err) {
        console.error("Failed to fetch company details:", err);
        setLoadError(
          err.response?.data?.message || "Failed to load company settings.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const changeTab = (id) => {
    setTab(id);
    setMessage(null);
  };

  // Runs a save, shows the result, never leaves the button stuck
  const runSave = async (request, successText) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await request();
      if (res.success === false) throw new Error(res.message);
      setMessage({ type: "success", text: successText });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to save. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = (e) => {
    e.preventDefault();
    runSave(
      () =>
        updateCompanyDetails({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          industry: profile.industry,
          address: {
            street: profile.street,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            postalCode: profile.postalCode,
          },
        }),
      "Company profile saved.",
    );
  };

  const saveFrequency = () =>
    runSave(
      () =>
        updateCompanySettings({
          payrollSettings: {
            payFrequency: payroll.payFrequency,
            payDayRule: payroll.payDayRule,
            paymentDay: payroll.paymentDay,
            payWeekday: payroll.payWeekday,
            cutoffDay: payroll.cutoffDay,
          },
        }),
      "Pay frequency saved.",
    );

  const saveCurrency = () =>
    runSave(
      () =>
        updateCompanySettings({
          baseCurrency,
          payrollSettings: {
            multiCurrencyEnabled: payroll.multiCurrencyEnabled,
          },
        }),
      "Currency settings saved.",
    );

  // NOTE: these toggles are stored only. Enforcing them (scheduled auto-calculate,
  // locking an approved payroll, retroactive adjustments, approver role) needs
  // wiring into the payroll service. autoApprove is deliberately never sent: it
  // conflicts with the product owner's rule that the founder approves payroll.
  const savePayrollSettings = () =>
    runSave(
      () =>
        updateCompanySettings({
          payrollSettings: {
            autoCalculateOnCutoff: payroll.autoCalculateOnCutoff,
            lockAfterApproval: payroll.lockAfterApproval,
            allowRetroactiveAdjustments: payroll.allowRetroactiveAdjustments,
            approverRole: payroll.approverRole,
            dataRetentionMonths: payroll.dataRetentionMonths,
          },
        }),
      "Payroll settings saved.",
    );

  if (loading)
    return (
      <div className="p-6 text-[#5f6368]">Loading company settings...</div>
    );
  if (loadError)
    return <div className="p-6 text-red-600 font-medium">{loadError}</div>;

  // Pay day dropdown for monthly pay
  const monthDays = [...MONTH_PAY_DAYS];
  if (
    payroll.payDayRule === "day-of-month" &&
    !monthDays.includes(payroll.paymentDay)
  ) {
    monthDays.push(payroll.paymentDay);
    monthDays.sort((a, b) => a - b);
  }
  const payDayValue =
    payroll.payDayRule === "last-working-day"
      ? "last-working-day"
      : `day-${payroll.paymentDay}`;
  const handlePayDay = (v) =>
    v === "last-working-day"
      ? setP({ payDayRule: "last-working-day" })
      : setP({
          payDayRule: "day-of-month",
          paymentDay: Number(v.replace("day-", "")),
        });

  const industryOptions =
    INDUSTRIES.some((i) => i.value === profile.industry) || !profile.industry
      ? INDUSTRIES
      : [...INDUSTRIES, { value: profile.industry, label: profile.industry }];

  return (
    <div className="w-full px-6 py-8 font-[Roboto,'Segoe_UI',Arial,sans-serif] text-[#202124]">
      <div className="mx-auto max-w-[1150px]">
        <header className="mb-8">
          <h1 className="text-[22px] font-normal">Company Settings</h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Configure your payroll structure, currency, and processing
            preferences.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,850px)] gap-8 items-start">
          {/* Left menu */}
          <nav className="space-y-1 lg:sticky lg:top-6">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => changeTab(t.id)}
                  className={`w-full flex items-center gap-4 h-12 px-4 rounded-full text-sm text-left transition-colors ${
                    active
                      ? "bg-[#e1e9ff] text-[#1D4EFF] font-medium"
                      : "text-[#202124] hover:bg-[#f1f3f4]"
                  }`}
                >
                  <Icon size={20} />
                  {t.title}
                </button>
              );
            })}
          </nav>

          {/* Right column */}
          <div className="min-w-0">
            {message && (
              <div
                className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {tab === "profile" && (
              <form onSubmit={saveProfile}>
                <Section title="Company details">
                  <div className={CARD}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Company name" required>
                        <input
                          className={INPUT}
                          required
                          value={profile.name}
                          onChange={(e) =>
                            setProfile({ ...profile, name: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Company email" required>
                        <input
                          className={INPUT}
                          type="email"
                          required
                          value={profile.email}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Phone number">
                        <input
                          className={INPUT}
                          type="tel"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Industry">
                        <select
                          className={`${INPUT} cursor-pointer`}
                          value={profile.industry}
                          onChange={(e) =>
                            setProfile({ ...profile, industry: e.target.value })
                          }
                        >
                          <option value="">Select industry</option>
                          {industryOptions.map((i) => (
                            <option key={i.value} value={i.value}>
                              {i.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Street address">
                          <input
                            className={INPUT}
                            value={profile.street}
                            onChange={(e) =>
                              setProfile({ ...profile, street: e.target.value })
                            }
                          />
                        </Field>
                      </div>
                      <Field label="City">
                        <input
                          className={INPUT}
                          value={profile.city}
                          onChange={(e) =>
                            setProfile({ ...profile, city: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="State">
                        <input
                          className={INPUT}
                          value={profile.state}
                          onChange={(e) =>
                            setProfile({ ...profile, state: e.target.value })
                          }
                        />
                      </Field>
                    </div>
                    <CardFooter
                      type="submit"
                      label="Save profile"
                      saving={saving}
                    />
                  </div>
                </Section>
              </form>
            )}

            {tab === "frequency" && (
              <>
                <div className="flex items-start gap-2 bg-[#e8f0fe] text-[#174ea6] rounded-lg px-4 py-3 text-xs mb-6">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Changes to pay frequency apply from the next{" "}
                    <b>payroll cycle</b>. Existing approved payrolls are
                    unaffected.
                  </span>
                </div>

                <Section title="Payment cycle">
                  <div role="radiogroup" className={CARD}>
                    {FREQUENCIES.map((f) => (
                      <RadioRow
                        key={f.value}
                        selected={payroll.payFrequency === f.value}
                        onSelect={() => setP({ payFrequency: f.value })}
                        title={f.title}
                        desc={f.desc}
                        badge={f.badge}
                      />
                    ))}
                  </div>
                </Section>

                <Section title="Pay schedule">
                  <div className={CARD}>
                    {payroll.payFrequency === "monthly" ? (
                      <Row
                        title="Pay day"
                        desc="When employees receive their salary"
                      >
                        <select
                          className={CONTROL}
                          value={payDayValue}
                          onChange={(e) => handlePayDay(e.target.value)}
                        >
                          <option value="last-working-day">
                            Last working day of the month
                          </option>
                          {monthDays.map((d) => (
                            <option key={d} value={`day-${d}`}>
                              {ordinal(d)} of the month
                            </option>
                          ))}
                        </select>
                      </Row>
                    ) : (
                      <Row
                        title="Pay day"
                        desc="The weekday employees receive their salary"
                      >
                        <select
                          className={CONTROL}
                          value={payroll.payWeekday}
                          onChange={(e) =>
                            setP({ payWeekday: Number(e.target.value) })
                          }
                        >
                          {WEEKDAYS.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </Row>
                    )}
                    <Row
                      title="Payroll cutoff day"
                      desc="Deadline for additions or changes before processing"
                    >
                      <select
                        className={CONTROL}
                        value={payroll.cutoffDay}
                        onChange={(e) =>
                          setP({ cutoffDay: Number(e.target.value) })
                        }
                      >
                        {CUTOFF_DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Row>
                    <CardFooter
                      label="Save pay frequency"
                      saving={saving}
                      onClick={saveFrequency}
                    />
                  </div>
                </Section>
              </>
            )}

            {tab === "currency" && (
              <>
                <Section title="Primary currency">
                  <div role="radiogroup" className={CARD}>
                    {CURRENCIES.map((c) => (
                      <RadioRow
                        key={c.code}
                        selected={baseCurrency === c.code}
                        onSelect={() => setBaseCurrency(c.code)}
                        leading={
                          <span className="shrink-0 w-9 h-9 rounded-lg bg-[#f1f3f4] text-xs font-bold text-[#202124] flex items-center justify-center">
                            {c.flag}
                          </span>
                        }
                        title={c.name}
                        desc={c.desc}
                        badge={c.badge}
                      />
                    ))}
                  </div>
                </Section>

                <Section title="Multi-currency">
                  <div className={CARD}>
                    <ToggleRow
                      title="Enable multi-currency payroll"
                      desc="Allow individual employees to be paid in a different currency to the base"
                      checked={payroll.multiCurrencyEnabled}
                      onChange={(v) => setP({ multiCurrencyEnabled: v })}
                    />
                    <CardFooter
                      label="Save currency settings"
                      saving={saving}
                      onClick={saveCurrency}
                    />
                  </div>
                </Section>
              </>
            )}

            {tab === "payroll" && (
              <>
                <Section title="Workflow automation">
                  <div className={CARD}>
                    <ToggleRow
                      title="Auto-calculate on cutoff date"
                      desc="System calculates payroll automatically when cutoff is reached"
                      checked={payroll.autoCalculateOnCutoff}
                      onChange={(v) => setP({ autoCalculateOnCutoff: v })}
                    />
                    <ToggleRow
                      title="Auto-approve payroll"
                      desc="Skip manual approval — not recommended for most teams"
                      checked={false}
                      disabled
                      onChange={() => {}}
                      note="Unavailable: payroll must be approved by the founder."
                    />
                    <ToggleRow
                      title="Lock payroll after approval"
                      desc="Prevent edits once payroll has been approved"
                      checked={payroll.lockAfterApproval}
                      onChange={(v) => setP({ lockAfterApproval: v })}
                    />
                    <ToggleRow
                      title="Allow retroactive adjustments"
                      desc="Enable corrections to previous pay periods"
                      checked={payroll.allowRetroactiveAdjustments}
                      onChange={(v) => setP({ allowRetroactiveAdjustments: v })}
                    />
                  </div>
                </Section>

                <Section title="Approval & access">
                  <div className={CARD}>
                    <Row
                      title="Who can approve payroll"
                      desc="Minimum role required to approve a payroll run"
                    >
                      <select
                        className={CONTROL}
                        value={payroll.approverRole}
                        onChange={(e) => setP({ approverRole: e.target.value })}
                      >
                        {APPROVERS.map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </Row>
                    <Row
                      title="Data retention period"
                      desc="How long historical payroll records are stored"
                    >
                      <select
                        className={CONTROL}
                        value={payroll.dataRetentionMonths}
                        onChange={(e) =>
                          setP({ dataRetentionMonths: Number(e.target.value) })
                        }
                      >
                        {RETENTION_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m} months
                          </option>
                        ))}
                      </select>
                    </Row>
                    <CardFooter
                      label="Save payroll settings"
                      saving={saving}
                      onClick={savePayrollSettings}
                    />
                  </div>
                </Section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
