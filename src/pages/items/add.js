// pages/items/add.js

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AddItem() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', unit: 'Kg', description: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optional: if unit is empty, default to "Kg"
    const dataToSend = {
      ...formData,
      unit: formData.unit.trim() || 'Kg',
      description: formData.description.trim() || null,
    };

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      router.push('/items');
    } else {
      const error = await res.json();
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="add-item max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Item Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description (optional):</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Unit:</label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g., Kg, Dozen"
            className="w-full border rounded px-3 py-2"
          />
          <small className="text-gray-500">Default is "Kg" if left blank</small>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Item
        </button>
      </form>
    </div>
  );
}
