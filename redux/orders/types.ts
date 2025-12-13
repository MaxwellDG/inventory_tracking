import { Fee } from "../fees/types";
import { Item } from "../products/types";

export const ORDER_STATUS = {
  completed: "completed",
  pending: "pending",
  open: "open",
} as const;

export type User = {
  id: number;
  name: string;
  email: string;
};

export type Order = {
  uuid: string;
  user_id: number;
  items: Item[];
  total: number;
  subtotal: number;
  status: keyof typeof ORDER_STATUS;
  receipt_id: string | null;
  created_at: Date;
  updated_at: Date;
  fees: Fee[];
};

export type GetOrderResponse = {
  uuid: string;
  user_id: number;
  items: Item[];
  total: number;
  subtotal: number;
  status: keyof typeof ORDER_STATUS;
  receipt_id: string | null;
  created_at: Date;
  updated_at: Date;
  fees: Fee[];
};

export type OrderListItem = {
  uuid: string;
  user: User;
  subtotal: number;
  total: number;
  status: keyof typeof ORDER_STATUS;
  created_at: Date;
  updated_at: Date;
};

export type OrderResponse = Order[];

export type PaginatedOrdersResponse = {
  data: OrderListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

export type OrderItem = {
  id: number;
  quantity: number;
};

export type CreateOrderRequest = {
  items: OrderItem[];
};

export type UpdateOrderRequest = {
  order_uuid: string;
  items?: Item[];
  receipt_id?: string;
  status?: keyof typeof ORDER_STATUS;
};
