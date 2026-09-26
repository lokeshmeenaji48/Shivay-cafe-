import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import {
  getStoredProducts,
  fetchMenuFromServer,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../lib/menuStore';
import {
  Plus,
  Trash2,
  X,
  Utensils,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

interface MenuManagementModalProps {
  onClose: () => void;
  onMenuUpdated: () => void;
}

export default function MenuManagementModal({
  onClose,
  onMenuUpdated,
}: MenuManagementModalProps) {
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState<Product['category']>('Cold Coffee');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [badge, setBadge] = useState<Product['badge']>('');

  const categories = [
    'Burger',
    'Pizza',
    'Cold Coffee',
    'Drinks',
    'Shakes',
    'Sandwich',
    'Snacks',
  ];

  useEffect(() => {
    fetchMenuFromServer().then(setProducts);
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '') return;

    setIsSubmitting(true);
    try {
      await addProduct({
        name: name.trim(),
        price: Number(price),
        category,
        description: description || 'Delicious item crafted freshly at Shivay Café.',
        image:
          image ||
          'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
        badge: badge || '',
        available: true,
      });

      const fresh = await fetchMenuFromServer();
      setProducts(fresh);
      onMenuUpdated();
      resetForm();
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding item to Supabase:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailable = async (prod: Product) => {
    const newStatus = !(prod.available !== false);
    await updateProduct(prod.id, { available: newStatus });
    const fresh = await fetchMenuFromServer();
    setProducts(fresh);
    onMenuUpdated();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this item permanently from Supabase menu_items?')) {
      await deleteProduct(id);
      const fresh = await fetchMenuFromServer();
      setProducts(fresh);
      onMenuUpdated();
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('Cold Coffee');
    setDescription('');
    setImage('');
    setBadge('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-stone-800 bg-stone-900 shadow-2xl flex flex-col overflow-hidden text-stone-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Utensils className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-sans text-lg font-bold text-white">
                Supabase Menu & Category Manager
              </h3>
              <p className="text-xs text-stone-400">
                Manage live items, prices, and stock availability stored in Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:text-white bg-stone-800 border border-stone-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add New Item Button / Form */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3.5 px-4 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add New Menu Item to Database</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddSubmit}
              className="bg-stone-950 p-5 rounded-2xl border border-amber-500/30 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  Create New Menu Item
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-stone-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-stone-400 font-bold mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Special Royal Shake"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="70"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 p-2.5 text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold mb-1">Badge (Optional)</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">None</option>
                    <option value="Popular">Popular</option>
                    <option value="New">New</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-400 font-bold mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 p-2.5 text-white focus:border-amber-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-400 font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of ingredients..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save to Supabase</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Product Items List */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
              Supabase Menu Items ({products.length})
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className={`rounded-2xl border border-stone-800 bg-stone-950 p-4 flex items-center justify-between gap-4 ${
                    prod.available === false ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-xl object-cover shrink-0 border border-stone-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm truncate">
                          {prod.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-800 text-amber-400 shrink-0">
                          {prod.category}
                        </span>
                        {prod.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {prod.badge}
                          </span>
                        )}
                        {prod.available === false && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="font-mono text-base font-extrabold text-amber-400">
                      ₹{prod.price}
                    </span>

                    {/* Stock Toggle */}
                    <button
                      onClick={() => handleToggleAvailable(prod)}
                      className={`p-2 rounded-xl border cursor-pointer ${
                        prod.available !== false
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-stone-800 bg-stone-900 text-stone-500 hover:text-stone-300'
                      }`}
                      title={prod.available !== false ? 'Mark as Out of Stock' : 'Mark as Available'}
                    >
                      {prod.available !== false ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="p-2 rounded-xl border border-stone-800 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 text-stone-500 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
