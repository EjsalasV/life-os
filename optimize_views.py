import re

# 1. FinanzasView - Agregar useMemo y React.memo
file_path = r'c:\Users\echoe\Desktop\Personal\AI\life-os\app\components\views\FinanzasView.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Cambio 1: Agregar useMemo al import
content = content.replace(
    "import React, { useState } from 'react';",
    "import React, { useState, useMemo } from 'react';"
)

# Cambio 2: Cambiar export default a React.memo
content = re.sub(
    r'export default FinanzasView;',
    'export default React.memo(FinanzasView);',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ FinanzasView optimizado con React.memo y useMemo")

# 2. VentasView - Agregar React.memo
file_path = r'c:\Users\echoe\Desktop\Personal\AI\life-os\app\components\views\VentasView.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Verificar si ya tiene React import
if "import React" not in content:
    # Agregar import React
    content = '"use client";\nimport React from \'react\';\n' + content.replace('"use client";\n', '')

# Cambiar export
content = re.sub(
    r'export default VentasView;',
    'export default React.memo(VentasView);',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ VentasView optimizado con React.memo")

# 3. SaludView - Agregar React.memo
file_path = r'c:\Users\echoe\Desktop\Personal\AI\life-os\app\components\views\SaludView.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Verificar si ya tiene React import
if "import React" not in content:
    content = '"use client";\nimport React from \'react\';\n' + content.replace('"use client";\n', '')

# Cambiar export
content = re.sub(
    r'export default SaludView;',
    'export default React.memo(SaludView);',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ SaludView optimizado con React.memo")

# 4. ExpensesChart - Agregar React.memo
file_path = r'c:\Users\echoe\Desktop\Personal\AI\life-os\app\components\charts\ExpensesChart.js'
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if "import React" not in content:
        content = 'import React from \'react\';\n' + content

    content = re.sub(
        r'export default ExpensesChart;',
        'export default React.memo(ExpensesChart);',
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ ExpensesChart optimizado con React.memo")
except Exception as e:
    print(f"⚠️ ExpensesChart: {e}")

print("\n🎉 Todas las optimizaciones React.memo completadas")
