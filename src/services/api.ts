import axios from 'axios';
import type { 
  TransactionResponse, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  FilterOptions,
  SortOptions,
  PaginationOptions 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    const payload = response.data;
    // Backend returns: { success, message, timestamp, data: { access_token, user } }
    const mapped: AuthResponse = {
      access_token: payload?.data?.access_token,
      user: payload?.data?.user,
    };
    return mapped;
  },

  register: async (userData: RegisterData): Promise<any> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<any> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const transactionService = {
  getAllTransactions: async (
    pagination: PaginationOptions,
    sort?: SortOptions,
    filters?: FilterOptions
  ): Promise<TransactionResponse> => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    });

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }

    if (filters?.status?.length) {
      filters.status.forEach(status => params.append('status', (status || '').toLowerCase()));
    }

    if (filters?.schoolIds?.length) {
      filters.schoolIds.forEach(id => params.append('school_id', id));
    }

    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }

    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await api.get(`/transactions?${params.toString()}`);
    const payload = response.data;
    return {
      transactions: payload?.data ?? [],
      pagination: payload?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },


  getTransactionsBySchool: async (
    schoolId: string,
    pagination: PaginationOptions,
    sort?: SortOptions,
    filters?: FilterOptions
  ): Promise<TransactionResponse> => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    });

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }

    if (filters?.status?.length) {
      filters.status.forEach(status => params.append('status', (status || '').toLowerCase()));
    }

    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }

    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await api.get(`/transactions/school/${schoolId}?${params.toString()}`);
    const payload = response.data;
    return {
      transactions: payload?.data ?? [],
      pagination: payload?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  getTransactionStatus: async (customOrderId: string): Promise<any> => {
    const response = await api.get(`/transactions/status/${customOrderId}`);
    const payload = response.data?.data || response.data;
    return {
      custom_order_id: payload?.order_id,
      status: payload?.status,
      payment_details: payload?.payment_details,
      payment_time: payload?.payment_time,
      order_amount: payload?.order_amount,
      transaction_amount: payload?.transaction_amount,
      bank_reference: payload?.bank_reference,
      payment_message: payload?.payment_message ?? payload?.payment_details,
      payment_mode: payload?.payment_mode,
    };
  },

  createDummyData: async (): Promise<any> => {
    const response = await api.post('/transactions/dummy-data');
    return response.data;
  },
};

export const paymentService = {
  createPayment: async (paymentData: any): Promise<any> => {
    const response = await api.post('/payment/create-payment', paymentData);
    return response.data;
  },

  getPaymentStatus: async (customOrderId: string): Promise<any> => {
    const response = await api.get(`/payment/status/${customOrderId}`);
    return response.data;
  },
};

export const webhookService = {
  processWebhook: async (webhookData: any): Promise<any> => {
    const response = await api.post('/webhook', webhookData);
    return response.data;
  },
};

export default api;
