export default function Contact() {
  const contactInfo = [
    { 
      label: 'Email', 
      value: 'tarek.ghoul@ubc.ca', 
      href: 'mailto:tarek.ghoul@ubc.ca',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      label: 'Location', 
      value: 'Vancouver, British Columbia, Canada', 
      href: null,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-beige-50 dark:bg-[#0D0D0D]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Contact</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <div className="bg-white dark:bg-[#171717] rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Get in Touch</h2>
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start">
                  <span className="text-gray-600 dark:text-gray-400 mr-4 mt-0.5">{info.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{info.label}</p>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-gray-700 dark:text-white">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-[#171717] rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Links</h2>
            <div className="flex gap-8 items-center justify-center pt-2">
              <a
                href="https://www.linkedin.com/in/tarek-ghoul/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="LinkedIn"
              >
                <svg className="w-24 h-24" fill="#0077B5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://scholar.google.com/citations?user=-vy503AAAAAJ&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="Google Scholar"
              >
                <svg className="w-24 h-24" fill="#4285F4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Research Collaboration</h2>
          <p className="text-gray-700 dark:text-white mb-4">
            I&apos;m always interested in discussing research collaborations, opportunities, and potential projects 
            in transportation AI, safety analysis, and intelligent transportation systems.
          </p>
          <p className="text-gray-700 dark:text-white">
            Feel free to reach out via email or connect with me on LinkedIn. I&apos;m also available for peer review 
            and academic service opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}



