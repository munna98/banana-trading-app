// components/purchases/PurchaseBasicInfo.js
import React from "react";

export default function PurchaseBasicInfo({
  formData,
  handleInputChange,
  suppliers,
  errors,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="w-full py-2 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
          required
        />
      </div>
      <div>
        <label
          htmlFor="supplierId"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Supplier <span className="text-red-500">*</span>
        </label>
        <select
          id="supplierId"
          name="supplierId"
          value={formData.supplierId}
          onChange={handleInputChange}
          className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${
            errors.supplierId ? "border-red-500" : "border-slate-300"
          }`}
          required
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.supplierId && (
          <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>
        )}
      </div>
    </div>
  );
}
