import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="max-w-[95%] lg:max-w-[60%] my-7 mx-auto bg-[#743fc9] rounded-[10px] shadow-2xl p-6 sm:p-8">
        <button 
          onClick={() => navigate('/')}
          onMouseOver={(e)=> {e.currentTarget.style.border = "none"}}
          className=" text-white text-sm hover:text-neutral-300 transition-colors bg-inherit mb-6"
        >
          ← <span className="hidden md:inline">Back to</span> Login
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-white mb-6">
            Your privacy is critically important to us. This policy explains what information we collect and why.
          </p>

          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              1. Information We Collect
            </h2>
            <p className="text-white mb-4">
              We collect the following types of information to provide and improve our service:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Information You Provide:</h3>
                <ul className="list-disc pl-6 mb-4 text-white/90">
                  <li className="mb-2">
                    <strong>Account Information:</strong> When you register, we collect your email address and a hashed version of your password.
                  </li>
                  <li className="mb-2">
                    <strong>Profile Information:</strong> You may provide a display name and a profile picture.
                  </li>
                  <li className="mb-2">
                    <strong>Message Content:</strong> We collect and store the text and images you send in both global and private chats.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Information We Collect Automatically:</h3>
                <ul className="list-disc pl-6 mb-4 text-white/90">
                  <li className="mb-2">
                    <strong>Usage Data:</strong> We automatically record your "last seen" timestamp to show your activity status to other users.
                  </li>
                  <li className="mb-2">
                    <strong>Technical Data:</strong> Our backend provider, Google Firebase, may collect technical data such as your IP address, device type, and browser information for security and operational purposes.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              2. How We Use Your Information
            </h2>
            <div className="space-y-2">
              <ul className="list-disc pl-6 text-white/90">
                <li className="mb-2">
                  <strong>To Operate the Service:</strong> To create your account, facilitate communication between users, display profiles and messages, and manage chat requests.
                </li>
                <li className="mb-2">
                  <strong>To Maintain Security:</strong> To protect against fraudulent or unauthorized activity.
                </li>
                <li className="mb-2">
                  <strong>To Communicate With You:</strong> To send necessary service-related notifications, such as password reset emails.
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              3. How Your Information is Shared
            </h2>
            <ul className="list-disc pl-6 text-white/90">
              <li className="mb-2">
                <strong>With Other Users:</strong> Your display name and profile picture are visible to all users. Your messages in the "Global Chat" are visible to all users. Your messages in a private chat are visible only to the other participant in that chat.
              </li>
              <li className="mb-2">
                <strong>With Third-Party Service Providers:</strong>
                <ul className="list-disc pl-6 mt-2">
                  <li className="mb-2">
                    <strong>Google Firebase:</strong> Our application is built on Google Firebase, which provides our database, authentication, and backend infrastructure. Your data is stored on Firebase servers.
                  </li>
                  <li className="mb-2">
                    <strong>ImgBB:</strong> As stated in the Terms, all uploaded images are processed and hosted by ImgBB.
                  </li>
                </ul>
              </li>
            </ul>
            <p className="text-white mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              4. Your Rights and Choices
            </h2>
            <ul className="list-disc pl-6 text-white/90">
              <li className="mb-2">
                <strong>Access and Update:</strong> You can access and update your profile information (display name, profile picture) at any time in the settings.
              </li>
              <li className="mb-2">
                <strong>Mute Chats:</strong> You can mute notifications for any specific private chat or the global chat. This preference is stored locally on your device.
              </li>
              <li className="mb-2">
                <strong>Account Deletion:</strong> You can delete your account from the settings page. When you delete your account:
                <ul className="list-disc pl-6 mt-2">
                  <li className="mb-2">Your user account in our authentication system is permanently deleted.</li>
                  <li className="mb-2">Your user profile in our database is marked as "deleted" but is not immediately removed. This is to ensure that your past messages in conversations with other users still show your name.</li>
                  <li className="mb-2">Your profile will no longer appear in the "Active Users" list for new chat requests.</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              5. Data Storage and Security
            </h2>
            <p className="text-white">
              Your data is stored on Google Firebase's secure servers. While we and our service providers take reasonable measures to protect your information, no online service is 100% secure.
            </p>
          </section>

          <section className="text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              6. Children's Privacy
            </h2>
            <p className="text-white">
              Our service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
