import React, { useState } from "react";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  Camera,
  Lock,
  Bell,
  Shield,
  Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfileSettings() {
  const { toast } = useToast();
  const [isConversational, setIsConversational] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Jennifer",
    lastName: "Fleming", 
    email: "jennifer.fleming@company.com",
    phone: "+1 (555) 123-4567",
    title: "VP of Sales",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    bio: "Experienced sales leader with 10+ years in B2B software sales. Passionate about building high-performing teams and driving revenue growth through strategic partnerships.",
    timezone: "America/Los_Angeles",
    language: "English"
  });

  const handleSaveProfile = () => {
    // TODO: Implement actual save functionality with Supabase
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <WorkspaceSidebar isConversational={isConversational} />
        <div className="flex-1 flex flex-col">
          <WorkspaceHeader isConversational={isConversational} onToggleMode={setIsConversational} />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
              </div>

              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and profile information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400&h=400&fit=crop&crop=face" />
                          <AvatarFallback className="text-xl">JF</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">{profileData.firstName} {profileData.lastName}</h3>
                          <p className="text-gray-600">{profileData.title}</p>
                          <Button variant="outline" size="sm">
                            <Camera className="h-4 w-4 mr-2" />
                            Change Photo
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Personal Details */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title">Job Title</Label>
                          <Input
                            id="title"
                            value={profileData.title}
                            onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            value={profileData.company}
                            onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                            placeholder="City, State/Country"
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                            placeholder="Tell us about yourself..."
                            rows={4}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveProfile}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Account Tab */}
                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Account Settings
                      </CardTitle>
                      <CardDescription>
                        Manage your account preferences and regional settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <select 
                            id="timezone"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                            value={profileData.timezone}
                            onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                          >
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                            <option value="Europe/Paris">Central European Time (CET)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <select 
                            id="language"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                            value={profileData.language}
                            onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Español</option>
                            <option value="French">Français</option>
                            <option value="German">Deutsch</option>
                          </select>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Account Status</h3>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                            <div>
                              <p className="font-medium">Professional Plan</p>
                              <p className="text-sm text-gray-600">Unlimited campaigns and contacts</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage Billing
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>
                        Choose what notifications you want to receive
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Email Notifications</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Campaign Updates</p>
                              <p className="text-sm text-gray-600">Get notified when campaigns start, pause, or complete</p>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">New Replies</p>
                              <p className="text-sm text-gray-600">Immediate notifications for prospect replies</p>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Daily Summary</p>
                              <p className="text-sm text-gray-600">Daily digest of campaign performance</p>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">In-App Notifications</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">AI Recommendations</p>
                              <p className="text-sm text-gray-600">Notifications for AI-suggested improvements</p>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">System Alerts</p>
                              <p className="text-sm text-gray-600">Important system and security notifications</p>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>
                        Manage your account security and privacy settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Password</h3>
                        <div className="space-y-4">
                          <Button variant="outline">
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                          <p className="text-sm text-gray-600">
                            Last changed: January 15, 2024
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Authenticator App</p>
                              <p className="text-sm text-gray-600">Use an authenticator app for secure login</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Disabled
                          </Badge>
                        </div>
                        <Button variant="outline">
                          Enable Two-Factor Authentication
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Data Privacy</h3>
                        <div className="space-y-4">
                          <Button variant="outline">
                            Download My Data
                          </Button>
                          <Button variant="destructive" className="ml-2">
                            Delete Account
                          </Button>
                          <p className="text-sm text-gray-600">
                            Request a copy of your data or permanently delete your account
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}