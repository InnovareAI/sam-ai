import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useRealtimeData = () => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!organization?.id) return;

    const setupRealtimeChannels = () => {
      // Clean up existing channels
      channelsRef.current.forEach(channel => channel.unsubscribe());
      channelsRef.current = [];

      // Campaign updates
      const campaignsChannel = supabase
        .channel('campaigns_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `organization_id=eq.${organization.id}`
        }, (payload) => {
          console.log('Campaign change:', payload);
          queryClient.invalidateQueries({ queryKey: ['campaigns', organization.id] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'Campaign Created',
              description: `Campaign "${(payload.new as any)?.name}" has been created.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: 'Campaign Updated',
              description: `Campaign "${(payload.new as any)?.name}" has been updated.`,
            });
          }
        })
        .subscribe();

      // Contact updates
      const contactsChannel = supabase
        .channel('contacts_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `organization_id=eq.${organization.id}`
        }, (payload) => {
          console.log('Contact change:', payload);
          queryClient.invalidateQueries({ queryKey: ['contacts', organization.id] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Contact',
              description: `Contact "${(payload.new as any)?.full_name}" has been added.`,
            });
          }
        })
        .subscribe();

      // Conversation updates
      const conversationsChannel = supabase
        .channel('conversations_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `organization_id=eq.${organization.id}`
        }, (payload) => {
          console.log('Conversation change:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations', organization.id] });
        })
        .subscribe();

      // Message updates
      const messagesChannel = supabase
        .channel('messages_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          console.log('Message change:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations', organization.id] });
          
          // Show notification for new assistant messages
          if (payload.eventType === 'INSERT' && (payload.new as any)?.role === 'assistant') {
            toast({
              title: 'New Message',
              description: 'Sam has responded to your message.',
            });
          }
        })
        .subscribe();

      // Analytics data updates (campaign performance, etc.)
      const analyticsChannel = supabase
        .channel('analytics_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns',
          filter: `organization_id=eq.${organization.id}`
        }, (payload) => {
          // Refresh analytics when campaign stats change
          queryClient.invalidateQueries({ queryKey: ['analytics', organization.id] });
        })
        .subscribe();

      channelsRef.current = [
        campaignsChannel,
        contactsChannel,
        conversationsChannel,
        messagesChannel,
        analyticsChannel
      ];
    };

    // Setup channels after a brief delay to ensure auth is ready
    const timeout = setTimeout(setupRealtimeChannels, 1000);

    return () => {
      clearTimeout(timeout);
      channelsRef.current.forEach(channel => channel.unsubscribe());
      channelsRef.current = [];
    };
  }, [organization?.id, queryClient]);

  // Function to manually refresh all data
  const refreshAllData = () => {
    if (!organization?.id) return;
    
    queryClient.invalidateQueries({ queryKey: ['campaigns', organization.id] });
    queryClient.invalidateQueries({ queryKey: ['contacts', organization.id] });
    queryClient.invalidateQueries({ queryKey: ['conversations', organization.id] });
    queryClient.invalidateQueries({ queryKey: ['analytics', organization.id] });
  };

  return {
    refreshAllData,
    isConnected: channelsRef.current.length > 0,
  };
};