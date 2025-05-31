import React from 'react';
import {
  Truck,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Truck className="h-8 w-8 text-yellow-500 mr-2" />
              <span className="font-bold text-xl">OneRental</span>
            </div>
            <p className="text-gray-400 mb-4">
              South Africa's premier platform connecting construction equipment
              owners with those who need reliable machinery.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <span className="text-gray-400">
                  123 Construction Road
                  <br />
                  Johannesburg, South Africa
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-gray-400">+27 12 345 6789</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-gray-400">info@onerental.co.za</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#equipment"
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  Equipment
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  Become a Partner
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} OneRental. All rights reserved.
          </p>
          <div className="mt-2 space-x-4 text-sm">
            <a href="#" className="hover:text-yellow-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-yellow-500 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-yellow-500 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
