import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Input,
  Button,
  List,
  Spin,
  message,
  Typography,
  Card,
  Space,
  Form,
  Result,
} from "antd";
import { SendOutlined, CheckOutlined, EditOutlined } from "@ant-design/icons";
import { generateInterviewQuestions, evaluateInterview } from "../api/groq";
import {
  setQuestions,
  saveAnswerAndProgress,
  completeInterview,
  updateCandidateInfo,
  startTheQuestions,
} from "../features/interview/interviewSlice.js";
import Timer from "./Timer.jsx";
import { useTimer } from "../hooks/useTimer.js";

const { TextArea } = Input;

const CenteredSpinner = ({ tip }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spin tip={tip} size="large" />
    </div>
);

const ChatUI = ({ messages, children }) => {
  const bottomOfChatRef = useRef(null);
  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <Card
      style={{
        maxWidth: 800,
        margin: "auto",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        background: "#fafafa",
      }}
    >
      <List
        style={{
          height: "55vh",
          overflowY: "auto",
          marginBottom: "16px",
          padding: "0 16px",
        }}
        dataSource={messages}
        renderItem={(item) => (
          <List.Item
            style={{
              border: "none",
              padding: "6px 0",
              display: "flex",
              justifyContent: item.sender === "ai" ? "flex-start" : "flex-end",
            }}
          >
            <div
              style={{
                background: item.sender === "ai" ? "#fff" : "#1677ff",
                color: item.sender === "ai" ? "#000" : "#fff",
                padding: "10px 16px",
                borderRadius: "18px",
                maxWidth: "75%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <span
                style={{ color: "inherit", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{
                  __html: item.text.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                  ),
                }}
              />
            </div>
          </List.Item>
        )}
      >
        <div ref={bottomOfChatRef} />
      </List>
      <div
        style={{
          padding: "0 16px 16px",
          borderTop: "1px solid #f0f0f0",
          paddingTop: "16px",
        }}
      >
        {children}
      </div>
    </Card>
  );
};
const ValidationChat = ({ candidateInfo }) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [stage, setStage] = useState(null);
  const [isAwaitingInput, setIsAwaitingInput] = useState(false);
  const [form] = Form.useForm();
  const validationRules = {
    name: [{ required: true, message: "Please enter your name." }],
    email: [
      { required: true, message: "Please enter your email." },
      { type: "email", message: "Please enter a valid email." },
    ],
    phone: [
      { required: true, message: "Please enter your phone number." },
      {
        pattern: /^[0-9\s+-]{10,15}$/,
        message: "Please enter a valid phone number.",
      },
    ],
  };
  useEffect(() => {
    setMessages([
      {
        sender: "ai",
        text: "Thanks for uploading your resume. Let's quickly verify your details.",
      },
    ]);
    setStage("name");
  }, []);
  useEffect(() => {
    if (stage && stage !== "done") {
      askQuestionForStage(stage);
    } else if (stage === "done") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Great! All your information is updated. Preparing your interview questions now...",
        },
      ]);
      setTimeout(() => dispatch(startTheQuestions()), 2000);
    }
  }, [stage, dispatch]);
  const askQuestionForStage = (currentStage) => {
    const info = candidateInfo[currentStage];
    if (info) {
      const question = `I have your ${currentStage} as **${info}**. Is that correct?`;
      setMessages((prev) => [...prev, { sender: "ai", text: question }]);
      setIsAwaitingInput(false);
    } else {
      const question = `I couldn't find a ${currentStage} in the resume. What is your ${currentStage}?`;
      setMessages((prev) => [...prev, { sender: "ai", text: question }]);
      setIsAwaitingInput(true);
    }
  };
  const moveToNextStage = () => {
    const stageOrder = ["name", "email", "phone"];
    const currentIndex = stageOrder.indexOf(stage);
    if (currentIndex < stageOrder.length - 1)
      setStage(stageOrder[currentIndex + 1]);
    else setStage("done");
  };
  const handleConfirmation = (isCorrect) => {
    if (isCorrect) {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: "Yes, that's correct." },
      ]);
      moveToNextStage();
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: "No, that's incorrect." },
        { sender: "ai", text: `My apologies. What is your correct ${stage}?` },
      ]);
      setIsAwaitingInput(true);
    }
  };
  const handleTextInput = (values) => {
    const inputValue = values[stage];
    dispatch(
      updateCandidateInfo({
        candidateId: candidateInfo.id,
        info: { [stage]: inputValue },
      })
    );
    setMessages((prev) => [...prev, { sender: "user", text: inputValue }]);
    setIsAwaitingInput(false);
    form.resetFields();
    moveToNextStage();
  };
  return (
    <ChatUI messages={messages}>
      {!isAwaitingInput && stage !== "done" && (
        <Space>
          <Button
            icon={<CheckOutlined />}
            type="primary"
            onClick={() => handleConfirmation(true)}
          >
            Correct
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleConfirmation(false)}
          >
            Incorrect
          </Button>
        </Space>
      )}
      {isAwaitingInput && (
        <Form
          form={form}
          onFinish={handleTextInput}
          style={{ display: "flex", gap: "8px" }}
        >
          <Form.Item
            name={stage}
            rules={validationRules[stage]}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Input placeholder={`Enter your ${stage}...`} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              icon={<SendOutlined />}
              htmlType="submit"
            />
          </Form.Item>
        </Form>
      )}
    </ChatUI>
  );
};

const InterviewChat = () => {
  const { currentInterview, candidates } = useSelector(
    (state) => state.interview
  );
  if (!currentInterview || !candidates) return <CenteredSpinner tip="Loading interview..." />;

  const { status, candidateId } = currentInterview;
  if (!candidateId || !candidates[candidateId]) return <CenteredSpinner tip="Initializing session..." />;

  const candidateInfo = candidates[candidateId];
  if (status === "validating_info")
    return <ValidationChat candidateInfo={candidateInfo} />;
  if (status === "in_progress")
    return <QuestionChat currentInterview={currentInterview} />;

  return <CenteredSpinner tip="Loading..." />;
};

const QuestionChat = ({ currentInterview }) => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const dispatch = useDispatch();
  const { candidateId, questions, currentQuestionIndex, answers, skills } =
    currentInterview;

  useEffect(() => {
    const fetchQuestions = async () => {
      if (questions.length === 0) {
        setIsLoading(true);
        try {
          const generatedQuestions = await generateInterviewQuestions(skills);
          if (generatedQuestions && generatedQuestions.length > 0) {
            dispatch(setQuestions(generatedQuestions));
          } else {
            message.error("AI failed to generate questions. Please try again later.", 5);
          }
        } catch (error) {
          message.error("Failed to load interview questions due to a network error.", 5);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchQuestions();
  }, [dispatch, questions.length, skills]);

  useEffect(() => {
    if (questions.length > 0) {
      const history = [];
      for (let i = 0; i <= currentQuestionIndex && i < questions.length; i++) {
        history.push({
          sender: "ai",
          text: `<strong>Question ${i + 1} (${questions[i].difficulty}):</strong> ${questions[i].question}`,
        });
        if (answers[i] !== undefined) {
          history.push({ sender: "user", text: answers[i] });
        }
      }
      setChatHistory(history);
    }
  }, [questions, currentQuestionIndex, answers]);

  const handleSubmit = useCallback(
    (answerToSubmit, questionIndexWhenCalled) => {
      dispatch((dispatch, getState) => {
        const { currentQuestionIndex: latestIndex } = getState().interview.currentInterview;
        if (questionIndexWhenCalled !== latestIndex) return;

        dispatch(saveAnswerAndProgress({ answer: answerToSubmit, timeTaken: 0 }));

        const isLastQuestion = latestIndex >= questions.length - 1;
        if (isLastQuestion) {
          setIsEvaluating(true);
          const finalAnswers = [...getState().interview.currentInterview.answers];
          evaluateInterview(questions, finalAnswers).then((evaluation) => {
            dispatch(completeInterview({ candidateId, ...evaluation }));
          });
        }
      });
    },
    [dispatch, questions, candidateId]
  );
  
  const handleTimeUp = useCallback(() => {
    handleSubmit(
      currentAnswerRef.current || "Time ran out. No answer provided.",
      currentQuestionIndex
    );
  }, [handleSubmit, currentQuestionIndex]);

  
  const isReadyForTimer = !isLoading && questions.length > 0;
  const currentQuestion = questions[currentQuestionIndex];
  
  const duration = currentQuestion ? currentQuestion.time : 0;
  
  
  const { timeLeft } = useTimer(currentQuestionIndex, duration, handleTimeUp, isReadyForTimer);

  const currentAnswerRef = useRef(currentAnswer);
  useEffect(() => {
    currentAnswerRef.current = currentAnswer;
  }, [currentAnswer]);

  const handleManualSubmit = () => {
    if (!currentAnswer.trim()) {
      message.warning("Please provide an answer.");
      return;
    }
    handleSubmit(currentAnswer, currentQuestionIndex);
    setCurrentAnswer("");
  };
  
  
  if (!isReadyForTimer) {
    return <CenteredSpinner tip="Generating your personalized questions..." />;
  }
  
  return (
    <ChatUI messages={chatHistory}>
      {isEvaluating ? (
        <div style={{ textAlign: "center", padding: '20px' }}>
          <Spin tip="Finalizing your results..." />
        </div>
      ) : currentQuestion ? (
        <>
          <Timer timeLeft={timeLeft} duration={duration} />
          <div style={{ display: "flex", gap: "8px" }}>
            <TextArea
              rows={2}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleManualSubmit();
                }
              }}
              disabled={isEvaluating}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleManualSubmit}
              disabled={isEvaluating}
              size="large"
            />
          </div>
        </>
      ) : (
        <Result status="success" title="Interview Completed!" />
      )}
    </ChatUI>
  );
};

export default InterviewChat;