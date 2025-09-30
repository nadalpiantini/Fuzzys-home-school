import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classRouter } from '../routers/classRouter';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        order: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowser: mockSupabase,
}));

describe('ClassRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new class successfully', async () => {
      const mockSession = {
        session: {
          user: { id: 'user-123' },
        },
      };

      const mockClassData = {
        id: 'class-123',
        name: 'Test Class',
        teacher_id: 'user-123',
        created_at: new Date().toISOString(),
      };

      mockSupabase.auth.getSession.mockResolvedValue({ data: mockSession });
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockClassData,
        error: null,
      });

      const input = {
        name: 'Test Class',
        description: 'Test Description',
        subjectId: 'subject-123',
        gradeLevel: 5,
        maxStudents: 30,
      };

      const result = await classRouter.create.mutation({ input });

      expect(result).toEqual(mockClassData);
      expect(mockSupabase.from).toHaveBeenCalledWith('classes');
    });

    it('should throw error when user is not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: null });

      const input = {
        name: 'Test Class',
        description: 'Test Description',
        subjectId: 'subject-123',
        gradeLevel: 5,
        maxStudents: 30,
      };

      await expect(classRouter.create.mutation({ input })).rejects.toThrow(
        'UNAUTHORIZED',
      );
    });
  });

  describe('getByTeacher', () => {
    it('should fetch classes for a teacher', async () => {
      const mockSession = {
        session: {
          user: { id: 'user-123' },
        },
      };

      const mockClasses = [
        {
          id: 'class-1',
          name: 'Class 1',
          teacher_id: 'user-123',
          studentCount: 5,
        },
        {
          id: 'class-2',
          name: 'Class 2',
          teacher_id: 'user-123',
          studentCount: 3,
        },
      ];

      mockSupabase.auth.getSession.mockResolvedValue({ data: mockSession });
      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: mockClasses,
        error: null,
      });

      const result = await classRouter.getByTeacher.query({ input: {} });

      expect(result).toEqual(mockClasses);
      expect(mockSupabase.from).toHaveBeenCalledWith('classes');
    });
  });

  describe('delete', () => {
    it('should delete a class successfully', async () => {
      const mockSession = {
        session: {
          user: { id: 'user-123' },
        },
      };

      const mockClassData = {
        teacher_id: 'user-123',
      };

      mockSupabase.auth.getSession.mockResolvedValue({ data: mockSession });
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockClassData,
        error: null,
      });
      mockSupabase.from().delete().eq.mockResolvedValue({
        error: null,
      });

      const input = { classId: 'class-123' };

      const result = await classRouter.delete.mutation({ input });

      expect(result).toEqual({ success: true });
    });

    it('should throw error when user is not the teacher', async () => {
      const mockSession = {
        session: {
          user: { id: 'user-123' },
        },
      };

      const mockClassData = {
        teacher_id: 'different-user',
      };

      mockSupabase.auth.getSession.mockResolvedValue({ data: mockSession });
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockClassData,
        error: null,
      });

      const input = { classId: 'class-123' };

      await expect(classRouter.delete.mutation({ input })).rejects.toThrow(
        'FORBIDDEN',
      );
    });
  });
});
