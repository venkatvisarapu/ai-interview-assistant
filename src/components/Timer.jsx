import React from 'react';
import { Progress, Typography } from 'antd';

const { Text } = Typography;

const Timer = ({ timeLeft, duration }) => {
  const percentage = Math.max(0, (timeLeft / duration) * 100);
  const getStatus = () => {
    if (percentage > 50) return 'normal';
    if (percentage > 25) return 'active';
    return 'exception';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <Text style={{ minWidth: '100px', fontSize: '1.2em', fontWeight: 500 }}>Time Left: {timeLeft}s</Text>
      <Progress percent={percentage} status={getStatus()} showInfo={false} />
    </div>
  );
};

export default Timer;