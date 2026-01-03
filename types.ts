
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  SUPPORT = 'SUPPORT'
}

export enum OrderStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  REFUNDED = 'Refunded'
}

export enum ProductStatus {
  ACTIVE = 'Active',
  DRAFT = 'Draft',
  ARCHIVED = 'Archived'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  lastLogin?: string;
}

export interface SecurityLog {
  id: string;
  action: string;
  user: string;
  ip: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: ProductStatus;
  category: string;
  collection?: string;
  image: string;
  socialHeat?: number;
  createdAt?: string;
}

export interface HomeConfig {
  hero: {
    headingPart1: string;
    headingPart2: string;
    subheading: string;
    image: string;
    registryLabel: string;
  };
  lookbook: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string; image: string }[];
  };
  aura: {
    heading: string;
    subheading: string;
  };
  lab: {
    heading: string;
    subheading: string;
    trackLabel: string;
    image: string;
  };
}

export interface InventoryFilters {
  search: string;
  category: string;
  status: ProductStatus | 'All';
  stockLevel: 'All' | 'Low' | 'Out';
  sortBy: 'price' | 'stock' | 'name' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  password?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Blocked';
  joinedDate: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  value: number;
  expiryDate: string;
  usageCount: number;
  status: 'Active' | 'Expired';
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingShipments: number;
  lowStockItems: number;
  revenueChart: { month: string; amount: number }[];
}
