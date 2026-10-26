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
    "w-full px-4 py-3 rounded-xl border border-purple-200 bg-white outline-none focus:ring-2 focus:ring-purple-400 transition-all";

  const labelStyle =
    "block text-sm font-semibold text-purple-900 mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-violet-100 to-purple-200 p-5">
      <div className="w-full max-w-md bg-[#FFF9F2] rounded-3xl shadow-2xl p-9 border border-purple-200">

        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-4xl">✦</span>
          </div>

          <h1 className="text-3xl font-extrabold text-purple-950">
            Jannat Chatbot
          </h1>

          <p className="text-purple-500 mt-2 text-sm">
            Your Intelligent AI Companion
          </p>

          <h2 className="text-xl font-bold text-purple-900 mt-6">
            {isSignup ? "Create Your Account ✨" : "Welcome Back 💜"}
          </h2>

          <p className="text-sm text-purple-500 mt-2">
            {isSignup
              ? "Join Jannat AI and start chatting"
              : "Log in to continue your conversations"}
          </p>
        </div>

        {/* LOGIN / SIGNUP FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME - SIGNUP ONLY */}
          {isSignup && (
            <div>
              <label className={labelStyle}>
                Full Name
              </label>

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

          {/* EMAIL */}
          <div>
            <label className={labelStyle}>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              className={inputStyle}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className={labelStyle}>
              Password
            </label>

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

          {/* CONFIRM PASSWORD - SIGNUP ONLY */}
          {isSignup && (
            <div>
              <label className={labelStyle}>
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputStyle}
              />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <p
              role="alert"
              className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl"
            >
              {error}
            </p>
          )}

          {/* SUCCESS */}
          {success && (
            <p
              role="status"
              className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-xl"
            >
              {success}
            </p>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading
              ? isSignup
                ? "Creating Account..."
                : "Logging in..."
              : isSignup
                ? "Create Account →"
                : "Login →"}
          </button>
        </form>

        {/* SWITCH BETWEEN LOGIN AND SIGNUP */}
        <div className="text-center mt-6">
          <p className="text-sm text-purple-700">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}
          </p>

          <button
            type="button"
            onClick={switchMode}
            disabled={loading}
            className="mt-2 text-purple-700 font-bold hover:text-violet-900 hover:underline transition-all disabled:opacity-50"
          >
            {isSignup ? "Login Here" : "Create an Account ✨"}
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-purple-400 mt-7">
          ✦ Welcome to your intelligent conversation space
        </p>

      </div>
    </div>
  );
}

export default Login;