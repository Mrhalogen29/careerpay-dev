import { useState } from "react";
import { FileText, Upload, CheckCircle, X } from "lucide-react";

const DocumentsInfo = ({ data, updateData }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      // Simulate file upload
      setTimeout(() => {
        updateData({ governmentId: file.name });
        setIsUploading(false);
      }, 1500);
    }
  };

  const removeFile = () => {
    updateData({ governmentId: null });
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center mb-8">
        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl text-green-600 mr-6 shadow-sm">
          <FileText size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Documents
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload required documents
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center transition-all hover:border-blue-500 group">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Government ID
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Passport, Driver's License, or State ID
            </p>
          </div>

          {!data.governmentId && !isUploading ? (
            <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-gray-700 dark:text-white shadow-sm hover:shadow-md transition-all active:scale-95 group-hover:border-blue-500">
              <Upload size={20} />
              <span>Upload Document</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
            </label>
          ) : isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-600 font-medium">Uploading...</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 animate-fadeIn w-full max-w-md">
              <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {data.governmentId}
                </p>
                <p className="text-xs text-gray-500">Upload successful</p>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsInfo;
