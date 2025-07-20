import MainLayout from '@/components/layout/MainLayout';

export default function AboutPage() {
  return (
    <MainLayout>
      <section className="py-16 bg-[#faf5f2] min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">About Weave</h1>
          
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                Welcome to Weave, your premier destination for high-quality textiles and fashion products. 
                We are dedicated to bringing you the finest selection of products from talented vendors 
                and artisans from around the world.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-6">
                At Weave, we believe in connecting customers with exceptional products while supporting 
                independent vendors and creators. Our platform provides a seamless shopping experience 
                with a focus on quality, authenticity, and customer satisfaction.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">What We Offer</h2>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Curated selection of premium textiles and fashion items</li>
                <li>Direct connection with verified vendors and artisans</li>
                <li>Secure and convenient shopping experience</li>
                <li>Global shipping to bring the world to your doorstep</li>
                <li>Exceptional customer service and support</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🌟</div>
                  <h3 className="font-semibold text-gray-800">Quality</h3>
                  <p className="text-sm text-gray-600">We maintain the highest standards in product quality</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🤝</div>
                  <h3 className="font-semibold text-gray-800">Trust</h3>
                  <p className="text-sm text-gray-600">Building lasting relationships with our customers and vendors</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🌍</div>
                  <h3 className="font-semibold text-gray-800">Global</h3>
                  <p className="text-sm text-gray-600">Connecting cultures through beautiful products</p>
                </div>
              </div>
              
              <p className="text-gray-700">
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