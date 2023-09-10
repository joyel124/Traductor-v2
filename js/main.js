import {
  GestureRecognizer,
  FilesetResolver,
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0';
const demosSection = document.getElementById('vid_container');
let gestureRecognizer;
let runningMode = 'VIDEO';
let enableWebcamButton;
let webcamRunning = true;
const videoHeight = '879px';
const videoWidth = '534px';
let gestureText = [];
let lastSavedLetter = '';
let lastGestureTime = 0; // Registro del tiempo del último gesto
const minTimeBetweenGestures = 1000;

//var takeSnapshotUI = createClickFeedbackUI();

//var video;
var takePhotoButton;
var toggleFullScreenButton;
var switchCameraButton;
var amountOfCameras = 0;
var currentFacingMode = 'environment';

const createGestureRecognizer = async (selectedOption) => {
  console.log(selectedOption);
  let country;
  if (selectedOption === 'PE') {
    country = 'abecedario-peru-v2';
  } else {
    if (selectedOption === 'EC') {
      country = 'abecedario-ecuador-v2';
    } else {
      if (selectedOption === 'MX') {
        country = 'abecedario-mx-v2';
      } else {
        country = 'abecedario-usa';
      }
    }
  }
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `models/${country}.task`,
      delegate: 'GPU',
    },
    runningMode: runningMode,
  });
  //demosSection.classList.remove("invisible");
};

createGestureRecognizer('Perú');
// this function counts the amount of video inputs
// it replaces DetectRTC that was previously implemented.
function actualizarTextoEnHTML() {
  // Actualiza el contenido del elemento <span> con id "gestureText"
  const spanElement = document.getElementById('gestureText');
  spanElement.textContent = `Frase: ${gestureText.join('')}`;
}
function resetTranslation() {
  gestureText.pop(); // Eliminar el ultimo elemento del arreglo
  actualizarTextoEnHTML();
}
function spaceButtonFunction() {
  gestureText.push(' ');
  actualizarTextoEnHTML();
}
const selectButton = document.getElementById('selectButton');

selectButton.addEventListener('change', function () {
  // Obtiene el valor seleccionado
  const valorSeleccionado = selectButton.value;

  // Muestra el valor seleccionado en la consola
  console.log('Opción seleccionada:', valorSeleccionado);
  createGestureRecognizer(valorSeleccionado);
});

const spaceButton = document.getElementById('addSpacingButton');
const resetButton = document.getElementById('deleteButton');
resetButton.addEventListener('click', resetTranslation);
spaceButton.addEventListener('click', spaceButtonFunction);
setInterval(actualizarTextoEnHTML, 1000);

document.getElementById('soundButton').addEventListener('click', function () {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(gestureText.join(''));
  utterance.lang = 'es-MX';
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;
  synth.speak(utterance);
});
function deviceCount() {
  return new Promise(function (resolve) {
    var videoInCount = 0;

    navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices) {
        devices.forEach(function (device) {
          if (device.kind === 'video') {
            device.kind = 'videoinput';
          }

          if (device.kind === 'videoinput') {
            videoInCount++;
            console.log('videocam: ' + device.label);
          }
        });

        resolve(videoInCount);
      })
      .catch(function (err) {
        console.log(err.name + ': ' + err.message);
        resolve(0);
      });
  });
}

document.addEventListener('DOMContentLoaded', function (event) {
  // check if mediaDevices is supported
  if (
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    navigator.mediaDevices.enumerateDevices
  ) {
    // first we call getUserMedia to trigger permissions
    // we need this before deviceCount, otherwise Safari doesn't return all the cameras
    // we need to have the number in order to display the switch front/back button
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then(function (stream) {
        stream.getTracks().forEach(function (track) {
          track.stop();
        });

        deviceCount().then(function (deviceCount) {
          amountOfCameras = deviceCount;

          // init the UI and the camera stream
          //initCameraUI();
          initCameraStream();
        });
      })
      .catch(function (error) {
        //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if (error === 'PermissionDeniedError') {
          alert('Permission denied. Please refresh and give permission.');
        }

        console.error('getUserMedia() error: ', error);
      });
  } else {
    alert(
      'Mobile camera is not supported by browser, or there is no camera detected/connected',
    );
  }
});
/*const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');*/
var video = document.getElementById('video');

let lastVideoTime = -1;
let results = undefined;
async function predictWebcam() {
  //console.log('predictWebcam');
  const webcamElement = document.getElementById('video');
  // Now let's start detecting the stream.
  if (runningMode === 'IMAGE') {
    runningMode = 'VIDEO';
    await gestureRecognizer.setOptions({ runningMode: 'VIDEO' });
  }
  let nowInMs = Date.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    results = gestureRecognizer.recognizeForVideo(video, nowInMs);
  }
  //console.log(results);
  /*canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasElement.height = video.videoHeight;
  //webcamElement.style.height = video.videoHeight;
  canvasElement.width = video.videoWidth;*/
  //webcamElement.style.width = video.videoWidth;
  /*if (results.landmarks) {
    for (const landmarks of results.landmarks) {
      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2,
      });
      drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 0.5 });
    }
  }*/
  //canvasCtx.restore();
  if (results.gestures.length > 0) {
    const currentTime = Date.now(); // Obtener el tiempo actual
    const categoryName = results.gestures[0][0].categoryName;
    const categoryScore = parseFloat(
      results.gestures[0][0].score * 100,
    ).toFixed(2);
    /*console.log(
      `LETRA: ${categoryName}\n PROBABILIDAD: ${categoryScore} %\n FRASE: ${gestureText.join(
        '',
      )}`,
    );*/

    // Verificar si ha pasado suficiente tiempo desde el último gesto similar
    if (currentTime - lastGestureTime >= minTimeBetweenGestures) {
      // Filtrar gestos repetidos
      if (categoryName !== lastSavedLetter || categoryName === 'R') {
        //gestureOutput.style.display = "block";
        //gestureOutput.style.width = videoWidth;
        //gestureOutput.innerText = `LETRA: ${categoryName}\n PROBABILIDAD: ${categoryScore} %\n FRASE: ${gestureText.join('')}`;
        if (categoryScore > 90) {
          gestureText.push(categoryName);
          console.log(gestureText);

          // Actualizar el tiempo del último gesto y la última letra guardada
          lastGestureTime = currentTime;
          lastSavedLetter = categoryName;
        }
      }
    }
  } else {
    //gestureOutput.style.display = "none";
  }
  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
function initCameraUI() {
  video = document.getElementById('video');

  takePhotoButton = document.getElementById('takePhotoButton');
  toggleFullScreenButton = document.getElementById('toggleFullScreenButton');
  switchCameraButton = document.getElementById('switchCameraButton');

  // https://developer.mozilla.org/nl/docs/Web/HTML/Element/button
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role
  // Activate the webcam stream.

  takePhotoButton.addEventListener('click', function () {
    //takeSnapshotUI();
    //takeSnapshot();
  });

  // -- fullscreen part

  function fullScreenChange() {
    if (screenfull.isFullscreen) {
      toggleFullScreenButton.setAttribute('aria-pressed', true);
    } else {
      toggleFullScreenButton.setAttribute('aria-pressed', false);
    }
  }

  if (screenfull.isEnabled) {
    screenfull.on('change', fullScreenChange);

    toggleFullScreenButton.style.display = 'block';

    // set init values
    fullScreenChange();

    toggleFullScreenButton.addEventListener('click', function () {
      screenfull.toggle(document.getElementById('container')).then(function () {
        console.log(
          'Fullscreen mode: ' +
            (screenfull.isFullscreen ? 'enabled' : 'disabled'),
        );
      });
    });
  } else {
    console.log("iOS doesn't support fullscreen (yet)");
  }

  // -- switch camera part
  if (amountOfCameras > 1) {
    switchCameraButton.style.display = 'block';

    switchCameraButton.addEventListener('click', function () {
      if (currentFacingMode === 'environment') currentFacingMode = 'user';
      else currentFacingMode = 'environment';

      initCameraStream();
    });
  }

  // Listen for orientation changes to make sure buttons stay at the side of the
  // physical (and virtual) buttons (opposite of camera) most of the layout change is done by CSS media queries
  // https://www.sitepoint.com/introducing-screen-orientation-api/
  // https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
  window.addEventListener(
    'orientationchange',
    function () {
      // iOS doesn't have screen.orientation, so fallback to window.orientation.
      // screen.orientation will
      if (screen.orientation) angle = screen.orientation.angle;
      else angle = window.orientation;

      var guiControls = document.getElementById('gui_controls').classList;
      var vidContainer = document.getElementById('vid_container').classList;

      if (angle == 270 || angle == -90) {
        guiControls.add('left');
        vidContainer.add('left');
      } else {
        if (guiControls.contains('left')) guiControls.remove('left');
        if (vidContainer.contains('left')) vidContainer.remove('left');
      }

      //0   portrait-primary
      //180 portrait-secondary device is down under
      //90  landscape-primary  buttons at the right
      //270 landscape-secondary buttons at the left
    },
    false,
  );
}

/*window.addEventListener('resize', () => {
  const vidContainer = document.getElementById('vid_container');
  const outputCanvas = document.getElementById('output_canvas');
  const video = document.getElementById('video');

  console.log('vidContainer.clientWidth ' + vidContainer.clientWidth);
  console.log('vidContainer.clientHeight ' + vidContainer.clientHeight);
  /*video.style.height = vidContainer.clientWidth;
  video.style.width = vidContainer.clientWidth;
  console.log('video.style.height ' + video.style.height);
  // Ajusta el tamaño del canvas al tamaño del contenedor
  video.width = vidContainer.clientWidth;
  video.height = vidContainer.clientHeight;
});
*/

// Llama a esto una vez para configurar el tamaño inicial del canvas
window.dispatchEvent(new Event('resize'));

// https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
function initCameraStream() {
  // stop any active streams in the window
  if (window.stream) {
    window.stream.getTracks().forEach(function (track) {
      console.log(track);
      track.stop();
    });
  }

  // we ask for a square resolution, it will cropped on top (landscape)
  // or cropped at the sides (landscape)
  var size = 1280;

  var constraints = {
    audio: false,
    video: {
      width: { ideal: size },
      height: { ideal: size },
      //width: { min: 1024, ideal: window.innerWidth, max: 1920 },
      //height: { min: 776, ideal: window.innerHeight, max: 1080 },
      facingMode: currentFacingMode,
    },
  };
  /*navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });*/
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(handleSuccess)
    .catch(handleError);

  function handleSuccess(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);

    /*if (constraints.video.facingMode) {
      if (constraints.video.facingMode === 'environment') {
        switchCameraButton.setAttribute('aria-pressed', true);
      } else {
        switchCameraButton.setAttribute('aria-pressed', false);
      }
    }*/

    const track = window.stream.getVideoTracks()[0];
    const settings = track.getSettings();
    console.log(track + ' ' + settings);
    /*str = JSON.stringify(settings, null, 4);
    console.log('settings ' + str);*/
  }

  function handleError(error) {
    console.error('getUserMedia() error: ', error);
  }
}

function takeSnapshot() {
  // if you'd like to show the canvas add it to the DOM
  var canvas = document.createElement('canvas');

  var width = video.videoWidth;
  var height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, width, height);

  // polyfil if needed https://github.com/blueimp/JavaScript-Canvas-to-Blob

  // https://developers.google.com/web/fundamentals/primers/promises
  // https://stackoverflow.com/questions/42458849/access-blob-value-outside-of-canvas-toblob-async-function
  function getCanvasBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        resolve(blob);
      }, 'image/jpeg');
    });
  }

  // some API's (like Azure Custom Vision) need a blob with image data
  getCanvasBlob(canvas).then(function (blob) {
    // do something with the image blob
  });
}

// https://hackernoon.com/how-to-use-javascript-closures-with-confidence-85cd1f841a6b
// closure; store this in a variable and call the variable as function
// eg. var takeSnapshotUI = createClickFeedbackUI();
// takeSnapshotUI();

function createClickFeedbackUI() {
  // in order to give feedback that we actually pressed a button.
  // we trigger a almost black overlay
  var overlay = document.getElementById('video_overlay'); //.style.display;

  // sound feedback
  var sndClick = new Howl({ src: ['snd/click.mp3'] });

  var overlayVisibility = false;
  var timeOut = 80;

  function setFalseAgain() {
    overlayVisibility = false;
    overlay.style.display = 'none';
  }

  return function () {
    if (overlayVisibility == false) {
      sndClick.play();
      overlayVisibility = true;
      overlay.style.display = 'block';
      setTimeout(setFalseAgain, timeOut);
    }
  };
}
