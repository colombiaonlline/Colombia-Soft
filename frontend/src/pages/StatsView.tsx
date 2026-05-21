import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { formatCurrency } from "../utils/formatters";
import { Users, Award, PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { getTopClients, getAsesorPerformance, getCategoryDistribution } from "../api/stats";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl p-4 min-w-[160px]">
      {label && (
        <p className="text-sm font-black text-gray-800 mb-3 border-b border-gray-100 pb-2">
          {label}
        </p>
      )}
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => {
          const nameStr = (entry.name || "").toLowerCase();
          const isCount =
            nameStr.includes("cantidad") || nameStr.includes("vendidos");

          let displayValue = entry.value;
          if (!isCount) {
            displayValue = formatCurrency(entry.value);
          }

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-6 text-xs font-medium"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-gray-600">{entry.name || "Valor"}:</span>
              </div>
              <span className="font-bold text-gray-900">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopClients() {
  const [data, setData] = useState<{ name: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTopClients({ limit: 8 })
      .then((res) => {
        if (!cancelled) {
          setData((res as any[]).map((c: any) => ({
            name: c.clientName,
            total: c.totalPagado,
          })));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="h-72 w-full mt-2">
      {loading ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          No hay datos de clientes
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradientClient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
            <Bar
              dataKey="total"
              name="Total Invertido"
              radius={[0, 6, 6, 0] as any}
              barSize={22}
              background={{ fill: "#f1f5f9", radius: [0, 6, 6, 0] as any }}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill="url(#gradientClient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function TopAsesores() {
  const [data, setData] = useState<{ name: string; total: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAsesorPerformance()
      .then((res) => {
        if (!cancelled) {
          const mapped = (res as any[])
            .map((a: any) => ({
              name: a.asesorName,
              total: a.totalIngresos,
              count: a.totalVentas,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 6);
          setData(mapped);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="h-80 w-full mt-4">
      {loading ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          No hay datos de asesores
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradientAsesor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} dy={10} />
            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} iconType="circle" />
            <Bar yAxisId="left" dataKey="total" name="Ingresos Generados" fill="url(#gradientAsesor)" radius={[6, 6, 0, 0] as any} maxBarSize={45} />
            <Line yAxisId="right" type="monotone" dataKey="count" name="Ventas (Cantidad)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function CategoryDistribution() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCategoryDistribution()
      .then((res) => {
        if (!cancelled) {
          setData((res as any[]).filter((d: any) => d.value > 0));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const COLORS = ["#3b82f6", "#0ea5e9", "#10b981", "#8b5cf6", "#f43f5e"];

  return (
    <div className="h-72 w-full mt-2">
      {loading ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          No hay ventas registradas
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={75} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function StatsView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="w-full shadow-lg border-gray-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Rendimiento de Asesores (Ingresos vs Volumen)
          </div>
        </CardHeader>
        <CardBody>
          <TopAsesores />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md border-gray-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Top Clientes (Inversión)
            </div>
          </CardHeader>
          <CardBody>
            <TopClients />
          </CardBody>
        </Card>

        <Card className="shadow-md border-gray-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" />
              Distribución de Ventas por Categoría
            </div>
          </CardHeader>
          <CardBody>
            <CategoryDistribution />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
