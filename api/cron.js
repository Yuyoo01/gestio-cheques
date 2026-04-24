import { createClient } from '@supabase/supabase-js';

// Inicializar cliente de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
// Nota: Usar el Service Role Key para el cron job para evadir RLS si existe

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(request, response) {
  // Solo permitir ejecución vía Vercel Cron o autorización explícita
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Obtener los cheques pendientes
    const { data: cheques, error } = await supabase
      .from('cheques')
      .select('*')
      .eq('estado', 'pendiente');

    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chequesAAlertar = [];

    cheques.forEach(cheque => {
      const fechaVencimiento = new Date(cheque.fecha_vencimiento_legal);
      fechaVencimiento.setHours(0,0,0,0);
      const diffVencimiento = Math.ceil((fechaVencimiento - today) / (1000 * 60 * 60 * 24));

      const fechaPago = new Date(cheque.fecha_pago);
      fechaPago.setHours(0,0,0,0);
      const diffPago = Math.ceil((fechaPago - today) / (1000 * 60 * 60 * 24));

      // Filtramos cheques que estén por cobrar o vencer legalmente en los próximos 7 días
      if ((diffVencimiento >= 0 && diffVencimiento <= 7) || (diffPago >= 0 && diffPago <= 7)) {
        chequesAAlertar.push(cheque);
      }
    });

    const mensajesAEnviar = [];

    if (chequesAAlertar.length > 0) {
      let msj = `*Aplicacion gestion de cheques LONA TRUCK*\n\nUsted tiene ${chequesAAlertar.length} cheques que vencen o se pueden cobrar en los proximos 7 dias:\n`;

      chequesAAlertar.forEach(cheque => {
        const montoFormateado = Number(cheque.monto).toLocaleString('es-AR');
        msj += `----------\nCliente: ${cheque.cliente}\nNro cheque: ${cheque.numero_cheque || 'S/N'}\nMonto: $${montoFormateado}\nBanco: ${cheque.banco}\n`;
      });
      msj += `----------`;
      
      mensajesAEnviar.push(msj);
    }

    // Enviar mensajes por CallMeBot
    const phone = process.env.CALLMEBOT_PHONE;
    const apiKey = process.env.CALLMEBOT_API_KEY;

    if (!phone || !apiKey) {
      console.error('CallMeBot credentials missing.');
      return response.status(500).json({ error: 'Faltan credenciales de CallMeBot' });
    }

    for (const msj of mensajesAEnviar) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(msj)}&apikey=${apiKey}`;
      
      await fetch(url);
      // Esperar un poco entre mensajes para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return response.status(200).json({ success: true, enviados: mensajesAEnviar.length });
  } catch (error) {
    console.error('Error in cron job:', error);
    return response.status(500).json({ error: error.message });
  }
}
