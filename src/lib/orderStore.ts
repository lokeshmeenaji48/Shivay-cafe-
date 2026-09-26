import { Order } from '../types';
import { supabase } from './supabase';
import { getApiUrl } from './apiConfig';

let orderRealtimeChannel: any = null;

// Subscribe to Supabase Realtime changes on 'orders' table
export function setupSupabaseOrderRealtime(onOrderChange: () => void) {
  if (orderRealtimeChannel) return;

  orderRealtimeChannel = supabase
    .channel('orders_realtime_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        console.log(
          '⚡ Supabase Realtime Order Event:',
          payload.eventType
        );

        onOrderChange();
      }
    )
    .subscribe((status) => {
      console.log(
        '⚡ Supabase Orders Realtime Status:',
        status
      );
    });
}

// Get orders stored locally
export function getStoredOrders(): Order[] {
  try {
    const saved = localStorage.getItem('shivay_orders');

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage parsing errors
  }

  return [];
}

// Save orders locally
export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(
      'shivay_orders',
      JSON.stringify(orders)
    );

    window.dispatchEvent(
      new CustomEvent('shivay_orders_updated')
    );
  } catch (e) {
    console.error(
      'Error saving shivay_orders:',
      e
    );
  }
}

// Fetch orders from Supabase
export async function fetchOrdersFromServer(): Promise<Order[]> {
  try {
    const { data: dbOrders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', {
        ascending: false,
      });

    if (!error && Array.isArray(dbOrders)) {
      const formatted: Order[] = dbOrders.map((o: any) => {
        const firstItem =
          o.order_items &&
          o.order_items.length > 0
            ? o.order_items[0]
            : null;

        const rawStatus =
          o.order_status || 'pending';

        const mappedStatus =
          rawStatus.charAt(0).toUpperCase() +
          rawStatus.slice(1).toLowerCase();

        return {
          id:
            o.order_number ||
            o.id,

          productName:
            firstItem
              ? firstItem.item_name
              : 'Shivay Special Item',

          productPrice:
            firstItem
              ? Number(firstItem.price)
              : Number(o.total_amount),

          productCategory:
            'Food',

          productImage:
            firstItem?.image_url ||
            'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',

          customerName:
            o.customer_name,

          tableNumber:
            o.table_number,

          phone:
            o.mobile,

          quantity:
            firstItem
              ? Number(firstItem.quantity)
              : 1,

          totalAmount:
            Number(o.total_amount),

          status:
            mappedStatus as Order['status'],

          paymentMethod:
            (o.payment_method as any) ||
            'Cash',

          paymentStatus:
            (o.payment_status as any) ||
            'Pending',

          createdAt:
            o.created_at
              ? new Date(
                  o.created_at
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),

          notes:
            o.notes || undefined,
        };
      });

      saveOrders(formatted);

      return formatted;
    }
  } catch (err) {
    console.warn(
      'Could not fetch orders directly from Supabase, falling back to API:',
      err
    );
  }

  // Fallback to Express backend
  try {
    const res = await fetch(
      getApiUrl('/api/orders')
    );

    if (res.ok) {
      const serverOrders =
        await res.json();

      if (Array.isArray(serverOrders)) {
        saveOrders(serverOrders);

        return serverOrders;
      }
    }
  } catch (err) {
    console.warn(
      'Error fetching orders from backend API:',
      err
    );
  }

  // Final fallback to localStorage
  return getStoredOrders();
}

export interface PlaceOrderInput {
  productId?: string;

  productName: string;

  customerName: string;

  phone: string;

  tableNumber: string;

  quantity: number;

  paymentMethod?:
    | 'Cash'
    | 'UPI'
    | 'Card';

  notes?: string;
}

// Create customer order through secure Supabase Edge Function
export async function placeCustomerOrder(
  input: PlaceOrderInput
): Promise<Order> {
  const customerName =
    input.customerName.trim();

  const phone =
    input.phone.replace(/\D/g, '');

  const tableNumber =
    input.tableNumber.trim() ||
    'Table 1';

  const quantity = Math.max(
    1,
    Math.min(
      99,
      Math.floor(
        Number(input.quantity) || 1
      )
    )
  );

  // Validate customer name
  if (!customerName) {
    throw new Error(
      'Customer name is required'
    );
  }

  // Validate phone
  if (!/^[0-9]{10,15}$/.test(phone)) {
    throw new Error(
      'Please enter a valid mobile number'
    );
  }

  // Product ID is required
  if (!input.productId) {
    throw new Error(
      'Menu item is required'
    );
  }

  console.log(
    '🛒 Creating order through customer-order Edge Function...'
  );

  // Call secure Edge Function
  const { data, error } =
    await supabase.functions.invoke(
      'customer-order',
      {
        body: {
          productId:
            input.productId,

          customerName:
            customerName,

          phone:
            phone,

          tableNumber:
            tableNumber,

          quantity:
            quantity,

          paymentMethod:
            input.paymentMethod ||
            'Cash',

          notes:
            input.notes?.trim() ||
            null,
        },
      }
    );

  // Edge Function error
  if (error) {
    console.error(
      '❌ customer-order Edge Function error:',
      error
    );

    throw new Error(
      error.message ||
        'Order creation failed'
    );
  }

  // Validate response
  if (
    !data?.order ||
    !data?.order_item
  ) {
    console.error(
      '❌ Invalid customer-order response:',
      data
    );

    throw new Error(
      data?.error ||
        'Order creation failed'
    );
  }

  console.log(
    '✅ Order successfully created:',
    data
  );

  const dbOrder =
    data.order;

  const item =
    data.order_item;

  const menuItem =
    data.menu_item;

  const rawStatus =
    dbOrder.order_status ||
    'pending';

  const formattedStatus =
    rawStatus.charAt(0).toUpperCase() +
    rawStatus.slice(1).toLowerCase();

  // Convert database order into frontend Order type
  const finalOrder: Order = {
    id:
      dbOrder.order_number ||
      dbOrder.id,

    productName:
      item.item_name,

    productPrice:
      Number(item.price),

    productCategory:
      menuItem?.category ||
      'Food',

    productImage:
      menuItem?.image_url ||
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',

    customerName:
      dbOrder.customer_name,

    tableNumber:
      dbOrder.table_number,

    phone:
      dbOrder.mobile,

    quantity:
      Number(item.quantity),

    totalAmount:
      Number(dbOrder.total_amount),

    status:
      formattedStatus as Order['status'],

    paymentMethod:
      (dbOrder.payment_method as any) ||
      'Cash',

    paymentStatus:
      (dbOrder.payment_status as any) ||
      'Pending',

    createdAt:
      dbOrder.created_at
        ? new Date(
            dbOrder.created_at
          ).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),

    notes:
      dbOrder.notes ||
      undefined,
  };

  // Save locally for UI/cache
  const current =
    getStoredOrders();

  saveOrders([
    finalOrder,
    ...current.filter(
      (o) =>
        o.id !== finalOrder.id
    ),
  ]);

  return finalOrder;
}

// Update order status on server
export async function updateOrderStatusOnServer(
  orderId: string,
  status: Order['status']
): Promise<boolean> {
  const dbStatus =
    status.toLowerCase();

  try {
    const { data: existing } =
      await supabase
        .from('orders')
        .select('id')
        .or(
          `order_number.eq.${orderId},id.eq.${orderId}`
        )
        .maybeSingle();

    if (existing) {
      const { error } =
        await supabase
          .from('orders')
          .update({
            order_status:
              dbStatus,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            existing.id
          );

      if (!error) {
        const current =
          getStoredOrders();

        const updated =
          current.map((o) =>
            o.id === orderId
              ? {
                  ...o,

                  status,

                  updatedAt:
                    new Date().toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    ),
                }
              : o
          );

        saveOrders(updated);

        return true;
      }
    }
  } catch (e) {
    console.warn(
      'Direct Supabase status update notice, trying API:',
      e
    );
  }

  // API fallback
  try {
    const res =
      await fetch(
        getApiUrl(
          `/api/orders/${orderId}/status`
        ),
        {
          method: 'PATCH',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

    if (res.ok) {
      const current =
        getStoredOrders();

      const updated =
        current.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status,
              }
            : o
        );

      saveOrders(updated);

      return true;
    }
  } catch (e) {
    console.warn(
      'API update failed:',
      e
    );
  }

  return false;
}

// Delete order from server
export async function deleteOrderOnServer(
  orderId: string
): Promise<boolean> {
  try {
    const { data: existing } =
      await supabase
        .from('orders')
        .select('id')
        .or(
          `order_number.eq.${orderId},id.eq.${orderId}`
        )
        .maybeSingle();

    if (existing) {
      const { error } =
        await supabase
          .from('orders')
          .delete()
          .eq(
            'id',
            existing.id
          );

      if (!error) {
        const current =
          getStoredOrders();

        const updated =
          current.filter(
            (o) =>
              o.id !== orderId
          );

        saveOrders(updated);

        return true;
      }
    }
  } catch (e) {
    console.warn(
      'Direct Supabase delete notice, trying API:',
      e
    );
  }

  // API fallback
  try {
    const res =
      await fetch(
        getApiUrl(
          `/api/orders/${orderId}`
        ),
        {
          method: 'DELETE',
        }
      );

    if (res.ok) {
      const current =
        getStoredOrders();

      const updated =
        current.filter(
          (o) =>
            o.id !== orderId
        );

      saveOrders(updated);

      return true;
    }
  } catch (e) {
    console.warn(
      'API delete failed:',
      e
    );
  }

  return false;
}

// Backward-compatible alias
export const createOrderOnServer =
  async (
    orderData: any
  ) => {
    return placeCustomerOrder({
      productId:
        orderData.productId,

      productName:
        orderData.productName,

      customerName:
        orderData.customerName,

      phone:
        orderData.phone,

      tableNumber:
        orderData.tableNumber,

      quantity:
        orderData.quantity,

      paymentMethod:
        orderData.paymentMethod,

      notes:
        orderData.notes,
    });
  };
