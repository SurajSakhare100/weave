import Layout from '@/components/Layout';
import { useState } from 'react';
import type { FormEvent } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    // Dummy register logic
    alert(`Registered as ${role}: ${name}`);
  };

  return (
    <Layout>
      <section className="py-16 bg-[#faf5f2] min-h-screen flex items-center justify-center">
        <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow p-8 flex flex-col items-center w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">Register</h1>
          <div className="mb-4 w-full">
            <label className="block mb-1 text-gray-700">Name</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-6 w-full">
            <label className="block mb-1 text-gray-700">Role</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition w-full font-semibold"
          >
            Register
          </button>
        </form>
      </section>
    </Layout>
  );
} 