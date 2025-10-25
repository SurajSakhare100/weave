import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12 lg:px-10 lg:py-20">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          {/* Logo & Contact Info */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              <img src="/landing/footer.png" alt="Weave Logo" className="h-8 md:h-12 w-auto" />
              <img src="/landing/footerLogo.png" alt="Weave Secondary Logo" className="h-8 md:h-12 w-auto" />
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

          {/* Navigation & Socials */}
          <div className="flex flex-col sm:flex-row gap-10 lg:gap-20 flex-1">
            {/* Navigation Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Quick Links</h3>
              <ul className="space-y-2 text-base">
                <li>
                  <Link href="/shop" className="hover:text-accent transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/wholesale" className="hover:text-accent transition-colors">
                    Wholesale & Bulk Inquiry
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-accent transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-accent transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Links & App Download */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm">Our Socials</h3>
                <div className="flex space-x-4 mt-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <img src="/social/instagram.svg" alt="Instagram" className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X Twitter"
                  >
                    <img src="/social/x-twitter.svg" alt="X (Twitter)" className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm">Download Our App</h3>
                <div className="flex space-x-4 mt-2">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Google Play Store"
                  >
                    <img src="/app/playstore.png" alt="Play Store" className="h-6" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Apple App Store"
                  >
                    <img src="/app/appstore.png" alt="App Store" className="h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Optional copyright */}
        <div className="mt-10 text-sm text-accent text-center">
          © {new Date().getFullYear()} Weave. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
