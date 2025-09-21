// Shared trial users storage
// In production, this would be replaced with a proper database

import { TrialUser } from '@/types';

// In-memory storage for demo purposes
// In production, use a proper database like PostgreSQL, MongoDB, etc.
export const trialUsers: TrialUser[] = [];

// Helper functions for trial user management
export const findTrialUserByEmail = (email: string): TrialUser | undefined => {
  return trialUsers.find(user => 
    user.email.toLowerCase() === email.toLowerCase() && 
    user.isActive &&
    user.trialExpiresAt > new Date()
  );
};

export const addTrialUser = (user: TrialUser): void => {
  trialUsers.push(user);
};

export const deactivateExpiredTrials = (): void => {
  const now = new Date();
  trialUsers.forEach(user => {
    if (user.trialExpiresAt < now) {
      user.isActive = false;
    }
  });
};

export const getActiveTrialUsers = (): TrialUser[] => {
  deactivateExpiredTrials();
  return trialUsers.filter(user => user.isActive);
};

export const getTrialStats = () => {
  deactivateExpiredTrials();
  return {
    total: trialUsers.length,
    active: trialUsers.filter(user => user.isActive).length,
    expired: trialUsers.filter(user => !user.isActive).length,
  };
};
