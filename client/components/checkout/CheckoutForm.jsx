const CheckoutForm = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Contact information</h2>
      <div className="mb-4">
        <input 
          type="email" 
          placeholder="Email address"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        <p className="text-xs text-gray-500 mt-1">You will receive order confirmation and shipping updates here.</p>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Shipping address</h2>
      <form className="space-y-4">
        <select className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent">
          <option>India</option>
          <option>United States</option>
          <option>United Kingdom</option>
        </select>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="First name" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
          <input type="text" placeholder="Last name" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
        <input type="text" placeholder="Address" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        <div className="grid grid-cols-3 gap-4">
          <input type="text" placeholder="City" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
          <select className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent">
            <option>State</option>
          </select>
          <input type="text" placeholder="PIN code" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
        <input type="tel" placeholder="Phone" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        
        <div className="flex items-center">
          <input id="save-info" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
          <label htmlFor="save-info" className="ml-2 block text-sm text-gray-900">
            Save this information for next time
          </label>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm; 