import * as React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import "../style/LinearWithValueLabel.css";
import useMediaQuery from '@mui/material/useMediaQuery';


function LinearProgressWithLabel(props) {
    const isMobile = useMediaQuery('(max-width: 600px)');
    return (
        <div className="wrapper" {...props}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60%', 
            height: '60%', 
          }}>
            <Typography variant="h4" color="white" sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>Loading Model...</Typography>
            <Box sx={{ width: '100%', mt: 1 }}>
              <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35, mt: 1 }}>
              <Typography variant="body2" color="white">{`${props.value}%`}</Typography>
            </Box>
          </Box>
        </div>
    );
}

// 0 ~ 100사이의 값으로 모델 로딩 진행 표시
LinearProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
};

export default function LinearWithValueLabel(props) {
  
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel value={props.value} />
    </Box>
  );
}
