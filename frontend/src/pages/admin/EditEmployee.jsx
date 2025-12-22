// src/pages/EditEmployee.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardContent } from "../../components/ui/card";
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ChevronRight,
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  History,
  Save,
  X,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";

export default function EditEmployee() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get employee data from navigation state or use defaults
  const employeeData = location.state?.employee || {
    name: "Sarah Jenkins",
    employeeId: "#MM-4621",
    email: "sarah.j@momomagic.com",
    phone: "+1 (555) 012-3456",
    role: "Shift Supervisor",
    status: "Active",
    address: "123 Maple Street, Springfield, IL 62704",
    joinDate: "Jan 15, 2023",
  };

  // Form state
  const [firstName, setFirstName] = useState(
    employeeData.name?.split(" ")[0] || "Sarah"
  );
  const [lastName, setLastName] = useState(
    employeeData.name?.split(" ")[1] || "Jenkins"
  );
  const [email, setEmail] = useState(employeeData.email || "");
  const [phone, setPhone] = useState(employeeData.phone || "");
  const [jobRole, setJobRole] = useState(employeeData.role || "");
  const [employmentStatus, setEmploymentStatus] = useState(
    employeeData.status || "Active"
  );
  const [address, setAddress] = useState(employeeData.address || "");
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhoto(URL.createObjectURL(file));
  };

  const handleSave = () => {
    const updatedEmployee = {
      id,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      role: jobRole,
      status: employmentStatus,
      address,
    };
    console.log("Saving employee:", updatedEmployee);
    // TODO: Call API to update employee
    navigate("/admin/employees");
  };

  const handleCancel = () => {
    navigate("/admin/employees");
  };

  return (
    <>
      <AdminSidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Link to="/" className="hover:text-orange-500">
                    Home
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <Link to="/admin/employees" className="hover:text-orange-500">
                    Employees
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-orange-500">Edit Profile</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Employee Details
                </h1>
                <p className="text-sm text-gray-500">
                  Update information for {firstName} {lastName}
                </p>
              </div>
            </div>

            {/* View History Button */}
            <Button variant="outline" className="gap-2">
              <History className="h-4 w-4" />
              View History
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-5xl mx-auto">
          {/* Employee Profile Card */}
          <Card className="bg-white mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Profile Photo */}
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profilePhoto} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 text-2xl font-semibold">
                      {firstName[0]}
                      {lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => document.getElementById("profilePhoto").click()}
                    className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 shadow-lg"
                  >
                    <Upload className="h-3 w-3" />
                  </button>
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Employee Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {firstName} {lastName}
                    </h2>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>ID: {employeeData.employeeId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>Joined: {employeeData.joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Section */}
          <Card className="bg-white mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Details Section */}
          <Card className="bg-white mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Employment Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Job Role */}
                <div>
                  <Label htmlFor="jobRole" className="text-sm font-medium">
                    Job Role
                  </Label>
                  <Select value={jobRole} onValueChange={setJobRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shift Supervisor">Shift Supervisor</SelectItem>
                      <SelectItem value="Head Chef">Head Chef</SelectItem>
                      <SelectItem value="Sous Chef">Sous Chef</SelectItem>
                      <SelectItem value="Line Cook">Line Cook</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Server">Server</SelectItem>
                      <SelectItem value="Inventory Mgr">Inventory Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employment Status */}
                <div>
                  <Label htmlFor="status" className="text-sm font-medium">
                    Employment Status
                  </Label>
                  <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <Label htmlFor="address" className="text-sm font-medium">
                  Residential Address
                </Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10"
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
