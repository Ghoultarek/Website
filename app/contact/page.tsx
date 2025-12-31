export default function Contact() {
  const contactInfo = [
    { label: 'Email', value: 'tarek.ghoul@ubc.ca', href: 'mailto:tarek.ghoul@ubc.ca', icon: '✉️' },
    { label: 'Phone', value: '+1 (778) 960-2785', href: 'tel:+17789602785', icon: '📞' },
    { label: 'Location', value: 'Vancouver, British Columbia, Canada', href: null, icon: '📍' },
  ];

  const socialLinks = [
    { 
      name: 'LinkedIn', 
      url: 'https://www.linkedin.com/in/tarek-ghoul/', 
      icon: 'linkedin',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    { 
      name: 'Google Scholar', 
      url: 'https://scholar.google.com/citations?user=-vy503AAAAAJ&hl=en', 
      icon: 'scholar',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      name: 'ORCID', 
      url: 'https://orcid.org/0000-0002-2929-9750', 
      icon: 'orcid',
      color: 'bg-green-600 hover:bg-green-700'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start">
                  <span className="text-2xl mr-4">{info.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{info.label}</p>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-gray-700">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Connect Online</h2>
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${link.color} text-white px-6 py-3 rounded-lg font-semibold block text-center transition-colors`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-primary-50 rounded-lg p-6 border border-primary-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Research Collaboration</h2>
          <p className="text-gray-700 mb-4">
            I&apos;m always interested in discussing research collaborations, opportunities, and potential projects 
            in transportation AI, safety analysis, and intelligent transportation systems.
          </p>
          <p className="text-gray-700">
            Feel free to reach out via email or connect with me on LinkedIn. I&apos;m also available for peer review 
            and academic service opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}



