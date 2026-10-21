import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface BillingInfo {
  cardNumber: string;
  cardName: string;
  cardType: string;
  cvv: string;
}

export interface OrderData {
  orderId: string;
  items: CartItem[];
  shipping: ShippingInfo;
  billing: BillingInfo;
  totalAmount: number;
  orderDate: string;
}

interface CartContextType {
  cartItems: CartItem[];
  shippingInfo: ShippingInfo | null;
  billingInfo: BillingInfo | null;
  orderData: OrderData | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateShippingInfo: (info: ShippingInfo) => void;
  updateBillingInfo: (info: BillingInfo) => void;
  createOrder: (orderId: string, totalAmount: number) => void;
  resetOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const addToCart = (item: CartItem) => {
    setCartItems([item]); // Only allow one item in cart for this demo
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateShippingInfo = (info: ShippingInfo) => {
    setShippingInfo(info);
  };

  const updateBillingInfo = (info: BillingInfo) => {
    setBillingInfo(info);
  };

  const createOrder = (orderId: string, totalAmount: number) => {
    if (shippingInfo && billingInfo) {
      const order: OrderData = {
        orderId,
        items: cartItems,
        shipping: shippingInfo,
        billing: billingInfo,
        totalAmount,
        orderDate: new Date().toISOString(),
      };
      setOrderData(order);
      clearCart();
    }
  };

  const resetOrder = () => {
    setOrderData(null);
    setShippingInfo(null);
    setBillingInfo(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingInfo,
        billingInfo,
        orderData,
        addToCart,
        removeFromCart,
        clearCart,
        updateShippingInfo,
        updateBillingInfo,
        createOrder,
        resetOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
