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

  const statusBadgeDark = {
    'published': { label: 'Published', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
    'under-review': { label: 'Under Review', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' },
    'submitted': { label: 'Submitted', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
  };

  const badgeDark = statusBadgeDark[publication.status];

  return (
    <div className="bg-white dark:bg-[#171717] rounded-3xl shadow-md dark:shadow-gray-900/50 p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover-lift animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 pr-4">
          {publication.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badgeDark.color}`}>
          {badgeDark.label}
        </span>
      </div>
      
      <p className="text-gray-700 dark:text-white mb-2 italic">{publication.authors}</p>
      
      <div className="text-sm text-gray-600 dark:text-white mb-3">
        {publication.journal && (
          <p className="font-medium">{publication.journal}</p>
        )}
        {publication.conference && (
          <p className="font-medium">{publication.conference}</p>
        )}
        <p>{publication.year}</p>
      </div>

      {publication.contribution && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-white">
            <span className="font-semibold dark:text-white">Contribution: </span>
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
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            View Paper →
          </a>
        )}
        {publication.doi && (
          <a
            href={`https://doi.org/${publication.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-white"
          >
            DOI: {publication.doi}
          </a>
        )}
      </div>
    </div>
  );
}

