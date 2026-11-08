
import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = '/property-fact-sheets';

const emptyForm = {
  projectName: '',
  location: '',
  configurations: '',
  priceRange: '',
  amenities: '',
  description: '',
  active: true
};

export default function PropertyFactSheets() {

  const { user } = useAuth();

  const isManager =
    user?.role === 'ADMIN' || user?.role === 'SALES_HEAD';
  const [facts, setFacts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadFacts = async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = isManager ? API : `${API}/active`;
        const response = await api.get(endpoint);
      setFacts(response.data);
    } catch {
      setError('Unable to load property fact sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEdit = (fact) => {
    setEditingId(fact.id);
    setForm({
      projectName: fact.projectName || '',
      location: fact.location || '',
      configurations: fact.configurations || '',
      priceRange: fact.priceRange || '',
      amenities: fact.amenities || '',
      description: fact.description || '',
      active: fact.active
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      if (editingId) {
        await api.put(`${API}/${editingId}`, form);
      } else {
        await api.post(API, form);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadFacts();
    } catch (err) {
      setError(err.response?.data || 'Unable to save property fact sheet.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property fact sheet?')) return;

    try {
      await api.delete(`${API}/${id}`);
      await loadFacts();
    } catch {
      setError('Unable to delete property fact sheet.');
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Property Fact Sheets
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage verified property information used by the AI assistant.
          </p>
        </div>

        <div className="flex gap-2">
      <button
        onClick={loadFacts}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg"
      >
        <RefreshCw size={16} /> Refresh
      </button>

    {isManager && (
    <button
      onClick={() => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
      }}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
      <Plus size={16} /> Add Project
      </button>
      )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg">
          {String(error)}
        </div>
      )}

      {isManager && showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold">
            {editingId ? 'Edit Property Fact Sheet' : 'Add Property Fact Sheet'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['projectName', 'Project Name'],
              ['location', 'Location'],
              ['configurations', 'Configurations'],
              ['priceRange', 'Price Range']
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required={name === 'projectName' || name === 'location'}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amenities</label>
            <textarea
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              rows="2"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            Active (available to AI assistant)
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading fact sheets...</p>
      ) : facts.length === 0 ? (
        <p className="bg-white border rounded-xl p-6 text-gray-500">
          No property fact sheets found.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {facts.map((fact) => (
            <div key={fact.id} className="bg-white border rounded-xl p-5 space-y-3">
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-lg">{fact.projectName}</h2>
                  <p className="text-sm text-gray-500">{fact.location}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full h-fit ${
                  fact.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {fact.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-sm"><strong>Configurations:</strong> {fact.configurations || 'Not specified'}</p>
              <p className="text-sm"><strong>Price:</strong> {fact.priceRange || 'Not specified'}</p>
              <p className="text-sm"><strong>Amenities:</strong> {fact.amenities || 'Not specified'}</p>
              <p className="text-sm text-gray-600">{fact.description}</p>

              {isManager && (
              <div className="flex gap-2 pt-2">
              <button
                  onClick={() => handleEdit(fact)}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm"
                >
                <Pencil size={15} /> Edit
              </button>

              <button
                onClick={() => handleDelete(fact.id)}
                className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm"
              >
                <Trash2 size={15} /> Delete
                </button>
              </div>
            )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
