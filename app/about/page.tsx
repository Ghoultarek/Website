import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import Heading from '@/components/ui/Heading';
import Card from '@/components/ui/Card';
import Link from '@/components/ui/Link';

// Helper component for publication badges
function PublicationBadge({ journal, status }: { journal?: string; status?: 'published' | 'under-review' }) {
  if (!journal && !status) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {journal && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
          {journal}
        </span>
      )}
      {status === 'under-review' && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
          Under Review
        </span>
      )}
    </div>
  );
}

// Helper component for impact badges
function ImpactBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
      {text}
    </span>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-beige-50 dark:bg-[#0D0D0D]">
      <Section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <Heading level={1} className="mb-6">CV</Heading>

            {/* Education */}
            <section className="mb-6">
              <Heading level={2} className="mb-4">Education</Heading>
              
              <div className="space-y-4">
                <Card>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                    <div>
                      <Heading level={3} className="mb-1">PhD. in Transportation Engineering</Heading>
                      <p className="text-gray-700 dark:text-white text-sm">University of British Columbia, Vancouver, Canada</p>
                    </div>
                    <span className="text-gray-600 dark:text-white font-medium text-sm mt-1 md:mt-0">2021-2026 (Expected)</span>
                  </div>
                  <p className="text-gray-700 dark:text-white text-sm mb-2 italic">Thesis: Real-Time Crash Risk Modeling and its Applications in Intelligent Transportation Systems</p>
                  <p className="text-gray-700 dark:text-white text-sm mb-3">Supervisor: Dr. Tarek Sayed</p>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Research Achievements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-white text-sm ml-2">
                      <li>Developed a safest route system using real-time crash risk data derived from drone data.</li>
                      <li>Proposed a hazardous location identification system using conflict-based crash risk derived from a Bayesian Hierarchical Extreme Value model.</li>
                      <li>Applied autonomous vehicle data to estimate cyclist crash risk and proposed a cyclist routing system.</li>
                      <li>Utilized computer vision-derived data to optimize traffic signals using single and multi-agent reinforcement learning for both safety and mobility.</li>
                    </ul>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                    <div>
                      <Heading level={3} className="mb-1">MASc. in Transportation Engineering</Heading>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">University of British Columbia, Vancouver, Canada</p>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-sm mt-1 md:mt-0">2019–2021</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 italic">Thesis: Exploring the applications of connected vehicle data to real time safety optimization at isolated intersections</p>
                  <p className="text-gray-700 dark:text-white text-sm mb-3">Supervisor: Dr. Tarek Sayed</p>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Research Achievements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm ml-2">
                      <li>Optimized traffic conflicts by jointly issuing speed advisories to CAVs and optimizing traffic signals using reinforcement learning.</li>
                    </ul>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <Heading level={3} className="mb-1">BASc. in Civil Engineering</Heading>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">University of British Columbia, Vancouver, Canada</p>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-sm mt-1 md:mt-0">2014–2019</span>
                  </div>
                </Card>
              </div>
            </section>

            {/* Research Employment */}
            <section className="mb-6">
              <Heading level={2} className="mb-4">Research Employment and Projects</Heading>
              
              <Card className="mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div>
                    <Heading level={3} className="mb-1">Research Assistant</Heading>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">University of British Columbia, Bureau of Intelligent Transportation Systems and Mobility</p>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium text-sm mt-1 md:mt-0">Sep 2021-Present</span>
                </div>
              </Card>

              {/* Safety Modeling & Analysis */}
              <div className="mb-4">
                <Heading level={3} className="mb-3 text-lg">Safety Modeling & Analysis</Heading>
                <div className="space-y-3">
                  <Card>
                    <Heading level={4} className="mb-2">Safest Route Algorithm</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Designed a crash-risk–based routing algorithm to identify the safest paths in urban networks, comparing between the 
                      fastest and the safest routes.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <ImpactBadge text="Featured in Popular Science" />
                      <ImpactBadge text="Yahoo Finance Front Page" />
                      <ImpactBadge text="National Media Coverage" />
                    </div>
                    <PublicationBadge journal="Analytic Methods in Accident Research" status="published" />
                  </Card>

                  <Card>
                    <Heading level={4} className="mb-2">Hazardous Location Identification & Ranking</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Proposed a Bayesian Hierarchical Extreme Value modeling framework using drone-derived trajectories to proactively identify 
                      high-risk sites, enabling large-scale crash risk management.
                    </p>
                    <PublicationBadge journal="Analytic Methods in Accident Research" status="published" />
                  </Card>

                  <Card>
                    <Heading level={4} className="mb-2">Bayesian Spatial Modeling of Hazardous Locations</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Proposed a Bayesian Hierarchical Extreme Value model with spatial effects to examine the limitations of the existing 
                      approach within the literature. This study found that networks have a high degree of spatial correlation that must be 
                      modelled correctly to ensure that the correct hazardous locations are identified.
                    </p>
                    <PublicationBadge status="under-review" />
                  </Card>

                  <Card>
                    <Heading level={4} className="mb-2">Autonomous-Vehicle Cyclist Safety Assessment</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Built a risk-assessment tool using AV trajectory data and data augmentation to evaluate cyclist crash risk at a network 
                      scale.
                    </p>
                    <PublicationBadge journal="Accident Analysis and Prevention" status="published" />
                  </Card>
                </div>
              </div>

              {/* Reinforcement Learning & Control */}
              <div className="mb-4">
                <Heading level={3} className="mb-3 text-lg">Reinforcement Learning & Control</Heading>
                <div className="space-y-3">
                  <Card>
                    <Heading level={4} className="mb-2">Corridor-Level Signal and Trajectory Optimization</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Collaborated with Rogers Telecommunication and the Ministry of Transportation to propose a camera-based multi-agent RL 
                      system for corridor-level signal optimization, improving both vehicular and pedestrian safety.
                    </p>
                    <PublicationBadge status="under-review" />
                  </Card>

                  <Card>
                    <Heading level={4} className="mb-2">Real-Time Signal-Vehicle Coupled Control System</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Developed reinforcement-learning-based optimization algorithms using connected vehicle data to jointly optimize signal 
                      timing and vehicle speed advisories, reducing traffic conflicts by 50%.
                    </p>
                    <PublicationBadge journal="Accident Analysis and Prevention" status="published" />
                  </Card>
                </div>
              </div>

              {/* Computer Vision & AI */}
              <div className="mb-4">
                <Heading level={3} className="mb-3 text-lg">Computer Vision & AI</Heading>
                <div className="space-y-3">
                  <Card>
                    <Heading level={4} className="mb-2">Helmet Violation Detection</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Developed a YOLO + DCGAN–based vision framework for detecting helmet violations in dense urban motorcycle traffic, submitted 
                      to the 2023 AI City Challenge.
                    </p>
                    <PublicationBadge journal="Algorithms" status="published" />
                  </Card>

                  <Card>
                    <Heading level={4} className="mb-2">Fisheye Distortion Correction</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Developed a computer vision model to address severe fisheye distortion in traffic monitoring systems, enabling accurate 
                      object detection and tracking in wide-angle camera feeds. Submitted to the 2024 AI City Challenge.
                    </p>
                  </Card>

                  <Card>
                    <Heading level={4} className="mb-2">Traffic Safety Dense Video Captioning</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Applied vision–language models to automatically caption critical safety events in video data for the 2025 AI City Challenge.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Applied Research */}
              <div className="mb-4">
                <Heading level={3} className="mb-3 text-lg">Applied Research</Heading>
                <div className="space-y-3">
                  <Card>
                    <Heading level={4} className="mb-2">Cycling-Passing Distance Law</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Advised Provincial Government Authorities on minimum passing-distance legislation by performing a survival analysis 
                      on vehicle-cyclist interactions during conflicts. Produced a report identifying the impact of various factors 
                      influencing safety during lateral maneuvers.
                    </p>
                    <ImpactBadge text="Policy Impact: 2024 BC Motor Vehicle Act" />
                  </Card>

                  <Card>
                    <Heading level={4} className="mb-2">Automated Proactive Safety Assessment Tool</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Created a video-based safety assessment pipeline combining using computer vision to extract road-user trajectories and identify 
                      PET, MTTC, TTC, and DRAC near-misses with a high degree of accuracy. This tool was used to conduct road safety audits for various provincial and municipal authorities.
                    </p>
                  </Card>

                  <Card>
                    <Heading level={4} className="mb-2">Road Safety Audit in a Rural Indigenous Context</Heading>
                    <p className="text-gray-700 dark:text-white text-sm mb-2">
                      Performed a road safety audit for a rural indigenous community including conflict analysis and a before-and-after study.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            {/* Teaching Experience */}
            <section className="mb-6">
              <Heading level={2} className="mb-4">Teaching Experience</Heading>
              
              <Card>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <Heading level={3} className="mb-1">Senior Teaching Assistant</Heading>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">University of British Columbia</p>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium text-sm mt-1 md:mt-0">Sep 2021 – Present</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Graduate-level Teaching</h4>
                    <ul className="space-y-2 text-gray-700 dark:text-white text-sm">
                      <li>
                        <strong>Transportation Engineering Impacts & Empirical Bayes (CIVL 582):</strong> Delivered guest lectures annually 
                        on Bayesian statistics and traffic safety applications; marked assignments and exams; held office hours for MSc/PhD 
                        students. (Class Size: 5-12 Students, 2021-Present)
                      </li>
                      <li>
                        <strong>Urban Systems Project Delivery & Economics (URSY 540):</strong> Assisted with course delivery for Master 
                        of Engineering Leadership students (2021–2022), including grading and feedback on project-based coursework. 
                        (Class Size: 9 Students, 2021-2022)
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Undergraduate Teaching</h4>
                    <ul className="space-y-2 text-gray-700 dark:text-white text-sm">
                      <li>
                        <strong>Transportation Engineering I (CIVL 340):</strong> Delivered guest lectures, marked assignments and final 
                        exams, and provided office-hour support. (Class Size: 145-160 Students, 2021–2022, 2023–2024)
                      </li>
                      <li>
                        <strong>Engineering Capstone Project (CIVL 445/446):</strong> Assessed senior undergraduate term presentations, 
                        marked deliverables, and provided detailed feedback. During faculty sabbatical, independently advised students on 
                        transportation engineering components of their designs. Provided general advising and feedback in other years for 
                        all projects. (Class Size: 112-160 Students, 2021-Present)
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            {/* Awards */}
            <section className="mb-6">
              <Heading level={2} className="mb-4">Awards and Prizes</Heading>
              <Card>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex justify-between items-start">
                    <span>BPOC Graduate Excellence Award</span>
                    <span className="text-gray-600 dark:text-white font-medium ml-4">2025</span>
                  </li>
                  <li className="flex justify-between items-start">
                    <span>3-Minute Thesis Winner (Civil Engineering), Top 5 Finalist (University-wide)</span>
                    <span className="text-gray-600 dark:text-white font-medium ml-4">2025</span>
                  </li>
                  <li className="flex justify-between items-start">
                    <span>President&apos;s Academic Excellence Initiative PhD Award</span>
                    <span className="text-gray-600 dark:text-white font-medium ml-4">2021-2025</span>
                  </li>
                  <li className="flex justify-between items-start">
                    <span>British Columbia Graduate Scholarship</span>
                    <span className="text-gray-600 dark:text-white font-medium ml-4">2022</span>
                  </li>
                  <li className="flex justify-between items-start">
                    <span>TAC Foundation IBI Group Scholarship</span>
                    <span className="text-gray-600 dark:text-white font-medium ml-4">2022</span>
                  </li>
                  <li className="flex justify-between items-start">
                    <span>Civil Engineering Excellence Scholarship (CIV-EX)</span>
                    <span className="text-gray-600 dark:text-white font-medium ml-4">2021</span>
                  </li>
                </ul>
              </Card>
            </section>

            {/* Publications */}
            <section className="mb-6">
              <Heading level={2} className="mb-4">Publications</Heading>
              <Card>
                <p className="text-gray-700 dark:text-white text-sm mb-3">
                  For a complete list of publications, including abstracts, citations, and links to papers, please visit the publications page.
                </p>
                <Link href="/publications" className="font-medium">
                  View All Publications →
                </Link>
              </Card>
            </section>
          </div>
        </div>
      </Section>
    </div>
  );
}
