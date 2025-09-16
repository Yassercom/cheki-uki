import React from 'react';
import { Metadata } from 'next';
import { Mail, MessageSquare, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - UK Food Recipes',
  description: 'Get in touch with the UK Food Recipes team. We\'d love to hear from you about recipes, suggestions, or any questions you might have.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-slate mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;d love to hear from you! Whether you have a recipe suggestion, feedback, 
            or just want to say hello, don&apos;t hesitate to reach out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm border border-soft-grey p-8">
            <h2 className="text-2xl font-bold text-dark-slate mb-6">Send us a Message</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-dark-slate mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-soft-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-dark-slate mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-soft-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-slate mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-soft-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-dark-slate mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-soft-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Please select a subject</option>
                  <option value="recipe-suggestion">Recipe Suggestion</option>
                  <option value="feedback">General Feedback</option>
                  <option value="technical-issue">Technical Issue</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-dark-slate mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-soft-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                  placeholder="Tell us what&apos;s on your mind..."
                ></textarea>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-600">
                  I&apos;d like to receive recipe updates and cooking tips via email
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-sm border border-soft-grey p-8">
              <h2 className="text-2xl font-bold text-dark-slate mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-slate mb-1">Email</h3>
                    <p className="text-gray-600">hello@ukfoodrecipes.com</p>
                    <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-fresh-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-fresh-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-slate mb-1">Social Media</h3>
                    <p className="text-gray-600">@ukfoodrecipes</p>
                    <p className="text-sm text-gray-500">Follow us for daily recipe inspiration</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-slate mb-1">Location</h3>
                    <p className="text-gray-600">United Kingdom</p>
                    <p className="text-sm text-gray-500">Serving home cooks across the UK</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-slate mb-1">Response Time</h3>
                    <p className="text-gray-600">Monday - Friday</p>
                    <p className="text-sm text-gray-500">9:00 AM - 5:00 PM GMT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-sm border border-soft-grey p-8">
              <h2 className="text-2xl font-bold text-dark-slate mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-dark-slate mb-2">Can I submit my own recipes?</h3>
                  <p className="text-sm text-gray-600">
                    Absolutely! We love featuring recipes from our community. Send us your favourite 
                    recipe with a brief story about it.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-dark-slate mb-2">Do you offer cooking classes?</h3>
                  <p className="text-sm text-gray-600">
                    While we don&apos;t currently offer classes, we&apos;re exploring virtual cooking sessions. 
                    Stay tuned to our newsletter for updates!
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-dark-slate mb-2">Can I suggest recipe modifications?</h3>
                  <p className="text-sm text-gray-600">
                    Yes! We welcome suggestions for dietary modifications, ingredient substitutions, 
                    or cooking technique improvements.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-dark-slate mb-2">How do you test your recipes?</h3>
                  <p className="text-sm text-gray-600">
                    Every recipe is tested multiple times by our team and volunteer home cooks 
                    to ensure consistent, delicious results.
                  </p>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-dark-slate text-white rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">Stay Connected</h2>
              <p className="text-gray-300 mb-6">
                Get weekly recipe inspiration and cooking tips delivered to your inbox.
              </p>
              
              <form className="flex gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-lg text-dark-slate focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              
              <p className="text-xs text-gray-400 mt-3">
                No spam, unsubscribe at any time. We respect your privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
