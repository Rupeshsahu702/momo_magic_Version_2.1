/**
 * PaymentRequestNotification - Alert for admin when customer is ready to pay.
 * Displays table number, total amount, and provides acknowledge/dismiss actions.
 */
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { X, CreditCard, Bell, CheckCircle2 } from "lucide-react";

export default function PaymentRequestNotification({
    paymentRequest,
    onAcknowledge,
    onClose,
    isOpen,
}) {
    const [timeElapsed, setTimeElapsed] = useState("Just Now");

    // Update time elapsed display
    useEffect(() => {
        if (!isOpen || !paymentRequest) return;

        const startTime = paymentRequest.timestamp
            ? new Date(paymentRequest.timestamp).getTime()
            : Date.now();

        const updateTime = () => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            if (elapsed < 60) {
                setTimeElapsed("Just Now");
            } else if (elapsed < 3600) {
                setTimeElapsed(`${Math.floor(elapsed / 60)}m ago`);
            } else {
                setTimeElapsed(`${Math.floor(elapsed / 3600)}h ago`);
            }
        };

        updateTime();
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, [isOpen, paymentRequest]);

    if (!isOpen || !paymentRequest) return null;

    return (
        <>
            {/* Backdrop - Semi-transparent */}
            <div
                className="fixed inset-0 bg-black/30 z-[100] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Notification Card */}
            <div className="fixed top-4 right-4 z-[101] w-96 animate-in slide-in-from-top-5 duration-300">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                    {/* Green Header Bar - Indicates payment action */}
                    <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>

                    {/* Content */}
                    <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {/* Payment Icon */}
                                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500">
                                    <CreditCard className="h-6 w-6 text-green-400" />
                                </div>

                                {/* Request Info */}
                                <div>
                                    <h3 className="text-white font-bold text-lg">
                                        Payment Request
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        Table {paymentRequest.tableNumber} • {timeElapsed}
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                            <p className="text-gray-300 text-sm">
                                <span className="font-semibold text-white">
                                    {paymentRequest.customerName || "Guest"}
                                </span>{" "}
                                is ready to settle their bill
                            </p>
                            {paymentRequest.orderCount > 1 && (
                                <p className="text-gray-400 text-xs mt-1">
                                    {paymentRequest.orderCount} orders in this session
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            {/* Bell Icon Button */}
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 transition-colors"
                                onClick={() => {
                                    // Play notification sound or additional action
                                    console.log("Payment notification acknowledged");
                                }}
                            >
                                <Bell className="h-5 w-5" />
                            </button>

                            {/* Acknowledge Button */}
                            <Button
                                onClick={() => onAcknowledge(paymentRequest)}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-all hover:scale-105"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Acknowledge
                            </Button>

                            {/* Dismiss Button */}
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="px-6 py-2.5 bg-transparent border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 rounded-xl font-medium"
                            >
                                Later
                            </Button>
                        </div>

                        {/* Total Amount Footer */}
                        <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-700">
                            <div className="text-center">
                                <p className="text-gray-500 text-xs uppercase">Total Amount</p>
                                <p className="text-green-400 font-bold text-2xl">
                                    ₹{paymentRequest.total?.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
