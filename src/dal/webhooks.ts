import { upsertUserDb } from "@/db/webhooks-queries";
import { type UserWebhookInput, UserWebhookSchema } from "@/zod/schemas";

export async function handleUserCreatedOrUpdatedDal(
  input: UserWebhookInput,
  type: string,
) {
  const parsedData = UserWebhookSchema.safeParse(input);

  if (!parsedData.success) {
    console.error(`Validation failed for ${type}:`, parsedData.error);
    return new Response("Input validation error", { status: 422 });
  }

  return upsertUserDb(
    parsedData.data.userId,
    parsedData.data.fullName,
    parsedData.data.email,
    parsedData.data.avatar,
  )
    .then(
      () =>
        new Response(`User parsed and sync'd via ${type}`, {
          status: 200,
        }),
    )
    .catch((error) => {
      console.error(`Critical error handling ${type} in database:`, error);
      return new Response("Internal Server Error", { status: 500 });
    });
}
