import React, { useState } from 'react';
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Wand2, Settings, Zap, Brain, 
  Target, Users, Linkedin, Mail, MessageSquare,
  BarChart3, Play, ArrowRight
} from 'lucide-react';

// Import our campaign components
import { SamSmartCampaign } from '@/components/campaigns/SamSmartCampaign';
import { SamCampaignGenerator } from '@/components/campaigns/SamCampaignGenerator';
import { LinkedInEmailCampaign } from '@/components/campaigns/LinkedInEmailCampaign';
import { CampaignBuilder } from '@/components/campaigns/CampaignBuilder';
import { CampaignSequenceBuilder } from '@/components/campaigns/CampaignSequenceBuilder';

export default function CampaignHub() {
  const [isConversational, setIsConversational] = useState(false);
  const [activeTab, setActiveTab] = useState('smart');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <WorkspaceSidebar isConversational={isConversational} />
        <div className="flex-1 flex flex-col">
          <WorkspaceHeader 
            isConversational={isConversational}
            onToggleMode={setIsConversational}
          />
          
          <main className="flex-1 overflow-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Brain className="h-6 w-6" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    AI-Powered Campaign System
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-4">Campaign Command Center</h1>
                <p className="text-xl text-white/90 mb-6">
                  Let Sam AI create perfect campaigns using your business context, or build custom sequences
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <Target className="h-5 w-5" />
                    <span>Smart Targeting</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Users className="h-5 w-5" />
                    <span>Multi-Channel</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <BarChart3 className="h-5 w-5" />
                    <span>Real-time Analytics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                  <TabsTrigger value="smart" className="flex flex-col gap-1 py-3">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs">Smart Campaign</span>
                  </TabsTrigger>
                  <TabsTrigger value="generator" className="flex flex-col gap-1 py-3">
                    <Wand2 className="h-4 w-4" />
                    <span className="text-xs">AI Generator</span>
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex flex-col gap-1 py-3">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs">Templates</span>
                  </TabsTrigger>
                  <TabsTrigger value="builder" className="flex flex-col gap-1 py-3">
                    <Settings className="h-4 w-4" />
                    <span className="text-xs">Advanced</span>
                  </TabsTrigger>
                  <TabsTrigger value="sequence" className="flex flex-col gap-1 py-3">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs">Sequences</span>
                  </TabsTrigger>
                </TabsList>

                {/* Smart Campaign - RAG Powered */}
                <TabsContent value="smart" className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-purple-900">Sam knows your business</h3>
                        <p className="text-sm text-purple-700 mt-1">
                          Using your onboarding data (ICP, pain points, UVP, case studies), Sam creates 
                          perfectly personalized campaigns that resonate with your prospects.
                        </p>
                      </div>
                    </div>
                  </div>
                  <SamSmartCampaign />
                </TabsContent>

                {/* AI Generator - Natural Language */}
                <TabsContent value="generator" className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Wand2 className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Describe your campaign</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Just tell Sam what you need in plain English. Describe your target audience, 
                          goals, and preferred approach - Sam will handle the rest.
                        </p>
                      </div>
                    </div>
                  </div>
                  <SamCampaignGenerator />
                </TabsContent>

                {/* LinkedIn + Email Templates */}
                <TabsContent value="templates" className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="flex gap-2">
                        <Linkedin className="h-5 w-5 text-blue-600" />
                        <Mail className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">Proven campaign templates</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Choose from battle-tested templates for LinkedIn and Email. Each template 
                          is optimized for specific scenarios and industries.
                        </p>
                      </div>
                    </div>
                  </div>
                  <LinkedInEmailCampaign />
                </TabsContent>

                {/* Advanced Builder */}
                <TabsContent value="builder" className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-orange-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-orange-900">Full control mode</h3>
                        <p className="text-sm text-orange-700 mt-1">
                          Advanced campaign builder with complete control over timing, channels, 
                          follow-ups, and automation rules. Perfect for complex campaigns.
                        </p>
                      </div>
                    </div>
                  </div>
                  <CampaignBuilder />
                </TabsContent>

                {/* Sequence Builder */}
                <TabsContent value="sequence" className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-indigo-900">Visual sequence builder</h3>
                        <p className="text-sm text-indigo-700 mt-1">
                          Design complex multi-step sequences with conditional logic, A/B testing, 
                          and automatic follow-ups. See your entire campaign flow at a glance.
                        </p>
                      </div>
                    </div>
                  </div>
                  <CampaignSequenceBuilder />
                </TabsContent>
              </Tabs>

              {/* Quick Actions */}
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold mb-4">Ready to launch?</h3>
                <div className="flex gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => setActiveTab('smart')}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Let Sam Create a Campaign
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => setActiveTab('generator')}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Describe What You Need
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/campaigns'}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    View All Campaigns
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}