import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero & Content Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pt-16 pb-12 lg:pt-20 lg:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Tarek Ghoul
            </h1>
          </div>

          {/* Main Content */}
          <div className="max-w-none">
            <p className="text-gray-800 leading-relaxed mb-5 text-lg lg:text-xl text-justify">
              Tarek Ghoul is a transportation AI researcher focused on developing trustworthy and safety-aware artificial 
              intelligence for real-world transportation systems. His work lies at the intersection of intelligent transportation 
              systems, Bayesian modeling, computer vision, and reinforcement learning, with an emphasis on uncertainty 
              quantification, causal reasoning, and decision-making under incomplete information.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-5 text-lg lg:text-xl text-justify">
              He is currently a doctoral researcher at the University of British Columbia, where his research investigates 
              network-level traffic safety modeling and real-time control using emerging data sources, including connected and 
              autonomous vehicles, video analytics, and drone data. His work applies extreme value theory, Bayesian hierarchical 
              models, and reinforcement learning to estimate rare but critical safety risks and to design control strategies that 
              explicitly balance safety, mobility, and efficiency.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-5 text-lg lg:text-xl text-justify">
              Tarek has authored multiple peer-reviewed publications in leading journals such as <em>Accident Analysis&nbsp;&amp;&nbsp;Prevention</em> and <em>Analytic Methods in Accident Research</em>, as well as conference proceedings in transportation engineering and 
              intelligent systems. His research contributions include real-time crash risk estimation from traffic conflicts, safest-route 
              identification under uncertainty, and safety-based traffic signal control using continuous and multi-agent reinforcement learning.
            </p>
            
            <p className="text-gray-800 leading-relaxed text-lg lg:text-xl text-justify">
              His long-term research goal is to design deployable AI architectures that enable resilient, sustainable, and safety-aware 
              transportation networks. He actively collaborates with academic researchers, public agencies, and industry partners on 
              projects related to traffic safety, intelligent infrastructure, and trustworthy AI systems.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">Explore My Research</h2>
          <p className="text-xl text-primary-100 mb-8">
            Discover my publications, interactive tools, and research projects
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/publications"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View Publications
            </Link>
            <Link
              href="/tools"
              className="bg-primary-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-900 transition-all duration-200 border border-primary-500 shadow-lg hover:shadow-xl"
            >
              Interactive Tools
            </Link>
            <Link
              href="/about"
              className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600/50 transition-all duration-200 border-2 border-white shadow-lg hover:shadow-xl"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

