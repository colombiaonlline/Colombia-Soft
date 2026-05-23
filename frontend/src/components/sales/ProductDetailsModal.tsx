import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { formatDate } from "../../utils/formatters";
import { Plane, Building2, ShieldCheck, Package, ArrowRight, ArrowLeft } from "lucide-react";

interface ProductDetailsModalProps {
  product: { type: string; data: any[] } | null;
  onClose: () => void;
}

function safe(val: any, fallback = "-") {
  return val ?? fallback;
}

function renderPassengers(items: any[]) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-3 mt-3">
      <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Personas ({items.length})</p>
      <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
        {items.map((p: any, i: number) => (
          <li key={i}>
            {p.name || p.nombreComplebo || "-"}
            <span className="text-xs text-gray-400 ml-1">
              ({p.docType || p.tipoDocumento || ""} {p.docNumber || p.nroDocumento || ""})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderGrid(items: { label: string; value: any }[]) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
      {items.map((item, i) => (
        <div key={i}>
          <span className="block text-xs text-gray-500">{item.label}</span>
          <span className="font-semibold text-sm">{safe(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  if (!product) return null;

  const renderContent = () => {
    switch (product.type) {
      case "Tiquetería":
        return product.data.map((ticket, idx) => {
          const passengerInfo = ticket.passengerInfo || ticket.passengers?.[0] || null;

          // Dynamically split flight segments into outbound and return
          const legs = ticket.legs || [];
          const flightMode = ticket.flightMode || "one_way";
          
          let outboundLegs = [...legs];
          let returnLegs: any[] = [];

          if (flightMode === "round_trip" && legs.length >= 2) {
            const originalOrigin = legs[0]?.origin;
            const N = legs.length;
            let splitIdx = N - 1;
            
            for (let i = N - 2; i >= 1; i--) {
              const prevLeg = legs[i];
              const currentLeg = legs[i + 1];
              
              // Check direct reversal
              const isReversal = prevLeg.origin === currentLeg.destination && prevLeg.destination === currentLeg.origin;
              if (isReversal) {
                splitIdx = i + 1;
                break;
              }
              
              // Extend return chain backwards
              if (prevLeg.destination === currentLeg.origin && prevLeg.origin !== originalOrigin) {
                splitIdx = i;
              } else {
                break;
              }
            }
            
            outboundLegs = legs.slice(0, splitIdx);
            returnLegs = legs.slice(splitIdx);
          } else if (ticket.returnLeg && flightMode === "round_trip") {
            // Fallback for older formats where returnLeg is explicitly defined
            returnLegs = [ticket.returnLeg];
          }

          const outboundTypeLabel = outboundLegs.length > 1 ? "Con Escalas" : "Directo";
          const returnTypeLabel = returnLegs.length > 1 ? "Con Escalas" : (returnLegs.length === 1 ? "Directo" : "");

          return (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
              <h4 className="font-bold text-primary flex items-center gap-2 mb-3 pb-2 border-b">
                <Plane size={16} className="text-accent" /> Ticket #{idx + 1}
                {passengerInfo?.name && ` - ${passengerInfo.name}`}
              </h4>
              {renderGrid([
                { label: "Aerolínea", value: ticket.airlineName || ticket.airline },
                { label: "Reserva", value: ticket.reservationNumber },
                { label: "Tiquete", value: ticket.ticketNumber },
                { label: "Vuelo", value: ticket.flightNumber },
              ])}
              
              {/* Outbound Flights (Trayecto de Ida) */}
              {outboundLegs.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                      <ArrowRight size={11} className="text-primary" />
                      Trayecto de Ida
                    </p>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                      {outboundTypeLabel}
                    </span>
                  </div>
                  {outboundLegs.map((leg: any, lIdx: number) => (
                    <div key={lIdx} className="grid grid-cols-4 gap-2 text-xs mb-1 pb-1 last:border-0 last:pb-0 border-b border-gray-150">
                      <div className="font-semibold text-gray-800">{leg.origin || "-"} <span className="text-gray-400 mx-1">→</span> {leg.destination || "-"}</div>
                      <div className="text-gray-600">{leg.date ? formatDate(leg.date) : "-"}</div>
                      <div className="text-gray-600">Vuelo: <span className="font-medium text-gray-800">{leg.flightNumber || "-"}</span></div>
                      <div className="text-gray-600">Asiento: <span className="font-medium text-gray-800">{leg.seat || "-"}</span></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Return Flights (Trayecto de Regreso) */}
              {flightMode === "round_trip" && returnLegs.length > 0 && (
                <div className="bg-blue-50/40 rounded-lg p-3 mt-2.5 border border-blue-100/60">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-blue-100">
                    <p className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1">
                      <ArrowLeft size={11} />
                      Trayecto de Regreso
                    </p>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                      {returnTypeLabel}
                    </span>
                  </div>
                  {returnLegs.map((leg: any, lIdx: number) => (
                    <div key={lIdx} className="grid grid-cols-4 gap-2 text-xs mb-1 pb-1 last:border-0 last:pb-0 border-b border-blue-50">
                      <div className="font-semibold text-blue-800">{leg.origin || "-"} <span className="text-gray-400 mx-1">→</span> {leg.destination || "-"}</div>
                      <div className="text-gray-600">{leg.date ? formatDate(leg.date) : "-"}</div>
                      <div className="text-gray-600">Vuelo: <span className="font-medium text-blue-800">{leg.flightNumber || "-"}</span></div>
                      <div className="text-gray-600">Asiento: <span className="font-medium text-blue-800">{leg.seat || "-"}</span></div>
                    </div>
                  ))}
                </div>
              )}
              {passengerInfo && renderPassengers([passengerInfo])}
            </div>
          );
        });

      case "Hotelería":
        return product.data.map((hotel, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <h4 className="font-bold text-primary flex items-center gap-2 mb-3 pb-2 border-b">
              <Building2 size={16} className="text-accent" /> Hotel #{idx + 1} - {hotel.hotelName || "Sin Nombre"}
            </h4>
            {renderGrid([
              { label: "Destino", value: hotel.destination },
              { label: "Proveedor", value: hotel.supplier || hotel.hotelName },
              { label: "Reserva", value: hotel.reservationNumber },
              { label: "Fechas", value: hotel.startDate && hotel.endDate ? `${hotel.startDate} al ${hotel.endDate}` : (hotel.startDate || hotel.endDate) },
            ])}
            {renderPassengers(hotel.guests || hotel.passengers)}
            {hotel.observations && (
              <p className="text-xs text-gray-500 mt-2 italic">{hotel.observations}</p>
            )}
          </div>
        ));

      case "Seguros":
        return product.data.map((ins, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <h4 className="font-bold text-primary flex items-center gap-2 mb-3 pb-2 border-b">
              <ShieldCheck size={16} className="text-accent" /> Seguro #{idx + 1}
            </h4>
            {renderGrid([
              { label: "Plan", value: ins.planName || ins.insuranceType },
              { label: "Cobertura", value: ins.coverageAmount ? `$${ins.coverageAmount}` : ins.coverageAmount },
              { label: "Días", value: ins.coverageDays },
              { label: "Contacto", value: ins.contactName },
            ])}
            {renderPassengers(ins.members || ins.passengers)}
          </div>
        ));

      case "Planes":
        return product.data.map((plan, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <h4 className="font-bold text-primary flex items-center gap-2 mb-3 pb-2 border-b">
              <Package size={16} className="text-accent" /> Paquete #{idx + 1} - {plan.planName || "Sin Nombre"}
            </h4>
            {renderGrid([
              { label: "Paquete", value: plan.packageName },
              { label: "Aerolínea", value: plan.airlineName || plan.airline },
              { label: "Reserva", value: plan.reservationNumber },
              { label: "Fechas", value: plan.startDate && plan.endDate ? `${plan.startDate} al ${plan.endDate}` : (plan.startDate || plan.endDate) },
              { label: "Adultos", value: plan.adultsCount },
              { label: "Menores", value: plan.childrenCount },
              { label: "Confirmación", value: plan.confirmationNumber },
            ])}
            {renderPassengers(plan.guests || plan.passengers)}
            {plan.observations && (
              <p className="text-xs text-gray-500 mt-2 italic">{plan.observations}</p>
            )}
          </div>
        ));

      default:
        return (
          <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500 italic">
            Visualización detallada para {product.type} no disponible aún.
            {product.data && product.data.length > 0 && (
              <pre className="text-left text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-40">
                {JSON.stringify(product.data, null, 2)}
              </pre>
            )}
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
