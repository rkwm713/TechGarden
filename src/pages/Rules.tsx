import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scroll,
  Shield,
  Sprout,
  Users,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  Save,
  GripVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../lib/supabase';
import type { Rule, Profile } from '../lib/types';

interface RuleFormData {
  title: string;
  description: string;
  category: Rule['category'];
}

function RuleCard({
  rule,
  onEdit,
  onDelete,
  canManage
}: {
  rule: Rule;
  onEdit: (rule: Rule) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getCategoryIcon = (category: Rule['category']) => {
    switch (category) {
      case 'general':
        return <Scroll className="h-5 w-5 text-blue-600" />;
      case 'safety':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'plots':
        return <Sprout className="h-5 w-5 text-green-600" />;
      case 'community':
        return <Users className="h-5 w-5 text-purple-600" />;
    }
  };

  const getCategoryColor = (category: Rule['category']) => {
    switch (category) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'safety':
        return 'bg-red-100 text-red-800';
      case 'plots':
        return 'bg-green-100 text-green-800';
      case 'community':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow p-4 mb-4"
    >
      <div className="flex items-start gap-4">
        {canManage && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-move pt-1"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getCategoryIcon(rule.category)}
              <h3 className="text-lg font-semibold">{rule.title}</h3>
            </div>
            {canManage && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(rule)}
                  className="text-gray-600 hover:text-techserv-blue"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(rule.id)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-600 font-neuton mb-3">{rule.description}</p>

          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getCategoryColor(rule.category)}`}>
            {rule.category.charAt(0).toUpperCase() + rule.category.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function RuleForm({
  rule,
  onSubmit,
  onCancel
}: {
  rule?: Rule;
  onSubmit: (data: RuleFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<RuleFormData>(() => {
    if (rule) {
      return {
        title: rule.title,
        description: rule.description,
        category: rule.category
      };
    }
    return {
      title: '',
      description: '',
      category: 'general'
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-6">
        {rule ? 'Edit Rule' : 'Create New Rule'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Rule['category'] })}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2"
            required
          >
            <option value="general">General</option>
            <option value="safety">Safety</option>
            <option value="plots">Plots</option>
            <option value="community">Community</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          {rule ? 'Update Rule' : 'Create Rule'}
        </button>
      </div>
    </form>
  );
}

export default function Rules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<Rule[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<Rule['category'] | null>(null);

  const canManageRules = userProfile?.role === 'admin' || userProfile?.role === 'mod';

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const fetchRules = async () => {
    try {
      const { data: rulesData, error: rulesError } = await supabase
        .from('rules')
        .select('*')
        .order('order', { ascending: true });

      if (rulesError) throw rulesError;
      setRules(rulesData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError('Failed to load rules. Please try again.');
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

        await fetchRules();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load rules. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCreateRule = async (formData: RuleFormData) => {
    try {
      const newRule = {
        ...formData,
        order: rules.length,
        created_by: userProfile?.id
      };

      const { error: createError } = await supabase
        .from('rules')
        .insert([newRule]);

      if (createError) throw createError;

      setShowRuleForm(false);
      await fetchRules();
    } catch (err) {
      console.error('Error creating rule:', err);
      setError('Failed to create rule. Please try again.');
    }
  };

  const handleUpdateRule = async (formData: RuleFormData) => {
    if (!editingRule) return;

    try {
      const { error: updateError } = await supabase
        .from('rules')
        .update(formData)
        .eq('id', editingRule.id);

      if (updateError) throw updateError;

      setEditingRule(null);
      await fetchRules();
    } catch (err) {
      console.error('Error updating rule:', err);
      setError('Failed to update rule. Please try again.');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleId);

      if (deleteError) throw deleteError;
      await fetchRules();
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError('Failed to delete rule. Please try again.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = rules.findIndex(rule => rule.id === active.id);
    const newIndex = rules.findIndex(rule => rule.id === over.id);
    
    const newRules = arrayMove(rules, oldIndex, newIndex);
    setRules(newRules);

    // Update order in database
    try {
      const updates = newRules.map((rule, index) => ({
        id: rule.id,
        order: index
      }));

      const { error: updateError } = await supabase
        .from('rules')
        .upsert(updates);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating rule order:', err);
      setError('Failed to update rule order. Please try again.');
      await fetchRules(); // Revert to original order
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

  const categories: Rule['category'][] = ['general', 'safety', 'plots', 'community'];
  const rulesByCategory = categories.reduce((acc, category) => {
    acc[category] = rules.filter(rule => rule.category === category);
    return acc;
  }, {} as Record<Rule['category'], Rule[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">GARDEN RULES</h1>
          <p className="text-gray-600 font-neuton">
            Guidelines for maintaining a safe and harmonious community garden
          </p>
        </div>
        {canManageRules && !showRuleForm && !editingRule && (
          <button
            onClick={() => setShowRuleForm(true)}
            className="btn-primary flex items-center font-saira"
          >
            <Plus className="h-5 w-5 mr-2" />
            NEW RULE
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {(showRuleForm || editingRule) ? (
        <RuleForm
          rule={editingRule || undefined}
          onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
          onCancel={() => {
            setShowRuleForm(false);
            setEditingRule(null);
          }}
        />
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {category === 'general' && <Scroll className="h-6 w-6 text-blue-600" />}
                    {category === 'safety' && <Shield className="h-6 w-6 text-red-600" />}
                    {category === 'plots' && <Sprout className="h-6 w-6 text-green-600" />}
                    {category === 'community' && <Users className="h-6 w-6 text-purple-600" />}
                    <h2 className="text-xl font-semibold">
                      {category.charAt(0).toUpperCase() + category.slice(1)} Rules
                    </h2>
                  </div>
                  {expandedCategory === category ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {expandedCategory === category && (
                  <div className="p-4 bg-gray-50">
                    <SortableContext items={rulesByCategory[category]} strategy={verticalListSortingStrategy}>
                      {rulesByCategory[category].map((rule) => (
                        <RuleCard
                          key={rule.id}
                          rule={rule}
                          onEdit={setEditingRule}
                          onDelete={handleDeleteRule}
                          canManage={canManageRules}
                        />
                      ))}
                    </SortableContext>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}