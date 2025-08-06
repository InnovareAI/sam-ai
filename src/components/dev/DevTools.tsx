import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { insertTestData, cleanupTestData } from '@/utils/testData';
import { toast } from '@/hooks/use-toast';
import { Database, Trash2, RefreshCw } from 'lucide-react';

export const DevTools: React.FC = () => {
  const { organization } = useAuth();
  const [isInserting, setIsInserting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) return null;

  const handleInsertTestData = async () => {
    if (!organization?.id) {
      toast({
        title: 'Error',
        description: 'No organization context available',
        variant: 'destructive',
      });
      return;
    }

    setIsInserting(true);
    try {
      const result = await insertTestData(organization.id);
      if (result.success) {
        toast({
          title: 'Test Data Inserted',
          description: 'Sample campaigns, contacts, and conversations have been added',
        });
      } else {
        throw result.error;
      }
    } catch (error) {
      toast({
        title: 'Error Inserting Test Data',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsInserting(false);
    }
  };

  const handleCleanupTestData = async () => {
    if (!organization?.id) {
      toast({
        title: 'Error',
        description: 'No organization context available',
        variant: 'destructive',
      });
      return;
    }

    setIsCleaning(true);
    try {
      const result = await cleanupTestData(organization.id);
      if (result.success) {
        toast({
          title: 'Test Data Cleaned',
          description: 'All test data has been removed',
        });
      } else {
        throw result.error;
      }
    } catch (error) {
      toast({
        title: 'Error Cleaning Test Data',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm">Development Tools</CardTitle>
          <Badge variant="secondary" className="text-xs">DEV</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-gray-600 mb-3">
          Organization: {organization?.name || 'None'}
        </div>
        
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={handleInsertTestData}
          disabled={isInserting || !organization}
        >
          <Database className="h-3 w-3 mr-2" />
          {isInserting ? (
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
          ) : null}
          Insert Test Data
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={handleCleanupTestData}
          disabled={isCleaning || !organization}
        >
          <Trash2 className="h-3 w-3 mr-2" />
          {isCleaning ? (
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
          ) : null}
          Cleanup Test Data
        </Button>
        
        <div className="text-xs text-gray-500 pt-2">
          These tools help populate the database with sample data for testing the integration.
        </div>
      </CardContent>
    </Card>
  );
};