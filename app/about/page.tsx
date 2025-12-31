export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Research & Background</h1>

        {/* Education */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Education</h2>
          
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">PhD. in Transportation Engineering</h3>
                  <p className="text-gray-700">University of British Columbia, Vancouver, Canada</p>
                </div>
                <span className="text-gray-600 font-medium mt-2 md:mt-0">2021–(Expected May 2026)</span>
              </div>
              <p className="text-gray-700 mb-4 italic">Thesis: Real-Time Crash Risk and its Applications</p>
              <p className="text-gray-700 mb-2">Supervisor: Dr. Tarek Sayed</p>
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Research Achievements:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Developed a safest route system using real-time crash risk data derived from drone data.</li>
                  <li>Proposed a hazardous location identification system using conflict-based crash risk derived from a Bayesian Hierarchical Extreme Value model.</li>
                  <li>Applied autonomous vehicle data to estimate cyclist crash risk and proposed a cyclist routing system.</li>
                  <li>Utilized computer vision-derived data to optimize traffic signals using single and multi-agent reinforcement learning for both safety and mobility.</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">MASc. in Transportation Engineering</h3>
                  <p className="text-gray-700">University of British Columbia, Vancouver, Canada</p>
                </div>
                <span className="text-gray-600 font-medium mt-2 md:mt-0">2019–2021</span>
              </div>
              <p className="text-gray-700 mb-4 italic">Thesis: Exploring the applications of connected vehicle data to real time safety optimization at isolated intersections</p>
              <p className="text-gray-700 mb-2">Supervisor: Dr. Tarek Sayed</p>
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Research Achievements:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Optimized traffic conflicts by jointly issuing speed advisories to CAVs and optimizing traffic signals using reinforcement learning.</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">BASc. in Civil Engineering</h3>
                  <p className="text-gray-700">University of British Columbia, Vancouver, Canada</p>
                </div>
                <span className="text-gray-600 font-medium mt-2 md:mt-0">2014–2019</span>
              </div>
            </div>
          </div>
        </section>

        {/* Research Employment */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Research Employment and Projects</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Research Assistant</h3>
                <p className="text-gray-700">University of British Columbia, Bureau of Intelligent Transportation Systems and Mobility</p>
              </div>
              <span className="text-gray-600 font-medium mt-2 md:mt-0">Sep 2021-Present</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Cycling-Passing Distance Law</h4>
              <p className="text-gray-700">
                Advised Provincial Government Authorities on minimum passing-distance legislation by performing a survival analysis 
                on vehicle-cyclist interactions during conflicts and produced a report detailing the impact of various factors 
                influencing safety during lateral maneuvers. This resulted in recommendations adopted into the 2024 BC Motor Vehicle Act.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Safest Route Algorithm</h4>
              <p className="text-gray-700">
                Designed a crash-risk–based routing algorithm to identify the safest paths in urban networks, comparing between the 
                fastest and the safest routes. This work was featured in Popular Science, was on the front page of Yahoo Finance, 
                and received national media coverage. This was published in Analytic Methods in Accident Research.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Corridor-Level Signal and Trajectory Optimization</h4>
              <p className="text-gray-700">
                Collaborated with Rogers Telecommunication and the Ministry of Transportation to propose a camera-based multi-agent RL 
                system for corridor-level signal optimization, improving both vehicular and pedestrian safety.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Autonomous-Vehicle Cyclist Safety Assessment</h4>
              <p className="text-gray-700">
                Built a risk-assessment tool using AV trajectory data and data augmentation to evaluate cyclist crash risk at a network 
                scale. This was published in Accident Analysis and Prevention.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Hazardous Location Identification & Ranking</h4>
              <p className="text-gray-700">
                Proposed a Bayesian Hierarchical Extreme Value modeling framework using drone-derived trajectories to proactively identify 
                high-risk sites, enabling large-scale crash risk management. This was published in Analytic Methods in Accident Research.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Bayesian Spatial Modeling of Hazardous Locations</h4>
              <p className="text-gray-700">
                Proposed a Bayesian Hierarchical Extreme Value model with spatial effects to examine the limitations of the existing 
                approach within the literature. This study found that networks have a high degree of spatial correlation that must be 
                modelled correctly to ensure that the correct hazardous locations are identified. This study is currently under review.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Real-Time Signal-Vehicle Coupled Control System</h4>
              <p className="text-gray-700">
                Developed reinforcement-learning-based optimization algorithms using connected vehicle data to jointly optimize signal 
                timing and vehicle speed advisories, reducing traffic conflicts by 50%. This was published in Accident Analysis and Prevention.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Automated Proactive Safety Assessment Tool</h4>
              <p className="text-gray-700">
                Created a video-based safety assessment pipeline combining using computer vision to extract road-user trajectories and identify 
                PET, MTTC, TTC, and DRAC near-misses with a high degree of accuracy. This tool was used to conduct road safety audits for the 
                Ministry of Transportation and Transit and the BC Center for Disease Control.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Road Safety Audit in a Rural Indigenous Context</h4>
              <p className="text-gray-700">
                Performed a road safety audit for a rural indigenous community including conflict analysis and a before-and-after study.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Helmet Violation Detection</h4>
              <p className="text-gray-700">
                Developed a YOLO + DCGAN–based vision framework for detecting helmet violations in dense urban motorcycle traffic, submitted 
                to the 2023 AI City Challenge. This was published in Algorithms.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Traffic Safety Dense Video Captioning</h4>
              <p className="text-gray-700">
                Applied vision–language models to automatically caption critical safety events in video data for the 2025 AI City Challenge.
              </p>
            </div>
          </div>
        </section>

        {/* Teaching Experience */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Teaching Experience</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Senior Teaching Assistant</h3>
                <p className="text-gray-700">University of British Columbia</p>
              </div>
              <span className="text-gray-600 font-medium mt-2 md:mt-0">Sep 2021 – Present</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Graduate-level Teaching</h4>
                <ul className="space-y-2 text-gray-700">
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
                <h4 className="font-semibold text-gray-900 mb-2">Undergraduate Teaching</h4>
                <ul className="space-y-2 text-gray-700">
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
          </div>
        </section>

        {/* Awards */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Awards and Prizes</h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <ul className="space-y-3 text-gray-700">
              <li className="flex justify-between">
                <span>BPOC Graduate Excellence Award</span>
                <span className="text-gray-600">2025</span>
              </li>
              <li className="flex justify-between">
                <span>3-Minute Thesis Winner (Civil Engineering), Top 5 Finalist (University-wide)</span>
                <span className="text-gray-600">2025</span>
              </li>
              <li className="flex justify-between">
                <span>President&apos;s Academic Excellence Initiative PhD Award</span>
                <span className="text-gray-600">2021-2025</span>
              </li>
              <li className="flex justify-between">
                <span>British Columbia Graduate Scholarship</span>
                <span className="text-gray-600">2022</span>
              </li>
              <li className="flex justify-between">
                <span>TAC Foundation IBI Group Scholarship</span>
                <span className="text-gray-600">2022</span>
              </li>
              <li className="flex justify-between">
                <span>Civil Engineering Excellence Scholarship (CIV-EX)</span>
                <span className="text-gray-600">2021</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}



