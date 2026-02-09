import * as XLSX from 'xlsx';

export const exportToExcel = (movimientos, periodo) => {
  try {
    // 1. Validación: Si no hay datos, avisamos
    if (!movimientos || movimientos.length === 0) {
      alert("No hay movimientos para exportar en este periodo.");
      return;
    }

    // 2. Limpieza de datos (Mapeo)
    const data = movimientos.map(m => ({
      Fecha: m.timestamp?.toDate ? m.timestamp.toDate().toLocaleDateString('es-EC') : 'S/F',
      Nombre: m.nombre || 'Sin nombre',
      Categoria: (m.categoria || 'OTROS').toUpperCase(),
      Tipo: m.tipo,
      // Si es GASTO, guardamos como número negativo para Excel
      Monto: m.tipo === 'GASTO' ? -Math.abs(parseFloat(m.monto || 0)) : Math.abs(parseFloat(m.monto || 0)),
      Cuenta: m.cuentaNombre || 'N/A'
    }));

    // 3. Crear Hoja de Cálculo (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 4. Ajustar ancho de columnas (Estética)
    const wscols = [
      {wch: 12}, // Fecha
      {wch: 30}, // Nombre
      {wch: 15}, // Categoria
      {wch: 10}, // Tipo
      {wch: 12}, // Monto
      {wch: 20}  // Cuenta
    ];
    worksheet['!cols'] = wscols;

    // 5. Crear Libro (Workbook) y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");

    // 6. Generar nombre de archivo dinámico
    const fileName = `Reporte_LifeOS_${periodo || 'General'}.xlsx`;

    // 7. Descargar
    XLSX.writeFile(workbook, fileName);
  } catch (err) {
    console.error('Error exportando a Excel:', err);
    alert('Ocurrió un error al generar el archivo. Revisa la consola.');
  }
};
