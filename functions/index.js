const rateLimit = require('express-rate-limit');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();
const db = admin.firestore();
const app = express();

// Rate limiting middleware
const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 account creations per windowMs
  message: {
    error: 'Too many accounts created from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  skipSuccessfulRequests: true,
});

const quizSubmissionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 quiz submissions per 5 minutes
  message: {
    error: 'Too many quiz submissions from this IP, please try again later.'
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
});

// Apply rate limiting middleware
app.use(express.json());
app.use('/api/', generalLimiter);

// Example routes with rate limiting (you can add actual logic here if needed)
app.post('/api/register', createAccountLimiter, (req, res) => {
  res.status(501).json({ message: 'Registration endpoint - implement if needed' });
});

app.post('/api/login', loginLimiter, (req, res) => {
  res.status(501).json({ message: 'Login endpoint - implement if needed' });
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);

/**
 * Submit Quiz - Server-side validation with rate limiting
 * This function validates quiz answers on the server to prevent cheating
 * Students never see the correct answers in the client
 */
exports.submitQuiz = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to submit a quiz.'
    );
  }

  const { quizId, classId, answers } = data;
  const studentId = context.auth.uid;

  // Validate input
  if (!quizId || !classId || !answers) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: quizId, classId, or answers.'
    );
  }

  try {
    // Check for rate limiting on quiz submissions per user
    const recentSubmissions = await db
      .collection('quizResults')
      .where('studentId', '==', studentId)
      .where('submittedAt', '>', new Date(Date.now() - 5 * 60 * 1000)) // Last 5 minutes
      .get();

    if (recentSubmissions.size >= 5) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many quiz submissions. Please wait before submitting another quiz.'
      );
    }

    // Fetch the quiz from Firestore
    const quizDoc = await db.collection('quizzes').doc(quizId).get();
    
    if (!quizDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Quiz not found.');
    }

    const quiz = quizDoc.data();

    // Verify the quiz belongs to the specified class
    if (quiz.classId !== classId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Quiz does not belong to the specified class.'
      );
    }

    // Check if quiz has a deadline
    if (quiz.deadline) {
      const deadline = new Date(quiz.deadline);
      const now = new Date();
      if (now > deadline) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Quiz deadline has passed.'
        );
      }
    }

    // Check if student is enrolled in the class
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Class not found.');
    }

    const classData = classDoc.data();
    if (!classData.students || !classData.students.includes(studentId)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Student is not enrolled in this class.'
      );
    }

    // Check if student has already submitted this quiz
    const existingResults = await db
      .collection('quizResults')
      .where('quizId', '==', quizId)
      .where('studentId', '==', studentId)
      .get();

    if (!existingResults.empty) {
      throw new functions.https.HttpsError(
        'already-exists',
        'You have already submitted this quiz.'
      );
    }

    // Grade the quiz
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      const studentAnswer = answers[index];

      if (question.type === 'multiple-choice') {
        // For multiple choice, compare the index
        if (studentAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      } else if (question.type === 'enumeration') {
        // For enumeration, compare strings (case-insensitive)
        const correctAnswerLower = question.correctAnswer.toLowerCase().trim();
        const studentAnswerLower = String(studentAnswer).toLowerCase().trim();
        if (studentAnswerLower === correctAnswerLower) {
          correctAnswers++;
        }
      }
    });

    // Calculate score percentage
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Save the result to Firestore
    const result = {
      quizId: quizId,
      classId: classId,
      studentId: studentId,
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('quizResults').add(result);

    // Return only the score (NOT the correct answers)
    return {
      success: true,
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      message: 'Quiz submitted successfully!',
    };
  } catch (error) {
    console.error('Error submitting quiz:', error);
    
    // If it's already an HttpsError, rethrow it
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Otherwise, throw a generic error
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while submitting the quiz.'
    );
  }
});

/**
 * Get Quiz Questions (without answers) with rate limiting
 * This function returns quiz questions without the correct answers
 */
exports.getQuizQuestions = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated.'
    );
  }

  const { quizId } = data;
  const userId = context.auth.uid;

  if (!quizId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required field: quizId.'
    );
  }

  try {
    // Rate limiting: Check if user has made too many quiz requests recently
    const recentRequests = await db
      .collection('quizRequests')
      .where('userId', '==', userId)
      .where('requestedAt', '>', new Date(Date.now() - 5 * 60 * 1000)) // Last 5 minutes
      .get();

    if (recentRequests.size >= 10) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many quiz requests. Please wait before requesting another quiz.'
      );
    }

    // Log the request for rate limiting
    await db.collection('quizRequests').add({
      userId: userId,
      quizId: quizId,
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const quizDoc = await db.collection('quizzes').doc(quizId).get();
    
    if (!quizDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Quiz not found.');
    }

    const quiz = quizDoc.data();

    // Remove correct answers from questions
    const questionsWithoutAnswers = quiz.questions.map((question) => {
      if (question.type === 'multiple-choice') {
        return {
          type: question.type,
          question: question.question,
          options: question.options,
          // correctAnswer is NOT included
        };
      } else if (question.type === 'enumeration') {
        return {
          type: question.type,
          question: question.question,
          // correctAnswer is NOT included
        };
      }
      return question;
    });

    return {
      quizId: quizId,
      title: quiz.title,
      classId: quiz.classId,
      deadline: quiz.deadline,
      questions: questionsWithoutAnswers,
    };
  } catch (error) {
    console.error('Error fetching quiz:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while fetching the quiz.'
    );
  }
});