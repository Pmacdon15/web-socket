import { Suspense } from "react";
import { getFriends, getMessages, getRooms, serializeResult } from "@/dal/chat";
import DashboardClient, { DashboardLoading } from "./DashboardClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const activeRoomId = (resolvedSearchParams.room as string) || "global-lounge";

  const roomsPromise = Promise.resolve(getRooms()).then(serializeResult);
  const friendsPromise = Promise.resolve(getFriends()).then(serializeResult);
  const messagesPromise = Promise.resolve(getMessages(activeRoomId)).then(
    serializeResult,
  );

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient
        roomsPromise={roomsPromise}
        friendsPromise={friendsPromise}
        messagesPromise={messagesPromise}
      />
    </Suspense>
  );
}
