import { verifyWebhook, type WebhookEvent } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { handleUserCreatedOrUpdatedDal } from "@/dal/webhooks";

export async function POST(req: NextRequest) {
  const evt = (await verifyWebhook(req).catch(err => {
    console.error("Webhook Verification Error:", err);
    return null;
  })) as WebhookEvent | null;

  if (!evt) return new Response("Verification Error", { status: 401 });

  console.log("Web Hook:", evt.type, " ", evt.data);

  switch (evt.type) {
    case "user.created":
    case "user.updated": {
      return handleUserCreatedOrUpdatedDal(
        {
          userId: evt.data.id,
          fullName:
            `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim() ||
            evt.data.username ||
            evt.data.email_addresses[0]?.email_address,
          email: evt.data.email_addresses[0]?.email_address || "",
          avatar: evt.data.image_url,
        },
        evt.type,
      );
    }

    default:
      console.log(`Unhandled event type: ${evt.type}`);
      return new Response("Webhook received but unhandled", { status: 202 });
  }
}
