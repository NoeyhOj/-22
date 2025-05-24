// 랜더 박스와 관련된 코드

/**
 * 예측 상자 랜더 함수
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Array} boxesToDraw 
 */
export const renderBoxes = (ctx, boxesToDraw) => {
    // 폰트 설정
    const font = `${Math.max(
      Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
      14
    )}px Arial`;
    ctx.font = font;
    ctx.textBaseline = "top";
  
    boxesToDraw.forEach((e) => {
      const score = (e.score * 100).toFixed(1);
  
      let [y1, x1, height, width] = e.box;
  
      // 박스 경계 그리기
      ctx.strokeStyle = e.color;
      ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
      ctx.strokeRect(x1, y1, width, height);
  
      // label background 그리기
      ctx.fillStyle = e.color;
      const textWidth = ctx.measureText(e.label + " - " + score + "%").width;
      const textHeight = parseInt(font, 10); // base 10
      const yText = y1 - (textHeight + ctx.lineWidth);
      ctx.fillRect(
        x1 - 1,
        yText < 0 ? 0 : yText, 
        textWidth + ctx.lineWidth,
        textHeight + ctx.lineWidth
      );
  
      // 꽃 이름과 score 출력
      ctx.fillStyle = "#ffffff";
      ctx.fillText(e.label + " - " + score + "%", x1 - 1, yText < 0 ? 0 : yText);
    });
  };
  
  export class Colors {
    // ultralytics color palette https://ultralytics.com/
    constructor() {
      this.palette = [
        "#FF3838",
        "#FF9D97",
        "#FF701F",
        "#FFB21D",
        "#CFD231",
        "#48F90A",
        "#92CC17",
        "#3DDB86",
        "#1A9334",
        "#00D4BB",
        "#2C99A8",
        "#00C2FF",
        "#344593",
        "#6473FF",
        "#0018EC",
        "#8438FF",
        "#520085",
        "#CB38FF",
        "#FF95C8",
        "#FF37C7",
      ];
      this.n = this.palette.length;
    }
  
    get = (i) => this.palette[Math.floor(i) % this.n];
  
    static hexToRgba = (hex, alpha) => {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : null;
    };
  }
  