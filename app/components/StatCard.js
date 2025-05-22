'use client';

import { motion } from 'framer-motion';
import { transitions } from '../utils/animations';

export function StatCard({ title, value, icon, color, darkMode }) {
  return (
    <motion.div 
      initial={transitions.fadeIn.initial}
      animate={transitions.fadeIn.animate}
      transition={{ duration: transitions.fadeIn.duration }}
      className={`card-base ${darkMode ? 'glass-dark' : 'glass-light'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            {title}
          </h3>
          <p className={`text-3xl font-bold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}