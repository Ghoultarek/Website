import Link from 'next/link';

export default function Footer() {
  const socialLinks = [
    { href: 'https://www.linkedin.com/in/tarek-ghoul/', label: 'LinkedIn', icon: 'linkedin' },
    { href: 'https://scholar.google.com/citations?user=-vy503AAAAAJ&hl=en', label: 'Google Scholar', icon: 'scholar' },
    { href: 'https://orcid.org/0000-0002-2929-9750', label: 'ORCID', icon: 'orcid' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Tarek Ghoul</h3>
            <p className="text-sm">
              Researcher developing trustworthy and reliable AI for real-world transportation systems.
            </p>
          </div>
          
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  CV
                </Link>
              </li>
              <li>
                <Link href="/publications" className="hover:text-white transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-white transition-colors">
                  Interactive Tools
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Tarek Ghoul. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}





