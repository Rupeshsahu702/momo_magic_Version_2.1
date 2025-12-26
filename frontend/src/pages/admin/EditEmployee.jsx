/**
 * EditEmployee - Form page for editing existing employee profiles.
 * Fetches employee data from API and allows updating all fields.
 */

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
  CalendarDays,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/Sidebar";
import AttendanceCalendar from "@/components/admin/AttendanceCalendar";
import employeeService from "@/services/employeeService";

export default function EditEmployee() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [shift, setShift] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [address, setAddress] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [permissionLevel, setPermissionLevel] = useState("standard");

  // Original employee data for reference
  const [originalEmployee, setOriginalEmployee] = useState(null);

  // Attendance calendar state
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch employee data on mount
  useEffect(() => {
    const fetchEmployee = async () => {
      // Try to get from navigation state first (for quick loading)
      const stateEmployee = location.state?.employee;

      if (stateEmployee) {
        populateForm(stateEmployee);
        setOriginalEmployee(stateEmployee);
        setIsLoading(false);
      }

      // Always fetch fresh data from API
      try {
        const employee = await employeeService.fetchEmployeeById(id);
        populateForm(employee);
        setOriginalEmployee(employee);
      } catch (error) {
        console.error("Error fetching employee:", error);
        if (!stateEmployee) {
          toast.error("Failed to load employee data");
          navigate("/admin/employees");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
    // NOTE: We intentionally only run on id changes. location.state and navigate 
    // are stable references that don't need to trigger re-fetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Populate form with employee data
  const populateForm = (employee) => {
    const nameParts = employee.name?.split(" ") || [];
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" ") || "");
    setEmail(employee.email || "");
    setPhone(employee.phone || "");
    setPosition(employee.position || "");
    setShift(employee.shift || "09:00 AM - 05:00 PM");
    setIsActive(employee.isActive !== false);
    setAddress(employee.address || "");
    setProfilePhoto(employee.avatar || null);
    setEmployeeId(employee.employeeId || "");
    setStartDate(employee.startDate ? new Date(employee.startDate).toISOString().split("T")[0] : "");
    setEmergencyContactName(employee.emergencyContactName || "");
    setEmergencyContactPhone(employee.emergencyContactPhone || "");
    setPermissionLevel(employee.permissionLevel || "standard");
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhoto(URL.createObjectURL(file));
  };

  // Handle save
  const handleSave = async () => {
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !position) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      const updatedEmployee = {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        position,
        shift,
        isActive,
        address,
        avatar: profilePhoto || "",
        emergencyContactName,
        emergencyContactPhone,
        permissionLevel,
      };

      await employeeService.updateEmployee(id, updatedEmployee);
      toast.success("Employee updated successfully!");
      navigate("/admin/employees");
    } catch (error) {
      console.error("Error updating employee:", error);
      const errorMessage = error.response?.data?.message || "Failed to update employee";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/employees");
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <AdminSidebar />
        <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="text-gray-600">Loading employee data...</span>
          </div>
        </div>
      </>
    );
  }

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

            {/* View Attendance Button */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setCalendarOpen(true)}
            >
              <CalendarDays className="h-4 w-4" />
              View Attendance
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
                      {firstName[0] || ""}
                      {lastName[0] || ""}
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
                    <Badge className={isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>ID: {employeeId}</span>
                    </div>
                    {startDate && (
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>Joined: {new Date(startDate).toLocaleDateString()}</span>
                      </div>
                    )}
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
                    First Name <span className="text-red-500">*</span>
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
                    Last Name <span className="text-red-500">*</span>
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
                    Email Address <span className="text-red-500">*</span>
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
                    Phone Number <span className="text-red-500">*</span>
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
                {/* Position */}
                <div>
                  <Label htmlFor="position" className="text-sm font-medium">
                    Position <span className="text-red-500">*</span>
                  </Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Head Chef">Head Chef</SelectItem>
                      <SelectItem value="Sous Chef">Sous Chef</SelectItem>
                      <SelectItem value="Line Cook">Line Cook</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Inventory Manager">Inventory Manager</SelectItem>
                      <SelectItem value="Server">Server</SelectItem>
                      <SelectItem value="Cleaner">Cleaner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Shift */}
                <div>
                  <Label htmlFor="shift" className="text-sm font-medium">
                    Shift Time
                  </Label>
                  <Select value={shift} onValueChange={setShift}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00 AM - 05:00 PM">09:00 AM - 05:00 PM</SelectItem>
                      <SelectItem value="08:00 AM - 04:00 PM">08:00 AM - 04:00 PM</SelectItem>
                      <SelectItem value="11:00 AM - 07:00 PM">11:00 AM - 07:00 PM</SelectItem>
                      <SelectItem value="02:00 PM - 10:00 PM">02:00 PM - 10:00 PM</SelectItem>
                      <SelectItem value="06:00 PM - 02:00 AM">06:00 PM - 02:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employment Status */}
                <div>
                  <Label htmlFor="status" className="text-sm font-medium">
                    Employment Status
                  </Label>
                  <Select
                    value={isActive ? "active" : "inactive"}
                    onValueChange={(val) => setIsActive(val === "active")}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Permission Level */}
                <div>
                  <Label htmlFor="permissionLevel" className="text-sm font-medium">
                    Permission Level
                  </Label>
                  <Select value={permissionLevel} onValueChange={setPermissionLevel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Residential Address */}
              <div className="mb-6">
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

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="emergencyName" className="text-sm font-medium">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergencyName"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="mt-1"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPhone" className="text-sm font-medium">
                    Emergency Phone
                  </Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="mt-1"
                    placeholder="+1 (555) 999-9999"
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
              disabled={isSaving}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Calendar Modal */}
      <AttendanceCalendar
        employee={originalEmployee}
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
      />
    </>
  );
}
