"use client";
import React from 'react';
import { 
   Sparkles, Flame, ShieldCheck, Target, TrendingUp, TrendingDown, 
   Settings, Wallet, Shield, Trash2, Plus, ArrowRightLeft, X,
   Printer, Calendar, FileSpreadsheet, Upload
} from 'lucide-react';
import ExpensesChart from '../charts/ExpensesChart';
import { exportToExcel } from '@/app/utils/exportHandler';

export default function FinanzasView({
  finSubTab, setFinSubTab, smartMessage, userStats, handleNoSpendToday,
  balanceMes, formatMoney, presupuestoData, setSelectedBudgetCat, setModalOpen,
  setFormData, formData, cuentas, setSelectedAccountId, selectedAccountId,
   deleteItem, movimientos, fijos, metas, setSelectedMeta, getTime,
   handleImport,
  // NUEVOS PROPS RECIBIDOS DE PAGE.JS 👇
  filterDate, setFilterDate 
}) {

  // Helper local para evitar errores si no se importó utils
  const safeMonto = (m) => {
    if (!m) return 0;
    const n = parseFloat(m); 
    return isNaN(n) ? 0 : n;
  };

  // Helper visual para fecha corta
  const formatDateShort = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(getTime(timestamp));
    return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  };

   const fileInputRef = React.useRef(null);

  return (
    <>
      {/* Navegación Interna */}
      <div className="flex p-1 bg-gray-100 rounded-2xl mb-2 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
         {[{ id: 'control', l: 'Control' }, { id: 'billetera', l: 'Billetera' }, { id: 'futuro', l: 'Futuro' }].map(t => (
           <button key={t.id} onClick={() => setFinSubTab(t.id)} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${finSubTab === t.id ? 'bg-white shadow text-blue-600 scale-95' : 'text-gray-400'}`}>{t.l}</button>
         ))}
      </div>

      {/* 1.1 CONTROL */}
      {finSubTab === 'control' && (
        <div className="space-y-6 animate-in fade-in">
           {/* Asistente */}
           <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Sparkles size={16}/></div>
              <div><p className="text-[10px] uppercase font-black text-blue-400 mb-0.5">Asistente</p><p className="text-xs font-bold text-blue-900 leading-snug">{smartMessage}</p></div>
           </div>

           {/* Racha */}
           <div className="p-6 rounded-[30px] bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg relative overflow-hidden text-center">
              <Flame className="absolute -right-4 -bottom-4 text-white opacity-20" size={120} />
              <h2 className="text-5xl font-black mb-1">{userStats.currentStreak}</h2>
              <p className="text-[10px] uppercase font-black opacity-80 mb-4">Días de Racha</p>
              <button onClick={handleNoSpendToday} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 mx-auto transition-all active:scale-95"><ShieldCheck size={16}/> Hoy no gasté nada</button>
           </div>
           
           {/* Proyección */}
           <div className="p-5 bg-indigo-900 text-white rounded-[25px] shadow-lg flex justify-between items-center relative overflow-hidden">
              <div className="absolute -left-4 -top-4 w-20 h-20 bg-indigo-700 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-black text-indigo-200 mb-1">Proyección Fin de Mes</p>
                <p className="text-2xl font-black">{formatMoney(balanceMes.proyeccion)}</p>
                <p className="text-[9px] text-indigo-300 font-bold mt-1">Cashflow libre estimado</p>
              </div>
              <Target className="text-indigo-400 relative z-10" size={24}/>
           </div>

           {/* Ingresos vs Gastos */}
           <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100"><div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-emerald-500"/><span className="text-[9px] font-black text-emerald-400 uppercase">Ingresos</span></div><p className="text-lg font-black text-emerald-900">{formatMoney(balanceMes.ingresos)}</p></div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100"><div className="flex items-center gap-2 mb-1"><TrendingDown size={14} className="text-rose-500"/><span className="text-[9px] font-black text-rose-400 uppercase">Gastos</span></div><p className="text-lg font-black text-rose-900">{formatMoney(balanceMes.gastos)}</p></div>
           </div>

           {/* GRÁFICO DE GASTOS (NUEVO) */}
           <div className="animate-in slide-in-from-bottom duration-500 delay-150">
              <ExpensesChart movimientos={movimientos} />
           </div>
           
           {/* Barras de Presupuesto */}
           <div className="space-y-3">
              {presupuestoData.map(cat => {
                const porcentaje = cat.limite > 0 ? Math.min((cat.gastado / cat.limite) * 100, 100) : 0; 
                const colorBarra = porcentaje >= 100 ? 'bg-rose-500' : porcentaje > 80 ? 'bg-amber-400' : 'bg-emerald-400'; 
                return (
                  <div key={cat.id} className="bg-white border border-gray-100 p-4 rounded-2xl relative">
                    <button onClick={()=>{
                        setSelectedBudgetCat(cat); 
                        setModalOpen('presupuesto'); 
                        setFormData({...formData, limite: cat.limite > 0 ? cat.limite : ''})
                      }} className="absolute top-4 right-4 text-gray-300 hover:text-blue-500 active:scale-90 transition-transform">
                      <Settings size={14}/>
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                       <div className={`p-1.5 rounded-lg ${cat.color} text-white`}>
                          {cat.icon ? <cat.icon size={14}/> : <div className="w-3.5 h-3.5"/>}
                       </div>
                       <span className="text-xs font-bold">{cat.label}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black mb-1 text-gray-400">
                       <span>Gastado: {formatMoney(cat.gastado)}</span>
                       <span>Límite: {cat.limite > 0 ? formatMoney(cat.limite) : '∞'}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className={`h-full ${colorBarra} transition-all duration-500`} style={{ width: `${porcentaje}%` }} />
                    </div>
                  </div>
                )
              })}
           </div>
        </div>
      )}

      {/* 1.2 BILLETERA (AQUÍ ESTÁ LA NUEVA BARRA DE HERRAMIENTAS) */}
      {finSubTab === 'billetera' && (
        <div className="space-y-4 animate-in fade-in">
           {/* Botones Acción */}
           <div className="grid grid-cols-4 gap-3">
              <button onClick={() => setModalOpen('transferencia')} className="p-4 bg-black text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"><ArrowRightLeft size={16}/> Transferir</button>
              <button onClick={() => setSelectedAccountId(null)} className="p-4 bg-gray-100 text-gray-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"><Wallet size={16}/> Ver Todo</button>
              <button onClick={() => exportToExcel(movimientos, `${filterDate.year}-${String(filterDate.month+1).padStart(2,'0')}`)} className="p-4 bg-white text-gray-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"><FileSpreadsheet size={16}/> Exportar</button>
              <>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white text-gray-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"><Upload size={16}/> Importar</button>
              </>
           </div>
           
           {/* Carrusel Cuentas */}
           <div className="overflow-x-auto flex gap-3 pb-2 snap-x" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
             <div className="snap-center min-w-[140px] p-4 rounded-3xl flex flex-col justify-between h-32 border-2 border-blue-600 bg-blue-50 relative overflow-hidden">
                <Shield className="absolute right-[-10px] bottom-[-10px] text-blue-200 opacity-50" size={60} />
                <div className="p-2 bg-blue-200 text-blue-700 rounded-full w-fit"><ShieldCheck size={16}/></div>
                <div className="text-left relative z-10">
                   <p className="text-[9px] uppercase font-black opacity-60 mb-0.5">Todo tu dinero</p>
                   <p className="font-black text-lg text-blue-900">{formatMoney(cuentas.reduce((a,c)=>a+safeMonto(c.monto),0))}</p>
                </div>
             </div>
             {cuentas.map(c => (
               <button key={c.id} onClick={()=>setSelectedAccountId(c.id)} className={`snap-center min-w-[140px] p-4 rounded-3xl flex flex-col justify-between h-32 border-2 transition-all relative group ${selectedAccountId === c.id ? 'border-black bg-gray-900 text-white' : 'border-transparent bg-white shadow-sm'}`}>
                  <div onClick={(e)=>{e.stopPropagation(); deleteItem('cuentas', c)}} className="absolute top-2 right-2 p-2 rounded-full bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 hover:text-rose-500"><Trash2 size={12}/></div>
                  <div className={`p-2 rounded-full w-fit ${selectedAccountId === c.id ? 'bg-white/20' : 'bg-gray-100'}`}><Wallet size={16}/></div>
                  <div className="text-left"><p className="text-[10px] uppercase font-black opacity-50">{c.nombre}</p><p className="font-black text-lg">{formatMoney(c.monto)}</p></div>
               </button>
             ))}
             <button onClick={()=>setModalOpen('cuenta')} className="snap-center min-w-[80px] rounded-3xl flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 active:bg-gray-200"><Plus size={24}/></button>
           </div>

           <div>
             {/* === BARRA DE HERRAMIENTAS (FILTRO + IMPRESIÓN) === */}
             <div className="flex items-center justify-between mb-3 mt-4 px-2">
                 <h3 className="font-black text-lg">{selectedAccountId ? 'Historial' : 'Últimos Movimientos'}</h3>
                 
                 {/* ZONA DE FILTROS VISIBLES */}
                 <div className="flex gap-2 items-center bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <select 
                       value={filterDate.month} 
                       onChange={(e) => setFilterDate({...filterDate, month: parseInt(e.target.value)})}
                       className="text-[10px] font-bold bg-transparent outline-none text-gray-600 pl-1 cursor-pointer"
                    >
                       {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((m,i)=><option key={i} value={i}>{m}</option>)}
                    </select>
                    
                    <select 
                       value={filterDate.year} 
                       onChange={(e) => setFilterDate({...filterDate, year: parseInt(e.target.value)})}
                       className="text-[10px] font-bold bg-transparent outline-none text-gray-600 cursor-pointer"
                    >
                       {[2024, 2025, 2026, 2027].map(y=><option key={y} value={y}>{y}</option>)}
                    </select>

                    <div className="w-px h-3 bg-gray-200 mx-1"></div>

                    <button onClick={() => window.print()} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Imprimir Reporte">
                       <Printer size={14} />
                    </button>
                 </div>
             </div>

             {/* LISTA DE MOVIMIENTOS */}
             <div className="space-y-2 pb-20">
               {movimientos
                  .filter(m => selectedAccountId ? (m.cuentaId === selectedAccountId || m.cuentaDestinoId === selectedAccountId) : true)
                  // Ya vienen ordenados por Firebase, pero por seguridad visual ordenamos
                  .sort((a,b) => getTime(b.timestamp) - getTime(a.timestamp))
                  .map(m => (
                 <div key={m.id} className="p-4 rounded-2xl flex justify-between items-center bg-white border border-gray-100 group">
                    <div className="flex gap-3 items-center">
                       <div className={`p-2 rounded-xl ${m.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-600' : m.tipo === 'TRANSFERENCIA' ? 'bg-gray-100 text-gray-600' : 'bg-rose-100 text-rose-600'}`}>
                          {m.tipo === 'INGRESO' ? <TrendingUp size={16}/> : m.tipo === 'TRANSFERENCIA' ? <ArrowRightLeft size={16}/> : <TrendingDown size={16}/>}
                       </div>
                       
                       <div>
                          <p className="font-bold text-sm leading-tight">{m.nombre}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{m.categoria || 'General'}</span>
                             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                             {/* Fecha debajo de la categoría */}
                             <span className="text-[10px] text-blue-400 font-bold">{formatDateShort(m.timestamp)}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <p className={`font-black text-sm ${m.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-gray-900'}`}>
                          {m.tipo === 'INGRESO' ? '+' : m.tipo === 'GASTO' ? '-' : ''}{formatMoney(m.monto)}
                       </p>
                       <button onClick={()=>deleteItem('movimientos', m)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                    </div>
                 </div>
               ))}

               {movimientos.length === 0 && (
                 <div className="text-center p-10 opacity-40 font-bold text-sm bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p>No hay movimientos en este periodo. 🍃</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      )}

      {/* 1.3 FUTURO */}
      {finSubTab === 'futuro' && (
        <div className="space-y-6 animate-in fade-in">
           <div className="bg-black text-white p-6 rounded-[30px] shadow-xl shadow-gray-200 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              <div className="relative z-10">
                 <p className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Gastos Fijos Mensuales</p>
                 <h2 className="text-3xl font-black">{formatMoney(fijos.reduce((a,f)=>a+safeMonto(f.monto),0))}</h2>
              </div>
              <button onClick={()=>setModalOpen('fijo')} className="relative z-10 bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors active:scale-95 backdrop-blur-md"><Plus size={20}/></button>
           </div>
           
           <div className="space-y-2">
              {fijos.map(f => (
                <div key={f.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-black transition-colors group">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-xs text-gray-900 border border-gray-100">Dia {f.diaCobro}</div>
                      <div><span className="font-bold text-sm block">{f.nombre}</span><span className="text-[10px] text-gray-400 font-bold uppercase">Mensual</span></div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="font-black">{formatMoney(f.monto)}</span>
                      <button onClick={()=>deleteItem('fijos', f)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                   </div>
                </div>
              ))}
           </div>

           {/* Metas */}
           <div>
              <div className="flex justify-between items-center mb-3 px-2">
                 <h3 className="font-black text-lg">Tus Metas</h3>
                 <button onClick={()=>setModalOpen('meta')} className="bg-black text-white p-1 rounded-full"><Plus size={16}/></button>
              </div>
              <div className="grid grid-cols-2 gap-3 pb-20">
                 {metas.map(m => {
                    const progreso = m.montoObjetivo > 0 ? Math.min((m.montoActual / m.montoObjetivo) * 100, 100) : 0; 
                    return (
                      <div key={m.id} className="p-4 bg-white border border-gray-100 rounded-[25px] flex flex-col justify-between h-44 relative overflow-hidden group hover:shadow-lg transition-shadow">
                         <div>
                            <div className="flex justify-between mb-2">
                               <Target size={18} className="text-emerald-500"/>
                               <button onClick={()=>deleteItem('metas', m)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                            </div>
                            <p className="font-black text-sm leading-tight mb-1">{m.nombre}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{formatMoney(m.montoActual)} / {formatMoney(m.montoObjetivo)}</p>
                         </div>
                         <div>
                            <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                               <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{width: `${progreso}%`}}/>
                            </div>
                            <button onClick={()=>{setSelectedMeta(m); setModalOpen('ahorroMeta');}} className="w-full py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase hover:scale-95 transition-transform">Ahorrar +</button>
                         </div>
                      </div>
                    )
                 })}
                 {metas.length === 0 && <div className="col-span-2 text-center p-8 border-2 border-dashed border-gray-200 rounded-3xl text-xs font-bold text-gray-400">Sin metas no hay paraíso. <br/>Crea la primera hoy.</div>}
              </div>
           </div>
        </div>
      )}
    </>
  );
}