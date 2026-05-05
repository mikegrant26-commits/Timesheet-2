
import React from 'react';
import { DayEntry, LeaveType } from '../types';

interface TimesheetRowProps {
    dayData: DayEntry;
    index: number;
    onTimesheetChange: (index: number, field: keyof DayEntry, value: string | number | LeaveType) => void;
    isSiteInvalid: boolean;
    siteOptions: string[];
}

const formatValueForInput = (val: string | number): string => {
    if (val === 0 || val === '0' || val === 0.0) return '';
    return String(val);
};

const TimesheetRow: React.FC<TimesheetRowProps> = ({ dayData, index, onTimesheetChange, isSiteInvalid, siteOptions }) => {
    const { day, reg, ot15, ot2, leaveType, siteSelection, site } = dayData;

    const isLeaveSelected = leaveType !== 'none';
    const isWeekday = !['Saturday', 'Sunday'].includes(day);
    const needsHighlight = isWeekday && !siteSelection && !isLeaveSelected;

    const showOtherSiteInput = siteSelection === 'Other';

    let rowClass = 'group transition-colors duration-200';
    if (leaveType.startsWith('al') || leaveType === 'bh8') {
        rowClass += ' bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900/75';
    } else if (leaveType === 'sl') {
        rowClass += ' bg-yellow-50 dark:bg-yellow-900/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/75';
    } else {
        rowClass += ' hover:bg-gray-50 dark:hover:bg-gray-700/50';
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (['reg', 'ot15', 'ot2'].includes(name)) {
            if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
                onTimesheetChange(index, name as keyof DayEntry, value);
            }
        } else {
            onTimesheetChange(index, name as keyof DayEntry, value);
        }
    };

    return (
        <div className={`p-2 ${rowClass}`}>
             <div className="mb-2">
                <label htmlFor={`site-select-${index}`} className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Work Site:</label>
                {isLeaveSelected ? (
                     <div className="p-2 border rounded-md text-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-500 text-gray-500 dark:text-gray-300 font-medium">
                        {site}
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            id={`site-select-${index}`}
                            name="siteSelection"
                            value={siteSelection}
                            onChange={handleInputChange}
                            className={`p-2 border rounded-md text-sm focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-shadow duration-300 ${isSiteInvalid ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} ${showOtherSiteInput ? 'sm:w-1/2' : 'w-full'} ${needsHighlight ? 'animate-pulse-glow' : ''}`}
                        >
                            <option value="">Select a site to enter hours...</option>
                            {siteOptions.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                        {showOtherSiteInput && (
                            <input
                                type="text"
                                id={`site-input-${index}`}
                                value={site}
                                name="site"
                                onChange={handleInputChange}
                                placeholder="Enter Custom Site"
                                className={`flex-grow p-2 border rounded-md text-sm focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${isSiteInvalid ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                            />
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-12 items-center">
                <div className="col-span-2 sm:col-span-3 font-semibold text-gray-700 dark:text-gray-200 text-sm">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.substring(0, 3)}</span>
                </div>
                
                <div className="col-span-3 flex justify-center px-1">
                    <input type="text" value={formatValueForInput(reg)}
                        name="reg"
                        onChange={handleInputChange}
                        placeholder="-"
                        className="w-full p-2 border rounded-md text-sm text-center focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
                    />
                </div>

                <div className="col-span-2 flex justify-center px-1">
                    <input type="text" value={formatValueForInput(ot15)}
                        name="ot15"
                        onChange={handleInputChange}
                        placeholder="-"
                        className="w-full p-2 border rounded-md text-sm text-center focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
                    />
                </div>

                <div className="col-span-2 flex justify-center px-1">
                    <input type="text" value={formatValueForInput(ot2)}
                        name="ot2"
                        onChange={handleInputChange}
                        placeholder="-"
                        className="w-full p-2 border rounded-md text-sm text-center focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
                    />
                </div>

                <div className="col-span-3 sm:col-span-2 flex justify-center">
                    <select
                        name="leaveType"
                        value={leaveType}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md text-xs text-center bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                        <option value="none">None</option>
                        <option value="al8">AL (8h)</option>
                        <option value="al4">AL (4h)</option>
                        <option value="bh8">BANKHOL(8)</option>
                        <option value="sl">SL (8h)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default React.memo(TimesheetRow);
