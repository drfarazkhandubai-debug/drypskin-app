import { apiPost } from "./apiClient";

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
};

export type PaymentIntent = {
  clientSecret: string;
  paymentIntentId: string;
  live: boolean;
};

export type PaymentResult = {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  live: boolean;
};

const MOCK_CARDS: PaymentMethod[] = [
  { id: "pm_1", brand: "Visa", last4: "4242", expiry: "12/27" },
  { id: "pm_2", brand: "Mastercard", last4: "1234", expiry: "09/26" },
];

export const paymentService = {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_CARDS;
  },

  async createPaymentIntent(
    consultType: string,
    amount: number
  ): Promise<PaymentIntent> {
    try {
      return await apiPost<PaymentIntent>("/api/consultations/payment-intent", {
        consultType,
        amount,
      });
    } catch (err) {
      console.warn("[paymentService] API unavailable, using mock intent:", err);
      const mockId = `pi_mock_${Date.now()}`;
      return {
        clientSecret: `${mockId}_secret_mock`,
        paymentIntentId: mockId,
        live: false,
      };
    }
  },

  async processPayment(amount: number, methodId?: string): Promise<PaymentResult> {
    try {
      const intent = await paymentService.createPaymentIntent("payment", amount);
      await new Promise((r) => setTimeout(r, 900));
      return {
        success: true,
        transactionId: intent.paymentIntentId,
        amount,
        currency: "AED",
        live: intent.live,
      };
    } catch {
      await new Promise((r) => setTimeout(r, 1200));
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        amount,
        currency: "AED",
        live: false,
      };
    }
  },
};
