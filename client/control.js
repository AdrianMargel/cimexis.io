
class Control{
	constructor(){
		this.pressedKeys = {};
		this.mousePosReal=new Vector();
		this.mouseDown = false;
	}
	connect(canvas){
		window.onkeyup = (e)=>{ this.pressedKeys[e.keyCode] = false; }
		window.onkeydown = (e)=>{ this.pressedKeys[e.keyCode] = true; }

		canvas.onmousedown = ()=>{ 
			this.mouseDown=true;
		}
		document.body.onmouseup = ()=>{
			this.mouseDown=false;
		}
		
		canvas.onmousemove = (e)=>{this.trackMouse(e)};
	}
	trackMouse(e){
		this.mousePosReal=new Vector(e.offsetX,e.offsetY);
	}
	getMouse(cam){
		let mPos=new Vector(this.mousePosReal);
		mPos.sclVec(1/cam.zoom);
		mPos.addVec(cam.pos);
		return mPos;
	}
}
