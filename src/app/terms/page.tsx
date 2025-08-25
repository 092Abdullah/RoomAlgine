
import Link from 'next/link';
import { HeaderLogoIcon } from '@/components/icons';

export default function TermsOfUsePage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="fixed top-4 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="floating-header">
            <Link href="/">
              <HeaderLogoIcon />
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Use</h1>
          <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-foreground">
            <p>
              Please read these Terms of Use ("Terms", "Terms of Use") carefully before using the RoomAIgine website (the "Service") operated by RoomAIgine ("us", "we", or "our").
            </p>

            <h2 className="text-2xl font-semibold">Agreement to Terms</h2>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>

            <h2 className="text-2xl font-semibold">User-Generated Content</h2>
            <p>
              Our Service allows you to upload photos and generate designs ("User Content"). You retain all of your rights to any User Content you submit, post, or display on or through the Service and you are responsible for protecting those rights. By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such User Content in any and all media or distribution methods.
            </p>
            <p>
              You agree that this license includes the right for us to provide, promote, and improve the Service and to make User Content submitted to or through the Service available to other companies, organizations, or individuals for the syndication, broadcast, distribution, promotion, or publication of such User Content on other media and services.
            </p>

            <h2 className="text-2xl font-semibold">Acceptable Use</h2>
            <p>
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
              <li>Violate any applicable local, state, national, or international law.</li>
              <li>Infringe upon or violate our intellectual property rights or the intellectual property rights of others.</li>
              <li>Generate or disseminate images that contain hateful, harassing, or violent content.</li>
            </ul>

            <h2 className="text-2xl font-semibold">Intellectual Property</h2>
            <p>
              The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of RoomAIgine and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>

            <h2 className="text-2xl font-semibold">Termination</h2>
            <p>
              We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h2 className="text-2xl font-semibold">Disclaimer</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </p>

            <h2 className="text-2xl font-semibold">Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>

            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@roomaigine.example.com.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
