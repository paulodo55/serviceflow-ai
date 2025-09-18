'use client';

import { motion } from "framer-motion";
import { FaCalendarCheck, FaTools, FaClock, FaBell, FaSync, FaChartBar, FaTruckLoading, FaChartLine } from "react-icons/fa"; // Updated FaAnalytics to FaChartLine

const features = [
  {
    icon: <FaCalendarCheck />,
    title: "Instant Online Booking",
    description: "Embedded website widget and standalone mobile app allow customers to book appointments in under 90 seconds. AI-driven queue management ensures multiple customers can book simultaneously with no slowdowns."
  },
  {
    icon: <FaTools />,
    title: "Predictive Technician Matching",
    description: "Machine learning models analyze each technician’s specializations, certifications, current workload, and average repair times. The AI engine automatically assigns new jobs to the best-suited technician, balancing skill and availability to maximize throughput."
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ServiceFlow AI</h1>
          <div className="space-x-6">
            <a href="#features" className="text-gray-600 hover:text-primary transition">Features</a>
            <a href="#solutions" className="text-gray-600 hover:text-primary transition">Solutions</a>
            <a href="#contact" className="text-gray-600 hover:text-primary transition">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 text-center bg-gradient-to-r from-primary to-secondary text-white">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-5xl font-bold mb-4">ServiceFlow AI</h2>
          <p className="text-xl mb-8">Industry-exclusive, cloud-native application and responsive web portal that automates and optimizes every step of the service scheduling and customer communication process using advanced AI.</p>
          <a href="#features" className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">Learn More</a>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12">Core Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <div className="text-4xl text-primary mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">How ServiceFlow AI Solves Your Pain Points</h3>
          <div className="space-y-6">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <p className="text-gray-800">{solution}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-8 bg-primary text-white text-center">
        <p>&copy; 2025 ServiceFlow AI. All rights reserved.</p>
        <p>Contact us at info@serviceflow.ai</p>
      </footer>
    </div>
  );
}
