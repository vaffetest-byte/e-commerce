
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
  REFUNDED = 'Refunded',
  RETURN_REQUESTED = 'Return Requested'
}

export enum ProductStatus {
  ACTIVE = 'Active',
  DRAFT = 'Draft',
  ARCHIVED = 'Archived'
}

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export type Language = 'EN' | 'KR';
export type Currency = 'USD' | 'KRW' | 'EUR';

export interface TicketReply {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  message: string;
  orderId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  internalNotes: string[];
  replies: TicketReply[];
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

export interface ProductReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  status: ProductStatus;
  category: string;
  tags?: string[];
  collection?: string;
  image: string;
  socialHeat?: number;
  createdAt?: string;
  description?: string;
  specifications?: Record<string, string>;
  gallery?: string[];
  reviews?: ProductReview[];
  rating?: number;
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
  seasonalOffer?: {
    active: boolean;
    title: string;
    discount: number;
    bannerImage?: string;
  };
}

export interface InventoryFilters {
  search: string;
  category: string;
  status: ProductStatus | 'All';
  stockLevel: 'All' | 'Low' | 'Out';
  sortBy: 'price' | 'stock' | 'name' | 'createdAt' | 'rating';
  sortOrder: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  status: OrderStatus;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: string | ShippingAddress;
  trackingNumber?: string;
  discount?: number;
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
  wishlist: string[]; // Array of product IDs
  addresses: ShippingAddress[];
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

export interface AbandonedCart {
  id: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  lastActive: string;
  totalValue: number;
  recoverySent: boolean;
}
