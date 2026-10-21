import { Product } from '../types';

// Using placeholder image URLs - replace with your actual image URLs or local assets
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300?text=Product';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 79.99,
    description: 'Premium sound quality with noise cancellation',
    image: PLACEHOLDER_IMAGE,
    detailedDescription:
      'Experience immersive audio with our premium wireless headphones. Featuring advanced noise-cancellation technology, these headphones deliver crystal-clear sound whether you\'re in a busy office, traveling, or relaxing at home. The comfortable over-ear design ensures hours of listening pleasure, while the long-lasting battery provides up to 30 hours of continuous playback.',
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 299.99,
    description: 'Track your fitness and stay connected',
    image: PLACEHOLDER_IMAGE,
    detailedDescription:
      'Stay connected and healthy with our latest smartwatch. Monitor your heart rate, track daily steps, and receive instant notifications right on your wrist. With a stunning AMOLED display and water-resistant design, this smartwatch is perfect for both professional and athletic pursuits. Sync seamlessly with your smartphone for a truly connected experience.',
  },
  {
    id: '3',
    name: 'USB-C Cable',
    price: 14.99,
    description: 'Fast charging and data transfer cable',
    image: PLACEHOLDER_IMAGE,
    detailedDescription:
      'Our high-quality USB-C cable supports fast charging and rapid data transfer. Built with premium materials and reinforced connectors, it\'s designed to last. Compatible with most USB-C devices, this cable is perfect for your smartphone, tablet, or laptop. The sleek design and durable construction make it an essential accessory.',
  },
  {
    id: '4',
    name: 'Portable Charger',
    price: 49.99,
    description: 'Keep your devices powered on the go',
    image: PLACEHOLDER_IMAGE,
    detailedDescription:
      'Never worry about battery life with our powerful portable charger. With a capacity of 20,000mAh, it can charge your phone multiple times. The fast-charging technology ensures your devices are powered up quickly. Compact and lightweight, it\'s perfect for travel, work, or outdoor adventures.',
  },
  {
    id: '5',
    name: 'Phone Case',
    price: 24.99,
    description: 'Durable protection with premium design',
    image: PLACEHOLDER_IMAGE,
    detailedDescription:
      'Protect your smartphone with our premium protective case. Featuring advanced shock absorption and scratch-resistant coating, it keeps your phone safe from daily wear and tear. The slim profile maintains your phone\'s elegant look while providing reliable protection. Available in multiple colors to match your style.',
  },
  {
    id: '6',
    name: 'Screen Protector',
    price: 12.99,
    description: 'Crystal clear protection for your display',
    image: PLACEHOLDER_IMAGE,
    detailedDescription:
      'Safeguard your device\'s display with our premium tempered glass screen protector. Offering 9H hardness rating, it prevents scratches and impacts while maintaining crystal-clear clarity. Easy application with bubble-free installation, it\'s virtually invisible once applied. Includes a lifetime replacement guarantee against defects.',
  },
];

export const CARD_TYPES = ['Visa', 'Mastercard', 'American Express', 'Discover'];

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
  'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
];

export const generateOrderId = (): string => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};
