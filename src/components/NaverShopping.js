import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CardMedia, CircularProgress, Grid } from '@mui/material';
import "../style/NaverShopping.css"
import { useParams } from 'react-router-dom';

const NaverShopping = () => {
  const [naverShoppingResults, setNaverShoppingResults] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [currentPage, setCurrentPage]  = useState(1);
  const [totalJsonData, setTotalJsonData] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const { key } = useParams();
  const noResult = ['꽃도라지', '나무양귀비', '브로멜리아', '봄맞이꽃', '비단목메꽃', '비숍 달리아', '아카울리스용담', '어저귀', '왕자의 깃털', '용왕꽃', '카우틀레이아 스피카타', '카틀레야 라비아타', '칼라', '달난초', '풀협죽도', '홍학꽃', '홍초', '홍화월도' ];
  const addKeyword = ['동백나무', '민들레', '베르가못', '스위트피', '아티초크', '장미', '카네이션', '해바라기']
  const dahlia = ['달리아(오렌지)']
  const filter = ['글로리오사', '동자꽃', '독일붓꽃', '뻐꾹나리', '삼색제비꽃', '서양민들레', '수염패랭이꽃', '알스트로메리아', '옥스아이데이지', '우창꽃', '태양국', '투구꽃', '하와이무궁화' ]
  
  useEffect(() => {
    handleNaverSearch(key);
    // eslint-disable-next-line
  }, [key]);


  // 네이버 쇼핑 API를 사용해 쇼핑 검색 결과를 가져오는 함수
  const handleNaverSearch = async (flowername) => {
    try {
      setIsEmpty(false);
      setNaverShoppingResults([]);
      setPageNum(1);
      setCurrentPage(1);
      
      var search = flowername;

      if (addKeyword.includes(flowername)) {
        search = flowername + ' 모종';
        console.log(search);
      }
      else if (dahlia.includes(flowername)) {
        search = '다알리아 모종';
        console.log(search);
      }

      const response = await axios.get(`https://fdy-server-bk39.onrender.com/naver-shopping?flowername=${key}`);
      const jsonData = response.data;
      let filteredResults = null;
      if (filter.includes(flowername)) {
        filteredResults = jsonData.items.filter((item) => (item.category3 === "씨앗/모종" || item.category3 === "조경수/묘목") && item.title.includes(flowername));
      }
      else {
        filteredResults = jsonData.items.filter((item) => (item.category3 === "씨앗/모종" || item.category3 === "조경수/묘목") );
        console.log('나머지');
      }
      
      if (noResult.includes(flowername)) {
        setNaverShoppingResults([]);
        setTotalJsonData({});
        setPageNum(1);
        setCurrentPage(1);
        setIsEmpty(true);
      }
      else {
        setNaverShoppingResults(filteredResults.slice(0, 10));
        setTotalJsonData(filteredResults);
        setPageNum(Math.ceil(filteredResults.length / 10));
      }
      if (filteredResults.length === 0) {
        setIsEmpty(true);
      }
    } catch (error) {
      console.error('Error searching on Naver Shopping:', error);
    }
  };

  // 검색 결과를 페이지에 따라 10개씩 가져오는 함수
  const handlePaginationChange = (event, page) => {
    setNaverShoppingResults(totalJsonData.slice((page - 1) * 10, page * 10));
    setCurrentPage(page);
  };

  const comma = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const card = (item) => (
    <React.Fragment>
      <CardMedia
        component="img"
        height="200"
        image={item.image} />
      <CardContent>
        <Typography sx={{ fontSize: 18, wordBreak: 'keep-all' }} color="black" gutterBottom>
          <span dangerouslySetInnerHTML={{ __html: item.title }} />
        </Typography>
        <Typography sx={{ mb: 1.5, fontSize: 13, fontWeight: 'bold' }} >
          가격: {comma(item.lprice)}원
        </Typography>
        <Typography variant="body2">
          {item.mallName}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => {
          window.open(`${item.link}`, "_blank");
        }}>구매 사이트로 이동</Button>
      </CardActions>
    </React.Fragment>
  );

  return (
    <div>
      {naverShoppingResults.length > 0 && (
        <div className='Navershopping'>
          <h2 style={{ textAlign: 'center', marginTop: "2rem" }}>'{key}' 모종 검색</h2>
          <Box sx={{ minWidth: 275, maxWidth: "90%", margin: '2rem', marginBottom: '2rem' }}>
            <Grid container spacing={2} justifyContent="center">
              {naverShoppingResults.map((item, index) => (
                <Grid item key={index}>
                  <Card variant="outlined" sx={{ width: 300, height: 'auto', margin: "0.5rem" }} >{card(item)}</Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </div>
      )}
      {(naverShoppingResults.length === 0 && isEmpty === false) && (
        <div className='No-Result'>
          <CircularProgress />
          <p style={{marginTop: "2rem"}}>검색 결과를 가져오는 중이니 잠시만 기다려주세요.</p>
        </div>
      )}
      {(naverShoppingResults.length === 0 && isEmpty === true) && (
        <div className='No-Result'>
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
      <Stack spacing={2}>
        <Pagination count={pageNum ? pageNum : 1} defaultPage={1} page={currentPage} siblingCount={0} style={{ justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginTop: '2rem', marginBottom: '1rem' }} onChange={handlePaginationChange} />
      </Stack>
    </div>
  )
}

export default NaverShopping;