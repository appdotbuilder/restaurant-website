import { HeroSection } from '@/components/HeroSection';
import './App.css';

// Mock data for the restaurant
const mockCategories = [
  { id: 1, name: 'Appetizers', description: 'Start your culinary journey with our exquisite starters', display_order: 1, is_active: true, created_at: new Date() },
  { id: 2, name: 'Main Courses', description: 'Our signature dishes crafted with passion', display_order: 2, is_active: true, created_at: new Date() },
  { id: 3, name: 'Desserts', description: 'Sweet endings to complete your meal', display_order: 3, is_active: true, created_at: new Date() }
];

const mockSpecials = [
  { 
    id: 1, 
    category_id: 2, 
    name: 'Truffle Risotto', 
    description: 'Creamy arborio rice infused with black truffle essence, finished with aged parmesan and microgreens', 
    ingredients: 'Arborio rice, black truffle, aged parmesan cheese, white wine, vegetable stock, butter, microgreens',
    preparation_info: 'Slowly cooked using traditional Italian risotto technique, stirring continuously for 18 minutes to achieve perfect creaminess',
    price: 45.00, 
    image_url: null, 
    is_chefs_special: true, 
    is_available: true, 
    dietary_info: 'vegetarian,gluten-free', 
    display_order: 1, 
    created_at: new Date(), 
    updated_at: new Date() 
  },
  { 
    id: 2, 
    category_id: 2, 
    name: 'Wagyu Beef Tenderloin', 
    description: 'Premium A5 Wagyu beef tenderloin with roasted seasonal vegetables and red wine reduction', 
    ingredients: 'A5 Wagyu beef tenderloin, seasonal root vegetables, red wine, beef stock, fresh herbs, garlic, shallots',
    preparation_info: 'Seared to perfection and finished in the oven, served medium-rare with herb butter and our signature red wine reduction',
    price: 85.00, 
    image_url: null, 
    is_chefs_special: true, 
    is_available: true, 
    dietary_info: null, 
    display_order: 2, 
    created_at: new Date(), 
    updated_at: new Date() 
  },
  { 
    id: 3, 
    category_id: 2, 
    name: 'Pan-Seared Sea Bass', 
    description: 'Fresh Atlantic sea bass with lemon herb crust, served over saffron risotto with grilled asparagus', 
    ingredients: 'Atlantic sea bass, saffron, arborio rice, asparagus, lemon, fresh herbs, olive oil, white wine',
    preparation_info: 'Pan-seared with crispy skin, served over creamy saffron risotto and finished with lemon herb oil',
    price: 38.00, 
    image_url: null, 
    is_chefs_special: true, 
    is_available: true, 
    dietary_info: 'pescatarian,gluten-free', 
    display_order: 3, 
    created_at: new Date(), 
    updated_at: new Date() 
  }
];

function App() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      
      {/* Menu Section */}
      <section id="menu" className="py-16 px-4 md:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Our Menu
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover our carefully crafted dishes made with the finest ingredients 
              and prepared with passion by our expert chefs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">{category.name}</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Category #{category.display_order}</span>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                    View Items →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chef's Specials */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Chef's Specials
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Indulge in our chef's signature creations, featuring premium ingredients 
              and innovative techniques that showcase culinary artistry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {mockSpecials.map((special) => (
              <div key={special.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-semibold rounded-bl-lg z-10">
                  ⭐ Premium
                </div>
                
                <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-amber-600 text-5xl">🍽️</span>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{special.name}</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{special.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm">Key Ingredients:</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{special.ingredients}</p>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-amber-200">
                  <span className="text-3xl font-bold text-amber-600">${special.price.toFixed(2)}</span>
                  <div className="flex gap-2">
                    {special.dietary_info && special.dietary_info.split(',').map((diet) => (
                      <span key={diet} className="bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full">
                        {diet.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-xs text-slate-500 italic">Click to view preparation details</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Experience Culinary Excellence
              </h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Our chef's specials are available for a limited time and feature seasonal ingredients. 
                Reserve your table today to ensure you don't miss these extraordinary dishes.
              </p>
              <button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-300"
                onClick={() => document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Make a Reservation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reservations */}
      <section id="reservations" className="py-16 px-4 md:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-6">
              <span className="text-2xl">🍽️</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Reserve Your Table
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Secure your dining experience with us. Book your table and let us create 
              an unforgettable culinary journey for you and your guests.
            </p>
          </div>

          {/* Reservation Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800 border border-slate-700 text-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
              <p className="text-slate-300">
                Quick and simple reservation process with instant confirmation
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 text-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🕒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Flexible Times</h3>
              <p className="text-slate-300">
                Choose from available time slots that work best for your schedule
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 text-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎉</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Special Occasions</h3>
              <p className="text-slate-300">
                Let us know about celebrations and we'll make them extra special
              </p>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300">
              Make a Reservation
            </button>

            {/* Contact Information */}
            <div className="mt-12 pt-12 border-t border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <h4 className="font-semibold text-lg mb-2">📞 Phone</h4>
                  <p className="text-slate-300">(555) 123-4567</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">📧 Email</h4>
                  <p className="text-slate-300">reservations@restaurant.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">🕒 Hours</h4>
                  <p className="text-slate-300">
                    Mon-Thu: 5:00 PM - 10:00 PM<br />
                    Fri-Sat: 5:00 PM - 11:00 PM<br />
                    Sun: 5:00 PM - 9:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
    </div>
  );
}

export default App;