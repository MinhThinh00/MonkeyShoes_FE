import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Banner = () => {
  return (
    <div className="relative h-[600px] overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-leather.png')] opacity-40" />
      
      <div className="container mx-auto px-4 h-full relative">
        <div className="flex items-center justify-between h-full">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl z-10"
          >
            <h1 className="text-6xl font-bold mb-6 leading-tight text-brown-900">
              Air Jordan
              <span className="block text-amber-700 mt-2">Collection 2025</span>
            </h1>
            <p className="text-xl mb-8 text-gray-700">
              Khám phá bộ sưu tập Jordan mới nhất với thiết kế độc đáo và công nghệ tiên tiến
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-amber-700 text-white rounded-full font-bold text-lg hover:bg-amber-800 transition-all duration-300 transform hover:scale-105 group"
            >
              Khám phá ngay
              <svg 
                className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>

          {/* Center Shoe Images */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute left-1/2 transform -translate-x-1/2 bottom-0"
          >
            <div className="relative">
              <img
                src="src\assets\monkey.png"
                alt="Air Jordan"
                className="h-[500px] object-contain transform rotate-[-25deg] hover:rotate-[-15deg] transition-transform duration-500 drop-shadow-2xl"
              />
              
              {/* Floating Effects */}
              <div className="absolute top-20 -left-20 w-20 h-20 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" />
              <div className="absolute bottom-20 -right-20 w-20 h-20 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse delay-700" />
            </div>
          </motion.div>

          {/* Right Content - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="z-10 text-right hidden lg:block"
          >
            <div className="space-y-8">
              <div>
                <p className="text-5xl font-bold text-amber-700">37</p>
                <p className="text-gray-600">Years of Legacy</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-amber-700">100+</p>
                <p className="text-gray-600">Unique Designs</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-amber-700">#1</p>
                <p className="text-gray-600">Basketball Shoes</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-amber-50 to-transparent" />
    </div>
  );
};

export default Banner;