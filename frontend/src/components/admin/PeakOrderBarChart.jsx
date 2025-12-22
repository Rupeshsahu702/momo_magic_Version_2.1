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

export default function PeakOrderBarChart({ height = 250 }) {
  const data = {
    labels: ['12p', '2p', '4p', '6p'],
    datasets: [
      {
        label: 'Orders',
        data: [80, 60, 90, 45],
        backgroundColor: [
          'rgba(249, 115, 22, 0.4)',
          'rgba(249, 115, 22, 0.4)',
          'rgba(249, 115, 22, 1)', // Highlighted max value
          'rgba(249, 115, 22, 0.4)',
        ],
        borderColor: [
          'rgb(249, 115, 22)',
          'rgb(249, 115, 22)',
          'rgb(249, 115, 22)',
          'rgb(249, 115, 22)',
        ],
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
          label: function(context) {
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
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={data} options={options} />
    </div>
  );
}
