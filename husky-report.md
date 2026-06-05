
app.get('/husky-report', async (req, res) => {
  try {
    // 1. Obtención de parámetros (UI)
    const today = new Date().toISOString().split('T')[0];
    const startDate = req.query.startDate || today;
    const endDate = req.query.endDate || today;
    
    // Término de búsqueda (Matrícula o Nombre)
    const searchInput = req.query.search || '';
    const searchQuery = searchInput.trim() === '' ? '%' : `%${searchInput}%`;

    // Filtro de Plantel
    const plantelInput = req.query.plantel || '';
    const plantelQuery = plantelInput.trim() === '' ? '%' : `${plantelInput}%`;

    // 2. Consulta SQL principal de los accesos
    const rawQuery = `
      SELECT 
        DATE_FORMAT(A.timestamp, '%Y-%m-%d') as fecha,
        CONCAT(ap.nombreA, ' ', ap.paternoA, ' ', ap.maternoA) as nombre_estudiante,
        CONCAT(pa.nombreP, ' ', pa.paternoP, ' ', pa.maternoP) as nombre_autorizado,
        A.type as tipo_accion,
        TIME(A.timestamp) as hora_accion,
        pa.parenP as parentesco,
        B.username as matricula,
        B.plantel
      FROM acceso A
      LEFT JOIN personas_autorizadas pa ON pa.id = A.ss_id
      LEFT JOIN users B ON pa.user_id = B.id
      LEFT JOIN alumno_pa ap ON ap.user_id = B.id
      WHERE DATE(A.timestamp) BETWEEN ? AND ?
        AND LEFT(B.username, 2) LIKE ?
        AND (
          CONCAT(ap.nombreA, ' ', ap.paternoA, ' ', ap.maternoA) LIKE ? 
          OR B.username LIKE ?
        )
      ORDER BY DATE(A.timestamp) ASC, TIME(A.timestamp) ASC
    `;

    const [results] = await casitaiedis.query(rawQuery, [
      startDate, 
      endDate, 
      plantelQuery, 
      searchQuery, 
      searchQuery
    ]);

    // 3. Procesamiento: Agrupar Entrada y Salida en UNA SOLA FILA por Alumno y Día
    const reportData = new Map();

    results.forEach(row => {
      const uniqueKey = `${row.fecha}_${row.matricula}`;

      if (!reportData.has(uniqueKey)) {
        reportData.set(uniqueKey, {
          fecha: row.fecha,
          matricula: row.matricula,
          estudiante: row.nombre_estudiante,
          plantel: row.plantel,
          entrada: null,
          salida: null
        });
      }

      const record = reportData.get(uniqueKey);
      const personaInfo = `${row.nombre_autorizado || 'N/D'} (${row.parentesco || 'N/D'})`;

      if (row.tipo_accion === 'entrada') {
        if (!record.entrada) {
          record.entrada = { hora: row.hora_accion, tutor: personaInfo };
        }
      } else if (row.tipo_accion === 'salida') {
        record.salida = { hora: row.hora_accion, tutor: personaInfo };
      }
    });

    const finalRows = Array.from(reportData.values());

    // 4. Obtener las fotos de TODAS las personas autorizadas (Para la galería superior)
    let autorizadosUnicos = [];
    let matriculasToFetch = new Set(results.map(r => r.matricula).filter(Boolean));
    
    // Si se buscó a un alumno en específico, traemos sus autorizados incluso si no tuvo asistencia
    if (searchInput.trim() !== '') {
        const searchStudentsQuery = `
            SELECT B.username
            FROM users B
            LEFT JOIN alumno_pa ap ON ap.user_id = B.id
            WHERE (B.username LIKE ? OR CONCAT(ap.nombreA, ' ', ap.paternoA, ' ', ap.maternoA) LIKE ?)
              AND LEFT(B.username, 2) LIKE ?
        `;
        const [searchStudents] = await casitaiedis.query(searchStudentsQuery, [searchQuery, searchQuery, plantelQuery]);
        searchStudents.forEach(s => matriculasToFetch.add(s.username));
    }

    if (matriculasToFetch.size > 0) {
        const matriculasArr = Array.from(matriculasToFetch);
        const placeholders = matriculasArr.map(() => '?').join(',');
        const paQuery = `
            SELECT 
                CONCAT(pa.nombreP, ' ', pa.paternoP, ' ', pa.maternoP) as nombre_autorizado,
                pa.parenP as parentesco,
                pa.foto as foto_autorizado,
                B.username as matricula,
                CONCAT(ap.nombreA, ' ', ap.paternoA, ' ', ap.maternoA) as nombre_estudiante
            FROM personas_autorizadas pa
            JOIN users B ON pa.user_id = B.id
            JOIN alumno_pa ap ON ap.user_id = B.id
            WHERE B.username IN (${placeholders})
            GROUP BY pa.id
        `;
        const [paResults] = await casitaiedis.query(paQuery, matriculasArr);
        autorizadosUnicos = paResults;
    }

    // 5. Generación del HTML
    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte de Accesos - Por Estudiante</title>
      <style>
        :root {
          --text-color: #222;
          --border-color: #444;
          --bg-light: #f4f4f4;
        }
        body {
          font-family: "Helvetica Neue", Arial, sans-serif;
          color: var(--text-color);
          margin: 0;
          padding: 20px;
          background-color: #e0e0e0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: #fff;
          padding: 40px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        
        .controls-ui {
          background: #2b2b2b;
          color: #fff;
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 30px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .controls-row {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: center;
          justify-content: space-between;
        }
        .form-group { display: flex; gap: 10px; align-items: center; }
        .controls-ui input, .controls-ui button {
          padding: 8px 12px;
          border: 1px solid #666;
          border-radius: 3px;
          font-size: 14px;
        }
        .controls-ui input[type="text"] { width: 200px; }
        .search-bar { width: 300px !important; }
        .btn-submit {
          background: #555; color: #fff; cursor: pointer; border: none; font-weight: bold; transition: background 0.3s;
        }
        .btn-submit:hover { background: #777; }
        
        .export-btns button {
          background: #1e5027; color: white; border: none; cursor: pointer; font-weight: bold; margin-left: 10px; padding: 8px 15px; border-radius: 3px;
        }
        .export-btns button.print-btn { background: #333; border: 1px solid #fff; }

        .report-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 20px;
        }
        .report-header h1 { margin: 0 0 10px 0; text-transform: uppercase; font-size: 22px; letter-spacing: 1px; }
        .report-meta { display: flex; justify-content: space-between; font-size: 14px; color: #555; }

        /* GALERÍA DE PERSONAS AUTORIZADAS */
        .autorizados-gallery {
          margin-bottom: 30px;
          padding: 20px;
          background: #fdfdfd;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .autorizados-gallery h3 {
          margin-top: 0;
          text-align: center;
          text-transform: uppercase;
          font-size: 15px;
          color: #333;
          margin-bottom: 20px;
        }
        .gallery-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
        }
        .autorizado-card {
          width: 140px;
          background: #fff;
          border: 1px solid #e0e0e0;
          padding: 10px;
          text-align: center;
          border-radius: 6px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .autorizado-card img {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: 50%;
          margin-bottom: 10px;
          border: 2px solid #ccc;
        }
        .autorizado-card .name { font-weight: bold; font-size: 12px; margin-bottom: 4px; line-height: 1.2; }
        .autorizado-card .paren { font-size: 11px; color: #666; margin-bottom: 6px; }
        .autorizado-card .student { font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 5px; line-height: 1.2; }

        /* TABLA DE DATOS */
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
        th, td { border: 1px solid var(--border-color); padding: 8px; text-align: center; vertical-align: middle; }
        th { background-color: var(--border-color); color: #fff; text-transform: uppercase; font-weight: bold; }
        .col-left { text-align: left; }
        tr:nth-child(even) { background-color: var(--bg-light); }
        
        .hora-box { font-weight: bold; font-size: 13px; }
        .tutor-box { font-size: 11px; color: #555; margin-top: 4px; }
        
        .entrada-bg { background-color: rgba(0, 128, 0, 0.05); }
        .salida-bg { background-color: rgba(128, 0, 0, 0.05); }

        .signatures { display: flex; justify-content: space-around; margin-top: 60px; }
        .signature-box { text-align: center; width: 250px; border-top: 1px solid var(--border-color); padding-top: 10px; font-size: 14px; }

        @media print {
          body { background: #fff; padding: 0; }
          .container { box-shadow: none; padding: 0; max-width: 100%; }
          .controls-ui { display: none !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      </style>
    </head>
    <body>

      <div class="container">
        <!-- Interfaz de Usuario -->
        <div class="controls-ui">
          <form method="GET" action="/husky-report" id="filterForm">
            <div class="controls-row">
              <div class="form-group">
                <input type="text" name="search" class="search-bar" value="${searchInput}" placeholder="Buscar alumno o matrícula...">
              </div>
              <div class="form-group">
                <label>Desde:</label>
                <input type="date" name="startDate" value="${startDate}" required>
                <label>Hasta:</label>
                <input type="date" name="endDate" value="${endDate}" required>
              </div>
              <div class="form-group">
                <label>Plantel:</label>
                <input type="text" name="plantel" value="${plantelInput}" placeholder="Ej. 01" style="width: 80px;">
              </div>
              <button type="submit" class="btn-submit">🔍 Generar Reporte</button>
            </div>
          </form>
          <div class="controls-row" style="justify-content: flex-end;">
            <div class="export-btns">
              <button class="print-btn" onclick="window.print()">🖨️ PDF / Imprimir</button>
              <button onclick="exportTableToCSV('Reporte_Estudiantes_${startDate}_al_${endDate}.csv')">📊 Exportar Excel</button>
            </div>
          </div>
        </div>

        <div class="report-header">
          <h1>Reporte Consolidado de Accesos por Estudiante</h1>
          <div class="report-meta">
            <span><strong>Período:</strong> ${startDate} al ${endDate}</span>
            <span><strong>Filtro Búsqueda:</strong> ${searchInput || 'Todos'}</span>
            <span><strong>Fecha de Emisión:</strong> ${new Date().toLocaleString('es-MX')}</span>
          </div>
        </div>

        <!-- FOTOS DE TODAS LAS PERSONAS AUTORIZADAS (TOP DEL REPORTE) -->
        ${autorizadosUnicos.length > 0 ? `
        <div class="autorizados-gallery">
          <h3>Personas Autorizadas del Reporte</h3>
          <div class="gallery-grid">
            ${autorizadosUnicos.map(p => {
              // Asegurar que la ruta inicie con "/" si no es HTTP
              let fUrl = p.foto_autorizado && p.foto_autorizado.trim() !== '' ? p.foto_autorizado : null;
              if(fUrl && !fUrl.startsWith('http') && !fUrl.startsWith('/')) fUrl = '/' + fUrl;
              
              return `
              <div class="autorizado-card">
                <img src="${fUrl || '/default-avatar.png'}" alt="Foto" onerror="this.src='/default-avatar.png';">
                <div class="name">${p.nombre_autorizado}</div>
                <div class="paren">${p.parentesco}</div>
                <div class="student">De: ${p.nombre_estudiante}</div>
              </div>
            `}).join('')}
          </div>
        </div>
        ` : ''}

        <!-- TABLA PRINCIPAL DE ACCESOS -->
        <table>
          <thead>
            <tr>
              <th rowspan="2">Fecha</th>
              <th rowspan="2" class="col-left">Matrícula</th>
              <th rowspan="2" class="col-left">Nombre del Estudiante</th>
              <th rowspan="2">Plantel</th>
              <th colspan="2">Registro de Entrada</th>
              <th colspan="2">Registro de Salida</th>
            </tr>
            <tr>
              <th>Hora</th>
              <th>Autorizado (Parentesco)</th>
              <th>Hora</th>
              <th>Autorizado (Parentesco)</th>
            </tr>
          </thead>
          <tbody>
            ${finalRows.length > 0 ? finalRows.map(row => {
              
              const entHora = row.entrada ? row.entrada.hora : '---';
              const entTutor = row.entrada ? row.entrada.tutor : '---';
              const salHora = row.salida ? row.salida.hora : '---';
              const salTutor = row.salida ? row.salida.tutor : '---';

              return `
                <tr>
                  <td>${row.fecha}</td>
                  <td class="col-left">${row.matricula || '---'}</td>
                  <td class="col-left"><strong>${row.estudiante || '---'}</strong></td>
                  <td>${row.plantel || '---'}</td>
                  
                  <td class="entrada-bg hora-box">${entHora}</td>
                  <td class="entrada-bg tutor-box col-left">${entTutor}</td>
                  
                  <td class="salida-bg hora-box">${salHora}</td>
                  <td class="salida-bg tutor-box col-left">${salTutor}</td>
                </tr>
              `;
            }).join('') : '<tr><td colspan="8" style="text-align:center; padding: 30px; font-size:14px;">No se encontraron registros de accesos.</td></tr>'}
          </tbody>
        </table>

        <!-- Validación formal -->
        <div class="signatures">
          <div class="signature-box">Sello de Control Escolar</div>
          <div class="signature-box">Firma del Director / Responsable</div>
        </div>
      </div>

      <script>
        function exportTableToCSV(filename) {
          let csv = [];
          csv.push('"Fecha","Matricula","Nombre del Estudiante","Plantel","Hora Entrada","Autorizado Entrada","Hora Salida","Autorizado Salida"');
          
          let rows = document.querySelectorAll("table tbody tr");
          for (let i = 0; i < rows.length; i++) {
            let row = [], cols = rows[i].querySelectorAll("td");
            if(cols.length < 8) continue; 
            for (let j = 0; j < cols.length; j++) {
              let data = cols[j].innerText.replace(/(\\r\\n|\\n|\\r)/gm, " ").replace(/"/g, '""');
              row.push('"' + data + '"');
            }
            csv.push(row.join(","));
          }

          let csvFile = new Blob(["\\uFEFF" + csv.join("\\n")], {type: "text/csv;charset=utf-8;"});
          let downloadLink = document.createElement("a");
          downloadLink.download = filename;
          downloadLink.href = window.URL.createObjectURL(csvFile);
          downloadLink.style.display = "none";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      </script>
    </body>
    </html>
    `;

    res.send(htmlResponse);

  } catch (error) {
    console.error('Error generando reporte husky:', error);
    res.status(500).send('<div style="text-align:center; padding:50px; font-family:sans-serif;"><h2>Error del servidor al generar el reporte.</h2><p>Contacte al administrador del sistema.</p></div>');
  }
});