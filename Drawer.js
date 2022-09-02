//helps with drawing to canvas
class Drawer{
  constructor(ctx){
    this.context = ctx
    this.width = ctx.canvas.clientWidth
    this.height = ctx.canvas.clientHeight
  }

  clear(){
    this.context.clearRect(0, 0, this.width, this.height);
  }

  circle(x,y,r){
    this.context.beginPath();
    this.context.arc(x, y, r, 0, 2 * Math.PI);
    this.context.stroke();
  }

  line(toX,toY,fromX,fromY,r=0,g=0,b=0,transparency=1){
    this.context.beginPath();
    this.context.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + transparency + ')';
    this.context.moveTo(toX, toY);
    this.context.lineTo(fromX, fromY);
    this.context.stroke();
    this.context.strokeStyle = 'rgba(0,0,0,1)'
  }

  text(x,y,text, size=10){
    this.context.font = size + "px Arial";
    this.context.fillText(text, x, y);
  }
}
