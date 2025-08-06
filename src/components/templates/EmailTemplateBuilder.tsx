import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Code,
  Eye,
  Save,
  Copy,
  Mail,
  FileText,
  Sparkles,
  Variable,
  Plus,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  performance: {
    openRate: number;
    replyRate: number;
    conversionRate: number;
  };
}

export const EmailTemplateBuilder: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Initial Outreach',
      subject: 'Quick question about {{company}}',
      body: `Hi {{firstName}},

I noticed {{company}} is {{trigger_event}}. 

{{value_proposition}}

Would you be open to a brief call {{meeting_time}}?

Best,
{{sender_name}}`,
      variables: ['firstName', 'company', 'trigger_event', 'value_proposition', 'meeting_time', 'sender_name'],
      category: 'cold_outreach',
      performance: {
        openRate: 42,
        replyRate: 18,
        conversionRate: 8,
      },
    },
    {
      id: '2',
      name: 'Follow-up Sequence',
      subject: 'Re: {{previous_subject}}',
      body: `Hi {{firstName}},

Just wanted to follow up on my previous email about {{topic}}.

{{follow_up_reason}}

{{call_to_action}}

Thanks,
{{sender_name}}`,
      variables: ['firstName', 'previous_subject', 'topic', 'follow_up_reason', 'call_to_action', 'sender_name'],
      category: 'follow_up',
      performance: {
        openRate: 38,
        replyRate: 22,
        conversionRate: 12,
      },
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(templates[0]);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    firstName: 'John',
    company: 'Acme Corp',
    trigger_event: 'expanding their sales team',
    value_proposition: 'Our AI-powered CRM can help streamline your sales process',
    meeting_time: 'next Tuesday or Wednesday',
    sender_name: 'Sarah Johnson',
  });

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      setTemplates(prev => 
        prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t)
      );
      setEditMode(false);
      toast({
        title: 'Template Saved',
        description: 'Your email template has been saved successfully.',
      });
    }
  };

  const handleDuplicateTemplate = () => {
    if (selectedTemplate) {
      const newTemplate = {
        ...selectedTemplate,
        id: Date.now().toString(),
        name: `${selectedTemplate.name} (Copy)`,
      };
      setTemplates(prev => [...prev, newTemplate]);
      setSelectedTemplate(newTemplate);
      toast({
        title: 'Template Duplicated',
        description: 'A copy of the template has been created.',
      });
    }
  };

  const renderPreview = () => {
    if (!selectedTemplate) return '';
    
    let preview = selectedTemplate.body;
    selectedTemplate.variables.forEach(variable => {
      const value = variableValues[variable] || `{{${variable}}}`;
      preview = preview.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });
    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Template Builder</h2>
          <p className="text-muted-foreground">
            Create and optimize email templates with AI-powered suggestions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Template List */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.category.replace('_', ' ')}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {template.performance.openRate}% open
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.performance.replyRate}% reply
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Editor */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{selectedTemplate?.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicateTemplate}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    onClick={editMode ? handleSaveTemplate : () => setEditMode(true)}
                  >
                    {editMode ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    ) : (
                      <>
                        <Code className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="variables">Variables</TabsTrigger>
                  <TabsTrigger value="ai">AI Optimize</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  {previewMode ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Subject Preview</Label>
                        <div className="p-3 bg-muted rounded-lg">
                          {selectedTemplate?.subject.replace(/{{(\w+)}}/g, (match, variable) => 
                            variableValues[variable] || match
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Body Preview</Label>
                        <div className="p-3 bg-muted rounded-lg whitespace-pre-wrap">
                          {renderPreview()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Template Name</Label>
                        <Input
                          value={selectedTemplate?.name}
                          onChange={(e) => setSelectedTemplate(prev => 
                            prev ? { ...prev, name: e.target.value } : null
                          )}
                          disabled={!editMode}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={selectedTemplate?.category}
                          onValueChange={(value) => setSelectedTemplate(prev => 
                            prev ? { ...prev, category: value } : null
                          )}
                          disabled={!editMode}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                            <SelectItem value="follow_up">Follow-up</SelectItem>
                            <SelectItem value="nurture">Nurture</SelectItem>
                            <SelectItem value="meeting_request">Meeting Request</SelectItem>
                            <SelectItem value="thank_you">Thank You</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Subject Line</Label>
                        <Input
                          value={selectedTemplate?.subject}
                          onChange={(e) => setSelectedTemplate(prev => 
                            prev ? { ...prev, subject: e.target.value } : null
                          )}
                          disabled={!editMode}
                        />
                      </div>
                      <div>
                        <Label>Email Body</Label>
                        <Textarea
                          value={selectedTemplate?.body}
                          onChange={(e) => setSelectedTemplate(prev => 
                            prev ? { ...prev, body: e.target.value } : null
                          )}
                          disabled={!editMode}
                          rows={12}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="variables" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Template Variables</h3>
                      <Button size="sm" variant="outline">
                        <Variable className="h-4 w-4 mr-2" />
                        Add Variable
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {selectedTemplate?.variables.map(variable => (
                        <div key={variable} className="flex gap-2">
                          <div className="flex-1">
                            <Label>{`{{${variable}}}`}</Label>
                            <Input
                              placeholder={`Enter value for ${variable}`}
                              value={variableValues[variable] || ''}
                              onChange={(e) => setVariableValues(prev => ({
                                ...prev,
                                [variable]: e.target.value
                              }))}
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="mt-6"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">AI Optimization Suggestions</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-background rounded-lg">
                          <div className="font-medium text-sm">Subject Line Score: 8.5/10</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Consider adding personalization or urgency to increase open rates
                          </p>
                        </div>
                        <div className="p-3 bg-background rounded-lg">
                          <div className="font-medium text-sm">Readability: Good</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Keep paragraphs short and use bullet points for better scanning
                          </p>
                        </div>
                        <div className="p-3 bg-background rounded-lg">
                          <div className="font-medium text-sm">Call-to-Action: Strong</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Clear and specific CTA increases response rates
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-4">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Apply AI Suggestions
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {selectedTemplate?.performance.openRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {selectedTemplate?.performance.replyRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">Reply Rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {selectedTemplate?.performance.conversionRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">Conversion Rate</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-3">A/B Test Results</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Version A (Current)</span>
                        <span className="font-medium">42% open rate</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Version B (With emoji)</span>
                        <span className="font-medium">38% open rate</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Version C (Shorter subject)</span>
                        <span className="font-medium">45% open rate</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};