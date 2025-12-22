// src/pages/Analytics.jsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Users,
  ArrowUp,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import RevenueChart from "@/components/admin/RevenueChart";
import LineChart from "@/components/admin/LineChart";
import PeakOrderBarChart from "@/components/admin/PeakOrderBarChart";
import HorizontalBarChart from "@/components/admin/HorizontalBarChart";

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("today");
  const [revenueTimeframe, setRevenueTimeframe] = useState("today");
  const [customersTimeframe, setCustomersTimeframe] = useState("date-wise");

  // Stats data with circular progress
  const stats = [
    {
      icon: Wallet,
      label: "Total Revenue",
      value: "$12,450",
      change: "+12%",
      isPositive: true,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      progress: 75,
    },
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: "1,230",
      change: "+8%",
      isPositive: true,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      progress: 60,
    },
    {
      icon: TrendingUp,
      label: "Avg. Order Value",
      value: "$10.12",
      change: "+2%",
      isPositive: true,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      progress: 45,
    },
    {
      icon: Users,
      label: "Customer Repeat Rate",
      value: "45%",
      change: "+4%",
      isPositive: true,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      progress: 45,
    },
  ];

  // Top 5 Most-Selling Items
  const topSellingData = {
    labels: ['Chicken Momo', 'Veg Momo', 'Paneer Momo', 'Fried Momo'],
    values: [80, 65, 90, 45],
  };

  // Top 5 Least-Selling Items
  const leastSellingItems = [
    { name: "Plain rice", count: 130, maxCount: 130 },
    { name: "Water bottle", count: 100, maxCount: 130 },
    { name: "Salad", count: 50, maxCount: 130 },
    { name: "Soup", count: 34, maxCount: 130 },
    { name: "Plain momo", count: 18, maxCount: 130 },
  ];

  // Popular Food Item Combos
  const foodCombos = [
    { name: "Momo Platter + Coke", count: 482, maxCount: 482 },
    { name: "Jhol Momo + Soup", count: 134, maxCount: 482 },
    { name: "Veg Momo + Coke", count: 18, maxCount: 482 },
    { name: "Momo Platter + Soup", count: 18, maxCount: 482 },
    { name: "Paneer Momo + Coke", count: 17, maxCount: 482 },
  ];

  // New Customers Data
  const newCustomersData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    values: [35, 48, 52, 58, 65, 70, 62],
  };

  // Recent Customer Activity
  const recentActivity = [
    {
      customer: "Alex Chen",
      orderType: "Delivery",
      items: "1,230",
      order: "Stuan Chicken Momo",
      status: "Dine-in",
      amount: "$45.00",
    },
  ];

  return (
    <>
      <AdminSidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-white px-6 py-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
            <p className="text-sm text-gray-500">Real-time performance metrics</p>
          </div>

          {/* Time Period Tabs */}
          <div className="ml-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100">
                <TabsTrigger
                  value="today"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  Today
                </TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Stats Cards with Circular Progress */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const circumference = 2 * Math.PI * 28;
                const strokeDashoffset = circumference - (stat.progress / 100) * circumference;

                return (
                  <Card key={index} className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                          <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-red-50 text-red-600 hover:bg-red-50"
                        >
                          <ArrowUp className="h-3 w-3 mr-1" />
                          {stat.change}
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{stat.label}</p>
                          <p className="text-3xl font-bold mt-1">{stat.value}</p>
                        </div>
                        {/* Circular Progress */}
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="5"
                              fill="none"
                              className="text-gray-200"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="5"
                              fill="none"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              className="text-orange-500 transition-all duration-500"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Enhanced Revenue Visualization and New Customers */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue vs Costs Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Enhanced Revenue Visualization</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Revenue vs Costs</p>
                      <p className="text-xs text-gray-400">
                        Revenue collected in the last 24 hours
                      </p>
                    </div>
                    <Select value={revenueTimeframe} onValueChange={setRevenueTimeframe}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <RevenueChart height={280} />
                </CardContent>
              </Card>

              {/* New Customers per Day */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>New Customers per Day</CardTitle>
                    <Select value={customersTimeframe} onValueChange={setCustomersTimeframe}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-wise">Date-wise</SelectItem>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <LineChart data={newCustomersData} height={280} />
                </CardContent>
              </Card>
            </div>

            {/* Top/Least Selling Items and Combos */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Top 5 Most-Selling Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Top 5 Most-Selling Items</CardTitle>
                    <Select defaultValue="date-wise">
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-wise">Date-wise</SelectItem>
                        <SelectItem value="week">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <HorizontalBarChart data={topSellingData} height={220} />
                </CardContent>
              </Card>

              {/* Top 5 Least-Selling Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Top 5 Least-Selling Items</CardTitle>
                    <Select defaultValue="date-wise">
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-wise">Date-wise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leastSellingItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${(item.count / item.maxCount) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[3ch]">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Food Item Combos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Popular Food Item Combos</CardTitle>
                    <Select defaultValue="date-wise">
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-wise">Date-wise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {foodCombos.map((combo, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{combo.name}</p>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${(combo.count / combo.maxCount) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[3ch]">
                          {combo.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Peak Order Times */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Peak Order Times</CardTitle>
                  <Badge className="bg-orange-500 text-white hover:bg-orange-600">Today</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <PeakOrderBarChart height={200} />
              </CardContent>
            </Card>

            {/* Recent Customer Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Customer Activity</CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-orange-500"></span>
                      <span>Dine-in (65%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                      <span>Delivery (35%)</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-500">
                        <th className="pb-3 font-medium">CUSTOMER</th>
                        <th className="pb-3 font-medium">ORDER TYPE</th>
                        <th className="pb-3 font-medium">ITEMS</th>
                        <th className="pb-3 font-medium">STATUS</th>
                        <th className="pb-3 font-medium">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((activity, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">{activity.customer}</td>
                          <td className="py-3">{activity.items}</td>
                          <td className="py-3">{activity.order}</td>
                          <td className="py-3">
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                              {activity.status}
                            </Badge>
                          </td>
                          <td className="py-3">{activity.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
