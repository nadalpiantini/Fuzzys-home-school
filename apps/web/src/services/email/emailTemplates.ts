import { EmailTemplate } from './emailService';

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'progress-update',
    name: 'Progress Update',
    subject: '📈 Actualización de Progreso - {{studentName}}',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Actualización de Progreso</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .metric { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .achievement { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 10px 0; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Excelente Progreso!</h1>
            <p>Tu estudiante {{studentName}} ha logrado avances significativos</p>
          </div>
          
          <div class="content">
            <h2>📊 Resumen de la Semana</h2>
            
            <div class="metric">
              <h3>Puntuación Promedio</h3>
              <div class="metric-value">{{averageScore}}%</div>
              <p>Mejora de {{improvement}}% desde la semana pasada</p>
            </div>
            
            <div class="metric">
              <h3>Tiempo de Estudio</h3>
              <div class="metric-value">{{totalTimeSpent}} minutos</div>
              <p>Distribuido en {{sessionsCount}} sesiones</p>
            </div>
            
            <div class="metric">
              <h3>Juegos Completados</h3>
              <div class="metric-value">{{gamesCompleted}}</div>
              <p>En {{subjectsCount}} materias diferentes</p>
            </div>
            
            {{#if achievements.length}}
            <h3>🏆 Logros Recientes</h3>
            {{#each achievements}}
            <div class="achievement">
              <strong>{{this.name}}</strong><br>
              {{this.description}}
            </div>
            {{/each}}
            {{/if}}
            
            <h3>📈 Áreas de Fortaleza</h3>
            <ul>
              {{#each strongSubjects}}
              <li><strong>{{this.subject}}</strong>: {{this.score}}% ({{this.trend}})</li>
              {{/each}}
            </ul>
            
            {{#if improvementAreas.length}}
            <h3>🎯 Áreas de Mejora</h3>
            <ul>
              {{#each improvementAreas}}
              <li><strong>{{this.subject}}</strong>: {{this.score}}% - {{this.suggestion}}</li>
              {{/each}}
            </ul>
            {{/if}}
            
            <div style="text-align: center;">
              <a href="{{dashboardUrl}}" class="button">Ver Dashboard Completo</a>
            </div>
            
            <div class="footer">
              <p>Este reporte fue generado automáticamente por Fuzzy's Home School</p>
              <p>Para ajustar las notificaciones, visita tu configuración de cuenta</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      ¡Excelente Progreso! - {{studentName}}
      
      Resumen de la Semana:
      - Puntuación Promedio: {{averageScore}}% (Mejora de {{improvement}}%)
      - Tiempo de Estudio: {{totalTimeSpent}} minutos en {{sessionsCount}} sesiones
      - Juegos Completados: {{gamesCompleted}} en {{subjectsCount}} materias
      
      Logros Recientes:
      {{#each achievements}}
      - {{this.name}}: {{this.description}}
      {{/each}}
      
      Áreas de Fortaleza:
      {{#each strongSubjects}}
      - {{this.subject}}: {{this.score}}% ({{this.trend}})
      {{/each}}
      
      {{#if improvementAreas.length}}
      Áreas de Mejora:
      {{#each improvementAreas}}
      - {{this.subject}}: {{this.score}}% - {{this.suggestion}}
      {{/each}}
      {{/if}}
      
      Ver dashboard completo: {{dashboardUrl}}
      
      ---
      Este reporte fue generado automáticamente por Fuzzy's Home School
    `,
    variables: [
      'studentName',
      'averageScore',
      'improvement',
      'totalTimeSpent',
      'sessionsCount',
      'gamesCompleted',
      'subjectsCount',
      'achievements',
      'strongSubjects',
      'improvementAreas',
      'dashboardUrl',
    ],
    category: 'notification',
  },
  {
    id: 'achievement-badge',
    name: 'Achievement Badge',
    subject: '🏆 ¡Nueva Insignia Desbloqueada! - {{studentName}}',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Insignia</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .badge { text-align: center; margin: 30px 0; }
          .badge-icon { font-size: 80px; margin-bottom: 20px; }
          .badge-name { font-size: 28px; font-weight: bold; color: #ff6b35; margin-bottom: 10px; }
          .badge-description { font-size: 18px; color: #666; margin-bottom: 20px; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .celebration { background: #fff3cd; border: 2px solid #ffeaa7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .button { background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Felicidades!</h1>
            <p>{{studentName}} ha desbloqueado una nueva insignia</p>
          </div>
          
          <div class="badge">
            <div class="badge-icon">{{badgeIcon}}</div>
            <div class="badge-name">{{badgeName}}</div>
            <div class="badge-description">{{badgeDescription}}</div>
          </div>
          
          <div class="content">
            <div class="celebration">
              <h3>🎊 ¡Merecido Reconocimiento!</h3>
              <p>{{studentName}} ha demostrado {{achievementReason}} y por eso se ha ganado esta insignia especial.</p>
            </div>
            
            <h3>📊 Progreso del Estudiante</h3>
            <ul>
              <li><strong>Puntuación Total:</strong> {{totalPoints}} puntos</li>
              <li><strong>Insignias Desbloqueadas:</strong> {{totalBadges}} de {{maxBadges}}</li>
              <li><strong>Racha Actual:</strong> {{currentStreak}} días consecutivos</li>
              <li><strong>Nivel:</strong> {{currentLevel}}</li>
            </ul>
            
            <h3>🎯 Próximos Objetivos</h3>
            <ul>
              {{#each nextGoals}}
              <li>{{this.description}} ({{this.progress}}% completado)</li>
              {{/each}}
            </ul>
            
            <div style="text-align: center;">
              <a href="{{profileUrl}}" class="button">Ver Perfil Completo</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      ¡Nueva Insignia Desbloqueada! - {{studentName}}
      
      🏆 {{badgeName}}
      {{badgeDescription}}
      
      {{studentName}} ha demostrado {{achievementReason}} y por eso se ha ganado esta insignia especial.
      
      Progreso del Estudiante:
      - Puntuación Total: {{totalPoints}} puntos
      - Insignias Desbloqueadas: {{totalBadges}} de {{maxBadges}}
      - Racha Actual: {{currentStreak}} días consecutivos
      - Nivel: {{currentLevel}}
      
      Próximos Objetivos:
      {{#each nextGoals}}
      - {{this.description}} ({{this.progress}}% completado)
      {{/each}}
      
      Ver perfil completo: {{profileUrl}}
    `,
    variables: [
      'studentName',
      'badgeIcon',
      'badgeName',
      'badgeDescription',
      'achievementReason',
      'totalPoints',
      'totalBadges',
      'maxBadges',
      'currentStreak',
      'currentLevel',
      'nextGoals',
      'profileUrl',
    ],
    category: 'notification',
  },
  {
    id: 'alert-struggling',
    name: 'Student Struggling Alert',
    subject: '⚠️ Atención: {{studentName}} necesita apoyo',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alerta de Apoyo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .alert { background: #fff3cd; border: 2px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .metric { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .metric-value { font-size: 24px; font-weight: bold; color: #dc3545; }
          .suggestion { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 10px 0; }
          .button { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Alerta de Apoyo</h1>
            <p>Tu estudiante {{studentName}} podría necesitar ayuda adicional</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <h3>🚨 Situación Detectada</h3>
              <p>{{alertReason}}</p>
            </div>
            
            <h3>📊 Métricas de Preocupación</h3>
            
            <div class="metric">
              <h4>Puntuación Promedio</h4>
              <div class="metric-value">{{averageScore}}%</div>
              <p>Disminución de {{scoreDecline}}% en los últimos {{timeframe}} días</p>
            </div>
            
            <div class="metric">
              <h4>Tiempo de Estudio</h4>
              <div class="metric-value">{{timeSpent}} minutos</div>
              <p>Reducción del {{timeDecline}}% comparado con el promedio</p>
            </div>
            
            <div class="metric">
              <h4>Áreas Problemáticas</h4>
              <ul>
                {{#each strugglingSubjects}}
                <li><strong>{{this.subject}}</strong>: {{this.score}}% ({{this.trend}})</li>
                {{/each}}
              </ul>
            </div>
            
            <h3>💡 Recomendaciones de Apoyo</h3>
            {{#each suggestions}}
            <div class="suggestion">
              <strong>{{this.title}}</strong><br>
              {{this.description}}
            </div>
            {{/each}}
            
            <h3>📞 Acciones Sugeridas</h3>
            <ul>
              <li>Revisar el progreso en el dashboard</li>
              <li>Considerar ajustar la dificultad del contenido</li>
              <li>Programar una sesión de tutoría adicional</li>
              <li>Contactar al estudiante para apoyo emocional</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="{{dashboardUrl}}" class="button">Revisar Dashboard</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Alerta de Apoyo - {{studentName}}
      
      Situación Detectada:
      {{alertReason}}
      
      Métricas de Preocupación:
      - Puntuación Promedio: {{averageScore}}% (Disminución de {{scoreDecline}}% en {{timeframe}} días)
      - Tiempo de Estudio: {{timeSpent}} minutos (Reducción del {{timeDecline}}%)
      
      Áreas Problemáticas:
      {{#each strugglingSubjects}}
      - {{this.subject}}: {{this.score}}% ({{this.trend}})
      {{/each}}
      
      Recomendaciones de Apoyo:
      {{#each suggestions}}
      - {{this.title}}: {{this.description}}
      {{/each}}
      
      Acciones Sugeridas:
      - Revisar el progreso en el dashboard
      - Considerar ajustar la dificultad del contenido
      - Programar una sesión de tutoría adicional
      - Contactar al estudiante para apoyo emocional
      
      Revisar dashboard: {{dashboardUrl}}
    `,
    variables: [
      'studentName',
      'alertReason',
      'averageScore',
      'scoreDecline',
      'timeframe',
      'timeSpent',
      'timeDecline',
      'strugglingSubjects',
      'suggestions',
      'dashboardUrl',
    ],
    category: 'alert',
  },
  {
    id: 'weekly-report',
    name: 'Weekly Report',
    subject: '📊 Reporte Semanal - {{studentName}}',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Semanal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .metric { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .subject { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #667eea; }
          .achievement { background: #e8f5e8; padding: 15px; margin: 10px 0; border-radius: 6px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Reporte Semanal</h1>
            <p>Resumen del progreso de {{studentName}} del {{weekStart}} al {{weekEnd}}</p>
          </div>
          
          <div class="content">
            <h2>📈 Resumen General</h2>
            
            <div class="metric">
              <h3>Puntuación Promedio</h3>
              <div class="metric-value">{{averageScore}}%</div>
              <p>{{scoreTrend}} desde la semana pasada</p>
            </div>
            
            <div class="metric">
              <h3>Tiempo Total de Estudio</h3>
              <div class="metric-value">{{totalTimeSpent}} minutos</div>
              <p>Promedio de {{averageSessionLength}} minutos por sesión</p>
            </div>
            
            <div class="metric">
              <h3>Actividades Completadas</h3>
              <div class="metric-value">{{activitiesCompleted}}</div>
              <p>En {{subjectsCount}} materias diferentes</p>
            </div>
            
            <h2>📚 Rendimiento por Materia</h2>
            {{#each subjectPerformance}}
            <div class="subject">
              <h4>{{this.subject}}</h4>
              <p><strong>Puntuación:</strong> {{this.score}}% ({{this.trend}})</p>
              <p><strong>Tiempo:</strong> {{this.timeSpent}} minutos</p>
              <p><strong>Actividades:</strong> {{this.activities}} completadas</p>
            </div>
            {{/each}}
            
            <h2>🏆 Logros de la Semana</h2>
            {{#each achievements}}
            <div class="achievement">
              <strong>{{this.name}}</strong><br>
              {{this.description}}
            </div>
            {{/each}}
            
            <h2>🎯 Objetivos para la Próxima Semana</h2>
            <ul>
              {{#each nextWeekGoals}}
              <li>{{this.description}}</li>
              {{/each}}
            </ul>
            
            <div style="text-align: center;">
              <a href="{{dashboardUrl}}" class="button">Ver Dashboard Completo</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Reporte Semanal - {{studentName}}
      Del {{weekStart}} al {{weekEnd}}
      
      Resumen General:
      - Puntuación Promedio: {{averageScore}}% ({{scoreTrend}})
      - Tiempo Total de Estudio: {{totalTimeSpent}} minutos
      - Actividades Completadas: {{activitiesCompleted}} en {{subjectsCount}} materias
      
      Rendimiento por Materia:
      {{#each subjectPerformance}}
      - {{this.subject}}: {{this.score}}% ({{this.trend}}), {{this.timeSpent}} min, {{this.activities}} actividades
      {{/each}}
      
      Logros de la Semana:
      {{#each achievements}}
      - {{this.name}}: {{this.description}}
      {{/each}}
      
      Objetivos para la Próxima Semana:
      {{#each nextWeekGoals}}
      - {{this.description}}
      {{/each}}
      
      Ver dashboard completo: {{dashboardUrl}}
    `,
    variables: [
      'studentName',
      'weekStart',
      'weekEnd',
      'averageScore',
      'scoreTrend',
      'totalTimeSpent',
      'averageSessionLength',
      'activitiesCompleted',
      'subjectsCount',
      'subjectPerformance',
      'achievements',
      'nextWeekGoals',
      'dashboardUrl',
    ],
    category: 'report',
  },
];

export function getTemplateById(templateId: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((template) => template.id === templateId);
}

export function getTemplatesByCategory(category: string): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter((template) => template.category === category);
}
