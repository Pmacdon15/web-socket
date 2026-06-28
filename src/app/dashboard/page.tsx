import { Suspense } from "react";
import { getFriends, getMessages, getRooms, serializeResult } from "@/dal/chat";
import DashboardClient from "../../components/DashboardClient";
import { DashboardLoading } from "../../components/DashboardLoading";

function parseParams(p: string[] | string | undefined) {
  return Array.isArray(p) ? p[0] : (p ?? "");
}
export default function DashboardPage(props: PageProps<"/dashboard">) {
  const roomsPromise = Promise.resolve(getRooms()).then(serializeResult);
  const friendsPromise = Promise.resolve(getFriends()).then(serializeResult);
  const messagesPromise = props.searchParams
    .then((p) => getMessages(parseParams(p.room)))
    .then(serializeResult);

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
