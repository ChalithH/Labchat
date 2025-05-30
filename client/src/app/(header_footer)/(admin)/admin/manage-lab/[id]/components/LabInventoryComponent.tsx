"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Tag, Package, AlertCircle, Search, Filter, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import api from '@/lib/api';
import { 
  GlobalItem, 
  ItemTag, 
  LabInventoryItem, 
  CreateLabInventoryItemRequest, 
  UpdateLabInventoryItemRequest,
  CreateTagRequest 
} from './LabInventoryTypes';

interface LabInventoryComponentProps {
  labId: number;
}

// Validation state interface
interface ValidationErrors {
  currentStock?: string;
  minStock?: string;
}

// Sort and filter types
type SortOption = 'name' | 'lowStockPercent' | 'highStockPercent' | 'location';
type FilterOption = 'all' | 'lowStock' | 'normalStock';

export default function LabInventoryComponent({ labId }: LabInventoryComponentProps) {
  // State for lab inventory items
  const [labInventoryItems, setLabInventoryItems] = useState<LabInventoryItem[]>([]);
  const [globalItems, setGlobalItems] = useState<GlobalItem[]>([]);
  const [availableTags, setAvailableTags] = useState<ItemTag[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal states
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [isRemoveItemAlertOpen, setIsRemoveItemAlertOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  
  // Selected items for modals
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<LabInventoryItem | null>(null);
  const [selectedItemForRemoval, setSelectedItemForRemoval] = useState<LabInventoryItem | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<LabInventoryItem | null>(null);
  
  // Form states
  const [addItemForm, setAddItemForm] = useState<CreateLabInventoryItemRequest>({
    itemId: 0,
    location: '',
    itemUnit: '',
    currentStock: 0,
    minStock: 0,
    tagIds: []
  });
  
  const [editItemForm, setEditItemForm] = useState<UpdateLabInventoryItemRequest>({});
  const [selectedTagsForEdit, setSelectedTagsForEdit] = useState<number[]>([]);
  
  const [createTagForm, setCreateTagForm] = useState<CreateTagRequest>({
    name: '',
    tagDescription: ''
  });

  // Validation states
  const [addItemValidationErrors, setAddItemValidationErrors] = useState<ValidationErrors>({});
  const [editItemValidationErrors, setEditItemValidationErrors] = useState<ValidationErrors>({});

  // Search, sort, and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedTagFilters, setSelectedTagFilters] = useState<number[]>([]);

  // Validation function for non-negative integers
  const validateStockInput = (value: string): { isValid: boolean; errorMessage?: string; numericValue: number } => {
    // Allow empty string (default to 0)
    if (value === '') {
      return { isValid: true, numericValue: 0 };
    }
    
    // Check if valid non-negative integer
    const numericValue = parseInt(value, 10);
    
    // Check for non-numeric/negative values
    if (isNaN(numericValue) || numericValue < 0) {
      return { 
        isValid: false, 
        errorMessage: 'Please enter a non-negative whole number (0 or greater)', 
        numericValue: 0 
      };
    }
    
    // Check if the string contains decimal points or other invalid characters
    if (value.includes('.') || value.includes('-') || value.includes('+') || value.includes('e') || value.includes('E')) {
      return { 
        isValid: false, 
        errorMessage: 'Please enter a non-negative whole number (0 or greater)', 
        numericValue: 0 
      };
    }
    
    // Check if the parsed value matches the original string
    if (value !== numericValue.toString() && value !== '0') {
      return { 
        isValid: false, 
        errorMessage: 'Please enter a non-negative whole number (0 or greater)', 
        numericValue: 0 
      };
    }
    
    return { isValid: true, numericValue };
  };

  // Handle stock input change for add item form
  const handleAddItemStockChange = (field: 'currentStock' | 'minStock', value: string) => {
    const validation = validateStockInput(value);
    
    // Update form state
    setAddItemForm(prev => ({
      ...prev,
      [field]: validation.numericValue
    }));
    
    // Update validation errors
    setAddItemValidationErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? undefined : validation.errorMessage
    }));
  };

  // Handle stock input change for edit item form
  const handleEditItemStockChange = (field: 'currentStock' | 'minStock', value: string) => {
    const validation = validateStockInput(value);
    
    // Update form state
    setEditItemForm(prev => ({
      ...prev,
      [field]: validation.numericValue
    }));
    
    // Update validation errors
    setEditItemValidationErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? undefined : validation.errorMessage
    }));
  };

  // Prevent invalid characters being input
  const handleStockKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    
    if ([8, 9, 27, 13, 37, 38, 39, 40, 46].includes(e.keyCode) ||
        
        (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode))) {
      return;
    }
    
    // Prevent non-numeric characters
    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  // Handle paste events to validate pasted content
  const handleStockPaste = (e: React.ClipboardEvent<HTMLInputElement>, field: 'currentStock' | 'minStock', isEditForm = false) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const validation = validateStockInput(pastedText);
    
    if (validation.isValid) {
      if (isEditForm) {
        handleEditItemStockChange(field, pastedText);
      } else {
        handleAddItemStockChange(field, pastedText);
      }
    }
  };

  // Check if edit form has any changes
  const hasEditFormChanges = (): boolean => {
    if (!selectedItemForEdit) return false;
    
    
    const hasBasicChanges = 
      editItemForm.location !== selectedItemForEdit.location ||
      editItemForm.itemUnit !== selectedItemForEdit.itemUnit ||
      editItemForm.currentStock !== selectedItemForEdit.currentStock ||
      editItemForm.minStock !== selectedItemForEdit.minStock;
    
    
    const originalTagIds = selectedItemForEdit.itemTags.map(tag => tag.id).sort();
    const currentTagIds = [...selectedTagsForEdit].sort();
    const hasTagChanges = 
      originalTagIds.length !== currentTagIds.length ||
      originalTagIds.some((id, index) => id !== currentTagIds[index]);
    
    return hasBasicChanges || hasTagChanges;
  };

  // Filter and sort inventory items
  const getFilteredAndSortedItems = (): LabInventoryItem[] => {
    let filteredItems = [...labInventoryItems];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredItems = filteredItems.filter(item => 
        item.item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.itemUnit.toLowerCase().includes(query) ||
        item.itemTags.some(tag => tag.name.toLowerCase().includes(query))
      );
    }

    // Apply stock level filter
    if (filterBy === 'lowStock') {
      filteredItems = filteredItems.filter(item => item.currentStock <= item.minStock);
    } else if (filterBy === 'normalStock') {
      filteredItems = filteredItems.filter(item => item.currentStock > item.minStock);
    }

    // Apply tag filters
    if (selectedTagFilters.length > 0) {
      filteredItems = filteredItems.filter(item => 
        selectedTagFilters.some(tagId => 
          item.itemTags.some(tag => tag.id === tagId)
        )
      );
    }

    // Apply sorting
    filteredItems.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.item.name.localeCompare(b.item.name);
        case 'lowStockPercent':
          // Sort by stock level relative to minimum (lowest first)
          const aRatio = a.currentStock / (a.minStock || 1);
          const bRatio = b.currentStock / (b.minStock || 1);
          return aRatio - bRatio;
        case 'highStockPercent':
          // Sort by stock level relative to maximum (highest first)
          const aRatioMax = a.currentStock / (a.minStock || 1);
          const bRatioMax = b.currentStock / (b.minStock || 1);
          return bRatioMax - aRatioMax;
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    return filteredItems;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterBy('all');
    setSelectedTagFilters([]);
    setSortBy('name');
  };

  // Get active filter count
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filterBy !== 'all') count++;
    if (selectedTagFilters.length > 0) count++;
    return count;
  };

  // Fetch functions
  const fetchLabInventory = useCallback(async () => {
    try {
      const response = await api.get(`/inventory/${labId}`);
      setLabInventoryItems(response.data);
    } catch (error) {
      console.error('Failed to fetch lab inventory:', error);
      toast.error('Failed to load lab inventory');
    }
  }, [labId]);

  const fetchGlobalItems = useCallback(async () => {
    try {
      const response = await api.get('/admin/get-all-items');
      setGlobalItems(response.data);
    } catch (error) {
      console.error('Failed to fetch global items:', error);
      toast.error('Failed to load global items');
    }
  }, []);

  const fetchAvailableTags = useCallback(async () => {
    try {
      const response = await api.get('/inventory/item-tags');
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      toast.error('Failed to load tags');
    }
  }, []);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLabInventory(),
        fetchGlobalItems(),
        fetchAvailableTags()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchLabInventory, fetchGlobalItems, fetchAvailableTags]);

  // Add item to lab
  const handleAddItem = async () => {
    if (!addItemForm.itemId || !addItemForm.location || !addItemForm.itemUnit) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (addItemValidationErrors.currentStock || addItemValidationErrors.minStock) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setActionLoading('add-item');
    try {
      await api.post(`/admin/lab/${labId}/inventory`, addItemForm);
      toast.success('Item added to lab inventory successfully');
      setIsAddItemModalOpen(false);
      setAddItemForm({
        itemId: 0,
        location: '',
        itemUnit: '',
        currentStock: 0,
        minStock: 0,
        tagIds: []
      });
      // Reset validation errors
      setAddItemValidationErrors({});
      await fetchLabInventory();
    } catch (error: any) {
      console.error('Failed to add item:', error);
      toast.error(error.response?.data?.error || 'Failed to add item to lab');
    } finally {
      setActionLoading(null);
    }
  };

  // Update lab inventory item
  const handleUpdateItem = async () => {
    if (!selectedItemForEdit) return;

    // Check for validation errors
    if (editItemValidationErrors.currentStock || editItemValidationErrors.minStock) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setActionLoading('update-item');
    try {
      await api.put(`/admin/lab/${labId}/inventory/${selectedItemForEdit.id}`, editItemForm);
      
      // Update tags if they changed
      const currentTagIds = selectedItemForEdit.itemTags.map(tag => tag.id);
      const tagsToAdd = selectedTagsForEdit.filter(tagId => !currentTagIds.includes(tagId));
      const tagsToRemove = currentTagIds.filter(tagId => !selectedTagsForEdit.includes(tagId));
      
      // Add new tags
      if (tagsToAdd.length > 0) {
        await api.post(`/admin/lab/${labId}/inventory/${selectedItemForEdit.id}/tags`, {
          tagIds: tagsToAdd
        });
      }
      
      // Remove tags
      for (const tagId of tagsToRemove) {
        await api.delete(`/admin/lab/${labId}/inventory/${selectedItemForEdit.id}/tags/${tagId}`);
      }

      const updatedTags = availableTags.filter(tag => selectedTagsForEdit.includes(tag.id));
      const updatedItem: LabInventoryItem = {
        ...selectedItemForEdit,
        location: editItemForm.location || selectedItemForEdit.location,
        itemUnit: editItemForm.itemUnit || selectedItemForEdit.itemUnit,
        currentStock: editItemForm.currentStock !== undefined ? editItemForm.currentStock : selectedItemForEdit.currentStock,
        minStock: editItemForm.minStock !== undefined ? editItemForm.minStock : selectedItemForEdit.minStock,
        itemTags: updatedTags,
        updatedAt: new Date().toISOString() // Update the timestamp
      };

      // Update the state
      setLabInventoryItems(prevItems => 
        prevItems.map(item => 
          item.id === selectedItemForEdit.id ? updatedItem : item
        )
      );

      toast.success('Item updated successfully');
      setIsEditItemModalOpen(false);
      setSelectedItemForEdit(null);
      setEditItemForm({});
      setSelectedTagsForEdit([]);
    } catch (error: any) {
      console.error('Failed to update item:', error);
      toast.error(error.response?.data?.error || 'Failed to update item');
    } finally {
      setActionLoading(null);
    }
  };

  // Remove item from lab
  const handleRemoveItem = async () => {
    if (!selectedItemForRemoval) return;

    setActionLoading('remove-item');
    try {
      await api.delete(`/admin/lab/${labId}/inventory/${selectedItemForRemoval.id}`);
      toast.success('Item removed from lab inventory');
      setIsRemoveItemAlertOpen(false);
      setSelectedItemForRemoval(null);
      await fetchLabInventory();
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      toast.error(error.response?.data?.error || 'Failed to remove item');
    } finally {
      setActionLoading(null);
    }
  };

  // Create new tag
  const handleCreateTag = async () => {
    if (!createTagForm.name.trim()) {
      toast.error('Tag name is required');
      return;
    }

    setActionLoading('create-tag');
    try {
      await api.post('/admin/tags', createTagForm);
      toast.success('Tag created successfully');
      setIsCreateTagModalOpen(false);
      setCreateTagForm({ name: '', tagDescription: '' });
      await fetchAvailableTags();
    } catch (error: any) {
      console.error('Failed to create tag:', error);
      toast.error(error.response?.data?.error || 'Failed to create tag');
    } finally {
      setActionLoading(null);
    }
  };

  // Get available global items (not already in lab)
  const getAvailableGlobalItems = () => {
    const labItemIds = labInventoryItems.map(item => item.item.id);
    return globalItems.filter(item => !labItemIds.includes(item.id));
  };

  const openEditModal = (item: LabInventoryItem) => {
    setSelectedItemForEdit(item);
    setEditItemForm({
      location: item.location,
      itemUnit: item.itemUnit,
      currentStock: item.currentStock,
      minStock: item.minStock
    });
    setSelectedTagsForEdit(item.itemTags.map(tag => tag.id));
    // Reset validation errors
    setEditItemValidationErrors({});
    setIsEditItemModalOpen(true);
  };

  const openRemoveModal = (item: LabInventoryItem) => {
    setSelectedItemForRemoval(item);
    setIsRemoveItemAlertOpen(true);
  };

  const openDetailsModal = (item: LabInventoryItem) => {
    setSelectedItemForDetails(item);
    setIsViewDetailsModalOpen(true);
  };

  // Get tags that are actually used in this lab's inventory
  const getLabTags = (): ItemTag[] => {
    const usedTagIds = new Set<number>();
    labInventoryItems.forEach(item => {
      item.itemTags.forEach(tag => {
        usedTagIds.add(tag.id);
      });
    });
    return availableTags.filter(tag => usedTagIds.has(tag.id));
  };

  // Quick action filters
  const applyQuickFilter = (action: 'lowStock' | 'clearAll') => {
    switch (action) {
      case 'lowStock':
        setFilterBy('lowStock');
        setSortBy('lowStockPercent');
        setSearchQuery('');
        setSelectedTagFilters([]);
        break;
      case 'clearAll':
        clearFilters();
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lab Inventory Management</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateTagModalOpen(true)}
            variant="outline"
            size="sm"
          >
            <Tag className="h-4 w-4 mr-2" />
            Create Tag
          </Button>
          <Button 
            onClick={() => {
              setIsAddItemModalOpen(true);
              // Reset validation errors when modal is opened
              setAddItemValidationErrors({});
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Search, Sort, and Filter Controls */}
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyQuickFilter('lowStock')}
            className="flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            Low Stock Items
          </Button>
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyQuickFilter('clearAll')}
              className="flex items-center gap-1 text-gray-500"
            >
              <X className="h-3 w-3" />
              Show All
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items, locations, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="lowStockPercent">Low Stock % (Most Urgent)</SelectItem>
              <SelectItem value="highStockPercent">High Stock % (Best Stocked)</SelectItem>
              <SelectItem value="location">Location (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          {/* Stock Level Filter */}
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="lowStock">Low Stock Only</SelectItem>
              <SelectItem value="normalStock">Normal Stock</SelectItem>
            </SelectContent>
          </Select>

          {/* Tag Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Tags
                {selectedTagFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                    {selectedTagFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {getLabTags().length > 0 ? (
                getLabTags().map((tag) => (
                  <DropdownMenuItem
                    key={tag.id}
                    className="flex items-center space-x-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      id={`filter-tag-${tag.id}`}
                      checked={selectedTagFilters.includes(tag.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTagFilters([...selectedTagFilters, tag.id]);
                        } else {
                          setSelectedTagFilters(selectedTagFilters.filter(id => id !== tag.id));
                        }
                      }}
                    />
                    <Label htmlFor={`filter-tag-${tag.id}`} className="text-sm cursor-pointer">
                      {tag.name}
                    </Label>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No tags in use for this lab
                </DropdownMenuItem>
              )}
              {selectedTagFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setSelectedTagFilters([])}
                    className="text-red-600"
                  >
                    Clear tag filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active:</span>
            
            {searchQuery.trim() && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs flex items-center gap-1 hover:bg-red-50 hover:border-red-200"
                onClick={() => setSearchQuery('')}
              >
                <span>"{searchQuery}"</span>
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {filterBy !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs flex items-center gap-1 hover:bg-red-50 hover:border-red-200"
                onClick={() => setFilterBy('all')}
              >
                <span>{filterBy === 'lowStock' ? 'Low Stock' : 'Normal Stock'}</span>
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {selectedTagFilters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs flex items-center gap-1 hover:bg-red-50 hover:border-red-200"
                onClick={() => setSelectedTagFilters([])}
              >
                <span>{selectedTagFilters.length} tag{selectedTagFilters.length > 1 ? 's' : ''}</span>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {getActiveFilterCount() > 0 ? (
            <span>
              Showing <span className="font-semibold">{getFilteredAndSortedItems().length}</span> matching items
              <span className="text-gray-500 ml-1">
                (of {labInventoryItems.length} total)
              </span>
            </span>
          ) : (
            <span>
              <span className="font-semibold">{labInventoryItems.length}</span> items in lab inventory
            </span>
          )}
        </div>
      </div>

      {/* Inventory Items Grid */}
      {labInventoryItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No items in lab inventory</h3>
            <p className="text-gray-500 text-center mb-4">
              Add global items to this lab's inventory to get started
            </p>
            <Button onClick={() => {
              setIsAddItemModalOpen(true);
              // Reset validation errors when modal is opened
              setAddItemValidationErrors({});
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : getFilteredAndSortedItems().length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No items match your filters</h3>
            <p className="text-gray-500 text-center mb-4">
              Try adjusting your search terms or clearing some filters
            </p>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {getFilteredAndSortedItems().map((item) => (
            <Card key={item.id} className="relative hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetailsModal(item)}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate mb-1">{item.item.name}</h3>
                    <p className="text-xs text-gray-600 truncate">{item.location}</p>
                  </div>
                  <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditModal(item)}
                      className="h-7 w-7 p-0"
                      title="Edit item"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => openRemoveModal(item)}
                      className="h-7 w-7 p-0"
                      title="Remove item"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Stock:</span>
                    <span className={`font-bold ${item.currentStock <= item.minStock ? 'text-red-600' : 'text-green-600'}`}>
                      {item.currentStock}
                    </span>
                    <span className="text-xs text-gray-400">/{item.minStock}</span>
                  </div>
                  {item.currentStock <= item.minStock && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">Low</span>
                    </div>
                  )}
                </div>
                
                {item.itemTags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {item.itemTags.slice(0, 1).map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs px-1 py-0">
                        {tag.name}
                      </Badge>
                    ))}
                    {item.itemTags.length > 1 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        +{item.itemTags.length - 1}
                      </Badge>
                    )}
                  </div>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-6 text-xs text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailsModal(item);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <Dialog open={isAddItemModalOpen} onOpenChange={(open) => {
        setIsAddItemModalOpen(open);
        if (!open) {
          setAddItemValidationErrors({});
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Item to Lab Inventory</DialogTitle>
            <DialogDescription>
              Select a global item and configure it for this lab
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="global-item">Global Item</Label>
              <Select 
                value={addItemForm.itemId?.toString() || ''} 
                onValueChange={(value) => setAddItemForm({...addItemForm, itemId: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a global item" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableGlobalItems().map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Shelf A1"
                  value={addItemForm.location}
                  onChange={(e) => setAddItemForm({...addItemForm, location: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="e.g., kg, liters, pieces"
                  value={addItemForm.itemUnit}
                  onChange={(e) => setAddItemForm({...addItemForm, itemUnit: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current-stock">Current Stock</Label>
                <Input
                  id="current-stock"
                  type="number"
                  min="0"
                  value={addItemForm.currentStock}
                  onChange={(e) => handleAddItemStockChange('currentStock', e.target.value)}
                  onKeyDown={handleStockKeyDown}
                  onPaste={(e) => handleStockPaste(e, 'currentStock')}
                  className={addItemValidationErrors.currentStock ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {addItemValidationErrors.currentStock && (
                  <p className="text-sm text-red-600">{addItemValidationErrors.currentStock}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="min-stock">Min Stock</Label>
                <Input
                  id="min-stock"
                  type="number"
                  min="0"
                  value={addItemForm.minStock}
                  onChange={(e) => handleAddItemStockChange('minStock', e.target.value)}
                  onKeyDown={handleStockKeyDown}
                  onPaste={(e) => handleStockPaste(e, 'minStock')}
                  className={addItemValidationErrors.minStock ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {addItemValidationErrors.minStock && (
                  <p className="text-sm text-red-600">{addItemValidationErrors.minStock}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Tags (Optional)</Label>
              <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={addItemForm.tagIds?.includes(tag.id)}
                      onCheckedChange={(checked) => {
                        const currentTags = addItemForm.tagIds || [];
                        if (checked) {
                          setAddItemForm({...addItemForm, tagIds: [...currentTags, tag.id]});
                        } else {
                          setAddItemForm({...addItemForm, tagIds: currentTags.filter(id => id !== tag.id)});
                        }
                      }}
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                      {tag.name}
                      {tag.description && <span className="text-gray-500"> - {tag.description}</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddItem}
              disabled={actionLoading === 'add-item'}
            >
              {actionLoading === 'add-item' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={isEditItemModalOpen} onOpenChange={(open) => {
        setIsEditItemModalOpen(open);
        if (!open) {
          setEditItemValidationErrors({});
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Lab Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details of "{selectedItemForEdit?.item.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editItemForm.location || ''}
                  onChange={(e) => setEditItemForm({...editItemForm, location: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={editItemForm.itemUnit || ''}
                  onChange={(e) => setEditItemForm({...editItemForm, itemUnit: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-current-stock">Current Stock</Label>
                <Input
                  id="edit-current-stock"
                  type="number"
                  min="0"
                  value={editItemForm.currentStock || ''}
                  onChange={(e) => handleEditItemStockChange('currentStock', e.target.value)}
                  onKeyDown={handleStockKeyDown}
                  onPaste={(e) => handleStockPaste(e, 'currentStock', true)}
                  className={editItemValidationErrors.currentStock ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {editItemValidationErrors.currentStock && (
                  <p className="text-sm text-red-600">{editItemValidationErrors.currentStock}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-min-stock">Min Stock</Label>
                <Input
                  id="edit-min-stock"
                  type="number"
                  min="0"
                  value={editItemForm.minStock || ''}
                  onChange={(e) => handleEditItemStockChange('minStock', e.target.value)}
                  onKeyDown={handleStockKeyDown}
                  onPaste={(e) => handleStockPaste(e, 'minStock', true)}
                  className={editItemValidationErrors.minStock ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {editItemValidationErrors.minStock && (
                  <p className="text-sm text-red-600">{editItemValidationErrors.minStock}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`edit-tag-${tag.id}`}
                      checked={selectedTagsForEdit.includes(tag.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTagsForEdit([...selectedTagsForEdit, tag.id]);
                        } else {
                          setSelectedTagsForEdit(selectedTagsForEdit.filter(id => id !== tag.id));
                        }
                      }}
                    />
                    <Label htmlFor={`edit-tag-${tag.id}`} className="text-sm">
                      {tag.name}
                      {tag.description && <span className="text-gray-500"> - {tag.description}</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateItem}
              disabled={actionLoading === 'update-item' || !hasEditFormChanges()}
            >
              {actionLoading === 'update-item' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tag Modal */}
      <Dialog open={isCreateTagModalOpen} onOpenChange={setIsCreateTagModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Create a new global tag that can be used across all labs
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="e.g., Hazardous, Fragile"
                value={createTagForm.name}
                onChange={(e) => setCreateTagForm({...createTagForm, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-description">Description (Optional)</Label>
              <Input
                id="tag-description"
                placeholder="Brief description of the tag"
                value={createTagForm.tagDescription}
                onChange={(e) => setCreateTagForm({...createTagForm, tagDescription: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTagModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTag}
              disabled={actionLoading === 'create-tag'}
            >
              {actionLoading === 'create-tag' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Item Alert Dialog */}
      <AlertDialog open={isRemoveItemAlertOpen} onOpenChange={setIsRemoveItemAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item from Lab</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{selectedItemForRemoval?.item.name}" from this lab's inventory? 
              This action cannot be undone and will remove all associated tags for this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveItem}
              disabled={actionLoading === 'remove-item'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading === 'remove-item' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Modal */}
      <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItemForDetails?.item.name}
            </DialogTitle>
            <DialogDescription>
              Detailed information for this inventory item
            </DialogDescription>
          </DialogHeader>
          
          {selectedItemForDetails && (
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Location</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span className="text-sm">{selectedItemForDetails.location}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span className="text-sm">{selectedItemForDetails.itemUnit}</span>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Current Stock</Label>
                  <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                    <span className={`text-lg font-bold ${selectedItemForDetails.currentStock <= selectedItemForDetails.minStock ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedItemForDetails.currentStock}
                    </span>
                    <span className="text-sm text-gray-500">{selectedItemForDetails.itemUnit}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Minimum Stock</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-lg font-semibold text-gray-700">
                      {selectedItemForDetails.minStock}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">{selectedItemForDetails.itemUnit}</span>
                  </div>
                </div>
              </div>

              {/* Stock Status Alert */}
              {selectedItemForDetails.currentStock <= selectedItemForDetails.minStock && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <span className="text-sm font-medium text-red-800">Low Stock Alert</span>
                    <p className="text-sm text-red-600">Current stock is at or below the minimum threshold</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Tags</Label>
                {selectedItemForDetails.itemTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                    {selectedItemForDetails.itemTags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-sm">
                        {tag.name}
                        {tag.description && (
                          <span className="ml-1 text-gray-500">- {tag.description}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-500">No tags assigned</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsViewDetailsModalOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsViewDetailsModalOpen(false);
                if (selectedItemForDetails) {
                  openEditModal(selectedItemForDetails);
                }
              }}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 