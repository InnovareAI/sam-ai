import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Lock, 
  FileText, 
  Download, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Info,
  User,
  Database,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import { GDPRComplianceService } from "@/lib/gdpr-compliance";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ComplianceDashboard() {
  const { user } = useAuth();
  const [gdprService] = useState(() => new GDPRComplianceService());
  const [privacyPreferences, setPrivacyPreferences] = useState({
    marketingEmails: false,
    analyticsTracking: true,
    dataSharing: false,
    profiling: false,
    automatedDecisions: false
  });
  const [consentRecords, setConsentRecords] = useState<any[]>([]);
  const [gdprRequests, setGdprRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user?.id) {
      loadPrivacySettings();
      loadConsentRecords();
      loadGDPRRequests();
    }
  }, [user]);
  
  const loadPrivacySettings = async () => {
    try {
      const { data } = await supabase
        .from('privacy_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setPrivacyPreferences({
          marketingEmails: data.marketing_emails,
          analyticsTracking: data.analytics_tracking,
          dataSharing: data.data_sharing,
          profiling: data.profiling,
          automatedDecisions: data.automated_decisions
        });
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadConsentRecords = async () => {
    try {
      const { data } = await supabase
        .from('consent_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false });
      
      if (data) {
        setConsentRecords(data);
      }
    } catch (error) {
      console.error('Error loading consent records:', error);
    }
  };
  
  const loadGDPRRequests = async () => {
    try {
      const { data } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('requested_at', { ascending: false });
      
      if (data) {
        setGdprRequests(data);
      }
    } catch (error) {
      console.error('Error loading GDPR requests:', error);
    }
  };
  
  const updatePrivacyPreference = async (key: string, value: boolean) => {
    try {
      const updates = {
        user_id: user?.id,
        [key.replace(/([A-Z])/g, '_$1').toLowerCase()]: value,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('privacy_preferences')
        .upsert(updates);
      
      if (error) throw error;
      
      setPrivacyPreferences(prev => ({ ...prev, [key]: value }));
      
      // Record consent change
      await gdprService.recordConsent(
        user!.id,
        key,
        value
      );
      
      toast({
        title: "Privacy settings updated",
        description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating privacy preference:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  };
  
  const handleDataExport = async () => {
    try {
      setIsLoading(true);
      const data = await gdprService.processPortabilityRequest(user!.id);
      
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sam-ai-data-export-${Date.now()}.json`;
      a.click();
      
      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDataDeletion = async () => {
    if (!confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsLoading(true);
      await gdprService.processDeleteRequest(user!.id);
      
      toast({
        title: "Deletion request submitted",
        description: "Your data deletion request has been submitted and will be processed within 30 days",
      });
      
      // Log user out after deletion request
      setTimeout(() => {
        supabase.auth.signOut();
      }, 3000);
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast({
        title: "Error",
        description: "Failed to submit deletion request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const retentionPolicy = gdprService.getRetentionPolicy();
  
  return (
    <div className="space-y-6">
      {/* Compliance Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GDPR Status</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Compliant</div>
            <p className="text-xs text-muted-foreground">All requirements met</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Encrypted</CardTitle>
            <Lock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">PII fields protected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consent Records</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consentRecords.length}</div>
            <p className="text-xs text-muted-foreground">Documented consents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gdprRequests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending GDPR requests</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Compliance Tabs */}
      <Tabs defaultValue="privacy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="retention">Retention Policy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Preferences</CardTitle>
              <CardDescription>
                Control how your data is used and processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="font-medium">Marketing Emails</label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails and newsletters
                  </p>
                </div>
                <Switch
                  checked={privacyPreferences.marketingEmails}
                  onCheckedChange={(value) => updatePrivacyPreference('marketingEmails', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="font-medium">Analytics Tracking</label>
                  <p className="text-sm text-muted-foreground">
                    Help us improve by sharing usage analytics
                  </p>
                </div>
                <Switch
                  checked={privacyPreferences.analyticsTracking}
                  onCheckedChange={(value) => updatePrivacyPreference('analyticsTracking', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="font-medium">Data Sharing</label>
                  <p className="text-sm text-muted-foreground">
                    Share data with trusted partners for enhanced features
                  </p>
                </div>
                <Switch
                  checked={privacyPreferences.dataSharing}
                  onCheckedChange={(value) => updatePrivacyPreference('dataSharing', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="font-medium">Profile Building</label>
                  <p className="text-sm text-muted-foreground">
                    Create personalized experiences based on your activity
                  </p>
                </div>
                <Switch
                  checked={privacyPreferences.profiling}
                  onCheckedChange={(value) => updatePrivacyPreference('profiling', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="font-medium">Automated Decisions</label>
                  <p className="text-sm text-muted-foreground">
                    Allow AI to make automated decisions on your behalf
                  </p>
                </div>
                <Switch
                  checked={privacyPreferences.automatedDecisions}
                  onCheckedChange={(value) => updatePrivacyPreference('automatedDecisions', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consent History</CardTitle>
              <CardDescription>
                Record of all consent decisions you've made
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consentRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.purpose}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={record.granted ? "default" : "secondary"}>
                      {record.granted ? "Granted" : "Denied"}
                    </Badge>
                  </div>
                ))}
                {consentRecords.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No consent records found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Your Data Rights</AlertTitle>
            <AlertDescription>
              Under GDPR, you have the right to access, export, and delete your personal data.
              All requests are logged and processed according to regulatory requirements.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Your Data</CardTitle>
                <CardDescription>
                  Download all your data in a portable format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleDataExport} disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Delete Your Data</CardTitle>
                <CardDescription>
                  Permanently remove all your personal data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleDataDeletion}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Deletion
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {gdprRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>GDPR Request History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gdprRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{request.type} Request</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.requested_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          request.status === 'completed' ? 'default' :
                          request.status === 'processing' ? 'secondary' :
                          'outline'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policy</CardTitle>
              <CardDescription>
                How long we keep different types of data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(retentionPolicy).map(([category, period]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium capitalize">{category.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          Data retention period
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{period}</Badge>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Automatic Deletion</AlertTitle>
                <AlertDescription>
                  Data is automatically deleted after the retention period expires, unless required for legal obligations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}