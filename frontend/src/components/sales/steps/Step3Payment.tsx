import { CreditCard, Coins } from "lucide-react";
import { FormField, Input, Select, Textarea, Combobox } from "../../ui/Form";
import { WizardFormData } from "../wizardData";

export function Step3Payment({ form, set, data, errors }: any) {
  return (
    <div className="animate-fade-in space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCard size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-primary text-base">
              Observaciones y Pago
            </h3>
            <p className="text-xs text-gray-500">
              Agrega comentarios y configura la forma de pago.
            </p>
          </div>
        </div>

        <FormField label="Observaciones / Comentarios">
          <Textarea
            value={form.observations}
            onChange={(e) => set("observations", e.target.value)}
            placeholder="Detalles adicionales sobre los productos seleccionados..."
            rows={3}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Valor Total *" error={errors.total}>
            <Input
              type="number"
              value={form.total}
              readOnly
              className="bg-gray-100"
              placeholder="0"
              error={errors.total}
            />
          </FormField>

          <FormField
            label="Forma de Pago *"
            error={errors.paymentMethod}
          >
            <Combobox
              value={form.paymentMethod}
              onChange={(val) => set("paymentMethod", val)}
              options={data.config.paymentMethods.map((p: any) => ({
                value: p.name,
                label: p.name,
              }))}
              placeholder="Selecciona o escribe..."
              error={errors.paymentMethod}
            />
          </FormField>

          <FormField label="T.A. (Tarifa Administrativa)">
            <Input
              type="number"
              value={form.ta}
              readOnly
              className="bg-gray-100"
              placeholder="0"
            />
          </FormField>

          <FormField label="Costo Proveedores">
            <Input
              type="number"
              value={form.supplierCost}
              readOnly
              className="bg-gray-100"
              placeholder="0"
            />
          </FormField>

          <FormField label="Estado">
            <Combobox
              value={form.status}
              onChange={(val) => {
                set("status", val);
                // Auto-set isCredit internally based on selection
                set("isCredit", val === "credito");
              }}
              options={[
                { value: "credito", label: "Crédito" },
                { value: "abonado", label: "Completado" },
                { value: "pagado", label: "Finalizado" },
              ]}
            />
          </FormField>
        </div>

        {/* Sección Comisionista */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          {form.commissionAgentId ? (
            <div className="col-span-2 flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Coins size={16} />
              </div>
              <p className="text-sm font-bold text-primary">Comisionista: {form.commissionAgentName}</p>
            </div>
          ) : (
            <p className="col-span-2 text-xs text-gray-400 italic">Venta directa (sin comisionista asignado)</p>
          )}

          {form.commissionAgentId && (
            <>
              <FormField label="Comisión Bruta (monto acordado)">
                <Input
                  type="number"
                  value={form.commissionAgentAmount}
                  onChange={(e) => {
                    const gross = parseFloat(e.target.value) || 0;
                    const retention = parseFloat(form.commissionAgentRetentionPercentage) || 0;
                    const net = gross * (1 - retention / 100);
                    set("commissionAgentAmount", e.target.value);
                    set("commissionAgentNetPayment", net.toString());
                  }}
                  placeholder="0"
                />
              </FormField>
              <FormField label="% Retención para Oficina">
                <Input
                  type="number"
                  value={form.commissionAgentRetentionPercentage}
                  onChange={(e) => {
                    const retention = parseFloat(e.target.value) || 0;
                    const gross = parseFloat(form.commissionAgentAmount) || 0;
                    const net = gross * (1 - retention / 100);
                    set("commissionAgentRetentionPercentage", e.target.value);
                    set("commissionAgentNetPayment", net.toString());
                  }}
                  placeholder="Ej. 10.5"
                />
              </FormField>
              <FormField label="Neto a Pagar al Comisionista">
                <Input
                  type="number"
                  value={form.commissionAgentNetPayment}
                  readOnly
                  className="bg-gray-100 font-bold text-emerald-600"
                  placeholder="0"
                />
              </FormField>
            </>
          )}
        </div>

        {form.isCredit && (
          <FormField label="Fecha de Vencimiento">
            <Input
              type="date"
              value={form.creditDueDate}
              onChange={(e) => set("creditDueDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </FormField>
        )}

        {/* Summary card */}
        {Number(form.total) > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Resumen Financiero
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Total
                </p>
                <p className="font-black text-gray-800">
                  ${Number(form.total).toLocaleString("es-CO")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Proveedores
                </p>
                <p className="font-black text-rose-600">
                  ${(Number(form.supplierCost) || 0).toLocaleString("es-CO")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Comisionista
                </p>
                <p className="font-black text-amber-600">
                  ${(Number(form.commissionAgentNetPayment) || 0).toLocaleString("es-CO")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Ganancia Oficina
                </p>
                <p className="font-black text-emerald-600">
                  $
                  {(
                    Number(form.total) -
                    (Number(form.supplierCost) || 0) -
                    (Number(form.commissionAgentNetPayment) || 0)
                  ).toLocaleString("es-CO")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
