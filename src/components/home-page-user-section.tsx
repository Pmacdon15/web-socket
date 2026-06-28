import { UserButton } from "@clerk/nextjs";
import HomeQRCode from "./HomeQRCode";

export default async function HomePageUserSection({
  userPromise,
}: {
  userPromise: Promise<any>;
}) {
  const user = await userPromise;
  return (
    user && (
      <>
        <div className="flex flex-col items-center gap-2 mt-1">
          <div className="flex items-center gap-2.5">
            <UserButton />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">
                {user.fullName || user.username || "Signed In"}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-40">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>

        <HomeQRCode
          userId={user.id}
          userName={user.fullName || user.username || "User"}
        />
      </>
    )
  );
}
