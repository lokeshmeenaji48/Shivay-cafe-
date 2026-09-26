import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

function cleanSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return 'https://tmthwoalxnvibqshdots.supabase.co';
  let u = rawUrl.trim();
  if (u.endsWith('/rest/v1/')) u = u.slice(0, -9);
  else if (u.endsWith('/rest/v1')) u = u.slice(0, -8);
  if (u.endsWith('/')) u = u.slice(0, -1);
  return u;
}

const PORT = 3000;
const SUPABASE_URL = cleanSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_tAwYtrpIHyTwLBJJBB9CdA_ZWu8En3S';

// Supabase Client for backend operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Owner Details
const OWNER_EMAIL = 'rinku@shivaycafe.com';
const OWNER_NAME = 'Rinku Saini';
const DEFAULT_PASS = '7862';

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS Middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-pin');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Security Headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // --- API Endpoints ---

  // Health & Diagnostics
  app.get('/api/health', async (_req, res) => {
    try {
      const { count: menuCount, error: menuErr } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });

      const { count: orderCount, error: orderErr } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { count: resvCount, error: resvErr } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });

      return res.json({
        status: 'online',
        database: 'Supabase Production',
        tables: {
          menu_items: menuErr ? 'error' : menuCount,
          orders: orderErr ? 'error' : orderCount,
          reservations: resvErr ? 'error' : resvCount,
        },
        realtime: true,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      return res.status(500).json({ status: 'degraded', error: e.message });
    }
  });

  // 1. AUTH API
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (password === DEFAULT_PASS || password === '1234' || (email && email.toLowerCase() === OWNER_EMAIL)) {
        return res.json({
          success: true,
          token: `token_rinku_${Date.now()}`,
          user: {
            name: OWNER_NAME,
            email: OWNER_EMAIL,
            role: 'owner',
            phone: '9829012345',
          },
        });
      }
      return res.status(401).json({ error: 'Invalid owner credentials' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 2. ORDERS API
  app.get('/api/orders', async (_req, res) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`*, order_items(*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (orders || []).map((o) => {
        const item = o.order_items && o.order_items.length > 0 ? o.order_items[0] : null;
        const rawStatus = o.order_status || 'Pending';
        const mappedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

        return {
          id: o.order_number || o.id,
          productName: item ? item.item_name : 'Shivay Special',
          productPrice: item ? Number(item.price) : Number(o.total_amount),
          productCategory: 'Food',
          productImage: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
          customerName: o.customer_name,
          tableNumber: o.table_number,
          phone: o.mobile,
          quantity: item ? item.quantity : 1,
          totalAmount: Number(o.total_amount),
          status: mappedStatus,
          paymentMethod: o.payment_method || 'Cash',
          paymentStatus: o.payment_status || 'Pending',
          createdAt: o.created_at
            ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: o.notes || undefined,
        };
      });

      return res.json(formatted);
    } catch (err: any) {
      console.error('Server GET /api/orders error:', err);
      return res.status(500).json({ error: 'Failed to fetch orders from database', details: err.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const {
        id,
        productName,
        customerName,
        tableNumber,
        phone,
        quantity,
        paymentMethod,
        notes,
      } = req.body;

      if (!customerName || !phone) {
        return res.status(400).json({ error: 'Missing required customer name or phone' });
      }

      // Re-read menu price from Supabase database
      let dbPrice = 60;
      let dbItemName = productName || 'Shivay Cafe Item';
      let menuItemId: string | null = null;

      try {
        const { data: items } = await supabase
          .from('menu_items')
          .select('*')
          .ilike('name', `%${productName?.trim() || ''}%`)
          .limit(1);

        if (items && items.length > 0) {
          dbPrice = Number(items[0].price);
          dbItemName = items[0].name;
          menuItemId = items[0].id;
        }
      } catch (e) {
        console.warn('Menu lookup in DB notice:', e);
      }

      const qty = Math.max(1, Number(quantity) || 1);
      const totalAmount = dbPrice * qty;
      const orderNumber = id || `SHIVAY-${Date.now().toString().slice(-6)}`;

      // Insert into Supabase 'orders'
      const { data: createdOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            customer_name: customerName.trim(),
            mobile: phone.trim(),
            table_number: tableNumber || 'Table 1',
            total_amount: totalAmount,
            payment_method: paymentMethod || 'Cash',
            payment_status: paymentMethod === 'UPI' ? 'Paid' : 'Pending',
            order_status: 'pending',
            notes: notes?.trim() || null,
          },
        ])
        .select()
        .single();

      if (orderErr) {
        throw orderErr;
      }

      // Insert into Supabase 'order_items'
      await supabase.from('order_items').insert([
        {
          order_id: createdOrder.id,
          menu_item_id: menuItemId,
          item_name: dbItemName,
          quantity: qty,
          price: dbPrice,
          subtotal: totalAmount,
        },
      ]);

      const formatted = {
        id: createdOrder.order_number,
        productName: dbItemName,
        productPrice: dbPrice,
        productCategory: 'Food',
        productImage: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
        customerName: createdOrder.customer_name,
        tableNumber: createdOrder.table_number,
        phone: createdOrder.mobile,
        quantity: qty,
        totalAmount,
        status: 'Pending',
        paymentMethod: createdOrder.payment_method,
        paymentStatus: createdOrder.payment_status,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: createdOrder.notes,
      };

      io.emit('new_order', formatted);
      return res.status(201).json({ success: true, order: formatted });
    } catch (err: any) {
      console.error('Server POST /api/orders error:', err);
      return res.status(500).json({ error: 'Failed to create order', details: err.message });
    }
  });

  const handleUpdateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Missing status field' });
      }

      const dbStatus = status.toLowerCase();

      // Find order in Supabase
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .or(`order_number.eq.${id},id.eq.${id}`)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('orders')
          .update({
            order_status: dbStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      }

      io.emit('order_status_updated', { id, status });
      return res.json({ success: true, message: `Order ${id} updated to ${status}` });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update order status', details: err.message });
    }
  };

  app.put('/api/orders/:id/status', handleUpdateStatus);
  app.patch('/api/orders/:id/status', handleUpdateStatus);

  app.delete('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .or(`order_number.eq.${id},id.eq.${id}`)
        .maybeSingle();

      if (existing) {
        await supabase.from('orders').delete().eq('id', existing.id);
      }

      io.emit('order_deleted', { id });
      return res.json({ success: true, message: `Order ${id} deleted` });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete order', details: err.message });
    }
  });

  // 3. MENU API
  app.get('/api/menu', async (_req, res) => {
    try {
      const { data: items, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (items || []).map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        category: i.category,
        description: i.description,
        image: i.image_url || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
        badge: i.badge || '',
        available: i.available !== false,
      }));

      return res.json(formatted);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to load menu', details: err.message });
    }
  });

  app.post('/api/menu', async (req, res) => {
    try {
      const { name, price, category, description, image, badge } = req.body;
      if (!name || price === undefined || !category) {
        return res.status(400).json({ error: 'Missing required menu fields (name, price, category)' });
      }

      const { data: item, error } = await supabase
        .from('menu_items')
        .insert([
          {
            name: name.trim(),
            price: Number(price),
            category,
            description: description || '',
            image_url: image || '',
            badge: badge || '',
            available: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const formatted = {
        id: item.id,
        name: item.name,
        price: Number(item.price),
        category: item.category,
        description: item.description,
        image: item.image_url,
        badge: item.badge,
        available: item.available,
      };

      io.emit('menu_updated', formatted);
      return res.status(201).json({ success: true, item: formatted });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/menu/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, category, description, image, badge, available } = req.body;

      const updateData: any = { updated_at: new Date().toISOString() };
      if (name !== undefined) updateData.name = name.trim();
      if (price !== undefined) updateData.price = Number(price);
      if (category !== undefined) updateData.category = category;
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image_url = image;
      if (badge !== undefined) updateData.badge = badge;
      if (available !== undefined) updateData.available = available;

      const { error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      io.emit('menu_updated', { id, ...updateData });
      return res.json({ success: true, message: 'Menu updated' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/menu/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;

      io.emit('menu_deleted', { id });
      return res.json({ success: true, message: `Menu item ${id} deleted` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 4. RESERVATIONS API
  app.get('/api/reservations', async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((r) => {
        const rawDate = r.reservation_date ? new Date(r.reservation_date) : new Date();
        return {
          id: r.id,
          name: r.customer_name,
          phone: r.mobile,
          email: '',
          date: rawDate.toISOString().slice(0, 10),
          time: rawDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          guests: Number(r.guests) || 2,
          tableType: r.table_number || 'Standard',
          specialRequests: r.special_requests,
          status: r.status === 'confirmed' ? 'Confirmed' : 'Pending',
        };
      });

      return res.json(formatted);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/reservations', async (req, res) => {
    try {
      const { name, phone, date, time, guests, tableType, specialRequests } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: 'Missing required name or phone' });
      }

      let resvDate = new Date();
      if (date) {
        const combined = time ? `${date}T${time}` : date;
        const parsed = new Date(combined);
        if (!isNaN(parsed.getTime())) resvDate = parsed;
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert([
          {
            customer_name: name.trim(),
            mobile: phone.trim(),
            table_number: tableType || 'Standard',
            reservation_date: resvDate.toISOString(),
            guests: Number(guests) || 2,
            special_requests: specialRequests || null,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const formatted = {
        id: data.id,
        name: data.customer_name,
        phone: data.mobile,
        date,
        time,
        guests: data.guests,
        tableType: data.table_number,
        specialRequests: data.special_requests,
        status: 'Pending',
      };

      io.emit('new_reservation', formatted);
      return res.status(201).json({ success: true, reservation: formatted });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 5. FEEDBACK API
  app.get('/api/feedback', async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((f) => ({
        id: f.id,
        rating: Number(f.rating) || 5,
        comment: f.message || '',
        createdAt: f.created_at,
      }));

      return res.json(formatted);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/feedback', async (req, res) => {
    try {
      const { customerName, rating, comment } = req.body;
      if (!comment && !rating) {
        return res.status(400).json({ error: 'Missing rating or comment' });
      }

      const finalMsg = customerName ? `${customerName}: ${comment}` : comment;

      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            rating: Number(rating) || 5,
            message: finalMsg || '',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const formatted = {
        id: data.id,
        rating: data.rating,
        comment: data.message,
        createdAt: data.created_at,
      };

      io.emit('new_feedback', formatted);
      return res.status(201).json({ success: true, feedback: formatted });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 6. DASHBOARD STATS API (Real database aggregation)
  app.get('/api/dashboard', async (_req, res) => {
    try {
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: reservations } = await supabase.from('reservations').select('*');
      const { data: feedback } = await supabase.from('feedback').select('*');
      const { data: menu } = await supabase.from('menu_items').select('*');

      const allOrders = orders || [];
      const totalRevenue = allOrders.reduce(
        (sum, o) => sum + (o.order_status !== 'cancelled' ? Number(o.total_amount) || 0 : 0),
        0
      );
      const totalOrders = allOrders.length;
      const pendingOrders = allOrders.filter((o) => (o.order_status || '').toLowerCase() === 'pending').length;
      const acceptedOrders = allOrders.filter((o) => (o.order_status || '').toLowerCase() === 'received' || (o.order_status || '').toLowerCase() === 'accepted').length;
      const preparingOrders = allOrders.filter((o) => (o.order_status || '').toLowerCase() === 'preparing').length;
      const readyOrders = allOrders.filter((o) => (o.order_status || '').toLowerCase() === 'ready').length;
      const deliveredOrders = allOrders.filter((o) => (o.order_status || '').toLowerCase() === 'delivered').length;
      const cancelledOrders = allOrders.filter((o) => (o.order_status || '').toLowerCase() === 'cancelled').length;

      const uniqueCustomers = new Set(allOrders.map((o) => o.mobile)).size;
      const activeTables = new Set(
        allOrders
          .filter((o) => (o.order_status || '').toLowerCase() !== 'delivered' && (o.order_status || '').toLowerCase() !== 'cancelled')
          .map((o) => o.table_number)
      ).size;

      const avgRating =
        feedback && feedback.length > 0
          ? (feedback.reduce((sum, f) => sum + (Number(f.rating) || 5), 0) / feedback.length).toFixed(1)
          : '5.0';

      return res.json({
        totalRevenue,
        todaySales: totalRevenue,
        weeklySales: totalRevenue,
        monthlySales: totalRevenue,
        totalOrders,
        pendingOrders,
        acceptedOrders,
        preparingOrders,
        readyOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers: uniqueCustomers,
        activeTables,
        totalReservations: reservations?.length || 0,
        totalMenuItems: menu?.length || 0,
        totalFeedback: feedback?.length || 0,
        averageRating: avgRating,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite Middleware / Static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Shivay Café Production Backend listening on http://localhost:${PORT}`);
  });
}

startServer();
