import { useState, useMemo, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GALLERY_IMAGES } from '../data';
import { X, Eye, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function GallerySection() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filters = ['All', 'Ambiance', 'Espresso Craft', 'Culinary', 'Desserts'];

  // Filter gallery images
  const filteredImages = useMemo(() => {
    if (activeFilter === 'All') return GALLERY_IMAGES;
    return GALLERY_IMAGES.filter(img => img.category === activeFilter);
  }, [activeFilter]);

  const handleNext = (e: MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const handlePrev = (e: MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <section className="bg-stone-950 py-16 md:py-20 text-stone-300">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Header Titles */}
        <div className="text-center max-w-xl mx-auto mb-12 md:mb-16">
          <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
            A Visual Journey
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-white md:text-5xl mt-2">
            The Shivay Gallery
          </h1>
          <p className="mt-3 text-sm text-stone-400">
            Peek inside our warm glassmorphic spaces, view our champion baristas calibrating extractions, and preview our wood-fired sourdough creations.
          </p>
        </div>

        {/* Filter Slider Switcher */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`cursor-pointer rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeFilter === filter
                  ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                  : 'bg-stone-900/40 text-stone-300 border-stone-800 hover:border-amber-500/30'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Masonry-Style Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          id="gallery-masonry-grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, index) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                className="group relative overflow-hidden rounded-3xl border border-stone-900 bg-stone-900/40 aspect-[4/3] cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Hover overlay details */}
                <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <span className="flex items-center space-x-1 text-amber-400 text-[10px] font-mono tracking-widest uppercase mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{img.category}</span>
                  </span>
                  <h3 className="font-sans text-base font-bold text-white line-clamp-1">{img.title}</h3>
                  <span className="mt-3 inline-flex items-center space-x-1 text-xs text-amber-500 hover:text-amber-400 font-semibold uppercase">
                    <Eye className="h-4.5 w-4.5" />
                    <span>Enlarge Photo</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* FULLSCREEN LIGHTBOX CAROUSEL */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-md p-4">
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 z-55 flex h-10 w-10 items-center justify-center rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-all cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left Prev Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-6 z-55 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-900 transition-all cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Content Card with details */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl flex flex-col justify-center items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredImages[lightboxIndex].src}
                alt={filteredImages[lightboxIndex].title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
              
              <div className="mt-4 text-center space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">{filteredImages[lightboxIndex].category}</span>
                <h2 className="font-sans text-lg font-bold text-white">{filteredImages[lightboxIndex].title}</h2>
                <p className="text-xs text-stone-500">Image {lightboxIndex + 1} of {filteredImages.length}</p>
              </div>
            </motion.div>

            {/* Right Next Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-6 z-55 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-900 transition-all cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
