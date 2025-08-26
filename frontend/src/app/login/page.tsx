import { Suspense } from "react";
import LoginView from "./LoginView";

export const metadata = { title: "Sign In • FaithChat AI" };

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <LoginView />
    </Suspense>
  );
}
