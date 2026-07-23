export interface TripWithOrders {
  id: string;
  userId: string;
  name: string;
  country: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
  createdAt: Date;
  orders: OrderWithItems[];
  _count?: { orders: number };
}

export interface OrderWithItems {
  id: string;
  tripId: string;
  customerId: string;
  status: string;
  notes: string | null;
  receiptUrl: string | null;
  createdAt: Date;
  items: OrderItemInput[];
  customer: CustomerData;
}

export interface OrderItemInput {
  id: string;
  orderId: string;
  itemName: string;
  quantity: number;
  unitPriceForeign: number;
  currency: string;
  unitPriceIDR: number;
  totalIDR: number;
  margin: number;
  notes: string | null;
}

export interface CustomerData {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface DashboardStats {
  totalTrips: number;
  activeTrips: number;
  totalOrders: number;
  totalRevenue: number;
  totalMargin: number;
  totalCustomers: number;
}

export interface TripSummary {
  tripId: string;
  tripName: string;
  country: string;
  totalRevenue: number;
  totalMargin: number;
  orderCount: number;
}
