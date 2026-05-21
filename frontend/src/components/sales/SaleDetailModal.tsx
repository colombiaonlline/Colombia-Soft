import {
  Plane,
  Building2,
  ShieldCheck,
  Package,
  ShoppingBag,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Sale, Client } from "../../types";

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
  if (!selectedSale) return null;

  const client = clients.find((c) => c.id === selectedSale.clientId);
  const commissionAmount = selectedSale.commissionAgentNetPayment || 0;
  const supplierCost = selectedSale.supplierCost || 0;
  const gananciaNeta = selectedSale.total - supplierCost - commissionAmount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Venta #${selectedSale.id}`}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Sección Venta */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
            Información de la Venta
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <span className="text-gray-500 text-xs block">Venta #</span>{" "}
              <span className="font-bold text-gray-800">{selectedSale.id}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Fecha</span>{" "}
              <span className="font-medium text-gray-800">
                {formatDate(selectedSale.date)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Estado</span>{" "}
              <Badge variant={selectedSale.status}>{selectedSale.status}</Badge>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Valor Final</span>{" "}
              <span className="font-black text-emerald-600">
                {formatCurrency(selectedSale.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Sección Cliente */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
            Detalles del Cliente
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="col-span-2 sm:col-span-1">
              <span className="text-gray-500 text-xs block">Nombre</span>{" "}
              <span className="font-medium text-gray-800">
                {selectedSale.clientName}
              </span>
            </div>
            {client ? (
              <>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs block">Documento</span>{" "}
                  <span className="font-medium text-gray-800">
                    {client.docType} {client.docNumber}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs block">Correo</span>{" "}
                  <span className="font-medium text-gray-800 break-words">
                    {client.email}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs block">Teléfono</span>{" "}
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
              </span>{" "}
              <span className="font-medium text-gray-800">
                {selectedSale.asesorName}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">
                Pago a Proveedores
              </span>{" "}
              <span className="font-medium text-rose-600">
                {formatCurrency(supplierCost)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Pago Comisionista</span>{" "}
              <span className="font-medium text-amber-600">
                {formatCurrency(commissionAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Ganancia Oficina</span>{" "}
              <span className="font-bold text-emerald-600">
                {formatCurrency(gananciaNeta)}
              </span>
            </div>
          </div>
        </div>

        {/* Sección Comisionista */}
        {(selectedSale.commissionAgentName || commissionAmount > 0) && (
          <div>
            <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
              Detalles del Comisionista
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div>
                <span className="text-gray-500 text-xs block">Nombre</span>{" "}
                <span className="font-medium text-gray-800">
                  {selectedSale.commissionAgentName || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">% Retención Oficina</span>{" "}
                <span className="font-medium text-gray-800">
                  {selectedSale.commissionAgentRetentionPercentage || 0}%
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Neto a Pagar</span>{" "}
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
            <ShoppingBag size={16} className="text-accent" /> Desglose de
            Servicios
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedSale.ticketData && selectedSale.ticketData.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Plane size={16} className="text-primary" /> Tiquetería (
                  {selectedSale.ticketData.length})
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onViewProductDetails({
                      type: "Tiquetería",
                      data: selectedSale.ticketData!,
                    })
                  }
                >
                  Ver Detalles
                </Button>
              </div>
            )}
            {selectedSale.hotelData && selectedSale.hotelData.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Building2 size={16} className="text-primary" /> Hotelería (
                  {selectedSale.hotelData.length})
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onViewProductDetails({
                      type: "Hotelería",
                      data: selectedSale.hotelData!,
                    })
                  }
                >
                  Ver Detalles
                </Button>
              </div>
            )}
            {selectedSale.insuranceData &&
              selectedSale.insuranceData.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <ShieldCheck size={16} className="text-primary" /> Seguros (
                    {selectedSale.insuranceData.length})
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onViewProductDetails({
                        type: "Seguros",
                        data: selectedSale.insuranceData!,
                      })
                    }
                  >
                    Ver Detalles
                  </Button>
                </div>
              )}
            {selectedSale.planData && selectedSale.planData.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Package size={16} className="text-primary" /> Planes (
                  {selectedSale.planData.length})
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onViewProductDetails({
                      type: "Planes",
                      data: selectedSale.planData!,
                    })
                  }
                >
                  Ver Detalles
                </Button>
              </div>
            )}
          </div>

          {/* Observaciones */}
          {selectedSale.observations &&
            selectedSale.observations.trim() !== "" && (
              <div className="mt-4">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Observaciones Adicionales
                </h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                  {selectedSale.observations.split("\n---\n").pop()}
                </p>
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
}
