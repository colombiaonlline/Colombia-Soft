import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { User, Sale } from '../../types';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userSales: Sale[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  asesor: "Asesor",
  freelancer: "Freelancer",
};

export default function UserDetailModal({ isOpen, onClose, user, userSales }: UserDetailModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!user) return null;

  const filteredSales = userSales.filter((sale) => {
    if (!startDate && !endDate) return true;
    const saleDate = new Date(sale.date).toISOString().split('T')[0];
    if (startDate && saleDate < startDate) return false;
    if (endDate && saleDate > endDate) return false;
    return true;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const currentSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle: ${user.name}`}
      size="md"
      footer={<Button variant="outline" onClick={onClose}>Cerrar</Button>}
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center p-4 bg-gradient-to-b from-accent/10 to-transparent rounded-2xl border border-accent/20 mb-2">
          <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-700 shadow-lg mb-3 overflow-hidden bg-accent/10">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-accent">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:!text-[#ffffff]">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="accent" className="bg-accent/10 border-accent/20 text-accent font-semibold">
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
            <Badge variant={user.status}>
              {user.status === 'active' ? 'USUARIO ACTIVO' : 'USUARIO INACTIVO'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800/80 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Tipo Doc:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{user.docType}</span></div>
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Número:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{user.docNumber}</span></div>
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Teléfono:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{user.phone || 'N/A'}</span></div>
          <div className="min-w-0"><span className="text-gray-500 dark:text-slate-400 text-sm block">Correo:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff] block break-all">{user.email}</span></div>
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">F. Nacimiento:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{user.birthDate ? formatDate(user.birthDate) : 'N/A'}</span></div>
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Rol:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{ROLE_LABELS[user.role] || user.role}</span></div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h4 className="font-semibold text-gray-900 dark:!text-[#ffffff] flex items-center gap-2 text-lg">
              <TrendingUp size={18} className="text-accent" /> Historial de Ventas ({filteredSales.length})
            </h4>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <input
                  type="date"
                  className="text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  title="Fecha de inicio"
                />
                <span className="absolute -top-2 left-2 bg-white dark:bg-slate-800 px-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Desde</span>
              </div>
              <span className="text-gray-400 font-bold">-</span>
              <div className="relative group">
                <input
                  type="date"
                  className="text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm outline-none"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  title="Fecha final"
                />
                <span className="absolute -top-2 left-2 bg-white dark:bg-slate-800 px-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Hasta</span>
              </div>
            </div>
          </div>
          
          {filteredSales.length > 0 && (
            <div className="mb-3">
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 dark:text-teal-400 dark:bg-teal-950/40 dark:border-teal-900/50 px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow-sm">
                Total Facturado en este periodo: <span className="text-sm">{formatCurrency(filteredSales.reduce((acc, s) => acc + s.total, 0))}</span>
              </span>
            </div>
          )}

          {filteredSales.length > 0 ? (
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-50 dark:bg-slate-800 text-xs text-gray-500 dark:text-slate-400 uppercase">
                    <th className="p-2 font-semibold">Fecha</th>
                    <th className="p-2 font-semibold">Valor</th>
                    <th className="p-2 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {currentSales.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="p-2.5 text-gray-600 dark:text-slate-300 font-medium">{formatDate(s.date)}</td>
                      <td className="p-2.5 font-bold text-gray-900 dark:!text-[#ffffff]">{formatCurrency(s.total)}</td>
                      <td className="p-2.5"><Badge variant={s.status}>{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700">
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredSales.length)} de {filteredSales.length} ventas
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-2 py-1 h-auto text-gray-600 border-gray-200 hover:bg-gray-100"
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="text-xs font-semibold px-2 text-gray-700 dark:text-slate-300">
                      Pág {currentPage} de {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="px-2 py-1 h-auto text-gray-600 border-gray-200 hover:bg-gray-100" 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-800/50 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-6 text-center">
              <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">No se encontraron ventas para este rango de fechas.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
