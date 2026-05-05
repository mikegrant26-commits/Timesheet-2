
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TimesheetData, DayEntry, LeaveType, Totals } from './types';
import { DAYS, LOCAL_STORAGE_KEY } from './constants';
import { generatePdf } from './services/pdfGenerator';
import Header from './components/Header';
import TimesheetRow from './components/TimesheetRow';
import TotalsDisplay from './components/TotalsDisplay';

const employeeOptions = ['Jonny Hogg','Mike Grant', 'Barry Bown', 'Nick Saxton','Daz Gillespie', 'Luke Simpson', 'Dan Smith', 'Jason Milner', 'Other'];
const siteOptions = ['Workshop', 'Templeborough', 'Brigg', 'Vitritech', 'Technical Absorbent', 'TBM Cover', 'Other'];

const getDefaultTimesheetData = (): TimesheetData => ({
    employeeName: '',
    weekEndingDate: new Date().toISOString().substring(0, 10),
    times: DAYS.map(day => ({ 
        day, 
        reg: 0.00, 
        ot15: 0.00, 
        ot2: 0.00, 
        leaveType: 'none', 
        siteSelection: '', 
        site: '' 
    }))
});

const App: React.FC = () => {
    const [timesheetData, setTimesheetData] = useState<TimesheetData>(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return getDefaultTimesheetData();
            }
        }
        return getDefaultTimesheetData();
    });
    const [employeeSelection, setEmployeeSelection] = useState<string>(() => {
        // Try to infer selection from saved name
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (employeeOptions.includes(parsed.employeeName)) return parsed.employeeName;
                if (parsed.employeeName) return 'Other';
            } catch (e) {}
        }
        return '';
    }); 
    
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
    const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timesheetData));
    }, [timesheetData]);

    useEffect(() => {
        if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
            showStatus('New timesheet. Fill in your hours to begin.', false);
        }
    }, []);

    const showStatus = (text: string, isError: boolean) => {
        setStatusMessage({ text, isError });
        setTimeout(() => {
            setStatusMessage({ text: '', isError: false });
        }, 5000);
    };

    const handleHeaderChange = useCallback((field: 'employeeSelection' | 'employeeName' | 'weekEndingDate', value: string) => {
        if (field === 'employeeSelection') {
            setEmployeeSelection(value);
            if (value === 'Other') {
                setTimesheetData(prev => ({ ...prev, employeeName: '' }));
            } else {
                setTimesheetData(prev => ({ ...prev, employeeName: value }));
            }
        } else { // Handles 'employeeName' from the 'Other' input, and 'weekEndingDate'
            setTimesheetData(prevData => ({ ...prevData, [field as any]: value }));
        }
    }, []);

    const handleTimesheetChange = useCallback((index: number, field: keyof DayEntry, value: string | number | LeaveType) => {
        if (field === 'site' || field === 'siteSelection') {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`site-${index}`];
                return newErrors;
            });
        }
        
        setTimesheetData(prevData => {
            const newTimes = [...prevData.times];
            const dayEntry = { ...newTimes[index] };

            if (field === 'leaveType') {
                dayEntry.leaveType = value as LeaveType;

                // Clear any existing site validation error for this row
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`site-${index}`];
                    return newErrors;
                });
                
                // Reset hours first
                dayEntry.reg = 0.00;
                dayEntry.ot15 = 0.00;
                dayEntry.ot2 = 0.00;

                // Set hours and site based on leave type
                if (value === 'al4') {
                    // Automatically fill 8 hours for half day leave as requested
                    // If a site was already selected, we keep it; otherwise default to HOLIDAY
                    dayEntry.reg = 8.00;
                    if (!dayEntry.siteSelection || dayEntry.siteSelection === 'SICK' || dayEntry.siteSelection === 'BANK HOLIDAY') {
                        dayEntry.site = 'HOLIDAY';
                        dayEntry.siteSelection = 'HOLIDAY';
                    }
                } else if (value === 'al8') {
                    dayEntry.reg = 8.00;
                    dayEntry.site = 'HOLIDAY';
                    dayEntry.siteSelection = 'HOLIDAY';
                } else if (value === 'bh8') {
                    dayEntry.reg = 8.00;
                    dayEntry.site = 'BANK HOLIDAY';
                    dayEntry.siteSelection = 'BANK HOLIDAY';
                } else if (value === 'sl') {
                    dayEntry.reg = 8.00;
                    dayEntry.site = 'SICK';
                    dayEntry.siteSelection = 'SICK';
                } else if (value === 'none') {
                    // When changing back to 'none', clear the auto-populated site fields
                    if (dayEntry.site === 'HOLIDAY' || dayEntry.site === 'SICK' || dayEntry.site === 'BANK HOLIDAY') {
                        dayEntry.site = '';
                        dayEntry.siteSelection = '';
                    }
                }
            } else if (field === 'siteSelection') {
                dayEntry.siteSelection = value as string;
                if (value === 'Other') {
                    dayEntry.site = '';
                } else {
                    dayEntry.site = value as string;
                }
                
                // Reset hours on any site change for a clean slate
                dayEntry.reg = 0.00;
                dayEntry.ot15 = 0.00;
                dayEntry.ot2 = 0.00;
                
                // When a site is selected, auto-populate hours based on the day.
                if (value) { // A site was selected (i.e., value is not "")
                    const dayName = dayEntry.day;

                    if (dayName === 'Saturday') {
                        dayEntry.ot15 = 4.00;
                        dayEntry.ot2 = 4.00;
                    } else if (dayName === 'Sunday') {
                        dayEntry.ot2 = 8.00;
                    } else { // Weekdays
                        dayEntry.reg = 8.00;
                    }

                    // Auto-populate additional OT hours based on specific sites
                    if (value === 'Technical Absorbent') {
                        dayEntry.ot2 += 1.00;
                    }
                }

            } else if (['reg', 'ot15', 'ot2'].includes(field)) {
                // Store the raw value (string) to allow typing decimals like "1."
                (dayEntry as any)[field] = value;
            } else {
                (dayEntry as any)[field] = value;
            }

            newTimes[index] = dayEntry;
            return { ...prevData, times: newTimes };
        });
    }, []);

    const totals: Totals = useMemo(() => {
        return timesheetData.times.reduce((acc, day) => {
            const reg = parseFloat(String(day.reg)) || 0;
            const ot15 = parseFloat(String(day.ot15)) || 0;
            const ot2 = parseFloat(String(day.ot2)) || 0;

            acc.totalReg += reg;
            acc.totalOT15 += ot15;
            acc.totalOT2 += ot2;
            acc.totalEffective += reg + (ot15 * 1.5) + (ot2 * 2);
            return acc;
        }, { totalReg: 0, totalOT15: 0, totalOT2: 0, totalEffective: 0 });
    }, [timesheetData.times]);

    const handleSaveAndGeneratePdf = () => {
        if (!timesheetData.employeeName.trim()) {
            showStatus('Employee Name is required before generating a PDF.', true);
            const employeeNameInput = document.getElementById('employeeName') || document.getElementById('employeeNameSelect');
            if (employeeNameInput) {
                employeeNameInput.focus();
            }
            return;
        }

        const errors: Record<string, boolean> = {};
        let firstErrorIndex = -1;

        timesheetData.times.forEach((dayEntry, index) => {
            const hasHours = dayEntry.reg > 0 || dayEntry.ot15 > 0 || dayEntry.ot2 > 0;
            const hasSite = !!dayEntry.site.trim();

            if (hasHours && !hasSite) {
                errors[`site-${index}`] = true;
                if (firstErrorIndex === -1) {
                    firstErrorIndex = index;
                }
            }
        });
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            const firstErrorDay = timesheetData.times[firstErrorIndex];
            showStatus(`Work Site is required for ${firstErrorDay.day} when hours are entered.`, true);
            const siteInput = document.getElementById(`site-select-${firstErrorIndex}`);
            if (siteInput) {
                siteInput.focus();
                siteInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        setValidationErrors({}); // Clear errors if validation passes

        showStatus('Generating PDF...', false);
        try {
            generatePdf(timesheetData, totals);
            showStatus('PDF generated successfully! The form has been reset.', false);
            setTimesheetData(getDefaultTimesheetData());
            setEmployeeSelection(''); // Reset dropdown as well
        } catch (error) {
            console.error("PDF Generation Error:", error);
            const message = error instanceof Error ? error.message : 'See console for details.';
            showStatus(`Error generating PDF: ${message}`, true);
        }
    };

    return (
        <div id="timesheet-container" className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-wider text-white mb-6 text-center bg-black py-3 px-6 rounded-xl">RTD MECHANICAL LTD</h1>
            <Header
                employeeName={timesheetData.employeeName}
                weekEndingDate={timesheetData.weekEndingDate}
                onHeaderChange={handleHeaderChange}
                employeeSelection={employeeSelection}
                employeeOptions={employeeOptions}
            />
            {statusMessage.text && (
                <div className={`text-sm font-medium text-right mb-4 transition-opacity duration-300 ${statusMessage.isError ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {statusMessage.text}
                </div>
            )}
            
            <div className="grid grid-cols-12 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-gray-700/50 rounded-t-lg py-3 px-2 shadow-sm">
                <div className="col-span-2 sm:col-span-3">Day</div>
                <div className="col-span-3 text-center">
                    <span className="hidden sm:inline">Regular (1x)</span>
                    <span className="sm:hidden">Reg</span>
                </div>
                <div className="col-span-2 text-center">
                    <span className="hidden sm:inline">OT (1.5x)</span>
                    <span className="sm:hidden">OT 1.5x</span>
                </div>
                <div className="col-span-2 text-center">
                    <span className="hidden sm:inline">OT (2x)</span>
                    <span className="sm:hidden">OT 2x</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center">Leave</div>
            </div>

            <div id="day-entries" className="border border-gray-200 dark:border-gray-700 rounded-b-lg divide-y divide-gray-200 dark:divide-gray-700 mb-8">
                {timesheetData.times.map((dayData, index) => (
                    <TimesheetRow
                        key={dayData.day}
                        dayData={dayData}
                        index={index}
                        onTimesheetChange={handleTimesheetChange}
                        isSiteInvalid={!!validationErrors[`site-${index}`]}
                        siteOptions={siteOptions}
                    />
                ))}
            </div>

            <TotalsDisplay totals={totals} />

            <div className="flex flex-col sm:flex-row justify-end items-center mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    id="saveButton"
                    onClick={handleSaveAndGeneratePdf}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Save & Generate PDF
                </button>
            </div>
        </div>
    );
};

export default App;
