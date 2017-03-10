/*
 * cordova.js
 * Copyright (C) 2017 <romgrk.cc@gmail.com>
 *
 * Distributed under terms of the MIT license.
 *
 * Note: this needs to be transpiled before usage
 * (E.g. at https://babeljs.io/repl/#?presets=es2015%2Cstage-2)
 *
 * /!\ Be sure to include a Promise polyfill with this. 
 * (E.g. https://github.com/taylorhakes/promise-polyfill)
 */


/**
 * Get a picture
 * @param {object} options - options
 * Usage:
 *
 *  getPicture({ width: 100, height: 100, quality: 50 })
 *  .then(uri => document.querySelector('img').src = uri)
 *  .catch(err => console.error(err))
 */
export const getPicture = (options) => {
  return new Promise((resolve, reject) => {
    options = Object.assign({ quality: 25, destinationType: navigator.camera.DestinationType.DATA_URL }, options || {});
    var prefix = options.destinationType === navigator.camera.DestinationType.DATA_URL ? 'data:image/jpeg;base64,' : '';
    navigator.camera.getPicture(
      (data) => resolve(prefix + data),
      reject,
      options);
  })
}

/**
 * Get a signature
 * @param {number} width - width
 * @param {number} height - height
 * Usage:
 *
 *  getSignature(500, 200)
 *  .then(svg => document.querySelector('div#container').innerHTML = svg)
 */
export const getSignature = (width, height) => {
  return new Promise((resolve, reject) => {
    const options = {
      mode : 'signature',
      width : width,
      height : height
    }
    const callback = data => {
      resolve(navigator.handDrawTool.getSVG(data, width, height));
    }
    navigator.handDrawTool.record(callback, options);
  })
}

/**
 * Get a date
 * @param {date} previousValue - initial value of the datepicker
 * @param {string} mode - optional, 'date' or 'time'
 * Usage:
 *
 *  getDate(new Date()).then(date => console.log(date))
 */
export const getDate = (previousValue, mode = 'date') => {
  return new Promise((resolve, reject) => {
    const options = {
      date: previousValue,
      mode: mode
    }
    navigator.datePicker.show(options, resolve, reject)
  })
}

export const getTime = (previousValue) => {
  return getDate(previousValue, 'time')
}


let fsHandle;

const initFs = () => {
  if (fsHandle)
    return Promise.resolve(fsHandle)

  return new Promise((resolve, reject) => {
    const maxSize = 5 * 1024 * 1024  // limited by disk space available on device
    window.requestFileSystem(window.PERSISTENT, maxSize, (fs) => {
      fsHandle = fs
      resolve(fsHandle)
    }, reject);
  })
}

/**
 * Read a file
 * @param {string} fileName - path to the file to read
 * Usage:
 *
 *  readFile('file.txt')
 *  .then(content => console.log('File content: ' + content))
 *  .catch(err => console.error(err))
 */
export const readFile = (fileName) => {
  return initFs().then((fs) => new Promise((resolve, reject) => {
    fs.root.getFile(fileName, {}, (fileEntry) => {
      // fileEntry.isFile === true
      // fileEntry.name == fileName (?)

      fileEntry.file((file) => {

        const reader = new FileReader()
        reader.onloadend = (ev) => resolve(ev.target.result)
        reader.readAsText(file)

      }, reject);
    }, reject);
  }))
}

/**
 * Write a file
 * @param {string} fileName - path to the file to write
 * @param {string} content - content to write
 * Usage:
 *
 *  writeFile('file.txt', 'Hello!')
 *  .then(() => console.log('Ok'))
 *  .catch(err => console.error(err))
 */
export const writeFile = (fileName, content) => {
  return initFs().then((fs) => new Promise((resolve, reject) => {
    fs.root.getFile(fileName, { create: true }, (fileEntry) => {
      fileEntry.createWriter((fileWriter) => {

        fileWriter.onwriteend = resolve
        fileWriter.onerror    = reject

        fileWriter.write(content)
      }, reject)
    }, reject)
  }))
}

/**
 * Download a file
 * @param {string} uri - URL of the file to get
 * @param {string} destination - path to save the file
 * Usage:
 *
 *  downloadFile('http://example.com/file.txt', 'file.txt')
 *  .then(entry => console.log(entry.toURL())
 *  .catch(err => console.error(err))
 */
export const downloadFile = (uri, destination) => {
  return new Promise((resolve, reject) => {
    fileTransfer = new FileTransfer()
    //fileTransfer.onprogress = (progressEvent) => {
      //if (progressEvent.lengthComputable) {
        //Math.round(progressEvent.loaded / progressEvent.total * 100) + '% ...'
      //}
    //}
    fileTransfer.download(uri, destination, resolve, reject)
  })
}


export const sendAlert = (message, title = 'Alert', buttonName = 'Ok') => {
  return new Promise((resolve, reject) => {
    navigator.notification.alert(message, resolve, title, buttonName)
  })
}

export const sendConfirm = (message, title = 'Confirm', actions = ['Ok', 'Cancel']) => {
  return new Promise((resolve, reject) => {
    navigator.notification.confirm(message, resolve, title, actions)
  })
}



/*
 * Polyfills for browser
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

    const getCoords = ev =>
      ev.offsetX + ',' + ev.offsetY

    const onMouseDown = ev => {
      data += 'M' + getCoords(ev) + ' ';
      path.setAttribute('d', data);
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }

    const onMouseMove = ev => {
      if (ev.buttons & 1) {
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
    const key = location.href;
    let state = {};
    for (let n in localStorage) {
      if (n.indexOf(key) === 0)
        state[n.replace(key + '.', '')] = localStorage[n];
    }
    const restoreEvent = new CustomEvent('restorestate', {
      detail: { state: state } });
    window.dispatchEvent(restoreEvent)
  })
  window.addEventListener('unload', (e) => {
    const key = location.href;
    let state = {};
    const saveEvent = new CustomEvent('savestate', {
      detail: { state: state } });
    window.dispatchEvent(saveEvent)
    for (let n in state) {
      if (state.hasOwnProperty(n))
        localStorage[key + '.' + n] = state[n];
    }
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

