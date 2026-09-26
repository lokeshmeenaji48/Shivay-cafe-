import React from 'react';
import { motion } from 'motion/react';
import { Order } from '../types';
import { Printer, X, Coffee, CheckCircle } from 'lucide-react';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const gstAmount = Math.round(order.totalAmount * 0.05 * 100) / 100;
  const subTotal = order.totalAmount - gstAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-6 shadow-2xl space-y-6 text-stone-200"
      >
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="h-5 w-5 text-amber-500" />
            <h3 className="font-sans text-lg font-bold text-white">Tax Invoice & Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:text-white bg-stone-800 border border-stone-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="bg-stone-950 text-stone-100 p-6 rounded-2xl border border-stone-800 space-y-4 font-mono text-xs">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-stone-800 pb-4">
            <div className="flex items-center justify-center space-x-2 text-amber-500 font-sans font-extrabold text-xl">
              <Coffee className="h-6 w-6" />
              <span>SHIVAY CAFÉ</span>
            </div>
            <p className="text-[11px] text-stone-400 font-sans">Owner: Rinku Saini</p>
            <p className="text-[10px] text-stone-500 font-sans">Mandawari, Lalsot, Dausa, Rajasthan</p>
            <p className="text-[10px] text-stone-500">Tel: +91 98290 12345 | GSTIN: 08AAAFS1234F1Z9</p>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-400">Order ID:</span>
              <span className="font-bold text-amber-400">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Date & Time:</span>
              <span>{order.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Customer:</span>
              <span className="font-bold text-white">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Location:</span>
              <span className="font-bold text-amber-400">{order.tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Phone:</span>
              <span>{order.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Status:</span>
              <span className="font-bold text-emerald-400">{order.status.toUpperCase()}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-dashed border-stone-800 py-3 space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-stone-400">
              <span>ITEM</span>
              <span>QTY x PRICE</span>
              <span>TOTAL</span>
            </div>
            <div className="flex justify-between text-xs text-white">
              <span className="truncate max-w-[160px]">{order.productName}</span>
              <span>{order.quantity} x ₹{order.productPrice}</span>
              <span className="font-bold">₹{order.totalAmount}</span>
            </div>
            {order.notes && (
              <div className="text-[10px] text-amber-400 italic">
                Note: {order.notes}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex justify-between text-stone-400">
              <span>Subtotal:</span>
              <span>₹{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>CGST + SGST (5%):</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-amber-400 pt-2 border-t border-stone-800">
              <span>GRAND TOTAL:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-dashed border-stone-800 text-[10px] text-stone-500 font-sans space-y-1">
            <p className="font-bold text-amber-400/90">Thank you for visiting Shivay Café!</p>
            <p>Designed for coffee & food lovers by Rinku Saini.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-white text-xs font-bold uppercase cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 shadow-lg"
          >
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
