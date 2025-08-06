import { create } from 'zustand';
import { supabase, Campaign, Contact } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

export interface CampaignData {
  id: string;
  name: string;
  sent: number;
  opened: number;
  replied: number;
  date: string;
  status: string;
  responseRate: number;
}

export interface ActivityData {
  date: string;
  messages: number;
  responses: number;
  meetings: number;
}

export interface OrganizationMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalContacts: number;
  totalMessagesSent: number;
  averageResponseRate: number;
}

interface AnalyticsStore {
  metrics: DashboardMetric[];
  campaignData: CampaignData[];
  activityData: ActivityData[];
  organizationMetrics: OrganizationMetrics | null;
  isLoading: boolean;
  lastUpdated: Date;
  fetchData: (organizationId: string) => Promise<void>;
  refreshData: (organizationId: string) => void;
}

// Real Supabase data fetchers
const fetchOrganizationMetrics = async (organizationId: string): Promise<OrganizationMetrics> => {
  try {
    // Get dashboard metrics using the database function
    const { data, error } = await supabase
      .rpc('get_organization_dashboard_metrics', { org_id: organizationId });

    if (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return fallback data
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalContacts: 0,
        totalMessagesSent: 0,
        averageResponseRate: 0,
      };
    }

    return data[0] || {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalContacts: 0,
      totalMessagesSent: 0,
      averageResponseRate: 0,
    };
  } catch (error) {
    console.error('Error in fetchOrganizationMetrics:', error);
    return {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalContacts: 0,
      totalMessagesSent: 0,
      averageResponseRate: 0,
    };
  }
};

const fetchCampaignData = async (organizationId: string): Promise<CampaignData[]> => {
  try {
    const { data, error } = await supabase
      .from('campaign_performance_summary')
      .select('*')
      .eq('organization_id', organizationId)
      .order('sent_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching campaign data:', error);
      return [];
    }

    return data.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      sent: campaign.sent_count || 0,
      opened: campaign.opened_count || 0,
      replied: campaign.replied_count || 0,
      date: new Date().toISOString().split('T')[0],
      status: campaign.status || 'active',
      responseRate: campaign.response_rate || 0,
    }));
  } catch (error) {
    console.error('Error in fetchCampaignData:', error);
    return [];
  }
};

const fetchActivityData = async (organizationId: string): Promise<ActivityData[]> => {
  try {
    // Get messages from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('messages')
      .select(`
        created_at,
        conversations!inner(organization_id)
      `)
      .eq('conversations.organization_id', organizationId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching activity data:', error);
      return [];
    }

    // Group messages by date
    const messagesByDate = data.reduce((acc, message) => {
      const date = message.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { messages: 0, responses: 0, meetings: 0 };
      }
      acc[date].messages += 1;
      // Simulate response tracking based on message content
      if (message.role === 'user') {
        acc[date].responses += 1;
      }
      return acc;
    }, {} as Record<string, { messages: number; responses: number; meetings: number }>);

    // Generate array for last 30 days
    const activityData: ActivityData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      activityData.push({
        date: dateStr,
        messages: messagesByDate[dateStr]?.messages || 0,
        responses: messagesByDate[dateStr]?.responses || 0,
        meetings: messagesByDate[dateStr]?.meetings || 0,
      });
    }

    return activityData;
  } catch (error) {
    console.error('Error in fetchActivityData:', error);
    return [];
  }
};

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  metrics: [],
  campaignData: [],
  activityData: [],
  organizationMetrics: null,
  isLoading: false,
  lastUpdated: new Date(),

  fetchData: async (organizationId: string) => {
    set({ isLoading: true });
    
    try {
      const [orgMetrics, campaigns, activity] = await Promise.all([
        fetchOrganizationMetrics(organizationId),
        fetchCampaignData(organizationId),
        fetchActivityData(organizationId),
      ]);

      // Generate dashboard metrics from the data
      const metrics: DashboardMetric[] = [
        {
          id: 'total-contacts',
          title: 'Total Contacts',
          value: orgMetrics.totalContacts,
          change: 12.5, // TODO: Calculate actual change
          trend: 'up',
          period: 'vs last month'
        },
        {
          id: 'response-rate',
          title: 'Response Rate',
          value: `${orgMetrics.averageResponseRate.toFixed(1)}%`,
          change: -2.1, // TODO: Calculate actual change
          trend: 'down',
          period: 'vs last month'
        },
        {
          id: 'active-campaigns',
          title: 'Active Campaigns',
          value: orgMetrics.activeCampaigns,
          change: 28.6, // TODO: Calculate actual change
          trend: 'up',
          period: 'this month'
        },
        {
          id: 'messages-sent',
          title: 'Messages Sent',
          value: orgMetrics.totalMessagesSent,
          change: 15.3, // TODO: Calculate actual change
          trend: 'up',
          period: 'this month'
        }
      ];

      set({
        metrics,
        campaignData: campaigns,
        activityData: activity,
        organizationMetrics: orgMetrics,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      set({ isLoading: false });
    }
  },

  refreshData: (organizationId: string) => {
    get().fetchData(organizationId);
  },
}));

// Main hook that components will use
export const useAnalytics = () => {
  const { organization } = useAuth();
  const store = useAnalyticsStore();

  useEffect(() => {
    if (organization?.id && (!store.lastUpdated || Date.now() - store.lastUpdated.getTime() > 300000)) {
      store.fetchData(organization.id);
    }
  }, [organization?.id, store]);

  const analytics = {
    totalContacts: store.organizationMetrics?.totalContacts || 0,
    responseRate: store.organizationMetrics?.averageResponseRate || 0,
    openRate: 67.8, // TODO: Add open rate tracking
    activeCampaigns: store.organizationMetrics?.activeCampaigns || 0,
    totalCampaigns: store.organizationMetrics?.totalCampaigns || 0,
    connectionRate: 23.1, // TODO: Add connection rate tracking
    messagesSent: store.organizationMetrics?.totalMessagesSent || 0,
    repliesReceived: store.activityData.reduce((sum, day) => sum + day.responses, 0),
  };

  const chartData = store.activityData.map(d => ({ name: d.date, value: d.responses }));
  
  const campaignMetrics = store.campaignData.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status as 'active' | 'paused' | 'completed',
    sent: campaign.sent,
    opened: campaign.opened,
    replied: campaign.replied,
    connected: Math.floor(campaign.replied * 0.6),
    responseRate: campaign.responseRate,
    startDate: campaign.date,
  }));

  return {
    analytics,
    chartData,
    campaignMetrics,
    refreshData: () => organization?.id && store.refreshData(organization.id),
    isLoading: store.isLoading,
  };
};