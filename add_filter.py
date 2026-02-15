import re

# Leer archivo
with open(r'c:\Users\echoe\Desktop\Personal\AI\life-os\app\components\views\FinanzasView.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Código a insertar
insert = '''

                {/* INDICADOR DE FILTRO ACTIVO */}
                {selectedAccountId && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-xl shadow-lg"><Wallet size={16} className="text-white" /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Filtrando por cuenta</p>
                          <p className="text-sm font-bold text-gray-900">{cuentas.find(c => c.id === selectedAccountId)?.nombre}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedAccountId(null)} className="p-2 hover:bg-blue-100 rounded-xl transition-all active:scale-95"><X size={18} className="text-blue-600" /></button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1 flex-1 bg-blue-200 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width:'100%'}}></div></div>
                      <p className="text-xs text-blue-700 font-bold">{movimientos.filter(m => m.cuentaId === selectedAccountId || m.cuentaDestinoId === selectedAccountId).length} movimientos</p>
                    </div>
                  </div>
                )}
'''

# Buscar y reemplazar
pattern = r'(                </div>\r?\n)\r?\n(                <div>\r?\n                   <div className="flex items-center justify-between mb-3 mt-4 px-2">)'
replacement = r'\1' + insert + r'\2'

new_content = re.sub(pattern, replacement, content, count=1)

# Escribir archivo
with open(r'c:\Users\echoe\Desktop\Personal\AI\life-os\app\components\views\FinanzasView.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Filter indicator added successfully")
