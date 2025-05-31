// hooks/usePurchaseDataFetch.js - Extract data fetching logic
import { useState, useEffect } from "react";

export function usePurchaseDataFetch() {
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supplierRes, itemRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/items")
        ]);

        if (!supplierRes.ok || !itemRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [supplierData, itemData] = await Promise.all([
          supplierRes.json(),
          itemRes.json()
        ]);

        setSuppliers(supplierData.suppliers || []);
        setItems(itemData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load suppliers or items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { suppliers, items, loading };
}