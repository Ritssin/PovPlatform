import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthError } from "next-auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session) redirect(searchParams.callbackUrl ?? "/dashboard");

  const callbackUrl = searchParams.callbackUrl ?? "/dashboard";
  const hasError = !!searchParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Sophos Proof of Value</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to manage your PoVs</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          {hasError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Invalid email or password. Please try again.
            </div>
          )}
          <form
            action={async (formData: FormData) => {
              "use server";
              try {
                await signIn("credentials", {
                  email:      formData.get("email"),
                  password:   formData.get("password"),
                  redirectTo: callbackUrl,
                });
              } catch (err) {
                // AuthError = bad credentials — redirect back with error flag
                // Anything else (including NEXT_REDIRECT on success) must be re-thrown
                if (err instanceof AuthError) {
                  redirect(
                    `/login?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`
                  );
                }
                throw err;
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@sophos.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0049BD] hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
              >
                Sign in
              </button>
            </div>
          </form>
          <p className="text-xs text-slate-400 text-center mt-4">
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
