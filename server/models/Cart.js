import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  proId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1, 
    default: 1 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  mrp: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  
  // Track selected color + size (useful for colorVariants)
  variantColor: { 
    type: String, 
    trim: true, 
    default: null 
  },
  variantColorCode: { 
    type: String, 
    trim: true, 
    default: null 
  },
  variantSize: { 
    type: String, 
    trim: true, 
    default: null 
  },

  // Optional: image for quick cart preview
  image: { 
    type: String, 
    trim: true, 
    default: null 
  },
}, { _id: false });

const CartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  items: [CartItemSchema],
}, { timestamps: true });

// --- Helper methods ---

// Add or update cart item
CartSchema.methods.addItem = async function (itemData) {
  const existingItem = this.items.find(i =>
    i.proId.equals(itemData.proId) &&
    i.variantColor === itemData.variantColor &&
    i.variantSize === itemData.variantSize
  );

  if (existingItem) {
    existingItem.quantity += itemData.quantity;
  } else {
    this.items.push(itemData);
  }

  await this.save();
  return this;
};

// Remove item
CartSchema.methods.removeItem = async function (productId, variantColor, variantSize) {
  this.items = this.items.filter(i =>
    !(
      i.proId.equals(productId) &&
      i.variantColor === variantColor &&
      i.variantSize === variantSize
    )
  );
  await this.save();
  return this;
};

// Get total cart value
CartSchema.methods.getTotalPrice = function () {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
};

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;
