'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaChartBar, FaArrowLeft, FaClock, FaLightbulb, FaBell } from 'react-icons/fa';

export default function DowntimeInsightsPage() {
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Full-screen background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="relative pt-24 pb-16 z-10">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/features" className="inline-flex items-center text-primary hover:text-secondary transition-colors duration-300 mb-8">
            <FaArrowLeft className="mr-2" />
            Back to Features
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="text-6xl text-primary mb-6">
              <FaChartBar />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              Downtime Reduction Insights
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light">
              Intelligent analytics that identify idle periods and suggest proactive measures to maximize productivity and revenue
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative max-w-6xl mx-auto px-6 pb-24 z-10">
        {/* Key Features */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Intelligent Downtime Detection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaClock className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Predictive Analysis</h3>
              <p className="text-neutral-200">AI analyzes scheduled jobs and resource availability to predict upcoming idle periods.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaLightbulb className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Smart Suggestions</h3>
              <p className="text-neutral-200">Receive intelligent recommendations for filling gaps with additional services or tasks.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaBell className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Proactive Alerts</h3>
              <p className="text-neutral-200">Get push notifications about upcoming idle periods with time to take corrective action.</p>
            </div>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">How It Works</h2>
          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Continuous Monitoring",
                description: "System continuously monitors scheduled appointments, resource allocation, and workflow patterns"
              },
              {
                step: 2,
                title: "Gap Identification",
                description: "AI identifies potential idle periods based on current schedule and historical data patterns"
              },
              {
                step: 3,
                title: "Opportunity Analysis",
                description: "Analyzes available resources and suggests optimal ways to fill identified gaps"
              },
              {
                step: 4,
                title: "Proactive Recommendations",
                description: "Sends actionable suggestions for additional services, maintenance tasks, or upsell opportunities"
              }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                className="flex items-start gap-6 bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-200 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Business Impact */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Business Impact</h2>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">30%</div>
                <p className="text-white font-semibold mb-1">Productivity Increase</p>
                <p className="text-neutral-200 text-sm">Reduced idle time through proactive scheduling</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">20%</div>
                <p className="text-white font-semibold mb-1">Revenue Growth</p>
                <p className="text-neutral-200 text-sm">Additional services during previously idle periods</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">85%</div>
                <p className="text-white font-semibold mb-1">Resource Utilization</p>
                <p className="text-neutral-200 text-sm">Optimal use of available capacity</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
