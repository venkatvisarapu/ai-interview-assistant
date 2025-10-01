import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, Button, message, Spin, Typography, Alert, Result } from 'antd';
import { UploadOutlined, RocketOutlined } from '@ant-design/icons';
import { extractTextFromFile } from '../utils/fileProcessor';
import { parseResumeTextWithAI } from '../api/groq'; 
import { setParsedInfo, startNewInterview } from '../features/interview/interviewSlice';

const { Title, Paragraph } = Typography;

const ResumeUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const currentInterview = useSelector(state => state.interview?.currentInterview);

  if (!currentInterview) {
    return <Spin tip="Initializing..." />;
  }
  const { candidateId, status } = currentInterview;

  if (status === 'idle') {
    return (
      <Result
        icon={<RocketOutlined />}
        title="Ready to Showcase Your Skills?"
        extra={<Button type="primary" size="large" onClick={() => dispatch(startNewInterview())}>Begin Interview</Button>}
      />
    );
  }

  const handleUpload = async (file) => {
    const isPdfOrDocx = file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isPdfOrDocx) {
      message.error('You can only upload PDF or DOCX files!');
      return false;
    }

    setIsLoading(true);
    message.loading({ content: 'Extracting text from resume...', key: 'processing', duration: 0 });

    try {
      if (!candidateId) throw new Error("Candidate session not found.");

      
      const text = await extractTextFromFile(file);
      message.loading({ content: 'AI is analyzing resume details...', key: 'processing', duration: 0 });

      
      const userInfo = await parseResumeTextWithAI(text);
      dispatch(setParsedInfo({ candidateId, info: userInfo }));

      message.success({ content: 'Resume processed successfully!', key: 'processing', duration: 2 });

    } catch (error) {
      console.error("Upload and Parse Error:", error);
      message.error({ content: `An error occurred: ${error.toString()}`, key: 'processing', duration: 5 });
    } finally {
      setIsLoading(false);
    }

    return false; 
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '600px', margin: 'auto' }}>
      <Spin spinning={isLoading} tip="Processing your resume...">
        <Title level={2}>Upload Your Resume</Title>
        <Paragraph type="secondary">
          Please upload your resume in PDF or DOCX format. Our AI will extract your details and personalize your interview.
        </Paragraph>
        <div style={{ marginTop: '30px' }}>
          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
            accept=".pdf,.docx"
            disabled={isLoading}
          >
            <Button icon={<UploadOutlined />} size="large" type="primary" disabled={isLoading}>
              Select Resume File
            </Button>
          </Upload>
        </div>
        <Alert
          style={{ marginTop: '30px', textAlign: 'left' }}
          message="Privacy Note"
          description="Your resume is processed for interview purposes only and is not stored long-term."
          type="info"
          showIcon
        />
      </Spin>
    </div>
  );
};

export default ResumeUpload;