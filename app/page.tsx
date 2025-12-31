import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-beige-50">
      {/* Hero & Content Section */}
      <section className="relative pt-8 pb-6 lg:pt-12 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex justify-between items-start">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-3 tracking-tight">
              Tarek Ghoul
            </h1>
            <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex gap-5 items-center">
              <a
                href="https://www.linkedin.com/in/tarek-ghoul/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
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
                className="hover:opacity-70 transition-opacity"
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
            <p className="text-xl font-medium text-start mb-2 pl-5">About</p>
            <Card className="mb-4 pb-[80px] relative">
              <p className="text-gray-800 leading-relaxed mb-3 text-base font-normal opacity-70 text-justify">
                Tarek Ghoul is a transportation AI researcher focused on developing trustworthy and safety-aware artificial 
                intelligence for real-world transportation systems. His work lies at the intersection of intelligent transportation 
                systems, Bayesian modeling, computer vision, and reinforcement learning, with an emphasis on uncertainty 
                quantification, causal reasoning, and decision-making under incomplete information.
              </p>
              
              <p className="text-gray-800 leading-relaxed mb-3 text-base font-normal opacity-70 text-justify">
                He is currently a doctoral researcher at the University of British Columbia, where his research investigates 
                network-level traffic safety modeling and real-time control using emerging data sources, including connected and 
                autonomous vehicles, video analytics, and drone data. His work applies extreme value theory, Bayesian hierarchical 
                models, and reinforcement learning to estimate rare but critical safety risks and to design control strategies that 
                explicitly balance safety, mobility, and efficiency.
              </p>
              
              <p className="text-gray-800 leading-relaxed mb-3 text-base font-normal opacity-70 text-justify">
                Tarek has authored multiple peer-reviewed publications in leading journals such as <em>Accident Analysis&nbsp;&amp;&nbsp;Prevention</em> and <em>Analytic Methods in Accident Research</em>, as well as conference proceedings in transportation engineering and 
                intelligent systems. His research contributions include real-time crash risk estimation from traffic conflicts, safest-route 
                identification under uncertainty, and safety-based traffic signal control using continuous and multi-agent reinforcement learning.
              </p>
              
              <p className="text-gray-800 leading-relaxed text-base font-normal opacity-70 text-justify">
                His long-term research goal is to design deployable AI architectures that enable resilient, sustainable, and safety-aware 
                transportation networks. He actively collaborates with academic researchers, public agencies, and industry partners on 
                projects related to traffic safety, intelligent infrastructure, and trustworthy AI systems.
              </p>
              <div className="absolute bottom-5 right-5">
                <a
                  href="/about"
                  className="flex items-center justify-center text-base font-normal rounded-full bg-gray-800 text-white px-6 py-3 hover:opacity-80 transition-opacity"
                >
                  More about me
                  <span className="w-2"></span>
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

