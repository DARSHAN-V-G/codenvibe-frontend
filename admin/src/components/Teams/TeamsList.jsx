import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Mail } from 'lucide-react';
import api from '../../utils/api';
import TeamForm from './TeamForm';

export default function TeamsList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await api.getAllTeams();
      console.log(response);
      setTeams(response.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = () => {
    setEditingTeam(null);
    setShowForm(true);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleDeleteTeam = async (teamName) => {
    if (!confirm(`Are you sure you want to delete team "${teamName}"?`)) {
      return;
    }

    try {
      await api.removeTeam(teamName);
      await loadTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team: ' + error.message);
    }
  };

  const handleFormSubmit = async (teamData) => {
    try {
      if (editingTeam) {
        await api.updateTeam(editingTeam.team_name, teamData);
      } else {
        await api.addTeam(teamData);
      }
      await loadTeams();
      setShowForm(false);
      setEditingTeam(null);
    } catch (error) {
      throw error;
    }
  };

  if (showForm) {
    return (
      <TeamForm
        team={editingTeam}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingTeam(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
          <p className="text-gray-600 mt-2">Manage registered teams and their members</p>
        </div>
        <button
          onClick={handleAddTeam}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Team</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {teams.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600">Create your first team to get started</p>
            </div>
          ) : (
            teams.map((team) => (
              <TeamCard
                key={team.team_name}
                team={team}
                onEdit={handleEditTeam}
                onDelete={handleDeleteTeam}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TeamCard({ team, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-green-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{team.team_name}</h3>
          <p className="text-gray-600">Year {team.year}</p>
          <p className="text-sm text-gray-500 mt-1">
            {team.roll_nos?.length || 0} member{(team.roll_nos?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(team)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit team"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(team.team_name)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete team"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {team.members && team.members.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Members
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {team.members.map((member, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{member}</span>
                  {team.roll_nos && team.roll_nos[index] && (
                    <span className="text-gray-400">({team.roll_nos[index]})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {team.roll_nos && team.roll_nos.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Roll Numbers</h4>
            <div className="flex flex-wrap gap-2">
              {team.roll_nos.map((rollNo, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                >
                  {rollNo}
                </span>
              ))}
            </div>
          </div>
        )}

        {team.emails && team.emails.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email Addresses
            </h4>
            <div className="space-y-1">
              {team.emails.map((email, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {email}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}