// src/components/admin/RevenueChart.jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RevenueChart({ data = null, dataType = 'hourly', period = 'today', height = 300 }) {
  // Format hour labels (e.g., "12 AM", "1 PM")
  const formatHourLabel = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Format day of week label
  const getDayOfWeekName = (dayOfWeek) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayOfWeek - 1] || '';
  };

  const hasData = data && data.length > 0;
  let labels = [];
  let revenueValues = [];
  let filteredData = [];

  if (dataType === 'hourly') {
    // Hourly data (for "Today")
    if (hasData) {
      const activeHours = data.filter(item => item.revenue > 0);

      if (activeHours.length > 0) {
        const minHour = Math.min(...activeHours.map(item => item.hour));
        const maxHour = Math.max(...activeHours.map(item => item.hour));
        const startHour = Math.max(0, minHour - 1);
        const endHour = Math.min(23, maxHour + 1);
        filteredData = data.filter(item => item.hour >= startHour && item.hour <= endHour);
      } else {
        filteredData = data;
      }
    }

    labels = filteredData.map(item => formatHourLabel(item.hour));
    revenueValues = filteredData.map(item => item.revenue);
  } else {
    // Daily data (for "This Week" or "This Month")
    filteredData = data || [];

    // Different label format for week vs month
    if (period === 'week') {
      // For weekly: show day names (Mon, Tue, Wed...)
      labels = filteredData.map(item => getDayOfWeekName(item.dayOfWeek));
    } else {
      // For monthly: show dates (1, 2, 3... or Dec 1, Dec 2...)
      labels = filteredData.map(item => `${item.day}`);
    }

    revenueValues = filteredData.map(item => item.revenue);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: revenueValues,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: 'rgb(249, 115, 22)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: period === 'week' ? 6 : 4,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 3,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        displayColors: true,
        callbacks: {
          label: function (context) {
            return 'Revenue: ₹' + context.parsed.y.toLocaleString();
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: '500',
          },
          maxRotation: period === 'month' ? 45 : 0,
          minRotation: 0,
          autoSkip: period === 'month',
          maxTicksLimit: period === 'month' ? 15 : 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          padding: 8,
          callback: function (value) {
            return '₹' + value.toLocaleString();
          }
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      {filteredData.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          No revenue data available for this period
        </div>
      )}
    </div>
  );
}
