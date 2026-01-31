import React from 'react';
import { SchemaMarkup } from '../components/SchemaMarkup';
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateFAQPageSchema,
  DEFAULT_FAQS,
} from '../lib/generateSchema';

interface LandingPageProps {
  onStartAudit: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAudit }) => {
  return (
    <div className="min-h-screen">
      {/* Schema.org Structured Data for SEO/GEO */}
      <SchemaMarkup
        schema={[
          generateOrganizationSchema(),
          generateSoftwareApplicationSchema(),
          generateFAQPageSchema(DEFAULT_FAQS),
        ]}
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Stop Wasting Money on
            <br />
            Duplicate AI Tools
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto">
            56% of CEOs report zero ROI from AI investments. Find out where
            your money's actually going.
          </p>
          <p className="text-lg text-blue-200 mb-8">
            Free audit in under 5 minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onStartAudit} className="btn-primary bg-white text-blue-700 hover:bg-gray-100 text-lg px-8 py-4">
              Start Free Audit →
            </button>
            <button className="btn-secondary border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              See Example Report
            </button>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            ✓ No signup required &nbsp; ✓ Results in 60 seconds &nbsp; ✓ 100%
            confidential
          </p>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-white py-12 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">56%</p>
              <p className="text-gray-600">CEOs report zero AI ROI</p>
              <p className="text-sm text-gray-500 mt-1">(Forbes, Jan 2026)</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">$40B</p>
              <p className="text-gray-600">Spent with 95% seeing no return</p>
              <p className="text-sm text-gray-500 mt-1">(MIT Study)</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">10-15</p>
              <p className="text-gray-600">AI tools per company</p>
              <p className="text-sm text-gray-500 mt-1">
                (Industry Average)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our AI analyzes your tool stack and finds hidden waste in minutes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">List Your Tools</h3>
              <p className="text-gray-600">
                Tell us about the AI tools you're using, how much they cost,
                and what you use them for. Takes 3-5 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI identifies overlapping capabilities, unused licenses,
                and consolidation opportunities. Completes in under 60 seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Your Report</h3>
              <p className="text-gray-600">
                Receive a detailed PDF with savings estimates, consolidation
                recommendations, and an action plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Who Is This For?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-3xl mr-3">👔</span>
                CTOs & CIOs
              </h3>
              <p className="text-gray-600">
                Under pressure to justify AI spending to the board? Get a clear
                picture of ROI and waste to make informed decisions.
              </p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-3xl mr-3">💰</span>
                Finance Leaders
              </h3>
              <p className="text-gray-600">
                SaaS sprawl destroying your budget? Identify redundant tools and
                present concrete cost-saving recommendations.
              </p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-3xl mr-3">🚀</span>
                Startup Founders
              </h3>
              <p className="text-gray-600">
                Every dollar counts. Stop paying for duplicate capabilities and
                reduce burn rate without losing functionality.
              </p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-3xl mr-3">🔧</span>
                IT Managers
              </h3>
              <p className="text-gray-600">
                Managing 15+ AI vendor relationships? Consolidate your stack and
                reduce complexity while saving money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Start free, upgrade when you need more
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="card border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-4xl font-bold mb-1">$0</p>
              <p className="text-gray-600 mb-6">Perfect for small teams</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Audit up to 5 tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Basic recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Savings estimate</span>
                </li>
              </ul>
              <button onClick={onStartAudit} className="w-full btn-secondary">
                Start Free Audit
              </button>
            </div>

            {/* Pro Tier */}
            <div className="card border-4 border-blue-600 relative transform md:scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-4xl font-bold mb-1">
                $49<span className="text-lg text-gray-600">/audit</span>
              </p>
              <p className="text-gray-600 mb-6">For serious optimization</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">
                    <strong>Unlimited tools</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Detailed PDF report</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Consolidation roadmap</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">ROI calculations</span>
                </li>
              </ul>
              <button onClick={onStartAudit} className="w-full btn-primary">
                Start Pro Audit
              </button>
            </div>

            {/* Team Tier */}
            <div className="card border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Team</h3>
              <p className="text-4xl font-bold mb-1">
                $149<span className="text-lg text-gray-600">/audit</span>
              </p>
              <p className="text-gray-600 mb-6">For organizations</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">
                    Everything in <strong>Pro</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Shareable reports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Benchmark comparisons</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <button onClick={onStartAudit} className="w-full btn-secondary">
                Start Team Audit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <details className="card cursor-pointer">
              <summary className="font-semibold text-lg">
                How accurate is the analysis?
              </summary>
              <p className="text-gray-600 mt-3">
                Our AI is trained on thousands of AI tool capabilities and use
                cases. It provides highly accurate overlap detection and savings
                estimates based on real-world consolidation patterns.
              </p>
            </details>

            <details className="card cursor-pointer">
              <summary className="font-semibold text-lg">
                Is my data secure?
              </summary>
              <p className="text-gray-600 mt-3">
                Absolutely. We never store your actual tool credentials or
                sensitive data. All information is encrypted and used only to
                generate your report. We're GDPR compliant.
              </p>
            </details>

            <details className="card cursor-pointer">
              <summary className="font-semibold text-lg">
                How long does the audit take?
              </summary>
              <p className="text-gray-600 mt-3">
                The form takes 3-5 minutes to complete. Once submitted, our AI
                analyzes your stack in under 60 seconds. You'll have your report
                in minutes, not days.
              </p>
            </details>

            <details className="card cursor-pointer">
              <summary className="font-semibold text-lg">
                Can I get a refund?
              </summary>
              <p className="text-gray-600 mt-3">
                If you're not satisfied with the insights in your Pro or Team
                report, we offer a 100% money-back guarantee within 7 days. No
                questions asked.
              </p>
            </details>

            <details className="card cursor-pointer">
              <summary className="font-semibold text-lg">
                What if I have more than 20 tools?
              </summary>
              <p className="text-gray-600 mt-3">
                No problem! The Pro and Team tiers support unlimited tools. If
                you have a complex stack, we recommend starting with the Pro tier
                for the most comprehensive analysis.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Stop the Waste?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of companies who've identified millions in AI tool
            savings.
          </p>
          <button onClick={onStartAudit} className="btn-primary bg-white text-blue-700 hover:bg-gray-100 text-lg px-8 py-4">
            Start Your Free Audit Now →
          </button>
          <p className="text-sm text-blue-200 mt-6">
            No credit card • 5 minutes • Instant results
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            © 2026 StackAudit.ai • Built to end AI waste
          </p>
          <p className="text-xs mt-2">
            Terms of Service • Privacy Policy • Contact
          </p>
        </div>
      </footer>
    </div>
  );
};
