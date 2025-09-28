import { trpc } from '@/lib/trpc/client';

export const useTRPC = () => {
  return {
    // User queries
    getUser: trpc.getUser.useQuery,
    updateUser: trpc.updateUser.useMutation,

    // Progress queries
    getProgress: trpc.getProgress.useQuery,
    updateProgress: trpc.updateProgress.useMutation,

    // Game queries
    getGames: trpc.getGames.useQuery,

    // AI Tutor
    askTutor: trpc.askTutor.useMutation,
  };
};
