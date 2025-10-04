import * as React from 'react';

interface StudentSummary {
  studentName: string;
  totalPoints: number;
  streakDays: number;
  chaptersCompleted: number;
  avgScore: number;
  subjects: {
    name: string;
    icon: string;
    completedCount: number;
    avgScore: number;
  }[];
}

interface WeeklyReportEmailProps {
  parentName: string;
  students: StudentSummary[];
  weekStart: string;
  weekEnd: string;
  dashboardUrl: string;
}

export const WeeklyReportEmail = ({
  parentName,
  students,
  weekStart,
  weekEnd,
  dashboardUrl,
}: WeeklyReportEmailProps) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reporte Semanal - Fuzzy's Home School</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f6', margin: 0, padding: 0 }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f3f4f6' }}>
          <tr>
            <td align="center" style={{ padding: '40px 20px' }}>
              {/* Main Container */}
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>

                {/* Header */}
                <tr>
                  <td style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 30px', textAlign: 'center' }}>
                    <h1 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>
                      🎓 Fuzzy's Home School
                    </h1>
                    <p style={{ color: '#e0e7ff', margin: 0, fontSize: '16px' }}>
                      Reporte Semanal de Progreso
                    </p>
                    <p style={{ color: '#c7d2fe', margin: '10px 0 0 0', fontSize: '14px' }}>
                      {weekStart} - {weekEnd}
                    </p>
                  </td>
                </tr>

                {/* Greeting */}
                <tr>
                  <td style={{ padding: '30px 30px 20px 30px' }}>
                    <p style={{ fontSize: '16px', color: '#374151', margin: '0 0 20px 0', lineHeight: '24px' }}>
                      Hola <strong>{parentName}</strong>,
                    </p>
                    <p style={{ fontSize: '16px', color: '#374151', margin: 0, lineHeight: '24px' }}>
                      Aquí está el resumen del progreso académico de tus hijos esta semana. 🚀
                    </p>
                  </td>
                </tr>

                {/* Students Loop */}
                {students.map((student, index) => (
                  <React.Fragment key={index}>
                    {/* Student Header */}
                    <tr>
                      <td style={{ padding: '20px 30px 10px 30px' }}>
                        <div style={{ borderLeft: '4px solid #667eea', paddingLeft: '12px', marginBottom: '15px' }}>
                          <h2 style={{ fontSize: '22px', color: '#1f2937', margin: '0 0 5px 0', fontWeight: 'bold' }}>
                            {student.studentName}
                          </h2>
                        </div>
                      </td>
                    </tr>

                    {/* Stats Cards */}
                    <tr>
                      <td style={{ padding: '0 30px 20px 30px' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0">
                          <tr>
                            <td width="48%" style={{ verticalAlign: 'top' }}>
                              <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                                <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '5px' }}>
                                  🏆 Puntos Totales
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#b45309' }}>
                                  {student.totalPoints}
                                </div>
                              </div>
                            </td>
                            <td width="4%"></td>
                            <td width="48%" style={{ verticalAlign: 'top' }}>
                              <div style={{ backgroundColor: '#fed7aa', padding: '15px', borderRadius: '8px', border: '1px solid #fb923c' }}>
                                <div style={{ fontSize: '14px', color: '#9a3412', marginBottom: '5px' }}>
                                  🔥 Racha
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#c2410c' }}>
                                  {student.streakDays} días
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr><td colSpan={3} style={{ height: '10px' }}></td></tr>
                          <tr>
                            <td width="48%" style={{ verticalAlign: 'top' }}>
                              <div style={{ backgroundColor: '#dbeafe', padding: '15px', borderRadius: '8px', border: '1px solid #60a5fa' }}>
                                <div style={{ fontSize: '14px', color: '#1e3a8a', marginBottom: '5px' }}>
                                  📖 Capítulos
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af' }}>
                                  {student.chaptersCompleted}
                                </div>
                              </div>
                            </td>
                            <td width="4%"></td>
                            <td width="48%" style={{ verticalAlign: 'top' }}>
                              <div style={{ backgroundColor: '#e9d5ff', padding: '15px', borderRadius: '8px', border: '1px solid #a78bfa' }}>
                                <div style={{ fontSize: '14px', color: '#581c87', marginBottom: '5px' }}>
                                  ⭐ Promedio
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6b21a8' }}>
                                  {student.avgScore}%
                                </div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    {/* Subject Progress */}
                    <tr>
                      <td style={{ padding: '10px 30px 20px 30px' }}>
                        <h3 style={{ fontSize: '16px', color: '#4b5563', margin: '0 0 12px 0', fontWeight: '600' }}>
                          Progreso por Materia
                        </h3>
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
                          {student.subjects.map((subject, subIndex) => (
                            <tr key={subIndex}>
                              <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '14px', color: '#374151' }}>
                                    {subject.icon} {subject.name}
                                  </span>
                                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                                    {subject.completedCount} capítulos · {subject.avgScore}%
                                  </span>
                                </div>
                                <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                                  <div style={{ width: `${subject.avgScore}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '3px' }}></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </table>
                      </td>
                    </tr>

                    {/* Divider between students */}
                    {index < students.length - 1 && (
                      <tr>
                        <td style={{ padding: '0 30px' }}>
                          <div style={{ borderTop: '2px solid #e5e7eb', margin: '10px 0' }}></div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

                {/* CTA Button */}
                <tr>
                  <td style={{ padding: '30px 30px 40px 30px', textAlign: 'center' }}>
                    <a
                      href={dashboardUrl}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#667eea',
                        color: '#ffffff',
                        padding: '14px 32px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
                      }}
                    >
                      Ver Dashboard Completo
                    </a>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#f9fafb', padding: '20px 30px', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                      Fuzzy's Home School - Educación Personalizada con IA
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      Este es un correo automático. No respondas a este mensaje.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};
