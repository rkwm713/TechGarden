import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Edit3,
  Save,
  GripHorizontal,
  CheckCircle2,
  XCircle,
  Trash2
} from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import type { Task, Profile, Plot, TaskPriority } from '../lib/types';
import UserSelect from './UserSelect';

interface TaskCardProps {
  task: Task;
  onVolunteer: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onReopen: (taskId: string) => void;
  onUpdate: (taskId: string, data: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  userProfile: Profile | null;
  plots: Plot[];
}

export default function TaskCard({ 
  task, 
  onVolunteer, 
  onComplete, 
  onReopen, 
  onUpdate,
  onDelete,
  userProfile, 
  plots 
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    due_date: task.due_date?.split('T')[0] || '',
    priority: task.priority,
    plot_id: task.plot_id || ''
  });
  const [selectedAssignee, setSelectedAssignee] = useState<Profile | null>(
    task.assignee || null
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const isAssignedToUser = task.assigned_to === userProfile?.id;
  const canComplete = isAssignedToUser && task.status === 'assigned';
  const canReopen = (userProfile?.role === 'admin' || userProfile?.role === 'mod') && task.status === 'completed';
  const canEdit = userProfile?.role === 'admin' || userProfile?.role === 'mod';
  const canDelete = userProfile?.role === 'admin' || userProfile?.role === 'mod';

  const handleSave = async () => {
    const updates: Partial<Task> = {
      title: editData.title.trim(),
      description: editData.description.trim(),
      priority: editData.priority as TaskPriority,
      plot_id: editData.plot_id || null,
      assigned_to: selectedAssignee?.id || null,
      assigned_by: selectedAssignee ? userProfile?.id : null,
      assigned_at: selectedAssignee ? new Date().toISOString() : null,
      status: selectedAssignee ? 'assigned' : 'open'
    };

    if (editData.due_date) {
      updates.due_date = new Date(editData.due_date).toISOString();
    }

    await onUpdate(task.id, updates);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(task.id);
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-lg shadow-lg p-4 mb-4"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={editData.due_date}
                onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value as TaskPriority })}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associated Plot
              </label>
              <select
                value={editData.plot_id}
                onChange={(e) => setEditData({ ...editData, plot_id: e.target.value })}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              >
                <option value="">No specific plot</option>
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    Plot {plot.number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <UserSelect
                onSelect={setSelectedAssignee}
                selectedUsers={selectedAssignee ? [selectedAssignee] : []}
                onRemove={() => setSelectedAssignee(null)}
                placeholder="Search users to assign..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-lg p-4 mb-4 cursor-move ${
        task.status === 'completed' ? 'opacity-75' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-600 hover:text-techserv-blue"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className={`text-gray-600 ${showDeleteConfirm ? 'hover:text-red-700 text-red-600' : 'hover:text-red-600'}`}
                  title={showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete task'}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <div {...attributes} {...listeners}>
                <GripHorizontal className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <p className="text-gray-600 font-neuton mt-2">{task.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {task.due_date
              ? new Date(task.due_date).toLocaleDateString()
              : 'No due date'}
          </span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Clock className={`h-4 w-4 mr-2 ${getPriorityColor(task.priority)}`} />
          <span className="capitalize">{task.priority} Priority</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <User className="h-4 w-4 mr-2" />
          {task.assignee ? (
            <Link 
              to={`/profile/${task.assignee.username}`}
              className="hover:text-techserv-blue"
            >
              {task.assignee.username}
            </Link>
          ) : (
            <span>Unassigned</span>
          )}
          {task.assigner && (
            <span className="ml-1 text-gray-500">
              (assigned by{' '}
              <Link 
                to={`/profile/${task.assigner.username}`}
                className="hover:text-techserv-blue"
              >
                {task.assigner.username}
              </Link>
              )
            </span>
          )}
        </div>
        {task.plot && (
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Plot {task.plot.number}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t space-y-2">
        {task.status === 'open' && userProfile?.role === 'ruser' && (
          <button
            onClick={() => onVolunteer(task.id)}
            className="btn-primary w-full text-sm flex items-center justify-center"
          >
            <User className="mr-2 h-4 w-4" />
            Volunteer
          </button>
        )}
        {canComplete && (
          <button
            onClick={() => onComplete(task.id)}
            className="btn-primary w-full text-sm flex items-center justify-center bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark Complete
          </button>
        )}
        {canReopen && (
          <button
            onClick={() => onReopen(task.id)}
            className="btn-secondary w-full text-sm flex items-center justify-center"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reopen Task
          </button>
        )}
      </div>
    </div>
  );
}