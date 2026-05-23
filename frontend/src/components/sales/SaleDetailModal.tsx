import { useState, useEffect } from "react";
import {
  Plane,
  Building2,
  ShieldCheck,
  Package,
  Luggage,
  FileInput,
  Smartphone,
  Car,
  TreePine,
  Compass,
  Music,
  UtensilsCrossed,
  FileText,
  PawPrint,
  ShoppingBag,
  Loader2,
  AlertCircle
} from "lucide-react";
import * as api from "../../api";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Sale, Client } from "../../types";

const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  Tiquetería: <Plane size={16} className="text-primary" />,
  Hotelería: <Building2 size={16} className="text-primary" />,
  Seguros: <ShieldCheck size={16} className="text-primary" />,
  Planes: <Package size={16} className="text-primary" />,
  CheckIn: <Luggage size={16} className="text-primary" />,
  Migración: <FileInput size={16} className="text-primary" />,
  SimCard: <Smartphone size={16} className="text-primary" />,
  AlquilerAutos: <Car size={16} className="text-primary" />,
  Finca: <TreePine size={16} className="text-primary" />,
  Tour: <Compass size={16} className="text-primary" />,
  Evento: <Music size={16} className="text-primary" />,
  Restaurante: <UtensilsCrossed size={16} className="text-primary" />,
  Visa: <FileText size={16} className="text-primary" />,
  Pasaporte: <FileText size={16} className="text-primary" />,
  Mascotas: <PawPrint size={16} className="text-primary" />,
};

function getProductDetails(type: string, data: any[]): { label: string; count: number } {
  const arr = data || [];
  return { label: type, count: arr.length };
}

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSale: Sale | null;
  clients: Client[];
  onViewProductDetails: (product: { type: string; data: any[] }) => void;
}

export default function SaleDetailModal({
  isOpen,
  onClose,
  selectedSale,
  clients,
  onViewProductDetails,
}: SaleDetailModalProps) {
  const [fullSale, setFullSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && selectedSale) {
      setLoading(true);
      setError("");
      api.getSale(selectedSale.id).then(fetched => {
        setFullSale(fetched);
      }).catch(() => {
        setFullSale(selectedSale);
        setError("No se pudieron cargar los detalles completos");
      }).finally(() => setLoading(false));
    } else {
      setFullSale(null);
    }
  }, [isOpen, selectedSale]);

  if (!selectedSale) return null;

  const sale = fullSale || selectedSale;
  const client = clients.find((c) => c.id === sale.clientId);
  const commissionAmount = sale.commissionAgentNetPayment || 0;
  const supplierCost = sale.supplierCost || 0;
  const gananciaNeta = sale.total - supplierCost - commissionAmount;

  const productSections = [
    { key: "ticketData", label: "Tiquetería" },
    { key: "hotelData", label: "Hotelería" },
    { key: "insuranceData", label: "Seguros" },
    { key: "planData", label: "Planes" },
    { key: "checkInData", label: "CheckIn" },
    { key: "migrationData", label: "Migración" },
    { key: "simCardData", label: "SimCard" },
    { key: "carRentalData", label: "AlquilerAutos" },
    { key: "fincaData", label: "Finca" },
    { key: "tourData", label: "Tour" },
    { key: "conventionData", label: "Evento" },
    { key: "restaurantData", label: "Restaurante" },
    { key: "visaData", label: "Visa" },
    { key: "passportData", label: "Pasaporte" },
    { key: "petServiceData", label: "Mascotas" },
  ];

  const hasAnyProduct = productSections.some(
    ({ key }) => (sale as any)[key] && (sale as any)[key].length > 0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Venta #${sale.id}`}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Sección Venta */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
            Información de la Venta
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <span className="text-gray-500 text-xs block">Venta #</span>
              <span className="font-bold text-gray-800">{sale.id}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Fecha</span>
              <span className="font-medium text-gray-800">
                {formatDate(sale.date)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Estado</span>
              <Badge variant={sale.status}>{sale.status}</Badge>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Valor Final</span>
              <span className="font-black text-emerald-600">
                {formatCurrency(sale.total)}
              </span>
            </div>
            {sale.isCredit && sale.creditDueDate && (
              <div className="col-span-2 sm:col-span-1">
                <span className="text-gray-500 text-xs block">Vence Crédito</span>
                <span className="font-medium text-rose-600">
                  {formatDate(sale.creditDueDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sección Cliente */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
            Detalles del Cliente
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="col-span-2 sm:col-span-1">
              <span className="text-gray-500 text-xs block">Nombre</span>
              <span className="font-medium text-gray-800">
                {sale.clientName}
              </span>
            </div>
            {client ? (
              <>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs block">Documento</span>
                  <span className="font-medium text-gray-800">
                    {client.docType} {client.docNumber}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs block">Correo</span>
                  <span className="font-medium text-gray-800 break-words">
                    {client.email}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs block">Teléfono</span>
                  <span className="font-medium text-gray-800">
                    {client.phone}
                  </span>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-sm text-gray-400 italic flex items-center">
                Detalles adicionales del cliente no disponibles
              </div>
            )}
          </div>
        </div>

        {/* Sección Operativo y Financiero */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
            Detalles Operativos y Financieros
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <span className="text-gray-500 text-xs block">
                Asesor
              </span>
              <span className="font-medium text-gray-800">
                {sale.asesorName}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">
                Pago a Proveedores
              </span>
              <span className="font-medium text-rose-600">
                {formatCurrency(supplierCost)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Pago Comisionista</span>
              <span className="font-medium text-amber-600">
                {formatCurrency(commissionAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Ganancia Oficina</span>
              <span className="font-bold text-emerald-600">
                {formatCurrency(gananciaNeta)}
              </span>
            </div>
          </div>
        </div>

        {/* Sección Comisionista */}
        {(sale.commissionAgentName || commissionAmount > 0) && (
          <div>
            <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
              Detalles del Comisionista
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div>
                <span className="text-gray-500 text-xs block">Nombre</span>
                <span className="font-medium text-gray-800">
                  {sale.commissionAgentName || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">% Retención Oficina</span>
                <span className="font-medium text-gray-800">
                  {sale.commissionAgentRetentionPercentage || 0}%
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Neto a Pagar</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency(commissionAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Servicios Vendidos */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3 flex items-center gap-2">
            <ShoppingBag size={16} className="text-accent" /> Desglose de Servicios
          </h4>
          {loading ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 justify-center">
              <Loader2 size={18} className="animate-spin text-accent" />
              <span className="text-sm text-gray-500 font-medium">Cargando servicios de esta venta...</span>
            </div>
          ) : !hasAnyProduct ? (
            <p className="text-sm text-gray-400 italic p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No hay servicios registrados para esta venta.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productSections.map(({ key, label }) => {
                const data = (sale as any)[key];
                if (!data || data.length === 0) return null;
                return (
                  <div key={key} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      {PRODUCT_ICONS[label] || <ShoppingBag size={16} className="text-primary" />}
                      {label} ({data.length})
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onViewProductDetails({
                          type: label,
                          data,
                        })
                      }
                    >
                      Ver Detalles
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Observaciones */}
        {sale.observations && sale.observations.trim() !== "" && (
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Observaciones Adicionales
            </h5>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
              {sale.observations.split("\n---\n").pop()}
            </p>
          </div>
        )}

        {/* Historial de Pagos */}
        {loading ? (
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Historial de Pagos
            </h5>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 justify-center">
              <Loader2 size={18} className="animate-spin text-accent" />
              <span className="text-sm text-gray-500 font-medium">Cargando pagos...</span>
            </div>
          </div>
        ) : (sale as any).payments && (sale as any).payments.length > 0 ? (
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Historial de Pagos
            </h5>
            <div className="space-y-2">
              {(sale as any).payments.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                  <span className="font-bold text-gray-800">{formatCurrency(p.amount)}</span>
                  <span className="text-xs text-gray-500">{p.method} · {formatDate(p.date)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
