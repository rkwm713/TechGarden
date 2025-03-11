import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flower2,
  Droplets,
  Sun,
  ThermometerSun,
  Shovel,
  AlertCircle,
  User,
  CalendarDays,
  Loader2,
  Map,
  List,
  Edit3,
  Plus,
  X,
  Save,
  Trash2,
  ClipboardList,
  Clock,
  ArrowRight,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Plot, PlotPlant, Profile, PlantStatus, PlotType, Task, PlotAssignment } from '../lib/types';
import UserSelect from '../components/UserSelect';

interface PlotWithPlants extends Plot {
  plants: PlotPlant[];
  tasks: Task[];
  assignments: PlotAssignment[];
}

interface PlotFormData {
  soil_ph: number;
  sunlight: string;
  soil_type: string;
  irrigation: string;
  plot_type: PlotType;
  notes?: string;
}

interface PlantFormData {
  plant_name: string;
  status: PlantStatus;
  planted_date: string;
  notes?: string;
}

function PlotAssignments({
  plot,
  onAssign,
  onRemove,
  canManage
}: {
  plot: PlotWithPlants;
  onAssign: (plotId: string, userId: string, role: 'primary' | 'helper') => void;
  onRemove: (assignmentId: string) => void;
  canManage: boolean;
}) {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignmentRole, setAssignmentRole] = useState<'primary' | 'helper'>('helper');

  const handleAssign = (user: Profile) => {
    onAssign(plot.id, user.id, assignmentRole);
    setShowAssignForm(false);
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Plot Assignments
        </h4>
        {canManage && (
          <button
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="text-techserv-blue hover:text-techserv-storm flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add User
          </button>
        )}
      </div>

      {showAssignForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Role
            </label>
            <select
              value={assignmentRole}
              onChange={(e) => setAssignmentRole(e.target.value as 'primary' | 'helper')}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2"
            >
              <option value="primary">Primary Gardener</option>
              <option value="helper">Helper</option>
            </select>
          </div>
          <UserSelect
            onSelect={handleAssign}
            placeholder="Search users to assign..."
          />
        </div>
      )}

      <div className="space-y-2">
        {plot.assignments?.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-600" />
              <span>{assignment.user?.username}</span>
              <span className="ml-2 text-sm text-gray-500 capitalize">
                ({assignment.role})
              </span>
            </div>
            {canManage && (
              <button
                onClick={() => onRemove(assignment.id)}
                className="text-gray-600 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold flex items-center">
          <ClipboardList className="h-5 w-5 mr-2" />
          Associated Tasks
        </h4>
        <a 
          href="/tasks" 
          className="text-sm text-techserv-blue hover:text-techserv-storm flex items-center"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </a>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-gray-50 rounded p-3 text-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-semibold">{task.title}</h5>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
            {task.description && (
              <p className="text-gray-600 mb-2 font-neuton">{task.description}</p>
            )}
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center">
                <Clock className={`h-3 w-3 mr-1 ${getPriorityColor(task.priority)}`} />
                <span className="capitalize">{task.priority}</span>
              </div>
              {task.due_date && (
                <div className="flex items-center">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlotCard({ 
  plot,
  userProfile,
  onUpdate,
  onAddPlant,
  onUpdatePlant,
  onDeletePlant
}: { 
  plot: PlotWithPlants;
  userProfile: Profile;
  onUpdate: (id: string, data: PlotFormData) => Promise<void>;
  onAddPlant: (plotId: string, data: PlantFormData) => Promise<void>;
  onUpdatePlant: (plantId: string, data: PlantFormData) => Promise<void>;
  onDeletePlant: (plantId: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlotFormData>({
    soil_ph: plot.soil_ph,
    sunlight: plot.sunlight,
    soil_type: plot.soil_type,
    irrigation: plot.irrigation,
    plot_type: plot.plot_type,
    notes: plot.notes
  });
  const [plantFormData, setPlantFormData] = useState<PlantFormData>({
    plant_name: '',
    status: 'seeded',
    planted_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const canEdit = userProfile.role === 'admin' || userProfile.role === 'mod';

  const getPlotTypeColor = (type: PlotType) => {
    switch (type) {
      case 'Ground Planted': return 'bg-green-100 text-green-800';
      case 'Raised Bed': return 'bg-yellow-100 text-yellow-800';
      case 'Pathway': return 'bg-gray-100 text-gray-800';
      case 'Sitting Area': return 'bg-blue-100 text-blue-800';
      case 'Available': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'seeded': return 'bg-yellow-100 text-yellow-800';
      case 'sprouting': return 'bg-green-100 text-green-800';
      case 'growing': return 'bg-emerald-100 text-emerald-800';
      case 'harvesting': return 'bg-blue-100 text-blue-800';
      case 'finished': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(plot.id, formData);
    setIsEditing(false);
  };

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddPlant(plot.id, plantFormData);
    setIsAddingPlant(false);
    setPlantFormData({
      plant_name: '',
      status: 'seeded',
      planted_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleUpdatePlant = async (e: React.FormEvent, plantId: string) => {
    e.preventDefault();
    await onUpdatePlant(plantId, plantFormData);
    setEditingPlantId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold">Plot {plot.number}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-gray-600 font-neuton">{plot.size}</p>
            <span className={`px-2 py-1 rounded-full text-xs ${getPlotTypeColor(plot.plot_type)}`}>
              {plot.plot_type}
            </span>
          </div>
        </div>
        {plot.assigned_to && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span>Assigned</span>
          </div>
        )}
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-4 p-2 text-gray-600 hover:text-techserv-blue rounded-lg"
          >
            <Edit3 className="h-5 w-5" />
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plot Type
              </label>
              <select
                value={formData.plot_type}
                onChange={(e) => setFormData({ ...formData, plot_type: e.target.value as PlotType })}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                required
              >
                <option value="Ground Planted">Ground Planted</option>
                <option value="Raised Bed">Raised Bed</option>
                <option value="Pathway">Pathway</option>
                <option value="Sitting Area">Sitting Area</option>
                <option value="Available">Available</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil pH
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.soil_ph}
                onChange={(e) => setFormData({ ...formData, soil_ph: parseFloat(e.target.value) })}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sunlight
              </label>
              <select
                value={formData.sunlight}
                onChange={(e) => setFormData({ ...formData, sunlight: e.target.value })}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                required
              >
                <option value="Full Sun">Full Sun</option>
                <option value="Partial Shade">Partial Shade</option>
                <option value="Full Shade">Full Shade</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil Type
              </label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                required
              >
                <option value="Loamy">Loamy</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay Loam">Clay Loam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Irrigation
              </label>
              <select
                value={formData.irrigation}
                onChange={(e) => setFormData({ ...formData, irrigation: e.target.value })}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                required
              >
                <option value="Drip">Drip</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <ThermometerSun className="h-5 w-5 text-yellow-500" />
            <span>pH {plot.soil_ph}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Sun className="h-5 w-5 text-orange-500" />
            <span>{plot.sunlight}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Shovel className="h-5 w-5 text-brown-500" />
            <span>{plot.soil_type}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Droplets className="h-5 w-5 text-blue-500" />
            <span>{plot.irrigation}</span>
          </div>
        </div>
      )}

      {plot.notes && !isEditing && (
        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 font-neuton">
          {plot.notes}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-semibold">Current Plants</h4>
          {canEdit && (
            <button
              onClick={() => setIsAddingPlant(true)}
              className="text-techserv-blue hover:text-techserv-storm flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Plant
            </button>
          )}
        </div>

        {isAddingPlant && (
          <form onSubmit={handleAddPlant} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plant Name
                </label>
                <input
                  type="text"
                  value={plantFormData.plant_name}
                  onChange={(e) => setPlantFormData({ ...plantFormData, plant_name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={plantFormData.status}
                  onChange={(e) => setPlantFormData({ ...plantFormData, status: e.target.value as PlantStatus })}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                  required
                >
                  <option value="seeded">Seeded</option>
                  <option value="sprouting">Sprouting</option>
                  <option value="growing">Growing</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planted Date
                </label>
                <input
                  type="date"
                  value={plantFormData.planted_date}
                  onChange={(e) => setPlantFormData({ ...plantFormData, planted_date: e.target.value })}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={plantFormData.notes || ''}
                  onChange={(e) => setPlantFormData({ ...plantFormData, notes: e.target.value })}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingPlant(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Add Plant
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {plot.plants.map((plant) => (
            <div
              key={plant.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              {editingPlantId === plant.id ? (
                <form 
                  onSubmit={(e) => handleUpdatePlant(e, plant.id)}
                  className="w-full grid grid-cols-2 gap-4"
                >
                  <input
                    type="text"
                    value={plantFormData.plant_name}
                    onChange={(e) => setPlantFormData({ ...plantFormData, plant_name: e.target.value })}
                    className="rounded-md border border-gray-300 shadow-sm p-2"
                    required
                  />
                  <select
                    value={plantFormData.status}
                    onChange={(e) => setPlantFormData({ ...plantFormData, status: e.target.value as PlantStatus })}
                    className="rounded-md border border-gray-300 shadow-sm p-2"
                    required
                  >
                    <option value="seeded">Seeded</option>
                    <option value="sprouting">Sprouting</option>
                    <option value="growing">Growing</option>
                    <option value="harvesting">Harvesting</option>
                    <option value="finished">Finished</option>
                  </select>
                  <input
                    type="date"
                    value={plantFormData.planted_date}
                    onChange={(e) => setPlantFormData({ ...plantFormData, planted_date: e.target.value })}
                    className="rounded-md border border-gray-300 shadow-sm p-2"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingPlantId(null)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Flower2 className="h-4 w-4 text-green-600" />
                    <span>{plant.plant_name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      <span>{new Date(plant.planted_date).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(plant.status)}`}>
                      {plant.status}
                    </span>
                    {canEdit && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingPlantId(plant.id);
                            setPlantFormData({
                              plant_name: plant.plant_name,
                              status: plant.status,
                              planted_date: plant.planted_date.split('T')[0],
                              notes: plant.notes
                            });
                          }}
                          className="text-gray-600 hover:text-techserv-blue"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeletePlant(plant.id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <TaskList tasks={plot.tasks} />
    </div>
  );
}

function GardenMap({ plots, selectedPlot, onPlotSelect }: {
  plots: PlotWithPlants[];
  selectedPlot: string | null;
  onPlotSelect: (plotId: string) => void;
}) {
  const rows = 6;
  const cols = 12;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="relative w-full" style={{ paddingBottom: '50%' }}>
        <div className="absolute inset-0 grid grid-cols-12 gap-1 p-4">
          {Array.from({ length: rows * cols }).map((_, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const plotNumber = (row * cols + col + 1).toString();
            const plot = plots.find(p => p.number === plotNumber);
            const isSelected = plot?.id === selectedPlot;
            const hasPlants = plot?.plants.length > 0;
            const hasTasks = plot?.tasks.length > 0;

            return (
              <button
                key={index}
                onClick={() => plot && onPlotSelect(plot.id)}
                className={`
                  relative aspect-square rounded-lg border-2 transition-all
                  ${plot ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
                  ${isSelected ? 'border-techserv-blue bg-techserv-sky' : 'border-gray-300'}
                  ${hasPlants ? 'bg-green-50' : 'bg-white'}
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                  {plotNumber}
                </div>
                {plot?.assigned_to && (
                  <div className="absolute top-1 right-1">
                    <User className="h-3 w-3 text-techserv-blue" />
                  </div>
                )}
                {hasPlants && (
                  <div className="absolute bottom-1 right-1">
                    <Flower2 className="h-3 w-3 text-green-600" />
                  </div>
                )}
                {hasTasks && (
                  <div className="absolute bottom-1 left-1">
                    <ClipboardList className="h-3 w-3 text-yellow-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Garden Dimensions: 45' × 90'</p>
        <p>Individual Plot Size: 7.5' × 7.5'</p>
      </div>
    </div>
  );
}

export default function GardenPlots() {
  const navigate = useNavigate();
  const [plots, setPlots] = useState<PlotWithPlants[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);

  const fetchPlots = async () => {
    try {
      const { data: plotsData, error: plotsError } = await supabase
        .from('plots')
        .select(`
          *,
          plants:plot_plants(*),
          tasks(*),
          assignments:plot_assignments(
            id,
            role,
            user:user_id(id, username, email)
          )
        `)
        .order('number');

      if (plotsError) throw plotsError;
      setPlots(plotsData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching plots:', err);
      setError('Failed to refresh plots. Please try again.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profile);

        await fetchPlots();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load garden plots. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleUpdatePlot = async (plotId: string, data: PlotFormData) => {
    try {
      const { error: updateError } = await supabase
        .from('plots')
        .update(data)
        .eq('id', plotId);

      if (updateError) throw updateError;
      await fetchPlots();
    } catch (err) {
      console.error('Error updating plot:', err);
      setError('Failed to update plot. Please try again.');
    }
  };

  const handleAddPlant = async (plotId: string, data: PlantFormData) => {
    try {
      const { error: insertError } = await supabase
        .from('plot_plants')
        .insert([{ ...data, plot_id: plotId }]);

      if (insertError) throw insertError;
      await fetchPlots();
    } catch (err) {
      console.error('Error adding plant:', err);
      setError('Failed to add plant. Please try again.');
    }
  };

  const handleUpdatePlant = async (plantId: string, data: PlantFormData) => {
    try {
      const { error: updateError } = await supabase
        .from('plot_plants')
        .update(data)
        .eq('id', plantId);

      if (updateError) throw updateError;
      await fetchPlots();
    } catch (err) {
      console.error('Error updating plant:', err);
      setError('Failed to update plant. Please try again.');
    }
  };

  const handleDeletePlant = async (plantId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('plot_plants')
        .delete()
        .eq('id', plantId);

      if (deleteError) throw deleteError;
      await fetchPlots();
    } catch (err) {
      console.error('Error deleting plant:', err);
      setError('Failed to delete plant. Please try again.');
    }
  };

  const handleAssignUser = async (plotId: string, userId: string, role: 'primary' | 'helper') => {
    try {
      const { error: assignError } = await supabase
        .from('plot_assignments')
        .insert([{
          plot_id: plotId,
          user_id: userId,
          role
        }]);

      if (assignError) throw assignError;
      await fetchPlots();
    } catch (err) {
      console.error('Error assigning user:', err);
      setError('Failed to assign user. Please try again.');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error: removeError } = await supabase
        .from('plot_assignments')
        .delete()
        .eq('id', assignmentId);

      if (removeError) throw removeError;
      await fetchPlots();
    } catch (err) {
      console.error('Error removing assignment:', err);
      setError('Failed to remove assignment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error || 'Failed to load profile. Please try again later.'}</p>
        </div>
      </div>
    );
  }

  const selectedPlotData = plots.find(plot => plot.id === selectedPlot);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">GARDEN PLOTS</h1>
          <p className="text-gray-600 font-neuton">
            Explore our community garden plots and their current plantings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-techserv-sky text-techserv-blue' : 'text-gray-600'}`}
          >
            <Map className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-techserv-sky text-techserv-blue' : 'text-gray-600'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="space-y-6">
          <GardenMap
            plots={plots}
            selectedPlot={selectedPlot}
            onPlotSelect={setSelectedPlot}
          />
          {selectedPlotData && (
            <PlotCard
              plot={selectedPlotData}
              userProfile={userProfile}
              onUpdate={handleUpdatePlot}
              onAddPlant={handleAddPlant}
              onUpdatePlant={handleUpdatePlant}
              onDeletePlant={handleDeletePlant}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot) => (
            <PlotCard
              key={plot.id}
              plot={plot}
              userProfile={userProfile}
              onUpdate={handleUpdatePlot}
              onAddPlant={handleAddPlant}
              onUpdatePlant={handleUpdatePlant}
              onDeletePlant={handleDeletePlant}
            />
          ))}
        </div>
      )}

      {plots.length === 0 && (
        <div className="text-center py-12">
          <Flower2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-neuton">No garden plots available at the moment.</p>
        </div>
      )}
    </div>
  );
}