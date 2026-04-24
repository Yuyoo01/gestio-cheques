import React, { useState } from 'react';
import { X, CheckCircle, Wallet, FileText } from 'lucide-react';

export default function ChequesModal({ isOpen, onClose, cheques, onCobrar }) {
  const [processingId, setProcessingId] = useState(null);

  if (!isOpen) return null;

  const handleCobrar = async (id) => {
    setProcessingId(id);
    await onCobrar(id);
    setProcessingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-brand-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cheques Listos para Cobrar</h2>
              <p className="text-sm text-gray-500 font-medium">{cheques.length} {cheques.length === 1 ? 'cheque disponible' : 'cheques disponibles'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {cheques.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Todo al día</h3>
              <p className="text-gray-500">No hay más cheques listos para cobrar en este momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cheques.map(cheque => (
                <div key={cheque.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 hover:border-brand-300 transition-colors">
                  
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900 text-lg">{cheque.cliente}</span>
                      <span className="font-bold text-brand-600 text-xl">${Number(cheque.monto).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                        <Wallet size={14} /> <span>{cheque.banco}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                        <FileText size={14} /> <span>N° {cheque.numero_cheque}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-4">
                    <button
                      onClick={() => handleCobrar(cheque.id)}
                      disabled={processingId === cheque.id}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    >
                      {processingId === cheque.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          <span>Cobrar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cheques.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
            <span className="text-gray-500 font-medium">Suma Total:</span>
            <span className="text-2xl font-black text-gray-900">
              ${cheques.reduce((acc, curr) => acc + Number(curr.monto), 0).toLocaleString('es-AR')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
