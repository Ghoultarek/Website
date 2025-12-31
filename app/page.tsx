export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero & Content Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pt-8 pb-6 lg:pt-12 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              Tarek Ghoul
            </h1>
          </div>

          {/* Main Content */}
          <div className="max-w-none mt-[200px]">
            <p className="text-gray-800 leading-relaxed mb-3 text-base lg:text-lg text-justify">
              Tarek Ghoul is a transportation AI researcher focused on developing trustworthy and safety-aware artificial 
              intelligence for real-world transportation systems. His work lies at the intersection of intelligent transportation 
              systems, Bayesian modeling, computer vision, and reinforcement learning, with an emphasis on uncertainty 
              quantification, causal reasoning, and decision-making under incomplete information.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-3 text-base lg:text-lg text-justify">
              He is currently a doctoral researcher at the University of British Columbia, where his research investigates 
              network-level traffic safety modeling and real-time control using emerging data sources, including connected and 
              autonomous vehicles, video analytics, and drone data. His work applies extreme value theory, Bayesian hierarchical 
              models, and reinforcement learning to estimate rare but critical safety risks and to design control strategies that 
              explicitly balance safety, mobility, and efficiency.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-3 text-base lg:text-lg text-justify">
              Tarek has authored multiple peer-reviewed publications in leading journals such as <em>Accident Analysis&nbsp;&amp;&nbsp;Prevention</em> and <em>Analytic Methods in Accident Research</em>, as well as conference proceedings in transportation engineering and 
              intelligent systems. His research contributions include real-time crash risk estimation from traffic conflicts, safest-route 
              identification under uncertainty, and safety-based traffic signal control using continuous and multi-agent reinforcement learning.
            </p>
            
            <p className="text-gray-800 leading-relaxed text-base lg:text-lg text-justify">
              His long-term research goal is to design deployable AI architectures that enable resilient, sustainable, and safety-aware 
              transportation networks. He actively collaborates with academic researchers, public agencies, and industry partners on 
              projects related to traffic safety, intelligent infrastructure, and trustworthy AI systems.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

