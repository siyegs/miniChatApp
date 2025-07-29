import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="max-w-[95%] lg:max-w-[70%] my-7 mx-auto bg-[#743fc9] rounded-[10px] shadow-2xl p-6 sm:p-8">
        <button 
          onClick={(e) => {e.currentTarget.style.outline = "none"; navigate('/')}}
          onMouseOver={(e)=> {e.currentTarget.style.border = "none"}}
          className="text-white text-sm hover:text-neutral-300 transition-colors bg-inherit mb-6"
        >
          ← <span className="hidden md:inline">Back to</span> Login
        </button>
        <h1 className="text-[clamp(21px,3vw,23px)] font-bold text-white mb-6 text-center">
          Terms of Service
        </h1>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              1. Your Account
            </h2>
            <p className="text-white mb-4">
              To use ISK Chat Room, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-white/90">
              <li className="mb-2">Providing accurate information, such as your email address.</li>
              <li className="mb-2">Maintaining the confidentiality of your password.</li>
              <li className="mb-2">All activities that occur under your account.</li>
            </ul>
            <p className="text-white mt-4">
              You must be at least 13 years old to use this service.
            </p>
          </section>

          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              2. User Conduct
            </h2>
            <p className="text-white mb-4">
              We want ISK Chat Room to be a safe and welcoming place. You agree not to use the service to:
            </p>
            <ul className="list-disc pl-6 text-white/90">
              <li className="mb-2">Send messages that are harassing, defamatory, abusive, threatening, or obscene.</li>
              <li className="mb-2">Promote or engage in illegal activities.</li>
              <li className="mb-2">Upload or share content that infringes on any copyright, trademark, or intellectual property rights.</li>
              <li className="mb-2">Impersonate any person or entity.</li>
              <li className="mb-2">Send spam or any unauthorized advertising.</li>
            </ul>
            <p className="text-white mt-4">
              We reserve the right to suspend or terminate your account without notice if you violate these rules of conduct.
            </p>
          </section>

          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              3. Chat Functionality
            </h2>
            <ul className="list-disc pl-6 text-white/90">
              <li className="mb-2">
                <strong>Global Chat:</strong> Messages sent in the "Global Chat" are public and visible to all other users of the application.
              </li>
              <li className="mb-2">
                <strong>Private Chat:</strong> To chat with another user privately, you must first send a chat request. The other user must accept this request before a private chat can begin.
              </li>
              <li className="mb-2">
                <strong>Revoking Access:</strong> You may revoke a previously accepted chat access at any time. The other user will be notified that access has been revoked, and they will not be able to send you new messages unless you grant them access again. They cannot send a new request if one has already been established and revoked.
              </li>
            </ul>
          </section>

          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              4. Content You Post
            </h2>
            <p className="text-white">
              You own the rights to the text and images you post in ISK Chat Room. By posting content, you grant us a license to display it within the application as intended by its features (e.g., showing your message to other users).
            </p>
          </section>

          <section className="mb-8 text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              5. Third-Party Services: Image Uploads
            </h2>
            <p className="text-white mb-4">
              All images uploaded in ISK Chat Room are handled by a third-party service called ImgBB. When you upload an image, it is sent to ImgBB's servers. These images are subject to ImgBB's own Terms of Service and Privacy Policy.
            </p>
            <p className="text-white mb-4">
              By design in our application, images uploaded to ImgBB are set to never expire. We are not responsible for the data handling practices of ImgBB.
            </p>
          </section>

          <section className="text-sm">
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
              6. Termination
            </h2>
            <p className="text-white">
              You can delete your account at any time through the app's settings. We may also terminate or suspend your account if you violate these Terms. Please see our Privacy Policy for details on what happens to your data upon termination.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
