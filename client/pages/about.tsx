import MainLayout from '@/components/layout/MainLayout';
import MobilePageHeader from '@/components/ui/MobilePageHeader';

export default function AboutPage() {
  return (
    <MainLayout>
      <MobilePageHeader title="About Weave" />
      <section className="py-8 sm:py-12 lg:py-16 bg-[#faf5f2] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">About Weave</h1>
          
          <div className="bg-white rounded-2xl shadow p-4 sm:p-6 lg:p-8">
            <div className="prose max-w-none">
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
                Welcome to Weave, your premier destination for high-quality textiles and fashion products. 
                We are dedicated to bringing you the finest selection of products from talented vendors 
                and artisans from around the world.
              </p>
              
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                At Weave, we believe in connecting customers with exceptional products while supporting 
                independent vendors and creators. Our platform provides a seamless shopping experience 
                with a focus on quality, authenticity, and customer satisfaction.
              </p>
              
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">What We Offer</h2>
              <ul className="list-disc list-inside text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>Curated selection of premium textiles and fashion items</li>
                <li>Direct connection with verified vendors and artisans</li>
                <li>Secure and convenient shopping experience</li>
                <li>Global shipping to bring the world to your doorstep</li>
                <li>Exceptional customer service and support</li>
              </ul>
              
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Our Values</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2">🌟</div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Quality</h3>
                  <p className="text-xs sm:text-sm text-gray-600">We maintain the highest standards in product quality</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2">🤝</div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Trust</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Building lasting relationships with our customers and vendors</p>
                </div>
                <div className="text-center sm:col-span-2 lg:col-span-1">
                  <div className="text-3xl sm:text-4xl mb-2">🌍</div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Global</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Connecting cultures through beautiful products</p>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm sm:text-base">
                Thank you for choosing Weave. We look forward to being part of your journey 
                in discovering amazing products and supporting talented creators worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
} 