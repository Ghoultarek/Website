export interface Publication {
  id: string;
  title: string;
  authors: string;
  journal?: string;
  conference?: string;
  year: number;
  doi?: string;
  url?: string;
  status: 'published' | 'under-review' | 'submitted';
  contribution?: string;
}

export const publications: Publication[] = [
  {
    id: 'cyclist-safety-av',
    title: 'Cyclist safety assessment using autonomous vehicles',
    authors: 'Ghoul, T., Sayed, T.',
    journal: 'Accident Analysis and Prevention',
    year: 2025,
    doi: '10.1016/j.aap.2025.107923',
    url: 'https://doi.org/10.1016/j.aap.2025.107923',
    status: 'published',
  },
  {
    id: 'real-time-crash-risk-its',
    title: 'Exploring the Potential of Real-Time Crash Risk-Based Intelligent Transportation Systems on Urban Networks',
    authors: 'Ghoul, T., Sayed, T.',
    conference: 'Proceedings of the Canadian Society for Civil Engineering Annual Conference 2024',
    year: 2024,
    status: 'published',
  },
  {
    id: 'helmet-violation',
    title: 'Enforcing Traffic Safety: A Deep Learning Approach for Detecting Motorcyclists\' Helmet Violations Using YOLOv8 and Deep Convolutional Generative Adversarial Network-Generated Images',
    authors: 'Shoman, M., Ghoul, T., Lanzaro, G. Alsharif, T., Gargoum, S. Sayed, T.',
    journal: 'Algorithms',
    year: 2024,
    doi: '10.3390/a17050202',
    url: 'https://doi.org/10.3390/a17050202',
    status: 'published',
  },
  {
    id: 'safest-route',
    title: 'Real-time safest route identification: Examining the trade-off between safest and fastest routes',
    authors: 'Ghoul, T., Sayed, T., Fu, C.',
    journal: 'Analytic Methods in Accident Research',
    year: 2023,
    doi: '10.1016/j.amar.2023.100277',
    url: 'https://doi.org/10.1016/j.amar.2023.100277',
    status: 'published',
  },
  {
    id: 'hazardous-locations',
    title: 'Dynamic identification of short-term and longer-term hazardous locations using a conflict-based real-time extreme value safety model',
    authors: 'Ghoul, T., Sayed, T., Fu, C.',
    journal: 'Analytic Methods in Accident Research',
    year: 2023,
    doi: '10.1016/j.amar.2022.100262',
    url: 'https://doi.org/10.1016/j.amar.2022.100262',
    status: 'published',
  },
  {
    id: 'signal-vehicle-control',
    title: 'Real-time signal-vehicle coupled control: An application of connected vehicle data to improve intersection safety',
    authors: 'Ghoul, T., Sayed, T.',
    journal: 'Accident Analysis and Prevention',
    year: 2021,
    doi: '10.1016/j.aap.2021.106389',
    url: 'https://doi.org/10.1016/j.aap.2021.106389',
    status: 'published',
  },
  {
    id: 'spatial-correlation-bhev',
    title: 'Incorporating Spatial Correlation into the Bayesian Hierarchical Extreme Value Crash Risk Model for Network-Level Analysis',
    authors: 'Ghoul, T., Depeng, N., Sayed, T.',
    year: 2025,
    status: 'under-review',
  },
  {
    id: 'continuous-control-rl',
    title: 'Continuous Control using Reinforcement Learning for Safety-Based Traffic Signal Optimization',
    authors: 'Ghoul, T., Sayed, T.',
    year: 2025,
    status: 'under-review',
  },
];

export const stats = {
  citations: 136,
  hIndex: 5,
  publications: publications.filter(p => p.status === 'published').length,
  underReview: publications.filter(p => p.status === 'under-review' || p.status === 'submitted').length,
};





