"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Mail, Phone, MessageCircle } from 'lucide-react';
import { toast } from "sonner";
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ContactType } from '../types/profile.types';
import EditContact from './EditContact';
import AddContact from './AddContact';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContactTableProps {
  contacts: ContactType[];
  is_users_profile: boolean;
  firstName: string;
}

const getContactIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'phone':
      return <Phone className="h-4 w-4" />;
    case 'other':
      return <MessageCircle className="h-4 w-4" />;
    default:
      return <MessageCircle className="h-4 w-4" />;
  }
};

const getContactTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'email':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'phone':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'other':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function ContactTable({ 
  contacts, 
  is_users_profile, 
  firstName 
}: ContactTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<ContactType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = (contact: ContactType) => {
    setDeletingContact(contact);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingContact) return;

    setLoading(true);
    try {
      await api.delete(`/profile/delete/${deletingContact.id}`);
      toast.success('Contact deleted successfully');
      router.refresh();
      setDeleteDialogOpen(false);
      setDeletingContact(null);
    } catch (error: any) {
      console.error('Failed to delete contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setLoading(false);
    }
  };

  if (!is_users_profile) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl mb-1 font-semibold barlow-font flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Contact Details
        </h1>
        {is_users_profile && <AddContact />}
      </div>

      {/* Table */}
      <div className="overflow-hidden border rounded-lg">
        {/* Mobile view */}
        <div className="lg:hidden divide-y">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    {getContactIcon(contact.type)}
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <Badge className={getContactTypeColor(contact.type)}>
                      {contact.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-sm mb-4">
                <p><span className="font-medium">Contact:</span> {contact.info}</p>
                {contact.useCase && (
                  <p><span className="font-medium">Use Case:</span> {contact.useCase}</p>
                )}
              </div>

              {is_users_profile && (
                <div className="flex space-x-2">
                  <EditContact contact={contact} />
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(contact)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Use Case
                </th>
                {is_users_profile && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mr-3">
                        {getContactIcon(contact.type)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getContactTypeColor(contact.type)}>
                      {contact.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{contact.info}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {contact.useCase || 'No use case specified'}
                    </span>
                  </td>
                  {is_users_profile && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <EditContact contact={contact} />
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(contact)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contacts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {firstName} has no contacts
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingContact && (
            <div className="py-4">
              <div className="p-4 bg-red-50 rounded-md border border-red-200">
                <p className="text-sm font-medium text-red-900">
                  Contact: {deletingContact.name}
                </p>
                <p className="text-sm text-red-800 mt-1">
                  {deletingContact.type}: {deletingContact.info}
                </p>
                {deletingContact.useCase && (
                  <p className="text-sm text-red-800 mt-1">
                    Use Case: {deletingContact.useCase}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}