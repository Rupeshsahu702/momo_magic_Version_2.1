// src/components/admin/DeleteMenuItemModal.jsx
import { Button } from "../ui/button";
import { AlertTriangle, X, Trash2 } from "lucide-react";

export default function DeleteMenuItemModal({ item, onConfirm, onCancel, isOpen }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-xl shadow-2xl p-6">
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Delete Item?
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to permanently remove this item from the menu? This action cannot be undone.
          </p>

          {/* Item Info Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Item Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {item?.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">{item?.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{item?.category}</span>
                  <span>•</span>
                  <span>{item?.type}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-lg font-bold text-orange-500">{item?.price}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Confirm Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
