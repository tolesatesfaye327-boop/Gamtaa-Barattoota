import apiClient from "../services/api";
import {
  getPaymentAccount,
  toBackendPaymentMethod,
  PaymentMethodId,
} from "../data/paymentAccounts";
import type { PaymentFormValues } from "../components/PaymentForm";

export interface SubmitTicketPaymentOptions {
  values: PaymentFormValues;
  amount: number;
  currency?: string;
  purpose: string;
  description: string;
  relatedType: "event_ticket" | "ticket_product";
  relatedEvent?: string;
  relatedTicketProduct?: string;
  quantity?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Submit payment proof (screenshot + details) as multipart FormData.
 * Creates a PENDING payment — ticket is issued only after auditor approval.
 */
export async function submitTicketPayment(options: SubmitTicketPaymentOptions) {
  const {
    values,
    amount,
    currency = "ETB",
    purpose,
    description,
    relatedType,
    relatedEvent,
    relatedTicketProduct,
    quantity = 1,
    metadata = {},
  } = options;

  const account = getPaymentAccount(values.paymentMethod as PaymentMethodId);
  const backendMethod = toBackendPaymentMethod(
    values.paymentMethod as PaymentMethodId,
  );

  const formData = new FormData();
  formData.append("amount", String(amount));
  formData.append("currency", currency);
  formData.append("paymentType", "event_fee");
  formData.append("paymentMethod", backendMethod);
  formData.append("paymentChannel", values.paymentMethod);
  formData.append("associationAccount", account?.accountNumber || "");
  formData.append("payerName", values.payerName);
  if (values.phoneNumber) formData.append("phoneNumber", values.phoneNumber);
  formData.append("transactionId", values.transactionReference);
  formData.append("purpose", purpose);
  formData.append("description", description);
  formData.append(
    "notes",
    [
      `Channel: ${account?.label || values.paymentMethod}`,
      `Association account: ${account?.accountNumber || "N/A"}`,
      `Payer name: ${values.payerName}`,
      values.phoneNumber ? `Payer phone: ${values.phoneNumber}` : null,
      values.notes ? `User notes: ${values.notes}` : null,
    ]
      .filter(Boolean)
      .join(" | "),
  );
  formData.append("relatedType", relatedType);
  if (relatedEvent) formData.append("relatedEvent", relatedEvent);
  if (relatedTicketProduct)
    formData.append("relatedTicketProduct", relatedTicketProduct);
  formData.append("quantity", String(quantity));
  formData.append(
    "metadata",
    JSON.stringify({
      ...metadata,
      paymentChannel: values.paymentMethod,
      associationAccount: account?.accountNumber,
    }),
  );
  formData.append("receipt", values.receiptFile);

  const response = await apiClient.post("/payments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}
