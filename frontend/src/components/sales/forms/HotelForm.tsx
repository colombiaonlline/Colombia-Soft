import { Building2, Users, Briefcase, Trash2, PlusCircle } from "lucide-react";
import * as LuIcons from "react-icons/lu";
import { FormField, Input, Combobox, Select } from "../../ui/Form";
import { Button } from "../../ui/Button";
import { HotelData, GuestInfo } from "../../../types";

interface HotelFormProps {
  hotel: HotelData;
  onChange: (updates: Partial<HotelData>) => void;
  data: any;
}

export function HotelForm({ hotel, onChange, data }: HotelFormProps) {
  const uniqueCities = Array.from(
    new Set(
      data.config.airports?.map((a: any) => a.location.split(",")[0].trim()) || []
    ),
  );

  const addGuest = () => {
    onChange({ guests: [...hotel.guests, { name: "", docType: "CC", docNumber: "" }] });
  };

  const removeGuest = (gIdx: number) => {
    onChange({ guests: hotel.guests.filter((_, i) => i !== gIdx) });
  };

  const updateGuest = (gIdx: number, gUpdates: Partial<GuestInfo>) => {
    const nextGuests = [...hotel.guests];
    nextGuests[gIdx] = { ...nextGuests[gIdx], ...gUpdates };
    onChange({ guests: nextGuests });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <datalist id="cities-list">
        {uniqueCities.map((city: any) => (
          <option key={city} value={city} />
        ))}
      </datalist>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <Building2 size={14} />
          Datos del Hotel
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nombre del Hotel">
            <Input
              value={hotel.hotelName}
              onChange={(e) => onChange({ hotelName: e.target.value })}
              placeholder="Ej: Hilton Berlin"
            />
          </FormField>
          <FormField label="Destino">
            <Input
              value={hotel.destination}
              onChange={(e) => onChange({ destination: e.target.value })}
              placeholder="Ej: Berlín, Alemania"
              list="cities-list"
            />
          </FormField>
          <FormField label="Proveedor">
            <Combobox
              value={hotel.supplier}
              onChange={(val) => onChange({ supplier: val })}
              options={data.config.suppliers.map((s: any) => ({ value: s.name, label: s.name }))}
              placeholder="Seleccionar proveedor..."
            />
          </FormField>
          <FormField label="Número de Reserva">
            <Input
              value={hotel.reservationNumber}
              onChange={(e) => onChange({ reservationNumber: e.target.value })}
              placeholder="Ej: 123456789"
            />
          </FormField>
          <FormField label="Check-in (Fecha y Hora)">
            <Input
              type="datetime-local"
              value={hotel.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
            />
          </FormField>
          <FormField label="Check-out (Fecha y Hora)">
            <Input
              type="datetime-local"
              value={hotel.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
            />
          </FormField>
          <FormField label="Tipo de Hotel">
            <Select
              value={hotel.hotelType || ""}
              onChange={(e) => onChange({ hotelType: e.target.value })}
              options={[
                { value: "", label: "Seleccionar tipo..." },
                { value: "hotel", label: "Hotel Normal" },
                { value: "resort", label: "Resort / Todo Incluido" },
                { value: "boutique", label: "Hotel Boutique" },
                { value: "apartamento", label: "Apartamento / AirBnB" },
                { value: "hostal", label: "Hostal / Albergue" },
                { value: "finca", label: "Finca / Casa Rural" },
              ]}
            />
          </FormField>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <Users size={14} />
            Huéspedes
          </h4>
          <Button variant="outline" size="sm" onClick={addGuest}>
            <PlusCircle size={14} className="mr-1" />
            Agregar
          </Button>
        </div>
        <div className="space-y-3">
          {hotel.guests.map((guest, gIdx) => (
            <div key={gIdx} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={guest.name}
                  onChange={(e) => updateGuest(gIdx, { name: e.target.value })}
                  placeholder="Nombre completo"
                />
                <Select
                  value={guest.docType}
                  onChange={(e) => updateGuest(gIdx, { docType: e.target.value })}
                  options={data.config.documentTypes.map((d: any) => ({
                    value: d.name,
                    label: d.name,
                  }))}
                />
                <Input
                  value={guest.docNumber}
                  onChange={(e) => updateGuest(gIdx, { docNumber: e.target.value })}
                  placeholder="Número de documento"
                />
              </div>
              {hotel.guests.length > 1 && (
                <Button variant="outline" size="sm" onClick={() => removeGuest(gIdx)}>
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50/20 p-4 rounded-xl border border-emerald-100">
        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Briefcase size={14} /> Información Financiera
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Costo Proveedor">
            <Input
              type="number"
              value={hotel.supplierCost === 0 ? "" : hotel.supplierCost}
              onChange={(e) =>
                onChange({
                  supplierCost:
                    e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
            />
          </FormField>
          <FormField label="Tarifa Administrativa (TA)">
            <Input
              type="number"
              value={hotel.ta === 0 ? "" : hotel.ta}
              onChange={(e) =>
                onChange({
                  ta: e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
            />
          </FormField>
          <FormField label="Método de Pago">
            <Select
              value={hotel.supplierPaymentMethod}
              onChange={(e) => onChange({ supplierPaymentMethod: e.target.value })}
              options={data.config.cards.map((m: any) => ({
                value: m.name,
                label: m.lastFourDigits ? `${m.name} (**${m.lastFourDigits})` : m.name,
              }))}
            />
          </FormField>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
          <LuIcons.LuFileText size={14} /> Observaciones del Hotel
        </h4>
        <textarea
          className="w-full h-24 p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
          placeholder="Ej: Habitación con vista al mar, late check-out solicitado, etc."
          value={hotel.observations || ""}
          onChange={(e) => onChange({ observations: e.target.value })}
        />
      </div>
    </div>
  );
}