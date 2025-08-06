import { supabase } from "@/integrations/supabase/client";
import CryptoJS from "crypto-js";

export interface GDPRRequest {
  id: string;
  userId: string;
  type: "access" | "deletion" | "portability" | "rectification";
  status: "pending" | "processing" | "completed" | "rejected";
  requestedAt: Date;
  completedAt?: Date;
  data?: any;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: string;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  version: string;
}

export class GDPRComplianceService {
  private encryptionKey: string;
  
  constructor() {
    // In production, this should come from a secure key management system
    this.encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key';
  }
  
  // Encrypt sensitive data
  encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }
  
  // Decrypt sensitive data
  decryptData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  // Hash data for anonymization
  hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
  
  // Process data access request (GDPR Article 15)
  async processAccessRequest(userId: string): Promise<any> {
    try {
      // Gather all user data from different tables
      const [
        userData,
        contacts,
        campaigns,
        messages,
        auditLogs
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('contacts').select('*').eq('created_by', userId),
        supabase.from('campaigns').select('*').eq('created_by', userId),
        supabase.from('messages').select('*').eq('sent_by', userId),
        supabase.from('audit_logs').select('*').eq('user_id', userId)
      ]);
      
      // Compile data export
      const dataExport = {
        personalData: userData.data,
        contacts: contacts.data || [],
        campaigns: campaigns.data || [],
        messages: messages.data || [],
        activityLogs: auditLogs.data || [],
        exportedAt: new Date().toISOString(),
        dataController: 'Sam AI Platform',
        purposes: [
          'Sales automation',
          'Contact management',
          'Campaign analytics',
          'Communication tracking'
        ]
      };
      
      // Log the access request
      await this.logGDPRRequest(userId, 'access', 'completed', dataExport);
      
      return dataExport;
    } catch (error) {
      console.error('Error processing access request:', error);
      throw error;
    }
  }
  
  // Process data deletion request (GDPR Article 17 - Right to be forgotten)
  async processDeleteRequest(userId: string): Promise<void> {
    try {
      // Start transaction
      const { error: deleteError } = await supabase.rpc('delete_user_data', {
        user_id: userId
      });
      
      if (deleteError) throw deleteError;
      
      // Log the deletion
      await this.logGDPRRequest(userId, 'deletion', 'completed');
      
    } catch (error) {
      console.error('Error processing deletion request:', error);
      throw error;
    }
  }
  
  // Process data portability request (GDPR Article 20)
  async processPortabilityRequest(userId: string): Promise<any> {
    try {
      const data = await this.processAccessRequest(userId);
      
      // Format data in machine-readable format (JSON)
      const portableData = {
        format: 'JSON',
        version: '1.0',
        created: new Date().toISOString(),
        data: data
      };
      
      // Log the request
      await this.logGDPRRequest(userId, 'portability', 'completed', portableData);
      
      return portableData;
    } catch (error) {
      console.error('Error processing portability request:', error);
      throw error;
    }
  }
  
  // Anonymize user data instead of deletion
  async anonymizeUserData(userId: string): Promise<void> {
    try {
      const anonymizedEmail = `anon_${this.hashData(userId)}@anonymous.local`;
      const anonymizedName = `Anonymous User ${Date.now()}`;
      
      // Update user profile with anonymized data
      await supabase
        .from('user_profiles')
        .update({
          email: anonymizedEmail,
          full_name: anonymizedName,
          first_name: 'Anonymous',
          last_name: 'User',
          avatar_url: null,
          bio: null,
          location: null,
          company: null,
          title: null
        })
        .eq('id', userId);
      
      // Anonymize contacts created by user
      await supabase
        .from('contacts')
        .update({
          email: supabase.sql`'anon_' || MD5(email) || '@anonymous.local'`,
          phone: null,
          linkedin: null,
          notes: '[Anonymized]'
        })
        .eq('created_by', userId);
      
    } catch (error) {
      console.error('Error anonymizing user data:', error);
      throw error;
    }
  }
  
  // Record consent
  async recordConsent(
    userId: string, 
    purpose: string, 
    granted: boolean,
    ipAddress?: string
  ): Promise<void> {
    try {
      await supabase
        .from('consent_records')
        .insert({
          user_id: userId,
          purpose: purpose,
          granted: granted,
          ip_address: ipAddress,
          version: '1.0',
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording consent:', error);
      throw error;
    }
  }
  
  // Check if user has given consent
  async hasConsent(userId: string, purpose: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('consent_records')
        .select('granted')
        .eq('user_id', userId)
        .eq('purpose', purpose)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      
      return data?.granted || false;
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }
  
  // Get data retention policy
  getRetentionPolicy() {
    return {
      contacts: '3 years',
      campaigns: '2 years',
      messages: '1 year',
      analytics: '2 years',
      auditLogs: '7 years',
      backups: '90 days'
    };
  }
  
  // Clean up old data based on retention policy
  async enforceRetentionPolicy(): Promise<void> {
    try {
      const now = new Date();
      
      // Delete old messages (1 year)
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      await supabase
        .from('messages')
        .delete()
        .lt('created_at', oneYearAgo.toISOString());
      
      // Delete old campaigns (2 years)
      const twoYearsAgo = new Date(now.setFullYear(now.getFullYear() - 2));
      await supabase
        .from('campaigns')
        .delete()
        .lt('created_at', twoYearsAgo.toISOString());
      
      // Archive old contacts (3 years)
      const threeYearsAgo = new Date(now.setFullYear(now.getFullYear() - 3));
      await supabase
        .from('contacts')
        .update({ archived: true })
        .lt('updated_at', threeYearsAgo.toISOString());
      
    } catch (error) {
      console.error('Error enforcing retention policy:', error);
      throw error;
    }
  }
  
  // Log GDPR request
  private async logGDPRRequest(
    userId: string,
    type: string,
    status: string,
    data?: any
  ): Promise<void> {
    try {
      await supabase
        .from('gdpr_requests')
        .insert({
          user_id: userId,
          type: type,
          status: status,
          data: data,
          requested_at: new Date().toISOString(),
          completed_at: status === 'completed' ? new Date().toISOString() : null
        });
    } catch (error) {
      console.error('Error logging GDPR request:', error);
    }
  }
  
  // Generate privacy policy
  generatePrivacyPolicy() {
    return {
      lastUpdated: new Date().toISOString(),
      dataController: 'Sam AI Platform',
      contactEmail: 'privacy@sam-ai.com',
      dataProcessed: [
        'Name and contact information',
        'Email communications',
        'Campaign performance data',
        'Usage analytics',
        'IP addresses and device information'
      ],
      purposes: [
        'Providing sales automation services',
        'Improving platform features',
        'Customer support',
        'Legal compliance',
        'Security and fraud prevention'
      ],
      legalBasis: [
        'Contractual necessity',
        'Legitimate interests',
        'Legal obligations',
        'User consent'
      ],
      dataRetention: this.getRetentionPolicy(),
      userRights: [
        'Right to access',
        'Right to rectification',
        'Right to erasure',
        'Right to data portability',
        'Right to object',
        'Right to restrict processing'
      ],
      security: [
        'Encryption at rest and in transit',
        'Regular security audits',
        'Access controls and authentication',
        'Incident response procedures'
      ]
    };
  }
}