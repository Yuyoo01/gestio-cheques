import React from 'react';
import { X, Wallet, FileText, Calendar } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CarteraModal({ isOpen, onClose, cheques }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-200 text-gray-700 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Total en Cartera</h2>
              <p className="text-sm text-gray-500 font-medium">Detalle de todos los cheques pendientes ({cheques.length})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {cheques.length === 0 ? (
            <div className="text-center py-12">
              <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Cartera vacía</h3>
              <p className="text-gray-500">No hay cheques pendientes en cartera.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cheques.map(cheque => (
                <div key={cheque.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{cheque.cliente}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Wallet size={14} /> <span>{cheque.banco}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={14} /> <span>N° {cheque.numero_cheque}</span>
                      </div>
                      <div className="flex items-center gap-1 text-brand-600 font-medium bg-brand-50 px-2 py-0.5 rounded">
                        <Calendar size={14} /> 
                        <span>Cobro: {format(parseISO(cheque.fecha_pago), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 text-lg">${Number(cheque.monto).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cheques.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-gray-600 font-bold uppercase tracking-wide text-sm">Suma Total en Cartera:</span>
            <span className="text-2xl font-black text-gray-900">
              ${cheques.reduce((acc, curr) => acc + Number(curr.monto), 0).toLocaleString('es-AR')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
