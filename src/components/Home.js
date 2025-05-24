import React from "react";
import BannerBackground from "../images/home-background-image.jpg";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import About from "./About"
import "../style/Home.css"

const Home = () => {
    const navigate = useNavigate();

    const goMainPage = () => {
        navigate('/main');
        
    }
  return (
    <div className="home-container">
      <div className="home-banner-container">
      <div className="home-overlay"></div>
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="" />
        </div>
        <div className="home-text-section">
          <h1 className="home-primary-heading">
            Flower Detection with YOLOv8
          </h1>
          <p className="home-primary-text">        
            Use a YOLOv8 object detection model trained on the Oxford flower dataset to detect flower types.
          </p>
          <button className="secondary-button" onClick={goMainPage}>
            Start <FiArrowRight />{" "}
          </button>
        </div>
        <div className="home-image-section" />
      </div>
      <About />
    </div>
  );
};

export default Home;
