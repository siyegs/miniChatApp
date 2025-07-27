import { useState } from "react";
import { FiUser, FiMail, FiLock, FiTrash2, FiArrowLeft } from "react-icons/fi";
import PersonalInfo from "../components/settings-components/PersonalInfo";
import ChangeEmail from "../components/settings-components/ChangeEmail";
import PasswordChange from "../components/settings-components/PasswordChange";
import DeleteAccount from "../components/settings-components/DeleteAccount";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <FiUser /> },
    { id: "email", label: "Email", icon: <FiMail /> },
    { id: "password", label: "Password", icon: <FiLock /> },
    { id: "delete", label: "Delete Account", icon: <FiTrash2 /> },
  ];

  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-gray-50 overflow-hidden pb-6">
      <div className="w-full max-w-4xl mx-auto px-4 py-7">
        <button
          className="bg-inherit border-none mb-5 text-gray-800 px-3"
          onClick={() => navigate("/chat")}
        >
          <FiArrowLeft />
        </button>

        <h1 className="text-2xl font-semibold capitalize text-gray-800 text-center mb-8">
          Account Settings
        </h1>

        <div className="mb-6 flex flex-wrap justify-center gap-2 box-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => {
                setActiveTab(tab.id);
                e.currentTarget.style.outlineOffset = "none";
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.border = "none";
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all active:border-none focus:border-none outline-none focus:outline-none border-none
                ${
                  activeTab === tab.id
                    ? "bg-black text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {tab.icon}
              <span className="hidden md:flex">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-2xl h-fit max-w-[500px] mx-auto">
          <div className="p-1 h-fit">
            {activeTab === "personal" && <PersonalInfo />}
            {activeTab === "email" && <ChangeEmail />}
            {activeTab === "password" && <PasswordChange />}
            {activeTab === "delete" && <DeleteAccount />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
