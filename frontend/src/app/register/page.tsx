import { Suspense } from "react";
import RegisterView from "./RegisterView";

export const metadata = { title: "Create Account • FaithChat AI" };

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <RegisterView />
    </Suspense>
  );
}
