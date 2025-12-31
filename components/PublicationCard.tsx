import { Publication } from '@/data/publications';

interface PublicationCardProps {
  publication: Publication;
}

export default function PublicationCard({ publication }: PublicationCardProps) {
  const statusBadge = {
    'published': { label: 'Published', color: 'bg-green-100 text-green-800' },
    'under-review': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
    'submitted': { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  };

  const badge = statusBadge[publication.status];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover-lift animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
          {publication.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badge.color}`}>
          {badge.label}
        </span>
      </div>
      
      <p className="text-gray-700 mb-2 italic">{publication.authors}</p>
      
      <div className="text-sm text-gray-600 mb-3">
        {publication.journal && (
          <p className="font-medium">{publication.journal}</p>
        )}
        {publication.conference && (
          <p className="font-medium">{publication.conference}</p>
        )}
        <p>{publication.year}</p>
      </div>

      {publication.contribution && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Contribution: </span>
            {publication.contribution}
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        {publication.doi && (
          <a
            href={publication.url || `https://doi.org/${publication.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View Paper →
          </a>
        )}
        {publication.doi && (
          <a
            href={`https://doi.org/${publication.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            DOI: {publication.doi}
          </a>
        )}
      </div>
    </div>
  );
}

