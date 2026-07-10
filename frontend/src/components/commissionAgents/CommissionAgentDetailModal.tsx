import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Wallet, Info, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CommissionAgent, Sale } from '../../types';

interface CommissionAgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: CommissionAgent | null;
  agentSales: Sale[];
}

export default function CommissionAgentDetailModal({ isOpen, onClose, agent, agentSales }: CommissionAgentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'sales'>('info');

  if (!agent) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setActiveTab('info');
        onClose();
      }}
      title={`Detalle: ${agent.name}`}
      size="md"
      footer={<Button variant="outline" onClick={onClose}>Cerrar</Button>}
    >
      <div className="space-y-4">
        {/* Header summary */}
        <div className="flex flex-col items-center text-center p-4 bg-gradient-to-b from-amber-500/10 to-transparent rounded-2xl border border-amber-500/10 mb-2">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl font-semibold overflow-hidden border-4 border-white dark:border-slate-700 shadow-sm">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:!text-[#ffffff] mt-2">{agent.name}</h2>
          <div className="flex gap-2 items-center justify-center mt-1">
             <Badge variant={agent.status === 'Activo' ? 'active' : 'inactive'}>
               {agent.status === 'Activo' ? 'ACTIVO' : 'INACTIVO'}
             </Badge>
             <span className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
               {agent.type || "Comisionista"}
             </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'info'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Info size={16} /> Información
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'sales'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <FileText size={16} /> Ventas ({agentSales.length})
          </button>
        </div>

        {/* Tab content */}
        <div className="pt-2">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800/80 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
                <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Tipo Doc:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{agent.docType}</span></div>
                <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Documento:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{agent.docNumber}</span></div>
                <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Teléfono:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{agent.phone || 'N/A'}</span></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-slate-400 text-sm block">Correo:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff] block break-all">{agent.email || 'N/A'}</span></div>
              </div>

              {agent.observacion && (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30">
                   <span className="text-amber-800 dark:text-amber-500 text-xs font-bold uppercase tracking-wider block mb-1">Observación</span>
                   <p className="text-amber-900 dark:text-amber-400 text-sm italic">{agent.observacion}</p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-slate-800/80 p-4 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 dark:text-slate-400 text-sm block">Acumulado (No liquidado):</span>
                  <span className="font-bold text-lg text-amber-600 dark:text-amber-400">
                    {formatCurrency(agent.accumulated || 0)}
                  </span>
                </div>
                <Wallet className="text-amber-500/50" size={32} />
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              {agentSales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-gray-50 dark:bg-slate-800 text-xs text-gray-500 dark:text-slate-400 uppercase">
                        <th className="p-2 font-semibold">ID / Fecha</th>
                        <th className="p-2 font-semibold">Venta Total</th>
                        <th className="p-2 font-semibold">Comisión</th>
                        <th className="p-2 font-semibold text-right">Liquidada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {agentSales.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                          <td className="p-2">
                            <span className="font-mono text-gray-500 dark:text-slate-400 block">#{s.id.toString().padStart(4, '0')}</span>
                            <span className="text-xs text-gray-400">{formatDate(s.date)}</span>
                          </td>
                          <td className="p-2 font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(s.total)}</td>
                          <td className="p-2">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(s.commissionAgentNetPayment || 0)}</span>
                          </td>
                          <td className="p-2 text-right">
                             {s.isSettled ? (
                               <Badge variant="active" className="!bg-green-100 !text-green-700">Sí</Badge>
                             ) : (
                               <Badge variant="inactive" className="!bg-amber-100 !text-amber-700">No</Badge>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-3" />
                  <p className="text-gray-500 text-sm">No hay ventas registradas con este comisionista</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
