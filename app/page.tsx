'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { FaCalendarCheck, FaTools, FaClock, FaBell, FaSync, FaChartBar, FaTruckLoading, FaChartLine, FaArrowRight } from "react-icons/fa";

const features = [
  {
    icon: <FaCalendarCheck />,
    title: "Instant Online Booking",
    description: "Embedded website widget and standalone mobile app allow customers to book appointments in under 90 seconds. Intelligent queue management ensures multiple customers can book simultaneously with no slowdowns."
  },
  {
    icon: <FaBell />,
    title: "Auto Calling & AI Pickups",
    description: "Automated calling system handles appointment confirmations and after-hours customer inquiries with intelligent AI voice responses, ensuring 24/7 customer service availability."
  },
  {
    icon: <FaClock />,
    title: "Dynamic Slot Optimization",
    description: "Real-time analysis of service bay availability, parts lead times, and technician schedules ensures optimal time-slot recommendations. AI recalibrates time blocks based on historical repair durations and ongoing job progress, adjusting start times to prevent idle bays."
  },
  {
    icon: <FaBell />,
    title: "Automated Reminders & Confirmations",
    description: "Multi-channel notifications (SMS, email, WhatsApp) confirm bookings instantly, send 48- and 4-hour reminders, and allow self-service rescheduling. Intelligent reminder timing uses customer response history to minimize no-shows (historically reducing no-shows by 40%)."
  },
  {
    icon: <FaSync />,
    title: "Real-Time Status Updates",
    description: "Customers receive live updates when their vehicle enters diagnostics, moves to repair, or is ready for pickup. AI-generated ETA predictions adjust based on actual work progress and parts availability, setting clear expectations."
  },
  {
    icon: <FaChartBar />,
    title: "Downtime Reduction Insights",
    description: "The dashboard highlights upcoming idle periods predicted by the AI based on scheduled jobs and parts arrival times. Service managers receive push alerts suggesting proactive upsell or minor maintenance tasks to fill short gaps."
  },
  {
    icon: <FaTruckLoading />,
    title: "Parts Lead-Time Predictor",
    description: "Integrates with OEM APIs and local supplier databases to forecast parts delivery dates. When parts delays exceed acceptable thresholds, AI automatically offers alternative genuine or certified aftermarket options to avoid extended bay downtime."
  },
  {
    icon: <FaChartLine />,
    title: "Performance Analytics & ROI Reporting",
    description: "AI aggregates key metrics—bay utilization, average repair time variance, no-show rate, and revenue per bay. Interactive dashboards project monthly profit improvements and calculate time saved per service advisor (target: 2+ hours per day)."
  }
];

const solutions = [
  "Eliminates Manual Scheduling: Automated booking and technician matching remove the need for back-and-forth calls, freeing advisors to focus on customer service.",
  "Maximizes Throughput: Dynamic slot optimization and predictive assignments ensure every bay operates at peak capacity.",
  "Reduces No-Shows: Personalized reminders and self-service rescheduling lower missed appointments by up to 40%.",
  "Improves Customer Satisfaction: Real-time updates and accurate ETAs build trust and increase repeat business.",
  "Drives Revenue Growth: By minimizing idle time and filling short gaps with quick upsell opportunities, dealerships can boost service department revenue by 15–25% within three months."
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
              ServiceFlow
            </div>
            <div className="text-xs text-neutral-400 font-normal mt-1">by Vervid</div>
          </motion.h1>
          <div className="hidden md:flex space-x-8">
            {[
              { name: 'Features', href: '/features' },
              { name: 'Solutions', href: '#solutions' },
              { name: 'Contact', href: '#contact' }
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
                ServiceFlow
              </h1>
              <p className="text-lg md:text-xl text-neutral-400 font-light mb-8">by Vervid</p>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-neutral-200 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Intelligent, cloud-native platform that streamlines and optimizes every aspect of service scheduling and customer communication for dealerships
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.a
                href="/features"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                Explore Features
                <FaArrowRight className="text-sm" />
              </motion.a>
              
              <motion.a
                href="#solutions"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent text-white px-8 py-4 rounded-full font-semibold border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                View Solutions
              </motion.a>
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
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Core Features
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Discover how ServiceFlow AI transforms your dealership operations with cutting-edge technology
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
                className="group bg-neutral-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-neutral-700 hover:border-primary/50"
              >
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
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Transform Your Operations
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Discover how ServiceFlow AI eliminates inefficiencies and drives growth
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
              Join industry leaders who&apos;ve increased their service revenue by 15-25% with ServiceFlow
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-dark px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Today
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                ServiceFlow
              </h3>
              <p className="text-neutral-400">
                by Vervid - Revolutionizing dealership service operations with intelligent automation and optimization.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-neutral-400">hello@vervidai.com</p>
              <p className="text-neutral-400">(512) 264-5260</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="/features/instant-booking" className="hover:text-primary transition-colors">Instant Online Booking</a></li>
                <li><a href="/features/auto-calling" className="hover:text-primary transition-colors">Auto Calling & AI Pickups</a></li>
                <li><a href="/features/analytics-reporting" className="hover:text-primary transition-colors">Performance Analytics</a></li>
                <li><a href="/features/automated-reminders" className="hover:text-primary transition-colors">Automated Reminders</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center">
            <p className="text-neutral-400">&copy; 2025 ServiceFlow by Vervid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
