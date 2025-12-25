// src/pages/Profile.jsx
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SidebarTrigger } from "../../components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  ChevronRight,
  Upload,
  User,
  Lock,
  AlertCircle,
  Trash2,
  Mail,
  FileText,
  Save,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import AuthContext from "@/context/AuthContext";

export default function Profile() {
  const { admin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  // Initialize state when admin data is available
  useEffect(() => {
    if (admin) {
      setFullName(admin.name || "");
      setRoleTitle(admin.position || "");
      setContactNumber(admin.phoneNumber || "");
      setEmailAddress(admin.email || "");
    }
  }, [admin]);

  const [dailyReports, setDailyReports] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  // NOTE: setEmailVerified will be used when email verification feature is implemented
  const [emailVerified, _setEmailVerified] = useState(false);


  // Handle profile photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AdminSidebar />
      <div className="flex-1 bg-orange-50/30 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span className="hover:text-orange-500 cursor-pointer">Admin</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-orange-500">Profile</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500">
                  Manage your personal information and security settings
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-6xl mx-auto">
          {/* Profile Header Card */}
          <Card className="bg-white mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Profile Photo */}
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profilePhoto} />
                      <AvatarFallback className="bg-gray-300 text-gray-600 text-2xl">
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => document.getElementById("profilePhotoUpload").click()}
                      className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 shadow-lg"
                    >
                      <Upload className="h-3 w-3" />
                    </button>
                    <input
                      type="file"
                      id="profilePhotoUpload"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                        STORE ADMIN
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {roleTitle || "Staff Member"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Member since {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Role Title */}
                <div>
                  <Label htmlFor="roleTitle" className="text-sm font-medium">
                    Role Title
                  </Label>
                  <Input
                    id="roleTitle"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Start the import/export API
                  </p>
                </div>

                {/* Contact Number */}
                <div>
                  <Label htmlFor="contactNumber" className="text-sm font-medium">
                    Contact Number
                  </Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Daily Reports Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Daily Reports</p>
                    <p className="text-sm text-gray-500">
                      Receive end-of-day sales summary
                    </p>
                  </div>
                  <Switch
                    checked={dailyReports}
                    onCheckedChange={setDailyReports}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-orange-500" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Address */}
                <div>
                  <Label htmlFor="emailAddress" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="emailAddress"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {!emailVerified && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <p className="text-xs text-orange-600">
                        Pending email key (sent via verification)
                      </p>
                    </div>
                  )}
                </div>

                {/* Change Password Section */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-4">CHANGE PASSWORD</h3>

                  {/* Current Password */}
                  <div className="mb-4">
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* New Password & Confirm Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword" className="text-sm font-medium">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </>
  );
}
