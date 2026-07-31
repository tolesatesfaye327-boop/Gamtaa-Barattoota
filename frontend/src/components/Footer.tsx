import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Footer() {
  const { token } = useAuthStore();

  const exploreLinks = [
    { to: "/events", label: "Events" },
    { to: "/tickets", label: "Event Tickets" },
    { to: "/winners", label: "Lucky Draw Winners" },
    { to: "/my-tickets", label: "My Tickets" },
    { to: "/gallery", label: "Gallery" },
    { to: "/students", label: "Students" },
    { to: "/contact", label: "Contact" },
    { to: "/faqs", label: "FAQs" },
    { to: "/leadership", label: "Leadership" },
  ];

  const aboutLinks = [
    { to: "/waaee", label: "Waa'ee Keenya" },
    { to: "/koreewwan", label: "Committees" },
    { to: "/galata", label: "Thanksgiving" },
    { to: "/ergaa", label: "Brief Message" },
    { to: "/yaadannoo", label: "Memorial" },
  ];

  const memberLinks = [
    { to: "/resources", label: "Learning Resources" },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 border-t border-gray-800 dark:border-gray-800 pb-20 xl:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-10">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="text-2xl font-bold text-white">
              GBAABW
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Gamtaa Barattoota Aanaa Ada&apos;a Bargaa — bringing students
              together and supporting each other at Haramaya University.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <SocialIcon
                href="https://facebook.com"
                label="Facebook"
                viewBox="0 0 24 24"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </SocialIcon>
              <SocialIcon
                href="https://twitter.com"
                label="Twitter"
                viewBox="0 0 24 24"
              >
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </SocialIcon>
              <SocialIcon
                href="https://linkedin.com"
                label="LinkedIn"
                viewBox="0 0 24 24"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </SocialIcon>
              <SocialIcon
                href="https://instagram.com"
                label="Instagram"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
              </SocialIcon>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Explore
            </h3>
            <ul className="mt-4 space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              About
            </h3>
            <ul className="mt-4 space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden sm:block">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <span>adaabargaa@student.haramaya.edu.et</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <span>+251 91 234 5678</span>
              </li>
              <li className="text-sm text-gray-400">
                Haramaya University
                <br />
                Haramaya, Oromiya, Ethiopia
              </li>
            </ul>
            {token && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Members
                </h3>
                <ul className="mt-3 space-y-2">
                  {memberLinks.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-gray-400 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Gamtaa Barattoota Aanaa Ada&apos;a
            Bargaa. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link
              to="/privacy-policy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-700">|</span>
            <Link
              to="/terms-of-service"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
  viewBox,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  viewBox: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-primary hover:text-white transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox={viewBox}
      >
        {children}
      </svg>
    </a>
  );
}
