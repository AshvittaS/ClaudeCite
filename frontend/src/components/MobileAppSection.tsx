import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, Check, QrCode } from 'lucide-react';

export default function MobileAppSection() {
  const [showQR, setShowQR] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-[#121316] text-white rounded-[2.5rem] p-8 sm:p-14 overflow-hidden relative shadow-2xl border border-white/5">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Mobile Phone Image Display with gentle floating animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 flex justify-center items-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="max-w-[320px] sm:max-w-[380px]"
            >
              <img
                alt="ClauseCite mobile application running on smartphone"
                className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                src="/assets/aistudio/image_a0bc4085.png"
              />
            </motion.div>
          </motion.div>

          {/* App Details & Download Buttons */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider border border-white/10">
              <i className="fa-solid fa-mobile-screen text-xs"></i> Mobile app
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              ClauseCite mobile app
            </h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md">
              Stay connected with your legal guide on iOS and Android. Handle documents, scan contracts with camera OCR, and receive instant clause citations on the go.
            </p>

            {/* Store Badges with Outcrowd hover animation */}
            <div className="flex flex-wrap gap-4 pt-4">
              {/* App Store */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowQR(true)}
                className="inline-flex items-center gap-3 bg-white text-black px-5 py-3 rounded-2xl hover:bg-gray-100 transition shadow-md cursor-pointer"
              >
                <i className="fa-brands fa-apple text-2xl"></i>
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">
                    Download on the
                  </span>
                  <span className="block text-sm font-extrabold leading-tight">App Store</span>
                </div>
              </motion.button>

              {/* Google Play */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowQR(true)}
                className="inline-flex items-center gap-3 bg-white text-black px-5 py-3 rounded-2xl hover:bg-gray-100 transition shadow-md cursor-pointer"
              >
                <i className="fa-brands fa-google-play text-xl"></i>
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">
                    GET IT ON
                  </span>
                  <span className="block text-sm font-extrabold leading-tight">Google Play</span>
                </div>
              </motion.button>
            </div>

            {/* QR Code prompt toggle */}
            {showQR && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 inline-flex items-center gap-4 text-xs"
              >
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1">
                  <QrCode className="w-12 h-12 text-black" />
                </div>
                <div>
                  <p className="font-bold text-white">Scan with Camera</p>
                  <p className="text-[11px] text-gray-400">Direct download link sent to your device</p>
                  <button
                    onClick={() => setShowQR(false)}
                    className="text-[10px] text-blue-400 hover:underline mt-1 font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
