import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#5E3A1C] text-[#FFF4EC]">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-10 lg:py-20">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Logo and Contact Info */}
          <div className="space-y-4 mb-8 lg:mb-0">
            <div className="flex items-center space-x-2">
              <img src="/landing/footer.png" alt="Weave Logo" className="h-12 w-auto" />
              <img src="/landing/footerlogo.png" alt="Weave Logo" className="h-12 w-auto" />
            </div>
            <div className="flex items-start space-x-2 text-base">
              <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
              <span>Juhu, Mumbai, Maharashtra, India</span>
            </div>
            <div className="flex items-center space-x-2 text-base">
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span>+91 9930031899</span>
            </div>
            <div className="flex items-center space-x-2 text-base">
              <Mail className="h-5 w-5 flex-shrink-0" />
              <span>business@shopweave.in</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-10 lg:gap-20 w-full lg:w-auto">
            {/* Navigation Links */}
            <div className="space-y-4 mb-8 sm:mb-0">
              <ul className="space-y-2 text-base">
                <li>
                  <Link href="/shop" className="hover:text-[#E7D9CC] transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/wholesale" className="hover:text-[#E7D9CC] transition-colors">
                    Wholesale & Bulk Inquiry
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#E7D9CC] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#E7D9CC] transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Our Socials</h3>
                <div className="flex space-x-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <img src="/social/instagram.svg" alt="Instagram" className="h-5 w-5" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <img src="/social/x-twitter.svg" alt="X (Twitter)" className="h-5 w-5" />
                  </a>
                </div>
                <h3 className="font-medium text-sm">Download Our App</h3>
                <div className="flex space-x-4">
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src="/app/playstore.png" alt="Play Store" className="h-5" />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src="/app/appstore.png" alt="App Store" className="h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;