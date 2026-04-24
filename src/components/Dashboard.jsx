import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import ChequeForm from './ChequeForm';
import ChequesModal from './ChequesModal';
import CarteraModal from './CarteraModal';
import { addDays, isBefore, isToday, parseISO } from 'date-fns';

export default function Dashboard() {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCarteraModalOpen, setIsCarteraModalOpen] = useState(false);

  const fetchCheques = async () => {
    try {
      const { data, error } = await supabase
        .from('cheques')
        .select('*')
        .eq('estado', 'pendiente')
        .order('fecha_pago', { ascending: true });
      
      if (error) throw error;
      setCheques(data || []);
    } catch (error) {
      console.error('Error fetching cheques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheques();
    
    // Configurar suscripción para realtime si se requiere
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cheques' }, fetchCheques)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCobrar = async (id) => {
    try {
      const { error } = await supabase
        .from('cheques')
        .update({ estado: 'cobrado' })
        .eq('id', id);
      
      if (error) throw error;
      await fetchCheques();
    } catch (error) {
      console.error('Error al cobrar cheque:', error);
      alert('Hubo un error al actualizar el estado.');
    }
  };

  const totalCartera = cheques.reduce((acc, curr) => acc + Number(curr.monto), 0);
  
  const listosParaCobrar = cheques.filter(c => {
    const pagoDate = parseISO(c.fecha_pago);
    return (isBefore(pagoDate, new Date()) || isToday(pagoDate)) && c.estado === 'pendiente';
  });
  
  const totalListos = listosParaCobrar.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-100">
      <Sidebar 
        cheques={cheques} 
        listosParaCobrar={listosParaCobrar} 
        onOpenModal={() => setIsModalOpen(true)} 
      />
      
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h1>
            <p className="text-gray-500">Gestión de cartera de cheques Lona-Truck</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setIsCarteraModalOpen(true)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[200px] hover:bg-gray-50 hover:border-gray-200 transition-all text-left cursor-pointer group"
            >
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Total en Cartera</p>
                <div className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">Ver detalle</div>
              </div>
              <p className="text-2xl font-bold text-gray-900">${totalCartera.toLocaleString('es-AR')}</p>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[200px] border-l-4 border-l-brand-500 hover:bg-brand-50 hover:border-brand-200 transition-all text-left cursor-pointer group"
            >
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-500 font-medium group-hover:text-brand-600 transition-colors">Listos para Cobrar</p>
                <div className="bg-brand-100 text-brand-600 text-xs px-2 py-0.5 rounded-full font-bold">Ver detalle</div>
              </div>
              <p className="text-2xl font-bold text-brand-600">${totalListos.toLocaleString('es-AR')}</p>
            </button>
          </div>
        </header>

        <div className="max-w-3xl">
          <ChequeForm onChequeAdded={fetchCheques} existingCheques={cheques} />
        </div>

        <ChequesModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          cheques={listosParaCobrar} 
          onCobrar={handleCobrar} 
        />

        <CarteraModal
          isOpen={isCarteraModalOpen}
          onClose={() => setIsCarteraModalOpen(false)}
          cheques={cheques}
        />
      </main>
    </div>
  );
}
