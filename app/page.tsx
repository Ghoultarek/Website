import Link from 'next/link';
import { stats } from '@/data/publications';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Tarek Ghoul
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              Transportation AI Researcher
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Vancouver, British Columbia, Canada
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <a href="mailto:tarek.ghoul@ubc.ca" className="hover:text-primary-600 transition-colors">
                tarek.ghoul@ubc.ca
              </a>
              <span>•</span>
              <a href="tel:+17789602785" className="hover:text-primary-600 transition-colors">
                +1 (778) 960-2785
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            I am a researcher developing trustworthy and reliable artificial intelligence for real-world transportation systems. 
            My work combines computer vision, Bayesian modeling, and reinforcement learning to design Intelligent Transportation 
            Systems that can quantify uncertainty, reason causally, and make safe decisions under incomplete information in 
            real-world environments.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            I focus on integrating emerging sensing data including video, autonomous vehicle, and drone data, into scalable 
            network-level models that jointly optimize safety, mobility, and environmental impact. My long-term research goal 
            is to create deployable AI architectures that enable resilient, sustainable, and safety-aware transportation networks.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Research Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover-lift transition-all duration-300">
              <div className="text-4xl font-bold text-primary-600 mb-2">{stats.citations}</div>
              <div className="text-gray-600">Citations</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover-lift transition-all duration-300">
              <div className="text-4xl font-bold text-primary-600 mb-2">{stats.hIndex}</div>
              <div className="text-gray-600">h-index</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover-lift transition-all duration-300">
              <div className="text-4xl font-bold text-primary-600 mb-2">{stats.publications}</div>
              <div className="text-gray-600">Published Papers</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover-lift transition-all duration-300">
              <div className="text-4xl font-bold text-primary-600 mb-2">{stats.underReview}</div>
              <div className="text-gray-600">Under Review</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Achievements */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg p-6 border border-primary-100 hover-lift transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Legislative Impact</h3>
              <p className="text-gray-700">
                Provided technical consulting to the Provincial Government of British Columbia on cyclist passing distance 
                legislation. Recommendations from my analysis study were adopted into the 2024 BC Motor Vehicle Act.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg p-6 border border-primary-100 hover-lift transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Media Recognition</h3>
              <p className="text-gray-700">
                Featured in Popular Science, Yahoo Finance front page, and received national media coverage for my safest 
                route algorithm research. Conducted interviews with Global News BC and 980 CKNW Radio.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg p-6 border border-primary-100 hover-lift transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Awards</h3>
              <p className="text-gray-700">
                Winner of 3-Minute Thesis (Civil Engineering), Top 5 Finalist (University-wide) 2025. Recipient of BPOC 
                Graduate Excellence Award 2025, and multiple scholarships including MITACS Accelerate Grant (CAD $60,000).
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg p-6 border border-primary-100 hover-lift transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Research Focus</h3>
              <p className="text-gray-700">
                Developing real-time crash risk estimation systems, Bayesian Hierarchical Extreme Value models, reinforcement 
                learning for traffic signal optimization, and computer vision applications for transportation safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Explore My Research</h2>
          <p className="text-xl text-primary-100 mb-8">
            Discover my publications, interactive tools, and research projects
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/publications"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              View Publications
            </Link>
            <Link
              href="/tools"
              className="bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors border border-primary-500"
            >
              Interactive Tools
            </Link>
            <Link
              href="/about"
              className="bg-transparent text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors border border-white"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

