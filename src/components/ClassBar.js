import React, { useState, useEffect } from "react";
import "../style/ClassBar.css";

import Dialog from "@mui/material/Dialog";
import SearchResult from "./SearchResult"; // SearchResult 컴포넌트 경로에 맞게 수정해야 함
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

// 추론된 꽃(클래스)에 대한 percentage bar를 생성
const ClassBar = (props) => {
  const { label, bgcolor, completed, onClick } = props;
  const [currentLabel, setCurrentLabel] = useState(label);
  const [currentBgColor, setCurrentBgColor] = useState(bgcolor);
  const [currentCompleted, setCurrentCompleted] = useState(completed);
  const [open, setOpen] = useState(false); // Dialog 열림/닫힘 상태 관리

  const handleClose = () => {
    setOpen(false); // Dialog 닫기
  };

  const handleButtonClick = () => {
    setOpen(true); // Dialog 열기
  }

  const handleClick = () => {
    // 클릭 시, 전달받은 onClick 함수 호출
    onClick(label);
  };

  useEffect(() => {
    setCurrentLabel(label);
    setCurrentBgColor(bgcolor);
    setCurrentCompleted(completed);
  }, [label, bgcolor, completed]);

  const containerStyles = {
    marginBottom: "10px",
    width: '100%',
    display: 'flex', // Flexbox 레이아웃 사용
    alignItems: 'center', // 아이템을 수직 가운데로 정렬
    borderRadius: 20,
  };

  const fillerStyles = {
    height: '100%',
    width: `${currentCompleted}%`,
    backgroundColor: currentBgColor,
    transition: 'width 1s ease-in-out',
    borderRadius: 'inherit',
    textAlign: 'right'
  };

  return (
    <div className="total-container">
      <div style={containerStyles} onClick={handleClick}>
        <p className="label">
          {currentLabel}
        </p>
        <div className="progress-bar">
          <div style={fillerStyles}>
            <span className="percent">{`${currentCompleted}%`}</span>
          </div>
        </div>

        {/* SearchResulf 컴포넌트를 Dialog로 띄우기 */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="lg"
        >
          <DialogContent>
            <SearchResult key={currentLabel} label={currentLabel} />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="success"
              autoFocus onClick={handleClose}>
                닫기
              </Button>
          </DialogActions>
        </Dialog>
        <button className="btn-color" onClick={handleButtonClick}> 상세 보기</button>
      </div>
    </div>
  );
};

export default ClassBar;
