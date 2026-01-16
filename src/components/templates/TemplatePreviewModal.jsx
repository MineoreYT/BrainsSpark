/**
 * TemplatePreviewModal Component
 * Modal for previewing template questions before using
 */

export default function TemplatePreviewModal({ 
  isOpen, 
  onClose, 
  template,
  onUse 
}) {
  if (!isOpen || !template) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{template.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {template.category} • {template.questionCount} questions • {template.totalPoints} points
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Template Info */}
          {template.description && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600">{template.description}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{template.questionCount}</p>
              <p className="text-xs text-blue-600">Questions</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{template.totalPoints}</p>
              <p className="text-xs text-green-600">Total Points</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{template.passingGrade}%</p>
              <p className="text-xs text-purple-600">Passing Grade</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{template.timesUsed || 0}</p>
              <p className="text-xs text-orange-600">Times Used</p>
            </div>
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Questions Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Questions Preview</h4>
            <div className="space-y-4">
              {template.questions.map((question, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          question.type === 'multiple-choice' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Text Answer'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium mb-2">{question.question}</p>
                      
                      {question.type === 'multiple-choice' && question.options && (
                        <div className="space-y-1.5 mt-2">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                                optIndex === question.correctAnswer
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-white text-gray-600 border border-gray-200'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                optIndex === question.correctAnswer
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-gray-300'
                              }">
                                {optIndex === question.correctAnswer && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </span>
                              <span>{option}</span>
                              {optIndex === question.correctAnswer && (
                                <span className="ml-auto text-xs text-green-600 font-medium">Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'enumeration' && (
                        <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm">
                          <span className="text-green-700 font-medium">Answer: </span>
                          <span className="text-green-800">{question.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex flex-wrap gap-4">
              <span>Created by: {template.createdByName || 'Teacher'}</span>
              <span>Created: {formatDate(template.createdAt)}</span>
              {template.updatedAt && (
                <span>Updated: {formatDate(template.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Close
          </button>
          <button
            onClick={() => { onUse(template); onClose(); }}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
}
