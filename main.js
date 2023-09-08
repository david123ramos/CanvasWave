const audioCtx = new AudioContext();
const ZERO_BYTE_RANGE = 128.0;
/**
 * @type {HTMLAudioElement}
 */
let soundElement = document.querySelector("#sound");
const playCheckbox = document.querySelector("#playButton");
const playPauseBtn = document.querySelector("#play-pause-btn");
const toggleMicUse = document.querySelector("#use-mic-btn");
const micUseCheck = document.querySelector("#activeMicButton");
const volumeRange = document.querySelector("#volume");
const stereoRange = document.querySelector("#stereo");
const soundViewer = document.querySelector("#soundViewer");
const soundTitle = document.querySelector("#sound-title");
/**
 * @type {CanvasRenderingContext2D}
 */
const ctxSoundViewer = soundViewer.getContext("2d");
resetCanvas();

let soundSourceNode = audioCtx.createMediaElementSource(soundElement);
const volumeNode = audioCtx.createGain();
const stereoPanNode = audioCtx.createStereoPanner();
const analyzerNode = audioCtx.createAnalyser();


soundSourceNode
.connect(stereoPanNode)
.connect(volumeNode)
.connect(analyzerNode)
.connect(audioCtx.destination);

//TODO: finallize code;
toggleMicUse.addEventListener("click", () => {
    document.querySelector("#mic-active-icon").classList.toggle("d-none");
    document.querySelector("#mic-inactive-icon").classList.toggle("d-none");
    micUseCheck.checked = !micUseCheck.checked;

    if(micUseCheck.checked) {
        navigator.mediaDevices.getUserMedia({
            audio : true,
            video: false
        }).then(audioStream => {
            window.audioStream = audioStream;
            soundSourceNode = audioCtx.createMediaStreamSource(audioStream);
            soundElement.srcObject = audioStream;
            soundTitle.innerHTML = "Reproducing: Mic audio"
            playCheckbox.checked = true;
            soundSourceNode
            .connect(stereoPanNode)
            .connect(volumeNode)
            .connect(analyzerNode)
            .connect(audioCtx.destination);
        });        

    }else {
        window?.audioStream?.getTracks()?.forEach(track => {
            track.stop();
        }); 
        playCheckbox.checked = false;
        soundSourceNode.disconnect();
        soundElement = new Audio("./Joji - Gimme Love.mp3");
        soundSourceNode = audioCtx.createMediaElementSource(soundElement);
        soundTitle.innerHTML = "Reproducing: Joji - Gimme Love";
        soundSourceNode
            .connect(stereoPanNode)
            .connect(volumeNode)
            .connect(analyzerNode)
            .connect(audioCtx.destination);

    }

});




volumeRange.addEventListener("input", () => {
    volumeNode.gain.value = volumeRange.value;
});

stereoRange.addEventListener("input", () => {
    stereoPanNode.pan.value = stereoRange.value;
});

playPauseBtn.addEventListener("click", () => {
    playCheckbox.checked = !playCheckbox.checked;

    const isPlaying = playCheckbox.checked;

    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    if(isPlaying) {
        soundElement.play();
        togglePlayPauseIcon();
        return;
    }

    soundElement.pause();
    togglePlayPauseIcon();
});



soundElement.addEventListener("ended", () => {
    playCheckbox.checked = false;
    togglePlayPauseIcon();
});


const bufferLength = analyzerNode.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyzerNode.getByteTimeDomainData(dataArray);

!function drawWaves() {

    requestAnimationFrame(drawWaves);
    const isPlaying = playCheckbox.checked;
    
    if(isPlaying) {
        analyzerNode.getByteTimeDomainData(dataArray);
        
        resetCanvas();
        ctxSoundViewer.fillStyle = "#ea698b"
        let w = (ctxSoundViewer.canvas.width / bufferLength) 
        for(let i =0; i < dataArray.length; ++i) {

            const mappedValue = (dataArray[i] / ZERO_BYTE_RANGE);
            const half = ctxSoundViewer.canvas.height ;

            const x = i ;
            let y =  ( mappedValue * half) / 2;

            const h = half - y;

            ctxSoundViewer.fillRect(x,y, w, h);
        }

    }

}();


function resetCanvas() {
    ctxSoundViewer.fillStyle = "black"
    ctxSoundViewer.fillRect(0, 0, ctxSoundViewer.canvas.width, ctxSoundViewer.canvas.height);
}

function togglePlayPauseIcon() {
    document.querySelector("#play-icon").classList.toggle("d-none");
    document.querySelector("#pause-icon").classList.toggle("d-none");
}