'use client';

import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$199",
      period: "/month",
      description: "Perfect for small businesses",
      features: [
        "Up to 500 appointments/month",
        "Basic automated reminders",
        "Email & SMS notifications",
        "Standard analytics dashboard",
        "8/5 support"
      ]
    },
    {
      name: "Professional",
      price: "$499",
      period: "/month",
      description: "Most popular for growing businesses",
      popular: true,
      features: [
        "Up to 2,000 appointments/month",
        "Advanced automated reminders",
        "Multi-channel communications",
        "Real-time status updates",
        "Performance analytics",
        "24/7 AI phone support",
        "Priority support"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large business groups",
      features: [
        "Unlimited appointments",
        "All premium features",
        "ROI reporting & analytics",
        "Custom integrations",
        "Dedicated account manager",
        "White-label options",
        "Advanced API access",
        "24/7 priority support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Full-screen background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="relative pt-32 pb-16 z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light mb-12">
              Choose the plan that fits your business needs. All plans include a 14-day free trial.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative max-w-7xl mx-auto px-6 pb-24 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-darkCard p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular 
                  ? 'border-primary shadow-2xl scale-105' 
                  : 'border-neutral-800 hover:border-primary/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-neutral-400 mb-4">{plan.description}</p>
                <div className="flex items-end justify-center">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-neutral-400 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <FaCheck className="text-primary flex-shrink-0" />
                    <span className="text-neutral-200">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl'
                    : 'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white'
                }`}
              >
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-3">Is there a setup fee?</h3>
              <p className="text-neutral-200">No setup fees. We&apos;ll help you get started with onboarding and training at no extra cost.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-3">Can I change plans anytime?</h3>
              <p className="text-neutral-200">Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-3">What integrations are available?</h3>
              <p className="text-neutral-200">We integrate with most major DMS systems, CRM platforms, and communication tools. Custom integrations available for Enterprise plans.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-3">Is my data secure?</h3>
              <p className="text-neutral-200">Yes, we use enterprise-grade security with SOC 2 compliance and end-to-end encryption for all data.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
