!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Crop=e()}(this,(function(){"use strict";function t(t){return t.toString()+"px"}const e="__imagedCropInstance";var i;!function(t){t[t.SCALE_WIDTH=0]="SCALE_WIDTH",t[t.SCALE_HEIGHT=1]="SCALE_HEIGHT",t[t.SCALE_BOTH=2]="SCALE_BOTH"}(i||(i={}));return class{initializeDragEvents(){this.listeners.dragStart=t=>{window.TouchEvent&&t instanceof TouchEvent?(this.xOffset=t.touches[0].clientX,this.yOffset=t.touches[0].clientY):(this.xOffset=t.clientX,this.yOffset=t.clientY);const e=t.target;this.coefficients[e.id]&&(this.oldSelection=this.selection,this.activeKnob=e.id),e.classList.add("active")},this.listeners.dragEnd=t=>{var e,i;this.activeKnob&&(null===(i=null===(e=this.panel.shadowRoot)||void 0===e?void 0:e.getElementById(this.activeKnob))||void 0===i||i.classList.remove("active"),this.activeKnob=void 0)},this.listeners.drag=t=>{if(this.activeKnob){let e,i;window.TouchEvent&&t instanceof TouchEvent?(e=t.touches[0].clientX-this.xOffset,i=t.touches[0].clientY-this.yOffset):(e=t.clientX-this.xOffset,i=t.clientY-this.yOffset),this.updateSelection(e,i)}},document.addEventListener("touchend",this.listeners.dragEnd,!1),document.addEventListener("touchmove",this.listeners.drag,!1),document.addEventListener("mouseup",this.listeners.dragEnd,!1),document.addEventListener("mousemove",this.listeners.drag,!1);const t=t=>{null==t||t.addEventListener("touchstart",this.listeners.dragStart,!1),null==t||t.addEventListener("mousedown",this.listeners.dragStart,!1)};Object.keys(this.coefficients).forEach((e=>t(this.frame.querySelector("#"+e)))),t(this.frame)}initializeSelection(){var t,e,i,n,s;const a=this.image.getBoundingClientRect(),o=a.width/a.height,r=(null===(t=this.options)||void 0===t?void 0:t.aspectRatio)||o;let h=a.width,l=a.height;r>o?l=h/r:h=l*r,this.selection={x1:a.width/2-h/2,y1:a.height/2-l/2,x2:a.width/2+h/2,y2:a.height/2+l/2},this.oldSelection=this.selection,this.minApparentWidth=32,(null===(e=this.options)||void 0===e?void 0:e.minOutputWidth)&&(this.minApparentWidth=Math.min(a.width,Math.max(this.minApparentWidth,this.options.minOutputWidth*(a.width/this.image.naturalWidth)))),this.minApparentHeight=32,(null===(i=this.options)||void 0===i?void 0:i.minOutputHeight)&&(this.minApparentHeight=Math.min(a.height,Math.max(this.minApparentHeight,this.options.minOutputHeight*(a.height/this.image.naturalHeight)))),this.maxApparentWidth=a.width,(null===(n=this.options)||void 0===n?void 0:n.maxOutputWidth)&&(this.maxApparentWidth=Math.min(this.maxApparentWidth,this.options.maxOutputWidth*(a.width/this.image.naturalWidth))),this.maxApparentHeight=a.height,(null===(s=this.options)||void 0===s?void 0:s.maxOutputHeight)&&(this.maxApparentHeight=Math.min(this.maxApparentHeight,this.options.maxOutputHeight*(a.height/this.image.naturalHeight))),this.updateSelection(0,0)}enforceAspectRatio(t,e,n){var s;const a=null===(s=this.options)||void 0===s?void 0:s.aspectRatio;if(a){const s=t.x2-t.x1,o=t.y2-t.y1;let r=s,h=o;switch(n){case i.SCALE_WIDTH:h=s/a;break;case i.SCALE_HEIGHT:r=o*a;break;case i.SCALE_BOTH:s/a>o?r=o*a:h=s/a}t.x1-=e.ax1*(r-s),t.y1-=e.ay1*(h-o),t.x2+=e.ax2*(r-s),t.y2+=e.ay2*(h-o)}}updateSelection(t,e){const n=this.image.getBoundingClientRect(),s=this.coefficients[this.activeKnob||"frame"],a={x1:this.oldSelection.x1+s.dx1*t,y1:this.oldSelection.y1+s.dy1*e,x2:this.oldSelection.x2+s.dx2*t,y2:this.oldSelection.y2+s.dy2*e};if(this.enforceAspectRatio(a,s,s.rule),a.x1<0&&(a.x2-=a.x1*s.dx2,a.x2+=a.x1*s.ax2*2,a.x1=0),a.y1<0&&(a.y2-=a.y1*s.dy2,a.y2+=a.y1*s.ay2*2,a.y1=0),a.x2>n.width){const t=a.x2-n.width;a.x1-=t*s.dx1,a.x1+=t*s.ax1*2,a.x2=n.width}if(a.y2>n.height){const t=a.y2-n.height;a.y1-=t*s.dy1,a.y1+=t*s.ay1*2,a.y2=n.height}const o=a.x2-a.x1,r=a.y2-a.y1;if(o<this.minApparentWidth){const t=this.minApparentWidth-o;a.x1-=t*s.ax1,a.x2+=t*s.ax2}if(o>this.maxApparentWidth&&(a.x1=this.selection.x1,a.x2=this.selection.x1+this.maxApparentWidth),r<this.minApparentHeight){const t=this.minApparentHeight-r;a.y1-=t*s.ay1,a.y2+=t*s.ay2}r>this.maxApparentHeight&&(a.y1=this.selection.y1,a.y2=this.selection.y1+this.maxApparentHeight),this.enforceAspectRatio(a,s,i.SCALE_BOTH),this.selection=a,this.refreshSelection()}refreshSelection(){var e,i;this.light.setAttribute("x",t(this.selection.x1)),this.light.setAttribute("y",t(this.selection.y1)),this.light.setAttribute("width",t(this.selection.x2-this.selection.x1)),this.light.setAttribute("height",t(this.selection.y2-this.selection.y1)),this.frame.style.left=t(this.selection.x1),this.frame.style.top=t(this.selection.y1),this.frame.style.width=t(this.selection.x2-this.selection.x1),this.frame.style.height=t(this.selection.y2-this.selection.y1),null===(i=null===(e=this.options)||void 0===e?void 0:e.onCrop)||void 0===i||i.call(this)}constructor(n,s){var a,o,r;if(this.options=s,this.listeners={},this.selection={x1:0,y1:0,x2:0,y2:0},this.oldSelection={x1:0,y1:0,x2:0,y2:0},this.minApparentWidth=0,this.minApparentHeight=0,this.maxApparentWidth=0,this.maxApparentHeight=0,this.coefficients={n:{dx1:0,dy1:1,dx2:0,dy2:0,ax1:.5,ay1:1,ax2:.5,ay2:0,rule:i.SCALE_HEIGHT},e:{dx1:0,dy1:0,dx2:1,dy2:0,ax1:0,ay1:.5,ax2:1,ay2:.5,rule:i.SCALE_WIDTH},s:{dx1:0,dy1:0,dx2:0,dy2:1,ax1:.5,ay1:0,ax2:.5,ay2:1,rule:i.SCALE_HEIGHT},w:{dx1:1,dy1:0,dx2:0,dy2:0,ax1:1,ay1:.5,ax2:0,ay2:.5,rule:i.SCALE_WIDTH},ne:{dx1:0,dy1:1,dx2:1,dy2:0,ax1:0,ay1:1,ax2:1,ay2:0,rule:i.SCALE_BOTH},se:{dx1:0,dy1:0,dx2:1,dy2:1,ax1:0,ay1:0,ax2:1,ay2:1,rule:i.SCALE_BOTH},sw:{dx1:1,dy1:0,dx2:0,dy2:1,ax1:1,ay1:0,ax2:0,ay2:1,rule:i.SCALE_BOTH},nw:{dx1:1,dy1:1,dx2:0,dy2:0,ax1:1,ay1:1,ax2:0,ay2:0,rule:i.SCALE_BOTH},frame:{dx1:1,dy1:1,dx2:1,dy2:1,ax1:0,ay1:0,ax2:0,ay2:0,rule:i.SCALE_BOTH}},this.activeKnob=void 0,this.xOffset=0,this.yOffset=0,this.image=function(t){let e=null;if(e="string"==typeof t?document.querySelector(t):t,!(e instanceof HTMLImageElement))throw new Error("Crop target must be an image element or a CSS selector pointing to one.");return e}(n),this.image.dataset[e])throw new Error("ImagedCrop: Target image already has a Crop instance attached!");this.image.dataset[e]="true",this.panel=document.createElement("div"),this.panel.style.position="absolute",this.panel.style.border="none",this.panel.style.background="none",this.panel.style.left=t(0),this.panel.style.top=t(0),this.panel.style.right=t(0),this.panel.style.bottom=t(0);const h=this.panel.attachShadow({mode:"open"});h.innerHTML=`\n            <style>\n                :host {\n    --border-size: 4px;\n    --knob-size: 16px;\n\n    --knob-near: calc(0px - var(--knob-size) / 2 + var(--border-size) / 2);\n    --knob-half: calc(0px - var(--knob-size) / 2);\n    --knob-over: calc(0px - var(--knob-size) / 2 - var(--border-size) / 2);\n\n    --frame-color: #eee;\n    --active-color: #fff;\n\n    user-select: none;\n}\n\n#overlay {\n    fill: #555;\n    opacity: 0.75;\n}\n\n#frame {\n    box-sizing: content-box;\n    border: var(--border-size) solid var(--frame-color);\n    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5), inset 0 0 2px rgba(0, 0, 0, 0.5);\n    cursor: grab;\n    margin: calc(0px - var(--border-size));\n\n    transition: 100ms border-color ease-out;\n}\n\n#frame.active {\n    border-color: var(--active-color);\n}\n\n#frame .knob {\n    width: var(--knob-size);\n    height: var(--knob-size);\n\n    border-radius: 2px;\n    background-color: var(--frame-color);\n    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.8);\n\n    transition: 100ms background-color ease-out;\n}\n\n#frame .knob.active {\n    background-color: var(--active-color);\n}\n\n#n {\n    transform: translateX(var(--knob-half)) translateY(var(--knob-over));\n    left: 50%;\n    top: 0%;\n    cursor: ns-resize;\n}\n\n#ne {\n    transform: translateX(var(--knob-near)) translateY(var(--knob-over));\n    left: 100%;\n    top: 0%;\n    cursor: ne-resize;\n}\n\n#e {\n    transform: translateX(var(--knob-near)) translateY(var(--knob-half));\n    left: 100%;\n    top: 50%;\n    cursor: ew-resize;\n}\n\n#se {\n    transform: translateX(var(--knob-near)) translateY(var(--knob-near));\n    left: 100%;\n    top: 100%;\n    cursor: se-resize;\n}\n\n#s {\n    transform: translateX(var(--knob-half)) translateY(var(--knob-near));\n    left: 50%;\n    top: 100%;\n    cursor: ns-resize;\n}\n\n#sw {\n    transform: translateX(var(--knob-over)) translateY(var(--knob-near));\n    left: 0%;\n    top: 100%;\n    cursor: sw-resize;\n}\n\n#w {\n    transform: translateX(var(--knob-over)) translateY(var(--knob-half));\n    left: 0%;\n    top: 50%;\n    cursor: ew-resize;\n}\n\n#nw {\n    transform: translateX(var(--knob-over)) translateY(var(--knob-over));\n    left: 0%;\n    top: 0%;\n    cursor: nw-resize;\n}\n\n                ${(null==s?void 0:s.additionalStyles)||""}\n            </style>\n            <svg id="overlay" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">\n                <mask id="mask">\n                    <rect id="shade" fill="#fff" />\n                    <rect id="light" fill="#000" ${(null===(a=this.options)||void 0===a?void 0:a.roundFrame)?'rx="50%" ry="50%"':""} />\n                </mask>\n                <rect x="0%" y="0%" width="100%" height="100%" fill="currentFill" mask="url(#mask)" />\n            </svg>\n        `,this.frame=document.createElement("div"),this.frame.setAttribute("id","frame"),this.frame.style.position="absolute",this.frame.style.borderRadius=(null===(o=this.options)||void 0===o?void 0:o.roundFrame)?"50%":"0",this.frame.innerHTML='\n            <div id="n" class="knob" style="position: absolute;"></div>\n            <div id="ne" class="knob" style="position: absolute;"></div>\n            <div id="e" class="knob" style="position: absolute;"></div>\n            <div id="se" class="knob" style="position: absolute;"></div>\n            <div id="s" class="knob" style="position: absolute;"></div>\n            <div id="sw" class="knob" style="position: absolute;"></div>\n            <div id="w" class="knob" style="position: absolute;"></div>\n            <div id="nw" class="knob" style="position: absolute;"></div>\n            <div id="legend"></div>\n        ',h.appendChild(this.frame),this.light=h.querySelector("#light"),this.shade=h.querySelector("#shade"),this.shade.setAttribute("x",t(0)),this.shade.setAttribute("y",t(0)),this.shade.setAttribute("width","100%"),this.shade.setAttribute("height","100%"),this.canvas=document.createElement("canvas"),this.initializeDragEvents(),this.initializeSelection();let l=(null===(r=this.options)||void 0===r?void 0:r.container)||this.image.parentElement;if("string"==typeof l&&(l=document.querySelector(l)),null==l||l.appendChild(this.panel),!l)throw new Error("ImagedCrop: Invalid container specified!")}toCoordinates(){const t=this.image.getBoundingClientRect(),e=Math.round(this.selection.x1/t.width*this.image.naturalWidth),i=Math.round(this.selection.x2/t.width*this.image.naturalWidth),n=Math.round(this.selection.y1/t.height*this.image.naturalHeight);return{x:e,y:n,width:i-e,height:Math.round(this.selection.y2/t.height*this.image.naturalHeight)-n}}toCanvas(){var t;const e=this.toCoordinates();this.canvas.width=e.width,this.canvas.height=e.height;const i=this.canvas.getContext("2d");return i&&(i.fillStyle=(null===(t=this.options)||void 0===t?void 0:t.backgroundColor)||"#ffffff",i.fillRect(0,0,e.width,e.height),i.drawImage(this.image,e.x,e.y,e.width,e.height,0,0,e.width,e.height)),this.canvas}toDataUrl(t="image/png",e){return this.toCanvas().toDataURL(t,e)}async toBlob(t="image/png",e){const i=this.toCanvas();return new Promise(((n,s)=>{i.toBlob((t=>{t?n(t):s("Failed to crop image!")}),t,e)}))}destroy(){var t;document.removeEventListener("touchend",this.listeners.dragEnd,!1),document.removeEventListener("touchmove",this.listeners.drag,!1),document.removeEventListener("mouseup",this.listeners.dragEnd,!1),document.removeEventListener("mousemove",this.listeners.drag,!1),null===(t=this.panel)||void 0===t||t.remove(),delete this.image.dataset[e]}}}));
//# sourceMappingURL=Crop.js.map