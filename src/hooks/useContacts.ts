import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Contact } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ContactWithInteractions extends Contact {
  lastInteraction?: string;
  interactionCount: number;
  campaignCount: number;
}

export interface CreateContactData {
  full_name: string;
  email?: string;
  company?: string;
  title?: string;
  linkedin_url?: string;
  phone?: string;
  location?: any;
  tags?: string[];
  status?: string;
}

export interface UpdateContactData {
  full_name?: string;
  email?: string;
  company?: string;
  title?: string;
  linkedin_url?: string;
  phone?: string;
  location?: any;
  tags?: string[];
  status?: string;
  enrichment_data?: any;
  interaction_history?: any;
}

export interface ContactFilters {
  search?: string;
  status?: string;
  tags?: string[];
  company?: string;
  limit?: number;
  offset?: number;
}

export const useContacts = (filters?: ContactFilters) => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  // Fetch contacts with filters
  const {
    data: contactsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contacts', organization?.id, filters],
    queryFn: async (): Promise<{ contacts: ContactWithInteractions[]; total: number }> => {
      if (!organization?.id) return { contacts: [], total: 0 };

      let query = supabase
        .from('contacts')
        .select(`
          *,
          contact_interactions(count),
          campaign_contacts(count)
        `, { count: 'exact' })
        .eq('organization_id', organization.id);

      // Apply filters
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.company) {
        query = query.ilike('company', `%${filters.company}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      // Pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Ordering
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }

      const contacts: ContactWithInteractions[] = data.map(contact => {
        const interactionHistory = contact.interaction_history as any[] || [];
        
        return {
          ...contact,
          lastInteraction: interactionHistory.length > 0 
            ? interactionHistory[interactionHistory.length - 1]?.date 
            : undefined,
          interactionCount: interactionHistory.length,
          campaignCount: contact.campaign_contacts?.[0]?.count || 0,
        };
      });

      return { contacts, total: count || 0 };
    },
    enabled: !!organization?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const contacts = contactsData?.contacts || [];
  const totalContacts = contactsData?.total || 0;

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (contactData: CreateContactData): Promise<Contact> => {
      if (!organization?.id) {
        throw new Error('No organization selected');
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          organization_id: organization.id,
          status: contactData.status || 'active',
          tags: contactData.tags || [],
          enrichment_data: {},
          interaction_history: [],
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', organization?.id] });
      toast({
        title: 'Contact Created',
        description: 'The contact has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Contact',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContactData }): Promise<Contact> => {
      const { data: updatedData, error } = await supabase
        .from('contacts')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', organization?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        throw error;
      }

      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', organization?.id] });
      toast({
        title: 'Contact Updated',
        description: 'The contact has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Contact',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string): Promise<void> => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('organization_id', organization?.id);

      if (error) {
        console.error('Error deleting contact:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', organization?.id] });
      toast({
        title: 'Contact Deleted',
        description: 'The contact has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Deleting Contact',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk operations
  const bulkUpdateContactsMutation = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<UpdateContactData> }): Promise<void> => {
      const { error } = await supabase
        .from('contacts')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)
        .eq('organization_id', organization?.id);

      if (error) {
        console.error('Error bulk updating contacts:', error);
        throw error;
      }
    },
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', organization?.id] });
      toast({
        title: 'Contacts Updated',
        description: `${ids.length} contacts have been updated successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Contacts',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Contact actions
  const createContact = (data: CreateContactData) => {
    createContactMutation.mutate(data);
  };

  const updateContact = (id: string, data: UpdateContactData) => {
    updateContactMutation.mutate({ id, data });
  };

  const deleteContact = (id: string) => {
    deleteContactMutation.mutate(id);
  };

  const bulkUpdateContacts = (ids: string[], data: Partial<UpdateContactData>) => {
    bulkUpdateContactsMutation.mutate({ ids, data });
  };

  const addTagToContact = (id: string, tag: string) => {
    const contact = contacts.find(c => c.id === id);
    if (contact && !contact.tags.includes(tag)) {
      updateContact(id, { tags: [...contact.tags, tag] });
    }
  };

  const removeTagFromContact = (id: string, tag: string) => {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      updateContact(id, { tags: contact.tags.filter(t => t !== tag) });
    }
  };

  return {
    contacts,
    totalContacts,
    isLoading: isLoading || createContactMutation.isPending || updateContactMutation.isPending,
    error,
    refetch,
    createContact,
    updateContact,
    deleteContact,
    bulkUpdateContacts,
    addTagToContact,
    removeTagFromContact,
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending,
    isBulkUpdating: bulkUpdateContactsMutation.isPending,
  };
};

// Hook for contact statistics
export const useContactStats = () => {
  const { contacts, isLoading } = useContacts();
  
  const stats = {
    total: contacts.length,
    active: contacts.filter(c => c.status === 'active').length,
    inactive: contacts.filter(c => c.status === 'inactive').length,
    companies: new Set(contacts.map(c => c.company).filter(Boolean)).size,
    withEmail: contacts.filter(c => c.email).length,
    withLinkedIn: contacts.filter(c => c.linkedin_url).length,
    withPhone: contacts.filter(c => c.phone).length,
    totalInteractions: contacts.reduce((sum, c) => sum + c.interactionCount, 0),
  };

  return { stats, isLoading };
};

// Hook for getting unique tags across all contacts
export const useContactTags = () => {
  const { contacts } = useContacts();
  
  const allTags = contacts.reduce((tags, contact) => {
    contact.tags.forEach(tag => tags.add(tag));
    return tags;
  }, new Set<string>());

  return Array.from(allTags).sort();
};