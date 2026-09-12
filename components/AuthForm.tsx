"use client";

import React, { useState, useEffect } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Mail,
  User,
  AtSign,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { FaGoogle, FaGithub, FaApple, FaMicrosoft, FaDiscord } from "react-icons/fa";

interface AuthFormProps {
  defaultMode?: "sign-in" | "sign-up";
  onSuccess?: () => void;
  onModeSwitch?: (mode: "sign-in" | "sign-up") => void;
}

interface SocialProviderInfo {
  strategy: any;
  name: string;
  icon: React.ReactNode;
}

const KNOWN_SOCIAL_PROVIDERS: Record<string, { name: string; icon: React.ReactNode }> = {
  oauth_google: {
    name: "Google",
    icon: <FaGoogle className="w-4 h-4 text-white" />,
  },
  oauth_github: {
    name: "GitHub",
    icon: <FaGithub className="w-4 h-4 text-white" />,
  },
  oauth_microsoft: {
    name: "Microsoft",
    icon: <FaMicrosoft className="w-4 h-4 text-white" />,
  },
  oauth_apple: {
    name: "Apple",
    icon: <FaApple className="w-4 h-4 text-white" />,
  },
  oauth_discord: {
    name: "Discord",
    icon: <FaDiscord className="w-4 h-4 text-white" />,
  },
};

export default function AuthForm({
  defaultMode = "sign-in",
  onSuccess,
  onModeSwitch,
}: AuthFormProps) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">(defaultMode);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingSignInVerification, setPendingSignInVerification] = useState(false);
  const [signInFactor, setSignInFactor] = useState<any>(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const clerk = useClerk();

  // Detect enabled OAuth providers dynamically from Clerk environment
  const [socialProviders, setSocialProviders] = useState<SocialProviderInfo[]>([
    {
      strategy: "oauth_google",
      name: "Google",
      icon: <FaGoogle className="w-4 h-4 text-white" />,
    },
  ]);

  useEffect(() => {
    try {
      const clientEnv = (clerk as any)?.client?.environment;
      const userSettings = clientEnv?.userSettings;
      if (userSettings?.social) {
        const activeStrategies = Object.keys(userSettings.social).filter(
          (key) => userSettings.social[key]?.enabled
        );

        if (activeStrategies.length > 0) {
          const mapped: SocialProviderInfo[] = activeStrategies.map((strat) => {
            const info = KNOWN_SOCIAL_PROVIDERS[strat] || {
              name: strat.replace("oauth_", "").toUpperCase(),
              icon: <div className="w-4 h-4 rounded-full bg-white/20" />,
            };
            return {
              strategy: strat,
              name: info.name,
              icon: info.icon,
            };
          });
          setSocialProviders(mapped);
        }
      }
    } catch {
      // Keep default Google strategy fallback
    }
  }, [clerk]);

  const switchMode = (newMode: "sign-in" | "sign-up") => {
    setMode(newMode);
    setError("");
    setPendingVerification(false);
    setPendingSignInVerification(false);
    onModeSwitch?.(newMode);
  };

  const handleOAuth = async (strategy: any) => {
    setError("");
    setOauthLoading(strategy);
    try {
      if (mode === "sign-in" && signIn) {
        await (signIn as any).authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        });
      } else if (signUp) {
        await (signUp as any).authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        });
      } else if (clerk) {
        await (clerk as any).authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        });
      }
    } catch (err: any) {
      console.error("OAuth authentication error:", err);
      setError(err?.errors?.[0]?.message || "OAuth authentication failed. Please try again.");
      setOauthLoading(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded || !signIn) return;

    const loginId = identifier.trim() || email.trim();
    if (!loginId) {
      setError("Please fill in email or username.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload: any = { identifier: loginId };
      if (password) {
        payload.password = password;
      }

      const result = await (signIn as any).create(payload);

      if (result.status === "complete") {
        if (setActiveSignIn) {
          await setActiveSignIn({ session: result.createdSessionId });
        }
        onSuccess?.();
      } else if (
        result.status === "needs_first_factor" ||
        result.status === "needs_second_factor" ||
        result.status === "needs_client_trust" ||
        (Array.isArray(result.supportedFirstFactors) && result.supportedFirstFactors.length > 0)
      ) {
        const factors = result.supportedFirstFactors || [];
        const emailFactor = factors.find((f: any) => f.strategy === "email_code");
        const phoneFactor = factors.find((f: any) => f.strategy === "phone_code");

        if (emailFactor) {
          try {
            await (signIn as any).prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: emailFactor.emailAddressId,
            });
          } catch (prepErr) {
            console.warn("prepareFirstFactor warning/info:", prepErr);
          }
          setSignInFactor({ strategy: "email_code", emailAddressId: emailFactor.emailAddressId });
          setPendingSignInVerification(true);
        } else if (phoneFactor) {
          try {
            await (signIn as any).prepareFirstFactor({
              strategy: "phone_code",
              phoneNumberId: phoneFactor.phoneNumberId,
            });
          } catch (prepErr) {
            console.warn("prepareFirstFactor warning/info:", prepErr);
          }
          setSignInFactor({ strategy: "phone_code", phoneNumberId: phoneFactor.phoneNumberId });
          setPendingSignInVerification(true);
        } else if (factors.length > 0 && factors[0].strategy) {
          try {
            await (signIn as any).prepareFirstFactor(factors[0]);
          } catch (prepErr) {
            console.warn("prepareFirstFactor warning/info:", prepErr);
          }
          setSignInFactor(factors[0]);
          setPendingSignInVerification(true);
        } else {
          try {
            await (signIn as any).prepareFirstFactor({ strategy: "email_code" });
          } catch (prepErr) {
            console.warn("prepareFirstFactor warning/info:", prepErr);
          }
          setSignInFactor({ strategy: "email_code" });
          setPendingSignInVerification(true);
        }
      } else {
        setError(`Sign in incomplete (${result.status}). Please check your credentials.`);
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err?.errors?.[0]?.message || "Invalid email/username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded || !signUp) return;

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter a valid email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await (signUp as any).create({
        username: username.trim(),
        emailAddress: email.trim(),
        password,
      });

      if (res.status === "complete") {
        if (setActiveSignUp) {
          await setActiveSignUp({ session: res.createdSessionId });
        }
        onSuccess?.();
      } else {
        try {
          await (signUp as any).prepareEmailAddressVerification({
            strategy: "email_code",
          });
          setPendingVerification(true);
        } catch (prepErr: any) {
          console.error("Prepare verification error:", prepErr);
          if (res.createdSessionId && setActiveSignUp) {
            await setActiveSignUp({ session: res.createdSessionId });
            onSuccess?.();
          } else {
            setError(prepErr?.errors?.[0]?.message || "Failed to send verification email.");
          }
        }
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err?.errors?.[0]?.message || "Failed to create account. Please check details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (pendingSignInVerification && signInFactor) {
        await (signIn as any).prepareFirstFactor({
          strategy: signInFactor.strategy || "email_code",
          emailAddressId: signInFactor.emailAddressId,
        });
        setError("A new verification code has been sent to your email.");
      } else if (signUp) {
        await (signUp as any).prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setError("A new verification code has been sent to your email.");
      }
    } catch (err: any) {
      console.error("Resend code error:", err);
      const msg = err?.errors?.[0]?.message || "Failed to resend code.";
      if (
        msg.toLowerCase().includes("security validation") ||
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("invalidated")
      ) {
        setPendingVerification(false);
        setPendingSignInVerification(false);
        setError("Verification session expired. Please try signing in or registering again.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (pendingSignInVerification) {
        const completeSignIn = await (signIn as any).attemptFirstFactor({
          strategy: signInFactor?.strategy || "email_code",
          code: code.trim(),
        });

        if (completeSignIn.status === "complete") {
          if (setActiveSignIn) {
            await setActiveSignIn({ session: completeSignIn.createdSessionId });
          }
          onSuccess?.();
        } else {
          setError("Sign in verification incomplete. Please check code.");
        }
        return;
      }

      if (signUp) {
        const completeSignUp = await (signUp as any).attemptEmailAddressVerification({
          code: code.trim(),
        });

        if (completeSignUp.status === "complete") {
          if (setActiveSignUp) {
            await setActiveSignUp({ session: completeSignUp.createdSessionId });
          }
          onSuccess?.();
        } else {
          setError("Sign up verification incomplete. Please check code.");
        }
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const msg = err?.errors?.[0]?.message || "Invalid or expired verification code.";
      if (
        msg.toLowerCase().includes("security validation") ||
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("invalidated")
      ) {
        setPendingVerification(false);
        setPendingSignInVerification(false);
        setError("Verification session expired. Please try signing in or registering again.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification View
  if (pendingVerification || pendingSignInVerification) {
    return (
      <div className="space-y-4 w-full text-left">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-foreground">Enter Verification Code</h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-1.5">
            <Input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-secondary/40 border-border text-foreground rounded-xl h-11 text-center text-lg tracking-widest font-mono focus:border-foreground"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold rounded-xl h-11 text-sm shadow-md"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </Button>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setPendingVerification(false);
                setPendingSignInVerification(false);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground font-medium underline transition-colors"
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full text-left">
      {/* Mode Switcher Tabs */}
      <div className="flex bg-secondary/50 p-1 rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => switchMode("sign-in")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mode === "sign-in"
              ? "bg-card text-foreground shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode("sign-up")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mode === "sign-up"
              ? "bg-card text-foreground shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Dynamic OAuth Social Buttons */}
      <div className="space-y-2">
        {socialProviders.map((provider) => (
          <Button
            key={provider.strategy}
            type="button"
            variant="outline"
            disabled={oauthLoading !== null}
            onClick={() => handleOAuth(provider.strategy)}
            className="w-full bg-card hover:bg-secondary border-border text-foreground font-semibold rounded-xl h-11 text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm transition-all"
          >
            {oauthLoading === provider.strategy ? (
              <Loader2 className="w-4 h-4 animate-spin text-foreground" />
            ) : (
              provider.icon
            )}
            <span>Continue with {provider.name}</span>
          </Button>
        ))}
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-border w-full" />
        <span className="bg-card px-3 text-[10px] uppercase font-semibold text-muted-foreground tracking-widest absolute">
          Or with Email
        </span>
      </div>

      {/* Email / Username & Password Form */}
      <form onSubmit={mode === "sign-in" ? handleSignIn : handleSignUp} className="space-y-3.5">
        {mode === "sign-in" ? (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address or Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="alex_dev or alex@example.com"
                value={identifier || email}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setEmail(e.target.value);
                }}
                className="bg-secondary/30 border-border text-foreground pl-10 rounded-xl h-11 text-xs focus:border-foreground"
                required
              />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="alex_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-secondary/30 border-border text-foreground pl-10 rounded-xl h-11 text-xs focus:border-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/30 border-border text-foreground pl-10 rounded-xl h-11 text-xs focus:border-foreground"
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/30 border-border text-foreground pl-10 pr-10 rounded-xl h-11 text-xs focus:border-foreground"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || oauthLoading !== null}
          className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold rounded-xl h-11 text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </span>
          ) : mode === "sign-in" ? (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
