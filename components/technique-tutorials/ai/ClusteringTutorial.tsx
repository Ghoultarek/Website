'use client';

import { useState, useMemo } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import KNNDemo from './KNNDemo';
import KMeansDemo from './KMeansDemo';
import DBSCANDemo from './DBSCANDemo';
import HDBSCANDemo from './HDBSCANDemo';
import FuzzyCMeansDemo from './FuzzyCMeansDemo';
import ClusteringComparison from './ClusteringComparison';

interface Point {
  x: number;
  y: number;
}

export default function ClusteringTutorial() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Generate shared data for K-Means
  const kMeansData = useMemo<Point[]>(() => {
    const data: Point[] = [];
    const centers = [
      { x: 2, y: 2 },
      { x: 8, y: 8 },
      { x: 2, y: 8 },
    ];
    
    centers.forEach((center) => {
      for (let i = 0; i < 30; i++) {
        data.push({
          x: center.x + (Math.random() - 0.5) * 3,
          y: center.y + (Math.random() - 0.5) * 3,
        });
      }
    });
    return data;
  }, []);

  // Generate shared data for KNN and Fuzzy C-Means (overlapping classes)
  const knnData = useMemo<Point[]>(() => {
    const data: Point[] = [];
    // Class 0: more spread out, centered around (3, 4)
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 3.5;
      data.push({
        x: 3 + radius * Math.cos(angle) + (Math.random() - 0.5) * 1.5,
        y: 4 + radius * Math.sin(angle) + (Math.random() - 0.5) * 1.5,
      });
    }
    // Class 1: more spread out, centered around (7, 6)
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 3.5;
      data.push({
        x: 7 + radius * Math.cos(angle) + (Math.random() - 0.5) * 1.5,
        y: 6 + radius * Math.sin(angle) + (Math.random() - 0.5) * 1.5,
      });
    }
    // Add some overlapping points in the middle
    for (let i = 0; i < 10; i++) {
      data.push({
        x: Math.random() * 3 + 4,
        y: Math.random() * 3 + 4,
      });
    }
    return data;
  }, []);

  // Generate shared data for DBSCAN and HDBSCAN
  const dbscanData = useMemo<Point[]>(() => {
    const data: Point[] = [];
    
    // Cluster 1
    for (let i = 0; i < 20; i++) {
      data.push({
        x: 2 + (Math.random() - 0.5) * 2,
        y: 2 + (Math.random() - 0.5) * 2,
      });
    }
    
    // Cluster 2
    for (let i = 0; i < 20; i++) {
      data.push({
        x: 7 + (Math.random() - 0.5) * 2,
        y: 7 + (Math.random() - 0.5) * 2,
      });
    }
    
    // Noise points
    for (let i = 0; i < 10; i++) {
      data.push({
        x: Math.random() * 10,
        y: Math.random() * 10,
      });
    }
    
    return data;
  }, []);

  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'knn', title: 'K-Nearest Neighbors' },
    { id: 'kmeans', title: 'K-Means' },
    { id: 'dbscan', title: 'DBSCAN' },
    { id: 'hdbscan', title: 'HDBSCAN' },
    { id: 'fuzzy', title: 'Fuzzy C-Means' },
    { id: 'comparison', title: 'Comparison' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Fundamentals: Clustering</h1>
        <p className="text-lg text-gray-700">
          Explore clustering algorithms: KNN, K-means, DBSCAN, HDBSCAN, and Fuzzy C-means. Visualize how they work 
          and see their implementations.
        </p>
      </div>

      {/* Navigation */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                const element = document.getElementById(section.id);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveSection(section.id);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Introduction Section */}
      <section id="intro" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction to Clustering</h2>
          
          <div className="prose max-w-none mb-6">
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-5 mb-6">
              <p className="text-gray-800 mb-4 leading-relaxed">
                Clustering is an unsupervised learning technique that groups similar data points together. Unlike 
                classification, clustering doesn't require labeled data - it discovers patterns and structures in 
                the data automatically.
              </p>
              
              <p className="text-gray-800 mb-4 leading-relaxed">
                This tutorial covers five important clustering algorithms, each with different strengths and use cases. 
                We'll use libraries (scikit-learn, hdbscan) but also visualize the clustering process and show simplified 
                implementations to understand how they work.
              </p>
              
              <p className="text-gray-800 mb-4 leading-relaxed font-semibold">
                Algorithms Covered:
              </p>
              
              <ul className="list-disc list-inside text-gray-800 space-y-2 mb-4 ml-4">
                <li><strong>KNN:</strong> <em>(Not technically clustering)</em> Supervised classification algorithm that demonstrates distance-based methods</li>
                <li><strong>K-Means:</strong> Partitional clustering with fixed number of clusters</li>
                <li><strong>DBSCAN:</strong> Density-based clustering, finds clusters of arbitrary shape</li>
                <li><strong>HDBSCAN:</strong> Hierarchical DBSCAN, finds clusters of varying densities</li>
                <li><strong>Fuzzy C-Means:</strong> Soft clustering where points belong to multiple clusters</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">When to Use Clustering</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Customer segmentation and market research</li>
                <li>Image segmentation and computer vision</li>
                <li>Anomaly detection (outliers don't belong to any cluster)</li>
                <li>Data exploration and pattern discovery</li>
                <li>Feature engineering (cluster labels as features)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* KNN Section */}
      <section id="knn" className="mb-12 scroll-mt-8">
        <KNNDemo data={knnData} />
      </section>

      {/* K-Means Section */}
      <section id="kmeans" className="mb-12 scroll-mt-8">
        <KMeansDemo data={kMeansData} />
      </section>

      {/* DBSCAN Section */}
      <section id="dbscan" className="mb-12 scroll-mt-8">
        <DBSCANDemo data={dbscanData} />
      </section>

      {/* HDBSCAN Section */}
      <section id="hdbscan" className="mb-12 scroll-mt-8">
        <HDBSCANDemo data={dbscanData} />
      </section>

      {/* Fuzzy C-Means Section */}
      <section id="fuzzy" className="mb-12 scroll-mt-8">
        <FuzzyCMeansDemo data={knnData} />
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="mb-12 scroll-mt-8">
        <ClusteringComparison />
      </section>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
        <p className="text-gray-700 text-sm mb-4">
          Now that you understand clustering algorithms, you can explore:
        </p>
        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
          <li>Cluster evaluation metrics (silhouette score, Davies-Bouldin index)</li>
          <li>Dimensionality reduction before clustering (PCA, t-SNE)</li>
          <li>Hierarchical clustering (agglomerative, divisive)</li>
          <li>Clustering for high-dimensional data</li>
          <li>Combining clustering with other ML techniques</li>
        </ul>
      </div>
    </div>
  );
}

