import { useState, useEffect } from "react";
import { Receipt, ShoppingBag, Wallet, Trash2, FileDown, Loader2 } from "lucide-react";
import * as api from "../../api";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input, Select } from "../ui/Form";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Sale, Client, User } from "../../types";

interface SaleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSale: Sale | null;
  clients: Client[];
  user: User | null;
  isAdmin: boolean;
  onUpdateSale: (id: number, data: any) => void;
  onAddSale: (data: any) => void;
  onRegisterPayment: (saleId: number, amount: number, method?: string) => Promise<any>;
  onDeletePayment: (saleId: number, paymentId: string) => Promise<void>;
  onDownloadVoucher: (sale: Sale) => void;
}

export default function SaleEditModal({
  isOpen,
  onClose,
  editingSale,
  clients,
  user,
  isAdmin,
  onUpdateSale,
  onAddSale,
  onRegisterPayment,
  onDeletePayment,
  onDownloadVoucher,
}: SaleEditModalProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    total: "",
    paymentMethod: "",
    status: "credito" as Sale["status"],
    observations: "",
    isCredit: false,
    creditDueDate: "",
    commissionAgentName: "",
    commissionAgentAmount: "",
    commissionAgentRetentionPercentage: "",
    commissionAgentNetPayment: "",
    ta: "",
    supplierCost: "",
  });

  const [payments, setPayments] = useState<any[]>([]);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    method: "Efectivo",
  });
  const [fullSale, setFullSale] = useState<Sale | null>(null);
  const [loadingSale, setLoadingSale] = useState(false);

  useEffect(() => {
    if (editingSale && isOpen) {
      setLoadingSale(true);
      api.getSale(editingSale.id).then(fetched => {
        setFullSale(fetched);
        setFormData({
          clientId: String(fetched.clientId),
          total: String(fetched.total),
          paymentMethod: fetched.paymentMethod,
          status: fetched.status,
          observations: fetched.observations || "",
          isCredit: fetched.isCredit || false,
          creditDueDate: fetched.creditDueDate || "",
          commissionAgentName: fetched.commissionAgentName || "",
          commissionAgentAmount: fetched.commissionAgentAmount
            ? String(fetched.commissionAgentAmount)
            : "",
          commissionAgentRetentionPercentage: fetched.commissionAgentRetentionPercentage
            ? String(fetched.commissionAgentRetentionPercentage)
            : "",
          commissionAgentNetPayment: fetched.commissionAgentNetPayment
            ? String(fetched.commissionAgentNetPayment)
            : "",
          ta: fetched.ta ? String(fetched.ta) : "",
          supplierCost: fetched.supplierCost ? String(fetched.supplierCost) : "",
        });
        setPayments(fetched.payments || []);
      }).catch(() => {
        setFullSale(editingSale);
        setFormData({
          clientId: String(editingSale.clientId),
          total: String(editingSale.total),
          paymentMethod: editingSale.paymentMethod,
          status: editingSale.status,
          observations: editingSale.observations || "",
          isCredit: editingSale.isCredit || false,
          creditDueDate: editingSale.creditDueDate || "",
          commissionAgentName: editingSale.commissionAgentName || "",
          commissionAgentAmount: editingSale.commissionAgentAmount
            ? String(editingSale.commissionAgentAmount)
            : "",
          commissionAgentRetentionPercentage: editingSale.commissionAgentRetentionPercentage
            ? String(editingSale.commissionAgentRetentionPercentage)
            : "",
          commissionAgentNetPayment: editingSale.commissionAgentNetPayment
            ? String(editingSale.commissionAgentNetPayment)
            : "",
          ta: editingSale.ta ? String(editingSale.ta) : "",
          supplierCost: editingSale.supplierCost ? String(editingSale.supplierCost) : "",
        });
        setPayments((editingSale as any).payments || []);
      }).finally(() => setLoadingSale(false));
    } else if (!editingSale && isOpen) {
      setFullSale(null);
      setLoadingSale(false);
      setFormData({
        clientId: "",
        total: "",
        paymentMethod: "",
        status: "credito",
        observations: "",
        isCredit: false,
        creditDueDate: "",
        commissionAgentName: "",
        commissionAgentAmount: "",
        commissionAgentRetentionPercentage: "",
        commissionAgentNetPayment: "",
        ta: "",
        supplierCost: "",
      });
      setPayments([]);
    }
  }, [editingSale, isOpen]);

  const totalSaleAmount = Number(formData.total) || 0;
  const totalPaidAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingBalance = totalSaleAmount - totalPaidAmount;

  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const handleAddPayment = async () => {
    const amount = Number(newPayment.amount);
    if (!editingSale || amount <= 0 || amount > remainingBalance) return;
    setIsSavingPayment(true);
    try {
      const result = await onRegisterPayment(editingSale.id, amount, newPayment.method);
      setPayments([...payments, result.payment]);
      setNewPayment({ amount: "", method: "Efectivo" });
    } catch {
      // error handled by interceptor
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!editingSale) return;
    try {
      await onDeletePayment(editingSale.id, paymentId);
      setPayments(payments.filter((p) => p.id !== paymentId));
    } catch {
      // error handled by interceptor
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!editingSale && !formData.clientId) {
      newErrors.clientId = "Debe seleccionar un cliente.";
    }
    if (!formData.total || Number(formData.total) <= 0) {
      newErrors.total = "El total debe ser mayor a 0.";
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Debe seleccionar una forma de pago.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const client = clients.find((c) => c.id === Number(formData.clientId));
    
    const newStatus =
      totalPaidAmount >= totalSaleAmount
        ? "pagado"
        : totalPaidAmount > 0
          ? "abonado"
          : "credito";

    const saleData = {
      clientId: Number(formData.clientId),
      clientName: client?.name || (editingSale?.clientName),
      total: Number(formData.total),
      paymentMethod: formData.paymentMethod,
      status: (editingSale ? newStatus : formData.status) as Sale["status"],
      observations: formData.observations,
      isCredit: formData.isCredit,
      creditDueDate: formData.isCredit ? formData.creditDueDate : undefined,
      commissionAgentName: formData.commissionAgentName,
      commissionAgentAmount: Number(formData.commissionAgentAmount) || 0,
      commissionAgentRetentionPercentage: Number(formData.commissionAgentRetentionPercentage) || 0,
      commissionAgentNetPayment: Number(formData.commissionAgentNetPayment) || 0,
      ta: Number(formData.ta) || 0,
      supplierCost: Number(formData.supplierCost) || 0,
    };

    if (editingSale) {
      onUpdateSale(editingSale.id, saleData);
    } else {
      onAddSale({
        ...saleData,
        asesorId: user!.id,
        asesorName: user!.name,
        date: new Date().toISOString().split("T")[0],
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSale ? "Editar Venta" : "Nueva Venta"}
      size="lg"
      footer={
        editingSale ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Guardar Cambios</Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        )
      }
    >
      {editingSale ? (
        loadingSale ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 size={36} className="animate-spin text-accent mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">Cargando datos completos de la venta...</p>
            </div>
          </div>
        ) : (
        <div className="space-y-6">
          {/* Seccion Resumen Solo Lectura */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h4 className="font-bold text-primary flex items-center gap-2">
                <Receipt size={18} /> Resumen de Venta #{editingSale.id}
              </h4>
              <Badge variant={editingSale.status}>
                {editingSale.status === "pagado"
                  ? "Finalizado"
                  : editingSale.status === "abonado"
                    ? "Completado"
                    : "Crédito"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs font-medium mb-0.5">
                  Fecha de Emisión
                </span>
                <span className="font-semibold text-gray-800">
                  {formatDate(editingSale.date)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs font-medium mb-0.5">
                  Cliente
                </span>
                <span className="font-semibold text-gray-800">
                  {editingSale.clientName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs font-medium mb-0.5">
                  Asesor
                </span>
                <span className="font-semibold text-gray-800">
                  {editingSale.asesorName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs font-medium mb-0.5">
                  Comisionista
                </span>
                <span className="font-semibold text-gray-800">
                  {editingSale.commissionAgentName || "N/A"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-3 mt-1 border-t border-gray-100">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ShoppingBag size={14} className="text-accent" /> Productos
                  Vendidos / Observaciones
                </span>
                <div className="bg-white p-3 rounded-lg border border-gray-100 max-h-32 overflow-y-auto custom-scrollbar">
                  {editingSale.observations ? (
                    <ul className="space-y-1.5">
                      {editingSale.observations
                        .split("\n")
                        .filter((l) => l.trim())
                        .map((line, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm font-medium text-gray-700"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0"></div>
                            <span>{line}</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic text-sm">
                      No se detallaron servicios
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fila de Finanzas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Valor Final
              </p>
              <p className="text-lg font-black text-gray-800">
                {formatCurrency(editingSale.total)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Pago Proveedores
              </p>
              <p className="text-lg font-black text-rose-600">
                {formatCurrency(editingSale.supplierCost || 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Ganancias Obtenidas
              </p>
              <p className="text-lg font-black text-emerald-600">
                {formatCurrency(
                  editingSale.total -
                    (editingSale.supplierCost || 0) -
                    (editingSale.commissionAgentNetPayment || 0),
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Pagado por Cliente
              </p>
              <p className="text-lg font-black text-blue-600">
                {formatCurrency(totalPaidAmount)}
              </p>
            </div>
          </div>

          <div className="mt-2 border-t border-gray-200 pt-6 space-y-6">
            <h3 className="text-lg font-black text-primary flex items-center gap-2">
              <Wallet className="text-accent" size={20} />
              Gestión de Pagos y Abonos
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Valor a Pagar
                </p>
                <p className="text-xl font-black text-gray-800 mt-1">
                  {formatCurrency(totalSaleAmount)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  Total Pagado
                </p>
                <p className="text-xl font-black text-blue-700 mt-1">
                  {formatCurrency(totalPaidAmount)}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border shadow-sm ${remainingBalance > 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest ${remainingBalance > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  Pendiente por Pagar
                </p>
                <p
                  className={`text-xl font-black mt-1 ${remainingBalance > 0 ? "text-red-700" : "text-green-700"}`}
                >
                  {formatCurrency(Math.max(0, remainingBalance))}
                </p>
              </div>
            </div>

            {/* B. Formulario de Agregar Nuevo Abono */}
            {remainingBalance > 0 && (
              <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h4 className="text-sm font-bold text-gray-800 mb-4">
                  Registrar Nuevo Abono
                </h4>
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-600 mb-1 block">
                      Monto a abonar
                    </label>
                    <Input
                      type="number"
                      value={newPayment.amount}
                      max={remainingBalance}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          amount: e.target.value,
                        })
                      }
                      placeholder="Ej: 500000"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-600 mb-1 block">
                      Método de pago
                    </label>
                    <Select
                      value={newPayment.method}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          method: e.target.value,
                        })
                      }
                      options={[
                        { value: "Efectivo", label: "Efectivo" },
                        { value: "Transferencia", label: "Transferencia" },
                        {
                          value: "Tarjeta de Crédito",
                          label: "Tarjeta de Crédito",
                        },
                      ]}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddPayment}
                    className="mb-0.5 w-full sm:w-auto whitespace-nowrap"
                    disabled={
                      !newPayment.amount ||
                      Number(newPayment.amount) <= 0 ||
                      Number(newPayment.amount) > remainingBalance ||
                      isSavingPayment
                    }
                  >
                    {isSavingPayment ? "Guardando..." : "Registrar Abono"}
                  </Button>
                </div>
                {Number(newPayment.amount) > remainingBalance && (
                  <p className="text-[10px] text-red-500 font-bold mt-2">
                    El abono supera el saldo restante de{" "}
                    {formatCurrency(remainingBalance)}.
                  </p>
                )}
              </div>
            )}

            {/* C. Historial de Pagos */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-3">
                Historial de Pagos
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {payments.length > 0 ? (
                  payments.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 text-gray-400">
                          <Receipt size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">
                            {formatCurrency(p.amount)}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatDate(p.date)} · {p.method}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center mt-2 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          className="text-xs py-1.5 px-2 h-auto"
                          onClick={() => onDownloadVoucher(editingSale)}
                        >
                          <FileDown size={14} className="mr-1" /> PDF
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="text-xs py-1.5 px-2 h-auto border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDeletePayment(p.id)}
                            title="Eliminar abono"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No hay pagos registrados para esta venta.
                  </p>
                )}
              </div>
            </div>
            {/* Barra de progreso de pago */}
            {(() => {
              const progress =
                totalSaleAmount > 0
                  ? Math.min(
                      100,
                      Math.round((totalPaidAmount / totalSaleAmount) * 100),
                    )
                  : 0;
              return (
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    <span>Progreso de Pago</span>
                    <span
                      className={
                        progress === 100 ? "text-green-600" : "text-blue-600"
                      }
                    >
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )
    ) : (
      <p className="text-center py-8 text-gray-500">Solo se permite edición de ventas existentes en esta modal.</p>
    )}
    </Modal>
  );
}
