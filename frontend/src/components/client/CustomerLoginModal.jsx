/**
 * CustomerLoginModal.jsx - Phone OTP-based login/registration modal
 * Provides two-step authentication: Send OTP → Verify OTP → Create/Login
 */

import React, { useState, useContext, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Phone, Lock, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import CustomerAuthContext from '@/context/CustomerAuthContext';
import { toast } from 'sonner';

const CustomerLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const { sendOTP, verifyOTP, isLoading, error, otpFlow, resetOTPFlow } = useContext(CustomerAuthContext);

    // Form states
    const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'details'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setStep('phone');
        setPhoneNumber('');
        setOtp('');
        setName('');
        setEmail('');
        setLocalError('');
        setIsSubmitting(false);
        resetOTPFlow();
    };

    // Validate and format phone number
    const formatPhoneNumber = (num) => {
        const cleaned = num.replace(/\D/g, '');
        return cleaned.slice(-10); // Get last 10 digits
    };

    // Validate email format
    const isValidEmail = (email) => {
        if (!email) return true; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLocalError('');

        const cleanedPhone = formatPhoneNumber(phoneNumber);

        if (cleanedPhone.length !== 10) {
            setLocalError('Please enter a valid 10-digit phone number');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await sendOTP(cleanedPhone);

            if (result.success) {
                setStep('otp');
                toast.success('OTP sent to your phone number!');
            } else {
                setLocalError(result.message || 'Failed to send OTP');
            }
        } catch (err) {
            setLocalError(err.message || 'Error sending OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (otp.length !== 4) {
            setLocalError('OTP must be 4 digits');
            return;
        }

        if (!name.trim()) {
            setLocalError('Name is required');
            return;
        }

        if (!isValidEmail(email)) {
            setLocalError('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await verifyOTP(otp, name.trim(), email.trim());

            if (result.success) {
                toast.success(result.isNewCustomer ? 'Account created successfully!' : 'Welcome back!');

                // Close modal and trigger callback
                if (onLoginSuccess) {
                    onLoginSuccess();
                }

                // Close modal
                setTimeout(() => {
                    onClose();
                }, 500);
            } else {
                setLocalError(result.message || 'OTP verification failed');
            }
        } catch (err) {
            setLocalError(err.message || 'Error verifying OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setLocalError('');
        setOtp('');
        setIsSubmitting(true);

        try {
            const result = await sendOTP(otpFlow.phoneNumber);

            if (result.success) {
                toast.success('OTP resent successfully!');
            } else {
                setLocalError(result.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setLocalError(err.message || 'Error resending OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Change phone number
    const handleChangePhone = () => {
        setStep('phone');
        setOtp('');
        setPhoneNumber('');
        setLocalError('');
    };

    const displayError = localError || error;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-2xl border-0 bg-white p-0 sm:rounded-2xl">
                {/* Header */}
                <DialogHeader className="border-b border-[#e5e7eb] px-6 py-4">
                    <DialogTitle className="text-center text-lg font-bold text-[#1a1a1a]">
                        {step === 'phone' && 'Login with Phone'}
                        {step === 'otp' && 'Verify OTP'}
                    </DialogTitle>
                </DialogHeader>

                {/* Content */}
                <div className="px-6 py-6">
                    {/* Step 1: Phone Number */}
                    {step === 'phone' && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
                                    <Input
                                        type="tel"
                                        placeholder="Enter 10-digit mobile number"
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            const cleaned = e.target.value.replace(/\D/g, '');
                                            setPhoneNumber(cleaned.slice(0, 10));
                                        }}
                                        maxLength="10"
                                        className="border-[#e5e7eb] bg-[#fafafa] pl-10 focus:border-[#ff7a3c] focus:ring-[#ff7a3c]"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-[#6b7280]">
                                    We'll send you a 4-digit OTP for verification
                                </p>
                            </div>

                            {/* Error Message */}
                            {displayError && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
                                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-600">{displayError}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || phoneNumber.length !== 10}
                                className="w-full rounded-full bg-[#ff7a3c] py-6 text-base font-semibold text-white hover:bg-[#ff6825] disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Send OTP'
                                )}
                            </Button>

                            {/* Info */}
                            <p className="text-center text-xs text-[#6b7280]">
                                By logging in, you agree to our{' '}
                                <span className="text-[#ff7a3c] cursor-pointer hover:underline">
                                    Terms of Service
                                </span>
                            </p>
                        </form>
                    )}

                    {/* Step 2: OTP & Details */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            {/* Display phone number */}
                            <div className="rounded-lg bg-[#fafafa] p-3 text-center">
                                <p className="text-sm text-[#6b7280]">Verifying:</p>
                                <p className="font-semibold text-[#1a1a1a]">+91 {otpFlow.phoneNumber}</p>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="mt-1 h-auto p-0 text-xs text-[#ff7a3c]"
                                    onClick={handleChangePhone}
                                    disabled={isSubmitting}
                                >
                                    Change number
                                </Button>
                            </div>

                            {/* OTP Input */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                                    Enter OTP
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
                                    <Input
                                        type="text"
                                        placeholder="0000"
                                        value={otp}
                                        onChange={(e) => {
                                            const cleaned = e.target.value.replace(/\D/g, '');
                                            setOtp(cleaned.slice(0, 4));
                                        }}
                                        maxLength="4"
                                        className="border-[#e5e7eb] bg-[#fafafa] pl-10 text-center text-lg tracking-widest focus:border-[#ff7a3c] focus:ring-[#ff7a3c]"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-[#6b7280]">
                                    Check your phone for the 4-digit OTP (expires in 5 minutes)
                                </p>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
                                    <Input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isSubmitting}
                                        className="border-[#e5e7eb] bg-[#fafafa] pl-10 focus:border-[#ff7a3c] focus:ring-[#ff7a3c]"
                                    />
                                </div>
                            </div>

                            {/* Email Input (Optional) */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                                    Email <span className="text-xs text-[#9ca3af]">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
                                    <Input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSubmitting}
                                        className="border-[#e5e7eb] bg-[#fafafa] pl-10 focus:border-[#ff7a3c] focus:ring-[#ff7a3c]"
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {displayError && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
                                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-600">{displayError}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || otp.length !== 4 || !name.trim()}
                                className="w-full rounded-full bg-[#ff7a3c] py-6 text-base font-semibold text-white hover:bg-[#ff6825] disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Continue'
                                )}
                            </Button>

                            {/* Resend OTP */}
                            <div className="text-center">
                                <p className="text-sm text-[#6b7280]">
                                    Didn't receive OTP?{' '}
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="h-auto p-0 text-[#ff7a3c] hover:underline"
                                        onClick={handleResendOTP}
                                        disabled={isSubmitting}
                                    >
                                        Resend
                                    </Button>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerLoginModal;
