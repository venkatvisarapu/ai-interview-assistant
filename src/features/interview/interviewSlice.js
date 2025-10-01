import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  candidates: {},
  currentInterview: {
    candidateId: null,
    status: 'idle',
    currentQuestionIndex: 0,
    questions: [],
    answers: [],
    timers: [],
    skills: [],
  },
  modal: {
      showWelcomeBack: false,
  }
};

export const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    checkForPersistedState: (state) => {
        if (state.currentInterview && state.currentInterview.status === 'in_progress') {
            state.modal = state.modal || {};
            state.modal.showWelcomeBack = true;
        }
    },
    startNewInterview: (state) => {
      const newCandidateId = uuidv4();
      state.candidates[newCandidateId] = { id: newCandidateId, name: '', email: '', phone: '', skills: [] };
      state.currentInterview = { ...initialState.currentInterview, candidateId: newCandidateId, status: 'uploading' };
      state.modal = { showWelcomeBack: false };
    },
    setParsedInfo: (state, action) => {
      const { candidateId, info } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId] = { ...state.candidates[candidateId], ...info };
        state.currentInterview.skills = info.skills || [];
      }
      state.currentInterview.status = 'validating_info';
    },
    updateCandidateInfo: (state, action) => {
      const { candidateId, info } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId] = { ...state.candidates[candidateId], ...info };
      }
    },
    startTheQuestions: (state) => {
        state.currentInterview.status = 'in_progress';
        state.modal = state.modal || {};
        state.modal.showWelcomeBack = false;
    },
    setQuestions: (state, action) => {
      state.currentInterview.questions = action.payload;
    },
    saveAnswerAndProgress: (state, action) => {
      const { answer, timeTaken } = action.payload;
      state.currentInterview.answers.push(answer);
      state.currentInterview.timers.push(timeTaken);
      state.currentInterview.currentQuestionIndex += 1;
    },
    completeInterview: (state, action) => {
      const { candidateId, summary, overallScore, detailedScores } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId].finalSummary = summary;
        state.candidates[candidateId].overallScore = overallScore;
        state.candidates[candidateId].detailedScores = detailedScores;
      }
      state.currentInterview = { ...initialState.currentInterview, status: 'completed' };
    },
    resumeInterview: (state) => {
        state.modal = state.modal || {};
        state.modal.showWelcomeBack = false;
    },
    
   
    resetInterview: (state) => {
      const newCandidateId = uuidv4();
     
      const completedCandidates = Object.values(state.candidates).filter(c => c.finalSummary);
      state.candidates = {}; 
      completedCandidates.forEach(c => { 
          state.candidates[c.id] = c;
      });

      
      state.candidates[newCandidateId] = { id: newCandidateId, name: '', email: '', phone: '', skills: [] };
      
      
      state.currentInterview = { ...initialState.currentInterview, candidateId: newCandidateId, status: 'uploading' };
      state.modal = { showWelcomeBack: false };
    },
    
  },
});

export const {
    checkForPersistedState,
    startNewInterview,
    setParsedInfo,
    updateCandidateInfo,
    startTheQuestions,
    setQuestions,
    saveAnswerAndProgress,
    completeInterview,
    resumeInterview,
    resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;