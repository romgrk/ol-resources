/*
 * cordova.js
 * Copyright (C) 2017 <romgrk.cc@gmail.com>
 *
 * Distributed under terms of the MIT license.
 *
 * Note: this needs to be transpiled before usage, for example at
 * https://babeljs.io/repl/#?presets=es2015%2Cstage-2
 *
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
 *  getDate(new Date())
 *  .then(date => console.log(date))
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
    fs.root.getFile(fileName, {}, function(fileEntry) {
      // fileEntry.isFile === true
      // fileEntry.name == 'demo-log.txt'

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
 *  .then(entry => console.log('Ok'))
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


/*
 * Promise polyfill
 * Source: https://github.com/taylorhakes/promise-polyfill
 * License: MIT
 */

if (!window.Promise) {
  !function(e){function n(){}function t(e,n){return function(){e.apply(n,arguments)}}function o(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],s(e,this)}function i(e,n){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(n):(e._handled=!0,void o._immediateFn(function(){var t=1===e._state?n.onFulfilled:n.onRejected;if(null===t)return void(1===e._state?r:u)(n.promise,e._value);var o;try{o=t(e._value)}catch(i){return void u(n.promise,i)}r(n.promise,o)}))}function r(e,n){try{if(n===e)throw new TypeError("A promise cannot be resolved with itself.");if(n&&("object"==typeof n||"function"==typeof n)){var i=n.then;if(n instanceof o)return e._state=3,e._value=n,void f(e);if("function"==typeof i)return void s(t(i,n),e)}e._state=1,e._value=n,f(e)}catch(r){u(e,r)}}function u(e,n){e._state=2,e._value=n,f(e)}function f(e){2===e._state&&0===e._deferreds.length&&o._immediateFn(function(){e._handled||o._unhandledRejectionFn(e._value)});for(var n=0,t=e._deferreds.length;n<t;n++)i(e,e._deferreds[n]);e._deferreds=null}function c(e,n,t){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof n?n:null,this.promise=t}function s(e,n){var t=!1;try{e(function(e){t||(t=!0,r(n,e))},function(e){t||(t=!0,u(n,e))})}catch(o){if(t)return;t=!0,u(n,o)}}var a=setTimeout;o.prototype["catch"]=function(e){return this.then(null,e)},o.prototype.then=function(e,t){var o=new this.constructor(n);return i(this,new c(e,t,o)),o},o.all=function(e){var n=Array.prototype.slice.call(e);return new o(function(e,t){function o(r,u){try{if(u&&("object"==typeof u||"function"==typeof u)){var f=u.then;if("function"==typeof f)return void f.call(u,function(e){o(r,e)},t)}n[r]=u,0===--i&&e(n)}catch(c){t(c)}}if(0===n.length)return e([]);for(var i=n.length,r=0;r<n.length;r++)o(r,n[r])})},o.resolve=function(e){return e&&"object"==typeof e&&e.constructor===o?e:new o(function(n){n(e)})},o.reject=function(e){return new o(function(n,t){t(e)})},o.race=function(e){return new o(function(n,t){for(var o=0,i=e.length;o<i;o++)e[o].then(n,t)})},o._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){a(e,0)},o._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},o._setImmediateFn=function(e){o._immediateFn=e},o._setUnhandledRejectionFn=function(e){o._unhandledRejectionFn=e},"undefined"!=typeof module&&module.exports?module.exports=o:e.Promise||(e.Promise=o)}(this);
}
