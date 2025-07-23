import React, { useState } from 'react';
import { Edit2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface EditProfileFormProps {
  user: UserProfile;
  onUpdate: (field: keyof UserProfile, value: string) => Promise<void>;
}

export default function EditProfileForm({ user, onUpdate }: EditProfileFormProps) {
  const [editingField, setEditingField] = useState<keyof UserProfile | null>(null);
  const [editValues, setEditValues] = useState<UserProfile>(user);
  const [loading, setLoading] = useState<keyof UserProfile | null>(null);

  const handleEdit = (field: keyof UserProfile) => {
    setEditingField(field);
    setEditValues(user);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues(user);
  };

  const handleSave = async (field: keyof UserProfile) => {
    if (editValues[field] === user[field]) {
      setEditingField(null);
      return;
    }

    try {
      setLoading(field);
      await onUpdate(field, editValues[field]);
      setEditingField(null);
      toast.success(`${field === 'firstName' ? 'First Name' : field === 'lastName' ? 'Last Name' : field === 'email' ? 'Email Address' : 'Phone Number'} updated successfully!`);
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      setEditValues(user);
    } finally {
      setLoading(null);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const renderField = (field: keyof UserProfile, label: string, type: string = 'text') => {
    const isEditing = editingField === field;
    const isLoading = loading === field;
    const currentValue = isEditing ? editValues[field] : user[field];
    const hasChanges = isEditing && editValues[field] !== user[field];
    
    // Email and phone fields should not be editable
    const isReadOnly = field === 'email' || field === 'phone';

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#5E3A1C] mb-2">
          {label}
          {isReadOnly && <span className="text-xs text-gray-500 ml-2">(Read-only)</span>}
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type={type}
              value={currentValue}
              onChange={(e) => handleInputChange(field, e.target.value)}
              disabled={!isEditing || isLoading || isReadOnly}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE346C]/20 transition-colors ${
                isReadOnly
                  ? 'border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed'
                  : isEditing 
                    ? 'border-[#EE346C] bg-white' 
                    : 'border-gray-200 bg-gray-50'
              }`}
              placeholder={label}
            />
            {!isReadOnly && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => handleEdit(field)}
                  className="p-1 rounded text-gray-400 hover:text-[#EE346C] hover:bg-[#EE346C]/10 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {isEditing && !isReadOnly && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSave(field)}
                disabled={isLoading || !hasChanges}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  hasChanges && !isLoading
                    ? 'bg-[#EE346C] text-white hover:bg-[#c2185b]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Update
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-3 border border-[#EE346C] text-[#EE346C] rounded-lg font-medium hover:bg-[#EE346C] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {isLoading && (
          <div className="mt-2 text-sm text-[#EE346C]">Updating...</div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-[#5E3A1C] mb-6">Edit Profile</h2>
      
      <form className="space-y-4">
        {renderField('firstName', 'First Name')}
        {renderField('lastName', 'Last Name')}
        {renderField('email', 'Email Address', 'email')}
        {renderField('phone', 'Phone Number', 'tel')}
      </form>
    </div>
  );
} 