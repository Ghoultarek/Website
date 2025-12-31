'use client';

import { useState } from 'react';
import { publications, Publication } from '@/data/publications';
import PublicationCard from '@/components/PublicationCard';

export default function Publications() {
  const [filter, setFilter] = useState<'all' | 'published' | 'under-review' | 'submitted'>('all');

  const filteredPublications = publications.filter(pub => {
    if (filter === 'all') return true;
    if (filter === 'under-review') return pub.status === 'under-review' || pub.status === 'submitted';
    return pub.status === filter;
  });

  const publishedCount = publications.filter(p => p.status === 'published').length;
  const underReviewCount = publications.filter(p => p.status === 'under-review' || p.status === 'submitted').length;

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Publications</h1>
          <p className="text-lg text-gray-700">
            Research contributions in transportation safety, AI, and intelligent transportation systems
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({publications.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'published'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setFilter('under-review')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'under-review'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Under Review ({underReviewCount})
          </button>
        </div>

        {/* Publications List */}
        <div className="space-y-6">
          {filteredPublications.map((publication) => (
            <PublicationCard key={publication.id} publication={publication} />
          ))}
        </div>

        {/* Google Scholar Link */}
        <div className="mt-12 text-center">
          <a
            href="https://scholar.google.com/citations?user=-vy503AAAAAJ&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-3xl font-semibold hover:bg-primary-700 transition-colors"
          >
            View on Google Scholar →
          </a>
        </div>
      </div>
    </div>
  );
}





