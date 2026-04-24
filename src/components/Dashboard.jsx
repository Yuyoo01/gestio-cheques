import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import ChequeForm from './ChequeForm';
import { addDays, isBefore, isToday, parseISO } from 'date-fns';

export default function Dashboard() {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCheques = async () => {
    try {
      const { data, error } = await supabase
        .from('cheques')
        .select('*')
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

  const totalCartera = cheques.reduce((acc, curr) => acc + Number(curr.monto), 0);
  
  const listosParaCobrar = cheques.filter(c => {
    const pagoDate = parseISO(c.fecha_pago);
    return (isBefore(pagoDate, new Date()) || isToday(pagoDate)) && c.estado === 'pendiente';
  });
  
  const totalListos = listosParaCobrar.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-100">
      <Sidebar cheques={cheques} listosParaCobrar={listosParaCobrar} />
      
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h1>
            <p className="text-gray-500">Gestión de cartera de cheques Lona-Truck</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[200px]">
              <p className="text-sm text-gray-500 font-medium mb-1">Total en Cartera</p>
              <p className="text-2xl font-bold text-gray-900">${totalCartera.toLocaleString('es-AR')}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[200px] border-l-4 border-l-brand-500">
              <p className="text-sm text-gray-500 font-medium mb-1">Listos para Cobrar</p>
              <p className="text-2xl font-bold text-brand-600">${totalListos.toLocaleString('es-AR')}</p>
            </div>
          </div>
        </header>

        <div className="max-w-3xl">
          <ChequeForm onChequeAdded={fetchCheques} existingCheques={cheques} />
        </div>
      </main>
    </div>
  );
}
