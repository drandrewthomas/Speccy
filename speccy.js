var fftsize=256,rawfft=[],fftmax=256;
var ac,analyser,node,sr,bins,fft,maxf=0;
var spcan,swidth,sheight;
var wfcan,wwidth,wheight,wlines=0,ft=true;

//document.getElementById("avg").innerHTML=avg;
  
window.onload=function(e)
{
  spcan=document.getElementById("speccanvas").getContext("2d");
  swidth=spcan.canvas.width;
  sheight=spcan.canvas.height;
  wfcan=document.getElementById("wfalcanvas").getContext("2d");
  wwidth=wfcan.canvas.width;
  wheight=wfcan.canvas.height;
  record(new AudioContext());
  setInterval(drawdata,50);
//console.log(sr);
};

function record(context)
{
  ac=new AudioContext();
  navigator.webkitGetUserMedia({audio: true},sound,error);
  sr=ac.sampleRate;

  function sound(stream)
  {
    var c;
    analyser=ac.createAnalyser();
    analyser.smoothingTimeConstant=0.2;
    analyser.fftSize=fftsize*8;
    bins=analyser.frequencyBinCount;
    node=ac.createScriptProcessor(512,1,1);
    node.onaudioprocess=function()
    {
      var array=new Uint8Array(fftsize);
      analyser.getByteFrequencyData(array);
      for(c=0;c<fftsize;c++) rawfft[c]=array[c];
    };
    var input=ac.createMediaStreamSource(stream);
    input.connect(analyser);
    analyser.connect(node);
    node.connect(ac.destination);
  }

  function error ()
  {
    console.log("Audio error");
  }

}

function drawdata()
{
  fft=rawfft.slice();
  drawspectrum();
  drawwaterfall();
  maxf=(((sr/2)*(fftsize/bins))/1000).toPrecision(2);
  document.getElementById("freq").innerHTML=maxf+" kHz";
}

function drawspectrum()
{
  var c,gr;
  spcan.clearRect(0,0,swidth,sheight);
  gr=spcan.createLinearGradient(0,0,0,100);
  gr.addColorStop(0,"red");
  gr.addColorStop(1,"green");
  spcan.fillStyle=gr;
  for(c=0;c<fftsize;c++)
  {
    spcan.fillRect(c,sheight-constrain(mapf(fft[c],0,fftmax,2,sheight),0,sheight),1,sheight);
  }
}

function drawwaterfall()
{
  var c,r,g,i;
  if(wlines==(wheight-1))
  {
    if(ft==true) ft=false;
    else
    {
      i=wfcan.getImageData(0,1,wwidth,wheight-1);
      wfcan.putImageData(i,0,0);
    }
  }
  for(c=0;c<fftsize;c++)
  {
    r=Math.floor(constrain(mapf(fft[c],0,fftmax,0,255),0,255));
    g=255-r;
    wfcan.fillStyle="rgba("+r+","+g+",0,255)";
    wfcan.fillRect(c,wlines,1,1);
  }
  if(wlines<(wheight-1)) wlines++;
}

function mapf(s,a1,a2,b1,b2)
{
  return b1+(s-a1)*(b2-b1)/(a2-a1);
}

function constrain(s,a,b)
{
  var r=s;
  if(r<a) r=a;
  if(r>b) r=b;
  return r;
}
