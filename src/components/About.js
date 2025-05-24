import React from "react";
import AboutBackground from "../images/flower-background-about.jpg";
import AboutBackgroundImage from "../images/object-detection.jpg";
import "../style/About.css"


// YOLOv8가 무엇인지 간단히 알려주는 컴포넌트
const About = () => {
  const handleClick = () => {
    const url = "https://github.com/ultralytics/ultralytics";

    window.open(url, "_blank");
  };
  return (
    <div className="about-section-container">
      <div className="overlay"></div>
      <div className="about-background-image-container">
        <img className="background-image" src={AboutBackground} alt="" />
      </div>
      <div className="about-section-image-container">
        <img src={AboutBackgroundImage} alt="" />
      </div>
      <div className="about-section-text-container">
        <p className="primary-subheading">About</p>
        <h1 className="primary-heading">
          YOLO란?
        </h1>
        <p className="about-primary-text">
        YOLO는 'You Only Look Once'의 약어입니다. 사진 속 다양한 사물을 실시간으로 감지하고 인식하는 알고리즘입니다. YOLO의 객체 탐지는 회귀 문제로 수행되며 감지된 이미지의 클래스 확률을 제공합니다.
        </p>
        <p className="about-primary-text">
        Ultralytics의 YOLOv8은 23년 1월에 출시된 YOLO detector 시리즈 모델이며 본 사이트는 해당 모델을 사용하여 꽃을 탐지하는 기능을 제공합니다.
        </p>
        <div className="about-buttons-container">
          <button className="secondary-button" onClick={handleClick}>Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default About;
