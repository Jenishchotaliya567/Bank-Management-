import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#9ca3af',
        font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 11 } },
      grid: { color: 'rgba(255, 255, 255, 0.05)' }
    },
    y: {
      ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 11 } },
      grid: { color: 'rgba(255, 255, 255, 0.05)' }
    }
  }
};

export const BarChart = ({ data, options = {} }) => (
  <div style={{ height: '300px', width: '100%' }}>
    <Bar data={data} options={{ ...defaultOptions, ...options }} />
  </div>
);

export const LineChart = ({ data, options = {} }) => (
  <div style={{ height: '300px', width: '100%' }}>
    <Line data={data} options={{ ...defaultOptions, ...options }} />
  </div>
);

export const DoughnutChart = ({ data, options = {} }) => {
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } }
      }
    }
  };
  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Doughnut data={data} options={{ ...doughnutOptions, ...options }} />
    </div>
  );
};
