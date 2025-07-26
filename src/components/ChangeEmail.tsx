import React, { useState } from "react";
import { updateUserEmail } from "./chatUtils";

const ChangeEmail = () => {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!currentPassword || !newEmail) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await updateUserEmail(currentPassword, newEmail);
      setSuccess("Email updated successfully");
      setNewEmail("");
      setCurrentPassword("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-7">
      <h2 className="text-xl font-semibold mb-4 text-neutral-800 flex items-center gap-2">
        <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-neutral-900 to-neutral-700 rounded-full mr-2"></span>
        Update Email
      </h2>
      <form onSubmit={handleEmailUpdate} className="space-y-4 max-w-md mx-auto">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            New Email
          </label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New Email"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-neutral-50 text-neutral-900 text-base transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-neutral-50 text-neutral-900 text-base transition"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          onMouseOver={(e)=> {e.currentTarget.style.border = "none"}}

          className="w-fit box-border bg-gradient-to-r from-neutral-900 to-neutral-700 text-white py-2.5 rounded-lg font-semibold shadow-md hover:from-neutral-800 hover:to-neutral-600 transition disabled:opacity-60 disabled:cursor-not-allowed text-[clamp(13px,3vw,23px)]"
        >
          Update Email
        </button>
      </form>
      {(error || success) && (
        <div className="max-w-md mx-auto">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-2 animate-fade-in">
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-sm mb-2 animate-fade-in">
              <span>{success}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChangeEmail;
