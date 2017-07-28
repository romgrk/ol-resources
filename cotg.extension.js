/*
 * cotg.extension.js
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


