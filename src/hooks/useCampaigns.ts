import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Campaign } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface CampaignWithStats extends Campaign {
  contactCount: number;
  sent: number;
  opened: number;
  replied: number;
  connected: number;
  responseRate: number;
  progress: number;
  channels: string[];
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  settings?: any;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  settings?: any;
}

export const useCampaigns = () => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  // Fetch campaigns
  const {
    data: campaigns = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['campaigns', organization?.id],
    queryFn: async (): Promise<CampaignWithStats[]> => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_sequences(count),
          contact_lists(
            contact_list_contacts(count)
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }

      // Transform the data to match the expected interface
      return data.map((campaign): CampaignWithStats => {
        const stats = campaign.stats as any || {};
        const settings = campaign.settings as any || {};
        
        return {
          ...campaign,
          contactCount: stats.total_contacts || 0,
          sent: stats.sent_count || 0,
          opened: stats.opened_count || 0,
          replied: stats.replied_count || 0,
          connected: stats.connected_count || 0,
          responseRate: stats.response_rate || 0,
          progress: Math.min((stats.sent_count || 0) / Math.max(stats.total_contacts || 1, 1) * 100, 100),
          channels: settings.channels || ['email'],
        };
      });
    },
    enabled: !!organization?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: CreateCampaignData): Promise<Campaign> => {
      if (!organization?.id) {
        throw new Error('No organization selected');
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          organization_id: organization.id,
          created_by: organization.id, // TODO: Use actual user ID
          status: 'draft',
          settings: campaignData.settings || { channels: ['email'] },
          stats: {
            total_contacts: 0,
            sent_count: 0,
            opened_count: 0,
            replied_count: 0,
            response_rate: 0,
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', organization?.id] });
      toast({
        title: 'Campaign Created',
        description: 'Your campaign has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Campaign',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCampaignData }): Promise<Campaign> => {
      const { data: updatedData, error } = await supabase
        .from('campaigns')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', organization?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating campaign:', error);
        throw error;
      }

      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', organization?.id] });
      toast({
        title: 'Campaign Updated',
        description: 'Your campaign has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Campaign',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string): Promise<void> => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('organization_id', organization?.id);

      if (error) {
        console.error('Error deleting campaign:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', organization?.id] });
      toast({
        title: 'Campaign Deleted',
        description: 'The campaign has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Deleting Campaign',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Campaign actions
  const createCampaign = (data: CreateCampaignData) => {
    createCampaignMutation.mutate(data);
  };

  const updateCampaign = (id: string, data: UpdateCampaignData) => {
    updateCampaignMutation.mutate({ id, data });
  };

  const deleteCampaign = (id: string) => {
    deleteCampaignMutation.mutate(id);
  };

  const pauseCampaign = (id: string) => {
    updateCampaignMutation.mutate({ id, data: { status: 'paused' } });
  };

  const resumeCampaign = (id: string) => {
    updateCampaignMutation.mutate({ id, data: { status: 'active' } });
  };

  const duplicateCampaign = async (campaign: CampaignWithStats) => {
    const { id, created_at, updated_at, stats, ...campaignData } = campaign;
    createCampaignMutation.mutate({
      ...campaignData,
      name: `${campaign.name} (Copy)`,
      settings: campaign.settings,
    });
  };

  return {
    campaigns,
    isLoading: isLoading || createCampaignMutation.isPending || updateCampaignMutation.isPending,
    error,
    refetch,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    pauseCampaign,
    resumeCampaign,
    duplicateCampaign,
    isCreating: createCampaignMutation.isPending,
    isUpdating: updateCampaignMutation.isPending,
    isDeleting: deleteCampaignMutation.isPending,
  };
};

// Campaign statistics summary hook
export const useCampaignStats = () => {
  const { campaigns, isLoading } = useCampaigns();
  
  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalContacts: campaigns.reduce((sum, c) => sum + c.contactCount, 0),
    totalSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    totalReplied: campaigns.reduce((sum, c) => sum + c.replied, 0),
    averageResponseRate: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.responseRate, 0) / campaigns.length 
      : 0,
  };

  return { stats, isLoading };
};