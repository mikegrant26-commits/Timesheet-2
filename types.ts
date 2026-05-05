
export type LeaveType = 'none' | 'al8' | 'al4' | 'sl' | 'bh8';

export interface DayEntry {
    day: string;
    reg: string | number;
    ot15: string | number;
    ot2: string | number;
    leaveType: LeaveType;
    siteSelection: string;
    site: string;
}

export interface TimesheetData {
    employeeName: string;
    weekEndingDate: string;
    times: DayEntry[];
}

export interface Totals {
    totalReg: number;
    totalOT15: number;
    totalOT2: number;
    totalEffective: number;
}