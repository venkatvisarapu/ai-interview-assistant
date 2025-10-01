# AI-Powered Interview Assistant

This is a React application built for the Swipe Internship assignment. It functions as an AI-powered assistant to conduct initial technical interviews for a Full Stack (React/Node.js) developer role.

### [➡️ View the Live Demo Here ⬅️](https://ai-interview-assistant-five-tau.vercel.app/)

---

## Core Features

This project successfully implements all the core requirements of the assignment:

*   **📄 Resume Upload & AI Parsing:** Candidates can upload their resume (PDF/DOCX). The AI extracts their name, email, phone number, and key technical skills.
*   **🤖 Smart Validation Chat:** If any contact information is missing, a chatbot prompts the candidate to provide it before the interview begins.
*   **🧠 Dynamic AI Interview Flow:** The application uses the Groq AI API to dynamically generate a unique set of 6 technical questions for each candidate, tailored to the Full Stack role and the candidate's skills.
*   **⏱️ Timed Questions:** The interview consists of 2 Easy (20s), 2 Medium (60s), and 2 Hard (120s) questions, each with its own timer. The system automatically moves on when time expires.
*   **📊 AI Evaluation & Scoring:** After the final question, the AI provides a detailed evaluation, a final weighted score (0-100), and a concise summary of the candidate's performance.
*   **🗂️ Synced Interviewer Dashboard:** A second tab provides a dashboard view for the interviewer. It lists all completed candidates, showing their scores and summaries.
*   **🔍 Search & Sort:** The dashboard includes functionality to search for candidates by name/email and sort them by score or name.
*   **🔄 Local Data Persistence:** The entire application state, including candidate history and in-progress interviews, is saved locally in the browser using `redux-persist`. This ensures that all completed interviews are retained in the dashboard.

## Tech Stack

*   **Frontend:** React, Vite
*   **State Management:** Redux Toolkit, Redux Persist
*   **UI Library:** Ant Design
*   **AI Integration:** Groq API for resume parsing, question generation, and evaluation.
*   **File Processing:** `pdfjs-dist` and `mammoth` for text extraction from resumes.

## How to Run This Project Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/venkatvisarapu/ai-interview-assistant.git
    cd ai-interview-assistant
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Create a new file in the root of the project named `.env`.
    *   Add your Groq API key to this file:
    ```
    VITE_GROQ_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.