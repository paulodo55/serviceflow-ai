'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Building, ArrowRight } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import { loadStripe } from '@stripe/stripe-js'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly')

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!session) {
      window.location.href = '/login?callbackUrl=/pricing-new'
      return
    }

    setIsLoading(planName)

    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })

      const { clientSecret } = await response.json()
      
      if (clientSecret) {
        const stripe = await stripePromise
        const { error } = await stripe!.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/app?success=true`
          }
        })

        if (error) {
          console.error('Payment failed:', error)
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              VervidFlow
            </Link>
            <div className="flex items-center space-x-4">
              {session ? (
                <Link href="/app" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900">
                    Sign In
                  </Link>
                  <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Start with a 14-day free trial. No credit card required. Upgrade anytime to unlock advanced features.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-4 mb-12"
          >
            <span className={`${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annually' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingPeriod === 'annually' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'annually' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`${billingPeriod === 'annually' ? 'text-gray-900' : 'text-gray-500'}`}>
              Annually
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Trial Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative"
          >
            <div className="text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{PLANS.trial.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">Free</span>
                <span className="text-gray-600 ml-2">for {PLANS.trial.duration}</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                {PLANS.trial.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Basic Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative"
          >
            <div className="text-center">
              <Building className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{PLANS.basic.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingPeriod === 'annually' ? Math.round(PLANS.basic.price * 0.8) : PLANS.basic.price}
                </span>
                <span className="text-gray-600 ml-2">/{billingPeriod === 'annually' ? 'month' : 'month'}</span>
                {billingPeriod === 'annually' && (
                  <div className="text-sm text-green-600">Billed annually</div>
                )}
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                {PLANS.basic.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(PLANS.basic.priceId, 'basic')}
                disabled={isLoading === 'basic'}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading === 'basic' ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          </motion.div>

          {/* Pro Plan - Most Popular */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative transform scale-105"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            
            <div className="text-center">
              <Crown className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{PLANS.pro.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingPeriod === 'annually' ? Math.round(PLANS.pro.price * 0.8) : PLANS.pro.price}
                </span>
                <span className="text-gray-600 ml-2">/{billingPeriod === 'annually' ? 'month' : 'month'}</span>
                {billingPeriod === 'annually' && (
                  <div className="text-sm text-green-600">Billed annually</div>
                )}
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                {PLANS.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(PLANS.pro.priceId, 'pro')}
                disabled={isLoading === 'pro'}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading === 'pro' ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative"
          >
            <div className="text-center">
              <Building className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{PLANS.enterprise.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingPeriod === 'annually' ? Math.round(PLANS.enterprise.price * 0.8) : PLANS.enterprise.price}
                </span>
                <span className="text-gray-600 ml-2">/{billingPeriod === 'annually' ? 'month' : 'month'}</span>
                {billingPeriod === 'annually' && (
                  <div className="text-sm text-green-600">Billed annually</div>
                )}
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                {PLANS.enterprise.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(PLANS.enterprise.priceId, 'enterprise')}
                disabled={isLoading === 'enterprise'}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading === 'enterprise' ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and ACH transfers for annual plans.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a setup fee?</h3>
              <p className="text-gray-600">No setup fees. Start your free trial today and only pay when you&apos;re ready to upgrade.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee on all paid plans.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
