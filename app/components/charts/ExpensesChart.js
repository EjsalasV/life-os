"use client";
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORIAS, safeMonto, formatMoney } from '@/app/utils/helpers';

export default function ExpensesChart({ movimientos }) {
  
  // 1. Procesamos los datos para el gráfico
  const data = useMemo(() => {
    // Filtramos solo gastos (ignoramos ingresos y transferencias)
    const gastos = movimientos.filter(m => m.tipo === 'GASTO');
    
    // Si no hay gastos, retornamos vacío
    if (gastos.length === 0) return [];

    // Agrupamos por categoría
    const agrupado = gastos.reduce((acc, curr) => {
      const catId = curr.categoria || 'otros';
      const monto = safeMonto(curr.monto);
      
      if (!acc[catId]) {
        // Buscamos la info completa de la categoría para sacar el nombre
        const catInfo = CATEGORIAS.find(c => c.id === catId) || CATEGORIAS.find(c => c.id === 'otros');
        
        acc[catId] = {
          name: catInfo.label,
          value: 0,
          color: getColorHex(catInfo.id), // Función helper de abajo
          id: catId
        };
      }
      acc[catId].value += monto;
      return acc;
    }, {});

    // Convertimos objeto a array y ordenamos de mayor a menor gasto
    return Object.values(agrupado).sort((a, b) => b.value - a.value);
  }, [movimientos]);

  // Si no hay datos, mostramos un mensaje vacío
  if (data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-[30px] border border-gray-100 p-6 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest mb-2">Sin datos aún</p>
            <p className="text-[10px]">Tus gastos aparecerán aquí.</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
      <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Distribución de Gastos</h3>
      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
                formatter={(value) => formatMoney(value)}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                itemStyle={{color: '#1f2937'}}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centro del gráfico (Total) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
            <p className="text-lg font-black text-gray-900">
                {formatMoney(data.reduce((a, b) => a + b.value, 0))}
            </p>
        </div>
      </div>

      {/* Leyenda personalizada */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map(d => (
            <div key={d.id} className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                <div className="flex justify-between w-full">
                    <span>{d.name}</span>
                    <span className="opacity-60">{((d.value / data.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}

// Helper para colores (Tailwind no funciona directo dentro del componente de mapa)
function getColorHex(id) {
    const map = {
        trabajo: '#10b981', // emerald
        ocio: '#6366f1',    // indigo
        comida: '#f97316',  // orange
        transporte: '#3b82f6', // blue
        salud: '#f43f5e',   // rose
        hogar: '#d97706',   // amber
        otros: '#6b7280',   // gray
    };
    return map[id] || '#000000';
}