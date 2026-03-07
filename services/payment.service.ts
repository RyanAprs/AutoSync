// Payment create, verify, mark completed — to be implemented
export const paymentService = {
  list: async () => [],
  create: async (data: { designerId: string; period: string; totalPoints: number; amount: number }) => null,
  verify: async (paymentId: string) => null,
  markCompleted: async (paymentId: string) => null,
};
