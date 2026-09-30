import { ENV } from "../../config/env.js";
import { logNotification } from "./notificationLogger.js";

export interface SendWhatsAppOptions {
  to: string;
  message: string;
  orderId?: string | null;
  eventType?: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mode?: "LIVE_WHATSAPP" | "DEV_SIMULATION";
}

export async function sendWhatsAppMessage(options: SendWhatsAppOptions): Promise<SendWhatsAppResult> {
  const { to, message, orderId = null, eventType = "GENERIC" } = options;

  if (!to) {
    console.warn("⚠️ sendWhatsAppMessage called without recipient phone number");
    return { success: false, error: "No recipient phone specified" };
  }

  // Normalize phone number (strip spaces, symbols, ensure 91 country code prefix if 10 digits)
  const cleanPhone = to.replace(/\D/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // 1. Live Meta WhatsApp Cloud API Dispatch
  if (ENV.WHATSAPP_ACCESS_TOKEN && ENV.WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const url = `https://graph.facebook.com/v18.0/${ENV.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ENV.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedPhone,
          type: "text",
          text: { preview_url: false, body: message }
        })
      });

      const data = await response.json() as any;
      if (!response.ok) {
        throw new Error(data.error?.message || `WhatsApp API error ${response.status}`);
      }

      const messageId = data.messages?.[0]?.id;

      await logNotification({
        orderId,
        recipient: formattedPhone,
        channel: "WHATSAPP",
        eventType,
        status: "SENT",
        metadata: data
      });

      return { success: true, messageId, mode: "LIVE_WHATSAPP" };
    } catch (err: any) {
      console.error(`❌ WhatsApp delivery failed to ${formattedPhone}:`, err.message);
      await logNotification({
        orderId,
        recipient: formattedPhone,
        channel: "WHATSAPP",
        eventType,
        status: "FAILED",
        error: err.message
      });
      return { success: false, error: err.message };
    }
  }

  // 2. Production with missing credentials -> Log FAILED
  if (ENV.NODE_ENV === "production") {
    const errorMsg = "Meta WhatsApp Cloud API credentials not configured in production environment.";
    console.error(`❌ [Production] Cannot send WhatsApp to ${formattedPhone}: ${errorMsg}`);
    await logNotification({
      orderId,
      recipient: formattedPhone,
      channel: "WHATSAPP",
      eventType,
      status: "FAILED",
      error: errorMsg
    });
    return { success: false, error: errorMsg };
  }

  // 3. Development Mode Simulation -> Log SIMULATED
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    channel: "WHATSAPP",
    status: "SIMULATED",
    to: formattedPhone,
    eventType,
    preview: message.substring(0, 100) + "..."
  }));

  await logNotification({
    orderId,
    recipient: formattedPhone,
    channel: "WHATSAPP",
    eventType,
    status: "SIMULATED",
    metadata: { note: "Local dev simulation. Provide WHATSAPP credentials in .env to activate live dispatch." }
  });

  return { success: true, mode: "DEV_SIMULATION" };
}
