// src/components/admin/PeakOrderBarChart.jsx
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PeakOrderBarChart({ data = [], height = 250 }) {
  // Format hour labels (e.g., "12 AM", "1 PM")
  const formatHourLabel = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Use real data if provided, otherwise show empty chart
  const hasData = data && data.length > 0;
  const labels = hasData
    ? data.map(item => formatHourLabel(item.hour))
    : [];

  const orderCounts = hasData
    ? data.map(item => item.orderCount)
    : [];

  // Find the maximum order count to highlight the peak hour
  const maxOrderCount = Math.max(...orderCounts, 0);

  // Create background colors array - highlight the peak hour
  const backgroundColors = orderCounts.map(count =>
    count === maxOrderCount && count > 0
      ? 'rgba(249, 115, 22, 1)' // Highlighted peak
      : 'rgba(249, 115, 22, 0.4)' // Normal
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Orders',
        data: orderCounts,
        backgroundColor: backgroundColors,
        borderColor: orderCounts.map(() => 'rgb(249, 115, 22)'),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return 'Orders: ' + context.parsed.y;
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
            size: 12,
            weight: 'bold',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          display: true,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
