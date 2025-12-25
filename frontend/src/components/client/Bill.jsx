// Bill.jsx - Displays order receipt with print, download, and pay bill functionality
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, X, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import Barcode from "react-barcode";

const Bill = ({ orderData, onClose, onPayBill, billingStatus = 'unpaid' }) => {
  const billRef = useRef();
  const [isPaymentRequested, setIsPaymentRequested] = useState(
    billingStatus === 'pending_payment' || billingStatus === 'paid'
  );

  if (!orderData || !orderData.items || orderData.items.length === 0) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  // Handle pay bill request - notifies admin that customer is ready to pay
  const handlePayBill = async () => {
    if (onPayBill && !isPaymentRequested) {
      try {
        await onPayBill();
        setIsPaymentRequested(true);
      } catch (error) {
        console.error('Error requesting payment:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 pt-10 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md mt-10">
        <Button
          size="icon"
          variant="ghost"
          className="absolute -right-2 -top-2 z-10 h-8 w-8 rounded-full bg-white text-[#1a1a1a] shadow-lg hover:bg-[#f0f0f0]"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <Card
          ref={billRef}
          className="mx-auto max-h-[90vh] overflow-y-auto rounded-lg border-none bg-white shadow-2xl"
        >
          <div className="receipt-container p-8">
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#1a1a1a]">
                  <span className="text-2xl">🍽️</span>
                </div>
              </div>
              <h1
                className="mb-1 text-2xl font-bold uppercase tracking-wider"
                style={{ fontFamily: "Courier New, monospace" }}
              >
                MOMO MAGIC
              </h1>
              <p
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ fontFamily: "Courier New, monospace" }}
              >
                CAFE
              </p>
              <div className="mt-4 text-xs leading-relaxed text-[#6b7280]">
                <p>123 Spice Avenue, Flavor</p>
                <p>Town</p>
                <p>Tel: +1 (206) 658-8856</p>
              </div>
            </div>

            <Separator className="my-4 border-[#1a1a1a]" />

            <div className="mb-4 flex justify-between text-xs">
              <div>
                <p className="font-semibold">DATE: {orderData.date}</p>
                <p className="font-semibold">TIME: {orderData.time}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">NO: {orderData.orderNumber}</p>
                <p className="font-semibold">SVR: A FX</p>
              </div>
            </div>

            <div className="my-4 border-t-2 border-dashed border-[#1a1a1a]"></div>

            <div
              className="mb-2 flex justify-between text-xs font-bold uppercase"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              <span className="w-12">QTY</span>
              <span className="flex-1">ITEM</span>
              <span className="w-16 text-right">PRICE</span>
            </div>

            <div className="mb-4 space-y-3">
              {orderData.items.map((item, index) => (
                <div
                  key={index}
                  className="text-xs"
                  style={{ fontFamily: "Courier New, monospace" }}
                >
                  <div className="flex justify-between font-bold">
                    <span className="w-12">{item.quantity}</span>
                    <span className="flex-1 uppercase">{item.name}</span>
                    <span className="w-16 text-right">
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  {item.description && (
                    <div className="ml-12 text-[#6b7280]">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="my-4 border-t-2 border-dashed border-[#1a1a1a]"></div>

            <div
              className="mb-4 space-y-2 text-xs"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span className="font-semibold">
                  {orderData.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>TAX (8%)</span>
                <span className="font-semibold">{orderData.tax.toFixed(2)}</span>
              </div>
            </div>

            <div
              className="mb-6 flex items-center justify-between rounded bg-[#1a1a1a] px-4 py-3 text-white"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              <span className="text-sm font-bold uppercase">TOTAL</span>
              <span className="text-xl font-bold">
                ₹{orderData.total.toFixed(2)}
              </span>
            </div>

            {/* Payment Status Badge */}
            <div className="mb-4 flex justify-center">
              {billingStatus === 'paid' ? (
                <Badge className="bg-green-500 text-white text-sm px-4 py-1.5 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  PAID
                </Badge>
              ) : billingStatus === 'pending_payment' ? (
                <Badge className="bg-orange-500 text-white text-sm px-4 py-1.5 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  AWAITING PAYMENT
                </Badge>
              ) : (
                <Badge className="bg-red-500 text-white text-sm px-4 py-1.5 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  UNPAID
                </Badge>
              )}
            </div>

            <p
              className="mb-6 text-center text-xs font-bold uppercase tracking-wider"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              THANK YOU FOR DINING WITH US!
            </p>

            <div className="flex justify-center">
              <Barcode
                value={orderData.barcode}
                width={1.5}
                height={50}
                fontSize={10}
                background="#ffffff"
                lineColor="#000000"
              />
            </div>
          </div>
        </Card>

        <div className="mt-4 flex flex-col items-center gap-3">
          {/* Pay Bill Button - Primary action */}
          {onPayBill && (
            <Button
              className={`w-full rounded-full px-6 py-3 font-bold transition-all ${isPaymentRequested
                ? "bg-green-600 hover:bg-green-600 cursor-default"
                : "bg-green-500 hover:bg-green-600"
                }`}
              onClick={handlePayBill}
              disabled={isPaymentRequested}
            >
              {isPaymentRequested ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Payment Request Sent!
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Bill
                </>
              )}
            </Button>
          )}

          {/* Secondary actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full border-white bg-white/90 text-[#1a1a1a] hover:bg-white"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              className="rounded-full bg-[#ff7a3c] hover:bg-[#ff6825]"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container,
          .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Bill;
