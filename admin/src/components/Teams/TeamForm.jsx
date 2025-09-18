import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function TeamForm({ team, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    team_name: '',
    year: 1,
    members: [''],
    roll_nos: [''],
    emails: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Editing team:', team);
    if (team) {
      setFormData({
        team_name: team.team_name || '',
        year: team.year || 1,
        members: team.members && team.members.length > 0 ? team.members : [''],
        roll_nos: team.roll_nos && team.roll_nos.length > 0 ? team.roll_nos : [''],
        emails: team.emails && team.emails.length > 0 ? team.emails : [''],
      });
    }
  }, [team]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item),
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.team_name.trim()) {
      setError('Team name is required');
      return;
    }

    // Filter out empty values
    const cleanedData = {
      ...formData,
      members: formData.members.filter(m => m.trim()),
      roll_nos: formData.roll_nos.filter(r => r.trim()),
      emails: formData.emails.filter(e => e.trim()),
    };

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = cleanedData.emails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      setError('Please enter valid email addresses');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(cleanedData);
    } catch (error) {
      setError(error.message || 'Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  const ArrayField = ({ label, field, placeholder, type = 'text' }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => addArrayItem(field)}
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
          disabled={loading}
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
      <div className="space-y-2">
        {formData[field].map((value, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type={type}
              value={value}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={placeholder}
              disabled={loading}
            />
            {formData[field].length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem(field, index)}
                className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {team ? 'Edit Team' : 'Add New Team'}
            </h1>
            <p className="text-gray-600 mt-2">
              {team ? 'Update the team details below' : 'Create a new team registration'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="team_name" className="block text-sm font-medium text-gray-700 mb-2">
                Team Name
              </label>
              <input
                type="text"
                id="team_name"
                value={formData.team_name}
                onChange={(e) => handleInputChange('team_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter team name..."
                disabled={loading || !!team} // Disable editing team name for existing teams
                required
              />
              {team && (
                <p className="text-xs text-gray-500 mt-1">Team name cannot be changed</p>
              )}
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
          
          <div className="space-y-6">
            <ArrayField
              label="Member Names"
              field="members"
              placeholder="Enter member name..."
            />
            
            <ArrayField
              label="Roll Numbers"
              field="roll_nos"
              placeholder="Enter roll number..."
            />
            
            <ArrayField
              label="Email Addresses"
              field="emails"
              placeholder="Enter email address..."
              type="email"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Saving...' : 'Save Team'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}