export interface Transaction {
  collect_id: string;
  school_id: string;
  gateway: string;
  order_amount: number;
  transaction_amount: number;
  status: 'Pending' | 'Success' | 'Failed';
  custom_order_id: string;
  payment_time?: string;
  payment_mode?: string;
  bank_reference?: string;
  student_info?: {
    name: string;
    id: string;
    email: string;
  };
}

export interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  school_id: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
  school_id?: string;
}

export interface FilterOptions {
  status?: string[];
  schoolIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}
