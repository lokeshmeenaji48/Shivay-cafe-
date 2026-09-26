import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { getStoredProducts, fetchMenuFromServer, setupSupabaseMenuRealtime } from '../lib/menuStore';
import { Star, Eye, ShoppingBag } from 'lucide-react';

interface BestSellersProps {
  setCurrentPage: (page: string) => void;
  setSelectedProduct: (product: any) => void;
  setAutoOpenOrdering?: (open: boolean) => void;
}

export default function BestSellers({
  setCurrentPage,
  setSelectedProduct,
  setAutoOpenOrdering,
}: BestSellersProps) {
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());

  useEffect(() => {
    fetchMenuFromServer().then(setProducts);

    setupSupabaseMenuRealtime(() => {
      fetchMenuFromServer().then(setProducts);
    });

    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener('shivay_products_updated', handleUpdate);
    return () => {
      window.removeEventListener('shivay_products_updated', handleUpdate);
    };
  }, []);

  // Filter items that have badge === 'Popular' or top items
  const popularProducts = products
    .filter((p) => p.badge === 'Popular' || p.badge === 'New')
    .slice(0, 4);

  const displayList = popularProducts.length > 0 ? popularProducts : products.slice(0, 4);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setCurrentPage('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTablesideOrderClick = (product: any) => {
    setSelectedProduct(product);
    if (setAutoOpenOrdering) {
      setAutoOpenOrdering(true);
    }
    setCurrentPage('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuClick = () => {
    setCurrentPage('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-stone-950 py-20 border-t border-stone-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:mb-16">
          <div className="text-center md:text-left">
            <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
              The Artisan Selection
            </span>
            <h2 className="mt-2 font-sans text-3xl font-extrabold text-white md:text-4xl">
              Shivay Best Sellers
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-400">
              Each recipe has been carefully developed by our champion baristas and award-winning kitchen, featuring premium textures and complex profiles.
            </p>
          </div>
          <button
            onClick={handleMenuClick}
            className="cursor-pointer rounded-lg border border-stone-800 bg-stone-900/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:border-amber-500 hover:text-amber-400 transition-all shrink-0"
          >
            View Full Shivay Menu
          </button>
        </div>

        {/* Popular Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayList.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-900 bg-stone-950 p-4 hover:border-amber-500/20 hover:bg-stone-900/10 transition-all shadow-xl"
            >
              {/* Product Badge */}
              {product.badge && (
                <div className="absolute top-6 left-6 z-10 flex items-center space-x-1 rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-950">
                  <span>{product.badge}</span>
                </div>
              )}

              {/* Product Image Panel */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-900">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleProductClick(product)}
                    className="flex items-center space-x-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 hover:text-stone-950 transition-colors cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Quick View</span>
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="mt-5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 uppercase font-mono tracking-wider">
                      {product.category}
                    </span>
                    <div className="flex items-center space-x-0.5 text-amber-500">
                      <Star className="fill-amber-500 h-3 w-3" />
                      <Star className="fill-amber-500 h-3 w-3" />
                      <Star className="fill-amber-500 h-3 w-3" />
                      <Star className="fill-amber-500 h-3 w-3" />
                      <Star className="fill-amber-500 h-3 w-3" />
                    </div>
                  </div>
                  <h3 className="font-sans text-base font-bold text-stone-200 mt-1.5 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 mt-auto border-t border-stone-900 flex items-center justify-between">
                  <span className="font-mono text-base font-extrabold text-amber-400">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleTablesideOrderClick(product)}
                    className="flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                    <span>Order Tableside</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
