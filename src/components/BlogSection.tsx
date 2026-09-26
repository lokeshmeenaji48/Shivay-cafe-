import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BLOG_POSTS } from '../data';
import { BlogPost } from '../types';
import { Clock, User, ArrowRight, X, Sparkles, BookOpen } from 'lucide-react';

export default function BlogSection() {
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  return (
    <section className="bg-stone-950 py-16 md:py-20 text-stone-300">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-12 md:mb-16">
          <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
            Specialty Coffee Journalism
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-white md:text-5xl mt-2">
            The Shivay Chronicles
          </h1>
          <p className="mt-3 text-sm text-stone-400">
            Read expert accounts of our global bean-hunting expeditions, lamination chemistry secrets, milk molecular science, and seasonal gastro events.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {BLOG_POSTS.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setActivePost(post)}
              className="group cursor-pointer rounded-3xl border border-stone-900 bg-stone-950 overflow-hidden flex flex-col justify-between hover:border-amber-500/20 transition-all shadow-xl"
            >
              {/* Image Aspect Box */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                <img
                  src={post.image}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 rounded-full bg-stone-950/90 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-400">
                  {post.category}
                </span>
              </div>

              {/* Text Area */}
              <div className="p-6 md:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-xs text-stone-500 font-mono">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{post.readTime}</span>
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>

                  <h3 className="font-sans text-xl font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-400 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author Metadata */}
                <div className="pt-6 border-t border-stone-900 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover border border-stone-800"
                    />
                    <div>
                      <span className="block text-xs font-bold text-stone-300">{post.author.name}</span>
                      <span className="block text-[10px] text-stone-500 font-mono uppercase">{post.author.role}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* ARTICLE READER MODAL */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePost(null)}
              className="absolute inset-0 bg-stone-950/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ type: 'spring', duration: 0.45 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-800 bg-stone-950 p-6 md:p-10 shadow-2xl z-10"
            >
              <button
                onClick={() => setActivePost(null)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Article Reader"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="rounded bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                    {activePost.category}
                  </span>
                  <h2 className="font-sans text-2xl font-extrabold text-white mt-4 leading-snug md:text-3xl">
                    {activePost.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-mono mt-4 pt-4 border-t border-stone-900">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>{activePost.readTime}</span>
                    </span>
                    <span>•</span>
                    <span>Date published: {activePost.date}</span>
                  </div>
                </div>

                {/* Hero banner for active article */}
                <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl bg-stone-900 border border-stone-900">
                  <img
                    src={activePost.image}
                    alt={activePost.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Main Content Paragraphs */}
                <div className="prose prose-invert max-w-none text-stone-300 text-sm leading-relaxed space-y-4">
                  <p className="font-medium text-stone-200 text-base leading-relaxed">
                    {activePost.excerpt}
                  </p>
                  <p>
                    {activePost.content}
                  </p>
                  <p>
                    Here at Shivay, our kitchen behaves like an analytical chemistry lab. Every single variable is scrutinized. We monitor the water hardness in parts per million to make sure the minerals balance the acids in our light roasts perfectly. When baking croissants, we monitor double-cream water retention and humidity. It is this systematic calibration that elevates our daily customer hospitality to a true art form.
                  </p>
                  <p>
                    We invite you to join us on this journey. Keep an eye out for our upcoming masterclass dates where you can roast, grind, and pull your own customized single-origin beans under our guidance in San Francisco.
                  </p>
                </div>

                {/* Author signature credit */}
                <div className="pt-6 mt-8 border-t border-stone-900 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={activePost.author.avatar}
                      alt={activePost.author.name}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full object-cover border border-stone-800"
                    />
                    <div>
                      <span className="block text-xs font-bold text-stone-300">{activePost.author.name}</span>
                      <span className="block text-[10px] text-amber-500 font-mono uppercase">{activePost.author.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-stone-500 font-mono">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    <span>Shivay Publishing Club</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
