/**
 * Analytics Page - Real-time sales analytics dashboard.
 * Fetches data from the Sales API and displays KPIs, charts, and trends.
 */
import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import RevenueChart from "@/components/admin/RevenueChart";
import LineChart from "@/components/admin/LineChart";
import PeakOrderBarChart from "@/components/admin/PeakOrderBarChart";
import HorizontalBarChart from "@/components/admin/HorizontalBarChart";
import salesService from "@/services/salesService";
import { useSocket } from "@/context/SocketContext";

// CSS animations for enhanced UI
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;



export default function Analytics() {
  const [activeTab, setActiveTab] = useState("today");
  const [revenueTimeframe, setRevenueTimeframe] = useState("today");
  const [customersTimeframe, setCustomersTimeframe] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  // Stats from API
  const [statsData, setStatsData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    customerRepeatRate: 0
  });

  // Growth metrics from API
  const [growthMetrics, setGrowthMetrics] = useState({
    revenueGrowth: 0,
    ordersGrowth: 0,
    avgValueGrowth: 0,
    repeatRateGrowth: 0
  });

  // Top/least selling items from API
  const [topSellingData, setTopSellingData] = useState({ labels: [], values: [] });
  const [leastSellingItems, setLeastSellingItems] = useState([]);

  // Recent sales activity
  const [recentActivity, setRecentActivity] = useState([]);

  // Peak hours data
  const [peakHoursData, setPeakHoursData] = useState([]);

  // Revenue by hour data
  const [revenueByHourData, setRevenueByHourData] = useState([]);
  const [revenueDataType, setRevenueDataType] = useState('hourly');

  // New customers data
  const [newCustomersData, setNewCustomersData] = useState({ labels: [], values: [] });

  // Popular food combos
  const [foodCombos, setFoodCombos] = useState([]);

  /**
   * Fetch all analytics data from the API.
   * Called on mount and when the time period changes.
   */
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel for better performance
      const [
        statsResponse,
        growthResponse,
        topItemsResponse,
        leastItemsResponse,
        peakHoursResponse,
        recentResponse,
        revenueByHourResponse,
        popularCombosResponse
      ] = await Promise.all([
        salesService.fetchStats(activeTab),
        salesService.fetchGrowthMetrics(activeTab),
        salesService.fetchTopSellingItems(activeTab, 5),
        salesService.fetchLeastSellingItems(activeTab, 5),
        salesService.fetchPeakOrderHours(activeTab),
        salesService.fetchRecentSales(5),
        salesService.fetchRevenueByHour(revenueTimeframe),
        salesService.fetchPopularCombos(activeTab, 5)
      ]);

      // Update stats
      if (statsResponse.success) {
        setStatsData(statsResponse.data);
      }

      // Update growth metrics
      if (growthResponse.success) {
        setGrowthMetrics(growthResponse.data);
      }

      // Format top selling items for HorizontalBarChart
      if (topItemsResponse.success && topItemsResponse.data.length > 0) {
        setTopSellingData({
          labels: topItemsResponse.data.map(item => item.name),
          values: topItemsResponse.data.map(item => item.quantity)
        });
      } else {
        setTopSellingData({ labels: [], values: [] });
      }

      // Format least selling items for progress bars
      if (leastItemsResponse.success && leastItemsResponse.data.length > 0) {
        const items = leastItemsResponse.data;
        const maxCount = Math.max(...items.map(item => item.quantity), 1);
        setLeastSellingItems(items.map(item => ({
          name: item.name,
          count: item.quantity,
          maxCount
        })));
      } else {
        setLeastSellingItems([]);
      }

      // Peak hours data
      if (peakHoursResponse.success) {
        setPeakHoursData(peakHoursResponse.data);
      }

      // Recent activity
      if (recentResponse.success) {
        setRecentActivity(recentResponse.data.map(sale => ({
          customer: sale.customerName || 'Guest',
          orderType: 'Dine-in',
          items: sale.items?.length || 0,
          order: sale.items?.[0]?.name || 'N/A',
          status: 'Served',
          amount: `₹${sale.total?.toFixed(2) || '0.00'}`
        })));
      }

      // Revenue by hour data
      if (revenueByHourResponse.success) {
        setRevenueByHourData(revenueByHourResponse.data);
        setRevenueDataType(revenueByHourResponse.type || 'hourly');
      }

      // Popular food combos
      if (popularCombosResponse.success && popularCombosResponse.data.length > 0) {
        setFoodCombos(popularCombosResponse.data);
      } else {
        setFoodCombos([]);
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, revenueTimeframe]);

  // Fetch data on mount and when period changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Fetch new customers data separately when timeframe changes
  useEffect(() => {
    const fetchNewCustomersData = async () => {
      try {
        const response = await salesService.fetchNewCustomers(customersTimeframe);
        if (response.success && response.data.length > 0) {
          // Format labels based on period type
          const getDayOfWeekName = (dayOfWeek) => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[dayOfWeek - 1] || '';
          };

          let labels;
          if (customersTimeframe === 'week') {
            // For weekly: show day names
            labels = response.data.map(item => getDayOfWeekName(item.dayOfWeek));
          } else {
            // For monthly: show date numbers
            labels = response.data.map(item => `${item.day}`);
          }

          const values = response.data.map(item => item.count);
          setNewCustomersData({ labels, values });
        } else {
          setNewCustomersData({ labels: [], values: [] });
        }
      } catch (error) {
        console.error('Error fetching new customers data:', error);
      }
    };

    fetchNewCustomersData();
  }, [customersTimeframe]);

  // Listen for real-time sales updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewSale = () => {
      // Refresh analytics when a new sale is recorded
      fetchAnalyticsData();
    };

    socket.on('sales:new', handleNewSale);

    return () => {
      socket.off('sales:new', handleNewSale);
    };
  }, [socket, fetchAnalyticsData]);

  // Build stats cards array with real data from API
  const stats = [
    {
      icon: Wallet,
      label: "Total Revenue",
      value: `₹${statsData.totalRevenue.toLocaleString()}`,
      change: `${growthMetrics.revenueGrowth >= 0 ? '+' : ''}${growthMetrics.revenueGrowth}%`,
      isPositive: growthMetrics.revenueGrowth >= 0,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      progress: Math.min((statsData.totalRevenue / 1000) * 10, 100),
    },
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: statsData.totalOrders.toLocaleString(),
      change: `${growthMetrics.ordersGrowth >= 0 ? '+' : ''}${growthMetrics.ordersGrowth}%`,
      isPositive: growthMetrics.ordersGrowth >= 0,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      progress: Math.min(statsData.totalOrders * 10, 100),
    },
    {
      icon: TrendingUp,
      label: "Avg. Order Value",
      value: `₹${statsData.avgOrderValue.toFixed(2)}`,
      change: `${growthMetrics.avgValueGrowth >= 0 ? '+' : ''}${growthMetrics.avgValueGrowth}%`,
      isPositive: growthMetrics.avgValueGrowth >= 0,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      progress: Math.min(statsData.avgOrderValue * 5, 100),
    },
    {
      icon: Users,
      label: "Customer Repeat Rate",
      value: `${statsData.customerRepeatRate}%`,
      change: `${growthMetrics.repeatRateGrowth >= 0 ? '+' : ''}${growthMetrics.repeatRateGrowth}%`,
      isPositive: growthMetrics.repeatRateGrowth >= 0,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      progress: statsData.customerRepeatRate,
    },
  ];

  // Food combos and new customers data are now fetched from API

  return (
    <>
      <style>{styles}</style>
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-orange-100 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Analytics Overview
            </h1>
            <p className="text-sm text-gray-600">Real-time performance metrics</p>
          </div>

          {/* Time Period Tabs */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={fetchAnalyticsData}
              className="p-2 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
              title="Refresh analytics"
            >
              <RefreshCw className="h-5 w-5 text-gray-600 group-hover:text-orange-600 group-hover:rotate-180 transition-all duration-300" />
            </button>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100">
                <TabsTrigger
                  value="today"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Today
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-300"
                >
                  This Week
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-300"
                >
                  This Month
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20">
                  <Loader2 className="h-12 w-12 text-orange-500" />
                </div>
              </div>
              <span className="mt-4 text-gray-600 font-medium">Loading analytics...</span>
              <div className="mt-8 w-full max-w-4xl space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards with Circular Progress */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const circumference = 2 * Math.PI * 28;
                  const strokeDashoffset = circumference - (stat.progress / 100) * circumference;

                  return (
                    <Card
                      key={index}
                      className="relative overflow-hidden group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      {/* Gradient border effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ margin: '-2px', zIndex: -1 }}
                      />
                      <div className="absolute inset-0 bg-white rounded-lg" style={{ margin: '0px' }} />

                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                            <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 border-0 shadow-sm"
                          >
                            <ArrowUp className="h-3 w-3 mr-1" />
                            {stat.change}
                          </Badge>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                              {stat.value}
                            </p>
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
                                className="text-gray-100"
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
                                className="text-orange-500 transition-all duration-1000"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-700">
                                {Math.round(stat.progress)}%
                              </span>
                            </div>
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
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Enhanced Revenue Visualization</CardTitle>
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
                    <RevenueChart data={revenueByHourData} dataType={revenueDataType} period={revenueTimeframe} height={280} />
                  </CardContent>
                </Card>

                {/* New Customers per Day */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">New Customers per Day</CardTitle>
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
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-gray-800">Top 5 Most-Selling Items</CardTitle>
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
                    {topSellingData.labels.length > 0 ? (
                      <HorizontalBarChart data={topSellingData} height={220} />
                    ) : (
                      <div className="flex items-center justify-center h-[220px] text-gray-400">
                        No data available for this period
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top 5 Least-Selling Items */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-gray-800">Top 5 Least-Selling Items</CardTitle>
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
                    {leastSellingItems.length > 0 ? (
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
                    ) : (
                      <div className="flex items-center justify-center h-[220px] text-gray-400">
                        No data available for this period
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Popular Food Item Combos */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-gray-800">Popular Food Item Combos</CardTitle>
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
                    {foodCombos.length > 0 ? (
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
                    ) : (
                      <div className="flex items-center justify-center h-[220px] text-gray-400">
                        No data available for this period
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Peak Order Times */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Peak Order Times</CardTitle>
                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 border-0 shadow-md">7 days average</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <PeakOrderBarChart height={200} data={peakHoursData} />
                </CardContent>
              </Card>

              {/* Recent Customer Activity */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Recent Customer Activity</CardTitle>
                    
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
          )}
        </div>
      </div>
    </>
  );
}
