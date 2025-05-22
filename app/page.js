'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from './theme/ThemeContext';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen relative overflow-hidden`} style={{ background: darkMode ? '#181c20' : '#f4f6fa' }}>
      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-blue-700'}`}>Inventory Manager</span>
        </div>
      </nav>

      {/* Decorative SVG Blob */}
      <svg className="absolute top-0 left-0 w-96 h-96 opacity-10 z-0" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="200" cy="200" rx="200" ry="120" fill={darkMode ? '#2d3748' : '#60a5fa'} />
      </svg>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${darkMode ? 'text-white' : 'text-blue-900'}`}
        >
          Welcome to <span className="block text-blue-500">Inventory Manager</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`mt-6 text-xl max-w-2xl mx-auto ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}
        >
          A powerful and intuitive inventory management system to help you track and manage your items efficiently.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3 border border-transparent text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition duration-150 ease-in-out"
          >
            Get Started
          </button>
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-blue-900'}`}
            >
              Key Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`mt-4 text-lg ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}
            >
              Everything you need to manage your inventory effectively
            </motion.p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`p-6 rounded-xl shadow-lg border border-blue-100 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-blue-50'} transition duration-300 ease-in-out group`}
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500 text-white mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-white' : 'text-blue-900'}`}>Real-time Inventory Tracking</h3>
                <p className={`mt-2 text-base ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>Keep track of your inventory in real-time with automatic updates and notifications.</p>
              </motion.div>
              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`p-6 rounded-xl shadow-lg border border-blue-100 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-blue-50'} transition duration-300 ease-in-out group`}
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-white' : 'text-blue-900'}`}>User Management</h3>
                <p className={`mt-2 text-base ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>Manage multiple users and roles with secure authentication and permissions.</p>
              </motion.div>
              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`p-6 rounded-xl shadow-lg border border-blue-100 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-blue-50'} transition duration-300 ease-in-out group`}
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500 text-white mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h4a1 1 0 001-1v-2h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm0 8v2a1 1 0 001 1h16a1 1 0 001-1v-2" />
                  </svg>
                </div>
                <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-white' : 'text-blue-900'}`}>Advanced Reporting</h3>
                <p className={`mt-2 text-base ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>Generate insightful reports and analytics to make informed business decisions.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Footer */}
      <footer className={`relative z-20 py-12 mt-8 ${darkMode ? 'bg-gray-900' : 'bg-blue-600'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-white'}`}>Ready to get started?</h2>
          <p className={`mb-6 ${darkMode ? 'text-blue-100' : 'text-blue-100'}`}>Join thousands of users who trust Inventory Manager to streamline their inventory process.</p>
        </div>
      </footer>
    </div>
  );
}

