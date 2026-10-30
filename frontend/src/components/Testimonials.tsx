import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const [filter, setFilter] = useState<string>('All');

  const testimonials = [
    {
      id: 1,
      name: 'Elizabeth Martin',
      role: 'Litigation Lawyer',
      category: 'Lawyers',
      avatarBg: 'bg-purple-100 text-purple-700',
      initials: 'EM',
      rating: 5,
      quote:
        '"The litigation analysis and statutory citation feature is a godsend. It has helped me in identifying trends and preparing better for my cases. ClauseCite is a true companion for any modern day lawyer."',
    },
    {
      id: 2,
      name: 'Barbara Smith',
      role: 'Entrepreneur',
      category: 'Consumers',
      avatarBg: 'bg-blue-100 text-blue-700',
      initials: 'BS',
      rating: 5,
      quote:
        '"I am amazed by the instant help it provides. It is like having an online lawyer, always willing to help with everything from clarifying a complex indemnity clause to drafting a termination letter."',
    },
    {
      id: 3,
      name: 'Sarah Mitchell',
      role: 'Freelancer',
      category: 'Consumers',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      initials: 'SM',
      rating: 5,
      quote:
        '"Navigating through regulatory compliance was a breeze. ClauseCite came to the rescue by translating convoluted legal terms into plain English and providing templates. It is an indispensable asset."',
    },
    {
      id: 4,
      name: 'Brian Lopez',
      role: 'Small Business Owner',
      category: 'Consumers',
      avatarBg: 'bg-amber-100 text-amber-700',
      initials: 'BL',
      rating: 5,
      quote:
        '"As a small business owner, attorney consultations were a nightmare due to high retainers. ClauseCite has been a game-changer with its cost-effective solutions. Now, I get instant clarity without burning my pocket."',
    },
    {
      id: 5,
      name: 'Rebecca Adams',
      role: 'Law Student',
      category: 'Students',
      avatarBg: 'bg-rose-100 text-rose-700',
      initials: 'RA',
      rating: 5,
      quote:
        '"Being a law student, I constantly find myself buried under piles of case laws and briefs. ClauseCite has been a beacon, assisting me with research writing and case briefs, making my academic journey less daunting."',
    },
    {
      id: 6,
      name: 'Alexandre Jolly',
      role: 'Contract Manager',
      category: 'Lawyers',
      avatarBg: 'bg-indigo-100 text-indigo-700',
      initials: 'AJ',
      rating: 5,
      quote:
        '"The clause generator is an indispensable tool! It has made drafting agreements a snap. Paperwork and contract reviews have never been this easy, fast, or reliable."',
    },
  ];

  const categories = ['All', 'Lawyers', 'Consumers', 'Students'];

  const filtered = filter === 'All' ? testimonials : testimonials.filter((t) => t.category === filter);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider mb-4">
          <i className="fa-regular fa-comment-dots text-xs"></i> Testimonials
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          What our users think
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-8">
          Find out how ClauseCite has changed the legal services experience for diverse users across the globe.
        </p>

        {/* Outcrowd Filter Tabs */}
        <div className="inline-flex items-center p-1 bg-gray-100 rounded-full border border-gray-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all relative ${
                filter === cat ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              {filter === cat && (
                <motion.div
                  layoutId="testimonial-tab-pill"
                  className="absolute inset-0 bg-white rounded-full shadow-xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Testimonial Grid with Outcrowd Spring Hover */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
              className="bg-white p-7 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow group"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-6 font-normal">
                  {item.quote}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div
                  className={`w-10 h-10 rounded-full ${item.avatarBg} font-bold flex items-center justify-center text-xs shadow-xs`}
                >
                  {item.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-400">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
