export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Burger' | 'Pizza' | 'Cold Coffee' | 'Drinks' | 'Shakes' | 'Sandwich' | 'Snacks' | string;
  badge?: 'New' | 'Popular' | '' | string;
  image: string;
  available?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  readTime: string;
  image: string;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  tableType: string;
  specialRequests?: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  createdAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Order {
  id: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  productImage: string;
  customerName: string;
  tableNumber: string;
  phone: string;
  email?: string;
  quantity: number;
  totalAmount: number;
  status: 'Pending' | 'Accepted' | 'Received' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  paymentMethod?: 'Cash' | 'UPI' | 'Card';
  paymentStatus?: 'Paid' | 'Pending' | 'Failed';
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'owner' | 'staff' | 'customer';
  phone?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  activeTables: number;
}
