import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "./style/App.css";
import Main from "./components/Main";
import Home from "./components/Home";
import SearchAppBar from "./components/SearchAppbar";
import NaverShopping from "./components/NaverShopping";
import SearchResult from "./components/SearchResult"

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <SearchAppBar/>
        <div>
          <Routes>
            <Route path='/' element={<Home />}/>
            <Route path='/Main' element={<Main />}/>
            <Route path='/searchResult' element={<SearchResult />}/>
            <Route path='/naverShopping/:key' element={<NaverShopping />}/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;