import { supabase } from '@/lib/supabase';

// Test data insertion functions for development/testing
export const insertTestData = async (organizationId: string) => {
  try {
    console.log('Inserting test data for organization:', organizationId);

    // Insert test campaigns
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .upsert([
        {
          id: 'test-campaign-1',
          organization_id: organizationId,
          name: 'Q1 Enterprise Outreach',
          description: 'Targeting enterprise accounts for Q1 growth',
          type: 'multi-channel',
          status: 'active',
          created_by: organizationId,
          settings: {
            channels: ['email', 'linkedin'],
            daily_limit: 50,
            timezone: 'UTC'
          },
          stats: {
            total_contacts: 156,
            sent_count: 134,
            opened_count: 89,
            replied_count: 23,
            response_rate: 17.2
          },
          start_date: '2024-01-15',
          end_date: '2024-03-31'
        },
        {
          id: 'test-campaign-2',
          organization_id: organizationId,
          name: 'LinkedIn Lead Generation',
          description: 'Connect with decision makers on LinkedIn',
          type: 'linkedin-only',
          status: 'active',
          created_by: organizationId,
          settings: {
            channels: ['linkedin'],
            daily_limit: 25
          },
          stats: {
            total_contacts: 89,
            sent_count: 89,
            opened_count: 67,
            replied_count: 18,
            response_rate: 20.2
          },
          start_date: '2024-02-01',
          end_date: '2024-04-15'
        }
      ], {
        onConflict: 'id'
      });

    if (campaignError) {
      console.error('Error inserting campaigns:', campaignError);
    } else {
      console.log('Test campaigns inserted:', campaigns);
    }

    // Insert test contacts
    const { data: contacts, error: contactError } = await supabase
      .from('contacts')
      .upsert([
        {
          id: 'test-contact-1',
          organization_id: organizationId,
          full_name: 'Jennifer Fleming',
          email: 'jennifer.fleming@example.com',
          company: 'Tech Corp',
          title: 'VP of Sales',
          linkedin_url: 'https://linkedin.com/in/jennifer-fleming',
          status: 'active',
          tags: ['enterprise', 'decision-maker'],
          enrichment_data: {
            company_size: '500-1000',
            industry: 'Technology'
          },
          interaction_history: [
            {
              date: '2024-01-20',
              type: 'email_sent',
              campaign: 'Q1 Enterprise Outreach'
            },
            {
              date: '2024-01-22',
              type: 'email_opened',
              campaign: 'Q1 Enterprise Outreach'
            }
          ]
        },
        {
          id: 'test-contact-2',
          organization_id: organizationId,
          full_name: 'David Chen',
          email: 'david.chen@example.com',
          company: 'Startup Inc',
          title: 'CEO',
          linkedin_url: 'https://linkedin.com/in/david-chen',
          status: 'active',
          tags: ['startup', 'ceo'],
          enrichment_data: {
            company_size: '10-50',
            industry: 'SaaS'
          },
          interaction_history: []
        }
      ], {
        onConflict: 'id'
      });

    if (contactError) {
      console.error('Error inserting contacts:', contactError);
    } else {
      console.log('Test contacts inserted:', contacts);
    }

    // Insert test conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .upsert([
        {
          id: 'test-conversation-1',
          organization_id: organizationId,
          user_id: organizationId, // Using org ID as user ID for testing
          title: 'Campaign Strategy Discussion',
          status: 'active',
          context: {
            topic: 'Q1 outreach planning'
          },
          metadata: {
            priority: 'high'
          }
        }
      ], {
        onConflict: 'id'
      });

    if (conversationError) {
      console.error('Error inserting conversation:', conversationError);
    } else {
      console.log('Test conversation inserted:', conversation);

      // Insert test messages
      const { data: messages, error: messageError } = await supabase
        .from('messages')
        .upsert([
          {
            id: 'test-message-1',
            conversation_id: 'test-conversation-1',
            role: 'user',
            content: 'What\'s the best strategy for our Q1 enterprise outreach campaign?',
            message_type: 'text'
          },
          {
            id: 'test-message-2',
            conversation_id: 'test-conversation-1',
            role: 'assistant',
            content: 'For your Q1 enterprise outreach, I recommend focusing on personalized messaging that addresses specific pain points. Based on your target accounts, consider a multi-touch sequence combining LinkedIn outreach with email follow-ups.',
            message_type: 'text'
          }
        ], {
          onConflict: 'id'
        });

      if (messageError) {
        console.error('Error inserting messages:', messageError);
      } else {
        console.log('Test messages inserted:', messages);
      }
    }

    return { success: true, message: 'Test data inserted successfully' };
  } catch (error) {
    console.error('Error in insertTestData:', error);
    return { success: false, error };
  }
};

// Function to clean up test data
export const cleanupTestData = async (organizationId: string) => {
  try {
    await supabase.from('messages').delete().like('id', 'test-message-%');
    await supabase.from('conversations').delete().like('id', 'test-conversation-%');
    await supabase.from('contacts').delete().like('id', 'test-contact-%');
    await supabase.from('campaigns').delete().like('id', 'test-campaign-%');
    
    return { success: true, message: 'Test data cleaned up successfully' };
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    return { success: false, error };
  }
};