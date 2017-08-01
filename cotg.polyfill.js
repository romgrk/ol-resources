/*
 * cotg.polyfill.js
 *
 * COTG polyfills for browser
 */

const FILE_URI = 0;
const DATA_URL = 1;

const buildContainer = () => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.zIndex = '100';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.verticalAlign = 'middle';
  container.style.backgroundColor = 'rgba(0,0,0,0.3)';
  return container;
}

const capturePhoto = (options) => {
  return new Promise((resolve, reject) => {
    const container = buildContainer();
    const video     = document.createElement('video');
    const canvas    = document.createElement('canvas');
    container.appendChild(video);
    container.appendChild(canvas);
    video.style.width = '100%';
    video.style.height = '100%';
    canvas.style.opacity = '0';

    const init = stream => {
      // Cleanup
      const accept = (data) => {
        stream.getTracks()[0].stop();
        URL.revokeObjectURL(stream)
        document.body.removeChild(container);
        resolve(data);
      }

      video.src = URL.createObjectURL(stream);
      video.addEventListener('click', ev => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0)
        if (options.destinationType === FILE_URI) {
          canvas.toBlob(blob => accept(URL.createObjectURL(blob)))
        } else {
          accept(canvas.toDataURL('image/jpeg'));
        }
      })
    }

    navigator.mediaDevices
      .getUserMedia(options || {video: true})
      .then(init)
      .catch(() => {
        document.body.removeChild(container);
        reject();
      });

    document.body.appendChild(container);
  })
}

const capturePath = (options = {}) => {
  const width  = options.width || 500;
  const height = options.height || 200;
  return new Promise((resolve, reject) => {
    const ns = 'http://www.w3.org/2000/svg';
    const container = buildContainer();
    const div       = document.createElement('div');
    const accept    = document.createElement('button');
    const clear     = document.createElement('button');
    const svg       = document.createElementNS(ns, 'svg');
    const path      = document.createElementNS(ns, 'path');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    div.style.width = width + ' px';
    div.style.height = height + ' px';
    div.style.top = '50%';
    div.style.left = '50%';
    div.style.transform = 'translate(-50%, -50%)';
    div.style.margin = 'auto';
    div.style.display = 'block';
    div.style.position = 'absolute';
    div.style.cursor = 'default';
    if (options.background)
      div.style.background = `url(${options.background})`;
    else
      div.style.backgroundColor = 'white';
    div.style.backgroundSize = `${width}px ${height}px`;
    path.setAttribute('stroke', 'dodgerblue');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('fill', 'none');
    path.setAttribute('pointer-events', 'none');
    accept.style.position = 'absolute';
    accept.style.bottom = '0';
    accept.style.right = '0';
    accept.innerText = 'Accept';
    clear.style.position = 'absolute';
    clear.style.bottom = '0';
    clear.style.left = '0';
    clear.innerText = 'Clear';

    var data = options.edit || '';

    const getCoords = ev => {
      if (!ev.touches)
        return ev.offsetX + ',' + ev.offsetY
      const rect = ev.target.getBoundingClientRect()
      const x = ev.targetTouches[0].clientX - rect.left
      const y = ev.targetTouches[0].clientY - rect.top
      return x + ',' + y
    }

    const onMouseDown = ev => {
      data += 'M' + getCoords(ev) + ' ';
      path.setAttribute('d', data);
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }

    const onMouseMove = ev => {
      if (ev.buttons & 1 || ev.type === 'touchmove') {
        data += 'L' + getCoords(ev) + ' ';
        path.setAttribute('d', data);
      }
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }

    const onClear = ev => {
      data = '';
      path.setAttribute('d', data);
    }

    const onAccept = ev => {
      document.body.removeChild(container);
      resolve(data);
    }

    svg.addEventListener('mousedown', onMouseDown);
    svg.addEventListener('mousemove', onMouseMove);
    svg.addEventListener('touchstart', onMouseDown);
    svg.addEventListener('touchmove', onMouseMove);
    accept.addEventListener('click', onAccept);
    clear.addEventListener('click', onClear);

    svg.appendChild(path);
    div.appendChild(svg);
    div.appendChild(accept);
    div.appendChild(clear);
    container.appendChild(div);
    document.body.appendChild(container);
  })
}

const attachStateEvents = () => {
  window.addEventListener('load', (e) => {
    const key = location.href
    const state = JSON.parse(localStorage[key])
    const restoreEvent = new CustomEvent('restorestate', {
      detail: { state: state }
    })
    window.dispatchEvent(restoreEvent)
  })
  window.addEventListener('unload', (e) => {
    const key = location.href
    const state = {}
    const saveEvent = new CustomEvent('savestate', {
      detail: { state: state }
    })
    window.dispatchEvent(saveEvent)
    localStorage[key] = JSON.stringify(state)
  })
}

/*
 * Initialization
 */

if (!window.cordova) {

  window.Camera = {
    PictureSourceType: {},
    EncodingType: {},
    DestinationType: {
      FILE_URI: FILE_URI,
      DATA_URL: DATA_URL
    },
    getPicture: (resolve, reject, options = {}) => {
      options = Object.assign(options, { video: true });

      // Translate CameraOptions to browsers' options
      if (options.targetWidth)
        options.width = options.targetWidth;
      if (options.targetHeight)
        options.height = options.targetHeight;

      capturePhoto(options)
        .then(data => resolve(data.replace(/^.*base64,/, '')))
        .catch(reject);
    }
  }

  navigator.camera = window.Camera;

  navigator.handDrawTool = {
    record: (resolve, options) => {
      capturePath(options).then(resolve);
    },
    getSVG: (data, width, height) => {
      return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <path id="p" stroke="dodgerblue" stroke-width="1" fill="none" d="${data}"/>
      </svg>`;
    }
  }

  attachStateEvents();
}

