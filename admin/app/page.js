"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { useState, useEffect } from 'react';
import { getAdminMetrics } from '@/utils/api';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await getAdminMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const lineChartData = {
    labels: metrics?.salesByDate?.map(s => s._id) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Revenue',
        data: metrics?.salesByDate?.map(s => s.totalSales) || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false },
      x: { grid: { display: false } }
    }
  };

  const barChartData = {
    labels: ['Groceries', 'Electronics', 'Snacks', 'Clothes', 'Cosmetics'],
    datasets: [
      {
        label: 'Sales by Category',
        data: [65, 30, 45, 20, 15],
        backgroundColor: '#F97316',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Sales', value: `$${metrics?.totalSales?.toFixed(2) || '0.00'}`, icon: '💰', color: 'bg-green-100 text-green-700' },
          { title: 'Total Orders', value: metrics?.ordersCount || '0', icon: '📦', color: 'bg-blue-100 text-[#2563EB]' },
          { title: 'Active Users', value: metrics?.usersCount || '0', icon: '👥', color: 'bg-purple-100 text-purple-700' },
          { title: 'Products', value: metrics?.productsCount || '0', icon: '🏷️', color: 'bg-orange-100 text-[#F97316]' },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
             <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl ${metric.color}`}>
               {metric.icon}
             </div>
             <div>
               <p className="text-sm font-semibold text-gray-500">{metric.title}</p>
               <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Analytics</h2>
          <div className="h-[300px] w-full">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Categories</h2>
          <div className="h-[300px] w-full">
            <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Recent Orders Table List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 font-semibold text-gray-500 text-sm">Order ID</th>
                <th className="pb-3 font-semibold text-gray-500 text-sm">Customer</th>
                <th className="pb-3 font-semibold text-gray-500 text-sm">Date</th>
                <th className="pb-3 font-semibold text-gray-500 text-sm">Total</th>
                <th className="pb-3 font-semibold text-gray-500 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                  <td className="py-4 font-bold text-gray-900 text-sm">#ORD-000{i}</td>
                  <td className="py-4 text-gray-600 text-sm">John Doe</td>
                  <td className="py-4 text-gray-600 text-sm">Oct 24, 2025</td>
                  <td className="py-4 font-bold text-gray-900 text-sm">$45.00</td>
                  <td className="py-4">
                    <span className="bg-blue-100 text-[#2563EB] px-2 py-1 rounded text-xs font-bold">Processing</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
