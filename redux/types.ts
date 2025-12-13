import { ORDER_STATUS } from "./orders/types";

export type PaginationFilters = Partial<{
  limit: number;
  page: number;
  startDate: string;
  endDate: string;
  status: keyof typeof ORDER_STATUS;
}>;
