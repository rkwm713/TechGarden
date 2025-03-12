import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Calendar,
  AlertCircle,
  Clock,
  User,
  GripHorizontal,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ListPlus,
  MapPin,
  Edit3,
  Save,
  Users,
  Filter,
  SortAsc
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  pointerWithin,
  getFirstCollision,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { supabase } from '../supabaseClient';
import type { Task, Profile, TaskStatus, TaskPriority, Plot } from '../lib/types';
import { DEFAULT_GARDEN_TASKS } from '../lib/types';
import TaskCard from '../components/TaskCard';
import UserSelect from '../components/UserSelect';

interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  plot_id: string;
  assigned_to?: string;
}

interface Container {
  id: string;
  title: string;
  status: TaskStatus;
}

const containers: Container[] = [
  { id: 'open', title: 'OPEN TASKS', status: 'open' },
  { id: 'assigned', title: 'IN PROGRESS', status: 'assigned' },
  { id: 'completed', title: 'COMPLETED', status: 'completed' }
];

type SortOption = 'none' | 'plot' | 'assignee';

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showDefaultTasks, setShowDefaultTasks] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<Profile | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [filterByPlot, setFilterByPlot] = useState<string>('');
  const [filterByAssignee, setFilterByAssignee] = useState<string>('');
  const [newTask, setNewTask] = useState<TaskFormData>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    plot_id: ''
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const fetchTasks = async () => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          creator:created_by(id, email, username),
          assignee:assigned_to(id, email, username),
          assigner:assigned_by(id, email, username),
          plot:plot_id(id, number)
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to refresh tasks. Please try again.');
    }
  };

  const fetchPlots = async () => {
    try {
      const { data: plotsData, error: plotsError } = await supabase
        .from('plots')
        .select('id, number')
        .order('number');

      if (plotsError) throw plotsError;
      setPlots(plotsData || []);
    } catch (err) {
      console.error('Error fetching plots:', err);
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

        await Promise.all([fetchTasks(), fetchPlots()]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const findContainer = (id: UniqueIdentifier) => {
    if (id === 'open' || id === 'assigned' || id === 'completed') {
      return id;
    }
    
    const task = tasks.find(t => t.id === id);
    return task ? task.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const overContainerDef = containers.find(c => c.id === overContainer);
    if (!overContainerDef) return;

    setTasks(prev => {
      return prev.map(task => 
        task.id === active.id 
          ? { ...task, status: overContainerDef.status }
          : task
      );
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      setActiveId(null);
      return;
    }

    const overContainerDef = containers.find(c => c.id === overContainer);
    if (!overContainerDef) {
      setActiveId(null);
      return;
    }

    try {
      const updates: Partial<Task> = {
        status: overContainerDef.status,
      };

      if (overContainerDef.status === 'assigned') {
        updates.assigned_to = userProfile?.id;
        updates.assigned_by = userProfile?.id;
        updates.assigned_at = new Date().toISOString();
      } else if (overContainerDef.status === 'open') {
        updates.assigned_to = null;
        updates.assigned_by = null;
        updates.assigned_at = null;
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', active.id);

      if (updateError) throw updateError;
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
      await fetchTasks();
    }

    setActiveId(null);
  };

  const handleVolunteer = async (taskId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'assigned',
          assigned_to: userProfile?.id,
          assigned_by: userProfile?.id,
          assigned_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (updateError) throw updateError;
      await fetchTasks();
    } catch (err) {
      console.error('Error volunteering for task:', err);
      setError('Failed to volunteer for task. Please try again.');
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'completed'
        })
        .eq('id', taskId)
        .eq('assigned_to', userProfile?.id);

      if (updateError) throw updateError;
      await fetchTasks();
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to complete task. Please try again.');
    }
  };

  const handleReopen = async (taskId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'open',
          assigned_to: null,
          assigned_by: null,
          assigned_at: null
        })
        .eq('id', taskId);

      if (updateError) throw updateError;
      await fetchTasks();
    } catch (err) {
      console.error('Error reopening task:', err);
      setError('Failed to reopen task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
    try {
      const cleanData: Partial<Task> = {
        ...data,
        plot_id: data.plot_id || null,
        description: data.description?.trim() || null,
        status: data.status || undefined
      };

      if (!cleanData.due_date) {
        delete cleanData.due_date;
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update(cleanData)
        .eq('id', taskId);

      if (updateError) throw updateError;
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) throw deleteError;
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        priority: newTask.priority,
        created_by: userProfile?.id,
        status: 'open' as TaskStatus,
        plot_id: newTask.plot_id || null,
        assigned_to: selectedAssignee?.id || null,
        assigned_by: selectedAssignee ? userProfile?.id : null,
        assigned_at: selectedAssignee ? new Date().toISOString() : null
      };

      if (newTask.due_date) {
        taskData.due_date = new Date(newTask.due_date).toISOString();
      }

      const { error: createError } = await supabase
        .from('tasks')
        .insert([taskData]);

      if (createError) throw createError;

      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        plot_id: ''
      });
      setSelectedAssignee(null);
      setShowNewTaskForm(false);
      await fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  const handleCreateDefaultTask = async (defaultTask: typeof DEFAULT_GARDEN_TASKS[number]) => {
    try {
      const taskData = {
        title: defaultTask.title,
        description: defaultTask.description,
        priority: defaultTask.priority,
        created_by: userProfile?.id,
        status: 'open' as TaskStatus
      };

      const { error: createError } = await supabase
        .from('tasks')
        .insert([taskData]);

      if (createError) throw createError;
      await fetchTasks();
    } catch (err) {
      console.error('Error creating default task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  const sortTasks = (tasksToSort: Task[]) => {
    let sortedTasks = [...tasksToSort];

    switch (sortBy) {
      case 'plot':
        sortedTasks.sort((a, b) => {
          if (!a.plot && !b.plot) return 0;
          if (!a.plot) return 1;
          if (!b.plot) return -1;
          return a.plot.number.localeCompare(b.plot.number);
        });
        break;
      case 'assignee':
        sortedTasks.sort((a, b) => {
          if (!a.assignee && !b.assignee) return 0;
          if (!a.assignee) return 1;
          if (!b.assignee) return -1;
          return a.assignee.username.localeCompare(b.assignee.username);
        });
        break;
    }

    if (filterByPlot) {
      sortedTasks = sortedTasks.filter(task => task.plot_id === filterByPlot);
    }

    if (filterByAssignee) {
      sortedTasks = sortedTasks.filter(task => task.assigned_to === filterByAssignee);
    }

    return sortedTasks;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <ClipboardList className="mr-2 h-8 w-8" />
          VOLUNTEER TASKS
        </h1>
        <div className="flex items-center space-x-4">
          {(userProfile?.role === 'admin' || userProfile?.role === 'mod') && (
            <>
              <button
                onClick={() => setShowDefaultTasks(!showDefaultTasks)}
                className="btn-secondary flex items-center font-saira"
              >
                <ListPlus className="mr-2 h-5 w-5 font-saira" />
                ADD DEFAULT TASK
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              <button
                onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                className="btn-primary flex items-center font-saira"
              >
                <Plus className="mr-2 h-5 w-5 font-saira" />
                NEW TASK
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center justify-between">
          <p className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {showDefaultTasks && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">DEFAULT GARDEN TASKS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_GARDEN_TASKS.map((task, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:border-techserv-blue transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <button
                    onClick={() => handleCreateDefaultTask(task)}
                    className="text-techserv-blue hover:text-techserv-storm"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 text-sm font-neuton">{task.description}</p>
                <div className="mt-2 flex items-center">
                  <Clock className={`h-4 w-4 mr-2 ${
                    task.priority === 'high' ? 'text-red-600' :
                    task.priority === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <span className="text-sm capitalize">{task.priority} Priority</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNewTaskForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">CREATE NEW TASK</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2"
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
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2"
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
                  value={newTask.plot_id}
                  onChange={(e) => setNewTask({ ...newTask, plot_id: e.target.value })}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2"
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
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowNewTaskForm(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sorting and Filtering Options */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <SortAsc className="h-5 w-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-gray-300 shadow-sm p-2"
            >
              <option value="none">Sort by...</option>
              <option value="plot">Plot Number</option>
              <option value="assignee">Assignee</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <select
              value={filterByPlot}
              onChange={(e) => setFilterByPlot(e.target.value)}
              className="rounded-md border border-gray-300 shadow-sm p-2"
            >
              <option value="">All Plots</option>
              {plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  Plot {plot.number}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <UserSelect
              onSelect={(user) => setFilterByAssignee(user.id)}
              onRemove={() => setFilterByAssignee('')}
              selectedUsers={filterByAssignee ? [tasks.find(t => t.assigned_to === filterByAssignee)?.assignee!].filter(Boolean) : []}
              placeholder="Filter by assignee..."
              className="min-w-[200px]"
            />
          </div>

          {(filterByPlot || filterByAssignee || sortBy !== 'none') && (
            <button
              onClick={() => {
                setSortBy('none');
                setFilterByPlot('');
                setFilterByAssignee('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {containers.map(container => (
            <div
              key={container.id}
              id={container.id}
              className="bg-gray-100 rounded-lg p-4 min-h-[500px] w-full"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                {container.title}
              </h3>
              <SortableContext
                items={sortTasks(tasks.filter(t => t.status === container.status)).map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortTasks(tasks.filter(task => task.status === container.status))
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onVolunteer={handleVolunteer}
                      onComplete={handleComplete}
                      onReopen={handleReopen}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      userProfile={userProfile}
                      plots={plots}
                    />
                  ))}
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
