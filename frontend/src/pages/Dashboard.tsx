import { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { formatCurrency, getCurrentMonth } from "../utils/formatters";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Building,
  ShieldCheck,
  Briefcase,
  Plane,
  Users,
  DollarSign,
  CreditCard,
  Map,
  Loader2,
} from "lucide-react";
import Datepicker from "react-tailwindcss-datepicker";
import { useData } from "../context/DataContext";

export default function Dashboard() {
  const { dashboardData, dashboardLoading, fetchDashboard } = useData();
  const { start, end } = getCurrentMonth();
  const [dateRange, setDateRange] = useState<any>({
    startDate: new Date(start),
    endDate: new Date(end),
  });
  useEffect(() => {
    const params: Record<string, unknown> = {};
    if (dateRange?.startDate) params.dateFrom = dateRange.startDate.toISOString();
    if (dateRange?.endDate) params.dateTo = dateRange.endDate.toISOString();
    fetchDashboard(params);
  }, [dateRange, fetchDashboard]);

  const stats = useMemo(() => {
    const d = dashboardData;
    const MONTH_NAMES = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    return {
      totalIngresos: d?.totalRevenue ?? 0,
      monthIngresos: d?.monthlyRevenue ?? 0,
      totalPendiente: d?.pendingBalance ?? 0,
      PendienteCount: d?.pendingCount ?? 0,
      totalProveedores: d?.suppliersTotal ?? 0,
      totalClients: d?.totalClients ?? 0,
      activeClients: d?.activeClients ?? 0,
      totalFlights: d?.totalFlights ?? 0,
      hotelesCount: d?.categoryBreakdown?.hoteles?.count ?? 0,
      hotelesIngresos: d?.categoryBreakdown?.hoteles?.revenue ?? 0,
      segurosCount: d?.categoryBreakdown?.seguros_viaje?.count ?? 0,
      segurosIngresos: d?.categoryBreakdown?.seguros_viaje?.revenue ?? 0,
      planesCount: d?.categoryBreakdown?.planes?.count ?? 0,
      planesIngresos: d?.categoryBreakdown?.planes?.revenue ?? 0,
      supplierCount: d?.supplierCount ?? 0,
      yearlyTrendData: MONTH_NAMES.map((monthName, index) => {
        const monthNum = index + 1;
        const apiMonth = d?.monthlyTrend?.find((m) => m.month === monthNum);
        return {
          name: monthName,
          current: apiMonth?.currentYear ?? 0,
          previous: apiMonth?.previousYear ?? 0,
        };
      }),
      recentSales: d?.recentSales ?? [],
      carteraData: d?.carteraStatus ?? [
        { name: "Pagado", value: 0, color: "#10b981" },
        { name: "Abonado", value: 0, color: "#3b82f6" },
        { name: "Pendiente", value: 0, color: "#f59e0b" },
      ],
      categoryDist: d?.categoryDistribution ?? [],
    };
  }, [dashboardData]);

  const CARTERA_COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

  return (
    <div className="space-y-6">
      {/* Header de Sección */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            Panel de Control
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Resumen general de operaciones, ingresos y estado de cartera.
          </p>
        </div>
        <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-gray-200 relative z-20">
          <div className="w-72">
            <Datepicker
              value={dateRange as any}
              onChange={(newValue: any) => setDateRange(newValue)}
              showShortcuts={true}
              primaryColor={"blue"}
              displayFormat={"DD/MMM/YYYY"}
              placeholder={"Selecciona un periodo"}
              separator={" - "}
              inputClassName="w-full text-xs font-bold text-gray-600 bg-gray-50 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      {dashboardLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "OPERACIONES",
              value: stats.totalFlights,
              subtitle: "Tiquetes Emitidos",
              detail: "",
              icon: <Plane size={22} />,
              color: "text-blue-600",
              bg: "bg-blue-100",
            },
            {
              label: "CLIENTES",
              value: stats.totalClients,
              subtitle: "Total Registrados",
              detail: `${stats.activeClients} Activos`,
              icon: <Users size={22} />,
              color: "text-indigo-600",
              bg: "bg-indigo-100",
            },
            {
              label: "INGRESOS BRUTOS",
              value: formatCurrency(stats.totalIngresos),
              subtitle: "Ventas Totales",
              detail: `+${formatCurrency(stats.monthIngresos)} en el periodo`,
              icon: <DollarSign size={22} />,
              color: "text-emerald-600",
              bg: "bg-emerald-100",
            },
            {
              label: "PENDIENTES",
              value: formatCurrency(stats.totalPendiente),
              subtitle: "Cuentas por Cobrar",
              detail: `${stats.PendienteCount} transacciones`,
              icon: <CreditCard size={22} />,
              color: "text-orange-600",
              bg: "bg-orange-100",
            },
            {
              label: "PROVEEDORES",
              value: formatCurrency(stats.totalProveedores),
              subtitle: "Costos Operativos",
              detail: `${stats.supplierCount} activos`,
              icon: <Briefcase size={22} />,
              color: "text-rose-600",
              bg: "bg-rose-100",
            },
            {
              label: "HOTELES",
              value: stats.hotelesCount,
              subtitle: "Reservas Generadas",
              detail: `Ingresos: ${formatCurrency(stats.hotelesIngresos)}`,
              icon: <Building size={22} />,
              color: "text-cyan-600",
              bg: "bg-cyan-100",
            },
            {
              label: "SEGUROS",
              value: stats.segurosCount,
              subtitle: "Pólizas Emitidas",
              detail: `Ingresos: ${formatCurrency(stats.segurosIngresos)}`,
              icon: <ShieldCheck size={22} />,
              color: "text-violet-600",
              bg: "bg-violet-100",
            },
            {
              label: "PLANES",
              value: stats.planesCount,
              subtitle: "Paquetes Turísticos",
              detail: `Ingresos: ${formatCurrency(stats.planesIngresos)}`,
              icon: <Map size={22} />,
              color: "text-fuchsia-600",
              bg: "bg-fuchsia-100",
            },
          ].map((kpi, i) => (
            <Card
              key={i}
              className="hover:shadow-lg transition-all duration-300 border border-gray-200 shadow-md bg-white rounded-xl"
            >
              <CardBody className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {kpi.label}
                    </p>
                    <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>
                      {kpi.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-1">
                    {kpi.value}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500 font-medium truncate">
                    {kpi.subtitle}
                  </span>
                  {kpi.detail && (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50/80 px-2 py-1 rounded-md whitespace-nowrap">
                      {kpi.detail}
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Charts — containers always in DOM, ResponsiveContainer only when ready */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            Comparativa de Ingresos (Año Anterior vs Actual)
          </CardHeader>
          <CardBody>
            <div className="h-64 w-full mt-2">
              {!dashboardLoading && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.yearlyTrendData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#032650" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#032650" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} width={80} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                    <Area type="monotone" dataKey="current" name="Año Actual" stroke="#032650" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" activeDot={{ r: 6, fill: "#032650", stroke: "#fff", strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="previous" name="Año Anterior" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Estado de Cartera</CardHeader>
          <CardBody>
            <div className="relative h-48 flex items-center justify-center mt-2">
              {!dashboardLoading && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.carteraData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
                      {stats.carteraData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CARTERA_COLORS[index % CARTERA_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "8px 12px" }} itemStyle={{ color: "#032650", fontWeight: "900", fontSize: "14px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total</span>
                <span className="text-lg font-black text-primary">{formatCurrency(stats.totalIngresos)}</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {stats.carteraData.map((item: any, i: number) => (
                <div key={i} className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: CARTERA_COLORS[i] }} />
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider truncate">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-gray-800 truncate w-full text-center">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>Ultimas Ventas</CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Asesor</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dashboardLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin inline-block" />
                  </td>
                </tr>
              ) : (
                stats.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{sale.clientName}</td>
                    <td className="px-4 py-3">{sale.asesorName}</td>
                    <td className="px-4 py-3">{sale.date}</td>
                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.status === "pagado"
                            ? "bg-green-100 text-green-800"
                            : sale.status === "abonado"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
