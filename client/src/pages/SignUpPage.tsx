import { SignUp } from '@clerk/clerk-react';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '';

export function SignUpPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <SignUp routing="path" path={`${basename}/sign-up`} signInUrl={`${basename}/sign-in`} />
    </div>
  );
}
