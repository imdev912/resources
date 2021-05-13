var device = document.getElementById('device') ? document.getElementById('device').value : '';
var page_type = document.getElementById('pageType') ? document.getElementById('pageType').value : '';
var user = {
  'city': {},
  'country': {}
}

var country_name = '';
var gdprflag = 0;
var deviceFlag = 1;


// header start

// login / register
var user_name = user_image = user_url = '';

// update user profile in navbar
function profileUpdate() {
  request({
    method: 'GET',
    url: `/ajax?for=navbar&page_type=${page_type}`
  })
  .then(data => {
    data = JSON.parse(data);
    if (document.getElementById('navbar') && data.navbar) document.getElementById('navbar').innerHTML = data.navbar;
    if (document.getElementById('sidebar') && data.sidebar) document.getElementById('sidebar').innerHTML = data.sidebar;
    updateNearby();
    bindExploreKeywordEvents();
  })
  .catch(err => {
    if (err != 'abort') {
      console.log(err);
      showToast('Error: User profile not updated!');
      if (document.referrer != location.href) location.reload();
    }
  })
}

// get user data from cookie
function getLoggedInDataN(){
  if (!getCookie('user') || !getCookie('user_token')) return 1;
  
	user_image = 'https://img.10times.com/images/no-pic.jpg';
  user_url = '/events';

  if (getCookie('name')) {
    user_name = decodeURIComponent(getCookie('name').replace(/\+/g, " "));
		var temp = user_name.charAt(0).toLowerCase();
		if (temp.match(/[a-z]/i)) user_image = `https://img.10times.com/userimages/${temp}.jpg`;
	}

  if (getCookie('image_flag')) user_image = atob(decodeURIComponent(getCookie('image_flag')));
  if (getCookie('user_profileurl')) user_url = atob(decodeURIComponent(getCookie('user_profileurl')));

  if (document.querySelector(".gplus-login-btn") != null) document.querySelector(".gplus-login-btn").remove();
  if (document.querySelector(".in-login-btn") != null) document.querySelector(".in-login-btn").remove();
  if (document.querySelector(".fb-login-btn") != null) document.querySelector(".fb-login-btn").remove();

  profileUpdate();
  hitMyData();
  askNotification();
}
// login/register end

// header nearby
function updateNearby(redirect=false) {
  let loc_name = 'Nearby Events';
  let loc_url = '/events/nearby';

  if (user.country.name) loc_name = user.country.name;
  if (user.country.url) loc_url = user.country.url;
  if (user.city.name) loc_name = user.city.name;
  if (user.city.url) loc_url = user.city.url;

  if (document.getElementById('loc_name')) {
    let nearby = document.getElementById('loc_name');
    nearby.textContent = loc_name;
    nearby.setAttribute('onclick', `location.href="${loc_url}";customEventGA('Header', 'City', '${loc_name} Page Redirection');`);
  }

  if (redirect) {
    location.href = loc_url;
  } else {
    if (typeof adsPrefer == 'function') adsPrefer();
  }
}

function getCity(position) {
  let lat = position.coords.latitude;
  let lng = position.coords.latitude;

  user.city.name = 'Nearby Events';
  user.city.url = `/events/nearby?lat=${lat}&lng=${lng}`;

  request({
    method: 'GET',
    url: `${site_url_attend}/ajax?for=nearby&lat=${lat.toFixed(2)}&lng=${lng.toFixed(2)}`
  })
  .then(data => {
    data = JSON.parse(data);
    if (data.status.code == 1 && data.data) return data.data;
  })
  .then(data => {
    if (data) {
      if (data.id) user.city.id = data.id;
      if (data.name) user.city.name = data.name;
      if (data.url) {
        user.city.url = data.url;
      } else if (data.place_id) {
        user.city.url += `&place_id=${data.place_id}`;
      }
      if (data.countryId) user.country.id = data.countryId;
      if (data.countryName) user.country.name = data.countryName;
      if (data.countryUrl) user.country.url = data.countryUrl;
      
      updateNearby(true);
    }
  })
}

function getLocation() {
  if (!user.city.url) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getCity);
    }
  } else {
    updateNearby(true);
  }
}
// header nearby end

// search by keywords start
var city_name='', country_name='';
var filters = {};

// get value from element
function getWord(elem) {
  if (elem != null) {
      var val = elem.text();
      if (nullCheck(val)) {
          val = val.trim();
          if (nullCheck(val)){
              val = val.split('\n')[0];
          }
      }
      return val;
  }
}

// get city and country deatils for filter
function getFilter(entity, data, dataName) {
  var arg = "&" + dataName + "=" + data;

  if (data) {
    request({
      method: 'GET',
      url: `${site_url_attend}/ajax?for=nearby${arg}`
    })
    .then(data => {
      data = JSON.parse(data);
      if (data.status == 200 && data.entity) return data.entity;
    }).then(data => {
      if (data && entity) {
        val = data[entity];
          if (val) {
            if(entity == "city_name") {
              city_name += val;
            } else if(entity == "country_name") {
              country_name += val;
            }
          }
        }
    })
  }
}

// filter append end

// remove some stop words
function checkWords(data) {
  if(nullCheck(data)) {
      data = data.replace(/In |in |From |from |To |to /g, '');
      return data;
  }
}

/*
displaying search results
keywords: string to search
skip: param which should not be included
filter: args or params to be used with search string
tab: new -> new tab
*/
function searchResult(keywords="", skip="", filter="", tab="") {
  var url = site_url_attend;
  
  if(!nullCheck(filter) && typeof urlMaker == "function") filter = urlMaker();

  switch(skip) {
    case "loc":
      if(nullCheck(city)) {
        filter = filter.replace('/' + city, '');
      } else if(nullCheck(country)) {
        filter = filter.replace('/' + country, '');
      }
    break;
  }

  url += nullCheck(filter) ? filter : '/events';

  if (nullCheck(keywords)) {
    customEventGA('Header', 'Search', keywords);
    url += '?searchby&kw=' + encodeURIComponent(checkWords(keywords));
  }

  showloading();

  switch(tab) {
    case "new":
      window.open(url);
    break;

    default:
      window.location.href = url;
    break;
  }
}

function searchKwd(search) {
  var keywords = search.val().trim();
  if (keywords.length >= 3) {
      searchResult(keywords);
  }
}

// get date from search
function kwdDate(data) {
  if(nullCheck(data)) {
      data = data.trim().split('-');

      if(data && data.length > 0) {
          const date = new Date(data[2], data[1]-1, data[0]);
          const month = date.toLocaleString('default', { month: 'long' });

          if(nullCheck(month)) {
              return month;
          }
      }
  }
}

// get location searched
function kwdLoc(srch_kwd) {
  var loc = getWord($('#location_0'));
  if (!nullCheck(loc) && nullCheck(srch_kwd)) {
      loc = srch_kwd.split('In')[1];
      return loc;
  } else if(nullCheck(loc)) {
      return loc;
  }
}

function searchString(skip="", redUrl="") {
  var userProduct = getWord($('#product_0'));
  var startDate = getWord($('#timeperiod_0'));
  var endDate = getWord($('#timeperiod_1'));
  var location = getWord($('#location_0'));
  var savedLoc = $('#location_0').attr('data-value');

  if(skip == "none") {
      if(nullCheck(savedLoc) && (location != savedLoc)) {
          $('#location_0').html(savedLoc);
      }

      if(nullCheck(city_name)) {
          location = city_name;
      }

      if(nullCheck(country_name)) {
          location = country_name;
      }
  }

  var searchString = "";

  if(nullCheck(userProduct) && skip != 'prod') {
      searchString = userProduct.trim();
  }

  if(skip != "none") {
      if((nullCheck(location) && skip != 'loc')) {
          searchString += ' In ' + location.trim();
      }

      if(nullCheck(startDate) && skip != 'date') {
          startDate = kwdDate(startDate);
          if(nullCheck(startDate)) {
              searchString += ' From ' + startDate.trim();
          }
      }

      if(nullCheck(endDate) && skip != 'date') {
          endDate = kwdDate(endDate);
          if(nullCheck(endDate)) {
              if(nullCheck(startDate) && startDate != endDate) {
                  searchString += ' To ' + endDate.trim();
              } else if(!nullCheck(startDate)) {
                  searchString += ' To ' + endDate.trim();
              }
          }
      }
  }
  
  if(nullCheck(redUrl)) {
      if(nullCheck(selected_entity['kw'])) {
          redUrl = redUrl.split(selected_entity['kw']);
          if(nullCheck(searchString)) {
              customEventGA('Header', 'Search', searchString);
              window.location.href = site_url_attend + redUrl[0] + encodeURIComponent(checkWords(searchString)) + redUrl[1];
          } else {
              customEventGA('Header', 'Search', selected_entity['kw']);
              window.location.href = site_url_attend + redUrl[0] + encodeURIComponent(checkWords(selected_entity['kw'])) + redUrl[1];
          }
      }
  } else {
      if(nullCheck(skip) && nullCheck(searchString)) {
          searchResult(searchString.trim(), skip);
      } else if(nullCheck(skip) && !nullCheck(searchString)) {
          searchResult();
      }
  }

  if(nullCheck(searchString)) {
      return searchString.trim();
  }
}

// search suggestion action
function keyFun(type, idx) {
  var kwd = ['product_', 'location_', 'timeperiod_', 'similar_'];
  var srch_kwd = $('#explore-keywords').val();
  var clkd_kwd_id = '#' + kwd[type] + idx;
  var clkd_kwd = $(clkd_kwd_id).text();
  if (clkd_kwd != "") {
      clkd_kwd = clkd_kwd.split('\n')[0];
  }
  clkd_kwd = toTitleCase(clkd_kwd);

  if (type == 0) {
      // remove user product
      searchString('prod');
  }

  if (type == 1) {
      // remove location selected
      searchString('loc');
  }

  if (type == 2) {
      // remove 'from' date section
      searchString('date');
  }

  // user clicked similar word
  if (type == 3) {
      var sim = clkd_kwd.trim();
      var loc = getWord($('#location_0'));
      var date_0 = getWord($('#timeperiod_0'));
      var date_1 = getWord($('#timeperiod_1'));

      if(nullCheck(loc)) {
          sim = sim + ' In ' + loc;
      }

      if((date_0 == date_1) && nullCheck(date_0)) {
          date_0 = kwdDate(date_0);
          if(nullCheck(date_0)) {
              sim = sim + ' From ' + date_0;
          }
      } else {
          if(nullCheck(date_0)) {
              date_0 = kwdDate(date_0);
              if(nullCheck(date_0)) {
                  sim = sim + ' From ' + date_0;
              }
          }
          if(nullCheck(date_1)) {
              date_0 = kwdDate(date_1);
              if(nullCheck(date_1)) {
                  sim = sim + ' To ' + date_1
              }
          }
      }

      if(nullCheck(sim)) {
          sim = toTitleCase(sim);
          searchResult(sim);
      }
  }
}
// search by keywords end

function server_login() {
  let nextURL = [location.pathname, 'login', location.search];
  nextURL = nextURL.join('/').replace('//', '/');
  location.href = nextURL;
}

window.addEventListener('DOMContentLoaded', function() {
  if (getCookie('ip2loc') == '') {
    request({
      method: 'GET',
      url: `${site_url_attend}/ajax?for=nearby&user_loc=true`
    })
    .then(data => {
      data = JSON.parse(data);
      if (data.status.code == 1 && data.data) return data.data;
    })
    .then(data => {
      if (data) {
        if (data.id) user.city.id = data.id;
        if (data.name) user.city.name = data.name;
        if (data.url) user.city.url = data.url;
        if (data.countryId) user.country.id = data.countryId;
        if (data.countryName) user.country.name = data.countryName;
        if (data.countryUrl) user.country.url = data.countryUrl;

        data = {
          'city': user.city,
          'country': user.country
        };
        
        setCookie('ip2loc', JSON.stringify(data), 30);
        updateNearby();
      } else {
        if (document.getElementById('loc_name')) document.getElementById('loc_name').setAttribute('onclick', 'getLocation()');
      }
    })
    .catch(err => {
      console.log(err);
      if (document.getElementById('loc_name')) document.getElementById('loc_name').setAttribute('onclick', 'getLocation()');
    });
  } else {
    let data = getCookie('ip2loc');
    data = JSON.parse(data);
    if (data.city) user.city = data.city;
    if (data.country) user.country = data.country;
    updateNearby();
  }

  // put search string in search field
  if (document.getElementById('searchString')) document.getElementById('searchString').textContent = searchString();
  // save location in search srting
  if (document.getElementById('location_0')) document.getElementById('location_0').dataset.value = document.getElementById('location_0').textContent;
  if (document.getElementById("city_url")) getFilter("city_name", document.getElementById("city_url").value, "cityName");
  if (document.getElementById("country_url")) getFilter("country_name", document.getElementById("country_url").value, "countryName");

  // add search string to search box
  if (location.href.split('kw=')[1]) {
    if (location.href.split('kw=')[1].split('&')[0]) {
      let keywords = decodeURIComponent(location.href.split('kw=')[1].split('&')[0]);
      keywords = toTitleCase(keywords);

      if (keywords) document.getElementById('explore-keywords').value = keywords;
    }
  }
})

// header end

function hitMyData(type){
  if(getCookie('user') && getCookie('user_token')) {
    let url = site_url + '/ajax?for=my_data&_v=' + getCookie('10T_last');

    switch(pageType) {
      case 'listing':
        url += '&pageType=' + pageType
        if (document.getElementById('type_url')) url += '&eventType=' + document.getElementById('type_url').value;
      break;

      case 'venue_detail':
        url += '&pageType=' + pageType + '&entityId=' + venueId;
      break;

      case 'photos-videos':
        url += '&pageType=' + pageType;
      break;

      case 'live':
        if (document.getElementById('videoId')) url += '&video_id=' + document.getElementById('videoId').value;
      break;

      case 'group':
        url += '&pageType=' + pageType + '&entityId=' + groupId;
      break;

      default:
        if (document.getElementById('eventEdition')) url += '&edition_id=' + document.getElementById('eventEdition').value;
      break;
    }

    $.ajax({
      type: "GET",
      url: url,
      success: function(result) {
        if ($('.msgCount sup').length == 0  && result.hasOwnProperty("unreadMessages") && result.unreadMessages > 0) {
          if (result.unreadMessages > 99) result.unreadMessages = '99+';
          $('.msgCount').append(`
            <sup>
              <span class="text-white bg-danger rounded px-1">${result.unreadMessages}</span>
            </sup>`
          );
        }

        if ($('.conCount sup').length == 0  && result.hasOwnProperty("connectPending") && result.connectPending > 0){
          if (result.connectPending > 99) result.connectPending = '99+';
          $('.conCount').append(`
            <sup>
              <span class="text-white bg-danger rounded px-1">${result.connectPending}</span>
            </sup>`
          );
        }
        if (document.getElementById('credential_picker_container')) document.getElementById('credential_picker_container').remove();
        if (typeof myDataSync=='function') myDataSync(result);
        if (result.hasOwnProperty('user_access')) odashLinkingAdd(result, type);
        if (typeof result != "string" && result.length > 0 && ((typeof result.user_access.events !== "undefined" && result.user_access.events.length > 0) || (typeof result.user_access.events !== "undefined" && result.user_access.events.length > 0)) && deviceFlag != 0) getPromoteEventLink();
      }
    });
  }
}

function adsPrefer() {
  if (csntCon.indexOf(user.country.id) > -1) {
    let consent_cookie = 0;
    gdprflag = 1;
    
    if (getCookie('consent')) consent_cookie = getCookie('consent');
    consent_cookie == 10 ? googleAds(0) : googleAds(1);

    if (consent_cookie < 1) {
      setTimeout(function() {
        consentup(1);
        cookieConsent();
      }, 1000);
    } else if (consent_cookie == 1) {
      userConsent();
    }
  } else {
    googleAds(0);
  }

  if (user.country.id == 'IN' && pageType !== 'homepage') {
    $('#loggedLi .dropdown-menu').append('<li><a href="https://10times.com/career" target="_blank" rel="noreferrer">Career at 10times</a></li>');
  }
}

/* START TYPEAHEADMAP JS*/

var lasttypeahead=null;
! function(e) {
    "use strict";
    var t = function(t, n) {
        this.$element = e(t);
        this.options = e.extend({}, e.fn.typeaheadmap.defaults, n);
        this.matcher = this.options.matcher || this.matcher;
        this.sorter = this.options.sorter || this.sorter;
        this.highlighter = this.options.highlighter || this.highlighter;
        this.updater = this.options.updater || this.updater;
        this.$menu = e(this.options.menu);
        this.source = this.options.source;
        this.shown = false;
        this.key = this.options.key;
        this.sort = this.options.sort;        
        this.value = this.options.value;
        this.listener = this.options.listener || this.listener;
        this.displayer = this.options.displayer || this.displayer;
        this.notfound = this.options.notfound || new Array;
        this.listen()
    };
    t.prototype = {
        constructor: t,
        listener: function(e, t) {},
        select: function() {
            var e = this.$menu.find(".active");
            var t = e.attr("data-key");
            this.listener(t, e.attr("data-value"));
            this.$element.val(this.updater(t)).change();
            return this.hide()
        },
        updater: function(e) {
            return e
        },
        show: function() {
            var t = e.extend({}, this.$element.position(), {
                height: this.$element[0].offsetHeight,
                width: this.$element[0].offsetWidth
            });
            this.$menu.insertAfter(this.$element).css({
                top: t.top + t.height,
                left: t.left,
                width: t.width
            }).show();
            this.shown = true;
            return this
        },
        hide: function() {
            this.$menu.hide();
            this.shown = false;
            return this
        },
        lookup: function(t) {
            var n = this,
                r, i;
            this.query = this.$element.val();
            if (!this.query || this.query.length < this.options.minLength) {
                return this.shown ? this.hide() : this
            }
            r = e.isFunction(this.source) ? this.source(this.query, e.proxy(this.process, this)) : this.source;
            return r ? this.process(r) : this
        },
        process: function(t) {
            var n = this;
            if(typeof this.sort==='undefined' || this.sort!='none'){
                t = e.grep(t, function(e) {
                    return n.matcher(e)
                });
                t = this.sorter(t);
            }
            if (!t.length) {
                if (this.shown) {
                    if (!this.notfound.length) {
                        return this.hide()
                    } else {
                        return this.render(this.notfound).show()
                    }
                } else {
                    return this
                }
            }
            return this.render(t.slice(0, this.options.items)).show()
        },
        matcher: function(e) {
            return~ e[this.key].toLowerCase().indexOf(this.query.toLowerCase())
        },
        sorter: function(e) {
            var t = [],
                n = [],
                r = [],
                i;
            while (i = e.shift()) {
                if (!i[this.key].toLowerCase().indexOf(this.query.toLowerCase())) t.push(i);
                else if (~i[this.key].indexOf(this.query)) n.push(i);
                else r.push(i)
            }
            return t.concat(n, r)
        },
        highlighter: function(e, t) {
            var n = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
            return t.displayer(t, e, e[t.key].replace(new RegExp("(" + n + ")", "ig"), function(e, t) {
                return "<strong>" + t + "</strong>"
            }))
        },
        displayer: function(e, t, n) {
            return n + " " + t[e.value]
        },
        render: function(t) {
            var n = this;
            t = e(t).map(function(t, r) {
                t = e(n.options.item).attr("data-key", r[n.key]);
                t.attr("data-value", r[n.value]).addClass('dropdown-item');
                t.html(n.highlighter(r, n));
                return t[0]
            });
            t.first().addClass("active");
            this.$menu.html(t);
            return this
        },
        next: function(t) {
            var n = this.$menu.find(".active").removeClass("active"),
                r = n.next();
            if (!r.length) {
                r = e(this.$menu.find("li")[0])
            }
            r.addClass("active")
        },
        prev: function(e) {
            var t = this.$menu.find(".active").removeClass("active"),
                n = t.prev();
            if (!n.length) {
                n = this.$menu.find("li").last()
            }
            n.addClass("active")
        },
        listen: function() {
            this.$element.on("blur", e.proxy(this.blur, this)).on("keypress", e.proxy(this.keypress, this)).on("keyup", e.proxy(this.keyup, this));
            if (this.eventSupported("keydown")) {
                this.$element.on("keydown", e.proxy(this.keydown, this))
            }
            this.$menu.on("click", e.proxy(this.click, this)).on("mouseenter", "li", e.proxy(this.mouseenter, this))
        },
        eventSupported: function(e) {
            var t = e in this.$element;
            if (!t) {
                this.$element.setAttribute(e, "return;");
                t = typeof this.$element[e] === "function"
            }
            return t
        },
        move: function(e) {
            if (!this.shown) return;
            switch (e.keyCode) {
                case 9:
                case 13:
                case 27:
                    e.preventDefault();
                    break;
                case 38:
                    e.preventDefault();
                    this.prev();
                    break;
                case 40:
                    e.preventDefault();
                    this.next();
                    break
            }
            e.stopPropagation()
        },
        keydown: function(t) {
            this.suppressKeyPressRepeat = ~e.inArray(t.keyCode, [40, 38, 9, 13, 27]);
            this.move(t)
        },
        keypress: function(e) {
            if (!this.shown) return;
            switch (e.keyCode) {
                case 9:
                case 13:
                case 27:
                    e.preventDefault();
                    break;
                case 38:
                    if (e.type === "keydown") {
                        e.preventDefault();
                        this.prev()
                    }
                    break;
                case 40:
                    if (e.type === "keydown") {
                        e.preventDefault();
                        this.next()
                    }
                    break
            }
            e.stopPropagation()
        },
        keyup: function(e) {
            switch (e.keyCode) {
                case 40:
                case 38:
                case 16:
                case 17:
                case 18:
                    break;
                case 9:
                case 13:
                    if (!this.shown) return;
                    this.select();
                    break;
                case 27:
                    if (!this.shown) return;
                    this.hide();
                    break;
                default:
                    this.lookup()
            }
            e.stopPropagation();
            e.preventDefault()
        },
        blur: function(e) {
            var t = this;
            setTimeout(function() {
                t.hide()
            }, 150)
        },
        click: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this.select()
        },
        mouseenter: function(t) {
            this.$menu.find(".active").removeClass("active");
            e(t.currentTarget).addClass("active");
            if(!$('.typeaheadmap').hasClass('typeaheadClickAction')){
                lasttypeahead = this;
                $('.typeaheadmap').on('mousedown',function(e){$('#place_id').val($('.typeaheadmap .active').attr('data-value'));
                      $.each(venue_list, function (index, value) {
                        if(value.placeId==$('.typeaheadmap .active').attr('data-value')){
                            // setTimeout(function(){
                                var reslistener='';
                                if(value.name != "City Not Found"){
                                    reslistener=value.name;
                                    if(typeof value.state !== "undefined" && value.state!='null' && value.state!=null && value.state!=value.name){
                                        reslistener+=', '+value.state;
                                    }
                                    if (typeof value.countryName !== "undefined" && value.countryName!='null' && value.countryName!=null && value.countryName!=value.name) {
                                        reslistener+=', '+value.countryName;
                                    }
                                }
                                $("#userCity").val(reslistener);
                                lasttypeahead.select(); 
                            // }, 10);
                        }
                      });}).addClass('typeaheadClickAction');
            }
        }
    };
    var n = e.fn.typeaheadmap;
    e.fn.typeaheadmap = function(n) {
        return this.each(function() {
            var r = e(this),
                i = r.data("typeaheadmap"),
                s = typeof n == "object" && n;
            if (!i) r.data("typeaheadmap", i = new t(this, s));
            if (typeof n == "string") i[n]()
        })
    };
    e.fn.typeaheadmap.defaults = {
        source: [],
        items: 8,
        menu: '<ul class="typeaheadmap dropdown-menu"></ul>',
        item: '<li><a href="#"></a></li>',
        minLength: 1
    };
    e.fn.typeaheadmap.Constructor = t;
    e.fn.typeaheadmap.noConflict = function() {
        e.fn.typeaheadmap = n;
        return this
    };
    e(document).on("focus.typeaheadmap.data-api", '[data-provide="typeaheadmap"]', function(t) {
        var n = e(this);
        if (n.data("typeaheadmap")) return;
        t.preventDefault();
        n.typeaheadmap(n.data())
    })
}(window.jQuery);
(function(e) {
    function l(t) {
        try {
            return t()
        } catch (n) {
            if (e.console && e.console.log && e.console.log.apply) {
                e.console.log("Zenbox Error: ", n)
            }
        }
    }

    function c(e, t, n) {
        if (e && e.addEventListener) {
            e.addEventListener(t, n, false)
        } else if (e && e.attachEvent) {
            e.attachEvent("on" + t, n)
        }
    }

    function h(e) {
        if (e && !n.test(e)) {
            return t.location.protocol + "//" + e
        } else {
            return e
        }
    }

    function p() {
        i = t.createElement("div");
        i.setAttribute("id", "zenbox_tab");
        i.setAttribute("href", "#");
        i.style.display = "none";
        t.body.appendChild(i);
        s = t.createElement("div");
        s.setAttribute("id", "zenbox_overlay");
        s.style.display = "none";
        s.innerHTML = '<div id="zenbox_container">' + '  <div class="zenbox_header"><img id="zenbox_close" /></div>' + '  <iframe id="zenbox_body" frameborder="0" scrolling="auto" allowTransparency="true"></iframe>' + "</div>" + '<div id="zenbox_scrim">Â </div>';
        t.body.appendChild(s);
        o = t.getElementById("zenbox_container");
        u = t.getElementById("zenbox_close");
        a = t.getElementById("zenbox_body");
        f = t.getElementById("zenbox_scrim");
        c(i, "click", function() {
            e.Zenbox.show()
        });
        c(u, "click", function() {
            e.Zenbox.hide()
        });
        c(f, "click", function() {
            e.Zenbox.hide()
        })
    }

    function d(e) {
        var t;
        for (t in e) {
            if (e.hasOwnProperty(t)) {
                if (t === "url" || t === "assetHost") {
                    r[t] = h(e[t])
                } else {
                    r[t] = e[t]
                }
            }
        }
    }

    function v() {
        i.innerHTML = '<img src="' + r.tabImageURL + '" />'
    }

    function m() {
        if (r.hide_tab) {
            i.style.display = "none"
        } else {
            v();
            i.setAttribute("title", r.tabTooltip);
            i.setAttribute("class", "ZenboxTab" + r.tabPosition);
            i.setAttribute("className", "ZenboxTab" + r.tabPosition);
            i.style.backgroundColor = r.tabColor;
            i.style.borderColor = r.tabColor;
            i.style.display = "block"
        }
    }

    function g(t) {
        var n = t || e.event || {};
        n.cancelBubble = true;
        n.returnValue = false;
        n.stopPropagation && n.stopPropagation();
        n.preventDefault && n.preventDefault();
        return false
    }

    function y() {
        return Math.max(Math.max(t.body.scrollHeight, t.documentElement.scrollHeight), Math.max(t.body.offsetHeight, t.documentElement.offsetHeight), Math.max(t.body.clientHeight, t.documentElement.clientHeight))
    }

    function b() {
        return {
            left: e.pageXOffset || t.documentElement.scrollLeft || t.body.scrollLeft,
            top: e.pageYOffset || t.documentElement.scrollTop || t.body.scrollTop
        }
    }

    function w() {
        return r.assetHost + "/external/zenbox/images/close_big.png"
    }

    function E() {
        return r.assetHost + "/external/zenbox/v2.1/loading.html"
    }

    function S() {
        var e = r.url + "/account/dropboxes/" + r.dropboxID + "?x=1";
        if (r.request_subject) {
            e += "&subject=" + r.request_subject
        }
        if (r.request_description) {
            e += "&description=" + r.request_description
        }
        if (r.requester_name) {
            e += "&name=" + r.requester_name
        }
        if (r.requester_email) {
            e += "&email=" + r.requester_email
        }
        return e
    }

    function x(t) {
        if (!i) {
            p()
        }
        d(t);
        m();
        u.src = w();
        a.src = E();
        e.addEventListener("message", function(e) {
            if (e.data === "hideZenbox") {
                N()
            }
        }, false)
    }

    function T(e) {
        a.src = S();
        s.style.height = f.style.height = y() + "px";
        o.style.top = b().top + 50 + "px";
        s.style.display = "block";
        return g(e)
    }

    function N(e) {
        s.style.display = "none";
        a.src = E();
        return g(e)
    }
    var t = e.document,
        n = /^([a-zA-Z]+:)?\/\//,
        r = {
            url: null,
            dropboxID: null,
            tabColor: "#000000",
            assetHost: "//assets.zendesk.com",
            tabTooltip: "support",
            tabImageURL: null,
            tabPosition: "Left",
            hide_tab: false,
            request_subject: null,
            request_description: null,
            requester_name: null,
            requester_email: null
        }, i, s, o, u, a, f;
    var C = {
        init: function(e) {
            l(function() {
                return x(e)
            })
        },
        update: function(e) {
            l(function() {
                return x(e)
            })
        },
        render: function(e) {
            l(function() {
                return T(e)
            })
        },
        show: function(e) {
            l(function() {
                return T(e)
            })
        },
        hide: function(e) {
            l(function() {
                return N(e)
            })
        }
    };
    c(e, "load", function() {
        if (e.zenbox_params) {
            C.init(e.zenbox_params)
        }
    });
    e.Zenbox = C
})(this.window || this)
/*END TYPEAHEADMAPJS*/

/* START SUGGESTIVE SEARCH*/

function hideScreenBlock() {
    $(".screen-block").hide()
}

function showStartSteps() {
    if (!$(".start-steps").is(":visible")) {
        $(".start-steps").show();
        setTimeout(HideImage, 1e3);
        $(document).unbind("click", closeSearchDropDowns);
        $(document).bind("click", closeSearchDropDowns)
    }
}

function showStart(e) {
    if (!$(".start-steps").is(":visible") && e == "explore-keywords") {
        $("#jj").show();
        $("#jj1").hide();
        setTimeout(HideImage, 1e3)
    } else if (e == "explore-keywords-new") {
        $("#jj1").show();
        $("#jj").hide();
        setTimeout(HideImage, 800)
    }
    $(document).unbind("click", closeSearchDropDowns);
    $(document).bind("click", closeSearchDropDowns)
}

function hideStart(e) {
    if (e == "explore-keywords") {
        $("#jj").hide()
    } else {
        $("#jj1").hide()
    }
}

function showLiveKeywords(e) {
    if (typeof e != undefined) {
        $("#keywords-by").html(e);
        setTimeout(HideImage, 1e3)
    }
    expand();
    $(document).unbind("click", closeSearchDropDowns);
    $(document).bind("click", closeSearchDropDowns)
}

function showLive(e, t) {
    if (typeof t != undefined) {
        if (e == "explore-keywords") {
            $("#keywords-by").html(t)
        } else {
            $("#keywords-new-by").html(t)
        }
        setTimeout(HideImage, 800)
    }
    if (e == "explore-keywords") {
        $("#keywords-dd").show();
        expand()
    } else {
        $("#keywords-new-dd").show()
    }
    $(document).unbind("click", closeSearchDropDowns);
    $(document).bind("click", closeSearchDropDowns)
}

function hideLiveKeywords() {
    if(typeof new_Dashboard!='undefined' && new_Dashboard==1){
        $("#keywords-dd").show();
    }else
    $("#keywords-dd").hide();
    $("#keywords-new-dd").hide()
}

function space(e) {
    return e.replace(/^\s+|\s+$/g, "")
}

function show(e) {
    var t = "";
    e = e + "-dropdown";

    var t = `
      <li class="dropdown-item text-blue fw-bold" data-item_id='0'>SUGGESTED SEARCHES</li>
      <li class="dropdown-item" data-item_id='1'>Trade Show By Industry</li>
      <li class="dropdown-item" data-item_id='2'>Trade Show By Country</li>
      <li class="dropdown-item" data-item_id='3'>Conferences By Industry</li>
      <li class="dropdown-item" data-item_id='4'>Conferences By Country</li>
    `;

    if (e == "explore-keywords-dropdown") {
        if ($("#homepage").length) {
          $("#" + e).append(`
            <div id="jj" class="start-steps bg-light">
              <ul id="explore-by" class="dropdown-menu" style="margin:0;padding:0">${t}</ul>
            </div>
          `);
        } else {
          $("#" + e).append(`
            <div id="jj" class="start-steps start-steps-hdr bg-light">
              <ul id="explore-by" class="dropdown-menu" style="margin:0;padding:0">${t}</ul>
            </div>
          `);
        }
    } else {
      if ($("#homepage").length) $("#" + e).append(`
        <div id="jj1" class="start-steps" style="display: none;">
          <ul id="explore-by" class="dropdown-menu" style="margin:0;padding:0">${t$}</ul>
        </div>
      `);
      else $("#" + e).append(`
        <div id="jj1" class="start-steps dis-non start-steps-hdr start-steps-hdr-new">
          <ul id="explore-by" class="dropdown-menu" style="margin:0;padding:0">${t}</ul>
        </div>
      `);
    }
}

function expand() {
    if ($("#srh").length) {
        $("#srh").removeClass("4u");
        $("#srh").addClass("5u")
    }
}

function collapse() {
    if ($("#srh").length) {
        $("#srh").removeClass("5u");
        $("#srh").addClass("4u")
    }
}

function ShowImage() {

    if($.trim($("#explore-keywords").val()) == "" )
        return 0 ;
    $("#explore-keywords").addClass("loader");
    $('header .search input[type=submit]').hide();
    $("#explore-keywords").css({"background-color":" #ffffff","background-image":' url("https://c1.10times.com/images/loadingimages.gif")',"background-size":" 25px 25px","background-position":"right center","background-repeat":" no-repeat"});
}

function HideImage() {
    $("#explore-keywords").removeClass("loader");
    $('header .search input[type=submit]').show();
    $("#explore-keywords").removeAttr( 'style' );
}

function closeSearchDropDowns(e) {
    hideScreenBlock();
    hideStartSteps();
    hideLiveKeywords()
}

function suub(e, t, n) {
    var r = 1;
    var i = t.length;
    n = e.toLowerCase().indexOf(t);
    var s = e.substring(n, n + i);
    var o = new RegExp(s, "gi");
    var u = e.match(o);
    if (s.toLowerCase() == t.toLowerCase()) return s;
    else return false
}

function ContainsAny(e, t, n, r, i) {
    var s = 0;
    if (e) {
        e = e.toLowerCase();
        var o = 0;
        var u = new Array;
        var s = 0;
        for (var a in t) {
            var f = t[a].toLowerCase();
            if (e.indexOf(f) > -1) {
                u[a] = t[a];
                o++
            }
        }
    }
    if (o == n) {
        for (a = 0; a < u.length; a++) {
            if (u[a] != "all") {
                var l = suub(r, u[a].toLowerCase(), s);
                s = r.toLowerCase().indexOf(l)
            }
            if (l == "b" || l == "<") var c = r;
            else var c = r.replace(l, "<b>" + l + "</b>"); if (c.toLowerCase().indexOf("<b<") > -1) {
                var h = c.toLowerCase().indexOf("<b<");
                var o = c.substring(h, h + 7);
                c = c.replace(o, "")
            }
            if (c.toLowerCase().indexOf("<</") > -1) {
                var h = c.toLowerCase().indexOf("<</");
                var o = c.substring(h + 1, h + 5);
                c = c.replace(o, "")
            }
            r = c
        }
        return r
    } else return false
}

function url(e) {
    if (e == "1") {
        window.location.href = "//10times.com/tradeshows/by-industry"
    }
    if (e == "2") {
        window.location.href = "//10times.com/tradeshows/by-country"
    }
    if (e == "3") {
        window.location.href = "//10times.com/conferences/by-industry"
    }
    if (e == "4") {
        window.location.href = "//10times.com/conferences/by-country"
    }
}

function entermouse(e) {
    $("#" + e).find(".keywords-dd-l-1").removeClass("dis-non");
    $("#" + e).find(".keywords-dd-l-2").removeClass("dis-blk");
    $("#" + e).find(".keywords-dd-l-2").addClass("dis-non");
    if ($("#" + e).find(".keywords-dd-l-1").length) {
        if ($("#hide_count2").val() == 1) $("#" + e).css("height", "83px");
        else {
            $("#" + e).css({"height":"50px","text-decoration": "none"});$("#" + e).find("#kk3").css({"line-height":"15px"});
        }
    }
}

function removemouse(e) {
    $("#" + e).css("height", "32px");
    $("#" + e).find(".keywords-dd-l-2").removeClass("dis-non");
    $("#" + e).find(".keywords-dd-l-2").addClass("dis-blk");
    $("#" + e).find(".keywords-dd-l-1").removeClass("dis-blk");
    $("#" + e).find(".keywords-dd-l-1").addClass("dis-non")
}

function bindExploreKeywordEvents() {
    var e = 0;
    var t = 0;
    var n;
    var r;
    var s = 0;
    $('input[id^="explore-keywords"]').on("keydown", function(n) {
        if (n.keyCode == 13) {
            var r = $(this).attr("id");
            var i = r.replace("explore-", "");
            i = "#" + i + "-dd";
            if ($("#keywords-dd").is(":visible") && $("#keywords-dd .selected").length > 0) {
                e = 1;
                if ($("#keywords-by li").eq(0).hasClass("selected")) {
                    var s = $("#keywords-by li a").eq(0).attr("href");
                    window.location.href = s;
                    return false
                }
                $("#keywords-dd .selected")[0].click()
            }
            if ($("#keywords-new-dd").is(":visible") && $("#keywords-new-dd .selected").length > 0) {
                e = 1;
                if ($("#keywords-new-by li").eq(0).hasClass("selected")) {
                    var s = $("#keywords-new-by li a").eq(0).attr("href");
                    window.location.href = s;
                    return false
                }
                var o = $("#keywords-new-dd .selected").eq(0).attr("href");
                window.location.href = o;
                return false
            }
            if (r == "explore-keywords") {
                if ($("#explore-by li").is(":visible") && $("#explore-by li.selected").length > 0) {
                    t = 1;
                    $("#explore-by li.selected").click()
                }
            } else if (r == "explore-keywords-new") {
                if ($("#explore-by li").is(":visible") && $("#explore-by li.selected").length > 0) {
                    t = 1;
                    $("#explore-by li.selected").click()
                }
            }
            var u = $("#hide_count1").val();
            var a = $("#explore-keywords").val();
            a = a.trim() ;
            var f = site_url_attend + '/events?kw=' + a;
            if ($("#hide_count1").val() == $("#explore-keywords").val() || $("#hide_count").val() >= 1) {
                window.location.href = u;
                return false;
            } else if (e != 1 && t != 1 && a != "") {
                showloading();
                window.location.href = site_url_attend + '/events?kw=' + encodeURIComponent(a);
                return false;
            }else if(a == ""){
                $("#explore-keywords").val('');
                return 0;
            }

        }
    });
    $(".search-box-area").on("mouseenter", "#explore-by li", function() {
        var e = $(this).data("item_id");
        if (e != 0) {
            $("#jj ul li").removeClass("hower");
            $(this).addClass("hower")
        } else {
            $("#jj ul li").removeClass("hower")
        }
    });
    $(".search-box-area").on("mouseleave", "#explore-by li", function() {
        $("#jj ul li").removeClass("hower")
    });
    $(".search-box-area-new").on("mouseenter", "#explore-by li", function() {
        var e = $(this).data("item_id");
        if (e != 0) {
            $("#jj1 ul li").removeClass("hower");
            $(this).addClass("hower")
        } else {
            $("#jj1 ul li").removeClass("hower")
        }
    });
    $(".search-box-area-new").on("mouseleave", "#explore-by li", function() {
        $("#jj1 ul li").removeClass("hower")
    });
    $("#keywords-dd").on("mouseenter", "#keywords-by li a", function(e) {
        entermouse("keywords-by li a:hover")
    });
    $("#keywords-dd").on("mouseleave", "#keywords-by li a", function(e) {
        removemouse("keywords-by li a")
    });
    $("#keywords-new-dd").on("mouseenter", "#keywords-new-by li a", function(e) {
        entermouse("keywords-by li a:hover")
    });
    $("#keywords-new-dd").on("mouseleave", "#keywords-new-by li a", function(e) {
        removemouse("keywords-new-by li a")
    });
    $(".search-box-area").on("click", "#explore-by li", function(e) {
        var t = $(this).data("item_id");
        url(t)
    });
    $(".search-box-area-new").on("click", "#explore-by li", function(e) {
        var t = $(this).data("item_id");
        url(t)
    });
    $(".search-box-area").on("click", "#explore-keywords", function(e) {
        e.stopPropagation();
        ShowImage();
        expand();
        if (vv == 0) {
            show("explore-keywords");
            vv = 1
        }
        if (!$("#explore-keywords").val() && space($("#explore-keywords").val()) == "") {
            showStart("explore-keywords")
        } else {
            showLive("explore-keywords")
        }
    });
    $(".search-box-area-new").on("click", "#explore-keywords-new", function(e) {
        e.stopPropagation();
        ShowImage();
        if (vv1 == 0) {
            show("explore-keywords-new");
            vv1 = 1
        }
        if (!$("#explore-keywords-new").val() && space($("#explore-keywords-new").val()) == "") {
            showStart("explore-keywords-new")
        } else {
            showLive("explore-keywords-new")
        }
    });
    $(document).ready(function() {
         // $('#notificationBell').on('click',function(){
         //    if(typeof $('#notificationBell').attr('onclick')=='undefined')
         //        bell_clr_change();
         // });

        $('#shareHide').on('click',function(){
            if(typeof $('#shareHide').attr('onclick')=='undefined')
                invite_friends(this);
        });
        $('#sidebar-wrapper').on('click','.login',function(){
            signInTT('signup','email');
        });

        $('#sidebar-wrapper').on('click','.fb-login',function(){
            verifySigninTT('login','autofb','');
        });
        $('#sidebar-wrapper').on('click','.g-login',function(){
            verifySigninTT('login','autogplus','');
        });
        $('#sidebar-wrapper').on('click','.li-login',function(){
            verifySigninTT('login','autolinkedin','');
        });
        $('.enlarge-f').on('click','.gateway',function(){
            dashRedirect(this,'events','foot');
        });
        $('.enlarge-f').on('click','.ev',function(){
            dashRedirect(this,'dashboard/events','foot');
        });
        $('.enlarge-f').on('click','.con',function(){
            dashRedirect(this,'dashboard/connections','foot');
        });
        $('.enlarge-f').on('click','.msg',function(){
            dashRedirect(this,'dashboard/messages','foot');
        });
        $('.enlarge-f').on('click','.profile',function(){
            dashRedirect(this,'dashboard/profile','foot');
        });
        $('.enlarge-f').on('click','.recommendations',function(){
            dashRedirect(this,'dashboard/recommendations','foot');
        });
        $('#headerBookmark').click(function() {
            attendNew(this,'bookmark');
        });
        var e = localStorage.getItem("ten_times_search");
        if (e == null) {
            $.getJSON("https://c1.10times.com/json/predictive_search2.json", function(e) {
                localStorage.setItem("ten_times_search", JSON.stringify(e))
            })
        }

        // search suggestions
        $('input[id^="explore-keywords"]').on("keyup", function(e) {
            var t = $(this).attr("id");
            var newDesign= $(this).attr('new-design');
            e.stopPropagation();
            e.preventDefault();
            if (space($(this).val()) === "") {
                if (e.keyCode != 13 && e.keyCode != 38 && e.keyCode != 40) {
                    hideLiveKeywords();
                    showStart(t)
                }
            } else {
                ShowImage();
                hideStart(t)
            }
            var n = t.replace("explore-", "");
            n = "#" + n + "-dd";
            var o = $(".start-steps").is(":visible") ? ".start-steps" : n,
                u = $(o);
            var a = window.event ? e.which : e.keyCode;
            if (a == 38) {
                if (t == "explore-keywords") expand();
                HideImage();
                var f = u.find(".item.selected:visible:first");
                var l = f.parents(o).find(".item:visible");
                var c = l.index(f);
                var f = c;
                var h = l.eq(c - 1);
                var p = h.html();
                if ($(p).hasClass("keywords-dd-l-1")) {
                    g = $(".keywords-dd-l-1").text()
                    if($(".keywords-dd-l-1").length > 1){
                       $(p).each(function() {if($(this).hasClass("keywords-dd-l-1")){g=$(this).text()}}); 
                    }
                    
                } else {
                    var d = $(p).text();
                    var v = d.substring(d.length, d.length - 7);
                    var m = d.substring(d.length, d.length - 5);
                    if (v == "Listing") var g = d.substring(0, d.length - 7);
                    if (m == "Event") g = d.substring(0, d.length - 5)
                } if (t == "explore-keywords") $("#explore-keywords").val(g);
                else $("#explore-keywords-new").val(g);
                u.find(".selected").removeClass("selected");
                if (h.length) {
                    h.addClass("selected");
                    $("#keywords-by li").eq(c).find(".keywords-dd-l-1").addClass("dis-non");
                    $("#keywords-by li").eq(c).find(".keywords-dd-l-2").addClass("dis-blk").removeClass('dis-non');
                    $("#keywords-by li a").css("height", "32px");
                    if ($(h.html()).hasClass("dis-blk")) {
                        $(".selected .keywords-dd-l-1").removeClass("dis-non");
                        if ($("#hide_count2").val() == 1) $("#kk3, .selected,.keywords-dd-l-1").css("height", "83px");
                        else $("#kk3, .selected,.keywords-dd-l-1").css({"height":"50px","line-height":"15px"});
                        $(".selected .keywords-dd-l-2").removeClass("dis-blk");
                        $(".selected .keywords-dd-l-2").addClass("dis-non")
                    }
                } else {
                    var y = u.find(".item:visible:last");
                    var p = y.html();
                    d = $(p).text();
                    if ($(p).hasClass("keywords-dd-l-1")) {
                        g = $(".keywords-dd-l-1").text()
                        if($(".keywords-dd-l-1").length > 1){
                           $(p).each(function() {if($(this).hasClass("keywords-dd-l-1")){g=$(this).text()}}); 
                        }
                    } else {
                        var v = d.substring(d.length, d.length - 7);
                        var m = d.substring(d.length, d.length - 5);
                        if (v == "Listing") var g = d.substring(0, d.length - 7);
                        if (m == "Event") g = d.substring(0, d.length - 5)
                    } if (t == "explore-keywords") $("#explore-keywords").val(g);
                    else $("#explore-keywords-new").val(g);
                    y.addClass("selected");
                    if ($(y.html()).hasClass("dis-blk")) {
                        $(".selected .keywords-dd-l-1").removeClass("dis-non");
                        if ($("#hide_count2").val() == 1) $("#kk3, .selected,.keywords-dd-l-1").css("height", "83px");
                        else $("#kk3, .selected,.keywords-dd-l-1").css({"height":"50px","line-height":"15px"});
                        $(".selected .keywords-dd-l-2").removeClass("dis-blk");
                        $(".selected .keywords-dd-l-2").addClass("dis-non")
                    }
                }
            } else if (a == 40) {
                if (t == "explore-keywords") expand();
                HideImage();
                var f = u.find(".item.selected:visible:first");
                var l = f.parents(o).find(".item:visible");
                var c = l.index(f);
                var h = c - 1;
                var b = l.eq(Number(c) + 1);
                var p = b.html();
                if ($(p).hasClass("keywords-dd-l-1")) {
                    g = $(".keywords-dd-l-1").text()
                    if($(".keywords-dd-l-1").length > 1){
                       $(p).each(function() {if($(this).hasClass("keywords-dd-l-1")){g=$(this).text()}}); 
                    }                    
                } else {
                    var d = $(p).text();
                    var v = d.substring(d.length, d.length - 7);
                    var m = d.substring(d.length, d.length - 5);
                    if (v == "Listing") var g = d.substring(0, d.length - 7);
                    if (m == "Event") g = d.substring(0, d.length - 5)
                } if (t == "explore-keywords") $("#explore-keywords").val(g);
                else $("#explore-keywords-new").val(g);
                u.find(".selected").removeClass("selected");
                $("#keywords-by li").eq(c).find(".keywords-dd-l-1").addClass("dis-non");
                $("#keywords-by li").eq(c).find(".keywords-dd-l-2").addClass("dis-blk").removeClass('dis-non');
                $("#keywords-by li a").css("height", "32px");
                if (b.length) {
                    b.addClass("selected");
                    if ($(b.html()).hasClass("dis-blk")) {
                        $(".selected .keywords-dd-l-1").removeClass("dis-non");
                        if ($("#hide_count2").val() == 1) $("#kk3, .selected,.keywords-dd-l-1").css("height", "83px");
                        else $("#kk3, .selected,.keywords-dd-l-1").css({"height":"50px","line-height":"15px"});
                        $(".selected .keywords-dd-l-2").removeClass("dis-blk");
                        $(".selected .keywords-dd-l-2").addClass("dis-non")
                    }
                } else {
                    var w = u.find(".item:visible:first");
                    var p = w.html();
                    var d = $(p).text();
                    if ($(p).hasClass("keywords-dd-l-1")) {
                        g = $(".keywords-dd-l-1").text()
                        if($(".keywords-dd-l-1").length > 1){
                           $(p).each(function() {if($(this).hasClass("keywords-dd-l-1")){g=$(this).text()}}); 
                        }
                    } else {
                        var v = d.substring(d.length, d.length - 7);
                        var m = d.substring(d.length, d.length - 5);
                        if (v == "Listing") var g = d.substring(0, d.length - 7);
                        if (m == "Event") g = d.substring(0, d.length - 5)
                    } if (t == "explore-keywords") $("#explore-keywords").val(g);
                    else $("#explore-keywords-new").val(g);
                    w.addClass("selected");
                    if ($(w.html()).hasClass("dis-blk")) {
                        $(".selected .keywords-dd-l-1").removeClass("dis-non");
                        if ($("#hide_count2").val() == 1) $("#kk3, .selected,.keywords-dd-l-1").css("height", "83px");
                        
                        $(".selected .keywords-dd-l-2").removeClass("dis-blk");
                        $(".selected .keywords-dd-l-2").addClass("dis-non")
                    }
                }
                $("form#topsearch").attr("action", $("#keywords-dd .selected")[0]);
                return false
            } else if (a == 13) {
                if ($("#explore-by li").is(":visible") && $("#explore-by li.selected").length > 0) {
                    $("#explore-by li.selected").click()
                }
            } else if (a == 27) {
                $(this).blur();
                closeSearchDropDowns();
                return false
            } else {
                var E = $(this).val();
                if ($("#homepage").length) {
                    var S = "homepage"
                } else {
                    var S = "titlepage"
                }
                var x = localStorage.getItem("ten_times_search");
                r = $.parseJSON(x);
                if (x) {
                    var T = "";
                    s = 0;
                    var N = "";
                    var C = 0;
                    E = space(E);
                    var k = E;
                    query1 = k.split(" ").join("");
                    if (E.length == 1 && E != "b") {
                        for (i = 0; i < r.length; i++) {
                            if (r[i].t) {
                                if (s < 8) {
                                    if (r[i].t.toLowerCase().indexOf(E.toLowerCase()) > -1) {
                                        C = 0;
                                        if (r[i].d.toLowerCase().indexOf(E.toLowerCase()) > -1) {
                                            var L = suub(r[i].d, E.toLowerCase(), C);
                                            var A = new RegExp(L, "gi");
                                            var O = r[i].d.match(A);
                                            M = r[i].d;
                                            for (j = 0; j < O.length; j++) {
                                                if (O[j + 1]) {
                                                    if (O[j] != O[j + 1]) var M = M.replace(O[j], "<b>" + O[j] + "</b>");
                                                    else var M = M.replace(A, "<b>" + L + "</b>")
                                                } else {
                                                    var M = M.replace(O[j], "<b>" + O[j] + "</b>")
                                                }
                                            }
                                        } else {
                                            var M = r[i].d
                                        }
                                        if(typeof newDesign!='undefined' && newDesign==1){
                                            N +='<a href="//10times.com' + r[i].u + '" class="flex items-center pt-2"> <div class="ml-3">' + M +'</div> <div class="ml-auto w-48 truncate text-gray-600 text-xs text-right"> Listing </div></a>';
                                        }else{

                                        N += "<li id='kk' >" + '<a class="item ka scroll"  href =//10times.com' + r[i].u + ">" + '<div class="keywords-dd-l" style="padding-left:8px;">' + M + "</div>" + "<div class= 'keywords-dd-r'>" + "Listing" + "</div>" + "</a>" + "</li>";
                                        }
                                        s++
                                    }
                                }
                            }
                        }
                    } else if (k.indexOf(" ") >= 0) {
                        var _ = k.split(" ");
                        for (i = 0; i < r.length; i++) {
                            if (s < 8) {
                                if (r[i].t != "undefined") {
                                    var D = r[i].t;
                                    var M = ContainsAny(D, _, _.length, r[i].d, r[i].u);
                                    if (M) {
                                        var P = 1;
                                        if(typeof newDesign!='undefined' && newDesign==1){
                                            N +='<a href="//10times.com' + r[i].u + '" class="flex items-center pt-2"> <div class="ml-3">' + M +'</div> <div class="ml-auto w-48 truncate text-gray-600 text-xs text-right"> Listing </div></a>';
                                        }else{
                                        N += "<li>" + '<a class="item ka scroll" href =//10times.com' + r[i].u + ">" + '<div class="keywords-dd-l" style="padding-left:8px;" >' + M + "</div>" + "<div class= 'keywords-dd-r'>" + "Listing" + "</div>" + "</a>" + "</li>";
                                        }
                                        s++
                                    }
                                }
                            }
                        }
                    } else {
                        for (i = 0; i < r.length; i++) {
                            if (r[i].t) {
                                if (s < 8) {
                                    if (r[i].t.toLowerCase().indexOf(query1.toLowerCase()) > -1) {
                                        if (r[i].d.toLowerCase().indexOf(query1.toLowerCase()) > -1) {
                                            var L = suub(r[i].d, E.toLowerCase(), C);
                                            var A = new RegExp(L, "gi");
                                            var M = r[i].d.replace(A, "<b>" + L + "</b>")
                                        } else {
                                            var M = r[i].d
                                        }
                                        if(typeof newDesign!='undefined' && newDesign==1){
                                            N +='<a href="//10times.com' + r[i].u + '" class="flex items-center pt-2"> <div class="ml-3">' + M +'</div> <div class="ml-auto w-48 truncate text-gray-600 text-xs text-right"> Listing </div></a>';
                                        }else{
                                        N += "<li>" + '<a class="item ka scroll" href =//10times.com' + r[i].u + ">" + '<div class="keywords-dd-l" style="padding-left:8px;">' + M + "</div>" + "<div class='keywords-dd-r'>" + "Listing" + "</div>" + "</a>" + "</li>";
                                        }
                                        s++
                                    }
                                }
                            }
                        }
                    } if (s == 8) {
                        if(deviceFlag == "0" ){
                            N += "<li id='kk' >" + '<a id="kamal" class="item ka scroll"  href =//10times.com/tradeshows?kw=' + encodeURIComponent($("#explore-keywords").val()) + ">" + '<div class="keywords-dd-l" style="padding-left:8px;"> <b style="color:#e86300 ">Search  </b><b>' + '"' + $("#explore-keywords").val() + '"' + "</b></div>" + "</a>" + "</li>";
                        }else{
                            if(typeof newDesign!='undefined' && newDesign==1){
                                N +='<a href="'+site_url_attend+'/events?kw=' + encodeURIComponent($("#explore-keywords").val()) + '" class="flex items-center pt-2"> <div class="ml-3"> <b style="color:#e86300 ">Search  </b>' + $("#explore-keywords").val() +'</div> </a>';
                            }else{
                            N += "<li>" + '<a class="item ka scroll"  href ='+site_url_attend+'/events?kw=' + encodeURIComponent($("#explore-keywords").val()) + ">" + '<div class="keywords-dd-l" style="padding-left:8px;"> <b style="color:#e86300 ">Search  </b><b>' + '"' + $("#explore-keywords").val() + '"' + "</b></div>" + "</a>" + "</li>";
                            }
                        }
                        showLive(t, N);
                        // $("#keywords-by li").eq(0).addClass("selected");
                        $("#keywords-new-by li").eq(0).addClass("selected")
                    }
                    if (space($("#" + t).val()) === "") {
                        hideLiveKeywords()
                    }
                    if (s < 8) {
                        var H = "localstorage";
                        if ($(this).val().length >= 1) {
                            if (xhr_live_keywords) {
                                xhr_live_keywords.abort()
                            }
                            var date = new Date();
                            xhr_live_keywords = $.ajax({
                                url: site_url+"/event/search",
                                data: "for=search&q=" + encodeURIComponent(E) + "&ajax=1",
                                success: function(data) {
                                    "use strict";
                                    let e="";
                                    if(data!= null){
                                        data = JSON.parse(data);
                                        data.forEach(function(value, index){
                                        if(typeof newDesign!='undefined' && newDesign==1){
                                            e +='<a href="' + value.url + '" class="flex items-center pt-2"> <div class="ml-3">' + ((typeof value.shortName != "undefined" && value.shortName!='')?value.shortName:'')+((typeof value.shortName != "undefined" && value.shortName!='' && typeof value.name != "undefined" && value.name!='')?' - ':'')+((typeof value.name != "undefined" && value.name!='')?((value.name.length > (($("#deviceType").val()=="0")?50:40))?value.name.substring(0,(($("#deviceType").val()=="0")?50:40))+"..":value.name):'') +'<small class="text-muted">&nbsp; '+value.location.cityName + (value.location.countryId == "WW" ? '' : ", " + value.location.countryId) + '</small>'+'<div class="ml-auto w-48 truncate text-gray-600 text-xs text-right"> Event </div>'+'</div> </a>';
                                         }else{
                                            e+="<li><a class='item ka scroll' href='"+value.url+"'><div  class='keywords-dd-l' style='padding-left:8px;'>"+((typeof value.shortName != "undefined" && value.shortName!='')?value.shortName:'')+((typeof value.shortName != "undefined" && value.shortName!='' && typeof value.name != "undefined" && value.name!='')?' - ':'')+((typeof value.name != "undefined" && value.name!='')?((value.name.length > (($("#deviceType").val()=="0")?50:40))?value.name.substring(0,(($("#deviceType").val()=="0")?50:40))+"..":value.name):'')+"<small class='text-muted'>&nbsp; "+value.location.cityName + (value.location.countryId == "WW" ? '' : ", " + value.location.countryId) + "</small></div><div class= 'keywords-dd-r'>Event</div></a></li>";
                                         }
                                        })
                                    }
                                    if (e != "") {
                                    // if (1) {
                                        e = N + e;
                                        if(deviceFlag == "0" ){
                           e += "<li id='kk' >" + '<a id="kamal" class="item ka scroll ex-se"  href =//10times.com/tradeshows?kw=' + encodeURIComponent($("#explore-keywords").val()) + ">" + '<div class="keywords-dd-l" style="padding-left:8px;"> <b style="color:#e86300 ">Search  </b><b>' + '"' + $("#explore-keywords").val() + '"' + "</b></div>" + "</a>" + "</li>";
                        }else{
                            if(typeof newDesign!='undefined' && newDesign==1){
                                e +='<a href="' + site_url_attend +'/events?kw=' + encodeURIComponent($("#explore-keywords").val()) + '" class="flex items-center pt-2"> <div class="ml-3">' + '<b style="color:#e86300 ">Search  </b>'+ $("#explore-keywords").val() +'</div> </a>';
                            }else{
                           e += "<li id='kk' >" + '<a id="kamal" class="item ka scroll ex-se"  href ='+site_url_attend+'/events?kw=' + encodeURIComponent($("#explore-keywords").val()) + ">" + '<div class="keywords-dd-l" style="padding-left:8px;"> <b style="color:#e86300 ">Search  </b><b>' + '"' + $("#explore-keywords").val() + '"' + "</b></div>" + "</a>" + "</li>";
                            }
                        }
                                        showLive(t, e);
                                        // $("#keywords-by li").eq(0).addClass("selected");
                                        $("#keywords-new-by li").eq(0).addClass("selected")
                                    } else {
                                        hideLiveKeywords();
                                        expand();
                                        $("#keywords-by").html(e)
                                    }
                                    
                                }
                            })
                        }
                    }
                } else {
                    if ($(this).val().length >= 1) {
                        if (xhr_live_keywords) {
                            xhr_live_keywords.abort()
                        }
                        var date = new Date();
                        xhr_live_keywords = $.ajax({
                            url: site_url+"/event/search",
                            data: "for=search&q=" + encodeURIComponent(E) + "&ajax=1",
                            success: function(data) {
                                "use strict";
                                let e="";
                                if(data!= null){
                                    data = JSON.parse(data);
                                    data.forEach(function(value, index){
                                        if(typeof newDesign!='undefined' && newDesign==1){
                                            e +='<a href="' + value.url + '" class="flex items-center pt-2"> <div class="ml-3">' + ((typeof value.shortName != "undefined" && value.shortName!='')?value.shortName:'')+((typeof value.shortName != "undefined" && value.shortName!='' && typeof value.name != "undefined" && value.name!='')?' - ':'')+((typeof value.name != "undefined" && value.name!='')?((value.name.length > (($("#deviceType").val()=="0")?50:40))?value.name.substring(0,(($("#deviceType").val()=="0")?50:40))+"..":value.name):'') +'<small class="text-muted">&nbsp; '+value.location.cityName+", "+value.location.countryId+'</small>'+'<div class="ml-auto w-48 truncate text-gray-600 text-xs text-right"> Event'+"</div>"+'</div> </a>';
                                        }else{
                                        e+="<li id='kk'><a id='kamal' class='item ka scroll' href =+'"+value.url+"'><div  class='keywords-dd-l' style='padding-left:8px;'>"+((typeof value.shortName != "undefined" && value.shortName!='')?value.shortName:'')+((typeof value.shortName != "undefined" && value.shortName!='' && typeof value.name != "undefined" && value.name!='')?' - ':'')+((typeof value.name != "undefined" && value.name!='')?((value.name.length > (($("#deviceType").val()=="0")?50:40))?value.name.substring(0, (($("#deviceType").val()=="0")?50:40)):value.name):'')+"<small class='text-muted'>&nbsp; "+value.location.cityName+", "+value.location.countryId+"</small></div><div class= 'keywords-dd-r'>Event</div></a></li>";
                                        }
                                    })
                                }
                                if (e != "") {
                                // if (1) {
                                    showLive(t, e);
                                    $("#keywords-by li").eq(0).addClass("selected");
                                    $("#keywords-new-by li").eq(0).addClass("selected")
                                } else {
                                    hideLiveKeywords();
                                    expand();
                                    $("#keywords-by").html(e)
                                }
                            }
                        })
                    }
                }
            }
        })
    })
}


function checkHeaderSearch(e) {
    if($("#explore-keywords").val().trim() == "" ){
        $("#explore-keywords").val('');
        return false ;
    }
        
    var t = e.attr("id");
    if (t == "explore-button") {
        var n = "#explore-keywords";
        var r = "#keywords-dd"
    } else {
        var n = "#explore-keywords-new";
        var r = "#keywords-new-dd"
    }
    var i = $(n).val();
    if ($(r).is(":visible") && $("" + r + " .selected").length > 0) {
        ShowImage();
        if (n == "#explore-keywords") {
            if ($("#keywords-dd li").eq(0).hasClass("selected")) {
                var s = $("#keywords-by li a").eq(0).attr("href")
            } else var s = $("#keywords-dd .selected").eq(0).attr("href")
        } else {
            if ($("#keywords-new-dd li").eq(0).hasClass("selected")) {
                var s = $("#keywords-new-by li a").eq(0).attr("href")
            } else var s = $("#keywords-new-dd .selected").eq(0).attr("href")
        }
        window.location.href = s;
        return false
    } else if (i == "") {
        hideStartSteps();
        ShowImage();
        setTimeout(HideImage, 800);
        return false
    } else {
        if($("" + r + " .selected").length > 0)
            return false ;
        ShowImage();
        if (i.indexOf("&") > -1) {
            var o = new RegExp("&", "gi");
            i = i.replace(o, "%26")
        }
        window.location.href = "//10times.com/events?kw=" + i
        return false;
    }
}
var x = location.hostname;
var host = x;
var iitm;
var onStartStepsShow = function() {};
onStartStepsHide = function() {
    if ($(".start-steps").is(":visible")) {
        expand();
        HideImage()
    } else if ($("#explore-keywords").val() == "") {
        collapse()
    }
};
var hideStartSteps = function() {
    $(".start-steps").hide(0, onStartStepsHide)
};
var vv = 0;
var vv1 = 0;
bindExploreKeywordEvents();
xhr_live_keywords = null


/*END SUGGESTIVE SEARCH*/


/*START SIDEBAR JS*/

+ function(t) {
    "use strict";
    var e = function(i, s) {
        this.$element = t(i), this.options = t.extend({}, e.DEFAULTS, s), this.transitioning = null, this.options.parent && (this.$parent = t(this.options.parent)), this.options.toggle && this.toggle()
    };
    e.DEFAULTS = {
        toggle: !0
    }, e.prototype.show = function() {
        if (!this.transitioning && !this.$element.hasClass("sidebar-open")) {
            var e = t.Event("show.bs.sidebar");
            if (this.$element.trigger(e), !e.isDefaultPrevented()) {
                this.$element.addClass("sidebar-open"), this.transitioning = 1;
                var i = function() {
                    this.$element, this.transitioning = 0, this.$element.trigger("shown.bs.sidebar")
                };
                return t.support.transition ? void this.$element.one(t.support.transition.end, t.proxy(i, this)).emulateTransitionEnd(400) : i.call(this)
            }
        }
    }, e.prototype.hide = function() {
        if (!this.transitioning && this.$element.hasClass("sidebar-open")) {
            var e = t.Event("hide.bs.sidebar");
            if (this.$element.trigger(e), !e.isDefaultPrevented()) {
                this.$element.removeClass("sidebar-open"), this.transitioning = 1;
                var i = function() {
                    this.transitioning = 0, this.$element.trigger("hidden.bs.sidebar")
                };
                return t.support.transition ? void this.$element.one(t.support.transition.end, t.proxy(i, this)).emulateTransitionEnd(400) : i.call(this)
            }
        }
    }, e.prototype.toggle = function() {
        this[this.$element.hasClass("sidebar-open") ? "hide" : "show"]()
    };
    var i = t.fn.sidebar;
    t.fn.sidebar = function(i) {
        return this.each(function() {
            var s = t(this),
                n = s.data("bs.sidebar"),
                a = t.extend({}, e.DEFAULTS, s.data(), "object" == typeof a && i);
            !n && a.toggle && "show" == i && (i = !i), n || s.data("bs.sidebar", n = new e(this, a)), "string" == typeof i && n[i]()
        })
    }, t.fn.sidebar.Constructor = e, t.fn.sidebar.noConflict = function() {
        return t.fn.sidebar = i, this
    }, t(document).on("click.bs.sidebar.data-api", '[data-toggle="sidebar"]', function(e) {
        var i, s = t(this),
            n = s.attr("data-target") || e.preventDefault() || (i = s.attr("href")) && i.replace(/.*(?=#[^\s]+$)/, ""),
            a = t(n),
            r = a.data("bs.sidebar"),
            o = r ? "toggle" : s.data();
        a.sidebar(o)
    }), t("html").on("click.bs.sidebar.autohide", function(e) {
        var i = t(e.target),
            s = i.is('.sidebar, [data-toggle="sidebar"]') || i.parents('.sidebar, [data-toggle="sidebar"]').length;
        if (!s) {
            var n = t(".sidebar");
            n.each(function(e, i) {
                var s = t(i);
                s.data("bs.sidebar") && s.hasClass("sidebar-open") && s.sidebar("hide")
            })
        }
    })
}(jQuery);
/*END SIDEBAR JS*/























/*START NOTIFICATION JS*/

var host = window.location.hostname;
var site_url = window.location.protocol+"//"+window.location.hostname;
if(site_url.search('local.10times.com')>-1)
    site_url = site_url + '/app.php' ;

var path = document.URL.substring(window.location.origin.length);
if(path.indexOf("/app.php") == 0){
    path = path.substring("/app.php".length);
}
path = (path.indexOf("#")>-1?path.substring(0, path.indexOf("#")).replace("?",'&'):path.replace("?",'&'));

// var page_type=function()
// {
//     var page_type=dataLayer[0].Pagetype;
//     return page_type;
// }

var check_notification_data=function ()
{

    var data_object = {};
    data_object.events=0;
    data_object.status=0;
    data_object.events=0;
    if(!sessionStorage.getItem('eventDataNew') || sessionStorage.getItem('eventDataNew')=='' || sessionStorage.getItem('eventDataNew')==null || sessionStorage.getItem('eventDataNew')==undefined)
    {
        data_object.status=0;
    }   
    else
    {
        data_object.status=1;
        var data=JSON.parse(sessionStorage.getItem('eventDataNew'));
        // if(data['events'])
        if(data)
        {
            data_object.events=1;
            
        }
        if(data['connection'])
        {
            data_object.connection=1;
        }
    }

    return data_object;
    // console.log(data_object);
}

var bellNotificationDataLoad = 0 ;
function bellNotification(){
    // $('#notification_data').html('<div class="text-center"><i class="fa fa-refresh fa-spin fa-fw"></i></div>') ;
    // var check=check_notification_data();  
    // if(check.events===0){
    //     if(window.location.host.search("login") > -1)
    //         return false ;
    //     var url=site_url+'/notificationdetail';
    //     get_data_from_back(url);
    // }
    // setTimeout(get_notification, 1000);
}







function get_notification()
{
    // var check=check_notification_data(); 
    // //var check_data=JSON.parse(check);
    // if(check.events===0)
    // {
    //  get_data_from_back();
    // }
    //var sesn=sessionStorage.getItem('eventData')
   //var html=notification_html();
    $('#notification_data').html('');

}
//set_notification_data

var set_notification_data= function(data)
{
    sessionStorage.setItem('eventDataNew',data);
     // sessionStorage.setItem('eventData','{"events":[{"id":"238799","name":"India Geospatial Forum","abbr_name":"IGF","startDate":"01\/Mar\/2016","endDate":"2016-03-03","city":"Greater Noida","country":"India","event_url":"igf-greaternoida"},{"id":"260611","name":"Geo Intelligence Asia","abbr_name":"Geo Intelligence Asia","startDate":"02\/Mar\/2016","endDate":"2016-03-03","city":"Greater Noida","country":"India","event_url":"geo-intelligence-asia"},{"id":"273443","name":"Young Investigators Meeting","abbr_name":"The annual Young Investigators Meeting","startDate":"27\/Feb\/2016","endDate":"2016-03-03","city":"Gurgaon","country":"India","event_url":"annual-young-investigators-meeting"}],"connection":""}');
}


function  get_data_from_back(url)
//var get_data_from_back= function (url)
{
    $.ajax({
        type:"POST",
        url:url,
        success: function(data, textStatus ){
            set_notification_data(data);
            get_notification();
            setTimeout(notification_icon_changes, 5000);

        },
        error: function(xhr, textStatus, errorThrown){
            
        }
    });

}


var get_notification_data = function ()
{
    return sessionStorage.getItem('eventDataNew');
    //return session_data;
}
//var data=get_notification_data();


function notification_html()
{   

//return false; // change it
var data= get_notification_data();

// $.when(data= get_notification_data() )
//   .done(function() {
        //var data=get_notification_data()

// setTimeout(function(){
 // alert(data);  
        var event_data=JSON.parse(data);
        //console.log(event_data);
        //event_data=event_data.events;
        var size = Object.keys(event_data).length;
        //var parsed=event_data.events;
            //alert(size);
        // var html='<div class="notify_bar" id="noty" style="z-index: 99999; right: 50px; top: 53px;"><div class="notification12" id="notify_bar" onclick="dataLayer.push({" event":"notificationclicked"})"="">';

        var html='<div class="notification"> <p class="text-muted">Events you should also check</p>';
        //var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (var x = 0; x < size; x++)
        {
            var evnt_deatil= event_data[x];
            var eventname = evnt_deatil.name;
            var date = evnt_deatil.startDate;
            var day = (date.toString().split("/")[0]);
            var event_url = evnt_deatil.event_url;
            next_btn_url = evnt_deatil.event_url;
            event_url=event_url.trim();
            var city = evnt_deatil.city;
            var country = evnt_deatil.country;
            var month = (date.toString().split("/")[1]);
            //var month_no=month[month];

            //var time = evnt_deatil.endDate;
            html+= getEventNotoficationHTML(eventname,day,event_url,city,country,month,x,event_data[x]);
        }


         html=html+'</div>';
         bellNotificationDataLoad = 1 ;
        $('#notification_data').html(html);
  // })
  // .fail(function() {
  //   console.log( 'failed' );
  // });











    // get_notification_data().done(function() {
   


}


var next_btn_url='';

var eventjsonDidi = '' ;
var getEventNotoficationHTML =function(eventname,day,event_url,city,country,month,x,eventjson){
    eventjsonDidi = eventjson ;
    event_url_copy = event_url ;
    if(event_url.search('10times.com') > -1)
        event_url_copy = event_url.replace(window.location.protocol+'//'+window.location.host+"/",'')  ;
    var a ='<div class="main_box"> <div class="row" onclick="redirect(\''+event_url_copy+'\')" style="cursor:pointer;"> <div class="col-md-2 col-xs-2"> <div class="circle_image">'+month+'<br> <span class="text-orange">'+day+'</span> </div> </div> <div class="col-md-10 col-xs-10"> <p>'+eventname ;
    if(eventjson.hasOwnProperty('promotionType') && eventjson.promotionType >= 10)
        a += '<i class="fa fa-fw fa-star text-orange"></i>' ;
    a +=  '</p> <div class="col-md-9"> <div class="row small text-muted"> <i class="fa fa-map-marker text-orange"></i> '+city+', '+country+'  </div> </div>';
    if(event_url.search('10times.com') > -1)
        a += '<a class=" btn btn-orange btn-xs float-end" href="'+event_url+'" style="letter-spacing: normal;color:#fff!important">View Detail</a>' ;
    else
        a += '<button class=" btn btn-orange btn-xs float-end" onclick="redirect(\''+event_url+'\')">View Detail</button>' ;
    a += '</div> </div> </div>';
    return a;
}



var notification_icon_changes = function(){
 // $('.bel_icon').addClass('text-orange fa-bell');
 // $('.bel_icon').removeClass('fa-bell-o');
 // $('.wbl').addClass('icon_woble');
 $('.notif').show();
  $(".notif").removeClass('dis-non');

};

var bell_clr_change= function(){
}

function getNotifForContent(data){
    var html='';
    if(data.hasOwnProperty('device_type') && data.device_type=='phone'){
        if(data.hasOwnProperty('type') && data.type=='unidentified'){
            $('#modalData').empty();
                          $('#modalData').append('<div class="modal fade in" id="TenTimes-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" style="display: block;"><div class="modal-dialog modal-740" role="document"> <div class="modal-content modal-primary"> <div class="modal-body tentimes-form"><div class="row"><div style="padding-left: 10px;padding-right: 10px;font-size: 14px;"><div style="font-size: 16px;">More than 6 million people use 10times to</div><div class="fa fa-check" style="width: 100%;"> Manage event calendar</div><div class="fa fa-check" style="width: 100%;"> Create bussiness profile</div><div class="fa fa-check" style="width: 100%;"> Find networking opportunities</div><div class="fa fa-check" style="width: 100%;"> Schedule meetings at event</div><div class="fa" style="width: 100%;"><a href="'+site_url+'/dashboard/onboard" target="_blank" rel="noreferrer" style="color: #F85D17!important;float: right;">Join Now</a></div></div></div></div></div><div class="text-center" data-dismiss="modal"><button type="button" id="_modal_close" class="close" aria-label="Close"><i aria-hidden="true" style="color:#fff" class="fa fa-times-circle"></i></button></div></div></div>');
                            $('#modalData').modal('show');
                            $('#modalData .modal-content').css({'width': '100%','padding-bottom': '0px','padding-top': '0px','height': '172px'})
                            $('#modalData #_modal_close').css({'opacity': '1','float': 'initial','padding-top':'20px'});
                            $('#modalData .modal-dialog').css({'padding-top':'40px'});

          
        }
        else if(data.hasOwnProperty('type') && data.type=='identified'){
           
                var dataType='';
                $.each(data.data,function(index, value){
                    if(typeof value=='string'){
                        $('#modalData').empty();
                        html+='<div class="modal fade in" id="TenTimes-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" style="display: block;"><div class="modal-dialog modal-740" role="document"> <div class="modal-content modal-primary"><div class="modal-header text-center"> <h4 class="modal-title" id="myModalLabel">';
                        dataT='string';
                        switch(value){
                            case "profile-image":
                                 html+='<div onclick="redirect(\'dashboard/profile?image=true\');">'
                                        +'<i class="fa fa-camera" style="font-size: 20px;float: left;padding-top: 2px;"></i>'
                                        +'<span>  Add Profile Picture</span>'
                                        +'<i class="fa fa-chevron-right float-end" style="margin-top: 7px;"></i>'
                                    +'</div>';
                                break;
                            case "about":
                                html+='<div onclick="redirect(\'dashboard/profile\');">'
                                        +'<i class="fa fa-info-circle" style="font-size: 20px;float: left;padding-top: 2px;"></i>'
                                        +'<span> Add introduction</span>'
                                        +'<i class="fa fa-chevron-right float-end" style="margin-top: 7px;"></i>'
                                    +'</div>';
                                break;
                            default:
                                html+='<center><h4 class="text-w400">No new notification</h4><center></center>';
                        }
                            html+='</h4></div><div class="modal-body tentimes-form"></div></div><div class="text-center" data-dismiss="modal"><button type="button" id="_modal_close" class="close" aria-label="Close"><i aria-hidden="true" style="color:#fff" class="fa fa-times-circle"></i></button></div></div></div>';
                            $('#modalData').append(html);
                            $('#modalData').modal('show');
                            $('#modalData .modal-content').css({'width': '100%','padding-top': '23px','padding-bottom': '0px','height': '102px'})
                            $('#modalData #_modal_close').css({'opacity': '1','float': 'initial','padding-top':'20px'});
                            $('#modalData .modal-dialog').css({'padding-top':'40px'});
                    }
                    else{
                        dataType='obj';
                    
                        html+='<div class="main_box bell-ntf py-10">' 
                                +'<div class="row" onclick="location.href=\''+value.event_url+'\'" style="cursor:pointer;">'  
                                    +'<div class="col-md-12 col-xs-12">' 
                                        +'<span style="font-size: 14px;">'+value.name+'</span>'
                                        +'<div class="col-md-12">' 
                                            +'<div class="row small text-muted">'
                                                +'<i class="fa fa-map-marker text-orange"></i>&nbsp;'+value.city+'&nbsp;';

                                                if(value.status=='ongoing' || status=='ending today')
                                                    html+='<small class="onging text-success">'+value.status+'</small>';
                                                else if(value.status == 'got postponed')
                                                    html+='<small class="cancelled text-danger">'+value.status+'</small>';
                                                else if(value.status == 'got cancelled')
                                                    html+='<small class="cancelled text-danger">'+value.status+'</small>';
                                                else if (value.status != '')
                                                    html+='<small class="comming text-warning">'+value.status+'</small>';
                                    html+='</div></div></div></div></div>';

             
                    }
                });
            if(dataType=='obj'){
                html='<div class="notification pd-10" style="width: 100%;">'+html; 
                html+='<div style="padding: 5px;"><center><a href="/events" class="small text-orange" style="cursor:pointer;">view more trending events</a></center></div></div>';
            }

        }
    }
    else{
        if(data.hasOwnProperty('type') && data.type=='unidentified'){
            html+='<div class="bell-ntf notif-s">'
                        +'<div class="notif-m">'
                            +'<div style="font-size: 16px;">More than 6 million people use 10times to</div>'
                            +'<div class="fa fa-check" style="width: 100%;padding-left: 30px;"> Manage event calendar</div>'
                            +'<div class="fa fa-check" style="width: 100%;padding-left: 30px;"> Create business profile</div>'
                            +'<div class="fa fa-check" style="width: 100%;padding-left: 30px;"> Find networking opportunities</div>'
                            +'<div class="fa fa-check" style="width: 100%;padding-left: 30px;"> Schedule meetings at event</div>'
                            +'<div class="fa" style="width: 100%;padding-left: 30px;">'
                                +'<a href="'+site_url+'/dashboard/onboard" target="_blank" rel="noreferrer" style="color: #F85D17!important;float: right;">Join Now</a>'
                            +'</div>'
                        +'</div>'
                    +'</div>';
        }
        else if(data.hasOwnProperty('type') && data.type=='identified'){
            var dataType='';
            $.each(data.data,function(index, value){
                if(typeof value=='string'){
                    html+='<div class="bell-ntf notif-s" style="width: 300px;cursor: pointer;">'
                                    +'<div class="notif-m">'
                    switch(value){
                        case "profile-image":
                            html+='<div style="font-size: 16px;line-height: 35px;padding-left: 20px;" onclick="redirect(\'dashboard/profile\');">'   
                                    +'<i class="fa fa-camera"></i>'
                                    +'<span style="padding-left: 10px;"> Add profile picture</span>'
                                    +'<i class="fa fa-chevron-right float-end" style="line-height: 35px;"></i>'
                                +'</div>';
                            break;
                        case "about":
                            html+= '<div style="font-size: 16px;line-height: 35px;padding-left: 20px;" onclick="redirect(\'dashboard/profile\');">'
                                    +'<i class="fa fa-info-circle" style="font-size: 20px;"></i>'
                                    +'<span style="padding-left: 10px;"> Add introduction</span>'
                                    +'<i class="fa fa-chevron-right float-end" style="line-height: 35px;"></i>'
                                +'</div>';
                            break;
                        default:
                            html+='No new notification';
                    }
                    html+='</div></div>'
                }
                else{
                    dataType='obj';
                    
                    html+='<div class="main_box bell-ntf">' 
                            +'<div class="row" onclick="location.href=\''+value.event_url+'\'" style="cursor:pointer;">'  
                                +'<div class="col-md-12 col-xs-12">' 
                                    +'<span style="font-size: 14px;">'+value.name+'</span>'
                                    +'<div class="col-md-12">' 
                                        +'<div class="row small text-muted">'
                                            +'<i class="fa fa-map-marker text-orange"></i>&nbsp;'+value.city+'&nbsp;';

                                            if(value.status=='ongoing' || status=='ending today')
                                                html+='<small class="onging text-success">'+value.status+'</small>';
                                            else if(value.status == 'got postponed')
                                                html+='<small class="cancelled text-danger">'+value.status+'</small>';
                                            else if(value.status == 'got cancelled')
                                                html+='<small class="cancelled text-danger">'+value.status+'</small>';
                                            else if (value.status != '')
                                                html+='<small class="comming text-warning">'+value.status+'</small>';
                                html+='</div></div></div></div></div>';

                
                }
            });
            if(dataType=='obj'){
                html='<div class="notification" style="width: 300px;padding: 0px;">'+html; 
                html+='<div style="padding: 5px;"><center><a href="/events" class="small text-orange" style="cursor:pointer;">view more trending events</a></center></div></div>';
            }
        }
    }
    return html;
}


function dashRedirect(dis,url,where){
    if(typeof where!='undefined' && where=='foot'){
        $('.f-active-tab').removeClass('f-active-tab');
        $('.f-active').removeClass('f-active');
        $(dis).find('.footer-fix').addClass('f-active-tab');
        $(dis).find('.footer-fix .t-foot').addClass('f-active');

    }
    showloading();
    location.href=site_url_attend+'/'+url;
}



function redirect1(url)
{
    // window.location.href = 'https://10times.com/'+url;

var mm=$('url').find("a");

    console.log(mm);
}




/*END NOTIFICATION JS*/



/* START DETAIL PAGE CUSTOM JS*/

var lat='';
var long_='';
var attend=0;

function map_open(latitude,longitude,attend_show) {
  callGaEvent("map")  
  lat=latitude;
  long_=longitude;
  attend=attend_show;

    var data = {
                  pageType:pageType,
                  for:'map_venue',
            };
    var messageHtml='';
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax/modaldata",
        data:data,
        success: function(n) {
             messageHtml=$.parseJSON(n);
             $('#myModal_map').html(messageHtml.mainHtml);
            $('#myModal_map').modal('show');
            load_map_Script();
           }
       });

}
function initialize() {
    // geocoder = new google.maps.Geocoder();
    var H;
    var G = lat;
    var E = long_;
    // var attend=attend;



    if (G != null && E != null) {
        H = new google.maps.LatLng(G, E)
    } else {
        H = new google.maps.LatLng(28.63531, 77.22496)
    }
    var A = {
        center: H,
        zoom: 1,
        mapTypeId: "roadmap"
    };
    var F = new google.maps.Map(document.getElementById("map-canvas"), A);
    marker = new google.maps.Marker({
        position: H,
        map: F
    });
    var B = new google.maps.LatLngBounds();
    B.extend(marker.position);
    F.fitBounds(B);
    var D = google.maps.event.addListener(F, "idle", function() {
        if (F.getZoom() > 16) {
            F.setZoom(13)
        }
        google.maps.event.removeListener(D)
    });
    var C = new google.maps.InfoWindow();

    if(attend==1)
    {

    google.maps.event.addListener(marker, "mouseover", (function(I) {
        return function() {
             var N = $("#deviceType").val();
            var W = $("#cityName").val();
            var U = $("#countryName").val();
            var K = $("#venueName").val();
            var A = $("#evt_status").val();
            var Z = K.length;
            var X = W + ", " + U;
            var T = X.length;
            if (Z >= T) {
                var S = Z * 8;
                S = S + "px"
            } else {
                var S = T * 8;
                S = S + "px"
            }

            var star_end_date=$("#strt_end_date").val();

            var strt_split=star_end_date.split(',');
            var R =strt_split[0];
            var P = strt_split[1];
            // var R = $("#eventStart").val();
            var Q = $.now();
            // var P = $("#eventEnd").val();
            Q = Q / 1000;
            var b = new Date(R * 1000).getDate();
            var a = new Date(Q * 1000).getDate();
            var Y = new Date(P * 1000).getDate();
        
            var O = R - Q;
            var J = O / (3600 * 24);

            var D = P -Q; 
            var actiondata='attend';
            if(D < 0 || A == 'C' || A == 'P' ){
                var F = "Follow";
                var E = "Following";
                actiondata='interest';
            }else{
                var F ="Attend";
                var E ="Attend";
            }
            if ((J <= 2 && J >= 0) || (J < 0 && Y >= a)) {
                var M = "Check in";
                var L = "checked in"
            } 
            else {
                var M = "Attend";
                var L = "attending"
            }
             var M = "<span onClick='attendNew(this,\""+actiondata+"\")'> "+ F +" </span>";

            if(typeof VisitorIdDecode !== 'undefined' && VisitorIdDecode) {
                M = "<i class='fa fa-check disabled'></i> "+E;
            }

            if (N == "1") {
                if (mem_flag == "1" || isIE() == 8 || isIE == 7) {
                    var V = '<div style="color:#000; font-size:15px; line-height:19px; width:' + S + '; height:80px;"><b>' + K + "</b><br>" + W + ", " + U + '<br></div>'                    
                } else {
                    var V = '<div style="color:#000; font-size:15px; line-height:19px; width:' + S + '; height:80px;"><b>' + K + "</b><br>" + W + ", " + U;
                    if($("#privateFlag").val() != "private") {
                     V = V + '<br><a class="map-attend chkin_btn mrt2 btn btn-orange" href="javascript:void(0)" onClick=\'close_map();\'<b>' + M + "</b></a></div>"
                    }
                    V  = V + "</div>";
                }    
            } else {
                if (mem_flag == "1") {
                    var V = '<div style="color:#000; font-size:15px; line-height:19px; width:' + S + '; height:80px;"><b>' + K + "</b><br>" + W + ", " + U + '<br></div>'
                } else {
                    var V = '<div style="color:#000; font-size:15px; line-height:19px; width:' + S + '; height:80px;"><b>' + K + "</b><br>" + W + ", " + U;
                    if($("#privateFlag").val() != "private") {
                    V = V + '<br><a class="map_attend n_btn mrt2 btn btn-orange" href="javascript:void(0)" onClick=\'attendNew(this,"attend");close_map();\'<b>' + M + '</b></a>'
                    }
                    V  = V + "</div>";
                }
            }
            C.setContent(V);
            C.open(F, I)
        }
    })(marker))


}

}

function close_map()
{
    $('#myModal_map').modal('hide');
}



var map_flag = 0;
var obj_data;
var event_flag = 0;
var mem_flag = $("#flag").val();


function isIE()
{
  var A = navigator.userAgent.toLowerCase();
  return (A.indexOf("msie") != -1) ? parseInt(A.split("msie")[1]) : false
}

var map_one_time = 0;
function load_map_Script() {
    if(map_one_time == 0){
    map_one_time = 1;
    var A = document.createElement("script");
    A.type = "text/javascript";
    A.src = "https://maps.googleapis.com/maps/api/js?v=3.exp&callback=initialize&key="+apiKey;
    A.id = "map_please";
    map_flag = 1;
    document.body.appendChild(A)
}else{
    initialize();
}
}


function height_adjust()
{
  if($(".othr_rel_evt").length)
  {
      var height=$(".othr_rel_evt").height();
      var height1=$(".cty_event").height();
      (height>height1) ?  $(".cty_event").height(height) : $(".othr_rel_evt").height(height1)
  }

  if($(".hght_prl").length)
  {
    var height2=$(".hght_prl").height();
    var height3=$(".hght_con").height();
    
    (height2>height3) ? $(".hght_con").height(height2) : $(".hght_prl").height(height3)
  }



 if($(".map_dir").length && $(".hotl_blk").length )
  {
    var height4=$(".map_dir").height();
    // var height5=$(".hotl_blk").height()-15;

    var height5=$(".hotl_blk").height();
    
    (height4>height5) ? $(".hotl_blk").height(height4) : $(".map_dir").height(height5)
  }

  var logo_height=$(".logo").height();
  var desc_height=$(".mr").height();
  if($(".logo").length && logo_height>desc_height)
  {
    $('.ad_top').css('margin-top','10px');
  }

$('.htl_btn').addClass('ftr');

}


function show_more_id(content_id)
{
    $("#" + content_id + "_text").hide();
    $("#" + content_id).removeClass("dis-non");
}

function show_more_class(content_class)
{
  class_showmore = '.'+content_class+'_text';
     if($(class_showmore).text() == '+ show more')
     {
        
       $(class_showmore).text("- show less");
       $('.'+content_class).slideToggle("slow");
   }
    else
    {
       $(class_showmore).text("+ show more");
       $('.'+content_class).slideToggle();
       //scrollTo(class_showmore);
       $('agenda').goTo();
       //$(window).scrollTop($(class_showmore).offset().top);
    }
    
}


(function($) {
    $.fn.goTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this; // for chaining...
    }
})(jQuery);






function visitor_search(ths,attend)
{
    dataString='';
    if(attend==1)
    { 
      $('#attends').removeClass( "btn-default" ).addClass("btn-primary").addClass("active");
      $('#follows').addClass( "btn-default" ).removeClass("btn-primary").removeClass("active");
    } else if(attend==2){
        $('#follows').removeClass( "btn-default" ).addClass("btn-primary").addClass("active");
        $('#attends').addClass( "btn-default" ).removeClass("btn-primary").removeClass("active");
    }
    var searchstr = $("#search2").val();
    var eventid = $('#eventID').val();
    var page =1;
    searchstr=searchstr.trim();
    if(searchstr == "")
    {
        if(attend==1||attend==2)
        {
            showloading();
            dataString += '&attend='+attend+'&eventEdition='+$('#eventEdition').val();
        }
        
        else
        {
            return false;
        }
    }
    else
    {
       showloading();
       if($('#attends').hasClass('btn-primary'))
            dataString += '&attend=1&eventEdition='+$('#eventEdition').val() ;
        else    if($('#follows').hasClass('btn-primary'))
           dataString +='&attend=2&eventEdition='+$('#eventEdition').val() ;
        dataString += '&searchstr='+ searchstr;
    }
    dataString +='&eventid='+eventid + '&page='+page;
    $.ajax({
            type: "POST",
            url: site_url+'/ajax?for=visitorsearch&new=1',
            data: dataString,
            success: function(response) 
            {
              $(".half").empty();
              $('#block-listing').html(response);
              hideloading();
              $('#13').remove();
              if((getCookie('user') && getCookie('user') != "") || (getCookie('user_token') && getCookie('user_token') != "")) {   
               hitMyData();
            }
            }
        });
  return false;
}



function popup12()
{
  $("#image").show();
  return false
}
function popup13()
{
  $("#image").hide();
  return false
}
$(window).scroll(function(){
    if(typeof not_about_page!=='undefined' && not_about_page==0)
    {
  if($(window).scrollTop()+1>=$(document).height()-$(window).height()-700)
    {
      popup12()
    }
    else
    {
      popup13()
    }
}
});
   

$(window).scroll(function(){
    if(typeof next_btn_url!=='undefined' && typeof not_about_page !== 'undefined' && next_btn_url !='' && not_about_page==1)
    {
        $('.next_js').attr('href',site_url+'/'+next_btn_url);
        if($(window).scrollTop()+1>=$(document).height()-$(window).height()-700)
        {
            popup12()
        }
        else
        {
        popup13()
        }
    }
});










setTimeout(height_adjust, 3000);
function firstFunction()
{
  (adsbygoogle = window.adsbygoogle || []).push({});
}


// function expandd() {
//    $('.srhbx').width('200px');
// }

// function collapsee() {
//      $("#srh").length && $('.srhbx').width('160px');
// }


// onStartStepsHide = function() {
//     $(".start-steps").is(":visible") ? (expand(), HideImage()) : "" == $("#explore-keywords").val() && collapsee()
// };


function dl(a) {


    dataLayer.push({
        event: a
    })
}

function loadASyncTTScriptCommon(src) {
    var jsMap = document.createElement("script");
    jsMap.type = "application/javascript";
    jsMap.src = src;
    document.body.appendChild(jsMap);
}

var wid=hi=flr=0;
function zoomin(a){
    if (a==1) {
        $('.carousel-inner >.active').attr('style','');
        $('.carousel-inner >.active >img').width('100%');
        $('.carousel-inner >.active >img').height('320px');
        $('.carousel-inner').attr('style','');
        $('#myCarousel>.carousel-control').each(function(){
            $(this).removeClass('dis-non');
        });
    }else{
        if(flr==0){
        wid=$('.carousel-inner >.active >img').width();
        hi=$('.carousel-inner >.active >img').height();
        flr++;
        }
        $('.carousel-inner').attr('style','overflow: auto; white-space: nowrap;height:'+hi+'px;');    
        $('.carousel-inner >.active >img').width('100%');
        $('.carousel-inner >.active >img').height('100%');
        $('#myCarousel>.carousel-control').each(function(){
            $(this).addClass('dis-non');
        });
        $('.carousel-inner >.active').width(wid*a*0.5);
        $('.carousel-inner >.active').height(hi*a*0.5);
        $('.carousel-inner').scrollLeft($('.carousel-inner >.active').width()/2-$('.carousel-inner').width()/2);
        $('.carousel-inner').scrollTop($('.carousel-inner >.active').height()/2-$('.carousel-inner').height()/2);
    }
}

function rev_dyn_fp(){
    $('#stt_fp').fadeOut();
    $('#st_fp_dyn_ovly').addClass('shdw');
    setTimeout(function () {
        $('#dyn_fp').fadeIn();
        $('.st_fp_ud_shdw').removeClass('shdw');
    }, 250);
    $([document.documentElement, document.body]).animate({
        scrollTop: ($("#floor-plan").offset().top)-60
    }, 500);
}

function rev_stt_fp(slct){
    $('#dyn_fp').fadeOut();
    $('#st_fp_dyn_ovly').removeClass('shdw');
    setTimeout(function () {
        $('#stt_fp').fadeIn();
        $('#flr_pln_st div:nth-child('+(slct+1)+')').addClass('shdw');
        for (var i=1; i<=$('.st_fp_ud').length; i++){
            if(i != (slct+1)){
                $('#flr_pln_st div:nth-child('+i+')').removeClass('shdw');
            }
        }
    }, 250);
    $([document.documentElement, document.body]).animate({
        scrollTop: ($("#floor-plan").offset().top)-60
    }, 500);
}

function slct_fp(slct){
    zoomin(1);
    for (var i=1; i<=$('#crsl_fp .item').length; i++){
            if(i != (slct+1)){
                $('#crsl_fp div:nth-child('+i+')').removeClass('active');
            }
        }
    $('#crsl_fp div:nth-child('+(slct+1)+')').addClass('active');
    $('#crsl_fp').css('height','');
    wid=$('.carousel-inner >.active >img').width();
    hi=$('.carousel-inner >.active >img').height();
    zin = 1;
}

    function openFloorPlan()
    {
        showloading();
         var carousel='',thmb='';
        var i=0;
        if(!list.hasOwnProperty()){
        $.ajax({
                    type: "POST",
                    url: site_url+'/ajax?for=floor_plan',
                    data: {'event_id': $('#eventID').attr('value') },
                    async:false,
                    success: function(a) 
                    {
                        // console.log(a);
                        list = JSON.parse(a);
                    },
                    error: function(a){
                        console.log(a);
                    },
                });
        }
        
        $.each(list,function(index, value){
            var title='Floor Plan';
            if(value['title']!=null && value['title']!='')
                title=value['title'];
            if(i===0){
                carousel+='<div class="item active"><img src="'+value['url']+'" class="img_responsive" alt="'+value['url']+'" style="width:100%;height: 320px;!important"></div>';
                thmb+='<img src="'+value['url']+'" data-target="#myCarousel" data-slide-to="'+i+'" class="img_responsive thmb" alt="'+value['url']+'" onclick="nxt_slide(this);" title="'+title+'" style="width:120px;height: 80px; margin: 0px 5px;border: 2px solid #4a4949;">';
            }else{
                carousel+='<div class="item"><img src="'+value['url']+'" class="img_responsive" alt="'+value['url']+'" style="width:100%;height: 320px;"></div>';
                thmb+='<img src="'+value['url']+'" data-target="#myCarousel" data-slide-to="'+i+'" class="img_responsive thmb not-slct" alt="'+value['url']+'" onclick="nxt_slide(this);" title="'+title+'" style="width:120px;height: 80px; margin: 0px 5px;border: 2px solid #4a4949;">';
            }
            i++;
        });
        var mm='<div class="modal-dialog" role="document"><div class="modal-content modal-primary"><div class="modal-header text-center"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><u><h3 class="modal-title" id="myModalLabel">Floor Plan</h3></u></div><div class="modal-body"><div class="row"><div id="myCarousel" class="carousel slide" data-ride="carousel" data-interval="false" style="style=outline: none;border-color: #9ecaed;box-shadow: 0 0 15px #e55514;"><div class="carousel-inner">'+carousel+'</div><a class="left navigate carousel-control" href="#myCarousel" data-slide="prev" onclick="nxt_slide(this);"><span class="glyphicon glyphicon-chevron-left"></span><span class="sr-only">Previous</span></a><a class="right navigate carousel-control" href="#myCarousel" data-slide="next" onclick="nxt_slide(this);"><span class="glyphicon glyphicon-chevron-right"></span><span class="sr-only">Next</span></a><div class="col-md-4 col-xs-8 col-sm-6" ><table><tr><td><lable class="label label-info zoomout"><i class="fa fa-minus" aria-hidden="true"></i></label></td><td><input type="range" min="1" max="100" value="1" class="slider" id="myZoom"></td><td><label class="label label-info zoomin"><i class="fa fa-plus" aria-hidden="true"></i></label></td></tr></table></div></div><br><div class="thumb-cont" style="overflow-x: auto; white-space: nowrap;"><div id="myThumb" style="width: auto">'+thmb+'</div></div></div></div></div></div>';

        $('#myModal_flr').html(mm);
        hideloading();
        $('#myModal_flr').modal('show');
        $('#myCarousel .carousel-inner .inner:first-child').addClass('active');
        $('#myThumb img:first-child').removeClass('not-slct');
        $('#myModalLabel').html($('#myThumb img:first-child').attr('title'));
        $('#myZoom').parent().parent().parent().parent().attr('style',"position: absolute;bottom: 20px; left: "+($('.carousel-inner').width()/3)+"px;");
        document.getElementById("myZoom").oninput = function() {
              zoomin(this.value);
              zin=parseInt(this.value); 
            }
        $('.zoomin').click(function(){
            zin=zin+5;
            if(zin>100){
                zin=100;
            }
            zoomin(zin);
            $('#myZoom').attr('value',zin);
        });
        $('.zoomout').click(function(){
            zin=zin-5;
            if(zin<1){
                zin=1;
            }
            zoomin(zin);
            $('#myZoom').attr('value',zin); 
        });
    }
var zin=1;
function nxt_slide(dis){
    var previousSlide = $('#myCarousel .active');
   if($(dis).hasClass('left')){
    // console.log('left');
    if($(previousSlide).prev().length!= 0){
        $('.thmb').each(function(){
            if($(this).attr('src')!=$(previousSlide).prev().find('img').attr('src'))
                $(this).addClass('not-slct');
            else
                $(this).removeClass('not-slct');
        });
    }else{
        $('.thmb').each(function(){
            if($(this).attr('src')!=$('#myCarousel .item:last-child').find('img').attr('src'))
                $(this).addClass('not-slct');
            else
                $(this).removeClass('not-slct');
        });
    }            
   }else if($(dis).hasClass('right')){
    // console.log('right');
    if($(previousSlide).next().length!= 0){
        $('.thmb').each(function(){
            if($(this).attr('src')!=$(previousSlide).next().find('img').attr('src'))
                $(this).addClass('not-slct');
            else
                $(this).removeClass('not-slct');
        });
    }else{
        $('.thmb').each(function(){
            if($(this).attr('src')!=$('#myCarousel .item:first-child').find('img').attr('src'))
                $(this).addClass('not-slct');
            else
                $(this).removeClass('not-slct');
        });
    }
   }else{
        $('.thmb').each(function(){
            if($(this).attr('src')!=$(dis).attr('src'))
                $(this).addClass('not-slct');
            else
                $(this).removeClass('not-slct');
        });
   }

   var maxRight=0,maxLeft=0,imgLeft=0,imgRight=0;
   maxLeft = ($('.thumb-cont').position()).left;
   maxRight = maxLeft + $('.thumb-cont').width();
   $('#myThumb').children().each(function(){
    if(!($(this).hasClass('not-slct'))){
        $('#myModalLabel').html($(this).attr('title'));
        imgLeft = ($(this).position()).left;
        imgRight = imgLeft + $(this).outerWidth(true);
        if(imgLeft<maxLeft){
            $('.thumb-cont').animate({scrollLeft: $('.thumb-cont').scrollLeft()-maxLeft+imgLeft}, 500);
        }else if(imgRight>maxRight){
            $('.thumb-cont').animate({scrollLeft: $('.thumb-cont').scrollLeft()+imgRight-maxRight}, 500);
        }
    }
   });
   $('#myZoom').attr('value','1');
   zoomin(1);
   zin=1;
}
var shorturl='';
var invite_friends=function(dis,shareType)
{   
    showloading();
    if(!$(dis).hasClass('listing-share')){
        callGaEvent("share");       
    }
    dl('share_header');
/*start for detail page only */
var ismobile=$('#ismobile').val();
var mob=0;
var longurl='';
var whatsapphtml='';
var style='width:230px;';
var img_size='';
var track_url = "?utm_campaign=social_share&utm_source="+page_type ;
var fb_link,tw_link,ln_link,head,invite, whatsapp,head1,head2,head3,head4;
var target='';

    loadASyncTTScriptCommon("https://platform.twitter.com/widgets.js");

    if(pageType == 'dashboard_events')
    {
        var longurl = "https://10times.com/"+($(dis.parentElement.getElementsByTagName('h3')[0].getElementsByTagName('a')[0]).attr('href')).replace('/','')+track_url;
    }
    else if(page_type=='thankyou_new'){
        var longurl = "https://10times.com/"+$('#event_url').val();
    }
    else if($(dis).hasClass("modal_invite")){
        var longurl = $(dis).attr('value') ;
        if(pageType=='about' && longurl.slice(0, 8)!='https://')
             longurl = "https://10times.com/"+longurl;
    }
    else if(pageType.search(/listing/)>-1 && $(dis).find('.share_top').length<1 && !$(dis).hasClass('share_top')){
        var longurl = $(dis).parents('.box').find('h2 a').attr('href') ;
    }else if(pageType=='venue_detail'){
        if(!$(dis).hasClass('share_top')){
           var longurl = $(dis).parent().parent().parent().find('h2 a').attr('href')+track_url;
        }else{
            var longurl = window.location.href+track_url;    
        }
    }
    else{
        var longurl = window.location.href+track_url;

    }
    longurl=longurl.substring(0,longurl.indexOf('?')+1)+longurl.substring(longurl.indexOf('?')+1).replace('?',"&");
    /* urlShortner Api call */
    $.ajax({
            type: "POST",
            url: "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key="+firebaseAPIKey,
            data: JSON.stringify({'longDynamicLink': 'https://d6jx7.app.goo.gl/?link='+longurl ,"suffix": {"option": "SHORT"} }),
            contentType: "application/json",
            cache: false,
            success: function(resp) {
                shorturl = resp.shortLink;
                var sharetop=0;
                if(pageType=='listing' || pageType=='homepage'){
                    if($(dis).find('.share_top').length<1 && !$(dis).hasClass('share_top'))
                       sharetop=1;
                    else
                       sharetop=0;
                    }
                var data = {
                            pageType:pageType,
                            sharetop:sharetop,
                        };
                if(pageType=='venue_detail'){
                    if(!$(dis).hasClass('share_top')) {
                        data.type='venue_listing';   
                     }else{
                        data.type='venue';   
                     } 
                }
                var html=[];
                const shareLink = shorturl;
                if($(dis).hasClass('invite'))
                    var from='?from=journey_animation';
                if($(dis).hasClass('modal_invite'))
                    var from1='?from=modal_invite_pagetype';
                 if($(dis).hasClass("shareButton"))
                    var share_icon='?from=invite_icon_pagetype';
                $.ajax({
                    type: "POST",
                    url: site_url_attend + '/ajax/invitefriendshtml',
                    data:data,
                    success: function(n) {
                         html=$.parseJSON(n);
                               switch(pageType){
                        case "about":
                        case "visitors":
                        case "exhibitors":
                        case "comments":
                        case "photos-videos":
                        case "deals":
                        case "speakers":
                                getEventData(dis);
                                if($(dis).hasClass("shareButton")){
                                    var event_name = eventData.name;
                                    var shorturl = eventData.url;
                                    eventname = encodeURIComponent(event_name);
                                    fb_link = "https://www.facebook.com/sharer/sharer.php?u="+shorturl,
                                    ln_link = "https://www.linkedin.com/shareArticle?mini=true&amp;url="+shorturl,
                                    tw_link = "https://twitter.com/intent/tweet?count=none&via=10_times&url="+shorturl + '&text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading3+'\''+html.linkHeading2,
                                    whatsapp = 'whatsapp://send?text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    head = html.head1+'<br>'+html.head2;
                                    invite = html.invite;
                                    break;
                                }
                                else if($(dis).hasClass('modal_invite')){
                                    head =html.head1;
                                    var eventname = $(dis).attr('event_name');
                                    eventData.id = $(dis).attr('value1');
                                     var shorturl = $(dis).attr('value');
                                     if(shorturl.slice(0, 8)!='https://')
                                     shorturl = "https://10times.com/"+shorturl;
                                    eventname = encodeURIComponent(eventname);
                                    fb_link = "https://www.facebook.com/sharer/sharer.php?u="+shorturl,
                                    ln_link = "https://www.linkedin.com/shareArticle?mini=true&amp;url="+shorturl,
                                    tw_link = "https://twitter.com/intent/tweet?count=none&via=10_times&url="+shorturl + '&text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading3+'\''+html.linkHeading2,
                                    whatsapp = 'whatsapp://send?text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    head = html.head1+'<br>'+html.head2;
                                    invite = html.invite;
                                    break;
                                }
                                else{
                                var event_name=$('h1').text();
                                var city_name=$('#cityName').val();
                                var event_date=$('#event_date').val();
                                var shareTitle = null;
                                var shorturl="https://10times.com"+'/'+$('#event_url').val();
                                }
                                if(shareType == 'exhibitor') {
                                    customEventGA("Company","Non Lead 2","Event Detail | Exhibitor | Share Icon")
                                   var exhibitorNewName = $(dis).closest('.exhibitorsBlock').find('.exhibitorName').html();
                                   var exhibitorNewBooth = $(dis).closest('.exhibitorsBlock').find('.exhibitorBooth').html();
                                   shareTitle= encodeURIComponent(exhibitorNewName)+" is exhibiting in "+encodeURIComponent(event_name);
                                   if(exhibitorNewBooth){
                                    shareTitle+=" at "+encodeURIComponent(exhibitorNewBooth);
                                   }
                                    shareTitle+= " on "+event_date+".";
                                    fb_link='https://www.facebook.com/sharer/sharer.php?u='+shorturl+'&quote='+shareTitle;
                                    tw_link='https://twitter.com/intent/tweet?count=none&via=10_times&url='+shorturl+'&text='+shareTitle;
                                }
                                else{
                                    fb_link='https://www.facebook.com/sharer/sharer.php?u='+shorturl+'&amp;title='+html.linkHeading1+encodeURIComponent(event_name)+html.linkHeading2+event_date+', '+city_name+html.linkHeading3;
                                    tw_link='https://twitter.com/intent/tweet?count=none&via=10_times&url='+shorturl+'&text='+html.linkHeading1+encodeURIComponent(event_name)+html.linkHeading2+event_date+', '+city_name+html.linkHeading3;
                                }
                                shareTitle=encodeURIComponent(shareTitle);   
                                ln_link='https://www.linkedin.com/shareArticle?mini=true&amp;url='+shorturl+'&amp;title='+html.linkHeading1+encodeURIComponent(event_name)+html.linkHeading2+event_date+', '+city_name+html.linkHeading3;
                                head=html.head1+'<br>'+html.head2;
                                invite=html.invite;

                                whatsapp='whatsapp://send?text='+html.linkHeading1+encodeURIComponent(event_name)+html.linkHeading2+event_date+', '+city_name+html.linkHeading3+shorturl+'&mwrsm=WhatsApp&data-action=share/whatsapp/share';
                                break 
                        // case "venue_detail":
                        //         var name=$('h1').html();
                                
                        //         fb_link= 'https://www.facebook.com/sharer/sharer.php?u='+shorturl+'&amp;title='+html.linkHeading1+encodeURIComponent(name)+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3+shorturl;
                        //         ln_link= 'https://www.linkedin.com/shareArticle?mini=true&amp;url='+shorturl+'&amp;title='+html.linkHeading1+encodeURIComponent(name)+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3+shorturl;
                        //         tw_link= 'https://twitter.com/intent/tweet?count=none&via=10_times&url='+shorturl+'&text='+html.linkHeading1+encodeURIComponent(name)+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3;
                        //         whatsapp='whatsapp://send?text='+html.linkHeading1+encodeURIComponent(name)+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3+shorturl+'&mwrsm=WhatsApp&data-action=share/whatsapp/share';
                        //         head =html.head1+name+'.<br> '+html.head2;
                        //         invite='';
                        //         break;
                        case "profile":
                        case "mProfileDash":
                                var name=(pageType=='profile')?$('h1').html():$('h4').html();
                                var type=$('#isspeaker').val();
                                var first_name = name.split(" ");
                                name = encodeURIComponent(name) ;

                                fb_link= 'https://www.facebook.com/sharer/sharer.php?u='+shorturl+'&amp;title='+html.linkHeading1+name+html.linkHeading2+name+html.linkHeading3+type+html.linkHeading4+shorturl;
                                ln_link= 'https://www.linkedin.com/shareArticle?mini=true&amp;url='+shorturl+'&amp;title='+html.linkHeading1+name+html.linkHeading2+name+html.linkHeading3+type+html.linkHeading4+shorturl;
                                tw_link= 'https://twitter.com/intent/tweet?count=none&via=10_times&url='+shorturl+'&text='+html.linkHeading1+name+html.linkHeading2+name+html.linkHeading3+type+html.linkHeading4;
                                whatsapp='whatsapp://send?text='+html.linkHeading1+name+html.linkHeading2+name+html.linkHeading3+type+html.linkHeading4+shorturl+'&mwrsm=WhatsApp&data-action=share/whatsapp/share';
                                head =html.head1+decodeURI(name)+'.<br>'+html.head2+first_name[0]+'\''+html.head3;
                                invite='';
                                break;
                        case "dashboard_events":
                                var  t;
                                var n = $(dis.parentElement.getElementsByTagName('h3')).text();
                                    $(dis.parentElement.parentElement.getElementsByTagName('address')).each(function(){ 
                                          t = $(this.getElementsByTagName('b')[0]).text();
                                        });
                                var a = $(dis.parentElement).find("#startDate").attr('value');
                                var s = "",
                                    o = "";
                                //window.alert("print");
                                eventData.id = getEventId(dis);
                                n = encodeURIComponent(n);
                                fb_link = "https://www.facebook.com/sharer/sharer.php?u="+shorturl +"&amp;title="+html.linkHeading1+ n + html.linkHeading2 + a + ", " + t + html.linkHeading3,
                                ln_link = "https://www.linkedin.com/shareArticle?mini=true&amp;url="+shorturl + "&amp;title="+html.linkHeading1+ n + html.linkHeading2 + a + ", " + t + html.linkHeading3,
                                tw_link = "https://twitter.com/intent/tweet?count=none&via=10_times&url="+shorturl + "&text="+html.linkHeading1+ n + html.linkHeading2 + a + ", " + t + html.linkHeading3,
                                head = html.linkHeading1+'<br>'+html.linkHeading2;
                                whatsapp = "whatsapp://send?text="+html.linkHeading1+ n + html.linkHeading2 + a + ", " + t + html.linkHeading3 + shorturl;
                                invite = html.invite;
                                break;
                         case "thankyou_new":
                                getEventData(dis);
                                var event_name=$('#event_name').val();
                                var city_name=$('#cityName').val();
                                var event_date=$('#event_date').val();

                                fb_link='https://www.facebook.com/sharer/sharer.php?u='+shorturl+'&amp;title='+html.linkHeading1+encodeURIComponent(event_name)+html.linkHeading2+event_date+', '+city_name+html.linkHeading3;
                                tw_link='https://twitter.com/intent/tweet?count=none&via=10_times&url='+shorturl+'&text='+html.linkHeading1+encodeURIComponent(event_name)+html.linkHeading2+event_date+', '+city_name+html.linkHeading3;   
                                ln_link='https://www.linkedin.com/shareArticle?mini=true&amp;url='+shorturl+'&amp;title='+html.linkHeading1+encodeURIComponent(event_name)+html.linkHeading2+event_date+', '+city_name+html.linkHeading3;
                                whatsapp='https://web.whatsapp.com/send?text='+html.linkHeading1+encodeURIComponent(event_name)+html.linkHeading2+event_date+', '+city_name+html.linkHeading3 + ' ' + shorturl;

                                head1=html.head1;
                                head2=html.head2;
                                head3=html.head3;
                                head4=html.head4;
                                break;
                         case "org_detail":
                            if($(dis).hasClass('share_top')){
                            var name = $(dis).closest('.box').find('h2').text();
                            var shorturl=$(dis).closest('.box').find('h2').find('a').attr('href');
                            fb_link= 'https://www.facebook.com/sharer/sharer.php?u='+shorturl+'&amp;title='+html.linkHeading1+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3+shorturl;
                            ln_link= 'https://www.linkedin.com/shareArticle?mini=true&amp;url='+shorturl+'&amp;title='+html.linkHeading1+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3+shorturl;
                            tw_link= 'https://twitter.com/intent/tweet?count=none&via=10_times&url='+shorturl+'&text='+html.linkHeading1+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3;
                            whatsapp='whatsapp://send?text='+html.linkHeading1+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3+shorturl+'&mwrsm=WhatsApp&data-action=share/whatsapp/share';
                            head =html.head1+'.<br> '+html.head2;
                            invite='';
                            break;
                            }        
                         case "venue_detail":
                            if($(dis).hasClass('share_top')){
                                var name=$('h1').html();
                                fb_link= 'https://www.facebook.com/sharer/sharer.php?u='+shareLink+'&amp;title='+html.linkHeading1+encodeURIComponent(name)+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3+shorturl;
                                ln_link= 'https://www.linkedin.com/shareArticle?mini=true&amp;url='+shareLink+'&amp;title='+html.linkHeading1+encodeURIComponent(name)+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3+shorturl;
                                tw_link= 'https://twitter.com/intent/tweet?count=none&via=10_times&url='+shareLink+'&text='+html.linkHeading1+encodeURIComponent(name)+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3;
                                whatsapp='whatsapp://send?text='+html.linkHeading1+encodeURIComponent(name)+html.linkHeading2+encodeURIComponent(name)+html.linkHeading3+shareLink+'&mwrsm=WhatsApp&data-action=share/whatsapp/share';
                                head =html.head1+name+'.<br> '+html.head2;
                                invite='';
                                break;
                            }
                            case "top100":
                            
                                getEventData(dis);
                                if($(dis).hasClass('modal_invite')){
                                    head =html.head1;
                                    var eventname = $(dis).attr('event_name');
                                    eventData.id = $(dis).attr('value1');
                                    eventname = encodeURIComponent(eventname);
                                    fb_link = "https://www.facebook.com/sharer/sharer.php?u="+shorturl,
                                    ln_link = "https://www.linkedin.com/shareArticle?mini=true&amp;url="+shorturl,

                                    tw_link = "https://twitter.com/intent/tweet?count=none&via=10_times&url="+shorturl + '&text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    whatsapp = 'whatsapp://send?text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    head = html.head1+'<br>'+html.head2;
                                    invite = html.invite;
                                    break;
                                }
                            case "udash_recommendation":
                            
                                getEventData(dis);
                                if($(dis).hasClass('modal_invite')){
                                    head =html.head1;
                                   var eventname = $(dis).attr('event_name');
                                    eventData.id = $(dis).attr('value1');
                                    eventname = encodeURIComponent(eventname);
                                    fb_link = "https://www.facebook.com/sharer/sharer.php?u="+shorturl,
                                    ln_link = "https://www.linkedin.com/shareArticle?mini=true&amp;url="+shorturl,

                                    tw_link = "https://twitter.com/intent/tweet?count=none&via=10_times&url="+shorturl + '&text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    whatsapp = 'whatsapp://send?text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    head = html.head1+'<br>'+html.head2;
                                    invite = html.invite;
                                    break;
                                }
                        case "homepage":
                        case "listing":
                            if($(dis).hasClass('share_top')){
                                customEventGA('Event', 'Non Lead 2', 'Event Listing | Page Share')
                            }else{
                                customEventGA('Event', 'Non Lead 2', 'Event Listing | Event Snippet | Bottom Right Share Button')
                            }
                                getEventData(dis);
                                if($(dis).find('.share_top').length<1 && !$(dis).hasClass('share_top') && !$(dis).hasClass('modal_invite')){
                                    head =html.head1;
                                    var eventname = $(dis).parents('.box').find('h2').text().trim() ;
                                    var shorturl=$(dis).closest('.box').find('h2').find('a').attr('href');
                                    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                    //alert(date);
                                    // $(dis.parentElement.parentElement.getElementsByTagName('address')).each(function(){ 
                                    //       t = $(this.getElementsByTagName('b')[0]).text();
                                    //     });
                                    //var a = $(dis.parentElement).find("#startDate").attr('value');
                                    //var s = "",o = "";
                                    eventData.id = $(dis).parents('.box').find('h2').attr('id') ;
                                    eventname = encodeURIComponent(eventname);
                                    fb_link = "https://www.facebook.com/sharer/sharer.php?u="+shorturl,
                                    ln_link = "https://www.linkedin.com/shareArticle?mini=true&amp;url="+shorturl,

                                    tw_link = "https://twitter.com/intent/tweet?count=none&via=10_times&url="+shorturl + '&text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    whatsapp = 'whatsapp://send?text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    head = html.head1+'<br>'+html.head2;
                                    invite = html.invite;

                                }
                                else if($(dis).hasClass('modal_invite'))
                                {
                                    head =html.head1;
                                    eventData.id =$(dis).attr('value1');
                                    var shorturl=$(dis).attr('value');
                                    var eventname = $(dis).attr('event_name');
                                    eventname = encodeURIComponent(eventname);
                                    fb_link = "https://www.facebook.com/sharer/sharer.php?u="+shorturl,
                                    ln_link = "https://www.linkedin.com/shareArticle?mini=true&amp;url="+shorturl,

                                    tw_link = "https://twitter.com/intent/tweet?count=none&via=10_times&url="+shorturl + '&text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    whatsapp = 'whatsapp://send?text='+html.linkHeading1+'\'' + eventname + '\''+html.linkHeading2,
                                    head = html.head1+'<br>'+html.head2;
                                    invite = html.invite;
                                }
                                else{
                                            head =html.head1;
                                            invite='';
                                            var e = document.getElementById("type_url").getAttribute("value")
                                            , t = $("#categoryFilter .font-bold>a").text().trim()
                                            , i = ($("#cityFilter .font-bold").text().trim()).replace($("#cityFilter .font-bold>small").text().trim(),'')
                                            , n = $("#countryFilter .font-bold>a").text().trim();
                                            if ("" != $("#cityFilter .font-bold>a").text().trim() || "All Countries" != $("#countryFilter .font-bold>a").text().trim()) 
                                            {
                                                if ("" != n || void 0 != n)
                                                    if ("" != document.getElementById("city_url").getAttribute("value"))
                                                        var r = i;
                                                    else
                                                        var r = n;
                                            } 
                                            else
                                                var r = "world";
                                            if ("" != $("#categoryFilter .font-bold>a").text().trim() && "All Categories" != $("#categoryFilter .font-bold>a").text().trim()) 
                                            {
                                                var o = t;
                                                a = o.replace("&", "and");
                                            }else if("" != $("#tagFilter .font-bold>a").text().trim()){
                                                var o = $("#tagFilter .font-bold>a").text().trim();
                                                a = o.replace("&", "and");
                                            }
                                            else
                                                var a = "";
                                            if (1 == e)
                                                var s = " tradeshows";
                                            else if (2 == e)
                                                var s = " conferences";
                                            else if (3 == e)
                                                var s = " workshops";
                                            else if ("" == e)
                                                var s = " events";
                                            if ("allmonth" != $("#month_fill :selected").val())
                                                var l = "&";
                                            else
                                                var l = "?";
                                            g = (new Date).toJSON().slice(0, 10);
                                             if(pageType=='listing'){
                                                var string_share = document.querySelector('h1').textContent.replaceAll('\n', '');
                                                string_share = string_share.replace(/\s+/g,' ').trim();
                                                string_share= encodeURIComponent(string_share.replace(' in ',' happening in ').replace(/  +/g, " ").trim());
                                                tw_link = "https://twitter.com/intent/tweet?count=none&url=" + shareLink + "&text=Check out upcoming " + string_share + html.linkHeading4 + "@10_times";
                                                ln_link = "https://www.linkedin.com/shareArticle?mini=true&;&url=" + shareLink + "&title=Check out upcoming " + string_share + html.linkHeading4 + shareLink;
                                                fb_link = "https://www.facebook.com/sharer/sharer.php?u=" + shareLink + "&amp;title=Check out upcoming " + string_share + html.linkHeading4 + shareLink;
                                                whatsapp = "whatsapp://send?text=Check out upcoming " + string_share + html.linkHeading4 + shareLink;

                                            }else{
                                             tw_link = "https://twitter.com/intent/tweet?count=none&url="+shorturl+"&text="+html.linkHeading1 + a + s + html.linkHeading2 + r + html.linkHeading3+"@10_times";
                                             ln_link = "https://www.linkedin.com/shareArticle?mini=true&;&url="+shorturl+ "&title="+html.linkHeading1 + a + " " + s + html.linkHeading2 + r + html.linkHeading4 + shorturl ;
                                             fb_link = "https://www.facebook.com/sharer/sharer.php?u="+shorturl+"&amp;title="+html.linkHeading1 + a + s + html.linkHeading2 + r + html.linkHeading4 + shorturl ;
                                           
                                             whatsapp = "whatsapp://send?text="+html.linkHeading1 + a + s + html.linkHeading2 + r + html.linkHeading4 + shorturl ;
                                            }
                                            // if(typeof ismobile!=='undefined' && ismobile==1)
                                            // {
                                            //     whatsapphtml = "whatsapp://send?text=Check out upcoming " + a + s + " happening in " + r + " at 10times.com" + window.location.pathname + l + "utm-source=wa";
                                            //     whatsapphtml = '<li><a href="'+whatsapphtml+'" class="whatsapp" target="_blank" style="background-color: green;"><i class="fa fa-whatsapp"></i></a></li>';
                                            //     style="width:230px;";
                                            // }
                                }
                                            break;
                                default:if ($(dis).find('.share_top').length>0 || $(dis).hasClass('share_top')) {
                                    head =html.head1;
                                    invite='';
                                    tw_link = "https://twitter.com/intent/tweet?count=none&url="+shorturl+"&text="+html.linkHeading1;
                                    ln_link = "https://www.linkedin.com/shareArticle?mini=true&;&url="+shorturl+ "&title="+html.linkHeading2;
                                    fb_link = "https://www.facebook.com/sharer/sharer.php?u="+shorturl+"&amp;title="+html.linkHeading2;

                                    whatsapp = "whatsapp://send?text="+html.linkHeading1 + shorturl ;
                                }
                                break;
                    }

                    /*common html */
                    if (!document.getElementById('TenTimes-Modal')) getModal();
                    if (!modals['TenTimes-Modal']) {
                      showToast('Something went wrong!!!');
                      return false;
                    }
                    modals['TenTimes-Modal'].hide();
                    document.querySelector('#TenTimes-Modal .modal-title').innerHTML = '';
                    document.querySelector('#TenTimes-Modal .modal-body').innerHTML = '';
                    
               if(pageType=='thankyou_new'){
                  var html='<div id="invite_desktop" style=" background-color: #fff; padding: 20px 20px 30px; margin: auto; width: 80%;margin-top: 75px; border-radius: 5px;"><span onclick="removeInvite(this);" class="float-right" style="margin-top: -12px; font-size: 25px; cursor: pointer;">&times</span><div class="m-top5 f16" style="text-align: center; margin-top:25px;">' + head1 + '</div><table style="margin-top: 5px;" width="100"><tr><td style="vertical-align: top; padding: 0px 0px 0px 0px; float: right;"><center style="vertical-align: top; padding: 0px 0px 0px 0px;"><div style="margin-top: 20px; margin-bottom: 5px; font-size: 14px;">Gmail Invite</div><div style=" font-size: 35px; color: lightgrey; margin-top: 10px"><a href="javascript:void(0);" onclick="auth();removeInvite(this);"><img src="https://c1.10times.com/images/gmail_new.svg" style="width: 40px; margin-top: -7px; margin-right:10px;"></a></div></center></td><td style="vertical-align: top; padding: 0px 0px 0px 0px;"><center><div style="margin-top: 20px; margin-bottom: 5px; font-size: 14px;">' + head4 + '</div><div style=" font-size: 35px; color: lightgrey; margin-top: 10px"><span onclick="removeInvite(this);"><a href="' + fb_link + '" style="color: #3b5998" target="_blank" rel="noreferrer"><i class="fab fa-facebook"></i></a></span><span onclick="removeInvite(this);" class="m-left10"><a href="' + ln_link + '" style="color: #0077B5" target="_blank" rel="noreferrer"><i class="fab fa-linkedin"></i></a></span><span onclick="removeInvite(this);" class="m-left10"><a id="twt" href="' + tw_link + '" style="color: #38A1F3;" target="_blank" rel="noreferrer"><i class="fab fa-twitter-square"></i></a></span><span onclick="removeInvite(this);" class="m-left10"><a href="'+whatsapp+'" data-action="share/whatsapp/share" style="color: #25D366" target="_blank" rel="noreferrer"><i class="fab fa-whatsapp-square"></i></a></span></div></center></td></tr></table><center><div style=" margin-top: 20px; font-size: 14px;">' + head3 + '</div><div class="m-top15"></div><input type="email" id="email_invite" placeholder="Email" style="border: 1px solid lightgray; padding: 5px 10px; border-radius: 3px 0px 0px 3px; width:65%;" autocomplete="off" onfocus="email_invite();"><button onclick="sendrequest();" style="background: #335aa1; color: #fff; border: 0px; padding: 6px 10px; border-radius: 0px 3px 3px 0px;">Invite</button><div id="error" class="m-top10 f12 c-red"></div></center></div>';
                }else{
                  document.querySelector('#TenTimes-Modal .modal-title').innerHTML = head;
                  document.querySelector('#TenTimes-Modal .modal-body').innerHTML = `
                  <div class="my-4">${invite}</div>
                    <div class="d-flex justify-content-evenly">
                      <a href="${fb_link}" onclick="gaEvent('FB Share');" target="_blank" rel="noreferrer">
                        <img class="rounded-3 box-shadow" src="https://img.10times.com/images/fb_logo.png" width="45" height="45" alt="FB Share" />
                      </a>

                      <a href="${ln_link}" onclick="gaEvent('LinkedIn Share');" target="_blank" rel="noreferrer">
                        <img class="rounded-3 box-shadow" src="https://img.10times.com/images/link.png" width="45" height="45" alt="LinkedIn Share" />
                      </a>

                      <button type="button" class="p-0 border-0 bg-transparent" onclick="auth();">
                        <img class="rounded-3 box-shadow" src="https://img.10times.com/css/gmail-icon.png" width="45" height="45" alt="Gmail Share" />
                      </button>

                      <a id="twt" href="${tw_link}" onclick="gaEvent('Twitter Share');">
                        <img class="rounded-3 box-shadow" src="https://img.10times.com/images/gplus.png" width="45" height="45" alt="Twitter Share" />
                      </a>

                      <a href="${whatsapp}" onclick="gaEvent('Whatsapp Share');" target="_blank" rel="noreferrer">
                        <img class="rounded-3 box-shadow" src="https://img.10times.com/images/whats.png" width="45" height="45" alt="Whatsapp Share" />
                      </a>

                      ${whatsapphtml}
                    </div>
                  `;
                  hideloading();
                  modals['TenTimes-Modal'].show();
                  return true;
                }


                    $('#myModalinvite').html(html);
                    if(typeof from!='undefined' && from!='')
                        $('#myModalinvite').append('<input type="hidden" id="fromUserJourney" value="1">');
                    if(typeof from1!='undefined' && from1!='')
                        $('#myModalinvite').append('<input type="hidden" id="invite_modal" value="1">');
                    if(typeof share_icon!='undefined' && share_icon!='')
                        $('#myModalinvite').append('<input type="hidden" id="share_icon_modal" value="1">');
                    hideloading();
                    $('#myModalinvite').modal('show');
                    $('#twt').click( function(e) {
                      e.preventDefault();
                    });
                     }
                   });

                    },
            error: function(resp) {
                window.alert("Sorry something went wrong. Please try later.");
                hideloading();
                //console.log(resp);
                if (resp['readyState'] == 4) 
                {
                $.ajax({
                    type: "POST",
                    url: site_url+'/ajax?for=invite',
                    data: {'error': JSON.stringify(resp) ,'longurl': longurl ,'page': pageType ,'subject': 'Google URL Shortener Api: Not Working' },
                    success: function(a) 
                    {
                        //console.log(a);
                    },
                    error: function(a){
                        console.log(a);
                    },
                });
                }
            },
        });
/* end of urlShortner Api call */

if(shorturl!='')
{    

  }
}
 
var flag_CallAjaax=0;
function handleGAuth_new() {
    if($('#myContactsModal').is(':visible')){
        $('#add_new_form').hide();
        $('#contact-content').hide();
        $('.no-contact h3').html('<center>Importing your contacts</center>');
        $('.no-contact').css({'color':'#000'});
        $('.no-contact h3').css({'top':'43%'});
        if((getCookie('user') && getCookie('user') != "") || (getCookie('user_token') && getCookie('user_token') != ""))
            $('#contact_list_invite').hide();
        $('#myContactsModal .modal-body').append('<div> <div class="progress-bar-container"> <div class="progress-bar stripes animated reverse slower"></div></div></div>');
    }
   social_login(function(){    
        if($('#myContactsModal').is(':visible')){
           $('#contact-content').show();
           $('#myContactsModal .progress-bar-container').parent().remove();
           if(flag_CallAjaax==0){
                $('.no-contact').css({'color':'red'});
                $('.no-contact h3').html('');
                contactModalHtml.makeAjaxContacts(this,'gmail'); 
                flag_CallAjaax=1;
           }
           
        }
   },'gmail','','importauth')

}

if (window.addEventListener){
    window.addEventListener("message", listenMessage, false);
} else {
    window.attachEvent("onmessage", listenMessage);
}
function listenMessage(msg) {
    if (msg.data != '') {
        if (typeof msg.data == 'string') {
            return false;
        } else {
            if(typeof msg.data.metadata=='undefined'){
                return false;
            }
            var dataRes =msg.data;

             if(pageType!='thankyou_new' && pageType!='listing' && pageType!='about' && pageType!='top100' && pageType!='udash_recommendation' && pageType!='mdashRecommendation'  && pageType!='homepage' && pageType!='dashboard_events'){
                    if($('#fromSection').length==1)

                        var e_id=$('#fromSection').val();

                if($('#fromWidget').length==1)
                    var fromWidget=1;

                if($('#fromUserJourney').length==1)
                    var fromUserJourney=1;
                if($('#invite_modal').length==1)
                    var invite_modal=1;
                var a=[];
                a.name=dataRes.name;
                a.email=dataRes.email;
                auth_data[0] = a,
            gmailfriends1 = [], gmailfriends2 = "",gmailname1 = [], gmailname2 = "",$("#send").removeAttr("disabled"), flag = 0, $("#myModalinvite").empty(), $("#myModalinvite").append('<div style="display: block; padding-left: 13px;" class="modal fade in" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button><h2 class="modal-title" id="myModalLabel" style="align:left">Invite Friends</h2><div class="row"><div style="line-height:17px; background:#efefef; padding:5px 15px"><table cellpadding="5" cellspacing="5" width="100%"><tbody><tr><td id="mrselect" style="line-height:15px"><input class="mr" onchange="selectall(this);" type="checkbox"> Select all Friends <span style="font-size:11px; color:#727272; line-height:18px"></span></td><td align="right"><a id="send" class="btn btn-primary btn-sm" href="javascript:void(0)" onclick="sendemailall(this);">Send</a></td></tr><br></tbody></table></div></div></div><div class="modal-body"></div></div></div></div>'), modal_content = "";
            if(typeof e_id!='undefined' && e_id!='')
                $("#myModalinvite").append('<input type="hidden" id="fromSection" value="'+e_id+'">');
            if(typeof fromWidget!='undefined' && fromWidget!='')
                $("#myModalinvite").append('<input type="hidden" id="fromSection" value="fromWidget">');


            if(typeof fromUserJourney!='undefined' && fromUserJourney!='')
                $("#myModalinvite").append('<input type="hidden" id="fromUserJourney" value="fromUserJourney">');
            if(typeof invite_modal!='undefined' && invite_modal!='')
                $("#myModalinvite").append('<input type="hidden" id="invite_modal" value="invite_modal">');
            var c=dataRes.metadata;
            
            if(!$('#myContactsModal').is(':visible'))
            {
                var f=2;
                var g=c.length;
                modal_content += '<div style="height:200px; overflow-y:scroll; overflow-x:hidden">';
                for (var h = 0; h < c.length; h++) 2 != f ? (modal_content = modal_content + '<div class="col-md-6 margin"><table class="mr" cellpadding="10" cellspacing="10" width="100%"><tbody><tr bgcolor="#ebf6ff"><td width="30" align="center" valign="middle"><input type="checkbox" class="mr" onchange="emailarray(this);"></td><td width="40" class="pdt1 pdb1"><img class="img-rounded img-responsive" src="https://c1.10times.com/img/no-pic.jpg" data-src="' + c[h].picurl + '"></td><td>&nbsp;<b>' + c[h].name + "</b><br>&nbsp;<small><nobr class='email'>" + c[h].email + "</nobr></small></td></tr></tbody></table></div></div>", f++) : (modal_content = modal_content + '<div class="row"><div class="col-md-6 margin"><table class="mr" cellpadding="10" cellspacing="10" width="100%"><tbody><tr bgcolor="#ebf6ff"><td width="30" align="center" valign="middle"><input type="checkbox" class="mr" onchange="emailarray(this);"></td><td width="40" class="pdt1 pdb1"><img class="img-rounded img-responsive" src="https://c1.10times.com/img/no-pic.jpg" data-src="' + c[h].picurl + '"></td><td>&nbsp;<b>' + c[h].name + "</b><br>&nbsp;<small><nobr class='email'>" + c[h].email + "</nobr></small></td></tr></tbody></table></div>", f = 1);
                g % 2 != 0 && (modal_content += "</div>"), modal_content += "</div>", $("#myModalinvite .modal-body").empty(), $("#myModalinvite .modal-body").append(modal_content), $("#myModalinvite").modal("show"), $("#myModal").modal("hide")
              }
            }

            var fdResponse=dataRes.result;
            if($('#myContactsModal').is(':visible') && fdResponse['status']==1){
                if(flag_CallAjaax==0){
                    contactModalHtml.makeAjaxContacts(this,'gmail');
                    flag_CallAjaax=1;
                }
            }   

            
        }
    }
}

function emailarray(a) {
   // loadASyncTTScript('https://apis.google.com/js/client.js');
    // namearray(a);
    if($(a).parent().next().next().find("b").text()){
        var nme = $(a).parent().next().next().find("b").text();
     }else{
        var nme = "";
     }
    var mail = $(a).parent().next().next().find(".email").text();
    var mail_id = mail+"_name_"+nme;
    $(a).is(":checked") ? gmailfriends1.indexOf(mail_id) == -1 && gmailfriends1.push(mail_id) : gmailfriends1.splice(gmailfriends1.indexOf(mail_id), 1)
}
// function namearray(a)   {
//  if($(a).parent().next().next().find("b").text()){
//     var b = $(a).parent().next().next().find("b").text();
//  }else{
//     var b = "";
//  }
//     $(a).is(":checked") ? gmailname1.indexOf(b) == -1 && gmailname1.push(b) : gmailname1.splice(gmailname1.indexOf(b), 1)   
// }

function selectall(a) {
    //loadASyncTTScript('https://apis.google.com/js/client.js');
    if(pageType == "thankyou_new"){
        customEventGA('Event Visitor','Invite Via Gmail | Select All','10times.com/'+$('#event_url').val());
    }
    $(a).is(":checked") ? ($(".mr").prop("checked", !0), flag = 1) : ($(".mr").prop("checked", !1), flag = 0)
}

function hotelDetail(data,more)
{   
    callGaEvent("hotel");
    var hotel_details;
    var hotelTab = window.open();
    if(more == 1) {
        var bookingURl = $(data).attr('data-url');
        if(bookingURl.search('&label') > -1 ) {
           bookingURl =  bookingURl.replace('&label=' , '')
        }
        hotelLink(data,bookingURl,hotelTab);
        return false;
    }
    $.ajax({
        type: "POST",
        url: site_url_attend+'/ajax?for=hotel',
        data: {'entity_id': $(data).attr('data-id') },
        success: function(a) 
        {
            hotel_details=JSON.parse(a);
            if(hotel_details.status.code == 1)
            {
                hotelLink(data,hotel_details.data.basic.url,hotelTab);
            }
        },
        error: function(a) {
        },
    });
    hideloading();
}
function hotelLink(data , booking_url ,hotelTab ) {
   
    var queryString = '';
    if(booking_url.search('aid=337796') < 0)  {
        queryString+='aid=337796';
    }
    if($(data).attr('data-checkin')!=null && $(data).attr('data-checkin')!='')
        queryString+= ';checkin='+$(data).attr('data-checkin');
    if($(data).attr('data-checkout')!=null && $(data).attr('data-checkout') !='')
        queryString+= ';checkout='+$(data).attr('data-checkout');
    if($(data).attr('data-label')!=null && $(data).attr('data-label') !='')
        queryString+= ';label='+$(data).attr('data-label');
    if((getCookie('user') && getCookie('user') != "") || (getCookie('user_token') && getCookie('user_token') != "")) {
        queryString+='_'+getCookie('user');
        if(typeof VisitorIdDecode !== 'undefined' &&  VisitorIdDecode) {
            queryString+='_'+VisitorIdDecode;
        }
    }
    if(getUrlParameter('adr')){
        queryString+='_'+getUrlParameter('adr');
    }
    if(booking_url.search('aid=337796') < 0)  {
        booking_url+= '?'+queryString;
    }
    else{
        booking_url+= queryString;
    }
    if(booking_url!='') {
        hotelTab.location.href = booking_url;
    }
    else {
        hotelTab.close();
    }
}

function fullBlockClick(data,newWindow)
{
  if(pageType=="company" || pageType=="company-country")
  {
      customEventGA('Company','Company_Page','Company|Listing|Company_Page');
  }

  cat=$(data).find('a').attr('href');
  dl(cat);

  if(newWindow==1)
  {
    window.open(cat, '_blank');
    return false;
  }
  else
  {
    location.href=cat;
    return false;
  }
  
}



requestFlag=true;
dataFlag=true;
searchFlag=true;
    page=1;
    pages=1;
    eventid= $('#eventID').val();
function showContent(item1)
    {
       $(item1).parent().find('.more_content').removeClass( "dis-non" );
       $( item1 ).addClass( "dis-non" );
    }

$(".edition_menu li").click(function() {

    $('.all_edtn').html($(this).find('a').html()); // gets innerHTML of clicked li
    $('.btn_edition').removeClass('btn-default').addClass('btn-primary active');;
    $('.current').removeClass('btn-primary').removeClass('active').addClass('btn btn-default');

});

 var countFeed=0;

function lastAddedLiveFunc(ths,edition,notscroll) 
  {
    var ed='';
    if(typeof edition!=='undefined' )
    {
        ed='&edition='+edition;
        $("#ajax").remove();
    }

    if(typeof ths!=='undefined' )
    {
        $('.current').removeClass('btn-default').removeClass('active').addClass('btn-primary active');;
        $('.btn_edition').removeClass('btn-primary').removeClass('active').addClass('btn-default');
    }

    if(typeof notscroll!=='undefined' && notscroll==1)
    {
      
        showloading();
    }

    if(document.getElementById("12") )
    {

      requestFlag=false;
      searchFlag=true;
      
    }else{
    $("#ajax").show();
    requestFlag=false;  
    documet_url=document.URL;
    documet_url=documet_url.replace("#",'');
    
     if(window.location.href.indexOf("?") > -1) {
       data_url=documet_url+'&ajax=1&page='+page;
        }else
      data_url=documet_url+'?&ajax=1&page='+page;
    
      if(ed!='')
      {
        data_url=data_url+ed;
      }

      $.ajax({ url: data_url , success: function(data) 
        {
            if(typeof notscroll!=='undefined' && notscroll==1)
            {
                $( "#more_data" ).html( data );
                hideloading();
            }
            else
            {
                $( "#content" ).append( data );
                $( ".pastt" ).first().show();
                requestFlag=true; 
                searchFlag=true;
            }
            if(pageType == "photos-videos"){
               $( "#imi").find('like').append( data );
               userActionClick();
               hitMyData();
            }
            $('[data-toggle="tooltip"]').tooltip();
            $("#ajax").hide();
            feedCount();
    
          },error: function (jqXHR, status, err) {
             $("#ajax").hide();
            }
        });
    }
  }

$(".edition_menu li").click(function() {
    $('.all_edtn').html($(this).find('a').html()); // gets innerHTML of clicked li
    $('.btn_edition').removeClass('btn-default').addClass('btn-primary active');;
    $('.current').removeClass('btn-primary').removeClass('active').addClass('btn btn-default');
});
notscroll_exh='';
ed_exh='';
var didi = '' ;
var exhibitorXhr = '' ;
    function lastAddedExhibitors(ths_exh,edition_exh,notscroll_exhi)
    {
        didi = ths_exh ;
        var filterdata = '';
        if($( ths_exh).parent().siblings('button').attr('data-filter-type') == 'industry'){
            $('.industry_name').html($(ths_exh).text());
            if($('.industry_name').text() != "Select Category")
                filterdata += '&industry='+ $(ths_exh).text() ;
            page = 1 ;
        }
        else if($('.industry_name').text() != "Select Category" && $('.industry_name').text() != "" ){
            filterdata += '&industry='+ $('.industry_name').text() ;
        }
        else if(getParameterByName('industry')){
            filterdata += '&industry='+ encodeURIComponent(getParameterByName('industry'));
            $('.industry_name').html(getParameterByName('industry'));
        }
        // if($( ths_exh).parent().siblings('button').attr('data-filter-type') == 'product'){
        //     $('.product_name').html($(ths_exh).text());
        //     if($('.product_name').text() != 'All Products/Services')
        //         filterdata += '&product_id='+ $(ths_exh).attr('data-product-id') ;
        // }
        // else if($('.product_name').text() != "Filter Exhibitors by Products/Services" && $('.product_name').text() != ""){
        //     $('.product_name').parent().siblings().children().each(function(i) { 
        //         if($('.product_name').text() == $(this).text()){
        //             filterdata += '&product_id='+ $('.product_name').parent().siblings().children(i).attr('data-product-id') ;
        //         }
        //     });
        //     if($('.product_name').text() == 'All Products/Services')
        //         filterdata += '&product_id=""';
        // }
        var productId = [] ;
        $('#product_name').children().each(function(i) { 
            productId[$(this).text().toLowerCase()] =  $(this).attr('data-product-id');
        });
        var checkedProductId = '' ;
        // $('input[name="product_list"]:checked').each(function(index) {
        //     var checkedName = this.value ;
        //     checkedProductId += productId[checkedName] + ',' ;
 
        // });
        $('#industry_name').parent().find('.multiselect-container li.active').each(function(element) {
            // if($('.products input[data-industry="'+($(this).find('input').attr('value')).toLowerCase()+'"]:checked').length>0){
            //     $('.products input[data-industry="'+($(this).find('input').attr('value')).toLowerCase()+'"]:checked').each(function(index) {
            //         checkedProductId+=$(this).attr('data-id')+',';
            //     })
            // }else{
                $('.products input[data-industry="'+($(this).find('input').attr('value')).toLowerCase()+'"]').each(function(index) {
                    checkedProductId+=$(this).attr('data-id')+',';
                })
            // }
        })
        checkedProductId = checkedProductId.substring(0,checkedProductId.length-1 ) ;
        
        if(typeof checkedProductId !=='undefined' && checkedProductId != '' ){
            filterdata += '&product_id='+checkedProductId;
        }
        else if(getParameterByName('product_id')){
            filterdata += '&product_id='+getParameterByName('product_id') ;   
        }
        if($('.current').hasClass('btn-primary') && ed_exh=='')
        {
            ed_exh='&edition='+$('.btn-primary').attr('id');
        }
        if(typeof ths_exh!=='undefined' )
        {
            $('.btn-group').children().each(function(){
                $(this).removeClass('active').addClass('badge-grey');
            });
            $(ths_exh).removeClass('badge-grey').addClass('active');
            // $('.btn_edition').removeClass('btn-primary').removeClass('active').addClass('btn-default');
        }
        if(typeof edition_exh!=='undefined' && edition_exh != '')
        {
            ed_exh='&edition='+edition_exh;
            $("#ajax").hide();
            showloading(); 
             page=1;
        }else if(ed_exh==''){
            if(pageType == 'visitors' && $("#user-comm").length>0) {
                $("#ajax").hide();
                var searchstr = $("#search2").val();
                searchstr = searchstr.trim();
                if(searchstr){
                    ed_exh += '&q='+searchstr;
                }
                var designation = $("#visitor_designation").val();
                if(designation) {
                    ed_exh += '&designationId='+ designation;
                }
                var city = $("#visitor_intent_City").val();
                if(city) {
                    ed_exh += '&cityNew='+ city;
                }
                var country = $("#visitor_intent_Country").val();
                if(country) {
                    ed_exh += '&countryNew='+ country;
                }
                var eventEdition = $("#visitor_edition").val();
                if(eventEdition){
                     ed_exh += '&edition='+ eventEdition;
                }
            }
            else{
                ed_exh='&edition='+$('.btn-group>.active').attr('id');    
            }
            
        }
        $('.edition_menu').children().each(function(i) { 
            if($(this).text() == $(didi).text() && typeof $(this).attr('data-edition-id') !== 'undefined' ){ed_exh = '&edition='+$(this).attr('data-edition-id');page=1;}
        });
        if(typeof edition_exh!=='undefined' && edition_exh == ''){
            ed_exh='';
        }
       
             if(typeof notscroll_exhi!=='undefined' && notscroll_exhi==1)
    {
        page=1
        $("#12").remove();
        showloading();
    }
  if(document.getElementById("12") )
    {
      requestFlag=false;
      searchFlag=true;
      if((typeof showfilter==='undefined' || showfilter==2) && page_type == "exhibitors"){
            //SubmitFilter() ;
        }
       if(typeof notscroll_exhi !=='undefined' && notscroll_exhi==1)
            SubmitFilter();
      
    }
    else{
        if(pageType == 'visitors' && $("#user-comm").length > 0 && page ==1) {

        }
        else{
            $("#ajax").show();    
        }    
    
    requestFlag=false;  
    documet_url=document.URL;
    documet_url=documet_url.replace("#",'');
    
     if ($(ths_exh).hasClass('current')) {
        filterdata += '&all_data=true';
     }
     if(window.location.href.indexOf("?") > -1) {        
       data_url=site_url+'/ajax?for=scroll&path='+path+'&ajax=1&page='+page+filterdata;
            if(getParameterByName('industry') != null ){
                data_url=site_url+'/ajax?for=scroll&path='+path+'&ajax=1&page='+page+filterdata;
            }
            else if(getParameterByName('product_id') != null ){
                data_url=site_url+'/ajax?for=scroll&path='+path+'&ajax=1&page='+page+filterdata;
            }
        }else{
            data_url=site_url+'/ajax?for=scroll&path='+path+'&ajax=1&page='+page+filterdata;
            if(getParameterByName('industry') != null ){
                data_url=site_url+'/ajax?for=scroll&path='+path+'&ajax=1&page='+page+filterdata;
            }
            else if(getParameterByName('product_id') != null ){
                data_url=site_url+'/ajax?for=scroll&path='+path+'&ajax=1&page='+page+filterdata;
            }
        }
      
      if(ed_exh!='')
      {
        data_url=data_url+ed_exh;
      }
    if(exhibitorXhr && exhibitorXhr.readyState != 4){
            exhibitorXhr.abort();
    }
    if(page_type == "visitors" )
        dl('Event Detail | Visitors | Scroll - Load More Data');
      exhibitorXhr = $.ajax({ url: data_url , success: function(data) 
        {
            if(typeof notscroll_exhi!=='undefined' && notscroll_exhi==1)
            {
                if([181465,112731].indexOf(parseInt(getEventId()))>-1){
                    var sortedList = new Array(new Array(), new Array(), new Array());
                    var data1 = $(data);
                    data1.find('tbody tr').each(function(ele){
                        var tr = $(this);
                        var prods = new Array();
                        if ($(this).find('.ex-prod-name').length>0) {
                            prods = ($(this).find('.ex-prod-name').attr('data-prod')).split(',');
                        }
                        var priorityIndex = 2;
                        prods.forEach(function(element) {
                            var cat_prod = element.trim().split('-');
                            if(typeof cat_prod[1] !="undefined" && $('.products input[value="'+cat_prod[1].toLowerCase()+'"]:checked').length>0 && priorityIndex>0){
                                priorityIndex = 0;
                            }
                            else if(typeof cat_prod[0] !="undefined" && $('.products input[data-industry="'+cat_prod[0].toLowerCase()+'"]:checked').length>0 && priorityIndex>1){
                                priorityIndex = 1;
                            }
                        });
                        sortedList[priorityIndex].push(tr);
                    });
                    sortedList[0] = sortedList[0].concat(sortedList[1],sortedList[2]);
                    if(sortedList[0].length > 0){
                        var newHTML = '';
                        sortedList[0].forEach(function(element) {
                            newHTML += $('<div>').append(element.clone()).html(); 
                        })
                        data1.find('tbody').html(newHTML);
                        data = $('<div>').append(data1.clone()).html();
                    }
                }
                $( "#block-listing" ).html( data );
                if ($(ths_exh).hasClass('current')) {
                    $('#block-listing > table').addClass('data_table');
                 }else{
                  $('.data_table').removeClass('data_table');  
                 }
                if ($('.data_table').length != 0){
                        $('.data_table').DataTable({
                            destroy: true,
                            "order": [[ 0, "asc" ]],
                            "pageLength": 100,
                            "bLengthChange": false,
                            "bInfo" : false,
                            iDisplayLength: $('.data_table').find('tbody > tr').length
                        });
                    $('.data_table').prepend('<tr></tr>');  
                    $('#show_data').find('label').html();
                    if (!document.getElementById("12")) {
                        $('#show_data').after('<div class="col-md-12" id="12"></div>');
                    }  
                    }else{
                    $('<thead><tr><td class="text-muted text-center"><strong>Booth</strong></td><td class="text-muted line"><strong>Exhibitor Details</strong></td></tr></thead>').insertBefore($("#block-listing").find('tbody'));
                    $('<tr></tr>').insertBefore($("#block-listing").find('tbody > tr:first-child'));
                    }
                hideloading();
            }
            else
            {
                $( "#block-listing" ).append( data );
                hideloading();
                $( ".pastt" ).first().show();
            }
            var designationID=$("#visitor_designation").val();
            if(typeof designationID!="undefined" && designationID>0){
                var designationStr1 = $('#visitor_designation').children('option:selected').text();
                if(typeof designationStr1!="undefined" && designationStr1.indexOf('[')>0)
                    {
                        var desigLabl = designationStr1.substr(0,designationStr1.indexOf('[')-1);
                        $('.Mem-top').text('To view other '+desigLabl+'s');
                    }
                $('#Membership-Designation').css('display','block');
            }
            else{
                $('#Membership-Designation').attr('hidden','hidden');
            }

               requestFlag=true; 
                searchFlag=true;
            $('[data-toggle="tooltip"]').tooltip();
            $("#ajax").hide();
            if((typeof showfilter==='undefined' || showfilter==2) && page_type == "exhibitors"){
                //SubmitFilter() ;
            }
            if(typeof notscroll_exhi !=='undefined' && notscroll_exhi==1)
                    SubmitFilter() ;
            if($('#show_data').hasClass('hide')){
                //alert('in');alert(showfilter);
                if(typeof showfilter!=='undefined' && showfilter==1 && page_type == "exhibitors")
                    $('#block-listing .tb-list').prepend('<tr><td class="text-muted text-center"><strong>Booth</strong></td><td class="text-muted line"><strong>Exhibitor Details</strong></td></tr>') ;
                
                $('#show_data').removeClass('hide');
            }
            if(getCookie('user') != ""){
                hitMyData();
            }
          },error: function (jqXHR, status, err) {
            if(status != 'abort'){
                if(typeof notscroll_exhi!=='undefined' && notscroll_exhi==1)
                   $( "#block-listing" ).html( '<p id="no-data-error" class="text-center">No data found for your search <b></b> <br></p>' );
                $("#ajax").hide();
                hideloading();
            }

            }
        });
    }
      
    }
function searchedResults(){
    if(document.getElementById("13")){
        searchFlag=false;
    }
    else{
        pages=pages + 1 ;
        getSearchedResults();
    }
}
function getSearchedResults(){
    if(document.getElementById("13")){
        return false;
    }
    else if(pages > 3){
        if(pages == 4)
            $( "#block-listing" ).append('<div class="col-md-12 alert alert-info text-center">You can\'t see more visitors. Please use filters </div>') ;
        return false ;
    }
    var dataString='';
    searchstr = $('#search2').val();
    $("#ajax").show();
    searchFlag=false;
    if($('#attends').hasClass('btn-primary'))
    dataString += '&attend=1&eventEdition=' + $('#eventEdition').val();
    else  if($('#follows').hasClass('btn-primary'))
    dataString +='&attend=2&eventEdition=' + $('#eventEdition').val();

    dataString += '&searchstr='+ searchstr + '&eventid='+ eventid + '&page='+pages;
    dl('Scroll-Load More Data');
    
    $.ajax({
    type: "POST",
    url: site_url+'/ajax?for=visitorsearch&new=1',
    data: dataString,
    success: function(response) {
        $( "#block-listing" ).append( response );
        $("#ajax").hide();
        searchFlag=true;
    } 
    });
}

var lastScrollTop = 0;
var scrollDirection = 0;
var requestNewFlag = true;
$(window).scroll(function(event){
   var st = $(this).scrollTop();
   if (st > lastScrollTop){
       scrollDirection = 1 ;
   } else {
      scrollDirection = 2 ;
   }
   lastScrollTop = st;
});
function load_more_data()
{   
    if($(window).scrollTop() + 1 >= $(document).height() - $(window).height()-310){
        if(requestFlag && dataFlag){
            exh=page_type;
            if(!document.getElementById("12") && page >= 2 && getCookieNew1('user') == "" && exh=="visitors" ){
                if(deviceFlag == 1 && scrollDirection == 1){
                    scrollType = 'visitors-scroll' ;
                    requestFlag = false;
                    signInTT('signup',scrollType);
                }
            }
            else{
                page=page+1;
                if(exh=="exhibitors" || exh=="visitors"){
                    if(page > 3 && exh=="visitors" ){
                        if(page == 4)
                            $( "#block-listing" ).append('<div class="col-md-12 alert alert-info text-center">You can\'t see more visitors. Please use filters </div>') ;
                        return false ;
                    }
                    if(!$('#show_data').hasClass('hide')){lastAddedExhibitors();}
                    else if(exh=="visitors"){lastAddedExhibitors();}
                }
                else{
                    lastAddedLiveFunc();
                }
            }
        }
        if(searchFlag && visitor_page && requestNewFlag )
        {
            if(pages >= 2 && getCookieNew1('user') == "" && exh=="visitors" && !document.getElementById("13")){
                if(deviceFlag == 1 && scrollDirection == 1 ){
                    scrollType = 'visitors-scroll' ;
                    requestNewFlag=false;
                    signInTT('signup',scrollType);
                }
            }
            else{
                searchedResults();
            }
        }
    }
}


$(window).scroll(function(){

if(typeof not_about_page!=='undefined' && not_about_page==1 )
{   
    if(($("#exhibitorNewPage").length < 1) && pageType != "photos-videos"){
    load_more_data();
    }

            $(document).ready(function () {
                if(countFeed == 0 && pageType == "photos-videos"){
                   feedCount();
                 }
             }); 
    // if((countFeed < $('.active').find('.badge-grey').html()) && pageType == "photos-videos"){
    //     load_more_data();
    // }
}

});


        $( document ).ready(function() {
       $( ".pastt" ).first().show();
    });


/*END DETAIL PAGE CUSTOM JS*/


/*START FOR BROKEN MODAL VIEW */
  $(document.body)
.on('show.bs.modal', function () {
    if (this.clientHeight <= window.innerHeight) {
        return;
    }
    // Get scrollbar width
    var scrollbarWidth = getScrollBarWidth()
    if (scrollbarWidth) {
       // $(document.body).css('padding-right', scrollbarWidth);
        $('.navbar-fixed-top').css('padding-right', scrollbarWidth);
        //$('footer').css('margin-right', scrollbarWidth);
    }
})
.on('hidden.bs.modal', function () {
    //$(document.body).css('padding-right', 0);
    $('.navbar-fixed-top').css('padding-right', 0);
    //$('footer').css('margin-right', 0);
    });

function getScrollBarWidth () {
    var inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild (inner);

    document.body.appendChild (outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;

    document.body.removeChild (outer);

    return (w1 - w2);
};

function bulkUserImport(metadata,from,source)
{
    // console.log(metadata);
    var data = {};
    var addSource;
    $.each( metadata, function(index , value) {
        data[index]={'email' : value['email'], 'name' : value['name'], 'ContactId' : value['ContactId'],'phone': value['phone']/*, 'picurl' : value['picurl']*/};
        data[index] = JSON.stringify(data[index]);
    });
    //console.log(JSON.stringify(data));
    if(typeof source != 'undefined' && source=='gmail')
        addSource='website_import';
    else if(typeof source != 'undefined')
        addSource=source;

    if(from==1)
    {   
        $('#add_new_form_invite').hide();
        $('#contact-content_invite').hide();
        if(source=='gmail'){
          $('.no-contact h3').html('<center>Importing your contacts</center>');
          $('.no-contact').css({'color':'#23527c'})
        }
        $('#myContactsModal .modal-body').append('<div> <div class="progress-bar-container"> <div class="progress-bar stripes animated reverse slower"></div></div></div>');
    }
    $.ajax({
            type: "POST",
            url: site_url_attend+'/ajax/user_import',
            data: {metadata: JSON.stringify(data),source:addSource},
            success: function(a) 
            {   
                // console.log(a);
                a=JSON.parse(a);
                if(from==1 && (source!='gmail' && $('.no-contact').length==0) && a['status']==1 )
                {   
                    contactModalHtml.addContactSuccess(a['data']);
                }
                else if(a['status']==1 && (addSource=='website_import' || $('.no-contact').length!=0))
                    contactModalHtml.makeAjaxContacts(this,'gmail');
                else
                    showToast('Something went wrong. Could not add contact');
            },
            error: function(a){
                console.log(a);
            },
        });

}


/*END FOR BROKEN MODAL VIEW*/



/*START PROFILE PAGE JS*/


// $(document).on({
//     mouseenter: function () {
//        $(this).find('button').stop().fadeIn().removeClass('hidden');
//     },
//     mouseleave: function () {
//         $(this).find('button').stop().fadeOut().removeClass('hidden');
//     }
// }, '.ten_timeline li div');

var page_up=1;
var page_exp=1;
var profile_page_no=1;
function redirect(cat)
{
    location.href=site_url_attend+'/'+cat;
}


function load_more_evt(up,up_more)
{
    //documet_url=document.URL;
    if ($('#'+up_more).attr('disabled') === "disabled") {       
          return null;        
    }
    documet_url= window.location.protocol + "//" + window.location.host + window.location.pathname;

    var offset = 0;
    documet_url=documet_url.replace("#",'');
    if(up_more=='initial_call'){
         $('#'+up+'_more').hide();
    }else{
       $('.'+up+'_load').show();
    }
    if(up=='up' || up=='reviews-data')
    {
        page_up=page_up+1
        profile_page_no=page_up;
    }
    else if(up == 'upcoming_all'){
        u_all_offset=u_all_offset+20;
        offset=u_all_offset;
    }
    else if(up == 'upcoming_going'){
        u_going_offset=u_going_offset+20;
        offset=u_going_offset;
    }
    else if(up == 'past_all'){
        p_all_offset=p_all_offset+20;
        offset=p_all_offset;  
    }
    else if(up == 'past_visited'){
        p_visited_offset=p_visited_offset+20;
        offset=p_visited_offset;
    }
    else
    {
        page_exp=page_exp+1;
        profile_page_no=page_exp;
    }
    
    var evtcount=$('#stats_cnt_'+up).val();
    if(up=='upcoming_all' || up=='upcoming_going' || up=='past_all' || up=='past_visited'){
    var dataString = '&offset='+ offset + '&ajax=1&type='+up;
    }else{
    var dataString = '&page='+ profile_page_no + '&ajax=1&type='+up;
    }
    if(page_type !== undefined && page_type == "comments"){
        if(up_more == "tweets_more" )
            $('#'+up_more).html('<i class="loader-js fa fa-spin fa-refresh fa-fw fa-x"></i> Load more tweets') ;
        else
            $('#'+up_more).html('<i class="loader-js fa fa-spin fa-refresh fa-fw fa-x"></i> Load more reviews') ;

    }
    if($("#review-filter").val() == "Most Popular") {
        dataString+="&sort=popularity";
    }
    else if ($("#review-filter").val() == "Most Recent"){
        dataString+="&sort=mostRecent";
    }
    else if($("#review-filter").val() == "Most Helpful"){
        dataString+="&sort=mostHelpful";
    }
    else if($("#review-filter").val() == "Highest Rated"){
        dataString+="&sort=highestRated"
    }
    else if ($("#review-filter").val() == "Lowest Rated") {
        dataString+="&sort=lowestRated";
    }
    if($("#fdbybrand").length > 0){
        dataString+="&fdbybrand="+$('#fdbybrand').val();     
    }
    if ($("#filter-by option:selected").text() == "Verified Visits") {
            dataString += "&verified=1";
        } else if ($("#filter-by option:selected").text() == "Image Reviews" || $("#filter-by option:selected").text() == "Photo Reviews") {
            dataString += "&havingPhoto=1";
        }
    $.ajax({
            type: "POST",
            url: site_url+'/ajax?for=scroll&path='+path+dataString,
            data: dataString,
            
            success: function(response) 
            {   hideloading();
                if($("#new-review-data").length>0){
                    $("#new-review-data").append(response);
                }
                else{
                   $('#'+up).append(response); 
                   $('#'+up+'_more').show();

                }
                $('.'+up+'_load').hide();
                if($('#'+up+'_count').val()<offset+20){
                    $('#'+up+'_more').hide();
                }   
                if(profile_page_no*6>=evtcount)
                {
                    $('#'+up_more).hide();
                }
                if(up=='reviews-data' && response.indexOf('id="12"') != -1){
                    $('#'+up_more).attr('disabled',true);
                    if(deviceFlag != 1){
                        $('#'+up_more).css('background-color','#989898').css('border-color','#989898');
                    }
                }
                if((pageType=='org_detail' && ($('#'+up+' li').length >= $('#'+up).attr('data-limit') || ($('#'+up+' li').length)%6 != 0 )) || (pageType== 'venue_detail' && ($('#'+up+' table').length >= $('#'+up).attr('data-limit') || ($('#'+up+' table').length)%6!=0 )) || profile_page_no>200)
                    $('#'+up_more).remove(),$('.'+up+'_load').remove();
                $('#'+up_more).find('.loader-js').remove() ;
                if(typeof reviewTime === "function") {
                    reviewTime();
                }
                getDynamicStatus();
                if(typeof userActionSync === "function") {
                    userActionSync();
                }
                if(typeof feedbackSyncByGid  === "function"){
                    feedbackSyncByGid();
                }
                if(typeof feedbackSyncByCount  === "function"){
                    feedbackSyncByCount();
                }
            },
            error: function() {
                if(page_type !== undefined && page_type == "comments"){
                    if(up_more == "tweets_more" )
                        $('#'+up_more).html('<i class="loader-js fa fa-spin fa-refresh fa-fw fa-x"></i> Load more tweets') ;
                    else
                        $('#'+up_more).html('<i class="loader-js fa fa-spin fa-refresh fa-fw fa-x"></i> Load more reviews') ;
                }
            }

    });

}
function ind_mr(arg1,arg2)
{
    $('.'+arg1).removeClass('dis-non');
    $('.'+arg2).hide();
}

/*END PROFILE PAGE JS*/

/*START ONESIGNAL NOTIFICATION JS*/
// function executeOneSignal() {
// }

function createChatIcon(){
    if(deviceFlag==1){            
        if($('#notificationBell').length>0){
            $('#notificationBell').parent().remove();
        }
    }
    if($('#messageInit').length<1){
        if(deviceFlag==1){ 
            if(pageType=='homepage'){
                $('#navbar').find('#loggedLi').before('<li class="dropdown"> <a href="javascript:void(0);" id="messageInit" class="dropdown-toggle" data-toggle="dropdown" name="message_Init" role="button" aria-label="chat" aria-haspopup="true" aria-expanded="false"><i class="fa fa-envelope-o"></i><style>.chatIcon {position: absolute;background: #50af4c;height: 8px;top: 15px;right: 13px;width: 8px;text-align: center;line-height: 11px;border-radius: 50%;color: #fff;border: 1px solid #50af4c;} </style><span class="chatIcon dis-non"></span></a></li>');

            }else{
                $('.nav .search').parent().after('<li class="dropdown"> <a href="javascript:void(0);" id="messageInit" class="dropdown-toggle" data-toggle="dropdown" name="message_Init" role="button" aria-label="chat" aria-haspopup="true" aria-expanded="false"><i class="fa fa-envelope-o"></i><style>.chatIcon {position: absolute;background: #50af4c;height: 8px;top: 15px;right: 13px;width: 8px;text-align: center;line-height: 11px;border-radius: 50%;color: #fff;border: 1px solid #50af4c;} </style><span class="chatIcon dis-non"></span></a></li>');
            }           
            
        }
        else{
            if(pageType=='homepage'){
                $('.navbar-header').find('img').after('<span style="position: relative;float: right;padding: 9px 10px;margin-top: 8px;color: #fffff;"><a href="javascript:void(0);" id="messageInit" class="dropdown-toggle" data-toggle="dropdown" name="message_Init" role="button" aria-label="chat" aria-haspopup="true" aria-expanded="false" style="color: antiquewhite;"><i class="fa fa-envelope-o"></i><style>.chatIcon {position: absolute;background: #50af4c;height: 8px;top: 10px;right: 7px;width: 8px;text-align: center;line-height: 11px;border-radius: 50%;color: #fff;border: 1px solid #50af4c;} </style><span class="chatIcon"></span></a></span>')
            }else{
                var selector='';
                if($('#shareHide').length>0){
                    selector='shareHide';
                }else{
                    selector='popUpWindowNotif';
                }
                $('<style>.chatIcon{position: absolute;background: #50af4c;height: 7px;top: 12px;margin-left: 23px;width: 7px;text-align: center;font-size: 10px;border-radius: 50%;color: #fff;border: 1px solid #50af4c;}</style><a id="messageInit" style="text-decoration: none!important;"> <span class="chatIcon dis-non"></span><i class="fa fa-envelope-o"></i></a>').insertBefore('#'+selector);    
            }
            
        }  

         
    }
    // channelizeInit.login();

    $('#messageInit').click(function(){
        channelChat.push(function() {
            window.channelizeUI.openMessenger();
        }); 
        // channelizeInit.callChannelize();
    });
    
}
function odashLinkingAdd(result,type){
    if(typeof result != "string" && result.length>0 && ((result.user_access.hasOwnProperty('events') && result.user_access.events.length>0) || (result.user_access.hasOwnProperty('company') &&  result.user_access.company.length>0))){
        if( !$('a').hasClass('me')){
            if(typeof type!='undefined' && type=='home'){
                if(device != 'phone')
                    $('<li><a class="me" onclick="manageEventLink(\'myEventsLink\', \''+result.user_access.user+'\')" href="javascript:void(0);" >Organizer Dashboard</a></li>').insertBefore($('#loggedLi').find('.divider'));
                else
                    $('.mob-opt').append('<li><a class="me" onclick="manageEventLink(\'myEventsLink\', \''+result.user_access.user+'\')" href="javascript:void(0);" >Organizer Dashboard</a></li>');
            }
            else{
                if(deviceFlag==0){
                        $('.sidebar-nav').append('<li><a class="me" onclick="manageEventLink(\'myEventsLink\', \''+result.user_access.user+'\')" href="javascript:void(0);" >Organizer Dashboard</a></li>');
                }
                else{
                    $('<li><a class="me" onclick="manageEventLink(\'myEventsLink\', \''+result.user_access.user+'\')" href="javascript:void(0);" >Organizer Dashboard</a></li>').insertBefore($('#loggedLi').find('.divider'));
                }
            }
        }
        
    }
}
function getPromoteEventLink(){
    if($('#promote-evt').length==0  && deviceFlag==1){
        $('#notificationBell').parent().before('<li id="promote-evt"><a href="https://login.10times.com/eventmarketing" data-toggle="tooltip" data-placement="bottom" title="Boost Your Event"><i class="fa fa-bullhorn"></i></a></li>');
        // $('#promote-evt').fadeIn(250);
    }
    $("#promote-evt").click(function(e){
        customEventGA("Organizer Action", "Promote Event", pageType);
    });
}
function getSideWrapper(user_image,user_name){
  var html = `<div class="u-login">
                <a href="/dashboard/profile">
                  <img src="${user_image}" data-src="${user_image}" alt="profile_pic" width="30" hspace="5"/>
                  ${user_name}
                </a>
              </div>

              <br/>

              <table class="logged-in">
                <tr>
                  <td width="20%" class="text-center-bl">
                    <a href="/dashboard/recommendations" aria-label="recommendations" onclick="customEventGA(\'Event_Recommendation\',\'Header\',\'Dropdown\',\'\');">
                      <i class="fa fa-home" style="font-size:2rem;padding-top:2px;"></i>
                    </a>
                  </td>
                  
                  <td width="20%" class="text-center-bl">
                    <a href="/dashboard/events" aria-label="events">
                      <i class="fa fa-calendar"></i>
                    </a>
                  </td>
                  
                  <td width="20%" class="text-center-bl conCount2">
                    <a href="/dashboard/connections" aria-label="connections">
                      <i class="fa fa-users"></i>
                    </a>
                  </td>
                  
                  <td width="20%" class="text-center-bl msgCount2">
                    <a href="/dashboard/messages" aria-label="messages">
                      <i class="fa fa-comments"></i>
                    </a>
                  </td>
                  
                  <td width="20%" class="text-center-bl">
                    <a href="/dashboard/preferences" aria-label="preferences">
                      <i class="fa fa-gear"></i>
                    </a>
                  </td>
                </tr>
              </table>

              <br/>`;

  html += `<ul>
            <li>
              <a href="/events">All Events</a>
            </li>

            <li>
              <a href="/tradeshows">Trade Shows</a>
            </li>

            <li>
              <a href="/conferences">Conferences</a>
            </li>

            <li>
              <a href="/top100">Top 100</a>
            </li>

            <li>
              <a href="/venues">Venues</a>
              <span class="block t-divider"></span>
            </li>

            <li>
              <a href="https://login.10times.com/eventmarketing">Promote Event</a>
            </li>

            <li>
              <a href="https://login.10times.com/addevent">Add Event</a>
            </li>
            
            <li>
              <a href="/apd">Download App</a>
            </li>`
            
            + (user.country.id === 'IN' && pageType !== 'homepage' ? `<li><a target="_blank" href="https://10times.com/career">Career at 10times</a></li>` : '') +
            
            `<li>
              <a href="/user/flush" onclick="flush_reload()">Logout</a>
            </li>
          </ul>`;
          
  return html;
}
function desktopMenu(){
    var html=liContentData='';
    let new_Dashboard = $('#newDashboard').text();
    if(typeof new_Dashboard=='string' && new_Dashboard==1){
        // login User Image
            liContentData='<div class="dropdown-toggle w-8 h-8 rounded-full overflow-hidden shadow-lg image-fit zoom-in"> <img alt="'+user_name+'" src="'+user_image+'"> </div>';
            // login div start
            liContentData+='<div class="dropdown-box mt-10 absolute w-56 top-0 right-0 z-20"> <div class="dropdown-box__content box bg-theme-38 dark:bg-dark-6 text-white">';
            // login User data
            liContentData+='<div id="loggedInName" class="p-4 border-b border-theme-40 dark:border-dark-3"> <div class="font-medium">Hi '+user_name.charAt(0).toUpperCase() + user_name.slice(1)+'</div> </div>';
            // login Menu list
            liContentData+='<div class="p-2"> <a href="/dashboard/events"  onclick="window.location.href=\'/dashboard/events\'" class="flex items-center block p-2 transition duration-300 ease-in-out hover:bg-theme-1 dark:hover:bg-dark-3 rounded-md"> <i data-feather="calendar" class="w-4 h-4 mr-2"></i> Calendar </a> <a href="/dashboard/connections"  onclick="window.location.href=\'/dashboard/connections\'" class="flex items-center block p-2 transition duration-300 ease-in-out hover:bg-theme-1 dark:hover:bg-dark-3 rounded-md conCount"> <i data-feather="users" class="w-4 h-4 mr-2"></i> Connections </a> <a href="/dashboard/messages"  onclick="window.location.href=\'/dashboard/messages\'" class="flex items-center block p-2 transition duration-300 ease-in-out hover:bg-theme-1 dark:hover:bg-dark-3 rounded-md msgCount"> <i data-feather="message-square" class="w-4 h-4 mr-2"></i> Messages </a> <a href="/dashboard/edit"  onclick="window.location.href=\'/dashboard/edit\'" class="flex items-center block p-2 transition duration-300 ease-in-out hover:bg-theme-1 dark:hover:bg-dark-3 rounded-md"> <i data-feather="edit" class="w-4 h-4 mr-2"></i> Profile & Settings</a> </div>';
            // login logout button
            liContentData+='<div class="p-2 border-t border-theme-40 dark:border-dark-3"> <a href="/user/flush" class="flex items-center block p-2 transition duration-300 ease-in-out hover:bg-theme-1 dark:hover:bg-dark-3 rounded-md" onclick="flush_reload();"> <i data-feather="log-out" class="w-4 h-4 mr-2"></i> Logout </a> </div>';
            // login div end
            liContentData+='</div> </div>';
            html=liContentData;
    }
    else{
        liContentData='<li><a href="/dashboard/recommendations" onclick="customEventGA(\'Event_Recommendation\',\'Header\',\'Dropdown\',\'\');">Events</a></li><li><a href="/dashboard/events">Calendar</a></li><li><a href="/dashboard/connections" class="conCount">Connections</a></li><li><a href="/dashboard/messages" class="msgCount">Messages</a></li><li><a href="/dashboard/edit">Settings</a></li><li><a href="/dashboard/preferences">Account Settings</a></li>';
        let separatorHtml='<li role="separator" class="divider">';
        html='<a class="dropdown-toggle" href="javascript:void(0);" role="button" data-toggle="dropdown" aria-label="menu-bar" aria-haspopup="true" aria-expanded="true"><i class="fa fa-bars"></i></a><ul class="dropdown-menu dropdown-menu-right right-0 p_2"><li id="loggedInName"><a href="javascript:void(0);"><strong>Hi '+user_name.charAt(0).toUpperCase() + user_name.slice(1) +'</strong></a></li>'+liContentData+'</li>'+(user.country.id==='IN' && pageType !== 'homepage' ? '<li><a target="_blank" href="https://10times.com/career">Career at 10times</a></li>' : '')+'<li><a href="/app">Download App <i class="fa fa-apple"></i><i class="fa fa-android"></i></a></li><li><a href="/user/flush" onclick="flush_reload()">Logout</a></li></ul>';
    }
    return html;
}

/* start visitor tag*/
function changeTag(I,tagIndex){
    $(I).parent().children('a:eq('+tagIndex+')').text('') ;
    $("#search2").val($(I).parent().children('a').text());

    var flag = 0 ;
    if($('#attends').hasClass('btn-primary'))
        flag = 1 ;
    else if($('#follows').hasClass('btn-primary'))
        flag = 2 ;
    if(flag > 0 )
        visitor_search('',flag);
    else if(($(I).parent().children('a').text()).trim() != "" )
        visitor_search('',flag);
    else if(($(I).parent().children('a').text()).trim() == "" )
        location.reload();
    $(I).parent().children('a:eq('+tagIndex+')').remove() ;
}
/* end visitor tag*/

function gaEvent(gaCategory, gaAction) {
    //console.log(gaCategory+" "+gaAction);
    dataLayer.push( {'event': 'gaEvent',
      'gaCategory': gaCategory,
      'gaAction':  gaAction} );
}

function customEventGA(customEventCategory, customEventAction, customEventLabel,customNonInteractive) {
    //custom Non Interactive
    if(!customNonInteractive) {
        customNonInteractive=0;
    }
    // if(!$.inArray({'event': 'customEventGA',
    //   'customEventCategory': customEventCategory,
    //   'customEventAction': customEventAction,
    //   'customEventLabel': customEventLabel,
    //   'eventNonInteractive' : customNonInteractive }, dataLayer)){
    dataLayer.push( {'event': 'customEventGA',
      'customEventCategory': customEventCategory,
      'customEventAction': customEventAction,
      'customEventLabel': customEventLabel,
      'eventNonInteractive' : customNonInteractive });
    // }
}
function gaUserPing(userIdentity, notificationEnabled, locationEnabled, userType) {

    if(typeof userIdentity!= 'undefined'){     
        switch(userIdentity) {
            case 0:
                userIdentity = "Anonymous";
                break;
            case 1:
                userIdentity = "Identified";
                break;
            case 2:
                userIdentity = "Unverified";
                break;
            case 3:
                userIdentity = "Verified";
                break;
            case 5:
                userIdentity = "Basic";
                break;
            case 7:
                userIdentity = "Enhanced";
                break;
            case 10:
                userIdentity = "Pro";
                break;
        }
    }

    dataLayer.push( {'event': 'gaUserPing',
      'User Identity': userIdentity,
      'User Type':  userType,
      'Notification Enabled':  notificationEnabled,
      'Location Enabled':  locationEnabled} );

}

function pingUser(data,uType){
    if(typeof data!='undefined' && typeof uType!='undefined' && data=="" && parseInt(uType)==3){
        data={
            status:1,
            userData:{
                verified:1,
                profileComplete:1,
                userExists:1
            }
        }
    }
    if(data.status==1 && typeof data.userData != 'undefined') {
        var userIdentity=1;

        if(typeof uType != 'undefined' && !isNaN(uType)){
            userIdentity=parseInt(uType);   
        }
        else if(data.userData.verified && data.userData.profileComplete){
            userIdentity=5;
        }

        if(getCookie('user_flag')=="1"){
            userIdentity=2;   
        }

        var oldUserIdentity="",oldNotifUser="",oldLocationUser="",oldUserType="";

        if(getCookie('10T_ping')!=""){
            var splitPing=getCookie('10T_ping').split("#$");
            if(typeof splitPing!='undefined'){
                oldUserIdentity=(typeof splitPing[0] != 'undefined')?splitPing[0]:"";
                oldNotifUser=(typeof splitPing[1] != 'undefined')?splitPing[1]:"";
                oldLocationUser=(typeof splitPing[2] != 'undefined')?splitPing[2]:"";
                oldUserType=(typeof splitPing[3] != 'undefined')?splitPing[3]:"";
            }
        }
        
        var locationUser=getLocationStatus();
        var notifUser=getLocationStatus();
        var userType="";
        if(data.userData.userExists==1)
            userType="Returning User";
        else
            userType="New User";

        if(oldUserIdentity!="" && (parseInt(oldUserIdentity) == 1 || parseInt(oldUserIdentity) == 2) && typeof uType=='undefined' && oldUserIdentity < userIdentity){
             userIdentity=2 ;
        }
        if(getCookie('10T_ping')==""){
            if(userType!=""){
                document.cookie ="10T_ping="+userIdentity+"#$"+notifUser+"#$"+locationUser+"#$"+userType+' Secure';
                gaUserPing(userIdentity,notifUser,locationUser,userType);
                notifCountAsyc('upgrade_user');
            }
            else{
                document.cookie ="10T_ping="+userIdentity+"#$"+notifUser+"#$"+locationUser+' Secure';
                gaUserPing(userIdentity,notifUser,locationUser);
                notifCountAsyc();
            }     
        }
        else if(getCookie('10T_ping')!="" && oldUserIdentity!="" && oldUserIdentity < userIdentity){
            if(oldUserType != ""){
                document.cookie ="10T_ping="+userIdentity+"#$"+notifUser+"#$"+locationUser+"#$"+oldUserType+' Secure';
                gaUserPing(userIdentity,notifUser,locationUser,oldUserType);
            }
            else{
                document.cookie ="10T_ping="+userIdentity+"#$"+notifUser+"#$"+locationUser+"#$"+userType+' Secure';
                gaUserPing(userIdentity,notifUser,locationUser,userType);
            }
            notifCountAsyc('upgrade_user');
        }
        

    }
}

function notifCountAsyc(da){
getLoggedInDataN();
    // $.getJSON(site_url+"/async/user/notification?for=count",function(n) {
    //             if(typeof n != 'undefined' && n.status==1){
    //                 result=n.data;
    //                 var ntfsCount=0;
    //                 ntfsCount=(typeof result != 'undefined' && result.hasOwnProperty('notificationCount'))?result.notificationCount:0;
    //                 getLoggedInDataN();
    //                 if(!ntfsCount){
    //                     $('.notif').hide();
    //                     $('.notif-t').hide();
    //                     $('#notificationBell').find('i').removeClass('text-orange');
    //                     document.cookie ="10T_ntfs=0-f";
    //                 }
    //                 else{
    //                     if(getCookie('10T_ping')=="" || getCookie('10T_ntfs')==""){
    //                         document.cookie ="10T_ntfs="+ntfsCount+"-t";
    //                         $('.notif').text(ntfsCount);
    //                         $('.notif').show();
    //                         $('.notif-t').text(ntfsCount);
    //                         $('.notif-t').show();
    //                         $('#notificationBell').find('i').addClass('text-orange');
    //                     }
    //                     else{
    //                         if(typeof da!='undefined' && da=='upgrade_user'){
    //                             document.cookie ="10T_ntfs="+ntfsCount+"-t";
    //                             $('.notif').text(ntfsCount);
    //                             $('.notif').show();
    //                             $('.notif-t').text(ntfsCount);
    //                             $('.notif-t').show();
    //                             $('#notificationBell').find('i').addClass('text-orange');
    //                         }
    //                         else{
    //                             var splitNotif=getCookie('10T_ntfs').split("-");
    //                             if(typeof splitNotif != 'undefined' && splitNotif.length == 2 ){
    //                                 if(splitNotif[0]!=ntfsCount){
    //                                 document.cookie ="10T_ntfs="+ntfsCount+"-t";
    //                                 $('.notif').text(ntfsCount);
    //                                 $('.notif').show();
    //                                 $('.notif-t').text(ntfsCount);
    //                                 $('.notif-t').show();
    //                                 $('#notificationBell').find('i').addClass('text-orange');
    //                                 }
    //                                 else{
    //                                     $('.notif').hide();
    //                                     $('.notif-t').hide();
    //                                     $('#notificationBell').find('i').removeClass('text-orange');
    //                                 }
    //                             }
    //                             else{
    //                                     document.cookie ="10T_ntfs="+ntfsCount+"-f";
    //                                     $('.notif').hide();   
    //                                     $('.notif-t').hide();
    //                                     $('#notificationBell').find('i').removeClass('text-orange');   
    //                                 }
    //                         }   
    //                     }
    //                 }
    //             } 
    //         }
    //     );
}

function getUrlVars() {
var vars = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
vars[key] = value;
});
return vars;
}

function addLoadEvent(func) {
 var oldonload = window.onload;
 if (typeof window.onload != 'function') {
    window.onload = func;
 } else {
    window.onload = function() {
    if (oldonload) {
      oldonload();
    }
    func();
   }
 }
}  
/* ready function */

var j, clientId = '157995346313-0m2fg2khsl59rip48jjgujscoek2ic1t.apps.googleusercontent.com',
    firebaseAPIKey = "AIzaSyA-TIrf33jBgCtyGPUJWVZf68DeBfSo8RU",
    apiKey = "AIzaSyDredEiagQw94Uid02gzXGk59lziUapMeU",
    scopes = "https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/userinfo.profile  https://www.googleapis.com/auth/userinfo.email",
    modal_content = "",
    gmailfriends1 = [],
    gmailfriends2 = "",
    flag = 0,
    auth_data = [],
    gmailname1 = [],
    gmailname2 = "";

var login10times='';
switch (window.location.hostname) {
    case "10times.com":
        login10times = window.location.protocol+"//login.10times.com";
        break;
    case "local.10times.com":
        login10times = window.location.protocol+"//local-login.10times.com/app.php";
        break;
    case "dev.10times.com":
        login10times = window.location.protocol+"//dev-login.10times.com";
        break;
    case "stg.10times.com":
        login10times = window.location.protocol+"//stg-login.10times.com";
        break;
    default:
        login10times = window.location.protocol+"//"+window.location.hostname;
} 
var hash='';
function manageEventLink(source,has) {
    customEventGA("Organizer Action", "Edit Event", pageType);
    if(typeof has != 'undefined' && has != ""  && has != null)
        hash=has;
    var  b ={user: getCookie("user"), user_token: getCookie("user_token")};
    showloading();
    $.post(site_url_attend + "/user/verify_user", b, function(d) {
        hideloading();
        if(d=='verfied'){
            $('#TenTimes-Modal').modal('hide');
            //showloading();
            var page_type=$('#pageType').val();
            if(source=='myEventsLink'){
                window.location.assign(login10times+"?from=email&utm_source="+page_type+"&utm_campaign=web_to_odash&path=my_events&hash="+hash);
            }
            else if(typeof page_type!=='undefined' && page_type!="" && page_type == "org_detail")
                window.location.assign(login10times+"?from=email&utm_source="+page_type+"&utm_campaign=web_to_odash&hash="+hash);
            else if (typeof page_type!=='undefined' && page_type!="" && (page_type == "about" || page_type == "visitors" || page_type == "exhibitors" || page_type == "comments" || page_type == "photos-videos" || page_type == "speakers" || page_type == "deals")){
                var landing="";
                switch(source){
                    case "fact_figure": landing="fact_figure";
                                        break;
                    case "fees":        landing="fees";
                                        break;
                    case "myprofile":   landing="myprofile";
                                        break;
                    case "visitors":    landing="attend_register";
                                        break;
                    case "exhibitors":  landing="exhibitors";
                                        break;
                    default:            landing="event_overview";
                                        break;

                }
                // window.location.assign(login10times+"?from=email&utm_source="+page_type+"&utm_campaign=web_to_odash&path="+landing+"&hash="+hash);
                window.open(login10times+"?from=email&utm_source="+page_type+"&utm_campaign=web_to_odash&path="+landing+"&hash="+hash, '_blank');
            }
        }else if(d=='unverfied'){
            if($('#modalData').html() == "")
                $('#modalData').html(getModal());

            $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
            $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
            $('#TenTimes-Modal .modal-title').html('Verify your email');
            $('#TenTimes-Modal .modal-body').html('<div class="row"> <div class="col-md-12 col-sm-12 material-form"> <form > <div class=""> <div class="form-group rel-position"> <input type="password" placeholder="Enter Password" id="userPassword"><span class="undrr"></span><span class="ico fa-lock"></span><p class="text-danger alert_password"></p></div></div><button type="button" class="btn btn-lg btn-orange btn-block" onclick="return verifyCredential('+"'"+source+"'"+');">Submit</button> </form> <a><h5 class="text-center" style="cursor:pointer" id="getpassword" onclick="getPassword(1,'+"'"+source+"'"+');" >Forgot Password</h5></a></div></div>');
            $('#TenTimes-Modal').modal('show');
            doNotReferesh();
        }else{
            alert("Sorry there was an error in the system.");
        }
     })
}
function ResumeSubmit(){
    showloading();
    var B = validateFormData('career'),
        F = fileTypeCheck();
    if (!B || !F) {
        hideloading();
        return false
    } else {
        var data = new FormData($('form#TenTimes-Upload')[0]);
        data.append('position',candidateProfile);
        $.ajax({
            url: site_url_attend+'/ajax/savefile',
            type: 'POST',
            data: data,
            processData: false,
            contentType: false,
            success: function(data, textStatus, jqXHR)
            {
                if(typeof data.error === 'undefined')
                {
                    var res= JSON.parse(data);
                    var mail_dt={
                        fileurl:res.path,
                        position: candidateProfile,
                    };
                    $.ajax({
                        type: "POST",
                        url: site_url+'/ajax/sendmail',
                        data: {'for': 'applyForPost','data': mail_dt },
                        success: function(a) 
                        {
                            // console.log(a);
                        },
                        error: function(a){
                            // console.log(a);
                        },
                    });

                    // Success so call function to process the form
                    if(res.status==1){
                    var data = {
                        name: $("#TenTimes-Modal #userName").val(),
                        city: $("#TenTimes-Modal #userCity").val(),
                        place_id: $("#TenTimes-Modal #place_id").val(),
                        country: $("#TenTimes-Modal #userCountry").val(),
                        email: $("#TenTimes-Modal #userEmail").val(),
                        phone: $("#TenTimes-Modal #userMobile").val(),
                        source: 'inbound',
                        accmgr: 13470159,
                        // description: 'Resume :<br><a href='+res.path+' target="_blank">'+res.path+'</a>',
                        subject: 'Candidate - '+candidateProfile,
                        action:'leads',
                        position: candidateProfile,
                        product: 'HR',
                        resumeUrl: res.path,
                    };
                    if(typeof $("#TenTimes-Modal #userReason").val()!=="undefined" && $("#TenTimes-Modal #userReason").val()!=''){
                        data['description']=$("#TenTimes-Modal #userReason").val();
                    }
                    hitAuth(data,'inbound','inbound','',null);
                    }else{
                        showToast(res.message);
                    }
                }
                else
                {
                    // Handle errors here
                    console.log('ERRORS: ' + data.error);
                }
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
                // Handle errors here
                console.log('ERRORS: ' + textStatus);
                // STOP LOADING SPINNER
            }
        });
    }
}
function fileTypeCheck(){
    var ret=true;
    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
       if ($('#userResume')[0].files.length<1) {
           showToast("Please upload your resume");
           ret=false;
       }else{
            var fsize = $('#userResume')[0].files[0].size; //get file size
            var ftype = $('#userResume')[0].files[0].type; // get file type
            //allow file types 
            switch(ftype)
            {
                case '.doc':
                case '.docx':
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                case 'application/msword':
                case 'application/pdf':
                break;
                default:
                $("#output").html("<b>"+ftype+"</b> Unsupported file type!");
                // showToast('Please upload the required file format');
                $('.alert_resume').html('Please upload the file in required format');
                ret=false;
            }

            //Allowed file size is less than 5 MB (1048576 = 1 mb)
                if(fsize>2097152) 
                {
                    // showToast("<b>"+fsize +"</b> Too big file! <br />File is too big, it should be less than 5 MB.");
                    $('.alert_resume').html("<b>"+(fsize/1048576).toFixed(1) +" MB</b><br />File is too big, it should be less than 2 MB.");
                ret=false;
                }
            }
        }
        else
    {
       //Error for older unsupported browsers that doesn't support HTML5 File API
       showToast("Please upgrade your browser, because your current browser lacks some new features we need!");
           ret=false;
    }
    return ret;
}
function ResumeSubmitResponse(result){
    hideloading();
    if (result.status.code==1) {
        $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
        $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
        $('#TenTimes-Modal .modal-body').addClass('pd-0').html('');
        $('#TenTimes-Modal .modal-header').html('<button type="button" class="close" data-dismiss="modal">×</button><h4>Thank you for showing your interest in working with 10times<br>We will reach out to you shortly.</h4>');
    }else{
        $('#TenTimes-Modal').modal('hide');
        showToast("Something went wrong!!!");
    }
}
var candidateProfile = '';    
$(".modalopen").click(function() {
    var basebtn='';
    if(deviceFlag==0){
        basebtn='<div class="form-group rel-position"><div class="col-md-8 col-xs-12 pd-0"><span class="name_resume btn-block mg-0">No file selected...</span><label for="userResume" style="font-weight: normal;" class="btn-block text-center"><span class="btn x-na btn-primary btn-block">Upload Resume</span> (Only .pdf,.doc and .docx file)</label><span class="text-danger alert_resume btn-block text-center"></span><input name="file" id="userResume" type="file" style="display:none;" accept="application/pdf, .doc, .docx"></div><div class="col-md-4 col-xs-12 pd-0 text-right"><br><button type="button" class="btn btn-orange x-na btn-block" onclick="ResumeSubmit()">Submit</button></div> </div>';
    }else{
        basebtn='<div class="form-group rel-position"><div class="col-md-8 pd-0"><label for="userResume" style="font-weight: normal;"><span class="btn x-na btn-primary">Upload Resume</span> (Only .pdf,.doc and .docx file)</label><span class="name_resume btn-block mg-0">No file selected...</span><span class="text-danger alert_resume btn-block mg-0"></span><input name="file" id="userResume" type="file" style="display:none;" accept="application/pdf, .doc, .docx"></div><div class="col-md-4 pd-0 text-right"><button type="button" class="btn btn-orange x-na" onclick="ResumeSubmit()" style="width: 70%;">Submit</button></div> </div>';
    }
    $('#TenTimes-Modal').html('<div class="modal-dialog"><!-- Modal content--><div class="modal-content"><div class="modal-header text-center"><button type="button" class="close" data-dismiss="modal">×</button><h3 class="modal-title" id="myModalLabel">Submit Your Details</h3></div><div class="modal-body tentimes-form"><div class="row"><div id="vCardDiv"></div><div class="col-md-12 col-sm-12 col-xs-12 material-form"><h4 id="subTitle"></h4><form id="TenTimes-Upload"><div class="form-group rel-position"><input type="text" placeholder="Name" id="userName"> <span class="undrr"></span> <span class="ico fa-user"></span> <span class="text-danger alert_name "></span></div><div class="form-group rel-position"><input type="email" placeholder="Email" id="userEmail"> <span class="undrr"></span> <span class="ico fa-envelope"></span> <span class="text-danger alert_email "></span></div><input id="userCountry" class="user_country" value="IN" type="hidden"><input id="countryCode" class="user_country_code" value="IN" type="hidden"><input id="cityCode" class="city_code" value="" type="hidden"><input id="place_id" class="" value="" type="hidden"><div class="form-group rel-position"> <input type="text" placeholder="Your City (Start typing to see option... )" id="userCity" class="user_city city_name" autocomplete="off"> <span class="undrr"></span><span class="ico fa-map-marker"></span> <span class="text-danger alert_city"></span></div><div class="form-group rel-position"><input type="text" placeholder="Phone" id="userMobile"> <span class="undrr"></span> <span class="ico fa-phone"></span> <span class="text-danger alert_mobile "></span></div><div class="form-group rel-position"><textarea type="text" placeholder="Why do you want to join 10times?" id="userReason"></textarea> <span class="undrr"></span>  <span class="text-danger alert_reason"></span></div>'+basebtn+'</form></div></div></div><center><p class="lead message"></p><center></center></center></div></div>');
    candidateProfile = $(this).parent().find('h2').text();
    postFormOpenSettings();
    $('#userResume').click(function(){
        $('.alert_resume').html('');
    });
    $('#userResume').on("change paste keyup", function() {
        if($('#userResume')[0].files.length<1)
            $('.name_resume').html('No file selected...');
        else
            $('.name_resume').html($('#userResume')[0].files[0].name);
    });
});
var currentTop=$(document).scrollTop();
var userConsentFlag=0;
function cookieConsent(){
    if(document.getElementById("consent-label"))
        document.getElementById("consent-label").remove();
    var closeBtn='';
    if (deviceFlag!=0)
        closeBtn='<span onclick="userConsent(3000)" style="float:right;"><i class="fa fa-times fa-fw" style="font-size: 20px;-webkit-text-stroke: 0.1em #fff;color: #777;"></i></span>';    
    consent_label='<div id="consent-label" class="ck-cst-lbl" style="z-index:10000;">'+closeBtn+'By using 10times you agree to our Cookies use. We use them to enhance your browsing experience.</div>';
    $('body').append(consent_label);
    setTimeout(function(){
        $('.barfixed').css('bottom',$('#consent-label').outerHeight()+'px');
        $('#consent-label').css('z-index','');
    },400);
    // if (deviceFlag==0){
        $(window).scroll(function(){
            if(deviceFlag==0 || userConsentFlag==0){
                if($(document).scrollTop()>(currentTop-$(window).height()) && $(document).scrollTop()<(currentTop+$(window).height())){
                    $('#consent-label').fadeIn(400, function(){
                        $('.barfixed').css('bottom',$('#consent-label').outerHeight()+'px');
                    });
                }else{
                    currentTop= 0-($(window).height());
                    if(deviceFlag==0){
                        $('#consent-label').fadeOut(400,function(){
                            $('.barfixed').css('bottom','');
                        });
                    }else{
                        $('#consent-label').fadeOut("slow");
                        if(userConsentFlag ==0){
                            userConsent(2000);
                            userConsentFlag++;
                        }
                    }
                }
            }
        });
        $('.barfixed').css('bottom',$('#consent-label').outerHeight()+'px');
    // }
    // setTimeout(function(){
    //     if(deviceFlag==0){
            // $('#consent-label').fadeOut(400,function(){
            //     if(document.getElementById("consent-label"))
            //         document.getElementById("consent-label").remove();
            //     $('.barfixed').css('bottom','');
            // });
    //     }
    //     else
    //         userConsent(2000);
    // },6000);
}
function userConsent(wait){
    if(typeof wait=="undefined" || wait<1)
        wait=0;
    if(document.getElementById("consent-label"))
        document.getElementById("consent-label").remove();
    if (deviceFlag==0) {
    consent_label='<div id="consent-label" class="cst-lbl" style="z-index:10000;"><table><tbody><tr><td>We have updated our Terms of Service and Privacy Policy. <a href="https://10times.com/privacy-policy"><u>Learn more</u></a></td><td><button onclick="consentup(10);" class="btn btn-primary" style="padding: 5px;">Got it</button></td></tr></tbody></table></div>';

    }else{
        consent_label='<div id="consent-label" class="cst-lbl" style="z-index:10000;">We have updated our Terms of Service and Privacy Policy, effective May 25, 2018. <a href="https://10times.com/privacy-policy"><u>Learn more</u></a><button onclick="consentup(10);" class="btn btn-primary" style="margin-left: 20px;">Got it</button></div>';
    }
    setTimeout(function(){
        $('body').append(consent_label);
        $('#consent-label').fadeOut(0);
        $('#consent-label').fadeIn(500);
        $('.barfixed').css('bottom',$('#consent-label').outerHeight()+'px');
        $('#consent-label').css('z-index','');
    },wait);
    if (deviceFlag==0){
        $(window).scroll(function(){
            if($(document).scrollTop()>(currentTop-($(window).height()/2)) && $(document).scrollTop()<(currentTop+($(window).height()/2))){
                $('#consent-label').fadeIn(400, function(){
                    $('.barfixed').css('bottom',$('#consent-label').outerHeight()+'px');
                });
            }else{
                currentTop=0-($(window).height());
                $('#consent-label').fadeOut(400,function(){
                    $('.barfixed').css('bottom','');
                });
            }
        });
    }
}
var csntCon=[/*'IN',*/'LI','IS','NO','UK','SE','ES','SI','SK','RO','PT','PL','NL','MT','LU','LT','LV','IT','IE','HU','GR','DE','FR','FI','EE','DK','CZ','CY','HR','BG','BE','AT'];
function googleAds(nonPersonalizedFlag){
    $('.adsbygoogle').each(function(){
        if($(this).siblings('script').length==0){
            var script = '<script>';
            if($(this).attr('data-r')==2)
                script+='function firstFunction(){';
            if($(this).attr('data-r')==3)
                script+='function secondFunction(){';
            
            script+='(adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds='+nonPersonalizedFlag+';adsbygoogle.push({});';
            if($(this).attr('data-r')==2 || $(this).attr('data-r')==3)
                script+='}';
            if($(this).attr('data-r')==2)
                script+='firstFunction();';
            if($(this).attr('data-r')==3)
                script+='secondFunction();';
            script+='</script>';
            $(this).after(script);
        }
    });
    
    $('.gpt').each(function(){
        if($(this).has('script').length==0){
            var gpt='<script type="text/javascript">googletag.cmd.push(function() {',width = document.documentElement.clientWidth,size,
                setTarget='',
                gptdisplay=$(this).attr('id');

            if(typeof $(this).attr('data-tgt') !== "undefined" && $(this).attr('data-tgt')!='')
                setTarget = $(this).attr('data-tgt');
            else if(typeof $(this).attr('dt-tgt') !== "undefined" && $(this).attr('dt-tgt')!='')
                setTarget = $(this).attr('dt-tgt');
            
            if(typeof setTarget ==="undefined"){
                setTarget=location.pathname.split('/').join('-');
                if(setTarget[0]=='-')
                    setTarget=setTarget.substring(1);
            }
            if($(this).hasClass('dc-125')){
                size = '[125, 125]';
            }else if($(this).hasClass('dc-100')){
                size = '[100, 100]';
            }else if($(this).hasClass('dc-180')){
                size = '[180, 150]';
            }else if($(this).hasClass('dc-150')){
                size = '[150, 150]';
            }else if($(this).hasClass('dc-260')){
                size = '[260, 100]';
            }else if($(this).hasClass('dc-600')){
                size = '[600, 72]';
            }else{
                if (width > 1024){ 
                    size = '[336, 280]'; // smartphones
                }
                else {  
                  size = '[250, 250]'; // desktops and tablets
                }
            }
            var npa='';
            if(nonPersonalizedFlag==1)
                npa='.setRequestNonPersonalizedAds(1)';
            gpt+='googletag.defineSlot(\'/1086319/NewBTS_Default_Right_Top_336_280\','+size+', \''+gptdisplay+'\').addService(googletag.pubads()'+npa+').setTargeting("INDEX", "'+setTarget+'");googletag.enableServices();googletag.display(\''+gptdisplay+'\')});</script>';
            $(this).append(gpt);            
        }
    });
}

 $(function() {
(function($) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    $.fn.attrchange = function(callback) {
        if (MutationObserver) {
            var options = {
                subtree: false,
                attributes: true
            };

            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(e) {
                    callback.call(e.target, e.attributeName);
                });
            });

            return this.each(function() {
                observer.observe(this, options);
            });

        }
    }
})(jQuery);

//Now you need to append event listener
if(typeof attrchange=='function'){
$('.sidebar').attrchange(function(attrName) {

    if(attrName=='class'){
            if($('.sidebar-open').is(':visible'))
     {
      $.scrollLock(true);
      $('#TenTimes-Modal').modal('hide')
       // $('body').addClass("fixedPosition");
     }
     else
     {
      $.scrollLock(false);
        //$('body').removeClass("fixedPosition");
     }
    }
});
}

});


    $('.sidebar').on('click',function(){$('.click1').click()});
      
    $.scrollLock = ( function scrollLockClosure() {
    'use strict';
    var $html = $( 'html' ),
    locked = false,
    prevScroll = {
        scrollLeft : $( window ).scrollLeft(),
        scrollTop  : $( window ).scrollTop()
    },
    prevStyles = {},
    lockStyles = {
        'overflow-y' : 'scroll',
        'position'   : 'fixed',
        'width'      : '100%'
    };
    saveStyles();
    function saveStyles() {
        var styleAttr = $html.attr( 'style' ),
            styleStrs = [],
            styleHash = {};

        if( !styleAttr ){
            return;
        }

        styleStrs = styleAttr.split( /;\s/ );

        $.each( styleStrs, function serializeStyleProp( styleString ){
            if( !styleString ) {
                return;
            }

            var keyValue = styleString.split( /\s:\s/ );

            if( keyValue.length < 2 ) {
                return;
            }

            styleHash[ keyValue[ 0 ] ] = keyValue[ 1 ];
        } );

        $.extend( prevStyles, styleHash );
    }

    function lock() {
        var appliedLock = {};

        // Duplicate execution will break DOM statefulness
        if( locked ) {
            return;
        }

        // Save scroll state...
        prevScroll = {
            scrollLeft : $( window ).scrollLeft(),
            scrollTop  : $( window ).scrollTop()
        };

        // ...and styles
        saveStyles();

        // Compose our applied CSS
        $.extend( appliedLock, lockStyles, {
            // And apply scroll state as styles
            'left' : - prevScroll.scrollLeft + 'px',
            'top'  : - prevScroll.scrollTop  + 'px'
        } );

        // Then lock styles...
        $html.css( appliedLock );

        // ...and scroll state
        $( window )
            .scrollLeft( 0 )
            .scrollTop( 0 );

        locked = true;
    }

    function unlock() {
        // Duplicate execution will break DOM statefulness
        if( !locked ) {
            return;
        }

        // Revert styles
        $html.attr( 'style', $( '<x>' ).css( prevStyles ).attr( 'style' ) || '' );

        // Revert scroll values
        $( window )
            .scrollLeft( prevScroll.scrollLeft )
            .scrollTop(  prevScroll.scrollTop );

        locked = false;
    }

    return function scrollLock( on ) {
        // If an argument is passed, lock or unlock depending on truthiness
        if( arguments.length ) {
            if( on ) {
                lock();
            }
            else {
                unlock();
            }
        }
        // Otherwise, toggle
        else {
            if( locked ){
                unlock();
            }
            else {
                lock();
            }
        }
    };
}() );

function stripHtml(html){
    // Create a new div element
    var temporalDivElement = document.createElement("div");
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = html;
    // Retrieve the text property of the element (cross-browser support)
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
}
// function offlineAction(){
//     var offlineLayer = document.createElement('div');
//     offlineLayer.classList.add('offline');
    
//     document.body.appendChild(offlineLayer);
//     document.querySelector('.offline').addEventListener('click', function(){
//         setTimeout(function(){ 
//             document.getElementById('modalData').innerHTML='<div class="modal fade in" id="TenTimes-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" style="display: block;z-index: 1000000;"><div class="modal-dialog" role="document" style="top: 30%;"><div class="modal-content modal-primary"><div class="modal-header text-center"><button type="button" id="_modal_close" class="close" data-dismiss="modal" aria-label="Close" style="position:  absolute;right: 10px;top: 5px;"><span aria-hidden="true">×</span></button><h4 class="modal-title" id="myModalLabel">Seems that you are offline :(</h4></div><div class="modal-body text-center">Try reloading this page when network is back on.</div></div></div></div>';
//             document.querySelector("#modalData").querySelector('.close').addEventListener('click', function(){
//                 setTimeout(function(){
//                     document.getElementById('modalData').innerHTML='';
//                 },200);
//             });
//         }, 200);
//     });
// }
// addLoadEvent(function(){
//     if (!navigator.onLine) {
//         offlineAction();
//     }
// })
// window.addEventListener('offline', function(e) { offlineAction() });
// window.addEventListener('online', function(e) { location.reload() });
$(document).ready(function() {
    if($("#pageCategory").val() != "Event") {
        if((getCookie('user') && getCookie('user') != "")) {
            window._CTZ = {
                extra: {
                    userid: getCookie('user')
                }
            }
        }    
    }
    else {
        if(!getCookie('user') || getCookie('user') == "") {
            window._CTZ = {
                extra: {
                    eventid: $("#eventID").val()
                }
            }
        }
    }
});
function callGaEvent(source ,callback) {
    var customPageType = "";
    if($("#pageType").length > 0) {
        customPageType = $("#pageType").val();
    } 
    if(customPageType == 'org_detail') {
        customPageType = "Company";
    }
    else if(customPageType == "venue_detail") {
        customPageType = "Venue";
    }
    else if(customPageType == "listing" || customPageType == "Event Listing"){
        customPageType = "Event Listing";
    }
    else {
        customPageType = "Event";   
    }
    if(callback) {
        if(callback.search('website') > -1 || callback.search('contact') > -1) {
            source = "bookmark";    
        }
        else if(callback.search('ticket') > -1) {
            source = "ticket";   
        }
        else if(callback.search('app') > -1) {
            source = "app";   
        }   
    }
    if(source == 'bookmark' || source == "follow")
        source='Follow';
    else if(source == 'interest')
        source='Interested';
    else if(source == 'going')
        source='Going';
    else if(source == 'stall_attend')
        source='Enquiry';
    else if(source == 'share')
        source='Non Lead 2';
    else if(source == 'connect')
        source='Non Lead 1';
    else if(source == 'speaker')
        source='Non Lead 1';
    else if(source == 'enquiry')
        source='Enquiry';
    else if(source == 'ticket') {
        customEventGA(customPageType ,"Non Lead 2","Buy Ticket | Visitor Ticket Price" );
        return true;
    }
    else if(source == 'hotel') {
        customEventGA(customPageType ,"Non Lead 1","More Hotels" );   
        return true;
    }
    else if(source == 'app') {
        customEventGA(customPageType ,"Non Lead 2","App Links" );
        return true;
    }
    else if(source == 'map') {
        customEventGA(customPageType ,"Non Lead 1","Get Direction | Venue Block" );
        return true;
    }
    else if(source == 'direction') {
       customEventGA("Venue" ,"Non Lead 1","Get Direction | Top Banner" );
        return true;
    }
    if(customPageType == 'Event Listing' && source.search("Bookmark") > -1 || source.search("Follow") > -1 || source.search("Interested") > -1 ){
   }else{
       gaEvent(customPageType,source);
   }
    return true;
}
$(document).ready(function(){
    getDynamicStatus();
    if(window.location.pathname==="/venues"){
        let venueAutoCompleteurl ="/js/10t_venueautocomplete.js";
        if(window.location.host != "10times.com")
            venueAutoCompleteurl = window.location.protocol+"//"+window.location.host +venueAutoCompleteurl;
        else
            venueAutoCompleteurl = "https://c1.10times.com" + venueAutoCompleteurl;
        loadSyncedScript(venueAutoCompleteurl, function(){
            new VenueAutoComplete($("#venue_homepage_search"),true);    
        })   
    }
    if($('.breadcrumb>li>a').length>0){
    $('.breadcrumb>li>a').click(function (e) { 
        // e.preventDefault();
        customEventGA('Event Listing', 'Event Listing | Breadcrumb ','To '+$(this).attr('href').replace('/',' - ').capitalizeFirstLetter());
    });
    }
})
/*  Added By @Prateek Raj
**  Get Dynamic Status method:
**  In HTML please define a class named dynm-st, where you want to add the status
**  Mandatory attribute needed in that tags are:
**  sd(refers to start date),ed(refers to end date),st(refers to status),id(refers to event id)
**  This will apend in the end of the div in which class is defined.
**  Please make note : Only for event status Active, this will work.
*/
function getDynamicStatus(){
    let tags = $(".dynm-st");
    for(let count=0;count<tags.length;count++){
        let main_tag=$(tags[count]);
        if($(main_tag).find(".small").length==0 && (deviceType!="computer" && deviceType!=="venue_detail")){
            let status = getEventStatus(main_tag.data("sd"),main_tag.data("ed")); 
            if(status!== undefined){
                let class_list;
                if(status ==='ongoing' || status==='ending today'){
                    class_list ="onging text-success";
                }
                else{
                    class_list = "comming text-warning";
                }
                let span_tag =$(main_tag).append('<span class="small '+class_list+'">'+status+'</span>')
            }
        }else{
            let status = getEventStatus(main_tag.data("sd"),main_tag.data("ed"),main_tag.data("veri")); 
            if(status!== undefined){
                let classList;
                if(status ==='ongoing' || status==='ending today'){
                    classList= ["border-success","label-success"];
                }else{
                    classList= ["border-info","label-info"];
                }
                if(!$(main_tag).hasClass(classList[0])){
                    $(main_tag).addClass(classList[0])    
                }
                if($($(main_tag).find("td:eq(1)")).find("span.label").length==0){
                    $(main_tag).find("td:eq(1) h2").before('<span class="label '+classList[1]+'" style="font-size: x-small;">'+status.capitalizeFirstLetter()+'</span>')
                }
                if(!$(main_tag).hasClass("dynm-st")){
                    $(main_tag).removeClass("dynm-st")    
                }
            }
            
        }
    }
}
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}
/*  Added By @Prateek Raj
**  Get Event Status method:
**  Parameters: startdate(String) and enddate(String) 
**  This will return status string
*/
function getEventStatus(startdate,enddate,verifiedby){
    let ev_startDate= new Date(startdate).setHours(0, 0, 0, 0);
    let ev_endDate= new Date(enddate).setHours(0, 0, 0, 0);
    let ev_currentDate= new Date().setHours(0, 0, 0, 0);
    let ev_datediff_sc= new Date(new Date(startdate).setHours(0, 0, 0, 0)-new Date().setHours(0, 0, 0, 0))/1000/60/60/24;
    let status;
    let ev_fv_days_back = new Date();
    ev_fv_days_back.setDate(ev_fv_days_back.getDate()-5);
    ev_fv_days_back = ev_fv_days_back.setHours(0, 0, 0, 0);
    if(ev_startDate==ev_currentDate && ev_startDate==ev_endDate && verifiedby!=100){
        status ='ongoing';  
    }else if(ev_startDate<=ev_currentDate && ev_endDate>ev_currentDate && verifiedby!=100){
        status ='ongoing'; 
    }else if(ev_startDate<=ev_currentDate && ev_endDate==ev_currentDate && verifiedby!=100){
        status ='ending today'; 
    }else if(ev_startDate > ev_currentDate && verifiedby!=100){
        if(ev_datediff_sc==1){
            status='starting tomorrow';
        }else if(ev_datediff_sc>=2 && ev_datediff_sc<=6){
            status=ev_datediff_sc+' days to go';
        }
    }else if(ev_endDate >= ev_fv_days_back && ev_endDate<ev_currentDate){
        status= 'just got over';
    }
    return status;
}
$(document).on('keyup',function(evt) {
    if (evt.keyCode == 27 && pageType == 'about') {
       $('.modal-backdrop').remove();
    }
})
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};
var inviteModal=function(entityType,id,from)
{   
        showloading();
        var ismobile=$('#ismobile').val();
        var mob=0;
        var whatsapphtml='';
        var style='width:230px;';
        var img_size='';
        var html=[];
        var head='',invite='',ajaxUrl='';
        if(entityType=='' || typeof entityType=='undefined'){
            switch(pageType){
                case "listing":
                  var string_share = document.querySelector('h1').textContent.replaceAll('\n', '');
                  string_share = string_share.replace(/\s+/g,' ').trim();
                  string_share= encodeURIComponent(string_share.replace(' in ',' happening in ').replace(/  +/g, " ").trim());
                  ajaxUrl="&title="+string_share;
                 break;      
                 default:
                 break;
            }
            ajaxUrl+="&url="+encodeURIComponent(window.location.pathname);
        }else{
            ajaxUrl="&entityType="+entityType+"&id="+id;       
        }
        if(typeof from!='undefined' && from!='')
            ajaxUrl+='&from='+from;
        $.ajax({
        type: "GET",
        url: site_url_attend+"/ajax?for=inviteHtmldata"+ajaxUrl,
         success: function(result) {
                 var html=$.parseJSON(result);
                 $('#myModalinvite').html(html.invite);
                 if(pageType=='udash_recommendation' || pageType=='mdashRecommendation')
                    $('#email_invite').removeAttr('onfocus');
                 hideloading();
                 $('#myModalinvite').modal('show');

                }
        });   
}

function inviteRedirect(soctype,entityType,id,title,url){
    if(entityType==''){
        redirectUrl=site_url_attend+"/ajax/socialinvite?social="+soctype+"&pageType="+pageType+"&title="+title+"&url="+url;
    }else{
        redirectUrl=site_url_attend+"/ajax/socialinvite?social="+soctype+'&entity='+entityType+'&id='+id+"&pageType="+pageType;
    }
    
    window.open(redirectUrl,'_blank');                    
}

function loadSyncedScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

/*  From 10t_event_detail_desktop.js to 10t_common_new.js -- Start*/
var eventSlotTiming='';
var eventSlotTimingFlag=true;
function exhibitorconnectCallBack(result,exhibitorId,statusFlag,from,dis) {
    if(statusFlag ==1) {
        $("#connect-"+exhibitorId+".exhibitorConnect").attr('onclick','exhibitSchedule('+exhibitorId+')');
        if(page_type=='thankyou_new'){
            $("#connect-"+exhibitorId+".exhibitorConnect").removeClass('fa-check');
            $("#connect-"+exhibitorId+".exhibitorConnect").html("Select Time <i class='fa fa-edit' style='font-size:12px; transform:translateY(1px);'></i>");
        }else{
            $("#connect-"+exhibitorId+".exhibitorConnect").html("Select Time <i class='fa fa-edit'></i>");
        }
        // if($("#connect-"+exhibitorId+".exhibitorConnect").text().trim()=="Select Time" && pageType=="about")
        //     $("#connect-"+exhibitorId+".exhibitorConnect").next().css('margin-left','15%');

        if(result.hasOwnProperty("status")){
            exhibitSchedule(exhibitorId);
        }
    }
    $("#save-"+exhibitorId+".exhibitorSave").html("<i class='fa fa-check text-success'></i>  Followed").addClass('text-success');
    $("#save-"+exhibitorId+".exhibitorSave").removeAttr('onclick').addClass('disabled');
    $("#save-"+exhibitorId+".exhibitorSave").css({'opacity': '1','color': '#333'});
    $("#save-"+exhibitorId+".exhibitorSave i").css('color','#3c763d');

    if($(dis).parent().closest('div').siblings('div').find('.interestedContent').length>0)
    {
        var newCount=parseInt($(dis).parent().closest('div').siblings('div').find('.interestedContent .intrestNumbers').text().split(' ')[0])+1;
        var textString=newCount;
        if(newCount>=2)
            textString+=' Interested';

        $(dis).parent().closest('div').siblings('div').find('.interestedContent .intrestNumbers').text(textString);
    }
    else
    {
        if(result.hasOwnProperty("userData") && result.userData.id!=getCookie('user') && page_type=='exhibitors')
        $(dis).parent().closest('div').prev('hr').after('<div><div style="padding:10px;cursor: pointer;" data-id="'+exhibitorId+'" onclick="openInterestBlock(this,'+exhibitorId+',\'\');" class="interestedContent f12" id="interestedContent-'+exhibitorId+'"><div class="intrestNumbers" style="display: inline-flex;">1 Interested</div></div><hr style="margin: unset;">');
    }
}
function dateTimeChanged(dis){
    $(dis).parent().parent().siblings().find(".date-time-selected").removeClass("date-time-selected");
    $(dis).parent().siblings().find(".date-time-selected").removeClass("date-time-selected");
    $(dis).siblings().removeClass("date-time-selected");
    $(dis).addClass("date-time-selected");
}
function exhibitorEnquiryCallBack(exhibitorId,loaderHide) {
    if(loaderHide != -1){
        hideloading('list',exhibitorId);
    }
    if(page_type=="thankyou_new"){
        $("#connect-"+exhibitorId+".exhibitorConnect").html("<i class='fa fa-check text-success' style='font-size:12px; transform:translateY(1px);'></i> Bookmark").addClass("btn-default disabled");
    }else{
    $("#enquiry-"+exhibitorId+".exhibitorEnquiry").html("<i class='fa fa-check text-orange'></i> Interested").addClass("btn-default text-orange disabled");
    }
    if(pageType=='exhibitors')
        $("#enquiry-"+exhibitorId+".exhibitorEnquiry").css({'opacity': '1'});
    else
        $("#enquiry-"+exhibitorId+".exhibitorEnquiry").css({'opacity': '1','color': '#333','margin-right':'22%'});
}
/*  From 10t_event_detail_desktop.js to 10t_common_new.js -- End */
function userActionSyncExhi() {
     $('.engageAction').off("click");
     $('.engageAction').click(function() {
        var dataAction = $(this).attr('data-action');
        var actionParam = $(this).attr('data-param');
        if (actionParam==undefined || actionParam==null || actionParam=='') {
            window[dataAction](this);
        }
        else {
            window[dataAction](this,actionParam);
        }
    });
}

var loadPhoneverify={
    sourceCause:'',
    init:function(source){
        sourceCause=source;
        showloading();
        $("head").append("<link>");
        var css = $("head").children(":last");
        css.attr({
          rel:  "stylesheet",
          type: "text/css",
          href: "https://cdn.firebase.com/libs/firebaseui/2.3.0/firebaseui.css"
        });
        loadSyncedScript('https://www.gstatic.com/firebasejs/5.0.4/firebase.js',function(){
            loadSyncedScript('https://cdn.firebase.com/libs/firebaseui/2.3.0/firebaseui.js',function(){
                    var config = {
                        apiKey: "AIzaSyA-TIrf33jBgCtyGPUJWVZf68DeBfSo8RU",
                        authDomain: "times-ffdcc.firebaseapp.com",
                        databaseURL: "https://times-ffdcc.firebaseio.com",
                        projectId: "times-ffdcc",
                        storageBucket: "times-ffdcc.appspot.com",
                        messagingSenderId: "673036857783",
                        appId: "1:673036857783:web:f18fad91d12b1a3be6b832"
                    };
                    firebase.initializeApp(config);      

                    if($('#modalData').html() == "")
                        $('#modalData').html(getModal());
                    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
                    $('#TenTimes-Modal .modal-title').html('');
                    $('#TenTimes-Modal .modal-title').siblings('h5').remove();
                    // $('#TenTimes-Modal .modal-body').css('')
                    $('#TenTimes-Modal .modal-body').html('<style>.firebaseui-container{max-width:600px;}</style><div id="firebaseui-spa"><div id="firebaseui-container"></div></div>');
                    $('#TenTimes-Modal').modal('show');
                    hideloading();
                    $('#TenTimes-Modal').find('.modal-content').css('padding','0px');
                    $('#TenTimes-Modal').find('.modal-body').css('padding','0px');
                    $('#TenTimes-Modal').find('.modal-header').remove();
                    firebase.auth().signOut();
                    var ui = new firebaseui.auth.AuthUI(firebase.auth());
                    ui.start('#firebaseui-container', loadPhoneverify.getUiConfig());
                    $('.firebaseui-container').css('max-width','600px');
                                                            
            });
        });      
    },
    getUiConfig:function(){
      return {
        'callbacks': {
          'signInSuccess': function(user, credential, redirectUrl) {
            loadPhoneverify.handleSignedInUser(user);
            return false;
          }
        },
        'signInFlow': 'popup',
        'signInOptions': [  
                {
                      provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                      recaptchaParameters: {
                        type: 'image', 
                        size: 'visible',
                        badge: 'bottomleft' 
                      },
                      defaultCountry: 'IN'
                }
        ],
        'tosUrl': 'https://www.google.com'
      };
    },
    handleSignedInUser:function(user) {
      $('#TenTimes-Modal').modal('hide');
      showloading();
      let userid;
      switch(sourceCause){
            case 'login':
                     var status=$('input[name=state]').val().split('|');
                     userid=status[1];
                     break;
            default:
                    userid=getCookie('user');
      }
      if(userid!='' && user.phoneNumber!=''){
          $.ajax({
            type: "GET",
            url: site_url_attend + "/ajax?for=phoneLogin&token="+MD5(userid+'_'+user.phoneNumber)+"&user="+userid+'&source='+sourceCause,
            success: function(n) {
               hideloading();
               var k=JSON.parse(n);
               if(typeof phoneResponse=='function'){     
                    phoneResponse(k);
               }                              
            },
            error: function(n) {
                showToast('Sorry!! System error. Please try again.');
            }
        });
      }
    }
}


var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

// -by Rahul Singh
// embed media
function embed(callback, url) {
    var response = {};
    $.ajax({
        type: "GET",
        url: site_url_attend+"/ajax?ajax=1&for=embed&url=" + url,
        async: true,
        cache: false,
        success: function(data) {
            if(nullCheck(data)) {
                data = $.parseJSON(data);
                if(nullCheck(data["error"])) {
                    data["html"] = '';
                } else {
                    if(nullCheck(data["title"])) {
                        if(valid_url(data["title"])) {
                            response["title"] = data["author_name"];
                        } else {
                            response["title"] = data["title"];
                        }
                    }
                    if(nullCheck(data["thumbnail_url"])) {
                        response["thumbnail"] = data["thumbnail_url"];
                    }
                    if(nullCheck(data["html"])) {
                        response["html"] = data["html"];
                    }
                }
                callback(response);
            }
        }
    });
}

// get live events in span (hours)
function getLive(callback, span) {
    $.ajax({
        type: "GET",
        url: site_url_attend+"/ajax?ajax=1&for=liveNow&events=true&span=" + span,
        cache: false,
        success: function(data) {
            if(nullCheck(data)) {
                data = $.parseJSON(data);
                if(data.status.code == 1) {
                    data = data.data.events;
                    callback(data);
                }
            }
        }
    });
}

// END

function checkin_online(from){
    if($('#online_checkin').length>0)
    {       

        if($('#online_checkin').val()=='no_timing' || $('#online_checkin').attr('data-timezone')=='')
            position_checked('online');
        else
        {
            var sdate=$('#online_checkin').attr('data-sdate');
            var edate=$('#online_checkin').attr('data-edate');
            var timing=$('#online_checkin').attr('data-time');
            var stime= timing.split('-')[0].trim();
            var etime=timing.split('-')[1].trim();
            var timezone=$('#online_checkin').attr('data-timezone');
            var strt = sdate + ' ' +stime + '+' + timezone.slice(4,6) + timezone.slice(7,9) ;
            var end=   edate + ' ' +etime + '+' + timezone.slice(4,6) + timezone.slice(7,9) ;
            var startTimeEventUTC = new Date(strt).getTime()/1000;
            var endTimeEventUTC = new Date(end).getTime()/1000;
            var userTimeNow = new Date().getTime()/1000;
            if((startTimeEventUTC<= userTimeNow) && ( userTimeNow <= endTimeEventUTC))
            {   
                if(from!='onready')
                    position_checked('online');
            }
            else if(userTimeNow > endTimeEventUTC)
                {
                    $('#checkindata div').text('Check-in not allowed since the event is over now');
                    $('#checkindata').addClass('checkin-disable');
                    $('#checkindata i').css('background-color','lightgrey')
                }
            else
            {

                $('#checkindata div').text('Event has not started yet');
                $('#checkindata').addClass('checkin-disable');
                $('#checkindata i').css('background-color','lightgrey')
            }
        }

    }
}

function openContact(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent=$('div[class*=tabcontent]').not('#connectionsConn').not('#pendingConn');
  // tabcontent = document.getElementsByClassName("tabcontent");

  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  if($('#contact_search').val()!='')
    $('#contact_list_invite .invitetabcontent').css('display','block');
  else 
    $('#contact_list_invite #'+cityName).css('display','block');
  evt.target.className += " active";

  if(cityName=='import')
    var id="import";
  else
    var id="connections";

    if($('#no_'+cityName).length>0)
    {
        contactModalHtml.changeFooterHtml('add_new')
        $('.add_new_slider td').last().addClass('disable');
        $('.add_new_slider td').last().css('pointer-events','none')
        $('.add_new_slider td').last().find('div img').css({'opacity':'0.4','pointer-events':'none'})
    }
    else{
        $('.add_new_slider').hide();
        $('.share_slider').hide(); 
        $('.share_slider td').last().attr('onclick','contactModalHtml.changeFooterHtml(\'back\')')
        $('.add_new_slider td').last().removeAttr('class');
        $('.add_new_slider td').last().css('pointer-events','')
        $('.add_new_slider td').last().find('div img').css({'opacity':'1','pointer-events':''})
        $('.invite_footer').show();
    }
    if(page_type=='mdashRecommendation')
    {
        if(cityName=='import')
        { 
          $('.tooltip_mob').css('margin-left','5%')
          var message='Contacts imported or added by you';
        }
        else{
          $('.tooltip_mob').css('margin-left','40%')
          var message='Your contacts already on 10times';
        }
        $('.'+cityName+'_tooltip').text(message).show().fadeOut(1200);
    }
}


function copyEventLink(dis,param)
{   
    
    if(typeof param!='undefined' && param=='change')
    {
        $(dis).attr('data-original-title', 'Copy invite link to clipboard!')
          .tooltip('fixTitle');
    }
    else
    {    
        var link ='';
        if(page_type=='udash_connections'){
            link = 'I will be attending '+contactModalHtml.data.event_name+' in '+contactModalHtml.data.city_name+' from '+contactModalHtml.data.event_date+'. I would like you to join me at this event. Check out the event details at '+contactModalHtml.data.event_url+'?utm_source=invite&utm_medium=dashboard&utm_campaign=copy_link';
        }else{
            customEventGA('Event Visitor','Invite Widget',pageType+'|Copy_Code')
            link = 'I will be attending '+$('#event_name').val()+' in '+$('#cityName').val()+' from '+$('#event_date').val()+'. I would like you to join me at this event. Check out the event details at '+site_url_attend+'/'+$('#event_url').val()+'?utm_source=invite&utm_medium=dashboard&utm_campaign=copy_link';
        }
       
        var tempInput = document.createElement("input");
        tempInput.style = "position: absolute; left: -1000px; top: -1000px";
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        $(dis).attr('data-original-title', 'Copied')
          .tooltip('fixTitle')
          .tooltip('show');
    }
    
}




// property based contact modal
var contactModalHtml={
        workflow:'invite',
        widget:1,
        style:"",
        prevOffset:0,
        timeoutID:null,
        checkList:[],
        changeInvite:function(dis)
        {
            if($('.invite_check:checked').length>0)
            {
                $('#send_invite_button').removeClass('disable-invite disabled');
            }
            else
            {   
                $('#send_invite_button').addClass('disable-invite')
            }

        },
        checkSearch:function(dis)
        {   
            if(dis=='select_all'){
                var checkboxes=$('.invitetabcontent table tr').find('td:eq(2) input')
                var checkedState =  $('#select_all_btn').is(':checked');
            }
            else
            {
                var checkboxes = $("input[type=checkbox][data-userid="+$(dis).attr('data-userid')+"]");
                var checkedState =  $(dis).is(':checked');
            }
            checkboxes.each(function() {
                this.checked = checkedState;
                var  index=contactModalHtml.checkList.indexOf($(this).attr('data-userid'))
                if(checkedState)
                {                    
                    if(index == -1)
                        contactModalHtml.checkList.push($(this).attr('data-userid'));
                }
                else{
                        contactModalHtml.checkList = contactModalHtml.checkList.filter(e => e !== $(this).attr('data-userid'));
                }

            });
            contactModalHtml.changeInvite();
        },
        selectAll:function(dis){
            if($(dis).hasClass('selected_none'))
            {   
                $(dis).removeClass('selected_none');
                $(dis).addClass('selected_done');
                $('.invitetabcontent table tr').find('td:eq(2)').find('input').prop('checked',true)
            }
            else if($(dis).hasClass('selected_done'))
            {

                $(dis).removeClass('selected_done');
                $(dis).addClass('selected_none');
                $('.invitetabcontent table tr').find('td:eq(2)').find('input').prop('checked',false)
            }
            if( $('#contact_search').val().toLowerCase()!='')
                contactModalHtml.checkSearch('select_all');
            customEventGA('Event Visitor','Invite Widget',pageType+'|Select_All')
            contactModalHtml.changeInvite();
        },
        initial:function(workflow,widget,style){
          getModal({id: 'myContactsModal'});
          document.getElementById('myContactsModal').classList.add('w-100');

            let dis = Array();
            this.workflow = workflow;
            this.widget = widget;
            this.style = style;
            this.checkList =[];
            dis.modalFrame = document.getElementById('myContactsModal').outerHTML;

            $("#myContactsModal").on('click', function () {
                $('#myContactsModal h5').remove();  
            });
            if(typeof $('#isContactOpened').val()=='undefined'){

            if(deviceFlag==1)
                $('head').append('<link type="text/css" rel="stylesheet" href="https://c1.10times.com/css/10t_invite_modal.css" id="bt-removable-css">');
            else 
                $('head').append('<link type="text/css" rel="stylesheet" href="https://c1.10times.com/css/10t_invite_modal_mob.css" id="bt-removable-css">');
            }
            getContactInviteModalData(widget);
            if(style=='addStyle')
                contactModalHtml.addStyle();
            contactModalHtml.makeAjaxContacts(dis);
            },
        addStyle:function()
        {   if(deviceFlag==1)
            {
                $('#myContactsModal').css({'margin':'0 auto','border-radius':'10px','top':'5%'});
                $('#myContactsModal .modal-content').css('height','85%');
                $('#myContactsModal .modal-footer').css({'border-bottom-left-radius':'10px','border-bottom-right-radius':'10px'})
                $('#contact_list_invite').css('height','70%');
            }
        },
        modalClose:function(param)
        {   
            if(($('#contact-content_invite').is(':visible') || $('.no-contact').parent().is(':visible'))|| (typeof param!='undefined' && param=='remove'))
            {
                $( '#myContactsModal' ).remove();
                $( '.modal-backdrop' ).remove();
                $( 'body' ).removeClass( "modal-open" );
                $('body').removeAttr('style');
            }
            else
            {
                $('#add_new_form_invite , .no_email_detect, .unknown_error_invite').remove();
                if($('.modal-footer td').hasClass('disabled'))
                    $('.modal-footer td').removeClass('disabled');
                if($('.no-contact').length>0)
                {
                    $('#contact_list_invite').css('display','block');
                    contactModalHtml.changeFooterHtml('add_new');
                }
                else
                {
                    $('#myContactsModal .progress-bar-container').parent().remove();
                    $('#contact-content_invite').css('display','block');

                }
                if(contactModalHtml.style=='addStyle'){
                    if(page_type=='thankyou_new')
                        customEventGA('Event Visitor','Invite Widget',pageType+'|Invite_Others');
                    if(deviceFlag==1)
                        $('#contact_list_invite').css('height','70%!important');
                    $('#myContactsModal .modal-title').text('Invite Others')
                }
                else
                    $('#myContactsModal .modal-title').text('My Contacts')
            }
        },
        makeAjaxContacts:function(dis,source,query)
        {   
            if(source=='gmail')
                $('#contact-content_invite').remove();
            url=site_url_attend+'/ajax?for=contactModalHtml';
            if(source=='search' && query!=''){
                url=url+'&q='+query;
            }
            else if(source=='search')
                source='gmail';

            if(source=='append_bottom' && $('#contact_search').val()!='')
                url=url+'&q='+$('#contact_search').val();
            if(source=='append_bottom')
            {   
                var offset=$('.invitetabcontent tr').length;
                url=url+'&offset='+offset;
                if($('#nextLoadInvite').length==0)
                    $('.invitetabcontent:visible').append('<div id="nextLoadInvite" class="f12 m-top5" style="display: none;"><div class="loader3"></div></div>')
                $('#nextLoadInvite').css('display','');
            }
            if((source=='append_bottom' && prevOffset==offset && offset!=0))
                $('#nextLoadInvite').remove();
            if((source=='append_bottom' && prevOffset!=offset && offset!=0) || source!='append_bottom')
            {   

                prevOffset=offset;
                $.ajax({
                    type: "GET",
                    url: url,
                     success: function(result) {
                            flag_CallAjaax=0;
                            var result=JSON.parse(result);
                            $('#nextLoadInvite').remove();
                            if(contactModalHtml.style=='addStyle')
                            {   
                                if(page_type=='thankyou_new')
                                    customEventGA('Event Visitor','Invite Widget',pageType+'|Invite_Others');
                                dis.contactTitle='Invite Others';
                            }
                            else
                                dis.contactTitle='My Contacts';
                            dis.content=result;
                            if(source=='append_bottom' && $('#contact_search').val()!='')
                            {
                                contactModalHtml.makeModalHtml(dis,'append','','search');
                            }
                            else
                                contactModalHtml.makeModalHtml(dis,'','',source);

                        }
                    });
            }
        },
        addNewContact:function(from,source)
        {   

            var submit=true;
            var email=$('#add_contact_email').val();
            var name=$('#add_contact_name').val();
            var phone=$('#add_contact_phone').val();

            if(typeof name=='undefined' || name=='')
            {
                nameError = "Please enter your contact's name";
                document.getElementById("name_error").innerHTML = nameError;
                $('#add_contact_name').css('border-color','#a94442');
                submit = false;
            }
            if(typeof email=='undefined' || email=='')
            {
                var emailError = "Please enter your contact's email";

            }
            else if(!validateEmailInvite(email))
                var emailError='Please enter a valid email';
            if(typeof emailError!='undefined' && emailError!='')
            {
                document.getElementById("email_error").innerHTML = emailError;
                $('#add_contact_email').css('border-color','#a94442');
                submit = false;
            }

            if(typeof phone=='undefined')
                phone='';
            if(submit)
            {
                var contact_array=[];
                contact_array.name=name;
                contact_array.email=email;
                contact_array.phone=phone;
                contact_array=Array(contact_array); 
                if((getCookie('user') && getCookie('user') != "") || (getCookie('user_token') && getCookie('user_token') != "")) 
                    bulkUserImport(contact_array,1,source);
                else{
                    $('#myContactsModal').modal('hide');
                    verifySigninTT('login','addNewContact-'+source); 
                }
            }

        },
        loadFile:function(event) {
            if (window.File && window.FileList && window.FileReader) {

                var files = event.target.files; 
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    //Only pics
                    if (!file.type.match('image')) continue;

                        var picReader = new FileReader();
                        picReader.addEventListener("load", function (event) {
                            var picFile = event.target;
                            $('#upload_card').val('')
                            contactModalHtml.saveBusinessCard(picFile.result);
                        });
                        //Read the image
                        picReader.readAsDataURL(file);
                      }
                } else {
                    console.log("Your browser does not support File API");
                }
        },       
        saveBusinessCard:function(img,from){
            var url=site_url_attend+'/ajax?for=addBusinessContact';
            if(from==2)
                var image_base_64 = $('.image-editor').cropit('export');
            else
                var image_base_64=img;
            if(typeof image_base_64!='undefined' && image_base_64!='')
            {

                $('#myContactsModal #contact-content_invite').hide();
                if($('.no-contact').length>0)
                    $('#contact_list_invite').css('display','none');
                        
                $('#myContactsModal .modal-body').append('<div id="loading_screen"> <div id="loading_screen_background"></div><div id="loading_screen_logo"></div><div id="loading_screen_bars"> <div id="dot1" class="loader-dot"></div><div id="dot2" class="loader-dot"></div><div id="dot3" class="loader-dot"></div><div id="dot4" class="loader-dot"></div><div id="dot5" class="loader-dot"></div></div></div>');
                if(from!=2)
                    $('#loading_screen').after('<div class="card-img"><img src="'+image_base_64+'"></div>');
                if($('#contact-content_invite').css('display')!='block' && $('.no-contact').css('display')!='block')
                    $('.modal-footer td').addClass('disabled');
                else
                    $('.modal-footer td').removeClass('disabled');
                        $.ajax({
                            type:"POST",
                            url:url,
                            data:{'image':JSON.stringify(image_base_64)},
                            timeout:30000,
                            error: function(){
                                contactModalHtml.makeModalHtml('','crop_card',img);
                                showToast('Something went wrong');
                            },        
                            success: function(result)
                            {
                                var result=JSON.parse(result);
                                if(result['status']['code']==1)
                                {
                                    contact_array=[];
                                    contact_array.name=result['data']['name'];
                                    contact_array.email=result['data']['email'];
                                    contact_array.phone=result['data']['phone'];
                                    contact_array=Array(contact_array); 
                                    $("#loading_screen").css('display', '');
                                    $('.no_email_detect').remove();
                                    contactModalHtml.makeModalHtml('','add_card',contact_array);
                                } 
                                else{

                                    if(from==2)
                                    {   
                                        $('.no_email_detect').remove();
                                        $("#loading_screen").remove();
                                        $('#myContactsModal .modal-body').append('<div class="unknown_error_invite"><h3 style="color:#ff3333;font-weight:unset">Unknown error occured.Please try again later or choose other mediums to invite.</h3><button onclick="contactModalHtml.modalClose();" type="button" class="mt-10 pd-5 btn btn-primary">Back</button></div>');
                                        $('#social_media').removeClass('disabled');
                                    }
                                    else
                                    {
                                        contactModalHtml.makeModalHtml('','crop_card',img);
                           
                                        showToast('Something went wrong');
                                    }
                                }

                            }
                        });
            }   
        },
        addContactSuccess:function(result){
        if(result[0]['published']==-1  && result[0]['previousConnection']==1)
        {
            $('#contact_list_invite').before('<h5 class="notice">'+$('#add_contact_name').val()+' is already a contact.Go ahead invite!!</h5>');
            
            openContact(event,'import');
            $('.contact_tabs_invite .tablinks').first().addClass('active');
        }
        if(result[0]['published']==1)
        {
            if(result[0]['previousConnection']==1)
                message=$('#add_contact_name').val()+' is already your connection, go ahead connect!!!';
            else
                message=$('#add_contact_name').val()+' is your connection now, go ahead connect!!!';

            if(result[0]['userId']==getCookie('user'))
                message='You cannot invite yourself!!!';

            $('.contact_tabs_invite .active').removeClass('active');
            $('.contact_tabs_invite .tablinks').last().addClass('active');
            $('#import').css('display','none');
            $('#connections').css('display','block');

            $('.contact_tabs_invite').after('<h5 class="notice mb-0 mt-10">'+message+'</h5>')

        }
        if(result[0]['previousConnection']==0)
        { 
            contact_row='<tr style="border-top: 1px solid #f3f3f3;"><td style="width: 40px; padding:15px 0px;"> <img src="https://c1.10times.com/img/no-pic.jpg" class="user_img_invite" alt="'+$('#add_contact_name').val()+'"> </td><td style="width: 80%; padding-left: 12px;"> <div class="f16 c-head" data-email="'+result[0]['userId']+'"><b>'+$('#add_contact_name').val()+'</b>'
                        
            contact_row+='<span>';
            

            if(result[0]['source']=='business_card')
                contact_row+='<i style="font-size:14px;" class="mx-10 fa fa-address-card" aria-hidden="true"></i>';
            else if(result[0]['source']=='email_id')
                contact_row+='<i style="font-weight:900;" class="c-blue f14 mx-10 fa fa-at" aria-hidden="true"></i>';

            contact_row+='</span>';

            contact_row+='</div>';
            
            if(this.workflow=='invite')
                contact_row+='<td style="width: 10%;padding:5px 0px 15px 0px;"> <div class="md-checkbox_invite f12 m-bottom10"> <label style="font-weight: 400;"><input class="invite_check" id="id_'+result[0]['userId']+'" data-userid="'+result[0]['userId']+'" type="checkbox" name="opportunity" checked style="visibility:visible" onchange="contactModalHtml.checkSearch(this)"> <span></span></label> </div></td>';

            contact_row+='</tr>';
            if(result[0]['published']==-1)
            {   
                if($('#contact_list_invite #import').length==0)
                {   
                    var row='<div class="col-md-6" ';
                    if(page_type!=mdashRecommendation)
                        row+='data-toggle="tooltip" data-placement="bottom" title="Contacts imported or added by you" data-trigger="hover"';
                    row+='><button class="tablinks import btn" onclick="openContact(event,\'import\')"><span style="padding: 10px;"><i class="fa fa-exchange" aria-hidden="true"></i></span>Imported</button></div>';
                    $('.contact_tabs_invite .row').append(row);

                    $('#contact_list_invite').append('<div id="import" class="invitetabcontent"><table><tbody></tbody></table><div class="no-results_invite">No Results</div></div>');
                }
                $('#contact_list_invite #import tbody').prepend(contact_row);
                openContact(event,'import');
                $('.import').addClass('active');
                if($('#no_import').length>0)
                    $('#no_import').remove();
            }
            else
            {   
                if($('#contact_list_invite #connections').length==0){
                    var row='<div class="col-md-6" ';
                    if(page_type!=mdashRecommendation)
                        row+='data-toggle="tooltip" data-placement="bottom" title="Your contacts already on 10times" data-trigger="hover"';
                    row+='><button class="tablinks  connect active" onclick="openContact(event,\'connections\')"><span style="padding: 10px;"><i class="fa fa-star" aria-hidden="true"></i></span>Connections</button></div>';
                    $('.contact_tabs_invite .row').append(row);
                    $('#contact_list_invite').append('<div id="connections" class="invitetabcontent"><table><tbody></tbody></table><div class="no-results"_invite>No Results</div></div>')
                }
                $('#contact_list_invite #connections tbody').prepend(contact_row);
                if($('#no_connections').length>0)
                    $('#no_connections').remove();

            }
        }   
            $('#myContactsModal .modal-title').text('Contacts');
            $( "#contact_list_invite input[data-userid='"+result[0]['userId']+"']").attr('checked',true);
            $('#add_new_form_invite').remove();
            $('.progress-bar-container').parent().remove();
            $('#contact-content_invite').show();
            if($('#contact-content_invite').css('display')!='block' && $('.no-contact').css('display')!='block')
                $('.modal-footer td').addClass('disabled');
            else
                $('.modal-footer td').removeClass('disabled disable-invite');
        },
        collectEmails:function(){
            let emailString='';
            if($('#select_all_btn').is(':checked') && $('#contact_search').val()=='')
            {
                emailString='selectAllFlag_invite';
            }
            else
            {
                var emails=contactModalHtml.checkList;
                emails.forEach(function(element) {  
                    emailString=emailString+element+','; 
                });
                emailString=emailString.substr(0, emailString.length-1);
            }
            
            if(typeof emailString!='undefined' && emailString!='')
                sendRequest('','new_invite',emailString,this.widget);

        },
        changeFooterHtml:function(source,subsource){
            var html='';
            if(source=='back')
            {
                $('.invite_footer').show();
                $( "table[class*='_slider']" ).hide()
            }
            else
            {
                if(source=='add_new')
                {
                    html='<table class="'+source+'_slider w-100"><tbody><tr><td> <input type="file"  accept="image/*" name="image" id="upload_card" multiple="multiple" onclick="customEventGA(\'Event Visitor\',\'Invite Widget\',\''+pageType+'|BusinessCard\')" onchange="contactModalHtml.loadFile(event)" style="display: none;"><label for="upload_card"><div style="text-align: center;"><i class="fa fa-address-card" style="font-size: 20px;" aria-hidden="true"></i></div><div style="font-weight:400;" class="f13 c-head m-top5">Business Card</div></label></td><td  onclick="handleGAuth_new();customEventGA(\'Event Visitor\',\'Invite Widget\',\''+pageType+'|Gmail\')"><div><img src="https://c1.10times.com/images/gmail_new.svg" alt="gmail_new" width="22px"></div><div class="f13 c-head m-top5">Gmail</div></td><td  onclick="contactModalHtml.makeModalHtml(this,\'add_card\');customEventGA(\'Event Visitor\',\'Invite Widget\',\''+pageType+'|Email\')"><div><span><i style="font-weight:900;font-size:20px;" class="c-blue f20 mx-10 fa fa-at" aria-hidden="true"></i></span></div><div class="f13 c-head m-top5"> Email</div></td><td onclick="contactModalHtml.changeFooterHtml(\'back\')"'

                        if(!(getCookie('user') && getCookie('user_token')) || $('.no-contact').length>0) 
                        html+=' class="disable-invite" style="opacity:0.4"';

                        html+='><div><img style="margin-right:-20px;" src="https://c1.10times.com/images/Double-Left-512.png" class="arrow_back_invite"   alt="arrow-icon-52"></div></td></tr></tbody></table>';
                }
                else
                    html='<table class="'+source+'_slider"><tbody><tr><td onclick="inviteRedirect(\'facebook\',\'event\','+contactModalHtml.data.event_id+',\'\',\'\');customEventGA(\'Event Visitor\',\'Invite Widget\',\''+pageType+'|Share_Facebook\');"><div class="invite_icon_img"><img src="https://c1.10times.com/images/fb_logo.png"></div><div>Facebook</div></td><td onclick="inviteRedirect(\'linkedin\',\'event\','+contactModalHtml.data.event_id+',\'\',\'\');customEventGA(\'Event Visitor\',\'Invite Widget\',\''+pageType+'|Share_LinkedIn\')"><div class="invite_icon_img"><img src="https://c1.10times.com/images/link.png"></div><div>LinkedIn</div></td><td onclick="inviteRedirect(\'twitter\',\'event\','+contactModalHtml.data.event_id+',\'\',\'\');customEventGA(\'Event Visitor\',\'Invite Widget\',\''+pageType+'|Share_Twitter\');"><div class="invite_icon_img"><img alt="glogo" src="https://c1.10times.com/images/gplus.png"></div><div>Twitter</div></td><td  onclick="inviteRedirect(\'whatsapp\',\'event\','+contactModalHtml.data.event_id+',\'\',\'\');customEventGA(\'Event Visitor\',\'Invite Widget\',\''+pageType+'|Share_Whatsapp\')"><div class="invite_icon_img"><img src="https://c1.10times.com/images/whatsapp.png" alt="whatsapp"></div><div>WhatsApp</div></td><td onclick="contactModalHtml.changeFooterHtml(\'back\');"><div><img  style="margin-right:-20px;" src="https://c1.10times.com/images/Double-Left-512.png" class="arrow_back_invite"   alt="arrow-icon-52"></div></td></tr></tbody></table>';

                if($("table[class*='_slider']").is(':visible'))
                    $("table[class*='_slider']").hide();

                if($("."+source+'_slider').length>0)
                    $("."+source+'_slider').show()
                else
                    $('.invite_footer').before(html);
                if($('.no-contact').length>0 || subsource=='fromNoImport' || subsource=='fromNoConnection')
                    $('.share_slider td').last().attr('onclick','contactModalHtml.changeFooterHtml(\'add_new\')')
                $('.invite_footer').hide();
                $("."+source+'_slider').show();
            }
        },
        show_email:function(dis)
        {
          $(dis).parent().next('p').show().fadeOut(1200);
        },
        search: function(param){
            if(typeof param!='undefined' && param!=''){
                $('.crossspan_invite').css('visibility','visible');
            }
            else{
                $('.crossspan_invite').css('visibility','hidden');
                param='';
            }

            contactModalHtml.makeAjaxContacts(this,'search',param);
        },
        makeModalHtml:function(dis,from,imageData,source){
            if(from=='add_card')
            { 

                var form_html='<div id="add_new_form_invite"><div class="form-group" > <label for="name">Name:</label> <input type="name" class="form-control" id="add_contact_name" placeholder="Enter Contact Name" name="name" /><span class="error"><small id="name_error" class="text-danger "></small></span> </div><div class="form-group"> <label for="email">Email:</label> <input type="email" class="form-control" id="add_contact_email" placeholder="Enter Email Id" name="email"/> <span class="error"><small id="email_error" class="text-danger "></small></span></div><div class="form-group"> <label for="phone">Phone:</label> <input type="phone" class="form-control" id="add_contact_phone" placeholder="Enter Phone Number" name="phone" > </div><button  class="btn btn-default addContacBtn submitBtn_invite" onclick="contactModalHtml.addNewContact(12,\'email_id\')">Add Contact</button><button type="button" onclick="contactModalHtml.modalClose();" class="btn btn-link" style="margin: 0 auto;display: block;">Back</button></div>'

        
                $('#myContactsModal .modal-title').text('Add New Contact');
                $('#myContactsModal #contact-content_invite').hide();
                if($('.no-contact').length>0)
                {   
                    $('#contact_list_invite').css('display','none');
                    $('#myContactsModal .modal-body').append(form_html);    
                }
                else
                    $('#myContactsModal #contact-content_invite').after(form_html);

                if(typeof imageData!='undefined' && imageData.length>0)
                {
                    $('#add_contact_name').val(imageData[0].name);
                    $('#add_contact_email').val(imageData[0].email);
                    if(imageData[0].phone!=null && imageData[0].phone!='')
                        $('#add_contact_phone').val(imageData[0].phone);
                    $('#add_contact_name').focus().val($('#add_contact_name').val());


                    $('#loading_screen').remove();
                    $('.addContacBtn').attr('onclick','contactModalHtml.addNewContact(12,\'business_card\')')
                    $('.card-img').remove();
                }

                $( "table[class*='_slider']" ).hide();
                $('.invite_footer').show();
                $("#add_contact_name,#add_contact_email").keyup(function(){
                    if($(this).hasClass('form-control'))
                        $(this).next().find('small').html('');
                        $(this).css('border-color','');
                });
            }
            else if(from=='crop_card')
            {   
                var card_html='';
                card_html=' <div class="no_email_detect"><div style="color:#ff3333;" class="px-10 pt-10"><span>Could not detect email. Please try zoom option or upload image. </span> <br/></div><div style="width:auto!important;text-align:center;" class="img-preview-crop"><div class="image-editor" style="padding-top:25px;"> <div class="cropit-preview"></div><div style="margin-top: 20px;margin-bottom: 40px;"> <input type="file" class="cropit-image-input" accept="image/*"> <div class="col-xs-3" style="padding: 0px;margin-top: 0px;"> <i class="fa fa-rotate-left rotate-cw-btn" style="margin: 0px 15px;"></i> <i class="fa fa-rotate-right rotate-ccw-btn"></i> </div><div class="col-xs-8" style="display: inline-flex;padding: 0px;margin-left: 15px;"> <i class="fa fa-minus-circle" aria-hidden="true" style="margin: 3px 10px;font-size: 16px!important;"></i> <input type="range" class="cropit-image-zoom-input profile-slider" min="0" max="1" step="0.01"> <i class="fa fa-plus-circle" style="margin: 3px 10px;font-size: 16px!important;"></i> </div></div></div></div><br/><div><center><button type="button" class="btn btn-default submitBtn_invite" onclick="contactModalHtml.saveBusinessCard(\'\',2)">Submit</button><button onclick="contactModalHtml.modalClose();" type="button" class="btn btn-link" style="margin: 0 auto;display: block;">Back</button></center></div></div>';


                $('#myContactsModal .modal-title').text('Add Contact via Card');
                $('#loading_screen').remove();
                $('.card-img').remove();
                if($('.no-contact').length>0)
                {   
                    $('#contact_list_invite').css('display','none');
                }
                $('#myContactsModal .modal-body').append(card_html);
                if($('script[src*="cropit"]').length==0)
                    {
                        var jsMap = document.createElement("script");
                        jsMap.type = "application/javascript";
                        jsMap.src = 'https://c1.10times.com/js/cropit.js';
                            jsMap.onload=function(){
                                $('.image-editor').cropit({
                                    smallImage: 'allow',
                                    minZoom: 0,
                                    maxZoom: 5
                                });
                            $('.image-editor').cropit('imageSrc',imageData);

                            $('.crop-choose-pic').click(function() {
                                $('.cropit-image-input').click();
                              });
                            $('.rotate-cw-btn').click(function() {
                                $('.image-editor').cropit('rotateCW');
                              });
                            $('.rotate-ccw-btn').click(function() {
                                $('.image-editor').cropit('rotateCCW');
                              });

                            };
                        document.body.appendChild(jsMap);
                    }
                else{
                        $('.image-editor').cropit({
                                    smallImage: 'allow',
                                    minZoom: 0,
                                    maxZoom: 5
                                });
                        $('.image-editor').cropit('imageSrc',imageData);

                        $('.crop-choose-pic').click(function() {
                            $('.cropit-image-input').click();
                          });
                        $('.rotate-cw-btn').click(function() {
                            $('.image-editor').cropit('rotateCW');
                          });
                        $('.rotate-ccw-btn').click(function() {
                            $('.image-editor').cropit('rotateCCW');
                          });

                    }

                $( "table[class*='_slider']" ).hide();
                $('.invite_footer').show();

            }
            else {
                $('#myContactsModal .modal-title').text(dis.contactTitle);

                var html='';
                var contactModalHtml='';

                if(((typeof dis.content.imported!='undefined' || typeof dis.content.connections!='undefined') && ( dis.content.imported.length>0 || dis.content.connections.length>0)) || source=='append_bottom')
                {   

                    if(source!='append_bottom' && source!='search')
                    {
                        html+='<div id="contact-content_invite">';
                        html+='<div class="tab contact_tabs_invite rounded-3"><div class="row">';
                        html+='<div class="col-6"';
                        if(page_type!='mdashRecommendation')
                            html+=' data-toggle="tooltip" data-placement="bottom" title="Contacts imported or added by you" data-trigger="hover"';
                        html+='><button class="tablinks import btn w-100';
                        
                        if((typeof dis.content.imported!='undefined' && dis.content.imported.length>0))
                            html+=' active';
                        html+='" onclick="openContact(event,\'import\')"><i class="fa fa-exchange" aria-hidden="true"></i>&nbsp;Imported</button></div>';


                        html+='<div class="col-6"';
                        if(page_type!='mdashRecommendation')
                        html+=' data-toggle="tooltip" data-placement="bottom" title="Your contacts already on 10times" data-trigger="hover"'
                        html+='><button  class="tablinks connect w-100';

                        if(typeof dis.content.imported!='undefined' &&  dis.content.imported.length==0)
                            html+=' active';
                    

                        html+='"onclick="openContact(event,\'connections\')"><i class="fa fa-star" aria-hidden="true"></i>&nbsp;Connections</button></div>';

                    if(page_type=='mdashRecommendation')
                        html+='<p class="import_tooltip tooltip_mob"></p><p class="connections_tooltip tooltip_mob"></p>'
                    html+='</div></div><div class="contact_search"><input type="text" id="contact_search" style="width: 95%;padding: 0px;border-bottom: unset;" placeholder="Search.."><span onclick="contactModalHtml.search()" class="crossspan_invite">&times;</span></div>';

                        html+='<div style="width: 60%;float: left;" id="invite_success"></div><div style="float: right;"><div class="sendtoall" style="margin-right: 10px;vertical-align: text-bottom;color: #337ab7;" onclick="sendRequest(\'\',\'new_invite\',\'selectAllFlag_invite\',\''+this.widget+'\');" >Send to all</div><div style="display: none;font-size: 13px;    margin-right: 10px;vertical-align: text-bottom;color: #337ab7;">Select All</div><div class="md-checkbox_invite select_check_invite f12 m-bottom10" style="    display: none;">  <label  style="font-weight: 400;color:#337ab7"><input id="select_all_btn"  type="checkbox" name="opportunity"  onchange="contactModalHtml.selectAll(this)" class="selected_none"><span></span></label></div></div>'; 

                     
                    }

                } 
                if(source!='append_bottom' && source!='search')
                    html+='<div id="contact_list_invite">';               
             if(source=='search')
             {
                if(dis.content.search.length>0)
                {   
                    if(typeof from=='undefined' || from=='')
                        html+='<div class="invitetabcontent"><table><tbody>'
                    for(i=0;i<dis.content.search.length;i++)
                        {   
                            contact_row='<tr style="border-top: 1px solid #f3f3f3;"><td style="width: 40px; padding:15px 0px;"> <img class="user_img_invite" alt="'+dis.content.search[i]['name']+'" src="'+dis.content.search[i]['profilePicture']+'"> </td><td style="width: 80%; padding-left: 12px;"> <div  class="f16 c-head" data-email="'+dis.content.search[i]['id']+'"><b>';
                            if(dis.content.search[i]['name']==null)
                                contact_row+='No Name';
                            else
                                contact_row+=dis.content.search[i]['name'];    

                            
                            contact_row+='</b>';

                            contact_row+='</div>';
                            contact_row+='</td>'
                            
                            if(this.workflow=='invite'){
                                contact_row+='<td style="width: 10%;padding:5px 0px 15px 0px;"> <div class="md-checkbox_invite f12 m-bottom10"> <label style="font-weight: 400;"><input id="id_'+dis.content.search[i]['id']+'" class="invite_check" data-userid="'+dis.content.search[i]['id']+'"  type="checkbox" name="opportunity"  style="visibility:visible" onchange="contactModalHtml.checkSearch(this)"';
                                if((this.checkList.indexOf(dis.content.search[i]['id'].toString())>-1) || $('#select_all_btn').is(':checked'))
                                    contact_row+=' checked';
                                if($('#select_all_btn').is(':checked') && (this.checkList.indexOf(dis.content.search[i]['id'].toString())==-1))
                                    this.checkList.push(dis.content.search[i]['id'].toString());

                                contact_row+='><span></span></label> </div></td>'
                            }

                            
                            contact_row+='</tr>';
                            html+=contact_row;
                        }
                        if(typeof from=='undefined' || from=='')
                            html+='</tbody></table></div>';
                        if(from=='append')
                            $('#contact_list_invite tbody').append(html);
                        else
                            $('#contact_list_invite').html(html)
                }
                else if(from!='append')
                {
                    $('#contact_list_invite').html('<div class="no-results_invite">No Results</div>')
                    $('.no-results_invite').css('visibility','visible');
                }

             }
               

                if(((typeof dis.content.imported!='undefined' || typeof dis.content.connections!='undefined') && ( dis.content.imported.length>0 || dis.content.connections.length>0)) && source!='search')
                {   

                        if(source!='append_bottom')
                        {
                            html+='<div id="import" class="invitetabcontent"'
                            if(dis.content.imported.length==0)
                                html+='style="display:none"';
                            html+='><table><tbody>';
                        }
                        
                        for(i=0;i<dis.content.imported.length;i++)
                        {   
                            contact_row='<tr style="border-top: 1px solid #f3f3f3;"><td style="width: 40px; padding:15px 0px;"> <img class="user_img_invite" alt="'+dis.content.imported[i]['name']+'" src="'+dis.content.imported[i]['profilePicture']+'"> </td><td style="width: 80%; padding-left: 12px;"> <div  class="f16 c-head" data-email="'+dis.content.imported[i]['id']+'"><b ';
                            if(page_type=='mdashRecommendation')
                                contact_row+='onclick="contactModalHtml.show_email(this)">';
                            else
                                contact_row+='data-toggle="tooltip" data-placement="top"  data-trigger="hover" data-original-title="'+dis.content.imported[i]['email']+'">'

                            if(dis.content.imported[i]['name']==null)
                                contact_row+='No Name';
                            else
                                contact_row+=dis.content.imported[i]['name'];    

                            
                            contact_row+='</b>';
                            
                            if(dis.content.imported[i]['source']=='import')
                                contact_row+='<span><img src="https://c1.10times.com/images/gmail_new.svg" style="width: 13px;margin-top: -1px;margin-left: 10px;" alt="gmail_new"></span>';
                            else if(dis.content.imported[i]['source']=='business_card')
                                contact_row+='<span><i style="font-size:14px;" class="mx-10 fa fa-address-card" aria-hidden="true"></i></span>';

                            else if(dis.content.imported[i]['source']=='email_id' || dis.content.imported[i]['source']=='invite')
                                contact_row+='<span><i style="font-weight:900;" class="c-blue f14 mx-10 fa fa-at" aria-hidden="true"></i></span>';

                            contact_row+='</div>';
                            if(page_type=='mdashRecommendation')
                                contact_row+='<p class="no_name tooltip_mob" >'+dis.content.imported[i]['email']+'</p>'
                            contact_row+='</td>'
                            
                            if(this.workflow=='invite'){

                                contact_row+='<td style="width: 10%;padding:5px 0px 15px 0px;"> <div class="md-checkbox_invite f12 m-bottom10"> <label style="font-weight: 400;"><input id="id_'+dis.content.imported[i]['id']+'" class="invite_check" data-userid="'+dis.content.imported[i]['id']+'"  type="checkbox" name="opportunity"  style="visibility:visible" onchange="contactModalHtml.checkSearch(this)"'
                                if(this.checkList.indexOf(dis.content.imported[i]['id'].toString())>-1)
                                    contact_row+=' checked';
                                contact_row+='><span></span></label> </div></td>'
                            }
                            contact_row+='</tr>';
                            if(source=='append_bottom')
                                $('#import tbody').append(contact_row);
                            html+=contact_row;
                        }
                        if(dis.content.imported.length==0 && source!='append_bottom')
                        {
                            html+='<div id="no_import" class="f18 text-orange text-center">You have no contacts. Please add contacts from below or share on <a href="javascript:void(0);" onclick="contactModalHtml.changeFooterHtml(\'share\',\'fromNoImport\')">social media</a></div>';
                        }
                        if(source!='append_bottom')
                            html+='</tbody></table><div class="no-results_invite">No Results</div></div>';
                        if(source!='append_bottom'){
                            if(dis.content.imported.length==0)
                                var display='display:block';
                            else
                                var display='display:none';
                            html+='<div id="connections" class="invitetabcontent" style="'+display+'"><table><tbody>';
                        }
                        for(i=0;i<dis.content.connections.length;i++)
                        {
                            contact_row='<tr style="border-top: 1px solid #f3f3f3;"> <td style="width: 40px; padding:15px 0px;"> <img class="user_img_invite" alt="'+dis.content.connections[i]['name']+'" src="'+dis.content.connections[i]['profilePicture']+'"> </td><td style="width: 80%; padding-left: 12px;"> <div class="f16 c-head" data-email="'+dis.content.connections[i]['id']+'"><b>'
                            if(dis.content.connections[i]['name']==null)
                                contact_row+='No Name'
                            else
                                contact_row+=dis.content.connections[i]['name']

                            contact_row+='</b></div></td>';

                            if(this.workflow=='invite'){
                                contact_row+='<td style="width: 10%;padding:5px 0px 15px 0px;"> <div class="md-checkbox_invite f12 m-bottom10"> <label style="font-weight: 400;"><input id="id_'+dis.content.connections[i]['id']+'" class="invite_check" data-userid="'+dis.content.connections[i]['id']+'" type="checkbox" name="opportunity" value="1" style="visibility:visible" onchange="contactModalHtml.checkSearch(this)"'
                                if(this.checkList.indexOf(dis.content.connections[i]['id'].toString())>-1)
                                    contact_row+=' checked';
                                contact_row+='><span></span></label></div></td>';

                            }
                            contact_row+='</tr>';

                            contact_row+='</tr>';
                            if(source=='append_bottom')
                                $('#connections tbody').append(contact_row);
                            html+=contact_row;

                        }
                        if(dis.content.connections.length==0 && source!='append_bottom')
                        {
                            html+='<div id="no_connections" class="f18 text-orange text-center">You have no connections. Please add  from below or share on <a href="javascript:void(0);" onclick="contactModalHtml.changeFooterHtml(\'share\',\'fromNoConnection\')">social media</a></div>';
                        }
                        if(source!='append_bottom')
                        html+='</tbody></table><div class="no-results_invite">No Results</div></div>';

                }

                else if(source!='append_bottom'){
                    html+='<div class="no-contact f18"><h3 class="f18">You have no contacts. Please add contacts from below or share on <a href="javascript:void(0);" onclick="contactModalHtml.changeFooterHtml(\'share\')">social media</a></h3></div><div id="import" class="tabcontent" style="display:none;"><table><tbody></tbody></table></div><div id="connections" class="tabcontent" style="display:none;"><table><tbody></tbody></table></div>';
                }
                if(source!='append_bottom' && source!='search')
                    $('#myContactsModal .modal-body').html(html)
                if(source=='gmail' || $('.no-contact').length!=0)
                {
                    $('.progress-bar-container').parent().remove();
                } 

                $('#myContactsModal .modal-footer').html('<table class="invite_footer"  style="width:100%!important"> <tr> <td onclick="contactModalHtml.changeFooterHtml(\'add_new\')"> <img src="https://c1.10times.com/images/add_new.svg" width="22" alt="add_new"> <div class="f13 c-head m-top5">Add New</div></td><td id="social_media" onclick="contactModalHtml.changeFooterHtml(\'share\')" data-toggle="tooltip" data-placement="top" title="Share on social media"> <img src="https://c1.10times.com/images/share-PNG52.png" alt="share" width="22"> <div class="f13 c-head m-top5">Share</div></td><td  id="send_invite_button"  onclick="contactModalHtml.collectEmails();customEventGA(\'Event Visitor\',\'Invite Widget\',\''+pageType+'|Invite\')" data-toggle="tooltip" data-placement="top" title="Send Invite"  class="disable-invite"><div style="text-align: center;"><i class="fa fa-paper-plane" style="font-size: 20px;" aria-hidden="true"></i></div> <div class="f13 c-head m-top5">Invite</div></label> </td></tr></table>');

                if($('.no-contact').length>0)
                {   
                    this.changeFooterHtml('add_new')
                }
                
                if(source!='append_bottom')
                {
                    $('[data-toggle="tooltip"]').tooltip();
                     if(pageType=='thankyou_new' && $('#no_display_param').length==0  && $.urlParam('source')=='oneclickemail' && ($.urlParam('utm_term')=='inviteContact'))
                    {
                        $('#invite_success').append('<h5 class="notice f16 mt-0">Invite sent successfully!!!</h5>');
                        if(pageType=='thankyou_new' && $('#no_display_param').length==0)
                        {
                            $('body').append('<input type="hidden" id="no_display_param" value="1"/>');
                        }
                    }
                    $('#myContactsModal').modal('show');
                    if(this.style=='addStyle'){
                        if(deviceFlag==1)
                        {
                            $('#myContactsModal').css('padding-right','unset')
                            $('#myContactsModal').css('padding-right','0px!important');
                            $('#contact_list_invite').css('height','68%');
                        }
                    }
                    var self = this;
                    $('.invitetabcontent').bind('scroll', function() { 
                        if (($(this).scrollTop() + $(this).innerHeight() >=  $(this)[0].scrollHeight)) {     
                            self.makeAjaxContacts(this,'append_bottom');
                        } 
                    }); 
                    $('#contact_search').keyup(function() {
                            clearTimeout(self.timeoutID);
                            console.log(self.timeoutID);
                            var $this = $(this); 
                            self.timeoutID = setTimeout(function(){self.search($this.val())}, 1000);
                     });
                    if(typeof $('#myContactsModal')!='undefined' && typeof $('#isContactOpened').val()=='undefined')
                        $('body').append('<input type="hidden" id="isContactOpened" value="1">')
                }
                if(source=='search')
                {
                    $('.sendtoall').hide();
                    if(dis.content.search.length>0)
                    {
                        $('#select_all_btn').parent().parent().css('display','inline-flex');
                        $('#select_all_btn').parent().parent().prev().css('display','inline');
                    }
                }
                else
                    $('.sendtoall').show()

                    if(($('#contact-content_invite').css('display')!='block' && $('.no-contact').css('display')!='block'))
                        $('.modal-footer td').addClass('disabled');
                    else
                        $('.modal-footer td').removeClass('disabled');
                    if($('.no-contact').length>0) 
                        $('.invite_footer td').first().addClass('disabled');
                    $('#social_media').removeClass('disabled');
                    this.changeInvite();
            }


        }


    }
function getContactInviteModalData(widget){
    var content=[];
    switch(page_type){
        case 'live' :
        case 'thankyou_new' :
        case 'about':
        case 'visitors':
        case 'comments':
        case 'exhibitors':
        case 'photos-videos':
        case 'speakers':
        case 'deals':
        case 'Event Listing':
        case 'top100':
        case 'udash_recommendation':
        case 'mdashRecommendation':
        case 'homepage':
        case 'dashboard_events':
            if(typeof widget!='undefined')
            {
                var widget=widget.toString()
                var check_rec=widget.split('_')[0];
                if(typeof check_rec!='undefined' && (check_rec=='rec' || check_rec=='detail'))
                    var id = widget.split('_')[1];
                else
                    var id = $('#eventID').val();
            }
            else
                var id = $('#eventID').val();
            content={
                event_id : id,
            }
            break;
        case 'udash_connections' :
            content=otherCon;
            break;
    }
    contactModalHtml.data=content;
}

class Tooltip {
    //made a global class to show tooltips (classname : tooltip-box) based on params :  data-tooltip-content:<html body>, data-tooltip (top,bottom,right,left), 
    constructor(ele) {
        this.ele = ele;
    }
    setTooltip(){
        $( this.ele ).mouseenter( this.appendTooltip ).mouseleave( this.removeTooltip );
    }
    appendTooltip(){
        if ($(this).find('.tooltip-box').length > 0) {
            $(this).find('.tooltip-box').css('display','block');
        }else{
            let dim = (this).getBoundingClientRect();
            let ele_width = window.innerWidth*.35; 
            let position = '';
            var width_tltp = {'left':455,'right':455,'top':227,'bottom':264};
            let arrow = '';
            //setting width, position, height to tooltips, can be changed by window (height pending)
            switch($(this).attr('data-tooltip')){
                case 'left' : position = 'right: '+(dim.width)+'px;top: -20px;';
                              ele_width = (ele_width > dim.left-20 ? dim.left-50 : ele_width);
                              arrow = 'right';
                              break;
                case 'right' : position = 'margin-left: 10px;left: '+(dim.width)+'px;top: -20px;';
                              ele_width = (ele_width > (window.innerWidth-dim.right-20) ? dim.right-50 : ele_width);
                              arrow = 'left';
                              break;
                case 'top' : position = 'bottom: '+(dim.height)*6.3+'px;';
                              arrow = 'bottom';
                              break;
                case 'bottom' : position = 'top: '+(dim.height)+'px;';
                              arrow = 'top';
                              break;            
            }
            //appending tooltip content to the selector.
            if($(this).attr('data-bottom')){
                if($('#cityName').val() == 'Online'){
                position = 'bottom: '+$(this).attr('data-bottom')+'px;'+'margin-left:'+'23px;';
                arrow = 'online-tooltip';
                }else{
                position = 'bottom: '+$(this).attr('data-bottom')+'px;';
                arrow = 'tooltip';
                }
            }
            let box = $('<div class="box tooltip-box" style="width: '+ width_tltp[$(this).attr('data-tooltip')] +'px;'+position+'"><span class="arrow-'+arrow+'"></span><span class="arrow-'+arrow+'-2"></span>'+$(this).attr('data-tooltip-content')+'</div>');
            $(this).css('position','relative').append(box);
        }
    }
    removeTooltip(){
        //removes tooltip on exit hover
        $(this).find('.tooltip-box').css('display','none');
    }
}

function internal__User(callback) {
    var url = site_url_attend + "/ajax?for=internalUser&check_user=1";
    $.ajax({
        type: "POST",
        url: url,
        dataType: "json",
        success: function(n) {
            //live for all  so n=1 ;
            n=1;
            callback(n);
        } 
    });
      
}





//--------------------------------------------venue compare-----------------------------------------------------------

function addCompareVenuesCount(){
   
    $('.addsign').css('display','inline');
    $('.compare_btn_listing').css('color','#333');
    $(".comp_venues_count_top").css("display", "none");
    var v_count_numeric = 0;
    var top_venue_id = $('.comp_btn').attr('data-id');
    for (var i = 1; i < 5; i++) 
    {
        if( getCookie("venue_id"+i) != "" )
        {
            if (getCookie("venue_id"+i) == top_venue_id) {
                $(".comp_venues_count_top").css("display", "inline");
            }
            v_count_numeric++;
            $(".addsign"+getCookie("venue_id"+i)).css("display","none");
            $('.compare_btn_listing'+getCookie("venue_id"+i)).css('color','#23527c');
        }
    }
    if(v_count_numeric != 0)
    {
        $(".venue_count_span").remove();
        $(".comp_venues_count").append(" <span class='venue_count_span'>("+v_count_numeric+")</span>");
        $(".comp_venues_count_top").append(" <span class='venue_count_span'>"+v_count_numeric+"</span>");
        $(".comp_venues_count_RB").append("<span class='venue_count_span'>"+v_count_numeric+"</span>");
        $(".compare_RB_btn").css("display", "block");
    }
    else{
        $(".venue_count_span").remove();
        $(".compare_RB_btn").css("display", "none");
    }
    
}


function addRBVenuesOnPageLoad()
{
   
    $('.RBvenues').remove();
    for (var i = 1; i < 5; i++) 
    {    
        if( getCookie("venue_id"+i) != "" )
        {
            venueAddToRB(i,getCookie("venue_id"+i),getCookie("venue_name"+i),getCookie("venue_cityName"+i),getCookie("venue_imgMap"+i));
        }
        
    }
    
}


function venueAddToRB(v_sn, venueId,venue_name,cityName,imgMap){
    var n = venue_name.length;
    if(n>30)
    {
         RBhtml = '<div class="RBVenuesCss RBvenues RBvenue'+venueId+'">'+
                    '<div onclick="removeVenuefromRB('+venueId+');" class="removeBtnInRB">&#10005;</div>'+
                    '<img style="width: 100%; height: 106px; border-radius: 5px;" src="'+imgMap+'">'+
                    '<div style="padding: 8px;">'+
                        '<span class="v_card_text" style="font-weight:bold;">'+venue_name.slice(0, 27)+'...</span>'+
                        '<br>'+
                        '<span class="v_card_text text-muted">'+cityName+'</span>'+
                    '</div>'+
                '</div>';
    }
    else{
        RBhtml = '<div class="RBVenuesCss RBvenues RBvenue'+venueId+'">'+
                    '<div onclick="removeVenuefromRB('+venueId+');" class="removeBtnInRB">&#10005;</div>'+
                    '<img style="width: 100%; height: 106px; border-radius: 5px;" src="'+imgMap+'">'+
                    '<div style="padding: 8px">'+
                        '<span class="v_card_text" style="font-weight:bold;">'+venue_name+'</span>'+
                        '<br>'+
                        '<span class="v_card_text text-muted">'+cityName+'</span>'+
                    '</div>'+
                '</div>';
    }
    $(".compare_RB_venues").append(RBhtml);

}

function removeVenuefromRB(venueId)
{
    var venue_count = 0;
    //console.log(venueId);
    for (var i = 1; i < 5; i++) 
    {    
        if( getCookie("venue_id"+i) == venueId )
        {
            $(".addsign"+getCookie("venue_id"+i)).css("display","inline");
            $('.RBvenue'+getCookie("venue_id"+i)).remove();
            deleteCookie('venue_id' + i);
            addCompareVenuesCount();
        }
        if( getCookie("venue_id"+i) != "" )
        {
            venue_count++;
        }
    }
    if(venue_count == 1)
    {
        $('.remove_compare_RB_btn').css("display","none");
        $('.compare_RB_venus_box').css("display","none");
        $('.compare_RB_venus_box').css("min-width", "166px");

    }
    if(venue_count < 1)
    {
        $(".compare_RB_btn").css("display","none");
        $('.remove_compare_RB_btn').css("display","none");
    }
    
}


function removeAllVenues(){
    for (var i = 1; i < 5; i++) 
    {    
        if( getCookie("venue_id"+i) != "" )
        {
            $(".addsign"+getCookie("venue_id"+i)).css("display","inline");
            $('.RBvenue'+getCookie("venue_id"+i)).remove();
            deleteCookie('venue_id' + i);
            addCompareVenuesCount();
        }
    }
    $(".compare_RB_btn").css("display","none");
    $('.remove_compare_RB_btn').css("display","none");
}

function addVenueToCookie(dis,venue_id = null,venue_name = null,cityName = null, imgMap = null){
        
    console.log(venue_id);
    var venue_id1 = getCookie("venue_id1");
    var venue_id2 = getCookie("venue_id2");
    var venue_id3 = getCookie("venue_id3");
    var venue_id4 = getCookie("venue_id4");
    var gaEventSource = $(dis).attr("data-gaEventSource");
    gaEvent(gaEventSource, 'compare venues');
    addCompareVenuesCount();   
    if(venue_id1 != venue_id && venue_id2 != venue_id && venue_id3 != venue_id && venue_id4 != venue_id && venue_id != null){
        if(venue_id1 == "")
        {
            document.cookie = "venue_id1="+venue_id+";";
            document.cookie = "venue_name1="+venue_name+";";
            document.cookie = "venue_cityName1="+cityName+";";
            document.cookie = "venue_imgMap1="+imgMap+";";
             addCompareVenuesCount();
             venueAddToRB(1,venue_id,venue_name,cityName,imgMap);
        }
        else if(venue_id2 == "")
        {
            document.cookie = "venue_id2="+venue_id+";";
            document.cookie = "venue_name2="+venue_name+";";
            document.cookie = "venue_cityName2="+cityName+";";
            document.cookie = "venue_imgMap2="+imgMap+";";
             addCompareVenuesCount();
              venueAddToRB(2,venue_id,venue_name,cityName,imgMap);
        }
        else if(venue_id3 == "")
        {
            document.cookie = "venue_id3="+venue_id+";";
            document.cookie = "venue_name3="+venue_name+";";
            document.cookie = "venue_cityName3="+cityName+";";
            document.cookie = "venue_imgMap3="+imgMap+";";
             addCompareVenuesCount();
              venueAddToRB(3,venue_id,venue_name,cityName,imgMap);
        }
        else if(venue_id4 == "")
        {
            document.cookie = "venue_id4="+venue_id+";";
            document.cookie = "venue_name4="+venue_name+";";
            document.cookie = "venue_cityName4="+cityName+";";
            document.cookie = "venue_imgMap4="+imgMap+";";
            addCompareVenuesCount();
            venueAddToRB(4,venue_id,venue_name,cityName,imgMap);
        }
        else{
            
            //alert("remove venue to add more!");
            $(".alert_msg_span").remove();
            $(".venue_alert_msg").append(`<span class="alert_msg_span"><h4>Please remove venue to add more!</h4></span>`);
            $('#myModal_alert').modal('show');
        }
        
        onAddionRBVisibility();
        
        
    }
    else
    {

        var v_count_numeric = 0;
        for (var i = 1; i < 5; i++) 
        {
            if( getCookie("venue_id"+i) != "" )
            {
                v_count_numeric++;
            }
        }

        if(v_count_numeric < 2){
            //alert("Please add one more venue to compare.");
            $(".alert_msg_span").remove();
            $(".venue_alert_msg").append(`<span class="alert_msg_span"><h4>Please add one more venue to compare!</h4></span>`);
            $('#myModal_alert').modal('show');
        }
        else{
            var url = site_url_attend + "/ajax?for=compareVenueData&venue_id1="+venue_id1+"&venue_id2="+venue_id2+"&venue_id3="+venue_id3+"&venue_id4="+venue_id4;
            $(".loaders").css("display","block");
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                success: function(result) {
                    //console.log("ghhjnjn");
                    getdatatoappend(result);
                } 
            });
        }
    }
    //console.log(document.cookie);
}



const getdatatoappend = (result) =>{
    console.log(result);
    var count = 0;
    removeVenueFromComp();
    $.each( result, function( key, value ) {
        count++;
        var v_sn = parseInt(key)+1;
        appendDatatoModal(value,v_sn);
    });
    //console.log(compareModalHeading);
    var v_count_words;
    if(count == 2)
    {  
        v_count_words = "one"; 
    }
    if(count == 3)
    {   
        v_count_words = "two";   
    }
    if(count == 4)
    {
        v_count_words = "three"; 
               
    }
    console.log(count);
    $(".comp_venue_title_span").remove();
    $(".venue_compare_title").append("<span class='comp_venue_title_span'>Selected "+count+" Venues- <span class='venue_name_and_count'><strong>"+result[0].data.basic.name+"</strong> and <strong>"+v_count_words+" other</strong></span></span>");
    $(".loaders").css("display","none");
    $('#myModal_v').modal('show');
}



const appendDatatoModal = (result,v_sn) =>{

    if(result.data.location.mapImage == null || result.data.location.mapImage == "" || result.data.location.mapImage == "null")
    {
        $(".venue_img"+v_sn).append("<div class='venue_img_span"+v_sn+"'><img src="+result.data.basic.wrapper+"><div onclick='removeVenueFromComp("+v_sn+","+result.data.basic.id+");' class='removeBtn"+v_sn+"'>&#10005;</div></div>");
                /*$(".venue_img"+v_sn).append("<div class='venue_img_span"+v_sn+"'><img src="+result.data.basic.wrapper+"></div>");*/
    }
    else{
        $(".venue_img"+v_sn).append("<div class='venue_img_span"+v_sn+"'><img src="+result.data.location.mapImage+"><div onclick='removeVenueFromComp("+v_sn+","+result.data.basic.id+");' class='removeBtn"+v_sn+"'>&#10005;</div></div>");
                /*$(".venue_img"+v_sn).append("<div class='venue_img_span"+v_sn+"'><img src="+result.data.basic.logo+"></div>");*/
    }

    $(".venue_name"+v_sn).append("<span class='venue_name_span"+v_sn+"'>"+result.data.basic.name+"<span>");

    $(".venue_addr"+v_sn).append("<span class='venue_addr_span"+v_sn+"'>"+result.data.location.cityName+", "+result.data.location.countryName+"<span>");

    var cate_html = "";
    for (var i = 0; i < result.data.category.length; i++) {
        cate_html = (i < result.data.category.length-1) ? cate_html+result.data.category[i].name+", " : cate_html+result.data.category[i].name;
    }
    $(".venue_type"+v_sn).append("<span class='venue_type_span"+v_sn+"'>"+cate_html+"<span>");


    var text_rating="";
    if(result.data.stats.rating == 0.0)
    {
        var rating = 3;
    }
    else{
        var rating = Math.round(result.data.stats.rating); 
    }
    text_rating='<table><tr><td><div class="rv_highlights__score_bar" style="margin: 5px 0; max-width:96px;">';
    for (var i = 0; i < 5; i++) {
        if(i < rating)
        {   
            if (result.data.stats.rating >= 4) {
                text_rating = text_rating+'<div class="block" style="background-color:green;"></div>';
            }
            else{
                text_rating = text_rating+'<div class="block" style="background-color:orange;"></div>';
            }         
        }
        else{

            text_rating = text_rating+'<div class="block blank-bar"></div>';
        }
    }

    if (result.data.stats.rating >= 4) {
        text_rating = text_rating+'</div></td><td style="width:46%; color:green;">'+result.data.stats.rating+'</td></tr><tr><td colspan=2><span style="color:grey;"><small>'+result.data.stats.totalRatingCount+' Ratings</small></span></td></tr></table>';
    }
    else if(result.data.stats.rating == 0.0){
        text_rating = text_rating+'</div></td><td style="width:46%; color:orange;">3</td></tr></table>';
    }
    else
    {
        text_rating = text_rating+'</div></td><td style="width:46%; color:orange;">'+result.data.stats.rating+'</td></tr><tr><td colspan=2><span style="color:grey;"><small>'+result.data.stats.totalRatingCount+' Ratings</small></span></td></tr></table>';
    }

    $(".venue_ratings"+v_sn).append("<span class='venue_ratings_span"+v_sn+"'>"+text_rating+"</span>");
    var meeting_rooms = (result.data.stats.subvenueCount != 0) ? result.data.stats.subvenueCount:"N/A"; 

    $(".venue_meeting_rooms"+v_sn).append("<span class='venue_meeting_rooms_span"+v_sn+"'>"+meeting_rooms+"</span>");

    var area = (result.data.stats.area != null) ? result.data.stats.area+" Sq.m.":"N/A";
    $(".venue_area"+v_sn).append("<span class='venue_area_span"+v_sn+"'>"+area+"</span>");

    if(result.data.stats.largestArea != null)
    {
        var largestArea = result.data.stats.largestArea;
        var max_hall_capacity =  Math.round(((largestArea * 10.764)/12));
        max_hall_capacity = Math.abs(max_hall_capacity);
        $(".venue_max_hall_cap"+v_sn).append("<span class='venue_max_hall_cap_span"+v_sn+"'>"+max_hall_capacity+" Persons</span>");
    }else{
        $(".venue_max_hall_cap"+v_sn).append(`<span class='venue_max_hall_cap_span${v_sn}'>N/A</span>`);
    }
    $(`.get_quotes_btn${v_sn}`).css("display", "block");

    var totalEvents = (result.data.stats.totalEvents != null) ? result.data.stats.totalEvents:"N/A"; 
    $(".venue_events"+v_sn).append("<span class='venue_events_span"+v_sn+"'>"+totalEvents+"</span>");

    var highlyRatedFor = (result.data.stats.highlyRatedFor != null) ? result.data.stats.highlyRatedFor:"N/A"; 
    $(".venue_highlyRatedFor"+v_sn).append("<span class='venue_highlyRatedFor_span"+v_sn+"'>"+highlyRatedFor+"</span>");

    var getQoutsBtn = '<span class="get_quotes_btn'+v_sn+'"><button aria-label="quotes button" type="button" class="btn btn-default modal_getQouts_btn" onclick="contact_organizer(this);" data-source="compare_venues" data-id = '+result.data.basic.id+' data-venue_name = "'+result.data.basic.name+'"><small>Get Quotes</small></button></span>';
    $(".getQuotes"+v_sn).append(getQoutsBtn);
}


const removeVenueFromComp =(v_sn = null,v_id)=>{
    if(v_sn == null)
    {
        for (var i = 1; i < 5; i++) {
            $(".venue_img_span"+i).remove();
            $(".venue_name_span"+i).remove();
            $(".venue_addr_span"+i).remove();
            $(".venue_type_span"+i).remove();
            $(".venue_ratings_span"+i).remove();
            $(".venue_meeting_rooms_span"+i).remove();
            $(".venue_build_year_span"+i).remove();
            $(".venue_renovated_year_span"+i).remove();
            $(".venue_area_span"+i).remove();
            $(".venue_max_hall_cap_span"+i).remove();
            //$(".getQuotes1_span"+v_sn).remove();
            $(`.venue_events_span${i}`).remove();
            $(`.venue_highlyRatedFor_span${i}`).remove();
            $(`.get_quotes_btn${i}`).remove();
            //$(`.get_quotes_btn${i}`).css("display", "none");
        }
    }
    else{
        
        $(".venue_img_span"+v_sn).remove();
        $(".venue_name_span"+v_sn).remove();
        $(".venue_addr_span"+v_sn).remove();
        $(".venue_type_span"+v_sn).remove();
        $(".venue_ratings_span"+v_sn).remove();
        $(".venue_meeting_rooms_span"+v_sn).remove();
        $(".venue_build_year_span"+v_sn).remove();
        $(".venue_renovated_year_span"+v_sn).remove();
        $(".venue_area_span"+v_sn).remove();
        $(".venue_max_hall_cap_span"+v_sn).remove();
        $(`.venue_events_span${v_sn}`).remove();
        $(`.venue_highlyRatedFor_span${v_sn}`).remove();
        $(`.get_quotes_btn${v_sn}`).remove();
        //$(`.get_quotes_btn${v_sn}`).css("display", "none");
        $(`.RBvenue${v_id}`).remove();
        comapreModalHeading(v_sn);
        rearangeVenues(v_sn,v_id); 
        addCompareVenuesCount(); 
    }
    
}


const rearangeVenues = (v_sn,v_id) =>{

    for (var i =  1; i < 5; i++) 
    {
        if(v_id == getCookie("venue_id"+i))
        {
            deleteCookie('venue_id' + i);
            $(".addsign"+v_id).css("display","inline");
        }
    }

}


function comapreModalHeading(v_sn){
    var v_count = 0;
    var v_name;
    var ch = 0;
    for( var i = 1; i < 5; i++)
    { 
        if ( $(".venue_name_span"+i).text() != "") 
        { 
            v_count++;

            if(ch == 0)
            {
                ch = 1;
                v_name = $(".venue_name_span"+i).text();
            }
            
        }
    
    }
    var v_count_words;
    if(v_count == 2)
    {  
        v_count_words = "one"; 
    }
    if(v_count == 3)
    {   
        v_count_words = "two";   
    }
    if(v_count == 4)
    {
        v_count_words = "three";           
    }
    console.log(v_count);
    if(v_count == 1)
    {
        $(".comp_venue_title_span").remove();
        $(".venue_compare_title").append("<span class='comp_venue_title_span'>Selected "+v_count+" Venue- <span class='venue_name_and_count'><strong>"+v_name+"</strong></span></span>");
    }
    else if(v_count == 0)
    {
        $('#myModal_v').modal('toggle');
        $(".comp_venue_title_span").remove();
        $(".venue_compare_title").append("<span class='comp_venue_title_span'>Selected "+v_count+" Venues- </span>");
    }
    else
    {
        $(".comp_venue_title_span").remove();
        $(".venue_compare_title").append("<span class='comp_venue_title_span'>Selected "+v_count+" Venues- <span class='venue_name_and_count'><strong>"+v_name+"</strong> and <strong>"+v_count_words+" other</strong></span></span>");
    }
    

}


//on hover actions on bottom right button of compare
$('.compare_RB_btn').hover(function() {
    $('.compare_RB_venus_box').css('display', 'block');
    var v_count_numeric = 0;
    for (var i = 1; i < 5; i++) 
    {
        if( getCookie("venue_id"+i) != "" )
        {
            v_count_numeric++;
        }
    }
    if(v_count_numeric > 1)
    {
        $('.remove_compare_RB_btn').css('display', 'block');
        $('.compare_RB_venus_box').css("min-width", "328px");
    }
  }, function() {
    // on mouseout, reset the style 
    $('.compare_RB_venus_box').css('display', 'none');
    $('.remove_compare_RB_btn').css('display', 'none');
     $('.compare_RB_venus_box').css("min-width", "166px");
     
});

$('.compare_RB_venus_box').hover(function() {
    $('.compare_RB_venus_box').css('display', 'block');
    var v_count_numeric = 0;
    for (var i = 1; i < 5; i++) 
    {
        if( getCookie("venue_id"+i) != "" )
        {
            v_count_numeric++;
        }
    }
    if(v_count_numeric > 1)
    {
        $('.remove_compare_RB_btn').css('display', 'block');
         $('.compare_RB_venus_box').css("min-width", "328px");
    }
    
  }, function() {
    // on mouseout, reset the style 
    $('.compare_RB_venus_box').css('display', 'none');
    $('.remove_compare_RB_btn').css('display', 'none');
     $('.compare_RB_venus_box').css("min-width", "166px");
});
$('.remove_compare_RB_btn').hover(function() {
    $('.compare_RB_venus_box').css('display', 'block');
    $('.remove_compare_RB_btn').css('display', 'block');
    $('.compare_RB_venus_box').css("min-width", "328px");
    var v_count_numeric = 0;
    for (var i = 1; i < 5; i++) 
    {
        if( getCookie("venue_id"+i) != "" )
        {
            v_count_numeric++;
        }
    }
  }, function() {
    // on mouseout, reset the style 
    $('.compare_RB_venus_box').css('display', 'none');
    $('.remove_compare_RB_btn').css('display', 'none');
    $('.compare_RB_venus_box').css("min-width", "166px");
});

//end on hover actions on bottom right button of compare

function onAddionRBVisibility(){
    $('.compare_RB_venus_box').css('display', 'none');
    $('.remove_compare_RB_btn').css('display', 'none');
    $('.compare_RB_venus_box').css("min-width", "166px"); 
    $('.compare_RB_venus_box').css('display', 'block');
    var v_count_numeric = 0;
    for (var i = 1; i < 5; i++) 
    {
        if( getCookie("venue_id"+i) != "" )
        {
            v_count_numeric++;
        }
    }
    if(v_count_numeric > 1)
    {
        $('.remove_compare_RB_btn').css('display', 'block');
        $('.compare_RB_venus_box').css("min-width", "328px");
    }
    setTimeout(function(){

        $('.compare_RB_venus_box').css('display', 'none');
        $('.remove_compare_RB_btn').css('display', 'none');
        $('.compare_RB_venus_box').css("min-width", "166px"); 

    }, 3000);
}

window.addEventListener('DOMContentLoaded', function() {
  // back button control start
  if (deviceFlag == 0) {
    if (document.referrer && document.referrer.search('10times.com') < 0) {
      if (document.getElementById('backUrl') && !getCookie('controlBack')) {
        setCookie('controlBack', true, 0);
        setCookie('controlBackUrl', document.getElementById('backUrl').value, 0);
      }
    }

    if (getCookie('controlBack') == "true") {
      let isSetBackUrl = false;
      let isEventPage = true;
      let backUrl = getCookie('controlBackUrl');
      let currentPath = location.href;

      if(backUrl == "") return false;
      backUrl  = JSON.parse(backUrl);

      for (var x = 0; x < backUrl.length; x++) {
        if (backUrl[x] == currentPath.split("?")[0].split("#")[0]) {   
          isSetBackUrl = true ;

          if (x < backUrl.length - 1) {
            isEventPage = false ;

            if(x > 0 && backUrl[x] != document.referrer) {
              setCookie('controlBack', false, 0);
              return false;
            }

            let firstPageUrl = backUrl[x+1];
            history.replaceState(null, '', firstPageUrl);
            history.pushState(null, document.title, currentPath);
            window.addEventListener("popstate", function() { 
              location.reload();
            });
          }
        }
      }
      
      if (isSetBackUrl == false) {
        setCookie('controlBack', false, 0);
        window.addEventListener("popstate",function() { 
          location.reload();
        });
      }

      if (isSetBackUrl ==  true && isEventPage == true) setCookie('controlBackUrl', '', 0);
    } else if (getCookie('controlBack') == "false") {
      window.addEventListener("popstate",function() {
        location.reload();
      });
    }
  } else {
    if(getCookie('controlBack') == "true") {
      window.addEventListener("popstate", function() {
        setCookie('controlBack', false, 0);
        history.back();
      });
    }
    
    if(document.referrer && document.referrer.search('10times.com') < 0) {
      if (location.pathname != 'events' && document.getElementById('newBackUrl') && !getCookie('controlBack')) {
        history.pushState(null, document.title, '');

        if(getCookie('controlBack') == "true") {
          window.addEventListener("popstate", function() {
            setCookie('controlBack', false, 0);
            location.replace(JSON.parse(document.getElementById('newBackUrl').value));
          });
        }

        setCookie('controlBack', false, 0);
      }
    }
  }
  // back button control end

});

// gmail page share

function auth() {
  gapi.client.setApiKey(apiKey), window.setTimeout(checkAuth, 3)
  gapi.client.init({
    apiKey: apiKey,
    clientId: clientId,
    scope: scopes
  });
}

function checkAuth() {
  gapi.auth.authorize({
    client_id: clientId,
    scope: scopes,
    immediate: !1
  }, handleGAuthResult)
}

function handleGAuthResult(a) {
  getModal({id: 'myModalinvite'});
    //if page is Thankyou page
    if ((typeof page_type!=='undefined' )&&(page_type=="thankyou")) {
            a && !a.error && $.getJSON("https://www.googleapis.com/m8/feeds/contacts/default/full?alt=json&access_token=" + a.access_token + "&max-results=500&v=3.0", function(b) {
                auth_data = b.feed.author,
            gmailfriends1 = [], gmailfriends2 = "", $("#send").removeAttr("disabled"), flag = 0, $("#mrselect").empty(), $("#mrselect").append('<input type="checkbox"  class="mr" onchange="selectall(this);"> Select all Friends <span style="font-size:11px; color:#727272; line-height:18px"></span>'), modal_content = "", modal_content += "";
            for (var c = [], d = b.feed.entry, e = d.length, f = 2, g = 0, h = 0; h < e; h++)
                if (c[g] = [], "undefined" != typeof d[h].gd$email) {
                    c[g].email = d[h].gd$email[0].address, gmailfriends2 = gmailfriends2 + c[g].email + ",", "undefined" != typeof d[h].gd$name && "undefined" != typeof d[h].gd$name.gd$fullName.$t ? c[g].name = d[h].gd$name.gd$fullName.$t : c[g].name = "";
                    var i = d[h].id.$t,
                        j = i.split("/");
                    c[g].ContactId = j[j.length - 1], c[g].picurl = "https://www.google.com/m8/feeds/photos/media/default/" + c[g].ContactId + "?access_token=" + a.access_token + "&v=3.0", g++
                }
                bulkUserImport(c);
            modal_content += '<div style="height:200px; overflow-y:scroll; overflow-x:hidden">';
            for (var h = 0; h < g; h++) 2 != f ? (modal_content = modal_content + '<div class="col-md-6 pdb1"><div class="bgebf6ff"><table class="mr" cellpadding="0" cellspacing="0"><tbody><tr><td width="30" align="center" valign="middle"><input type="checkbox" class="mr" onchange="emailarray(this);"></td><td width="50" class="pdt1 pdb1"><img class="img-rounded" src="https://c1.10times.com/img/no-pic.jpg" data-src="' + c[h].picurl + '"></td><td style="font-size:12px; line-height:16px"><b>' + c[h].name + "</b><br><span class='email'>" + c[h].email + "</span></td></tr></tbody></table></div></div></div>", f++) : (modal_content = modal_content + '<div class="row"><div class="col-md-6 pdb1"><div class="bgebf6ff"><table class="mr" cellpadding="0" cellspacing="0"><tbody><tr><td width="30" align="center" valign="middle"><input type="checkbox" class="mr" onchange="emailarray(this);"></td><td width="50" class="pdt1 pdb1"><img class="img-rounded" src="https://c1.10times.com/img/no-pic.jpg" data-src="' + c[h].picurl + '"></td><td style="font-size:12px; line-height:16px"><b>' + c[h].name + "</b><br><span class='email'>" + c[h].email + "</span></td></tr></tbody></table></div></div>", f = 1);
            g % 2 != 0 && (modal_content += "</div>"), modal_content += "</div>", $("#myModal5 .modal-body").empty(), $("#myModal5 .modal-body").append(modal_content), $("#myModal1").modal("hide"), $("#myModal5").modal("show"), $("#myModal").modal("hide")
        })
    } else {
      a && !a.error && $.getJSON("https://www.googleapis.com/m8/feeds/contacts/default/full?alt=json&access_token=" + a.access_token + "&max-results=500&v=3.0", function(b) {
            if ($('#fromSection').length == 1) var e_id = $('#fromSection').val();
            if ($('#fromWidget').length == 1) var fromWidget = 1;
            if ($('#fromUserJourney').length == 1) var fromUserJourney = 1;
            if ($('#invite_modal').length == 1) var invite_modal = 1;
            if ($('#share_icon_modal').length == 1) var share_icon_modal = 1;
            auth_data = b.feed.author,
            gmailfriends1 = [];
            gmailfriends2 = "";
            gmailname1 = [];
            gmailname2 = "";
            flag = 0;
            modal_content = "";

            if (document.getElementById('send')) document.getElementById('send').disabled = false;
            document.querySelector('#myModalinvite .modal-dialog').classList.add('modal-lg');
            document.querySelector('#myModalinvite .modal-title').innerHTML = 'Invite Friends';
            
            let modal_body = `
              <div class="d-flex justify-content-between align-items-center px-2" style="height: 70px; background:#efefef;">
                <div id="mrselect">
                  <input class="me-2" onchange="selectall(this);" type="checkbox">
                  Select all Friends
                  <span style="font-size:11px; color:#727272; line-height:18px"></span>
                </div>

                <div class="text-end">
                  <button id="send" class="btn btn-primary btn-sm" onclick="sendemailall(this);">Send</button>
                </div>
              </div>
            `;
            
            if (typeof e_id!='undefined' && e_id!='') modal_body += `<input type="hidden" id="fromSection" value="${e_id}">`;
            if (typeof fromWidget!='undefined' && fromWidget!='') modal_body += `<input type="hidden" id="fromSection" value="fromWidget">`;
            if (typeof fromUserJourney!='undefined' && fromUserJourney!='') modal_body += `<input type="hidden" id="fromUserJourney" value="fromUserJourney">`;
            if (typeof invite_modal!='undefined' && invite_modal!='') modal_body += `<input type="hidden" id="invite_modal" value="invite_modal">`;
            if (typeof share_icon_modal!='undefined' && share_icon_modal!='') modal_body += `<input type="hidden" id="share_icon_modal" value="share_icon_modal">`;

            if (getCookie('user') && getCookie('user_token')) {
                hideloading();
                for (var c = [], d = b.feed.entry, e = d.length, f = 2, g = 0, h = 0; h < e; h++)
                    if (c[g] = [], "undefined" != typeof d[h].gd$email) {
                        c[g].email = d[h].gd$email[0].address, gmailfriends2 = gmailfriends2 + c[g].email + ",", "undefined" != typeof d[h].gd$name && "undefined" != typeof d[h].gd$name.gd$fullName.$t ? c[g].name = d[h].gd$name.gd$fullName.$t : c[g].name = "", gmailname2 = gmailname2 + c[g].name + "," ;
                        var i = d[h].id.$t,
                            j = i.split("/");
                        c[g].ContactId = j[j.length - 1], c[g].picurl = "https://www.google.com/m8/feeds/photos/media/default/" + c[g].ContactId + "?access_token=" + a.access_token + "&v=3.0", g++
                    }
                    if($('#myContactsModal').is(':visible'))
                            bulkUserImport(c,1,'gmail');
                        else
                            bulkUserImport(c,'','gmail');
                if (!$('#myContactsModal').is(':visible')) {
                  modal_body += `<div class="row" style="overflow-x:hidden">`;
                  for (var h = 0; h < g; h++) {
                    modal_body += `
                      <div class="col-12 col-md-6 my-2">
                        <div class="d-flex small text-muted align-items-center px-2" style="height: 60px; background-color: #ebf6ff;">
                          <input type="checkbox" class="me-2" onchange="emailarray(this);" />
                          <img class="rounded me-2" src="${c[h].picurl ? c[h].picurl : 'https://c1.10times.com/img/no-pic.jpg'}" width="40" width="40" alt="${c[h].name.substring(0,3)}" />

                          <div class="d-flex flex-column">
                            <b>${c[h].name}</b>
                            <small class="email">${c[h].email}</small>
                          </div>
                        </div>
                      </div>
                    `;
                  }
                  modal_body += `<div>`;
                  document.querySelector('#myModalinvite .modal-body').innerHTML = modal_body;
                  modals['myModalinvite'].show();
                  $("#myModal").modal("hide");
                }
            } else {
                a && !a.error && $.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + a.access_token, function(z){
                    var data = {
                        metadata: JSON.stringify(z),
                        name: z.name,
                        email: z.email,
                        source: "import",
                        action:'signup',
                        loginMethod: 'gplus'
                    };
                    hitAuth(data,'import','import','','',function(){
                        hideloading();
                        for (var c = [], d = b.feed.entry, e = d.length, f = 2, g = 0, h = 0; h < e; h++)
                            if (c[g] = [], "undefined" != typeof d[h].gd$email) {
                                c[g].email = d[h].gd$email[0].address, gmailfriends2 = gmailfriends2 + c[g].email + ",", "undefined" != typeof d[h].gd$name && "undefined" != typeof d[h].gd$name.gd$fullName.$t ? c[g].name = d[h].gd$name.gd$fullName.$t : c[g].name = "", gmailname2 = gmailname2 + c[g].name + "," ;
                                var i = d[h].id.$t,
                                    j = i.split("/");
                                c[g].ContactId = j[j.length - 1], c[g].picurl = "https://www.google.com/m8/feeds/photos/media/default/" + c[g].ContactId + "?access_token=" + a.access_token + "&v=3.0", g++
                            }
                        if($('#myContactsModal').is(':visible'))
                            bulkUserImport(c,1,'gmail');
                        else
                            bulkUserImport(c,'','gmail');

                        if(!$('#myContactsModal').is(':visible'))
                        {
                            modal_content += '<div style="height:200px; overflow-y:scroll; overflow-x:hidden">';
                            for (var h = 0; h < g; h++) 2 != f ? (modal_content = modal_content + '<div class="col-md-6 margin"><table class="mr" cellpadding="10" cellspacing="10" width="100%"><tbody><tr bgcolor="#ebf6ff"><td width="30" align="center" valign="middle"><input type="checkbox" class="mr" onchange="emailarray(this);"></td><td width="40" class="pdt1 pdb1"><img class="img-rounded img-responsive" src="https://c1.10times.com/img/no-pic.jpg" data-src="' + c[h].picurl + '"></td><td>&nbsp;<b>' + c[h].name + "</b><br>&nbsp;<small><nobr class='email'>" + c[h].email + "</nobr></small></td></tr></tbody></table></div></div>", f++) : (modal_content = modal_content + '<div class="row"><div class="col-md-6 margin"><table class="mr" cellpadding="10" cellspacing="10" width="100%"><tbody><tr bgcolor="#ebf6ff"><td width="30" align="center" valign="middle"><input type="checkbox" class="mr" onchange="emailarray(this);"></td><td width="40" class="pdt1 pdb1"><img class="img-rounded img-responsive" src="https://c1.10times.com/img/no-pic.jpg" data-src="' + c[h].picurl + '"></td><td>&nbsp;<b>' + c[h].name + "</b><br>&nbsp;<small><nobr class='email'>" + c[h].email + "</nobr></small></td></tr></tbody></table></div>", f = 1);
                            g % 2 != 0 && (modal_content += "</div>"), modal_content += "</div>", $("#myModalinvite .modal-body").empty(), $("#myModalinvite .modal-body").append(modal_content), $("#myModalinvite").modal("show"), $("#myModal").modal("hide")
                        }
                    });
                });
            }
                
            })
       }
}

function sendemailall(a) {
  if (pageType == "thankyou_new") customEventGA('Event Visitor','Invite Via Gmail | Send','10times.com/'+$('#event_url').val());
  if (document.getElementById('send') && document.getElementById('send').disabled) return false;
  
  var b, n="" ;
  if (0 == flag ? (gmailfriends1 = $.unique(gmailfriends1), b = gmailfriends1.join(","),gmailname1 = $.unique(gmailname1) ,n = gmailname1.join(",")) : (gmailfriends2 = gmailfriends2.slice(0, -1), b = gmailfriends2 , gmailname2 = gmailname2.slice(0, -1) , n= gmailname2), "" == b) return alert("Please select someone for sending invite"), $("#send").removeAttr("disabled"), !1;
  $("#mrselect").empty(), $("#myModalinvite.modal-body").empty(), $("#myModalinvite.modal-body").append("Sending your request"),$("#myModal5.modal-body").empty(), $("#myModal5.modal-body").append("Sending your request"), $("#send").attr("disabled", "true");
  if (typeof pageType!=='undefined' && pageType=="dashboard_events"){
     var c = eventData.id ;
  }
  else if(typeof pageType!=='undefined' && ( pageType=="top100" || pageType=="udash_recommendation"))
  {
      var c = eventData.id ;
  }
  else if(typeof pageType!=='undefined' && pageType=="venue_detail")
  {
      var c = getVenueId() ;
  }
  else if((page_type=='thankyou_new' || page_type=='udash_recommendation' || pageType=='mdashRecommendation') && typeof $('#fromSection')!='undefined' && $('#fromSection').length==1 && $('#fromSection').val()!='fromWidget')
  {
      var c=$('#fromSection').val();
       }
  else if (((typeof $('#invite_modal')!='undefined' && $('#invite_modal').length==1) || (typeof $('#share_icon_modal')!='undefined' && $('#share_icon_modal').length==1)) && pageType=='about' && !(eventData.id=='undefined' || eventData.id==""))
  {
       var c=eventData.id;
  }
  else{
      var c = getEventId();
  }
  //var d = getCookie('user');  //static vid
      //window.alert(a+" ? "+b+" ?? "+c+" ??? "+d);
  var adata = {};
  adata.user = getCookie('user') ;
  adata.user_token = getCookie('user_token') ;
  adata.author_email = auth_data[0].email ;
  adata.author_name = auth_data[0].name ;
  adata.invitee_emails = b;
  // adata.invitee_names = n;
  adata.page_type = page_type;
  if(typeof eventData.id !== 'undefined' && page_type.search('listing')<0 ){
      adata.source = page_type + '_listing_send_invite';
  }
  else if(page_type=='udash_recommendation' || page_type=='mdashRecommendation'){
       adata.source = page_type + '_listing_send_invite';
  }
  else{
      adata.source = page_type + '_send_invite';
  }

  if($('#fromSection').length==1 && pageType=='thankyou_new')
  {
      if( $('#fromSection').val()=='fromWidget')
          adata.source=adata.source+'_widget';
      else
          adata.source=adata.source+'_rec';
  }  
  if (page_type=="about" &&  typeof $('#fromUserJourney')!='undefined' && $('#fromUserJourney').length==1) 
  {
       adata.source = page_type + '_listing_send_invite_visitor_journey';
  }     
  if ((page_type=="about" || pageType=="top100" || pageType=="udash_recommendation") &&  typeof $('#invite_modal')!='undefined' && $('#invite_modal').length==1) 
  {
       adata.source = pageType + '_listing_invite_widget';
  }  
  if (pageType=="listing" &&  typeof $('#invite_modal')!='undefined' && $('#invite_modal').length==1) 
  {
       adata.source = pageType +  '_invite_widget';
  }  
   //adata.event_id = c;
  if ( (typeof page_type!=='undefined') && ( /*(page_type !== "listing" || deviceFlag == 1 )  &&*/ page_type!=="profile" ) ){
      adata.entity_id = c;
  }
  // console.log(adata);

  $.ajax({
      type: "POST",
      url: site_url+"/ajax/send_invite",
      cache: !1,
      data: adata,
      success: function(a, b, c) {
          $("#mrselect").empty(),  $("#myModalinvite .modal-body").empty(), $("#myModalinvite .modal-body").append("Request sent to your friends."), $("#myModal5 .modal-body").empty(), $("#myModal5 .modal-body").append("Request sent to your friends.");
          if(pageType == "thankyou_new" && pageType != "undefined"){
              invite_count();
          }
          if(pageType == "about" && pageType != "undefined"){
              invite();
          }
      },
      error: function(a, b, c) {
          $("#mrselect").empty(),  $("#myModalinvite .modal-body").empty(), $("#myModalinvite .modal-body").append("Sorry something went wrong. Please try again.") ,$("#myModal5 .modal-body").empty(), $("#myModal5 .modal-body").append("Sorry something went wrong. Please try again.");
          $.ajax({
              type: "POST",
              url: site_url+'/ajax?for=invite',
              data: {'error': b+' : '+c ,'page': pageType ,'subject': 'Invite mail is not woking' },
              success: function(a) 
              {
                  //console.log(a);
              },
              error: function(a){
                  console.log(a);
              },
          });

      //window.alert(a+" ? "+b+" ?? "+c);
      }
  })
}

// gmail page share end

window.addEventListener('load', function() {
  if(document.getElementById('deviceType')) {
    deviceFlag = document.getElementById('deviceType').value;
  } else if(document.getElementById('ismobile')) {
    if(document.getElementById('ismobile').value == 1) deviceFlag = 0 ;
  }
})

document.addEventListener('mouseleave', function(event) {
  if (event.clientY < 0) {
    if (!getCookie('user') || !getCookie('user_token')) {
      if (!$('#modalData .modal').hasClass('in')) {
        if (getCookie('et_pop') == 1 && ['register_new', 'thankyou_new', 'login'].indexOf(pageType) < 0) {
          setCookie('et_pop', 2, 30);
          askfornewsletter();
        }
      }
    }   
  }
})
