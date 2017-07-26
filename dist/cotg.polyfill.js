/*
 * Polyfill for browser
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
        if (options.destinationType == FILE_URI) {
          canvas.toBlob(function (blob) {
            return accept(URL.createObjectURL(blob));
          });
        } else {
          accept(canvas.toDataURL('image/jpeg'));
        }
      });
    };

    navigator.mediaDevices.getUserMedia(options || { video: true }).then(init).catch(reject);

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
      var x = ev.targetTouches[0].pageX - rect.left;
      var y = ev.targetTouches[0].pageY - rect.top;
      return x + ',' + y;
    };

    var onMouseDown = function onMouseDown(ev) {
      data += 'M' + getCoords(ev) + ' ';
      path.setAttribute('d', data);
      ev.preventDefault();
      ev.stopImmediatePropagation();
    };

    var onMouseMove = function onMouseMove(ev) {
      if (ev.buttons & 1) {
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
      return '\n      <svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">\n        <path id="p" stroke="dodgerblue" stroke-width="1" fill="none" d="' + data + '"/>\n      </svg>';
    }
  };
}

if (!window.Promise) {
  !function(e){function n(){}function t(e,n){return function(){e.apply(n,arguments)}}function o(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],s(e,this)}function i(e,n){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(n):(e._handled=!0,void o._immediateFn(function(){var t=1===e._state?n.onFulfilled:n.onRejected;if(null===t)return void(1===e._state?r:u)(n.promise,e._value);var o;try{o=t(e._value)}catch(i){return void u(n.promise,i)}r(n.promise,o)}))}function r(e,n){try{if(n===e)throw new TypeError("A promise cannot be resolved with itself.");if(n&&("object"==typeof n||"function"==typeof n)){var i=n.then;if(n instanceof o)return e._state=3,e._value=n,void f(e);if("function"==typeof i)return void s(t(i,n),e)}e._state=1,e._value=n,f(e)}catch(r){u(e,r)}}function u(e,n){e._state=2,e._value=n,f(e)}function f(e){2===e._state&&0===e._deferreds.length&&o._immediateFn(function(){e._handled||o._unhandledRejectionFn(e._value)});for(var n=0,t=e._deferreds.length;n<t;n++)i(e,e._deferreds[n]);e._deferreds=null}function c(e,n,t){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof n?n:null,this.promise=t}function s(e,n){var t=!1;try{e(function(e){t||(t=!0,r(n,e))},function(e){t||(t=!0,u(n,e))})}catch(o){if(t)return;t=!0,u(n,o)}}var a=setTimeout;o.prototype["catch"]=function(e){return this.then(null,e)},o.prototype.then=function(e,t){var o=new this.constructor(n);return i(this,new c(e,t,o)),o},o.all=function(e){var n=Array.prototype.slice.call(e);return new o(function(e,t){function o(r,u){try{if(u&&("object"==typeof u||"function"==typeof u)){var f=u.then;if("function"==typeof f)return void f.call(u,function(e){o(r,e)},t)}n[r]=u,0===--i&&e(n)}catch(c){t(c)}}if(0===n.length)return e([]);for(var i=n.length,r=0;r<n.length;r++)o(r,n[r])})},o.resolve=function(e){return e&&"object"==typeof e&&e.constructor===o?e:new o(function(n){n(e)})},o.reject=function(e){return new o(function(n,t){t(e)})},o.race=function(e){return new o(function(n,t){for(var o=0,i=e.length;o<i;o++)e[o].then(n,t)})},o._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){a(e,0)},o._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},o._setImmediateFn=function(e){o._immediateFn=e},o._setUnhandledRejectionFn=function(e){o._unhandledRejectionFn=e},"undefined"!=typeof module&&module.exports?module.exports=o:e.Promise||(e.Promise=o)}(this);
}
