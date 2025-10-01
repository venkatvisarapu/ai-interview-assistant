import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Table, Input, Button, Empty, Typography, Tag, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import CandidateDetailModal from '../components/CandidateDetailModal.jsx';

const { Title, Paragraph } = Typography;
const { Search } = Input;

const InterviewerPage = () => {
  const interviewState = useSelector((state) => state.interview);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  
  if (!interviewState || !interviewState.candidates) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin tip="Loading Candidate Data..." size="large" />
      </div>
    );
  }

  const allCandidates = Object.values(interviewState.candidates);

  const filteredCandidates = useMemo(() => {
    const completed = allCandidates.filter(c => c.finalSummary && c.name);
    if (!searchQuery) return completed;
    return completed.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allCandidates, searchQuery]);

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalVisible(true);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Overall Score',
      dataIndex: 'overallScore',
      key: 'score',
      sorter: (a, b) => a.overallScore - b.overallScore,
      render: (score) => {
        let color = score > 75 ? 'success' : score > 50 ? 'processing' : 'error';
        return <Tag color={color} key={score} style={{ fontSize: 14, padding: '4px 8px' }}>{score || 0} / 100</Tag>;
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>View Details</Button>,
    },
  ];

  return (
    <div>
      <Title level={2}>Candidate Dashboard</Title>
      <Paragraph type="secondary">Review all completed candidate interviews. Sort by name or score, or search by name/email.</Paragraph>
      <Search
        placeholder="Search by name or email"
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '20px', maxWidth: '400px' }}
        allowClear
      />
      <Table
        dataSource={filteredCandidates}
        columns={columns}
        rowKey="id"
        locale={{ emptyText: <Empty description="No completed interviews match your search." /> }}
      />
      {selectedCandidate && (
        <CandidateDetailModal
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
};

export default InterviewerPage;