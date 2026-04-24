import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar({ cheques }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  // Agrupar cheques pendientes por fecha de pago
  const chequesPendientes = cheques.filter(c => c.estado === 'pendiente');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm w-full">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-sm font-bold text-gray-800 capitalize">
          {format(currentMonth, dateFormat, { locale: es })}
        </h2>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          // Buscar si hay cheques que vencen legalmente este día (30 días después del pago)
          const chequesDelDia = chequesPendientes.filter(c => isSameDay(parseISO(c.fecha_vencimiento_legal), day));
          const hasCheque = chequesDelDia.length > 0;
          
          const isTodayDate = isSameDay(day, new Date());

          let dayClasses = "flex items-center justify-center h-8 w-8 rounded-full text-sm mx-auto transition-all ";
          
          if (hasCheque) {
            dayClasses += "bg-red-100 text-red-700 font-bold ring-1 ring-red-300 shadow-sm cursor-help hover:bg-red-200 ";
          } else if (isTodayDate) {
            dayClasses += "bg-brand-50 text-brand-700 font-bold ";
          } else if (!isCurrentMonth) {
            dayClasses += "text-gray-300 ";
          } else {
            dayClasses += "text-gray-700 hover:bg-gray-50 ";
          }

          const tooltip = hasCheque 
            ? `${chequesDelDia.length} ${chequesDelDia.length === 1 ? 'cheque vence' : 'cheques vencen'} este día` 
            : '';

          return (
            <div 
              key={idx} 
              className={dayClasses}
              title={tooltip}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
