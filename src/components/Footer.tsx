import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-techserv-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg mb-4">CONTACT US</h3>
            <div className="space-y-2 font-neuton">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>garden@techserv.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>123 TechServ Street</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg mb-4">GARDEN HOURS</h3>
            <div className="font-neuton">
              <p>Monday - Sunday</p>
              <p>Dawn to Dusk</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg mb-4">QUICK LINKS</h3>
            <ul className="space-y-2 font-neuton">
              <li><a href="/plots" className="hover:text-techserv-sky">Available Plots</a></li>
              <li><a href="/events" className="hover:text-techserv-sky">Upcoming Events</a></li>
              <li><a href="/resources" className="hover:text-techserv-sky">Gardening Resources</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-techserv-gray text-center font-neuton">
          <p>&copy; {new Date().getFullYear()} TechServ Community Garden. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}