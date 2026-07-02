export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  healthScore?: number;
  energyScore?: number;
  burnoutIndex?: number;
  lastScanDate?: string;
  scanSummary?: string;
};

export const userService = {
  async getUserProfile(userId?: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 300));
    return {
      id: userId ?? "u_mock",
      name: "Guest Patient",
      email: "patient@drypskin.com",
      healthScore: 67,
      energyScore: 58,
      burnoutIndex: 44,
      lastScanDate: new Date().toISOString(),
      scanSummary: "Moderate fatigue levels with good hydration. Recommend stress recovery protocol.",
    };
  },

  async updateProfile(data: Partial<UserProfile>): Promise<void> {
    await new Promise((r) => setTimeout(r, 400));
  },
};
