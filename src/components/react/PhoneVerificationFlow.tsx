/**
 * PhoneVerificationFlow.tsx
 * 
 * Clerk phone-only sign-up/verification UI with SMS OTP.
 * Features:
 * - Phone number input with country code selection
 * - SMS OTP verification with code input
 * - Resend cooldown timer (60 seconds)
 * - On success, calls users.upsertFromClerk to sync phone + verification timestamp
 * - Neomorphic design matching the theme
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSignUp, useSignIn } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Common country codes for quick selection
const COMMON_COUNTRY_CODES = [
  { code: "US", dial: "+1", flag: "🇺🇸" },
  { code: "CA", dial: "+1", flag: "🇨🇦" },
  { code: "GB", dial: "+44", flag: "🇬🇧" },
  { code: "AU", dial: "+61", flag: "🇦🇺" },
];

type VerificationStep = "phone" | "otp" | "success";

interface PhoneVerificationFlowProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function PhoneVerificationFlow({ onComplete, onCancel }: PhoneVerificationFlowProps) {
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const upsertFromClerk = useMutation(api.users.upsertFromClerk);

  const [step, setStep] = useState<VerificationStep>("phone");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [verifyingAttemptId, setVerifyingAttemptId] = useState<string | null>(null);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Format cooldown time as MM:SS
  const formatCooldown = useCallback(() => {
    const minutes = Math.floor(cooldownSeconds / 60);
    const seconds = cooldownSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [cooldownSeconds]);

  // Handle phone number submission
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!signUpLoaded || !signUp) {
      setError("Authentication not ready. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const digitsOnly = phoneNumber.replace(/[^0-9]/g, "");
      const fullPhoneNumber = `${countryCode}${digitsOnly}`;
      
      // Attempt to create a sign-up
      await signUp.create({
        phoneNumber: fullPhoneNumber,
      });

      // Prepare phone verification
      await signUp.preparePhoneNumberVerification();
      
      setCooldownSeconds(60);
      setStep("otp");
    } catch (err: any) {
      // Check if user already exists, try sign in instead
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        try {
          if (!signInLoaded || !signIn) {
            setError("Unable to sign in. Please try again.");
            setIsLoading(false);
            return;
          }

          const digitsOnly = phoneNumber.replace(/[^0-9]/g, "");
          const fullPhoneNumber = `${countryCode}${digitsOnly}`;
          const result = await signIn.create({
            identifier: fullPhoneNumber,
          });

          const firstFactor = result.supportedFirstFactors?.find(
            (factor: any) => factor.strategy === "phone_code"
          );

          if (firstFactor) {
            await signIn.prepareFirstFactor({
              strategy: "phone_code",
            });
            setVerifyingAttemptId(result.id);
            setCooldownSeconds(60);
            setStep("otp");
            setIsLoading(false);
            return;
          }
        } catch (signInErr: any) {
          setError(signInErr.errors?.[0]?.message || "Failed to send verification code.");
          setIsLoading(false);
          return;
        }
      }

      setError(err.errors?.[0]?.message || "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (verifyingAttemptId && signInLoaded && signIn) {
        const result = await signIn.attemptFirstFactor({
          strategy: "phone_code",
          code: otpCode,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          await syncUserToConvex(result.userData);
          setStep("success");
          onComplete?.();
        }
      } else if (signUpLoaded && signUp) {
        const result = await signUp.attemptPhoneNumberVerification({
          code: otpCode,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          await syncUserToConvex(result.userData);
          setStep("success");
          onComplete?.();
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync user data to Convex after successful verification
  const syncUserToConvex = async (userData: any) => {
    try {
      const phone = userData?.phoneNumbers?.[0]?.phoneNumber || `${countryCode}${phoneNumber}`;
      await upsertFromClerk({
        clerkId: userData.id,
        phone: phone,
        phoneVerifiedAt: Date.now(),
      });
    } catch (err) {
      console.error("Failed to sync user to Convex:", err);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (cooldownSeconds > 0) return;
    
    setError(null);
    setIsLoading(true);

    try {
      if (verifyingAttemptId && signIn) {
        await signIn.prepareFirstFactor({
          strategy: "phone_code",
        });
      } else if (signUp) {
        await signUp.preparePhoneNumberVerification();
      }
      
      setCooldownSeconds(60);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone number for display
  const formatPhoneDisplay = () => {
    const cleaned = phoneNumber.replace(/[^0-9]/g, "");
    if (countryCode === "+1" && cleaned.length === 10) {
      return `${countryCode} (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return `${countryCode} ${phoneNumber}`;
  };

  return (
    <div className="neo-card w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 neo-extrude-lg rounded-full mb-4">
          <span className="text-3xl">
            {step === "phone" && "📱"}
            {step === "otp" && "🔐"}
            {step === "success" && "✅"}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {step === "phone" && "Verify Your Phone"}
          {step === "otp" && "Enter Code"}
          {step === "success" && "All Set!"}
        </h2>
        <p className="text-gray-600" style={{ fontFamily: "var(--font-body)" }}>
          {step === "phone" && "We'll send you a verification code"}
          {step === "otp" && `Code sent to ${formatPhoneDisplay()}`}
          {step === "success" && "Your phone is verified"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="neo-recess-sm p-4 mb-6 rounded-xl bg-red-50">
          <p className="text-red-600 text-sm" style={{ fontFamily: "var(--font-body)" }}>
            {error}
          </p>
        </div>
      )}

      {/* Phone Input Step */}
      {step === "phone" && (
        <form onSubmit={handleSubmitPhone} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700" style={{ fontFamily: "var(--font-display)" }}>
              Phone Number
            </label>
            
            {/* Country Code Quick Select */}
            <div className="flex gap-2 mb-3">
              {COMMON_COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => setCountryCode(country.dial)}
                  className={`neo-button neo-button-sm flex-1 ${countryCode === country.dial ? "neo-pressed" : ""}`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <span>{country.flag}</span>
                  <span className="text-xs">{country.dial}</span>
                </button>
              ))}
            </div>

            {/* Phone Input */}
            <div className="flex gap-3">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="neo-input neo-select w-28"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+61">+61</option>
                <option value="+33">+33</option>
                <option value="+49">+49</option>
                <option value="+81">+81</option>
                <option value="+86">+86</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="(555) 123-4567"
                maxLength={15}
                className="neo-input flex-1"
                style={{ fontFamily: "var(--font-body)" }}
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="neo-button flex-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || phoneNumber.length < 7}
              className="neo-action flex-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="neo-loading inline-block w-5 h-5 rounded-full" />
                  Sending...
                </span>
              ) : (
                "Send Code"
              )}
            </button>
          </div>
        </form>
      )}

      {/* OTP Verification Step */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700" style={{ fontFamily: "var(--font-display)" }}>
              Verification Code
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="neo-input text-center text-2xl tracking-[0.5em]"
              style={{ fontFamily: "var(--font-display)" }}
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="neo-button flex-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="neo-action flex-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="neo-loading inline-block w-5 h-5 rounded-full" />
                  Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </button>
          </div>

          {/* Resend Section */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: "var(--font-body)" }}>
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={cooldownSeconds > 0 || isLoading}
              className="neo-button neo-button-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {cooldownSeconds > 0 ? (
                <span className="flex items-center gap-2">
                  <span>Resend in {formatCooldown()}</span>
                </span>
              ) : (
                "Resend Code"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Success Step */}
      {step === "success" && (
        <div className="text-center space-y-6">
          <div className="neo-status mx-auto w-fit">
            Verified
          </div>
          <p className="text-gray-600" style={{ fontFamily: "var(--font-body)" }}>
            Your phone number has been verified. You can now list and buy cards on Lock It In.
          </p>
          <button
            onClick={onComplete}
            className="neo-action w-full"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Security Note */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500" style={{ fontFamily: "var(--font-body)" }}>
          Your phone number is securely verified via SMS. We never share your number with other users.
        </p>
      </div>
    </div>
  );
}

export default PhoneVerificationFlow;
