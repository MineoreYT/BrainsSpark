/**
 * Template Service
 * Handles all quiz template operations including CRUD and usage tracking
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { sanitizeText } from '../utils/sanitize';
import { logError, logWarning, validateDocumentSize } from '../utils/logger';

// Template categories
export const TEMPLATE_CATEGORIES = [
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

/**
 * Create a new template from quiz data
 * @param {Object} templateData - Template information
 * @returns {Promise<Object>} - Created template with ID
 */
export const createTemplate = async (templateData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to create templates');
  }

  // Rate limiting: Check user's template count
  try {
    const userTemplatesQuery = query(
      collection(db, 'templates'),
      where('createdBy', '==', user.uid)
    );
    const snapshot = await getDocs(userTemplatesQuery);
    
    // Limit: 50 templates per user
    if (snapshot.size >= 50) {
      throw new Error('Maximum template limit reached (50 templates). Please delete some templates before creating new ones.');
    }
  } catch (error) {
    if (error.message.includes('Maximum template limit')) {
      throw error;
    }
    // If rate limit check fails, log but continue (don't block legitimate users)
    logWarning('Rate limit check', error);
  }

  // Validate required fields
  if (!templateData.name || !templateData.name.trim()) {
    throw new Error('Template name is required');
  }

  if (!templateData.questions || templateData.questions.length === 0) {
    throw new Error('Template must have at least one question');
  }

  // Sanitize inputs
  const sanitizedName = sanitizeText(templateData.name, 200);
  const sanitizedDescription = sanitizeText(templateData.description || '', 1000);

  // Prepare template document
  const template = {
    name: sanitizedName,
    description: sanitizedDescription,
    category: templateData.category || 'Other',
    subcategory: templateData.subcategory || '',
    
    // Creator info
    createdBy: user.uid,
    createdByName: templateData.createdByName || user.displayName || 'Teacher',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    
    // Template content
    questions: templateData.questions.map(q => ({
      type: q.type || 'multiple-choice',
      question: sanitizeText(q.question, 500),
      options: q.type === 'multiple-choice' ? q.options.map(opt => sanitizeText(opt, 200)) : [],
      correctAnswer: q.correctAnswer,
      points: q.points || 1
    })),
    
    // Grading settings
    gradingScale: templateData.gradingScale || 'traditional',
    passingGrade: templateData.passingGrade || 70,
    totalPoints: templateData.totalPoints || templateData.questions.reduce((sum, q) => sum + (q.points || 1), 0),
    
    // Metadata
    questionCount: templateData.questions.length,
    timesUsed: 0,
    lastUsedAt: null,
    
    // Visibility
    isPublic: templateData.isPublic || false,
    isPreMade: false,
    
    // Tags for search
    tags: templateData.tags || []
  };

  // Validate document size (Fix #9)
  const sizeCheck = validateDocumentSize(template);
  if (!sizeCheck.valid) {
    throw new Error(`Template is too large (${sizeCheck.sizeKB}KB). Maximum size is ${sizeCheck.maxSizeKB}KB. Try reducing the number of questions or shortening question text.`);
  }

  try {
    const docRef = await addDoc(collection(db, 'templates'), template);
    return {
      id: docRef.id,
      ...template
    };
  } catch (error) {
    logError('Template creation', error);
    throw new Error('Failed to create template. Please try again.');
  }
};

/**
 * Get all templates for the current user
 * @param {Object} options - Query options (category, sortBy, limit)
 * @returns {Promise<Array>} - Array of templates
 */
export const getUserTemplates = async (options = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    // Simple query without orderBy to avoid needing composite index
    const q = query(
      collection(db, 'templates'),
      where('createdBy', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    let templates = [];

    querySnapshot.forEach((doc) => {
      templates.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Filter by category client-side if specified
    if (options.category && options.category !== 'All') {
      templates = templates.filter(t => t.category === options.category);
    }

    // Sort client-side to avoid needing composite index
    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortDirection || 'desc';
    
    templates.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle Firestore timestamps
      if (aVal?.toDate) aVal = aVal.toDate();
      if (bVal?.toDate) bVal = bVal.toDate();
      
      // Handle dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
      }
      
      // Handle strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'desc' 
          ? bVal.localeCompare(aVal) 
          : aVal.localeCompare(bVal);
      }
      
      // Handle numbers
      return sortDirection === 'desc' ? (bVal || 0) - (aVal || 0) : (aVal || 0) - (bVal || 0);
    });

    // Apply limit if specified
    if (options.limit && templates.length > options.limit) {
      templates = templates.slice(0, options.limit);
    }

    return templates;
  } catch (error) {
    logError('Fetching templates', error);
    throw new Error('Failed to load templates. Please try again.');
  }
};

/**
 * Get a single template by ID
 * @param {string} templateId - Template document ID
 * @returns {Promise<Object>} - Template data
 */
export const getTemplateById = async (templateId) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    const templateDoc = await getDoc(doc(db, 'templates', templateId));
    
    if (!templateDoc.exists()) {
      throw new Error('Template not found');
    }

    const templateData = templateDoc.data();

    // Check if user has access (owner or public template)
    if (templateData.createdBy !== user.uid && !templateData.isPublic) {
      throw new Error('You do not have permission to view this template');
    }

    return {
      id: templateDoc.id,
      ...templateData
    };
  } catch (error) {
    logError('Fetching template by ID', error);
    throw error;
  }
};

/**
 * Update an existing template
 * @param {string} templateId - Template document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateTemplate = async (templateId, updates) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    // Get the template first to verify ownership
    const templateDoc = await getDoc(doc(db, 'templates', templateId));
    
    if (!templateDoc.exists()) {
      throw new Error('Template not found');
    }

    if (templateDoc.data().createdBy !== user.uid) {
      throw new Error('You do not have permission to edit this template');
    }

    // Sanitize updates
    const sanitizedUpdates = {
      updatedAt: serverTimestamp()
    };

    if (updates.name) {
      sanitizedUpdates.name = sanitizeText(updates.name, 200);
    }

    if (updates.description !== undefined) {
      sanitizedUpdates.description = sanitizeText(updates.description, 1000);
    }

    if (updates.category) {
      sanitizedUpdates.category = updates.category;
    }

    if (updates.questions) {
      sanitizedUpdates.questions = updates.questions.map(q => ({
        type: q.type || 'multiple-choice',
        question: sanitizeText(q.question, 500),
        options: q.type === 'multiple-choice' ? q.options.map(opt => sanitizeText(opt, 200)) : [],
        correctAnswer: q.correctAnswer,
        points: q.points || 1
      }));
      sanitizedUpdates.questionCount = updates.questions.length;
      sanitizedUpdates.totalPoints = updates.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    }

    if (updates.gradingScale) {
      sanitizedUpdates.gradingScale = updates.gradingScale;
    }

    if (updates.passingGrade !== undefined) {
      sanitizedUpdates.passingGrade = updates.passingGrade;
    }

    if (updates.isPublic !== undefined) {
      sanitizedUpdates.isPublic = updates.isPublic;
    }

    if (updates.tags) {
      sanitizedUpdates.tags = updates.tags;
    }

    await updateDoc(doc(db, 'templates', templateId), sanitizedUpdates);
  } catch (error) {
    logError('Updating template', error);
    throw error;
  }
};

/**
 * Delete a template
 * @param {string} templateId - Template document ID
 * @returns {Promise<void>}
 */
export const deleteTemplate = async (templateId) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    // Get the template first to verify ownership
    const templateDoc = await getDoc(doc(db, 'templates', templateId));
    
    if (!templateDoc.exists()) {
      throw new Error('Template not found');
    }

    if (templateDoc.data().createdBy !== user.uid) {
      throw new Error('You do not have permission to delete this template');
    }

    await deleteDoc(doc(db, 'templates', templateId));
  } catch (error) {
    logError('Deleting template', error);
    throw error;
  }
};

/**
 * Create a quiz from a template
 * @param {string} templateId - Template document ID
 * @param {Object} quizData - Quiz-specific data (title, classId, deadline)
 * @returns {Promise<Object>} - Created quiz data
 */
export const createQuizFromTemplate = async (templateId, quizData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  if (!quizData.classId) {
    throw new Error('Class ID is required');
  }

  if (!quizData.title || !quizData.title.trim()) {
    throw new Error('Quiz title is required');
  }

  try {
    // Get the template
    const template = await getTemplateById(templateId);

    // Create quiz document
    const quiz = {
      title: sanitizeText(quizData.title, 200),
      questions: template.questions,
      classId: quizData.classId,
      deadline: quizData.deadline || null,
      gradingScale: template.gradingScale,
      passingGrade: template.passingGrade,
      totalPoints: template.totalPoints,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      createdFromTemplate: templateId
    };

    // Add quiz to Firestore
    const quizRef = await addDoc(collection(db, 'quizzes'), quiz);

    // Update template usage statistics
    await updateDoc(doc(db, 'templates', templateId), {
      timesUsed: increment(1),
      lastUsedAt: serverTimestamp()
    });

    // Log template usage
    await addDoc(collection(db, 'templateUsage'), {
      templateId: templateId,
      usedBy: user.uid,
      usedAt: serverTimestamp(),
      classId: quizData.classId,
      quizId: quizRef.id
    });

    return {
      id: quizRef.id,
      ...quiz
    };
  } catch (error) {
    logError('Creating quiz from template', error);
    throw error;
  }
};

/**
 * Search templates by name or tags
 * @param {string} searchQuery - Search term
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} - Matching templates
 */
export const searchTemplates = async (searchQuery, filters = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    // Get user's templates
    let templates = await getUserTemplates(filters);

    // Filter by search query (client-side for now)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        (template.tags && template.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    return templates;
  } catch (error) {
    logError('Searching templates', error);
    throw error;
  }
};

/**
 * Get public templates (for future community feature)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Public templates
 */
export const getPublicTemplates = async (options = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    let q = query(
      collection(db, 'templates'),
      where('isPublic', '==', true)
    );

    if (options.category && options.category !== 'All') {
      q = query(q, where('category', '==', options.category));
    }

    q = query(q, orderBy('timesUsed', 'desc'));

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const templates = [];

    querySnapshot.forEach((doc) => {
      templates.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return templates;
  } catch (error) {
    logError('Fetching public templates', error);
    throw error;
  }
};

/**
 * Duplicate a template
 * @param {string} templateId - Template to duplicate
 * @param {string} newName - Name for the duplicate
 * @returns {Promise<Object>} - New template
 */
export const duplicateTemplate = async (templateId, newName) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    // Get the original template
    const original = await getTemplateById(templateId);

    // Create a copy with new name
    const duplicate = {
      name: newName || `${original.name} (Copy)`,
      description: original.description,
      category: original.category,
      subcategory: original.subcategory,
      questions: original.questions,
      gradingScale: original.gradingScale,
      passingGrade: original.passingGrade,
      totalPoints: original.totalPoints,
      tags: original.tags,
      isPublic: false, // Duplicates are private by default
      createdByName: user.displayName || 'Teacher'
    };

    return await createTemplate(duplicate);
  } catch (error) {
    logError('Duplicating template', error);
    throw error;
  }
};

/**
 * Get template usage statistics
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} - Usage statistics
 */
export const getTemplateStats = async (templateId) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    const template = await getTemplateById(templateId);

    // Get usage logs
    const usageQuery = query(
      collection(db, 'templateUsage'),
      where('templateId', '==', templateId),
      where('usedBy', '==', user.uid),
      orderBy('usedAt', 'desc'),
      limit(10)
    );

    const usageSnapshot = await getDocs(usageQuery);
    const recentUsage = [];

    usageSnapshot.forEach((doc) => {
      recentUsage.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      timesUsed: template.timesUsed || 0,
      lastUsedAt: template.lastUsedAt,
      questionCount: template.questionCount,
      totalPoints: template.totalPoints,
      recentUsage
    };
  } catch (error) {
    logError('Fetching template stats', error);
    throw error;
  }
};

export default {
  TEMPLATE_CATEGORIES,
  createTemplate,
  getUserTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  createQuizFromTemplate,
  searchTemplates,
  getPublicTemplates,
  duplicateTemplate,
  getTemplateStats
};
