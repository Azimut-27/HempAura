export class PaymentProvider {
  async createCheckoutSession(_orderDraft) {
    throw new Error("createCheckoutSession must be implemented.");
  }

  async verifyWebhook(_request) {
    throw new Error("verifyWebhook must be implemented.");
  }

  async retrievePayment(_reference) {
    throw new Error("retrievePayment must be implemented.");
  }

  normalizePaymentEvent(_event) {
    throw new Error("normalizePaymentEvent must be implemented.");
  }
}
