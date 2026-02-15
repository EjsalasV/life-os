// app/hooks/useFilters.ts
"use client";
import { useState } from 'react';
import type { FilterDate } from '@/app/types';

export default function useFilters() {
    const [filterDate, setFilterDate] = useState<FilterDate>({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    });

    const [busquedaProd, setBusquedaProd] = useState<string>('');
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    const resetFilters = () => {
        setFilterDate({
            month: new Date().getMonth(),
            year: new Date().getFullYear()
        });
        setBusquedaProd('');
        setSelectedAccountId(null);
    };

    const setMonth = (month: number) => {
        setFilterDate(prev => ({ ...prev, month }));
    };

    const setYear = (year: number) => {
        setFilterDate(prev => ({ ...prev, year }));
    };

    return {
        // Date filters
        filterDate,
        setFilterDate,
        setMonth,
        setYear,

        // Product search
        busquedaProd,
        setBusquedaProd,

        // Account filter
        selectedAccountId,
        setSelectedAccountId,

        // Actions
        resetFilters
    };
}
