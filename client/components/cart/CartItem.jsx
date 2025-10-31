import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  if (!item || !item.proId) {
    console.warn('CartItem: Invalid item data', item);
    return null;
  }

  if (!item.item || !item.item.name) {
    console.warn('CartItem: Missing product information', item);
    return null;
  }

  const productName = item.item.name;
  const productImage = item.item?.images?.[0]?.url || '/products/product.png';
  const productColor = item.item?.color || 'Pink';
  const productSize = item.variantSize ||
    (item.item?.sizes && item.item.sizes.length > 0 ? item.item.sizes[0] : 'M');

  const isValidPrice = typeof item.price === 'number' && item.price >= 0;
  const isValidQuantity = typeof item.quantity === 'number' && item.quantity > 0;

  if (!isValidPrice || !isValidQuantity) {
    console.warn('CartItem: Invalid price or quantity', { price: item.price, quantity: item.quantity });
    return null;
  }

 

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.proId);
    }
  };

  return (
    <div className="w-full flex items-center bg-white border-2 border-accent rounded-lg space-x-4">
      {/* Product Image */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 p-2 sm:p-4 bg-accent overflow-hidden ">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/products/product.png';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm md:text-lg text-primary truncate">
          {productName}
        </h3>
        <p className="text-sm text-primary font-semibold">
          ₹ {item.price.toLocaleString('en-IN')}
        </p>
        <div className="text-sm text-secondary mt-1">
          <p className="flex items-center">
            <span className="font-medium">Size: </span>
            <span className="ml-1 font-medium">{productSize}</span>
          </p>
          <p className="flex items-center">
            <span className="font-medium">Color: </span>
            <span className="ml-1 font-medium">{productColor}</span>
          </p>
        </div>
      </div>

      {/* Quantity & Remove Section */}
       <div className="flex pb-2 md:pb-4 pr-2 md:pr-4 items-center self-end justify-between sm:justify-end gap-1.5 sm:gap-3">
          <div className="sm:w-auto  outline-offset-[-0.60px] outline-tags inline-flex justify-center items-center  border border-[#EF3B6D] rounded-sm px-3 py-1 sm:px-3  sm:py-1 gap-1.5 sm:gap-3 bg-white">
           
            {item.quantity > 1 ? (
              <button
                onClick={() => onQuantityChange(item.quantity - 1)}
                className=" text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors   rounded  items-center justify-center cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            ) : (
              <button
                onClick={handleRemove}
                className="flex text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors rounded  items-center justify-center cursor-pointer"
                aria-label="Remove item"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}
            <span className="text-[#EF3B6D] font-semibold text-xs sm:text-lg  text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.quantity + 1)}
              className="text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors rounded  flex items-center justify-center cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3 sm:h-5 sm:w-5" />
            </button>
          </div>
    </div>
    </div>
  );
};

export default CartItem;
// import React from 'react';
// import Image from 'next/image';
// import { Minus, Plus, Trash } from 'lucide-react';

// type Props = {
//   item: any; // Cart item after normalization
//   onQuantityChange: (q: number) => void;
//   onRemove: () => void;
// };

// const CartItem: React.FC<Props> = ({ item, onQuantityChange, onRemove }) => {
//   const qty = Number(item.quantity ?? item.item?.quantity ?? 1);
//   const title = item.title ?? item.item?.name ?? item.item?.productName ?? 'Product';
//   const price = Number(item.price ?? item.item?.price ?? 0);
//   const mrp = Number(item.mrp ?? item.item?.mrp ?? 0);
//   const image = item.image ?? '/products/product.png';
//   const size = item.size ?? null;
//   const color = item.color ?? null;
//   const colorCode = item.colorCode ?? null;

//   return (
//     <div className="flex gap-4 items-center p-4 border rounded-md bg-white">
//       <div className="w-20 h-20 relative flex-shrink-0">
//         <Image src={image || '/products/product.png'} alt={title} fill className="object-contain rounded" />
//       </div>

//       <div className="flex-1 min-w-0">
//         <div className="flex items-start justify-between gap-2">
//           <div>
//             <div className="font-medium text-sm text-[#5E3A1C] line-clamp-2">{title}</div>

//             <div className="flex items-center gap-3 mt-2 text-xs">
//               {color && (
//                 <div className="flex items-center gap-2">
//                   <span className="text-[#9B7C62]">Color</span>
//                   <div
//                     className="w-5 h-5 rounded-full border"
//                     style={{
//                       backgroundColor: colorCode || color || '#ffffff',
//                       boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)'
//                     }}
//                     title={String(color)}
//                   />
//                 </div>
//               )}

//               {size && (
//                 <div className="flex items-center gap-2">
//                   <span className="text-[#9B7C62]">Size</span>
//                   <span className="font-medium text-sm">{size}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="text-right">
//             <div className="font-semibold">₹{price.toLocaleString()}</div>
//             {mrp > price && <div className="text-xs line-through text-gray-400">₹{mrp.toLocaleString()}</div>}
//           </div>
//         </div>

//         <div className="mt-3 flex items-center justify-between">
//           <div className="flex items-center gap-2 border rounded-md overflow-hidden">
//             <button
//               onClick={() => onQuantityChange(Math.max(1, qty - 1))}
//               className="px-3 py-1 bg-gray-50"
//               aria-label="Decrease quantity"
//             >
//               <Minus className="w-4 h-4" />
//             </button>
//             <div className="px-4 py-1 font-medium">{qty}</div>
//             <button
//               onClick={() => onQuantityChange(qty + 1)}
//               className="px-3 py-1 bg-gray-50"
//               aria-label="Increase quantity"
//             >
//               <Plus className="w-4 h-4" />
//             </button>
//           </div>

//           <button
//             onClick={onRemove}
//             className="text-red-600 ml-4 p-2 rounded hover:bg-red-50"
//             aria-label="Remove item"
//           >
//             <Trash className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartItem;