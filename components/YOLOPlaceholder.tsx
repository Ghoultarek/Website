export default function YOLOPlaceholder() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 animate-fade-in">
      <div className="text-center py-12">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">YOLO Annotation Viewer</h2>
        <p className="text-gray-700 mb-4 max-w-2xl mx-auto">
          This section will feature an interactive viewer for YOLO (You Only Look Once) object detection annotations 
          from traffic safety video analysis. The tool will allow you to explore detected road users, vehicles, and 
          safety events in video data.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-blue-800">
            <strong>Coming Soon:</strong> This interactive tool is currently under development and will be available 
            in a future update. It will showcase computer vision applications for transportation safety, including 
            helmet violation detection, road user tracking, and conflict identification.
          </p>
        </div>
        <div className="mt-6 text-sm text-gray-600">
          <p>Related Research:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Helmet Violation Detection using YOLOv8 and DCGAN (Algorithms, 2024)</li>
            <li>Traffic Safety Dense Video Captioning (AI City Challenge, 2025)</li>
            <li>Automated Proactive Safety Assessment Tool</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

