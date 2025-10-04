import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ParentReportDashboard } from '@/components/parent-reports/ParentReportDashboard';

// Mock del generador de reportes
jest.mock('@/lib/parent-reports/report-generator', () => ({
  reportGenerator: {
    generateWeeklyReport: jest.fn(() => ({
      student: {
        id: 'test-student',
        name: 'María González',
        level: 3,
        totalPoints: 2450,
        streak: 12,
        lastActivity: new Date(),
        subjects: {
          math: {
            mastery: 85,
            gamesPlayed: 15,
            averageScore: 88,
            timeSpent: 120,
            achievements: ['Suma Maestra', 'Geometría Pro'],
          },
          literacy: {
            mastery: 92,
            gamesPlayed: 18,
            averageScore: 94,
            timeSpent: 150,
            achievements: ['Lector Veloz', 'Escritor Creativo'],
          },
        },
        weeklyProgress: {
          points: 450,
          gamesPlayed: 25,
          timeSpent: 180,
          streak: 12,
        },
        monthlyProgress: {
          points: 1800,
          gamesPlayed: 95,
          timeSpent: 720,
          improvement: 15,
        },
      },
      summary: {
        overallGrade: 'A' as const,
        strengths: ['Excelente en matemáticas', 'Bueno en lectura'],
        areasForImprovement: ['Mejorar en ciencias'],
        recommendations: [
          'Practicar más ciencias',
          'Continuar con matemáticas',
        ],
      },
      weeklyBreakdown: [
        { day: 'Lunes', points: 85, gamesPlayed: 4, timeSpent: 25 },
        { day: 'Martes', points: 92, gamesPlayed: 5, timeSpent: 30 },
      ],
      subjectAnalysis: [
        {
          subject: 'Matemáticas',
          mastery: 85,
          trend: 'up' as const,
          recommendations: ['Continuar practicando'],
        },
        {
          subject: 'Lengua',
          mastery: 92,
          trend: 'up' as const,
          recommendations: ['Excelente progreso'],
        },
      ],
      achievements: {
        recent: ['🔥 Racha de 7 días', '🏆 1000 puntos totales'],
        upcoming: ['🔥 Racha de 14 días', '🏆 2000 puntos totales'],
      },
      goals: {
        daily: 60,
        weekly: 300,
        monthly: 1200,
      },
    })),
  },
  formatTimeSpent: jest.fn((minutes: number) => `${minutes} minutos`),
  getGradeColor: jest.fn((grade: string) => '#4CAF50'),
  getMasteryColor: jest.fn((mastery: number) => '#4CAF50'),
}));

describe('ParentReportDashboard', () => {
  const defaultProps = {
    studentId: 'test-student',
    period: 'week' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<ParentReportDashboard {...defaultProps} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders report data after loading', async () => {
    render(<ParentReportDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Reporte de María González')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Nivel 3 • 2450 puntos totales'),
    ).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('12 días')).toBeInTheDocument();
  });

  it('displays subject analysis correctly', async () => {
    render(<ParentReportDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Matemáticas')).toBeInTheDocument();
      expect(screen.getByText('Lengua')).toBeInTheDocument();
    });

    expect(screen.getByText('85% de dominio')).toBeInTheDocument();
    expect(screen.getByText('92% de dominio')).toBeInTheDocument();
  });

  it('shows strengths and areas for improvement', async () => {
    render(<ParentReportDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Fortalezas')).toBeInTheDocument();
      expect(screen.getByText('Áreas de Mejora')).toBeInTheDocument();
    });

    expect(screen.getByText('Excelente en matemáticas')).toBeInTheDocument();
    expect(screen.getByText('Mejorar en ciencias')).toBeInTheDocument();
  });

  it('displays recommendations', async () => {
    render(<ParentReportDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Recomendaciones')).toBeInTheDocument();
    });

    expect(screen.getByText('Practicar más ciencias')).toBeInTheDocument();
    expect(screen.getByText('Continuar con matemáticas')).toBeInTheDocument();
  });

  it('shows achievements and goals', async () => {
    render(<ParentReportDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Logros y Objetivos')).toBeInTheDocument();
    });

    expect(screen.getByText('Logros Recientes')).toBeInTheDocument();
    expect(screen.getByText('Próximos Objetivos')).toBeInTheDocument();
  });

  it('handles download report functionality', async () => {
    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = jest.fn(() => 'mock-url');
    const mockRevokeObjectURL = jest.fn();
    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    Object.defineProperty(URL, 'createObjectURL', {
      value: mockCreateObjectURL,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: mockRevokeObjectURL,
      writable: true,
    });

    Object.defineProperty(document, 'createElement', {
      value: jest.fn(() => ({
        href: '',
        download: '',
        click: mockClick,
      })),
      writable: true,
    });

    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
      writable: true,
    });
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
      writable: true,
    });

    render(<ParentReportDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Descargar')).toBeInTheDocument();
    });

    const downloadButton = screen.getByText('Descargar');
    downloadButton.click();

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('switches between different periods', async () => {
    render(<ParentReportDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Semanal')).toBeInTheDocument();
      expect(screen.getByText('Mensual')).toBeInTheDocument();
      expect(screen.getByText('Trimestral')).toBeInTheDocument();
    });

    // Test period switching
    const monthlyTab = screen.getByText('Mensual');
    monthlyTab.click();

    await waitFor(() => {
      expect(monthlyTab).toHaveAttribute('data-state', 'active');
    });
  });
});
