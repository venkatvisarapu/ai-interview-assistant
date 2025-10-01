import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Result, Spin } from 'antd';
import { SmileOutlined, RocketOutlined } from '@ant-design/icons';
import ResumeUpload from '../components/ResumeUpload.jsx';
import InterviewChat from '../components/InterviewChat.jsx';
import { resetInterview } from '../features/interview/interviewSlice.js';

const CenteredSpinner = ({ tip }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Spin tip={tip} size="large" />
  </div>
);

const IntervieweePage = () => {
  const dispatch = useDispatch();
  const interviewState = useSelector((state) => state.interview);

  
  const currentInterview = interviewState?.currentInterview;
  const showWelcomeBack = interviewState?.modal?.showWelcomeBack || false;

  if (!currentInterview) {
    return <CenteredSpinner tip="Loading Interview State..." />;
  }

  const { status, candidateId } = currentInterview;
  const handleAnother = () => { dispatch(resetInterview()); };

  const renderContent = () => {
    
    if (status === 'in_progress' && showWelcomeBack) {
        return <CenteredSpinner tip="Resuming Interview..." />;
    }
    

    switch (status) {
      case 'idle':
      case 'uploading':
        return <ResumeUpload />;

      case 'validating_info':
      case 'in_progress':
        return <InterviewChat key={candidateId} />;

      case 'completed':
        return (
          <Result
            icon={<SmileOutlined style={{ color: '#52c41a' }} />}
            title="Great Job! You've Completed the Interview."
            subTitle="Your results are now available on the Interviewer Dashboard."
            extra={<Button type="primary" onClick={handleAnother}>Start Another Interview</Button>}
          />
        );
      default:
        return (
          <Result
            status="500"
            title="An Unexpected Error Occurred"
            extra={<Button type="primary" onClick={handleAnother}>Start Over</Button>}
          />
        );
    }
  };

  return <div>{renderContent()}</div>;
};

export default IntervieweePage;