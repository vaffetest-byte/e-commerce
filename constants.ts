
import { ProductStatus, OrderStatus, Role, Product, Order, Customer, Coupon, HomeConfig } from './types';

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  hero: {
    headingPart1: "Seoul",
    headingPart2: "Metamorphosis",
    subheading: "Where architectural brutalism meets ethereal silk. A curated registry for the discerning inhabitant of the Seongsu-dong creative district.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2000&auto=format&fit=crop",
    registryLabel: "Premium Registry // Spring 2026"
  },
  lookbook: {
    title: "District",
    subtitle: "Registry Log // Urban Narrative",
    items: [
      { title: 'Digital Silk', desc: 'Minimalist forms defined by shadow and light.', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200' },
      { title: 'Atelier Core', desc: 'Architectural silhouettes for the modern inhabitant.', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200' },
      { title: 'Industrial Grit', desc: 'Synthesizing raw concrete with soft silk drapes.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200' }
    ]
  },
  aura: {
    heading: "Metamorphic Registry",
    subheading: "High Conversion Artifacts"
  },
  lab: {
    heading: "Neural Core Synthesis",
    subheading: "Dream in Digital.",
    trackLabel: "Experimental Alpha v5",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1800&auto=format&fit=crop"
  }
};

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: 'g1', 
    name: 'Petal Ribbon Silk Blouse', 
    sku: 'SM-001', 
    price: 42.00, 
    stock: 45, 
    status: ProductStatus.ACTIVE, 
    category: 'Tops', 
    collection: 'Seongsu Edit', 
    socialHeat: 98, 
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    description: 'A delicate synthesis of botanical forms and technical silk. Features an adjustable ribbon collar for modular styling.',
    specifications: { Material: '100% Mulberry Silk', Origin: 'Seoul Atelier', Care: 'Dry Clean Only' },
    gallery: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200'
    ]
  },
  { 
    id: 'g2', 
    name: 'Metamorphic Trench Coat', 
    sku: 'SM-002', 
    price: 185.00, 
    stock: 120, 
    status: ProductStatus.ACTIVE, 
    category: 'Outerwear', 
    collection: 'Seoul Metamorphosis', 
    socialHeat: 85, 
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    description: 'The definitive silhouette for the Seongsu creative. Water-resistant structural nylon with articulated sleeves.',
    specifications: { Weight: 'Medium', Fit: 'Oversized', Fabric: 'Industrial Tech-Nylon' }
  },
  { 
    id: 'g3', 
    name: 'Vintage Tweed Set - Ivory', 
    sku: 'SM-003', 
    price: 125.00, 
    stock: 18, 
    status: ProductStatus.ACTIVE, 
    category: 'Co-ords', 
    collection: 'Collection 04', 
    socialHeat: 92, 
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop' 
  },
  { 
    id: 'g4', 
    name: 'Architectural Midi Dress', 
    sku: 'SM-004', 
    price: 89.00, 
    stock: 25, 
    status: ProductStatus.ACTIVE, 
    category: 'Dresses', 
    collection: 'Seongsu Edit', 
    socialHeat: 76, 
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop' 
  },
  { 
    id: 'g5', 
    name: 'Seongsu Oversized Knit', 
    sku: 'SM-005', 
    price: 58.00, 
    stock: 60, 
    status: ProductStatus.ACTIVE, 
    category: 'Tops', 
    collection: 'Seoul Metamorphosis', 
    socialHeat: 89, 
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop' 
  },
  { 
    id: 'g6', 
    name: 'Midnight Silk Evening Gown', 
    sku: 'SM-006', 
    price: 265.00, 
    stock: 12, 
    status: ProductStatus.ACTIVE, 
    category: 'Dresses', 
    collection: 'Collection 04', 
    socialHeat: 95, 
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop' 
  },
];

export const SHIPPING_METHODS = [
  { id: 'std', name: 'Standard Logistics', price: 10, est: '3-5 Registry Cycles' },
  { id: 'exp', name: 'Priority Matrix Express', price: 25, est: '1-2 Registry Cycles' },
  { id: 'pickup', name: 'Atelier Pickup (Seongsu)', price: 0, est: 'Immediate Availability' }
];

export const TAX_RATE = 0.10; // 10% VAT

export const MOCK_ORDERS: Order[] = [
  { 
    id: '#ORD-9901', 
    customerName: 'Soo-young Park', 
    customerEmail: 's.park@example.com',
    date: '2023-11-05', 
    total: 125.00, 
    subtotal: 113.64,
    tax: 11.36,
    shippingFee: 0,
    status: OrderStatus.PAID, 
    paymentMethod: 'KakaoPay',
    items: [{ productId: 'g3', name: 'Vintage Tweed Set', quantity: 1, price: 125.00 }],
    shippingAddress: '123 Gangnam-daero, Seoul, KR'
  },
  { 
    id: '#ORD-9902', 
    customerName: 'Chloe Bennett', 
    customerEmail: 'chloe.b@example.com',
    date: '2023-11-06', 
    total: 87.00, 
    subtotal: 70.00,
    tax: 7.00,
    shippingFee: 10,
    status: OrderStatus.SHIPPED, 
    paymentMethod: 'Credit Card',
    items: [
      { productId: 'g1', name: 'Petal Ribbon Silk Blouse', quantity: 1, price: 42.00 },
      { productId: 'g2', name: 'Tennis Mini Skirt', quantity: 1, price: 35.00 }
    ],
    shippingAddress: '456 Oxford St, London, UK'
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { 
    id: 'c1', 
    name: 'Soo-young Park', 
    email: 's.park@example.com', 
    totalOrders: 12, 
    totalSpent: 1450.00, 
    status: 'Active', 
    joinedDate: '2023-01-12',
    wishlist: ['g1', 'g6'],
    addresses: [
      { fullName: 'Soo-young Park', street: '123 Gangnam-daero', city: 'Seoul', state: 'Seoul', postalCode: '06234', country: 'KR' }
    ]
  },
  { id: 'c2', name: 'James Wilson', email: 'j.wilson@example.com', totalOrders: 1, totalSpent: 42.00, status: 'Active', joinedDate: '2023-11-02', wishlist: [], addresses: [] },
  { id: 'c3', name: 'Min-ji Kim', email: 'minji@kpop.kr', totalOrders: 45, totalSpent: 5200.00, status: 'Active', joinedDate: '2022-05-20', wishlist: [], addresses: [] },
];

export const MOCK_COUPONS: Coupon[] = [
  { id: 'cp1', code: 'SEOUL20', discountType: 'Percentage', value: 20, expiryDate: '2024-12-31', usageCount: 145, status: 'Active' },
  { id: 'cp2', code: 'FIRSTMUSE', discountType: 'Fixed', value: 10, expiryDate: '2024-06-30', usageCount: 890, status: 'Active' },
];

export const MOCK_STATS = {
  totalRevenue: 52140.00,
  totalOrders: 820,
  pendingShipments: 14,
  lowStockItems: 2,
  revenueChart: [
    { month: 'Sep', amount: 8400 },
    { month: 'Oct', amount: 15600 },
    { month: 'Nov', amount: 28140 },
  ]
};

export const NAVIGATION = [
  { name: 'Dashboard', icon: 'LayoutDashboard', path: '/', roles: [Role.SUPER_ADMIN, Role.MANAGER, Role.SUPPORT] },
  { name: 'Inventory', icon: 'Box', path: '/products', roles: [Role.SUPER_ADMIN, Role.MANAGER] },
  { name: 'Orders', icon: 'ShoppingCart', path: '/orders', roles: [Role.SUPER_ADMIN, Role.MANAGER, Role.SUPPORT] },
  { name: 'Support', icon: 'LifeBuoy', path: '/support', roles: [Role.SUPER_ADMIN, Role.SUPPORT] },
  { name: 'Storefront', icon: 'Monitor', path: '/orchestrator', roles: [Role.SUPER_ADMIN, Role.MANAGER] },
  { name: 'Muses', icon: 'Users', path: '/customers', roles: [Role.SUPER_ADMIN, Role.SUPPORT] },
  { name: 'Coupons', icon: 'Ticket', path: '/marketing', roles: [Role.SUPER_ADMIN, Role.MANAGER] },
  { name: 'System', icon: 'Settings', path: '/settings', roles: [Role.SUPER_ADMIN] },
];

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  KRW: 1350,
  EUR: 0.92
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  KRW: '₩',
  EUR: '€'
};

export const TRANSLATIONS = {
  EN: {
    archive: 'Archive',
    manifesto: 'Manifesto',
    lab: 'Lab',
    identify: 'Identify',
    collection: 'Collection',
    total: 'Total',
    checkout: 'Checkout'
  },
  KR: {
    archive: '아카이브',
    manifesto: '매니페스토',
    lab: '연구소',
    identify: '본인확인',
    collection: '컬렉션',
    total: '합계',
    checkout: '결제하기'
  }
};
