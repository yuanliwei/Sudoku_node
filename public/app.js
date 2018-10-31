class App {
  constructor() {

    let btn = document.createElement('button')
    btn.innerText = 'capture'
    btn.onclick = ()=>{
      img.src = '/capture?'+Math.random()
    }
    window.onkeydown = ()=>{
      img.src = '/capture?'+Math.random()
    }

    this.scale = 0.3
    this.ddd_x1 = 2
    this.ddd_y1 = 112
    this.ddd_y2 = 34
    this.ddd_x2 = 34
    this.board_x1 = 2
    this.board_y1 = 160
    this.board_y2 = 320
    this.board_x2 = 320
    this.btn_x1 = 0
    this.btn_y1 = 585
    this.btn_x2 = 320
    this.btn_y2 = 46
    const {Neuron, Layer, Network, Trainer, Architect } = synaptic
    this.net = Network.fromJSON(netData)
    var canvas = this.canvas = document.createElement('canvas')
    var canvas2 = this.canvas2 = document.createElement('canvas')
    canvas2.style.position = "absolute"
    canvas2.style.bottom = '0px'
    canvas2.style.right = '0px'
    canvas2.width = 800
    canvas2.height = 200
    var g = this.g = canvas.getContext('2d')
    window.g = g
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.append(canvas)
    // document.body.append(canvas2)
    this.ct = new Chart(canvas2, {
      type: 'line',
      data:{
        labels:[],
        datasets:[{
          backgroundColor: '#f4acbb',
          borderColor: '#fc587c',
          label:'学习误差',
          data:[],
          fill: 'start'
        }]
      },
      options: {
        responsive: true,
        title:{
          display:true,
          text:'Min and Max Settings'
        },
        scales: {
          yAxes: [{
            ticks: {
              min: 0,
              max: 1
            }
          }]
        }
      }
    })
    this.ct.data.labels = '123456789'.split('')
    this.ct.data.datasets[0].data = '000000000'.split('')
    this.ct.update()
    var img = this.img = new Image()
    img.onload = ()=>{
      this.drawImg()
      this.analysis()
      this.drawButtons()
    }
    // img.src = './train_data/001.png'
    img.src = '/capture'

    var change = ()=>{
      this.drawImg()
      this.drawButtons()
    }
    var gui = new dat.GUI();
    gui.add(this, 'ddd_x1', 0, 900).onChange(change);
    gui.add(this, 'ddd_y1', 0, 900).onChange(change);
    gui.add(this, 'ddd_y2', 0, 60).onChange(change);
    gui.add(this, 'ddd_x2', 0, 60).onChange(change);
    gui.add(this, 'board_x1', 0, 900).onChange(change);
    gui.add(this, 'board_y1', 0, 900).onChange(change);
    gui.add(this, 'board_y2', 0, 960).onChange(change);
    gui.add(this, 'board_x2', 0, 960).onChange(change);
    gui.add(this, 'btn_x1', 0, 900).onChange(change);
    gui.add(this, 'btn_y1', 0, 900).onChange(change);
    gui.add(this, 'btn_x2', 0, 960).onChange(change);
    gui.add(this, 'btn_y2', 0, 960).onChange(change);
  }

  drawImg(){
    const {g, img, scale} = this
    const {width, height} = img
    var {w,h} = {w:width*scale,h:height*scale}
    g.drawImage(img,0,0,w,h)

    g.strokeRect(this.board_x1, this.board_y1, this.board_x2, this.board_y2)
  }

  drawButtons(){
    g.strokeRect(this.btn_x1, this.btn_y1, this.btn_x2, this.btn_y2)
  }

  analysis(){
    const {g, img, scale} = this
    const {width, height} = img
    var {w,h} = {w:width*scale,h:height*scale}
    var x = 0, y = 0;

    var s = ''
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        s+= this.getNumIn(i,j)
      }
    }
    var puzzleText = s.replace(/0/g,'.')
    console.log(puzzleText);
    question = puzzleText
    var sol = search(parse_grid(puzzleText))
    console.log(sol);
    if(steps.length==0) return
    var keys = {}
    steps.reverse()
    var temArr = []
    for (var i = 0; i < steps.length; i++) {
      var step = steps[i]
      if (!keys[step.i]) {
        temArr.push(step)
      }
      keys[step.i] = step
    }
    steps = temArr.reverse()
    console.log(JSON.stringify(steps));

    var ss = []
    var temArr = []
    while(steps.length > 0){
      var step = steps.shift()
      temArr.push(step)
      this.appendStep(ss, step)
    }
    this.GET('/steps?steps='+JSON.stringify(ss))

    // var time = temArr.length * 1.45 * 1000
    // setTimeout(()=>{
    //   console.log('time out 1');
    //   var ss = []
    //   var btn = this.getNumberPosition(8)
    //   ss.push(btn)
    //   this.GET('/steps?steps='+JSON.stringify(ss))
    //   setTimeout(()=>{
    //     var ss = []
    //     var btn = this.getTargetPosition(8,5)
    //     ss.push(btn)
    //     this.GET('/steps?steps='+JSON.stringify(ss))
    //     console.log('time out 2');
    //     setTimeout(()=>{
    //       console.log('time out 3');
    //       img.src = '/capture?'+Math.random()
    //     }, 4000)
    //   },3000)
    // }, time)

    var ff = ()=>{
      var step = temArr.shift()
      var x = 0, y = 0;
      const {i,v} = step
      x = parseInt(step.i/9)
      y = step.i%9
      var p = this.getTargetPosition(x,y)
      g.font = '24px Arial'
      g.fillStyle = '#FFFF00'
      g.fillText(step.v,p.x*scale-7,p.y*scale+8)
      if (temArr.length>0) {
        setTimeout(ff,100)
      }
    }
    setTimeout(ff,100)
  }

  GET(url, callback) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.send()
  }

  appendStep(steps, step){
    var x = 0, y = 0;
    const {i,v} = step
    x = parseInt(i/9)
    y = i%9
    var p = this.getTargetPosition(x,y)
    steps.push(p)
    var btn = this.getNumberPosition(v)
    steps.push(btn)
  }

  getNumFromSample(sample){
    const {net} = this
    var out = net.activate(sample.data)
    for (var i = 0; i < out.length; i++) {
      if(out[i]>0.5){
        this.ct.data.datasets[0].data[i] = out[i]
        this.ct.update()
        return i + 1
      }
    }
    return 0;
  }

  drawSample(sample){
    const {g, img, scale} = this
    const {width, height} = img
    var {w,h} = {w:width*scale,h:height*scale}

    var step = 10
    for (var i = 0; i < sample.height; i++) {
      for (var j = 0; j < sample.width; j++) {
        if (sample.data[i*sample.width+j]==1) {
          g.strokeStyle = '#FF0000'
        } else {
          g.strokeStyle = '#000000'
        }
        g.strokeRect(j*(step+3),i*(step+3),step,step)
        g.stroke()
      }
    }
  }

  getNumIn(x,y){
    const {g, img, scale} = this
    const {width, height} = img
    var {w,h} = {w:width*scale,h:height*scale}
    var areaImgData = this.getAreaImgData(x,y)
    var sample = this.getSample(areaImgData)
    if (sample.data) {
      return this.getNumFromSample(sample)
    }
    return 0
  }

  getTargetPosition(x,y){
    const {g, img, scale} = this
    const {width, height} = img
    const {board_x1, board_y1, board_y2, board_x2} = this
    const [x1,y1,w,h] = [board_x1, board_y1, board_y2, board_x2]
    var step = w / 9
    var edge = 2
    return {
      x: parseInt((x1+y*step + edge + step / 2)/scale),
      y: parseInt((y1+x*step+edge + step / 2)/scale)
    }
  }

  getNumberPosition(num){
    const {g, img, scale} = this
    const {width, height} = img
    const {btn_x1, btn_y1, btn_x2, btn_y2} = this
    const [x1,y1,w,h] = [btn_x1, btn_y1, btn_x2, btn_y2]
    var step = w / 9
    var edge = 2
    return {
      x: parseInt((x1 + step * num - step / 2)/scale),
      y: parseInt((y1+step/2)/scale)
    }
  }

  getAreaImgData(x,y){
    const {g, img, scale} = this
    const {width, height} = img
    const {board_x1, board_y1, board_y2, board_x2} = this
    const [x1,y1,w,h] = [board_x1, board_y1, board_y2, board_x2]
    var step = w / 9
    var edge = 2
    return g.getImageData(x1+y*step + edge,y1+x*step+edge,step-2*edge,step-2*edge)
  }

  getSample(imgData){
    const {g, img, scale} = this
    const {width, height, data} = imgData
    var std = {r:255,g:255,b:255}
    var x1,x2,y1,y2,tempImg = []
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        let r = imgData.data[(i*width+j)*4],
            g = imgData.data[(i*width+j)*4+1],
            b = imgData.data[(i*width+j)*4+2],
            a = imgData.data[(i*width+j)*4+3];
        let cur = {r:r,g:g,b:b}
        let diff = this.diffColor(cur,std)
        if (diff < 3) {
          if (!x1&&!x2) {
            x1 = x2 = j
            y1 = y2 = i
          }
          x1 = (x1>j)?j:x1
          x2 = (x2<j)?j:x2
          y1 = (y1>i)?i:y1
          y2 = (y2<i)?i:y2
          tempImg.push(1)
        } else {
          tempImg.push(0)
        }
      }
    }
    if (!x1) {
      return {};
    }

    // 固定图片大小
    var tem = {}
    tem.data = []
    tem.width = 16
    tem.height = 22
    x1 = parseInt(x1 - (tem.width - (x2 - x1))/2)
    x2 = x1 + tem.width
    y1 = parseInt(y1 - (tem.height - (y2 - y1))/2)
    y2 = y1 + tem.height
    for (var i = y1; i < y2; i++) {
      for (var j = x1; j < x2; j++) {
        tem.data.push(tempImg[i*width+j])
      }
    }
    // console.log(x1,y1,x2,y2,(x2-x1),(y2-y1));
    return tem
  }

  diffColor(c1, c2){
    return (c1.r - c2.r) * (c1.r - c2.r) +
    (c1.g - c2.g) * (c1.g - c2.g) +
    (c1.b - c2.b) * (c1.b - c2.b);
  }
}

var lastResult = false
var steps = []
var question = false
new App()

function show(values, squares) {
  var tem = ''
  for (var s in squares){
    if (values[squares[s]].length == 1) {
      tem+=values[squares[s]]
    } else {
      tem += '.'
    }
  }
  if (!lastResult) {
    lastResult = tem
    return
  }
  for (var i = 0; i < tem.length; i++) {
    if (question.charAt(i)!='.') continue
    var c1 = lastResult.charAt(i)
    var c2 = tem.charAt(i)
    if (c2 == '.') continue
    if (c1 == c2) continue
    if (!parseInt(c2)) {
      debugger
    }
    steps.push({i:i,v:parseInt(c2)})
  }
  lastResult = tem
  console.log(tem);
}
