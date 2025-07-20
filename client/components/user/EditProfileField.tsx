import React, { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';

interface EditProfileFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'email';
  placeholder?: string;
  loading?: boolean;
}

const EditProfileField: React.FC<EditProfileFieldProps> = ({
  label,
  value,
  onSave,
  type = 'text',
  placeholder,
  loading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {isEditing ? (
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <p className="text-gray-900">{value || 'Not set'}</p>
        )}
      </div>
      
      <div className="ml-4 flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={loading}
              className="p-2 text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
              aria-label="Save changes"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="Edit field"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EditProfileField; 