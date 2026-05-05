import React from 'react';
import { Totals } from '../types';

interface TotalsDisplayProps {
    totals: Totals;
}

const TotalsDisplay: React.FC<TotalsDisplayProps> = ({ totals }) => {
    const totalReg = parseFloat(String(totals.totalReg)) || 0;
    const totalOT15 = parseFloat(String(totals.totalOT15)) || 0;
    const totalOT2 = parseFloat(String(totals.totalOT2)) || 0;
    const totalEffective = parseFloat(String(totals.totalEffective)) || 0;
    
    const totalGrand = totalReg + totalOT15 + totalOT2;

    return (
        <>
            <div className="grid grid-cols-12 text-sm sm:text-base font-extrabold text-gray-800 dark:text-gray-100 bg-green-50 dark:bg-green-900/50 rounded-lg py-4 px-2 shadow-inner border-t border-green-200 dark:border-green-800">
                <div className="col-span-3">TOTALS</div>
                <div id="totalReg" className="col-span-3 text-center">{totalReg.toFixed(2)}</div>
                <div id="totalOT15" className="col-span-2 text-center">{totalOT15.toFixed(2)}</div>
                <div id="totalOT2" className="col-span-2 text-center">{totalOT2.toFixed(2)}</div>
                <div id="totalGrand" className="col-span-2 text-center text-blue-600 dark:text-blue-400">{totalGrand.toFixed(2)}</div>
            </div>
            <div className="mt-8">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Effective Total Hours:</span>
                <div id="totalEffective" className="text-2xl font-extrabold text-green-700 dark:text-green-400">{totalEffective.toFixed(2)}</div>
            </div>
        </>
    );
};

export default React.memo(TotalsDisplay);