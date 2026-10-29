import useModuleAccess from "../hooks/useModuleAccess";

const LABELS = {
  payroll: "Payroll",
  financing: "Financing",
  esop: "ESOP",
};

// module: "payroll"  or  ["financing", "payroll"] (all are required)
const ModuleGuard = ({ module, children }) => {
  const { loading, hasModule } = useModuleAccess();
  const needed = Array.isArray(module) ? module : [module];

  if (loading) {
    return <div className="p-8 text-gray-500">Loading…</div>;
  }

  if (needed.some((m) => !hasModule(m))) {
    const names = needed.map((m) => LABELS[m] || m).join(" and ");
    return (
      <div className="flex items-center justify-center p-8">
        <div className="max-w-md bg-white rounded-2xl shadow p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            {needed.length > 1
              ? `This feature needs ${names}`
              : `${names} is not in your plan`}
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Your current subscription does not include everything this needs. It
            can be added when your subscription renews.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ModuleGuard;
