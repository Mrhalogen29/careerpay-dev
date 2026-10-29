import React from "react";
import { ClipboardCheck, User, Briefcase, FileText } from "lucide-react";

const ReviewInfo = ({ data }) => {
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center mb-8">
        <div className="bg-blue-600 p-4 rounded-xl text-white mr-6 shadow-lg shadow-blue-500/30">
          <ClipboardCheck size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Review
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You Are Almost There
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Personal Info Summary */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Personal Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {data.fullName || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {data.email || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Phone</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {data.phone || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Emergency Contact</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {data.emergencyContact || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Employment Summary */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="text-yellow-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Employment Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-gray-400">Engagement Type</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {data.engagementType || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Job Title</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {data.jobTitle || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Start Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {data.startDate || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Documentation Summary */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-green-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Documents
            </h3>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-400">Government ID</p>
            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {data.governmentId ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {data.governmentId}
                </>
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewInfo;
