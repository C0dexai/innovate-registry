import React from 'react';

interface LegalPageProps {
    onClose: () => void;
}

const PrivacyPolicy: React.FC<LegalPageProps> = ({ onClose }) => {
    return (
        <div className="flex-grow p-8 overflow-y-auto bg-[var(--dark-bg)] text-[var(--text-color)]">
            <div className="max-w-4xl mx-auto prose">
                <button onClick={onClose} className="mb-6 !text-[var(--neon-blue)] hover:underline no-underline">&larr; Back to Application</button>
                <h1 className="!text-[var(--neon-pink)]">Privacy Policy</h1>
                <p className="mb-4 text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

                <p className="mb-4">This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>

                <h2 className="!text-[var(--neon-pink)]">1. Information We Collect</h2>
                <p className="mb-4">This application is a client-side tool. Your custom instructions and chat history are processed and stored locally within your browser during your session. They are not stored permanently. We do not collect or store any personally identifiable information on our servers.</p>

                <h2 className="!text-[var(--neon-pink)]">2. Use of Third-Party APIs</h2>
                
                <h3 className="!text-[var(--neon-pink)]">Google Gemini API</h3>
                <p className="mb-4">To power the code generation feature, this application sends your prompts, chat history, and custom instructions to the Google Gemini API. The API key for this service is configured in the application's environment and is not managed by the end-user. Your use of this feature is subject to Google's API policies and terms of service.</p>
                
                <h2 className="!text-[var(--neon-pink)]">3. Changes to this Privacy Policy</h2>
                <p className="mb-4">We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page. We will let You know via a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;