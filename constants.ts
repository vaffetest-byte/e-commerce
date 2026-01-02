
import { ProductStatus, OrderStatus, Role, Product, Order, Customer, Coupon } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: 'g1', name: 'Petal Ribbon Silk Blouse', sku: 'SM-001', price: 42.00, stock: 45, status: ProductStatus.ACTIVE, category: 'Tops', socialHeat: 98, image: 'https://images.unsplash.com/photo-1564252629749-fb2d4212ffec?auto=format&fit=crop&q=80&w=800' },
  { id: 'g2', name: 'Hongdae Tennis Mini Skirt', sku: 'SM-002', price: 35.00, stock: 120, status: ProductStatus.ACTIVE, category: 'Skirts', socialHeat: 85, image: 'https://images.unsplash.com/photo-1582142839970-2b9e04b60f65?auto=format&fit=crop&q=80&w=800' },
  { id: 'g3', name: 'Vintage Tweed Set - Ivory', sku: 'SM-003', price: 125.00, stock: 18, status: ProductStatus.ACTIVE, category: 'Co-ords', socialHeat: 92, image: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=800' },
  { id: 'g4', name: 'Lace-Up Romantic Midi', sku: 'SM-004', price: 89.00, stock: 25, status: ProductStatus.ACTIVE, category: 'Dresses', socialHeat: 76, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800' },
  { id: 'g5', name: 'Seongsu Oversized Knit', sku: 'SM-005', price: 58.00, stock: 60, status: ProductStatus.ACTIVE, category: 'Tops', socialHeat: 89, image: 'https://images.unsplash.com/photo-1624206112918-f140f087f9b5?auto=format&fit=crop&q=80&w=800' },
  { id: 'g6', name: 'Moonlight Satin Slip', sku: 'SM-006', price: 65.00, stock: 12, status: ProductStatus.ACTIVE, category: 'Dresses', socialHeat: 95, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800' },
];

export const MOCK_ORDERS: Order[] = [
  { 
    id: '#ORD-9901', 
    customerName: 'Soo-young Park', 
    customerEmail: 's.park@example.com',
    date: '2023-11-05', 
    total: 125.00, 
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
    total: 77.00, 
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
  { id: 'c1', name: 'Soo-young Park', email: 's.park@example.com', totalOrders: 12, totalSpent: 1450.00, status: 'Active', joinedDate: '2023-01-12' },
  { id: 'c2', name: 'James Wilson', email: 'j.wilson@example.com', totalOrders: 1, totalSpent: 42.00, status: 'Active', joinedDate: '2023-11-02' },
  { id: 'c3', name: 'Min-ji Kim', email: 'minji@kpop.kr', totalOrders: 45, totalSpent: 5200.00, status: 'Active', joinedDate: '2022-05-20' },
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
  { name: 'Muses', icon: 'Users', path: '/customers', roles: [Role.SUPER_ADMIN, Role.SUPPORT] },
  { name: 'Coupons', icon: 'Ticket', path: '/marketing', roles: [Role.SUPER_ADMIN, Role.MANAGER] },
  { name: 'System', icon: 'Settings', path: '/settings', roles: [Role.SUPER_ADMIN] },
];
