export function Footer() {
  return (
    <footer className="bg-slate-800 text-white section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text">
              Savor Restaurant
            </h3>
            <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
              Experience the art of dining with our carefully crafted dishes, 
              exceptional service, and elegant atmosphere. Every meal is a celebration 
              of culinary excellence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-700 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors duration-300">
                <span className="text-sm">📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors duration-300">
                <span className="text-sm">📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors duration-300">
                <span className="text-sm">🐦</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Our Menu
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Reservations
                </button>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-start">
                <span className="mr-2 mt-1">📍</span>
                <div>
                  <p>123 Gourmet Street</p>
                  <p>Culinary District, CD 12345</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📞</span>
                <p>(555) 123-4567</p>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📧</span>
                <p>hello@restaurant.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hours Section */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Operating Hours</h4>
              <div className="grid grid-cols-2 gap-4 text-slate-300">
                <div>
                  <p className="font-medium text-white">Monday - Thursday</p>
                  <p>5:00 PM - 10:00 PM</p>
                </div>
                <div>
                  <p className="font-medium text-white">Friday - Saturday</p>
                  <p>5:00 PM - 11:00 PM</p>
                </div>
                <div>
                  <p className="font-medium text-white">Sunday</p>
                  <p>5:00 PM - 9:00 PM</p>
                </div>
                <div>
                  <p className="font-medium text-white">Kitchen Closes</p>
                  <p>30 minutes before close</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Special Features</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span className="text-slate-300">Private Dining</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span className="text-slate-300">Wine Pairing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span className="text-slate-300">Vegan Options</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span className="text-slate-300">Gluten-Free</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span className="text-slate-300">Event Catering</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span className="text-slate-300">Chef's Table</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-6 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          <p>© 2024 Savor Restaurant. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}