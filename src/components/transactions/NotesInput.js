export default function NotesInput({ formData, handleChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Notes (Optional)
      </label>
      <div className="relative">
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="1"
          placeholder="Add any additional notes about this payment..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900 resize-none"
        />
      </div>
    </div>
  );
}