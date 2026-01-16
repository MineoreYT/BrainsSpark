/**
 * MyTemplatesPage Component
 * Full page for managing quiz templates
 */

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import TemplateList from './TemplateList';
import UseTemplateModal from './UseTemplateModal';
import EditTemplateModal from './EditTemplateModal';
import TemplatePreviewModal from './TemplatePreviewModal';
import ConfirmModal from '../ConfirmModal';
import Toast from '../Toast';
import { useToast } from '../../hooks/useToast';
import { 
  getUserTemplates, 
  deleteTemplate, 
  duplicateTemplate 
} from '../../services/templateService';

export default function MyTemplatesPage({ onBack }) {
  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Teacher');
  
  // Modal states
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch user data
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().fullName || 'Teacher');
        }
      }

      // Fetch templates
      const userTemplates = await getUserTemplates();
      setTemplates(userTemplates);

      // Fetch classes for the use template modal
      const classesQuery = query(
        collection(db, 'classes'),
        where('teacherId', '==', user.uid)
      );
      const classesSnapshot = await getDocs(classesQuery);
      const classesData = [];
      classesSnapshot.forEach((doc) => {
        classesData.push({
          id: doc.id,
          ...doc.data(),
          studentsCount: doc.data().students?.length || 0
        });
      });
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load templates. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setShowUseModal(true);
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const handleTemplateUpdated = (updatedTemplate) => {
    setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    showToast(`Template "${updatedTemplate.name}" updated successfully!`, 'success');
    setShowEditModal(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (template) => {
    setConfirmModal({
      isOpen: true,
      title: '⚠️ Delete Template',
      message: `Are you sure you want to delete "${template.name}"?\n\nThis action cannot be undone.`,
      onConfirm: () => performDeleteTemplate(template)
    });
  };

  const performDeleteTemplate = async (template) => {
    try {
      await deleteTemplate(template.id);
      setTemplates(templates.filter(t => t.id !== template.id));
      showToast('Template deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast('Failed to delete template. Please try again.', 'error');
    }
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const newTemplate = await duplicateTemplate(template.id);
      setTemplates([newTemplate, ...templates]);
      showToast(`Template duplicated as "${newTemplate.name}"`, 'success');
    } catch (error) {
      console.error('Error duplicating template:', error);
      showToast('Failed to duplicate template. Please try again.', 'error');
    }
  };

  const handleQuizCreated = (quiz) => {
    showToast(`Quiz "${quiz.title}" created successfully!`, 'success');
    setShowUseModal(false);
    setSelectedTemplate(null);
    // Refresh templates to update usage count
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Templates</h1>
                <p className="text-sm text-gray-500">Manage your quiz templates</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {templates.length} template{templates.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        {templates.length === 0 && !loading && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 mb-1">No Templates Yet</h3>
                <p className="text-indigo-700 mb-3">
                  Templates help you save time by reusing quiz structures. Create a quiz and save it as a template to get started!
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Save time
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reuse quizzes
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Stay consistent
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template List */}
        <TemplateList
          templates={templates}
          loading={loading}
          onUse={handleUseTemplate}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          onDuplicate={handleDuplicateTemplate}
          onPreview={handlePreviewTemplate}
          onRefresh={fetchData}
        />
      </main>

      {/* Use Template Modal */}
      <UseTemplateModal
        isOpen={showUseModal}
        onClose={() => { setShowUseModal(false); setSelectedTemplate(null); }}
        template={selectedTemplate}
        classes={classes}
        onSuccess={handleQuizCreated}
      />

      {/* Edit Template Modal */}
      <EditTemplateModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedTemplate(null); }}
        template={selectedTemplate}
        onSuccess={handleTemplateUpdated}
      />

      {/* Preview Template Modal */}
      <TemplatePreviewModal
        isOpen={showPreviewModal}
        onClose={() => { setShowPreviewModal(false); setSelectedTemplate(null); }}
        template={selectedTemplate}
        onUse={handleUseTemplate}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
      />

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}
