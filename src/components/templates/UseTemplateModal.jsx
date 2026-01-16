/**
 * UseTemplateModal Component
 * Modal for creating a quiz from a template with ability to edit questions
 */

import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { sanitizeText } from '../../utils/sanitize';
import { logError } from '../../utils/logger';

export default function UseTemplateModal({ 
  isOpen, 
  onClose, 
  template, 
  classes,
  onSuccess 
}) {
  const [title, setTitle] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState([]);
  const [showEditQuestions, setShowEditQuestions] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setTitle(template.name?.replace(' Template', '') || '');
      setQuestions(template.questions ? JSON.parse(JSON.stringify(template.questions)) : []);
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

  const handleAddQuestion = (type = 'multiple-choice') => {
    // Enforce maximum question limit (matches Firestore rules)
    if (questions.length >= 100) {
      setError('Maximum 100 questions allowed per quiz');
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

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }

    if (!selectedClassId) {
      setError('Please select a class');
      return;
    }

    // Check authentication
    if (!auth.currentUser) {
      setError('You must be logged in to create a quiz');
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

    setCreating(true);
    setError('');

    try {
      // Sanitize questions
      const sanitizedQuestions = questions.map(q => ({
        type: q.type || 'multiple-choice',
        question: sanitizeText(q.question, 500),
        options: q.type === 'multiple-choice' ? q.options.map(opt => sanitizeText(opt, 200)) : [],
        correctAnswer: q.correctAnswer,
        points: q.points || 1
      }));

      const totalPoints = sanitizedQuestions.reduce((sum, q) => sum + (q.points || 1), 0);

      // Create quiz directly with edited questions
      const quiz = {
        title: sanitizeText(title.trim(), 200),
        questions: sanitizedQuestions,
        classId: selectedClassId,
        deadline: deadline || null,
        gradingScale: template.gradingScale || 'traditional',
        passingGrade: template.passingGrade || 70,
        totalPoints: totalPoints,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        createdFromTemplate: template.id
      };

      const quizRef = await addDoc(collection(db, 'quizzes'), quiz);
      
      // Update template usage statistics
      try {
        await updateDoc(doc(db, 'templates', template.id), {
          timesUsed: increment(1),
          lastUsedAt: serverTimestamp()
        });

        // Log template usage for analytics
        await addDoc(collection(db, 'templateUsage'), {
          templateId: template.id,
          usedBy: auth.currentUser.uid,
          usedAt: serverTimestamp(),
          classId: selectedClassId,
          quizId: quizRef.id
        });
      } catch (usageError) {
        // Don't fail quiz creation if usage tracking fails
        logError('Template usage tracking', usageError);
      }
      
      if (onSuccess) {
        onSuccess({ id: quizRef.id, ...quiz });
      }
      
      // Reset form
      handleClose();
    } catch (err) {
      logError('Quiz creation from template', err);
      setError(err.message || 'Failed to create quiz. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setSelectedClassId('');
    setDeadline('');
    setQuestions([]);
    setShowEditQuestions(false);
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
            <h3 className="text-xl font-bold text-gray-800">Create Quiz from Template</h3>
            <p className="text-sm text-gray-500 mt-1">
              {showEditQuestions ? 'Edit questions before creating' : 'Configure your quiz settings'}
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

          {!showEditQuestions ? (
            /* Settings View */
            <div className="space-y-5">
              {/* Template Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-indigo-900 truncate">{template.name}</p>
                    <p className="text-sm text-indigo-700">
                      {questions.length} questions • {totalPoints} points
                    </p>
                  </div>
                </div>
              </div>

              {/* Quiz Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chapter 5 Quiz - Period 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  maxLength={200}
                />
              </div>

              {/* Select Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Class <span className="text-red-500">*</span>
                </label>
                {classes && classes.length > 0 ? (
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Choose a class...</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.studentsCount || cls.students?.length || 0} students)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                    No classes available. Please create a class first.
                  </div>
                )}
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Edit Questions Button */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Questions</p>
                    <p className="text-sm text-gray-500">{questions.length} questions ready</p>
                  </div>
                  <button
                    onClick={() => setShowEditQuestions(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Questions
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Questions View */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowEditQuestions(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Settings
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">({questions.length}/100)</span>
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
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {qIndex + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        question.type === 'multiple-choice' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Text Answer'}
                      </span>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
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
                        className="w-full px-3 py-2 border border-green-300 bg-green-50 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}

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
              <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-700 mt-4">
                Total: {questions.length} questions • {totalPoints} points
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Cancel
          </button>
          {showEditQuestions ? (
            <button
              onClick={() => setShowEditQuestions(false)}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Done Editing
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating || !title.trim() || !selectedClassId}
              className={`flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 ${
                (creating || !title.trim() || !selectedClassId) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Quiz
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}