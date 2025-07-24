import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string, time: string) => void;
  title: string;
  description: string;
  submitText: string;
  initialDate?: string;
  initialTime?: string;
  loading?: boolean;
}

export default function SchedulingModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  submitText,
  initialDate = '',
  initialTime = '12:00 PM',
  loading = false
}: SchedulingModalProps) {
  const [scheduledDate, setScheduledDate] = useState(initialDate);
  const [scheduledTime, setScheduledTime] = useState(initialTime);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Initialize current month based on initial date
  useEffect(() => {
    if (initialDate) {
      setCurrentMonth(new Date(initialDate));
    }
  }, [initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !scheduledTime) {
      return;
    }
    onSubmit(scheduledDate, scheduledTime);
  };

  const handleClose = () => {
    setScheduledDate(initialDate);
    setScheduledTime(initialTime);
    setShowCalendar(false);
    onClose();
  };

  const handleClear = () => {
    setScheduledDate('');
    setScheduledTime('12:00 PM');
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    
    // Handle YYYY-MM-DD format without timezone conversion
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Fallback for other formats
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!scheduledDate) return false;
    
    // Handle YYYY-MM-DD format comparison
    if (scheduledDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      return dateString === scheduledDate;
    }
    
    // Fallback for other formats
    return date.toDateString() === new Date(scheduledDate).toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (date: Date) => {
    if (isPastDate(date)) return;
    // Format date as YYYY-MM-DD without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setScheduledDate(`${year}-${month}-${day}`);
    setShowCalendar(false);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const timeOptions = [
    '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
    '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
    '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
    '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#357ab8]">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            {description}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Input */}
            <div className="relative">
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={formatDateForDisplay(scheduledDate)}
                  onClick={() => setShowCalendar(!showCalendar)}
                  readOnly
                  placeholder="Select date"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8] cursor-pointer"
                />
              </div>

              {/* Calendar */}
              {showCalendar && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <h4 className="text-sm font-semibold text-[#357ab8]">
                      {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="p-3">
                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentMonth).map((date, index) => (
                        <div key={index} className="text-center">
                          {date ? (
                            <button
                              type="button"
                              onClick={() => handleDateSelect(date)}
                              disabled={isPastDate(date)}
                              className={`
                                w-8 h-8 rounded-full text-xs font-medium transition-colors
                                ${isSelected(date) 
                                  ? 'bg-[#357ab8] text-white' 
                                  : isToday(date)
                                  ? 'bg-gray-100 text-gray-900'
                                  : isPastDate(date)
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-700 hover:bg-gray-100'
                                }
                              `}
                            >
                              {date.getDate()}
                            </button>
                          ) : (
                            <div className="w-6 h-6" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clear Button */}
                  <div className="p-3 border-t border-gray-200 flex justify-end">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3 py-1.5 text-xs font-medium text-[#357ab8] border border-[#357ab8] rounded-md hover:bg-[#357ab8] hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Time Input */}
            <div className="relative">
              <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8] appearance-none bg-white"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !scheduledDate || !scheduledTime}
                className="px-4 py-2 text-sm font-medium text-white bg-[#5A9BD8] rounded-md hover:bg-[#4A8BC8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 