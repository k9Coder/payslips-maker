import { SignIn } from '@clerk/clerk-react';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '';

export function SignInPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <SignIn routing="path" path={`${basename}/sign-in`} signUpUrl={`${basename}/sign-up`} />
    </div>
  );
}
