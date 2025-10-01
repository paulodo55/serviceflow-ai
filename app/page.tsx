'use client';

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaArrowRight, FaCalendarCheck, FaChartBar, FaSync, FaTools, FaBell, FaClock, FaArrowLeft, FaDollarSign, FaChartLine, FaArrowUp, FaTruckLoading, FaRocket, FaShieldAlt, FaPlug, FaGlobeAmericas, FaBolt, FaHandshake, FaBuilding } from "react-icons/fa";
import Link from 'next/link';

const features = [
  {
    icon: <FaRocket />,
    title: "5-Minute Data Onboarding",
    description: "Import your entire customer database, employee records, and business data in minutes. While others take weeks or months to implement, we get you operational today with zero data loss.",
    badge: "Ready in minutes"
  },
  {
    icon: <FaShieldAlt />,
    title: "Advanced Role-Based Permissions",
    description: "Granular admin controls let you define exactly what each employee sees and does. From receptionists to managers to executives—everyone gets the right access level with enterprise-grade security.",
    badge: "Enterprise security"
  },
  {
    icon: <FaPlug />,
    title: "Intelligent API Grouping",
    description: "Separate API endpoints for different teams and departments. Sales, operations, support—each gets their own optimized data flow without interference for true multi-department design.",
    badge: "Multi-department"
  },
  {
    icon: <FaGlobeAmericas />,
    title: "Universal Business CRM",
    description: "From dealerships to orphanages, warehouses to healthcare—one platform adapts to any business sector. No industry limitations, any size, any workflow.",
    badge: "Any industry"
  },
  {
    icon: <FaBolt />,
    title: "True AI Automation",
    description: "Not just scheduled messages—real AI that learns your business patterns, predicts customer needs, and automates complex workflows automatically. Real intelligence, not just rules.",
    badge: "Real AI"
  },
  {
    icon: <FaHandshake />,
    title: "Unified Multi-Channel Hub",
    description: "Every customer interaction—SMS, email, calls, social media, web chat—in one timeline. Stop juggling multiple platforms with all channels in one inbox.",
    badge: "All channels"
  },
  {
    icon: <FaChartLine />,
    title: "Instant ROI Tracking",
    description: "See your return on investment in real-time. Track every dollar spent vs revenue generated. No complex dashboards or expensive consultants needed—ROI visible day one.",
    badge: "Real-time ROI"
  },
  {
    icon: <FaBuilding />,
    title: "Scalable for Any Size",
    description: "Single location or 500 branches—pricing and features that grow with you. No forced enterprise plans or hidden per-user fees with fair pricing at infinite scale.",
    badge: "Fair pricing"
  }
];

const solutions = [
  "Fast Implementation: Get operational in 5 minutes instead of 30+ days. No consultants, no complex setup, no lost revenue during transition.",
  "Enterprise Security: Advanced role-based permissions let you control exactly what each team member sees and does—from entry-level to C-suite.",
  "Universal Compatibility: One platform adapts to any business sector—retail, healthcare, non-profits, services, manufacturing, and everything in between.",
  "True Cost Savings: 90% less than traditional enterprise CRMs. No hidden per-user fees, no forced upgrades, no surprise costs.",
  "Real Business Impact: Track ROI from day one with built-in analytics. See exactly how much time and money you're saving in real-time."
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Full-screen background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full bg-dark/90 backdrop-blur-lg shadow-sm border-b border-neutral-800 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.h1 
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VervidFlow
            </div>
            <div className="text-xs text-neutral-400 font-normal mt-1">by Vervid</div>
          </motion.h1>
          <div className="hidden md:flex items-center space-x-8">
            {[
              { name: 'Features', href: '/features' },
              { name: 'Demo', href: '/demo' },
              { name: 'Pricing', href: '/pricing' },
              { name: 'Contact', href: '/contact' }
            ].map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="text-neutral-400 hover:text-primary transition-all duration-300 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 min-h-screen flex items-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <motion.div
          style={{ opacity }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
        ></motion.div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent leading-tight">
                VervidFlow
              </h1>
              <p className="text-lg md:text-xl text-neutral-400 font-light mb-8">by Vervid</p>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-neutral-200 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Intelligent, cloud-native platform that streamlines the CRM experience with automated scheduling and customer communication for all service-based businesses
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/free-trial">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
                >
                  Start Free Trial
                  <FaArrowRight className="text-sm" />
                </motion.div>
              </Link>
              
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent text-white px-8 py-4 rounded-full font-semibold border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer flex items-center gap-2"
                >
                  Contact Sales
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 bg-gradient-to-b from-darkGray to-dark">
        {/* Section background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-full px-6 py-2 mb-6">
              <span className="text-primary font-semibold">Enterprise Capabilities Without Enterprise Complexity</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              What Makes VervidFlow Different
            </h2>
            <p className="text-xl md:text-2xl text-neutral-100 max-w-3xl mx-auto font-light leading-relaxed">
              Built for <strong className="text-white">any business sector</strong>—from dealerships to orphanages, warehouses to healthcare. Get started in 5 minutes, not 30 days.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-neutral-700 hover:border-primary/50 relative overflow-hidden"
              >
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                  {feature.badge}
                </div>
                
                <div className="text-5xl text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-neutral-200 leading-relaxed text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="relative py-32 bg-gradient-to-br from-neutral-900 to-dark">
        {/* Section background effects */}
        <div className="absolute inset-0 bg-gradient-to-l from-primary/5 via-transparent to-secondary/5"></div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Transform Your Operations
            </h2>
            <p className="text-xl md:text-2xl text-neutral-100 max-w-3xl mx-auto font-light leading-relaxed">
              Discover how VervidFlow eliminates inefficiencies and drives growth
            </p>
          </motion.div>
          
          <div className="space-y-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="group bg-neutral-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-neutral-700 hover:border-primary/50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                  <p className="text-neutral-200 text-lg leading-relaxed group-hover:text-white transition-colors duration-300">
                    {solution}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-r from-primary to-secondary overflow-hidden">
        {/* CTA background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Transform Your Service Department?
            </h2>
            <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Join industry leaders who&apos;ve increased their service revenue by 15-25% with VervidFlow
            </p>
            <Link href="/free-trial">
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(255, 255, 255, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-white text-dark px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                Start Free Trial Today
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                VervidFlow
              </h3>
              <p className="text-neutral-400">
                by Vervid - Streamlining the CRM experience for service-based businesses with intelligent automation and optimization.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-neutral-400">hello@vervidflow.com</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="/features/instant-booking" className="hover:text-primary transition-colors">Instant Online Booking</a></li>
                <li><a href="/features/auto-calling" className="hover:text-primary transition-colors">Auto Calling & AI Pickups</a></li>
                <li><a href="/features/performance-analytics" className="hover:text-primary transition-colors">Performance Analytics</a></li>
                <li><a href="/features/automated-reminders" className="hover:text-primary transition-colors">Automated Reminders</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center">
            <p className="text-neutral-400">&copy; 2025 VervidFlow by VervIdai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
