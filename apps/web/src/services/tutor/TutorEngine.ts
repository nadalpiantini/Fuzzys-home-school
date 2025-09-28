// TutorEngine - Core tutoring logic
export interface TutorSession {
  id: string;
  studentId: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  startTime: Date;
  endTime?: Date;
  messages: TutorMessage[];
  progress: number;
}

export interface TutorMessage {
  id: string;
  role: 'student' | 'tutor' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: number;
  subjects: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  strengths: string[];
  weaknesses: string[];
  goals: string[];
}

export class TutorEngine {
  private sessions: Map<string, TutorSession> = new Map();
  private studentProfiles: Map<string, StudentProfile> = new Map();

  async startSession(studentId: string, subject: string): Promise<TutorSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: TutorSession = {
      id: sessionId,
      studentId,
      subject,
      level: 'beginner', // Default level
      startTime: new Date(),
      messages: [],
      progress: 0
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  async sendMessage(sessionId: string, content: string, role: 'student' | 'tutor' = 'student'): Promise<TutorMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const message: TutorMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date()
    };

    session.messages.push(message);
    return message;
  }

  async getSession(sessionId: string): Promise<TutorSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.endTime = new Date();
    }
  }

  async getStudentProfile(studentId: string): Promise<StudentProfile | undefined> {
    return this.studentProfiles.get(studentId);
  }

  async updateStudentProfile(studentId: string, profile: Partial<StudentProfile>): Promise<void> {
    const existing = this.studentProfiles.get(studentId);
    if (existing) {
      this.studentProfiles.set(studentId, { ...existing, ...profile });
    } else {
      this.studentProfiles.set(studentId, profile as StudentProfile);
    }
  }
}

export const tutorEngine = new TutorEngine();
