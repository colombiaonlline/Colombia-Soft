import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Table, TableRow, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import { Plane, Building2, ShieldCheck, Package } from "lucide-react";

interface ProductDetailsModalProps {
  product: { type: string; data: any[] } | null;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  if (!product) return null;

  const renderContent = () => {
    switch (product.type) {
      case "Tiquetería":
        return product.data.map((ticket, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <h4 className="font-bold text-primary flex items-center gap-2 mb-3 pb-2 border-b">
              <Plane size={16} className="text-accent" /> Ticket #{idx + 1} - {ticket.passengerInfo?.name || "Pasajero"}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div><span className="block text-xs text-gray-500">Aerolínea</span><span className="font-semibold text-sm">{ticket.airline || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Reserva</span><span className="font-semibold text-sm">{ticket.reservationNumber || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Tiquete</span><span className="font-semibold text-sm">{ticket.ticketNumber || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Equipaje</span><span className="font-semibold text-sm truncate" title={ticket.baggagePlan}>{ticket.baggagePlan || "-"}</span></div>
            </div>
            {ticket.legs && ticket.legs.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Trayectos</p>
                {ticket.legs.map((leg: any, lIdx: number) => (
                  <div key={lIdx} className="grid grid-cols-4 gap-2 text-sm mb-1 pb-1 border-b last:border-0 border-gray-200">
                    <div>{leg.origin} <span className="text-gray-400 mx-1">→</span> {leg.destination}</div>
                    <div>{leg.date}</div>
                    <div>Vuelo: {leg.flightNumber || "-"}</div>
                    <div>Asiento: {leg.seat || "-"}</div>
                  </div>
                ))}
              </div>
            )}
            {ticket.flightMode === "round_trip" && ticket.returnLeg && (
              <div className="bg-blue-50/50 rounded-lg p-3 mt-2 border border-blue-100">
                <p className="text-xs font-bold text-blue-600 mb-2 uppercase">Regreso</p>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>{ticket.returnLeg.origin} <span className="text-gray-400 mx-1">→</span> {ticket.returnLeg.destination}</div>
                  <div>{ticket.returnLeg.date}</div>
                  <div>Vuelo: {ticket.returnLeg.flightNumber || "-"}</div>
                  <div>Asiento: {ticket.returnLeg.seat || "-"}</div>
                </div>
              </div>
            )}
          </div>
        ));

      case "Hotelería":
        return product.data.map((hotel, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <h4 className="font-bold text-primary flex items-center gap-2 mb-3 pb-2 border-b">
              <Building2 size={16} className="text-accent" /> Hotel #{idx + 1} - {hotel.hotelName || "Sin Nombre"}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div><span className="block text-xs text-gray-500">Destino</span><span className="font-semibold text-sm">{hotel.destination || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Proveedor</span><span className="font-semibold text-sm">{hotel.supplier || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Reserva</span><span className="font-semibold text-sm">{hotel.reservationNumber || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Fechas</span><span className="font-semibold text-sm">{hotel.startDate} al {hotel.endDate}</span></div>
            </div>
            {hotel.guests && hotel.guests.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Huéspedes ({hotel.guests.length})</p>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  {hotel.guests.map((g: any, i: number) => (
                    <li key={i}>{g.name} <span className="text-xs text-gray-400 ml-1">({g.docType} {g.docNumber})</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ));

      case "Seguros":
        return product.data.map((ins, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <h4 className="font-bold text-primary flex items-center gap-2 mb-3 pb-2 border-b">
              <ShieldCheck size={16} className="text-accent" /> Seguro #{idx + 1} - {ins.supplier || "Sin Proveedor"}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div><span className="block text-xs text-gray-500">Plan</span><span className="font-semibold text-sm">{ins.planName || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Destino</span><span className="font-semibold text-sm">{ins.destination || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Póliza</span><span className="font-semibold text-sm">{ins.policyNumber || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Fechas</span><span className="font-semibold text-sm">{ins.startDate} al {ins.endDate}</span></div>
            </div>
            {ins.passengers && ins.passengers.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Asegurados ({ins.passengers.length})</p>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  {ins.passengers.map((p: any, i: number) => (
                    <li key={i}>{p.name} <span className="text-xs text-gray-400 ml-1">({p.docType} {p.docNumber}) - Nacimiento: {p.birthDate}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ));

      case "Planes":
        return product.data.map((plan, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <h4 className="font-bold text-primary flex items-center gap-2 mb-3 pb-2 border-b">
              <Package size={16} className="text-accent" /> Paquete #{idx + 1} - {plan.planName || "Sin Nombre"}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div><span className="block text-xs text-gray-500">Destino</span><span className="font-semibold text-sm">{plan.destination || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Proveedor</span><span className="font-semibold text-sm">{plan.supplier || "-"}</span></div>
              <div><span className="block text-xs text-gray-500">Fechas</span><span className="font-semibold text-sm">{plan.startDate} al {plan.endDate}</span></div>
              <div><span className="block text-xs text-gray-500">Incluye Vuelo</span><span className="font-semibold text-sm">{plan.includesFlight ? "Sí" : "No"}</span></div>
            </div>
            {plan.passengers && plan.passengers.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Viajeros ({plan.passengers.length})</p>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  {plan.passengers.map((p: any, i: number) => (
                    <li key={i}>{p.name} <span className="text-xs text-gray-400 ml-1">({p.docType} {p.docNumber})</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ));

      default:
        return (
          <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500 italic">
            Visualización detallada para {product.type} no disponible aún.
          </div>
        );
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Detalles de ${product.type}`} size="lg" footer={<Button onClick={onClose}>Cerrar</Button>}>
      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        {renderContent()}
      </div>
    </Modal>
  );
}
