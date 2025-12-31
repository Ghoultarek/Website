import dynamic from 'next/dynamic';

const RoutingAlgorithmsDemo = dynamic(
  () => import('@/components/routing-algorithms/RoutingAlgorithmsDemo'),
  { ssr: false }
);

export default function RoutingAlgorithmsPage() {
  return (
    <div className="min-h-screen bg-beige-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RoutingAlgorithmsDemo />
      </div>
    </div>
  );
}


