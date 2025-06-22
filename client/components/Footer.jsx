import { MapPin, Phone, Mail, Instagram, Twitter, Asterisk } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-[#5d4037] text-white rounded-t-2xl ">
      <div className="max-w-7xl mx-auto py-16 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Logo and Contact */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Asterisk className="h-10 w-10" />
              <span className="text-4xl font-serif">Weave</span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 mt-1 flex-shrink-0" />
                <span>Juhu, Mumbai, Maharashtra, India</span>
              </p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-3" />
                <span>+91 9930031899</span>
              </p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-3" />
                <span>business@shopweave.in</span>
              </p>
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="md:col-start-2 lg:col-start-3">
            <ul className="space-y-3">
              <li><a href="#" className="hover:underline">Shop</a></li>
              <li><a href="#" className="hover:underline">Wholesale & Bulk Inquiry</a></li>
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Menu Title</a></li>
            </ul>
          </div>

          {/* Column 3: Socials and App Download */}
          <div>
            <div>
              <h4 className="font-semibold mb-2">Our Socials</h4>
              <div className="flex space-x-4 mb-6">
                <a href="#" aria-label="Instagram"><Instagram className="h-6 w-6" /></a>
                <a href="#" aria-label="Twitter"><Twitter className="h-6 w-6" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Download Our App</h4>
              <div className="flex space-x-2">
                {/* Placeholder App Store Buttons */}
                <div className="w-24 h-8 bg-gray-700 rounded-md flex items-center justify-center text-xs">Play Store</div>
                <div className="w-24 h-8 bg-gray-700 rounded-md flex items-center justify-center text-xs">App Store</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer; 