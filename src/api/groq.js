

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroqAI(prompt) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "messages": [{ "role": "user", "content": prompt }],
      "model": "openai/gpt-oss-120b", 
      "temperature": 0.7,
      "response_format": { "type": "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Groq AI API Error Response:", errorData.error ? errorData.error.message : errorData);
    throw new Error(`API Error: ${response.status} - ${errorData.error ? errorData.error.message : 'Bad Request'}`);
  }

  const data = await response.json();
  const jsonString = data.choices[0].message.content;  
  return JSON.parse(jsonString);
}


export const parseResumeTextWithAI = async (text) => {
  const prompt = `Analyze the following resume text. Return a single valid JSON object with ONLY the keys: "name", "email", "phone", "skills". The "skills" key must be an array of relevant technical skills. If a value is not found, it must be null. Resume Text: --- ${text.substring(0, 4000)}`;
  try {
    return await callGroqAI(prompt);
  } catch (error) {
    console.error("Error parsing resume with Groq:", error);
    return { name: null, email: null, phone: null, skills: [] };
  }
};


export const generateInterviewQuestions = async (skills = []) => {
  const skillsPrompt = skills.length > 0 ? `Tailor some questions to these skills: ${skills.join(', ')}.` : '';
  const prompt = `You are an expert technical interviewer. Your response MUST be a single, valid JSON object with ONLY one key: "questions". The value of "questions" MUST be an array of exactly 6 UNIQUE AND VARIED TECHNICAL interview questions for a Full Stack (React/Node.js) role. Each object must have "question", "difficulty", and "time" keys. The "time" key MUST be exactly 20 for Easy, 60 for Medium, and 120 for Hard. Do NOT ask behavioral questions. ${skillsPrompt}`;
  try {
    const result = await callGroqAI(prompt);
    return result.questions;
  } catch (error) {
    console.error("Error generating questions with Groq:", error);
    return [ { "question": "Fallback: Explain the difference between `let`, `const`, and `var`.", "difficulty": "Easy", "time": 20 }, { "question": "Fallback: What is JSX?", "difficulty": "Easy", "time": 20 }, { "question": "Fallback: What are props?", "difficulty": "Medium", "time": 60 }, { "question": "Fallback: Explain the virtual DOM.", "difficulty": "Medium", "time": 60 }, { "question": "Fallback: Describe the Node.js event loop.", "difficulty": "Hard", "time": 120 }, { "question": "Fallback: What is a REST API?", "difficulty": "Hard", "time": 120 }];
  }
};



export const evaluateInterview = async (questions, answers) => {
  const interviewData = questions.map((q, i) => ({ question: q.question, difficulty: q.difficulty, answer: answers[i] || "No answer provided." }));
  const prompt = `
    You are a very strict, senior technical interviewer. Analyze the interview data below.
    Your response MUST be a single, valid JSON object with ONLY these three keys: "detailedScores", "overallScore", "summary".
    
    1. The value for "detailedScores" MUST be a JSON ARRAY of objects. Each object in the array must contain the original "question", "answer", and a "score" from 0-10 based on technical accuracy. A nonsensical answer like "ddd" MUST receive a score of 0.
    2. The value for "overallScore" MUST be a single number from 0-100, calculated as a weighted average (Easy=1x, Medium=2x, Hard=3x).
    3. The value for "summary" MUST be a concise, 3-4 sentence technical summary.

    Interview Data:
    ${JSON.stringify(interviewData, null, 2)}
  `;
  try {
    const result = await callGroqAI(prompt);

    
    if (!Array.isArray(result.detailedScores)) {
        console.error("AI returned malformed data for detailedScores. Forcing it to an empty array to prevent a crash.");
        result.detailedScores = [];
    }
    

    return result;
  } catch (error) {
    console.error("Error evaluating interview with Groq:", error);
    return {
      detailedScores: [],
      overallScore: 0,
      summary: "Could not evaluate interview due to a technical API error."
    };
  }
};
