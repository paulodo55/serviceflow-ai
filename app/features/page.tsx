'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaRocket, FaUsers, FaShieldAlt, FaDatabase, FaPlug, FaChartLine, 
  FaClock, FaBuilding, FaHandshake, FaGlobeAmericas, FaBolt, FaCog 
} from 'react-icons/fa';

const features = [
  {
    id: 'instant-onboarding',
    icon: <FaRocket />,
    title: '5-Minute Data Onboarding',
    description: 'Import your entire customer database, employee records, and business data in minutes. While others take weeks or months to implement, we get you operational today.',
    slug: 'instant-booking',
    competitive: 'Ready in minutes, not months'
  },
  {
    id: 'role-based-access',
    icon: <FaShieldAlt />,
    title: 'Advanced Role-Based Permissions',
    description: 'Granular admin controls let you define exactly what each employee sees and does. From receptionists to managers to executives—everyone gets the right access level.',
    slug: 'auto-calling',
    competitive: 'Enterprise-grade security'
  },
  {
    id: 'api-grouping',
    icon: <FaPlug />,
    title: 'Intelligent API Grouping',
    description: 'Separate API endpoints for different teams and departments. Sales, operations, support—each gets their own optimized data flow without interference.',
    slug: 'slot-optimization',
    competitive: 'True multi-department design'
  },
  {
    id: 'universal-crm',
    icon: <FaGlobeAmericas />,
    title: 'Universal Business CRM',
    description: 'From dealerships to orphanages, warehouses to healthcare—one platform adapts to any business sector. No industry limitations.',
    slug: 'automated-reminders',
    competitive: 'Any industry, any size'
  },
  {
    id: 'ai-automation',
    icon: <FaBolt />,
    title: 'True AI Automation',
    description: 'Not just scheduled messages—real AI that learns your business patterns, predicts customer needs, and automates complex workflows automatically.',
    slug: 'real-time-updates',
    competitive: 'Real AI, not just rules'
  },
  {
    id: 'unified-communications',
    icon: <FaHandshake />,
    title: 'Unified Multi-Channel Hub',
    description: 'Every customer interaction—SMS, email, calls, social media, web chat—in one timeline. Stop juggling multiple platforms.',
    slug: 'downtime-insights',
    competitive: 'All channels, one inbox'
  },
  {
    id: 'instant-roi',
    icon: <FaChartLine />,
    title: 'Instant ROI Tracking',
    description: 'See your return on investment in real-time. Track every dollar spent vs revenue generated. No complex dashboards or expensive consultants needed.',
    slug: 'performance-analytics',
    competitive: 'ROI visible day one'
  },
  {
    id: 'scalable-pricing',
    icon: <FaBuilding />,
    title: 'Scalable for Any Size',
    description: 'Single location or 500 branches—pricing and features that grow with you. No forced enterprise plans or hidden per-user fees.',
    slug: 'roi-reporting',
    competitive: 'Fair pricing, infinite scale'
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-darkGray to-neutral-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      {/* Header */}
      <div className="pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="inline-block bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-full px-6 py-2 mb-6 backdrop-blur-sm cursor-pointer"
          >
            <motion.span 
              className="text-primary font-semibold"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              Why Leading Businesses Switch to VervidFlow
            </motion.span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6"
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            Built for Every Business,
            <br />Not Just Tech Giants
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-neutral-300 max-w-4xl mx-auto leading-relaxed"
          >
            From dealerships to orphanages, warehouses to healthcare—VervidFlow adapts to <strong className="text-white">any industry, any size, any workflow</strong>. 
            Get enterprise capabilities without enterprise complexity or cost.
          </motion.p>
          
          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
          >
            <motion.div 
              className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6 text-center backdrop-blur-sm relative overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.05, borderColor: "rgba(139, 92, 246, 0.5)" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
              <motion.div 
                className="text-4xl font-bold text-primary mb-2"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                5 Min
              </motion.div>
              <div className="text-neutral-300">Setup Time vs 30 Days</div>
            </motion.div>
            <motion.div 
              className="bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20 rounded-xl p-6 text-center backdrop-blur-sm relative overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.05, borderColor: "rgba(16, 185, 129, 0.5)" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 0.5,
                }}
              />
              <motion.div 
                className="text-4xl font-bold text-secondary mb-2"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.3,
                }}
              >
                90%
              </motion.div>
              <div className="text-neutral-300">Cost Savings vs Enterprise CRMs</div>
            </motion.div>
            <motion.div 
              className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6 text-center backdrop-blur-sm relative overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.05, borderColor: "rgba(139, 92, 246, 0.5)" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 1,
                }}
              />
              <motion.div 
                className="text-4xl font-bold text-primary mb-2"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.6,
                }}
              >
                Any
              </motion.div>
              <div className="text-neutral-300">Industry, Any Scale</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/features/${feature.slug}`}>
                <motion.div 
                  className="group bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-2xl shadow-lg transition-all duration-500 border border-neutral-700 hover:border-primary/50 cursor-pointer h-full relative overflow-hidden"
                  whileHover={{ 
                    y: -10, 
                    scale: 1.02,
                    boxShadow: "0 25px 50px rgba(139, 92, 246, 0.3)"
                  }}
                >
                  {/* Shine effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.8 }}
                  />
                  
                  {/* Competitive Badge */}
                  <motion.div 
                    className="absolute top-4 right-4 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full z-10"
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  >
                    {feature.competitive}
                  </motion.div>
                  
                  <motion.div 
                    className="text-5xl text-primary mb-6 relative z-10"
                    whileHover={{ 
                      scale: 1.2,
                      rotate: [0, -10, 10, -5, 0],
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-300 leading-relaxed mb-6 relative z-10">
                    {feature.description}
                  </p>
                  <motion.div 
                    className="mt-auto text-primary font-semibold flex items-center gap-2 relative z-10"
                    whileHover={{ x: 5 }}
                  >
                    See How It Works →
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Back to Home */}
      <div className="text-center pb-16">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Back to Home
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
