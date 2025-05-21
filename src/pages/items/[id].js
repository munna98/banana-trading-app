// pages/items/[id].js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ItemDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    fetch(`/api/items/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch item');
        }
        return res.json();
      })
      .then(data => {
        setItem(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-4">Loading item details...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!item) return <div className="p-4">Item not found.</div>;

  return (
    <div className="item-details max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Item #{item.id}</h1>
      <p><strong>Name:</strong> {item.name}</p>
      <p><strong>Unit:</strong> {item.unit}</p>
      {item.description && (
        <p className="mt-2"><strong>Description:</strong> {item.description}</p>
      )}
    </div>
  );
}
