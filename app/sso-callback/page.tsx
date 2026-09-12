import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-foreground p-4">
      <div className="flex flex-col items-center gap-4">
        <AuthenticateWithRedirectCallback
          signInForceRedirectUrl="/"
          signUpForceRedirectUrl="/"
        />
      </div>
    </div>
  );
}
