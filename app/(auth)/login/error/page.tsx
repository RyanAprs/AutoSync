import Link from "next/link";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  Default: "Something went wrong. Please try again.",
};

export default async function LoginErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const message = error ? errorMessages[error] ?? errorMessages.Default : errorMessages.Default;

  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-8 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign-in error</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
      <Link
        href="/login"
        className="block w-full rounded-md bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Try again
      </Link>
    </div>
  );
}
