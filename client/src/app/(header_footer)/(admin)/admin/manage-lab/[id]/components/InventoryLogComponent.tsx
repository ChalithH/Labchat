"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Filter, ChevronLeft, ChevronRight, X, RefreshCw, Clock, User, Package, ArrowUpDown } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import api from '@/lib/api';
import {
  InventoryLogEntry,
  InventoryLogResponse,
  InventoryLogFilters,
  InventoryAction,
  InventorySource,
  User as UserType,
  Member
} from './InventoryLogTypes';

interface InventoryLogComponentProps {
  labId: number;
}

const ACTION_LABELS = {
  [InventoryAction.STOCK_ADD]: 'Stock Added',
  [InventoryAction.STOCK_REMOVE]: 'Stock Removed',
  [InventoryAction.STOCK_UPDATE]: 'Stock Updated',
  [InventoryAction.LOCATION_CHANGE]: 'Location Changed',
  [InventoryAction.MIN_STOCK_UPDATE]: 'Min Stock Updated',
  [InventoryAction.ITEM_ADDED]: 'Item Added',
  [InventoryAction.ITEM_REMOVED]: 'Item Removed',
  [InventoryAction.ITEM_UPDATE]: 'Item Updated'
};

const SOURCE_LABELS = {
  [InventorySource.ADMIN_PANEL]: 'Admin Panel',
  [InventorySource.LAB_INTERFACE]: 'Lab Interface',
  [InventorySource.API_DIRECT]: 'API Direct'
  // Bulk import not implemented (todo in future?)
};

const ACTION_COLORS = {
  [InventoryAction.STOCK_ADD]: 'bg-green-100 text-green-800 border-green-200',
  [InventoryAction.STOCK_REMOVE]: 'bg-red-100 text-red-800 border-red-200',
  [InventoryAction.STOCK_UPDATE]: 'bg-blue-100 text-blue-800 border-blue-200',
  [InventoryAction.LOCATION_CHANGE]: 'bg-purple-100 text-purple-800 border-purple-200',
  [InventoryAction.MIN_STOCK_UPDATE]: 'bg-orange-100 text-orange-800 border-orange-200',
  [InventoryAction.ITEM_ADDED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [InventoryAction.ITEM_REMOVED]: 'bg-gray-100 text-gray-800 border-gray-200',
  [InventoryAction.ITEM_UPDATE]: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

export default function InventoryLogComponent({ labId }: InventoryLogComponentProps) {
  const [logs, setLogs] = useState<InventoryLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [hideDeletedItems, setHideDeletedItems] = useState(false);

  const [filters, setFilters] = useState<InventoryLogFilters>({
    action: 'all',
    source: 'all',
    startDate: '',
    endDate: '',
    userId: 'all',
    memberId: 'all'
  });

  const limit = 25;

  const fetchLogs = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * limit;
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      // Add filters if they're not default values
      if (filters.action !== 'all') queryParams.append('action', filters.action);
      if (filters.source !== 'all') queryParams.append('source', filters.source);
      if (filters.startDate) queryParams.append('startDate', new Date(filters.startDate).toISOString());
      if (filters.endDate) queryParams.append('endDate', new Date(filters.endDate).toISOString());
      if (filters.userId !== 'all') queryParams.append('userId', filters.userId);
      if (filters.memberId !== 'all') queryParams.append('memberId', filters.memberId);

      const response = await api.get(`/admin/lab/${labId}/inventory-logs?${queryParams.toString()}`);
      const data: InventoryLogResponse = response.data;

      setLogs(data.logs);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setHasNextPage(data.hasNextPage);
      setHasPrevPage(data.hasPrevPage);
    } catch (error: any) {
      console.error('Error fetching inventory logs:', error);
      setError(error.response?.data?.error || 'Failed to fetch inventory logs');
      toast.error('Failed to fetch inventory logs');
    } finally {
      setIsLoading(false);
    }
  }, [labId, filters, limit]);

  const fetchLabUsers = useCallback(async () => {
    try {
      const response = await api.get(`/lab/getMembers/${labId}`);
      const labMembersData = response.data;
      
      // Extract unique users from lab members
      const users: UserType[] = [];
      const members: Member[] = [];
      
      if (labMembersData && Array.isArray(labMembersData)) {
        labMembersData.forEach((member: any) => {
          if (member) {
            users.push({
              id: member.id, // user ID
              firstName: member.firstName,
              lastName: member.lastName,
              displayName: member.displayName
            });
            members.push({
              id: member.memberID, // lab member ID
              user: {
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                displayName: member.displayName
              }
            });
          }
        });
      }

      setAvailableUsers(users);
      setAvailableMembers(members);
    } catch (error) {
      console.error('Error fetching lab users:', error);
    }
  }, [labId]);

  useEffect(() => {
    fetchLogs(1);
    fetchLabUsers();
  }, [fetchLogs, fetchLabUsers]);

  const handleFilterChange = (key: keyof InventoryLogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchLogs(1);
  };

  const handleClearFilters = () => {
    setFilters({
      action: 'all',
      source: 'all',
      startDate: '',
      endDate: '',
      userId: 'all',
      memberId: 'all'
    });
    setCurrentPage(1);
    setTimeout(() => fetchLogs(1), 0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLogs(page);
  };

  const formatLogDetails = (log: InventoryLogEntry) => {
    const details: string[] = [];

    if (log.quantityChanged !== null) {
      details.push(`Quantity: ${log.quantityChanged > 0 ? '+' : ''}${log.quantityChanged}`);
    }

    if (log.previousValues && log.newValues) {
      Object.keys(log.newValues).forEach(key => {
        const oldValue = log.previousValues[key];
        const newValue = log.newValues[key];
        if (oldValue !== newValue) {
          details.push(`${key}: ${oldValue} → ${newValue}`);
        }
      });
    }

    return details.join(', ');
  };

  const getActorName = (log: InventoryLogEntry) => {
    if (log.member) {
      return log.member.user.displayName || `${log.member.user.firstName} ${log.member.user.lastName}`;
    }
    return log.user.displayName || `${log.user.firstName} ${log.user.lastName}`;
  };

  const getItemName = (log: InventoryLogEntry) => {
    // If item exists (not deleted), use it
    if (log.labInventoryItem?.item?.name) {
      return log.labInventoryItem.item.name;
    }
    
    // For deleted items, try get name from previousValues
    if (log.action === InventoryAction.ITEM_REMOVED && log.previousValues?.item?.name) {
      return `${log.previousValues.item.name} (Deleted)`;
    }
    
    // Fallback to any item name in previousValues
    if (log.previousValues?.itemName) {
      return `${log.previousValues.itemName} (Deleted)`;
    }
    
    return 'Unknown Item (Deleted)';
  };

  // Filter logs based on hideDeletedItems
  const displayedLogs = hideDeletedItems 
    ? logs.filter(log => log.labInventoryItem !== null)
    : logs;

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button onClick={() => fetchLogs(currentPage)} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filter toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Activity Log</h2>
          <p className="text-gray-600">Track all inventory changes for this lab</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hideDeletedItems"
              checked={hideDeletedItems}
              onChange={(e) => setHideDeletedItems(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hideDeletedItems" className="text-sm text-gray-700 whitespace-nowrap">
              Hide deleted item logs
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button onClick={() => fetchLogs(currentPage)} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Action Filter */}
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source Filter */}
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Filter */}
              <div className="space-y-2">
                <Label>User</Label>
                <Select value={filters.userId} onValueChange={(value) => handleFilterChange('userId', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.displayName || `${user.firstName} ${user.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date Filter */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              {/* End Date Filter */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApplyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {displayedLogs.length} of {totalCount} entries
        {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
      </div>

      {/* Logs Display */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading logs...</span>
            </div>
          ) : displayedLogs.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {hideDeletedItems && logs.length > 0 
                ? 'No active item logs to display. Uncheck "Hide deleted item logs" to see all logs.'
                : 'No inventory logs found for the selected filters.'}
            </div>
          ) : (
            <div className="divide-y">
              {displayedLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${ACTION_COLORS[log.action]} border`}>
                          {ACTION_LABELS[log.action]}
                        </Badge>
                        <Badge variant="outline">
                          {SOURCE_LABELS[log.source as keyof typeof SOURCE_LABELS] || 'Unknown Source'}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="h-4 w-4 mr-1" />
                          {getItemName(log)}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {getActorName(log)}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>

                        {formatLogDetails(log) && (
                          <div className="text-sm text-gray-700">
                            <strong>Changes:</strong> {formatLogDetails(log)}
                          </div>
                        )}

                        {log.reason && (
                          <div className="text-sm text-gray-600">
                            <strong>Reason:</strong> {log.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({totalCount} total entries)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 