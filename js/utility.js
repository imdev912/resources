/* common utility functions -by Rahul Singh */

// global variables
var style = {};
var script = {};
var page_type = $('#pageType').val();
var shortMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var fullMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var entity = {"value": [], "set": {}, "reset": {}, "timer":{}, "async": []};
var r_entity = [];

// cookies start

// set cookie data
function setCookie(c_name, c_value, exp_mins=60, samesite='lax') {
  let d = new Date();
  d.setTime(d.getTime() + (exp_mins * 60 * 1000));
  document.cookie = `${c_name}=${c_value};expires=${d.toUTCString()};path=/;samesite=${samesite};secure`;
}

// get cookie data by name
function getCookie(c_name) {
  let c_value = '';
  let decoded_cookie = decodeURIComponent(document.cookie);
  let cookies = decoded_cookie.split(';');

  cookies.forEach(cookie => {
    if (cookie.trim().indexOf(c_name + '=') == 0) c_value = cookie.split(c_name + '=')[1];
  });

  return c_value;
}

// delete cookie data
function deleteCookie(c_name, samesite='lax') {
  let d = new Date(null);
  document.cookie = `${c_name}=;expires=${d.toUTCString()};path=/;samesite=${samesite};secure`;
}

// delete all cookies
function deleteAllCookies() {
  let decoded_cookie = decodeURIComponent(document.cookie);
  let cookies = decoded_cookie.split(';');

  cookies.forEach(cookie => {
    let eqPos = cookie.trim().indexOf("=");
    let c_name = eqPos > -1 ? cookie.trim().substr(0, eqPos) : cookie;
    deleteCookie(c_name);
  });
}

// cookies end

var XHR = {};
const request = obj => {
  return new Promise((resolve, reject) => {
    if (XHR[obj.url] && XHR[obj.url].readyState != 4) return reject('abort');
    let xhr = new XMLHttpRequest();
    xhr.open(obj.method || 'GET', obj.url);

    if (!obj.headers) obj.headers = {};
    obj.headers['X-Requested-With'] = 'XMLHttpRequest';
    obj.headers['Access-Control-Allow-Headers'] = 'Origin,Content-Type,Accept';

    if (obj.method && obj.method.toLowerCase() == 'post') {
      obj.headers['Content-type'] = 'application/x-www-form-urlencoded';
    }

    if (obj.headers) {
      Object.keys(obj.headers).forEach(key => {
        xhr.setRequestHeader(key, obj.headers[key]);
      });
    }

    XHR[obj.url] = xhr;

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
        delete(XHR[obj.url]);
      } else {
        reject(xhr.statusText);
        delete(XHR[obj.url]);
      }
    };
    
    xhr.onerror = () => {
      reject(xhr.statusText);
      delete(XHR[obj.url]);
    }

    if (typeof obj.data == 'object') {
      obj.data = new URLSearchParams(obj.data);
      obj.data = obj.data.toString();
    }

    xhr.send(obj.data);
  });
};

var modals = {};
const getModal = obj => {
  if (!obj) obj = {};
  if (!obj.id) obj.id = 'TenTimes-Modal';

  if (document.getElementById(`${obj.id}`)) {
    if (document.getElementById(`${obj.id}`).classList.contains('modal')) {
      if (!modals[obj.id]) modals[obj.id] = new bootstrap.Modal(document.getElementById(obj.id));
      modals[obj.id].hide();
      if (document.querySelector('.modal-backdrop.show')) document.querySelector('.modal-backdrop.show').remove();

      if (document.querySelector(`#${obj.id} .modal-title`)) {
        document.querySelector(`#${obj.id} .modal-title`).innerHTML = '';
        if (document.querySelector(`#${obj.id} .modal-body`)) {
          document.querySelector(`#${obj.id} .modal-body`).innerHTML = '';
          if (document.querySelector(`#${obj.id} .modal-footer`)) {
            document.querySelector(`#${obj.id} .modal-footer`).innerHTML = '';
            return false;
          }
        }
      }
    }
    
    document.getElementById(`${obj.id}`).remove();
  }

  let modal = `
    <div id="${obj.id}" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="10t-${obj.id}" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h4 id="10t-${obj.id}" class="modal-title">${obj.title ? obj.title : ''}</h4>
            <button type="button" class="btn-close" data-bs-dismiss="modal" data-bs-target="#${obj.id}" aria-label="close"></button>
          </div>
          
          <div class="modal-body">
            ${obj.body ? obj.body : ''}
          </div>

          <div class="modal-footer">
            ${obj.footer ? obj.footer : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  if (document.getElementById(`${obj.id}-container`)) document.getElementById(`${obj.id}-container`).remove();
  let container = document.createElement('div');
  container.id = `${obj.id}-container`;
  container.innerHTML = modal;

  document.body.appendChild(container);
  modals[obj.id] = new bootstrap.Modal(document.getElementById(obj.id));
}

const addHTML = obj => {
  if (!obj || !obj.html || !obj.selector) return false;
  if (!obj.container) obj.container = {};
  if (!obj.container.elem) obj.container.elem = 'div';

  if (obj.container.elem) {
    let container = document.createElement(obj.container.elem);

    if (obj.container.id) container.id = obj.container.id;
    if (typeof obj.container.class == 'object') {
      obj.container.class.forEach(data => {
        container.classList.add(data);
      });
    }

    container.innerHTML = obj.html;
    document.getElementById(`${obj.selector}`).appendChild(container);
  }
}

/*
  input:
    object
    string
    number
  output:
    if not null return true else return false
*/
function nullCheck(data) {
  if(typeof(data) !== "undefined") {
    if(data != undefined && data != "undefined") {
      if(data != null) {
        if(typeof(data) === "object") {
          if(Object.keys(data).length > 0) return true;
        } else if(typeof(data) === "string") {
          if(data.trim() != "") return true;
        } else if(typeof(data) === "number") {
          if(!isNaN(data)) return true;
        }
      }
    }
  }
  return false;
}

/*
  input:
    string
  output:
    returns string in title case
*/
function toTitleCase(str) {
  if(typeof str === "string") {
    if ((str != null) && (str != "") && (str != undefined)) {
      var lcStr = str.toLowerCase();
      return lcStr.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
      });
    }
  }
}

/*
  warning:
    it will block JavaScript’s execution thread and ensure that nobody can interact with program until it finishes
  input:
    time in milliseconds
  output:
    sleep for input milliseconds
*/
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

/*
  input:
    object
    string
    number
  output:
    if input not null, return input else ''
*/
function assign(data) {
  if(nullCheck(data)) {
      return data;
  }
  return '';
}

/*
  on call:
    if browser if IE, return true else false
*/
function checkIE() {
  let ua = window.navigator.userAgent;
  let isIE = /MSIE|Trident/.test(ua);
  return isIE;

}

/*
  input:
    string
  output:
    true if url else false
*/
function valid_url(url) {
  if(typeof url == "string") {
    var valid_url = /^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    if(valid_url.test(url)) {
        return true;
    }
  }
  return false;
}

/*
  input:
    data: number
    pos: preppend (p) / append (a)
  output:
    adds a 0 as per pos
*/
function setZero(data, pos='p', num=10) {
  if(!isNaN(parseInt(data))) {
      if((pos == 'p') && (data < num)) {
          data = '0' + data;
      } else if(pos == 'a') {
          data = data + '0';
      }
  }
  return data;
}

/*
  input:
    start_day
    end_day
  output:
    returns events status
*/
function getStatus(start_day, end_day) {
  let sd_diff = dayjs().diff(start_day, "days");
  let ed_diff = dayjs().diff(end_day, "days");
  let sh_diff = dayjs().diff(start_day, "hours");
  let eh_diff = dayjs().diff(end_day, "hours");
  let sm_diff = dayjs().diff(start_day, "minutes");
  let em_diff = dayjs().diff(end_day, "minutes");

  let response = {};

  response["ended"] = true;
  if((ed_diff == 0 && eh_diff >= 0 && em_diff >= 0) || ed_diff > 0) {
      response["ended"] = false;
  }

  let update = true;
  let status = '';

  if(sd_diff <= 0) {
      if(sd_diff == 0 && (sh_diff > 0 || sm_diff > 0)) {
          update = true;
      } else if(sd_diff == 0 && (sh_diff == 0 && sm_diff < 60 && sm_diff > -60)) {
          let t = dayjs().diff(start_day, "minutes") * -1;
          status = 'Starting in ' + t + ' minute';
          if(t > 1) {
              status += 's';
          }
          update = false;
      } else if(sd_diff == 0 && (sh_diff <= 0 && sh_diff >= -5) && (sm_diff < 300 && sm_diff > -300)) {
          let t = dayjs().diff(start_day, "hours") * -1;
          status = 'Starting in ' + t + ' hour';
          if(t > 1) {
              status += 's';
          }
          update = false;
      } else {
          status = 'Upcoming';
          update = false;
      }
  }

  if(update == true) {
      if(sd_diff >= 0) {
          if(ed_diff <= 0) {
              if((sd_diff > 0) && ((ed_diff == 0 && eh_diff <= 0) || (ed_diff < 0))) {
                  status = 'Live';
              } else if((sd_diff == 0) && ((ed_diff == 0 && sh_diff >= 0 && eh_diff <= 0) || (ed_diff < 0 && sh_diff >= 0))) {
                  status = 'Live';
              } else {
                  status = 'Ended';
              }
          } else {
              status = 'Ended';
          }
      } else {
          status = 'Upcoming';
      }
  }

  response["status"] = status;
  return response;
}

function loadLink(href, rel='stylesheet', integrity='', crossorigin='', as='') {
  return new Promise(function (resolve, reject) {
    let link = document.createElement('link');
    link.href = href;
    link.rel = rel
    if (integrity) link.integrity = integrity;
    if (crossorigin) link.crossOrigin = crossorigin;
    if (as) link.as = as;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

function loadScript(src, integrity='', crossorigin='') {
  return new Promise(function (resolve, reject) {
    let script = document.createElement('script');
    script.src = src;
    if (integrity) script.integrity = integrity;
    if (crossorigin) script.crossOrigin = crossorigin;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function bootstrapJS(callback) {
  if (typeof bootstrap != 'object' && !script.bootstrap) {
    loadScript(
      'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js',
      'sha384-JEW9xMcG8R+pH31jmWH6WWP0WintQrMb4s7ZOdauHnUtxwoG2vI5DkLtS3qm9Ekf',
      'anonymous'
    )
    .then(function() {
      if (typeof bootstrap == 'object') typeof callback == 'function' && callback();
    })
    .catch(err => {
      console.log('unbale to load bootstrap js');
      console.log(err);
    });

    script.bootstrap = true;
  }
}

function fontawsomeJS() {
  if (!script.fontawsome) {
    loadScript(
      'https://kit.fontawesome.com/c7af9ddb4e.js',
      '',
      'anonymous'
    )

    script.fontawsome = true;
  }
}

function lazysizesJS() {
  if (!script.lazysizes) {
    loadScript(
      'https://cdn.jsdelivr.net/npm/lazysizes@5.3.2/lazysizes.min.js',
      'sha256-PZEg+mIdptYTwWmLcBTsa99GIDZujyt7VHBZ9Lb2Jys=',
      'anonymous'
    )
    .then(function() {
      if (typeof bootstrap == 'object') typeof callback == 'function' && callback();
    })
    .catch(err => {
      console.log('unbale to load lazysizes js');
      console.log(err);
    });

    script.lazysizes = true;
  }
}

function dayJS(callback) {
  if (typeof dayjs != 'function' && !script.dayjs) {
    loadScript(
      'https://cdn.jsdelivr.net/npm/dayjs@1.10.4/dayjs.min.js',
      'sha256-NTsR4SOm3YHfJrmrmvBtEYqfQ6jQ5yvEKMhgQe3DIl0=',
      'anonymous'
    )
    .then(function () {
      if (typeof dayjs == 'function') typeof callback == 'function' && callback();
    })
    .catch(err => {
      console.log('unbale to load lazysizes js');
      console.log(err);
    });

    script.dayjs = true;
  }
}

function flatpickrCSS() {
  if (!style.flatpickr) {
    loadLink(
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.9/dist/flatpickr.min.css',
      'stylesheet',
      'sha256-RXPAyxHVyMLxb0TYCM2OW5R4GWkcDe02jdYgyZp41OU=',
      'anonymous'
    )

    style.flatpickr = true;
  }
}

function flatpickrJS(callback) {
  if (typeof dayjs != 'function' && !script.dayjs) {
    dayJS(function () {
      if (typeof flatpickr != 'function' && !script.flatpickr) {
        loadScript(
          'https://cdn.jsdelivr.net/npm/flatpickr@4.6.9/dist/flatpickr.min.js',
          'sha256-AkQap91tDcS4YyQaZY2VV34UhSCxu2bDEIgXXXuf5Hg=',
          'anonymous'
        ).then(function () {
          if (typeof flatpickr == 'function') typeof callback == 'function' && callback();
        })
        
        flatpickrCSS();
        script.flatpickr = true;
      }
    })
  } else if (typeof flatpickr != 'function' && !script.flatpickr) {
    loadScript(
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.9/dist/flatpickr.min.js',
      'sha256-AkQap91tDcS4YyQaZY2VV34UhSCxu2bDEIgXXXuf5Hg=',
      'anonymous'
    ).then(function () {
      if (typeof flatpickr == 'function') typeof callback == 'function' && callback();
    })

    flatpickrCSS();
    script.flatpickr = true;
  }
}

function resetEntity() {
  $.each(entity.value, function(idx, val) {
    if($.inArray(val, r_entity) < 0) {
      if(entity.reset[val] !== undefined) {
        selected_entity[val] = entity.reset[val];
      } else {
        delete selected_entity[val];
      }
    }
  });
}

/*
  on call:
    convert date and time as per timezone
  trigger:
    .eventTime
  attributes:
    data-start-date
    data-end-date
    data-start-time
    data-end-time
    data-timezone
    optional:
      data-status
*/

function localTimezone() {
  if (typeof dayjs == 'function') {
    let run_time = dayjs(new Date());

    document.querySelectorAll('.eventTime').forEach(elem => {
      let date  = {
        'start': elem.dataset.startDate,
        'end': elem.dataset.endDate
      }

      let time  = {
        'start': elem.dataset.startTime,
        'end': elem.dataset.endTime,
      }
      
      let timezone = elem.dataset.timezone;
      let status = elem.dataset.status;
      let date_time = {};

      if (timezone) {
        if (date.start) {
          date_time.start = date.start;
          if (time.start) {
            date_time.start += ' ' + time.start;
            if (timezone) {
              date_time.start += ' ' + timezone;
            }
          }
          date_time.start = dayjs(date_time.start);
        }

        if (date.end) {
          date_time.end = date.end;
          if (time.start) {
            date_time.end += ' ' + time.end;
            if (timezone) {
              date_time.end += ' ' + timezone;
            }
          }
          date_time.end = dayjs(date_time.end);
        }

        if (date_time.start) {
          date_time.diff = run_time.diff(date_time.start, 'hour');
          date_time.start = {
            'object': date_time.start,
            'day': date_time.start.format('ddd'),
            'date': date_time.start.format('DD'),
            'month': date_time.start.format('MMM'),
            'year': date_time.start.format('YYYY')
          }

          date_time.locale = date_time.start.day + ', ' + date_time.start.date + ' ' + date_time.start.month + ' ' + date_time.start.year;

          if (date_time.end) {
            date_time.end = {
              'object': date_time.end,
              'day': date_time.end.format('ddd'),
              'date': date_time.end.format('DD'),
              'month': date_time.end.format('MMM'),
              'year': date_time.end.format('YYYY')
            }

            if (date_time.start.object.format('YYYY-MM-DD') == date_time.end.object.format('YYYY-MM-DD')) {
              date_time.locale = date_time.start.day + ', ' + date_time.start.date + ' ' + date_time.start.month + ' ' + date_time.start.year;
            } else {
              date_time.locale = date_time.start.day + ', ' + date_time.start.date;

              if (date_time.start.month != date_time.end.month) {
                date_time.locale += ' ' + date_time.start.month;
              }

              if (date_time.start.year != date_time.end.year) {
                date_time.locale += ' ' + date_time.start.year;
              }

              date_time.locale += ' - ' + date_time.end.day + ', ' + date_time.end.date + ' ' + date_time.end.month + ' ' + date_time.end.year;
            }
          }

          if (time.start && time.end) date_time.locale += '&ensp;&bull;&ensp;' + date_time.start.object.format('hh:mm A');
        }

        if (date_time.locale && date_time.locale.toLowerCase().indexOf('invalid') < 0) elem.innerHTML = date_time.locale;
        if (!isNaN(date_time.diff)) elem.dataset.timeDiff = date_time.diff;
      }

      elem.classList.remove('eventTime');
    })
  }
}

function getDateRangePicker() {
  if (document.querySelectorAll('.date-range-picker').length) {
    if (typeof flatpickr == 'function' && typeof dayjs == 'function') {
      let config = {
        dateFormat: "Y-m-d",
        weekNumbers: true,
        defaultDate: [],
        minDate: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
        maxDate: dayjs().add(5, 'year').format('YYYY-MM-DD'),
        mode: "range",
        opens: 'center',
        autoclose: true,
        autoApply : true
      };
      
      if (selected_entity) {
        if (selected_entity.datefrom) config.defaultDate.push(selected_entity.datefrom);
        if (selected_entity.dateto) config.defaultDate.push(selected_entity.dateto);
      }
  
      date_range = flatpickr(".date-range-picker", config);
  
      date_range.config.onValueUpdate.push(function(selectedDates, dateStr, instance) {
        selected_entity.month = '';
        if (selectedDates[0]) {
          selected_entity.datefrom = dayjs(selectedDates[0]).format('YYYY-MM-DD');
          if (selectedDates[1]) {
            selected_entity.dateto = dayjs(selectedDates[1]).format('YYYY-MM-DD');
            customEventGA('Listing Filter', 'from-to YYYY-MM-DD - YYYY-MM-DD', `Event Listing | From ${dateStr}`);
            if (typeof filterApplyNRedirect == 'function') filterApplyNRedirect();
  
            let target = instance.element.dataset.target;
            if(target) {
              target = document.getElementById(target);
              target.classList.add('text-orange');
              target.innerHTML = dateStr;
            }
          }
        }
      })
    }
  }
}

/*
  on call:
    convert media data to scroller
  trigger:
    container: .scroller-container
    wrapper: .scroller (list)
    content: .scroller-item (list-item)
    buttons: .scroller-left, .scroller-right
  input:
    move: distance (inverse)
    speed: time (ms)
*/

function getScroller(move=2, speed=500) {
  $(".scroller-container").each(function() {
    if($(this).data("sync") === undefined) {
      var hScroll = $(this).find('.scroller')[0].getBoundingClientRect();
      if($(this).find('.scroller').find('.scroller-item:last-child').length > 0 && hScroll.right < $(this).find('.scroller').find('.scroller-item:last-child')[0].getBoundingClientRect().right ) {
        $(this).find('.scroller-right').fadeIn();
      }

      $(this).find(".scroller-left").click(function() {
        $(this).closest(".scroller-container").find('.scroller').animate({scrollLeft: $(this).closest(".scroller-container").find('.scroller').scrollLeft() - hScroll.width/move}, speed);
      });

      $(this).find(".scroller-right").click(function() {
        $(this).closest(".scroller-container").find('.scroller').animate({scrollLeft: $(this).closest(".scroller-container").find('.scroller').scrollLeft() + hScroll.width/move}, speed);
      });

      $(this).find('.scroller').scroll(function() {
        if($(this).scrollLeft() < hScroll.width/(move+1) ) {
          $(this).closest(".scroller-container").find('.scroll-item-left').show();
        } else {
          $(this).closest(".scroller-container").find('.scroll-item-left').hide();
        }

        if($(this).scrollLeft() < 10 ) {
          $(this).closest(".scroller-container").find('.scroller-left').fadeOut("slow");
        } else {
          $(this).closest(".scroller-container").find('.scroller-left').fadeIn("slow");
        }

        if($(this).scrollLeft() + hScroll.width >  $(this)[0].scrollWidth - (hScroll.width/(move+1)) ) {
          $(this).closest(".scroller-container").find('.scroll-item-right').show();
        } else {
          $(this).closest(".scroller-container").find('.scroll-item-right').hide();
        }

        if($(this).scrollLeft() + hScroll.width > $(this)[0].scrollWidth -10 ){
          $(this).closest(".scroller-container").find('.scroller-right').fadeOut("slow");
        } else{
          $(this).closest(".scroller-container").find('.scroller-right').fadeIn("slow");
        }
      });

      $(this).data("sync", "true");
    }
  });
}

function addAsyncEvents(actor, max=18, split_arg=true) {
  showloading();
  let page = !isNaN($(actor + "-data").data("page")) ? parseInt($(actor + "-data").data("page")) : 1;
  let link = nullCheck($(actor + "-data").data("param")) ? $(actor + "-data").data("param") : '';
  let template = nullCheck($(actor + "-data").data("template")) ? $(actor + "-data").data("template") : '';
  let block = nullCheck($(actor + "-data").data("block")) ? $(actor + "-data").data("block") : '';
  let action = nullCheck($(actor + "-data").data("action")) ? $(actor + "-data").data("action") : '';
  let target = nullCheck($(actor + "-data").data("target")) ? $(actor + "-data").data("target") : '';
  let args = '';

  if(split_arg == true) {
    if(link != '') {
      if(link.indexOf('&') > -1) {
        link = link.split('&');
      }

      if(typeof link == "object") {
        link = link.join('_');
      }
    }
    args = '&and=' + link;
  } else {
    args = link;
  }

  page += 1;
  if(page > 8) {
    $(actor + "-data").remove();
    hideloading();
    return;
  }

  $.ajax({
    type: "GET",
    url: site_url_list + '/ajax?for=' + action + '&ajax=1&max=' + max + '&page=' + page + '&template=' + template + '&block=' + block + '&target=' + target.split("#")[1] + args,
    success: function(data) {
      if(nullCheck(data)) {
        $(target).append(data);
        $(actor + "-data").data("page", page);
        sync();
      } else {
        page -= 1;
        $(actor + "-data").remove();
        hideloading();
      }

      if(entity.async.indexOf("addAsyncEvents") > -1) {
        entity.async.splice(entity.async.indexOf("addAsyncEvents"), 1);
      }
    }
  });
}

function URLld(data) {
  Set.prototype.index = function(index) { return [...this][index]; }
  let ListItem = [];
  for(let idx=0; idx<10; idx++) {
    if(data.index(idx) == undefined) break;
    listElem = {};
    listElem["@type"] = "ListItem";
    listElem["position"] = idx+1;
    listElem["url"] = data.index(idx);
    ListItem.push(listElem);
  }

  let json_ld = {
    "@context": "http://schema.org",
    "@type": "ItemList",
  }
  json_ld["itemListElement"] = ListItem;
  return json_ld;
}

function JSONld() {
  let structured_url = [];
  
  document.querySelectorAll(".event-url").forEach(
    function(val, idx) {
      let url = val.getAttribute("data-url");
      if(url != null && url != '') {
        structured_url.push(url);
      }
  });
  structured_url = new Set(structured_url);

  let value = URLld(structured_url);
  let elem = document.createElement('script');
  elem.type = 'application/ld+json';
  elem.text = JSON.stringify(value);
  document.querySelector('head').appendChild(elem);
}

function sync() {
  if (["homepage", "listing"].indexOf(pageType) > -1) {
    // function in listingnew
    resetEntity();
  }

  // sync date and time
  if (document.querySelectorAll('.eventTime').length) {
    if (typeof dayjs != 'function') {
      dayJS(localTimezone);
    } else {
      script.dayjs = true;
      localTimezone();
    }
  }

  // initialise daterange picker
  if (document.querySelectorAll('.date-range-picker').length) {
    if (typeof dayjs != 'function' || typeof flatpickr != 'function') {
      flatpickrJS(getDateRangePicker);
    } else {
      script.flatpickr = true;
      getDateRangePicker();
    }
  }
  
  // init scroller
  getScroller();
  // sync user date
  if (typeof hitMyData == 'function') hitMyData();
  if (document.getElementById('loading')) document.getElementById('loading').style.display = 'none';
}

function getLibs() {
  // jQuery and Bootstrap
  if (typeof jQuery == 'function') {
    script['jQuery'] = jQuery.fn.jquery;

    if((jQuery.fn.tooltip || jQuery.fn.modal || jQuery.fn.tab) != undefined) {
      script["bootstrap"] = (jQuery.fn.tooltip || jQuery.fn.modal || jQuery.fn.tab).Constructor.VERSION;
    }
  }
  
  // moment and moment timezone
  if (typeof moment == 'function') {
    script['moment'] = moment.version;

    if (typeof moment.tz == 'function') {
      script['moment-timezone'] = moment.tz.version;
    }
  }
  
  if (typeof dayjs == 'function') script.dayjs = true;
  if (typeof flatpickr == 'function') script.flatpickr = true;
}

function initLogin() {
  if(typeof IN == 'undefined') {
    loadScript('https://platform.linkedin.com/in.js?async=true')
    .then(() => {
      IN.init({
        api_key: 'ro57ogahnixy',
        authorize: true,
        onLoad: 'onLinkedInLoad'
      });
    })
  }

  if (getCookie('user') && getCookie('user_token')) {
    loadScript('https://accounts.google.com/gsi/client')
    .then(() => {
      google.accounts.id.initialize({
        client_id: '157995346313-0m2fg2khsl59rip48jjgujscoek2ic1t.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        cancel_on_tap_outside: false
      });

      google.accounts.id.prompt(notification => {
        $('#credential_picker_container').css('margin-top','25px');
        if (notification.l && notification.l == 'user_cancel') {
          customEventGA('User', 'Onetap Close', pageType, true);
        }

        if (!(notification.isNotDisplayed() || notification.isSkippedMoment())) {
          customEventGA('User', 'Onetap Popup', pageType, true);
        }
      });
    })
  }
}

function firstAction() {
  getLibs();
  bootstrapJS(function() {
    // initialise tooltip
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  });

  if (document.getElementsByClassName('fas').length || document.getElementsByClassName('far').length || document.getElementsByClassName('fal').length || document.getElementsByClassName('fad').length || document.getElementsByClassName('fab').length) fontawsomeJS();
  if (document.getElementsByClassName('lazyload').length) lazysizesJS();
  loadScript('https://pagead2.googlesyndication.com/tag/js/gpt.js');
  loadScript('https://apis.google.com/js/client.js');
  initLogin();
  sync();
}

window.addEventListener('DOMContentLoaded', function() {
  if (typeof profileUpdate == 'function') profileUpdate();
})

window.addEventListener('load', function() {
  if(typeof attendNew == 'function') {
    $("body").on("click", ".atnd_modal", function() {
      if(typeof $(this).attr('data-param') !== "undefined")
        attendNew(this,$(this).attr('data-param'));
      else
        attendNew(this,'bookmark listing');
    });
  
    $("body").on("click", ".a-m", function() {
      if(typeof $(this).attr('data-param') !== "undefined")
        attendNew(this,$(this).attr('data-param'));
      else
        attendNew(this,'attend listing');
    });
  }
})

document.addEventListener('click', function(event) {
  if (event.target) {
    if (event.target.id == 'sidebar' && document.querySelector('#sidebar.show')) document.getElementById('sidebar-toggle').click();
    if (event.target.classList.contains('login')) signInTT("signup", "email");
    if (event.target.classList.contains('g-login')) verifySigninTT("login", "autogplus", "");
    if (event.target.classList.contains('fb-login'))verifySigninTT("login", "autofb", "");
    if (event.target.classList.contains('li-login'))verifySigninTT("login", "autolinkedin", "");

    if (event.target.classList.contains('submenu-toggler')) {
      document.querySelectorAll('.sidebar-submenu').forEach(submenu => submenu.classList.add('d-none'));

      if (event.target.classList.contains('active')) {
        event.target.classList.remove('active');
      } else {
        document.querySelectorAll('.submenu-toggler').forEach(toggle => toggle.classList.remove('active'));
        event.target.nextElementSibling.classList.remove('d-none');
        event.target.classList.add('active');
      }
    }
  }
})

var firstInteract = new AbortController();
['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(function(event) {
  document.addEventListener(event, function() {
    firstAction();
    firstInteract.abort();
    // delete firstInteract;
  }, {once: true, signal: firstInteract.signal});
});
