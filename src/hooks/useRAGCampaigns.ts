import { useState, useCallback } from 'react';
import { ragIntegration } from '@/lib/rag-integration';
import { toast } from '@/hooks/use-toast';

export interface RAGCampaignResult {
  messages: Array<{
    day: number;
    channel: 'linkedin' | 'email';
    subject?: string;
    content: string;
    reasoning: string;
    contextUsed: string[];
  }>;
  strategy: string;
  expectedOutcome: string;
}

export function useRAGCampaigns() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaign, setCampaign] = useState<RAGCampaignResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateCampaign = useCallback(async (
    targetDescription: string,
    prospects: any[],
    userId?: string
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Use demo user ID if not provided
      const effectiveUserId = userId || 'demo-user';
      
      // Generate campaign using RAG
      const result = await ragIntegration.generateSmartCampaign(
        effectiveUserId,
        targetDescription,
        prospects
      );
      
      setCampaign(result);
      
      toast({
        title: "Campaign Generated!",
        description: `Created a ${result.messages.length}-step campaign with ${result.expectedOutcome} expected response rate`,
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate campaign';
      setError(errorMessage);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const refineCampaign = useCallback(async (
    refinementPrompt: string,
    currentCampaign: RAGCampaignResult
  ) => {
    // This would send the refinement request to the AI
    // For now, we'll simulate a refinement
    setIsGenerating(true);
    
    try {
      // Simulate AI refinement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Modify campaign based on refinement type
      let refined = { ...currentCampaign };
      
      if (refinementPrompt.includes('aggressive')) {
        refined.messages = refined.messages.map(msg => ({
          ...msg,
          content: msg.content.replace('Worth', 'Let\'s schedule'),
          reasoning: msg.reasoning + ' (More direct approach)'
        }));
        refined.strategy = 'Aggressive ' + refined.strategy;
      } else if (refinementPrompt.includes('softer')) {
        refined.messages = refined.messages.map(msg => ({
          ...msg,
          content: msg.content.replace('Let\'s', 'Would you consider'),
          reasoning: msg.reasoning + ' (Softer tone)'
        }));
        refined.strategy = 'Gentle ' + refined.strategy;
      } else if (refinementPrompt.includes('more touchpoints')) {
        // Add an extra touchpoint
        refined.messages.push({
          day: 18,
          channel: 'linkedin',
          content: 'Hi {{firstName}}, one more thought about {{company}}...',
          reasoning: 'Additional touchpoint for persistence',
          contextUsed: ['Follow-up strategy']
        });
      }
      
      setCampaign(refined);
      
      toast({
        title: "Campaign Refined",
        description: "Your campaign has been updated based on your feedback",
      });
      
      return refined;
    } catch (err) {
      toast({
        title: "Refinement Failed",
        description: "Could not refine the campaign",
        variant: "destructive"
      });
      return currentCampaign;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const saveCampaign = useCallback(async (
    campaignName: string,
    campaignToSave: RAGCampaignResult
  ) => {
    try {
      // In a real app, this would save to Supabase
      console.log('Saving campaign:', campaignName, campaignToSave);
      
      toast({
        title: "Campaign Saved",
        description: `"${campaignName}" has been saved and is ready to launch`,
      });
      
      return true;
    } catch (err) {
      toast({
        title: "Save Failed",
        description: "Could not save the campaign",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const launchCampaign = useCallback(async (
    campaignToLaunch: RAGCampaignResult,
    prospects: any[]
  ) => {
    try {
      // In a real app, this would trigger the campaign execution
      console.log('Launching campaign for prospects:', prospects);
      
      toast({
        title: "Campaign Launched! 🚀",
        description: `Campaign is now running for ${prospects.length} prospects`,
      });
      
      return true;
    } catch (err) {
      toast({
        title: "Launch Failed",
        description: "Could not launch the campaign",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  return {
    isGenerating,
    campaign,
    error,
    generateCampaign,
    refineCampaign,
    saveCampaign,
    launchCampaign
  };
}