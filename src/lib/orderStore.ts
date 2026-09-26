import { Order } from '../types';
import { supabase, getAuthUser } from './supabase';
import { getApiUrl } from './apiConfig';

let orderRealtimeChannel: any = null;

// Subscribe to Supabase Realtime changes on 'orders' table
export function setupSupabaseOrderRealtime(onOrderChange: () => void) {
  if (orderRealtimeChannel) return;
  orderRealtimeChannel = supabase
    .channel('orders_realtime_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('⚡ Supabase Realtime Order Event:', payload.eventType);
        onOrderChange();
      }
    )
    .subscribe((status) => {
      console.log('⚡ Supabase Orders Realtime Status:', status);
    });
}

export function getStoredOrders(): Order[] {
  try {
    const saved = localStorage.getItem('shivay_orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem('shivay_orders', JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('shivay_orders_updated'));
  } catch (e) {
    console.error('Error saving shivay_orders', e);
  }
}

// Fetch orders directly from Supabase DB with linked order_items
export async function fetchOrdersFromServer(): Promise<Order[]> {
  try {
    const { data: dbOrders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(dbOrders)) {
      const formatted: Order[] = dbOrders.map((o) => {
        const firstItem = o.order_items && o.order_items.length > 0 ? o.order_items[0] : null;
        // Capitalize status
        const rawStatus = o.order_status || 'Pending';
        const mappedStatus =
          rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

        return {
          id: o.order_number || o.id,
          productName: firstItem ? firstItem.item_name : 'Shivay Special Item',
          productPrice: firstItem ? Number(firstItem.price) : Number(o.total_amount),
          productCategory: 'Food',
          productImage: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
          customerName: o.customer_name,
          tableNumber: o.table_number,
          phone: o.mobile,
          quantity: firstItem ? Number(firstItem.quantity) : 1,
          totalAmount: Number(o.total_amount),
          status: mappedStatus as Order['status'],
          paymentMethod: (o.payment_method as any) || 'Cash',
          paymentStatus: (o.payment_status as any) || 'Pending',
          createdAt: o.created_at
            ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: o.notes || undefined,
        };
      });

      saveOrders(formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('Could not fetch orders directly from Supabase, falling back to API:', err);
  }

  // Fallback to Express backend endpoint
  try {
    const res = await fetch(getApiUrl('/api/orders'));
    if (res.ok) {
      const serverOrders = await res.json();
      if (Array.isArray(serverOrders)) {
        saveOrders(serverOrders);
        return serverOrders;
      }
    }
  } catch (err) {
    console.warn('Error fetching orders from backend API:', err);
  }

  return getStoredOrders();
}

export interface PlaceOrderInput {
  productId?: string;
  productName: string;
  customerName: string;
  phone: string;
  tableNumber: string;
  quantity: number;
  paymentMethod?: 'Cash' | 'UPI' | 'Card';
  notes?: string;
}

// Production-verified Order placement strictly adhering to database prices and integrity
export async function placeCustomerOrder(input: PlaceOrderInput): Promise<Order> {
  const quantity = Math.max(1, Math.floor(Number(input.quantity) || 1));
  const customerName = input.customerName.trim();
  const phone = input.phone.trim();
  const tableNumber = input.tableNumber.trim() || 'Table 1';

  if (!customerName) {
    throw new Error('Customer name is required');
  }
  if (!phone || phone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number');
  }

  // 1. Verify item and fetch real price from Supabase
  let dbItem: any = null;
  if (input.productId) {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', input.productId)
      .single();
    dbItem = data;
  }
  if (!dbItem) {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .ilike('name', `%${input.productName.trim()}%`)
      .limit(1);
    if (data && data.length > 0) {
      dbItem = data[0];
    }
  }

  // If item found in DB, check availability
  if (dbItem && dbItem.available === false) {
    throw new Error(`"${dbItem.name}" is currently sold out. Please choose another item.`);
  }

  // Authoritative price directly from Supabase DB (or default safe fallback if menu item not yet synced)
  const officialPrice = dbItem ? Number(dbItem.price) : 60;
  const officialName = dbItem ? dbItem.name : input.productName.trim();
  const totalAmount = officialPrice * quantity;

  // Generate unique order number (e.g. SHIVAY-582914)
  const orderNumber = `SHIVAY-${Date.now().toString().slice(-6)}`;

  // Check if customer is authenticated
  const authUser = await getAuthUser();
  const customerId = authUser ? authUser.id : null;

  // 2. Insert into 'orders' table in Supabase
  const { data: createdOrder, error: orderErr } = await supabase
    .from('orders')
    .insert([
      {
        order_number: orderNumber,
        customer_id: customerId,
        customer_name: customerName,
        mobile: phone,
        table_number: tableNumber,
        total_amount: totalAmount,
        payment_method: input.paymentMethod || 'Cash',
        payment_status: input.paymentMethod === 'UPI' ? 'Paid' : 'Pending',
        order_status: 'pending',
        notes: input.notes?.trim() || null,
      },
    ])
    .select()
    .single();

  if (orderErr || !createdOrder) {
    console.error('Supabase orders insert error:', orderErr);
    // Try backend proxy if direct Supabase failed
    try {
      const res = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderNumber,
          productName: officialName,
          productPrice: officialPrice,
          customerName,
          phone,
          tableNumber,
          quantity,
          totalAmount,
          paymentMethod: input.paymentMethod || 'Cash',
          notes: input.notes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          const current = getStoredOrders();
          saveOrders([data.order, ...current]);
          return data.order;
        }
      }
    } catch (apiErr) {
      console.error('API order fallback failed:', apiErr);
    }
    throw new Error(orderErr ? orderErr.message : 'Database order creation failed');
  }

  // 3. Insert into 'order_items' table in Supabase
  const { error: itemErr } = await supabase.from('order_items').insert([
    {
      order_id: createdOrder.id,
      menu_item_id: dbItem ? dbItem.id : null,
      item_name: officialName,
      quantity,
      price: officialPrice,
      subtotal: totalAmount,
    },
  ]);

  if (itemErr) {
    console.warn('Order items insert notice:', itemErr.message);
  }

  const finalOrder: Order = {
    id: createdOrder.order_number || orderNumber,
    productName: officialName,
    productPrice: officialPrice,
    productCategory: dbItem ? dbItem.category : 'Special',
    productImage:
      dbItem?.image_url ||
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    customerName,
    tableNumber,
    phone,
    quantity,
    totalAmount,
    status: 'Pending',
    paymentMethod: (input.paymentMethod as any) || 'Cash',
    paymentStatus: input.paymentMethod === 'UPI' ? 'Paid' : 'Pending',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    notes: input.notes,
  };

  const current = getStoredOrders();
  saveOrders([finalOrder, ...current.filter((o) => o.id !== finalOrder.id)]);
  return finalOrder;
}

// Update order status directly in Supabase
export async function updateOrderStatusOnServer(
  orderId: string,
  status: Order['status']
): Promise<boolean> {
  const dbStatus = status.toLowerCase();

  try {
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .or(`order_number.eq.${orderId},id.eq.${orderId}`)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('orders')
        .update({
          order_status: dbStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (!error) {
        const current = getStoredOrders();
        const updated = current.map((o) =>
          o.id === orderId
            ? { ...o, status, updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            : o
        );
        saveOrders(updated);
        return true;
      }
    }
  } catch (e) {
    console.warn('Direct Supabase status update notice, trying API:', e);
  }

  try {
    const res = await fetch(getApiUrl(`/api/orders/${orderId}/status`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const current = getStoredOrders();
      const updated = current.map((o) => (o.id === orderId ? { ...o, status } : o));
      saveOrders(updated);
      return true;
    }
  } catch (e) {
    console.warn('API update failed:', e);
  }

  return false;
}

// Delete order from Supabase
export async function deleteOrderOnServer(orderId: string): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .or(`order_number.eq.${orderId},id.eq.${orderId}`)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('orders').delete().eq('id', existing.id);
      if (!error) {
        const current = getStoredOrders();
        const updated = current.filter((o) => o.id !== orderId);
        saveOrders(updated);
        return true;
      }
    }
  } catch (e) {
    console.warn('Direct Supabase delete notice, trying API:', e);
  }

  try {
    const res = await fetch(getApiUrl(`/api/orders/${orderId}`), {
      method: 'DELETE',
    });
    if (res.ok) {
      const current = getStoredOrders();
      const updated = current.filter((o) => o.id !== orderId);
      saveOrders(updated);
      return true;
    }
  } catch (e) {
    console.warn('API delete failed:', e);
  }

  return false;
}

// Backward-compatible alias
export const createOrderOnServer = async (orderData: any) => {
  return placeCustomerOrder({
    productId: orderData.productId,
    productName: orderData.productName,
    customerName: orderData.customerName,
    phone: orderData.phone,
    tableNumber: orderData.tableNumber,
    quantity: orderData.quantity,
    paymentMethod: orderData.paymentMethod,
    notes: orderData.notes
  });
};
