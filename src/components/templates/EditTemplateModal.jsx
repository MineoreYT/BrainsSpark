import { useState, useEffect } from 'react';
import { updateTemplate } from '../../services/templateService';
import { sanitizeText } from '../../utils/sanitize';

const CATEGORIES = [
  'Mathematics',
  'Science',
  'English/Language Arts',
  'History/Social Studies',
  'Geography',
  'Computer Science',
  'Art & Music',
  'Physical Education',
  'Foreign Languages',
  'General Knowledge',
  'Other'
];

function EditTemplateModal({ 
  isOpen, 
  onClose, 
  template,
  onSuccess 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General Knowledge');
  const [tags, setTags] = useState('');
  const [questions, setQuestions] = useState([]);
  const [gradingScale, setGradingScale] = useState('traditional');
  const [passingGrade, setPassingGrade] = useState(70);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setDescription(template.description || '');
      setCategory(template.category || 'General Knowledge');
      setTags(template.tags ? template.tags.join(', ') : '');
      setQuestions(template.questions ? JSON.parse(JSON.stringify(template.questions)) : []);
      setGradingScale(template.gradingScale || 'traditional');
      setPassingGrade(template.passingGrade || 70);
    }
  }, [template]);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].type === 'multiple-choice') {
      newQuestions[qIndex].correctAnswer = parseInt(value);
    } else {
      newQuestions[qIndex].correctAnswer = value;
    }
    setQuestions(newQuestions);
  };

  const handlePointsChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].points = Math.max(1, parseInt(value) || 1);
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (index, type) => {
    const newQuestions = [...questions];
    const currentPoints = newQuestions[index].points || 1;
    const currentQuestion = newQuestions[index].question;
    
    if (type === 'enumeration') {
      newQuestions[index] = { 
        type: 'enumeration', 
        question: currentQuestion, 
        correctAnswer: '', 
        points: currentPoints 
      };
    } else {
      newQuestions[index] = { 
        type: 'multiple-choice', 
        question: currentQuestion, 
        options: ['', '', '', ''], 
        correctAnswer: 0, 
        points: currentPoints 
      };
    }
    setQuestions(newQuestions);
  };

  const handleAddQuestion = (type = 'multiple-choice') => {
    // Enforce maximum question limit (matches Firestore rules)
    if (questions.length >= 100) {
      setError('Maximum 100 questions allowed per template');
      return;
    }

    if (type === 'enumeration') {
      setQuestions([...questions, { type: 'enumeration', question: '', correctAnswer: '', points: 1 }]);
    } else {
      setQuestions([...questions, { type: 'multiple-choice', question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]);
    }
    
    // Clear error if it was about max questions
    if (error.includes('Maximum 100 questions')) {
      setError('');
    }
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    // Validate questions
    const isValid = questions.every(q => {
      if (!q.question.trim()) return false;
      if (q.type === 'multiple-choice') {
        return q.options.every(o => o.trim());
      } else {
        return q.correctAnswer.toString().trim();
      }
    });

    if (!isValid) {
      setError('Please fill in all questions and answers');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Sanitize inputs
      const sanitizedName = sanitizeText(name.trim(), 200);
      const sanitizedDescription = sanitizeText(description.trim(), 1000);
      const sanitizedQuestions = questions.map(q => ({
        type: q.type || 'multiple-choice',
        question: sanitizeText(q.question, 500),
        options: q.type === 'multiple-choice' ? q.options.map(opt => sanitizeText(opt, 200)) : [],
        correctAnswer: q.correctAnswer,
        points: q.points || 1
      }));

      const tagsArray = tags
        .split(',')
        .map(tag => sanitizeText(tag.trim(), 50))
        .filter(tag => tag.length > 0);

      const totalPoints = sanitizedQuestions.reduce((sum, q) => sum + (q.points || 1), 0);

      const updates = {
        name: sanitizedName,
        description: sanitizedDescription,
        category,
        tags: tagsArray,
        questions: sanitizedQuestions,
        gradingScale,
        passingGrade,
        totalPoints,
        questionCount: sanitizedQuestions.length,
        updatedAt: new Date()
      };

      await updateTemplate(template.id, updates);
      
      if (onSuccess) {
        onSuccess({ ...template, ...updates });
      }
      
      handleClose();
    } catch (err) {
      console.error('Error updating template:', err);
      setError(err.message || 'Failed to update template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCategory('General Knowledge');
    setTags('');
    setQuestions([]);
    setGradingScale('traditional');
    setPassingGrade(70);
    setError('');
    onClose();
  };

  if (!isOpen || !template) return null;

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Edit Template</h3>
            <p className="text-sm text-gray-500 mt-1">
              Update your template details and questions
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chapter 5 Quiz Template"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this template..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., biology, plants, photosynthesis"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Grading Configuration */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Grading Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grading Scale</label>
                  <select
                    value={gradingScale}
                    onChange={(e) => setGradingScale(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="traditional">Traditional A-F</option>
                    <option value="plusMinus">Plus/Minus System</option>
                    <option value="passFail">Pass/Fail</option>
                    <option value="excellent">Excellence Scale</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Grade (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={passingGrade}
                    onChange={(e) => setPassingGrade(parseInt(e.target.value) || 70)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Questions ({questions.length}/100)</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddQuestion('multiple-choice')}
                    disabled={questions.length >= 100}
                    className={`px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm ${
                      questions.length >= 100 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    + Multiple Choice
                  </button>
                  <button
                    onClick={() => handleAddQuestion('enumeration')}
                    disabled={questions.length >= 100}
                    className={`px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm ${
                      questions.length >= 100 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    + Text Answer
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {qIndex + 1}
                        </span>
                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="enumeration">Text Answer</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <label className="text-xs text-gray-500">Points:</label>
                          <input
                            type="number"
                            min="1"
                            value={question.points || 1}
                            onChange={(e) => handlePointsChange(qIndex, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        {questions.length > 1 && (
                          <button
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                      <textarea
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                        placeholder="Enter your question..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                        maxLength={500}
                      />
                    </div>

                    {/* Options for Multiple Choice */}
                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600">Options (select correct answer)</label>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                              className="w-4 h-4 text-green-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                              maxLength={200}
                              className={`flex-1 px-3 py-1.5 border rounded-lg text-sm ${
                                question.correctAnswer === oIndex 
                                  ? 'border-green-300 bg-green-50' 
                                  : 'border-gray-300'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer for Enumeration */}
                    {question.type === 'enumeration' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Correct Answer</label>
                        <input
                          type="text"
                          value={question.correctAnswer}
                          onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                          placeholder="Enter the correct answer..."
                          maxLength={200}
                          className="w-full px-3 py-2 border border-green-300 bg-green-50 rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Question Buttons - Bottom */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleAddQuestion('multiple-choice')}
                  disabled={questions.length >= 100}
                  className={`flex-1 py-2.5 border-2 border-dashed rounded-lg transition font-medium text-sm ${
                    questions.length >= 100 
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                      : 'border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  + Add Multiple Choice
                </button>
                <button
                  onClick={() => handleAddQuestion('enumeration')}
                  disabled={questions.length >= 100}
                  className={`flex-1 py-2.5 border-2 border-dashed rounded-lg transition font-medium text-sm ${
                    questions.length >= 100 
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                      : 'border-green-300 text-green-600 hover:border-green-500 hover:bg-green-50'
                  }`}
                >
                  + Add Text Answer
                </button>
              </div>

              {/* Summary */}
              <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700 mt-4">
                Total: {questions.length} questions • {totalPoints} points
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || questions.length === 0}
            className={`flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2 ${
              (saving || !name.trim() || questions.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTemplateModal;
