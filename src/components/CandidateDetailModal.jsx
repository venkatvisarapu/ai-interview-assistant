import React from 'react';
import { Modal, Descriptions, List, Typography, Tag, Divider, Progress } from 'antd';

const { Title, Text, Paragraph } = Typography;


const scoreTag = (score) => {
    let color;
    if (score >= 9) color = 'success';
    else if (score >= 7) color = 'processing';
    else if (score >= 5) color = 'warning';
    else color = 'error';
    return <Tag color={color} style={{ fontSize: 14, padding: '4px 8px' }}>{score} / 10</Tag>;
};

const CandidateDetailModal = ({ open, onCancel, candidate }) => {
  if (!candidate) return null;

  return (
    <Modal title="Candidate Interview Details" open={open} onCancel={onCancel} footer={null} width={800}>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Name"><Text strong>{candidate.name}</Text></Descriptions.Item>
        <Descriptions.Item label="Contact">{candidate.email} | {candidate.phone}</Descriptions.Item>
        <Descriptions.Item label="Overall Score">
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <Progress type="circle" percent={candidate.overallScore} size={60} strokeWidth={8} />
                <Text strong style={{ fontSize: 24, color: '#1677ff' }}>{candidate.overallScore} / 100</Text>
            </div>
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Title level={4}>AI Performance Summary</Title>
      <Paragraph type="secondary" style={{ fontStyle: 'italic' }}>{candidate.finalSummary || 'No summary available.'}</Paragraph>
      <Divider />
      <Title level={4}>Question Breakdown</Title>
      <List
        itemLayout="vertical"
        dataSource={candidate.detailedScores || []}
        renderItem={(item, index) => (
          <List.Item key={index} extra={scoreTag(item.score)}>
            <List.Item.Meta
              title={<Text strong>{`Q${index + 1}: ${item.question}`}</Text>}
              description={<Paragraph style={{ margin: 0 }}>Answer: <Text type="secondary">"{item.answer}"</Text></Paragraph>}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default CandidateDetailModal;