import { LuLuggage } from "react-icons/lu";
import { FormField, Input, Combobox } from "../../ui/Form";
import { BaggageData } from "../../../types";
import { ClientInfoSection, FinancialSection } from "./VoucherField";

interface BaggageFormProps {
  baggage: BaggageData;
  client: any;
  suppliers?: any[];
  paymentMethods?: any[];
  airlines?: any[];
  onChange: (updates: Partial<BaggageData>) => void;
}

export function BaggageForm({ baggage, client, suppliers, paymentMethods, airlines, onChange }: BaggageFormProps) {
  const airlineOptions = airlines ? airlines.map(a => ({ value: String(a.id), label: a.name })) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {client && <ClientInfoSection client={client} />}
      
      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <LuLuggage size={14} /> Configuración de Equipaje
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Aerolínea">
            <Combobox
              value={baggage.airlineId ? String(baggage.airlineId) : ""}
              onChange={(val) => {
                const id = parseInt(val, 10);
                const airline = airlines?.find(a => a.id === id);
                onChange({ airlineId: isNaN(id) ? undefined : id, airline: airline?.name || "" });
              }}
              options={airlineOptions}
              placeholder="Seleccionar aerolínea..."
            />
          </FormField>
          <FormField label="Pasajero">
            <Input value={baggage.passengerName || ""} onChange={(e) => onChange({ passengerName: e.target.value })} placeholder="Nombre completo" />
          </FormField>
          <FormField label="Número de Reserva o Vuelo">
            <Input value={baggage.reservationNumber || ""} onChange={(e) => onChange({ reservationNumber: e.target.value })} placeholder="Ej: HKJ90" />
          </FormField>
          <FormField label="Tipo de Tarifa">
            <Input value={baggage.fareType || ""} onChange={(e) => onChange({ fareType: e.target.value })} placeholder="Ej: Basic, Light, XS..." />
          </FormField>
          <FormField label="Artículo Personal (Bolsa de mano)">
            <Input value={baggage.personalItem || ""} onChange={(e) => onChange({ personalItem: e.target.value })} placeholder="Ej: 40x30x20 cm, max 5kg" />
          </FormField>
          <FormField label="Equipaje de Mano (Cabina)">
            <Input value={baggage.carryOn || ""} onChange={(e) => onChange({ carryOn: e.target.value })} placeholder="Ej: 55x40x20 cm, max 10kg" />
          </FormField>
          <FormField label="Equipaje Documentado (Bodega)">
            <Input value={baggage.checkedBag || ""} onChange={(e) => onChange({ checkedBag: e.target.value })} placeholder="Ej: 1 pieza, max 23kg" />
          </FormField>
          <FormField label="Notas o Condiciones">
            <Input value={baggage.notes || ""} onChange={(e) => onChange({ notes: e.target.value })} placeholder="Cargos adicionales, políticas..." />
          </FormField>
        </div>
      </div>

      <FinancialSection 
        supplierName={baggage.supplierName || ""} 
        supplierCost={baggage.supplierCost}
        supplierPaymentMethod={baggage.supplierPaymentMethod || ""} 
        isPaymentMethodRequired={false}
        paymentMethods={paymentMethods}
        ta={baggage.ta}
        suppliers={suppliers}
        onChange={(updates) => onChange(updates as any)}
      />
    </div>
  );
}
