export default function ReferenceInput({ paymentMethod, formData, handleChange, getReferencePlaceholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {getReferencePlaceholder(paymentMethod)} (Optional)
      </label>
      <input
        type="text"
        id="reference"
        name="reference"
        value={formData.reference}
        onChange={handleChange}
        placeholder={getReferencePlaceholder(paymentMethod)}
        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
      />
    </div>
  );
}