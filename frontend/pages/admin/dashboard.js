import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    const user = JSON.parse(userData);
    if (!user.isAdmin) {
      router.push('/admin/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersData, paymentsData] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/payments'),
      ]);
      setUsers(usersData.users);
      setPayments(paymentsData.payments);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (!confirm('Are you sure you want to make this user an admin?')) {
      return;
    }

    try {
      await api.post('/admin/make-admin', { userId });
      alert('User promoted to admin');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to promote user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-700 hover:underline">
              User Dashboard
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/admin/login');
              }}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Payments ({payments.length})
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Admin</th>
                  <th className="px-4 py-3 text-left">Usage</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.name || '-'}</td>
                    <td className="px-4 py-3">
                      {user.isAdmin ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user._count.planUsages} tests, {user._count.resumeChecks} resumes
                    </td>
                    <td className="px-4 py-3">
                      {!user.isAdmin && (
                        <button
                          onClick={() => handleMakeAdmin(user.id)}
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t">
                    <td className="px-4 py-3">{payment.user.email}</td>
                    <td className="px-4 py-3">
                      {payment.currency} {payment.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{payment.razorpayOrderId}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

