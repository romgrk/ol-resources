(function(){
	'use strict';

	var exports = window.cotg = {}

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	/*
	 * cotg.onerror.js
	 *
	 * This will display an error message whenever there is an error during your
	 * JavaScript execution. It also display the lines that caused the error.
	 */

	window.onerror = function (error, filename, line, col) {
		var infos = JSON.stringify([].slice.call(arguments));

		var source = document.documentElement.innerHTML.split('\n').slice(line - 5, line + 2).join('\n');

		alert(infos + '\n\nSource: ----------------\n\n' + source);
	};

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

	exports = window.cotg = {};

	/**
	 * Get a picture
	 * @param {object} options - options
	 * Usage:
	 *
	 *  getPicture({ width: 100, height: 100, quality: 50 })
	 *  .then(uri => document.querySelector('img').src = uri)
	 *  .catch(err => console.error(err))
	 */
	var getPicture = exports.getPicture = function getPicture(options) {
		return new Promise(function (resolve, reject) {
			options = Object.assign({ quality: 25, destinationType: navigator.camera.DestinationType.DATA_URL }, options || {});
			var prefix = options.destinationType === navigator.camera.DestinationType.DATA_URL ? 'data:image/jpeg;base64,' : '';
			navigator.camera.getPicture(function (data) {
				return resolve(prefix + data);
			}, reject, options);
		});
	};

	/**
	 * Get a signature
	 * @param {number} width - width
	 * @param {number} height - height
	 * Usage:
	 *
	 *  getSignature(500, 200)
	 *  .then(svg => document.querySelector('div#container').innerHTML = svg)
	 */
	var getSignature = exports.getSignature = function getSignature(width, height) {
		return new Promise(function (resolve, reject) {
			var options = {
				mode: 'signature',
				width: width,
				height: height
			};
			var callback = function callback(data) {
				resolve(navigator.handDrawTool.getSVG(data, width, height));
			};
			navigator.handDrawTool.record(callback, options);
		});
	};

	/**
	 * Get a date
	 * @param {date} previousValue - initial value of the datepicker
	 * @param {string} mode - optional, 'date' or 'time'
	 * Usage:
	 *
	 *  getDate(new Date()).then(date => console.log(date))
	 */
	var getDate = exports.getDate = function getDate(previousValue) {
		var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'date';

		return new Promise(function (resolve, reject) {
			var options = {
				date: previousValue,
				mode: mode
			};
			navigator.datePicker.show(options, resolve, reject);
		});
	};

	var getTime = exports.getTime = function getTime(previousValue) {
		return getDate(previousValue, 'time');
	};

	var fsHandle = void 0;

	var initFs = function initFs() {
		if (fsHandle) return Promise.resolve(fsHandle);

		return new Promise(function (resolve, reject) {
			var maxSize = 5 * 1024 * 1024; // limited by disk space available on device
			window.requestFileSystem(window.PERSISTENT, maxSize, function (fs) {
				fsHandle = fs;
				resolve(fsHandle);
			}, reject);
		});
	};

	/**
	 * Read a file
	 * @param {string} fileName - path to the file to read
	 * Usage:
	 *
	 *  readFile('file.txt')
	 *  .then(content => console.log('File content: ' + content))
	 *  .catch(err => console.error(err))
	 */
	var readFile = exports.readFile = function readFile(fileName) {
		return initFs().then(function (fs) {
			return new Promise(function (resolve, reject) {
				fs.root.getFile(fileName, {}, function (fileEntry) {
					// fileEntry.isFile === true
					// fileEntry.name == fileName (?)

					fileEntry.file(function (file) {

						var reader = new FileReader();
						reader.onloadend = function (ev) {
							return resolve(ev.target.result);
						};
						reader.readAsText(file);
					}, reject);
				}, reject);
			});
		});
	};

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
	var writeFile = exports.writeFile = function writeFile(fileName, content) {
		return initFs().then(function (fs) {
			return new Promise(function (resolve, reject) {
				fs.root.getFile(fileName, { create: true }, function (fileEntry) {
					fileEntry.createWriter(function (fileWriter) {

						fileWriter.onwriteend = resolve;
						fileWriter.onerror = reject;

						fileWriter.write(content);
					}, reject);
				}, reject);
			});
		});
	};

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
	var downloadFile = exports.downloadFile = function downloadFile(uri, destination) {
		return new Promise(function (resolve, reject) {
			fileTransfer = new FileTransfer();
			//fileTransfer.onprogress = (progressEvent) => {
			//if (progressEvent.lengthComputable) {
			//Math.round(progressEvent.loaded / progressEvent.total * 100) + '% ...'
			//}
			//}
			fileTransfer.download(uri, destination, resolve, reject);
		});
	};

	var sendAlert = exports.sendAlert = function sendAlert(message) {
		var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Alert';
		var buttonName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Ok';

		return new Promise(function (resolve, reject) {
			navigator.notification.alert(message, resolve, title, buttonName);
		});
	};

	var sendConfirm = exports.sendConfirm = function sendConfirm(message) {
		var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Confirm';
		var actions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['Ok', 'Cancel'];

		return new Promise(function (resolve, reject) {
			navigator.notification.confirm(message, resolve, title, actions);
		});
	};

	/*
	 * cotg.polyfill.js
	 *
	 * COTG polyfills for browser
	 */

	var FILE_URI = 0;
	var DATA_URL = 1;

	var buildContainer = function buildContainer() {
		var container = document.createElement('div');
		container.style.position = 'fixed';
		container.style.zIndex = '100';
		container.style.top = '0';
		container.style.left = '0';
		container.style.width = '100%';
		container.style.height = '100%';
		container.style.verticalAlign = 'middle';
		container.style.backgroundColor = 'rgba(0,0,0,0.3)';
		return container;
	};

	var capturePhoto = function capturePhoto(options) {
		return new Promise(function (resolve, reject) {
			var container = buildContainer();
			var video = document.createElement('video');
			var canvas = document.createElement('canvas');
			container.appendChild(video);
			container.appendChild(canvas);
			video.style.width = '100%';
			video.style.height = '100%';
			canvas.style.opacity = '0';

			var init = function init(stream) {
				// Cleanup
				var accept = function accept(data) {
					stream.getTracks()[0].stop();
					URL.revokeObjectURL(stream);
					document.body.removeChild(container);
					resolve(data);
				};

				video.src = URL.createObjectURL(stream);
				video.addEventListener('click', function (ev) {
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					canvas.getContext('2d').drawImage(video, 0, 0);
					if (options.destinationType === FILE_URI) {
						canvas.toBlob(function (blob) {
							return accept(URL.createObjectURL(blob));
						});
					} else {
						accept(canvas.toDataURL('image/jpeg'));
					}
				});
			};

			navigator.mediaDevices.getUserMedia(options || { video: true }).then(init).catch(function () {
				document.body.removeChild(container);
				reject();
			});

			document.body.appendChild(container);
		});
	};

	var capturePath = function capturePath() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var width = options.width || 500;
		var height = options.height || 200;
		return new Promise(function (resolve, reject) {
			var ns = 'http://www.w3.org/2000/svg';
			var container = buildContainer();
			var div = document.createElement('div');
			var accept = document.createElement('button');
			var clear = document.createElement('button');
			var svg = document.createElementNS(ns, 'svg');
			var path = document.createElementNS(ns, 'path');
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
			if (options.background) div.style.background = 'url(' + options.background + ')';else div.style.backgroundColor = 'white';
			div.style.backgroundSize = width + 'px ' + height + 'px';
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

			var getCoords = function getCoords(ev) {
				if (!ev.touches) return ev.offsetX + ',' + ev.offsetY;
				var rect = ev.target.getBoundingClientRect();
				var x = ev.targetTouches[0].clientX - rect.left;
				var y = ev.targetTouches[0].clientY - rect.top;
				return x + ',' + y;
			};

			var onMouseDown = function onMouseDown(ev) {
				data += 'M' + getCoords(ev) + ' ';
				path.setAttribute('d', data);
				ev.preventDefault();
				ev.stopImmediatePropagation();
			};

			var onMouseMove = function onMouseMove(ev) {
				if (ev.buttons & 1 || ev.type === 'touchmove') {
					data += 'L' + getCoords(ev) + ' ';
					path.setAttribute('d', data);
				}
				ev.preventDefault();
				ev.stopImmediatePropagation();
			};

			var onClear = function onClear(ev) {
				data = '';
				path.setAttribute('d', data);
			};

			var onAccept = function onAccept(ev) {
				document.body.removeChild(container);
				resolve(data);
			};

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
		});
	};

	var attachStateEvents = function attachStateEvents() {
		window.addEventListener('load', function (e) {
			var key = location.href;
			var state = {};
			for (var n in localStorage) {
				if (n.indexOf(key) === 0) state[n.replace(key + '.', '')] = localStorage[n];
			}
			var restoreEvent = new CustomEvent('restorestate', {
				detail: { state: state } });
			window.dispatchEvent(restoreEvent);
		});
		window.addEventListener('unload', function (e) {
			var key = location.href;
			var state = {};
			var saveEvent = new CustomEvent('savestate', {
				detail: { state: state } });
			window.dispatchEvent(saveEvent);
			for (var n in state) {
				if (state.hasOwnProperty(n)) localStorage[key + '.' + n] = state[n];
			}
		});
	};

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
			getPicture: function getPicture(resolve, reject) {
				var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

				options = Object.assign(options, { video: true });

				// Translate CameraOptions to browsers' options
				if (options.targetWidth) options.width = options.targetWidth;
				if (options.targetHeight) options.height = options.targetHeight;

				capturePhoto(options).then(function (data) {
					return resolve(data.replace(/^.*base64,/, ''));
				}).catch(reject);
			}
		};

		navigator.camera = window.Camera;

		navigator.handDrawTool = {
			record: function record(resolve, options) {
				capturePath(options).then(resolve);
			},
			getSVG: function getSVG(data, width, height) {
				return '\n	  <svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">\n		<path id="p" stroke="dodgerblue" stroke-width="1" fill="none" d="' + data + '"/>\n	  </svg>';
			}
		};

		attachStateEvents();
	}
})()
