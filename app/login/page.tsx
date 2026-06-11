import Login1 from "@/components/ui/login-1";

export default function LoginPage() {
  return (
    <div className="flex w-full min-h-screen justify-center items-center bg-gradient-to-br from-[#0a0c10] via-[#0f1320] to-[#141828]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>
      <Login1 />
    </div>
  );
}
