import React, { useEffect } from 'react';
import { Layout, Tabs, Typography, Modal } from 'antd';
import { UserOutlined, DashboardOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import IntervieweePage from './pages/IntervieweePage.jsx';
import InterviewerPage from './pages/InterviewerPage.jsx';
import { checkForPersistedState, resumeInterview, startNewInterview } from './features/interview/interviewSlice.js';

const { Header, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const dispatch = useDispatch();

  
  const interviewState = useSelector(state => state.interview);

  
  const showWelcomeBack = interviewState?.modal?.showWelcomeBack || false;
  const candidateId = interviewState?.currentInterview?.candidateId;
  const candidateName = (candidateId && interviewState?.candidates[candidateId]?.name) || 'Candidate';
  
  useEffect(() => {
    dispatch(checkForPersistedState());
  }, [dispatch]);

  const handleResume = () => dispatch(resumeInterview());
  const handleStartNew = () => dispatch(startNewInterview());

  const items = [
    {
      key: '1',
      label: <span><UserOutlined /> Interviewee</span>,
      children: <IntervieweePage />,
    },
    {
      key: '2',
      label: <span><DashboardOutlined /> Interviewer</span>,
      children: <InterviewerPage />,
    },
  ];

  return (
    <Layout style={{ background: 'transparent' }}>
      <Header style={{ background: '#fff', textAlign: 'center', borderBottom: '1px solid #e8e8e8', padding: '0 24px' }}>
        <Title level={2} style={{ margin: '14px 0', color: '#1677ff' }}>AI-Powered Interview Assistant</Title>
      </Header>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: '80vh', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}>
          <Tabs defaultActiveKey="1" centered items={items} />
        </div>
      </Content>
      <Modal
        title="Welcome Back!"
        open={showWelcomeBack}
        onOk={handleResume}
        onCancel={handleStartNew}
        okText="Resume Interview"
        cancelText="Start a New One"
      >
        <p>It looks like you have an interview in progress for **{candidateName}**.</p>
        <p>Would you like to continue where you left off?</p>
      </Modal>
    </Layout>
  );
};

export default App;