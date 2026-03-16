import CopyButton from './CopyButton';

const OutputSection = ({ title, content, showCopy = true }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {showCopy && content && <CopyButton text={content} />}
      </div>

      <div className="bg-white border border-gray-200 rounded p-4 text-gray-700 whitespace-pre-wrap min-h-[80px]">
        {content || (
          <span className="text-gray-400 italic">
            Output will appear here...
          </span>
        )}
      </div>
    </div>
  );
};

export default OutputSection;