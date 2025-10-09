"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { MonthlyMetrics, WeeklyData } from '../utils/monthlyAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyProgressChartProps {
  metrics: MonthlyMetrics;
  weeklyData: WeeklyData[];
}

export default function MonthlyProgressChart({ metrics, weeklyData }: MonthlyProgressChartProps) {
  const labels = weeklyData.map(w => w.weekLabel);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Weight Lifted (kg)',
        data: weeklyData.map(w => w.weight),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Distance (km)',
        data: weeklyData.map(w => w.distance),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(209, 213, 219)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgb(55, 65, 81)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.5)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(55, 65, 81, 0.5)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        title: {
          display: true,
          text: 'Weight (kg)',
          color: 'rgb(59, 130, 246)',
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        title: {
          display: true,
          text: 'Distance (km)',
          color: 'rgb(239, 68, 68)',
        }
      },
    },
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-white mb-4">Monthly Progress</h3>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300">Total Weight Lifted</p>
          <p className="text-2xl font-bold text-blue-400">{metrics.totalWeight.toFixed(0)} kg</p>
        </div>
        <div className="border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300">Total Distance</p>
          <p className="text-2xl font-bold text-red-500">{metrics.totalDistance.toFixed(1)} km</p>
        </div>
        <div className="border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300">Total Time</p>
          <p className="text-2xl font-bold text-green-500">{metrics.totalTime.toFixed(0)} min</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
}
