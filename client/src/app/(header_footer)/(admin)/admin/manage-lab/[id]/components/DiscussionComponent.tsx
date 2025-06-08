"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Shield, Eye, MessageSquare } from 'lucide-react';
import { toast } from "sonner";
import api from '@/lib/api';

interface Discussion {
  id: number;
  labId: number;
  name: string;
  description: string | null;
  visiblePermission: number | null;
  postPermission: number | null;
}

interface DiscussionComponentProps {
  labId: number;
}

export default function DiscussionComponent({ labId }: DiscussionComponentProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visiblePermission: '',
    postPermission: ''
  });

  const isDefaultCategory = (name: string) => {
    return ['Announcements', 'General'].includes(name);
  };

  const fetchDiscussions = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/discussion/categories/lab/${labId}`);
      // Sort discussions: default categories first, then by ID
      const sortedDiscussions = response.data.sort((a: Discussion, b: Discussion) => {
        const aIsDefault = isDefaultCategory(a.name);
        const bIsDefault = isDefaultCategory(b.name);
        
        // Defaults come first
        if (aIsDefault && !bIsDefault) return -1;
        if (!aIsDefault && bIsDefault) return 1;
        
        // Order defaults (Announcements -> General)
        if (aIsDefault && bIsDefault) {
          return a.name === 'Announcements' ? -1 : 1;
        }
        
        // Otherwise sort by creation order
        return a.id - b.id;
      });
      setDiscussions(sortedDiscussions);
    } catch (error: any) {
      console.error('Error fetching discussions:', error);
      toast.error("Failed to load discussion categories");
    } finally {
      setLoading(false);
    }
  }, [labId]);

  // Fetch discussions when component mounts
  useEffect(() => {
    if (labId) {
      fetchDiscussions();
    }
  }, [labId, fetchDiscussions]);

  const handleCreateDiscussion = async () => {
    // Check for duplicate names
    const nameToCheck = formData.name.trim();
    const isDuplicate = discussions.some(d => 
      d.name.toLowerCase() === nameToCheck.toLowerCase()
    );

    if (isDuplicate) {
      toast.error(`A category named '${nameToCheck}' already exists in this lab`);
      return;
    }

    try {
      const payload = {
        labId,
        name: nameToCheck,
        description: formData.description.trim() || null,
        visiblePermission: formData.visiblePermission ? parseInt(formData.visiblePermission) : null,
        postPermission: formData.postPermission ? parseInt(formData.postPermission) : null
      };

      await api.post('/admin/create-discussion-category', payload);
      toast.success("Discussion category created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchDiscussions();
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      toast.error(error.response?.data?.error || "Failed to create discussion category");
    }
  };

  const handleUpdateDiscussion = async () => {
    if (!selectedDiscussion) return;

    const nameToCheck = formData.name.trim();
    
    // Check for duplicate names only if the name is being changed
    if (nameToCheck.toLowerCase() !== selectedDiscussion.name.toLowerCase()) {
      const isDuplicate = discussions.some(d => 
        d.id !== selectedDiscussion.id && 
        d.name.toLowerCase() === nameToCheck.toLowerCase()
      );

      if (isDuplicate) {
        toast.error(`A category named '${nameToCheck}' already exists in this lab`);
        return;
      }
    }

    try {
      const payload = {
        name: nameToCheck,
        description: formData.description.trim() || null,
        visiblePermission: formData.visiblePermission ? parseInt(formData.visiblePermission) : null,
        postPermission: formData.postPermission ? parseInt(formData.postPermission) : null
      };

      await api.put(`/admin/lab/${labId}/update-discussion/${selectedDiscussion.id}`, payload);
      toast.success("Discussion category updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
      fetchDiscussions();
    } catch (error: any) {
      console.error('Error updating discussion:', error);
      toast.error(error.response?.data?.error || "Failed to update discussion category");
    }
  };

  const openEditDialog = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setFormData({
      name: discussion.name,
      description: discussion.description || '',
      visiblePermission: discussion.visiblePermission?.toString() || '',
      postPermission: discussion.postPermission?.toString() || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      visiblePermission: '',
      postPermission: ''
    });
    setSelectedDiscussion(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Discussion Categories</CardTitle>
            <CardDescription>
              Manage discussion categories for this lab. Default categories (Announcements, General) cannot be renamed.
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Discussion Category</DialogTitle>
                <DialogDescription>
                  Add a new discussion category to this lab.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Research Papers, Equipment Issues"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="visiblePermission">
                    Visible Permission Level
                    <span className="text-xs text-muted-foreground ml-2">(Leave empty for all members)</span>
                  </Label>
                  <Input
                    id="visiblePermission"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.visiblePermission}
                    onChange={(e) => setFormData({ ...formData, visiblePermission: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postPermission">
                    Post Permission Level
                    <span className="text-xs text-muted-foreground ml-2">(Leave empty for all members)</span>
                  </Label>
                  <Input
                    id="postPermission"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.postPermission}
                    onChange={(e) => setFormData({ ...formData, postPermission: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDiscussion} disabled={!formData.name.trim()}>
                  Create Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {discussions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No discussion categories found.</p>
            <p className="text-sm mt-2">Create your first category to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discussions.map((discussion) => (
                <TableRow key={discussion.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {discussion.name}
                      {isDefaultCategory(discussion.name) && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="text-sm text-muted-foreground truncate">
                      {discussion.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="h-3 w-3" />
                        <span>View: {discussion.visiblePermission !== null ? discussion.visiblePermission : 'All'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Shield className="h-3 w-3" />
                        <span>Post: {discussion.postPermission !== null ? discussion.postPermission : 'All'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(discussion)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Discussion Category</DialogTitle>
              <DialogDescription>
                Update the settings for this discussion category.
                {selectedDiscussion && isDefaultCategory(selectedDiscussion.name) && (
                  <span className="block mt-2 text-amber-600">
                    Note: The name of default categories cannot be changed.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={selectedDiscussion !== null && isDefaultCategory(selectedDiscussion.name)}
                  placeholder="Category name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-visiblePermission">
                  Visible Permission Level
                  <span className="text-xs text-muted-foreground ml-2">(Leave empty for all members)</span>
                </Label>
                <Input
                  id="edit-visiblePermission"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.visiblePermission}
                  onChange={(e) => setFormData({ ...formData, visiblePermission: e.target.value })}
                  placeholder="0-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-postPermission">
                  Post Permission Level
                  <span className="text-xs text-muted-foreground ml-2">(Leave empty for all members)</span>
                </Label>
                <Input
                  id="edit-postPermission"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.postPermission}
                  onChange={(e) => setFormData({ ...formData, postPermission: e.target.value })}
                  placeholder="0-100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDiscussion}>
                Update Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 