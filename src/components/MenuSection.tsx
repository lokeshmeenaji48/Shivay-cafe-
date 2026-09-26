import React, { useState, useEffect, useMemo, MouseEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order } from '../types';
import {
  getStoredOrders,
  fetchOrdersFromServer,
  placeCustomerOrder,
  setupSupabaseOrderRealtime,
} from '../lib/orderStore';
import {
  getStoredProducts,
  fetchMenuFromServer,
  setupSupabaseMenuRealtime,
} from '../lib/menuStore';
import { submitFeedbackOnServer } from '../lib/feedbackStore';
import InvoiceModal from './InvoiceModal';
import {
  Search,
  Filter,
  ShoppingBag,
  Eye,
  X,
  Star,
  Heart,
  Plus,
  Minus,
  CheckCircle,
  Receipt,
  ClipboardCheck,
  AlertCircle,
  Loader2,
  MessageSquare,
} from 'lucide-react';

interface MenuSectionProps {
  setCurrentPage: (page: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  autoOpenOrdering?: boolean;
  setAutoOpenOrdering?: (open: boolean) => void;
}

export default function MenuSection({
  setCurrentPage,
  selectedProduct,
  setSelectedProduct,
  autoOpenOrdering,
  setAutoOpenOrdering,
}: MenuSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<Product[]>(() => getStoredProducts());
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // Order Flow States
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [isOrdering, setIsOrdering] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [specialNotes, setSpecialNotes] = useState('');
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<Order | null>(null);

  // Review Modal for completed orders
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Load menu from Supabase and subscribe to Realtime updates
  useEffect(() => {
    setIsLoadingMenu(true);
    fetchMenuFromServer()
      .then((items) => {
        setProductsList(items);
        setIsLoadingMenu(false);
      })
      .catch(() => setIsLoadingMenu(false));

    setupSupabaseMenuRealtime(() => {
      fetchMenuFromServer().then(setProductsList);
    });
  }, []);

  // Fetch orders and setup Realtime listener
  useEffect(() => {
    fetchOrdersFromServer().then(setOrders);

    setupSupabaseOrderRealtime(() => {
      fetchOrdersFromServer().then(setOrders);
    });

    const handleOrdersUpdate = () => {
      setOrders(getStoredOrders());
    };
    window.addEventListener('shivay_orders_updated', handleOrdersUpdate);
    return () => {
      window.removeEventListener('shivay_orders_updated', handleOrdersUpdate);
    };
  }, []);

  // Automatically open ordering form if triggered from Home page Tableside Order click
  useEffect(() => {
    if (selectedProduct && autoOpenOrdering) {
      setIsOrdering(true);
    }
  }, [selectedProduct, autoOpenOrdering]);

  const categories = [
    'All',
    'Burger',
    'Pizza',
    'Cold Coffee',
    'Drinks',
    'Shakes',
    'Sandwich',
    'Snacks',
    'My Orders',
  ];

  // Search & filter products
  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return productsList.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(search);
      const descMatch = product.description.toLowerCase().includes(search);
      const catMatch = product.category.toLowerCase().includes(search);

      let synonymMatch = false;
      if (search.includes('sandwich') || search.includes('sandvich') || search.includes('sendvich')) {
        synonymMatch =
          product.name.toLowerCase().includes('sendvich') ||
          product.name.toLowerCase().includes('sandwich') ||
          product.description.toLowerCase().includes('sandwich');
      }
      if (
        search.includes('patties') ||
        search.includes('pattis') ||
        search.includes('peties') ||
        search.includes('patis')
      ) {
        synonymMatch =
          product.name.toLowerCase().includes('peties') || product.name.toLowerCase().includes('patties');
      }
      if (search.includes('badam') || search.includes('almond')) {
        synonymMatch =
          product.name.toLowerCase().includes('badam') || product.name.toLowerCase().includes('almond');
      }
      const matchesSearch = nameMatch || descMatch || catMatch || synonymMatch;
      const matchesCategory = search !== '' || activeCategory === 'All' || product.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, productsList]);

  const toggleFavorite = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]));
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsOrdering(false);
    setOrderSuccess(false);
    setOrderError(null);
    setCustomerName('');
    setTableNumber('Table 1');
    setCustomerPhone('');
    setQuantity(1);
    setPaymentMethod('Cash');
    setSpecialNotes('');
    if (setAutoOpenOrdering) {
      setAutoOpenOrdering(false);
    }
  };

  // Place order with full Supabase database verification & integrity
  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!customerName.trim()) {
      setOrderError('Please enter your full name');
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setOrderError('Please provide a valid 10-digit mobile number');
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);

    try {
      const created = await placeCustomerOrder({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        customerName: customerName.trim(),
        phone: cleanPhone,
        tableNumber,
        quantity,
        paymentMethod,
        notes: specialNotes.trim() || undefined,
      });

      setLatestOrder(created);
      setOrderSuccess(true);
      fetchOrdersFromServer().then(setOrders);

      // WhatsApp notification trigger for customer convenience
      const waText = encodeURIComponent(
        `*नया ऑर्डर - SHIVAY CAFÉ & RESTAURANT* ☕🍕\n` +
          `----------------------------------------\n` +
          `*ऑर्डर आईडी (Order ID):* ${created.id}\n` +
          `*आइटम (Item):* ${created.quantity}x ${created.productName}\n` +
          `*कीमत (Total):* ₹${created.totalAmount.toFixed(2)}\n` +
          `*ग्राहक का नाम (Customer):* ${created.customerName}\n` +
          `*संपर्क नंबर (Phone):* ${created.phone}\n` +
          `*टेबल नंबर (Table):* ${created.tableNumber}\n` +
          `*पेमेंट (Payment):* ${created.paymentMethod} (${created.paymentStatus})\n` +
          `*समय (Time):* ${created.createdAt}\n` +
          `----------------------------------------\n` +
          `कृपया यह ऑर्डर तैयार करें!`
      );
      const waUrl = `https://api.whatsapp.com/send?phone=916367970232&text=${waText}`;
      try {
        window.open(waUrl, '_blank');
      } catch (err) {
        console.log('WhatsApp open notice:', err);
      }
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await submitFeedbackOnServer({
        rating: reviewRating,
        message: reviewComment,
        orderId: reviewOrder?.id,
        customerName: reviewOrder?.customerName,
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewOrder(null);
        setReviewSuccess(false);
        setReviewComment('');
      }, 2000);
    } catch (err) {
      console.warn('Feedback submit notice:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="bg-stone-950 py-16 md:py-20 text-stone-300 min-h-screen">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
            Artisanal Culinary & Coffee Brews
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-white md:text-5xl mt-2">
            The Shivay Menu
          </h1>
          <p className="mt-3 text-sm text-stone-400">
            Hand-crafted coffees, thick shakes, wood-fired pizzas, crispy burgers, and snacks. Prepped fresh with authentic Jaipur flavors.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-stone-900 pb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search coffee, pizza, burgers, shakes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-stone-800 bg-stone-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-2 text-stone-400 text-xs">
            <Filter className="h-4 w-4 text-amber-500" />
            <span>Showing {filteredProducts.length} items from Supabase</span>
          </div>
        </div>

        {/* Categories Horizontal Slider */}
        <div className="mb-12 overflow-x-auto scrollbar-none" id="category-scroller">
          <div className="flex space-x-2 pb-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`cursor-pointer rounded-xl px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 border-amber-500 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-stone-900/40 text-stone-300 border-stone-800 hover:border-amber-500/30'
                }`}
              >
                {cat === 'My Orders' ? `My Orders (${orders.length})` : cat}
              </button>
            ))}
          </div>
        </div>

        {/* My Orders View */}
        {activeCategory === 'My Orders' ? (
          <div className="space-y-6 max-w-4xl mx-auto" id="user-orders-view">
            <div className="flex items-center justify-between border-b border-stone-900 pb-4">
              <h2 className="font-sans text-xl font-bold text-white flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-amber-500" />
                <span>My Active Tableside Orders</span>
              </h2>
              <span className="text-xs text-stone-500 font-mono bg-stone-900 px-3 py-1 rounded-full">
                {orders.length} order(s) in Supabase
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-stone-800 rounded-3xl">
                <ClipboardCheck className="mx-auto h-12 w-12 text-stone-600 mb-4" />
                <h3 className="font-sans text-lg font-bold text-white">No Active Orders Yet</h3>
                <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                  Browse our menu, pick an item, and select "Order Tableside" to place your order directly into the kitchen!
                </p>
                <button
                  onClick={() => setActiveCategory('All')}
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-bold uppercase text-stone-950 rounded-xl cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all shadow-md"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-stone-900 bg-stone-950 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl hover:border-stone-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 overflow-hidden rounded-xl bg-stone-900 shrink-0">
                        <img
                          src={order.productImage}
                          alt={order.productName}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-amber-500 font-mono uppercase tracking-wider font-bold">
                            ID: {order.id}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-stone-800" />
                          <span className="text-[11px] text-stone-400 font-mono">
                            {order.tableNumber}
                          </span>
                        </div>
                        <h3 className="font-sans text-base font-bold text-white mt-0.5">
                          {order.quantity}x {order.productName}
                        </h3>
                        <div className="flex flex-wrap gap-2 items-center mt-1 text-xs text-stone-400">
                          <span>₹{order.totalAmount}</span>
                          <span>•</span>
                          <span>{order.paymentMethod} ({order.paymentStatus})</span>
                          <span>•</span>
                          <span>{order.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-stone-900 pt-3 md:pt-0">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          order.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                            : order.status === 'Received'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : order.status === 'Preparing'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : order.status === 'Ready'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : order.status === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        <span>● {order.status}</span>
                      </span>

                      <button
                        onClick={() => setViewInvoiceOrder(order)}
                        className="px-3 py-1.5 rounded-xl border border-stone-800 hover:border-amber-500 text-stone-300 hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        Receipt
                      </button>

                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => setReviewOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold cursor-pointer flex items-center space-x-1"
                        >
                          <Star className="h-3 w-3" />
                          <span>Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoadingMenu && productsList.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
                <p className="text-xs uppercase font-mono text-stone-500">Connecting to Supabase Menu...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-2">
                <p className="text-stone-400 font-medium">No items found matching "{searchTerm}"</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('All');
                  }}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isFav = favorites.includes(product.id);
                const isOutOfStock = product.available === false;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-900 bg-stone-950 p-4 transition-all shadow-xl ${
                      isOutOfStock ? 'opacity-60' : 'hover:border-amber-500/30 hover:bg-stone-900/20'
                    }`}
                  >
                    {/* Badge */}
                    <div className="absolute top-6 left-6 z-10 flex items-center space-x-1.5">
                      {isOutOfStock ? (
                        <span className="rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          Sold Out
                        </span>
                      ) : product.badge ? (
                        <span className="rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-950">
                          {product.badge}
                        </span>
                      ) : null}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className="absolute top-6 right-6 z-10 rounded-full bg-stone-950/60 p-2 text-stone-400 backdrop-blur-md hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-900">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Details */}
                    <div className="mt-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                            {product.category}
                          </span>
                          <span className="font-mono text-base font-extrabold text-amber-400">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </div>
                        <h3 className="font-sans text-base font-bold text-white mt-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-900 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="flex items-center space-x-1 text-xs text-stone-400 hover:text-white cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Details</span>
                        </button>

                        <button
                          disabled={isOutOfStock}
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsOrdering(true);
                          }}
                          className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isOutOfStock
                              ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/10'
                          }`}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Order</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Tableside Order Modal */}
        <AnimatePresence>
          {isOrdering && selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl border border-stone-800 bg-stone-900 p-6 md:p-8 shadow-2xl relative"
              >
                <button
                  onClick={handleCloseModal}
                  className="absolute top-6 right-6 text-stone-400 hover:text-white bg-stone-800 rounded-full p-1.5 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                {!orderSuccess ? (
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500">
                        Shivay Tableside Checkout
                      </span>
                    </div>
                    <h2 className="font-sans text-2xl font-extrabold text-white mt-1">
                      Direct Kitchen Order
                    </h2>
                    <p className="text-xs text-stone-400 mt-1">
                      Order connects directly to the Shivay Café kitchen display system.
                    </p>

                    {/* Product Summary */}
                    <div className="mt-5 rounded-2xl bg-stone-950 border border-stone-800 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          referrerPolicy="no-referrer"
                          className="h-14 w-14 rounded-xl object-cover border border-stone-800"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{selectedProduct.name}</h4>
                          <span className="text-xs text-amber-400 font-mono font-bold">
                            ₹{selectedProduct.price.toFixed(2)} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center space-x-2 bg-stone-900 border border-stone-800 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="p-1 text-stone-400 hover:text-white cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono text-sm font-bold text-white px-2">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="p-1 text-stone-400 hover:text-white cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {orderError && (
                      <div className="mt-4 flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{orderError}</span>
                      </div>
                    )}

                    {/* Order Details Form */}
                    <form onSubmit={handlePlaceOrder} className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="10-digit number"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                            Table Number / Location
                          </label>
                          <select
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                          >
                            <option value="Table 1">Table 1</option>
                            <option value="Table 2">Table 2</option>
                            <option value="Table 3">Table 3</option>
                            <option value="Table 4">Table 4</option>
                            <option value="Table 5">Table 5</option>
                            <option value="Table 6">Table 6</option>
                            <option value="Table 7">Table 7</option>
                            <option value="Table 8">Table 8</option>
                            <option value="Leather Booth A">Leather Booth A</option>
                            <option value="Leather Booth B">Leather Booth B</option>
                            <option value="Glass Lounge">Glass Lounge</option>
                            <option value="Nomad Work Pod">Nomad Work Pod</option>
                            <option value="Takeaway / Counter">Takeaway / Counter</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                            Payment Method
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                          >
                            <option value="Cash">Cash at Table / Counter</option>
                            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                            <option value="Card">Debit / Credit Card</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                          Special Instructions (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Extra chocolate syrup, less spicy, no onion..."
                          value={specialNotes}
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Total Amount Confirmation */}
                      <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">
                            Database Total
                          </span>
                          <span className="text-xl font-extrabold font-mono text-amber-400">
                            ₹{(selectedProduct.price * quantity).toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingOrder}
                          className={`cursor-pointer rounded-xl px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center space-x-2 ${
                            isSubmittingOrder
                              ? 'bg-amber-600/50 text-stone-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500 shadow-xl'
                          }`}
                        >
                          {isSubmittingOrder ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Verifying & Placing...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-4 w-4" />
                              <span>Confirm Tableside Order</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Success Confirmation Screen */
                  <div className="text-center py-6 space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
                      <CheckCircle className="h-8 w-8" />
                    </div>

                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
                        Order Confirmed In Supabase
                      </span>
                      <h2 className="font-sans text-2xl font-extrabold text-white mt-1">
                        Kitchen Has Received Your Order!
                      </h2>
                      <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                        Thank you, <span className="text-white font-bold">{customerName}</span>. Your order is now marked as "Pending" and being prepared by Chef.
                      </p>
                    </div>

                    {latestOrder && (
                      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 text-left font-mono text-xs space-y-2 max-w-md mx-auto">
                        <div className="flex justify-between border-b border-stone-800 pb-2">
                          <span className="text-stone-400">Supabase Order Number:</span>
                          <span className="text-amber-400 font-bold">{latestOrder.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Item:</span>
                          <span className="text-white font-bold">{latestOrder.quantity}x {latestOrder.productName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Table:</span>
                          <span className="text-white font-bold">{latestOrder.tableNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Total Amount:</span>
                          <span className="text-emerald-400 font-bold">₹{latestOrder.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Status:</span>
                          <span className="text-amber-400 font-bold uppercase">{latestOrder.status}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                      {latestOrder && (
                        <button
                          onClick={() => {
                            setViewInvoiceOrder(latestOrder);
                            handleCloseModal();
                          }}
                          className="px-4 py-2.5 rounded-xl border border-stone-800 bg-stone-950 text-xs font-bold text-stone-300 hover:text-white cursor-pointer"
                        >
                          Print / View Invoice
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleCloseModal();
                          setActiveCategory('My Orders');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider cursor-pointer hover:from-amber-400 hover:to-amber-500 shadow-md"
                      >
                        Track In "My Orders"
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* View Details Modal */}
        <AnimatePresence>
          {selectedProduct && !isOrdering && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl border border-stone-800 bg-stone-900 p-6 shadow-2xl relative"
              >
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 text-stone-400 hover:text-white bg-stone-800 rounded-full p-1.5 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-950 border border-stone-800">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-amber-500 uppercase tracking-wider font-bold">
                      {selectedProduct.category}
                    </span>
                    <span className="font-mono text-xl font-extrabold text-amber-400">
                      ₹{selectedProduct.price.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-sans text-xl font-bold text-white">
                    {selectedProduct.name}
                  </h3>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setCurrentPage('reservation');
                      }}
                      className="text-xs text-stone-400 hover:text-amber-400 cursor-pointer"
                    >
                      Book Table Seating
                    </button>

                    <button
                      onClick={() => setIsOrdering(true)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 cursor-pointer shadow-lg"
                    >
                      Order Tableside
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Invoice Modal */}
        {viewInvoiceOrder && (
          <InvoiceModal
            order={viewInvoiceOrder}
            onClose={() => setViewInvoiceOrder(null)}
          />
        )}

        {/* Customer Review / Feedback Modal */}
        <AnimatePresence>
          {reviewOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <h3 className="font-sans text-base font-bold text-white">
                      Review Your Experience
                    </h3>
                  </div>
                  <button
                    onClick={() => setReviewOrder(null)}
                    className="p-1 rounded-lg text-stone-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {!reviewSuccess ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <span className="text-xs text-stone-400 block mb-2 font-medium">
                        Rating for Order {reviewOrder.id} ({reviewOrder.productName}):
                      </span>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="cursor-pointer"
                          >
                            <Star
                              className={`h-7 w-7 transition-colors ${
                                star <= reviewRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                        Comments & Feedback
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="How was the food, coffee taste, and service?"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-3 text-xs font-bold uppercase tracking-wider text-stone-950 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {isSubmittingReview ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span>Submit Review to Shivay Cafe</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="py-6 text-center space-y-2">
                    <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-white">Review Submitted!</h4>
                    <p className="text-xs text-stone-400">
                      Thank you for your feedback! It has been recorded in the Supabase database.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
