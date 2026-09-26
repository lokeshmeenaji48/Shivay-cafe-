import { Reservation } from '../types';
import { supabase, getAuthUser } from './supabase';
import { getApiUrl } from './apiConfig';

let resvRealtimeChannel: any = null;

export function setupSupabaseReservationRealtime(onChange: () => void) {
  if (resvRealtimeChannel) return;
  resvRealtimeChannel = supabase
    .channel('reservations_realtime_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reservations' },
      () => {
        onChange();
      }
    )
    .subscribe();
}

export function getStoredReservations(): Reservation[] {
  try {
    const saved = localStorage.getItem('shivay_reservations');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveReservations(reservations: Reservation[]): void {
  try {
    localStorage.setItem('shivay_reservations', JSON.stringify(reservations));
    window.dispatchEvent(new CustomEvent('shivay_reservations_updated'));
  } catch (e) {
    console.error('Error saving reservations', e);
  }
}

// Fetch all reservations from Supabase
export async function fetchReservationsFromServer(): Promise<Reservation[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const formatted: Reservation[] = data.map((r) => {
        const rawDate = r.reservation_date ? new Date(r.reservation_date) : new Date();
        const dateStr = rawDate.toISOString().slice(0, 10);
        const timeStr = rawDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          id: r.id,
          name: r.customer_name,
          phone: r.mobile,
          email: '',
          date: dateStr,
          time: timeStr,
          guests: Number(r.guests) || 2,
          tableType: r.table_number || 'Standard Seating',
          specialRequests: r.special_requests || undefined,
          status: (r.status === 'confirmed' ? 'Confirmed' : r.status === 'cancelled' ? 'Cancelled' : 'Pending') as any,
          createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        };
      });

      saveReservations(formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('Direct Supabase reservations fetch notice:', err);
  }

  // Fallback to Express backend API
  try {
    const res = await fetch(getApiUrl('/api/reservations'));
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveReservations(data);
        return data;
      }
    }
  } catch (e) {
    console.warn('API reservations fallback failed:', e);
  }

  return getStoredReservations();
}

export interface NewReservationInput {
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  tableType: string;
  specialRequests?: string;
}

// Create reservation directly in Supabase 'reservations' table
export async function createReservationOnServer(input: NewReservationInput): Promise<Reservation> {
  const customerName = input.name.trim();
  const mobile = input.phone.trim();

  if (!customerName) {
    throw new Error('Please enter your name');
  }
  if (!mobile || mobile.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number');
  }

  // Combine date & time into ISO string
  let reservationDate = new Date();
  if (input.date) {
    const combined = input.time ? `${input.date}T${input.time}` : input.date;
    const parsed = new Date(combined);
    if (!isNaN(parsed.getTime())) {
      reservationDate = parsed;
    }
  }

  const authUser = await getAuthUser();
  const customerId = authUser ? authUser.id : null;

  // Insert into Supabase reservations table
  const { data, error } = await supabase
    .from('reservations')
    .insert([
      {
        customer_id: customerId,
        customer_name: customerName,
        mobile,
        table_number: input.tableType || 'Standard',
        reservation_date: reservationDate.toISOString(),
        guests: Number(input.guests) || 2,
        special_requests: input.specialRequests?.trim() || null,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error || !data) {
    console.warn('Direct Supabase reservation insert notice, trying API:', error);
    try {
      const res = await fetch(getApiUrl('/api/reservations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.reservation) {
          const current = getStoredReservations();
          saveReservations([body.reservation, ...current]);
          return body.reservation;
        }
      }
    } catch (apiErr) {
      console.error('API reservations fallback error:', apiErr);
    }
    throw new Error(error ? error.message : 'Failed to book reservation in database');
  }

  const newResv: Reservation = {
    id: data.id,
    name: data.customer_name,
    phone: data.mobile,
    email: input.email || '',
    date: input.date,
    time: input.time,
    guests: data.guests,
    tableType: data.table_number,
    specialRequests: data.special_requests || undefined,
    status: 'Pending',
    createdAt: new Date().toLocaleDateString(),
  };

  const current = getStoredReservations();
  saveReservations([newResv, ...current.filter((r) => r.id !== newResv.id)]);
  return newResv;
}

// Update reservation status in Supabase
export async function updateReservationStatusOnServer(id: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ status: status.toLowerCase() })
      .eq('id', id);

    if (!error) {
      const current = getStoredReservations();
      const updated = current.map((r) => (r.id === id ? { ...r, status: status as any } : r));
      saveReservations(updated);
      return true;
    }
  } catch (err) {
    console.warn('Supabase reservation status update error:', err);
  }
  return false;
}

// Delete reservation from Supabase
export async function deleteReservationOnServer(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (!error) {
      const current = getStoredReservations();
      const updated = current.filter((r) => r.id !== id);
      saveReservations(updated);
      return true;
    }
  } catch (err) {
    console.warn('Supabase reservation delete error:', err);
  }
  return false;
}
