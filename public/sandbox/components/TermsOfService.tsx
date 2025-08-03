import React from 'react';

interface LegalPageProps {
    onClose: () => void;
}

const TermsOfService: React.FC<LegalPageProps> = ({ onClose }) => {
    return (
        <div className="flex-grow p-8 overflow-y-auto bg-[var(--dark-bg)] text-[var(--text-color)]">
            <div className="max-w-4xl mx-auto prose">
                <button onClick={onClose} className="mb-6 !text-[var(--neon-blue)] hover:underline no-underline">&larr; Back to Application</button>
                <h1 className="!text-[var(--neon-pink)]">Terms of Service</h1>
                <p className="mb-4 text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
                
                <p className="mb-4">Please read these terms and conditions carefully before using Our Service.</p>

                <h2 className="!text-[var(--neon-pink)]">1. Acknowledgment</h2>
                <p className="mb-4">These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service. Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>

                <h2 className="!text-[var(--neon-pink)]">2. User Accounts</h2>
                <p className="mb-4">When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service. You are responsible for safeguarding the password that You use to access the Service and for any activities or actions under Your password.</p>

                <h2 className="!text-[var(--neon-pink)]">3. Intellectual Property</h2>
                <p className="mb-4">The Service and its original content (excluding Content provided by You or other users), features and functionality are and will remain the exclusive property of the Company and its licensors. The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries.</p>

                <h2 className="!text-[var(--neon-pink)]">4. Termination</h2>
                <p className="mb-4">We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions. Upon termination, Your right to use the Service will cease immediately.</p>
                
                <h2 className="!text-[var(--neon-pink)]">5. Governing Law</h2>
                <p className="mb-4">The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
                
                <h2 className="!text-[var(--neon-pink)]">6. Contact Us</h2>
                <p className="mb-4">If you have any questions about these Terms and Conditions, You can contact us by email at support@example.com.</p>
            </div>
        </div>
    );
};

export default TermsOfService;