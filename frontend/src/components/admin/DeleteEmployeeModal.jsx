// src/components/admin/DeleteEmployeeModal.jsx
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { AlertTriangle, Briefcase, X, Trash2 } from "lucide-react";

export default function DeleteEmployeeModal({ employee, onConfirm, onCancel, isOpen }) {
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
            Delete Employee
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-6">
            This action will permanently remove this user from the database.
          </p>

          {/* Employee Info Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={employee?.avatar} />
                <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
                  {employee?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{employee?.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{employee?.role}</span>
                  <span>•</span>
                  <span>ID {employee?.employeeId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-800">
              <span className="font-semibold">Warning:</span> All associated records, including shift history and performance logs, will be unrecoverable.
            </p>
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
