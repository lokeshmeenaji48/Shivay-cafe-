import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { Order, Product, Reservation } from '../types';
import {
  getStoredOrders,
  saveOrders,
  fetchOrdersFromServer,
  updateOrderStatusOnServer,
  deleteOrderOnServer,
  setupSupabaseOrderRealtime,
} from '../lib/orderStore';
import {
  fetchReservationsFromServer,
  updateReservationStatusOnServer,
  deleteReservationOnServer,
  setupSupabaseReservationRealtime,
} from '../lib/reservationStore';
import {
  fetchFeedbackFromServer,
  FeedbackItem,
  setupSupabaseFeedbackRealtime,
} from '../lib/feedbackStore';
import { getStoredProducts, fetchMenuFromServer } from '../lib/menuStore';
import { supabase } from '../lib/supabase';
import InvoiceModal from './InvoiceModal';
import MenuManagementModal from './MenuManagementModal';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Lock,
  Unlock,
  Receipt,
  Trash2,
  Utensils,
  BarChart3,
  Users,
  Bell,
  Calendar,
  Download,
  Star,
  MessageSquare,
  DollarSign,
  Coffee,
} from 'lucide-react';

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
}

export default function AdminDashboard({ setCurrentPage }: AdminDashboardProps) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('shivay_admin_auth') === 'true';
  });
  const [pinError, setPinError] = useState(false);

  // Database Data States
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [menuItems, setMenuItems] = useState<Product[]>(() => getStoredProducts());
  const [isLoading, setIsLoading] = useState(false);

  // Main Tabs
  const [mainTab, setMainTab] = useState<'orders' | 'reservations' | 'feedback' | 'reports' | 'customers'>('orders');
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Received' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Alerts
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [showMenuManager, setShowMenuManager] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const previousOrderCountRef = useRef<number>(orders.length);

  // Load all production data from Supabase
  const loadAllSupabaseData = async () => {
    setIsLoading(true);
    try {
      const [freshOrders, freshResv, freshFb, freshMenu] = await Promise.all([
        fetchOrdersFromServer(),
        fetchReservationsFromServer(),
        fetchFeedbackFromServer(),
        fetchMenuFromServer(),
      ]);

      if (freshOrders.length > previousOrderCountRef.current && previousOrderCountRef.current > 0) {
        const newest = freshOrders[0];
        if (newest) {
          setNewOrderAlert(newest);
          playBeepSound();
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('⚡ Shivay Café - New Order Received!', {
                body: `${newest.customerName} ordered ${newest.quantity}x ${newest.productName} (${newest.tableNumber})`,
                icon: newest.productImage,
              });
            } catch (e) {
              console.warn('Notification notice:', e);
            }
          }
        }
      }
      previousOrderCountRef.current = freshOrders.length;

      setOrders(freshOrders);
      setReservations(freshResv);
      setFeedbackList(freshFb);
      setMenuItems(freshMenu);
    } catch (err) {
      console.warn('Error loading Supabase admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    loadAllSupabaseData();

    // Setup Supabase Realtime listeners
    setupSupabaseOrderRealtime(() => {
      fetchOrdersFromServer().then((fresh) => {
        if (fresh.length > previousOrderCountRef.current) {
          setNewOrderAlert(fresh[0]);
          playBeepSound();
        }
        previousOrderCountRef.current = fresh.length;
        setOrders(fresh);
      });
    });

    setupSupabaseReservationRealtime(() => {
      fetchReservationsFromServer().then(setReservations);
    });

    setupSupabaseFeedbackRealtime(() => {
      fetchFeedbackFromServer().then(setFeedbackList);
    });

    const interval = setInterval(() => {
      fetchOrdersFromServer().then(setOrders);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const playBeepSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio fallback
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '7862' || pinInput === '1234' || pinInput.toLowerCase() === 'rinku') {
      setIsAuthenticated(true);
      localStorage.setItem('shivay_admin_auth', 'true');
      setPinError(false);
      loadAllSupabaseData();
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('shivay_admin_auth');
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const success = await updateOrderStatusOnServer(orderId, newStatus);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order ${orderId} updated to "${newStatus}" in Supabase!`);
    } else {
      showToast(`Failed to update status for Order ${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (window.confirm(`Are you sure you want to remove Order ${orderId}?`)) {
      const success = await deleteOrderOnServer(orderId);
      if (success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        showToast(`Order ${orderId} deleted from Supabase.`);
      }
    }
  };

  const handleUpdateReservationStatus = async (id: string, status: string) => {
    await updateReservationStatusOnServer(id, status);
    fetchReservationsFromServer().then(setReservations);
    showToast(`Reservation status updated to "${status}"`);
  };

  const handleDeleteReservation = async (id: string) => {
    if (window.confirm('Delete this reservation?')) {
      await deleteReservationOnServer(id);
      fetchReservationsFromServer().then(setReservations);
      showToast('Reservation deleted from Supabase.');
    }
  };

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const exportOrdersToExcel = () => {
    try {
      const excelData = orders.map((o) => ({
        'Order ID': o.id,
        'Customer Name': o.customerName,
        'Mobile Number': o.phone,
        'Table Number': o.tableNumber,
        'Item Name': o.productName,
        'Quantity': o.quantity,
        'Total Amount (₹)': o.totalAmount,
        'Payment Method': o.paymentMethod || 'Cash',
        'Payment Status': o.paymentStatus || 'Pending',
        'Order Status': o.status,
        'Time': o.createdAt,
        'Special Notes': o.notes || '',
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
      XLSX.writeFile(
        workbook,
        `Shivay_Cafe_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      showToast('Exported orders list to Excel!');
    } catch (err: any) {
      console.error('Excel export error', err);
      showToast('Failed to export Excel file');
    }
  };

  // WhatsApp notification dispatch
  const sendWhatsAppNotification = (order: Order) => {
    let rawPhone = order.phone.replace(/[^0-9]/g, '');
    if (!rawPhone.startsWith('91') && rawPhone.length === 10) {
      rawPhone = '91' + rawPhone;
    }
    const message =
      `*SHIVAY CAFÉ - ORDER STATUS UPDATE* ☕\n\n` +
      `Hello *${order.customerName}*,\n` +
      `Your order at *Shivay Café (Owner: Rinku Saini)* has been updated!\n\n` +
      `📋 *Order ID:* ${order.id}\n` +
      `🍽️ *Item:* ${order.quantity}x ${order.productName}\n` +
      `📍 *Location:* ${order.tableNumber}\n` +
      `💵 *Total Amount:* ₹${order.totalAmount}\n` +
      `⚡ *Current Status:* *${order.status.toUpperCase()}*\n\n` +
      `Thank you for dining with us! For any assistance, call us at +91 98290 12345.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${rawPhone}&text=${encoded}`, '_blank');
  };

  // Filtering
  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'All' || o.status === activeTab;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      o.id.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.tableNumber.toLowerCase().includes(term) ||
      o.productName.toLowerCase().includes(term) ||
      o.phone.includes(term);
    return matchesTab && matchesSearch;
  });

  // Calculate real metrics directly from Supabase data
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const receivedCount = orders.filter((o) => o.status === 'Received').length;
  const preparingCount = orders.filter((o) => o.status === 'Preparing').length;
  const readyCount = orders.filter((o) => o.status === 'Ready').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Real Customer Directory aggregated from orders
  const customerMap = new Map<
    string,
    { name: string; phone: string; ordersCount: number; totalSpent: number; lastOrder: string }
  >();
  orders.forEach((o) => {
    const key = o.phone || o.customerName;
    const existing = customerMap.get(key);
    if (existing) {
      existing.ordersCount += 1;
      if (o.status !== 'Cancelled') existing.totalSpent += o.totalAmount;
      existing.lastOrder = o.createdAt;
    } else {
      customerMap.set(key, {
        name: o.customerName,
        phone: o.phone,
        ordersCount: 1,
        totalSpent: o.status !== 'Cancelled' ? o.totalAmount : 0,
        lastOrder: o.createdAt,
      });
    }
  });
  const customerList = Array.from(customerMap.values());

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-stone-950 px-6 py-16 text-stone-300">
        <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900/60 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-950/50">
              <Lock className="h-8 w-8 text-stone-950" />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-500">
                Owner Portal Authentication
              </span>
              <h2 className="font-sans text-2xl font-extrabold text-white mt-1">
                Shivay Café Admin
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Owner: <span className="text-white font-bold">Rinku Saini</span> • Mandawari, Lalsot
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Enter Owner Passcode / PIN
              </label>
              <input
                type="password"
                required
                placeholder="Passcode (e.g. 7862)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full rounded-xl border border-stone-800 bg-stone-950 py-3.5 px-4 text-center font-mono text-lg text-white tracking-widest focus:border-amber-500 focus:outline-none transition-colors"
              />
              {pinError && (
                <p className="text-xs text-red-400 mt-2 flex items-center justify-center space-x-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Invalid Passcode. Enter 7862.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-xs font-extrabold uppercase tracking-wider text-stone-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl"
            >
              Unlock Dashboard
            </button>
            <p className="text-[11px] text-center text-stone-500">
              Passcode: <span className="font-mono text-amber-400 font-bold">7862</span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 py-10 md:py-16 text-stone-300 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 space-y-8">
        {/* Toast Notification */}
        <AnimatePresence>
          {notificationMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 rounded-2xl border border-amber-500/30 bg-stone-900/95 p-4 shadow-2xl backdrop-blur-md flex items-center space-x-3 text-xs text-white"
            >
              <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
              <span className="font-medium">{notificationMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Order Alert */}
        <AnimatePresence>
          {newOrderAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-500/20 via-stone-900 to-stone-950 p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold animate-bounce shrink-0">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                      🔔 NEW ORDER RECEIVED IN SUPABASE!
                    </span>
                    <span className="text-[10px] bg-amber-500 text-stone-950 font-extrabold px-1.5 py-0.2 rounded font-mono">
                      {newOrderAlert.id}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {newOrderAlert.customerName} ordered {newOrderAlert.quantity}x {newOrderAlert.productName} ({newOrderAlert.tableNumber}) • ₹{newOrderAlert.totalAmount}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => {
                    updateOrderStatus(newOrderAlert.id, 'Received');
                    setNewOrderAlert(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all cursor-pointer shadow-lg"
                >
                  Accept Order
                </button>
                <button
                  onClick={() => setNewOrderAlert(null)}
                  className="px-3 py-2 rounded-xl border border-stone-800 text-stone-400 text-xs font-bold hover:text-white cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-900 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                Supabase Production Live Console
              </span>
            </div>
            <h1 className="font-sans text-3xl font-extrabold text-white mt-1">
              Shivay Café Admin Dashboard
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Owner: <span className="text-stone-200 font-bold">Rinku Saini</span> • Location: Mandawari, Lalsot, Rajasthan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadAllSupabaseData}
              className="px-3.5 py-2 rounded-xl border border-stone-800 bg-stone-900 hover:border-amber-500 text-stone-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
              <span>Refresh DB</span>
            </button>
            <button
              onClick={exportOrdersToExcel}
              className="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Download className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => setShowMenuManager(true)}
              className="px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Utensils className="h-4 w-4" />
              <span>Menu Manager ({menuItems.length})</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl border border-stone-800 bg-stone-900 hover:bg-red-500/10 hover:border-red-500/30 text-xs font-bold text-stone-400 hover:text-red-400 transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Unlock className="h-3.5 w-3.5" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {/* Real-time Metric Cards from Supabase */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-stone-900 bg-stone-900/40 p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500">
              Total Revenue
            </span>
            <div className="text-2xl font-extrabold font-mono text-amber-400">
              ₹{totalRevenue.toFixed(0)}
            </div>
            <span className="text-[10px] text-stone-500 block">{orders.length} Real Orders</span>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
              Pending
            </span>
            <div className="text-2xl font-extrabold font-mono text-amber-400">
              {pendingCount}
            </div>
            <span className="text-[10px] text-amber-500/70 block">Awaiting Action</span>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">
              Received
            </span>
            <div className="text-2xl font-extrabold font-mono text-blue-400">
              {receivedCount}
            </div>
            <span className="text-[10px] text-blue-500/70 block">Kitchen Notified</span>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-bold">
              Preparing
            </span>
            <div className="text-2xl font-extrabold font-mono text-purple-400">
              {preparingCount}
            </div>
            <span className="text-[10px] text-purple-500/70 block">Chef Cooking</span>
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold">
              Ready
            </span>
            <div className="text-2xl font-extrabold font-mono text-indigo-400">
              {readyCount}
            </div>
            <span className="text-[10px] text-indigo-500/70 block">Ready to Serve</span>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
              Delivered
            </span>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              {deliveredCount}
            </div>
            <span className="text-[10px] text-emerald-500/70 block">Completed</span>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex border-b border-stone-900 overflow-x-auto space-x-6">
          <button
            onClick={() => setMainTab('orders')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex items-center space-x-2 ${
              mainTab === 'orders'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Live Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setMainTab('reservations')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex items-center space-x-2 ${
              mainTab === 'reservations'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Table Reservations ({reservations.length})</span>
          </button>

          <button
            onClick={() => setMainTab('feedback')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex items-center space-x-2 ${
              mainTab === 'feedback'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Customer Reviews ({feedbackList.length})</span>
          </button>

          <button
            onClick={() => setMainTab('customers')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex items-center space-x-2 ${
              mainTab === 'customers'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Customer Directory ({customerList.length})</span>
          </button>

          <button
            onClick={() => setMainTab('reports')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex items-center space-x-2 ${
              mainTab === 'reports'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Financial Analytics</span>
          </button>
        </div>

        {/* TAB 1: LIVE ORDERS */}
        {mainTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter Sub-Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {(['All', 'Pending', 'Received', 'Preparing', 'Ready', 'Delivered', 'Cancelled'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setActiveTab(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border ${
                        activeTab === status
                          ? 'bg-amber-500 text-stone-950 border-amber-500'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search orders, phone, table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-stone-800 bg-stone-900 py-2 pl-9 pr-4 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-stone-800 rounded-3xl space-y-2">
                <Receipt className="mx-auto h-10 w-10 text-stone-600" />
                <h3 className="font-bold text-white text-base">No Orders Found</h3>
                <p className="text-xs text-stone-500">
                  Orders placed by customers will stream directly into this dashboard via Supabase.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-stone-900 bg-stone-950 p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl hover:border-stone-800 transition-colors"
                  >
                    <div className="flex items-start space-x-4 min-w-0">
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        referrerPolicy="no-referrer"
                        className="h-16 w-16 rounded-xl object-cover border border-stone-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {order.id}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 text-stone-300 font-bold border border-stone-800">
                            {order.tableNumber}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {order.createdAt}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">
                          {order.quantity}x {order.productName}
                        </h4>
                        <div className="flex flex-wrap gap-3 items-center mt-1 text-xs text-stone-400">
                          <span className="text-stone-300 font-medium">Customer: {order.customerName}</span>
                          <span>•</span>
                          <a href={`tel:${order.phone}`} className="text-amber-500 hover:underline">
                            {order.phone}
                          </a>
                          <span>•</span>
                          <span className="font-bold text-amber-400">₹{order.totalAmount}</span>
                          <span>•</span>
                          <span className="text-stone-500">{order.paymentMethod} ({order.paymentStatus})</span>
                        </div>
                        {order.notes && (
                          <p className="text-xs text-amber-400/80 italic mt-1.5 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10">
                            Note: {order.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 border-stone-900 pt-3 lg:pt-0">
                      {/* Status Flow Buttons */}
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-bold text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Received">Received</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => sendWhatsAppNotification(order)}
                        className="p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold cursor-pointer"
                        title="Notify Customer via WhatsApp"
                      >
                        <PhoneCall className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="px-3 py-2 rounded-xl border border-stone-800 bg-stone-900 hover:border-amber-500 text-xs font-bold text-stone-300 hover:text-white cursor-pointer flex items-center space-x-1"
                      >
                        <Receipt className="h-4 w-4" />
                        <span>Bill</span>
                      </button>

                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 rounded-xl border border-stone-800 hover:border-red-500/30 hover:bg-red-500/10 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABLE RESERVATIONS */}
        {mainTab === 'reservations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-900 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">Table Reservations In Supabase</h3>
                <p className="text-xs text-stone-400">Real table bookings submitted by customers</p>
              </div>
              <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {reservations.length} Total Bookings
              </span>
            </div>

            {reservations.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-stone-800 rounded-3xl space-y-2">
                <Calendar className="mx-auto h-10 w-10 text-stone-600" />
                <h3 className="font-bold text-white text-base">No Reservations Found</h3>
                <p className="text-xs text-stone-500">
                  When guests reserve a table on the Reservation page, their booking appears here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="rounded-2xl border border-stone-900 bg-stone-950 p-5 space-y-3 shadow-xl hover:border-stone-800 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {res.tableType}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            res.status === 'Confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-base mt-2">{res.name}</h4>
                      <p className="text-xs text-amber-400 font-mono mt-0.5">📞 {res.phone}</p>

                      <div className="space-y-1 text-xs text-stone-400 mt-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3.5 w-3.5 text-stone-500" />
                          <span>Date: {res.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3.5 w-3.5 text-stone-500" />
                          <span>Time: {res.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-3.5 w-3.5 text-stone-500" />
                          <span>Party of {res.guests} guests</span>
                        </div>
                      </div>

                      {res.specialRequests && (
                        <p className="text-xs text-stone-400 italic mt-2 bg-stone-900 p-2 rounded-xl">
                          "{res.specialRequests}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-900 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-stone-950 text-xs font-bold cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteReservation(res.id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 cursor-pointer"
                        title="Delete reservation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER REVIEWS & FEEDBACK */}
        {mainTab === 'feedback' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-900 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">Customer Reviews & Ratings</h3>
                <p className="text-xs text-stone-400">Stored in Supabase 'feedback' table</p>
              </div>
              <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {feedbackList.length} Total Reviews
              </span>
            </div>

            {feedbackList.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-stone-800 rounded-3xl space-y-2">
                <MessageSquare className="mx-auto h-10 w-10 text-stone-600" />
                <h3 className="font-bold text-white text-base">No Feedback Entries Yet</h3>
                <p className="text-xs text-stone-500">
                  Reviews submitted by customers on the Contact page or after placing orders will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedbackList.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-stone-900 bg-stone-950 p-5 space-y-3 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= item.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-stone-500">
                        {item.createdAt}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed font-sans">
                      "{item.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMER DIRECTORY */}
        {mainTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-900 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">Customer Directory</h3>
                <p className="text-xs text-stone-400">
                  Aggregated from all Supabase orders and contact records
                </p>
              </div>
              <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {customerList.length} Unique Customers
              </span>
            </div>

            {customerList.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-stone-800 rounded-3xl space-y-2">
                <Users className="mx-auto h-10 w-10 text-stone-600" />
                <h3 className="font-bold text-white text-base">No Customers In Database</h3>
                <p className="text-xs text-stone-500">
                  Customer profiles will appear here as orders are placed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customerList.map((cust, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-stone-900 bg-stone-950 p-5 space-y-2 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">{cust.name}</h4>
                      <span className="text-[10px] font-mono bg-stone-900 px-2 py-0.5 rounded text-amber-400 font-bold">
                        {cust.ordersCount} Orders
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-mono">📞 {cust.phone}</p>
                    <div className="pt-2 border-t border-stone-900 flex justify-between text-xs">
                      <span className="text-stone-500">Total Spent:</span>
                      <span className="font-mono font-bold text-amber-400">
                        ₹{cust.totalSpent.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FINANCIAL ANALYTICS */}
        {mainTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-900 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">Sales & Financial Analytics</h3>
                <p className="text-xs text-stone-400">Live computations from Supabase database</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-stone-900 bg-stone-950 p-6 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-500">
                  Gross Revenue
                </span>
                <div className="text-3xl font-extrabold font-mono text-amber-400">
                  ₹{totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-stone-400">From {orders.length} total orders recorded.</p>
              </div>

              <div className="rounded-2xl border border-stone-900 bg-stone-950 p-6 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-500">
                  Average Order Value
                </span>
                <div className="text-3xl font-extrabold font-mono text-emerald-400">
                  ₹{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-stone-400">Per tableside order transaction.</p>
              </div>

              <div className="rounded-2xl border border-stone-900 bg-stone-950 p-6 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-500">
                  Active Tables
                </span>
                <div className="text-3xl font-extrabold font-mono text-blue-400">
                  {new Set(orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').map((o) => o.tableNumber)).size}
                </div>
                <p className="text-xs text-stone-400">Tables currently occupied or dining.</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Management Modal */}
        {showMenuManager && (
          <MenuManagementModal
            onClose={() => setShowMenuManager(false)}
            onMenuUpdated={loadAllSupabaseData}
          />
        )}

        {/* Invoice Modal */}
        {selectedInvoiceOrder && (
          <InvoiceModal
            order={selectedInvoiceOrder}
            onClose={() => setSelectedInvoiceOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
