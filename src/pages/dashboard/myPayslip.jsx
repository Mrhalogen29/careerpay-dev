import { useEffect, useState } from "react";
import { getMyPayslips } from "../../services/myPayslips";

const money = (n, cur = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n || 0);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const label = (p) => `${MONTHS[p.month - 1]} ${p.year}`;

export default function MyPayslip() {
  const [slips, setSlips] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyPayslips();
        setSlips(res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Could not load your payslips");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (slips.length === 0)
    return <div className="p-6">You have no paid payslips yet.</div>;

  const s = slips[index];
  const totalDeductions =
    s.deductions.tax + s.deductions.pension + s.deductions.nhf +
    s.deductions.loanRepayment + s.deductions.other;

  const Row = ({ name, value, strong }) => (
    <div className={`flex justify-between py-2 border-b border-gray-100 ${strong ? "font-bold" : ""}`}>
      <span>{name}</span>
      <span>{money(value, s.currency)}</span>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <h1 className="text-xl font-bold">My Payslips</h1>
        <div className="flex gap-2">
          <select
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {slips.map((x, i) => (
              <option key={x.payrollId} value={i}>{label(x.period)}</option>
            ))}
          </select>
          <button onClick={() => window.print()} className="border rounded-lg px-3 py-2 text-sm">
            Print
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold mb-1">Payslip for {label(s.period)}</h2>
        {s.paymentDate && (
          <p className="text-xs text-gray-500 mb-4">
            Paid on {new Date(s.paymentDate).toLocaleDateString()}
            {s.paymentReference ? ` · Ref ${s.paymentReference}` : ""}
          </p>
        )}

        <Row name="Base salary" value={s.baseSalary} />
        {s.additions.bonus > 0 && <Row name="Bonus" value={s.additions.bonus} />}
        {s.additions.allowances > 0 && <Row name="Allowances" value={s.additions.allowances} />}
        {s.additions.overtime > 0 && <Row name="Overtime (untaxed)" value={s.additions.overtime} />}
        <Row name="Gross pay" value={s.grossSalary} strong />

        <Row name="Tax" value={s.deductions.tax} />
        <Row name="Pension" value={s.deductions.pension} />
        <Row name="NHF" value={s.deductions.nhf} />
        {s.deductions.loanRepayment > 0 && (
          <Row name="Loan repayment" value={s.deductions.loanRepayment} />
        )}
        {s.deductions.other > 0 && <Row name="Other deductions" value={s.deductions.other} />}
        <Row name="Total deductions" value={totalDeductions} strong />

        <div className="flex justify-between pt-4 text-lg font-black">
          <span>Net pay</span>
          <span>{money(s.netSalary, s.currency)}</span>
        </div>
      </div>
    </div>
  );
}