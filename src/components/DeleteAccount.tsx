import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUserAccount } from "./chatUtils";
import { FiTrash2 } from "react-icons/fi";

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        await deleteUserAccount();
        navigate("/");
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="py-8 px-6">
      <div className="flex items-center justify-center gap-x-5 mb-7">
        <h2 className="text-3xl font-semibold mb-4 text-red-700 flex items-center gap-2 bg-red-200 rounded-3xl p-3">
          <FiTrash2 />
        </h2>
        <p className="text-gray-700">
          <h2 className="font-extrabold text-lg">Delete Account</h2>
          <p className="text-[clamp(15px,3vw,23px)]">Permanently remove your account and all associated data.</p>
        </p>
      </div>
      <button
        onClick={handleDeleteAccount}
        disabled={isLoading}
        className="w-fit flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white py-2.5 rounded-lg font-semibold shadow hover:from-red-600 hover:to-red-800 transition disabled:opacity-60 disabled:cursor-not-allowed text-[clamp(12px,3vw,23px)]"
      >
        {isLoading ? "Deleting..." : "Delete My Account"}
      </button>
      {error && (
        <div className="max-w-md mx-auto mt-4">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-2 animate-fade-in">
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
