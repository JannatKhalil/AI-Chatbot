import { useState } from "react";
import { loginUser, registerUser } from "../services/api";

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        await registerUser(
          name.trim(),
          email.trim(),
          password,
          confirmPassword
        );

        setIsSignup(false);
        setSuccess("Account created successfully! Please log in.");
        setPassword("");
        setConfirmPassword("");
      } else {
        const data = await loginUser(email.trim(), password);
        onLogin(data);
      }
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignup((previous) => !previous);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  const inputStyle =
    "w-full rounded-2xl border border-[#E6D5C8] bg-[#FFFCF7] px-4 py-3.5 text-sm text-[#54323D] placeholder:text-[#B5A0A0] outline-none transition focus:border-[#A87991] focus:ring-4 focus:ring-[#A87991]/15";

  const labelStyle =
    "mb-2 block text-sm font-semibold text-[#633D4A]";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3E5CF] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#DCC8EF]/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[#E8C6C9]/60 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-[#FFF9F0] shadow-[0_25px_80px_rgba(91,53,68,0.15)] md:grid-cols-2">

        {/* Left welcome panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#DCC8EF] p-10 md:flex lg:p-12">
          <div className="absolute -right-12 top-20 h-40 w-40 rounded-full border border-white/40" />
          <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full border border-white/40" />

          <div className="relative">
            <div className="mb-5 h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-[#FBF7F0] shadow-md">
              <img
                src="/jannat-logo.png"
                alt="Jannat AI profile"
                className="h-full w-full rounded-full object-cover"
              />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#79566F]">
              YOUR PERSONAL AI SPACE
            </p>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-[#563647] lg:text-5xl">
              A little space
              <br />
              for big ideas.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-[#72556D]">
              Think freely, ask anything, and let your ideas bloom with your
              intelligent AI companion.
            </p>
          </div>

          <span className="absolute right-10 top-8 text-3xl text-white/80">
            ✦
          </span>
          <span className="absolute bottom-40 right-12 text-2xl text-white/80">
            ✧
          </span>
        </div>

        {/* Login / Signup panel */}
        <div className="px-6 py-9 sm:px-10 sm:py-12 lg:px-12">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#E8D7C9] bg-[#F3E5CF] shadow-sm">
              <img
                src="/jannat-logo.png"
                alt="Jannat AI logo"
                className="h-full w-full rounded-full object-cover"
              />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A87991]">
              WELCOME TO
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#633D4A]">
              Jannat AI
            </h2>

            <p className="mt-2 text-sm text-[#927A7B]">
              Your Intelligent AI Companion
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-2xl font-bold text-[#633D4A]">
              {isSignup ? "Create your account" : "Welcome back"}
              <span className="ml-2 text-xl">
                {isSignup ? "🌷" : "💜"}
              </span>
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#927A7B]">
              {isSignup
                ? "Create your space and start a new conversation."
                : "Your little corner of ideas is waiting for you."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  maxLength={50}
                  autoComplete="name"
                  className={inputStyle}
                />
              </div>
            )}

            <div>
              <label className={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={isSignup ? 8 : undefined}
                autoComplete={
                  isSignup ? "new-password" : "current-password"
                }
                className={inputStyle}
              />
            </div>

            {isSignup && (
              <div>
                <label className={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your password again"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputStyle}
                />
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="rounded-2xl border border-green-100 bg-green-50 p-3 text-sm text-green-700"
              >
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#704555] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#704555]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#5B3545] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? isSignup
                  ? "Creating account..."
                  : "Logging in..."
                : isSignup
                  ? "Create Account →"
                  : "Login to Your Space →"}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E9DCD1]" />
            <span className="text-xs text-[#B19A98]">A FRESH START</span>
            <div className="h-px flex-1 bg-[#E9DCD1]" />
          </div>

          <div className="text-center">
            <p className="text-sm text-[#927A7B]">
              {isSignup
                ? "Already have an account?"
                : "New to Jannat AI?"}
            </p>

            <button
              type="button"
              onClick={switchMode}
              disabled={loading}
              className="mt-2 font-bold text-[#8A5B79] transition hover:text-[#633D4A] hover:underline disabled:opacity-50"
            >
              {isSignup ? "Login instead" : "Create your account ✨"}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-[#B19A98]">
            Made for curiosity, creativity & little discoveries 🦋
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
