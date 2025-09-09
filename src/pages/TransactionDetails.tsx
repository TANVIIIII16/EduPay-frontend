import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { transactionService } from '../services/api';
import type { Transaction, TransactionResponse, FilterOptions, SortOptions, PaginationOptions } from '../types';

const TransactionDetails: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSchoolIds, setAvailableSchoolIds] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page') || '1'),
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [filters, setFilters] = useState<FilterOptions>({
    search: searchParams.get('search') || ''
  });

  const [sort] = useState<SortOptions>({
    field: 'payment_time',
    direction: 'desc'
  });

  const [paginationOptions] = useState<PaginationOptions>({
    page: 1,
    limit: 1000
  });

  const updateURLParams = (newFilters: FilterOptions, newPagination: any) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('search', newFilters.search);
    if (newPagination.currentPage > 1) params.set('page', newPagination.currentPage.toString());
    
    setSearchParams(params);
  };

  const fetchTransactions = async () => {
    if (!filters.search || (filters.search || '').trim() === '') {
      setTransactions([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response: TransactionResponse = await transactionService.getAllTransactions(
        {
          page: pagination.currentPage,
          limit: paginationOptions.limit
        },
        sort,
        filters
      );

      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      setTransactions([]);
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

  useEffect(() => {
    fetchTransactions();
  }, [pagination.currentPage, sort, filters]);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    const newFilters = { ...filters, search: searchValue };
    const newPagination = { ...pagination, currentPage: 1 };
    setFilters(newFilters);
    setPagination(newPagination);
    setShowDropdown(searchValue.length > 0);
    updateURLParams(newFilters, newPagination);
  };

  const handleSchoolIdSelect = (schoolId: string) => {
    const newFilters = { ...filters, search: schoolId };
    const newPagination = { ...pagination, currentPage: 1 };
    setFilters(newFilters);
    setPagination(newPagination);
    setShowDropdown(false);
    setShowAllDropdown(false);
    updateURLParams(newFilters, newPagination);
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            School Transactions
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search and view transactions across all schools
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="relative max-w-md search-container">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={handleSearch}
            onFocus={() => setShowDropdown((filters.search || '').length > 0)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Search by school ID..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {Boolean((filters.search || '').trim()) && (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Transactions
              {pagination.totalCount > 0 && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({pagination.totalCount} total)
                </span>
              )}
            </h3>
            {loading && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                Loading...
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="px-6 py-4">
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try searching with different keywords or check your search terms.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Collect ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        School ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Gateway
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transaction Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Custom Order ID
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
                          ₹{transaction.order_amount}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{transaction.transaction_amount}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'Success' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : transaction.status === 'Failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="font-mono">{transaction.custom_order_id}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      )}
    </div>
  );
};

export default TransactionDetails;
