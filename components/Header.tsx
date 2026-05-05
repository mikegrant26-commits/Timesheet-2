
import React from 'react';

interface HeaderProps {
    employeeSelection: string;
    employeeOptions: string[];
    employeeName: string;
    weekEndingDate: string;
    onHeaderChange: (field: 'employeeSelection' | 'employeeName' | 'weekEndingDate', value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ employeeSelection, employeeOptions, employeeName, weekEndingDate, onHeaderChange }) => {
    return (
        <div className="flex flex-col md:flex-row gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex-1">
                <label htmlFor="employeeSelection" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Employee Selection</label>
                <div className="flex flex-col gap-3">
                    <select
                        id="employeeSelection"
                        value={employeeSelection}
                        onChange={(e) => onHeaderChange('employeeSelection', e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white font-medium"
                    >
                        <option value="">-- Choose Employee --</option>
                        {employeeOptions.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                    </select>

                    {employeeSelection === 'Other' && (
                        <input
                            type="text"
                            id="employeeName"
                            value={employeeName}
                            onChange={(e) => onHeaderChange('employeeName', e.target.value)}
                            placeholder="Enter full name..."
                            className="w-full p-3 border border-blue-200 dark:border-blue-500 rounded-xl bg-white dark:bg-gray-700 dark:text-white font-medium animate-in fade-in slide-in-from-top-2"
                            autoFocus
                        />
                    )}
                </div>
            </div>
            <div className="w-full md:w-64">
                <label htmlFor="weekEndingDate" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Week Ending</label>
                <input
                    type="date"
                    id="weekEndingDate"
                    value={weekEndingDate}
                    onChange={(e) => onHeaderChange('weekEndingDate', e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white font-medium"
                />
            </div>
        </div>
    );
};

export default React.memo(Header);
