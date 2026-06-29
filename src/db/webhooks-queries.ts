import { getSql } from "./queries";

export async function upsertUserDb(
  userId: string,
  fullName: string,
  email: string,
  avatar: string,
) {
  const sql = getSql();
  const result = await sql`
    INSERT INTO users (id, name, email, avatar)
    VALUES (${userId}, ${fullName}, ${email}, ${avatar})
    ON CONFLICT (id) DO UPDATE SET 
      name = EXCLUDED.name,
      email = EXCLUDED.email     
    RETURNING *
  `;
  return result[0];
}
