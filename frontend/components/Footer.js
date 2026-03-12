"use client";

import Link from 'next/link';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#232f3e] text-white mt-12">
      {/* Back to Top */}
      <button 
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] py-4 text-sm font-medium transition-colors"
      >
        Back to top
      </button>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-base mb-4">Get to Know Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="hover:underline">Careers</Link></li>
              <li><Link href="/" className="hover:underline">Blog</Link></li>
              <li><Link href="/" className="hover:underline">About Hudi-Supermarket</Link></li>
              <li><Link href="/" className="hover:underline">Sustainability</Link></li>
              <li><Link href="/" className="hover:underline">Press Center</Link></li>
              <li><Link href="/" className="hover:underline">Investor Relations</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4">Make Money with Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="hover:underline">Sell on Hudi-Supermarket</Link></li>
              <li><Link href="/" className="hover:underline">Sell apps on Hudi-Supermarket</Link></li>
              <li><Link href="/" className="hover:underline">Supply to Hudi-Supermarket</Link></li>
              <li><Link href="/" className="hover:underline">Protect & Build Your Brand</Link></li>
              <li><Link href="/" className="hover:underline">Become an Affiliate</Link></li>
              <li><Link href="/" className="hover:underline">Start a Package Delivery Business</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4">Payment Products</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="hover:underline">Hudi Visa</Link></li>
              <li><Link href="/" className="hover:underline">Hudi Store Card</Link></li>
              <li><Link href="/" className="hover:underline">Hudi Secured Card</Link></li>
              <li><Link href="/" className="hover:underline">Shop with Points</Link></li>
              <li><Link href="/" className="hover:underline">Reload Your Balance</Link></li>
              <li><Link href="/" className="hover:underline">Currency Converter</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4">Let Us Help You</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="hover:underline">Your Account</Link></li>
              <li><Link href="/" className="hover:underline">Your Orders</Link></li>
              <li><Link href="/" className="hover:underline">Shipping Rates & Policies</Link></li>
              <li><Link href="/" className="hover:underline">Returns & Replacements</Link></li>
              <li><Link href="/" className="hover:underline">Manage Your Content and Devices</Link></li>
              <li><Link href="/" className="hover:underline">Help</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#131a22] py-8 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <Link href="/" className="text-2xl font-bold mb-6 hover:text-orange-400 transition-colors">
            Hudi-Supermarket
          </Link>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs text-gray-400">
             <Link href="/" className="hover:underline">Conditions of Use</Link>
             <Link href="/" className="hover:underline">Privacy Notice</Link>
             <Link href="/" className="hover:underline">Consumer Health Data Privacy Disclosure</Link>
             <Link href="/" className="hover:underline">Your Ads Privacy Choices</Link>
          </div>
          
          <p className="text-xs text-gray-500">
            © 2026, Hudi-Supermarket.com, Inc. or its affiliates
          </p>
        </div>
      </div>
    </footer>
  );
}
