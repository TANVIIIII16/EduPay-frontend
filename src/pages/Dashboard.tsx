import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon,
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { transactionService } from '../services/api';
import type { Transaction, FilterOptions, SortOptions, TransactionResponse } from '../types';
import { formatCurrency, getStatusColor } from '../utils/format';
import { toast } from 'react-toastify';


const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSchoolIds, setAvailableSchoolIds] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page') || '1'),
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  const [filters, setFilters] = useState<FilterOptions>({
    status: searchParams.get('status')?.split(',') || [],
    schoolIds: searchParams.get('schoolIds')?.split(',') || [],
    search: searchParams.get('search') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  });
  
  const [sort, setSort] = useState<SortOptions>({
    field: searchParams.get('sortField') || 'payment_time',
    direction: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc',
  });
  
  const [rowsPerPage, setRowsPerPage] = useState(parseInt(searchParams.get('limit') || '10'));
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');


  const updateURLParams = (newFilters: FilterOptions, newSort: SortOptions, newPagination: any) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.status?.length) {
      params.set('status', newFilters.status.join(','));
    }
    if (newFilters.schoolIds?.length) params.set('schoolIds', newFilters.schoolIds.join(','));
    if (newFilters.dateFrom) params.set('dateFrom', newFilters.dateFrom);
    if (newFilters.dateTo) params.set('dateTo', newFilters.dateTo);
    if (newSort.field) params.set('sortField', newSort.field);
    if (newSort.direction) params.set('sortDirection', newSort.direction);
    if (newPagination.currentPage > 1) params.set('page', newPagination.currentPage.toString());
    if (rowsPerPage !== 10) params.set('limit', rowsPerPage.toString());
    
    setSearchParams(params);
  };

  useEffect(() => {
    loadTransactions();
  }, [pagination.currentPage, sort, filters, rowsPerPage]);

  useEffect(() => {
    fetchAvailableSchoolIds();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowDropdown(false);
        setShowAllDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await transactionService.getAllTransactions(
        { page: pagination.currentPage, limit: rowsPerPage },
        sort,
        filters
      );
      
      const serverTransactions = response.transactions || [];
      const statusFiltered = (filters.status && filters.status.length > 0)
        ? serverTransactions.filter(t => filters.status!.some(s => (t.status || '').toLowerCase() === (s || '').toLowerCase()))
        : serverTransactions;
      setTransactions(statusFiltered);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
      updateURLParams(filters, sort, pagination);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load transactions');
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSchoolIds = async () => {
    try {
      const response: TransactionResponse = await transactionService.getAllTransactions(
        { page: 1, limit: 1000 },
        sort,
        { search: '' }
      );
      
      const uniqueSchoolIds = [...new Set(response.transactions.map(t => t.school_id))];
      setAvailableSchoolIds(uniqueSchoolIds);
    } catch (err) {
      console.error('Failed to fetch school IDs:', err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    const newFilters = { ...filters, search: searchValue };
    const newPagination = { ...pagination, currentPage: 1 };
    setFilters(newFilters);
    setPagination(newPagination);
    setShowDropdown(searchValue.length > 0);
    updateURLParams(newFilters, sort, newPagination);
  };

  const handleSchoolIdSelect = (schoolId: string) => {
    const newFilters = { ...filters, search: schoolId };
    const newPagination = { ...pagination, currentPage: 1 };
    setFilters(newFilters);
    setPagination(newPagination);
    setShowDropdown(false);
    setShowAllDropdown(false);
    updateURLParams(newFilters, sort, newPagination);
  };

  const handleSort = (field: string) => {
    const newSort: SortOptions = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    };
    setSort(newSort);
    updateURLParams(filters, newSort, pagination);
  };


  const handleStatusFilterChange = (statusFilter: string) => {
    setSelectedStatus(statusFilter);
    const newFilters = { 
      ...filters, 
      status: statusFilter ? [statusFilter] : [] 
    };
    const newPagination = { ...pagination, currentPage: 1 };
    setFilters(newFilters);
    setPagination(newPagination);
    updateURLParams(newFilters, sort, newPagination);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    const newPagination = { ...pagination, currentPage: 1 };
    setPagination(newPagination);
    updateURLParams(filters, sort, newPagination);
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterOptions = {
      status: [],
      schoolIds: [],
      search: '',
      dateFrom: '',
      dateTo: '',
    };
    const defaultSort: SortOptions = {
      field: 'payment_time',
      direction: 'desc',
    };
    const defaultPagination = {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
    
    setFilters(defaultFilters);
    setSort(defaultSort);
    setPagination(defaultPagination);
    setSelectedStatus('');
    setRowsPerPage(10);
    updateURLParams(defaultFilters, defaultSort, defaultPagination);
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Order ID copied to clipboard');
  };


  const SortButton: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-100"
    >
      <span>{children}</span>
      {sort.field === field && (
        sort.direction === 'asc' ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction List</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">view all transaction and filter according to your needs</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 font-medium"
              >
                Reset
              </button>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32"
                >
                  <option value="">Status</option>
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sort.direction}
                  onChange={(e) => {
                    const newSort = { ...sort, direction: e.target.value as 'asc' | 'desc' };
                    setSort(newSort);
                    updateURLParams(filters, newSort, pagination);
                  }}
                  className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-24"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => {
                    const newFilters = { ...filters, dateFrom: e.target.value };
                    setFilters(newFilters);
                    setPagination({ ...pagination, currentPage: 1 });
                    updateURLParams(newFilters, sort, { ...pagination, currentPage: 1 });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-40"
                  placeholder="Select date"
                />
              </div>

              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value))}
                  className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-20"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="relative flex-1 max-w-md search-container">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={handleSearch}
                onFocus={() => setShowDropdown((filters.search || '').length > 0)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by School ID..."
              />
              
              <button
                type="button"
                onClick={() => setShowAllDropdown(!showAllDropdown)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <ChevronDownIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
              
              {showDropdown && availableSchoolIds.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableSchoolIds
                    .filter(schoolId => 
                      schoolId.toLowerCase().includes((filters.search || '').toLowerCase())
                    )
                    .map((schoolId) => (
                      <button
                        key={schoolId}
                        onClick={() => handleSchoolIdSelect(schoolId)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none"
                      >
                        {schoolId}
                      </button>
                    ))
                  }
                </div>
              )}
              
              {showAllDropdown && availableSchoolIds.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableSchoolIds.map((schoolId) => (
                    <button
                      key={schoolId}
                      onClick={() => handleSchoolIdSelect(schoolId)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none"
                    >
                      {schoolId}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading transactions</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => loadTransactions()}
                    className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <SortButton field="collect_id">Collect ID</SortButton>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <SortButton field="school_id">School ID</SortButton>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <SortButton field="gateway">Gateway</SortButton>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <SortButton field="order_amount">Order Amount</SortButton>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <SortButton field="transaction_amount">Transaction Amount</SortButton>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <SortButton field="status">Status</SortButton>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <SortButton field="custom_order_id">Custom Order ID</SortButton>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr 
                      key={transaction.collect_id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-200 dark:hover:shadow-gray-800 transition-all duration-300 ease-in-out transform hover:scale-[1.01]"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.collect_id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.school_id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.gateway}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(transaction.order_amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(transaction.transaction_amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{transaction.custom_order_id}</span>
                          <button
                            onClick={() => copyToClipboard(transaction.custom_order_id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                disabled={!pagination.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{' '}
                  <span className="font-medium">
                    {((pagination.currentPage - 1) * rowsPerPage) + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * rowsPerPage, pagination.totalCount)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalCount}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination({ ...pagination, currentPage: page })}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.currentPage
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900 dark:border-primary-700 dark:text-primary-200'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
