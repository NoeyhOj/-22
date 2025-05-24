import React, { useCallback, useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Webcam from "react-webcam";
import LinearWithValueLabel from "./LinearWithValueLabel";
import Button from '@mui/material/Button';
import ClassBar from "./ClassBar";
import "../style/Main.css";
import { Box, Slider } from "@mui/material";
import { CameraAlt, InsertPhoto } from "@mui/icons-material";
import labels from "../utils/labels.json";
import { renderBoxes, Colors } from "../utils/renderBox";

import Dialog from "@mui/material/Dialog";
import SearchResult from "./SearchResult"; // SearchResult 컴포넌트 경로에 맞게 수정해야 함
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

const Main = () => {

    const [loading, setLoading] = useState({ loading: true, progress: 0 });
    const [model, setModel] = useState({
        net: null,
        inputShape: [1, 0, 0, 3],
    });

    const canvasRef = useRef(null);
    const [dict, setDict] = useState({});
    const [myDict, setMyDict] = useState({});
    const [settingVisible, setSettingVisible] = useState(false);
    const [scoreThreshold, setScoreThreshold] = useState(0.5);
    const [open, setOpen] = useState(false); // Dialog 열림/닫힘 상태 관리

    const handleClose = () => {
        setOpen(false); // Dialog 닫기
    };

    const numClass = labels.length;
    const colors = new Colors();    

    const modelName = "yolov8n";

    useEffect(() => {
        const loadModel = async () => {
            try {
                // Main 컴포넌트에서 json 파일 가져오기 위해 replace 만약 App.js에서 수행한다면 
                // currentPath를 삭제하고 window.location.href로 설정
                const currentPath = window.location.href.replace('/main', '');
                const yolov8 = await tf.loadGraphModel(
                    `${currentPath}/${modelName}_web_model/model.json`,
                    {
                        onProgress: (fractions) => {
                            setLoading({ loading: true, progress: fractions });
                        },
                    }
                );
                // tf.randomUniform를 사용하여 무작위 입력 텐서를 생성. 더미 입력으로 모델 워밍업
                const dummyInput = tf.randomUniform(yolov8.inputs[0].shape, 0, 1, "float32");
                const warmupResults = yolov8.execute(dummyInput);
                setLoading({ loading: false, progress: 1 });

                // 더미 입력은 워밍업을 통해 출력 형상을 알아내기 위함
                setModel({
                    net: yolov8,
                    inputShape: yolov8.inputs[0].shape,
                    outputShape: warmupResults.shape,
                });
                tf.dispose([warmupResults, dummyInput]);
            } catch (error) {
                console.error("모델 로드 중 오류 발생:", error);
                setLoading({ loading: false, progress: 0 });
            }
        };

        // 모델이 아직 로드되지 않았을 때 재귀로 모델을 로드
        if (!model.net) {
            tf.ready().then(loadModel);
        }
    }, [model.net]);


    /*  detectFrame에서 하나의 프레임(이미지)에 대한 결과를 딕셔너리처럼 가져오고(dict)
    *   이를 myDict에 저장 (스트림 실시간 탐지를 위해 함수 내부에서 dict 값을 가져옴)
    *   useEffect를 통해 dict에 저장된 값을 사용해 myDict를 수정 */

    /*  하나의 이미지에서 탐지된 꽃들(key) 각각을 for문 
    *   이미 label이 존재한다면 score 값을 확인해서 갱신하는 로직
    *   현재 키가 myDict에 존재하지 않고 undefined 값이 아닐 경우 myDict에 갱신 */
    useEffect(() => {
        for (const key in dict) {
            const value = dict[key];
            if (key in myDict) {
                if (parseFloat((value.score * 100).toFixed(1)) > myDict[key].score) {
                    setMyDict((prevDict) => ({
                        ...prevDict,
                        [key]: {
                            ...prevDict[key],
                            score: parseFloat((value.score * 100).toFixed(1)),
                            color: value.color,
                        },
                    }));
                }
            } else {
                if (key !== '' && value !== undefined) {
                    setMyDict((prevDict) => ({
                        ...prevDict,
                        [key]: {
                            score: parseFloat((value.score * 100).toFixed(1)),
                            color: value.color,
                        },
                    }));
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dict]);
    
    // image resize function
    const resizeImage = (imageSrc, callback) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = 256;
            canvas.height = 256;
            ctx.drawImage(img, 0, 0, 256, 256);
            callback(canvas.toDataURL("image/jpeg"));
        };
        img.src = imageSrc;
    };

    // // handle file change
    // const handleFileChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const url = URL.createObjectURL(file);
    //         resizeImage(url, resizedImage => {
    //             setImg(resizedImage);
    //             URL.revokeObjectURL(url); // Clean up the blob URL
    //         });
    //     }
    // };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            resizeImage(url, resizedImage => {
                handleResetDetection(); // Clear previous results and canvas
                setImg(resizedImage);
                URL.revokeObjectURL(url); // Clean up the blob URL
            });
        }
    };
    
    const handleResetDetection = () => {
        setMyDict({}); // Clear detection results
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
        }
    };

    // 이미지 전처리 함수 
    // 모델로 전달되기 전에 이미지 전처리 단계
    const preprocess = (source, modelWidth, modelHeight) => {
        let xRatio, yRatio; // 바운딩 박스 비율

        const input = tf.tidy(() => {
            const img = tf.browser.fromPixels(source);

            // 이미지를 사각형으로 패딩 => [n, m] to [n, n], n > m
            const [h, w] = img.shape.slice(0, 2); // 너비와 높이 추출
            const maxSize = Math.max(w, h);

        // 이미지 크기가 모델의 입력 크기보다 크거나 같도록 확인
        if (maxSize > modelWidth || maxSize > modelHeight) {
            throw new Error("Image size exceeds model input size");
        }
        const imgPadded = img.pad([
            [0, maxSize - h], // padding y [아래쪽으로만]
            [0, maxSize - w], // padding x [오른쪽으로만]
            [0, 0],
        ]);

        xRatio = maxSize / w;
        yRatio = maxSize / h;

        return tf.image
            .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // 프레임 resize
            .div(255.0) // 정규화
            .expandDims(0); // add batch
        });

        return [input, xRatio, yRatio];
    };

    // 이미지 탐지 함수
    const detectFrame = async (source, model, canvasRef, callback = () => { }) => {

        // 모델의 폭과 너비를 가져오기
        const [modelHeight, modelWidth] = model.inputShape.slice(1, 3);

        // start scoping tf engine
        tf.engine().startScope();

        const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight); // 이미지 전처리 (모델 크기에 맞게 이미지 리사이즈)
        const res = model.net.execute(input); // 모델 실행
        const transRes = tf.tidy(() => res.transpose([0, 2, 1]).squeeze()); // transpose main result

        //  바운딩 박스들 얻기 [y1, x1, y2, x2]
        const boxes = tf.tidy(() => {
            const w = transRes.slice([0, 2], [-1, 1]);
            const h = transRes.slice([0, 3], [-1, 1]);
            const x1 = tf.sub(transRes.slice([0, 0], [-1, 1]), tf.div(w, 2)); 
            const y1 = tf.sub(transRes.slice([0, 1], [-1, 1]), tf.div(h, 2)); 
            return tf
                .concat(
                    [
                        y1,
                        x1,
                        tf.add(y1, h), //y2
                        tf.add(x1, w), //x2
                    ],
                    1
                ) // [y1, x1, y2, x2]
                .squeeze(); // [n, 4]
        });

        // 점수(신뢰도)와 클래스 명 가져오기
        const [scores, classes] = tf.tidy(() => {
            const rawScores = transRes.slice([0, 4], [-1, numClass]).squeeze(); // [n, 1]
            return [rawScores.max(1), rawScores.argMax(1)];
        });
        /*
        * Tensorflow.js에서 제공하는 NMS 함수로 중복되거나 겹치는 객체 박스 제거
        */
        const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, scoreThreshold); // do nms to filter boxes
        const detReady = tf.tidy(() =>
            tf.concat(
                [
                    boxes.gather(nms, 0),
                    scores.gather(nms, 0).expandDims(1),
                    classes.gather(nms, 0).expandDims(1),
                ],
                1 // axis
            )
        );

        // 박스를 그리기 위한 변수
        const toDraw = [];
        let value = {};

        for (let i = 0; i < detReady.shape[0]; i++) {
            const rowData = detReady.slice([i, 0], [1, 6]);
            let [y1, x1, y2, x2, score, label] = rowData.dataSync(); // [y1, x1, y2, x2, score, label]
            const color = colors.get(label); // get label color
            const upSampleBox = [
                Math.floor(y1 * yRatio), // y
                Math.floor(x1 * xRatio), // x
                Math.round((y2 - y1) * yRatio), // h
                Math.round((x2 - x1) * xRatio), // w
            ]; // upsampled box 전처리 됐던 비율에 맞춰서 다시 업샘플링 

            toDraw.push({
                box: upSampleBox,
                score: score,
                class: label,
                label: labels[label],
                color: color,
            }); // toDraw의 내용으로 캔버스에 바운딩 박스를 그림

            // score 갱신
            if (value.hasOwnProperty(labels[label])) {
                if (value[labels[label]] < score) {
                    value[labels[label]] = {
                        score: score,
                        color: color,
                    };
                }
            } else {
                value[labels[label]] = {
                    score: score,
                    color: color,
                };
            }

            tf.dispose([rowData]); // 사용하지 않는 텐서를 해제하여 메모리 확보
        }
        setDict(value);

        const ctx = canvasRef.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 초기화
        renderBoxes(ctx, toDraw); // 캔버스에 바운딩 박스 그림

        tf.engine().endScope(); // end of scoping
    };

    /* ---- react-webcam related Logic ---- */
    const [img, setImg] = useState(null);
    const webcamRef = useRef(null);
    const imageElement = new Image();
    const inputImageRef = useRef(null);
    const [selectedClassBar, setSelectedClassBar] = useState(null);

    // 후면카메라 사용
    const videoConstraints = {
        // facingMode: { exact: "environment" },
        facingMode: "environment",
    };

    // use getScreenShot() func to capture from webcam then setting image with useState
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        resizeImage(imageSrc, resizedImage => {
            setImg(resizedImage);
        });
    }, [webcamRef]);
    
    const classbar = Object.entries(myDict).map(([key, value]) => (
        <div key={key} style={{ margin: "15px 0" }}>
            <ClassBar
                key={key}
                label={key}
                bgcolor={value.color}
                isSelected={key === selectedClassBar}
                completed={value.score}
                onClick={() => handleClassBarClick(key)} />
        </div>
    ));

    const handleResetMyDict = () => {
        setMyDict({}); // 초기화
    };

    const handleClassBarClick = (key) => {
        setSelectedClassBar(key);
    }

    // const handleSetting = () => {
    //     setSettingVisible(!settingVisible);
    // };

    const newScoreThreshold = (event, newValue) => {
        setScoreThreshold(newValue);
    };

    return (
        <div className="Main">
            {loading.loading && <LinearWithValueLabel value={parseFloat((loading.progress * 100).toFixed(2))} />}
            <div className="header">
                <h1>Capture or Select Image</h1>
            </div>
            <div className="bg-content">
                <div className="content">
                    {img === null ? (
                        <>
                            <Webcam
                                audio={false}
                                mirrored={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                            />
                        </>
                    ) : (
                        <>
                            <img
                                src={img}
                                alt="screenshot"
                                onLoad={(e) => {
                                    imageElement.src = e.target.src;
                                    detectFrame(imageElement, model, canvasRef.current)
                                }}
                            />
                            <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
                        </>
                    )}
                </div>
                <div className="button-set">
                    {img === null ? (
                        <Button
                            variant="contained"
                            color="error"
                            style={{ marginRight: "5px", width: '50%', wordBreak: "keep-all", height: "5rem" }}
                            onClick={capture}
                            startIcon={<CameraAlt />}
                        >
                            Capture</Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            style={{ marginRight: "5px", width: '50%', wordBreak: "keep-all", height: "5rem" }}
                            onClick={() => {
                                setImg(null);
                                handleResetMyDict()
                            }}
                            startIcon={<CameraAlt />}
                        >Capture</Button>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        ref={inputImageRef}
                    />
                    <Button
                        variant="contained"
                        style={{ marginRight: "5px", width: '50%', height: "5rem" }}
                        size="medium"
                        onClick={() => { inputImageRef.current.click(); }}
                        width="50%"
                        startIcon={<InsertPhoto />}
                    >Image Selection</Button>
                </div>
                <div className="classbar">
                    {classbar}
                </div>
            </div>
            {settingVisible && (
                <Box sx={{ width: '75%', maxWidth: 500, alignItems: 'center' }}>
                    <Slider
                        aria-label="ScoreThreshold"
                        defaultValue={scoreThreshold}
                        valueLabelDisplay="auto"
                        step={0.05}
                        marks
                        min={0.5}
                        max={0.95}
                        onChange={newScoreThreshold}
                    />
                    <p style={{
                        textAlign: "center",
                        color: "#000000",
                        fontWeight: "bold",
                    }} >ScoreThreshold: {scoreThreshold}</p>
                    <p style={{
                        textAlign: "center",
                        marginBottom: "1rem",
                        color: "#C00000",
                        fontWeight: "bold",
                        wordBreak: "keep-all"
                    }} >* ScoreThreshold is closer to 1, do more accurate detection</p>
                </Box>
            )}
            
        </div>
    );
}

export default Main;