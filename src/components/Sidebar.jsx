import React from 'react';
import { parseISO, isBefore, isToday, differenceInDays } from 'date-fns';
import { Wallet, AlertCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

export default function Sidebar({ cheques, listosParaCobrar, onOpenModal }) {
  // Calcular vencimientos inminentes (próximos 7 días)
  const vencimientoInminente = cheques.filter(c => {
    if (c.estado !== 'pendiente') return false;
    const vencimientoLegal = parseISO(c.fecha_vencimiento_legal);
    const diasRestantes = differenceInDays(vencimientoLegal, new Date());
    return diasRestantes >= 0 && diasRestantes <= 7;
  }).sort((a, b) => new Date(a.fecha_vencimiento_legal) - new Date(b.fecha_vencimiento_legal));

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
          LT
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">Lona-Truck</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Gestión de Cheques</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        
        {/* Listos para cobrar */}
        <div>
          <button 
            onClick={onOpenModal}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 group hover:text-brand-600 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand-500" />
              Listos para cobrar ({listosParaCobrar.length})
            </div>
            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div className="space-y-3">
            {listosParaCobrar.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No hay cheques listos para cobrar.</p>
            ) : (
              listosParaCobrar.map(cheque => (
                <div key={cheque.id} onClick={onOpenModal} className="bg-brand-50 rounded-lg p-3 border border-brand-100 hover:shadow-md hover:border-brand-300 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900 truncate pr-2 group-hover:text-brand-700 transition-colors">{cheque.cliente}</span>
                    <span className="font-bold text-brand-700">${Number(cheque.monto).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Wallet size={12} />
                    <span>{cheque.banco}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vencimiento Inminente */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-orange-500" />
            Vencimiento Legal Inminente ({vencimientoInminente.length})
          </h3>
          <div className="space-y-3">
            {vencimientoInminente.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No hay vencimientos próximos.</p>
            ) : (
              vencimientoInminente.map(cheque => {
                const diasRestantes = differenceInDays(parseISO(cheque.fecha_vencimiento_legal), new Date());
                const isUrgent = diasRestantes <= 2;
                
                return (
                  <div key={cheque.id} className={`rounded-lg p-3 border hover:shadow-md transition-shadow ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-900 truncate pr-2">{cheque.cliente}</span>
                      <span className="font-bold text-gray-900">${Number(cheque.monto).toLocaleString('es-AR')}</span>
                    </div>
                    <div className={`flex items-center justify-between text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Vence legalmente en {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}
