import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
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
        <label className="block text-sm font-semibold text-[#8b7355] mb-2">
          {label}
          {isReadOnly && <span className="text-sm text-secondary ml-2">(Read-only)</span>}
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type={type}
              value={currentValue}
              onChange={(e) => handleInputChange(field, e.target.value)}
              disabled={!isEditing || isLoading || isReadOnly}
              className={`w-full px-5 py-3.5 rounded-md text-[#6c4323] placeholder-[#bcae9e] outline outline-[1px] outline-offset-[-1px] transition-colors ${
                isReadOnly
                  ? 'outline-[#ead8c9] bg-white cursor-not-allowed'
                  : isEditing 
                    ? 'outline-[#ead8c9] bg-white' 
                    : 'outline-[#ead8c9] bg-white'
              }`}
              placeholder={label}
            />
            {!isReadOnly && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => handleEdit(field)}
                  className="p-1.5 rounded text-[#8b7355] hover:text-[#6c4323] hover:bg-[#f7eee7] transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
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
                className={`sm:w-48 px-4 py-3 rounded-sm font-medium transition-colors ${
                  hasChanges && !isLoading
                    ? 'bg-[#EF3B6D] text-white hover:bg-[#e22e61]'
                    : 'bg-gray-300 text-gray-500 text-base cursor-not-allowed'
                }`}
              >
                Update
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="sm:w-48 px-4 py-3 rounded-sm font-medium border border-[#EF3B6D] text-[#EF3B6D] rounded-lg font-medium hover:bg-[#EF3B6D] hover:text-white transition-colors"
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
    <div className="bg-white rounded-2xl p-0">
      <h2 className="text-3xl font-semibold text-[#6c4323] mb-4">Edit Profile</h2>
      
      <form className="space-y-6">
        {renderField('firstName', 'First Name')}
        {renderField('lastName', 'Last Name')}
        {renderField('email', 'Email Address', 'email')}
        {renderField('phone', 'Phone number', 'tel')}
      </form>
    </div>
  );
} 