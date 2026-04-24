import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Send, FileText, Building2, User, DollarSign, Calendar, CheckCircle } from 'lucide-react';

export default function ChequeForm({ onChequeAdded, existingCheques = [] }) {
  const [tipo, setTipo] = useState('diferido'); // 'al-dia' o 'diferido'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    cliente: '',
    banco: '',
    monto: '',
    numero_cheque: '',
    fecha_emision: format(new Date(), 'yyyy-MM-dd'),
    fecha_pago: ''
  });

  // Autocomplete Suggestions
  const clientesSugeridos = useMemo(() => {
    const clientes = existingCheques.map(c => c.cliente).filter(Boolean);
    return [...new Set(clientes)];
  }, [existingCheques]);

  const bancosSugeridos = useMemo(() => {
    const bancos = existingCheques.map(c => c.banco).filter(Boolean);
    return [...new Set(bancos)];
  }, [existingCheques]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const fechaPagoFinal = tipo === 'al-dia' ? formData.fecha_emision : formData.fecha_pago;

      const { error } = await supabase.from('cheques').insert([{
        cliente: formData.cliente,
        banco: formData.banco,
        monto: parseFloat(formData.monto),
        numero_cheque: formData.numero_cheque,
        fecha_emision: formData.fecha_emision,
        fecha_pago: fechaPagoFinal,
        estado: 'pendiente'
      }]);

      if (error) throw error;

      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        monto: '',
        numero_cheque: '',
        cliente: '',
        banco: '',
        fecha_pago: ''
      }));
      onChequeAdded();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error al guardar el cheque:', error);
      alert('Hubo un error al guardar. Revisa la consola o asegúrate de haber configurado Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FileText className="text-brand-500" />
        Ingresar Nuevo Cheque
      </h2>

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-200">
          <CheckCircle size={20} />
          <p className="font-medium">Cheque registrado correctamente.</p>
        </div>
      )}

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-8 w-fit">
        <button
          type="button"
          onClick={() => setTipo('al-dia')}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
            tipo === 'al-dia' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Al día
        </button>
        <button
          type="button"
          onClick={() => setTipo('diferido')}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
            tipo === 'diferido' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Diferido
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="cliente"
                required
                value={formData.cliente}
                onChange={handleChange}
                list="clientes-list"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="Nombre del cliente"
              />
              <datalist id="clientes-list">
                {clientesSugeridos.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          {/* Banco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banco</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="banco"
                required
                value={formData.banco}
                onChange={handleChange}
                list="bancos-list"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="Nombre del banco"
              />
              <datalist id="bancos-list">
                {bancosSugeridos.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign size={18} className="text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                name="monto"
                required
                value={formData.monto}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Número de Cheque */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de Cheque</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="numero_cheque"
                required
                value={formData.numero_cheque}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="N° de serie / comprobante"
              />
            </div>
          </div>

          {/* Fecha de Emisión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Emisión</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <input
                type="date"
                name="fecha_emision"
                required
                value={formData.fecha_emision}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Fecha de Pago (Condicional) */}
          {tipo === 'diferido' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Pago (Vencimiento comercial)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-brand-500" />
                </div>
                <input
                  type="date"
                  name="fecha_pago"
                  required={tipo === 'diferido'}
                  value={formData.fecha_pago}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-brand-200 ring-1 ring-brand-100 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-brand-50/30"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                La fecha de vencimiento legal se calculará como +30 días sobre esta fecha automáticamente en la base de datos.
              </p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
            <span>Registrar Cheque</span>
          </button>
        </div>
      </form>
    </div>
  );
}
