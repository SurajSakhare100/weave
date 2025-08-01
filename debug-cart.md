# Cart Debugging Guide

## Issue: Items stored in DB but not shown in cart UI

### Debugging Steps:

1. **Check Browser Console**
   - Open browser developer tools
   - Look for console logs from:
     - `CartHydrator` component
     - `fetchCart` thunk
     - `getCart` service
     - `fetchCart.fulfilled` reducer

2. **Check Server Logs**
   - Look for logs from:
     - `getCart` controller
     - `getCartItems` helper function

3. **Database Check**
   - Verify cart items exist in database
   - Check if products exist and are available

4. **API Response Check**
   - Check what the `/users/cart` API returns
   - Verify the response structure

### Expected Flow:

1. User authenticates → `UserHydrator` runs
2. User authenticated → `CartHydrator` runs
3. Cart empty → `fetchCart` dispatched
4. API call to `/users/cart`
5. Server processes request → `getCartItems` called
6. Database query returns cart items
7. Response sent back to client
8. Redux state updated with cart items
9. UI reflects cart items

### Common Issues:

1. **Authentication Issue**: User not properly authenticated
2. **API Error**: Server returning error response
3. **Data Structure Issue**: Response format doesn't match expected
4. **Filtering Issue**: Items being filtered out in Redux
5. **Product Availability**: Products marked as unavailable
6. **Database Issue**: Cart items not properly stored

### Debug Commands:

```javascript
// Check Redux state
console.log('Cart state:', store.getState().cart);

// Check user state
console.log('User state:', store.getState().user);

// Check localStorage
console.log('LocalStorage:', localStorage.getItem('persist:root'));
```

### Test Cases:

1. **Add item to cart** → Check if appears in cart
2. **Refresh page** → Check if cart persists
3. **Logout/Login** → Check if cart loads
4. **Multiple items** → Check if all items show
5. **Update quantity** → Check if updates reflect
6. **Remove item** → Check if removal works

### Expected Console Output:

```
CartHydrator - User authenticated, fetching cart
fetchCart thunk - Starting fetch
Cart service - getCart called
Cart controller - getCart called
Cart controller - User ID: [user_id]
getCartItems called for userId: [user_id]
Found cart: yes Items count: [count]
Product IDs in cart: [array_of_ids]
Found products: [count]
fetchCart thunk - API response: {success: true, result: [...], amount: {...}}
fetchCart thunk - Returning result: [array]
fetchCart.fulfilled - Raw payload: [array]
fetchCart.fulfilled - Valid items: [count]
```

### If Items Still Don't Show:

1. Check if `item.item` property exists in cart items
2. Check if products are being found in database
3. Check if filtering is too strict
4. Check if Redux state is being updated
5. Check if UI is reading from correct state 