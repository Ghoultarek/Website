import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-beige-50 dark:bg-[#0D0D0D]">
      {/* Hero & Content Section */}
      <section className="relative pt-8 pb-6 lg:pt-12 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex justify-between items-start">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-3 tracking-tight">
              Tarek Ghoul
            </h1>
            <div className="bg-white dark:bg-[#171717] rounded-3xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex gap-5 items-center">
              <a
                href="https://www.linkedin.com/in/tarek-ghoul/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity text-gray-800 dark:text-white"
                aria-label="LinkedIn"
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://scholar.google.com/citations?user=-vy503AAAAAJ&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity text-gray-800 dark:text-white"
                aria-label="Google Scholar"
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-none mt-[90px]">
            <p className="text-2xl font-medium text-start mb-2 pl-5 text-gray-800 dark:text-white">About</p>
            <Card className="mb-4 pb-[80px] relative">
              <p className="text-gray-800 dark:text-white leading-relaxed mb-3 text-base font-normal opacity-70 dark:opacity-80 text-justify">
                Tarek Ghoul is a transportation AI researcher focused on developing trustworthy and safety-aware artificial 
                intelligence for real-world transportation systems. His work lies at the intersection of intelligent transportation 
                systems, Bayesian modeling, computer vision, and reinforcement learning, with an emphasis on uncertainty 
                quantification, causal reasoning, and decision-making under incomplete information.
              </p>
              
              <p className="text-gray-800 dark:text-white leading-relaxed mb-3 text-base font-normal opacity-70 dark:opacity-80 text-justify">
                He is currently a doctoral researcher at the University of British Columbia, where his research investigates 
                network-level traffic safety modeling and real-time control using emerging data sources, including connected and 
                autonomous vehicles, video analytics, and drone data. His work applies extreme value theory, Bayesian hierarchical 
                models, and reinforcement learning to estimate rare but critical safety risks and to design control strategies that 
                explicitly balance safety, mobility, and efficiency.
              </p>
              
              <p className="text-gray-800 dark:text-white leading-relaxed mb-3 text-base font-normal opacity-70 dark:opacity-80 text-justify">
                Tarek has authored multiple peer-reviewed publications in leading journals such as <em>Accident Analysis&nbsp;&amp;&nbsp;Prevention</em> and <em>Analytic Methods in Accident Research</em>, as well as conference proceedings in transportation engineering and 
                intelligent systems. His research contributions include real-time crash risk estimation from traffic conflicts, safest-route 
                identification under uncertainty, and safety-based traffic signal control using continuous and multi-agent reinforcement learning.
              </p>
              
              <p className="text-gray-800 dark:text-white leading-relaxed text-base font-normal opacity-70 dark:opacity-80 text-justify">
                His long-term research goal is to design deployable AI architectures that enable resilient, sustainable, and safety-aware 
                transportation networks. He actively collaborates with academic researchers, public agencies, and industry partners on 
                projects related to traffic safety, intelligent infrastructure, and trustworthy AI systems.
              </p>
              <div className="absolute bottom-5 right-5">
                <a
                  href="/about"
                  className="flex items-center justify-center text-base font-normal rounded-full bg-gray-800 dark:bg-gray-700 text-white px-6 py-3 hover:opacity-80 dark:hover:bg-gray-600 transition-opacity"
                >
                  More about me
                  <span className="w-2"></span>
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </Card>

            {/* Interactive Demos CTA */}
            <div className="max-w-none mt-6 flex justify-center">
              <div className="w-full max-w-md">
                <Card className="relative">
                  <p className="text-gray-800 dark:text-white text-base font-normal mb-4 text-center opacity-70 dark:opacity-80">
                    Explore interactive demonstrations of key techniques and methods used in my research.
                  </p>
                  <div className="flex justify-center">
                    <a
                      href="/tools"
                      className="inline-flex items-center justify-center text-base font-normal rounded-full bg-gray-800 dark:bg-gray-700 text-white px-6 py-3 hover:opacity-80 dark:hover:bg-gray-600 transition-opacity"
                    >
                      See Interactive Demos
                      <span className="w-2"></span>
                      <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                  </div>
                </Card>
              </div>
            </div>

            {/* News Section */}
            <div className="max-w-none mt-8">
              <p className="text-2xl font-medium text-start mb-2 pl-5 text-gray-800 dark:text-white">News</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="relative">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Popular Science</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">July 27, 2023</p>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    A new mapping algorithm aims to steer drivers towards the safest route
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-white opacity-70 dark:opacity-80 mb-4">
                    Research on safest-route navigation algorithms featured in Popular Science, highlighting how real-time crash risk data 
                    can provide safer driving directions through cities.
                  </p>
                  <a
                    href="https://www.popsci.com/technology/map-safest-route-algorithm/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    Read Article
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </Card>

                <Card className="relative">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">UBC Civil Engineering</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">April 4, 2024</p>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    From Reaction to Prevention: Reimagining Road Safety Through Data
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-white opacity-70 dark:opacity-80 mb-4">
                    Winner of the 2024 Three Minute Thesis (3MT®) competition, discussing the shift from reactive to proactive 
                    approaches in traffic safety research.
                  </p>
                  <a
                    href="https://civil.ubc.ca/from-reaction-to-prevention-reimagining-road-safety-through-data/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    Read Article
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

