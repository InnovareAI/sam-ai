import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Star,
  Download,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Brain,
  Database,
  MessageSquare,
  BarChart3,
  Globe,
  Package,
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch,
  Award,
  Sparkles,
  Filter,
  ChevronRight,
  Heart,
  Share2,
  Code,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface MCPMarketplaceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'data' | 'ai' | 'automation' | 'communication' | 'analytics' | 'storage' | 'security' | 'productivity';
  developer: {
    name: string;
    verified: boolean;
    avatar?: string;
  };
  version: string;
  downloads: number;
  rating: number;
  reviews: number;
  pricing: 'free' | 'freemium' | 'paid' | 'enterprise';
  monthlyPrice?: number;
  features: string[];
  requirements?: string[];
  lastUpdated: string;
  installed: boolean;
  trending: boolean;
  featured: boolean;
  capabilities: number;
  integrations: string[];
  tags: string[];
}

// Mock MCP Marketplace data - in production this would come from an API
const MARKETPLACE_ITEMS: MCPMarketplaceItem[] = [
  {
    id: 'apify-pro',
    name: 'Apify Web Scraper Pro',
    description: 'Advanced web scraping with AI-powered data extraction. Scrape any website, extract structured data, and monitor changes.',
    icon: '🕷️',
    category: 'data',
    developer: {
      name: 'Apify',
      verified: true,
    },
    version: '2.4.1',
    downloads: 45230,
    rating: 4.8,
    reviews: 892,
    pricing: 'freemium',
    monthlyPrice: 49,
    features: [
      'LinkedIn profile scraping',
      'Company website extraction',
      'Competitor monitoring',
      'Real-time alerts',
      'API access',
      'Scheduled scraping',
    ],
    lastUpdated: '2 days ago',
    installed: false,
    trending: true,
    featured: true,
    capabilities: 15,
    integrations: ['Zapier', 'Make', 'n8n', 'Slack'],
    tags: ['scraping', 'data-extraction', 'linkedin', 'automation'],
  },
  {
    id: 'perplexity-ai',
    name: 'Perplexity AI Search',
    description: 'Real-time AI-powered search with citations. Get accurate, up-to-date information with source verification.',
    icon: '🔮',
    category: 'ai',
    developer: {
      name: 'Perplexity',
      verified: true,
    },
    version: '1.2.0',
    downloads: 28450,
    rating: 4.9,
    reviews: 567,
    pricing: 'freemium',
    monthlyPrice: 20,
    features: [
      'Real-time web search',
      'Academic citations',
      'Multi-model AI',
      'Source verification',
      'Follow-up questions',
    ],
    lastUpdated: '1 week ago',
    installed: false,
    trending: true,
    featured: false,
    capabilities: 8,
    integrations: ['OpenAI', 'Claude', 'Gemini'],
    tags: ['ai', 'search', 'research', 'citations'],
  },
  {
    id: 'brightdata-collector',
    name: 'Bright Data Collector',
    description: 'Enterprise-grade data collection with residential proxies. Extract data from any source at scale.',
    icon: '🌐',
    category: 'data',
    developer: {
      name: 'Bright Data',
      verified: true,
    },
    version: '3.1.5',
    downloads: 12340,
    rating: 4.7,
    reviews: 234,
    pricing: 'paid',
    monthlyPrice: 500,
    features: [
      'Residential proxies',
      'Data collector IDE',
      'CAPTCHA solving',
      'JavaScript rendering',
      'Geo-targeting',
      'Compliance tools',
    ],
    lastUpdated: '3 days ago',
    installed: false,
    trending: false,
    featured: true,
    capabilities: 20,
    integrations: ['AWS', 'Google Cloud', 'Azure'],
    tags: ['proxies', 'enterprise', 'data-collection', 'compliance'],
  },
  {
    id: 'clay-enrichment',
    name: 'Clay Data Enrichment',
    description: 'All-in-one data enrichment platform. Find emails, enrich leads, and build targeted lists with 50+ data providers.',
    icon: '🎯',
    category: 'data',
    developer: {
      name: 'Clay',
      verified: true,
    },
    version: '2.0.3',
    downloads: 34560,
    rating: 4.9,
    reviews: 678,
    pricing: 'paid',
    monthlyPrice: 149,
    features: [
      '50+ data providers',
      'Waterfall enrichment',
      'AI research agent',
      'Email finder',
      'Company enrichment',
      'Custom workflows',
    ],
    lastUpdated: '1 day ago',
    installed: true,
    trending: true,
    featured: false,
    capabilities: 25,
    integrations: ['Salesforce', 'HubSpot', 'Outreach', 'Apollo'],
    tags: ['enrichment', 'leads', 'sales', 'email-finder'],
  },
  {
    id: 'langchain-tools',
    name: 'LangChain Tools',
    description: 'Build AI agents with 100+ tools. Connect LLMs to APIs, databases, and custom functions.',
    icon: '🔗',
    category: 'ai',
    developer: {
      name: 'LangChain',
      verified: true,
    },
    version: '0.1.42',
    downloads: 89230,
    rating: 4.6,
    reviews: 1234,
    pricing: 'free',
    features: [
      'Chain composition',
      'Memory management',
      'Tool calling',
      'Agent execution',
      'Vector stores',
      'Prompt templates',
    ],
    lastUpdated: '4 days ago',
    installed: false,
    trending: false,
    featured: false,
    capabilities: 100,
    integrations: ['OpenAI', 'Anthropic', 'Google', 'Hugging Face'],
    tags: ['ai', 'agents', 'llm', 'development'],
  },
  {
    id: 'phantom-automation',
    name: 'PhantomBuster',
    description: 'Cloud automation platform for sales and marketing. Automate LinkedIn, Twitter, Instagram, and more.',
    icon: '👻',
    category: 'automation',
    developer: {
      name: 'PhantomBuster',
      verified: true,
    },
    version: '4.2.1',
    downloads: 56780,
    rating: 4.5,
    reviews: 890,
    pricing: 'freemium',
    monthlyPrice: 69,
    features: [
      'LinkedIn automation',
      'Email extraction',
      'Social media automation',
      'Cloud execution',
      'API webhooks',
      'Proxy rotation',
    ],
    lastUpdated: '1 week ago',
    installed: false,
    trending: false,
    featured: false,
    capabilities: 40,
    integrations: ['LinkedIn', 'Twitter', 'Instagram', 'Facebook'],
    tags: ['automation', 'social-media', 'linkedin', 'scraping'],
  },
  {
    id: 'supabase-vector',
    name: 'Supabase Vector Store',
    description: 'Open source vector database for AI applications. Store embeddings and perform similarity search at scale.',
    icon: '🗄️',
    category: 'storage',
    developer: {
      name: 'Supabase',
      verified: true,
    },
    version: '1.0.8',
    downloads: 23450,
    rating: 4.8,
    reviews: 345,
    pricing: 'freemium',
    monthlyPrice: 25,
    features: [
      'pgvector extension',
      'Embeddings storage',
      'Similarity search',
      'Real-time sync',
      'Row level security',
      'Edge functions',
    ],
    lastUpdated: '5 days ago',
    installed: false,
    trending: true,
    featured: false,
    capabilities: 12,
    integrations: ['OpenAI', 'Cohere', 'Hugging Face'],
    tags: ['vector', 'database', 'ai', 'embeddings'],
  },
  {
    id: 'browserbase',
    name: 'Browserbase',
    description: 'Headless browser infrastructure for automation. Run Puppeteer and Playwright at scale in the cloud.',
    icon: '🌏',
    category: 'automation',
    developer: {
      name: 'Browserbase',
      verified: false,
    },
    version: '1.5.2',
    downloads: 8900,
    rating: 4.7,
    reviews: 123,
    pricing: 'freemium',
    monthlyPrice: 99,
    features: [
      'Headless browsers',
      'Session recording',
      'Stealth mode',
      'Proxy support',
      'Parallel execution',
      'Debug tools',
    ],
    lastUpdated: '2 weeks ago',
    installed: false,
    trending: false,
    featured: false,
    capabilities: 15,
    integrations: ['Puppeteer', 'Playwright', 'Selenium'],
    tags: ['browser', 'automation', 'testing', 'scraping'],
  },
];

export const MCPMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [items, setItems] = useState<MCPMarketplaceItem[]>(MARKETPLACE_ITEMS);
  const [filteredItems, setFilteredItems] = useState<MCPMarketplaceItem[]>(MARKETPLACE_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MCPMarketplaceItem | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Apply filters
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Pricing filter
    if (selectedPricing !== 'all') {
      filtered = filtered.filter(item => item.pricing === selectedPricing);
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, selectedPricing, items]);

  const handleInstall = async (item: MCPMarketplaceItem) => {
    setIsInstalling(true);
    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update item status
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, installed: true } : i
      ));
      
      toast({
        title: 'Installation Successful',
        description: `${item.name} has been installed and is ready to use`,
      });
      
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: 'Installation Failed',
        description: 'Failed to install the MCP server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data': return <Database className="h-4 w-4" />;
      case 'ai': return <Brain className="h-4 w-4" />;
      case 'automation': return <Zap className="h-4 w-4" />;
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'storage': return <Package className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'productivity': return <Clock className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getPricingBadge = (pricing: string, price?: number) => {
    switch (pricing) {
      case 'free':
        return <Badge variant="secondary">Free</Badge>;
      case 'freemium':
        return <Badge variant="outline">Freemium</Badge>;
      case 'paid':
        return <Badge>${price}/mo</Badge>;
      case 'enterprise':
        return <Badge variant="default">Enterprise</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">MCP Marketplace</h2>
          <p className="text-muted-foreground">
            Discover and install MCP servers to extend Sam AI's capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <GitBranch className="h-4 w-4 mr-2" />
            Submit MCP
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Docs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">Total MCPs</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">1.2M</div>
                <p className="text-xs text-muted-foreground">Total Installs</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">892</div>
                <p className="text-xs text-muted-foreground">Developers</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">4.7</div>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search MCP servers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Featured Section */}
      {selectedCategory === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Featured MCPs
            </h3>
            <Button variant="ghost" size="sm">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filteredItems.filter(item => item.featured).slice(0, 3).map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{item.icon}</div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {item.name}
                          {item.developer.verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          by {item.developer.name}
                        </CardDescription>
                      </div>
                    </div>
                    {getPricingBadge(item.pricing, item.monthlyPrice)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {item.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {item.downloads.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={item.installed ? 'secondary' : 'default'}
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.installed ? 'Installed' : 'Install'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {selectedCategory === 'all' ? 'All MCPs' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} MCPs`}
          </h3>
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} results
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {item.name}
                        {item.developer.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        {item.trending && (
                          <Badge variant="secondary" className="ml-2">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        by {item.developer.name} • v{item.version}
                      </CardDescription>
                    </div>
                  </div>
                  {getPricingBadge(item.pricing, item.monthlyPrice)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {item.rating} ({item.reviews})
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {item.downloads.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {item.capabilities} capabilities
                    </div>
                  </div>
                  {item.installed && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Installation Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{selectedItem.icon}</div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl flex items-center gap-2">
                      {selectedItem.name}
                      {selectedItem.developer.verified && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      by {selectedItem.developer.name} • v{selectedItem.version} • Updated {selectedItem.lastUpdated}
                    </DialogDescription>
                  </div>
                  {getPricingBadge(selectedItem.pricing, selectedItem.monthlyPrice)}
                </div>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{selectedItem.rating}</span>
                    <span className="text-muted-foreground">({selectedItem.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedItem.downloads.toLocaleString()} installs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedItem.capabilities} capabilities</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItem.features.map(feature => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedItem.integrations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Integrations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.integrations.map(integration => (
                        <Badge key={integration} variant="secondary">
                          {integration}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.requirements && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm text-yellow-900 dark:text-yellow-400">Requirements</h4>
                        <ul className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                          {selectedItem.requirements.map(req => (
                            <li key={req}>• {req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleInstall(selectedItem)}
                  disabled={isInstalling || selectedItem.installed}
                >
                  {isInstalling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Installing...
                    </>
                  ) : selectedItem.installed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Installed
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Install MCP
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};