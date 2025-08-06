import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface RealtimeEvent {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: any;
  old_record?: any;
}

export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Handle contact changes
  const handleContactChange = useCallback((payload: any) => {
    const event: RealtimeEvent = {
      type: payload.eventType,
      table: "contacts",
      record: payload.new,
      old_record: payload.old,
    };
    
    // Invalidate contacts query to refetch
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
    
    // Show notification for important changes
    if (event.type === "INSERT") {
      toast({
        title: "New Contact Added",
        description: `${event.record.name} has been added to your contacts`,
      });
    } else if (event.type === "UPDATE" && event.record.status !== event.old_record?.status) {
      toast({
        title: "Contact Status Changed",
        description: `${event.record.name} status changed to ${event.record.status}`,
      });
    }
  }, [queryClient]);
  
  // Handle campaign changes
  const handleCampaignChange = useCallback((payload: any) => {
    const event: RealtimeEvent = {
      type: payload.eventType,
      table: "campaigns",
      record: payload.new,
      old_record: payload.old,
    };
    
    // Invalidate campaigns query
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    
    // Show notification for status changes
    if (event.type === "UPDATE" && event.record.status !== event.old_record?.status) {
      toast({
        title: "Campaign Status Update",
        description: `${event.record.name} is now ${event.record.status}`,
        variant: event.record.status === "Active" ? "default" : "secondary",
      });
    }
  }, [queryClient]);
  
  // Handle message changes
  const handleMessageChange = useCallback((payload: any) => {
    const event: RealtimeEvent = {
      type: payload.eventType,
      table: "messages",
      record: payload.new,
      old_record: payload.old,
    };
    
    // Invalidate messages query
    queryClient.invalidateQueries({ queryKey: ["messages"] });
    
    // Show notification for new messages
    if (event.type === "INSERT" && event.record.direction === "incoming") {
      toast({
        title: "New Message Received",
        description: `You have a new message from ${event.record.contact_name || "Unknown"}`,
      });
    }
  }, [queryClient]);
  
  // Handle analytics updates
  const handleAnalyticsChange = useCallback((payload: any) => {
    const event: RealtimeEvent = {
      type: payload.eventType,
      table: "analytics",
      record: payload.new,
      old_record: payload.old,
    };
    
    // Invalidate analytics/dashboard queries
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    
    // Update dashboard metrics in real-time
    if (event.type === "UPDATE") {
      // Optionally update specific UI elements without full refetch
      console.log("Analytics updated:", event.record);
    }
  }, [queryClient]);
  
  // Handle n8n workflow execution updates
  const handleWorkflowExecutionChange = useCallback((payload: any) => {
    const event: RealtimeEvent = {
      type: payload.eventType,
      table: "n8n_execution_logs",
      record: payload.new,
      old_record: payload.old,
    };
    
    // Invalidate workflow executions query
    queryClient.invalidateQueries({ queryKey: ["workflow-executions"] });
    
    // Show notification for execution status
    if (event.type === "INSERT") {
      const status = event.record.status;
      toast({
        title: "Workflow Execution",
        description: `Workflow ${event.record.workflow_id} ${status}`,
        variant: status === "error" ? "destructive" : "default",
      });
    }
  }, [queryClient]);
  
  useEffect(() => {
    if (!user) return;
    
    // Create subscription channels
    const contactsChannel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        handleContactChange
      )
      .subscribe();
    
    const campaignsChannel = supabase
      .channel('campaigns-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns'
        },
        handleCampaignChange
      )
      .subscribe();
    
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        handleMessageChange
      )
      .subscribe();
    
    const analyticsChannel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics'
        },
        handleAnalyticsChange
      )
      .subscribe();
    
    const workflowsChannel = supabase
      .channel('workflows-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'n8n_execution_logs'
        },
        handleWorkflowExecutionChange
      )
      .subscribe();
    
    // Cleanup function
    return () => {
      supabase.removeChannel(contactsChannel);
      supabase.removeChannel(campaignsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(analyticsChannel);
      supabase.removeChannel(workflowsChannel);
    };
  }, [
    user,
    handleContactChange,
    handleCampaignChange,
    handleMessageChange,
    handleAnalyticsChange,
    handleWorkflowExecutionChange
  ]);
  
  // Presence tracking for collaborative features
  const trackPresence = useCallback(async (status: string, metadata?: any) => {
    if (!user) return;
    
    const presenceChannel = supabase.channel('presence');
    
    await presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('Presence state:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe();
    
    // Track current user's presence
    await presenceChannel.track({
      user_id: user.id,
      status: status,
      online_at: new Date().toISOString(),
      ...metadata
    });
    
    return () => {
      presenceChannel.untrack();
    };
  }, [user]);
  
  // Broadcast events to other users
  const broadcast = useCallback(async (event: string, payload: any) => {
    const channel = supabase.channel('broadcasts');
    
    await channel.subscribe();
    
    channel.send({
      type: 'broadcast',
      event: event,
      payload: payload
    });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return {
    trackPresence,
    broadcast
  };
}

// Global subscription hook to be used in App.tsx
export function useGlobalRealtimeSubscriptions() {
  const { trackPresence } = useRealtimeSubscriptions();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Track user as online
    const cleanup = trackPresence('online', {
      page: window.location.pathname
    });
    
    // Track page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackPresence('away');
      } else {
        trackPresence('online', {
          page: window.location.pathname
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track before unload
    const handleBeforeUnload = () => {
      trackPresence('offline');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      cleanup?.then(fn => fn?.());
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, trackPresence]);
}