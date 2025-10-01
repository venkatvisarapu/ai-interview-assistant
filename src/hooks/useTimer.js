import { useState, useEffect, useRef } from 'react';


export const useTimer = (questionKey, duration, onTimeUp, enabled = true) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  const savedOnTimeUp = useRef(onTimeUp);
  useEffect(() => {
    savedOnTimeUp.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
   
    if (!enabled) {
      return;
    }

    setTimeLeft(duration);

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          savedOnTimeUp.current();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [questionKey, duration, enabled]); 

  return { timeLeft };
};