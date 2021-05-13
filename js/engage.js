var modalHtml = '';
var filedsArray = ['name','email','designation','company','phone','password'];
/* input list in given order placeholder,label,type,max-len,min-len,icon class,hidden,id,individual */
    filedsArray['name'] = ['Name','Name','text',255,5,'fa-user',0,'userName',0]; 
    filedsArray['email'] = ['Email','Email','email',255,5,'fa-envelope',0,'userEmail',0];
    filedsArray['company'] = ['Company','Company','text',255,5,'fa-building',0,'userCompany',1];
    filedsArray['designation'] = ['Designation','Designation','text',255,5,'fa-briefcase',0,'userDesignation',0];
    filedsArray['city'] = ['City','Location','text',255,5,'fa-briefcase',0,'userCity',0];
    filedsArray['country'] = ['Country','Country','text',255,5,'',0,'userCountry',0];
    filedsArray['mobile'] = ['Mobile','Mobile','text',255,5,'fa-phone',0,'userMobile',0];
var connection_href = new Array ;
var receiverData = [];
var eventData = [];
var eventStatus=[];
var userData = [];
var exhibitorData = [];
var speakerData = [];
var messageG = userToken = approveThis = linkedButtonClicked = oneClickEmailConnect = autoSaveFlag = '';
var userRelation = '';
var pageType = '' ;
var deviceModel = '' ;
var OrganizerData=[];
var only_thankyou=0;
var show_thankyou = true;
var engazeFlag = 0; // change it
var con_flag=0;
var org_msg=0;
var city_chart=0;
var country_map=0;
var jsloaded=0;
var chartDetails=0;
var sourceVs='';
var hide_individual=0;
var signUpScrollFlag = '' ;
var venueData=[];
var addFunActionLabel='';
var countryNameGlobal='';
var fbLoadFlag=0;
var countryCodeFlag=0;
var phonecodeValue=0;
var responsedatahtml=[];
var flag_dropdown=0;
var flag_dropdown_1=0;
var VisitorIdDecode='';
var userEmailLoggedin='';
// var timeInterval=0;


// user intent action
function loggedInAttend(I,result,source){
  if(result.status == 1){
      userData.visitorId = result.visitor_id ;
      userData.encodeId = result.encode_id ;
      profileUpdate();
      if(source == 'interest'){
          $('.covid-follow').remove();
      }
      if(pageType == 'live' && (source == 'video_comment')){
          user_profile_complete(I,result,'video_comment');
      }
      if(result.isComplete==1)
          gaEvent("Goal","Thank You after 2nd screen");
      if((pageType=='live') && ($(I).hasClass('live-eve-follow') || $(I).hasClass('vid-eve-follow'))){
          if($(I).hasClass('vid-eve-follow')){
              $('#TenTimes-Modal').modal('hide');
              $('.vid-eve-follow').html("<i class='fa fa-check fa-fw'></i> Following").addClass('disabled');
          }
          return true;
      }    
      if( pageType == 'profile' || source== 'followVs' ||  pageType == 'org_detail' || (typeof only_thankyou!=='undefined' && only_thankyou==1)){
          // consentup(10);
          if($(eventData.dis).hasClass("action-dir")) {
              map_open($("#event_latitude").html(),$("#event_longude").html(),1);
              hitMyData();
              return true;
          }
          showThank('event');
      }
      else if(pageType == 'about' && $(I).hasClass('download_brochure')){
           window.open($(I).data('url'));
           download_brochure($('#br_id').val());
           return true;
      }
      else if(pageType == 'dashboard_events'){
          // consentup(10);
          swap_function(I,source);
      }    
      else if(source.search(/orgdetails/)>-1){  
          
           
          if($('#modalData').html() == "")
          $('#modalData').html(getModal());
          $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
          $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
          $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
          $('#TenTimes-Modal .modal-title').html('');
           var data = {
                pageType:pageType,
                for:'verify_modal',
                orgdetailsSource:orgdetailsSource
          };
          var messageHtml='';
          $.ajax({
              type: "POST",
              url: site_url_attend + "/ajax/modaldata",
              data:data,
              success: function(n) {
                   messageHtml=$.parseJSON(n);
                    $('#TenTimes-Modal .modal-title').html(messageHtml.title);
                      $('#TenTimes-Modal .modal-title').siblings('h5').remove();
                      $('#TenTimes-Modal .modal-body').html('');
                      $('#TenTimes-Modal').modal('show');
                      if(orgdetailsSource == "ticket"){
                          var requestfor = "ticket";
                      }
                      else if(orgdetailsSource == "webinar"){
                          var requestfor = "webinar";
                      }
                      else {
                          var requestfor = "eventContact"; 
                      }
                      var userResult = result;
                       var userResult = result;    
                      if (typeof $("#privateFlag").val()!='undefined' ){
                          var privateFlag=1
                      }
                      else{
                        var privateFlag=0
                      }
                          
                     $.ajax({type: "GET", url: site_url_attend + "/ajax?for="+requestfor+"&eventId="+eventData.id+"&privateFlag="+privateFlag,
                          success: function(result) {
                              var newData= JSON.parse(result);
                              if(orgdetailsSource == "website" || orgdetailsSource == "ticket") {
                              if(orgdetailsSource == "website"){
                                  contactWebsite = newData.event_website;
                                  var websiteIsValid = newData.websiteIsValid;
                              }
                              else {
                                  if(newData.status == '1' || newData.status.code == 1) {
                                      contactWebsite = newData.data;
                                      var websiteIsValid = newData.isvalid;
                                  }
                              }
                                 if (websiteIsValid == 1) {
                                      var websiteTab = window.open();
                                      if(websiteTab == null) { 
                                          showPopupBlockMessage(contactWebsite , orgdetailsSource);
                                      }
                                      else{
                                          $('#TenTimes-Modal').modal('hide');
                                          websiteTab.location.href = contactWebsite;
                                      }
                                  }
                                  else {
                                      showOrgWebsite(orgdetailsSource,userResult);
                                  }
                              }
                              if(orgdetailsSource == "webinar") {
                                  var agendaTitles = [];
                                  var webcastUrls = [];
                                  var webinarUrl = '';
                                  for(var i=0; i < newData['data']['agenda'].length ; i++){
                                      let data = newData["data"]["agenda"][i];
                                      agendaTitles.push(data["title"]);
                                      if(newData['data']['agenda'][i]['id'] == $(eventData.dis).attr('data-id')){
                                          webinarUrl = newData['data']['agenda'][i]['attachment']['webcasturl'];
                                      } else {
                                          if(nullCheck(data["attachment"])) {
                                              data = data["attachment"];
                                              if(nullCheck(data['webcasturl'])) {
                                                  webcastUrls.push(data['webcasturl']);
                                              }
                                          }
                                      }
                                  }
                                  webcastUrls.push(webinarUrl);
                                  showPopupBlockMessage(webcastUrls, orgdetailsSource, agendaTitles);
                              }
                              if(orgdetailsSource == "contact") {
                                  contactName = newData['contacts'][0]['name'];
                                  contactEmail = newData['contacts'][0]['email'];
                                  contactPhone = newData['contacts'][0]['phone'];
                                  showOrgContact(newData['contacts']);
                              }
                          }
                      });
                 },
                 error: function(data){
                 showToast('Something went wrong!!!');
                  }
             });
         
         
      }
      else if(pageType == "live"){
          if(source=='bookmark'){
              $(I).removeAttr('onclick');
              $(I).children().removeClass('fa-bookmark-o').addClass('fa-bookmark');
              $(I).children().addClass('text-orange').removeClass('text-muted');
              showThank('event');
          }
      }
      else if("ProfileDash" == pageType)
          dashboardAttendResponse(I, source)
      else if(typeof source != "undefined" && getStallFlag(source) == 1){
          if(result.stallAnswer==1)
              redirectTo(result,source);
          else
              openQuestion(source,result);
      }
      else if(pageType == 'listing' || pageType=="org_detail" || pageType=='venue_detail' || pageType.search('top100')>-1 || pageType=='homepage'){
          if(source.search("follow") > -1 || source.search("bookmark") > -1 || source.search("interest") > -1){
              if(pageType=='venue_detail' || pageType=='homepage' || pageType == 'org_detail')
                  hitMyData();

              show_thankyou == true ? showThank('event') : postActionResponse();
          }
          else{  
              redirectTo(result,source);
          }
      }
      else if (pageType=='group' && source=='going'){
          hitMyData();
          showThank('event');
      }
      else if (pageType=='thankyou_new' || pageType=='register_new' || pageType=='login_new')
          updateActionButtonsThankyou(source,I);
      else if (pageType=='udash_recommendation')
         {
          updateActionButton(source,I); 
          showThank('event');     
        }
      else{
              if($(I).hasClass("stopRedirection"))
              {
                  if(pageType == "about"){
                      if(source=='interest'){
                      $(I).html('<i class="fa fa-check text-orange" aria-hidden="true"></i> Interested').removeAttr( "onClick" );
                      $(I).css("pointer-events","none");
                      $(I).addClass("text-orange");
                      $(I).parent().siblings().find(".orgEventbm")
                      $(I).parent().siblings().find(".orgEventbm").removeAttr('onclick');
                      $(I).parent().siblings().find(".orgEventbm").children().removeClass('fa-bookmark-o').addClass('fa-bookmark');
                      $(I).parent().siblings().find(".orgEventbm").children().addClass('text-orange');
                      showThank('event');
                      }
                      else if(source == 'bookmark'){
                          $(I).removeAttr('onclick');
                          $(I).children().removeClass('fa-bookmark-o').addClass('fa-bookmark');
                          $(I).children().addClass('text-orange');
                          showThank('event');
                      }
                  }
                  if((pageType == "speakers" || pageType == "visitors") && source == "bookmark")
                  {
                      $(I).removeClass('fa-bookmark-o text-muted').addClass('fa-bookmark text-orange').removeAttr( "onClick" );
                      $(I).css("pointer-events","none");
                  }
                  if((pageType == "speakers" || pageType == "visitors") && source == "interested_attend")
                  {
                      $(I).html('<i class="fa fa-check" aria-hidden="true"></i> Join Community').css('opacity','0.7').removeAttr( "onClick" );
                      $(I).css("pointer-events","none");
                  }
                  return true;
              }
          if($(I).hasClass("agendaWatch")){
              if($('.action-in').text() == 'Interested')
                 var actionBtn = 'Interested';
              else if($('.action-in').text() == 'Follow')
                 var actionBtn = 'Following';
              else if($('.action-in').text() == 'Register')
                 var actionBtn = 'Registered';      
              if($(I).hasClass("a-m")) {
                  $('.action-in').html('<i class="fa fa-check" aria-hidden="true"></i> '+actionBtn).unbind('click').click(function(){alreadyClickAction(this)});
                  $('.action-fix-in').html('<i class="fa fa-check" aria-hidden="true"></i> '+actionBtn).unbind('click').click(function(){alreadyClickAction(this)});
                  $(".action-save").html("<i class='fa fa-bookmark fa-fw text-orange'></i> "+actionBtn).unbind('click').click(function(){alreadyClickAction(this)});
              }
              postActionResponse();
              return true;
          }    
          redirectTo(result,source);
      }
   }

   else{
      showloading(); 
      if(result.status == 0 && result.hasOwnProperty('error') && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('id') && result.error.hasOwnProperty('invalidData')){
         $( ".modal-backdrop" ).removeClass('modal-backdrop');
          var attendInput = ['fields','title','social','subtitle','actionName','actionLabel','eventId','eventName'];
          var tag = source.search("follow");
          if(tag > -1){
              attendInput['fields'] = ['name','user','city','company','designation','phone'];
              attendInput['actionLabel'] = 'Follow Now';
          }
          else if(hide_individual == 1)
          {
              attendInput['fields'] = ['name','user','city','company','designation','phone','autointroduce'];
              attendInput['actionLabel'] = 'Send Stall Booking Request';
          }
          else{
              attendInput['fields'] = ['name','user','city','company','designation','phone','autointroduce'];
              attendInput['actionLabel'] = 'Submit';    
          }
          attendInput['title'] = getTitle();
          attendInput['subtitle'] = getSubTitle();
          attendInput['eventName'] = getEventName();
          attendInput['eventId'] = getEventId();
          attendInput['actionName'] = "gaEvent('User','Basic Popup Submit');RegisterForm();";
          getForm(function (modalHtml){
          $("#modalData").html(modalHtml.mainHtml);     
          
          if(hide_individual == 1)
          $("#checkDiv").hide();
          if(!document.getElementById('userSource')){
             $("#TenTimes-Modal").append(addHidden('user_source','userSource',''));    
          }
          $("#TenTimes-Modal").modal("show");
          if(result.userData.userCompany==null || result.userData.userCompany==''){
              getcompanydata(function(z){
                  result.userData.userCompany=z.data[0].name;
                  $('#userCompany').val(z.data[0].name);
                  $('.alert_company').css('display','none');
              });
          }
          showValidationError(result);
          calling_detail();
          profileUpdate();
          gaEvent('User','Basic Popup Open');
          hideloading();                
          clickCompany();
          postFormOpenSettings(result.userData.country);
          var phoneno='';
          if(getCookie('user_token'))
              phoneno=result.userData.number_valid.nationalFormat;

          vcardopen(result.userData.name,result.userData.email,result.userData.designation,result.userData.userCompany,result.userData.cityName,result.userData.countryName,'',result.userData.id,result.userData.profilepicture,phoneno,result.userData.place_id);

          $('[data-toggle="tooltip"]').tooltip();
          $("#TenTimes-Modal #userSource").val(source);
          openform();
          },attendInput,source);
      }
      else{
          // consentup(10);
          window.location.assign(login_url + "/ticket_transaction/going/" + eventData.id);
      }
     hideloading();
  }
}

function hitAuth(postData,from,source,data,dis,callback){
  var result;
  $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: postData,async: true, // change it
          beforeSend: function(){},
          ajaxSend: function(){},
          complete: function(){},
          success: function(A) {
              $('#_modal_close').removeAttr("onclick");
              if(pageType=='dashboard_events')
                  $(dis).parent().parent().find(".spinner_").hide()

              hideloading();
              
              result = $.parseJSON(A);
              if(result.status==0 && typeof result.error.invalidData != 'undefined' && (typeof postData.email != 'undefined' || typeof postData.user_id != 'undefined')){
                  $.each(result.error.invalidData, function( key, value ) {
                    if(value.what == 'account-deactivated'){
                      window.location.assign(site_url_attend + "/deactivation/"+result.userData.id);
                      return;
                    }
                  });
              }
              var tokenStatus = authorizeTenToken(result) ;
              if(tokenStatus) setCookie('10T_verify', '0', 30);
              if(result.status == 1) setCookie('10T_last', new Date().getTime(), 30);
              if(result.status == 1){
                  if(postData.loginMethod == "gplus"){
                      var s = "Google";                        
                  }
                  else if(postData.loginMethod == "fb"){
                      var s = "Facebook";
                  }
                  if(s != null && s != "undefined")
                  customEventGA('Event Visitor', s+' Login Success' , '');
              }
              if(pageType == "thankyou_new" || $(dis).attr('id')=='u-connect'){
                  if ($(dis).text()==' Register')
                      $(dis).html('Register');
                  else{
                      $(dis).html('Request Sent');
                      $(dis).css('color', 'lightgrey');
                      $(dis).css('border', '1px solid lightgrey');
                      }
                    if(pageType == "thankyou_new")
                       connectionCheck();
              }
              if(result.status==1 && result.userData.userExists==0)
                      gaEvent("User","Registration");

             // if(typeof source!='undefined' && (source.search(/stall/)>-1 || source.search(/Stall/)>-1)){
             //     gaEvent("Goal","Event Enquiry");
             //     if( result.isExistVisitor==0 )
             //         gaEvent("Goal","Event Registration");
             // }
             // else if(typeof source!='undefined' && result.isExistVisitor==0 && (source.search(/follow/)>-1 || source.search(/Follow/)>-1))
             //     gaEvent("User","Followed");
             // else if(result.isExistVisitor==0)
             //     gaEvent("Goal","Event Registration");
             
              consentup(10);

              if(result.status==1 && from=='venue_follow')
                   gaEvent("User","Followed");
               if(typeof data != 'undefined' && data.type=='email'){
                  pingUser(result,'1');    
               }
               else if(typeof data != 'undefined' && data.where=='social'){
                  pingUser(result,'1');
                  pingUser(result,'3');    
               }
               else
                  pingUser(result);  
                  switch (from) {
                  case "videoCommentSubmit":
                   case "orgdetails":
                      // showOrgDetails(result,data,source);
                      loggedInAttend(dis,result,source);
                      break;
                  case "connect":
                      ConnectRegisterFormResponse(result);
                      break;
                  case "attend":
                  case "interest":
                      RegisterFormResponse(result,data,source);
                      break;
                  case "oneClickAttend":
                      tokenStatus?(deleteAllCookies(),attendNew(dis,source),showAuthTokenMessage()):loggedInAttend(dis,result,source);
                      break;
                  case "oneClickConnect":
                      if(pageType=='thankyou'){$(dis).html('Request Sent');$(dis).removeAttr('onclick');$(dis).css({"cursor":"default","text-decoration":"none"});}
                      tokenStatus?(deleteAllCookies(),connectNew(dis,receiverData.id,receiverData.name,eventData.id),showAuthTokenMessage()):loggedInConnectResponse(result,data,dis);

                      break;
                  case "speaker":
                      if(result.status==1 && typeof data !='undefined' && data.hasOwnProperty('where') && data.where =='social'){
                          signupTTResponse(result,data);
                      }   
                      speakerResponse(result);
                      break;
                  case "oneClickSpeaker":
                      tokenStatus?(deleteAllCookies(),followSpeakerNew(dis,speakerData.id,source),showAuthTokenMessage()):speakerResponse(result,source,dis,postData.from);
                      break;
                  case "venue_follow":
                      venueResponse(result,dis);
                      break;
                  case "oneClickVenue":
                      tokenStatus?(deleteAllCookies(),followVenue(dis,venueData.id,source),showAuthTokenMessage()):venueResponse(result,dis);
                      break;    
                  case "signup":
                      signupResponse(result);
                      break;
                  case "wantRequest":
                      wantRequestResponse(dis,result,data);
                      break;
                  case "introRequest":
                      introRequestResponse(dis,result,data);
                      break;   
                  case "oneClickOrganizerFollow":
                      organizerResponse(result,dis);
                      break;
                  case "organizer_follow":
                      organizerResponse(result,dis);
                      break;
                  case "venue_contact":
                        var flagmobile=0;
                        for(var i=0;i<result.error.invalidData.length;i++){
                          var match_string=result.error.invalidData[i].what.toLowerCase();
                          if(match_string=='phone'){
                              $('#userMobile').siblings('.alert_mobile').show();
                              $('#userMobile').siblings('.alert_mobile').html(result.error.invalidData[i].why);
                               $('#userMobile').siblings('.alert_mobile').css('color','#ae4b00');
                               hideloading();  
                              flagmobile=1;
                            }           
                          }
                       if(flagmobile==0){
                          venueEnquiryModal();
                          }
                      break;
                  case "oneClickAuthConnect":
                      gaEvent("User","Connect Sent");
                      loggedInConnectAuthResponse(result,data);
                      break;
                  case "venue_contact_message":
                      if(result.status == 1)                     
                          submitOrgMessage();
                      break;
                  case "bounce_detail":
                      bounceResponse(result,data);
                      break;
                  case "verifyTenToken":
                      if(tokenStatus)
                      {
                          // $('#modalData').html('<div class="modal" id="TenTimes-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"><div class="modal-dialog modal-740" role="document"><div class="modal-primary panel-danger"><div class="modal-header text-center  panel-heading"><h5 class="modal-title" id="myModalLabel">Your account is having authentication problem. Some features may not work. Try logging in to fix the problem.</h5></div></div></div></div>');
                          // $("#TenTimes-Modal").modal("show");
                          // $('.modal-backdrop').css('background','none');
                          // window.location.assign(site_url_attend + "/user/flush");;
                          deleteAllCookies();
                          showAuthTokenMessage();
                      }
                      else
                          setCookie('10T_verify', '1', 24 * 60);
                      return true;
                      break;
                  case "exhibitor_attend":
                      return true;
                      break;
                  case "subscribe":
                          subscribeResponse(result,source,dis);
                      break;
                  case "signupTT":
                          if(data.type == "email"){
                              nextPasswordScreen(result,data);
                          }
                          else{
                              signupTTResponse(result,data);   
                          }
                      break;
                  case "signupTTOnly":
                      if(data.type=='next'){
                          LoginRegisterForm(data.action);
                      }
                      else
                          signupTTResponse(result,data);
                      break;
                  case "verifysignupTT":   
                       if(data.type == "email"){
                              verifyNextPasswordScreen(result,data);
                          }
                          else{
                              signupTTResponse(result,data);   
                              }
                      break;
                  case "sendConnectRequest" :
                      if(pageType!='thankyou_new'){
                          showThankyou(result.connectRelation) ;
                      }
                      break;
                  case "reactivateTT":
                      if(result.status==0){
                          $('#TenTimes-Modal .a-e-t').replaceWith(function() { return ""; });
                          $('#TenTimes-Modal').find('.modal-header').prepend("<h5 class='a-e-t text-muted'>You have entered wrong email or password<h5>") ;
                          $("#TenTimes-Modal form button").html($("#TenTimes-Modal form button").text()).removeAttr('disabled');
                      }
                      else{
                          gaEvent("User","Reactivated");
                          window.location.href =site_url_attend;
                          showToast("You are successfully logged In!",'#43C86F');
                      }
                      break;
                  case "accountActivation":
                         gaEvent("User","Deactivated");
                         showloading();
                       $.ajax({ type: "POST",url: site_url_attend+"/user/flush",async: true,
                          beforeSend: function(){},
                          ajaxSend: function(){},
                          complete: function(){},
                          success: function() {
                              hideloading();
                              
                              window.location.assign(site_url_attend);
                          },
                          error: function(){
                              hideloading();
                              window.location.assign(site_url_attend);
                          }
                          });
                       
                       
                      break;
                  case 'import':
                      getLoggedInDataN();
                      callback();
                      break;
                  case 'subscribe_login':
                      loginSubsCallback(result);   
                      break;
                  case "notificationTT":
                  break;
                  case "inbound":
                        ResumeSubmitResponse(result);
                  break;
                  default:
                      window.location.href = window.location.href ;
              }
          }
      });
}

function getEventData(I,source) {
  if(I === undefined ) return 1 ;
  else if(typeof (I) !== "object") return 1 ;
  eventData['dis'] = I;
  switch(pageType){
      case 'profile':
          if(userRelation != 'friend' && userRelation != 'approve'){
              eventData['id'] = $(I).parent().parent().find('h3').attr("id");
              eventData['name'] = $(I).parent().parent().find('h3').find('a').text();
               if($(I).parent().find('h3').find('a').attr("href") !== undefined)
              eventData['url'] = ($(I).parent().parent().find('h3').find('a').attr("href")).replace("/", "");
          }
          let evtTemp=$(I).parent().parent().parent().find('div[id="connectEventName"]').attr('eventid');
          if(typeof evtTemp!='undefined' && evtTemp.length>0){
              eventData["id"] = $(I).parent().parent().parent().find('div[id="connectEventName"]').attr('eventid');
          }
          break;
      case 'group' :
          eventData["name"] = $(I).attr("data-value");
                  eventData["id"] = $(I).attr("data-id");
                  eventData["url"] = $(I).attr("data-url");
      case 'listing' :
             if($('#tblformat').length>0)
              {

                  if($(I).parent().find('h2').length>0)
                  {    
                      eventData['name'] = $(I).parent().find('h2').text();
                      eventData['id'] = $(I).parent().find('h2').attr("id");
                      eventData['url'] = ($(I).parent().find('h2').parent().attr("href")).replace("/", "") ;
                  }
                  else
                  {                    
                      eventData['name'] = $(I).parent().parent().find('h2').text();
                      eventData['id'] = $(I).parent().parent().find('h2').attr("id");
                      eventData['url'] = ($(I).parent().parent().find('h2').parent().attr("href")).replace("/", "") ;
                  }
              }
              else
              {
                  if ($(I).parents(".box").find("h2").length > 0) {
                      eventData['name'] = $(I).parents(".box").find("h2").text();
                      if(eventData['name'].search('miles') > -1 )
                          eventData['name'] = $(I).parents(".box").find("h2 a").text();
                      eventData['id'] = $(I).parents(".box").find("h2").attr("data-id") == null ? $(I).parents(".box").find("h2").attr("id") : $(I).parents(".box").find("h2").attr("data-id");
                      eventData['url'] = ($(I).parents(".box").find("h2").children('a:eq(0)').attr("href"));
                  }else{
                      eventData['name'] = $(I).parents(".box").find("[data-edition]").text();
                      if(eventData['name'].search('miles') > -1 )
                          eventData['name'] = $(I).parents(".box").find("[data-edition] a").text();
                      eventData['id'] = $(I).parents(".box").find("[data-edition]").attr("data-id") == null ? $(I).parents(".box").find("[data-edition]").attr("id") : $(I).parents(".box").find("[data-edition]").attr("data-id");
                      eventData['url'] = ($(I).parents(".box").find("[data-edition]").children('a:eq(0)').attr("href"));
                  }
              }
          break ;
      case 'dashboard_events':

              if(con_flag==1)
              {
                  eventData['id'] = $('#event_id').attr('value');     
                  eventData['name'] = $('#event_info').attr('class');             
                  eventData['url'] = ($('#event_info').attr('value')).replace("/", "");  
              }
              else
              {
                  eventData['id'] = $(I).parent().parent().parent().find('h3').attr("id");
                  eventData['name'] = $(I).parent().parent().parent().find('h3').find('a').text();
                  if($(I).parent().find('h3').find('a').attr("href") !== undefined)
                  eventData['url'] = ($(I).parent().parent().parent().find('h3').find('a').attr("href")).replace("/", "");
                  eventData['event_edition_id'] = $(I).parent().parent().parent().find('h3').attr("value");
              }
             
          break;
      case "ProfileDash":
          eventData.name = $(I).closest("li").find("h3").text();
          eventData.id = $(I).closest("li").find("h3").attr('id');
          break;
      case 'org_detail':   
          if(source == 'interest' || source == 'going' || source == 'bookmark'){
             eventData['id'] = $(I).closest('.box').find('h2').attr('id');
             eventData['name'] = $(I).closest('.box').find('h2').text();
             eventData['url'] = $(I).closest('.box').find('h2').find('a').attr('href');
          }  
          else{     
              eventData['id'] = $(I).parent().find('h3').attr("id");      
              eventData['name'] = $(I).parent().find('h3').find('a').text();      
               if($(I).parent().find('h3').find('a').attr("href") !== undefined)      
              eventData['url'] = ($(I).parent().find('h3').find('a').attr("href")).replace("/", "");
              }      
          break;

      case 'venue_detail':          
              eventData['id'] = $(I).parent().parent().find('h2').attr("id");      
              eventData['name'] = $(I).parent().parent().find('h2').find('a').text();      
               if($(I).parent().find('h3').find('a').attr("href") !== undefined)      
              eventData['url'] = ($(I).parent().parent().find('h2').find('a').attr("href")).replace("/", "");      
          break;

      case 'udash_connections' :      
              eventData['id'] = $('#event_id').attr('value');     
              eventData['name'] = $('#event_info').attr('class');             
              eventData['url'] = ($('#event_info').attr('value')).replace("/", "");           
          break;
      case 'homepage':
        eventData['id'] = $(I).attr('data-id');     
        eventData['name'] = $(I).siblings('h5').text();             
        eventData['url'] = ''; 
      break;
      case 'thankyou' :      
              eventData['id'] = $('#eid').attr('value');     
              eventData['name'] = $('#detail').attr('data-name');             
              eventData['url'] = $('#detail').attr('data-url');           
          break;
      case 'top100':
              eventData['id'] = $(I).closest('tr').find("td:eq(1)").find("a:eq(1)").attr('data-id');     
              eventData['name'] = $(I).closest("tr").find("td:eq(1)").find("a:eq(1)").html();             
              eventData['url'] = $(I).closest("tr").find("td:eq(1)").find("a").attr("href"); 
              eventData['source'] = source;
              break;
      case 'top100profession':
              eventData['id'] = $(I).closest('tr').find("td:eq(1)").find("a:eq(1)").attr('data-id');     
              eventData['name'] = $(I).closest("tr").find("td:eq(1)").find("a:eq(1)").html();             
              eventData['url'] = $(I).closest("tr").find("td:eq(1)").find("a").attr("href"); 
              eventData['source'] = source;
              break;
      case 'top100industry' :
              eventData['id'] = $(I).closest('tr').find("td:eq(1)").find("a:eq(1)").attr('data-id');     
              eventData['name'] = $(I).closest("tr").find("td:eq(1)").find("a:eq(1)").html();             
              eventData['url'] = $(I).closest("tr").find("td:eq(1)").find("a").attr("href"); 
              eventData['source'] = source;
              break;
      case 'top100country' :    
              eventData['id'] = $(I).closest('tr').find("td:eq(1)").find("a:eq(1)").attr('data-id');     
              eventData['name'] = $(I).closest("tr").find("td:eq(1)").find("a:eq(1)").html();             
              eventData['url'] = $(I).closest("tr").find("td:eq(1)").find("a").attr("href");
              eventData['source'] = source;           
          break;
      case 'udash_recommendation':
              eventData['id']=$(I).attr('data-id');
              eventData['name']=$(I).attr('data-name');
              eventData['url']=$(I).attr('data-url');
          break;
      case 'exhibitors':
              eventData['id']=$('#eventID').val();
              eventData['eventEditionId']=$('#eventEdition').val();
              eventData['url']=site_url_attend+'/'+$('#event_url').val();              
          break;
      case 'live':
          if($(I).hasClass('livebm')){
              eventData['id'] = $(I).attr('data-id');
              eventData['name'] = $(I).attr('data-name');
              eventData['url'] = $(I).attr('data-url');
          }
          else{
              eventData['id'] = $('#eventID').val();
              eventData['name'] = $(I).attr('data-name');
              eventData['url'] = $(I).attr('data-url');
          }
          break;
      case 'about':
      case 'visitors':
      default:
      if(/*pageType =='about' &&*/ $(I).hasClass("brand_event")) {
          eventData['id'] = $(I).attr('data-id');
          eventData['name'] = "";
          eventData['url'] = "";
          break;
      }
      else if($(I).hasClass("orgEvent")){
          eventData['id'] = $(I).attr('data-id');
          eventData['name'] = $(I).attr('data-name');
          eventData['url'] = $(I).attr('data-url');
          break;
      }
      else if ($(I).hasClass("orgEventbm")){
          eventData['id'] = $(I).attr('data-id');
          eventData['name'] = $(I).attr('data-name');
          eventData['url'] = $(I).attr('data-url');
          break;
      }
      else if((pageType =='about' || pageType =='comments') && $(I).hasClass("past_edition")) {
          eventData['id'] = $('#eventID').val();
          eventData['eventEditionId'] = $(I).attr('data-edition');
          eventData['name'] = "";
          eventData['url'] = "";
          break;
      }
      else{
          eventData['id'] = $('#eventID').val();
          eventData['name'] = $("h1").text();
          eventData['url'] = $('#event_url').val();
          if(getSearchParams("ed") != undefined) {
              eventData['eventEditionId'] = $("#eventEdition").val();    
          }
          if($(I).hasClass("ed-action")) {
              eventData['eventEditionId'] = $(I).attr('data-id');
          }
          break;
      }
  }

  if (!eventData.id) eventData.id = I.dataset.id;
  if (!eventData.name) eventData.name = I.dataset.name;
  if (!eventData.url) eventData.url = I.dataset.url;
}

function attendNew(I,source) {
  getTicket=I;
  if (getCookie('et_pop') != 2) setCookie('et_pop', 1, 30);

   if(I == '' && !$(I).hasClass('like-live')){
       I = eventData.dis;
   } 
   if($(I).hasClass('vidPage')){
    window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/login?source=watch&id="+$(I).attr('data-agenda-id')+'_'+$(I).attr('data-vid-id'));
    return false;
   }
   if(source == 'attend3'){
       source = 'interested';
       window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/interested"+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType);
        return false;
   }
    var edId = ''
    if(typeof getUrlParameter('ed') != 'undefined'){
        edId = '&ed='+getUrlParameter('ed');
    }
   if(pageType=='about' || pageType=='visitors' || pageType=='exhibitors' || pageType=='comments' ||  pageType=='photos-videos' || pageType=='deals' || pageType=='speakers'){
    if($(I).hasClass('action-join')){
        source = 'interested';
        showloading();
        window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/"+source+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType+edId);
        return false;
    }
        if(source == "interest" || source =="going" || source == "bookmark" || source == "interested_attend"){
            $flag_redirect=0;
            if(source == "interested_attend"){
                if($(I).hasClass('action-fix-rg')){
                    source = "interested";
                    window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/registernew"+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType);
                    return false;
                }
                if($(I).hasClass('action-fix-in')){
                    source = "interested";
                    window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/"+source+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType);
                    return false;
                }
                
            }
            if(source=='interest' && $(I).hasClass('download_brochure')==true){
               source='interested';
            }
            if(source=='interest' && ($(I).hasClass('mainbutton1')==true || $(I).hasClass('action-in')==true) || $(I).hasClass('action-fl') || $(I).hasClass('action-covid-fl')){
                source='interested';
                $flag_redirect=1; 
            }
            if(source=='going' && ($(I).hasClass('mainbutton2')==true)||$(I).hasClass('action-go')==true){
                $flag_redirect=1;
            }
            if(source == "bookmark" && $(I).hasClass('action-save') && typeof getUrlParameter('ed')=='undefined'){
                window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/"+source+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType);
                return false;
            }
            if(source == "interest" && $(I).hasClass('action-rg') && typeof getUrlParameter('ed')=='undefined'){
                if($(I).attr('data-payment')=='purchase' && $(I).attr('data-host')==1){

                }

                else{
                    source='interested';
                    window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/"+"registernew"+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType);
                    return false;
                }
                
            }
            
            if($flag_redirect==1){
                var status_2 = check_status();
                if( (status_2=='ongoing' || status_2=='upcoming')) {
                    showloading();
                    window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/"+source+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType+edId);
                    return false;
                }
                else{
                    showloading();
                    window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/follow"+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType);
                    return false;
                }
            }
        }else if(source == "stall_attend"){
            window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/stall-enquiry?source=autosubmit"+getOneClickSource(source)+"_"+pageType);
                    return false;
        }
    }

    if(source.search(/orgdetails/)>-1) {  

        if(source.search(/website/) > -1) {
            orgdetailsSource = "website";
        }
        if(source.search(/contact/) > -1) {
                orgdetailsSource = "contact";   
        }
         if(source.search(/ticket/) > -1) {
                orgdetailsSource = "ticket";   
        }
        if(source.search(/webinar/) > -1) {
            orgdetailsSource = "webinar";
        }
    }
    callGaEvent(source , orgdetailsSource);
    hide_individual = getStallFlag(source);
    var stallFlag = getStallFlag(source);
    if(source=='followVs')
    {
        sourceVs=source;
    }
    if(source!="follow5")

        only_thankyou=0;
    if(pageType=='dashboard_events')
    con_flag=0;
    getEventData(I,source);
    show_thankyou = $(eventData.dis).attr("data-thank") ? false : true;
    if($(eventData.dis).hasClass('action-cl') || $(eventData.dis).hasClass('action-dir') || $(eventData.dis).hasClass('action-save') || ($(eventData.dis).hasClass('fa-bookmark-o') || $(eventData.dis).find('fa-bookmark-o').length > 0)) {

        only_thankyou=1;
    }
    if(pageType == 'listing'){
        if($(I).attr('data-payment') == 'purchase' ){
            window.location.assign($(I).attr('data-url')+'/live');
            return true;
        }    
    }
    if($(I).attr('data-host') == '1'  && $(I).attr('data-payment') == 'purchase' ){
        window.location.assign(site_url_attend+'/'+$(I).attr('data-url')+'/live');
        return true;
    }
    if (getCookie('user') && getCookie('user_token')) {
        getModal();
        if(pageType=='listing'){
            if(($(I).attr('encodeid')!='' && typeof $(I).attr('encodeid')!='undefined') && source=='going'){
                var enocedelisid=$(I).attr('encodeid');
                showloading();
                window.location.assign(site_url_attend +'/dashboard/event?ref='+enocedelisid);
                return true;
            }
        }
        
        var data = { user_id:getCookie('user'),event_id: eventData.id, source: 'autosubmit'+getOneClickSource(source)+'_'+pageType, action:getAction(source), ai_value:getAI(source), user_token:getCookie('user_token') };
        if(typeof $("#privateFlag").val()!='undefined'){
           data.action='signup';
        }
        if($(I).hasClass('live-eve-follow')){
            data.noEmail = 1;
        }
        if( eventData.eventEditionId != undefined) {
            data.eventEditionId =  eventData.eventEditionId;
            data.noEmail = 1; 
        }
        "user_profile_attend" == source? (data.source = source):!1;
        "user_profile_follow" == source? (data.source = source):!1;

        if(pageType=='dashboard_events')
        {
            data.event_edition_id = eventData.event_edition_id ;
            data.action = 'updateAttend' ;
            data.source = 'dashboard_events' ;
            data.user_token =  getCookie('user_token') ;
            data.attendFlag = getAttendFlag(source) ;
            $(I).parent().parent().find(".spinner_").show();
        }
        else
            showloading();
        hitAuth(data,'oneClickAttend',source,'',I);

    }
    else{
        var dataqueue={
            event_id: eventData.id, 
            source: 'autosubmit'+getOneClickSource(source)+'_'+pageType, 
        }
        var intentvalue=getIntentValue(source).split('_');
        dataqueue.flag=intentvalue[1];
        dataqueue.interest=intentvalue[0];
        hitQueue(dataqueue);
        verifySigninTT('login','attendNew_'+source);
    }
}
// user intent action end

function show_thank()
{
    only_thankyou=1;
}
function change_watchnow(){
    if($('.watchNow').length > 0){
    var strt_end_dt=$('#strt_end_date').val();
           var strt_end_dt=strt_end_dt.split(',');

            var date1 = new Date(strt_end_dt[0]*1000);
            var date2 = new Date(strt_end_dt[1]*1000);


            var year1 = date1.getFullYear();
            var month1 = date1.getMonth() + 1;
            var day1 = date1.getDate();



            var year2 = date2.getFullYear();
            var month2 = date2.getMonth() + 1;
            var day2 = date2.getDate();
            var i=new Date();
            var  cd = i.getDate();
            var cm =l = i.getMonth() + 1;
            var cy= i.getFullYear();

            var cdt= cy + "/" + cm + "/" + cd;


            var date=new Date();

            var hh=year2 + "/" + month2 + "/" + day2;

            var o=year1 + "/" + month1 + "/" + day1;


            var _ = new Date(o),
            h = new Date(cdt),
            y = new Date(hh);
            var tot_agenda = $('.tot-agenda').length;
            for(var k=0;k<tot_agenda;k++){

    
            if(h < _ ){
                $('.watchNow-'+k).html('Join');
                $('.watchNow-'+k).addClass('btn-orange');
                $('.watchNow-'+k).css('padding','6px 30px');
                //$('.liveSt').css('margin-left','-8px');
                $('.liveSt-'+k).html('<i class="XALive" class="dis-inblk ml-8"></i>Live Stream');
            }
            else if(h >= _ && y >= h){
                $('.watchNow-'+k).html('Join');
                $('.watchNow-'+k).addClass('btn-orange');
                $('.watchNow-'+k).css('padding','6px 30px');
                $('.liveSt-'+k).css('margin-left','-2px');
                $('.liveSt-'+k).html('<i class="XALive" class="dis-inblk ml-8"></i>Live Stream');
            }
            else if(h > y){
                // $('.watchNow-'+i).html('Watch Now').addClass('btn-orange');
                if($('.watchNow-'+k).attr('data-vid-id') == '' || $('.watchNow-'+k).attr('data-vid-id') == null){
                    $(".watchNow-"+k).remove();
                    $('.liveSt-'+k).html('<i></i>');
                }
                else{
                    $('.watchNow-'+k).html('Watch Now').addClass('btn-orange');
                    $('.watchNow-'+k).addClass('vidPage').removeClass('watchNow').removeClass('watchNow-'+k);
                    $('.liveSt-'+k).html('<i class="XALive dis-inblk ml-10"></i>Playback');
                }
                
            }
        }
    }

return true;
}


function change_status()
{
    
    

    if($('#strt_end_date').length>0)
    {
        var strt_end_dt=$('#strt_end_date').val();
           var strt_end_dt=strt_end_dt.split(',');

            var date1 = new Date(strt_end_dt[0]*1000);
            var date2 = new Date(strt_end_dt[1]*1000);


            var year1 = date1.getFullYear();
            var month1 = date1.getMonth() + 1;
            var day1 = date1.getDate();



            var year2 = date2.getFullYear();
            var month2 = date2.getMonth() + 1;
            var day2 = date2.getDate();
            var i=new Date();
            var  cd = i.getDate();
            var cm =l = i.getMonth() + 1;
            var cy= i.getFullYear();

            var cdt= cy + "/" + cm + "/" + cd;


            var date=new Date();

            var hh=year2 + "/" + month2 + "/" + day2;

            var o=year1 + "/" + month1 + "/" + day1;


            var _ = new Date(o),
            h = new Date(cdt),
            y = new Date(hh);
            
            
            if (h >= _ && y >= h && ($('#evt_status').val() == '' || $('#evt_status').val() == 'U')) 
            {
                if($('.evtstatus1').hasClass("border_booth") || $('.evtstatus1').hasClass("action-cl")) {
                    $('.evtstatus1').replaceWith("<small class='font-12 status greeen'>Ongoing</small>");
                }
                else
                {
                    $('.evtstatus1').addClass('status greeen').html('( Ongoing )');    
                }
            }
    }


 
  
}



function getStallFlag(source) {
    var tag = source.search("stall");
    if(tag > -1) { return '1'; } else { return '0'; }
}
function getPageType() {
    if($('#pageType').val() !== undefined) 
        pageType = $('#pageType').val() ;
    if(pageType == "Event Listing")
        pageType = 'listing';
}
$(document).ready(function () {
    if(window.location.href.indexOf("interest=") > -1) {
        if(window.location.href.indexOf("interest=visitor") > -1) {    
            if($('.mainbutton1').length > 0 )
                $('.mainbutton1').click();
            else if ($('.mainbutton3').length > 0)
               $('.mainbutton3').click();
        }
        else if(window.location.href.indexOf("interest=exhibitor") > -1) {
            if($("#requestBooth").length > 0 ) {
                $('#requestBooth').click();
            }
        }
    }
    // if(getCookie('user')){
    //     channelizeInit.login();
    // }
});


/*
    Tells device type
    0 - mobile
    1 - desktop
*/
function getDeviceModel() {
    if($('#deviceType').val() !== undefined) 
        deviceModel = $('#deviceType').val() ;
    else if($('#ismobile').val() !== undefined)
    {
        deviceModel = 1 ;
        if($('#ismobile').val() == 1 )
            deviceModel = 0 ;
    }
}
function getSocial(list,source) {
    var html = '';
    for (var i = list.length - 1; i >= 0; i--) {        
        if(list[i] == "facebook")
            html += getFacebook(source);
        else if(list[i] == "10timeslogin")
            html += get10timesLogin(source);
        else if(list[i] == "linkedin")
            html += getLinkedin(source);
        else if(list[i] == "googleplus")
            html += getGooglePlus(source);
    };
    return html != '' ? html ='<div class="col-md-4 col-sm-4 col-xs-12 text-left-center" id="socialDiv">'+html+'</div>':html;
}
function getFacebook(from){
    if(user.country.id == "CN")
        return '' ;
    return addHidden('userMetadata','userMetadata','') + addHidden('userFacebookId','userFacebookId','') + '<button type="button" class="btn btn-primary btn-lg btn-in-block-mobile text-left-center" onclick="fbLogin_combined('+"'"+from+"'"+');"> <i class="fa fa-facebook-square"></i> <span class="hidden-xs"><i class="pipe"></i>Facebook</span></button>';
}
function get10timesLogin(from){
    // return ' <button type="button" id="10TimesLoginButton" class="btn btn-grey btn-lg btn-in-block-mobile text-left-center" onclick="changeForm('+"'login'"+','+"'"+from+"'"+')"> <i class=""><img src="https://c1.10times.com/images/10-icon.png"></i> <span class="hidden-xs"><i class="pipe hidden-xs"></i>10times</span></button>';
    return ' <button type="button" id="10TimesLoginButton" class="btn btn-grey btn-lg btn-in-block-mobile text-left-center" onclick="$(\'#TenTimes-Modal\').modal(\'hide\');showloading();setTimeout(function(){hideloading();changeForm('+"'login'"+','+"'"+from+"'"+')}, 1000);"> <i class=""><img src="https://c1.10times.com/images/10-icon.png"></i> <span class="hidden-xs"><i class="pipe hidden-xs"></i>10times</span></button>';
}
function getLinkedin(from){
    return addHidden('userLinkedinId','userLinkedinId','') + ' <button type="button" class="btn btn-linkedin btn-lg btn-in-block-mobile text-left-center" onclick="linkedin_combined('+"'"+from+"'"+');"> <i class="fa fa-linkedin-square"></i> <span class="hidden-xs"><i class="pipe hidden-xs"></i>Linkedin</span></button>';
}
function getGooglePlus(from){
    return '';
}

function getForm(callback,inputList,source,methodOrig) {
  var html = socialHtml = dividerHtml = formHtml = "";
  var goalFlag=false;

  if(methodOrig === undefined) methodOrig = '';
  hide_individual = getStallFlag(source);
  
  if(inputList['social'] != undefined && inputList['social'].length > 0) socialHtml = getSocial(inputList['social'], source);
  if(inputList['organizerName'] === undefined) inputList['organizerName'] = '';
  if(socialHtml != "" && inputList['fields'] != undefined) dividerHtml = `<div class="col-md-1 col-sm-1 hidden-xs" id="dividerDiv" ><span class="vertical-divider"></span></div>`;

  var data = {
    actionLabel: inputList['actionLabel'],
    actionName: inputList['actionName'],
    fields: inputList['fields'],
    title: inputList['title'],
    socialHtml: socialHtml,
    dividerHtml: dividerHtml,
    methodOrig: methodOrig,
    method: source,
    script: 'desktop',
    Organizername: inputList['organizerName'],
  };

  return $.ajax({
    type: "POST",
    url: site_url_attend + "/ajax/user_connect",
    data: data,
    success: function(n) {
      html = n;
      for(var i = 0; i < inputList['fields'].length; i++) {
        if(inputList['fields'][i] == 'email') goalFlag = true;
      };
      html = $.parseJSON(html);
      callback(html);
    },
    error: function() {
      showToast('Something went wrong!!!');
    }
  });
}

function getRow(field) {
    switch (field){
        case "name":
            return '<div class="form-group rel-position"> <input type="text" placeholder="Name" id="userName"> <span class="undrr"></span><span class="ico fa-user"></span> <span class="text-danger alert_name "></span></div>';
        case "email":
            return addHidden('user_source','userSource','') +'<div class="form-group rel-position"> <input type="email" placeholder="Email" id="userEmail"> <span class="undrr"></span><span class="ico fa-envelope"></span> <span class="text-danger alert_email "></span></div>';
            break;
        case "city":
            return addHidden('user_country','userCountry','') + addHidden('city_code','cityCode','') + addHidden('user_country_code','countryCode','uk') + addHidden('','place_id','')+ '<div class="form-group rel-position"><span class="undrr"></span> </div><div class="form-group rel-position"> <input type="text" placeholder="Your City (Start typing to see option... )" id="userCity" class="user_city city_name" autocomplete="off" > <span class="undrr"></span><span class="ico fa-map-marker"></span> <span class="text-danger alert_city"></span></div>';
        case "company":
            return '<div class="form-group rel-position"> <input type="text" placeholder="Company / Organization" id="userCompany"> <span class="undrr"></span><span class="ico fa-building"></span> <span class="text-danger alert_company"></span><div class="checkbox1" id="checkDiv"></div></div>';
        case "designation":
            return '<div class="form-group rel-position" id="desiDiv"> <input autocomplete="off" type="text" placeholder="Designation / Profession" id="userDesignation" class="user_designation"> <span class="undrr"></span><span class="ico fa-briefcase"></span> <span class="text-danger alert_designation "></span></div>';
        case "phone":
            return '<div class="form-group rel-position" id="phoneDiv"> <input type="text" placeholder="Mobile" id="userMobile"> <span class="undrr "></span><span class="ico fa-phone" ></span><span class="phone_code" id="phoneCode"></span><span class="text-danger alert_mobile "></span></div>';
        case "password":
            return '<div class="form-group rel-position"> <input type="password" placeholder="Password"  id="userPassword"> <span class="undrr"></span><span class="ico fa-lock"></span> <span class="text-danger alert_password "></span></div>';
        case "user":
            return '<input type="hidden" id="userId">';
            break;
        case 'autointroduce':
            return '<div class="form-group rel-position" id="aiDiv"><div class="checkbox" data-toggle="tooltip" data-placement="left" title="" data-original-title="Connect me with other visitors."> <label> <input type="checkbox" id="aiCheckBox" checked="true">Introduce me</label> </div></div>';
            break;
        case "enquiryMessage":
            return  '<div class="form-group rel-position"><textarea rows="5" placeholder="Write Your Message..." class="pd-0" id="message-body"></textarea> <span class="undrr"></span><span class="text-danger alert_message"></span> </div>'
            break;
        case "website":
            return '<div class="form-group rel-position"> <input type="text" placeholder="Website" id="userWebsite"> <span class="undrr"></span><span class="ico fa-globe"></span> <span class="text-danger alert_website "></span></div>';
        default:
            return '';
    }
}
function getAction(source) {
    var stallFlag = getStallFlag(source) ;
    if(stallFlag==1)
        return "stall";
    else if (source.search("bookmark")>-1)
        return "bookmark";
    else if (source.search("going")>-1)
        return "going";
    else if (source.search("follow")>-1)
        return "follow";
    else
        return "interest";
}
function getOneClickSource(source) {
    
    var stallFlag = getStallFlag(source) ;
    if(stallFlag==1)
        return "_stall";
    else if (source.search("bookmark")>-1)
        return "_bookmark";
    else if (source.search("going")>-1)
        return "_going";
    else if (source.search("follow")>-1)
        return "_remind";
    else if(source.search(/orgdetails/)>-1)
        return "_orgdetails";
    else if(source.search(/interested/)>-1)
        return "_interested";
    else
        return "";
}
function getAI(source) {
    var tag = source.search(/follow|bookmark/i);
    if(tag > -1){ return 0; } else{ return 1; }
}
var contactName = null;
var contactEmail = null;
var contactPhone = null;
var contactWebsite = null;

function postActionResponse() {
    if($(eventData.dis).hasClass("a-m")) {
        $(eventData.dis).removeClass("a-m");
    }

    if($(eventData.dis).hasClass("play-btn") || $(eventData.dis).hasClass("agendaWatch")) {
        closeModals();
        $(eventData.dis).click();
    }

    show_thankyou = true;
    hitMyData();
}

function getcompanydata(callback){
    $.ajax({type: "GET", 
            url: site_url_attend + "/ajax?for=companySearch",
            success: function(result) {
                var newData= JSON.parse(result);
                if(typeof newData.status.code!='undefined' && newData.status.code==1 && newData.data.length>0){
                    callback(newData);
                }
            }                
        });
}
function showValidationError(result){
     for(var i=0;i<result.error.invalidData.length;i++){
        var match_string=result.error.invalidData[i].what.toLowerCase();
        if(match_string=='phone'){
          $('#TenTimes-Modal .alert_mobile').show();
          $('#TenTimes-Modal .alert_mobile').html(result.error.invalidData[i].why);
          $('#TenTimes-Modal .alert_mobile').css('color','#ae4b00');
          hideloading();  
        }
        if(match_string=='name'){
          $('#TenTimes-Modal .alert_name').show();
          $('#TenTimes-Modal .alert_name').html(result.error.invalidData[i].why);
          $('#TenTimes-Modal .alert_name').css('color','#ae4b00');
          hideloading();  
        }
        if(match_string=='company'){
          $('#TenTimes-Modal .alert_company').show();
          $('#TenTimes-Modal .alert_company').html(result.error.invalidData[i].why);
          $('#TenTimes-Modal .alert_company').css('color','#ae4b00');
          hideloading();  
        }
        if(match_string=='designation'){
          $('#TenTimes-Modal .alert_designation').show();
          $('#TenTimes-Modal .alert_designation').html(result.error.invalidData[i].why);
          $('#TenTimes-Modal .alert_designation').css('color','#ae4b00');
          hideloading();  
        }
        if(match_string=='city'){
          $('#TenTimes-Modal .alert_city').show();
          $('#TenTimes-Modal .alert_city').html(result.error.invalidData[i].why);
          $('#TenTimes-Modal .alert_city').css('color','#ae4b00');
          hideloading();  
        }

    }
}
function getAttendFlag(source) {
    if(source.search("follow") > -1) { return '2'; } else { return '1'; }
}
var getTicket=null;
var orgdetailsSource=null;

function callGaEvent(source ,callback) {
    
    var customPageType = customEventLabel = "";
    if($("#pageType").length > 0) {
        customPageType = $("#pageType").val();
    } 
    if(customPageType == 'org_detail') {
        customPageType = "Company";
    }
    else if(customPageType == "venue_detail" || customPageType == "venueListing") {
        customPageType = "Venue";
    } else if(customPageType == "homepage") {
        customPageType = "HomePage";
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
   if(source.search("bookmark") > -1 || source.search("follow") > -1) {
        if(customPageType == "HomePage") {
            customPageType = "Event";
            customEventLabel = "HomePage|Visitors|Save Button";
        }
        source='Follow';
   }
    else if(source == 'stall_attend')
        source='Enquiry';
    else if(source.search("interest") > -1 || source.search("attend") > -1) {
        if(customPageType == "HomePage") {
            customPageType = "Event";
            customEventLabel = "HomePage|Interested";
        }
        source='Interested';
    }
    else if(source == 'going')
        source='Going';
    else if(source == 'stall_attend')
        source='Enquiry';
    else if(source == 'share')
        source='Non Lead 2';
    else if(source == 'connect')
        source='Non Lead 1';
    else if((source == 'speaker') || (source == 'visitor')) {
        if(customPageType == "HomePage") {
            customPageType = "Event";
            if(source == 'speaker') {
                customEventLabel = "HomePage|Speakers|Speaker Snippet|Top Right Heart";
            }
            if(source == 'visitor') {
                customEventLabel = "HomePage|Visitors|Visitor Snippet|Top Right Heart";
            }
        }
        source='Non Lead 1';
    }
    else if(source == 'enquiry')
        source='Enquiry';
    else if(source == 'listing') {
        source='Follow';
        customPageType='Event Listing';
    }
    else if(source == 'ticket') {
        customEventGA(customPageType ,"Non Lead 2","Event Detail | About | Visitor Ticket | Buy Ticket" );
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
       customEventGA(customPageType ,"Non Lead 1","Get Direction | Top Banner" );
        return true;
    }
    else if(source == 'claim') {
       customEventGA(customPageType ,"Non Lead 2","Claim "+customPageType);
        return true;
    }
    else if(source == 'profile') {
       customEventGA('connect','connect-request | '+source);
        return true;
    }
   if(customPageType == 'Event Listing' && source.search("Bookmark") > -1 || source.search("Follow") > -1 || source.search("Interested") > -1 ){
   }else{
       gaEvent(customPageType,source);
   }
    
    return true;
}
function check_status_modal(){
            var event_status='';
            var date=$(eventData.dis).parent().find('input').attr('data-date');
            if(date===undefined)
                date=$(eventData.dis).attr('data-date');
            var event_enddate= Math.round((new Date(date)).getTime() / 1000)+86400;
            if(date===undefined){
              var d = $('#strt_end_date').val();
              if ($('#strt_end_date').length>0) {
                var s = d.split(",");
                 event_enddate=parseInt(s[1])+86400;
              }
            }
            var currentdate=Math.round(+new Date()/1000); 
            if(currentdate<event_enddate){
                     event_status='upcoming';    
            }else{
                     event_status='past';    
            }
            return event_status;
}
function eventurl()
{
    var url=$(eventData.dis).parent().find('input').attr('data-url');
      if(url===undefined)
          url=$(eventData.dis).attr('data-url')
      return url;
}

function eventwebsite()
{
    var url=$(eventData.dis).parent().find('a').attr('data-website');
      if(url===undefined)
          url=$(eventData.dis).attr('data-website')
      return url;
}

function eventid()
{
    var id=$(eventData.dis).attr('data-id');
    if(id===undefined)
         id=$(eventData.dis).parent().find('input').attr('data-id');
    return id;
}

function eventname() {
   return nullCheck(eventData.name) ? eventData.name : $(eventData.dis).attr('data-name');
}

function check_status(){
            var event_status='';
            var d = $('#strt_end_date').val();
            var s = d.split(",");
            var event_startdate=parseInt(s[0]);
            var event_enddate=parseInt(s[1])+86400;
            var currentdate=Math.round(+new Date()/1000);   

            if(currentdate>=event_startdate && currentdate<=event_enddate){
                     event_status='ongoing';    
            }else if(currentdate<event_startdate){
                     event_status='upcoming';    
            }else{
                     event_status='past';    
            }
            return event_status;

}

function getIntentValue(source) {
    var stallFlag = getStallFlag(source) ;
    if(stallFlag==1)
        return '1010_1';
    else if (source.search("bookmark")>-1)
        return "1000_2";
    else if (source.search("going")>-1)
        return "1000_1";
    else if (source.search("follow")>-1)
        return "1000_2";
    else
        return "1000_1";
}
/*
Sets Location field i.e. country, city drop down, designation dropdown
*/
function postFormOpenSettings(country){
        initAutocomplete() ;
        //$("#lcation").intlTelInput();
        if(typeof country != 'undefined' && country != ""  && country != null){
            //$(".selected-flag").find(".flag").removeClass().addClass("flag " + country.toLowerCase());
            $("#TenTimes-Modal #countryCode").val(country);
        }
        else if(user.country.id){
            //$(".selected-flag").find(".flag").removeClass().addClass("flag " + getCookie('countryCode').toLowerCase());
            $("#TenTimes-Modal #countryCode").val(user.country.id);
        }
        // var A = $("#lcation").intlTelInput("getSelectedCountryData");
        // if(typeof A != 'undefined' && A != ""  && A != null){
        //     $("#TenTimes-Modal #countryCode").val(A.iso2);
        //     $("#TenTimes-Modal #phoneCode").html("+" + A.dialCode);
        //     $("#TenTimes-Modal #userCountry").val(A.iso2);
        // }
        //getCities();
        //city_autoComplete("#TenTimes-Modal .city_name", "#TenTimes-Modal .city_code");
        designation_autoComplete("#TenTimes-Modal .user_designation");
        $('[data-toggle="tooltip"]').tooltip();
        $('#TenTimes-Modal input').filter(function() {
            var myId = $(this).attr('id');   
            return (myId == 'userEmail' || myId == 'userCompany' || myId == 'userDesignation');
        }).blur(function() {
            autoSave();
        });
}
function showSubHeading(message) {
    $('#TenTimes-Modal #subTitle').html(message);
}
function hideSubHeading() {
    $('#TenTimes-Modal #subTitle').html('');
}
function showloading(source, I) {
    if($('#pageType').val() === undefined)  pageType = '' ;
    if(source === undefined ) source = '' ;
    if(I === undefined ) I = '' ;

    switch(pageType){
        case 'exhibitors' : 
            switch(source){
                case 'list' :
                    if(I != ""){
                        $("a[data-user-id='"+I+"']").append('<i class="loader-js fa fa-spin fa-refresh fa-fw fa-x float-end"></i>')
                    }
                    else{
                        $("#loading").show();
                    }
                    break ;
                default : 
                    $("#loading").show();
                    break ;
            }
            break ;
        case 'thankyou_new' : 
            switch(source){
                case 'redirect' :
                    if(I != ""){
                        $("#loading_redirect").show();
                    }
                    else{
                        $("#loading").show();
                    }
                    break ;
                default : 
                    $("#loading").show();
                    break ;
            }
            break ;
        default : 
            $("#loading").show();
            break ;
    }
    // hide loader after 15 sec
    setTimeout(hideloading, 15000);
}
function hideloading(source, I) {
    $("#loading").hide();
    if($('#pageType').val() === undefined)  pageType = '' ;
    if(source === undefined ) source = '' ;
    if(I === undefined ) I = '' ;

    switch(pageType){
        case 'exhibitors' : 
            switch(source){
                case 'list' :
                if(I != ""){
                    $("a[data-user-id='"+I+"']").find('.loader-js').remove();
                }
                else{
                    $("#loading").hide();
                }
                break ;
                default : 
                    $("#loading").hide();
                    break ;
            }
            break ;
        case 'thankyou_new' : 
            switch(source){
                case 'redirect' :
                    if(I != ""){
                        $("#loading_redirect").hide();
                    }
                    else{
                        $("#loading").hide();
                    }
                    break ;
                default : 
                    $("#loading").hide();
                    break ;
            }
            break ;
        default : 
            $("#loading").hide();
            break ;
    }
}
function getLoading() {
    return '<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog modal-740" role="document"> <div class="modal-content modal-primary"><div class="modal-header text-center"> <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> <h3 class="modal-title" id="myModalLabel">Please wait...</h3> </div><div class="modal-body"><div class="row"><div class="col-md-12 col-sm-12 text-center"><img src="https://c1.10times.com/img/ajax-loader.gif"></div></div></div></div></div></div>';
}
function openform() {
    showSubHeading('');
    $('#vCardDiv').hide();
    $('#userName').closest('.form-group').show();
    $('#userCity').closest('.form-group').show();
    $('#lcation').closest('.form-group').show();
    $('#userDesignation').closest('.form-group').show();
    $('#userCompany').closest('.form-group').show();
    $('#userMobile').closest('.form-group').show();
}
function vcardopen(name,email,designation,company,city,country,callToAction,id,userImage,userPhone,userplaceid){
    $('#TenTimes-Modal .material-form').show();
    if(name != undefined && name != "" )
        $("#TenTimes-Modal #userName").val(name);
    if(company != undefined && company != "")
        $("#TenTimes-Modal #userCompany").val(company);
    if(designation != undefined && designation != "")
        $("#TenTimes-Modal #userDesignation").val(designation);
    if($("#TenTimes-Modal #userId").length >0 && id != "" && typeof id != "undefined")
        $("#TenTimes-Modal #userId").val(id);
    if(country != undefined && country != "")
        $("#TenTimes-Modal #userCountry").val(country);
    if(city != undefined && city != "")
        $("#TenTimes-Modal #userCity").val(city);
    if(userPhone != undefined && userPhone != "")
        $("#TenTimes-Modal #userMobile").val(userPhone);
    if(email != undefined && email != "" && typeof email != "undefined")
        $("#TenTimes-Modal #userEmail").val(email);
    if(userplaceid != undefined && userplaceid != "" && typeof userplaceid != "undefined")
        $("#TenTimes-Modal #place_id").val(userplaceid);
    hideSubHeading();
    $('#aiDiv').show();
    $('#userMobile').closest('.form-group').show();
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740').addClass('modal-500');
    $('#TenTimes-Modal #dividerDiv').hide();
    $('#TenTimes-Modal #socialDiv').hide();
    $('#TenTimes-Modal .col-md-7').removeClass('col-md-7').addClass('col-md-12');$('#TenTimes-Modal .col-sm-7').removeClass('col-sm-7').addClass('col-sm-12');
    var vcardHtml = ' <div class="row"> <div class="col-md-2 col-xs-3"> <img id="vcardImage" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDE0MCAxNDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjwhLS0KU291cmNlIFVSTDogaG9sZGVyLmpzLzE0MHgxNDAKQ3JlYXRlZCB3aXRoIEhvbGRlci5qcyAyLjYuMC4KTGVhcm4gbW9yZSBhdCBodHRwOi8vaG9sZGVyanMuY29tCihjKSAyMDEyLTIwMTUgSXZhbiBNYWxvcGluc2t5IC0gaHR0cDovL2ltc2t5LmNvCi0tPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PCFbQ0RBVEFbI2hvbGRlcl8xNTJmM2ZhMGNmYSB0ZXh0IHsgZmlsbDojQUFBQUFBO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWwsIEhlbHZldGljYSwgT3BlbiBTYW5zLCBzYW5zLXNlcmlmLCBtb25vc3BhY2U7Zm9udC1zaXplOjEwcHQgfSBdXT48L3N0eWxlPjwvZGVmcz48ZyBpZD0iaG9sZGVyXzE1MmYzZmEwY2ZhIj48cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjQzLjUiIHk9Ijc0LjgiPjE0MHgxNDA8L3RleHQ+PC9nPjwvZz48L3N2Zz4=" alt="..." class="img-thumbnail"> </div><div class="col-md-8 col-xs-7"> <div class="row"> <p><strong id="vcardName" ></strong><br><span class="text-muted" id="vcardJob"></span><br><span id="vcardLocation"></span></p></div></div><div class="col-md-1 col-xs-1 text-right"> <a href="javascript:openform();" style="vertical-align:top; display:inline-block"><span class="hidden-xs">Edit</span><span class="fa fa-edit hidden-lg"></span></a> </div></div>';
    $('#TenTimes-Modal #vCardDiv').html(vcardHtml);
    var name_flag = location_flag = designation_flag =  company_flag = 0;
    var image = '' ;
    var vcard_flag = 1;
    if($("#userMetadata").val() != undefined &&  $("#userMetadata").val() != ""){
        var parse = JSON.parse($("#userMetadata").val());
        if(parse.email != undefined)
            image = "//graph.facebook.com/"+parse.id+"/picture";
        else if(parse.emailAddress != undefined && parse.pictureUrl)
            image = parse.pictureUrl;
    }
    if(image == ''){
        if(userImage != undefined && userImage != "" && typeof userImage != "undefined"){
            image = userImage;
        }
        else{
            var temp = $.trim($('#userName').val());
            temp = temp.charAt(0);
            temp = temp.toLowerCase();
            if(temp.match(/[a-z]/i))
                image = "https://c1.10times.com/userimages/"+temp+".jpg";
        }
    }
    if(image != "")
        $('#vcardImage').attr('src', image);
    if(!checkMobile()){
        $('#userMobile').closest('.form-group').show();
        vcard_flag = 0;
    }
    if(name == undefined || !validateName(name) || name == "Your Name" || name == ""){
        vcard_flag = 0;
        $('#userName').closest('.form-group').hide();
    }
    else{
        name_flag = 1;
        $('#vcardName').text(name);
    }
    var userId = $("#TenTimes-Modal #userId").val();
    if((userId == null || userId == undefined || userId == "") && ( !validateEmail12345(email) || email == "Email"  || email == ""))
        vcard_flag = 0;
    else
        $('#userEmail').closest('.form-group').hide();

    if(  city == "City" || country == "Country" || city == "" || country =="" || country == undefined || city == undefined || !validateCity12345(city)){
        $('#userCity').closest('.form-group').show();
        $('#lcation').closest('.form-group').show();
        vcard_flag = 0;

    }
    else{
        location_flag = 1;
        $('#vcardLocation').text(city+', '+country);
    }
    if(designation == undefined || designation == '' || designation == 'Designation' || (!validateDesignation12345(designation) && !($('#userDesignation').is(':disabled')) )) {
        vcard_flag = 0;
    }
    else {
        designation_flag = 1;

    }
    if(company == undefined || company == '' || company == 'Company'  || (!($('#userCompany').is(':disabled')) && !validateCompany(company))) {
        vcard_flag = 0;
    }
    else {
            company_flag = 1        
    }

    if(1){
        if(name_flag == 1){
            $('#userName').closest('.form-group').hide();
        }    
        else{
            showSubHeading('Little more information is required');
            $('#userName').closest('.form-group').show();
        }
        if(location_flag == 1){
            $('#userCity').closest('.form-group').hide();
            $('#lcation').closest('.form-group').hide();
        }else{
            showSubHeading('Little more information is required');
            //$('#userCity').val('');
            $('#userCity').closest('.form-group').show();
            $('#lcation').closest('.form-group').show();
        }
        
        if(designation_flag == 1) {
            $('#userDesignation').closest('.form-group').hide();
        }
        else{
            //showSubHeading('Little more information is required');
            $('#userDesignation').closest('.form-group').show();
        
        }
        if(company_flag == 1) {
            $('#userCompany').closest('.form-group').hide();
        }
        else{
            $('#userCompany').closest('.form-group').show();
        }
    }
    autoSave();    
}
/*
    Processing after submitting the attend/follow form
*/

function RegisterForm() {
    $("#phoneDiv").show();
    $("#aiDiv").show();
    if($.trim($("#TenTimes-Modal #userCompany").val()) == "" && $.trim($("#TenTimes-Modal #userDesignation").val()) == "" && hide_individual != 1)
        $("#checkDiv").show();
    if(!$("#TenTimes-Modal #individualCheckBox").is(":checked") && $.trim($("#TenTimes-Modal #userCompany").val()) == "")
        $("#desiDiv").show();
    showloading();
    var B = validateFormData('attend');
    hideloading();
    if (!B) {
        return false
    } else {
        showloading();
        var aiValue = 0;
        if($("#TenTimes-Modal #aiCheckBox").is(":checked")) // change
            aiValue = 1;
        var data = {
            event_id: eventData.id,
            user_id: $("#TenTimes-Modal #userId").val(),
            user_token: getCookie('user_token'),
            metadata: $("#TenTimes-Modal #userMetadata").val(),
            name: $("#TenTimes-Modal #userName").val(),
            designation: $("#TenTimes-Modal #userDesignation").val(),
            designationId: $.trim($("#TenTimes-Modal #designationId").val()),
            company: $("#TenTimes-Modal #userCompany").val(),
            city: $("#TenTimes-Modal #userCity").val(),
            place_id: $("#TenTimes-Modal #place_id").val(),
            country: $("#TenTimes-Modal #userCountry").val(),
            email: $("#TenTimes-Modal #userEmail").val(),
            phone: $("#TenTimes-Modal #userMobile").val(),
            phoneCode: $("#TenTimes-Modal .phone_code_value").attr('value'),
            source: $("#TenTimes-Modal #userSource").val(),
            HTTP_REFERER: location.href,
            facebookId: $("#TenTimes-Modal #userFacebookId").val(),
            linkedinId: $("#TenTimes-Modal #userLinkedinId").val(),
            ai_value: aiValue,
            individual: $("#TenTimes-Modal #individualCheckBox").is(":checked"),
            website: $("#TenTimes-Modal #userWebsite").val(),
        };
        if(data.event_id == null){
            data.event_id = $('#eventID').val();
        }
        if( eventData.eventEditionId != undefined) {
            data.eventEditionId =  eventData.eventEditionId;
            data.noEmail = 1; 
        }
        if(data.source.search("interest") >-1) {
            data.action="interest";
        }
        if(data.source.search("going") >-1) {
            data.action="going";   
        }
        if(data.source.search("orgdetails") >-1) {
            data.action="interest";
            hitAuth(data,'orgdetails',$("#TenTimes-Modal #userSource").val(),data,'');
        }
        else if(data.source.search("video_comment") > -1){
            dis = $("#TenTimes-Modal #dis").val();
            hitAuth(data,'videoCommentSubmit',$("#TenTimes-Modal #userSource").val(),data,'');
        }
        else{
            hitAuth(data,'interest',$("#TenTimes-Modal #userSource").val(),data,'');
        }




    }
}
function showOrgDetails(result, data,source) {
    if($('#modalData').html() == "")
    $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
    $('#TenTimes-Modal .modal-title').html('');
    if(orgdetailsSource == "website") {
        $('#TenTimes-Modal .modal-title').html("Verifying official website <i class='fa fa-spinner fa-spin'></i>");
    }
    else if(orgdetailsSource == 'ticket'){
        $('#TenTimes-Modal .modal-title').html("Verifying ticket url <i class='fa fa-spinner fa-spin'></i>");
    }
    else if(orgdetailsSource == 'webinar'){
        $('#TenTimes-Modal .modal-title').html("Verifying webinar url <i class='fa fa-spinner fa-spin'></i>");
    }
    else {
        $('#TenTimes-Modal .modal-title').html("Contact Details <i class='fa fa-spinner fa-spin'></i>");   
    }
    $('#TenTimes-Modal .modal-title').siblings('h5').remove();
    $('#TenTimes-Modal .modal-body').html('');
    $('#TenTimes-Modal').modal('show');
    if(source.search(/orgdetails/)>-1){
        if(orgdetailsSource == "ticket"){
            var requestfor = "ticket";
        }
        else if(orgdetailsSource == "webinar"){
            var requestfor = "webinar";
        }
        else {
            var requestfor = "eventContact"; 
        }
        var userResult=result; 
        $.ajax({type: "GET", url: site_url_attend + "/ajax?for="+requestfor+"&eventId="+eventData.id,
            success: function(result) {
                var newData= JSON.parse(result);
                if(orgdetailsSource == "website" || orgdetailsSource == "ticket") {
                    if(orgdetailsSource == "website"){
                        contactWebsite = newData.event_website;
                        var websiteIsValid = newData.websiteIsValid;
                    }
                    else {
                        if(newData.status == '1' || newData.status.code == 1) {
                            contactWebsite = newData.data;
                            var websiteIsValid = newData.isvalid;
                        }
                    }
                    if (websiteIsValid == 1) {
                        var websiteTab = window.open();
                        if(websiteTab ==null){
                            showPopupBlockMessage(contactWebsite , orgdetailsSource);

                        }else {
                            $('#TenTimes-Modal').modal('hide');
                            websiteTab.location.href = contactWebsite;    
                        }

                        
                    }
                    else {

                           showOrgWebsite(orgdetailsSource,userResult);   
                        }
                return true;
                }
                if(orgdetailsSource == "contact") {
                    contactName = newData['contacts'][0]['name'];
                    contactEmail = newData['contacts'][0]['email'];
                    contactPhone = newData['contacts'][0]['phone'];
                    showOrgContact(newData['contacts']);
                    return true;
                }
            }
        });
    }
}
function showOrgWebsite(orgdetailsSource,userResult) {
     if(orgdetailsSource == 'ticket') {
        redirectTo(userResult)
       return true;
    }
    if($('#modalData').html() == "")
    $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
    $('#TenTimes-Modal .modal-title').html('');
    $('#TenTimes-Modal .modal-title').html("We have encountered issue in opening website");
    $('#TenTimes-Modal .modal-title').siblings('h5').remove();
    $('#TenTimes-Modal .modal-body').html('Our team has been notified about this error; some probable reason for this error might include<ol><li>Organizer has changed the url for the website.</li><li>Website link/url is temporarily down at the moment.</li><li>Organizer has not created any official website for this event yet.</li></ol>');
    $('#TenTimes-Modal').modal('show');
}

var embedData = [];

function showPopupBlockMessage(urls, orgdetailsSource, data=[]) {
    if(typeof urls === "object") {
        var websiteUrl = urls.pop();
    } else {
        var websiteUrl = urls;
    }
    if($('#modalData').html() == "")
    $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
    $('#TenTimes-Modal .modal-title').html('');
    if(orgdetailsSource.search(/website/) > -1) {
            
        $('#TenTimes-Modal .modal-title').html('<center>Event Website</center><center><small><a href="'+websiteUrl+'" target="_blank" rel="noreferrer">'+websiteUrl+'</a></small></center>');
    }
    else if(orgdetailsSource.search(/webinar/) > -1) {    
        var modalView = '';
        embed(function(embed) {
            if(nullCheck(embed)) {
                var embedFrame = resizeFrame(embed["html"]);
                if(embedFrame !== undefined) {
                    embed["html"] = embedFrame;
                }
                embedData.unshift({"thumbnail": embed["thumbnail"], "html": embed["html"]});
            
                modalView = '<div class="embed">' +
                                embed["html"] +
                            '</div>';

                modalCross();
                $(".modal-content button").css({
                    "position": "absolute",
                    "top": "50%",
                    "right": "-25%",
                });
                $(".modal-body").remove();
                $(".modal-dialog").append('<div id="related-videos"></div>');

                if((typeof(urls) === "object") && (urls.length > 0)) {
                    let events = false;
                    for(let i=0; i<urls.length; i++) {
                        if(i == urls.length-1) {
                            events = true;
                        }
                        relatedVideos(urls[i], data[i+1], events);
                    }
                } else {
                    relatedEvents();
                }
                refreshParser();
            } else if(websiteUrl.indexOf("zoom.us/") > -1) {
                if(websiteUrl.indexOf("/register") > -1) {
                    modalView = '<div class="zoom-container">' +
                                '<iframe allow="microphone; camera" src="' +
                                    websiteUrl +
                                '" frameborder="0" sandbox="allow-forms allow-scripts allow-same-origin"></iframe>' +
                            '</div>';
                } else {
                    let zoomId = websiteUrl.split('/').pop();
                    modalView = '<div class="zoom-container">' +
                                '<iframe allow="microphone; camera" src="https://zoom.us/wc/join/' +
                                    zoomId +
                                '" frameborder="0" sandbox="allow-forms allow-scripts allow-same-origin"></iframe>' +
                            '</div>';
                }
                modalCross();
                $(".modal-content").css({
                    "padding": "0",
                    "border-radius": "4px",
                });
                $(".modal-content button").css({
                    "position": "relative",
                    "top": "500px",
                    "right": "50%",
                });
                $(".modal-header").css("padding", "0 0 0 15px");
                $(".modal-body").remove();
            } else {
                modalView = '<center>Streaming On</center>' +
                            '<center><small>' +
                                '<a href="' + websiteUrl + '" target="_blank" rel="noreferrer">' + 
                                    websiteUrl + 
                                '</a>'+
                            '</small></center>';
            }
            $('#TenTimes-Modal .modal-title').html(modalView);
        }, websiteUrl);
    }
    else {
        $('#TenTimes-Modal .modal-title').html('<center>Purchase Ticket</center><center><small><a href="'+websiteUrl+'" target="_blank" rel="noreferrer">'+websiteUrl+'</a></small></center>');
    }   
    $('#TenTimes-Modal .modal-title').siblings('h5').remove();
    $('#TenTimes-Modal .modal-body').html('');
    $('#TenTimes-Modal').modal('show');
    if(websiteUrl.indexOf("zoom.us/") > -1){
        $(".modal-header").append(
            '<div id="zoom-error" style="padding: 5px;">In case of error, <a href="'+ websiteUrl + '"> click here </a></div>'
        );
    }
}

function resizeFrame(embedFrame, resizeKey=true) {
    if(nullCheck($.parseHTML(embedFrame))) {
        let modalFrame = '';
        let responseTags = $.parseHTML(embedFrame).length;
        for(let i=0; i<responseTags; i++) {
            let frame = $.parseHTML(embedFrame)[i];
            if(nullCheck(frame.outerHTML) && ($(frame.outerHTML).prop("tagName") === "IFRAME")) {
                modalFrame = $.parseHTML(embedFrame)[i];
                break;
            }
        }
        
        if((typeof(modalFrame) !== "undefined") && (modalFrame != '')){
            $(modalFrame).attr({
                "width": "100%",
                "height": "100%",
                "allow": "autoplay",
            });

            if(resizeKey) {
                resizeModal(true);
            }
            return $(modalFrame)[0].outerHTML;
        }

        if(resizeKey) {
            resizeModal();
        }
    }
}

function resizeModal(frame=false) {
    $(".modal-content").css({
        "width": "520px",
        "height": "auto",
        "padding": "0px",
        "border-radius": "10px",
        "margin": "auto",
    });

    if(frame) {
        $(".modal-content").css({
            "height": "360px",
        });
    }

    $(".modal-header").css({
        "height": "100%",
    });

    $(".modal-title").css({
        "height": "100%",
    });
}

function relatedVideos(url, title='', events=false) {
    embed(function(embed) {
        if(nullCheck(embed)) {
            if(embed["thumbnail"] === undefined) {
                embed["thumbnail"] = "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSz8QhYfm8jzzz7fnwrj0p2-ayg-LR83tfz1B5D6Zg-pSAD22BX&usqp=CAU";
                title = '<div style="position: relative; top: -20px; text-align: center; font-weight: 500;">' + title + '</div>';
            } else {
                title = '';
            }
            var embedFrame =  '<img src="' + embed["thumbnail"] + '" alt="not found"/>' + title;
            embedData.push({"thumbnail": embed["thumbnail"], "html": embed["html"]});
            var embedded = false;

            if(nullCheck($.parseHTML(embedFrame))) {
                let responseTags = $.parseHTML(embedFrame).length;
                for(let i=0; i<responseTags; i++) {
                    let frame = $.parseHTML(embedFrame)[i];
                    if(nullCheck(frame.outerHTML) && ($(frame.outerHTML).prop("tagName") === "IFRAME")) {
                        let modalFrame = $.parseHTML(embedFrame)[i];
                        $("#related-videos").append('<div class="related-videos">' + $(modalFrame)[0].outerHTML + '</div>');
                        embedded = true;
                    }
                }
                if(embedded) {
                    embedded = false;
                } else {
                    $("#related-videos").append('<div class="related-videos">' + embedFrame + '</div>');
                }
            }

            $.each($(".related-videos"), function(idx, val){
                $(val).find("iframe").attr({
                    "width": "210px",
                    "height": "125px",
                });
                $(val).find("img").attr({
                    "data-id": idx + 1,
                    "width": "230px",
                    "height": "134px",
                    "onclick": "putSelectedMedia(this)",
                });
            });
            refreshParser();
        }
        if(events && $(".related-videos").length < 1) {
            relatedEvents();
        }
        if($(".related-videos").length > 2) {
            $("#related-videos").css("justify-content", "unset");
        }
    }, url);
}

function relatedEvents() {
    getLive(function(data){
        $.each(data, function(key, val){
            var event_name = val.name;
            if(event_name.length > 32) {
                event_name = event_name.substring(0, 28) + '...';
            }

            $("#related-videos").append(
                '<div class="related-events box box-border">' +
                    '<div style="color: #fff; background-color: #47736f; padding: 5px; text-align: center; margin: -15px -15px 10px -15px;">' +
                        '<h2 style="font-size: 18px; margin: 0;">' +
                            val.type +
                        '</h2>' +
                    '</div>' +
                    '<a href="' + val.url + '" target="_blank" rel="noreferrer" style="text-decoration: None;">' +
                        '<h4 data-id="' + val.id + '"' + 'data-edition="' + val.edition + '" style="text-decoration: None;">' + 
                            event_name +
                        '</h4>' +
                    '</a>' +

                    '<div class="date">' + 
                        '<i class="fa fa-clock-o fa-fw"></i>' +
                        '<span>' + 
                            dayjs(val.startDate).format('DD MMM YYYY') + '&nbsp;-&nbsp;' + dayjs(val.endDate).format('DD MMM YYYY') + 
                        '</span>' +
                    '</div>' +
                    
                    '<div style="position: relative; float: right; top: 15px;">' + 
                        '<span class="xaLiveA"></span>' +
                        '<span class="text-success" style="font-size: 12px; font-weight: 500;">&ensp;Live</span>' +
                    '</div>' +
                '</div>'
            );
        });
        if($(".related-events").length > 2) {
            $("#related-videos").css("justify-content", "unset");
        }
    }, 10);
}

function refreshParser() {
    if(typeof(FB) !== "undefined") {
        FB.XFBML.parse();
    }
}

function putSelectedMedia(clk) {
    var nextIdx = parseInt($(clk).attr("data-id"));
    if(!isNaN(nextIdx)) {
        var nextFrame = resizeFrame(embedData[nextIdx]["html"]);
        if(nextFrame === undefined) {
            nextFrame = embedData[nextIdx]["html"];
        }

        $(".embed").html(nextFrame);
        $(clk).attr("src", embedData[0]["thumbnail"]);
        
        if(nextIdx > 0) {
            let prev = embedData[0];
            embedData[0] = embedData[nextIdx];
            embedData[nextIdx] = prev;
        }
        refreshParser();
    }
}

function showOrgContact(contactData) {

    if($('#modalData').html() == "")
    $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
    $('#TenTimes-Modal .modal-title').html('');
    $('#TenTimes-Modal .modal-title').html("Contact Details");
    $('#TenTimes-Modal .modal-title').siblings('h5').remove();
    var html = '';
    html = html+'<table align=center style="width:80%">';
    $.each(contactData, function(index, value) {
        if(index == 0 || index == 2 || index == 4) {
            html = html+'<tr>';            
        }
        html = html+'<td><div class="block'+index+'" style="background:#f3f3f3;box-shadow: 1px 1px 2px 0 rgb(222, 222, 222);padding:10px;margin:.5em;border-radius: 5px;">';
        if(value.verified_by_us || value.verified_by_user) {
            html = html+'<span class="float-end"><i class="verified-check tt-svg-md"></i></span>';
        }
        if(value.is_visitor == 1 || value.is_stall == 1) {    
            html = html+'<span style="color:#e96400">For ';
                if(value.is_visitor == 1 && value.is_stall == 1) {
                    html = html+'Visitors & Exhibitors';
                }
                else if(value.is_visitor == 1) {
                    html = html+'Visitors';
                }
                else {
                    html = html+'Exhibitors';
                }
            html = html+'</span><br>';
        } 
        if(value.name) {
            html = html+'<strong>'+value.name+'</strong><br>';
        }
        if(value.designation) {
            html = html+'<small>'+value.designation+'</small><br>';
        }
        if(value.email) {
            html = html+'<small><i class="fa fa-envelope-o" style="margin-right:5px;"></i><a href="mailto:'+value.email+'" target="_blank" rel="noreferrer">'+value.email+'</a></small><br>';
        }
        // if(value.phone) {
        //     html = html+'<small><i class="fa fa-phone" style="margin-right:5px;"></i>'+value.phone+'</small><br>';
        // }
        html = html+'</div></td>';
        if(index == 1 || index == 3 || index == 6) {
            html = html+'</tr>';            
        }


    }); 
    var html = html+'</table>';
    $('#TenTimes-Modal .modal-body').html(html);
    $('#TenTimes-Modal').modal('show');
     if($('.block0').height() > $('.block1').height()) {
        $('.block1').height($('.block0').height());
    }
    else {
        $('.block0').height($('.block1').height());   
    }
    if($('.block2').height() > $('.block3').height()) {
        $('.block3').height($('.block2').height());
    }
    else {
        $('.block2').height($('.block3').height());   
    }    
    if($('.block4').height() > $('.block5').height()) {
        $('.block5').height($('.block4').height());
    }
    else {
        $('.block4').height($('.block5').height());   
    }
}
function RegisterFormResponse(result,data,source){
    if(result.status == 1){
        userData.visitorId = result.visitor_id ;
        userData.encodeId = result.encode_id ;
        if(typeof source != "undefined" && getStallFlag(source) == 1)
        {
            // consentup(10);
            openQuestion(source,result);
        }
        else if(pageType.search('top100') > -1 || pageType == 'profile' || pageType == 'listing' || pageType == 'org_detail' || source=='followVs'|| pageType=='venue_detail' || (typeof only_thankyou!=='undefined' && only_thankyou==1) || pageType!='group'){
            if( (pageType=='listing' || pageType=='venue_detail' || pageType == 'org_detail') && source=='going'){
                redirectTo(result,source);    
            }
            else if($('#pageCategory').val() == 'Event' && $(eventData.dis).hasClass('action-rg')){
                redirectTo(result,source);
            }
            else{
                if(pageType=='venue_detail')
                    hitMyData();
                show_thankyou == true ? showThank('event') : postActionResponse();
            }
            // consentup(10);
            
        }
        else{
           
            // consentup(10);
            redirectTo(result,source);
        }
    }
    else{
        if(result.status == 0 && result.hasOwnProperty('error') && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('id') && result.error.hasOwnProperty('invalidData')){
            showloading();
             var flagmobile=0;
          for(var i=0;i<result.error.invalidData.length;i++){
             var match_string=result.error.invalidData[i].what.toLowerCase();
             if(match_string=='phone'){
                $('#userMobile').siblings('.alert_mobile').show();
                $('#userMobile').siblings('.alert_mobile').html(result.error.invalidData[i].why);
                 $('#userMobile').siblings('.alert_mobile').css('color','#ae4b00');
                 hideloading();  
                flagmobile=1;
              }           
            }
         if(flagmobile==0){
            vcardopen(result.userData.name,$("#TenTimes-Modal #userEmail").val(),result.userData.designation,result.userData.userCompany,result.userData.cityName,result.userData.countryName,'','',result.userData.profilepicture,'');
            hideloading();
          }
        }
        else{
            showApiError(result);
        }
    }
}

function thankParam(type) {
  switch (type) {
    case 'event':
    return {
      pageType: pageType,
      for: 'event_follow_organizer',
      eventName: eventname(),
      eventStatus: check_status_modal(),
      eventUrl: eventurl(),
      eventId: eventid(),
      status: $(eventData.dis).attr('data-status'),
      followSettings: $(eventData.dis).attr('data-followsettings'),
      userEncodeId: userData.encodeId,
      ticket: eventData.dis.textContent.trim() == 'Register' || eventData.dis.classList.contains('register') ? 1 : 0,
      type: eventData.dis.classList.contains('register') ? 'Register' : (eventData.dis.classList.contains('interested') ? 'Interested' : eventData.dis.textContent.trim()),
      eventWebsite: eventwebsite(),
      functionality: $(eventData.dis).attr('data-functionality'),
      future_edition: $('#future_edition').val()
    };

    case 'speaker':
    return {
      pageType: pageType,
      for: 'speaker_follow',
      speakername: speakerData.name,
      speakerid: speakerData.id,
      eventId: document.getElementById('eventID') ? document.getElementById('eventID').value : '',
      eventName: pageType != 'homepage' ? getEventName() : ''
    }
  }
}

function showThank(type) {
  let messageHtml = '';
  let elem = '';
  let param = thankParam(type);

  switch (type) {
    case 'event':
      elem = eventData.dis;
    break;

    case 'speaker':
      elem = speakerData.dis;
    break;
  }

  getModal();
  if (!modals['TenTimes-Modal']) {
    showToast('Something went wrong!!!');
    return false;
  }
  modals['TenTimes-Modal'].hide();
  document.querySelector('#TenTimes-Modal .modal-title').innerHTML = '';
  document.querySelector('#TenTimes-Modal .modal-body').innerHTML = '';

  request({
    method: 'POST',
    url: '/ajax/modaldata',
    data: param
  })
  .then(data => {
    messageHtml = $.parseJSON(data);
    document.querySelector('#TenTimes-Modal .modal-title').innerHTML = 'Thank you!';
    if (messageHtml.message1) document.querySelector('#TenTimes-Modal .modal-body').innerHTML = messageHtml.message1;
    if (messageHtml.message2) document.querySelector('#TenTimes-Modal .modal-body').innerHTML = messageHtml.message2;
    if (messageHtml.mainHtml) document.querySelector('#TenTimes-Modal .modal-body').innerHTML = messageHtml.mainHtml;
    if (document.querySelector('#TenTimes-Modal .website') && !document.querySelector('#TenTimes-Modal .website').href) document.querySelector('#TenTimes-Modal .website').remove();
              
    if (pageType.search("top100") > -1) {
      top100Callback();
      return true;
    }

    if (elem) {
      elem.innerHTML = elem.innerHTML.replace('Follow', messageHtml.Follow);
      elem.innerHTML = elem.innerHTML.replace('Attend', messageHtml.Attend);
      elem.innerHTML = elem.innerHTML.replace('inging', messageHtml.inging);

      if (elem.innerHTML.indexOf('Registered') < 0) elem.innerHTML = elem.innerHTML.replace('Get Ticket', messageHtml.Get_Ticket).replace("Register", "Registered");
    
      if(pageType == 'dashboard_events') $(elem).prop( "onclick", null);
      if (typeof only_thankyou!=='undefined' && only_thankyou==1) $(elem).prop( "onclick",null);

      if ($(elem).prop( "onclick",null).find('.fa-user-plus').length > 0 ) {
        $(elem).prop( "onclick",null).click(function() { return false; }).find('.fa-user-plus').addClass('fa-check').removeClass('fa-user-plus').css('color','#fb6d01') ;
      } else if (($(elem).find('.fa-ticket').length > 0)||($(elem).find('.fa-download').length > 0)){
        $(elem).attr('onclick','downloadPdfTimeout(this);').attr('encodeId', userData.encodeId).css('color','#fb6d01');
        $(elem).find('.fa-ticket').addClass('fa-download').removeClass('fa-ticket').css('color','#fb6d01');
      } else if ($(elem).find('.fa-star').length > 0) {
        $(elem).prop( "onclick", "return false;").removeClass("a-m").addClass("text-orange disabled").find('.fa-star').removeClass('fa-star text-muted').addClass('fa-check');
      } else if($(elem).find('.fa-bookmark').length > 0) {
        $(elem).prop( "onclick", "return false;").addClass("disabled").find('.fa-bookmark').addClass('text-orange').prop( "onclick", "return false;");
      } else {
        $(elem).prop( "onclick",null).click(function() { return false; }).find('.fa-heart-o').removeClass('fa-heart-o text-muted').addClass('fa-heart text-orange');
        $(elem).prop( "onclick",null).click(function() { return false; }).addClass('text-orange').find('.fa-bookmark-o').removeClass('fa-bookmark-o text-muted').addClass('fa-bookmark text-orange');
      }
    }
    
    modals['TenTimes-Modal'].show();
    hitMyData();
    eventData = {};
    speakerData = {};
  })
  .catch(err => {
    eventData = {};
    speakerData = {};
    console.log(err);
    showToast('Something went wrong!!!');
  })
}
/*
Redirects to thankyou or questionnaire
*/
function redirectTo(result,source) { 
   
    if(eventData.eventEditionId != undefined) {
        delete eventData["eventEditionId"];
        if($(eventData.dis).hasClass("past_edition")) {
            $('#TenTimes-Modal').modal('hide');
            verifiedReviewSubmit();
        }
        else if((getSearchParams('ed') != undefined) || ($(eventData.dis).hasClass("ed-action"))) {
            showThank('event');
            hitMyData();
        }
        return true;
    }
    showloading();
/*
    var stopRedirection=['interested_attend'];
    if(stopRedirection.indexOf(source)> -1){
            hideloading();
            return true;    
    }
*/
    redirecturi='';
    if(source == undefined || source == "" ){
        redirecturi=site_url_attend +'/dashboard/event?ref='+result.encode_id+'&thankyou=1';
        window.location.assign(redirecturi);
        return true;
    }
    if(source.search(/attend/)>-1)
        source='going';

    if(source=='bookmark')
        source='bookmark';
    else if(source.search(/interest/)>-1 || source.search(/follow/)>-1)
            source='interested';
    else if(source.search(/stall/)>-1 || source.search(/Stall/)>-1)
            source='stall-enquiry';
    else if(source.search(/going/)>-1 && (pageType=='listing' || pageType=="top100" || pageType=="top100country" || pageType=="top100industry" || pageType=="venue_detail" || pageType=="org_detail")) {
            var eventurl=eventData.url;
            eventurl=eventurl.replace(window.location.origin,'');
            eventurl=eventurl.replace(window.host,'');
            eventurl=eventurl.replace('/','');
        if(result.question == 0)
          redirecturi=site_url_attend +'/dashboard/event?ref='+result.encode_id+'&thankyou=1'; 
        else
          redirecturi=site_url_attend +'/'+eventurl+"/"+source+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType;    
    }
    if(pageType=='listing' || pageType=="top100" || pageType=="top100country" || pageType=="top100industry" || pageType=="venue_detail"){}else{
         if(source!='follow'){  
           if(result.question == 0)
              redirecturi=site_url_attend +'/dashboard/event?ref='+result.encode_id+'&thankyou=1'; 
            else
              redirecturi=site_url_attend +'/'+$('#event_url').val()+"/"+source+"?source=autosubmit"+getOneClickSource(source)+"_"+pageType;
          }else{
           redirecturi=site_url_attend +'/dashboard/event?ref='+result.encode_id+'&thankyou=1'; 
         }
    }
    window.location.assign(redirecturi);
}
/*
Validation Functions for Company
*/
function validateCompany(B) {
    B = $.trim(B);
    if (B == "") {
        $(".alert_company").html(company_re);return false;
    }
    return true;
}
function clickCompany(){
    $('#userCompany').keyup(function() {
        if($(this).val().length < 2){
            $("#desiDiv").show();$("#phoneDiv").show();$("#aiDiv").show();
        }
    });
    $('#userCompany').on('input', function() { 
        if($(this).val().trim().length >0){
            $("#desiDiv").show();$("#phoneDiv").show();$("#aiDiv").show();
        }
    });
}
/*
    Call to attend API
*/
function hitData(data) {
$("#loading").bind("ajaxStart", function(){
      $(this).show();
   }).bind("ajaxStop", function(){
      $(this).hide();
});
    var V;
    $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: data,async: true,
            beforeSend: function(){showloading();},
            ajaxSend: function(){showloading();},
            complete: function(){showloading();},
            success: function(A) {hideloading();V = $.parseJSON(A);
            if(V.status==0 && typeof V.error.invalidData != 'undefined' && typeof data.email != 'undefined'){
                $.each(V.error.invalidData, function( key, value ) {
                  if(value.what == 'account-deactivated'){
                    window.location.assign(site_url_attend + "/deactivation/"+V.userData.id);
                    return;
                  }
                });
            }
            pingUser(V);
            if(V.status==1 && V.userData.userExists==0)gaEvent("User","Registration");
            
        }
        });
    //alert(V);
    return V;
}
/*
    Call to attend API
*/

/* visitor queue api */
    function hitQueue(postData){
        $.ajax({ type: "POST",url:  site_url_attend+"/ajax?for=visitorQueue",data: postData, // change it
            success: function(A) {

            }
        });
  }
/* end here */
/*
    City Dropdown Functions
*/
function city_autoComplete(B, A) {
    $(B).typeaheadmap({
        source: function(C, D) {
            $(A).val("0");
            D(city_data)
        },
        key: "text",
        value: "id",
        items: 7,
        listener: function(D, C) {
            $(A).val(C)
        },
        displayer: function(E, D, C) {
            return C
        }
    })
}
/*
    Designation Dropdown Functions
*/
function designation_autoComplete(e,t) {
    // $.get(site_url_attend+"/json/autosuggest/designation/designation_autocomplete.json", function(C) {
    //     $(B).typeaheadmap({
    //         source: function(D, E) {
    //             E(C)
    //         },
    //         key: "text",
    //         value: "code",
    //         items: 7,
    //         listener: function(E, D) {},
    //         displayer: function(F, E, D) {
    //             return D
    //         }
    //     }).on("blur", function() {})
    // })

    if(typeof typeaheadmap!='function' && pageType!='edit_profile'){
        return ;
    }
    jQuery(e).typeaheadmap({
            source: function(e, o) {
                showDesignLoading();
                $.ajax({  
                        type: "get",
                        url: site_url+"/designation/search?query="+encodeURI(e),
                        cache: false,
                        ifModified:true,   
                        dataType: 'json', 
                        success: function(d) {
                            hideDesignLoading();
                            if(d==null){
                                d=new Array({'name' :"designation Not Found",'placeId':""});
                            }
                            o(d);
                          },
                        error: function(d,s,e) {
                          if(s != 'abort')
                          {
                              $("#userCity").removeClass("ldg");
                          }
                        }
                      });
            },
            "notfound": new Array({'name' :"designation Not Found",'placeId':""}),
            "key" : "text",
            "sort" : "none",
            "value" : "id",
            "items": 5,
            listener: function(e, t) {
                $('#TenTimes-Modal #designationId').val(t);
                $('#TenTimes-Modal #userDesignation').val(e);
            },
            displayer: function(that, item, highlighted)
                  {
                    if(item.text)
                    {
                      var res='<span class="changeme"><span style="color:black">&nbsp;&nbsp;'+highlighted+'</span>';
                        res+='</span>';
                      return res;
                    }
                    else
                    {
                      return highlighted;
                    }source
                  }
        }).on("blur", function() {})      

};

/*
Linkedin Authentication Functions
*/
function showDesignLoading(){$(".user_designation").css({"background-color":" #ffffff","background-image":' url("https://c1.10times.com/images/loadingimages.gif")',"background-size":" 25px 25px","background-position":"right center","background-repeat":" no-repeat"});}
function hideDesignLoading(){$(".user_designation").removeAttr( 'style' );}
var retry = 0;
function displayProfilesErrors(B) {
    window.location = url1;
    if (retry < 5) {
        retry++;
        if (!IN.ENV.auth.oauth_token) {
            linkedin_combined();
            return
        } else {
            onLinkedInAuth_combined()
        }
    }
    profilesDiv = document.getElementById("profiles")
}
/*
    Parses linked in metadata & fills the fields in the form
*/
var linkedinFrom = '';
function linkedin_combined(method , from) {
//    showloading();
    social_login(function(){
        social_login_response(method , from);
    },'linkedin',from);        

    /*gaEvent("User","Linkedin");
    linkedinFrom = from;
    linkedButtonClicked = 1;
    var B = $("#TenTimes-Modal #userSource").val();
    IN.User.authorize();
    if (!IN.ENV.auth.oauth_token) {
        IN.Event.on(IN, "auth", onLinkedInAuth_combined);
        return
    } else {
        onLinkedInAuth_combined()
    }
    return false*/
}
function onLinkedInAuth_combined() {
    IN.API.Profile("me").fields("id", "firstName", "lastName", "headline", "industry", "email-address", "phone-numbers", "public-profile-url", "summary", "specialties", "positions", "educations", "date-of-birth", "skills", "location", "picture-url", "memberUrlResources").result(displayProfiles_combined);hideloading();
}
function displayProfiles_combined(J) {
    member = J.values[0];
    profile = member;
    var H = profile;
    if(linkedinFrom == "subscribe_homepage"){
        var A = {};
        A.email = member.emailAddress ;
        A.metadata = JSON.stringify(H) ;
        A.loginMethod = "li" ;
        A.source = linkedinFrom ;
        A.action = 'follow';
        A.listing_id = 1 ;
    }
    //console.log(JSON.stringify(H));
    $("#TenTimes-Modal #userMetadata").val(JSON.stringify(H));
    $("#TenTimes-Modal #userName").val(member.firstName + " " + member.lastName);
    $("#TenTimes-Modal #userEmail").val(member.emailAddress); // change
    var user_src = $("#TenTimes-Modal #userSource").val();
    if (user_src == "connect") $('#TenTimes-Modal #userEmail').attr('readonly', true);
    if (member.phoneNumbers && member.phoneNumbers.values && member.phoneNumbers.values.length > 0) {
        var L = member.phoneNumbers.values[0].phoneNumber;
        if (L && L != "") {
            L = L.replace(/\D/g, "");
            if (L.length > 9) {
                var C = "";
                if (L.length > 10) {
                    C = L.substring(0, L.length - 10);
                    if (C != null) {
                        $("#TenTimes-Modal #phoneCode").val(C);
                        $("#TenTimes-Modal #phoneCode").html("+" + C)
                    }
                }
                var K = L.substring(L.length - 10, L.length);
                $("#TenTimes-Modal #userMobile").val(K);
                if(linkedinFrom == "subscribe_homepage")
                    A.phone = K ;
            } else {
                $("#TenTimes-Modal #userMobile").val(L);
                if(linkedinFrom == "subscribe_homepage")
                    A.phone = L ;
            }
        }
    }
    var E = null;
    if (member.positions && member.positions.values && member.positions.values.length > 0) {
        $.each(member.positions.values, function(N, M) {
            if (M.is_current == true || M.isCurrent == true) {
                E = M
            }
        })
    }
    if (E) {
        if (typeof E.company.name != "undefined" && E.company.name) {
            $("#TenTimes-Modal #userCompany").val(E.company.name);
            if(linkedinFrom == "subscribe_homepage")
                A.company = E.company.name ;
        }
    }
    if (E) {
        if (typeof E.title != "undefined" && E.title) {
            $("#TenTimes-Modal #userDesignation").val(E.title);
            if(linkedinFrom == "subscribe_homepage")
                A.designation = E.title ;
        }
    }
    if (member.id) {
        $("#TenTimes-Modal #userLinkedinId").val(member.id);
    }
    if (member.location) {
        if (member.location.country && member.location.country.code) {
            var D = member.location.country.code;
            var I = D.toUpperCase();
            I = I.replace(/^[ ]+|[ ]+$/g, "");
            if ($.browser.msie && window.XDomainRequest) { // change
            //if (0) {
                var F = new XDomainRequest();
                F.open("get", site_url_attend + "/ajax?for=autosuggest_country&country_code=" + I);
                F.onload = function() {
                    var M = $.parseJSON(F.responseText);
                    if (M == null || typeof(M) == "undefined") {
                        M = $.parseJSON(data.firstChild.textContent)
                    }
                    $.each(M, function(N, O) {
                        if (O.id === I) {
                            $("#TenTimes-Modal").find("#userCountry").val(O.text);
                            $("#TenTimes-Modal").find("#countryCode").val(O.id);
                            if(linkedinFrom == "subscribe_homepage")
                                A.country = O.id ;
                            $(".selected-flag").find(".flag").removeClass().addClass("flag " + O.id.toLowerCase());
                            $("#TenTimes-Modal").find("#phoneCode").val("+" + O.phonecode);
                            //$("#TenTimes-Modal").find("#currency_code_value").val(O.currency);
                            $("#TenTimes-Modal").find("#phoneCode").html("+" + O.phonecode);
                            //getCities();
                            return false
                        }
                    })
                };
                F.send()
            } else {
                $.getJSON(site_url_attend + "/ajax?for=autosuggest_country&country_code=" + I, function(M) {
                    $.each(M, function(N, O) {
                        if (O.id === I) {
                            $("#TenTimes-Modal").find("#userCountry").val(O.text);
                            $("#TenTimes-Modal").find("#countryCode").val(O.id);
                            if(linkedinFrom == "subscribe_homepage")
                                A.country = O.id ;
                            $(".selected-flag").find(".flag").removeClass().addClass("flag " + O.id.toLowerCase());
                            $("#TenTimes-Modal").find("#phoneCode").val("+" + O.phonecode);
                            //$("#TenTimes-Modal").find(".currency_code_value").val(O.currency);
                            $("#TenTimes-Modal").find("#phoneCode").html("+" + O.phonecode);
                            //getCities();
                            return false
                        }
                    })
                })
            }
        }
        if (member.location.name && member.location.name) {
            var B = member.location.name;
            var G = B.indexOf(",");
            if (G > 0) {
                B = B.substr(0, G)
            }
            B = B.replace(" Area", "");
            $("#TenTimes-Modal #userCity").val(B)
        } else {}
    }
    if(linkedinFrom == "subscribe_homepage"){
        showloading();
        hitAuth(A,'subscribe',linkedinFrom,'','');
        return false ;
    }
    if($('#modalData').html() != ""  || pageType == 'not_login' || pageType == 'thankyou_new' || pageType=='register_new' || pageType=='login_new'){
        if(linkedinFrom == "speaker" || linkedinFrom == "signup" || linkedinFrom == "signupTT" || pageType=='edit_profile' || linkedinFrom == 'follow page'  || linkedinFrom == "verify" ){
            hideloading(); 
            verifySigninTT(linkedinFrom,'li');           
            //c(linkedinFrom);
        }
        else{
            showloading();
           /* vcardopen($("#userName").val(), $("#userEmail").val(), $("#userDesignation").val(), $("#userCompany").val(), $("#userCity").val(), $("#userCountry").val(),'','','','');
            hideloading();   */
            verifySigninTT('signupTT_'+linkedinFrom,'li');       
        }
    }
}
function onLinkedInLoad() {
    if(linkedButtonClicked == 1)
    IN.Event.on(IN, "auth", onLinkedInAuth_combined);
    hideloading();
};
/* Validation Functions Started
*/
function url12345(C) {
    if (C.indexOf("http") >= 0 || C.indexOf("www.") >= 0 || C.indexOf("https") >= 0) {
        return false
    }
    var B = ["www", "com", "org", "net", "int", "edu", "gov", "mil", "arpa", "ac", "ad", "ae", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "as", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cs", "cu", "cv", "cw", "cx", "cy", "cz", "dd", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gm", "gn", "gp", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "ll", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mn", "mo", "mp", "mq", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "pk", "ph", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "su", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "ui", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "ye", "yt", "yu", "za", "zm", "zw"];
    var A = C.split(".");
    if (A.length == 1) {
        return true
    }
    for (i = 0; i < A.length; i++) {
        A[i] = A[i].toLowerCase();
        if ($.inArray(A[i], B) >= 0) {
            return false
        }
    }
    return true
}
/* custom function */
function getTitle() {
    switch(pageType){
        case 'listing':
            if(typeof eventData.name != "undefined")
                return eventData.name ;
        break ;
    }
    return $("h1").text();
}
function getSubTitle() {
    return '';
}
function getEventName() {
    switch(pageType){
        case 'listing':
            if(typeof eventData.name != "undefined")
                return eventData.name ;
        break ;
    }
    return $("h1").text();
}
function getEventId(dis) {
    switch(pageType){
        case 'listing':
            if(typeof eventData.id != "undefined")
                return eventData.id ;
            break ;
        case "dashboard_events" :
            return $(dis).next().attr("id");
            break ;
        case "thankyou":
            return $("#detail").attr("data-id");
            break ;
    }
    return $("#eventID").val();
}
function getVenueId(){
    return $("#venueId").val();
}
/*custom fn end*/
/* Validation Functions Started
*/
function checkName(dis) {
    if (dis == "Name")dis = "";
}
function validateName(C) {
    var D = C;
    D = D.replace(/^\s+|\s+$/g, "");
    if (D == ""){$(".alert_name").html(name_compulsory);return false}    
    if (!(urlExists(C)))    $(".alert_name").html(name_url)
    if (!(conti(C)))    $(".alert_name").html(name_digit)
    return (urlExists(C) && conti(C))
}
function urlExists(C) {
    if (C.indexOf("http") >= 0 || C.indexOf("www.") >= 0)
        return false
    var B = ["www", "com", "org", "net", "int", "edu", "gov", "mil", "arpa", "ac", "ad", "ae", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "as", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cs", "cu", "cv", "cw", "cx", "cy", "cz", "dd", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gm", "gn", "gp", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "ll", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mn", "mo", "mp", "mq", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "pk", "ph", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "su", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "ui", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "ye", "yt", "yu", "za", "zm", "zw"];
    var A = C.split(".");
    if (A.length == 1)
        return true
    for (i = 0; i < A.length; i++) {
        A[i] = A[i].toLowerCase();
        if ($.inArray(A[i], B) >= 0)
            return false
    }
    return true
}
function conti(B) {
    B = B.replace(/[^0-9]/g, " ");
    var A = B.split(" ");
    for (i = 0; i < A.length; i++) {
        if (A[i].length > 5)    return false
    }
    return true
}
function validateFormData(action) {
    if (action === undefined)
        action = '';
    $("form .ferror").removeClass("ferror");
    hideError('name');hideError('email');hideError('designation');hideError('company');hideError('city');hideError('mobile');hideError('password');
    var L = 0;
    var P = $("#TenTimes-Modal #userName").val();
    var M = $("#TenTimes-Modal #userEmail").val();
    var userId = $("#TenTimes-Modal #userId").val();
    if ($("#TenTimes-Modal #userCountryCode").val() == "") {
        $("#TenTimes-Modal #userCountry").val("")
    }
    var Q = $("#TenTimes-Modal #userCountry").val();
    var J = $("#TenTimes-Modal #userCity").val();
    var O = $("#TenTimes-Modal #userCompany").val();
    var N = $("#TenTimes-Modal #userDesignation").val();
    var K = $("#TenTimes-Modal #userPassword").val();
    if (P == "Your Name") {
        P = ""
    }
    if (M == "Email") {
        M = ""
    }
    if (N == "Designation") {
        N = ""
    }
    if (O == "Company") {
        O = ""
    }
    if (K == "Password") {
        K = ""
    }
    var R = true;
    var I = true;
    if (!validateName(P)) {
        if (!L) {
            $("#TenTimes-Modal #userName").focus();
            L = 1
        }
        $("#TenTimes-Modal #register_button").removeAttr("disabled");
        R = false;
        $(".alert_name").show();
    }
    if ((userId == null || userId == undefined || userId == "") && !validateEmail12345(M)  ) {
        $("#TenTimes-Modal #register_button").removeAttr("disabled");
        if (!L) {
            $("#TenTimes-Modal #userEmail").focus();
            L = 1
        }
        R = false;
        $(".alert_email").show();
    }
    if (K == "") {
        $("#TenTimes-Modal #register_button").removeAttr("disabled");
        if (!L) {
            $("#TenTimes-Modal #userPassword").focus();
            L = 1
        }
        R = false;
        var typePass=$('#userPassword').attr('placeholder');
        var typeVal='Invalid Password';
        if(typeof typePass != 'undefined' && (typePass.search(/ otp/)>-1 || typePass.search(/ OTP/)>-1)){
            typeVal='Invalid OTP';
        }
        showError('password',typeVal);
        I = I + "password,"
    }
    if (!validateCity12345(J)) {
        if (!L) {
            $("#TenTimes-Modal #userCity").focus();
            L = 1
        }
        $("#TenTimes-Modal #register_button").removeAttr("disabled");
        I = false;
        $(".alert_city").show();

    }
    var H = $("#TenTimes-Modal #individualCheckBox").is(":checked");
    if (!H && action!='career') {
        if (!validateDesignation12345(N)) {
            if (!L) {
                $("#TenTimes-Modal").find("#TenTimes-Modal #userDesignation").focus();
                L = 1
            }
            R = false;
            $(".alert_designation").show();
        }
        if (!validateCompany(O)) {
            if (!L) {
                $("#TenTimes-Modal").find("#TenTimes-Modal #userCompany").focus();
                L = 1
            }
            R = false;
            $(".alert_company").show();
        }
        if (O == "") {
            $("#TenTimes-Modal #check_div").show();
            $("#TenTimes-Modal #individual_div").show()
        }
    }
    if (!checkMobile()) {
        $("#TenTimes-Modal #register_button").removeAttr("disabled");
        if (!L) {
            $("#TenTimes-Modal").find(".user_contact_number").focus();
            L = 1
        }
        error_message = mobile_re;
        showError('mobile',mobile_re);
        R = false
    }
    if (!R) {
        return R
    }
    if (!I) {
        return I
    }
    return R
}
function validateEmail12345(B) {
    if (B == "") {
        $(".alert_email").html('Email is compulsory');
        return false
    }
    var C = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!(C.test(B))) {
        $(".alert_email").html('Please enter a valid email');
        return false;
    }
    if (B.charAt(0) == ".") {
        $(".alert_email").html('Please enter a valid email');
        return false;
    }
    return (C.test(B) && !(B.charAt(0) == "."))
}
function validateCity12345(C) {
    var D = C;
    D = D.replace(/^\s+|\s+$/g, "");
    if (D == "" || D == "City") {
        $(".alert_city").html(city_enter);
        $("#TenTimes-Modal #userCity").val("");
        return false
    }
    if($("#TenTimes-Modal #place_id").val() !== undefined){
        if($("#TenTimes-Modal #place_id").val().trim() == ""){
            $(".alert_city").html(city_suggestion);
            //$("#TenTimes-Modal #userCity").val("");
            return false;
        }
        return true ;
    }
    else{
        if (!(/^[A-Za-z0-9,-. () ]+$/.test(C))) {
            $(".alert_city").html(city_valid)
        }
        if (!(C.length <= 33)) {
            $(".alert_city").html(city_length)
        }
        if (!(url12345(C))) {
            $(".alert_city").html(city_url)
        }
        if (!(conti(C))) {
            $(".alert_city").html(city_valid)
        }
        return (url12345(C) && /^[A-Za-z0-9,-. () ]+$/.test(C) && conti(C) && (C.length <= 33))
    }
}
function validateCountry12345(C) {
    var D = C;
    D = D.replace(/^\s+|\s+$/g, "");
    if (D == "" || D == "Country") {
        $(".alert_country").html("Country is compulsory");
        $("#TenTimes-Modal #userCountry").val("");
        return false
    }
    if($("#TenTimes-Modal #place_id").val() !== undefined){
        if($("#TenTimes-Modal #place_id").val().trim() == ""){
            $(".alert_city").html("Please select city from suggestion.");
            //$("#TenTimes-Modal #userCity").val("");
            return false;
        }
        return true ;
    }
    else{
        if (!(/^[A-Za-z0-9,-. () ]+$/.test(C))) {
            $(".alert_country").html("Please enter a valid country")
        }
        if (!(C.length <= 33)) {
            $(".alert_country").html("Country name can have maximum 33 characters")
        }
        if (!(url12345(C))) {
            $(".alert_country").html("URL is not allowed in Country")
        }
        if (!(conti(C))) {
            $(".alert_country").html("Please enter a valid country")
        }
        return (url12345(C) && /^[A-Za-z0-9,-. () ]+$/.test(C) && conti(C) && (C.length <= 33))
    }
}
function validateCity(C) {
    var D = C;
    D = D.replace(/^\s+|\s+$/g, "");
    if (!(/^[A-Za-z0-9,-. () ]+$/.test(C)) && D != "") {
        $(".alert_city").html("Please enter a valid city")
    }
    if($("#TenTimes-Modal #place_id").val() !== undefined){
        if($("#TenTimes-Modal #place_id").val().trim() == ""){
            $(".alert_city").html("Please select city from suggestion.");
            //$("#TenTimes-Modal #userCity").val("");
            return false;
        }
        return true ;
    }
    else{
        var D = C;
        D = D.replace(/^\s+|\s+$/g, "");
        if (!(/^[A-Za-z0-9,-. () ]+$/.test(C)) && D != "") {
            $(".alert_city").html("Please enter a valid city")
        }
        if (!(C.length <= 33)) {
            $(".alert_city").html("City name can have maximum 33 characters")
        }
        if (!(url12345(C))) {
            $(".alert_city").html("URL is not allowed in City")
        }
        return (url12345(C) && (C.length <= 33))
    }
}
function validateDesignation12345(B) {
    B = $.trim(B);
    if (B == "") {
        $(".alert_designation").html(desig_re);
        return false
    }
    // if (!(url12345(B))) {
    //     $(".alert_designation").html(desig_url)
    // }
    // if (!(conti(B))) {
    //     $(".alert_designation").html(desig_legnth)
    // }
    /*if (!(checkChar(B))) {
        $(".alert_designation").html("Please enter a valid Designation")
    }*/
    return true
}
function validateDesignation(B) {
    B = $.trim(B);
    if (!(url12345(B)))
        $(".alert_designation").html("URL is not allowed in Designation")
    if (!(conti(B)))
        $(".alert_designation").html("Too many digits")
    return (url12345(B) && conti(B))
}
function checkChar(B) {
    B = B.replace(/[^a-zA-Z]/g, " ");
    var A = B.split(" ");
    for (i = 0; i < A.length; i++) {
        if (A[i].length < 3)    return false
    }
    return true
}
function checkMobile() {
  var A = $("#TenTimes-Modal").find("#userMobile").val();
    A = $.trim(A);
    if(A == "" && hide_individual == 1){
        return false
    }
else if (( A.length < 17 && A.length >= 6 && A != "Phone") || (A == "")) {
        return true
    }
 else {
        return false  
    }
}
function showError(elementClass,message) {
    $(".alert_"+elementClass).html(message);
    $(".alert_"+elementClass).show();
}
function hideError(elementClass,message) {
    $(".alert_"+elementClass).html('');
    $(".alert_"+elementClass).hide();
}
function individualCheck(dis) {
    var C = $(dis).is(":checked");
    if (C) {
        $("#TenTimes-Modal #userCompany").attr("disabled", true);
        $("#TenTimes-Modal #userCompany").val("");
        $("#TenTimes-Modal #userDesignation").val("");
        $("#TenTimes-Modal #desiDiv").hide();
        hideError('designation');hideError('company');
    } else {
        $("#TenTimes-Modal #userCompany").removeAttr("disabled");
        $("#TenTimes-Modal #desiDiv").show();
        var B = window.navigator.userAgent;
        var A = B.indexOf("MSIE ");
        if (A <= 0) {
            $("#TenTimes-Modal #userCompany").css("background", "")
        }
    }
}

/* Validation Functions End
*/

// Get Cities drop down list for a particular country
function getCities() {
    if ($.browser.msie && window.XDomainRequest) { // change
        var A = new XDomainRequest();
        A.open("get", site_url_attend + "/ajax?for=autosuggest_city&country_code=" + $("TenTimes-Modal #countryCode").val());
        A.onload = function() {
            var B = $.parseJSON(A.responseText);
            if (B == null || typeof(B) == "undefined") {
                B = $.parseJSON(data.firstChild.textContent)
            }
            city_data = B;
            $(".city_name").removeClass("ldg")
        };
        A.send()
    } else {
        $.ajax({
            url: site_url_attend + "/ajax?for=autosuggest_city&country_code=" + $("#TenTimes-Modal #countryCode").val(),
            dataType: "json",
            success: function(D, B, C) {
                city_data = D;
                $(".city_name").removeClass("ldg")
            },
            error: function(D, B, C) {
                $(".city_name").removeClass("ldg");
                city_data = ""
            }
        })
    }
}
function addHidden(elementClass,elementId,value) {
    return '<input id="'+elementId+'" class="'+elementClass+'" value="'+value+'" type="hidden">'
}
var site_url_attend = window.location.protocol+"//"+window.location.hostname;
if(site_url_attend.search('login') > -1)
    site_url_attend = window.location.protocol+"//10times.com";
var host = window.location.hostname;
switch (host) {
    case "10times.com":
        login_url = window.location.protocol+"//login.10times.com";
        break;
    case "local.10times.com":
        login_url = window.location.protocol+"//local-login.10times.com/app.php";
        site_url_attend = window.location.protocol+"//local.10times.com/app.php" ;
        break;
    case "dev.10times.com":
        login_url = window.location.protocol+"//dev-login.10times.com";
        break;
    case "stg.10times.com":
        login_url = window.location.protocol+"//stg-login.10times.com";
        break;
    case "local-login.10times.com":
        login_url = window.location.protocol+"//local-login.10times.com";
        break;
    case "dev-login.10times.com":
        login_url = window.location.protocol+"//"+window.location.hostname;
        break;
    case "stg-login.10times.com":
        login_url = window.location.protocol+"//"+window.location.hostname;
        break;
    default:
        login_url = window.location.protocol+"//"+window.location.hostname;
}

/*fb initialization*/
function fb_init()      
{   
startInitFb();     
}


/*
    FB Authentication
*/
function fbLogin_combined(method,from) {
    gaEvent("User","Facebook");
    // loadFbScript('login',from);
    // if(typeof(FB) == "undefined"){return 0;}

    // FB.getLoginStatus(function(C) {
    //     if (C.authResponse) {
    //         facebook_loggedin_ok = true;
    //         FB.api("/me?fields=id,name,location,email,work,first_name,last_name,friends", function(D) {
    //             fbResponse_combined(D,from)
    //         })
    //     } else {
    //         FB.login(function(D) {
    //             if (D.authResponse) {
    //                 FB.api("/me?fields=id,name,location,email,work,first_name,last_name,friends", function(E) {
    //                     fbResponse_combined(E,from)
    //                 })
    //             } else {}
    //         },{
    //             scope: 'email,user_location,user_work_history,user_friends'
    //         });
    //     }
    // })

    social_login(function(){
        social_login_response(method , from);
    },'facebook',from);        
}
/*
Parses metadata received from FB & fills the input fields in the form
*/
function fbResponse_combined(I,from) {
    if(from == "subscribe_homepage"){
        var MA = {};
        if (typeof I.email != "undefined") 
            MA.email = I.email ;
        MA.metadata = JSON.stringify(I) ;
        MA.loginMethod = "fb" ;
        MA.source = from ;
        MA.action = 'follow';
        MA.listing_id = 1 ;
    }
    showloading();
    var F = $("#TenTimes-Modal #userSource").val();
    if (typeof I.name != "undefined") {
        $("#TenTimes-Modal #userName").val(I.name);
        if(from == "subscribe_homepage")
            MA.name = I.name ;
    }
    $("#TenTimes-Modal #userMetadata").val(JSON.stringify(I));
    $("#TenTimes-Modal #userFacebookId").val(I.id);
    if (typeof I.email != "undefined") {
        $("#TenTimes-Modal #userEmail").val(I.email) // change it
    }
    if (typeof I.location != "undefined" && typeof I.location.name != "undefined") {
        var C = I.location.name;
        var H = I.location.id;

            A = C;
            A = A.replace(/^[ ]+|[ ]+$/g, "");
            var D = A.split(",");
            if (typeof D[1] == "undefined") {
                D[1] = ""
            }
            if (typeof D[2] == "undefined") {
                D[2] = ""
            }
            jQuery.support.cors = true;
            showloading();
    $.getJSON(site_url_attend+ "/ajax?for=facebook_location&city=" + D[0] + "&region=" + D[1] + "&country=" + D[2],function(K) {
               country_iso = K;
                    hideloading();
                    if (K.country_name != "") {
                        $("#TenTimes-Modal").find(".user_country").val(K.country_name)
                    }
                    if (K.country_code != "") {
                        $("#TenTimes-Modal").find(".user_country_code").val(K.country_code);
                        $(".selected-flag").find(".flag").removeClass().addClass("flag " + K.country_code.toLowerCase())
                    }
                    if (K.phone_code != "") {
                        $("#TenTimes-Modal").find("#phoneCode").val("+" + K.phone_code);
                        $("#TenTimes-Modal").find("#phoneCode").html("+" + K.phone_code)
                    }
                    $("#TenTimes-Modal").find("#userCity").val(K.city_name);
                    $("#TenTimes-Modal").find("#cityCode").val(K.city_code);
                    if(from == "subscribe_homepage" && K.country_code != ""){
                        MA.country = K.country_code ;
                        MA.city = K.city_code ;
                    }
                
            }
        );



    }
    if (typeof I.work != "undefined") {
        var E = I.work;
        if (typeof E[0] != "undefined") {
            E = E[0];
            if (typeof E.employer != "undefined" && typeof E.employer.name != "undefined") {
                $("#TenTimes-Modal").find("#userCompany").val(E.employer.name);
                if(from == "subscribe_homepage")
                    MA.company = E.employer.name ;
            }
            if (typeof E.position != "undefined" && typeof E.position.name != "undefined") {
                $("#TenTimes-Modal").find("#userDesignation").val(E.position.name);
                if(from == "subscribe_homepage")
                    MA.designation = E.position.name ;
            }
        }
    }
    if(from == "subscribe_homepage"){
        showloading();
        hitAuth(MA,'subscribe',from,'','');
        return false ;
    }
     if(from == 'speaker' || from == 'signup' || from == 'signupTT' || pageType=='edit_profile' || from == 'follow page' || pageType == "not_login"){
        hideloading();
        verifySigninTT(from,'fb');
        //loggedIn(from);
    }else{
       /* vcardopen($("#userName").val(), $("#userEmail").val(), $("#userDesignation").val(), $("#userCompany").val(), $("#userCity").val(), $("#userCountry").val(),'','','','');
        hideloading();*/
         //loggedIn('signupTT');
         verifySigninTT('signupTT_'+from,'fb');
    }
}
function loggedIn(from,thro) {
    $("#TenTimes-Modal .tentimes-form").next('.text-center').hide();
    var action = '';
    var fl=true;
    var callLoginFun='';
    if(from.search(/signupTT/)> -1 && from!='signupTT'){
        callLoginFun=from.replace("signupTT_", "");
        from='signupTT';
    }
    switch(from){
        case 'speaker':
            action = 'follow';
            fl=false;
            break;
        case 'signup':
            action = 'signup';
            fl=false;
            break;
        case 'login':
            action = 'signup';
            fl=false;
            break;
        case 'organizer':
            action = 'organizer_follow';
            fl=false;    
        default:
            action = 'signup';        
    }

    var methodOrig=from;
    if(from.search(/attendNew/)>-1){
        methodOrig=from.replace("attendNew_", "");
        from=getAction(methodOrig);
    }
    
    /*var flag = true ;
    if("signupTT" != from)
        flag = validateLoginData(from);

    if(!flag)
        return false;
    else{*/

        showloading(); 
        var data = {
            metadata: $("#TenTimes-Modal #userMetadata").val(),
            name: $("#TenTimes-Modal #userName").val(),
            designation: $("#TenTimes-Modal #userDesignation").val(),
            company: $("#TenTimes-Modal #userCompany").val(),
            city: $("#TenTimes-Modal #userCity").val(),
            place_id: $("#TenTimes-Modal #place_id").val(),
            country: $("#TenTimes-Modal #userCountry").val(),
            email: $("#TenTimes-Modal #userEmail").val(),
            phone: $("#TenTimes-Modal #userMobile").val(),
            phoneCode: $("#TenTimes-Modal #phoneCode").html(),
            source: from,
            speaker_id: speakerData.id,
            action:action
        };
        if(thro == 'gplus' || thro == 'fb' || thro == 'li'){
            if(thro== 'fb')
                data.facebookId=$("#TenTimes-Modal #userFacebookId").val();

            if(thro== 'li')
                data.linkedinId=$("#TenTimes-Modal #userLinkedinId").val();

            if(thro=='gplus')
                data.googleId= $("#TenTimes-Modal #userGmailId").val();

            if(fl)
                data.source='signupTT';
            data.loginMethod=thro;
        }
        if(signUpScrollFlag == 1){
            data.source = scrollType ;
        }
        if( from == 'follow page' )
        {
            data.follow_city = $("#follow_content").attr("class") ;
            data.follow_country = $("#follow_content1").attr("class") ;
            data.event_type = $("#follow_content").attr("value") ;
            data.follow_industry = $("#follow_content1").attr("value") ;
            data.one_click =  0 ;
            data.listing_id = $("#listingcombo_id").attr("value") ;
            data.action = 'follow_page' ;
            data.source = 'follow_page';
            data.speaker_id =  '';
            var nextData={};
            nextData.type='next';
            nextData.where='social';
            hitPageFollow(data,nextData) ;
        }
        else if(from == 'organizer')        
        {   
            // if(pageType == 'about')
            // {
                
            //     OrganizerData['id']=$('#companyId').attr('value');
            // }
            // else
            // {
            //     OrganizerData['id']=$('h1').attr('id');     
            // }
            followOrganizer("",OrganizerData.id,'organizer');        
        }
        else{
            if((thro == 'gplus' || thro == 'fb' || thro == 'li') && fl){
                from='signupTTOnly';
            }
            var nextData={};
            if(callLoginFun!=''){
                nextData.type='next';
                nextData.action=callLoginFun;
            }
             nextData.where='social';

            if(data.loginMethod == "fb"){
                if(data.email == ""){
                    hideloading();
                    if(pageType=='thankyou_new' || pageType=='register_new' || pageType=='login_new'){
                        $('#facebook_error').css("display","block");
                        $('#valEmail').focus();
                    }
                    return false;
                }
            }
            hitAuth(data,from,from,nextData,'');
        }
        //hideloading();
    //}
}
function loggedInConnect(dis,receiverId,receiverName,eventID){
    var data = {
            user_id:getCookie('user'),
            user_token:getCookie('user_token'),
            event_id: eventID,
            ai_value: 1,
            receiver: receiverId,
            sendThankYouMail:1,
            noRepeatMail:1
        };
    if(page_type == "thankyou_new")
        data.source = page_type;
    else if(page_type=='exhibitors' || (page_type=='about' && $(dis).hasClass('exhibitorInterest')))
        data.source='exhibitor';  
    else if(page_type=='profile' && ($(dis).hasClass('speaker-Connection') || $(dis).hasClass('ecntbtn')))
        data.source='user_profile';
    else
        data.source = 'web';
    
    data.action = 'connect';
    showloading();
    var info = {} ;
    info.receiverName = receiverName ;
    info.receiverId = receiverId ;
    info.eventID = eventID ;
    info.dis = dis ;
    if(typeof page_type!="undefined" && page_type=="profile" && $(dis).hasClass('speaker-Connection'))
        hitAuth(data,'oneClickConnect','profile',info,dis);
    else
       hitAuth(data,'oneClickConnect','connect',info,dis);
}

function accountActivation(dis){
    
    if($('#modalData').html() == "")
        $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-500').addClass('modal-740');
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
    var d = new Date(new Date(new Date().getTime() + 10*24*60*60*1000));    
    var dd = d.getDate();
    var mm = d.getMonth() + 1;
    var y = d.getFullYear();
    var someFormattedDate = dd + '/'+ mm + '/'+ y;

    $('#TenTimes-Modal .modal-title').html('<h2>This account has been closed.<br>All the identifiable data linked with this account will be purged from our system by '+someFormattedDate+'</h2><br><center><i class="fa fa-spinner fa-pulse"></i></center>');
    $('#TenTimes-Modal .modal-title').siblings('h5').remove();
    $('#TenTimes-Modal .modal-body').html('');

    let htmlContent = '<div class="p-10 text-center">This account has been closed.<br>All the identifiable data linked with this account will be purged from our system by '+someFormattedDate+'</div>';
    if(typeof new_Dashboard!='undefined' && new_Dashboard==1){
        $('#basic-modal-preview .modal__content').html(htmlContent);
        $('#basic-modal-preview').addClass('show');
    }else{
        $('#TenTimes-Modal').modal('show');
    }





    var data = {
        user_id:getCookie('user'),
        user_token:getCookie('user_token'),
        source: 'deactivate',
        action: 'signup',
        deactivate:'true'
    };
    showloading();
    hitAuth(data,'accountActivation','accountActivation','',dis);

}

function verifyModal(dis){
    if(getCookie('user') && getCookie('user') != ""){
        if(pageType=='VenueCityListing'||pageType=='venueListing'){
            if(typeof lastAddedLiveFuncVenue === "function"){
                lastAddedLiveFuncVenue();    
            }
        }
        else{
            $("#TenTimes-Modal").modal("hide");
            window.location.href = site_url_attend ;
            showToast("You are successfully logged In!",'#43C86F');
            removeBackdropModal();
        }
    }
    else
    {
        startInitFb();
        var attendInput = ['title','subtitle'];
        attendInput['title'] = 'Account Reactivation';
        attendInput['subtitle'] = '';
        attendInput['fields'] = ['email','password'];
        attendInput['actionName'] = "reactiveLogin(this)";
        attendInput['actionLabel'] = 'Submit';
        getForm(function (modalHtml){ 
        $("#modalData").html(modalHtml.mainHtml);
        $("#TenTimes-Modal").modal("show");
        $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
        $('#TenTimes-Modal .material-form').addClass('text-center').removeClass('material-form');
        $('#TenTimes-Modal .fa-envelope').replaceWith(function() { return "<p class='ico fa-envelope'></p>"; });
        $('#TenTimes-Modal .fa-lock').replaceWith(function() { return "<p class='ico fa-lock'></p>"; });
        $('#TenTimes-Modal #userEmail').attr('placeholder','Enter your email');

        $('#TenTimes-Modal .alert_email').addClass('float-start');
         $('#TenTimes-Modal .alert_password').addClass('float-start');
        $("#TenTimes-Modal #userSource").val('reactivate');
        
        socialRegistration();
        doNotReferesh();
        removeBackdropModal();},attendInput,'signup');
        
    }
}

function reactiveLogin(dis){
    var A = {};
    hideError('email');
    hideError('password');
            if(!validateEmail12345($("#TenTimes-Modal #userEmail").val())) {
                $("#TenTimes-Modal #register_button").removeAttr("disabled");
                $("#TenTimes-Modal #userEmail").focus();
                showError('email','Invalid email');
                if($("#TenTimes-Modal #userEmail").val().trim() == ""){
                    $("#TenTimes-Modal #userEmail").val('') ;
                    showError('email','Please enter email');
                }
                return false;
            }
            if($("#TenTimes-Modal #userPassword").val() == "") {
                showError('password','Mandatory');
                return false;
            }
            A.email = $("#TenTimes-Modal #userEmail").val();
            A.password = $("#TenTimes-Modal #userPassword").val();
            A.source = 'reactivate';
            A.action = 'signup';
            A.deactivate='false';
            A.type = "password" ;
            A.deactivate_id=$('#deactivatedId').val();
        
       
    $("#TenTimes-Modal form button").html('<i class="fa fa-spin fa-refresh"></i> '+$("#TenTimes-Modal form button").text()).attr('disabled','disabled');
    hitAuth(A,'reactivateTT','reactivate',A,'');
}



function loggedInConnectResponse(result,data,dis) {
    if(result.status == 1){
        if(page_type=='exhibitors' || (pageType=='about' && $(dis).hasClass('exhibitorInterest'))){
            customEventGA('Company','Popup Connect');
            // $(dis).html('<i class="fa fa-check" aria-hidden="true"></i> Connect');
            // $(dis).css({'border':'none','outline':'none','pointer-events':'none'});
            $(receiverData.dis).text('Pending').addClass('disabled');
            hideloading();
            $("#TenTimes-Modal").modal("hide");
        }
        else if(result.hasOwnProperty('connectRelation')) {
            userRelation =result.connectRelation ;
            receiverData.connect_id =  result.connectionId ;
               receiverData.name =  data.receiverName ;
               receiverData.id =  data.receiverId ;
               receiverData.dis = data.dis;
               if(page_type != "thankyou_new" && $(dis).attr('id')!='u-connect')
             {
               showThankyou(result.connectRelation);
             }
             if((pageType=="dashboard_events" || pageType=="ProfileDash" )&& $(receiverData.dis).text()=='Connect')
             {
               $(receiverData.dis).html('Pending');
               $(receiverData.dis).removeAttr('onclick');
               // $(receiverData.dis).addAttr('disabled');
               $(receiverData.dis).removeClass('cursor-default cursor-pointer');
               $('#connectUser').children().attr('onclick','');
               $('#connectUser').children().text('Pending');
               $('#connectUser').children().attr('title','pending');
             }
             else if(pageType=="dashboard_events" && $(dis).find('svg').hasClass('feather-user-plus')){
                $(receiverData.dis).html('<i data-feather="user-check" class="m-auto w-4 h-4"></i>');
                $(receiverData.dis).removeAttr('onclick');
                $(receiverData.dis).removeClass('cursor-pointer').addClass('cursor-default');
                feather.replace();
             }
         }   
            else
            {
                sendRequest();
            } 
    }
    else{
        hideloading();
        if(result.status == 0 && result.hasOwnProperty('error') && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('id') && result.error.hasOwnProperty('invalidData')){
             var flagmobile=0;
          for(var i=0;i<result.error.invalidData.length;i++){
                var match_string=result.error.invalidData[i].what.toLowerCase();
               if(match_string=='phone'){
                $('#userMobile').siblings('.alert_mobile').show();
                $('#userMobile').siblings('.alert_mobile').html(result.error.invalidData[i].why);
                 $('#userMobile').siblings('.alert_mobile').css('color','#ae4b00');
                 hideloading();  
                flagmobile=1;
              }           
            }
         if(flagmobile==0){
            $( ".modal-backdrop" ).removeClass('modal-backdrop');
            showloading();
            gaEvent('User','Basic Popup Open');
            var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
            attendInput['fields'] = ['name','user','city','company','designation','phone','autointroduce'];
            attendInput['title'] = getConnectTitle(data.receiverName);
            attendInput['subtitle'] = '';
            attendInput['receiverName'] = data.receiverName;
            attendInput['receiverId'] = data.receiverId;
            attendInput['actionName'] = 'ConnectRegisterForm()';
            attendInput['actionLabel'] = 'Proceed to connect';
            getForm(function (modalHtml){
            $("#modalData").html(modalHtml.mainHtml);
            clickCompany();
            if(!document.getElementById('userSource')){
               $("#TenTimes-Modal").append(addHidden('user_source','userSource',''));    
            }
            $("#TenTimes-Modal").modal("show");
            postFormOpenSettings(result.userData.country);
            vcardopen(result.userData.name,'',result.userData.designation,result.userData.userCompany,result.userData.cityName,result.userData.countryName,'',result.userData.id,result.userData.profilepicture,'');
            $("#TenTimes-Modal #userSource").val('connect');
            hideloading();
            openform();
            $("#TenTimes-Modal #userName").val('');},attendInput,'connect');  
          }   
            
        }
        else if(result.status == 0 && result.hasOwnProperty('error') && result.error.hasOwnProperty('message')){
            connectFail(result.status,result.error);
        }
        else{
            hideloading();
            $("#TenTimes-Modal").modal("hide");
        }
    }
}
/* connect start */
function connectNew(dis,receiverId,receiverName,eventID) {

    callGaEvent("connect");
    getReceiverData(dis);
    getEventData(dis);
    receiverData['id'] = receiverId;
    $(dis).parent().parent().find('.fa-heart-o').addClass('color_orange fa-heart').removeClass('fa-heart-o').removeAttr( "onclick").attr("data-original-title","Following");
    if(getCookie('user') && getCookie('user') != ""){ // change
        loggedInConnect(dis,receiverId,receiverName,eventID);      
    }else{
        if(pageType=='exhibitors'||(pageType=='about' && $(dis).hasClass('exhibitorInterest')))
            {$('#myModal').modal('hide');}
        verifySigninTT('login','connect');
    }
}

function ConnectRegisterForm() {
    $("#phoneDiv").show();
    $("#aiDiv").show();
    if($.trim($("#TenTimes-Modal #userCompany").val()) == "" && $.trim($("#TenTimes-Modal #userDesignation").val()) == "" )
        $("#checkDiv").show();
    if(!$("#TenTimes-Modal #individualCheckBox").is(":checked") && $.trim($("#TenTimes-Modal #userCompany").val()) == "")
        $("#desiDiv").show();

    var B = validateFormData('connect');
    if (!B) {
        return false
    } else {
        showloading();
        var aiValue = 0;
        if($("#TenTimes-Modal #aiCheckBox").is(":checked")) // change
            aiValue = 1;
                if(pageType=='org_detail' || pageType=='venue_detail'  || pageType =='VenueCityListing' ||pageType=='venueListing')
        {
             var data = {
           
                user_id: $("#TenTimes-Modal #userId").val(),
                user_token:getCookie('user_token'),
                metadata: $("#TenTimes-Modal #userMetadata").val(),
                name: $("#TenTimes-Modal #userName").val(),
                designation: $("#TenTimes-Modal #userDesignation").val(),
                company: $("#TenTimes-Modal #userCompany").val(),
                city: $("#TenTimes-Modal #userCity").val(),
                place_id: $("#TenTimes-Modal #place_id").val(),
                country: $("#TenTimes-Modal #userCountry").val(),
                email: $("#TenTimes-Modal #userEmail").val(),
                phone: $("#TenTimes-Modal #userMobile").val(),
                phoneCode: $("#TenTimes-Modal .phone_code_value").attr('value'),
                source: $("#TenTimes-Modal #userSource").val(),
                HTTP_REFERER: location.href,
                facebookId: $("#TenTimes-Modal #userFacebookId").val(),
                linkedinId: $("#TenTimes-Modal #userLinkedinId").val(),
                individual: $("#TenTimes-Modal #individualCheckBox").is(":checked"),
                action:'signup',
            };
            hitAuth(data,'signup',$("#TenTimes-Modal #userSource").val(),'','');

        }
        else
        {
                var data = {
                txnId: "5151",
                user_id: $("#TenTimes-Modal #userId").val(),
                user_token:getCookie('user_token'),
                event_id: eventData.id,
                metadata: $("#TenTimes-Modal #userMetadata").val(),
                name: $("#TenTimes-Modal #userName").val(),
                designation: $("#TenTimes-Modal #userDesignation").val(),
                company: $("#TenTimes-Modal #userCompany").val(),
                city: $("#TenTimes-Modal #userCity").val(),
                place_id: $("#TenTimes-Modal #place_id").val(),
                country: $("#TenTimes-Modal #userCountry").val(),
                email: $("#TenTimes-Modal #userEmail").val(),
                phone: $("#TenTimes-Modal #userMobile").val(),
                phoneCode: $("#TenTimes-Modal .phone_code_value").attr('value'),
                source: $("#TenTimes-Modal #userSource").val(),
                HTTP_REFERER: location.href,
                facebookId: $("#TenTimes-Modal #userFacebookId").val(),
                linkedinId: $("#TenTimes-Modal #userLinkedinId").val(),
                ai_value: aiValue,
                individual: $("#TenTimes-Modal #individualCheckBox").is(":checked"),
                receiver: receiverData.id,
            };
            hitAuth(data,'connect',$("#TenTimes-Modal #userSource").val(),'','');

        }
    }
}
function ConnectRegisterFormResponse(result) {
    hideloading();
    if(result.status == 1){
        showloading();
        if(result.hasOwnProperty('connectData') && result.connectData.hasOwnProperty('status')){
            switch(result.connectData.status){
                case "1":
                case 1:
                    userRelation = "friend" ;
                    receiverData.connect_id =  result.connectData.id ;
                    break;
                case "0":
                case 0:
                    if(result.connectData.sender == getCookie('user')){ // pending
                        userRelation = "pending" ;
                        receiverData.connect_id =  result.connectData.id ;
                    }
                    else if(result.connectData.receiver == getCookie('user')){ // approval
                        userRelation = "approval" ;
                        receiverData.connect_id =  result.connectData.id ;
                    }
                    else{
                        userRelation = "" ;
                        receiverData.connect_id =  result.connectData.id ;
                    }
                    break;
            }
            if(getCookie('user_flag') != "2")
                verifyUser('submitMessage');
            else{
                if(receiverData.hasOwnProperty('connect_id')){
                    showThankyou(userRelation) ;
                }else{
                    sendRequest() ;
                }
            }
        }
        else{
            showMessage(receiverData.image,receiverData.name,receiverData.job,receiverData.location,result.userData.name,eventData.name);
            hideloading();
        }
    }else{
        if(result.status == 0 && result.hasOwnProperty('error') && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('id') && result.error.hasOwnProperty('invalidData')){
            showloading();
             var flagmobile=0;
          for(var i=0;i<result.error.invalidData.length;i++){
                var match_string=result.error.invalidData[i].what.toLowerCase();
               if(match_string=='phone'){
                $('#userMobile').siblings('.alert_mobile').show();
                $('#userMobile').siblings('.alert_mobile').html(result.error.invalidData[i].why);
                 $('#userMobile').siblings('.alert_mobile').css('color','#ae4b00');
                 hideloading();  
                flagmobile=1;
              }           
            }
         if(flagmobile==0){
            vcardopen(result.userData.name,$("#TenTimes-Modal #userEmail").val(),result.userData.designation,result.userData.userCompany,result.userData.cityName,result.userData.countryName,'','',result.userData.profilepicture,'');
            $("#TenTimes-Modal #userSource").val('connect');
            hideloading();
          }
        }else if(result.status == 0 && result.hasOwnProperty('error') && result.error.hasOwnProperty('message')){
            connectFail(result.status,result.error);
        }
        else{
            showApiError(result);
        }
    }
}
function InterestRegisterForm(exhibitorId) {
    $("#phoneDiv").show();
    if($.trim($("#TenTimes-Modal #userCompany").val()) == "" && $.trim($("#TenTimes-Modal #userDesignation").val()) == "" )
        $("#checkDiv").show();
    if(!$("#TenTimes-Modal #individualCheckBox").is(":checked") && $.trim($("#TenTimes-Modal #userCompany").val()) == "")
        $("#desiDiv").show();

    var B = validateFormData('interest');
    if (!B) {
        return false
    } else {
        showloading();

    if(pageType=='org_detail' || pageType=='venue_detail'  || pageType =='VenueCityListing' ||pageType=='venueListing')
        {
             var data = {

                user_id: $("#TenTimes-Modal #userId").val(),
                user_token:getCookie('user_token'),
                metadata: $("#TenTimes-Modal #userMetadata").val(),
                name: $("#TenTimes-Modal #userName").val(),
                designation: $("#TenTimes-Modal #userDesignation").val(),
                company: $("#TenTimes-Modal #userCompany").val(),
                city: $("#TenTimes-Modal #userCity").val(),
                place_id: $("#TenTimes-Modal #place_id").val(),
                country: $("#TenTimes-Modal #userCountry").val(),
                email: $("#TenTimes-Modal #userEmail").val(),
                phone: $("#TenTimes-Modal #userMobile").val(),
                phoneCode: $("#TenTimes-Modal .phone_code_value").attr('value'),
                source: $("#TenTimes-Modal #userSource").val(),
                HTTP_REFERER: location.href,
                facebookId: $("#TenTimes-Modal #userFacebookId").val(),
                linkedinId: $("#TenTimes-Modal #userLinkedinId").val(),
                individual: $("#TenTimes-Modal #individualCheckBox").is(":checked"),
                action:'signup',
            };
            hitAuth(data,'signup',$("#TenTimes-Modal #userSource").val(),'','');

        }
        else
        {
                var data = {
                txnId: "5151",
                user_id: $("#TenTimes-Modal #userId").val(),
                user_token:getCookie('user_token'),
                event_id: eventData.id,
                metadata: $("#TenTimes-Modal #userMetadata").val(),
                name: $("#TenTimes-Modal #userName").val(),
                designation: $("#TenTimes-Modal #userDesignation").val(),
                company: $("#TenTimes-Modal #userCompany").val(),
                city: $("#TenTimes-Modal #userCity").val(),
                place_id: $("#TenTimes-Modal #place_id").val(),
                country: $("#TenTimes-Modal #userCountry").val(),
                email: $("#TenTimes-Modal #userEmail").val(),
                phone: $("#TenTimes-Modal #userMobile").val(),
                phoneCode: $("#TenTimes-Modal .phone_code_value").attr('value'),
                source: $("#TenTimes-Modal #userSource").val(),
                HTTP_REFERER: location.href,
                facebookId: $("#TenTimes-Modal #userFacebookId").val(),
                linkedinId: $("#TenTimes-Modal #userLinkedinId").val(),
                individual: $("#TenTimes-Modal #individualCheckBox").is(":checked"),

            };
            hitAuth(data,'interest',$("#TenTimes-Modal #userSource").val(),'','');
            exhibitorEnquiryHelper('',exhibitorId,$("#TenTimes-Modal #userSource").val());

        }
    }
}
function getConnectTitle(dis) {
    return "Connect with "+ dis;
}
function validateEmail1(a) {
    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(a)
}
function autoSave() {
    var H = $("#TenTimes-Modal #userEmail").val();
    if (!validateEmail1(H)) {
        return false
    }
    var A = {};
    A.email = $("#TenTimes-Modal #userEmail").val();
    A.action = 'signup';
    A.source = 'auto_save';
    var name = $("#TenTimes-Modal #userName").val();
    name = name.replace(/^\s+|\s+$/g, "");
    if (name != "" && (urlExists(name)) && (conti(name)) && (/^[A-Za-z0-9. ]+$/.test(name))){
        A.name = name;
    }
    else
        return false;
    
    var metadata = $("#TenTimes-Modal #userMetadata").val();
    if (metadata != "") {
        A.metadata = metadata;
    }
    var country = $("#TenTimes-Modal #userCountry").val();
    country = country.replace(/^\s+|\s+$/g, "");
    if (country != "" && country != "Country") {
        var city = $("#TenTimes-Modal #userCity").val();
        city = city.replace(/^\s+|\s+$/g, "");
        if (city != "" && city != "City" && (/^[A-Za-z0-9,-. () ]+$/.test(city)) && city.length <= 33 && url12345(city) && conti(city)) {
            A.city = city;
            A.country = country;
        }
    }
    var designation = $("#TenTimes-Modal #userDesignation").val();
    designation = designation.replace(/^\s+|\s+$/g, "");
    if (designation != "" && designation != "Designation"  &&  url12345(designation) && conti(designation)) {
        A.designation = designation;
    }
    var company = $("#TenTimes-Modal #userCompany").val();
    company = company.replace(/^\s+|\s+$/g, "");
    if (company != "" && company != "Company") {
        A.company = company;
    }
    var phone = $("#TenTimes-Modal #userMobile").val();
    phone = $.trim(phone);
    if (phone.match(/^[0-9- ,]+$/g) && phone.length < 17 && phone.length >= 6 && phone != "Phone") {
        A.phone = phone;
    }
    var industry = $('#Industry_id').val();
    if (industry != undefined && typeof industry  != "undefined") {
        A.industry = industry;
    }
    //console.log(A);
    if (H != "" && autoSaveFlag != 1) {
        autoSaveFlag = 1;
        $.post(site_url_attend+"/registeruser", A, function(L) {
            V = $.parseJSON(L);
            if(V.status==0 && typeof V.error.invalidData != 'undefined' && typeof A.email != 'undefined'){
                $.each(V.error.invalidData, function( key, value ) {
                  if(value.what == 'account-deactivated'){
                    window.location.assign(site_url_attend + "/deactivation/"+V.userData.id);
                    return;
                  }
                });
            }
            if(V.status==1 && V.userData.userExists==0)
                        gaEvent("User","Registration");
            pingUser(V);
            });
            
            
        return false;
    }
}
function showMessage(receiverImage,receiverName,receiverJob,receiverLocation,senderName,eventName) {
     messageG = '';
    sendRequest();
    return;
    gaEvent('User','Message Popup Open');
    if($('#modalData').html() == "")
        $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
    $('#TenTimes-Modal .modal-title').html('Send Message');
    var messageHtml = '<div class="row"> <div class="col-md-12 col-sm-12 material-form"> <form> <div class="row"> <div class="col-md-2 col-xs-3"><img id="message-form-image" class="img-thumbnail" src="'+receiverImage+'" data-src="'+receiverImage+'" alt="'+receiverName+'" > </div><div class="col-md-8 col-xs-7"> <div class="row"> <p><strong id="reciever_name">'+receiverName+'</strong><br><span class="text-muted">'+receiverJob + '</span><br><span class="text-muted">'+receiverLocation+'</span></p></div></div></div><div class="form-group rel-position"> <textarea rows="9" placeholder="Any Comment..." class="pd-0" id="message-body"></textarea> <span class="undrr"></span><span class="text-danger alert_message"></span> </div><button type="button" class="btn btn-lg btn-orange btn-block" onclick="gaEvent(\'User\',\'Message Popup Submit\');$(\'#TenTimes-Modal .modal-header\').find(\'button\').removeAttr(\'onclick\');return submitMessage();">Send Message</button> </form> </div></div>' ;
    $('#TenTimes-Modal .modal-body').html(messageHtml);

    var message = "Hi "+receiverName+","+"\n\nAs both of us are interested in "+eventName+", I would like to connect with you on 10times. \nWe can also schedule a meeting at this event."+"\n \n"+senderName;
    $('#TenTimes-Modal #message-body').val(message);

    $('#TenTimes-Modal').modal('show');
}
function submitMessage(argument) {
    hideError('message');
    var message = $.trim($("#TenTimes-Modal #message-body").val());
    messageG = message;
    if(!validateMessage())
        return false;
    else{
        if(getCookie('user_flag') != "2")
            verifyUser('submitMessage');
        else
            sendRequest();
    }
}
function verifyUser(source) {
    var typ = "savemessage";
    if(messageG == '') typ = '';
    var  b ={ email: '',typ: typ, sender_id: getCookie("user"), receiver_id: receiverData.id, message: messageG, event: eventData.id};
    showloading();
    $.post(site_url_attend + "/user/checkverified", b, function(d) {
        hideloading();
        switch (d) {
            case "true":showVerification(1,source);break;
            case "false":sendVerificationCode();showVerification(0,source);break;
            default:
                alert("Sorry there was an error in the system.")
    }})
}
function sendVerificationCode(type){
    if(type!=undefined && type == "email")
        ajaxHit("GET",site_url_attend+"/user/verify?verified=false&email="+$.trim($("#TenTimes-Modal #userEmail").val()),'',true);    
    else
        ajaxHit("GET",site_url_attend+"/user/verify?verified=false&snd="+getCookie("user")+"&rce=" + receiverData.id + "&ul=" + eventData.url,'',true);
}
//Implements Send Message
function send_verify(token,sender,receiver,relation,dis) {
    userRelation = relation;
    getEventData(dis);
    getReceiverData(dis);
    receiverData['id'] = receiver;
    if (2 != getCookie("user_flag")){// change
        userToken = token;
        approveThis = dis;
        verifyUser('sendVerify'); 
    }
    else {
        if("friend" == relation)
            window.open(login_url + "/dashboard/conversations/" + token + "/" + sender + "/" + receiver, "_blank");    
        else if("approve" == relation )
            update(token,dis, sender, receiver);    
    }
}
//Implements Approve Connection
function update(token, d) {
    
    if(pageType == "profile"){
        "Approved" != $(d).text() && ($(d).html('  <img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///yA2Zd7h6NXZ4uzu8SU6aCA2ZUhagJGcs3OBnsLI1T1QeWBwkZiiuHeEocbL10FTeyM5Z2Rzk+nr79zg5/X291BihuDj6fP09r/F0quzxdDV3vDx9AAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCwAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7AAAAAAAAAAAA" class="vln" alt=""> Processing...'),
            data_url = site_url_attend + "/connect/activate/connect-" + token + "?redirects=false", $.ajax({ // change
            url: data_url,
            success: function() {
                gaEvent("User","Connect Accepted");
                window.location.href = window.location.href;

            }
        }))
    }
    else{
        if(deviceModel == 0 )
            showloading();

        var c = $(d).find("p.action"),
            f = $(c).find("span");
        "Approved" != f.text() && (f.html('  <img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///yA2Zd7h6NXZ4uzu8SU6aCA2ZUhagJGcs3OBnsLI1T1QeWBwkZiiuHeEocbL10FTeyM5Z2Rzk+nr79zg5/X291BihuDj6fP09r/F0quzxdDV3vDx9AAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCwAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7AAAAAAAAAAAA" class="vln" alt="">'), 
        data_url = site_url_attend + "/connect/activate/connect-" + token + "?redirects=false", $.ajax({ // change it
        url: data_url,
        success: function(result) {
            switch(result){
                case true:
                case "true":
                    gaEvent("User","Connect Accepted");
                    window.location.href = window.location.href;
                    break;
                default: 
                    alert("Sorry there is an error in the system. Try again.");
                    hideloading();
                    break;                   
            }
        }
        }))
    }
}

// In case you are an existing user
function forgotPassword(method,type) {
    hideError('email');
    addFunActionLabel="Forgot Pasword Submit";
    if(pageType=='not_login'){
        var email = $.trim($("#TenTimes-Modal #userEmailCopy").val());    
    }else{
        var email = $.trim($("#TenTimes-Modal #userEmail").val());
    }
    if(!validateEmail12345(email)){
        $(".alert_email").show();
        return 0;
    }
    var otpType='password';
    if(type=='N' || type=='U'){
        otpType='otp';
    }

    if(method == "connect")
        var postData = {'email':email, 'name' : receiverData.name  , 'type' : otpType }
    else
        var postData = {'email':email, 'name' : email  , 'type' : otpType }
    showloading();
    $.post(site_url_attend+'/user/getpassword',postData,function(response){
        hideloading();
        response=$.parseJSON(response);
        var resText=response.resText;
        var resLink=response.resLink;
        if(type=='N' || type=='U'){
            resText=response.resText_typeN;
            resLink=response.resLink_typeN;
                
        }
        
        switch(response.response) {
            case 'true':
                    $('#getpassword').parent().replaceWith(function() { return "<a style='text-decoration:none'>" + "<p class='text-center' style='text-decoration:none;color:#909090;'>" + resText + "</p>"+$('#getpassword').get(0).outerHTML+"</a>"; });

                $('#getpassword').text(resLink);
                if(method!='signup' && method!='connect' && method!='contact_organizer_venue'){
                    $('#TenTimes-Modal .partial-log').hide();
                    $('#getpassword').removeAttr("onclick").click(function() {
                        partialLog(method,type)
                    }).text(resLink).css('color','#335aa1');
                }
            break;
            case 'false':
                $(".alert_email").html("Sorry, 10times doesn't recognize that email.");
                $(".alert_email").show();
            break;
        }
    });        
}
function getPassword(flag,source) {
    if(source == "sendVerify")
        var postData = {'sender_id':getCookie('user'), 'name' : receiverData.name   }
    else
        var postData = {'email':'', 'name' : receiverData.name , 'receiver_id' : receiverData.id, 'event_id' : eventData.id , 'event_url' : eventData.url , 'event_name' : eventData.name, 'sender_id':getCookie('user')  }
    // $('#getpassword').parent('a').css({ "text-decoration": "none" });
    // $('#getpassword').css({ "cursor": "default" });
    // $('#getpassword').removeAttr('onclick');
    showloading();
    $.post(site_url_attend+'/user/getpassword',postData,function(response){
        hideloading();
        switch(response) {
            case 'true':
                if(flag == 1 || flag == true )
                    flag = "password" ;
                else 
                    flag = "verfication code" ;

                if($('#getpassword').text() == "Resend Code")
                    $('#getpassword').parent().replaceWith(function() { return "<a style='text-decoration:none'>"+"<p class='text-center' style='text-decoration:none;color:#335AA1;'>" + "Your "+ flag +" has been resend to your email!" + "</p>"+$('#getpassword').get(0).outerHTML+"</a>"; });
                else
                    $('#getpassword').parent().replaceWith(function() { return "<a style='text-decoration:none'>" + "<p class='text-center' style='text-decoration:none;color:#335AA1;'>" + "Your "+ flag +" has been sent to your email!" + "</p>"+$('#getpassword').get(0).outerHTML+"</a>"; });

                $('#getpassword').text('Resend Code');
                break;
            case 'false':break;
        }
    });        
} 

function showVerification(flag,source){

    if($('#modalData').html() == "")
        $('#modalData').html(getModal());

    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
    $('#TenTimes-Modal .modal-title').html('Last step, verify your email<h5>(Just to ensure reply comes back to you)</h5>');
    if(flag == 1 || flag == true){
        var verficationHtml = '<div class="row"> <div class="col-md-12 col-sm-12 material-form"> <form > <div class=""> <div class="form-group rel-position"> <input type="password" placeholder="Enter Password" id="userPassword"><span class="undrr"></span><span class="ico fa-lock"></span><p class="text-danger alert_password"></p></div></div><button type="button" class="btn btn-lg btn-orange btn-block" onclick="return verifyCredential('+"'"+source+"'"+');">Submit</button> </form> <a><h5 class="text-center" style="cursor:pointer" id="getpassword" onclick="getPassword(1,'+"'"+source+"'"+');" >Forgot Password</h5></a></div></div>' ;    
    }
    else{
        var verficationHtml = '<div class="row"> <div class="col-md-12 col-sm-12 material-form"> <form > <div class=""> <div class="form-group rel-position"> <input type="password" placeholder="Enter Verfication Code (Sent to your mail)" id="userPassword"><span class="undrr"></span><span class="ico fa-lock"></span><p class="text-danger alert_password"></p></div></div><button type="button" class="btn btn-lg btn-orange btn-block" onclick="return verifyCredential('+"'"+source+"'"+');">Submit</button> </form> <p class="text-center">Please enter the verification code above</p><a><h5 class="text-center" style="cursor:pointer" id="getpassword" onclick="getPassword(0,'+"'"+source+"'"+');" >Resend Code</h5></a></div></div>' ;            
    }
    $('#TenTimes-Modal .modal-body').html(verficationHtml);
    $('#TenTimes-Modal').show();
    $('#TenTimes-Modal').modal('show');
    doNotReferesh();
    
}
function validateLogin(dta){
    hideError('password');hideError('email');
    var  code = $("#TenTimes-Modal #userPassword").val();
    var email = $.trim($("#TenTimes-Modal #userEmail").val());
    var flag = 1;
    if(!validateEmail12345(email)){
        $(".alert_email").show();
        flag = 0;
    }
   if(!validatePassword())
        flag = 0;
    if(flag == 0)
        return false;
    showloading();
    if(code){
        var dataA={ email: email,password: code,action:'signup'};    
    }
    else{
        var dataA={ email: email,password: code,action:'signup',source :'auto_save'};
    }
    
    var result = ajaxHit('POST',site_url_attend + "/registeruser",dataA,false); // change it
    result = $.parseJSON(result);
    if(result.status==0 && typeof result.error.invalidData != 'undefined' && typeof email != 'undefined'){
        $.each(result.error.invalidData, function( key, value ) {
          if(value.what == 'account-deactivated'){
            window.location.assign(site_url_attend + "/deactivation/"+result.userData.id);
            return;
          }
        });
    }
    pingUser(result,'3');
    if(result.status==1 && result.userData.userExists==0)
        gaEvent("User","Registration");
    
    if(authorizeTenToken(result))
        {
            deleteAllCookies();
            showAuthTokenMessage();
        }
    switch (result.status) {
        case 1:
        case "1":
         if(! (typeof dta != 'undefined' && dta=='signup'))
                getLoggedInDataN();
            return true;
            break;
        case "0":
            showApiError(result);
            break;
        case 0:
            showApiError(result);
            break;
        default:
            var typePass=$('#userPassword').attr('placeholder');
            var typeVal='Invalid Password';
            if(typeof typePass != 'undefined' && (typePass.search(/ otp/)>-1 || typePass.search(/ OTP/)>-1)){
                typeVal='Invalid OTP';
            }
            showError("password",typeVal);
            break;
    }
    hideloading();
    return false;
}
function LoginRegisterForm(method,source) {
    var valid = validateLogin(method);
    $("#TenTimes-Modal .tentimes-form").next('.text-center').hide();
    if(!valid){
        hideloading();
        return false;
    }
    attachFbid();
    
    var methodOrig=method;
    if(method.search(/attendNew/)>-1){
        methodOrig=method.replace("attendNew_", "");
        method=getAction(methodOrig);
    }
    else if(method.search(/feedbackresponse/)>-1){
        methodOrig=method.replace("feedbackresponse_", "");
        method = 'feedbackresponse';
    }else if(method.search(/feedresponse_/)>-1){
        methodOrig=method.replace("feedresponse_", "");
        method = 'feedresponse_';
    }
    else if(method.search('addNewContact')>-1){
        methodOrig=method.split('-')[1];
        method=method.split('-')[0];
    }
    switch (method) {

        case "connect":
                loggedInConnect('',receiverData.id,receiverData.name,eventData.id);
            break;
        case "interest":
        case "going":
        case "watch":    
        case "attend":
                attendNew('',methodOrig);
            break;
        case "bookmark":
        case "follow":
                if(source!=undefined)
                    attendNew('',source)
                else  if(methodOrig.search(/orgdetails/) > -1)
                {
                    attendNew('','orgdetails_follow');
                }
                else
                    attendNew('',methodOrig);
            break;
        case "orgdetails_follow":
                 attendNew('','orgdetails_follow');
            break;
        case "interested_attend":
                 attendNew('','interested_attend');
            break;
        case "going_attend":
                 attendNew('','going_attend');
            break;
        case "speaker":
                followSpeakerNew('','speaker');
            break;    
        case "signup":
                showThankyouLoggedIn();        
            break;
         case "follow page":
                followPage();
            break;
         case "organizer":
            //     if(pageType == 'about')
            // {
            //     OrganizerData['id']=$('#companyId').attr('value');
            // }
            // else
            // {
                // OrganizerData['id']=$()
                // OrganizerData['id']=$('input').attr('id');     
            //}
             followOrganizer("",OrganizerData.id,'organizer');  
                // followOrganizer("",$('h1').attr('id'),'organizer');
            break; 
         case "company-gateway":
                followOrganizer("",OrganizerData.id,'company-gateway');
            break;
        case "stall":
                attendNew('','stall_attend');
            break;
        case "exhibitorconnect":
                exhibitConnect('',exhibitorData.id,'exhibitor',exhibitorData.statusFlag);
            break;
        case "feedbackresponse":
                feedbackResponse('',methodOrig);
            break;        
        case "feedresponse_":
                feedResponse('',methodOrig);
            break; 
        case "exhibitorenquiry":
                exhibitorEnquiry('',exhibitorData.id,'exhibitor');
            break;    
        case "exhibitorsave":
                exhibitorSave('',exhibitorData.id,'exhibitor');
            break;    
        
        case "venue_detail":
                followVenue($('#follow'), $('h1').attr('id'), 'venue_detail');
            break;
        case "verifiedReview":
                verifiedReview();
            break;        
        case "signUpdash" :
            if(location.search.search('/?ref=')>-1){
                location.href=site_url_attend+decodeURIComponent(location.search.replace('?ref=',''));
            }
            else
                location.href=site_url_attend+'/dashboard/events'; 
            break;
        case "workshop":
                // to sync meetx Function with sign in
                $('#TenTimes-Modal').remove();
                $('.modal-backdrop').hide();
                $('body').removeClass('modal-open');
                meetx(workshopData['dis']);
             break;
        case "group":
                // to sync groups Function with sign in
                $('#TenTimes-Modal').remove();
                $('.modal-backdrop').hide();
                $('body').removeClass('modal-open');
                myDataSync(groupData['dis']);
             break;
        case "profile":
                followSpeakerProfile(speakerData['dis'],speakerData['id'],'speaker')
            break;
        case "company-gateway-login":
                companydata('loadMore');
                $('#TenTimes-Modal').remove();
                $('.modal-backdrop').hide();
                $('body').removeClass('modal-open');
                break;
        case "addNewContact":
                $('#TenTimes-Modal').remove();
                $('.modal-backdrop').hide();
                $('body').removeClass('modal-open');
                $('#myContactsModal').modal('show');
                hideloading();
                contactModalHtml.addNewContact('',methodOrig);
                break;
        case "like" :
                $('#TenTimes-Modal').remove();
                $('.modal-backdrop').hide();
                $('body').removeClass('modal-open');
                likeResponse('','like');     
                break; 
        case "more_sponsor":
                $('#TenTimes-Modal').remove();
                $('.modal-backdrop').hide();
                $('body').removeClass('modal-open');
                more_sponsor('',16);
                break; 
        case "view" :
                $('#TenTimes-Modal').remove();
                $('.modal-backdrop').hide();
                $('body').removeClass('modal-open');
                livePlay('','like');     
                break;           
        case "login_check" :
                $('#TenTimes-Modal').remove();
                $('.modal-backdrop').hide();
                $('body').removeClass('modal-open');
                user_comment('','remove');  
                break;              
        default:
            alert("Sorry there is an error in the system. Try again.");
           
    }
}
function attachFbid(){
     $.ajax({
                type: "GET",
                url: site_url_attend+'/ajax?for=attachFbid',
                success: function(d) {
                    console.log('successfully');
                }
            });
}
function changeForm(form,method) {
    switch (form) {
        case "login":
            switch(method){
                case "connect":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
                    attendInput['fields'] = ['email','password'];
                    attendInput['title'] = 'Login';
                    attendInput['subtitle'] = '';
                    attendInput['receiverName'] = receiverData.name;
                    attendInput['receiverId'] = receiverData.id;
                    attendInput['actionName'] = "LoginRegisterForm('"+method+"')";
                    attendInput['actionLabel'] = 'Proceed to connect';
                    getForm(function (modalHtml){
                        $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                    var forgot_password = '<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword('+"'"+method+"'"+');">Forgot Password</span></a>';
                    $('#TenTimes-Modal form').append(forgot_password);
                    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');},attendInput,method);     
                    
                    break;
                case "attend":
                case "stall":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
                    attendInput['fields'] = ['email','password'];
                    attendInput['title'] = 'Login';
                    attendInput['subtitle'] = '';
                    attendInput['actionName'] = "LoginRegisterForm('"+method+"')";
                    attendInput['actionLabel'] = 'Submit';
                    if(method == "stall")
                        attendInput['actionLabel'] = 'Book a stall';
                    getForm(function (modalHtml){
                    $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                    var forgot_password = '<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword('+"'"+method+"'"+');">Forgot Password</span></a>';
                    $('#TenTimes-Modal form').append(forgot_password);
                    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');},attendInput,method);     
                  
                    break;
                case "follow":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
                    attendInput['fields'] = ['email','password'];
                    attendInput['title'] = 'Login';
                    attendInput['subtitle'] = '';
                    if(sourceVs == 'followVs')
                    {
                        
                         attendInput['actionName'] = "LoginRegisterForm('"+method+"','"+sourceVs+"')";
                    }
                    else
                    {
                        attendInput['actionName'] = "LoginRegisterForm('"+method+"')";
                    }
                    attendInput['actionLabel'] = 'Follow Now';
                    getForm(function (modalHtml){
                    $("#modalData").html(modalHtml.mainHtml);     
                    $("#TenTimes-Modal").modal("show");
                    var forgot_password = '<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword('+"'"+method+"'"+');">Forgot Password</span></a>';
                    $('#TenTimes-Modal form').append(forgot_password);
                    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
                    },attendInput,method);
                    
                    break;
                case "speaker":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
                    attendInput['fields'] = ['email','password'];
                    attendInput['title'] = 'Login';
                    attendInput['subtitle'] = '';
                    attendInput['actionName'] = "LoginRegisterForm('"+method+"')";
                    attendInput['actionLabel'] = 'Follow Now';
                    getForm(function (modalHtml){
                    $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                    var forgot_password = '<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword('+"'"+method+"'"+');">Forgot Password</span></a>';
                    $('#TenTimes-Modal form').append(forgot_password);
                    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
                    },attendInput,method);     
                    
                    break;
                case "signup":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
                    attendInput['fields'] = ['email','password'];
                    attendInput['title'] = 'Login';
                    attendInput['subtitle'] = '';
                    attendInput['actionName'] = "LoginRegisterForm('"+method+"')";
                    attendInput['actionLabel'] = 'Login Now';
                    getForm(function (modalHtml){
                    $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                    var forgot_password = '<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword('+"'"+method+"'"+');">Forgot Password</span></a>';
                    $('#TenTimes-Modal form').append(forgot_password);
                    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');},attendInput,method);     
                    //console.log(modalHtml);
                    
                    break;
                case "follow page":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
                    attendInput['fields'] = ['email','password'];
                    attendInput['title'] = 'Login';
                    attendInput['subtitle'] = '';
                    attendInput['actionName'] = "LoginRegisterForm('"+method+"')";
                    attendInput['actionLabel'] = 'Login Now';
                    getForm(function (modalHtml){
                     $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                    var forgot_password = '<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword('+"'"+method+"'"+');">Forgot Password</span></a>';
                    $('#TenTimes-Modal form').append(forgot_password);
                    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
                    },attendInput,method);     
                   
                    break;
                case "organizer":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
                    attendInput['fields'] = ['email','password'];
                    attendInput['title'] = 'Login';
                    attendInput['subtitle'] = '';
                    attendInput['actionName'] = "LoginRegisterForm('"+method+"')";
                    attendInput['actionLabel'] = 'Login Now';
                    getForm(function (modalHtml){
                    $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                    var forgot_password = '<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword('+"'"+method+"'"+');">Forgot Password</span></a>';
                    $('#TenTimes-Modal form').append(forgot_password);
                    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
                    },attendInput,method);     
                   
                    break;
                case "exhibitorconnect":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
                    attendInput['fields'] = ['email','password'];
                    attendInput['title'] = 'Login';
                    attendInput['subtitle'] = '';
                    attendInput['actionName'] = "LoginRegisterForm('"+method+"')";
                    attendInput['actionLabel'] = 'Login Now';
                    getForm(function (modalHtml){
                    $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                    var forgot_password = '<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword('+"'"+method+"'"+');">Forgot Password</span></a>';
                    $('#TenTimes-Modal form').append(forgot_password);
                    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
                    },attendInput,method);     
                    
                    break;
                case "venue_detail":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
                    attendInput['fields'] = ['email','password'];
                    attendInput['title'] = 'Login';
                    attendInput['subtitle'] = '';
                    if(sourceVs == 'followVs')
                    {
                        
                         attendInput['actionName'] = "LoginRegisterForm('"+method+"','"+sourceVs+"')";
                    }
                    else
                    {
                        attendInput['actionName'] = "LoginRegisterForm('"+method+"')";
                    }
                    attendInput['actionLabel'] = 'Follow Now';
                     getForm(function (modalHtml){
                    $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                    var forgot_password = '<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword('+"'"+method+"'"+');">Forgot Password</span></a>';
                    $('#TenTimes-Modal form').append(forgot_password);
                    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
                    },attendInput,method);     
                    
                    break;
                default:
                alert("Sorry there is an error in the system. Try again.");
            }
            break;
        default:
            alert("Sorry there is an error in the system. Try again.");
    }
}
function verifyCredential(source) {
    hideError('password');
    if(!validatePassword())
        return false;
    else{
        showloading();
        var data = { id:getCookie("user"),code:$('#TenTimes-Modal #userPassword').val() };
        var result = ajaxHit('get',site_url_attend+'/user/verify_submit',data,false);
        hideloading();
        switch(result){
            case "true":
                if(source =="sendVerify"){
                    if ("friend" == userRelation) {
                        if(receiverData.hasOwnProperty('connect_id')){
                            var a = window.open(site_url_attend+"/dashboard/connections/" + receiverData.connect_id, "_self");
                            a.focus();
                        }
                        else{
                            var a = window.open(login_url + "/dashboard/conversations/" + userToken + "/" + getCookie('user') + "/" + receiverData.id, "_self");
                            a.focus();
                        }
                        $('#TenTimes-Modal').modal('hide');
                    }else if("approve" == userRelation || "approval" == userRelation ) {
                        if(receiverData.hasOwnProperty('connect_id')){
                            var a = window.open(site_url_attend+"/dashboard/connections/" + receiverData.connect_id, "_self");
                            a.focus();
                        }
                        else{
                            update(userToken, approveThis, getCookie('user'), receiverData.id);
                        }
                        $('#TenTimes-Modal').modal('hide');
                    }
                    return 1;
                }
                  if(pageType=='edit_profile'){
                    location.reload();      
                   }       
                   else{       
                        if(receiverData.hasOwnProperty('connect_id')){
                            showThankyou(userRelation) ;
                        }
                        else
                            sendRequest();
                    }
                    pingUser("","3");
                break;
            case "false":
                var typePass=$('#userPassword').attr('placeholder');
                var typeVal='Invalid Password';
                if(typeof typePass != 'undefined' && (typePass.search(/ otp/)>-1 || typePass.search(/ OTP/)>-1)){
                    typeVal='Invalid OTP';
                }
                showError('password',typeVal);
                return  false;
                break;
        }
    }
}

function validateEmailInvite(a)
{
    var b = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return b.test(a) && !("." == a.charAt(0))
}
function sendRequest(type,param,emailString,widget){
    if(typeof param!='undefined' && param=='new_invite')
    {
            // customEventGA('Event Visitor', 'Invite Via Email', '10times.com/' + $('#event_url').val());
            if(typeof emailString!='undefined' && emailString!='')
                var email = emailString;
            else
                var email = $("#email_invite").val();
            var user_email = $('#user_email').val();

            if (email == '') {
                $('#error').html("Please enter your contact's email id");
                $('#error').show();
                return false;
            }
            widget=widget.toString()
            var check_rec=widget.split('_')[0];
            if($('#fromSection').length==1)
                var id=$('#fromSection').val();
            else if(typeof check_rec!='undefined' && (check_rec=='rec' || check_rec=='detail'))
              var id=widget.split('_')[1];
            else
                var id = $('#eid').val();
            if(page_type=="udash_connections"){
              id=otherCon.event_id;
            }
            var vid = $('#vid').val();
            if(email!='selectAllFlag_invite')
            {
                var emails = email.split(",");
                emails = $.unique(emails);
                email = emails.join(',');
                var messages = '';
                for (i = 0; i < emails.length; i++) {
                    var eml = emails[i];
                    eml = $.trim(eml);

                    // if (!validateEmailInvite(eml) || eml == '') {
                    //     messages = 1;
                    // }
                    if (eml == user_email) {
                        messages = 2;
                    }
                }
                if (messages == 1) {
                    $('#error').html('Please enter valid email id');
                    $('#error').show();
                    return false;
                }
                if (messages == 2) {
                    $('#error').html("You cannot invite yourself");
                    $('#error').show();
                    return false;
                }

                $('#error').html('<div class="loader"></div>');

                $('#error').show();
            }
            else if(email=='selectAllFlag_invite' && $('.tablinks.active').hasClass('import'))
            {
                var sendAllFlag=1;
                customEventGA('Event Visitor','Invite Widget',pageType+'|Send_To_All_Imported')
            }
            else if(email=='selectAllFlag_invite' && $('.tablinks.active').hasClass('connect'))
            {
                var sendAllFlag=2;
                customEventGA('Event Visitor','Invite Widget',pageType+'|Send_To_All_Connections')
            }


            var adata = {};
            adata.user = getCookie('user');
            adata.user_token = getCookie('user_token');
            adata.page_type = pageType;
            adata.author_email = getCookie('email');
            adata.author_name = getCookie('name');
            if(email!='selectAllFlag_invite')
                adata.invitee_emails = email;
            else
                adata.sendAllFlag=sendAllFlag;
            if(($('#fromSection').length==1 || (typeof check_rec!='undefined') && check_rec=='rec' ) && page_type=='thankyou_new')
                adata.source = page_type + '_listing_send_invite_rec';
            else if($('#fromWidget').length==1 || widget==1)
                adata.source=page_type+'_send_invite_widget';
            else
                adata.source = page_type + '_listing_send_invite';
            if(pageType=='thankyou_new' &&  $.urlParam('source')=='oneclickemail' && ($.urlParam('utm_source')=='invite_recommendation'))
                adata.source='invite_recommendation_mail';
            adata.entity_id = id;
            var url=site_url_attend + "/ajax/send_invite";

            if(typeof widget!='undefined')
            {
              var url=url+"?workflow=new_invite";
              // showloading()
            }
            
            $.ajax({
                type: "POST",
                url: url,
                data: adata,
                cache: false,
                success: function(d, s, e) {
                  // hideloading();
                    if(typeof emailString!='undefined' && emailString!='')
                    {
                        if(email=='selectAllFlag_invite')
                            $('#invite_success').append('<h5 class="notice f16 mt-0">Invite sent successfully to all!!!</h5>');
                        else
                            $('#invite_success').append('<h5 class="notice f16 mt-0">Invite sent successfully!!!</h5>');
                        $('#contact_list_invite input').prop('checked',0);
                        $('#select_all_btn').prop('checked',0);
                        $('#select_all_btn').hasClass('selected_done')?$('#select_all_btn').removeClass('selected_done').addClass('selected_none'):''
                        contactModalHtml.checkList=[];
                        if(typeof invite_count=='function')
                          invite_count();

                    }
                    else
                    {
                        $("#email_invite").val('');
                        $('#error').css("color", "darkslategray");
                        $('#error').html('<i class="fas fa-check c-green f12"></i> Invite send to ' + email);
                        if(typeof invite_count=='function')
                          invite_count();
                    }
                    if(page_type=='udash_connections'){
                        if($('#showEventOpt'+otherCon.user_id).hasClass('ImportedContactsUnpublished') && $(otherCon.elem).hasClass('sh-evt-btn')){
                            $(otherCon.elem).text('Invitation mail sent');
                        }else $(otherCon.elem).text('Mail sent');
                        $(otherCon.elem).removeAttr('onclick');
                        // $(otherCon.elem).removeClass('btn-orange');
                        $(otherCon.elem).removeClass('text-white bg-theme-1');
                        $(otherCon.elem).addClass('bg-gray-200 text-gray-600');
                        // $(otherCon.elem).css({'color':'#fff','background-color':'#ff844c','cursor':'unset'});

                    }
                },
                error: function(d, s, e) {

                }
            });
    }
    else
    {
        showloading();
        var source = "web" ;
        if(page_type == "thankyou_new"){
            source = page_type;
        }
        if(pageType == "thankyou")
            source = "vr_connect_thank" ;
        var data = 
            {
                receiver: receiverData.id,
                message: messageG,
                event_id: eventData.id,
                event_url: eventData.url,
                event_name: eventData.name,
                user_id: getCookie("user"),
                user_token: getCookie("user_token"),
                source: source,
                action: "connect"
            };
        hitAuth(data,'sendConnectRequest','web','','');
    }
}
function showThankyou(argument) {
     if(pageType!='thankyou'){
    if($('#modalData').html() == "")
        $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });

    var data = {
                  pageType:pageType,
                  for:'connect_modal',
                  argument:argument,
                  receiverName:receiverData.name,
            };
    var messageHtml='';
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax/modaldata",
        data:data,
        success: function(n) {
             messageHtml=$.parseJSON(n);
             $('#TenTimes-Modal .modal-title').html('Request sent to '+ receiverData.name);  
             $('#TenTimes-Modal .modal-header').attr('style','font-size:12px;');
             $('.btn_connect').hide();
                $('#TenTimes-Modal .modal-title').siblings('h5').remove();
                if(receiverData.hasOwnProperty('connect_id') && (argument == "friend" || argument == "approval") ){
                    if(!$('#TenTimes-Modal .modal-body').is(':visible'))
                        $('#TenTimes-Modal').modal();
                    switch(argument){
                        case "approval" :
                            $('#TenTimes-Modal .modal-title').html(receiverData.name + " have already send you a connection request.");
                            break;
                        case "friend" :
                            $('#TenTimes-Modal .modal-title').html(" You are already connected with "+ receiverData.name);
                            break;
                    }
                    $('#TenTimes-Modal .modal-body').html('<p class="text-center">Please wait, redirecting you to dashboard</p>');
                    var a = window.open(site_url_attend+"/dashboard/connections/" + receiverData.connect_id, "_self");
                    a.focus();
                    return false;
                }
                if(argument != undefined && argument == 'exceed-limit'){
                    if(!$('#TenTimes-Modal .modal-body').is(':visible'))
                        $('#TenTimes-Modal').modal();   
                    $('#TenTimes-Modal .modal-body').html('');
                }else{
                    visitorsf();
                    $('#TenTimes-Modal .modal-body').html('<p class="text-center"><span class="fa fa-refresh fa-spin"></span></p>');
                }
                if(receiverData.dis != undefined && pageType == 'profile'){
                    $(receiverData.dis).prop( "onclick",null);
                    $('#up').find('li').each(function( index ) {$(this).children('div').children('a:eq(1)').remove();});
                    switch(argument){
                        case "true":
                                // $('#follow1').attr('disabled',true).text( "Pending Approval");
                        case "pending":
                        case "request-sent":
                                // $('#follow1').attr('disabled',true).text( "Pending Approval");
                                var profile_id = $('#profileName').attr('data-user-id');
                                var speakerProfile = $.find('a[data-user-id="'+receiverData.id+'"]');
                                if(receiverData.id==profile_id){
                                    $('#connectUser').children().html('Connect Sent');
                                    $('#connectUser').children().removeAttr('onclick');
                                    $('#connectUser').show();
                                }else if(typeof speakerProfile!="undefined"){
                                    $(speakerProfile).removeClass('fa-user-plus fa-heart-o fa-heart text-orange');
                                    $(speakerProfile).css('cursor','unset');
                                    $(speakerProfile).html('<img src="https://c1.10times.com/images/userdashboard/user-check.png" style="height:14px;width:18px;">');
                                }
                            break;
                        case "fail":
                            $('#TenTimes-Modal .modal-title').html('Sorry, request unable to send.');
                            break;
                        case "exists":
                        case "friend":
                                $('#follow1').attr('onclick','location.reload(true)').text( "Friend");
                            break;
                    }
                }
                if(argument == 'request-sent'){
                    gaEvent("User","Connect Sent");
                    $(".visitor [data-user-id='"+receiverData.id+"'] ").html('<i class="fa fa-envelope fa-fw"></i>'+messageHtml.visitor_block).attr('disabled',true);
                    $('#TenTimes-Modal .modal-title').html(messageHtml.title);
                }
                else if(argument == 'pending'){
                    $(".visitor [data-user-id='"+receiverData.id+"'] ").html('<i class="fa fa-envelope fa-fw"></i>'+messageHtml.visitor_block).attr('disabled',true);
                    $('#TenTimes-Modal .modal-title').html(messageHtml.title);
                }
                else if(argument == 'exists' || argument == 'friend'){
                    $(".visitor [data-user-id='"+receiverData.id+"'] ").html('<i class="fa fa-send-o fa-fw"></i>'+messageHtml.visitor_block);
                    $('#TenTimes-Modal .modal-title').html(messageHtml.title);
                }
                else if(argument == 'exceed-limit')
                    $('#TenTimes-Modal .modal-title').html(messageHtml.title);
            $('#TenTimes-Modal .modal-title').attr('style','font-size:15px;');
           },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
       });
    }
}
function somefun(url){
    if(window.location == url)
        $('#TenTimes-Modal').modal('toggle');

    else{
        url+="#event_calender";
    window.location= url;
    }
    $("#eventCalendar").trigger('click');
}
function followm(id,name,organizerData){

    var data = {
                  by:'',
                  offset:0,
                  id:id,
                  pastHit:0,
                  calValue:'all',
                  modalData:1
            };
    var count =0;
    var followModalHtml= '';
    var url = '';
    url += organizerData.url;

    if(organizerData.organizer>=4 && count==0){
        count = count + 1;
        $.ajax({type: "GET", url: site_url_attend + "/ajax?for=companyEvents&id="+data['id']+"&by="+data['by']+'&offset='+data['offset']+'&pastHit='+data['pastHit']+'&calValue='+data['calValue']+"&modalData="+data['modalData'],
        success: function(result) {
          var result = JSON.parse(result);
          var events =result.events;
          events = events.slice(0,6);
          var m=  events.length;
          if(m>0){
          followModalHtml += '<div class="row text-center" style="margin-bottom:15px;"><h2>'+name+' as Organizer <span class="badge badge-grey"style="font-size:16px;font-weight:600;background-color:#e3e3e3;color:#555;border-radius:5px;">'+organizerData.organizer+'</span></h2></div>';
          followModalHtml += '<div class="row">';
          for (var i = 0; i < m; i++) {
            if(i%2==0)
            followModalHtml += '<div class="row" style=" margin-bottom: 10px;">';

             if(events[i].location.countryName ==  events[i].location.cityName){
                events[i].location.countryName='';
             }

             if (events[i].location.countryName != null && events[i].location.countryName!= '' ){
                    events[i].location.countryName = ','+ events[i].location.countryName;
                }


            followModalHtml += '<div class="col-md-6 col-sm-6"><div class="" style="width:100%;border: 1px solid #ddd;box-shadow: 0 3px 6px 0 rgba(0,0,0,.2);border-radius: 6px; background-color: #fff;padding:5px 5px;display:inline-block;"> <div class="col-md-8 col-sm-8" style="padding: 2px 10px;width:60%;overflow:hidden;display: inline-block;"><p style="font-size: 12px;color: #854223;white-space:nowrap;">'+new Date(events[i].startDate).toUTCString().slice(0,11)+ ' - ' +new Date(events[i].endDate).toUTCString().slice(0,16)+'</p><h4 class="overflow_hover" title="'+events[i].name +'"style= "line-height: 1.5;font-size:14px;height: 3em;display: block; display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;text-overflow: ellipsis;"><b><a href='+'"'+events[i].url+'"'+'target="_blank" style="text-decoration:none;color:#333;" >'+events[i].name+'</a></b></h4> <p style= "color: #666;white-space: nowrap; overflow: hidden;text-overflow: ellipsis; ">'+events[i].location.cityName+events[i].location.countryName+'</p> </div><div class="col-md-4 col-sm-4"style="float:right;margin-top:8px; margin-right:8px;position:relative;" ><img src="'+events[i].logo+'" width="100" height="100" alt="'+events[i].name+'" ></div></div></div>';

            if ((i+1) % 2 == 0)
            followModalHtml += '</div>';
          }

        followModalHtml += '</div>';
        followModalHtml += '<div class="row text-center"><a style="color: #535db0;" href="javascript:void(0);" onclick="somefun('+"'"+url+"'"+');" class="text-underline">View More</a></div>';
        }
        $('#TenTimes-Modal .modal-body').html(followModalHtml);
        //$('#TenTimes-Modal').modal('show');
        }

        });
    }

    if(organizerData.exhibitor>=4 && count==0){
        count = count+1;
        data['by']= 'exhibitor';

        $.ajax({type: "GET", url: site_url_attend + "/ajax?for=companyEvents&id="+data['id']+"&by="+data['by']+'&offset='+data['offset']+'&pastHit='+data['pastHit']+'&calValue='+data['calValue']+"&modalData="+data['modalData'],
        success: function(result) {
          var result = JSON.parse(result);
          var events =result.events;
          events = events.slice(0,6);
          var m=  events.length;
          if(m>0){
          followModalHtml += '<div class="row text-center" style="margin-bottom:15px;"><h2>'+name+' as Exhibitor <span class="badge badge-grey "style="font-size:16px;font-weight:600;background-color:#e3e3e3;color:#555;border-radius:5px;">'+organizerData.exhibitor+'</span></h2></div>';
          followModalHtml += '<div class="row">';
          for (var i = 0; i < m; i++) {
            if(i%2==0)
            followModalHtml += '<div class="row" style=" margin-bottom: 10px;">';

             if (events[i].location.countryName != null && events[i].location.countryName!= '' ){
                    events[i].location.countryName = ','+ events[i].location.countryName;
                }

            followModalHtml += '<div class="col-md-6 col-sm-6"><div class="" style="width:100%;border: 1px solid #ddd;box-shadow: 0 3px 6px 0 rgba(0,0,0,.2);border-radius: 6px; background-color: #fff;padding:5px 5px;display:inline-block;"> <div class="col-md-8 col-sm-8" style="padding: 2px 10px;width:60%;overflow:hidden;display: inline-block;"><p style="font-size: 12px;color: #854223;white-space:nowrap;">'+new Date(events[i].startDate).toUTCString().slice(0,11)+ ' - ' +new Date(events[i].endDate).toUTCString().slice(0,16)+'</p><h4 class="overflow_hover" title="'+events[i].name +'"style= "line-height: 1.5;font-size:14px;height: 3em;display: block; display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;text-overflow: ellipsis;"><b><a href='+'"'+events[i].url+'"'+'target="_blank" style="text-decoration:none;color:#333;" >'+events[i].name+'</a></b></h4> <p style= "color: #666;white-space: nowrap; overflow: hidden;text-overflow: ellipsis; ">'+events[i].location.cityName+events[i].location.countryName+'</p> </div><div class="col-md-4 col-sm-4"style="float:right;margin-top:8px; margin-right:8px;position:relative;" ><img src="'+events[i].logo+'" width="100" height="100" alt="'+events[i].name+'" ></div></div></div>';

            if ((i+1) % 2 == 0)
            followModalHtml += '</div>';
          }

        followModalHtml += '</div>' ;
        followModalHtml += '<div class="row text-center"><a style="color: #535db0;" href="javascript:void(0);" onclick="somefun('+"'"+url+"'"+');" class="text-underline">View More</a></div>';
        }
        $('#TenTimes-Modal .modal-body').html(followModalHtml);
       // $('#TenTimes-Modal').modal('show');
        }

        });

    }

    if(organizerData.visitor>=4 && count==0){
        count = count+1;
        data['by']= 'visitor';

        $.ajax({type: "GET", url: site_url_attend + "/ajax?for=companyEvents&id="+data['id']+"&by="+data['by']+'&offset='+data['offset']+'&pastHit='+data['pastHit']+'&calValue='+data['calValue']+"&modalData="+data['modalData'],
        success: function(result) {
          var result = JSON.parse(result);
          var events =result.events;
          events = events.slice(0,6);
          var m=  events.length;
          if(m>0){
          followModalHtml += '<div class="row text-center" style="margin-bottom:15px;"><h2>'+name+' as Visitor <span class="badge badge-grey" style="font-size:16px;font-weight:600;background-color:#e3e3e3;color:#555;border-radius:5px;">'+organizerData.visitor+'</span></h2></div>';
          followModalHtml += '<div class="row">';
          for (var i = 0; i < m; i++) {
            if(i%2==0)
            followModalHtml += '<div class="row" style=" margin-bottom: 10px;">';

             if (events[i].location.countryName != null && events[i].location.countryName!= '' ){
                    events[i].location.countryName = ','+ events[i].location.countryName;
                }

            followModalHtml += '<div class="col-md-6 col-sm-6"><div class="" style="width:100%;border: 1px solid #ddd;box-shadow: 0 3px 6px 0 rgba(0,0,0,.2);border-radius: 6px; background-color: #fff;padding:5px 5px;display:inline-block;"> <div class="col-md-8 col-sm-8" style="padding: 2px 10px;width:60%;overflow:hidden;display: inline-block;"><p style="font-size: 12px;color: #854223;white-space:nowrap;">'+new Date(events[i].startDate).toUTCString().slice(0,11)+ ' - ' +new Date(events[i].endDate).toUTCString().slice(0,16)+'</p><h4 class="overflow_hover" title="'+events[i].name +'"style= "line-height: 1.5;font-size:14px;height: 3em;display: block; display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;text-overflow: ellipsis;"><b><a href='+'"'+events[i].url+'"'+'target="_blank" style="text-decoration:none;color:#333;" >'+events[i].name+'</a></b></h4> <p style= "color: #666;white-space: nowrap; overflow: hidden;text-overflow: ellipsis; ">'+events[i].location.cityName+events[i].location.countryName+'</p> </div><div class="col-md-4 col-sm-4"style="float:right;margin-top:8px; margin-right:8px;position:relative;" ><img src="'+events[i].logo+'" width="100" height="100" alt="'+events[i].name+'" ></div></div></div>';

            if ((i+1) % 2 == 0)
            followModalHtml += '</div>';
          }

        followModalHtml += '</div>' ;
        followModalHtml += '<div class="row text-center"><a style="color: #535db0;" href="javascript:void(0);" onclick="somefun('+"'"+url+"'"+');" class="text-underline">View More</a></div>';
        }
        $('#TenTimes-Modal .modal-body').html(followModalHtml);
        //$('#TenTimes-Modal').modal('show');
        }

        });

    }
    else{
        $('#TenTimes-Modal .modal-body').html(followModalHtml);
    }

}

function visitorsf() {
    if(typeof modalRemoveCss=='function'){
      modalRemoveCss();
    }
    if(eventData.id == undefined)
        eventData.id = getEventId() ;
    if(eventData.name == undefined)
        eventData.name = getEventName() ;
    var pagelink = '';
    if(document.location.pathname.substr(-9) == '/visitors')
    {
        pagelink = site_url_attend+document.location.pathname;
    }
    else
    {
        pagelink = site_url_attend+document.location.pathname+'/visitors';
    }
    var dis = receiverData.dis;
    var profile_page = $(dis).hasClass('speaker-Connection');
    if(typeof profile_page!="undefined" && profile_page==true){
        eventData.id = $(dis).parent().parent().parent().find('#connectEventName').attr('eventId');
        eventData.name = $(dis).parent().parent().parent().find('#connectEventName').text();
        pagelink = $(dis).parent().parent().parent().find('#connectEventName').children().attr('href')+'/visitors';
    }
    var d = host.search("login.10times.com");
    if (-1 == d) {
        var url = site_url_attend + "/ajax?for=connect_suggestion&id=" + eventData.id +"&UserPic=1"
    } else {
        var url = login_url + "/ajax?for=connect_suggestion&id=" + eventData.id
    }
    var uploadPic = 0;
    var designation_suggestion;
    $.ajax({
        type: "POST",
        url: url,
        dataType: "json",
        success: function(n) {
            uploadPic = n['uploadPic'];
            delete n['uploadPic'];
            designation_suggestion = n['designation_suggestion'];
            delete n['designation_suggestion'];
            designation_suggestion=designation_suggestion.slice(0, 7);

            if (Object.keys) {
                var m = Object.keys(n).length
            } else {
                var m = 0;
                for (var q in n) {n.hasOwnProperty(q) && m++}
            }
            if (m > 0) {
                visitorsHtml = '';
                for (var i = 0; i < m; i++) {
                    if (i % 4 == 0) 
                        visitorsHtml += '<div class="row">';
                    if(n[i].image.indexOf('graph.facebook.com')> -1)
                        n[i].image = "//"+n[i].image;
                    visitorsHtml += '<div class="col-md-3 col-sm-3 text-center"><div class="box box_shadow text-center"  style="width:160px;height:205px;margin-bottom:7px;border-radius: 2px;"><div class="scroll height-155"style="height:150px;"><img height="48" width="48" src="'+n[i].profilePicture+'" class="br" alt="'+n[i].name+'" style="display: inline;"  data-src="'+n[i].profilePicture+'"><h4 style="font-size:15px;overflow: hidden;white-space:nowrap;text-overflow: ellipsis;word-break: break-all;" title="View Profile"><a href='+'"'+n[i].profile_url+'"'+'target="_blank" style="text-decoration:none;" >'+n[i].name+'</a></h4><p class="overflow_hover" style="color: #665c5c;font-size: 12px;margin-top: 5px;margin-bottom: 10px;line-height: 14px;height:28px;">'+n[i].position+'</p><small class="block text-muted" style="font-size: 12px;"><i class="fa fa-map-marker" aria-hidden="true" style="margin-right: 5px;"></i>'+n[i].locations.split(",")[0]+'</small></div><div class="row action-button"><button id="oneclk' + i + '" style="width: 75%;margin-left: auto; margin-right: auto; border-radius: 3px; margin-bottom: 5px; height: 29px; background: white; font-weight: 500; padding: 0px 0px 0px 0px; color: #335aa1 !important;"  class="btn btn-primary btn-block x-vs-cb" href="javascript:void(0);" onClick=oneClickConnect('+"'"+ n[i].url +"'" +","+ i + ",'&source=connect_thank');"+'>Connect</button></div></div></div>';
                    
                    if ((i+1) % 4 == 0) 
                        visitorsHtml += '</div>';
                    connection_href[i] = n[i].url;
                };
    var sp = (4-i)/4*100;
                if (m < 8 && m % 4 != 0)
                    visitorsHtml +='<div class="col-md-3 col-sm-3" style="width:'+sp+'%;padding:10%;"><div class="row pt-10 mt-10"><h4><center><a id="inviteSugg" href="javascript:void(0);" onclick="removeInvite();contactModalHtml.initial(\'invite\',\'detail_'+$('#eventID').val()+'\',\'addStyle\');"><button style="border: 0px solid #008cc9;border-radius: 4px;background-color: #008cc9;color: #fff;font-size: 15px;margin-top: 5px;padding-left: 10px;padding-right: 10px;padding: 10px;"><i class="fa fa-user-plus"></i><b> Invite Others</b></button></a></center></h4></div></div>';
                else if(m < 8 && m % 4 == 0)
                    visitorsHtml +='<div class="col-md-3 col-sm-3"><div class="row"><h4><center><a id="inviteSugg" href="javascript:void(0);" onclick="removeInvite();contactModalHtml.initial(\'invite\',\'detail_'+$('#eventID').val()+'\',\'addStyle\');"><button style="border: 0px solid #008cc9;border-radius: 4px;background-color: #008cc9;color: #fff;font-size: 15px;margin-top: 5px;padding-left: 10px;padding-right: 10px;padding: 10px;"><i class="fa fa-user-plus"></i><b> Invite Others</b></button></a></center></h4></div></div>';

                if (m % 4 != 0) 
                    visitorsHtml += '</div>';


                if (m > 1 ) 
                    {
                        visitorsHtml += '<div class="row text-center"><a style="color: #535db0;font-weight:500;" href="javascript:void(0);" id="updateallcon" onclick="oneClickConnectAll();" class="text-underline">Send to all '+m+' visitors</a></div>';


                        if(uploadPic == 0 && $('#event_url').val()){

                            visitorsHtml += '<div class="row pl-15"><p style="color:#717171;font-weight:500;" >Filter by :-</p> </div>';
                        for (var j=0;j<designation_suggestion.length;j++){
                            if(j%7 == 0)
                                visitorsHtml += '<div class ="des_btn_grp">';

                            visitorsHtml += '<button id = "'+designation_suggestion[j].id+'" onclick = "designationFilter(this.id);" >' +designation_suggestion[j].designation+'['+designation_suggestion[j].total_count +']' +'</button>';

                            if((j+1)%7 ==0)
                                visitorsHtml +='</div>';


                         };}

                        if(uploadPic==1)
                        {
                            visitorsHtml += '<br><div class="row text-center" style="border:1px solid lightgrey; border-radius:7px;padding:5px;"><p style="color: #535d99;font-weight:500;" id="photoUpload" class="text"> Please upload your profile picture, having a profile picture will improve your chances of Acceptance by 70%.</p>';
                            visitorsHtml += '<a href="'+site_url_attend+'/dashboard/edit" style="width: 135px;padding:2px;font-weight: 500;background: #ca5d10eb;color: white;border-radius: 3px;border: 1px solid #a96724;margin-top:10px;" id="uploadPhoto">Upload Photo</a></div>';
                        }
                    }
                if($('#TenTimes-Modal .modal-header').find('h4').length==0)
                if (m > 1 )
                {
                    $('#TenTimes-Modal .modal-header').append('<h4 class="pt-10" style="font-size:19px;">Connect with other visitors of <a id="evntNm" href="'+pagelink+'" target="_blank" rel="noreferrer">'+eventData.name+'</a></h4>');
                }
                $('#TenTimes-Modal .modal-body').addClass('pt-0');
                $('#TenTimes-Modal .modal-body').html(visitorsHtml);
                $('#TenTimes-Modal').show();
            }else
            $('#TenTimes-Modal .modal-body').html('<h3><center><a id="inviteSugg" href="javascript:void(0);" onclick="removeInvite();contactModalHtml.initial(\'invite\',\'detail_'+$('#eventID').val()+'\',\'addStyle\');"><button style="border: 0px solid #008cc9;border-radius: 4px;background-color: #008cc9;color: #fff;font-size: 15px;margin-top: 5px;padding-left: 10px;padding-right: 10px;padding: 10px;"><i class="fa fa-user-plus"></i><b> Invite Others</b></button></a></center></h3>');
        }
    });
    $('#TenTimes-Modal .modal-header').addClass('text-center');
        // clearTimeout(timeInterval);
        // timeInterval = setTimeout(function() {
        //     $('#TenTimes-Modal').modal('hide');
        // }, 15000); 

    if(!$('#TenTimes-Modal .modal-body').is(':visible'))
        $('#TenTimes-Modal').modal();   
}

function inviteFrndConRes(){
    
    $("#TenTimes-Modal .close").click(); 
    $('body').css('padding-right','');
     invite_friends();
}
function oneClickConnect(hash,id,source,from) {
    var callFrom = '' ;
    // clearTimeout(timeInterval);
    customEventGA('Connect','top_recommeded','connect_sent');
    if(from !== undefined && from == "t")
        callFrom = from ;
    if(typeof new_Dashboard!='undefined' && new_Dashboard==1){
        $("#"+callFrom+"oneclk" + id).html((themeGlobal=='light'? dashboardSVG.bars : dashboardSVG.barsDark));
        $("#"+callFrom+"oneclk" + id).find('svg').removeClass('w-8 h-8').addClass('w-5 h-5 m-auto');
    }else
    $("#"+callFrom+"oneclk" + id).html('<img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///yA2Zd7h6NXZ4uzu8SU6aCA2ZUhagJGcs3OBnsLI1T1QeWBwkZiiuHeEocbL10FTeyM5Z2Rzk+nr79zg5/X291BihuDj6fP09r/F0quzxdDV3vDx9AAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCwAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7AAAAAAAAAAAA" style ="width:16px ; height:11px" class="vln" alt=""/>');
    $("#"+callFrom+"oneclk" + id).removeClass('text-orange text-underline');
    document.getElementById(callFrom+"oneclk" + id).style.cursor = "default";document.getElementById(callFrom+"oneclk" + id).disabled = !0;document.getElementById(callFrom+"oneclk" + id).removeAttribute("href");
    document.getElementById(callFrom+"oneclk" + id).style.textDecoration = "none";document.getElementById(callFrom+"oneclk" + id).removeAttribute("onclick");
    $.get(site_url_attend + "/user/link?sender=" + getCookie('user') + "&hash=" + hash + "&src=requestmodal" + source, function(a) { // change
      if(typeof new_Dashboard!='undefined' && new_Dashboard==1){
        switch (a) {
            case "pending":
            case "request-sent":
                // $("#"+callFrom+"oneclk" + id).text("Request Sent");
                $("#"+callFrom+"oneclk" + id).html('<i data-feather="user-check" class="m-auto"></i>');
                break;
            case "friend":
            case "exists":
                // $("#"+callFrom+"oneclk" + id).text("Request already sent");
                $("#"+callFrom+"oneclk" + id).html('<i data-feather="user-check" class="m-auto"></i>');
                break;
            case "false":
                $("#"+callFrom+"oneclk" + id).html('<i data-feather="user-plus" class="m-auto"></i>');
                $("#"+callFrom+"oneclk" + id).removeAttr("onClick").css('cursor','not-allowed');

                break;
            case "exceed-limit":
                $("#"+callFrom+"oneclk" + id).html('<i data-feather="user-x" class="m-auto"></i>');
                $("#"+callFrom+"oneclk" + id).removeAttr("onClick").css('cursor','not-allowed');
                break;
        }
        feather.replace();
      }else{
        switch (a) {
            case "pending":
            case "request-sent":
                $("#"+callFrom+"oneclk" + id).text("Request Sent").css('width','100px');
                break;
            case "friend":
            case "exists":
                $("#"+callFrom+"oneclk" + id).text("Request already sent").css('width','155px');
                break;
            case "false":
                $("#"+callFrom+"oneclk" + id).text("Please try again later").css('width','155px');
                break;
            case "exceed-limit":
                $("#"+callFrom+"oneclk" + id).text("Connection limit exceed").css('width','170px');
                break;
        }
      }
        
    })
    return !1;
}
function oneClickConnectAll(from) {
    var callFrom = '' ;
    var source = "connect_thank_batch" ;
    var b = connection_href.length;
    var connection_href_temp = connection_href ;
    if(from !== undefined && from == "t"){
        callFrom = from ;
        source  = "vr_connect_thank_batch" ;
        b = tconnection_href.length ;
        connection_href_temp = tconnection_href ;
    }
    if(from !== undefined && from == "ud"){
        b = connection_href_thank.length ;
        connection_href_temp = connection_href_thank ;
    }
    for (i = 0; b > i; i++) {
        var a = $("#"+callFrom+"oneclk" + i).text();
        let a2 = $("#oneclk" + i).find('.feather-user-plus').length;
        ("Connect" == a || "Send Request" == a || a2 == 1) && oneClickConnect(connection_href_temp[i], i, "&source="+source,callFrom)
    }
    document.getElementById(callFrom+"updateallcon").removeAttribute("onclick"), document.getElementById(callFrom+"updateallcon").style.cursor = "default";
    $("#"+callFrom+"updateallcon").removeClass('text-orange text-underline');
}
function ajaxHit(type,url,data,async) {
    var V;
    $.ajax({
            type: type,
            url: url,
            data: data,
            async: async,
            success: function(A) {V = A;return V;}
        });
    return V;
}
function validatePassword(){
    var code = $('#TenTimes-Modal #userPassword').val();
    var typePass=$('#userPassword').attr('placeholder');
    var typeVal=password_enter;
    if(typeof typePass != 'undefined' && (typePass.search(/ otp/)>-1 || typePass.search(/ OTP/)>-1)){
        typeVal=otp_enter;
    }

    if(code == ""){showError('password',typeVal);return  false;}  
    else    return  true;
}
function trimData(value) {
    return value.replace(/^\s+|\s+$/g, '');
}
function validateMessage(message) {
    var message = $("#TenTimes-Modal #message-body").val();
    message = message.replace(/^\s+|\s+$/g, '');
    var flag = true;
    if(message == "" || message == "Any Comment..." ){
        showError('message',msg_enter);
        $("#TenTimes-Modal #message-body").val('');
        flag = false;
    }
    else if(message.length> 300 ){
        showError('message',msg_length);
        flag = false;
    }
    else if (message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)) {
        showError('message',msg_email);flag = false;
    }
    else if (message.indexOf("http") >= 0 || message.indexOf("www.") >= 0) {
        showError('message',msg_url);flag = false;
    }
    else if(digitCheck(message)) {
        showError('message',msg_phone);flag = false;
    }
    else if (specialdigitCheck(message)) {
        showError('message',msg_phone);flag = false;
    }
    else{
        var c = ["ae", "www", "com", "org", "net", "int", "edu", "gov", "mil", "arpa", "ac", "ad", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "as", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cs", "cu", "cv", "cw", "cx", "cy", "cz", "dd", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gm", "gn", "gp", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "ll", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "pk", "ph", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "su", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "ui", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "ye", "yt", "yu", "za", "zm", "zw"];
        c = c.toString();
        var b = message.split(".");
        for (i = 0; i < b.length; i++) {
        if (b[i] = b[i].toLowerCase(), c.indexOf("," + b[i] + ",") >= 0) {
            showError('message',msg_url);flag = false;
            }
        }
    }
    return flag;
}
function digitCheck(a) {
    a = a.replace(getEventName("dis"), "");
    var b = a.replace(/[^0-9]/g, " ");
    b = b.split(" ");
    for (i = 0; i < b.length; i++) {
        if (b[i].length > 6) {
            return true
        }
    }
    return false
}
function specialdigitCheck(a) {
    a = a.replace(getEventName("dis"), "");
    var b = a.replace(/[^0-9.+, ]/g, "_");
    b = b.split("_");
    for (i = 0; i < b.length; i++) {
        if ($.trim(b[i]).length > 8) {
            return true
        }
    }
    return false
}
function getReceiverData(I) {
    if(I === undefined) return 1 ;

    switch(pageType){
        case 'profile':
            if(userRelation != 'friend' && userRelation != 'approve'){
                receiverData['image'] = $("h1").parent().siblings().find('img').attr('src');
                receiverData['name'] = $("h1").html();
                receiverData['designation'] = '';
                receiverData['job'] = $("h1").parent().clone().children().remove().end().text();
                receiverData['location'] = $("h1").parent().find('ul li:eq(0)').text();
                receiverData['dis'] = I;
            }
            break;
         case 'udash_connections' :
            receiverData['image'] = $(I).parent().parent().parent().find('img').attr('src');
            receiverData['name'] = $(I).parent().parent().parent().find('.name').text();
            receiverData['designation'] = '';
            receiverData['job'] = $(I).parent().parent().parent().find('.job').text();
            receiverData['location'] = $(I).parent().parent().parent().find('.location').text();
            receiverData['dis'] = I;
            break;
        case 'thankyou' :
            receiverData['image'] = $(I).parent().parent().parent().parent().find('img').attr('src');
            receiverData['name'] = $(I).parent().parent().parent().find('.name').text();
            receiverData['designation'] = '';
            receiverData['job'] = $(I).parent().parent().parent().find('.job').text();
            receiverData['location'] = $(I).parent().parent().parent().find('.location').text();
            receiverData['dis'] = I;
            break;
        case 'exhibitors':
            receiverData['dis'] = I;
            break;
        case 'about':
        case 'visitors':
        default:
            if(deviceModel == 0 ){
                receiverData['image'] = $(I).find('img').attr('src');
                receiverData['name'] = $(I).find('#name').text();
                receiverData['designation'] = $(I).find('#job').text();
                receiverData['job'] = $(I).find('#job').text();
                receiverData['location'] = $(I).find('#location').text();
                receiverData['dis'] = I;
            }
            else{
                if(pageType == 'visitors' || pageType=='about'){
                    receiverData['image'] = $(I).parent().parent().find('img').attr('src');
                    receiverData['name'] = $(I).parent().parent().find('h4').text();
                    receiverData['designation'] = $(I).parent().parent().find('small:eq(0)').text();
                    receiverData['job'] = $(I).parent().parent().find('small:eq(0)').text();
                    // receiverData['location'] = $(I).parent().parent().find('p:eq(1):not(.action)').text();
                    receiverData['location']=$(I).parent().parent().find('small:eq(1):not(.action)').text();
                    receiverData['dis'] = I;
                }
                else{
                    receiverData['image'] = $(I).find('img').attr('src');
                    receiverData['name'] = $(I).find('h3').text();
                    receiverData['designation'] = $(I).find('p:eq(0)').text();
                    receiverData['job'] = $(I).find('p:eq(0)').text();
                    receiverData['location'] = $(I).find('p:eq(1):not(.action)').text();
                    receiverData['dis'] = I;                                        
                }

            }
            break;
    }
}
function getSpeakerData(dis,speaker_id,page) {
    if (page === undefined)
        page = 'default';
    if(dis === '' )
        return 1;
    switch(page){
        case 'default':
            if(dis != '' && speaker_id != "speaker"){
                speakerData['dis'] = dis;
                speakerData['id'] = speaker_id;
                speakerData['image'] = $(dis).find('img').attr('src');
                speakerData['name'] = $(dis).find('h3').text();
                speakerData['designation'] = $(dis).find('p:eq(0)').text();
                speakerData['job'] = $(dis).find('p:eq(0)').text();
                speakerData['location'] = $(dis).find('p:eq(1):not(.action)').text();
            }
            break;
        case 'profile':
            if($(dis).parent().parent().parent().parent().find('h1').length>0 ){
                speakerData['dis'] = dis;
                speakerData['id'] = speaker_id;
                speakerData['image'] = 'https://c1.10times.com/images/no-pic.jpg';
                speakerData['name'] = $('h1').html();
                speakerData['designation'] = '' ;
                speakerData['job'] = '';
                speakerData['location'] = '';
            }
            else if($(dis).closest('.c-snipet').length>0){
                speakerData['dis'] = dis;
                speakerData['id'] = speaker_id;
                speakerData['image'] = 'https://c1.10times.com/images/no-pic.jpg';
                speakerData['name'] =$(dis).closest('.c-snipet').find('.name-font').text();
                speakerData['designation'] = '' ;
                speakerData['job'] = '';
                speakerData['location'] = '';
                speakerData['where'] = 'profileDash';
            }else if($(dis).hasClass('speaker-Connection') && $(dis).text().search('Follow ')>-1){
                speakerData['dis'] = $('[data-user-id='+speaker_id+']');
                speakerData['id'] = speaker_id;
                speakerData['image'] = $('[data-user-id='+speaker_id+']').parent().find('img').attr('src');
                speakerData['name'] =$('[data-user-id='+speaker_id+']').parent().find('.name-font').text();
                speakerData['designation'] = '' ;
                speakerData['job'] = '';
                speakerData['location'] = '';
                speakerData['where'] = 'profileDash';
            }else if($(dis).hasClass('setFollowing') && $(dis).text().search('Follow ')>-1){
                speakerData['dis'] = $('[data-user-id='+speaker_id+']');
                speakerData['id'] = speaker_id;
                speakerData['image'] = $('[data-user-id='+speaker_id+']').parent().find('img').attr('src');
                speakerData['name'] =$('[data-user-id='+speaker_id+']').parent().find('.name-font').text();
                speakerData['designation'] = '';
                speakerData['job'] = '';
                speakerData['location'] = '';
                speakerData['where'] = 'profileDash';
            }
            else{
                speakerData['dis'] = dis;
                speakerData['id'] = speaker_id;
                speakerData['image'] = 'https://c1.10times.com/images/no-pic.jpg';
                speakerData['name'] = $(dis).parent().parent().parent().find('.lead').text();
                speakerData['designation'] = '' ;
                speakerData['job'] = '';
                speakerData['location'] = '';
            }
            break;
        case 'speaker':
            if(deviceModel == '0' ){
                speakerData['id'] = speaker_id;
                 speakerData['image'] = $(dis).parents().eq(1).find('img').attr('src');
                if(pageType=='homepage')
                {
                    speakerData['name'] = $(dis).parents().eq(1).find('.name').text();
                }
                else
                {
                    speakerData['name'] = $(dis).parents().eq(1).find('#name').text();
                }
                speakerData['designation'] = $(dis).parents().eq(1).find('#job').text();
                speakerData['job'] = $(dis).parents().eq(1).find('#job').text();
                speakerData['location'] = $(dis).parents().eq(1).find('#location').text();
                speakerData['dis'] = dis;
            }
            else{
                
                if(pageType == "visitors" && $(dis).parent().parent().find('h4').length>0){
                    speakerData['dis'] = $(dis).parent();
                    speakerData['id'] = speaker_id;
                    speakerData['image'] = 'https://c1.10times.com/images/no-pic.jpg';
                    speakerData['name'] = $(dis).parent().parent().find('h4').html();
                    speakerData['designation'] = '' ;
                    speakerData['job'] = '';
                    speakerData['location'] = '';
                }
                else if($(dis).parent().parent().parent().find('h4').length>0){
                    speakerData['dis'] = $(dis).parent().parent();
                    speakerData['id'] = speaker_id;
                    speakerData['image'] = 'https://c1.10times.com/images/no-pic.jpg';
                    speakerData['name'] = $(dis).parent().parent().parent().find('h4').html();
                    speakerData['designation'] = '' ;
                    speakerData['job'] = '';
                    speakerData['location'] = '';
                }
                else if($(dis).closest("table").hasClass("contact-list")) {
                    speakerData['dis'] = $(dis)
                    speakerData['id'] = speaker_id;
                    speakerData['name'] = $(dis).parent().closest("td").find("a").html();
                    speakerData['designation'] = '' ;
                    speakerData['job'] = '';
                    speakerData['location'] = '';
                }
                else if(pageType=='udash_connections'){
                   speakerData['dis'] = $(dis)
                   speakerData['id'] = speaker_id;
                   speakerData['name'] = $(dis).parent().find('h5').text();
                   speakerData['designation'] = '' ;
                   speakerData['job'] = '';
                   speakerData['location'] = '';
               }
            }
        if (!speakerData.dis) speakerData.dis = dis;
        if (!speakerData.id) speakerData.id = dis.dataset.id;
        if (!speakerData.name) speakerData.name = dis.dataset.name;
        if (!speakerData.img) speakerData.img = dis.dataset.img;
        if (!speakerData.img) speakerData.img = 'https://img.10times.com/images/no-pic.jpg';
        if (!speakerData.designation) speakerData.designation = dis.dataset.designation;
      break;
    }
}
/* connect end */
function showConnectSuggestion(message) {

    $("#modalData").html(getModal());
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
    $('#TenTimes-Modal .modal-title').siblings('h5').remove();
    switch (message) {
        case "true":
            visitorsf();
            $('#TenTimes-Modal .modal-title').html('Your request has been sent!');
            break;
        case "exists":
            if(pageType!='udash_connections'){
             visitorsf();
            $('#TenTimes-Modal .modal-title').html('You are already connected!');
            }else{
             var reciever_name=$('.connection img').attr('alt');    
             $('#TenTimes-Modal .modal-title').html(reciever_name+' is already in your connection list');
            }
             break;

        case "alreadyReceived":
            var reciever_name=$('.connection img').attr('alt');
            $('#TenTimes-Modal .modal-title').html(reciever_name+' had already sent you a connect request, so now added to your connection list');
            break;
        case "system_error":
            $('#TenTimes-Modal .modal-title').html('Sorry there is some internal error. Please try again later.');
            break;
        case "exceed":
            $('#TenTimes-Modal .modal-title').html('Sorry, you have reached the daily limit of 100 connections. We appreciate your enthusiasm. ');
            break;
        case "request-sent":
            visitorsf();
            $('#TenTimes-Modal .modal-title').html('Connect request already sent!');
            break;
        default:
            visitorsf();
            $('#TenTimes-Modal .modal-title').html('Connect with other visitors');
    }
    $("#TenTimes-Modal").modal("show");
}
function doNotReferesh(){
    $("#TenTimes-Modal form").submit(function(e) {
        e.preventDefault();
    });
}
function followSpeakerNew(elem, speakerId, source='speaker', from=null){
  if (!elem) callGaEvent(source);
  getSpeakerData(elem, speakerId, 'speaker');
  if (getCookie('user') && getCookie('user_token')) {
    var data = {
      user_id: getCookie('user'),
      user_token: getCookie('user_token'),
      speaker_id: speakerData.id,
      source: source,
      action: 'follow',
      from: from
    };
    if (from == 'speakerModal') data.speaker_id = speakerId;
    showloading();
    hitAuth(data, 'oneClickSpeaker', source, '', elem);
  } else {
    verifySigninTT('login',source); 
  }
}
function unfollowSpeaker(dis,speakerId,source,from=null){
    if(getCookie('user') && getCookie('user') != ""){
        //showloading();
        var data = { user_id:getCookie('user'), user_token:getCookie('user_token'), speaker_id: speakerId, source:source, action:'unfollow', from:from};
            //hitAuth(data,'oneClickSpeakerUnfollow',source,'',dis);
            $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: data,async: true, // change it
            beforeSend: function(){},
            ajaxSend: function(){},
            complete: function(){},
            success: function(A) {
                hideloading();
                $('#following__users_sub_'+ data.speaker_id).remove();
            }

            });

    }
}

function followSpeakerProfile(dis,speakerId,source){
    getSpeakerData(dis,speakerId,'profile');
    if(getCookie('user') && getCookie('user') != ""){
        var speakerConnections = $(dis).hasClass('profile-conn');
        if(typeof speakerConnections!="undefined" && speakerConnections==true ){
            connectShow(speakerId,1,function (argument) {
                // SpeakerFollow(dis,speakerId,source);
            });
        } else
        SpeakerFollow(dis,speakerId,source);
        if(JSON.stringify(speakerId)==$('#profileName').attr('data-user-id')){
          // connectShow();
        }
    }else{
        // getSpeakerForm(source);
       verifySigninTT('login',source);    
    }
}
function SpeakerFollow(dis,speakerId,source){
    showloading();
    var data = { user_id:getCookie('user'), user_token:getCookie('user_token'), speaker_id: speakerData.id, source:source, action:'follow'};
    hitAuth(data,'oneClickSpeaker',source,'',dis);
}
function getSpeakerForm(source) {
    startInitFb();
    var speakerInput = ['fields','title','social','subtitle','actionName','actionLabel'];
    speakerInput['fields'] = ['name','email','city','company','designation','phone'];
    // speakerInput['title'] = 'Follow '+speakerData.name;
    speakerInput['social'] = ['10timeslogin','linkedin','facebook'];
    speakerInput['subtitle'] = '';

      if(pageType=='org_detail'){
        speakerInput['actionName'] = "registerOrgFollower('"+source+"',"+OrganizerData.id+")";
        speakerInput['title'] = 'Follow '+OrganizerData.name;
    }
    else{
        speakerInput['actionName'] = "registerFollower('"+source+"',"+speakerData.id+")";
        speakerInput['title'] = 'Follow '+speakerData.name;
    }


    // speakerInput['actionName'] = "registerFollower('"+source+"',"+speakerData.id+")";
    speakerInput['actionLabel'] = 'Follow';
    getForm(function (modalHtml){
    $("#modalData").html(modalHtml.mainHtml);
    clickCompany();
    $("#TenTimes-Modal").modal("show");
    $("#desiDiv").hide();$("#checkDiv").hide();$("#phoneDiv").hide();$("#aiDiv").hide();
    postFormOpenSettings();
    $("#TenTimes-Modal #userSource").val(source);
    },speakerInput,source);     
    
}
function signIn(source){
    org_msg=0;
    if(getCookie('user') && getCookie('user') != "")
        location.reload(true);
    else
    {
        startInitFb();
        var speakerInput = ['fields','title','social','subtitle','actionName','actionLabel'];
        speakerInput['fields'] = ['name','email','city','company','designation','phone'];
        speakerInput['title'] = 'Sign Up/Login';
        speakerInput['social'] = ['10timeslogin','linkedin','facebook'];
        speakerInput['subtitle'] = '';
        speakerInput['actionName'] = "registerSignIn('"+source+"')";
        speakerInput['actionLabel'] = 'Sign Up';
        getForm(function (modalHtml){
        $("#modalData").html(modalHtml.mainHtml);
        clickCompany();
        $("#TenTimes-Modal").modal("show");
        $("#desiDiv").hide();$("#checkDiv").hide();$("#phoneDiv").hide();$("#aiDiv").hide();
        postFormOpenSettings();
        $("#TenTimes-Modal #userSource").val(source);
        socialRegistration();
        },speakerInput,source);     
        
    }
}
function registerSignIn(source) {
    showloading();
    var B = validateLoginData(source);
    hideloading();
    if (!B) {
        return false
    } else {
        var A = {};
        A.name = $("#TenTimes-Modal #userName").val();
        A.email = $("#TenTimes-Modal #userEmail").val();
        A.country = $("#TenTimes-Modal #userCountry").val();
        A.city = $("#TenTimes-Modal #userCity").val();

        A.company = $("#TenTimes-Modal #userCompany").val();
        A.designation = $("#TenTimes-Modal #userDesignation").val();
        A.mobile = $("#TenTimes-Modal #userMobile").val();
        A.source = $("#TenTimes-Modal #userSource").val();
        A.action = 'signup';
        showloading();
        hitAuth(A,'signup',$("#TenTimes-Modal #userSource").val(),'','');
    }
}
function signupResponse(result){
    if(result.status == 1){
        showloading();
        showThankyouLoggedIn();
        //location.reload();
    }
    else{
        if(result.status == 0 && result.hasOwnProperty('error') && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('id') && result.error.hasOwnProperty('invalidData')){
            //showApiError(result);
            showloading();
             var flagmobile=0;
          for(var i=0;i<result.error.invalidData.length;i++){
            var match_string=result.error.invalidData[i].what.toLowerCase();
              if(match_string=='phone'){
                $('#userMobile').siblings('.alert_mobile').show();
                $('#userMobile').siblings('.alert_mobile').html(result.error.invalidData[i].why);
                 $('#userMobile').siblings('.alert_mobile').css('color','#ae4b00');
                 hideloading();  
                flagmobile=1;
              }           
            }
         if(flagmobile==0){
            vcardopen(result.userData.name,$("#TenTimes-Modal #userEmail").val(),result.userData.designation,result.userData.userCompany,result.userData.cityName,result.userData.countryName,'','',result.userData.profilepicture,'');
          }
        }
        else{
            showApiError(result);
            //alert("Sorry there was an error in the system.");
        }
    }
    if(page_type == "thankyou_new" || pageType=='register_new' || pageType=='login_new'){
        showloading();
    }
    else{
        hideloading();
    }
}
function showApiError(result) {
    if(result.hasOwnProperty('error')  && result.error.hasOwnProperty('invalidData')){
        for (values in result.error.invalidData) {
            //console.log(result.error.invalidData[values].what);
            switch(result.error.invalidData[values].what){
                case "Email":
                    $('#userEmail').closest('.form-group').show();
                    showError('email','Please enter a valid email');
                    break;
                case "email":
                    $('#userEmail').closest('.form-group').show();
                    showError('email','Please enter a valid email');
                    break;
                case "name":
                    $('#userName').closest('.form-group').show();
                    showError('email','Please enter a valid name');
                    break;
                case "phone":
                    $('#userMobile').closest('.form-group').show();
                    showError('email','Please enter a valid phone');
                    break;
                case "city":
                    $('#userCity').closest('.form-group').show();
                    $('#lcation').closest('.form-group').show();
                    showError('email','Please enter a valid city');
                case "password":
                case "Password":
                    var typePass=$('#userPassword').attr('placeholder');
                    var typeVal='Invalid Password';
                    if(typeof typePass != 'undefined' && (typePass.search(/ otp/)>-1 || typePass.search(/ OTP/)>-1)){
                        typeVal='Invalid OTP';
                    }
                    $('#userPassword').closest('.form-group').show();
                    showError('password',typeVal);
                    break;
            }
        };
    }
}
function showThankyouLoggedIn(message){
    hideloading();
    // if($('#modalData').html() == "")
    //     $('#modalData').html(getModal());
    // $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
    // $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
    // $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h4 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h4>"; });
    // $('#TenTimes-Modal .modal-title').html('You are successfully logged in.');
    // $('#TenTimes-Modal .modal-title').siblings('h5').remove();
    // $('#TenTimes-Modal .modal-body').html('');
    $('#TenTimes-Modal').modal('hide');
    
    if((pageType=='org_detail' || pageType=='venue_detail' || pageType=='VenueCityListing' ||pageType=='venueListing') && org_msg==1)
    {
        $('#modalData').html('');
         getLoggedInDataN();
         // consentup(10);
        if(pageType.search(/venue/)>-1 || pageType.search(/Venue/)>-1){
            // venueEnquiryModal();
            if(typeof venueRequestResponse == 'function')
                venueRequestResponse();//Added By Prateek Raj
            else
                venueEnquiryModal();
        }
        else {
            showMessage1();
        }
        
    }
    else
    {
          getLoggedInDataN();
          // consentup(10);
            removeBackdropModal();
            continueScroll();
             if(pageType=='register_new' || pageType=='login_new'){
                showloading();
                  location.reload();
             }else if(message == 'success'){
                showToast("You are successfully logged In!",'#43C86F');   
             }
    }
}
function registerFollower(source,speakerId) {
    showloading();
    var B = validateLoginData(source);
    hideloading();
    if (!B) {
        return false
    } else {
        var A = {};
        A.speaker_id = speakerId;
        A.name = $("#TenTimes-Modal #userName").val();
        A.email = $("#TenTimes-Modal #userEmail").val();
        A.userid = $("#TenTimes-Modal #userId").val();
        A.country = $("#TenTimes-Modal #userCountry").val();
        A.city = $("#TenTimes-Modal #userCity").val();
        A.place_id = $("#TenTimes-Modal #place_id").val();
        A.company = $("#TenTimes-Modal #userCompany").val();
        A.designation = $("#TenTimes-Modal #userDesignation").val();
        A.mobile = $("#TenTimes-Modal #userMobile").val();
        A.source = $("#TenTimes-Modal #userSource").val();
        A.action = 'follow';
        showloading();
        hitAuth(A,'speaker',$("#TenTimes-Modal #userSource").val(),'','');
        hideloading();
    }
}
function speakerResponse(result,source=null,dis=null,from=null) {
   
    if(result.status == 1){
        //console.log(speakerData.dis);
        if(speakerData.hasOwnProperty('where') && speakerData.where=='profileDash'){
            $(speakerData.dis).html($(speakerData.dis).html().replace('Follow','Following'));
            $(speakerData.dis).removeAttr( "onclick");
             $(speakerData.dis).prop('disabled','disable');
             $(speakerData.dis).removeClass('fa-user-plus');
             $(speakerData.dis).removeClass('fa-heart-o').removeClass('text-muted').addClass('fa-heart text-orange');
             if($(speakerData.dis).hasClass('profile-conn')){
                $(speakerData.dis).removeClass('fa-heart-o fa-heart text-orange');
                $(speakerData.dis).css('cursor','unset');
                $(speakerData.dis).html('<img src="https://c1.10times.com/images/userdashboard/user-check.png" style="height:14px; width:18px;">');
                from=speakerData.dis;
             }
             if($('#profileName').attr('data-user-id')==JSON.stringify(speakerData.id)){
              $('#connectUser').css('display','none');
              $('#self-follower').html($('#self-follower').html().replace('Follow','Following'));
              $('#self-follower').removeAttr( "onclick");
              $('#self-follower').prop('disabled','disable');
             }
        }
        else if(from == 'speakerModal'){
            if($(dis).hasClass('fa-heart-o')){
                $(dis).closest('div').parent().find("button").html('Following');
                $(dis).closest('div').parent().find("button").css({'background-color': '#337ab7' , 'opacity':'0.65','right':'15px'});
                $(dis).closest('div').parent().find("button").prop('disabled','disable');        
                $(dis).closest('div').find("i").css({'color': '#dd6104'});
                $(dis).closest('div').find("i").css("pointer-events","none");
                $(dis).closest('div').find("i").removeClass('fa-heart-o').addClass('fa-heart color_orange');                
            }
            else{ 
                $(dis).closest('div').find("button").html('Following');
                $(dis).closest('div').find("button").css({'background-color': '#337ab7' , 'opacity':'0.65','right':'15px'});
                $(dis).closest('div').find("button").prop('disabled','disable');        
                $(dis).closest('div').find("i").css({'color': '#dd6104'});
                $(dis).closest('div').find("i").css("pointer-events","none");
                $(dis).closest('div').find("i").removeClass('fa-heart-o').addClass('fa-heart color_orange');
            }
        }
        else{
          speakerData.dis.removeAttribute('onclick');
          speakerData.dis.classList.add('text-orange');
          speakerData.dis.disabled = true;
        }  
        if(typeof followerCallback=='function'){
            followerCallback(speakerData.dis);
        }
        if (typeof speakerData.dis.hasClass=='function') {
        if(speakerData.dis.hasClass('setFollowing')){
            let dis = speakerData.dis;
            $(dis).removeAttr('onclick').addClass('disabled').html("Following");
        }
        else
        showThank('speaker');
        }else if(typeof source!='undefined' && source=='profile' && $(speakerData.dis).hasClass('setFollowing')){
            $(speakerData.dis).removeAttr('onclick').addClass('disabled').html("Following");
        }
        else
            showThank('speaker');
    }
    else{
        if(result.status == 0 && result.hasOwnProperty('error') && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('id') && result.error.hasOwnProperty('invalidData')){
            showloading();
             var flagmobile=0;
          for(var i=0;i<result.error.invalidData.length;i++){
            var match_string=result.error.invalidData[i].what.toLowerCase();
             if(match_string=='phone'){
                $('#userMobile').siblings('.alert_mobile').show();
                $('#userMobile').siblings('.alert_mobile').html(result.error.invalidData[i].why);
                 $('#userMobile').siblings('.alert_mobile').css('color','#ae4b00');
                 hideloading();  
                flagmobile=1;
              }           
            }
         if(flagmobile==0){
            vcardopen(result.userData.name,$("#TenTimes-Modal #userEmail").val(),result.userData.designation,result.userData.userCompany,result.userData.cityName,result.userData.countryName,'','',result.userData.profilepicture,'');
            hideloading();
          }
        }
        else{
            showApiError(result);
            //alert("Sorry there was an error in the system.");
        }
    }
}

function validateLoginData(source) {
    hideError('name');hideError('email');hideError('designation');hideError('company');hideError('city');hideError('mobile');hideError('password');
    var L = 0;
    var name = $("#TenTimes-Modal #userName").val();
    var email = $("#TenTimes-Modal #userEmail").val();
    var userid = $("#TenTimes-Modal #userId").val();
    if ($("#TenTimes-Modal #userCountryCode").val() == "")
        $("#TenTimes-Modal #userCountry").val("")
    var country = $("#TenTimes-Modal #userCountry").val();
    var city = $("#TenTimes-Modal #userCity").val();
    var company = $("#TenTimes-Modal #userCompany").val();
    var designation = $("#TenTimes-Modal #userDesignation").val();
    var mobile = $("#TenTimes-Modal #userMobile").val();

    var R = true;
    var I = true;
    if (!validateName(name)) {
        if (!L) {
            $("#TenTimes-Modal #userName").focus();
            L = 1
        }
        $("#TenTimes-Modal #register_button").removeAttr("disabled");
        R = false;
        $(".alert_name").show();
    }
    if((userid == null || userid == undefined || userid == "") && !validateEmail12345(email)  ) {
        $("#TenTimes-Modal #register_button").removeAttr("disabled");
        if (!L) {
            $("#TenTimes-Modal #userEmail").focus();
            L = 1
        }
        R = false;
        $(".alert_email").show();
    }
    if (!validateCity(city)) {
        if (!L) {
            $("#TenTimes-Modal #userCity").focus();
            L = 1
        }
        $("#TenTimes-Modal #register_button").removeAttr("disabled");
        I = false;
        $(".alert_city").show();

    }
    if (!validateDesignation(designation)) {
        if (!L) {
            $("#TenTimes-Modal").find("#TenTimes-Modal #userDesignation").focus();
            L = 1
        }
        R = false;
        $(".alert_designation").show();
    }
    if (!checkMobile()) {
        $("#TenTimes-Modal #register_button").removeAttr("disabled");
        if (!L) {
            $("#TenTimes-Modal").find("#userMobile").focus();
            L = 1
        }
        showError('mobile','Please specify a valid contact number');
        R = false
    }
    if (!R) {
        return R
    }
    if (!I) {
        return I
    }
    return R
}

function getEventCountry(I) {
    switch(pageType){
        case 'profile':
                //if(I === undefined) return 1 ;
                //return $(I).parent().parent().clone().children('address').find('span').text();
                return '' ;
        case 'about':
        case 'visitors':
        default:
            return $('#countryName').val();
    }
}
function inCountry(eventCountry) {
    var africaCountry = ['Angola','Burkina Faso','Burundi','Benin','Botswana','Democractic Republic Of Congo','Central African Republic','Congo','Cote D Ivoire','Cameroon','Cape Verde','Djibouti','Algeria','Egypt','Western Sahara','Eritrea','Ethiopia','Gabon','Ghana','The Gambia','Guinea','Equatorial Guinea','Guinea-Bissau','Kenya','Comoros','Liberia','Lesotho','Libya','Morocco','Madagascar','Mali','Mauritania','Mauritius','Malawi','Mozambique','Namibia','Niger','Nigeria','Reunion','Rwanda','Seychelles','Sudan','Sierra Leone','Senegal','Somalia','Sao Tome And Principe','Chad','Togo','Tunisia','Tanzania','Uganda','Mayotte','South Africa','Zambia','Zimbabwe','Ivory Coast','Gambia','Sao Tome And Princip'];
    for (var i = 0; i < africaCountry.length; i++) {
        if (africaCountry[i].toUpperCase() == eventCountry.trim().toUpperCase() ) {
            return true;
        }
    }
    return false;
}
function socialRegistration(I){
    //if( getEventCountry(I) != '' && !inCountry(getEventCountry(I)) && (getCookie('countryCode') == "NG" || getCookie('countryCode') == "GH") ){ // change it
    if( user.country.id == "NG" || user.country.id == "GH" || user.country.id == "PK"){ // change it
    //if(  getEventCountry(I) != '' && !inCountry(getEventCountry(I)) && getCookie('countryCode') == "IN" ){ // change it
        $('#TenTimes-Modal .material-form').hide();
        $('#TenTimes-Modal #dividerDiv').hide();
        $('#TenTimes-Modal .modal-dialog').removeClass('modal-740').addClass('modal-500');
        $('#TenTimes-Modal #socialDiv').removeClass('col-sm-4 col-md-4').addClass('col-md-offset-2 col-sm-8 col-md-8');
        $('#TenTimes-Modal #10TimesLoginButton').hide();
    }
}
function selectEventProfile(I){
    var eventHtml = '';
    if($('#modalData').html() == "")
        $('#modalData').html(getModal());
    $('#up').find('li').each(function( index ) {
        if(index < 2){

        if (index % 2 == 0) 
            eventHtml += '<div class="row">';
        disi = this;
        eventHtml += '<div class="col-md-6 col-sm-6"><div class="row"><div class="col-md-3 col-xs-3"><img class ="img-thumbnail" src="" alt="" data-src="" class="img-thumbnail"></div><div class="col-md-9 col-xs-9"><div class="row"><p><strong>'+$(this).find('h3').find('a').text()+'</strong><br><span class="text-muted ">'+$(disi).clone().children('div').find('#time').text()+'<br>'+$(disi).clone().children('address').find('span').text()+', '+$(disi).clone().children('address').find('b').text()+'</span><br><a class="text-orange text-underline" href="javascript:void(0);" onClick=oneClickConnect('+"'"+ 'a' +"'" +","+ ",'&source=connect_thank');"+'>Connect</a></p></div></div></div></div>';
        if (index % 2 != 0) 
            eventHtml += '</div>';
        }
    });
    if ($('#up').find('li').length % 2 != 0) 
        eventHtml += '</div>';
    $('#TenTimes-Modal .modal-body').html(eventHtml);
    $('#TenTimes-Modal').modal('show');
}
function followPage() {

if(pageType=='listing'){
customEventGA('Event', 'Follow', 'Event Listing | Page Follow');
}else{
gaEvent("Event","Page Follow");
}
    
    if(getCookie('user') && getCookie('user') != "")
    {
        $("#img_ldr").show();
        var followArray = {};
        
        if ($("#follow_content").attr("class") != "") followArray.follow_city = $("#follow_content").attr("class") ;
        if ($("#follow_content1").attr("class") != "") followArray.follow_country = $("#follow_content1").attr("class") ;
        if ($("#follow_content").attr("value") != "") followArray.event_type = $("#follow_content").attr("value") ;
        if ($("#follow_content1").attr("value") != "") followArray.follow_industry = $("#follow_content1").attr("value") ;
        followArray.one_click =  1 ;
        followArray.listing_id = $("#listingcombo_id").attr("value") ;
        followArray.user_id = getCookie('user') ;
        followArray.user_token = getCookie('user_token') ;
        followArray.action = 'follow' ;
        hitPageFollow(followArray) ;
    } else {        
        verifySigninTT('login','follow page');
    }
}
function unfollowPage(p_id,listing_id,event_type) {

if(getCookie('user') && getCookie('user') != "")
    {

        var followArray = {};
        // if ($("#follow_content").attr("class") != "") followArray.follow_city = $("#follow_content").attr("class") ;
        // if ($("#follow_content1").attr("class") != "") followArray.follow_country = $("#follow_content1").attr("class") ;
        // if ($("#follow_content").attr("value") != "") followArray.event_type = $("#follow_content").attr("value") ;
        // if ($("#follow_content1").attr("value") != "") followArray.follow_industry = $("#follow_content1").attr("value") ;
        followArray.event_type=event_type;
        followArray.one_click =  1 ;
        followArray.listing_id = listing_id;
        followArray.user_id = getCookie('user') ;
        followArray.user_token = getCookie('user_token') ;
        followArray.action = 'unfollow' ;
        //hitPageFollow(followArray) ;
         $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: followArray, // change it
            success: function(A) {
                hideloading();
                $('#following__pages_sub_'+ p_id).remove();
            }

            });

    } else {
        verifySigninTT('login','follow page');
    }
}
function hitPageFollow(data,nextData)
{
    showloading();
    $.ajax({
        type: "POST",
        url: site_url_attend + "/registeruser", // change it
        data: data,
        success: function(e) {
             $('#_modal_close').removeAttr("onclick");
            result = $.parseJSON(e);
            if(result.status==0 && typeof result.error.invalidData != 'undefined' && (typeof data.email != 'undefined' || typeof data.user_id != 'undefined') ) {
                $.each(result.error.invalidData, function( key, value ) {
                  if(value.what == 'account-deactivated'){
                    window.location.assign(site_url_attend + "/deactivation/"+result.userData.id);
                    return;
                  }
                });
            }
            pingUser(result);
            if(result.status==1 && result.userData.userExists==0)
                gaEvent("User","Registration");
            
            if(authorizeTenToken(result))
                {
                    deleteAllCookies();
                    followPage();
                    showAuthTokenMessage();
                    hideloading();
                    return true;
                }
            if(result.status == 1)setCookie('10T_last', new Date().getTime(), 24 * 60);
            $(".botton_haeding").css("width", "130px"),
            $("#img_ldr").hide(),
            $(".botton_haeding").html('<span class="left-triangle"></span>Following'),
            $(".botton_haeding").removeAttr("onclick"),
            $(".botton_haeding").css("cursor", "default");
            if(typeof nextData!='undefined' && nextData.hasOwnProperty('type') && nextData.type=='next'){
                getLoggedInDataN();
            }
            hideloading();
            if($('#modalData').html() == "")
                $('#modalData').html(getModal());
            $('#TenTimes-Modal .modal-dialog').removeClass('modal-500').addClass('modal-740');
            $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
            $('#TenTimes-Modal .modal-title').html('');
            var message = 'Thank you for following ';
            if(result.message == "already")
                message = 'You are already following ';
     
            $('#TenTimes-Modal .modal-title').html(message +($("h1").text()).trim()+'.<br><br><span style="color:#f36523;">We will keep you updated about '+($("h1").text()).trim()+'.</span>');              
            $('#TenTimes-Modal .modal-title').siblings('h5').remove();
            $('#TenTimes-Modal .modal-body').html('');
            $('#TenTimes-Modal').modal('show');
            $('#page-follow').addClass('dis-abled').attr('onclick', 'return false;');
            $("#subscribe").removeClass("text-white").addClass("text-blue").css({border:"1px solid","background-color":"transparent"}).attr("onclick","return false;").find(".fa").addClass("fa-check");
          },
        error: function(err) {alert("Sorry there was an error in the system. Try again.");hideloading();}
      });
}
function RegisterPageFollow(){
    showloading();
    var B = validateLoginData('pagefollow');
    hideloading();
    if (!B) {
        return false
    } else {
        var A = {};
        A.name = $("#TenTimes-Modal #userName").val();
        A.email = $("#TenTimes-Modal #userEmail").val();
        A.country = $("#TenTimes-Modal #userCountry").val();
        A.city = $("#TenTimes-Modal #userCity").val();
        A.place_id = $("#TenTimes-Modal #place_id").val();
        A.company = $("#TenTimes-Modal #userCompany").val();
        A.designation = $("#TenTimes-Modal #userDesignation").val();
        A.phone = $("#TenTimes-Modal #userMobile").val();
        A.source = $("#TenTimes-Modal #userSource").val();
        A.follow_city = $("#follow_content").attr("class") ;
        A.follow_country = $("#follow_content1").attr("class") ;
        A.event_type = $("#follow_content").attr("value") ;
        A.follow_industry = $("#follow_content1").attr("value") ;
        A.one_click =  0 ;
        A.listing_id = $("#listingcombo_id").attr("value") ;
        hitPageFollow(A) ;
        showloading();
    }
}
function callEngaze() {
    if(engazeFlag == 1)
    {
        signInTT('signup');
        $("#lcation").intlTelInput();
        $('#TenTimes-Modal #10TimesLoginButton').hide();
    }
}


function append_heart()
{

    $( ".evt_name" ).each(function( index )
    {
        if($( this ).hasClass('redheart'))
        {
            $( this ).after('<a data-toggle="tooltip" class="icon_hrt follow atnd_modal frg fa-heart" data-original-title="Follow &amp; Bookmark"></a>');
        }
        else
        {
            $( this ).after('<a data-toggle="tooltip" class="icon_hrt follow fa-heart-o atnd_modal" data-original-title="Follow &amp; Bookmark"></a>');
        }
    });

}



function onReady(){
    verifyTenToken();getPageType();getDeviceModel();change_status();hideShare();append_heart();change_watchnow();
    var current_url = window.location.href;
    var f = current_url.search("pop=show");
    if ("-1" == f) {
        var d = current_url.search("flag=0");
        if ("-1" == d) {
            var z = current_url.search("pop=approval");
               if("-1"== z){
                 var u = current_url.search("system_error");
                      if("-1"== u){
                        var c = current_url.search("flag=1");
                        if ("-1" == c) {
                            var b = current_url.search("pop=exceed");
                            "-1" != b && (oneClickEmailConnect = "exceed") && showConnectSuggestion("exceed")
                        } else {
                            oneClickEmailConnect = "1", showConnectSuggestion("exists")
                        }
                }else{
                    oneClickEmailConnect = "1", showConnectSuggestion("system_error")    
                }
            }else{
               oneClickEmailConnect = "1", showConnectSuggestion("alreadyReceived")    
            }
        } else {
            oneClickEmailConnect = "0", showConnectSuggestion("request-sent")
        }
    } else {
        oneClickEmailConnect = "show", showConnectSuggestion("true")
    }
    $("#loadingContent").html('<style>.loaders .loaders-bodys{background:rgba(51,51,51,.3);color:#333;padding:7px;z-index:100001;position:fixed;left:50%;top:50%;-webkit-transform: translate(-50%,-50%);}.loaders-overlay{background:#333;z-index:100000;opacity:.5;filter:alpha(opactiy=50);-ms-filter:"alpha(opacity=50)";-moz-opacity:.5;-khtml-opacity:.5}.loaders-elem-overlay,.loaders-overlay{height:100%;left:0;position:fixed;top:0;width:100%}.loaders .mediums .msgs{background:url("data:image/gif;base64,R0lGODlhGAAYAPQQAIaGhs7Ozvr6+uDg4LCwsOjo6I6OjsjIyJycnNjY2KioqMDAwPLy8nZ2dmhoaLi4uP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBwAQACwAAAAAGAAYAAAFriAkjiT0PGVaCgkJAKSgkkOzjI4zMoM8i4DGQJQTCQbDn2jRQABhkMKAoTqSDA3qSTQoxEYDg+FgVHhHgjOE1xsdxAjfTzotFRQGglJakJcYVEqCgyoBBAgIBAGDDHQFDIaIioyOgYSXAn6XIgULBGRzXZoJBAQLmil0lgWlLSIBlhBpO0g+s26nUWddXyoDC4sQCa5SsTMLC4EBwUdJPwwLzsu0qHYkw72bBWozIQAh+QQJBwAQACwAAAAAGAAYAAAFsCAkjiS0LGVaCgNpGGQgqGNhHGPTjI+T0KNXC6ITJRw7oOhgUIheT8dDJSiQEAaGCcVwAEgz0QChCIgEBGsNEWYMBmFIAIEgxGmFt5ZUeCBQQHkFd2CESoeIIwkLBAQLP4cMeQMFDIuNj4iSb5WJnmeGngwBC2aBlIQDJziHk3sQBSdDEHBgahButSKvEAkyuHuUYHgBkAVqebw0AQHBQyyzNKO3byNuoSS8x8OfwIchACH5BAkHABAALAAAAAAYABgAAAW4ICSOJHQcZVoKA4kgZCKoY4EEo2GMS9PSIgWiINKJBg0AcBRAPEQvaGOhEhBHBATDhGI0diOZqEAgJESCxbammEEeDQdOlCgv3DQBwOF4kgoLBChACA4GZ1V4KgxrS44pAwcLCwc/SwwFAwMFDJGTlY+YmpyPpSQCiqYiDAkBliqZBakFAQGIS5kDjQy1VxCyp76dA3iNvz+MR74QqSOdVwXQuo+abppo10ssjdkQnc0rf8vgl8YqIQAh+QQJBwAQACwAAAAAGAAYAAAFrCAkjiQUBGVaCgVJEOQgqGNBJCOCjIfR0qLXTycaGAzAUYKwCMIgCsOBxiAtCLMThGHYjWSiwmIxEAkO1RpWtAA0cMXxNCkwNBpNEiOwQAEVDQhlKgIzQAxpSYopBQknCT9JDwAODgAPjY+RQJOVl4ugoYssA5uMpYYjDAOliwWsiQKwNakQLKqsqbWvIohFm7V6rRAFP6+JQLlFg7KDQLKJrLjBKbvAor3IKiEAIfkECQcAEAAsAAAAABgAGAAABbUgJI4klCRlmhbkspCDoI7MMowEMQYIO4suhignKiAUv9FgEQC+IA9EUyUcHRayE4SB0Cll20DABwlURTXwwWC4FcWopADBPpQYiYB7RjAoyCUCYDMMZ0mHdwUDAwWGMwsGDQ0GCwyKjI4qkJKUiJ6faJkiAoqAKQgOBnE0i6YpAgAODg8jAotnBYMQpCMPDQ5TuySKoSKMJAm6rD4FzAOiJYtgi6PUcs9Kewwxh7rNJMqIhYchACH5BAkHABAALAAAAAAYABgAAAW0ICSOJDQMZZoy5HGQhaCOTFCMyzImxD2LgQALkhMVCITfqBBIiFyiBcGpku0CshNEQNAtrYLT0GQVMQ7WgAKBMp98Py4CESgJCgO4aoF46JUpAmWAhDR4eWM/BwgGBggHDIcFiTOLjY+FmZkMlCN3eUoKDWwlDG+AAgYNDV5bYl8wCFYLAA1UWzBtnBAMDgAkA4M0oBAFPgYOD4QnVloQCQ4NqANjzhAPDrczg8YkWJq8nSUhACH5BAkHABAALAAAAAAYABgAAAWtICSOJFQUZZoKZJKQqDoKAzMGwTgstiwOAxYEJ2IsFr4RYxBziQKLgUwoKkhNKMHiABPSaqMCFcLIiRIEQowMXE8X6RdJYHWnDoSFPVkSjPmARVZMPUkBBAgIBAEMgwWFPoeJi4GVlQyQc3VJBAYKV0ptfAIIBgZcIl+FYjAKQgemoGNWIg8PZA0GXSpLMQAAIggNSHxAQg4OPw3ASTSFyCMLDaBTJL8tf3y2fCEAIfkECQcAEAAsAAAAABgAGAAABa8gJI4kxDBlmgpkUZCoOgpDDA3DWAS2jLO3nCkQkMEGL4hLlAgkVy3hCSIIJGAznK0AFNFGg8XiycA9jQexcFZAGiGBBe/9FnTp+BGjjezJEgsEBAsJe2Z+KoCChHmNjVMqAm1nKQsID5RlbnUECAhFXlpeCGcFBEABCghrdwAOKGImBggtdyMPDgYiBroQCgYHeA0OVxANDSIFvHQJDg8jxyMHBpQlVSTLYLZ0sW8hACH5BAkHABAALAAAAAAYABgAAAW0ICSOJMQwZZoKZFGQrDoKAyoOw8gMsQzhMZyIlvOJdi+IS1SoyXrK4umWPM5wNiVUUC0EAtndoOpLfMkQ7tg4CCSyRpUAGq8fm2O4bHBYLA41eAV6Knx+gHaJR4QwdCMJBg4IRgcEC2gPDg4AjjALBAQJIwEODQ9DCmQMCzEJoEkCoiMGDSgHB2kIBC2dCw2TEAjADwgBdQANRQYGTAgKcQMNC7PMIgEIaCWxJMIkPIoQt3EhACH5BAkHABAALAAAAAAYABgAAAWtICSOJMQwZZoKZFGQrDoKAyoOw8gMsQzhMZyIlvOJdi+IS1SoyXrK4umWHM5wNiVUUN3xdLiqr+mENcWpM9TIbrshD4DDAXi0C4lAIFGIz+t3eXtob0ZTPgJrIwMIDQpGAQsBWSILDQ0GiiUHCwtFEAkNAAtDBGIMB0GdSTQkCAYoehACBKQ6MgcGjxAEBJUECW0GBkkICEy9bAUGByPGIwmmRq0jySMFmj6yRiEAIfkECQcAEAAsAAAAABgAGAAABbIgJI4kxDBlmgpkUZCsOgoDKg7DyAyxDOExnIiW84l2L4hLVKipBIlW8XRLDkcBR+MxKvQgAuuON3o4HICvqukkJQwOhLHplVGN+LxqYWg0DAt5DGwFDHx+gIKENnqNdzICaiMDCgYERgMBCYwiBwYGCJIlCQEBVgOfB0MLnAwBXaU2YSQEoRAJUQILqjoyAQhcEAuBEAELRUYKCEkElybDeAUIryLNk6xGNCTQXY0juHghACH5BAUHABAALAAAAAAYABgAAAWzICSOJMQwZVoKAVkUpKCSifOMwzAygzyLDUdClBMJij/Rw2EQvZwDVOpIAjhQJyJs5IMkGoCFEbE1lnm90aLRMHRnhZwUh2gokvHCm5RN+v8qBwgGBggHfwxxAwUMgoSGiIqMgJQifZUjBQ8IYj95ewEICAR7KYpzAwgKLRACB3OtOpY5PgJlEAukEEUsQ1wzCQSdB4deAbczBARbC50MAayeBL64nRAFAbBTt8R8mLuyPyEAOw==") 6% 50% no-repeat #fff;font-size:16px;padding:11px 15px 11px 40px}.loaders{display:none}ldg{background-position:right center!important}</style><div class="loaders" id="loading"><div class="loaders-bodys large mediums"><div class="msgs">Loading...</div></div><div class="loaders-overlay"></div></div>');
    $("#loadingContent_redirectmessage").html('<style>.loaders .loaders-bodys{background:rgba(51,51,51,.3);color:#333;padding:7px;z-index:100001;position:fixed;left:50%;top:50%;-webkit-transform: translate(-50%,-50%);}.loaders-overlay{background:#333;z-index:100000;opacity:.5;filter:alpha(opactiy=50);-ms-filter:"alpha(opacity=50)";-moz-opacity:.5;-khtml-opacity:.5}.loaders-elem-overlay,.loaders-overlay{height:100%;left:0;position:fixed;top:0;width:100%}.loaders .mediums .msgs{background:url("data:image/gif;base64,R0lGODlhGAAYAPQQAIaGhs7Ozvr6+uDg4LCwsOjo6I6OjsjIyJycnNjY2KioqMDAwPLy8nZ2dmhoaLi4uP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBwAQACwAAAAAGAAYAAAFriAkjiT0PGVaCgkJAKSgkkOzjI4zMoM8i4DGQJQTCQbDn2jRQABhkMKAoTqSDA3qSTQoxEYDg+FgVHhHgjOE1xsdxAjfTzotFRQGglJakJcYVEqCgyoBBAgIBAGDDHQFDIaIioyOgYSXAn6XIgULBGRzXZoJBAQLmil0lgWlLSIBlhBpO0g+s26nUWddXyoDC4sQCa5SsTMLC4EBwUdJPwwLzsu0qHYkw72bBWozIQAh+QQJBwAQACwAAAAAGAAYAAAFsCAkjiS0LGVaCgNpGGQgqGNhHGPTjI+T0KNXC6ITJRw7oOhgUIheT8dDJSiQEAaGCcVwAEgz0QChCIgEBGsNEWYMBmFIAIEgxGmFt5ZUeCBQQHkFd2CESoeIIwkLBAQLP4cMeQMFDIuNj4iSb5WJnmeGngwBC2aBlIQDJziHk3sQBSdDEHBgahButSKvEAkyuHuUYHgBkAVqebw0AQHBQyyzNKO3byNuoSS8x8OfwIchACH5BAkHABAALAAAAAAYABgAAAW4ICSOJHQcZVoKA4kgZCKoY4EEo2GMS9PSIgWiINKJBg0AcBRAPEQvaGOhEhBHBATDhGI0diOZqEAgJESCxbammEEeDQdOlCgv3DQBwOF4kgoLBChACA4GZ1V4KgxrS44pAwcLCwc/SwwFAwMFDJGTlY+YmpyPpSQCiqYiDAkBliqZBakFAQGIS5kDjQy1VxCyp76dA3iNvz+MR74QqSOdVwXQuo+abppo10ssjdkQnc0rf8vgl8YqIQAh+QQJBwAQACwAAAAAGAAYAAAFrCAkjiQUBGVaCgVJEOQgqGNBJCOCjIfR0qLXTycaGAzAUYKwCMIgCsOBxiAtCLMThGHYjWSiwmIxEAkO1RpWtAA0cMXxNCkwNBpNEiOwQAEVDQhlKgIzQAxpSYopBQknCT9JDwAODgAPjY+RQJOVl4ugoYssA5uMpYYjDAOliwWsiQKwNakQLKqsqbWvIohFm7V6rRAFP6+JQLlFg7KDQLKJrLjBKbvAor3IKiEAIfkECQcAEAAsAAAAABgAGAAABbUgJI4klCRlmhbkspCDoI7MMowEMQYIO4suhignKiAUv9FgEQC+IA9EUyUcHRayE4SB0Cll20DABwlURTXwwWC4FcWopADBPpQYiYB7RjAoyCUCYDMMZ0mHdwUDAwWGMwsGDQ0GCwyKjI4qkJKUiJ6faJkiAoqAKQgOBnE0i6YpAgAODg8jAotnBYMQpCMPDQ5TuySKoSKMJAm6rD4FzAOiJYtgi6PUcs9Kewwxh7rNJMqIhYchACH5BAkHABAALAAAAAAYABgAAAW0ICSOJDQMZZoy5HGQhaCOTFCMyzImxD2LgQALkhMVCITfqBBIiFyiBcGpku0CshNEQNAtrYLT0GQVMQ7WgAKBMp98Py4CESgJCgO4aoF46JUpAmWAhDR4eWM/BwgGBggHDIcFiTOLjY+FmZkMlCN3eUoKDWwlDG+AAgYNDV5bYl8wCFYLAA1UWzBtnBAMDgAkA4M0oBAFPgYOD4QnVloQCQ4NqANjzhAPDrczg8YkWJq8nSUhACH5BAkHABAALAAAAAAYABgAAAWtICSOJFQUZZoKZJKQqDoKAzMGwTgstiwOAxYEJ2IsFr4RYxBziQKLgUwoKkhNKMHiABPSaqMCFcLIiRIEQowMXE8X6RdJYHWnDoSFPVkSjPmARVZMPUkBBAgIBAEMgwWFPoeJi4GVlQyQc3VJBAYKV0ptfAIIBgZcIl+FYjAKQgemoGNWIg8PZA0GXSpLMQAAIggNSHxAQg4OPw3ASTSFyCMLDaBTJL8tf3y2fCEAIfkECQcAEAAsAAAAABgAGAAABa8gJI4kxDBlmgpkUZCoOgpDDA3DWAS2jLO3nCkQkMEGL4hLlAgkVy3hCSIIJGAznK0AFNFGg8XiycA9jQexcFZAGiGBBe/9FnTp+BGjjezJEgsEBAsJe2Z+KoCChHmNjVMqAm1nKQsID5RlbnUECAhFXlpeCGcFBEABCghrdwAOKGImBggtdyMPDgYiBroQCgYHeA0OVxANDSIFvHQJDg8jxyMHBpQlVSTLYLZ0sW8hACH5BAkHABAALAAAAAAYABgAAAW0ICSOJMQwZZoKZFGQrDoKAyoOw8gMsQzhMZyIlvOJdi+IS1SoyXrK4umWPM5wNiVUUC0EAtndoOpLfMkQ7tg4CCSyRpUAGq8fm2O4bHBYLA41eAV6Knx+gHaJR4QwdCMJBg4IRgcEC2gPDg4AjjALBAQJIwEODQ9DCmQMCzEJoEkCoiMGDSgHB2kIBC2dCw2TEAjADwgBdQANRQYGTAgKcQMNC7PMIgEIaCWxJMIkPIoQt3EhACH5BAkHABAALAAAAAAYABgAAAWtICSOJMQwZZoKZFGQrDoKAyoOw8gMsQzhMZyIlvOJdi+IS1SoyXrK4umWHM5wNiVUUN3xdLiqr+mENcWpM9TIbrshD4DDAXi0C4lAIFGIz+t3eXtob0ZTPgJrIwMIDQpGAQsBWSILDQ0GiiUHCwtFEAkNAAtDBGIMB0GdSTQkCAYoehACBKQ6MgcGjxAEBJUECW0GBkkICEy9bAUGByPGIwmmRq0jySMFmj6yRiEAIfkECQcAEAAsAAAAABgAGAAABbIgJI4kxDBlmgpkUZCsOgoDKg7DyAyxDOExnIiW84l2L4hLVKipBIlW8XRLDkcBR+MxKvQgAuuON3o4HICvqukkJQwOhLHplVGN+LxqYWg0DAt5DGwFDHx+gIKENnqNdzICaiMDCgYERgMBCYwiBwYGCJIlCQEBVgOfB0MLnAwBXaU2YSQEoRAJUQILqjoyAQhcEAuBEAELRUYKCEkElybDeAUIryLNk6xGNCTQXY0juHghACH5BAUHABAALAAAAAAYABgAAAWzICSOJMQwZVoKAVkUpKCSifOMwzAygzyLDUdClBMJij/Rw2EQvZwDVOpIAjhQJyJs5IMkGoCFEbE1lnm90aLRMHRnhZwUh2gokvHCm5RN+v8qBwgGBggHfwxxAwUMgoSGiIqMgJQifZUjBQ8IYj95ewEICAR7KYpzAwgKLRACB3OtOpY5PgJlEAukEEUsQ1wzCQSdB4deAbczBARbC50MAayeBL64nRAFAbBTt8R8mLuyPyEAOw==") 6% 50% no-repeat #fff;font-size:16px;padding:11px 15px 11px 40px}.loaders{display:none}ldg{background-position:right center!important}</style><div class="loaders" id="loading_redirect"><div class="loaders-bodys large mediums"><div class="msgs"> Redirecting to more events...</div></div><div class="loaders-overlay"></div></div>');

    loadOtherJs();
    showExhibitorList();
    if(typeof getUrlParameter('relation')!="undefined" && getUrlParameter('relation')=="visitors_meeting")
    mailResponseThankyou();
}

function wantRequest(I,flag,icon,item) {
    if($(I).attr('id') == "blockConnect")
    {
        eventData['id'] = $(I).parents().eq(2).find('h3').attr("id") ;
        eventData['event_edition_id'] = $(I).parents().eq(2).find('h3').attr("value") ;
    }
    else
    {
        eventData['id'] = $(I).closest('li').parents().eq(4).find('h3').attr("id") ;
        eventData['event_edition_id'] = $(I).closest('li').parents().eq(4).find('h3').attr("value") ;    
    }
    
    if(getCookie('user') && getCookie('user') != ""){
        var postData = { user_id:getCookie('user'), user_token:getCookie('user_token'), event_id: eventData.id};
        var data = {} ;
        data.icon = icon ;
        data.flag = flag ;
        data.item = item ;

        if(pageType=='dashboard_events')
        {
            postData.event_edition_id = eventData.event_edition_id ;
            postData.action = 'updateAttend' ;
            postData.source = 'dashboard_events' ;
            postData.user_token =  getCookie('user_token') ;
            postData.showme = flag ;
            if($(I).attr('id') == "blockConnect")
                $(I).parent().parent().find(".spinner_icon").show() ;
            else
                $(I).closest('li').parents().eq(3).find(".spinner_icon").show() ;
        }
        else
            return false;
        hitAuth(postData,'wantRequest','dashboard_events',data,I);
    }
    else
        return false;
}

function introduceRequest(I,flag,icon,item) {

        eventData['id'] = $(I).closest('li').parents().eq(4).find('h3').attr("id") ;
        eventData['event_edition_id'] = $(I).closest('li').parents().eq(4).find('h3').attr("value") ;    
  
    
    if(getCookie('user') && getCookie('user') != ""){
        var postData = { user_id:getCookie('user'), user_token:getCookie('user_token'), event_id: eventData.id};
        var data = {} ;
        data.icon = icon ;
        data.flag = flag ;
        data.item = item ;

        if(pageType=='dashboard_events')
        {
            postData.event_edition_id = eventData.event_edition_id ;
            postData.action = 'updateAttend' ;
            postData.source = 'dashboard_events' ;
            postData.user_token =  getCookie('user_token') ;
            postData.introduceme = flag ;

                $(I).parents().eq(3).find(".spinner_icon").show() ;
        }
        else
            return false;
        hitAuth(postData,'introRequest','dashboard_events',data,I);
    }
    else
        return false;
}

function wantRequestResponse(dis,result,data) {
    if(result.status == 1){
        showwantRequestThankyou(dis,data);
    }
    else
        return !1 ;
}
function showwantRequestThankyou(dis,data) {
    switch(data.flag){
        case '0' :
        
            if($(dis).attr('id') == "blockConnect")
            {
                var thank_msg=$(dis).closest('div').find('#thankyou_'+data.item);
                $(dis).parents().eq(2).find('#'+data.icon).show() ;
                $(dis).parent().find('.show-me').parent().html('<input class="show-me" type="checkbox" onclick="wantRequest(this,'+"'"+1+"'"+','+"'"+'blockConnect'+"','"+data.item+"'"+');"><span class="slider round"></span>');

            }
            else
            {
                var thank_msg=$(dis).closest('li').closest('div').find('#thankyou_'+data.item);
                $(dis).closest('ul').parent().find('#'+data.icon).show() ;
                $(dis).parent().find('.show-me').parent().html('<input class="show-me" type="checkbox" onclick="wantRequest(this,'+"'"+1+"'"+','+"'"+'blockConnect'+"','"+data.item+"'"+');"><span class="slider round"></span>');
               /* $(dis).closest('li').html('<a href="javascript:void(0);" id="liConnect" onclick="wantRequest(this,'+"'"+1+"'"+','+"'"+'blockConnect'+"','"+data.item+"'"+')"><i class="fa fa-envelope"></i> I want connect requests.</a>');*/
            }
            $(".spinner_icon").hide();
            thank_msg.css('color','#3c763d').text('You will not receive connect meeting requests.');
            break;
        case '1' :
        
            if($(dis).attr('id') == "blockConnect")
            {var thank_msg=$(dis).closest('div').find('#thankyou_'+data.item);
                $(dis).parents().eq(2).find('#'+data.icon).hide() ;
                $(dis).parent().find('.show-me').parent().html('<input class="show-me" type="checkbox" onclick="wantRequest(this,'+"'"+0+"'"+','+"'"+'blockConnect'+"','"+data.item+"'"+');" checked><span class="slider round"></span>');
            }
            else
            {var thank_msg=$(dis).closest('li').closest('div').find('#thankyou_'+data.item);
                $(dis).closest('ul').parent().find('#'+data.icon).hide() ;
                $(dis).parent().find('.show-me').parent().html('<input class="show-me" type="checkbox" onclick="wantRequest(this,'+"'"+0+"'"+','+"'"+'blockConnect'+"','"+data.item+"'"+');" checked><span class="slider round"></span>');
                /*$(dis).parent().html('<a href="javascript:void(0);" id="liConnect" onclick="wantRequest(this,'+"'"+0+"'"+','+"'"+'blockConnect'+"','"+data.item+"'"+')"><i class="fa fa-envelope"></i> I do not want connect requests.</a>');*/
            }
            thank_msg.css('color','#3c763d').text("You can now receive connect meeting requests.");
            $(".spinner_icon").hide();
            break;
        default:
            break;
    }
}

function introRequestResponse(dis,result,data) {
    if(result.status == 1){
        introwantRequestThankyou(dis,data);
    }
    else
        return !1 ;
}
function introwantRequestThankyou(dis,data) {
    switch(data.flag){
        case '0' :
                var thank_msg=$(dis).closest('li').closest('div').find('#thankyou_'+data.item);
                $(dis).closest('ul').parent().find('#'+data.icon).show() ;
                $(dis).parent().find('.intro-me').parent().html('<input class="intro-me" type="checkbox" onclick="introduceRequest(this,'+"'"+1+"'"+','+"'"+'blockIntro'+"','"+data.item+"'"+');"><span class="slider round"></span>');
               /* $(dis).closest('li').html('<a href="javascript:void(0);" id="liConnect" onclick="wantRequest(this,'+"'"+1+"'"+','+"'"+'blockConnect'+"','"+data.item+"'"+')"><i class="fa fa-envelope"></i> I want connect requests.</a>');*/
      
            $(".spinner_icon").hide();
            thank_msg.css('color','#3c763d').text('Now, you will not be introduced to any event-goer.');
            break;
        case '1' :
        
        var thank_msg=$(dis).closest('li').closest('div').find('#thankyou_'+data.item);
                $(dis).closest('ul').parent().find('#'+data.icon).hide() ;
                $(dis).parent().find('.intro-me').parent().html('<input class="intro-me" type="checkbox" onclick="introduceRequest(this,'+"'"+0+"'"+','+"'"+'blockIntro'+"','"+data.item+"'"+');" checked><span class="slider round"></span>');
                /*$(dis).parent().html('<a href="javascript:void(0);" id="liConnect" onclick="wantRequest(this,'+"'"+0+"'"+','+"'"+'blockConnect'+"','"+data.item+"'"+')"><i class="fa fa-envelope"></i> I do not want connect requests.</a>');*/
          
            thank_msg.css('color','#3c763d').text("Now, you will be introduced to event-goer.");
            $(".spinner_icon").hide();
            break;
        default:
            break;
    }
}

function loadOtherJs() {
    if(pageType=="homepage") {
        if(deviceModel == '1') {
          addLoadEvent(function() {
            if($('#left-box').height() > $('#right-box').height()) {
              $('#collections_box').height($('#collections_box').height() + $('#left-box').height()-$('#right-box').height());            
            }
          });
        }
       
    }
}
$(function() {
  onReady();
});

function callChartLoad()
{   
    if($('.spread_tab li.active a').attr('href')=='#global')
    {
      google.charts.setOnLoadCallback(Visitorbycountrymap);
    }
    else if($('.spread_tab li.active a').attr('href')=='#home')
    {
          google.charts.setOnLoadCallback(Visitorbycitychart);                        
    }
}
function loadFbScript(from,value){
    if(fbLoadFlag==0){
       if(user.country.id != "CN"){
        var i = document.createElement("script");
        i.type = "text/javascript", i.src = "//connect.facebook.net/en_US/sdk.js", i.onload = function(){fbLoadFlag=1;startInitFb();callEngaze();
            if(from=='login'){
               fbLogin_combined(value); 
            }
            else if(from=='fbLogin'){
               fbLogin(value); 
            }
        } , document.body.appendChild(i);
        } 
    }
    else if(from=='fbLogin')
        fbLogin(value);
    
}
   /*Jquery used when clicking on tab for making a country,city map*/
    $('a[href="#home"]').on('shown.bs.tab', function (e) 
        {
          if(jsloaded == 1 && city_chart!=1)
          {
             callChartLoad();
          }
           
        });
      
   $('a[href="#global"]').on('shown.bs.tab', function (e) {
        if(jsloaded == 1 && country_map!=1)
        {
             callChartLoad();
        }
    
     }); 






function organizerResponse(data,dis)
{  
    if(data.status == 1)
    {   
      
        if(typeof companyFollowCallback=='function'){
            
            companyFollowCallback(data,dis);
            return true;
        }
        if($(OrganizerData.ths).html() != undefined && $(OrganizerData.ths).html().search("fa-heart-o") >-1 && $(OrganizerData.ths).html().search("follow") < 0 && $(OrganizerData.ths).html().search("Follow") < 0){
            $(OrganizerData.ths).html('<i class="fa fa-heart text-orange"></i>');
        }
        else{
            if(pageType == 'company-country' || pageType == 'company' || pageType == 'about'){
                $(OrganizerData.ths).html('<small><i class="fa fa-check"></i> Following</small>');
            }
            else{
                $(OrganizerData.ths).html('<i class="fa fa-check"></i> Following');    
            }
        }

        if(pageType == 'company-country' || pageType == 'company'){
            $(OrganizerData.ths).removeAttr( "onclick");
            $(OrganizerData.ths).css({"pointer-events":"none","text-decoration":"none","font-size": "medium"});
            $(OrganizerData.ths).css("color","gray");
            showThankyouOrganizer(data.message);
        }else
        { 
            $(OrganizerData.ths).prop( "onclick",null);
            $(OrganizerData.ths).addClass( 'disabled');
            showThankyouOrganizer(data.message);
        }
    }
    else
    {
        if(data.status == 0 && data.hasOwnProperty('error') && data.hasOwnProperty('userData') && data.userData.hasOwnProperty('id') && data.error.hasOwnProperty('invalidData')){

            alert("some error");
        }
        else{
            showApiError(data);
        }
    }
    
}

function showThankyouOrganizer(message){
    if($('#modalData').html() == "")
        $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
    $('#TenTimes-Modal .modal-title').html('');
    var data = {
                  pageType:pageType,
                  for:'organizer_follow',
                  Organizername:OrganizerData.name,
                  OrganizerId:OrganizerData.id
                  
            };
    var messageHtml='';
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax/modaldata",
        data:data,
        success: function(n) {
             messageHtml=$.parseJSON(n);
             if(message == "already")
                $('#TenTimes-Modal .modal-title').html(messageHtml.message1);
            else
                $('#TenTimes-Modal .modal-title').html(messageHtml.message2);
            
            $('#TenTimes-Modal .modal-title').siblings('h5').remove();
            followm(OrganizerData.id,OrganizerData.name,messageHtml.organizerData);
            if(messageHtml.organizerData['organizer']>3 || messageHtml.organizerData['visitor']>3 || messageHtml.organizerData['exhibitor']>3)
            $('#TenTimes-Modal .modal-body').html('<p class="text-center"><span class="fa fa-refresh fa-spin"></span></p>');
            $('#TenTimes-Modal').modal('show');

           },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
       });
    
    // consentup(10);
}


function followOrganizer(dis,org_id,source){
    if(source=='company-gateway')
    {
        customEventGA('Company','Follow','Company|Listing|Follow');
    }
    if(source=='organizer')
    {
        customEventGA('Company','Follow','EventDetail|About|Organizer|Follow Company');
    }
    if(dis!=''){
        callGaEvent("follow"); 
    }
    org_msg=1;
    if( (source=='company-gateway' || source == 'organizer') && typeof dis=="string" && dis==""){
        dis=OrganizerData.ths;
    }
    
    getOrganizerData(dis,org_id);
    if(getCookie('user') && getCookie('user') != "")
    {
        showloading(); 
        var data = { 
            user:'id_'+getCookie('user'),
            entity:'company_'+org_id,
            source:'organizer',
            action:'company_follow'
           };
        hitAuth(data,'oneClickOrganizerFollow',source,'',dis);
    }
    else
    {
         verifySigninTT('login',source);       
    }
}

function unfollow(dis,org_id,source){

    //alert("id is "+org_id);
    org_msg=1;
    if( (source=='company-gateway' || source == 'organizer') && typeof dis=="string" && dis==""){
        dis=OrganizerData.ths;
    }
    getOrganizerData(dis,org_id);
    if(getCookie('user') && getCookie('user') != "")
    {
        //showloading();
        var data = {
            user:'id_'+getCookie('user'),
            entity:'company_'+org_id,
            source:'organizer',
            action:'company_unfollow'
           };
           $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: data,async: true, // change it
            beforeSend: function(){},
            ajaxSend: function(){},
            complete: function(){},
            success: function(A) {
                hideloading();
                $('#following__company_sub_'+ org_id).remove();
            }

            });

        //hitAuth(data,'oneClickOrganizerUnfollow',source,'',dis);
    }
    else
    {
         verifySigninTT('login',source);
    }

}

function followVenue(dis,v_id,source)
{
    if(dis!="")
        callGaEvent("follow"); 
    getVenueData(dis);
    if(getCookie('user') && getCookie('user') != ""){
        showloading(); 
        var data = { entity: 'venue_'+v_id, source:source, action:'venue_follow'};
        hitAuth(data,'oneClickVenue',source,'',dis);
    }else{
        verifySigninTT('login',source); 
    }
}
function unfollowVenue(dis,v_id,source){

    //alert("id is "+org_id);
    getVenueData(dis);
    if(getCookie('user') && getCookie('user') != ""){
        //showloading();
        var data = { entity: 'venue_'+v_id, source:source, action:'venue_unfollow'};
        //hitAuth(data,'oneClickVenueUnfollow',source,'',dis);
         $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: data,async: true, // change it
            beforeSend: function(){},
            ajaxSend: function(){},
            complete: function(){},
            success: function(A) {
                hideloading();
                $('#following__venues_sub_'+ v_id).remove();
            }

            });
    }else{
        verifySigninTT('login',source);
    }
}

function getVenueData(dis)
{
    if(pageType=='venue_detail'){
        if (dis.getAttribute("data-source") == 'similar_venues') 
        {
            venueData["id"]=dis.getAttribute("data-id");
            venueData["name"]=dis.getAttribute("data-venue_name");
        }
        else if (dis.getAttribute("data-source") == 'compare_venues') 
        {
            venueData["id"]=dis.getAttribute("data-id");
            venueData["name"]=dis.getAttribute("data-venue_name");
        }
        else
        {
            venueData["id"]=$(dis).parent().parent().parent().parent().find('h1').attr('id');
            venueData["name"]=$(dis).parent().parent().parent().parent().find('h1').text();
        }
    }
    if(pageType=='venueListing'){
        if (dis.getAttribute("data-source") == 'compare_venues') 
        {
            venueData["id"]=dis.getAttribute("data-id");
            venueData["name"]=dis.getAttribute("data-venue_name");
        }
        else{
            venueData["id"]=$(dis).parent().parent().parent().find('h2').attr('id');
            venueData["name"]=$(dis).parent().parent().parent().find('h2').text();
        }
        
    }
    venueData["dis"]=dis;   
}

function venueResponse(result,dis) {
    //console.log(result);
    if(result.status == 1){
        //console.log(speakerData.dis);
        $(venueData.dis).html($(venueData.dis).html().replace('Follow','Following'));
        //$(venueData.dis).removeClass('btn-grey').addClass('btn-orange');
        $(venueData.dis).parent().find('.heart').prop( "onclick",null);
        $(venueData.dis).prop( "onclick",null);
        if(!$(dis).data().hasOwnProperty("flag"))
            showThankyouVenue(result.message);
        else{
            $(dis).removeData("flag");
        }
        getLoggedInDataN(); 
    }
    else{
        if(result.status == 0 && result.hasOwnProperty('error') && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('id') && result.error.hasOwnProperty('invalidData')){
            showloading();
             var flagmobile=0;
          for(var i=0;i<result.error.invalidData.length;i++){
           var match_string=result.error.invalidData[i].what.toLowerCase();
            if(match_string=='phone'){
                $('#userMobile').siblings('.alert_mobile').show();
                $('#userMobile').siblings('.alert_mobile').html(result.error.invalidData[i].why);
                 $('#userMobile').siblings('.alert_mobile').css('color','#ae4b00');
                 hideloading();  
                flagmobile=1;
              }           
            }
         if(flagmobile==0){
            vcardopen(result.userData.name,$("#TenTimes-Modal #userEmail").val(),result.userData.designation,result.userData.userCompany,result.userData.cityName,result.userData.countryName,'','',result.userData.profilepicture,'');
            hideloading();
          }
        }
        else{
            showApiError(result);
            //alert("Sorry there was an error in the system.");
        }
    }
}

function showThankyouVenue(message){
    if($('#modalData').html() == "")
        $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
    $('#TenTimes-Modal .modal-title').html('');
     var data = {
                  pageType:pageType,
                  for:'venue_follow',
                  venuename:venueData.name
            };
    var messageHtml='';
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax/modaldata",
        data:data,
        success: function(n) {
             messageHtml=$.parseJSON(n);
             if(message == "already")
                $('#TenTimes-Modal .modal-title').html(messageHtml.message1);
            else
                $('#TenTimes-Modal .modal-title').html(messageHtml.message2);
            
            $('#TenTimes-Modal .modal-title').siblings('h5').remove();
            $('#TenTimes-Modal .modal-title').siblings('span').remove();
            $('#TenTimes-Modal .modal-body').html('');
            $('#TenTimes-Modal').modal('show');
           },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
       });
    
    // consentup(10);
}

function registerVenueFollower(source,v_Id)
{
    showloading();
    var B = validateLoginData(source);
    hideloading();
    if (!B) {
        return false
    } else {
            var A = {};
            A.entity = "venue_"+v_Id;
            A.name = $("#TenTimes-Modal #userName").val();
            A.email = $("#TenTimes-Modal #userEmail").val();
            A.userid = $("#TenTimes-Modal #userId").val();
            A.country = $("#TenTimes-Modal #userCountry").val();
            A.city = $("#TenTimes-Modal #userCity").val();
            A.place_id = $("#TenTimes-Modal #place_id").val();
            A.company = $("#TenTimes-Modal #userCompany").val();
            A.designation = $("#TenTimes-Modal #userDesignation").val();
            A.phone = $("#TenTimes-Modal #userMobile").val();
            A.phoneCode = $("#TenTimes-Modal .phone_code_value").attr('value');
            A.source = 'venue_detail';
            A.action = 'venue_follow';
            showloading();
            if(typeof venueData !='undefined' && venueData.dis.text=='Contact') {
                hitAuth(A,'venue_contact',$("#TenTimes-Modal #userSource").val(),'','');
            }else{
                hitAuth(A,'venue_follow',$("#TenTimes-Modal #userSource").val(),'','');
            }
            hideloading();
    }
}

function getOrganizerData(dis,organizer_id = null)
{  
    if(pageType=='VenueCityListing'||pageType=='venueListing'){
        OrganizerData['id']=$(dis).parent().parent().find('h2').attr('id');
        OrganizerData['name']=$(dis).parent().parent().find('h2').attr('value');
    }
    else if(pageType == 'company' || pageType == 'company-country')
    {
        OrganizerData['id']=$(dis).closest("tr").find(".box-link").find("strong a").data("id");
        if(pageType == 'company')
        OrganizerData['name']=$(dis).attr("data-name");
        else
        OrganizerData['name']=$(dis).closest("tr").find(".box-link").find("strong a").html();
    }
    else if(pageType == 'about')
    {
        // OrganizerData['id']=$(dis).attr('value');
        OrganizerData['id']=organizer_id;
        OrganizerData['dis']=dis;
    }
    else{
        OrganizerData['id']=$('h1').attr('id');
        OrganizerData['name']=$('h1').html();
        if(dis != "")
        OrganizerData['dis']=dis;           
    }
    OrganizerData['ths']=dis;
}

function registerOrgFollower(source,orgId)
{
    showloading();
    var B = validateLoginData(source);
    hideloading();
    if (!B) {
        return false
    } else {
        var A = {};
        A.entity_id = orgId;
        A.name = $("#TenTimes-Modal #userName").val();
        A.email = $("#TenTimes-Modal #userEmail").val();
        A.userid = $("#TenTimes-Modal #userId").val();
        A.country = $("#TenTimes-Modal #userCountry").val();
        A.city = $("#TenTimes-Modal #userCity").val();
        A.place_id = $("#TenTimes-Modal #place_id").val();
        A.company = $("#TenTimes-Modal #userCompany").val();
        A.designation = $("#TenTimes-Modal #userDesignation").val();
        A.mobile = $("#TenTimes-Modal #userMobile").val();
        A.source = $("#TenTimes-Modal #userSource").val();
        A.action = 'organizer_follow';
        showloading();
        hitAuth(A,'organizer_follow',$("#TenTimes-Modal #userSource").val(),'','');
        hideloading();
    }
}

function contact_organizer(dis)
{  
    if($('#myModal_v').is(':visible'))
    {
        $('#myModal_v').modal('toggle'); 
    }
    callGaEvent("enquiry");
    if(pageType.search(/venue/)>-1 || pageType.search(/Venue/)>-1){
        getVenueData(dis);
    }
    org_msg=1;
    // c(dis);
    if(getCookie('user') && getCookie('user') != "")
    {
        if(pageType.search(/venue/)>-1 || pageType.search(/Venue/)>-1){
            venueEnquiryModal();
        }
        else {
            showMessage1();
        }
        
        
    }
    else
    {
       verifySigninTT('login','signup');
    }
}
function ConnectRegisterForm1() {
    $("#phoneDiv").show();
    $("#aiDiv").show();
    if($.trim($("#TenTimes-Modal #userCompany").val()) == "" && $.trim($("#TenTimes-Modal #userDesignation").val()) == "" )
        $("#checkDiv").show();
    if(!$("#TenTimes-Modal #individualCheckBox").is(":checked") && $.trim($("#TenTimes-Modal #userCompany").val()) == "")
        $("#desiDiv").show();

    var B = validateFormData('connect');
    if (!B) {
        return false
    } else {
        showloading();
        var aiValue = 0;
        if($("#TenTimes-Modal #aiCheckBox").is(":checked")) // change
            aiValue = 1;
        var data = {
           
            user_id: $("#TenTimes-Modal #userId").val(),
            metadata: $("#TenTimes-Modal #userMetadata").val(),
            name: $("#TenTimes-Modal #userName").val(),
            designation: $("#TenTimes-Modal #userDesignation").val(),
            company: $("#TenTimes-Modal #userCompany").val(),
            city: $("#TenTimes-Modal #userCity").val(),
            place_id: $("#TenTimes-Modal #place_id").val(),
            country: $("#TenTimes-Modal #userCountry").val(),
            email: $("#TenTimes-Modal #userEmail").val(),
            phone: $("#TenTimes-Modal #userMobile").val(),
            phoneCode: $("#TenTimes-Modal #phoneCode").html(),
            source: $("#TenTimes-Modal #userSource").val(),
            HTTP_REFERER: location.href,
            facebookId: $("#TenTimes-Modal #userFacebookId").val(),
            linkedinId: $("#TenTimes-Modal #userLinkedinId").val(),
            individual: $("#TenTimes-Modal #individualCheckBox").is(":checked"),
            action:'signup',
        };
        hitAuth(data,'signup',$("#TenTimes-Modal #userSource").val(),'','');
    }
}

function showMessage1() {
    if($('#modalData').html() == "")
        $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
    
    
    var data = {
                  pageType:pageType,
                  for:'message',
            };
    var messageHtml='';
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax/modaldata",
        data:data,
        success: function(n) {
             messageHtml=$.parseJSON(n);
             $('#TenTimes-Modal .modal-title').html(messageHtml.title);
                $('#TenTimes-Modal .modal-body').html(messageHtml.mainHtml);
                $('#TenTimes-Modal').modal('show');
                removeBackdropModal();
           },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
       });
    
}
function venueEnquiryModal() {

    if($('#modalData').html() == "")
        $('#modalData').html(getModal());
    $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
    var messageHtml = '';
    var data = {
                  pageType:pageType,
                  for:'venueEnquiryModal',
                  script:'desktop'
            };
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax/modaldata",
        data:data,
        success: function(n) {
             messageHtml=$.parseJSON(n);
                $('#TenTimes-Modal .modal-title').html(messageHtml.title);
                $('#TenTimes-Modal .modal-body').html(messageHtml.mainHtml);
                $('#TenTimes-Modal').modal('show');
                $('#unit_select').change(function() {
                    if($(this).val() == "sq. mtr") {
                        $('#unit_data').html(messageHtml.sq_meter1);
                    }
                    else {
                        $('#unit_data').html(messageHtml.sq_meter2);
                    }
                });
                removeBackdropModal();
                venueBookingDate(); 
                return true;
           },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
       });
    
}
function venueBookingDate() {

    $("head").append("<link>");
    var css = $("head").children(":last");
    css.attr({
      rel:  "stylesheet",
      type: "text/css",
      href: "https://c1.10times.com/css/daterangepicker.css"
    });
    $.getScript( "https://c1.10times.com/js/moment.js", function() {
        $.getScript( "https://c1.10times.com/js/daterangepicker.js", function() {  
            $("#booking_date").focus ( function(){
                $('#booking_date').daterangepicker({
                    singleDatePicker: true,
                    autoUpdateInput: false,
                    minDate:moment(),
                    locale: {
                        format: "YYYY/MM/DD"
                    }
                });
                $('#booking_date').on('apply.daterangepicker', function(ev, picker) {
                   $('#booking_date').val(picker.startDate.format('YYYY/MM/DD'));   
                });
             });

        });
    });
}
function submitOrgMessageNew() {
    var validateFlag = 1;
    messageData = {};
    $.each($("#TenTimes-Modal .main_data"), function(key,val) {
        var tempValue  = $(val).find('.10t_comm1').val();
        if(tempValue == 'Space Required' || tempValue == 'Preferred Date') {
            tempValue = '';
        }
        if(tempValue.search('Select Event') > -1  || tempValue.search('Estimated Visitors') > -1 || $(val).find('textarea').val()=="") {
            validateFlag =0;
            $(val).find('.alert_error').removeClass('dis-non');
        }
        else {
            if($(val).find('#Date_flexible').length > 0) {
                messageData['Date Flexibility'] = 0;
                if($(val).find('.10t_comm1').prop('checked') ==true)
                messageData['Date Flexibility'] = 1;   
            }
            else {
                if(tempValue) {
                    $(val).find('label').find('span').remove();
                    var title = $(val).find('label').text();
                    if(title == 'Space Required') {
                        tempValue = tempValue+' '+$("#unit_select").val();   
                    }
                    messageData[title] = tempValue;    
                    $(val).find('.alert_error').addClass('dis-non');
                }
            }
        }
    });
    messageData= JSON.stringify(messageData);
    if(validateFlag ==1)
        submitOrgMessage(messageData)
    else 
        return false;
}
function submitOrgMessage(message)
{
     var e_type='';
    if(pageType=='org_detail')
        e_type='company';
    else if(pageType== 'venue_detail' || pageType=='VenueCityListing' || pageType=='venueListing')
        e_type='venue';

    if(!message)
    var message = $.trim($("#TenTimes-Modal #message-body").val());
    if(message==""){
         $("#TenTimes-Modal .alert_message").removeClass('dis-non');
          return false;
    }
    if (pageType== 'VenueCityListing' ||pageType=='venueListing') {
        var entity_id=OrganizerData['id'];
    }else{
        var entity_id=$('h1').attr('id');    
    }
    var data = {
                user_id: getCookie("user"),
                user_token:getCookie('user_token'),
                message: message,
                entity_id:entity_id,
                action:'enquiry',
                entity_type:e_type,
                source: "web",
            };
    $.ajax({
        type: "POST",
        url: site_url_attend+'/ajax/enquiry',
        data: data,
        success: function(result){
            var status=JSON.parse(result);
            //console.log(result);
        hideloading();

        if(status['status']==1)
        {
            if(pageType.search(/venue/)>-1 || pageType.search(/Venue/)>-1)
               gaEvent("Goal","Venue Enquiry");  
            else
                gaEvent("Goal","Company Enquiry");

            showThankyouorg(status);
           
        }
        else
        {
            alert("Sorry...!!! There is some error, try after some time");
        }
        },
        error: function(err) 
        {
            alert("Sorry there was an error in the system. Try again.");
        }
    });
}





































function showThankyouorg()
{
        if($('#modalData').html() == "")
        $('#modalData').html(getModal());

    $('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
    $('#TenTimes-Modal .modal-dialog').addClass('modal-740');
    $('#TenTimes-Modal .modal-title').replaceWith(function() { return "<h3 class='modal-title' id='myModalLabel'"+">" + this.innerHTML + "</h3>"; });
    $('#TenTimes-Modal .modal-title').html('');
     var data = {
                  pageType:pageType,
                  for:'showThankyouOrg',
                  Organizername:OrganizerData.name
            };
            var messageHtml='';
            $.ajax({
                type: "POST",
                url: site_url_attend + "/ajax/modaldata",
                data:data,
                success: function(n) {
                     messageHtml=$.parseJSON(n);
                     if(pageType=='venue_detail')
                        $('#TenTimes-Modal .modal-title').html(messageHtml.venue_detail);
                    else
                        $('#TenTimes-Modal .modal-title').html(messageHtml.organizer);
                    $('#TenTimes-Modal .modal-title').siblings('h5').remove();
                    $('#TenTimes-Modal .modal-title').siblings('span').remove();
                    $('#TenTimes-Modal .modal-body').html('');
                    $('#TenTimes-Modal').modal('show');
                    // consentup(10);
                    // $(eventData.dis).html($(eventData.dis).html().replace('Follow','Following'));
                    // // $(eventData.dis).html($(eventData.dis).html().replace('Attend','Attending'));
                    // if(pageType == 'dashboard_events')
                    // {
                    //     $(eventData.dis).prop( "onclick",null);          
                    // }
                    // else if (typeof only_thankyou!=='undefined' && only_thankyou==1)
                    // {
                    //     $(eventData.dis).prop( "onclick",null);          
                    // }
                    // else
                    // {
                    //     $(eventData.dis).prop( "onclick",null).removeClass('fa-heart-o').addClass('fa-heart').css('color','#fb6d01');
                    // }
                   },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
               });
}







/* start flagerror function */

function flag_error()
{
        if($('#modalData').html() == "")
        $('#modalData').html(getModal());
        $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
        $('#TenTimes-Modal .modal-dialog').addClass('modal-500');


        var data = {
                  pageType:pageType,
                  for:'flagerror_organizer',
            };
        var messageHtml='';
        $.ajax({
            type: "POST",
            url: site_url_attend + "/ajax/modaldata",
            data:data,
            success: function(n) {
                    messageHtml=$.parseJSON(n);
                    $('#TenTimes-Modal .modal-title').html(messageHtml.title);
                    $('#TenTimes-Modal .modal-body').html(messageHtml.mainHtml);
                    // var message = " I would like to meet you during this event";
                    // $('#TenTimes-Modal #message-body').val(message);
                    $('#TenTimes-Modal').modal('show');
               },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
           });
           
}

function submitError()
{
    var x=validateLoginData('signup');
    if(!validateMessage())
        return false;

    if (!x) {
        return false
    }
    else
    {
         var data = {

            name: $("#TenTimes-Modal #userName").val(),
            email: $("#TenTimes-Modal #userEmail").val(),
            message:$('#TenTimes-Modal #message-body').val(),
            org_name:$('h1').html()
        };
        $.ajax({   
        type: "POST",
                  url:site_url_attend+"/ajax/error_report",
                data: data,
                success:function(result)
                {
                    var a =JSON.parse(result);
                    if(a.success==true)
                    {
                        $('#TenTimes-Modal').modal('hide');
                    }
                    else
                    {
                        alert("SORRY...!!! Please try after some time");
                    }
                },
                error: function(D, B, C)
                {
                    alert("SORRY...!!! Please try after some time");
            }
    });

    }




   
}
function hideShare()
{
    if(pageType=='org_detail' || pageType=='venue_detail')
            $('.header_padding').find('.share_top').hide();
    switch(pageType){
        case 'not_login' :
            $('.header_padding').find('.share_top').hide();
            $('#shareHide').hide();
            $('#loginHide').hide();
            $('#loginHide2').hide();
            $('#notificationBell').hide();
        break;
        case 'exhibitors' :
            // $('#product_name').searchableOptionList({
            //     showSelectAll: false
            // });
            //suggestFilter() ;


            if(window.location.href.search("quest=1") > -1 && (getParameterByName('sender') || getCookie('user')!='') ) {
                callQuestionJsandCss();
            }
            // else if(getCookie('user')!='' && (getEventId()=='142646' || getEventId()=='7339')){
            //     callQuestionJsandCss(); 
            // }
        break;
    }
}
var didi = '' ;
var showfilter = 2 ;
function suggestFilter(){
    //return 1 ;
    var sender = '' ;
    if(getCookie('user') && getCookie('user') != "")
        sender = getCookie('user') ;
    else if(getParameterByName('sender'))
        sender = getParameterByName('sender') ;
    if(sender == "" ){
        $('#show_data').removeClass('hide');    
        $('#filter_spinner').addClass('hide');
        return false ;
    }
    var callIndustry = '' ;
    $.ajax({
        type: "GET",
        url: site_url_attend+'/ajax?for=answers&sender='+sender+'&event='+getEventId()+'&edition='+$("#eventEdition").val(), // change it
        beforeSend: function(){},
        success: function(result){
            var result = JSON.parse(result);
            didi = result ;
            if(result.status==1){
                var productList = [] ;
                var industryList = [] ;
                var selectedProduct = [] ;
                var selectedIndustry = [] ;
                $('#product_name').children().each(function(i) { 
                    productList[$(this).text().toLowerCase()] =  $(this).attr('data-product-id');
                });
                $('button[data-filter-type=industry]').siblings('ul').children('li').has('a').each(function(i) { 
                    industryList.push($(this).text().toLowerCase()) ;
                });
                Object.keys(result.answers).forEach(function(key) {
                    // console.log(key, result.answers[key]);
                    var explodeAns = result.answers[key].split(',') ;
                    for (var i = 0; i < explodeAns.length; i++) {
                        explodeAns[i] = explodeAns[i].toLowerCase();
                        if(industryList.indexOf(explodeAns[i]) > -1 ){
                            selectedIndustry.push(explodeAns[i]) ;
                            $('.industry_name').html(explodeAns[i]);
                            callIndustry = 1 ;
                            showfilter = 1 ;
                        }
                        if(productList.hasOwnProperty(explodeAns[i])){
                            selectedProduct.push(explodeAns[i]) ;
                            $('.sol-selection input[value="'+explodeAns[i]+'"]').attr('checked',true).trigger("change");
                            callIndustry = 2 ;
                            showfilter = 1 ;
                        }
                        var cat_prod = explodeAns[i].split('-');
                        if(typeof cat_prod[0] != "undefined" && $('#industry_name').siblings().find('.multiselect-container input[name="multiselect"]').length > 0){
                            $('#industry_name').siblings().find('.multiselect-container input[name="multiselect"]').each(function(element) {
                                if (($(this).attr('value')).toLowerCase() == cat_prod[0].trim().toLowerCase()) {
                                    $(this).prop('checked',true).trigger("change");
                                }
                            });
                            if (typeof cat_prod[1] !== "undefined") {
                                exh_answers.push(cat_prod[1].toLowerCase());
                            }
                        }
                    };
                });
                if(exh_answers.length >0 && $('.products .multiselect-container input[name="multiselect"]').length > 0){
                    $('.products .multiselect-container input[name="multiselect"]').each(function(element) {
                        if (exh_answers.indexOf(($(this).attr('value')).toLowerCase()) > -1) {
                            $(this).prop('checked',true).trigger("change");
                        }
                    })
                }
                if(callIndustry == 1 ){
                    lastAddedExhibitors("", "", 1) ;
                    showfilter = 1 ;
                }
                else if(callIndustry == ''){
                    $('#show_data').removeClass('hide');    
                }
                $('#filter_spinner').addClass('hide');
            }
            else{
                $('#show_data').removeClass('hide');      
                $('#filter_spinner').addClass('hide');   
            }
        },
        error: function(err) {$('#show_data').removeClass('hide');$('#filter_spinner').addClass('hide');}
    });    
}
exh_answers = new Array();
function exhibitorQuestion(){
    var sender = '' ;
    if(getParameterByName('sender'))
        sender = getParameterByName('sender') ;
    else if(getCookie('user') && getCookie('user') != "")
        sender = getCookie('user') ;

// if(getEventId()=='142646' || getEventId()=='7339')
//   {
//          if(window.location.href.search("quest=1") > -1) {
//                $.ajax({
//                 type: "GET",
//                 url: site_url_attend+'/ajax?for=quest&quest=1&sender='+sender+'&event='+getEventId()+'&edition='+$("#eventEdition").val(), // change it
//                 beforeSend: function(){},
//                 success: function(result){
//                     var status = JSON.parse(result);
//                     if(status.question==1){
//                         var eventInfo = {} ;
//                         eventInfo.id = getEventId() ;
//                         eventInfo.name = getEventName() ;
//                         var userInfo = {} ;
//                         userInfo.id = getParameterByName('sender') ;
//                         userInfo.name = status.visitorName ;
//                         source = "exhibitor_connect" ;
//                         userData.visitorId = status.visitorId ;
//                         eventData.id = getEventId() ;
//                         //var questionList = {} ;
//                         //questionList.questions = status.questions ;
//                         //questionList = JSON.stringify(questionList);
//                         //questionList = questionList.replace(/\\"/g, '"');
//                         showQuestion(status.questions,eventInfo,userInfo,source);
//                     }
//                  }
//              });
//         }
//         $.ajax({
//             type: "GET",
//                 url: site_url_attend+'/ajax?for=answers&sender='+sender+'&event='+getEventId()+'&edition='+$("#eventEdition").val(),
//                 beforeSend: function(){},
//                 success: function(result){
//                      var result = JSON.parse(result);
//                      if(result.status==1){
//                         if(getEventId()=='7339')
//                             var explodeAns = result.answers['637'].split(',') ;
//                         else
//                             var explodeAns = result.answers['1191'].split(',') ;
//                         for (var i = 0; i < explodeAns.length; i++) {
//                             $('#filter-products .ctm-ga').each(function(){
//                                 if(typeof $(this).find("label").attr('data-original-title')=='undefined'){
//                                     if($(this).find('label').text().trim().toLowerCase()==explodeAns[i].toLowerCase()){
//                                     $(this).find('input').attr('checked','checked');
//                                 }
//                                 }else{
//                                     if($(this).find('label').attr('data-original-title').trim().toLowerCase()==explodeAns[i].toLowerCase()){
//                                     $(this).find('input').attr('checked','checked');
//                                 }
//                                 }
//                             });
//                         }
//                         exhibitorsFilterData();                     
//                     }
//                }
//           });
//   }else{
        $.ajax({
            type: "GET",
            url: site_url_attend+'/ajax?for=quest&quest=1&sender='+sender+'&event='+getEventId()+'&edition='+$("#eventEdition").val(), // change it
            beforeSend: function(){},
            success: function(result){
                var status = JSON.parse(result);
                if(status.question==1){
                    var eventInfo = {} ;
                    eventInfo.id = getEventId() ;
                    eventInfo.name = getEventName() ;
                    var userInfo = {} ;
                    userInfo.id = getParameterByName('sender') ;
                    userInfo.name = status.visitorName ;
                    source = "exhibitor_connect" ;
                    userData.visitorId = status.visitorId ;
                    eventData.id = getEventId() ;
                    //var questionList = {} ;
                    //questionList.questions = status.questions ;
                    //questionList = JSON.stringify(questionList);
                    //questionList = questionList.replace(/\\"/g, '"');
                    showQuestion(status.questions,eventInfo,userInfo,source);

                    $.ajax({
                            type: "GET",
                                url: site_url_attend+'/ajax?for=answers&sender='+sender+'&event='+getEventId()+'&edition='+$("#eventEdition").val(), // change it
                                beforeSend: function(){},
                                success: function(result){
                                    var result = JSON.parse(result);
                                    if(result.status==1){
                                        var productList = [] ;
                                        var selectedProduct = [] ;
                                        $('#form_317').children().each(function(i) { 
                                            productList.push($(this).text().trim());
                                        });
                                        // $('button[data-filter-type=industry]').siblings('ul').children('li').has('a').each(function(i) { 
                                        //     industryList.push($(this).text()) ;
                                        // });
                                        Object.keys(result.answers).forEach(function(key) {
                                            // console.log(key, result.answers[key]);
                                            var explodeAns = result.answers[key].split(',') ;
                                            for (var i = 0; i < explodeAns.length; i++) {
                                                if(productList.indexOf(explodeAns[i])>-1){
                                                    $("#form_317").siblings('.btn-group').find('input[value="'+explodeAns[i]+'"]').attr('checked',true).trigger("change");
                                                    callIndustry = 2 ;
                                                    showfilter = 1 ;
                                                }
                                            };
                                        });
                                    }
                                },
                                error: function(err) {}
                        });


                }
            },
            error: function(err) {}
        });
  //}
}
function callQuestionJsandCss(){
    var ulHeight = $(window).innerHeight() * 0.4;
    var styleNode = document.createElement('style');
    styleNode.type = "text/css";
    if(!!(window.attachEvent && !window.opera)) {
        styleNode.styleSheet.cssText = '.multiselect-container{position:absolute;list-style-type:none;margin:0;padding:0;overflow-y:scroll;height:'+ulHeight+'px;}.multiselect-container .input-group{margin:5px}.multiselect-container>li{padding:0}.multiselect-container>li>a.multiselect-all label{font-weight:700}.multiselect-container>li>label.multiselect-group{margin:0;padding:3px 20px;height:100%;font-weight:700}.multiselect-container>li>a{padding:0}.multiselect-container>li>a>label{margin:0;height:100%;cursor:pointer;font-weight:400;padding:3px 20px 3px 40px;}.multiselect-container>li>a>label.radio,.multiselect-container>li>a>label.checkbox{margin:0}.multiselect-container>li>a>label>input[type=checkbox]{margin-bottom:5px}.btn-group>.btn-group:nth-child(2)>.multiselect.btn{border-top-left-radius:4px;border-bottom-left-radius:4px}';
    } else {
        var styleText = document.createTextNode('.multiselect-container{position:absolute;list-style-type:none;margin:0;padding:0;overflow-y:scroll;height:'+ulHeight+'px;}.multiselect-container .input-group{margin:5px}.multiselect-container>li{padding:0}.multiselect-container>li>a.multiselect-all label{font-weight:700}.multiselect-container>li>label.multiselect-group{margin:0;padding:3px 20px;height:100%;font-weight:700}.multiselect-container>li>a{padding:0}.multiselect-container>li>a>label{margin:0;height:100%;cursor:pointer;font-weight:400;padding:3px 20px 3px 40px;}.multiselect-container>li>a>label.radio,.multiselect-container>li>a>label.checkbox{margin:0}.multiselect-container>li>a>label>input[type=checkbox]{margin-bottom:5px}.btn-group>.btn-group:nth-child(2)>.multiselect.btn{border-top-left-radius:4px;border-bottom-left-radius:4px}');
        styleNode.appendChild(styleText);
    }
    
    exhibitorQuestion();

}
/* end flagerror function */
function showQuestion(QuesList,eventInfo,userInfo,source) {
    var html = "";
    QuesList = QuesList.replace(new RegExp("\\\\/|/\\\\", "g"), "/") ; 
    var questionArray = $.parseJSON(QuesList) ;
    var multiSelectId = [] ;

    var data = {
                  QuesList:QuesList,
                  eventInfo:eventInfo,
                  userInfo:userInfo,
                  source:source,
                  script:'desktop',
            };
    
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax/stallbookingform",
        data:data,
        success: function(html) {
              var finaldata=$.parseJSON(html);
            $("#modalData").html(finaldata.html);

            $("#TenTimes-Modal").modal("show");
            removeBackdropModal();
            $("#TenTimes-Modal #userSource").val(source);
            $(document).ready(function() {
                for (var msId in finaldata.multiSelectId){
                    $('#'+finaldata.multiSelectId[msId]).multiselect();
                };
        if(eventInfo.id=='181465' || eventInfo.id=='112731'){
            $('#modalData .multiselect').click(function(){
                  var production_list=new Array(); 
                  var temp_vari=[],sub_array=[];

                    $.each( questionArray, function( key_form1, value_form1 ) {
                        $.each( value_form1, function( key_form2, value_form2 ) {
                            if(value_form2.question=='Product'){
                                var i=0;
                                var temporray_string='';

                               $.each( value_form2.options, function( key_form3, value_form3 ) {
                                  value_form3=value_form3.trim();
                                  temp_vari=value_form3.split("-");
                                  if(typeof production_list[temp_vari[0]]=='undefined'){
                                        production_list[temp_vari[0]]=[];
                                  }
                                  if(temporray_string==temp_vari[0]){
                                        production_list[temp_vari[0]][i]=temp_vari[1];  
                                  }else{
                                        i=0;
                                        production_list[temp_vari[0]][i]=temp_vari[1];  
                                  }
                                        i++;
                                        temporray_string=temp_vari[0];
                               });
                                  
                            }                           
                      });
                    });
                        var neighid,prodid;
                        $.each( questionArray, function( key, value ) {
                            $.each( value, function( key1, value1 ) {
                               if(value1.question=='Industry Sector')
                                neighid=value1.id;
                               if(value1.question=='Product')
                                prodid=value1.id;
                          });
                        });
                        $('#form_'+neighid).siblings().children('.multiselect-container').css({"overflow":"scroll", "max-height": "350px"});
                        $('#modalData .multiselect-container li').off('change').change(function(){
                            var childvalue=$(this).children().children().children().val();
                                 if($(this).hasClass('active')==true){
                                    for (var key in Object.keys(production_list)) {
                                        let value = production_list[key];
                                        if(key==childvalue){
                                            if($(document).find('#form_'+prodid).hasClass('form_sumbit')==false){
                                                  html='';
                                                      html='<label style="padding-left: 8px;" class ="ans required" for="form_'+prodid+'">Product Sector</label><div class="form-group rel-position"><select style="padding:8px 10px 7px 5px;" class="form_sumbit" name="form['+prodid+']" id="form_'+prodid+'" multiple="multiple">';
                                                      var optionJson = '';
                                                      $.each(value, function( key1, value1 ) {
                                                                   optionJson += '<option data-industry="'+key+'">'+value1+'</option>' ;
                                                                });
                                                      html += optionJson+'</select></div>';
                                                      flag=1;
                                                     
                                            }else{
                                                html='';
                                                if(value.length>1){ 
                                                     $.each( value, function( key1, value1 ) {
                                                            html += '<option data-industry="'+key+'">'+value1+'</option>' ;
                                                       });
                                                 }
                                                $(document).find('#form_'+prodid).append(html);
                                                $('#form_'+prodid).multiselect("destroy").multiselect();
                                                         
                                           
                                            }
                                        }
                                    }


                                    if(flag==1){
                                                $('#from_category').html(html); 
                                                $('#form_'+prodid).multiselect();
                                                
                                                $('#form_'+prodid).parent().append('<p class="text-danger"></p>');
                                                flag=0;
                                    }

                                   $('#form_'+prodid).siblings().children('.multiselect-container').css({"overflow":"scroll", "max-height": "350px"});

                                }else{
                                    for (var key in Object.keys(production_list)) {
                                        let value = production_list[key];
                                     if(key==childvalue){
                                           $.each( value, function( key1, value1 ) { 
                                              $(document).find('#form_'+prodid).children().each(function(){
                                                   if($(this).text()==value1){
                                                      $(this).remove();
                                                   }
                                                });
                                              $(document).find('#form_'+prodid).siblings().children('.multiselect-container').children().each(function(){   
                                                if($(this).children().children().text().trim()==value1){
                                                      $(this).remove();
                                                   }
                                              });
                                                 
                                          });

                                    }

                                  }
                                    if($('#form_'+neighid).siblings('.btn-group').find('.multiselect-container').children().hasClass('active')==false){
                                              $('#form_'+prodid).parent().siblings().remove();
                                              $('#form_'+prodid).parent().remove();                                        
                                    }
                                }
                            if($('#form_'+prodid).siblings('.btn-group').find('.multiselect-container').children().hasClass('active')==false){
                                 $('#form_'+prodid).siblings('.btn-group').find('button').html('None selected');
                                 $('#form_'+prodid).siblings('.btn-group').find('button').attr('title','None selected');
                            }else{
                                var string_count_length=$('#form_'+prodid).siblings('.btn-group').find('.multiselect-container').children('.active').length.toString();
                                $('#form_'+prodid).siblings('.btn-group').find('button').html(string_count_length+' selected');
                                $('#form_'+prodid).siblings('.btn-group').find('button').attr('title',string_count_length+' selected');

                              }
                            
                         });
                    });
                }
            });
         },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
       });
    
}
var filterSubmitFlag = 2 ;
function SubmitFilter(dis,source){
    //if(getCookie('user') == "" || filterSubmitFlag == 1)
    var eventEdition='';
    if((pageType !== undefined && pageType == "thankyou_new")){
        eventEdition=$("#edition_id").val();
    }else{
        eventEdition=$("#eventEdition").val();
    }
    if(getCookie('user') == "" || (pageType !== undefined && pageType != "exhibitors"))
        return false ;
    else if(getEventId() == 7339)
        return false ;
    var answerArray = {} ;
    answerArray.answer = {} ;
    answerArray.source = 'filter' ;
    answerArray.event_edition_id = eventEdition ;
    answerArray.user_id = getCookie('user') ;
        
    var industryName = '' ;
    if($('.industry_name').text() != "Select Category" && $('.industry_name').text() != "" ){
        industryName = $('.industry_name').text() ;
        if(getEventId() == 181465)
            answerArray.answer[954] = industryName ;
        else if(getEventId() == 112731)
            answerArray.answer[952] = industryName ;

    }
    var product_selected = '' ;
    // $('input[name="product_list"]:checked').each(function(index) {
    //     product_selected += this.value+',' ;
    // });
    $('.products input:checked').each(function(index) {
        product_selected+=($(this).attr('data-industry')+'-'+$(this).attr('value'))+',';
    })
    if(source == 'exhibitorconnect'){
        $('#product_name').children().each(function(i) { 
                if($(dis).parent().find('.block').text() == $(this).attr('value')){
                    product_selected += $(this).attr('data-product-id')+',';
                }
            });
    }
    product_selected = product_selected.substring(0,product_selected.length-1 ) ;
    if(product_selected != "" ){
        if(getEventId() == 181465)
            answerArray.answer[955] = product_selected ;
        else if(getEventId() == 112731)
            answerArray.answer[953] = product_selected ;
    }

    // console.log(product_selected);
    // console.log(industryName);
    $.ajax({ type: "POST",url: site_url_attend+"/submitanswer",data: answerArray,
        beforeSend: function(){},
        ajaxSend: function(){},
        complete: function(){},
        success: function(A) {
            if($('.industry_name').text() != "Select Category" && $('.industry_name').text() != "" && product_selected != "" )
                filterSubmitFlag = 1 ;
            A = JSON.stringify(A);
            V = $.parseJSON(A);
            hideloading();
        }
    });
}
function SubmitAnswers(source){
    
    var answerArray = {} ;
    answerArray.answer = {} ;
    answerArray.source = source ;

    if(!submitAnswersCheck())
        return !1;
    else
    {
        if($('#event_id').val()  == undefined)
            answerArray.event_id = eventData.id ;
        else
            answerArray.event_id = $('#event_id').val() ;

        if($('#visitorId').val()  == undefined)
            answerArray.visitor_id = userData.visitorId ;
        else
            answerArray.visitor_id = $('#visitorId').val() ;
        
        var industryName = '' ;
        var industryList = [] ;
        var productIds = '' ;
        var productId = [] ;

        $('button[data-filter-type="industry"]').siblings('ul').find('li a').each(function(i,ob) { 
            industryList[i] = $(ob).text() ;
        });
        $('#product_name').children().each(function(i,ob) { 
            productId[$(ob).text()] =  $(ob).attr('data-product-id');
        });
        
        var html1 = $('#TenTimes-Modal .ans');
        $.each(html1, function(key, element) {
                var gh = element.htmlFor;
                var value_text = $("#" + gh).val();
                 product_selected_modal='';
                if(getEventId() == 181465 || getEventId()==112731){
                    $('#from_category input:checked').each(function(index) {
                        product_selected_modal+=($(this).attr('data-industry')+'-'+$(this).attr('value'))+',';
                    });
                }
                if (value_text == null || value_text == "Please Select..." || value_text == "Enter text here..." ) {
                    value_text = '' ;
                } 
                else if(value_text.indexOf("Please Select") > -1)
                {
                    value_text = '' ;
                }

                if(pageType !== undefined && pageType == "exhibitors" ) {
                    for (var k = 0; k < industryList.length; k++) {
                        for (var i = 0; i < value_text.length; i++) {
                            if(industryList[k] == value_text[i]){
                                industryName += value_text[i]+',' ;
                            }
                        }
                    };
                }

                var qId = gh.replace('form_','') ;
                if($.isArray($("#" + gh).val()))
                {
                    if(pageType !== undefined && pageType == "exhibitors" ) {
                        var productSelected = $("#" + gh).val() ;
                        for (var i = 0; i < productSelected.length; i++) {
                            if(productId.hasOwnProperty(productSelected[i])){
                                productIds += productId[productSelected[i]]+',' ;
                            }
                        };
                    }
                    value_text = $("#" + gh).val().join() ;
                }
                answerArray.answer[qId] = value_text;
                if(product_selected_modal != "" ){
                    if(getEventId() == 181465)
                        answerArray.answer[955] = product_selected_modal ;
                    else if(getEventId() == 112731)
                        answerArray.answer[953] = product_selected_modal ;
                }
            }  
        ); 
        productIds = productIds.substring(0,productIds.length-1 ) ;   
    }
    $.ajax({ type: "POST",url: site_url_attend+"/submitanswer",data: answerArray,async: true,
            beforeSend: function(){showloading();},
            ajaxSend: function(){showloading();},
            complete: function(){},
            success: function(A) {
                A = JSON.stringify(A);
                V = $.parseJSON(A);
                switch(source)
                {
                    case 'stall_attend':
                        var requiredArea = $.trim($("#TenTimes-Modal #form_491").val()); 
                        var message = $.trim($("#TenTimes-Modal #form_148").val());
                        $("#TenTimes-Modal .modal-body").html('<h4 class="text-center">Thankyou!</h4>');
                        setTimeout(function(){ $("#TenTimes-Modal").modal("hide");}, 1000);
                        var ajaxData = {} ;
                        ajaxData.visitor_id = userData.encodeId ;
                        ajaxData.event_id=eventData.id;
                        ajaxData.message = message ;
                        ajaxData.requiredArea = requiredArea ;
                        $.ajax({ type: "POST",url: site_url_attend+"/organizers/sendstallmail",data: ajaxData,
                        success: function(A) {
                        window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/stall-enquiry?source=autosubmit"+"_stall"+"_"+pageType);
                        },
                        error:function(A){
                        window.location.assign(site_url_attend +'/'+$('#event_url').val()+"/stall-enquiry?source=autosubmit"+"_stall"+"_"+pageType);  
                        }
                        });
                        break;
                    default:
                        hideloading();
                        if(pageType == "exhibitors" ){
                            industryName = encodeURIComponent(industryName);
                            $('#TenTimes-Modal').modal('hide');
                            if(productIds != "" && industryName != "" ){
                                window.location.href = "//"+window.location.host+window.location.pathname+"?product_id="+productIds+"&industry="+industryName;
                            }
                            else if(productIds != "" ){
                                if(getParameterByName('industry')){
                                    window.location.href = "//"+window.location.host+window.location.pathname+"?product_id="+productIds+'&industry='+getParameterByName('industry');    
                                }
                                else{
                                    window.location.href = "//"+window.location.host+window.location.pathname+"?product_id="+productIds;       
                                }
                            }
                            else if( industryName != "" ){
                                if(getParameterByName('product_id')){
                                    window.location.href = "//"+window.location.host+window.location.pathname+"?&industry="+industryName+"&product_id="+getParameterByName('product_id');
                                }
                                else
                                    window.location.href = "//"+window.location.host+window.location.pathname+"?&industry="+industryName;
                            }
                            location.reload();
                            break;
                        }
                        else{
                            $("#TenTimes-Modal .modal-body").html('<h4 class="text-center">Thankyou!</h4>');
                            setTimeout(function(){ $("#TenTimes-Modal").modal("hide");}, 1000);
                        }
                }
            }
    });
}
function submitAnswersCheck(){
    var result = 1 ;
    var html1 = $('#TenTimes-Modal .required');
    $.each(html1, function(key, element) {
        var gh = element.htmlFor;
        var value_text = $("#" + gh).val();
        if (value_text == null || value_text == "" || value_text == "Please Select..." || value_text == "Enter text here...") {
            $("#" + gh).siblings("p").text('Required').show();
            result = 0 ;
        } 
        else if(value_text.indexOf("Please Select") > -1)
        {
            $("#" + gh).siblings("p").text('Required').show();
            result = 0 ;
        }
        else
            $("#" + gh).siblings("p").text('').show();
    }
    );
    if (result == 0) {
        return false;
    } 
    else {
        return true
    }
}
/* added product for event=142646 */
function submitProduct(){
    var answerArray = {} ;
    answerArray.answer = {} ;
    answerArray.source = 'filter' ;
    answerArray.event=$('#eventID').val();
    answerArray.event_edition_id = $("#eventEdition").val() ;
    answerArray.user_id = getCookie('user') ;
    answerArray.visitor_id = VisitorIdDecode ;
    var product_selected_modal='';            
    $('#filter-products .ctm-ga input:checked').each(function(index) {
        if(typeof $(this).siblings("label").attr('data-original-title')=='undefined')
            product_selected_modal+=$(this).siblings('label').text().trim()+',';
        else
            product_selected_modal+=$(this).siblings('label').attr('data-original-title').trim()+',';
    });
    var strVal = product_selected_modal;
    var lastChar = strVal.slice(-1);
    if (lastChar == ',') {
        strVal = strVal.slice(0, -1);
    }
    product_selected_modal=strVal;
    if(product_selected_modal != "" ){
            if(getEventId()=='7339')
                answerArray.answer[637] = product_selected_modal ;
            else   
                answerArray.answer[1191] = product_selected_modal ;
    }
    // console.log(product_selected);
    // console.log(industryName);
    $.ajax({type: "POST",url: site_url_attend+"/submitanswer",data: answerArray,
        beforeSend: function(){},
        ajaxSend: function(){},
        complete: function(){},
        success: function(A) {
            hideloading();
        }
    });


}
/* endhere */
function connectNewAuth(dis,receiverId,receiverName,eventID)
{
    callGaEvent("connect");
        if($('#con_type').length>0 && $('#con_type').val()=='event')
        con_flag=1;
    
    getReceiverData(dis);
    getEventData(dis);

    $(dis).parent().parent().find('.fa-heart-o').addClass('color_orange fa-heart').removeClass('fa-heart-o').removeAttr( "onclick").attr("data-original-title","Following");

    receiverData['id'] = receiverId;
    if(getCookie('user') && getCookie('user') != "")
    { 
        //  if(pageType=='udash_connections')
        // var senderName=$('h1').html();
        $('#'+receiverData.id).html('processing <i class="fa fa-spinner fa-pulse"></i>');
        sendRequestAuth(dis);
    }
    else
    {
        alert("Not logged in");
    }
}


function sendRequestAuth(dis)
{
    var data = {
                receiver: receiverData.id,
                event_id: eventData.id,
                event_url: eventData.url,
                event_name: eventData.name,
                user_id: getCookie("user"),
                connectStatus:0,
                user_token: getCookie("user_token"),
                source: "dashboard",
                action: "connect"
            };
        if(typeof pageType!='ProfileDash')
            data.source="dashboard_profile"
        hitAuth(data,'oneClickAuthConnect','connect',dis);
}
function loggedInConnectAuthResponse(result,data)
{
    if(result.status == 1)
    {
        $('#'+receiverData.id).html('Request Sent');
        $('#'+receiverData.id).prop( "onclick",null);
        $('#'+receiverData.id).attr('disabled','disabled');
    }
    else if(result.status == 0)
    {
        if( typeof result.error!=='undefined' && typeof result.error.message !=='undefined')
           alert(result.error.message);
       else
            alert("Some technical error. Please try again");   
    }
    else
    {
        alert("Some technical error. Please try again");   
    }
}
function openQuestion(source,result) {
    var eventInfo = {} ;
    eventInfo.id = eventData.id ;
    eventInfo.name = eventData.name ;
    var userInfo = {} ;
    userInfo.id = result.userData.id ;
    userInfo.name = result.userData.name ;
    var questionList = {} ;
    questionList.questions = result.questions ;
    questionList = JSON.stringify(questionList);
    questionList = questionList.replace(/\\"/g, '"');
    showQuestion(questionList,eventInfo,userInfo,source);
    // if($('#modalData').html() == "")
    //     $('#modalData').html(getModal());
    // $('#TenTimes-Modal .modal-dialog').removeClass('modal-740').addClass('modal-500');
    // $('#TenTimes-Modal .modal-title').html('Send Message');
    // var messageHtml = '<div class="row"><div class="form-group rel-position"> <textarea rows="7" placeholder="Any Comment..." class="pd-0" id="message-body"></textarea> <span class="undrr"></span><span class="text-danger alert_message"></span> </div><button type="button" class="btn btn-lg btn-orange btn-block" onclick="return sendCustomMessage(\''+source+'\');">Send Message</button> </form> </div></div>' ;
    // $('#TenTimes-Modal .modal-body').html(messageHtml);
    // $('#TenTimes-Modal').modal('show');
}
function sendCustomMessage(source) {
    var message = $.trim($("#TenTimes-Modal #message-body").val());
    if(message == "" || message == "Any Comment..." ){
        showError('message','Please enter a message.');
        $("#TenTimes-Modal #message-body").val('');
        return !1;
    }
    switch(source){
        case "stall_attend":
                sendStallMessage(source);
            break;
        default:;
    }
}
function sendStallMessage(source)
{

    var message = $.trim($("#TenTimes-Modal #message-body").val());
    var data = {
        user_id: getCookie("user"),
        user_token:getCookie('user_token'),
        message: message,
        entity_id:userData.visitorId,
        action:'enquiry',
        entity_type:'event_visitor_stall',
        source: source,
    };
    $.ajax({
        type: "POST",
        url: site_url_attend+'/ajax/enquiry',
        data: data,
        beforeSend: function(){showloading();
        },
        success: function(result){
            var status=JSON.parse(result);
            if(status['status']==1)
                window.location.assign(site_url_attend + "/ticket_transaction/thankyou?ref=" + userData.encodeId + "&source="+source);
            else{
                hideloading();
                alert("Sorry there was an error in the system. Try again.");
            }
        },
        error: function(err) {
            alert("Sorry there was an error in the system. Try again.");
            hideloading();
        }
    });
}
function removeBackdropModal() {
    if($('.modal-backdrop').length > 1 )
        jQuery('.modal-backdrop').not(':last').remove();
}

function showBounce() {
    return false;
    if(getCookie('bounce_detail_'+$('#eventID').val()) == 1 || getCookie('user') != "")
        return false;
    
    setCookie('bounce_detail_'+$('#eventID').val(), '1', 24 * 60);
    var modalHtml = '<div class="modal fade" id="TenTimes-Bounce-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"><div class="modal-dialog modal-500" role="document"><div class="modal-content modal-primary"><div class="modal-header text-center"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"></span></button><h4 class="modal-title" id="myModalLabel">Never miss an Opportunity</h4></div><div class="modal-body tentimes-form"><h5 id="subTitle" style="padding-bottom: 15px;">Stay up-to-date with the latest news about this event.</h5><div class="row"><form><div class="col-md-8 col-sm-8"><div class="form-group rel-position"><input type="text" placeholder="Name" id="userName"><span class="undrr"></span><span class="ico fa-envelope"></span><span class="text-danger alert_name"></span></div></div><div class="col-md-8 col-sm-8 material-form"><div class="form-group rel-position"><input type="email" placeholder="Email" id="userEmail"><span class="undrr"></span><span class="ico fa-envelope"></span><span class="text-danger alert_email "></span></div></div><div class="col-md-4 col-sm-4"><button type="button" class="btn btn-orange" onclick="return Bounce(this,\'bounce_detail\');">Submit</button></div></form></div><div class="row col-md-12 col-sm-12 "><p class="alert_bounce_success text-success"></p></div></div></div></div></div>';
    var modalHtml = '<div class="modal fade" id="TenTimes-Bounce-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog modal-500" role="document"> <div class="modal-content modal-primary"> <div class="modal-header text-center"> <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;  </span> </button> <img src="https://c1.10times.com/img/hand.png" style="width: 12%;"><h3 class="modal-title" id="myModalLabel">Never miss an Opportunity</h3> </div><div class="modal-body tentimes-form"> <h5 id="subTitle" style="padding-bottom: 15px;">Stay up-to-date with the latest news about this event.</h5> <div class="row"><div class="col-md-12 col-sm-12"> <form> <div class="form-group rel-position"> <input type="text" placeholder="Name" id="userName"><span class="undrr"></span><span class="ico fa-user"></span><span class="text-danger alert_name"></span> </div><div class="form-group rel-position"> <input type="email" placeholder="Email" id="userEmail"><span class="undrr"></span><span class="ico fa-envelope"></span><span class="text-danger alert_email "></span> </div><div style="text-align: center;"><button type="button" class="btn btn-orange" onclick="return Bounce(this,\'bounce_detail\');">Stay Up-To-Date</button></div></form></div></div><div class="row"> <div class="col-md-12 col-sm-12 "> <p class="alert_bounce_success text-success text-center" style="padding-top:15px;"></p></div></div></div></div></div></div>';
    var modalHtml = '<div class="modal fade" id="TenTimes-Bounce-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"><div class="modal-dialog modal-500" role="document"><div class="modal-content modal-primary" style="background-color:#e86300;"><div class="modal-header text-center" style="padding-bottom: 5px;padding-top: 5px;"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;  </span></button><p id="waitIcon" style="font-size: 48px;margin-bottom: 0px;color: black;"><img src="https://c1.10times.com/img/hand.png" style="width:19%;">WAIT</p><h3 class="modal-title" id="myModalLabel" style="color:white;">Don\'t  miss out on a good event</h3></div><div class="modal-body tentimes-form" style="padding: 5px;"><h5 id="subTitle" style="padding-bottom: 5px;color:white;text-align: center;">Stay up-to-date with the latest news about this event.</h5><div class="row"><div class="col-md-offset-1 col-sm-offset-1 col-md-10 col-sm-10"><form><div class="form-group rel-position"><input type="text" placeholder="Enter Your Name" id="userName" style="color:white;"><span class="undrr"></span><span class="ico fa-user" style="color:white;"></span><span class="text-danger alert_name"></span></div><div class="form-group rel-position"><input type="email" placeholder="Enter Your Email" id="userEmail" style="color:white;"><span class="undrr"></span><span class="ico fa-envelope" style="color:white;"></span><span class="text-danger alert_email "></span></div><div style="text-align: center;"><button type="button" class="btn btn-blue" onclick="return Bounce(this,\'bounce_detail\');">Submit</button></div></form></div></div><div class="row"><div class="col-md-12 col-sm-12 "><p class="alert_bounce_success text-success text-center" style="padding-top:15px;"></p></div></div></div></div></div></div>';
    $("#bounceModalData").html(modalHtml);
    $("#TenTimes-Bounce-Modal").modal("show");
    bounceOpen();
}
function bounceOpen() {
    callIpInfo();
    $.get("/bounceo/"+$('#eventID').val(), function() {});
}
var ipCity = '';
var ipCountry = '' ;
function callIpInfo() {
    if(ipCountry == '' && ipCity == '' )
    {
        $.get("//ipinfo.io", function(response) {
            //console.log(response.city, response.country);
            ipCountry = response.country;
            ipCity = response.city;
        }, "jsonp");
    }
}
function Bounce(I,source) {
    
    callIpInfo();
    getEventData(I);
    hideError('email');
    hideError('name');
    var email = $.trim($("#TenTimes-Bounce-Modal #userEmail").val());
    var name = $.trim($("#TenTimes-Bounce-Modal #userName").val());
    var flag = 1;
    if(!validateEmail12345(email)){
        $(".alert_email").show();
        flag = 0;
    }
    if(!validateName(name)){
        $(".alert_name").show();
        flag = 0;
    }
    if(flag == 0)
        return false;
    $.get("/bouncec/"+$('#eventID').val(), function(response) {});
    showloading();
    var A = {};
    A.email = $("#TenTimes-Bounce-Modal #userEmail").val();
    A.name = $("#TenTimes-Bounce-Modal #userName").val();
    A.event_id = eventData.id;
    A.source = source;
    A.action = 'follow';
    A.city = ipCity;
    A.country = ipCountry;
    hitAuth(A,source,source,A,I);
}
function bounceResponse(result,data) {
    //showError("bounce_success","You are successfully registered. We'll keep you updated.");
    $('#TenTimes-Bounce-Modal .modal-title').text("Thank you for your time. We'll keep you updated.")
    $('#TenTimes-Bounce-Modal .modal-body').html('');
    $('#waitIcon').html('');
    setTimeout(function(){ $("#TenTimes-Bounce-Modal").modal("hide");}, 2000);
}


var part_cnt = false;



function showReport(dis=null){
    //$('#reportModalData').html('<div class="modal fade" id="TenTimes-ModalReport" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"><div class="modal-dialog modal-500" role="document"><div class="modal-content modal-primary"><div class="modal-header text-center"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h3 class="modal-title" id="myModalLabel">Report This Event</h3></div><div class="modal-body tentimes-form"><div class="row"><div class="col-md-12 col-sm-12 material-form"><h4 id="subTitle">What\'s wrong?</h4><form method="get"><div class="row"><div class="col-md-6 col-sm-6"><div class="form-group rel-position"><div class="checkbox" ><label><input type="checkbox"/>Event Date</label></div></div></div><div class="col-md-6 col-sm-6"><div class="form-group rel-position"><div class="checkbox" ><label><input type="checkbox"/>Venue</label></div></div></div></div><div class="row"><div class="col-md-6 col-sm-6"><div class="form-group rel-position"><div class="checkbox" ><label><input type="checkbox"/>Organizer</label></div></div></div><div class="col-md-6 col-sm-6"><div class="form-group rel-position"><div class="checkbox" ><label><input type="checkbox"/>Event not happening</label></div></div></div></div><div class="row"><div class="col-md-6 col-sm-6"><div class="form-group rel-position"><div class="checkbox" ><label><input type="checkbox"/>Other Information</label></div></div></div></div><div class="form-group rel-position"><textarea rows="3" placeholder="If there is any other addional info you would like to provide regarding this event." class="pd-0" id="report-description"></textarea><span class="undrr"></span><span class="text-danger alert_message"></span></div><div class="form-group rel-position"><input type="email" placeholder="Your Email" id="userEmail"><span class="undrr"></span><span class="ico fa-envelope"></span><span class="text-danger alert_email "></span></div><button type="button" class="btn btn-lg btn-orange btn-block" onclick="return SubmitReport(this,\'event_detail\');">SUBMIT</button></form></div></div></div></div></div></div>');
       
    if(pageType.search(/venue/)>-1 || pageType.search(/Venue/)>-1){
       // gaEvent("Event","Enquiry");
    }
    else{
        gaEvent("Event","Flag This");
    }
    var data = {  
                  pageType:pageType,
            };
    if($(dis).attr('id')=="infor"){
        data["part_cnt"] = true;
        part_cnt = true;
    }
    var html='';
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax/flageventpage",
        data:data,
        success: function(html) {
              html=$.parseJSON(html);
              $('#reportModalData').html(html.html);
              $('#reportModalData .claim_this').attr('href',''+login_url+'?eventId='+$('#event_url').val()+'&utm_source=10times&utm_medium=claim&utm_campaign=event_claim');
              $("#TenTimes-ModalReport").modal("show");
              $('#vis_nm').html($('#name_vis').html());
                $('#TenTimes-ModalReport .tentimes-form input[type=email]').css('border-bottom','1px solid #F4F1F1');
                if(data.part_cnt == false){
                    $('#TenTimes-ModalReport .tentimes-form textarea').css({'border-bottom':'1px solid #F4F1F1','font-size':'13px'});
                }
                if(typeof reportErrorSingleSelect == "function"){
                    reportErrorSingleSelect();
                }
         },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
       });

}
function isVldCnt(slct){
    if(parseInt(slct,10)>0 && /^[0]*[0-9]+[0]*$/.test(slct)){
        return true;
    }else{
        return false;
    }
}

function checkReport(modalhtml) {
    var flag = 0;
    var otherFlag = 0;
    var report = {} ;
    var arrChecked = [] ;
    showError('message','');
    showError('email','');
    if(!part_cnt){
        $("input:checked").each(function () {
            flag = 1 ;
            if("Other Information" == $.trim($(this).parent('label').text()) && $.trim($('#report-description').val()) == "" && $.trim($('#cnt_rprt_vis').val()) == "" && $.trim($('#cnt_rprt_ehb').val()) == ""){
                otherFlag = 1 ;            
            }
            arrChecked.push($(this).val() ? $(this).val() : $(this).parent('label').text());
        });
    }else{
        flag = 1 ;
        var vis_cnt = $.trim($("#TenTimes-ModalReport #cnt_rprt_vis").val()) ;
        var vis_nm = $('#vis_nm').html();
        var ehb_cnt = $.trim($("#TenTimes-ModalReport #cnt_rprt_ehb").val()) ;
        if((ehb_cnt=="" && vis_cnt=="")){
            flag = 0;   
            showError('visehb_cnt',modalhtml.errorFormvisehbcnt_mpt);
        }else{
                if((isVldCnt(vis_cnt) && !(isVldCnt(ehb_cnt)))||(!(isVldCnt(vis_cnt)) && isVldCnt(ehb_cnt))||(!(isVldCnt(vis_cnt)) && !(isVldCnt(ehb_cnt)))){
                        flag = 0;  
                        showError('visehb_cnt',modalhtml.errorFormvisehbcnt);
                }
                if((vis_cnt=="" && isVldCnt(ehb_cnt))||(ehb_cnt=="" && isVldCnt(vis_cnt))||(isVldCnt(vis_cnt) && isVldCnt(ehb_cnt))){
                        flag = 1;
                        hideError('visehb_cnt');
            }
        }
    }
    if(otherFlag == 1 )
    {
        flag = 0;
        showError('message',modalhtml.errorFormMsg);
    }
    var email = $.trim($("#TenTimes-ModalReport #userEmail").val()) ;
    if(email != ""  && !validateEmail12345(email) ){
        flag = 0;
        showError('email',modalhtml.errorFormemail);
    }
    else if(email == "" && getCookie('user') == "" ){
        flag = 0;
        showError('email',modalhtml.errorFormemail);
    }
    report.status = flag ;
    report.isChecked = arrChecked ;
    report.email = email ;
    if(part_cnt){
        report.ehb_cnt = ehb_cnt;
        report.vis_cnt = vis_cnt;
        report.vis_nm = vis_nm;
    }
    if(pageType == "venue_detail")
        report.venue_id = getVenueId() ;
    else
        report.event_id = getEventId() ;
    report.url = window.location.pathname ;
    if(email == "" && getCookie('user') && getCookie('user') != "" )
        report.email = getCookie('user') ;
    if(!part_cnt){
        report.description = $("#TenTimes-ModalReport #report-description").val() ;
    }
    return report;
}
function checkFeedback(modalhtml){
    var flag=1;
    var feedback = {};
    
    showError('message','');
    showError('email','');

    var email = $.trim($(".help #userEmail").val());
    if($.trim($('.help .message').val()) == ""){
        flag=0;
        showError('message',modalhtml.errorFormmsg);
    }
    if(email !="" && !validateEmail12345(email) ){
        flag=0;
        showError('email',modalhtml.errorFormemail);
    }
    else if(email == ""){
        flag=0;
        showError('email',modalhtml.errorFormemail);
    }
    feedback.attachement = $("#file").val();
    feedback.source='feedback';
    feedback.status = flag;
    feedback.description = $(".help .message").val();
    feedback.name=$(".help #userName").val();
    feedback.email=email;
    feedback.url = window.location.pathname ;
    if(email == "" && getCookie('user') && getCookie('user') != "" )
        feedback.email = getCookie('user') ;

    return feedback;    
}
function SubmitFeedback(I){
        var data={
            for:'SubmitFeedback_Response',
        };
        var modalhtml='';
        $.ajax({
            type:"POST",
            url:site_url_attend + "/ajax/modaldata",
            data:data,
            success: function(html) {
                modalhtml=$.parseJSON(html);
                var feedbackFlag = checkFeedback(modalhtml);
                 if(feedbackFlag.status==1)
                    ajaxHit("POST",site_url_attend+"/ajax/error_report",feedbackFlag,true);  
                },
            error: function(data){
                showToast('Something went wrong!!!');
             }
        });
}
function SubmitReport(I,source) {
        var data = {
                  pageType:pageType,
                  for:'SubmitReport_Response',
                  login_url:login_url,
                  eventid:$('#event_url').val(),                  
            };
        var modalhtml='';
        $.ajax({
            type: "POST",
            url: site_url_attend + "/ajax/modaldata",
            data:data,
            success: function(html) {
                  modalhtml=$.parseJSON(html);
                  var reportFlag = checkReport(modalhtml);
                    if(reportFlag.status==0)
                        return false;
                    showloading();
                    var type = '';
                    if(reportFlag.status){
                        reportFlag.source = source ;
                        if(pageType == "venue_detail")
                        {
                             reportFlag.venue_name = getEventName() ;
                                type = 'venue';
                        }   
                        else {
                                type = 'event';
                                reportFlag.event_name = getEventName() ;
                        }
                        var html = modalhtml.mainHtml; 
                        var titleHtml = modalhtml.titlehtml+type+'!';
                        var flag=0;
                        reportFlag['oragnizerFlag']=0;
                        $.ajax({ 
                            type: "GET",
                            async: false,
                            url: site_url_attend+"/ajax?for=contactDomainCheck&event_id="+$('#eventID').val()+"&domainEmail="+reportFlag.email,
                            success: function(result) {
                                if(result == 'matched') {
                                    flag=1;
                                    reportFlag['oragnizerFlag']=1;
                                    
                                }
                            }
                        });
                        if(flag==1){
                            titleHtml = modalhtml.contact_mainhtml;
                            html = modalhtml.contact_titlehtml;
                        }
                        $('#TenTimes-ModalReport .modal-title').html(titleHtml);
                        $('#TenTimes-ModalReport .modal-body').html(html);
                        hideloading();
                        ajaxHit("POST",site_url_attend+"/ajax/error_report",reportFlag,true);
                    }
             },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
           });
}
function authorizeTenToken(result) {
    if(result == undefined)
        return false;
    else if(result.status == 0 && result.hasOwnProperty('error') && result.error.hasOwnProperty('invalidData'))
    {
        for (values in result.error.invalidData) {
            if(result.error.invalidData[values].what.toLowerCase() == "user" && (result.error.invalidData[values].why.toLowerCase() == "mismatch" || result.error.invalidData[values].why.toLowerCase() == "not found") ){
                return true;
            }
        }
    }
    return false;
}
function verifyTenToken() {
    var data = {} ;
    if(getCookie('user') != "" && getCookie('user_token') != "" && getCookie('10T_verify') != "1"){
        data.user_id = getCookie('user') ;
        data.action = 'signup' ;
        data.user_token =  getCookie('user_token') ;
        hitAuth(data,'verifyTenToken','','','');
    }
}

function showAuthTokenMessage(append) {
    $('#loggedLi').replaceWith(function() { return '<li><a href="javascript:void(0);" onclick="signIn(\'signup\');">Login</a></li><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true"><i class="fa fa-bars"></i></a><ul class="dropdown-menu dropdown-menu-right"><li><a href="//login.10times.com/addevent">Add Event</a></li><li><a href="https://login.10times.com/eventmarketing">Promote Event</a></li><li><a href="/app">Download App <i class="fa fa-apple"></i><i class="fa fa-android"></i></a></li>'+(user.country.id==='IN' && pageType !== 'homepage' ? '<li><a href="https://10times.com/career" target="_blank" rel="noreferrer">Career at 10times</a></li>' : '')+'</ul></li>'; });
    showToast();
    // if(append == undefined)
    //     append = '.modal-title' ;
    // $(append).prepend('<h5 class="text-danger">Your account is having authentication problem. Some features may not work. Try logging in to fix the problem.</h5>') ;
}
function showToast(msg, alertColor,timing,position) {
    if(alertColor === undefined || alertColor=='')
        alertColor = '#ff3333' ;
    if(msg === undefined)
        msg = "You are logged out!" ;
    if(timing=== undefined || timing=='')
        timing=3000;

    if(!document.getElementById("snackbar"))
            $('body').append('<div id="snackbar"></div>');
    if(deviceFlag==0){   
        $('#snackbar').html('<div id="snackMsg"></div>');
        if(document.getElementById("snackbar") != null){
            $( "<style>#snackMsg{background-color: rgba(75, 75, 75, 0.8);color: #fff;text-align: center;border-radius: 20px;padding: 5px;}#snackbar{visibility: hidden;min-width: 120px;padding: 50px;position: fixed;z-index: 1;bottom: 60px;font-size: 17px;width: 100%;}#snackbar.show{visibility:visible;-webkit-animation:fadein .5s,fadeout .5s 2.5s;animation:fadein .5s,fadeout .5s 2.5s}@-webkit-keyframes fadein{from{bottom:0;opacity:0}to{bottom:30px;opacity:1}}@keyframes fadein{from{bottom:0;opacity:0}to{bottom:30px;opacity:1}}@-webkit-keyframes fadeout{from{bottom:30px;opacity:1}to{bottom:0;opacity:0}}@keyframes fadeout{from{bottom:30px;opacity:1}to{bottom:0;opacity:0}}</style>" ).appendTo( "head" );
            var x = document.getElementById("snackbar")
            x.className = "show";
            $('#snackMsg').text(msg);
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, timing);
        }
    }
    else{
        if(document.getElementById("snackbar") != null){
            $( "<style>#snackbar{visibility:hidden;min-width:250px;margin-left:-125px;background-color:"+alertColor+";color:#fff;text-align:center;border-radius:2px;padding:16px;position:fixed;z-index:1;left:90%;bottom:30px;font-size:17px}#snackbar.show{visibility:visible;-webkit-animation:fadein .5s,fadeout .5s 2.5s;animation:fadein .5s,fadeout .5s 2.5s}@-webkit-keyframes fadein{from{bottom:0;opacity:0}to{bottom:30px;opacity:1}}@keyframes fadein{from{bottom:0;opacity:0}to{bottom:30px;opacity:1}}@-webkit-keyframes fadeout{from{bottom:30px;opacity:1}to{bottom:0;opacity:0}}@keyframes fadeout{from{bottom:30px;opacity:1}to{bottom:0;opacity:0}}</style>" ).appendTo( "head" );

            var x = document.getElementById("snackbar")
            x.className = "show";
            $('#snackbar').text(msg);
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, timing);
        }
    }

    
}


/* A function to draw Visitor by Country GeoMap*/
function Visitorbycountrymap() {
    
    var data =  google.visualization.arrayToDataTable(visitor_cntry,false);
    var options = {domain:'IN', colorAxis:{colors: ['#F6DFD5', '#DD6104']},width:'328px',height:'205px'};
    var chart = new google.visualization.GeoChart(document.getElementById('country_div'));
    if($('.spread_tab li.active a').attr('href')=='#global') {
        chart.draw(data, options);
        country_map=1;
        document.getElementById('country_spinner').style.display="none";
    }
}
/* A function to draw Designation Chart*/ 
// function Visitorbydesignationchart() {
              
//     var obj = chartDetails.user_by_designation ;
//     var desgn_len=0;
//     for (key in obj) {
//         if (obj.hasOwnProperty(key)){
//             desgn_len++;
//         }
//     } 
//     if(desgn_len!=0)
//     {
//                     var visitor_desgn=new Array(); 
//                      visitor_desgn[0]=['Designation','Total_Count'];
//                      for(var i=0;i<desgn_len;i++)
//                      {
//                        visitor_desgn[i+1]=[obj[i].designation,parseInt(obj[i].total_count)];
//                      }
                 
//                      var desgn_data = google.visualization.arrayToDataTable(visitor_desgn,false);

//                      var options = {
//                                  title: 'Designation Spread',
//                                  legend: { position: "none" },
//                                  hAxis: {
//                               title: '',
//                               minValue: 0
//                               },
//                               vAxis: {
//                               title: ''
//                               }
//                              };
//                     var chart = new google.visualization.BarChart(document.getElementById('designation_div'));
//                     chart.draw(desgn_data, options);      
//                      document.getElementById('designation_spinner').style.display="none";
//                 }
                
                
//             }
function Visitorbycitychart() {
    
    var country_id;
    var country=['US','IN','UK','GB','DE','IT','BR','FR','CN','JP','PH','NL','ID','MX','PK','CA','ES','ZA','RU','AU','NG','PL','MY','BE','TR','IR','TH','RO','GR','SE','CO'];
    var index=$.inArray($('#CountryId').val(),country); 
    if(index!=-1) {
        if(visitor_city) {
            if($('#CountryId').val()=='UK') {
                country_id='GB';
            }
            else {    
                country_id=$('#CountryId').val();
            }
            var data =  google.visualization.arrayToDataTable(visitor_city,false);
            var options = {region: country_id,displayMode: 'markers',colorAxis: {colors: ['#F6DFD5', '#DD6104']}, domain:'IN'};
            var chart = new google.visualization.GeoChart(document.getElementById('city_div'));
            if($('.spread_tab li.active a').attr('href')=='#home') {
                chart.draw(data, options); 
                city_chart=1;
                document.getElementById('city_spinner').style.display="none"; 
            }          
        }
        else{
            city_chart=1;
            document.getElementById('city_spinner').style.display="none"; 
            document.getElementById('city_div').innerHTML="No visitor found from "+$('#countryName').val()+".";  
            $('#city_div').addClass('text-primary margin');   
        }
    } 
}
/* Jquery  to draw Visitor by City GeoMap*/
function setEmailValue(value){
    if(value === undefined) 
        value = $("#userEmailCopy").val() ;
    $("#TenTimes-Modal #userEmail").val(value);
}

function exhibitConnect(dis,exhibitorId,source,statusFlag) {
    if(dis!=""){
         gaEvent("Company","Exhibitor Connect");
         if(statusFlag == 2){
            if(page_type=='thankyou_new'){
                customEventGA("Company","Follow","Thankyou Page | Exhibitor | Follow");
            }else
            customEventGA("Company","Follow","Event detail | Exhibitor | Follow");    
         }
         else{
            if(page_type=='thankyou_new'){
                customEventGA("Company","Exhibitor Connect","Thankyou Page | Exhibitor | Schedule Meeting");
            }else
            customEventGA("Company","Exhibitor Connect","Event detail | Exhibitor | Schedule Meeting");
         }
    }
    if(exhibitorId != "" )
        exhibitorData.id = exhibitorId ;
    if(statusFlag == undefined){
        statusFlag=1;
    }
    if(statusFlag != "")
        exhibitorData.statusFlag = statusFlag;   
    
    var from = source ;
    if(getParameterByName('from')){
        from = source+'_'+getParameterByName('from') ;
    }else if(getParameterByName('source')){
        from = source+'_'+getParameterByName('source') ;
    }
    if(page_type=="thankyou_new"){
        from = source;
    }
    if((getCookie('user') && getCookie('user') != "") || (getCookie('user_token') && getCookie('user_token') != "")){
        showloading('list',exhibitorId);
        var postData = {} ;
        postData.action ='exhibitorconnect' ;
        postData.exhibitor = exhibitorId ;
        postData.status = "1" ;
        if(exhibitorData.statusFlag != undefined)
            postData.status = exhibitorData.statusFlag;
        if($("#exhibitorNewPage").length > 0) {
            postData.source = "exhibitor_ed" ;
        }
        else {
            postData.source = from;
        }
        if(getEventId()=='142646' || getEventId()=='7339'){
            if(from!=''){
                postData.source = from ;
            }   
        }
        $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: postData,async: true, // change it
            beforeSend: function(){},
            ajaxSend: function(){},
            complete: function(){},
            success: function(A) {
                var result = $.parseJSON(A) ;
                if(result.status==1 && result.userData.userExists==0)
                    gaEvent("User","Registration");

                SubmitFilter(dis,'exhibitorconnect');
                if(result.connectRelation == "Already"){
                    $("a[data-user-id='"+exhibitorId+"']").text(' Already Scheduled');
                }
                else
                    $("a[data-user-id='"+exhibitorId+"']").text(' Meeting Scheduled');
                hideloading('list',exhibitorId);
                pingUser(result);
                $('#TenTimes-Modal').modal('hide');
                //$(dis).removeClass('fa-heart-o').addClass('text-orange fa-heart').css('text-decoration','none');
                $("a[data-user-id='"+exhibitorId+"-time']").removeClass('dis-non');
                $("a[data-user-id='"+exhibitorId+"']").removeClass('fa-plus').addClass('text-orange fa-check').css({'text-decoration':'none','cursor':'default'}).removeAttr('onclick');
                checkEditionRegistration('exhibitor_attend');
                if($("#exhibitorNewPage").length > 0 || page_type=='thankyou_new') {
                    exhibitorconnectCallBack(result,exhibitorId,statusFlag,'response',dis);
                }
            }
        });
        //hitAuth(data,'oneClickAttend',source,'',I);

    }else{
       verifySigninTT('login','exhibitorconnect');
    }
}
function exhibitorEnquiry(dis,exhibitorId,source){
    if(exhibitorId != "" )
        exhibitorData.id = exhibitorId ;
    var from = source ;
    if(getParameterByName('from')){
        from = source+'_'+getParameterByName('from') ;
    }
    if(page_type=="thankyou_new"){
      from = source;
    }
    if((getCookie('user') && getCookie('user') != "") || (getCookie('user_token') && getCookie('user_token') != "")){

        var data = {
            user_id:getCookie('user'),
            user_token:getCookie('user_token'),
            entity_id: exhibitorId,
            source : from,
        };

        $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: data,async: true, // change it
            beforeSend: function(){},
            ajaxSend: function(){},
            complete: function(){},
            success: function(A) {
                $('#_modal_close').removeAttr("onclick");
                result = $.parseJSON(A);
                if(result.userData.name!=null&&result.userData.city!=null && result.userData.designation!=null){

                    exhibitorEnquiryHelper(dis,exhibitorId,source);


                }
                else{

         if(result.status==0 && typeof result.error.invalidData != 'undefined' &&(result.userData.name==null ||result.userData.city==null|| result.userData.designation==null)) {
             var flagmobile=0;

         if(flagmobile==0){
            $( ".modal-backdrop" ).removeClass('modal-backdrop');
            showloading();
            var attendInput = ['fields','title','subtitle','actionName','actionLabel'];
            attendInput['fields'] = ['name','user','city','company','designation','phone'];
            attendInput['title'] = 'Please fill up your details';
            attendInput['subtitle'] = '';
            attendInput['actionName'] = "InterestRegisterForm("+exhibitorId+")";
            attendInput['actionLabel'] = 'Submit';
            getForm(function (modalHtml){
            $("#modalData").html(modalHtml.mainHtml);
            clickCompany();
            if(!document.getElementById('userSource')){
               $("#TenTimes-Modal").append(addHidden('user_source','userSource',''));
            }
            $("#TenTimes-Modal").modal("show");
            postFormOpenSettings(result.userData.country);
            vcardopen(result.userData.name,'',result.userData.designation,result.userData.userCompany,result.userData.cityName,result.userData.countryName,'',result.userData.id,result.userData.profilepicture,'');
            $("#TenTimes-Modal #userSource").val(source);
            hideloading();
            openform();
            $("#TenTimes-Modal #userName").val('');},attendInput,'interest');
          }
            }

                }

    }
});

}
else{
       verifySigninTT('login','exhibitorenquiry');
    }
}

function exhibitorEnquiryHelper(dis,exhibitorId,source){
    if(page_type=="thankyou_new"){
        customEventGA("Company","Enquiry","Thankyou Page | Exhibitor | Bookmark");
    }else if(dis!=""){
        customEventGA("Company","Enquiry","Event Detail | Exhibitor | Request Brochure");
    }
    if((getCookie('user') && getCookie('user') != "") || (getCookie('user_token') && getCookie('user_token') != "")){
        showloading('list',exhibitorId);
        var postData = {} ;
        postData.action ='enquiry' ;
        postData.entity_id = exhibitorId ;
        postData.entity_type='exhibitor';
        postData.user='id_'+getCookie("user")+'_2';
        postData.event_id=$("#eventID").val();
        postData.source = source ;
        postData.message = "";
        $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: postData,async: true, // change it
            beforeSend: function(){},
            ajaxSend: function(){},
            complete: function(){},
            success: function(A) {
                var result = $.parseJSON(A) ;
                if(result.status==1){
                    $('#TenTimes-Modal').modal('hide');
                    if(page_type!="thankyou_new")
                    exhibitConnect(dis,exhibitorId,'exhibitor',2);
                    exhibitorEnquiryCallBack(exhibitorId);
                }
            }

        });
    }else{
       verifySigninTT('login','exhibitorenquiry');
    }
}
























function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function ExhibitorRegisterForm(exhibitorId,source) {
    $("#phoneDiv").show();
    if($.trim($("#TenTimes-Modal #userCompany").val()) == "" && $.trim($("#TenTimes-Modal #userDesignation").val()) == "" )
        $("#checkDiv").show();
    if(!$("#TenTimes-Modal #individualCheckBox").is(":checked") && $.trim($("#TenTimes-Modal #userCompany").val()) == "")
        $("#desiDiv").show();
    var from = source ;
    if(getParameterByName('from')){
        from = source+'_'+getParameterByName('from') ;
    }
    showloading();
    var B = validateFormData('attend');
    hideloading();
    if (!B) {
        return false
    } else {
        showloading('list',exhibitorId);
        var aiValue = 0;
        if($("#TenTimes-Modal #aiCheckBox").is(":checked")) // change
            aiValue = 1;
        var data = {
            metadata: $("#TenTimes-Modal #userMetadata").val(),
            name: $("#TenTimes-Modal #userName").val(),
            designation: $("#TenTimes-Modal #userDesignation").val(),
            company: $("#TenTimes-Modal #userCompany").val(),
            city: $("#TenTimes-Modal #userCity").val(),
            place_id: $("#TenTimes-Modal #place_id").val(),
            country: $("#TenTimes-Modal #userCountry").val(),
            email: $("#TenTimes-Modal #userEmail").val(),
            phone: $("#TenTimes-Modal #userMobile").val(),
            phoneCode: $("#TenTimes-Modal #phoneCode").html(),
            source: from,
            HTTP_REFERER: location.href,
            facebookId: $("#TenTimes-Modal #userFacebookId").val(),
            linkedinId: $("#TenTimes-Modal #userLinkedinId").val(),
            individual: $("#TenTimes-Modal #individualCheckBox").is(":checked"),
            website: $("#TenTimes-Modal #userWebsite").val(),
            action: 'exhibitorconnect',
            status: '0',
            exhibitor:exhibitorId,
            userVerified:1,
        };

        $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: data,async: true, // change it
            beforeSend: function(){},
            ajaxSend: function(){},
            complete: function(){},
            success: function(A) {
                 $('#_modal_close').removeAttr("onclick");
                hideloading();
                var result = $.parseJSON(A) ;
                if(result.status==0 && typeof result.error.invalidData != 'undefined' && typeof data.email != 'undefined' ) {
                    $.each(result.error.invalidData, function( key, value ) {
                      if(value.what == 'account-deactivated'){
                        window.location.assign(site_url_attend + "/deactivation/"+result.userData.id);
                        return;
                      }
                    });
                }
                pingUser(result);
                if(result.status==1 && result.userData.userExists==0)
                    gaEvent("User","Registration");
                if(result.connectRelation == "Already"){
                    $("a[data-user-id='"+exhibitorId+"']").text(' Already Scheduled');
                }
                else
                    $("a[data-user-id='"+exhibitorId+"']").text(' Meeting Scheduled');
                $('#TenTimes-Modal').modal('hide');
                $("a[data-user-id='"+exhibitorId+"']").removeClass('fa-plus').addClass('text-orange fa-check').css('text-decoration','none').removeAttr('onclick');
                $("a[data-user-id='"+exhibitorId+"-time']").removeClass('dis-non');
                checkEditionRegistration('exhibitor_attend');
            }
        });
    }
}
function checkEditionRegistration(from){
    var eventEdition='';
    if((pageType !== undefined && pageType == "thankyou_new")){
        eventEdition=$("#edition_id").val();
    }else{
        eventEdition=$("#eventEdition").val();
    }
    $.ajax({ type: "GET",url: site_url_attend+"/ajax?for=edition&sender="+getCookie('user')+'&edition='+eventEdition,async: true, // change it
        beforeSend: function(){},
        ajaxSend: function(){},
        complete: function(){},
        success: function(A) {
            switch(A){
                case 'false':
                    switch (from){
                        case 'exhibitor_attend':
                            var data = { user_id:getCookie('user'), event_id: getEventId(), source: from, action:getAction(from), ai_value:0, user_token:getCookie('user_token') };
                            hitAuth(data,from,from,data,'') ;
                        break;
                    }
                default:;
            }
        }
    });
}
function exhibitSchedule(exhibitorId) {
    var html = '<div class="modal fade" id="TenTimes-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog modal-500" role="document"> <div class="modal-content modal-primary"><div class="modal-header text-center"> <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> <h3 class="modal-title" id="myModalLabel">Set Date & Time</h3> </div><div class="modal-body tentimes-form"><div class="row"><form >';
    var dateArray = $('#dateList').val().split(',') ;
    if(dateArray.length > 0 ) { 
        var date1 = new Date();
        var dateArrayNew =[]; 
        for(var i = 0; i < dateArray.length; i++) {
            var date2 = new Date(dateArray[i]);
            var timeDiff = date2.getTime() - date1.getTime();
            var dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if(dayDiff >= 0 ){
                dateArrayNew.push(dateArray[i]);
            }
        }
        dateArray = dateArrayNew
    }
    if(dateArray.length > 0 ) {
        html+='<style type="text/css">.h-scroll-box{display: inline-block;margin: 5px;border: 1px solid #e7e7e7;background-color: #fff;padding: 10px;}.h-scroll-box:first-child{margin-left: 0!important}.h-scroll-box:last-child{margin-right: 0!important}</style><div style="overflow: hidden;position: relative;width: 99.7%;"><div class="h-scroll" style="overflow-x: auto;white-space: nowrap;width:inherit;overflow-y: hidden;'
        if(dateArray.length > 5){
            html+='margin-bottom:-20px';
        }
        html+='"><ul style="padding: 0; margin-bottom: 5px;text-align:center;">';
        for(i=0; i<dateArray.length; i++) {
            if(i==0){
                html+='<li class="h-scroll-box engageAction date-time-selected" data-action="dateTimeChanged" style="font-weight:bold;cursor:pointer;">'+dateArray[i].split(" ")[0]+' '+dateArray[i].split(" ")[1]+'<br>'+dateArray[i].split(" ")[2]+'</li>'
            }
            else{
                html+='<li class="h-scroll-box engageAction" data-action="dateTimeChanged" style="font-weight:bold;cursor:pointer;">'+dateArray[i].split(" ")[0]+' '+dateArray[i].split(" ")[1]+'<br>'+dateArray[i].split(" ")[2]+'</li>'
            }       
        }
        html+='</ul></div>';


        if(dateArray.length > 5) {
             html+='<div class="h-scroll-left" style="height:100%;position: absolute; left: 0px; top: 0.1em; padding: 5px 1px; font-size: 1.8em; background-color: rgb(245, 245, 245); color: rgb(119, 119, 119); box-shadow: rgb(245, 245, 245) 10px 0px 5px 0px, rgb(245, 245, 245) 20px 0px 22px 0px; cursor: pointer; display: none;"><i  style="vertical-align: -webkit-baseline-middle;" class="fa fa-angle-left fa-lg"></i></div><div class="h-scroll-right" style="height:100%;position: absolute; right: 0px; top: 0.1em; padding: 5px 1px; font-size: 1.8em; background-color: rgb(245, 245, 245); color: rgb(119, 119, 119); box-shadow: rgb(245, 245, 245) -10px 0px 5px 0px, rgb(245, 245, 245) -20px 0px 22px 0px; cursor: pointer; display: block;"><i style="vertical-align:-webkit-baseline-middle;" class="fa fa-angle-right fa-lg"></i></div>'
        }
        else{
            html+="</div>";
        }
        showloading();
        dynamicSlotExhi(function(){
            hideloading();
            if(eventSlotTiming!=''){
                html+='</tr></table></div><table style="margin:20px 0px"><tr>';
                var currentDate=new Date().toLocaleDateString(); 
                var st1=new Date(currentDate+" "+eventSlotTiming[0].Start_time);
                var startTime=st1.getTime();
                var ed1=new Date(currentDate+" "+eventSlotTiming[0].end_time);
                var endTime=ed1.getTime();
                var slotDiff=Math.ceil((endTime-startTime) /3600);
                slotDiff=slotDiff/1000;
                for(var l=0;l<slotDiff;l++){
                    var s = new Date(startTime).toLocaleTimeString('en-US').replace(/:\d\d([ ap]|$)/,'$1');
                    var slotto1 = new Date(startTime).toTimeString().replace(/.*(\d{2}:\d{2}:\d{0}).*/, "$1").slice(0, -1) ;
                    var slotfrom1 = new Date(startTime+(60*60*1000)).toTimeString().replace(/.*(\d{2}:\d{2}:\d{0}).*/, "$1").slice(0, -1);
                    if(l<5){
                        html+='<td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged" data-val="'+slotto1+'" data-value="'+slotfrom1+'">'+s+'</td>';
                    }else{
                        if(l==5 || l==10)
                            html+='</tr><tr>';
                        html+='<td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged" data-val="'+slotto1+'" data-value="'+slotfrom1+'">'+s+'</td>';
                    } 
                    startTime=startTime+(60*60*1000);
                   
                }
                html += '</tr></table><button type="button" class="btn btn-lg btn-orange btn-block margin" onclick="return setMeeting('+exhibitorId+');">Submit</button></form ></div></div></div></div></div>';
            }else
            {

                if (getEventId()=='387059'){
                        html += '</tr></table></div><table style="margin:20px 0px"><tr><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged" data-val="12:00" data-value="13:00">12 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="13:00" data-value="14:00">01 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction date-time-selected" data-action="dateTimeChanged"  data-val="14:00" data-value="15:00">02 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="15:00" data-value="16:00">03 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="16:00" data-value="17:00">04 : 00 pm</td></tr><tr><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="17:00" data-value="18:00"> 5: 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="18:00" data-value="19:00">06 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="19:00" data-value="20:00">07 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="20:00" data-value="21:00">08 : 00 pm</td></tr></table>';
                        html += '<button type="button" class="btn btn-lg btn-orange btn-block margin" onclick="return setMeeting('+exhibitorId+');">Submit</button></form ></div></div></div></div></div>';
                    }
                    else{
                        html += '</tr></table></div><table style="margin:20px 0px"><tr><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged" data-val="09:00" data-value="10:00">09 : 00 am</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="10:00" data-value="11:00">10 : 00 am</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction date-time-selected" data-action="dateTimeChanged"  data-val="11:00" data-value="12:00">11 : 00 am</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="12:00" data-value="13:00">12 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="13:00" data-value="14:00">01 : 00 pm</td></tr><tr><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="14:00" data-value="15:00">02 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="15:00" data-value="16:00">03 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="16:00" data-value="17:00">04 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="17:00" data-value="18:00">05 : 00 pm</td><td style="padding:5px 5px"><span style="border:2px solid #ccc;border-radius:5px;display:block;text-align:center;font-size:small;cursor:pointer" class="engageAction" data-action="dateTimeChanged"  data-val="18:00" data-value="19:00">06 : 00 pm</td></tr></table>';
                        html += '<button type="button" class="btn btn-lg btn-orange btn-block margin" onclick="return setMeeting('+exhibitorId+');">Submit</button></form ></div></div></div></div></div>';
                        }

            }

             
           $("#modalData").html(html);
           $("#TenTimes-Modal").modal("show");
           if(page_type=='thankyou_new'){
            userActionSyncExhi();
           }else{
            userActionSync();
            scroller();
            }
        });
    }     
}

function dynamicSlotExhi(callback){
    if(eventSlotTiming=='' && eventSlotTimingFlag==true){
        $.ajax({type: "GET",url: site_url_attend+'/ajax?for=eventDataAbout&event='+getEventId(),
            success: function(result){
               var result=$.parseJSON(result);
                if(typeof result.data.timing!='undefined'){
                    if(result.data.timing.length<2){
                    eventSlotTiming=result.data.timing;
                    eventSlotTimingFlag=false;
                   }
                   callback();
                }else{
                    callback();
                }
            }
        });
    }else{
        callback();
    }
}

function setMeeting(exhibitorId) {
    showloading('list',exhibitorId+"-time");       
    var date = $('#TenTimes-Modal .date-time-selected:first').html();
    date = date.replace("<br>"," ")
    var time = $('#TenTimes-Modal .date-time-selected:last').attr('data-val');
    var postData = {} ;
    postData.meeting = date+" "+time;
    postData.time = $('#TenTimes-Modal .date-time-selected:last').attr('data-value');
    postData.action ='exhibitorconnect' ;
    postData.exhibitor = exhibitorId ;
    postData.status = "1" ;
    if($("#exhibitorNewPage").length > 0) {
        postData.source = "exhibitor_ed" ;
    }
    else {
        postData.source = 'exhibitor' ;
    }
    $.ajax({ type: "POST",url: site_url_attend+"/registeruser",data: postData,async: true, // change it
        beforeSend: function(){$('#TenTimes-Modal').modal('hide');},
        ajaxSend: function(){},
        complete: function(){},
        success: function(A) {
            hideloading('list',exhibitorId+"-time");
            //$(dis).removeClass('fa-heart-o').addClass('text-orange fa-heart').css('text-decoration','none');
            $("a[data-user-id='"+exhibitorId+"']").removeClass('fa-plus').addClass('text-orange fa-check').css({'text-decoration':'none','cursor':'default'}).removeAttr('onclick');
            $("a[data-user-id='"+exhibitorId+"-time']").removeClass('fa-calendar-plus-o').addClass('fa-calendar-check-o').css({'text-decoration':'none','cursor':'default'}).removeAttr('onclick');
            if($("#exhibitorNewPage").length > 0 || page_type=="thankyou_new") {
                exhibitorSetMeetingCallBack(exhibitorId);
            }

        }
    });
}
/*  From 10t_event_detail_desktop.js to 10t_engage.js -- Start*/
function exhibitorSetMeetingCallBack(exhibitorId) {
    if(page_type=='thankyou_new'){
        $("#connect-"+exhibitorId+".exhibitorConnect").removeClass("btn-orange fa-check").addClass("btn-default disabled");
        $("#connect-"+exhibitorId+".exhibitorConnect").html("<i class='fa fa-check text-success' style='font-size:12px;'></i> Request Sent");
    }else{
        $("#connect-"+exhibitorId+".exhibitorConnect").html("<i class='fa fa-check text-success'></i> Request Sent");
        $("#connect-"+exhibitorId+".exhibitorConnect").removeClass("btn-orange").addClass("btn-default disabled");
    }
    if($("#connect-"+exhibitorId+".exhibitorConnect").text().trim()=="Request Sent" && pageType=="about")
            $("#connect-"+exhibitorId+".exhibitorConnect").next().css('margin-left','14%');

    $("#connect-"+exhibitorId+".exhibitorConnect").css({'opacity': '1','color': '#333'});
}
/*  From 10t_event_detail_desktop.js to 10t_engage.js -- End*/
function showExhibitorList(){
    var event_id = getEventId() ;
    switch(event_id){
        case '181465':
        case '112731':
        case '633':
        case '7339':
            return false ;
        break;
        default:
            $('#show_data').removeClass('hide');    
            $('#filter_spinner').addClass('hide');
            return false ;
        ;
    }
}
function subscribe(I, source) {
  let email = document.getElementById('user-email').value;
  let param = {
    pageType: pageType,
    for: 'subscribeevent'
  };

  switch(source) {
    case 'subscribe_homepage_join':
      emaail = $(I).parent().parent().find('input').val()
    break;

    case 'modalclose':
      email = $(I).parent().find('input').val();
    break;
  }
    
  request({
    method: 'POST',
    url: '/ajax/modaldata',
    data: param
  })
  .then(msg => {
    msg = JSON.parse(msg);
    addHTML({
      selector: 'collections_box',
      html: msg.mainHtml,
    })

    hideloading();
    
    if (!validateEmail12345(email)) {
      document.getElementById('user-email').classList.add('border-danger');
      return false ;
    } else {
      document.getElementById('user-email').classList.remove('border-danger');
      let data = {
        email: email,
        source: source,
        action: 'follow',
        listing_id: 1
      };
      showloading();
      hitAuth(data, 'subscribe', source, '', I);
    }
  })
  .catch(err => {
    console.log(err);
    showToast('Something went wrong!!!');
  })
}
function subscribeResponse(result,source,dis){
    if(source=='subscribe_homepage_join'){
        $('#loginHide1').html('<i class="fa fa-fw fa-check"></i> SUBSCRIBE').addClass('btn-success').removeClass('btn-orange').attr('disabled','disabled').removeAttr('onclick');
        $(dis).html('<i class="fa fa-fw fa-check"></i> SUBSCRIBE').addClass('btn-success').removeClass('btn-orange').attr('disabled','disabled');
        $('#subs-submit').html('<i class="fa fa-fw fa-check"></i> SUBSCRIBE').addClass('btn-success').removeClass('btn-orange').attr('disabled','disabled');
    }else{
        $('#loginHide1').html('<i class="fa fa-fw fa-check"></i> SUBSCRIBE').addClass('btn-success').removeClass('btn-orange').attr('disabled','disabled').removeAttr('onclick');

        $('#subs-submit').html('<i class="fa fa-fw fa-check"></i> SUBSCRIBE').addClass('btn-success').removeClass('btn-orange').attr('disabled','disabled');
    }
    $('form #userEmail').val('').attr('disabled','disabled');
    $('#userEmail').css('border', '1px solid #ccc');
    return false ;
}
function startInitFb(){
    if(user.country.id != "CN" && typeof(FB) != "undefined")
        FB.init({appId: "172404889604820",cookie: true,version: 'v3.2'});
}
function browseCountry() {
    cursorloading(1);
    $.ajax({type: "GET",url: site_url_attend+'/ajax?for=venue_country',
    success: function(result){
        var data = $.parseJSON(result) ;
        var attendInput = ['title','subtitle'];
        attendInput['title'] = 'SELECT COUNTRY';
        attendInput['subtitle'] = '';
        attendInput['fields'] = ['email'];
        getForm(function (modalHtml){
        $("#modalData").html(modalHtml.mainHtml);
        $("#TenTimes-Modal").modal("show");
        var appendData = '' ;
        for (var i = 0; i < data['data'].length;) {
            appendData += '<tr>';
            if(deviceModel != 0){
                for(var j = 0; j < 3; j++){
                    if(data['data'][i] == null){
                        appendData += '<td></td>';
                        continue;
                    }
                    if (data['data'][i].id == 'UK') {
                        data['data'][i].id = 'GB';
                    }
                    appendData += '<td><i class="flag-icon mr-5 flag-icon-'+(data['data'][i].id).toLowerCase()+'"></i>&nbsp;<a href="'+data['data'][i].url+'">'+data['data'][i].name+'</a> <small class="float-end">'+data['data'][i].count+' '+'</small></td>' ;
                    i++;    
                };
            }else{
                if (data['data'][i].id == 'UK') {
                        data['data'][i].id = 'GB';
                    }
                appendData += '<td><i class="flag-icon mr-5 flag-icon-'+(data['data'][i].id).toLowerCase()+'"></i>&nbsp;<a href="'+data['data'][i].url+'">'+data['data'][i].name+'</a> <small class="float-end">'+data['data'][i].count+' '+'</small></td>' ;
                i++;
            }
            appendData += '</tr>';
        };
        appendData = '<table class="table table-striped table-bordered">'+appendData+'</table>';
        $("#TenTimes-Modal .modal-body").html(appendData);
        },attendInput,'browse-country');     
        
    },
    error: function(err) {},complete: function(){cursorloading(0);}});
}
function cursorloading(status){
    if(status)
        $(document.body).css({'cursor' : 'wait'});
    else
        $(document.body).css({'cursor' : 'default'});
}
function searchVenue(dis){
    if($.trim($("#"+dis).val()) == ""){
        $("#"+dis).val('') ;
        return false;
    }
    window.location.href = "//10times.com/search?cx=partner-pub-8525015516580200%3Avtujn0s4zis&cof=FORid%3A10&ie=ISO-8859-1&searchtype=venues&q="+encodeURIComponent($.trim($("#"+dis).val()));
    return false;
}
function continueScroll(){
    if(signUpScrollFlag != 1 )
        return false;
    if("undefined" == typeof scrollType)
        scrollType = '';
    switch(scrollType){
        case 'visitors-scroll':
            page = page + 1 ;
            requestFlag = true;
            lastAddedExhibitors();
            break ;
        case 'venue-listing-scroll':
            requestFlag = true;
            if(typeof lastAddedLiveFuncVenue === "function"){
                lastAddedLiveFuncVenue();    
            }
            break;   
        case 'email':
        default :
            if($("#exhibitorNewPage").length>0){
                exhibitorsFilterData("","","loadMore");
            }
        return false;
    }
}

function signInTT(source,type,from) {
    //if($('.sidebar-left').hasClass('sidebar-open'))
    //   $('.sidebar-left').removeClass('sidebar-open');
    if("undefined" == typeof scrollType)
        scrollType = '';
    if("undefined" == typeof type || type.search('scroll') == -1 )
        signUpScrollFlag = 0 ;
    else 
        signUpScrollFlag = 1 ;
    if(getCookie('user') && getCookie('user') != "") {
        if(pageType=='VenueCityListing' || pageType=='venueListing'){
            if(typeof lastAddedLiveFuncVenue === "function"){
                lastAddedLiveFuncVenue();    
            }
        }
        else{
            $("#TenTimes-Modal").modal("hide");
            getLoggedInDataN();
            showToast("You are successfully logged In!",'#43C86F');
            removeBackdropModal();
        }
    }
    else
    {   
        var titleSignIn="";
        if(signUpScrollFlag==1){
            dataLayer.push({'gaLabel': 'onScroll'});
            if(type == 'scroll')
                titleSignIn = 'Sign in to unlock more venues';
            else{
                if($("#pageType").val() == 'visitors'){
                    titleSignIn = 'Sign in to view more users';
                }
                else {
                    titleSignIn = 'Sign in to view more '+$("#pageType").val();    
                }
            }     
        }

        else {
            gaEvent("User","Login");
        }
        if(typeof from!='undefined' && from=='journey')
            verifySigninTT('login','signup',titleSignIn,'journey');
        else    
            verifySigninTT('login','signup',titleSignIn);
        
        // startInitFb();
        // var attendInput = ['title','subtitle'];
        // attendInput['title'] = 'Sign up / Login';
        
        // if(type == 'scroll')
        //     attendInput['title'] = 'Sign In to unlock more venues';
        // else if(signUpScrollFlag == 1)
        //     attendInput['title'] = 'Sign-in to view more visitors' ;

        // attendInput['subtitle'] = '';
        // attendInput['fields'] = ['email'];
        // attendInput['actionName'] = "registerSignInTT('"+source+"','email')";
        // attendInput['actionLabel'] = 'Next';
        // modalHtml = getForm(attendInput,'signup');
        // $("#modalData").html(modalHtml);
        // $("#TenTimes-Modal").modal("show");
        // $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
        // $('#TenTimes-Modal .material-form').addClass('text-center').removeClass('material-form');
        // $('#TenTimes-Modal .fa-envelope').replaceWith(function() { return "<p class='ico fa-envelope'></p>"; });
        // $('#TenTimes-Modal #userEmail').attr('placeholder','Enter email to login');
        // if($("#TenTimes-Modal form").next('.social').length < 1){
        //     $('#TenTimes-Modal form').after('<p class="social"><small>-- or quick & easy login using -- </small></p><a href="javascript:void(0)" onclick="fbLogin_combined(\'signupTT\');" class="btn btn-lg btn-default fb-login-btn" style="margin-top:10px!important"><i class="fa fa-fw fa-facebook" style="color:#3b5998;"></i></a> <a href="javascript:void(0)" onclick="gLogin_combined(\'signupTT\');" class="btn btn-lg btn-default gplus-login-btn" style="margin-top:10px!important;"><i class="fa fa-fw fa-google-plus" style="color:#E24825;"></i> </a> <a href="javascript:void(0)" onclick="linkedin_combined(\'signupTT\');" class="btn btn-lg btn-default in-login-btn" style="margin-top:10px!important"><i class="fa fa-fw fa-linkedin" style="color:#0077b5;"></i></a><input id="userLinkedinId" class="userLinkedinId" value="" type="hidden"><input id="userMetadata" class="userMetadata" value="" type="hidden"><input id="userFacebookId" class="userFacebookId" value="" type="hidden">') ;
        //     $('#TenTimes-Modal form').css({"margin-bottom":"14px"});
            // $('#TenTimes-Modal a').find(".fa-facebook").parent().css({"font-size":"18px","min-width":"140px","margin-right":"0px","padding":"10px 16px"}) ;
            // $('#TenTimes-Modal a').find(".fa-google-plus").parent().css({"font-size":"18px","min-width":"140px","margin-right":"0px","padding":"10px 16px"}) ;
            // $('#TenTimes-Modal a').find(".fa-linkedin").parent().css({"font-size":"18px","min-width":"140px","margin-right":"0px","padding":"10px 16px","margin-top":"10px!important"}) ;
        // }
        // if($("#TenTimes-Modal .tentimes-form").next('.text-center').length < 1){
        //     $('#TenTimes-Modal .tentimes-form').after('<div class="text-center"><u><a href="https://login.10times.com">are you an organizer? login to oDASH</a></u></div>');
        // }
        // $('#TenTimes-Modal .alert_email').addClass('float-start');
        // $("#TenTimes-Modal #userSource").val(source);
        // if(type != "" )
        //     $("#TenTimes-Modal #userSource").val(type) ;
        // socialRegistration();
        // doNotReferesh();
        // removeBackdropModal();
    }
}
var flagmodallogin=0;

function verifySigninTT(form, method, titleSignIn, from) {
  switch(method) {
    case "fb":
      loggedIn(form, "fb");
    return;

    case "li":
      loggedIn(form, "li");
    return;

    case "gm":
      loggedIn(form, "gplus");
    return;
  }

  var methodOrig = method;
  if(method.search(/attendNew/) > -1) {
    methodOrig = method.replace("attendNew_", "");
    methodOrig = getAction(methodOrig);
  }

  startInitFb();

  var attendInput = ['title', 'subtitle'];
  attendInput['title'] = typeof titleSignIn != 'undefined' && titleSignIn!="" ? titleSignIn : 'Login / Sign up';
  attendInput['subtitle'] = '';
  attendInput['fields'] = ['email'];
  attendInput['actionName'] = "gaEvent('User', 'Login Popup Next'); verifyRegisterSignInTT('" + form + "','" + method + "', 'email');";
  attendInput['actionLabel'] = 'Next';
  attendInput['methodOrig'] = methodOrig;
  attendInput['organizerName'] = (typeof gdprflag !== "undefined" && gdprflag == 1) ? $('#org-name').text() : 'the event organizer';

  getForm(function (modalHtml) {
    $("#modalData").html(modalHtml.mainHtml);
    gaEvent("User","Login Popup Open");
      
    $('#TenTimes-Modal .material-form').addClass('text-center').removeClass('material-form');
      
    if(form == 'login') {
      var policyCountryCode = user.country.id;
      if(policyCountryCode != '' && csntCon.indexOf(policyCountryCode) > -1 && getCookie('consent') != 10) {
        $('#TenTimes-Modal #userEmail').parent().after(modalHtml.userEmail1);
      } else {
        $('#TenTimes-Modal #userEmail').parent().after(modalHtml.userEmail2);
      }
    }

    if($("#TenTimes-Modal form").next('.social').length < 1){
      $('#TenTimes-Modal form').after(modalHtml.social);
      $('#TenTimes-Modal form').css({"margin-bottom":"14px"});
    }

    if(getCookie('fbid') != '') {
      $("#TenTimes-Modal").find('.social').css('display','none');
      $("#TenTimes-Modal").find('.fb-login-btn').remove();
      $("#TenTimes-Modal").find('.gplus-login-btn').remove();
      $("#TenTimes-Modal").find('.in-login-btn').remove();
    }

    $("#modalData #_modal_close").click(function(){
      if(getCookie('fbid')) deleteCookie('fbid');
    });

    if($("#TenTimes-Modal .tentimes-form").next('.text-center').length < 1){
      $('#TenTimes-Modal .tentimes-form').after(modalHtml.odash_login);
    }

    if(method != 'signup' || (typeof titleSignIn != 'undefined' && titleSignIn != '')) {
      $("#TenTimes-Modal").find('.odashl').hide();
    }

    if(((pageType == 'org_detail' || pageType=='venue_detail' || pageType=='VenueCityListing' ||pageType=='venueListing') && org_msg==1)){
      $("#TenTimes-Modal").find('.odashl').hide();
    }

    $("#TenTimes-Modal .alert_email").addClass('float-start');
    $("#TenTimes-Modal #userSource").val(method);

    if(form != "" ) $("#TenTimes-Modal #userSource").val(form) ;

    socialRegistration();
    doNotReferesh();
    removeBackdropModal();

    if(method == 'autofb' || method == 'autogplus' || method == 'autolinkedin') {
      if(getCookie('user') && getCookie('user') != "" && getCookie('user_token') && getCookie('user_token') != "") {
        getLoggedInDataN();
      } else{
        showloading();
        socialAll(method.replace('auto', ''),'signup', 'signup');
      }
    } else {
      if(typeof from != 'undefined' && from == 'journey') $('#TenTimes-Modal').append('<input type="hidden" id="fromUserJourney" value="1">');
      if($('#myContactsModal').length > 0) $('#_modal_close').click(function() {contactModalHtml.modalClose('remove')});
      $("#TenTimes-Modal").modal("show");

      removeBackdropModal();

      $('#TenTimes-Modal .policy-chk').click(function() {$(this).find('i').toggleClass('fa-square-o fa-check-square-o')});
    }
  }, attendInput, method, methodOrig);
}

function socialAll(type,method,from){
        $('#TenTimes-Modal').modal('hide');
        var inputList = ['fields'];
        var formHtml='';
        $("#TenTimes-Modal .tentimes-form").next('.text-center').hide();
        $("#TenTimes-Modal .tentimes-form").find('.fb-login-btn').hide();
        $("#TenTimes-Modal .tentimes-form").find('.gplus-login-btn').hide();
        $("#TenTimes-Modal .tentimes-form").find('.in-login-btn').hide();
        $("#TenTimes-Modal .tentimes-form").find('.social').hide();


        if(from=='connect' || from=='stall' || from=='attend'){
            inputList['fields'] = ['name','email','city','company','designation','phone','autointroduce'];
        }
        else{
            inputList['fields'] = ['name','email','city','company','designation','phone'];
        }
        if(inputList['fields'] != undefined){
            for (var i = 0; i < inputList['fields'].length; i++) {
                formHtml += getRow(inputList['fields'][i]);
            };
            $('#TenTimes-Modal .form-group').replaceWith(formHtml);
            $('#TenTimes-Modal .fa-user').replaceWith(function() { return "<p class='ico fa-user'></p>"; });
            $('#TenTimes-Modal .fa-map-marker').replaceWith(function() { return "<p class='ico fa-map-marker'></p>"; });
            $('#TenTimes-Modal .fa-building').replaceWith(function() { return "<p class='ico fa-building'></p>"; });
            $('#TenTimes-Modal .fa-phone').replaceWith(function() { return "<p class='ico fa-phone'></p>"; });
            $('#TenTimes-Modal .fa-briefcase').replaceWith(function() { return "<p class='ico fa-briefcase'></p>"; });
            $('#TenTimes-Modal .alert_city').addClass('float-start');
            $('#TenTimes-Modal .alert_name').addClass('float-start');
            $('#TenTimes-Modal .alert_company').addClass('float-start');
            $('#TenTimes-Modal .alert_designation').addClass('float-start');
            $('#TenTimes-Modal .alert_mobile').addClass('float-start');
            $('#TenTimes-Modal #aiDiv').addClass('float-start');
            hideloading();
            switch(type){
                case 'fb':
                    fbLogin_combined(method,from);
                    break;
                case 'gplus' : 
                    gLogin_combined(method,from);
                    break;
                case 'linkedin' : 
                    linkedin_combined(method,from);
                    break;
                default : break;      
            }

        }
    }

function nextPasswordScreen(result) {
  $("#TenTimes-Modal #userEmail").hide();
  $('#TenTimes-Modal .fa-envelope').remove();
  
  $("#TenTimes-Modal form button").before('<div class="form-group rel-position"> <input type="password" placeholder="Enter Password"  id="userPassword"><span class="undrr"></span><p class="ico fa-lock"></p><span class="text-danger alert_password "></span></div>');
  $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {registerSignInTT('signup','password');}).text('Submit').attr('disabled',false);
  $('#TenTimes-Modal .alert_password').addClass('pull-left');

  if(result && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('verified') && result.userData.verified != 1) {
    sendVerificationCode('email');
    if($("#TenTimes-Modal #userEmail").val() !== undefined)
      $('#TenTimes-Modal #userPassword').attr('placeholder', 'Enter Verification Code (Sent to '+$("#TenTimes-Modal #userEmail").val() + ')');
    else
      $('#TenTimes-Modal #userPassword').attr('placeholder', 'Enter Verification Code (Sent to your mail)');
  }

  $('#TenTimes-Modal .social').before('<a><span class="text-center" style="cursor:pointer" id="getpassword" onclick="forgotPassword(\'follow\');">Forgot Password</span></a>') ;
}

function verifyNextPasswordScreen(result, data) {
  from = data.from;
  method = data.method;
  var actionLabel = result.passwordHtml.Submit;
  addFunActionLabel = '';
  var email = $("#userEmail").val();
  $('#TenTimes-Modal').modal("hide");
  $("#modalData").html(data.modalHtml.mainHtml);
  $("#userEmail").val(email);
  $('#TenTimes-Modal').modal("show");
  $('#TenTimes-Modal .material-form').addClass('text-center').removeClass('material-form');
  
  if(result && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('verified') && result.userData.verified != 1) {
    addFunActionLabel = "Login OTP Verify";
  } else {
    addFunActionLabel = "Login Password Submit";
  }
switch(from) {
      case "login":
      case "contact_organizer_venue":
        if(result && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('userExists') && result.userData.userExists != 1) {
          actionLabel = result.passwordHtml.Verify;
          $("#TenTimes-Modal .modal-title").text('Sign up');
        } else if(result && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('verified') && result.userData.verified != 1) {
          actionLabel = result.passwordHtml.Verify;
        }

        var methodOrig = method;
        if(method.search(/attendNew/) > -1) {
          method = method.replace("attendNew_", "");
          method = getAction(method);
        }
        
        if(['attendNew_orgdetailswebsite_interest','attendNew_orgdetailscontact_interest','attendNew_orgdetailswebsite_bookmark','attendNew_orgdetailscontact_bookmark'].indexOf(methodOrig) > -1) method = methodOrig;

        if($('#myContactsModal').length > 0) {
          $('#_modal_close').click(function() {
            contactModalHtml.modalClose('remove')
          });
        }

        switch(method){
          case "connect":
            var attendInput = ['actionLabel'];
            attendInput['receiverName'] = receiverData.name;
            attendInput['receiverId'] = receiverData.id;
            attendInput['actionLabel'] = actionLabel;

            $("#TenTimes-Modal form button").removeAttr("onclick").click(function() { gaEvent("User",addFunActionLabel); LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
          break;

              case "attendNew_orgdetailswebsite_interest":
              case "attendNew_orgdetailscontact_interest":
              case "attend":
              case "stall":
              case "interest":
              case "going":
                  var attendInput = ['actionLabel'];
                  attendInput['actionLabel']=actionLabel;
                  $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
                  break;
              case "follow":
              case "bookmark":
              case "attendNew_orgdetailswebsite_bookmark":
              case "attendNew_orgdetailscontact_bookmark":
                  var attendInput = ['actionName','actionLabel'];
                  attendInput['actionLabel']=actionLabel;
                  if(sourceVs == 'followVs')
                  {   
                        $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method , sourceVs);}).text(attendInput['actionLabel']).attr('disabled',false);
                  }
                  else if(methodOrig.search(/orgdetails/) > -1)
                  {
                      $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(methodOrig);}).text(attendInput['actionLabel']).attr('disabled',false);
                  }
                  else
                  {
                    let btn = document.querySelector("#TenTimes-Modal form button");
                    btn.setAttribute('onclick', 'gaEvent("User", "' + addFunActionLabel + '");LoginRegisterForm("' + method + '")');
                    btn.textContent = attendInput['actionLabel'];
                    btn.disabled = false;
                  }
                  
                  break;
              case "speaker":
                  var attendInput = ['actionLabel'];
                  attendInput['actionLabel'] = actionLabel;
                  $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
                  break;
              case "signup":
                  var attendInput = ['actionLabel'];
                  //attendInput['actionLabel'] = 'Login Now';
                  attendInput['actionLabel']=actionLabel;
                  $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
                  break;
              case "follow page":
                  $( ".modal-backdrop" ).removeClass('modal-backdrop');
                  var attendInput = ['actionLabel'];
                  //attendInput['actionLabel'] = 'Login Now';
                  attendInput['actionLabel']=actionLabel;
                  $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
                  break;
              case "organizer":
                  $( ".modal-backdrop" ).removeClass('modal-backdrop');
                  var attendInput = ['actionLabel'];
                  //attendInput['actionLabel'] = 'Login Now';
                  attendInput['actionLabel']=actionLabel;
                  $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
                  break;
              case "exhibitorconnect":
                  $( ".modal-backdrop" ).removeClass('modal-backdrop');
                  var attendInput = ['actionLabel'];
                  //attendInput['actionLabel'] = 'Login Now';
                  attendInput['actionLabel']=actionLabel;
                  $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
                  break;
              case "venue_detail":
                  var attendInput = ['actionLabel'];
                  //attendInput['actionLabel'] = 'Follow Now';
                  attendInput['actionLabel']=actionLabel;
                  if(sourceVs == 'followVs')
                  {
                        $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method,sourceVs);}).text(attendInput['actionLabel']).attr('disabled',false);
                  }
                  else
                  {
                      $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
                  }
                  break;
              break;
              default:
                    //$( ".modal-backdrop" ).removeClass('modal-backdrop');
                  var attendInput = ['actionLabel'];
                  //attendInput['actionLabel'] = 'Login Now';
                  attendInput['actionLabel']=actionLabel;
                  $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent("User",addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
              
          }
          $('#TenTimes-Modal .alert_password').addClass('pull-left');
          var uType='V';
          if(result && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('verified') && result.userData.verified!=1 ){
                  sendVerificationCode('email');
                  if($("#TenTimes-Modal #userEmail").val() !== undefined)
                      $('#TenTimes-Modal #userPassword').attr('placeholder',''+result.passwordHtml.OTP+$("#TenTimes-Modal #userEmail").val()+')')
                  else
                      $('#TenTimes-Modal #userPassword').attr('placeholder',result.passwordHtml.OTP_email);
                  gaEvent("User","Login OTP Open");

                uType='U';
          }
          else{
              gaEvent("User","Login Password Open");   
              
          }
          $("#TenTimes-Modal .partial-log").hide();
          if( (pageType=='org_detail' || pageType=='venue_detail' || pageType=='VenueCityListing' ||pageType=='venueListing') && org_msg==1)
          {
              if(from=='contact_organizer_venue'){
                  methodOrig='contact_organizer_venue';
              }
              else
                  methodOrig=pageType;
          }
          var forgotPasstext=result.passwordHtml.forgotpassword;
          var resText="";
          var func="showloading();gaEvent('User','Forgot Password Open');forgotPassword";
          if(result && result.hasOwnProperty('userData') && result.userData.hasOwnProperty('userExists') && result.userData.userExists!=1){
              uType='N';
          }
          
          if(uType=='U' || uType=='N'){
              forgotPasstext=result.passwordHtml.NotRecieve;
              resText=result.passwordHtml.ResendOTP;
              if(methodOrig=='signup' || methodOrig == "connect")
                  func="showloading();forgotPassword";
              else
                  func='partialLog';
          }

          

          $('#TenTimes-Modal form').after('<a class="d-inline-block no-decor mt-3">'+resText+'<span class="text-center" style="cursor:pointer;color:#335aa1;text-decoration:underline;font-size: 16px;" id="getpassword" onclick="'+func+'('+"'"+methodOrig+"','"+uType+'\');">'+forgotPasstext+'</span></a>') ;
          $('#TenTimes-Modal .social').hide();
          $('#TenTimes-Modal .fb-login-btn').hide();
          $('#TenTimes-Modal .gplus-login-btn').hide();
          $('#TenTimes-Modal .in-login-btn').hide();
          $("#TenTimes-Modal .tentimes-form").next('.text-center').hide();
          break;
      default:
          alert("Sorry there is an error in the system. Try again.");
  }
}

function verifyRegisterSignInTT(from, method, action){
  var methodOrig = method;
  if(method.search(/attendNew/) > -1) {
    methodOrig = method.replace("attendNew_", "");
    methodOrig = getAction(methodOrig);
  }

  var attendInput = ['title', 'subtitle'];
  attendInput['title'] = 'Login';
  attendInput['subtitle'] = '';
  attendInput['fields'] = ['password'];
  attendInput['actionName'] = '';
  attendInput['actionLabel'] = 'Submit';
  attendInput['methodOrig'] = methodOrig;
  attendInput['organizerName'] = (typeof gdprflag !== "undefined" && gdprflag == 1) ? $('#org-name').text() : 'the event organizer';

  getForm(function(modalHtml) {
    var data = {};
    switch(action){
      case 'email' :
        hideError('email');
        hideError('cookie');
  
        if(!validateEmail12345($("#TenTimes-Modal #userEmail").val())) {
          $("#TenTimes-Modal #register_button").removeAttr("disabled");
          $("#TenTimes-Modal #userEmail").focus();
          showError('email', email_invalid);
          if($("#TenTimes-Modal #userEmail").val().trim() == ""){
            $("#TenTimes-Modal #userEmail").val('') ;
            showError('email', email_enter);
          }
          return false;
        }
  
        if($('#TenTimes-Modal .policy-chk i').length > 0) {
          if(!$('#TenTimes-Modal .policy-chk i').hasClass('fa-check-square-o')) {
            showError('cookie', 'We need your permission for registration')
            return false;
          }
        }
  
        userEmailLoggedin = $("#TenTimes-Modal #userEmail").val();
        data.email = $("#TenTimes-Modal #userEmail").val();
        data.source = typeof $('#fromUserJourney')!='undefined' && $('#fromUserJourney').length > 0 ? pageType + '_visitor_journey' : 'auto_save';
        data.action = 'signup';
        data.type = "email" ;
        data.script = "desktop";
        
        if(method.search(/attendNew_/) > -1) {
          data.event_id=eventData.id;
          if(eventData.eventEditionId != undefined) data.eventEditionId = eventData.eventEditionId;
          data.source = 'autosubmit' + getOneClickSource(getAction(method)) + '_' + pageType;
          data.action = getAction(method);
        } else if(method == 'connect') {
          data.event_id = eventData.id;
          data.source = method;
          data.ai_value = 1;
          data.action = 'attend';
          data.receiver = receiverData.id;
        }
      break;
  
      case 'password' :
        hideError('password');
        if($("#TenTimes-Modal #userPassword").val() == "") {
          showError('password', 'Mandatory');
          return false;
        }
        data.email = $("#TenTimes-Modal #userEmail").val();
        data.password = $("#TenTimes-Modal #userPassword").val();
        data.source = $("#TenTimes-Modal #userSource").val();
        if(typeof scrollType != 'undefined' && scrollType != "" ) data.source = scrollType ;
        if(typeof pageType != 'undefined' && pageType != "" && data.source == "" ) data.source = pageType ;
        data.action = 'signup';
        data.type = "password" ;
      break;
    }
  
    var F = {};
    F = data;
    F.from = from;
    F.method = method;
    data.modalHtml = modalHtml;

    $("#TenTimes-Modal form button").html('<i class="fas fa-sync-alt fa-spin"></i>&nbsp;' + $("#TenTimes-Modal form button").text()).attr('disabled', 'disabled');
    hitAuth(data, 'verifysignupTT', $("#TenTimes-Modal #userSource").val(), F, '');
  }, attendInput, method, methodOrig);
}

function partialLog(method,status){
    var modalHtml=[];
    $('.modal-open').css('padding-right','0');
      $( ".modal-backdrop" ).removeClass('modal-backdrop');
        addFunActionLabel='';
      if(status=='N' || status=='U'){
        gaEvent("User","No OTP Open");
        addFunActionLabel='No OTP Proceed';
      } 
      else if(status=='V'){
        gaEvent("User","No Password Open");
        addFunActionLabel='No Password Proceed';
      }
      else{
        gaEvent("User","No Signup Open");
        addFunActionLabel='No Signup Proceed';
      }

        var methodOrig=method;
        if(method.search(/attendNew/)>-1){
            methodOrig=method.replace("attendNew_", "");
            method=getAction(methodOrig);
        }
        if(methodOrig.search(/orgdetails/)>-1) {
            methodOrig = "orgdetails_about";
        }
        if(methodOrig.search(/going/)>-1) {
            methodOrig = "going_about";
        }
        if(methodOrig.search(/interested/)>-1) {
            methodOrig = "interested_about";
        }
        var enteredMail=$("#TenTimes-Modal #userEmail").val();
        if(typeof enteredMail=='undefined' || enteredMail==''){
            enteredMail='';
        }
        switch(method){
                case "connect":
                    var attendInput = ['fields','title','social','subtitle','actionName','actionLabel','eventId','eventName'];
                    attendInput['fields'] = ['name','email','city','company','designation','phone','autointroduce'];
                    attendInput['title'] = getConnectTitle(receiverData.name);
                    attendInput['subtitle'] = '';
                    attendInput['receiverName'] = receiverData.name;
                    attendInput['receiverId'] = receiverData.id;
                    attendInput['actionName'] = "gaEvent('User','"+addFunActionLabel+"');ConnectRegisterForm();";
                    attendInput['actionLabel'] = 'Proceed to connect';
                    getForm(function (modalHtml){
                      modalHtml.mainHtml+=addHidden('ai_value','ai_value');
                    $("#modalData").html(modalHtml.mainHtml);     
                    $("#TenTimes-Modal").modal("show");
                     calling_detail();
                    $("#desiDiv").hide();
                    $("#checkDiv").hide();
                    $("#phoneDiv").hide();
                    $("#aiDiv").hide();
                    $("#TenTimes-Modal #userSource").val('connect');
                    appendPartial(modalHtml,enteredMail);                  
                    },attendInput,'connect',methodOrig);
                    break;
                case "attend":
                case "stall":
                case "follow":
                case "interest":
                case "going":
                case "bookmark":
                    var attendInput = ['fields','title','social','subtitle','actionName','actionLabel','eventId','eventName'];
                    var tag = method.search(/follow/i);
                    if(tag > -1){
                        attendInput['fields'] = ['name','email','city','company','designation','phone'];
                        attendInput['actionLabel'] = 'Follow Now';
                    }
                    else{
                        attendInput['fields'] = ['name','email','city','company','designation','phone','autointroduce'];
                        attendInput['actionLabel'] = 'Submit';
                    }
                    attendInput['title'] = eventData.name;
                    attendInput['subtitle'] = '';
                    attendInput['eventName'] = eventData.name;
                    attendInput['eventId'] = eventData.id;
                    attendInput['actionName'] = "gaEvent('User','"+addFunActionLabel+"');RegisterForm();";
                    if(method == 'stall')
                    {
                        attendInput['fields'].splice(3, 0, "website");
                        attendInput['actionLabel'] = 'Book a stall';
                        attendInput['title'] = eventData.name;
                    }
                    getForm(function (modalHtml){
                     modalHtml.mainHtml+=addHidden('ai_value','ai_value');
                    $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                    calling_detail();
                    $("#desiDiv").hide();$("#checkDiv").hide();$("#phoneDiv").hide();$("#aiDiv").hide();
                    $("#TenTimes-Modal #userSource").val(methodOrig);
                    appendPartial(modalHtml,enteredMail);
                    },attendInput,getAction(method),methodOrig);
                    
                    break;
                case "speaker":
                    var speakerInput = ['fields','title','social','subtitle','actionName','actionLabel'];
                    speakerInput['fields'] = ['name','email','city','company','designation','phone'];
                    speakerInput['title'] = 'Follow '+speakerData.name;
                    speakerInput['subtitle'] = '';
                    speakerInput['actionName'] = "gaEvent('User','"+addFunActionLabel+"');registerFollower('"+method+"',"+speakerData.id+");";
                    speakerInput['actionLabel'] = 'Follow Now';
                    getForm(function (modalHtml){
                    $("#modalData").html(modalHtml.mainHtml); 
                    clickCompany();
                    $("#TenTimes-Modal").modal("show");
                    calling_detail();
                    $("#desiDiv").hide();$("#checkDiv").hide();$("#phoneDiv").hide();$("#aiDiv").hide();
                    $("#TenTimes-Modal #userSource").val(method);
                    appendPartial(modalHtml,enteredMail);
                    },speakerInput,method,methodOrig);     
                           
                    break;
                case "follow page":
                    $( ".modal-backdrop" ).removeClass('modal-backdrop');
                    var attendInput = ['actionLabel'];
                    attendInput['actionLabel'] = 'Submit';
                    $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent('User',addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
                    appendPartial(modalHtml,enteredMail);
                    break;
                case "organizer":
                   getSpeakerForm(method);
                   appendPartial(modalHtml,enteredMail);
                    break;
                case "exhibitorconnect":
                    var attendInput = ['actionLabel'];
                    attendInput['actionLabel'] = 'Submit';
                    $("#TenTimes-Modal form button").removeAttr("onclick").click(function() {gaEvent('User',addFunActionLabel);LoginRegisterForm(method);}).text(attendInput['actionLabel']).attr('disabled',false);
                    appendPartial(modalHtml,enteredMail);
                    break;
                case "contact_organizer_venue":
                case "venue_detail":
                    var venueInput = ['fields','title','social','subtitle','actionName','actionLabel'];
                    venueInput['fields'] = ['name','email','city','company','designation','phone'];
                    venueInput['subtitle'] = '';

                    if(pageType=='venue_detail'){
                        venueInput['actionName'] = "gaEvent('User','"+addFunActionLabel+"');registerVenueFollower('"+method+"',"+venueData.id+");";
                        if(typeof venueData !='undefined' && venueData.dis.text=='Contact') {
                            venueInput['title'] = 'Contact '+venueData.name;    
                        }
                        else
                            venueInput['title'] = 'Follow '+venueData.name;
                    }


                    venueInput['actionLabel'] = 'Submit';
                    getForm(function (modalHtml){
                    $("#modalData").html(modalHtml.mainHtml);      
                    clickCompany();
                    $("#TenTimes-Modal").modal("show");
                      calling_detail();
                    $("#desiDiv").hide();$("#checkDiv").hide();$("#phoneDiv").hide();$("#aiDiv").hide();
                    $("#TenTimes-Modal #userSource").val(method);
                    appendPartial(modalHtml,enteredMail);
                    },venueInput,method,methodOrig);
                    
                    break;
                case "org_detail":
                case "venueListing":
                case "VenueCityListing":
                    var attendInput = ['fields','title','social','subtitle','actionName','actionLabel','eventId','eventName'];
                    attendInput['fields'] = ['name','email','city','company','designation','phone'];

                    attendInput['receiverName'] = $('h1').html();
                    attendInput['title'] = getConnectTitle($('h1').html());

                    attendInput['title']=attendInput['title'].replace('Connect with','Contact');

                    attendInput['subtitle'] = '';
                    attendInput['actionName'] = "gaEvent('User','"+addFunActionLabel+"');ConnectRegisterForm();";
                    attendInput['actionLabel'] = 'Submit';
                    getForm(function (modalHtml){
                    modalHtml.mainHtml+=addHidden('ai_value','ai_value');
                    $("#modalData").html(modalHtml.mainHtml);
                    $("#TenTimes-Modal").modal("show");
                      calling_detail();
                    $("#desiDiv").hide();
                    $("#checkDiv").hide();
                    $("#phoneDiv").hide();
                    $("#aiDiv").hide();  
                    $("#TenTimes-Modal #userSource").val('signup');
                    appendPartial(modalHtml,enteredMail);
                    },attendInput,'signup',methodOrig);     
                    
                    break;
                default:
                    alert("Sorry there is an error in the system. Try again.");
            }
            
       
}
function appendPartial(modalHtml,enteredMail){
    if(typeof modalHtml.forgotpassword !== 'undefined')
            $("#TenTimes-Modal .modal-header").append('<span>('+modalHtml.forgotpassword+' )</span>');
            else
            $("#TenTimes-Modal .modal-header").append('<span>(To proceed, please fill these details )</span>');   
            $("#TenTimes-Modal #userEmail").val(enteredMail);
            $('#TenTimes-Modal .modal-dialog').removeClass('modal-740').addClass('modal-500');
            clickCompany();
            postFormOpenSettings();
}

function registerSignInTT(source,action){
    var A = {};
    switch(action){
        case 'email' :
            hideError('email');
            if(!validateEmail12345($("#TenTimes-Modal #userEmail").val())) {
                $("#TenTimes-Modal #register_button").removeAttr("disabled");
                $("#TenTimes-Modal #userEmail").focus();
                showError('email','Invalid email');
                if($("#TenTimes-Modal #userEmail").val().trim() == ""){
                    $("#TenTimes-Modal #userEmail").val('') ;
                    showError('email','Please enter email');
                }
                return false;
            }
            A.email = $("#TenTimes-Modal #userEmail").val();
            A.source = 'auto_save';
            A.action = 'signup';
            A.type = "email" ;
        break ;
        case 'password' :
            hideError('password');
            if($("#TenTimes-Modal #userPassword").val() == "") {
                showError('password','Mandatory');
                return false;
            }
            A.email = $("#TenTimes-Modal #userEmail").val();
            A.password = $("#TenTimes-Modal #userPassword").val();
            A.source = $("#TenTimes-Modal #userSource").val();
            if(typeof scrollType != 'undefined' && scrollType != "" )
                A.source = scrollType ;
            if(typeof pageType != 'undefined' && pageType != "" && A.source == "" )
                A.source = pageType ;
            A.action = 'signup';
            A.type = "password" ;
        break ;
    }
    $("#TenTimes-Modal form button").html('<i class="fa fa-spin fa-refresh"></i> '+$("#TenTimes-Modal form button").text()).attr('disabled','disabled');
    hitAuth(A,'signupTT',$("#TenTimes-Modal #userSource").val(),A,'');
}
function signupTTResponse(result,data){
    if(result.status == 1){
        $("#TenTimes-Modal").modal("hide");
        if(location.search.search('/?ref=')>-1)
                location.href=site_url_attend+location.search.replace('?ref=','');
        else
             getLoggedInDataN(); 
        showToast("You are successfully logged In!",'#43C86F');
        removeBackdropModal();
        continueScroll();
    }
    else{
        $("#TenTimes-Modal form button").html($("#TenTimes-Modal form button").text()).attr('disabled',false);
        showApiError(result);
    }
}

var countryToPhone=[["Afghanistan","af","93"],["Aland Islands","ax","358"],["Albania","al","355"],["Algeria","dz","213"],["American Samoa","as","1684"],["Andorra","ad","376"],["Angola","ao","244"],["Anguilla","ai","1264"],["Antigua and Barbuda","ag","1268"],["Argentina","ar","54"],["Armenia","am","374"],["Aruba","aw","297"],["Australia","au","61"],["Austria","at","43"],["Azerbaijan","az","994"],["Bahamas","bs","1242"],["Bahrain","bh","973"],["Bangladesh","bd","880"],["Barbados","bb","1246"],["Belarus","by","375"],["Belgium","be","32"],["Belize","bz","501"],["Benin","bj","229"],["Bermuda","bm","1441"],["Bhutan","bt","975"],["Bolivia","bo","591"],["Bosnia and Herzegovina","ba","387"],["Botswana","bw","267"],["Brazil","br","55"],["British Indian Ocean Territory","io","246"],["British Virgin Islands","vg","1284"],["Brunei","bn","673"],["Bulgaria","bg","359"],["Burkina Faso","bf","226"],["Burundi","bi","257"],["Cambodia","kh","855"],["Cameroon","cm","237"],["Canada","ca","1"],["Cape Verde","cv","238"],["Caribbean Netherlands","bq","5997"],["Cayman Islands","ky","1345"],["Central African Republic","cf","236"],["Chad","td","235"],["Chile","cl","56"],["China","cn","86"],["Christmas Island","cx","61"],["Cocos (Keeling) Islands (Kepulauan Cocos (Keeling))","cc","61"],["Colombia","co","57"],["Comoros","km","269"],["Congo (DRC)","cd","243"],["Congo (Republic) (Congo-Brazzaville)","cg","242"],["Cook Islands","ck","682"],["Costa Rica","cr","506"],["Ivory Coast","ci","225"],["Croatia","hr","385"],["Cuba","cu","53"],["Curacao","cw","5999"],["Cyprus","cy","357"],["Czech Republic","cz","420"],["Denmark","dk","45"],["Djibouti","dj","253"],["Dominica","dm","1767"],["Dominican Republic","do","1809"],["Ecuador","ec","593"],["Egypt","eg","20"],["El Salvador","sv","503"],["Equatorial Guinea","gq","240"],["Eritrea","er","291"],["Estonia","ee","372"],["Ethiopia","et","251"],["Falkland Islands","fk","500"],["Faroe Islands","fo","298"],["Fiji","fj","679"],["Finland","fi","358"],["France","fr","33"],["French Guiana","gf","594"],["French Polynesia","pf","689"],["Gabon","ga","241"],["Gambia","gm","220"],["Georgia","ge","995"],["Germany","de","49"],["Ghana","gh","233"],["Gibraltar","gi","350"],["Greece","gr","30"],["Greenland","gl","299"],["Grenada","gd","1473"],["Guadeloupe","gp","590"],["Guam","gu","1671"],["Guatemala","gt","502"],["Guernsey","gg","44"],["Guinea","gn","224"],["Guinea-Bissau","gw","245"],["Guyana","gy","592"],["Haiti","ht","509"],["Honduras","hn","504"],["Hong Kong","hk","852"],["Hungary","hu","36"],["Iceland","is","354"],["India","in","91"],["Indonesia","id","62"],["Iran","ir","98"],["Iraq","iq","964"],["Ireland","ie","353"],["Isle of Man","im","44"],["Israel","il","972"],["Italy","it","39"],["Jamaica","jm","1876"],["Japan","jp","81"],["Jersey","je","44"],["Jordan","jo","962"],["Kazakhstan","kz","7"],["Kenya","ke","254"],["Kiribati","ki","686"],["Kosovo","xk","377"],["Kuwait","kw","965"],["Kyrgyzstan","kg","996"],["Laos","la","856"],["Latvia","lv","371"],["Lebanon","lb","961"],["Lesotho","ls","266"],["Liberia","lr","231"],["Libya","ly","218"],["Liechtenstein","li","423"],["Lithuania","lt","370"],["Luxembourg","lu","352"],["Macau","mo","853"],["Macedonia","mk","389"],["Madagascar","mg","261"],["Malawi","mw","265"],["Malaysia","my","60"],["Maldives","mv","960"],["Mali","ml","223"],["Malta","mt","356"],["Marshall Islands","mh","692"],["Martinique","mq","596"],["Mauritania","mr","222"],["Mauritius","mu","230"],["Mayotte","yt","262"],["Mexico","mx","52"],["Micronesia","fm","691"],["Moldova","md","373"],["Monaco","mc","377"],["Mongolia","mn","976"],["Montenegro","me","382"],["Montserrat","ms","1664"],["Morocco","ma","212"],["Mozambique","mz","258"],["Myanmar","mm","95"],["Namibia","na","264"],["Nauru","nr","674"],["Nepal","np","977"],["Netherlands","nl","31"],["New Caledonia","nc","687"],["New Zealand","nz","64"],["Nicaragua","ni","505"],["Niger","ne","227"],["Nigeria","ng","234"],["Niue","nu","683"],["Norfolk Island","nf","672"],["North Korea","kp","850"],["Northern Mariana Islands","mp","1670"],["Norway","no","47"],["Oman","om","968"],["Pakistan","pk","92"],["Palau","pw","680"],["Palestine","ps","970"],["Panama","pa","507"],["Papua New Guinea","pg","675"],["Paraguay","py","595"],["Peru","pe","51"],["Philippines","ph","63"],["Pitcairn Islands","pn","64"],["Poland","pl","48"],["Portugal","pt","351"],["Puerto Rico","pr","1787"],["Qatar","qa","974"],["Reunion","re","262"],["Romania","ro","40"],["Russia","ru","7"],["Rwanda","rw","250"],["Saint Barthelemy","bl","590"],["Saint Helena","sh","290"],["Saint Kitts and Nevis","kn","1869"],["Saint Lucia","lc","1758"],["Saint Martin","mf","590"],["Saint Pierre and Miquelon","pm","508"],["Saint Vincent and the Grenadines","vc","1784"],["Samoa","ws","685"],["San Marino","sm","378"],["SAO TOME AND PRINCIPE","st","239"],["Saudi Arabia","sa","966"],["Senegal","sn","221"],["Serbia","rs","381"],["Seychelles","sc","248"],["Sierra Leone","sl","232"],["Singapore","sg","65"],["Sint Maarten","sx","1721"],["Slovakia","sk","421"],["Slovenia","si","386"],["Solomon Islands","sb","677"],["Somalia","so","252"],["South Africa","za","27"],["South Georgia & South Sandwich Islands","gs","500"],["South Korea","kr","82"],["South Sudan","ss","211"],["Spain","es","34"],["Sri Lanka","lk","94"],["Sudan","sd","249"],["Suriname","sr","597"],["Svalbard and Jan Mayen","sj","4779"],["Swaziland","sz","268"],["Sweden","se","46"],["Switzerland","ch","41"],["Syria","sy","963"],["Taiwan","tw","886"],["Tajikistan","tj","992"],["Tanzania","tz","255"],["Thailand","th","66"],["Timor-Leste","tl","670"],["Togo","tg","228"],["Tokelau","tk","690"],["Tonga","to","676"],["Trinidad and Tobago","tt","1868"],["Tunisia","tn","216"],["Turkey","tr","90"],["Turkmenistan","tm","993"],["Turks and Caicos Islands","tc","1649"],["Tuvalu","tv","688"],["Uganda","ug","256"],["Ukraine","ua","380"],["United Arab Emirates","ae","971"],["United Kingdom","uk","44"],["United Kingdom","gb","44"],["United States","us","1"],["U.S. Virgin Islands","vi","1340"],["Uruguay","uy","598"],["Uzbekistan","uz","998"],["Vanuatu","vu","678"],["Vatican City","va","379"],["Venezuela","ve","58"],["Vietnam","vn","84"],["Wallis and Futuna","wf","681"],["Western Sahara","eh","212"],["Yemen","ye","967"],["Zambia","zm","260"],["Zimbabwe","zw","263"]];

var venue_list={};
function initAutocomplete() {
            loadASyncTTScript('https://c1.10times.com/js/typeaheadmap.js?v=0.3');
            $("#userCity").attr('data-provide','typeahead');
            $("#userCity").typeaheadmap({
                  "source" : function(q, process) {
                    if (typeof xhr!=='undefined' && typeof xhr.readyState!=='undefined' && xhr.readyState != 4)
                      xhr.abort();
                      var searchString = $('#userCity').val().trim();
                      if(searchString.length<2){
                        return false;
                      }
                      xhr = $.ajax({  
                        type: "get",
                        url: site_url+"/city/search?ajax=1&searchType=es&query="+encodeURI(searchString),
                        cache: false,
                        ifModified:true,   
                        dataType: 'json', 
                        success: function(d) {
                            if(d==null || d[0].name=="Online"){
                                d=new Array({'name' :"City Not Found",'placeId':""});
                            }
                            venue_list=d;
                            process(d);
                            if(typeof new_Dashboard!="undefined" && new_Dashboard==1){
                                $('.scrollable-dropdown-menu ul.typeaheadmap').addClass('select2-dropdown');
                            }
                          $("#userCity").removeClass("ldg");
                        
                          },
                        error: function(d,s,e) {
                          if(s != 'abort')
                          {
                              $("#userCity").removeClass("ldg");
                          }
                        }
                      });
                  },
                  "notfound": new Array({'name' :"City Not Found",'placeId':""}),
                  "key" : "name",
                  "sort" : "none",
                  "value" : "placeId",
                  "items": 5,
                  "listener" : function(k, v) {
                      $('#place_id').val(v);
                      $.each(venue_list, function (index, value) {
                        if(value.placeId==v){
                           if(pageType=='edit_profile'){
                            if(phonecodeValue==0 && $('#mobile').val()==''){
                                  for (var j = countryToPhone.length - 1; j >= 0; j--) {
                                       if( value.countryId.toLowerCase() == countryToPhone[j][1].toLowerCase() ){
                                            $('.phone_code_value').html("+"+countryToPhone[j][2]+'&nbsp;<i class="fa fa-caret-down"></i>');
                                            $('.phone_code_value').val("+"+countryToPhone[j][2]);
                                            break;
                                       }
                                    }
                                  }
                                }
                            if(pageType=='about' || pageType=='org_detail' || pageType=='venue_detail' || pageType=='visitors' || pageType=='exhibitors' || pageType=='comments' || pageType=='photos-videos' || pageType=='deals' || pageType=='listing'){
                                if(phonecodeValue==0 && $('#userMobile').val()==''){
                                  for (var j = countryToPhone.length - 1; j >= 0; j--) {
                                       if( value.countryId.toLowerCase() == countryToPhone[j][1].toLowerCase() ){
                                            $('.phone_code_value').html("+"+countryToPhone[j][2]+'&nbsp;<i class="fa fa-caret-down"></i>');
                                            $('.phone_code_value').val("+"+countryToPhone[j][2]);
                                            $('.phone_code_value').attr('value',"+"+countryToPhone[j][2]);
                                            break;
                                       }
                                    }
                                  }
                                }
                            setTimeout(function(){ 
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
                                $("#userCity").val(reslistener); }, 10);
                            
                        }
                      });
                      
                  },
                  "displayer": function(that, item, highlighted)
                  {
                    if(item.countryName)
                    {
                      if(typeof new_Dashboard!="undefined" && new_Dashboard==1){
                            var res='<span class="changeme">&nbsp;<i class="fa fa-map-marker"></i><span style="color:black">&nbsp;&nbsp;'+highlighted+'</span>';
                            if(typeof item.state !== "undefined" && item.state!='null' && item.state!=null && item.state!=item.name){
                                res+='<span style="color:grey;font-size:10px">, '+item.state+'</span>';
                            }
                            if (typeof item.countryName !== "undefined" && item.countryName!='null' && item.countryName!=null && item.countryName!=item.name) {
                                res+='<span style="color:grey;font-size:10px">, '+item.countryName+'</span>';
                            }
                            res+='</span>';   
                        }
                        else{
                           var res='<span class="changeme"><i class="fa fa-map-marker"></i><span style="color:black">&nbsp;&nbsp;'+highlighted+'</span>';
                            if(typeof item.state !== "undefined" && item.state!='null' && item.state!=null && item.state!=item.name){
                                res+='<span style="color:grey;font-size:10px">, '+item.state+'</span>';
                            }
                            if (typeof item.countryName !== "undefined" && item.countryName!='null' && item.countryName!=null && item.countryName!=item.name) {
                                res+='<span style="color:grey;font-size:10px">, '+item.countryName+'</span>';
                            }
                            res+='</span>'; 
                        }
                      return res;
                    }
                    else
                    {
                      return highlighted;
                    }
                  }
                });
}
function fillInAddress(){
    place = autocomplete.getPlace();
    hideCityLoading();
    hideError('city');
    $("#place_id").val(place.place_id);
    var phoneCodeFlag = 0 ;
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (addressType == "country") {
            var val = place.address_components[i]["short_name"];
            if(val != ""){
                for (var j = countryToPhone.length - 1; j >= 0; j--) {
                    if( val.toLowerCase() == countryToPhone[j][1].toLowerCase() ){
                        $('.phone_code').html("+"+countryToPhone[j][2]);
                        $('.phone_code_value').val("+"+countryToPhone[j][2]);
                        $('.user_country' ).val(val);
                        $('.user_country_code' ).val(val);
                        phoneCodeFlag = 1 ;
                        break;
                    }
                }
            }
        }
    }
}
function loadASyncTTScript(src) {
    var jsMap = document.createElement("script");jsMap.type = "application/javascript";jsMap.src = src;document.body.appendChild(jsMap);
    citywidgetCss();
}
$('#userCity').on('keyup',function(){setTimeout(function() {var lenth= ($(".pac-container").length>0?$(".pac-container").html().length:0);if(lenth==0 && $(".user_city").val() != ""){showCityLoading();}else{hideCityLoading();}if($("#place_id").val() != "")hideCityLoading();},500);});
$("#userCity").mouseout(function(){hideCityLoading();});$("#userCity").mouseleave(function(){hideCityLoading();});$('#userCity').on('blur' , function() {hideCityLoading();});getPageType();
var add = "" ;
if(pageType == "edit_profile") 
    initAutocomplete();
function showCityLoading(){$(".user_city").css({"background-color":" #ffffff","background-image":' url("https://c1.10times.com/images/loadingimages.gif")',"background-size":" 25px 25px","background-position":"right center","background-repeat":" no-repeat"});}
function hideCityLoading(){$(".user_city").removeAttr( 'style' );}
function removePlaceId(){$("#TenTimes-Modal #place_id").val('')}
function citywidgetCss(){
    var styleNode = document.createElement('style');
    styleNode.type = "text/css";
    if(!!(window.attachEvent && !window.opera)) {
        styleNode.styleSheet.cssText = '.pac-container {z-index: 10000 !important;}';
    } else {
        var styleText = document.createTextNode('.pac-container {z-index: 10000 !important;}');
        styleNode.appendChild(styleText);
    }
    document.getElementsByTagName('head')[0].appendChild(styleNode);
}
$(document).ready(function() {
    if(pageType == 'deals') {
        if($('#checkinDate').length < 1) {
            //dealsData(this,'checkinout','now');    
        }
    } 
});

function dealsData(ths,type,data){

return true;    
        if($('#event_url').length==0){  
            var documet_url= window.location.protocol + "//" + window.location.host + window.location.pathname;     
            documet_url=documet_url.replace("#",'');
        }
        else{
            var documet_url= window.location.protocol + "//" + window.location.host + '/' + $('#event_url').val()+'/deals';     
            documet_url=documet_url.replace("#",'');   
        }     
        //documet_url="/app.php"+window.location.pathname;   
        $('.deals-data').html('');      
        $('.loader_deal').show();       
        var dataString = '?page=1&ajax=1';      
        if(type=='person'){     
            dataString+='&dealperson='+data;
            if($('.deals-days').find('.btn-orange').val() == 0) {
                    dataString+='&dealday=1';
            } 
            else {
                dataString+='&dealday='+ $('.deals-days').find('.btn-orange').val();    
            }       
                     
        }       
        if(type=='days'){      
            if(data == 0)
            data=1; 
            dataString+='&dealday='+data;
            if($('.deals-person').find('.btn-orange').attr('value') == 0) {
                dataString+='&dealperson=2';
            }
            else {
                dataString+='&dealperson='+ $('.deals-person').find('.btn-orange').attr('value');    
            }               
                   
        }
        if(type=='checkinout'){
            dataString+='&checkinout='+data;
            if($('.deals-person').find('.btn-orange').attr('value') == 0) {
                dataString+='&dealperson=2';
            }
            else {
                dataString+='&dealperson='+ $('.deals-person').find('.btn-orange').attr('value');    
            }        
                   
        }   
         if($('#page_type_data').length!=0){
             dataString+="&hotel_label="+$('#page_type_data').val();
        }    
            
        $.ajax({        
                type: "POST",       
                url: documet_url+dataString,        
                data: dataString,       
                success: function(response)         
                {  
                    if(!response){
                        $('.deals-data').html('<tr><td style="padding-top:20px;">No deals found</td></tr>');              
                        
                    }
                    else {
                        $('.deals-data').html(response);
                    } 
                    $('.deal-date-div').find('.deal-btn').remove();
                    $('.deal-date-div').find('ul').remove(); 
                    var b='<button class="deal-btn btn btn-default btn-sm dropdown-toggle float-end" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+ $('.deals-data').find('button').eq(0).html() + '</button>';
                    var ul='<ul class="dropdown-menu">'+$('.deals-data').find('ul').eq(0).html()+'<ul>';

                    $('.deal-date-div').append( b+ul );
                       $('.deals-data').find('button').eq(0).remove();
                       $('.deals-data').find('ul').eq(0).remove();
                         
                        $(ths).parent().find('button').removeClass('btn-orange');       
                        $(ths).parent().find('button').addClass('btn-default');     
                        $(ths).removeClass('btn-default');      
                        $(ths).addClass('btn-orange');      
                     $('.loader_deal').hide();        
                },      
                error: function() { 
                   $('.deals-data').html('<tr><td style="padding-top:20px;">No deals found</td></tr>');              
                   $('.loader_deal').hide();        
                }       
            
        });     
    }
 function gLogin_combined(method, from) {
    gaEvent("User","Google Plus");
    social_login(function(){
        social_login_response(method , from);
    },'gmail',from);        
    //alert("auth");
    // loadASyncTTScript('https://apis.google.com/js/client.js');
    // gapi.client.init({
    // apiKey: apiKey,
    // clientId: clientId,
    // scope:scopes
    // }).then(
    //     gapi.auth.authorize({
    //     client_id: clientId,
    //     scope: scopes,
    //     immediate: !1
    // }, function(a){


    //         if(typeof a.error=='undefined'){
    //             var data={
    //                 token:a.access_token,
    //                 loginMethod:'gplus',
    //                 from:from
    //              }
    //             tunnelSocial(data);     
    //         }else{
    //             if(a.error=='popup_closed_by_user'){}
    //             else if(a.error)
    //             showToast('Something went wrong!!!');
    //         }
    //         //a && !a.error && $.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + a.access_token, function(b){
            
            
    //         // var data = {
    //         //     metadata: JSON.stringify(b),
    //         //     name: b.name,
    //         //     email: b.email,
    //         //     source: from,
    //         //     action:'signup',
    //         //     loginMethod: 'gplus'
    //         // };
    //         // showloading();
    //         // if(from=='subscribe')
               
    //         //     hitAuth(data,from,from,'','');
    //         // else
    //         //     gLoginResponse_combined(b,from);
    //         // });

    //       // if(a.error=='popup_closed_by_user'){}
    //       // else if(a.error)
    //       //   showToast('Something went wrong!!!');
    //   })
    // )   
}

function gLoginResponse_combined(I,from) {
    showloading();
    var F = $("#TenTimes-Modal #userSource").val();
    if (typeof I.name != "undefined") {
        $("#TenTimes-Modal #userName").val(I.name);
    }
    $("#TenTimes-Modal #userMetadata").val(JSON.stringify(I));
    $("#TenTimes-Modal #userGmailId").val(I.id);
    if (typeof I.email != "undefined") {
        $("#TenTimes-Modal #userEmail").val(I.email) // change it
    }

     if(from == 'speaker' || from == 'signup' || from == 'signupTT' || pageType=='edit_profile' || from == 'follow page' || pageType == "not_login"){
        hideloading();
        verifySigninTT(from,'gm');
        //loggedIn(from);
    }else{

         verifySigninTT('signupTT_'+from,'gm');
     }
}

addLoadEvent(function() {
    var contactForm = getUrlVars()["contactForm"];
     if(typeof contactForm !='undefined' && page_type == 'venue_detail'  && contactForm == 1)
        openFormWithSendMessage();

    if(getCookie('user')!="" && getCookie('user_token')!=""){
        if(getCookie('10T_ping')==""){
            A={};
            A.user_id = getCookie('user');
            A.source = 'getnotifiction';
            A.action = 'pageLoad';
            hitAuth(A,'notificationTT','notification',A,'');
        }
    }
    else{
        if(getCookie('10T_ping')==""){
            document.cookie ="10T_ping=0#$"+getNotifCheck()+"#$"+getLocationStatus()+' Secure';
            gaUserPing(0,getNotifCheck(),getLocationStatus());
        }
    }
    notifCountAsyc();
});

function openFormWithSendMessage(dis)
   {
   
       if((getCookie('user') && getCookie('user') != "") || (getCookie('user_token') && getCookie('user_token') != ""))
       {
          contact_organizer(this);
       }
       else
       {
           venueData['id']=$('#venueId').val();
           venueData['name']=$('#'+$('#venueId').val()).parent().find('h1').text();
           var venueInput = ['fields','title','social','subtitle','actionName','actionLabel'];
                       venueInput['fields'] = ['name','email','city','company','designation','phone','enquiryMessage'];
                       venueInput['subtitle'] = '';
                       venueInput['actionName'] = "submitFormWithSendMessage('venue_detail',"+venueData.id+");";
                       venueInput['title'] = 'Contact '+venueData.name;    
                       venueInput['actionLabel'] = 'Submit';
                       getForm(function (modalHtml){
                       $("#modalData").html(modalHtml.mainHtml);     
                      
                       $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
                       $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
                       $("#TenTimes-Modal").modal("show");
                       $("#desiDiv").hide();$("#checkDiv").hide();$("#phoneDiv").hide();$("#aiDiv").hide();
                       $("#TenTimes-Modal #userSource").val('venue_detail');
                       clickCompany();
                       postFormOpenSettings();
                       },venueInput,'venue_detail');
                       
       }
   }
   function submitFormWithSendMessage(source,v_Id)
   {
       showloading();
       var B = validateLoginData(source);
       hideloading();
       if (!B) 
       {
           return false
       } 
       else 
       {
           var A = {};
           A.entity = "venue_"+v_Id;
           A.name = $("#TenTimes-Modal #userName").val();
           A.email = $("#TenTimes-Modal #userEmail").val();
           A.userid = $("#TenTimes-Modal #userId").val();
           A.country = $("#TenTimes-Modal #userCountry").val();
           A.city = $("#TenTimes-Modal #userCity").val();
           A.place_id = $("#TenTimes-Modal #place_id").val();
           A.company = $("#TenTimes-Modal #userCompany").val();
           A.designation = $("#TenTimes-Modal #userDesignation").val();
           A.mobile = $("#TenTimes-Modal #userMobile").val();
           A.source = 'venue_detail';
           A.action = 'signup';
           showloading();
           hitAuth(A,'venue_contact_message',$("#TenTimes-Modal #userSource").val(),'','');
           hideloading();
       }
   }

function getLocationStatus(){
    var locationStatus='No';
    navigator.permissions && navigator.permissions.query({name: 'geolocation'}).then(function(PermissionStatus) {
        if(PermissionStatus.state == 'granted'){
              locationStatus='Yes';
        }else{
             locationStatus='No';
        }
    });
    return locationStatus;
}


function getNotifCheck(result) {
    if(typeof Notification !='undefined'){
        if (Notification.permission == "granted") {
            return 'Yes';
        }
        else{
            return 'No';
        }    
    }
    else
        return 'No';
    
}


$(document).ready(function() {
    if ($('.data_table') != 0 && pageType == 'exhibitors'){
    $.getScript( "https://cdn.datatables.net/1.10.2/js/jquery.dataTables.min.js" )
      .done(function( script, textStatus ) {
        // console.log( textStatus );
        $('.data_table').DataTable({
           "order": [[ 0, "asc" ]],
            "pageLength": 100,
            "bInfo" : false,
            "bLengthChange": false,
            iDisplayLength: $('.data_table').find('tbody > tr').length
        });
        $('.data_table').prepend('<tr></tr>');
      });  
    }
} );

function downloadPdfTimeout(dis,encodeid) {
    if(pageType=='listing'){
        customEventGA('Event','Interested','Event Listing | Event Snippet | Get Ticket Button');
    }
   var a = site_url_attend+'/dashboard/event';
    if ((typeof pageType!=='undefined' )&&(pageType=="thankyou")){
        var b = $("#encodeVid").val();
    }else if(typeof encodeid!='undefined'){
        var b = encodeid;
    }else{
        showloading();
        var b = $(dis).attr('encodeId');
    }
     window.open(a+'?ref='+b+'&download=1', "_blank");
     hideloading();
}
$("#go-btn").click(function(){
   $('html, body').animate({
                           scrollTop: $("#go").offset().top-(2*($(document.getElementsByTagName('nav')).outerHeight()))
                       }, 1000);
});

$('#ddi').click(function(){
   $(this).find('.servicedrop').toggleClass('icon-chevron-down icon-chevron-up');
});

$('#timingid').click(function(){

   $(this).hide();
});

$('.collapsedid').click(function(){

    $(".collapsedid").attr('style', 'display: none');
});
function consentup(consent){
    var postData = {  for : 'userConsent', consent : consent};
    // var consent_flag=0;
    // if(getCookie('consent') && getCookie('consent')!=''){
    //     var consent_cookie = getCookie('consent').split('_');
        
    //     if(Date.now() > consent_cookie[1]+1800000 || consent_cookie[0]<consent)
    //         consent_flag=1;
        
    // }else if(getCookie('consent')=='')
    //    consent_flag=1; 

    // if(consent_flag==1){
    if(1){
            // alert('consent');        
            $.ajax({
                type: "POST",
                url: site_url_attend + "/ajax",
                data: postData,
                success: function(data){
                    if (document.getElementById("consent-label") && $('#consent-label').hasClass('cst-lbl'))
                        document.getElementById("consent-label").remove();
                    else if($('#consent-label').hasClass('ck-cst-lbl')){}
                    else
                        $('#consent-label').hide();
                    $('.barfixed').css('bottom','');
                    // console.log(data);
                },
                error: function(data){
                    // console.log(data);
                }
            });
        }
}
function flush_reload(data){ 
     sessionStorage.clear();
     $('#nav__dashboard__list').remove();     
     e = window.event;
     e.preventDefault();
      showloading(); 
                $.ajax({
                type: "POST",
                url: site_url_attend + "/user/flush",
                   success: function(data){
                    if(data=='true')
                    {  
                        if($('#pageType').val() == "404Page") {
                            window.location = "/events"
                        }
                        else {
                             removeParam('hash');
                            location.reload();    
                        }
                    }
                    else
                    { showToast('Something went wrong!!!');} 
                },
                   error: function(data){
                   showToast('Something went wrong!!!');
                }
            });
       
}
function removeParam(parameter)
{
  var url=document.location.href;
  var urlparts= url.split('?');

 if (urlparts.length>=2)
 {
  var urlBase=urlparts.shift(); 
  var queryString=urlparts.join("?"); 

  var prefix = encodeURIComponent(parameter)+'=';
  var pars = queryString.split(/[&;]/g);
  for (var i= pars.length; i-->0;)               
      if (pars[i].lastIndexOf(prefix, 0)!==-1)   
          pars.splice(i, 1);
  url = urlBase+'?'+pars.join('&');
  window.history.pushState('',document.title,url); // added this line to push the new url directly to url bar .

}
return url;
} 
function phoneCodeDrop(dis){
  $(dis).find('.dropdown-menu a').click(function() {
    $(dis).find('.phone_code_value').html($(this).find('small').text());
    $(dis).find('.phone_code_value').val($(this).find('small').text());
    $(dis).attr('value',$(this).find('small').text());
    flag_dropdown=1;
    phonecodeValue=1;
  });
}
    
function calling_detail(){
        $('.phone_dropdown').click(function(){
          phoneCodeDrop($(this));
          flag_dropdown=0;
        }); 
}
$(window).click(function(){
     flagmodallogin=0;
});

//  $('body').on("click", function (){
//       if(flag_dropdown_1==0){
//           $('.dropdown-content').css("display","none");
//         }
//          else{
//                 flag_dropdown_1=0;
                
//             }
// });

function social_login(callback,method,source,source_import)  
{
    if(method=='linkedin'){
        e = site_url_attend + "/login/oauth?action=linkedin";    
    }else if(method=='facebook'){
        e = site_url_attend + "/login/oauth?action=facebook";    
    }else{
        var appendString='';
        if(typeof source_import!='undefined')
            appendString='&source='+source_import;
        e = site_url_attend + "/login/oauth?action=gmail"+appendString;    
    }
    
    var childWin=window.open(e, "myWindow", "scrollbars=yes,resizable=yes,top=200,left=500,width=600,height=600");
    var outhinterval=setInterval(function(){
            if(childWin.closed==true){
                clearInterval(outhinterval);
                hideloading();
                if(getCookie('fbid') && getCookie('fbid') != "") {
                   if(typeof source!='undefined' && source!='signup' && source!='') 
                      verifySigninTT('login','attendNew_'+source);
                   else
                      verifySigninTT('login','signup');
                }else{
                    callback();                        
                }
                if((getCookie('user') && getCookie('user') != "") || (getCookie('user_token') && getCookie('user_token') != "")){                        
                    getLoggedInDataN();    
                }                                 
             }
    }, 300); 
}

function social_login_response(method , from)
{   
  //  e.preventDefault();
    var dataA={ user: getCookie('user'),action:'signup'};    
  //  debugger;
    var result = ajaxHit('POST',site_url_attend + "/registeruser",dataA,false); // change it
    result = $.parseJSON(result);
    if(result.status==0 && typeof result.error.invalidData != 'undefined' && typeof email != 'undefined'){
        $.each(result.error.invalidData, function( key, value ) {
          if(value.what == 'account-deactivated'){
            deleteAllCookies();
            window.location.assign(site_url_attend + "/deactivation/"+result.userData.id);
            return;
          }
        });
    }
    if(result.status==1 && result.userData.userExists==0)
        gaEvent("User","Registration");
        
     if(result.status==1){
        //showThankyouLoggedIn('success');
        customEventGA('Event Visitor', 'LinkedIn Login Success', '');
     }
        
    
    var methodOrig=method;
    if(method.search(/attendNew/)>-1){
        methodOrig=method.replace("attendNew_", "");
        method=getAction(methodOrig);
    }else if(method.search(/feedbackresponse/)>-1){
        methodOrig=method.replace("feedbackresponse_", "");
        method = 'feedbackresponse';
    }
        
    switch (method) {

        case "connect":
                loggedInConnect('',receiverData.id,receiverData.name,eventData.id);
            break;
        case "interest":
        case "going":
        case "watch":    
        case "attend":
                attendNew('',methodOrig);
            break;
        case "bookmark":
        case "follow":
                if(from!=undefined)
                    attendNew('',methodOrig)
                else  if(methodOrig.search(/orgdetails/) > -1)
                {
                    attendNew('','orgdetails_follow');
                }
                else
                    attendNew('',methodOrig);
            break;
        case "orgdetails_follow":
                 attendNew('','orgdetails_follow');
            break;
        case "interested_attend":
                 attendNew('','interested_attend');
            break;
        case "going_attend":
                 attendNew('','going_attend');
            break;
        case "speaker":
                followSpeakerNew('','speaker');
            break;    
        case "signup":
                showThankyouLoggedIn();        
            break;
         case "follow page":
                followPage();
            break;
         case "organizer":
        //    if(pageType == 'about')
        //     {
        //         OrganizerData['id']=$('#companyId').attr('value');
        //     }
        //     else
        //     {
        //         OrganizerData['id']=$('h4').attr('id');     
        //     }
        //      followOrganizer("",OrganizerData['id'],'organizer');        
                followOrganizer("",OrganizerData.id,'organizer');
            break;
        case "company-gateway":
                followOrganizer("",OrganizerData.id,'company-gateway');
            break;
        case "stall":
                attendNew('','stall_attend');
            break;
        case "exhibitorconnect":
                exhibitConnect('',exhibitorData.id,'exhibitor',exhibitorData.statusFlag);
            break;
        case "exhibitorenquiry":
                exhibitorEnquiry('',exhibitorData.id,'exhibitor');
            break;    
        case "exhibitorsave":
                exhibitorSave('',exhibitorData.id,'exhibitor');
            break;    
        case "verifiedReview":
                verifiedReview();
            break;     
        case "venue_detail":
                followVenue($('#follow'), $('h1').attr('id'), 'venue_detail');
            break;
        case "signUpdash" :
            if(location.search.search('/?ref=')>-1){
                location.href=site_url_attend+decodeURIComponent(location.search.replace('?ref=',''));
            }
            else
                location.href=site_url_attend+'/dashboard/events'; 
            break;
        case "editprofile" :
              if(from=='linkedin'){
                addprofiledata();
                 //var p = o.replace("http://www.linkedin.com/in/", "");
                    // $(".lkd_btn").attr("href", o), 
                    // $(".lkd_btn").attr("target", "_blank"),
                    // (pageType== 'edit_profile') ? $(".lkd_btn").html('<i class="fa fa-linkedin-square " style="color:#489BC5; font-size: 20px;" ></i> ' + p) : $(".lkd_btn").html('<i class="fa fa-linkedin-square " style="color:#489BC5;" ></i> ' + p), 
                    // $(".lkd_btn").removeAttr("onclick")
                }
            break;
        case "subscribe_homepage":
              doSubscribe(method,from);
            break;
        case "feedbackresponse":
            feedbackResponse('',methodOrig);
            break;
        case "feedresponse":
            feedResponse('',methodOrig);
            break; 
        case "like" :
            likeResponse('','like');
            break;  
        case "more_sponsor":
            more_sponsor('',16);
            break;  
        case "view" :
            livePlay();
            break;  
        case "login_check" :
            $('#TenTimes-Modal').remove();
            $('.modal-backdrop').hide();
            $('body').removeClass('modal-open');
            user_comment('','remove');  
            break;     
        case "company-gateway-login" :
            break;
        default:
            alert("Sorry there is an error in the system. Try again.");
           
    }
  }

    function addprofiledata(){
        hideloading();
        var dataArray = {
            user: getCookie("user"),
            encodeUser: getCookie("user_token"),
            action: 'signup',
            source: pageType
        }
        $.ajax({
            type: "POST",
            url: site_url_attend + "/ajax/connect_response",
            data: dataArray,
            success: function(e) {
                var result = JSON.parse(e);
                if(result.status==1){
                    $(".lkd_btn").attr("href","https://www.linkedin.com"), 
                    $(".lkd_btn").attr("target", "_blank"),
                    $(".lkd_btn").html('<i class="fa fa-linkedin-square " style="color:#489BC5; font-size: 20px;" ></i> View Profile'), 
                    $(".lkd_btn").removeAttr("onclick"),
                    $('#linkedinBin').html('<a onclick="deleteSocial(\'linkedInDelete\');" href="javascript:void(0);"><i class="fa fa-trash" style="font-size: 24px;" aria-hidden="true"></i></a>'),
                    $('#linkedinBin').show();
                }
                else{
                    showToast('Something went wrong');
                }
               

            },
            error: function(e, a, t) {
                showToast('Something went wrong');
            }
        })

        

    }
    function doSubscribe(method , from)
    {
        var A = {};
        A.loginMethod = "li" ;
        A.source = method ;
        A.action = 'follow';
        A.listing_id = 1 ;
        A.user = getCookie('user');

        hitAuth(A,'subscribe',method,'','');
    }
/* new code for image rotate  (shubham) */
 function _arrayBufferToBase64(buffer) {
   var binary = ''
   var bytes = new Uint8Array(buffer)
   var len = bytes.byteLength;
   for (var i = 0; i < len; i++) {
     binary += String.fromCharCode(bytes[i])
   }
   return window.btoa(binary);
 }
 var rotateImage = function(file, callback) {
   var fileReader = new FileReader();
   fileReader.onloadend = function() {
     var base64img = "data:" + file.type + ";base64," + _arrayBufferToBase64(fileReader.result);
     var scanner = new DataView(fileReader.result);
     var idx = 0;
     var value = 1; // Non-rotated is the default
     if (fileReader.result.length < 2 || scanner.getUint16(idx) != 0xFFD8) {
       // Not a JPEG
       if (callback) {
         callback(base64img, value);
       }
       return;
     }
     idx += 2;
     var maxBytes = scanner.byteLength;
     while (idx < maxBytes - 2) {
       var uint16 = scanner.getUint16(idx);
       idx += 2;
       switch (uint16) {
         case 0xFFE1: // Start of EXIF
           var exifLength = scanner.getUint16(idx);
           maxBytes = exifLength - idx;
           idx += 2;
           break;
         case 0x0112: // Orientation tag
           // Read the value, its 6 bytes further out
           // See page 102 at the following URL
           // http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
           value = scanner.getUint16(idx + 6, false);
           maxBytes = 0; // Stop scanning
           break;
       }
     }
     if (callback) {
       callback(base64img, value);
     }
   }
   fileReader.readAsArrayBuffer(file);
 }
 function resetOrientation(srcBase64, srcOrientation, callback) {
  var img = new Image();  

  img.onload = function() {
    var width = img.width,
        height = img.height,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext("2d");
    
    // set proper canvas dimensions before transform & export
    max_size = 1024;// TODO : pull max size from a site config
    //width = img.width,
    //height = img.height;
    if (width > height) {
        if (width > max_size) {
            height *= max_size / width;
            width = max_size;
        }
    } else {
        if (height > max_size) {
            width *= max_size / height;
            height = max_size;
        }
    }

    if (4 < srcOrientation && srcOrientation < 9) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }
  
    // transform context before drawing image
    switch (srcOrientation) {
      case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, width, height ); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, height ); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, height , 0); break;
      case 7: ctx.transform(0, -1, -1, 0, height , width); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
      default: break;
    }
    ctx.drawImage(img, 0, 0,width,height);
    // var dataUrl = canvas.toDataURL('image/jpeg');

    // export base64
    callback(canvas.toDataURL('image/jpeg'));
  };

  img.src = srcBase64;
}
/* rotate code end here */

function removeInvite() {
    $('#TenTimes-Modal').modal('hide');
}

function designationFilter(id){
    var desigVal=id;
    $value=window.location.origin+'/'+$('#event_url').val()+"/visitors?designation_id="+desigVal;
    window.location=$value;
}
function badgeStatus(userData){
    let status = badge =  '0';
    if (userData.status == 'going' || userData.status == 'interest' ) {
        status = '1';
    }
    if (typeof userData.badgeId != 'undefined' && userData.badgeId != null) {
        badge = '1';
    }
    return status+badge;
}
// homepage feeds scroller
addLoadEvent(function() {
    if($('#feeds-dt').length>0){
        $.ajax({
                type: "GET",
                url: site_url_attend + "/ajax?for=feeds",
                success: function(n) {
                    if(n!=''){
                        $('#feeds-dt').append(n);
                        $('[data-toggle="tooltip"]').tooltip();
                        getScroller();
                    }else
                    {
                        $('#feeds-dt').html();
                    }
                },
                error: function(n) {}
        });
    }
})
function showmoreFeeds(dis) {  
  $(dis).next().removeClass('dis-non');
  $(dis).addClass('dis-non');
}

function join(){
if($('#modalData').html() == "")
            $('#modalData').html(getModal());
$('#TenTimes-Modal .modal-dialog').removeClass('modal-500');
$('#TenTimes-Modal .modal-dialog').addClass('modal-740');
$('#TenTimes-Modal .modal-title').html('<h2>Join Community</h2>');
$('#TenTimes-Modal .odashl').remove();
$('#TenTimes-Modal .modal-body').html('<form><div class="form-group rel-position"> <input type="email" placeholder="Enter email to proceed" id="userEmail"> <span class="undrr"></span><p class="ico fa-envelope"></p> <span class="text-danger alert_email  float-start"></span></div><br><button id="subs-submit" type="submit" onclick="return subscribe(this,\'subscribe_homepage_join\');" class="btn btn-orange btn-block btn-lg">JOIN</button></form>');
  $('#TenTimes-Modal').modal('show');
}

var sweetModal = {
  initial:function(sweModBody,sweModTitle,stylingData){
    let dis=Array();
    dis.sweModBody=sweModBody;
    dis.sweModTitle=sweModTitle;
    dis.stylingData=stylingData;
    let disLast=this.validateInputs(dis);
    this.modalDisplay(disLast);
  },
  validateInputs:function(dis){
      let alignModal=Array();
      alignModal=['modTopleft','modTopCenter','modTopRight','modMiddleTop','modMiddleCenter','modMiddleRight','modBottomLeft','modBottomCenter','modBottomRight'];
      if(dis.stylingData.modAlign=='' || alignModal.indexOf(dis.stylingData.modAlign)<0)
          dis.stylingData.modAlign='modTopCenter';
      // if(typeof dis.stylingData.modBackdrop=='undefined')
      //     dis.stylingData.modBackdrop='off';
      if(typeof dis.stylingData.modBackdrop=='undefined')
          dis.stylingData.modBackdrop='on';
      if(typeof dis.stylingData.modOutsideClick=='undefined')
          dis.stylingData.modOutsideClick='on';
      if(typeof dis.stylingData.modalSize=='undefined')
          dis.stylingData.modalsize='modal-sm';
      return dis;
  },
  modalDisplay:function(disLast){
    let open_m = bootstrap.Modal.getInstance(document.querySelector('#sweetModal'));
    if(open_m != null) open_m.hide();

      $( "<style>.modTopleft{left:1%;top:6%;position:absolute}.modTopCenter{left:35%;top:6%;position: absolute}.modTopRight{right:1%;top:6%;position:absolute}.modMiddleTop{left:1%;top:25%;position:absolute}.modMiddleCenter{left:32%;top:25%;position:absolute}.modMiddleRight{right:1%;top:25%;position:absolute}.modBottomLeft{bottom:1%;position:absolute}.modBottomCenter{left:32%;bottom:1%;position:absolute}.modBottomRight{right:1%;bottom:6%;position:absolute}</style>" ).appendTo( "head" );
      let htmlFinal=style1=style2=style3=modScrollHtml='';
      if(disLast.stylingData.modOutsideClick=='off')
          var modScrollHtml='data-keyboard="true" data-backdrop="static"';
      if(typeof disLast.stylingData.modWidth!='undefined')
          var style1='width:'+disLast.stylingData.modWidth;
      if(typeof disLast.stylingData.modRadius!='undefined')
          var style2='border-radius:'+disLast.stylingData.modRadius;
      if(typeof disLast.modbgColor!='undefined')
          var style3='background-color:'+disLast.stylingData.modbgColor;
      
      htmlFinal = `<div id="sweetModal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="sweet-modal" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h4 id="sweet-modal" class="modal-title">${disLast.sweModTitle}</h4>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
                        </div>
                        
                        <div class="modal-body">
                          ${disLast.sweModBody}
                        </div>
                      </div>
                    </div>
                  </div>`;

      if(typeof disLast.stylingData.modId!='undefined'){
          if($('#'+disLast.stylingData.modId).length<1){
              $('<div id="'+disLast.stylingData.modId+'"></div>').appendTo("body");
          }
          $('#'+disLast.stylingData.modId).html(htmlFinal).delay(800).fadeIn();
      }else{
          if($('#modalData').length<1){
              $('<div id="modalData"></div>').appendTo("body");
          }
          $('#modalData').html(htmlFinal).delay(800).fadeIn();
      }
      $('#sweetModal').modal('show');
      if(disLast.stylingData.modBackdrop=='off'){
          $('body').find('.modal-backdrop').removeClass('in')    
      }
      if(disLast.stylingData.modScroll=='on')
          $('body').removeClass('modal-open');

  }
}
/* end here */

/* notification code here shubham singh */
var notificationId='';
var OneSignal = window.OneSignal || [];
var initOneSignal = false;
var subscribeCall=true;
var webPushNotification={
        Init:function(onInit) {
          if(initOneSignal==false){
            initOneSignal=true;
            if($('#newDashboard').text()!='1')
            OneSignal.push(function() {
              OneSignal.init({
                appId: "590078a2-6c82-4283-b2c7-b768cec373a2",
                notifyButton: {
                  enable: false,
                },
                welcomeNotification: {
                  "title": "10times.com",
                  "message": "Thanks for subscribing!"
                },
                persistNotification:true
              });
            });
              
            loadASyncTTScript('https://cdn.onesignal.com/sdks/OneSignalSDK.js');
          }
          this.main(onInit);
          return this;
        },
        notifyaction:function(onSuccess, onFailure,notifySource) {
            if(initOneSignal==false) {
                console.log('Error: initOneSignal is false');
                return false;
            }

            this.onSuccess=onSuccess;
            this.onFailure=onFailure;
            this.notifySource=notifySource;

            OneSignal.push(function() {
                OneSignal.on("subscriptionChange", function(isSubscribe) {
                    if(subscribeCall==true){
                        subscribeCall=false;
                        webPushNotification.updateSubscription(isSubscribe);
                        if(isSubscribe) {
                            customEventGA('notification', 'Allow', webPushNotification.notifySource);
                            webPushNotification.onSuccess();
                        } else {
                             customEventGA('notification', 'Denied', webPushNotification.notifySource);
                            webPushNotification.onFailure();
                        }    
                    }
                });
            });

             OneSignal.push(function() {
                webPushNotification.onManageWebPushSubscriptionButtonClicked();
                var setflagStop=1;
                var timePermission=setInterval(function() {
                  OneSignal.push(["getNotificationPermission", function(permission) {
                    if(permission=='granted'){
                      webPushNotification.getPushNotificationState().then(function(state) {  
                        if(state.isPushEnabled==true && subscribeCall==true) {
                            subscribeCall=false;
                            clearInterval(timePermission);
                            webPushNotification.updateSubscription(true);
                            if(setflagStop<=15){
                                customEventGA('notification', 'Allow', webPushNotification.notifySource);
                                webPushNotification.onSuccess();
                            }else{
                                customEventGA('notification', 'Allow Timeout', webPushNotification.notifySource);
                            }

                        }
                      });
                    }else if(permission=='denied'){
                        clearInterval(timePermission);
                        if(setflagStop<=15){
                            customEventGA('notification', 'Denied', webPushNotification.notifySource);
                            webPushNotification.onFailure();
                        }else{
                            customEventGA('notification', 'Denied Timeout', webPushNotification.notifySource);
                        }
                    }else if(setflagStop==15){
                        customEventGA('notification', 'Timeout', webPushNotification.notifySource);
                        webPushNotification.onFailure();
                    }
                    setflagStop++;
                   }]); 
                }, 500);    

            });
        },
        //private function
        main:function(onInit) {

          OneSignal.push(function() {

            var isPushSupported = OneSignal.isPushNotificationsSupported();
            if (!isPushSupported) {
                return false;
            }
            webPushNotification.getPushNotificationState().then(function(state) {
                if(state.NotificationPermission=='denied') {
                    return false;
                }
                if(state.isPushEnabled==true) {
                    return false;
                }
                onInit();
            });
          
          });
        
        },
        getPushNotificationState:function(){
            return Promise.all([
                  OneSignal.getNotificationPermission(),
                  OneSignal.isPushNotificationsEnabled(),
                  OneSignal.isOptedOut()
                ]).then(function(result) {
                    return {
                        NotificationPermission: result[0],
                        isPushEnabled: result[1],
                        isOptedOut: result[2]
                    };
                });
        },
        tagSubscription:function(ga, user, source){
            OneSignal.push(function() {
                OneSignal.sendTags({
                  _ga: ga,
                  user: user,
                  source: source
                });        
            });
        },
        getUserData:function(){
            return Promise.all([
                  OneSignal.getUserId(),
                  OneSignal.getRegistrationId()
                ]).then(function(result) {
                   return {
                        onesignalid: result[0],
                        tokenid: result[1]
                    };
                });
        },
        updateSubscription:function(isSubscribe){
             this.getUserData().then(function(user) {
                var finaldata={OneSignalId:user.onesignalid, token:user.tokenid, device_os:"web", subscribe:1, for:"subscribeNotify"};
                let url=site_url_attend+"/ajax";
                webPushNotification.ajaxHit(finaldata, "POST", url, function(e){
                   
                });
            });
        },
        onManageWebPushSubscriptionButtonClicked:function(){
           webPushNotification.getPushNotificationState().then(function(state) {
                if (state.isOptedOut==true) {
                    OneSignal.setSubscription(true);
                } else {
                    OneSignal.registerForPushNotifications();  
                }
                // webPushNotification.updateSubscription(true);
            });
        },
        ajaxHit:function(data,method,url,callbacksuccess,callbackfail){
            let ajax = {};
            ajax.method = method;
            ajax.url = url;
            if(data == null || method == "POST")
                ajax.data = data;
            else
                ajax.url += "?"+jQuery.param( data );

            ajax.success=callbacksuccess;
            if(callbackfail==null) 
                ajax.error=this.callbackfaildefault;
            else
                ajax.error=callbackfail;

            $.ajax(ajax);
        },
        callbackfaildefault:function() {
            console.log('ajax hit fail');
        }
}

var onsiteNotification={
    validateNotification:function(data,callback) {
        var finaldata={
                       gaid:getCookie("_ga"),
                       user:getCookie("user"),
                       source:data.source,
                       channel:data.channel,
                       campaign:data.campaign,
                       for:"summaryAlert",
                       title:data.title
                     };
        $.ajax({type: "POST",url: site_url_attend+"/ajax",data:finaldata,
            success: function(d) {
                   d=$.parseJSON(d)
                   if(1==d.status.code){ 
                     callback();
                   }
                },
                error: function(d, s, e) {}
              });
    }
} 
/* end here */

/* hotel interest case */

function getHotelInterest(event,edition,visitor,itemType,bookingStatus,itemId,callback){

    if(typeof itemId!='undefined'){
        var itemstring="&itemId=" + itemId;
    }else{
        var itemstring='';
    }
    if(visitor!=''){
        var visitortring="&visitor_id=" + visitor;
    }else{
        var visitortring='';
    }

    $.ajax({
        type: "GET",
        url: site_url_attend + "/ajax?for=bookingInterest&edition=" + edition + "&event_id=" + event + visitortring + "&booking_type=" + itemType + "&bookingStatus=" + bookingStatus + itemstring,
        success: function(d) {
            result = $.parseJSON(d);
            if(result.status.code == 1){
                var data = result.data;
                callback(data);
            }
        },
        error: function() {}
    });

}

function hotelRedirect(event,edition,visitor,itemType,bookingStatus,itemId,prefix,url){

        var hotelWindow = window.open();

        getHotelInterest(event,edition,visitor,itemType,bookingStatus,itemId,function(data){
            var split_url = url.split("&");

            split_url[1] = split_url[1] + '_ga' + data.gaUser;   //change this split logic

            // if(prefix != null){

            //     prefix = prefix.replace('_','');

            //     if(split_url[1].search("mb") > 0){
            //         var lableR = split_url[1].replace('label=wb_','');
            //         var label = 'lable=' + prefix + '_' + lableR;
            //     }

            //     if(split_url[1].search("wb") > 0){
            //         var lableR = split_url[1].replace('label=wb_','');
            //         var label = 'lable=' + prefix + '_' + lableR;
            //     }
            // }
            
            url = split_url[0] + "&" + split_url[1];

            hotelWindow.location.href = url;
        }); 
    
}
/* hotel interest end here */
document.addEventListener('keydown', function(event) {
    const key = event.key; // const {key} = event; in ES6+
    if (key === "Escape") {
       $( ".modal-backdrop" ).removeClass('modal-backdrop');
    }
});

// media embed
function modalCross() {
    $(".modal-content").attr("data-type", "integrated");
    $(".modal-content button").css({
        "color": "#f00",
        "background-color": "#fff",
        "border-radius": "50%",
    }).addClass("embed-close");

    $(".modal-content button span").css({
        "padding": "0px 6px",
    });
}

$('#modalData').on('hidden.bs.modal', function (e) {
    if($(".modal-content").attr("data-type") === "integrated") {
        embedData = [];
        $(this).html('');
    }
});
// END

/* Raj kumar - Thankyou page exhibitor Data - start */
function exhibitorMeetingData(){
    $.ajax({
    type: "GET",
    url: site_url_attend+"/ajax?for=exhibitorMeeting",
    beforeSend: function() {},
    ajaxSend: function() {},
    complete: function() {},
    success: function(result) {
        var result = JSON.parse(result);
        if(result.hasOwnProperty('exhibitorConnects')) {
            for (var key in result.exhibitorConnects){
                if(result.exhibitorConnects[key]== 1) {
                    if(page_type == "thankyou_new"){
                        $("a[data-user-id='"+key+"'].exhibitorConnect").addClass('').attr('data-action','exhibitSchedule').attr('data-param',key).html("Select Time <i class='fa fa-edit' style='font-size:12px;transform:translateY(1px);'></i>");
                    }
                }
            }
        }
        if(result.hasOwnProperty('exhibitorMeetings')) {
            for (var key in result.exhibitorMeetings) {
                if(result.exhibitorMeetings[key]==1) {
                    exhibitorSetMeetingCallBack(key);
                }
            }
        }
        if(result.hasOwnProperty('exhibitorEnquiries')) {
            for (var key in result.exhibitorEnquiries){
                if(result.exhibitorEnquiries[key]== 1) {
                    if(page_type == "thankyou_new"){
                        $("a[data-user-id='"+key+"'].exhibitorConnect").removeAttr('onclick').attr('disabled','disabled').addClass('').html("<i class='fa fa-check text-success' style='font-size:12px;transform:translateY(1px);'></i> Bookmark");
                    }
                }
            }
        }
    }
    });
}
/* Raj kumar - Thankyou page exhibitor Data - end here */

function openChat(userID){
  if(page_type=='profile'){
    if($('#TenTimes-Modal .modal-title').text().search('Mutual')>-1){
      $('#TenTimes-Modal').modal('hide');
    }
  }
    showloading();
    channelChat.push(function() {
            channelizeUI.openChatBox(userID);
    });
    channelizeInit.callChannelize();
}

function handleCredentialResponse(response){
    var postData={};
    postData.clientId=response.clientId;
    postData.credential=response.credential;
    if(pageType=='about' || pageType=='visitors' || pageType=='exhibitors' || pageType=='comments' ||  pageType=='photos-videos' || pageType=='deals' || pageType=='speakers'){
      postData.eventid=$('#eventID').val();
    }    
    customEventGA('User', 'Onetap Continue', pageType);
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax?for=onetaplogin",
        data: postData,
        success: function(data){
          var d=$.parseJSON(data);
          if(d.status==1){
            if(page_type=='register_new' || page_type=='login_new'){
              showloading();
              location.reload();
             }
             showToast("You are successfully logged In!",'#43C86F');              
             getLoggedInDataN();
          }else{
            showToast(d.message);
          }  
        },
        error: function(data){
            // console.log(data);
        }
    });
}

function askNotification(){
      var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
      if(isSafari==false){
          webPushNotification.Init(function(){
            var eventid='';
            if(pageType=='about' || pageType=='visitors' || pageType=='exhibitors' || pageType=='comments' ||  pageType=='photos-videos' || pageType=='deals' || pageType=='speakers'){
                eventid=$('eventID').val();
            } 
            if(eventid!=''){
              var dataqueue={
                          event_id:eventid, 
                          source: pageType+'_notification' 
              }
              dataqueue.flag=1;
              dataqueue.interest=1000;
              hitQueue(dataqueue);
            }
            webPushNotification.notifyaction(function(){
              var user=getCookie('user');
              var _ga=getCookie('_ga');
              webPushNotification.tagSubscription(_ga,user,pageType+'_notification');    
            },function(){
              console.log('denied'); 
            },pageType+'_notification');
          });
          
      }
}
/* code end here */
var totalmsgchat=0;
var channelChat = window.channelChat || [];
var channelizeInit={
    login:function(){
      if(getCookie("ch_token") && getCookie("ch_token")!=''){
        channelizeInit.tokenVerification(getCookie("ch_token"));     
      }else{
        $.ajax({type: "POST",url: site_url_attend + "/ajax?for=chatKeyCreate",success: function(n) {
            if(site_url_attend.indexOf("local.10times.com") > -1 || site_url_attend.indexOf("stg.10times.com")>-1)
                var urlchannel='https://api.channelize.io/v2/users/login';
            else
                var urlchannel='https://10timesapi.channelize.io/v2/users/login';
            
            chatkeydata=JSON.parse(n);
            if(chatkeydata.status==1){
                var channeldata={
                        authenticationType:0,
                        userId:getCookie('user'),
                        pmClientServerToken:chatkeydata.token
                };
                chatkeydata=JSON.stringify(channeldata);
                if(site_url_attend.indexOf("local.10times.com") > -1 || site_url_attend.indexOf("stg.10times.com")>-1)
                    var publicKey='Ln35RteZ8opB9dmE';
                else
                    var publicKey='W7ZjklxTaIcws2Og';
                $.ajax({type: "POST",url: urlchannel,data:chatkeydata,
                    headers: {
                        'Public-Key': publicKey,
                        'Content-Type':'application/json'
                    },
                    success: function(xyz) {
                      setCookie('ch_token', xyz.id, 30);
                      channelizeInit.initializeChat(xyz);    
                    }
                });
            }
        }
        });
      }
    },
    tokenVerification:function(token){
     if(site_url_attend.indexOf("local.10times.com") > -1 || site_url_attend.indexOf("stg.10times.com")>-1)
        var urlchannel='https://api.channelize.io/v2/users/verify_access_token';
    else
        var urlchannel='https://10timesapi.channelize.io/v2/users/verify_access_token';

        var tokenKeydata={
            accessToken:token
        }
        tokenKeydata=JSON.stringify(tokenKeydata);
        if(site_url_attend.indexOf("local.10times.com") > -1 || site_url_attend.indexOf("stg.10times.com")>-1)
            var publicKey='Ln35RteZ8opB9dmE';
        else
            var publicKey='W7ZjklxTaIcws2Og';
        $.ajax({type: "POST",url: urlchannel,data:tokenKeydata,
            headers: {
                'Public-Key':publicKey,
                'Content-Type':'application/json'
            },
            success: function(x) {
              channelizeInit.initializeChat(x)
            },
            error: function(e) {
              deleteCookie('ch_token');
              channelizeInit.login();
            },
        });
    },
    cookieSave:function(){
        
    },
    initializeChat:function(data){

        var loginuserid='';
        if(typeof data.user=='undefined')
          loginuserid=data.userId;
        else
          loginuserid=data.user.id;

        if(loginuserid!=getCookie('user')){
          deleteCookie('ch_token');
          channelizeInit.login();
          return false;
        }
        if(site_url_attend.indexOf("local.10times.com") > -1 || site_url_attend.indexOf("stg.10times.com")>-1){
            var publicKey='Ln35RteZ8opB9dmE';
            var ui_url='https://cdn.channelize.io/ui/2.0.0/channelize-prebuilt-ui.min.js';
            (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = ui_url;
            fjs.parentNode.insertBefore(js, fjs);
                window._chOptions = {
                      publicKey: publicKey,
                      accessToken: data.id,
                      color: '#e55513',
                      userId: loginuserid,
                      allowUsersSearch: false,
                      settings: {      
                            zIndex: 999,
                            tabs: {
                                  recent: true,
                                  contacts: true,
                                  groups: false,
                                  calls: false,
                                  default: 'recent'
                            },
                            headerIcons: {
                                  search: true,
                                  startNew: {
                                        newConversation: false,
                                        newGroup: false
                                  },
                                  more: {
                                        settings: false,
                                        blockedContacts: true
                                  }
                            },               
                          displayLauncher: false
                      },     
                     
                      onLoad: function(payload) {  
                             createChatIcon();
                             if(typeof payload!='undefined')
                             totalmsgchat=payload.totalUnreadMessageCount;
                            if(totalmsgchat>0){
                                $('#messageInit').find('.chatIcon').removeClass('dis-non').html();
                            }else{
                                $('#messageInit').find('.chatIcon').addClass('dis-non');
                            }
                            while (channelChat.length){
                                hideloading();
                                channelChat.shift().call();
                            }
                      },
                      onMessageReceived: function(message) {
                         totalmsgchat=totalmsgchat+1;
                            $('#messageInit').find('.chatIcon').removeClass('dis-non').html();
                      },       
                      onMessageRead: function(updatedTotalUnreadMsgCount, readMessageCount) {
                         totalmsgchat=updatedTotalUnreadMsgCount;
                            if(totalmsgchat>0){
                                $('#messageInit').find('.chatIcon').removeClass('dis-non').html();
                            }else{
                                $('#messageInit').find('.chatIcon').addClass('dis-non');
                            }
                      }
                };
            }(document, "script", "channelize-jssdk"));
        }else{
            var publicKey='W7ZjklxTaIcws2Og';
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "https://cdn-10times.channelize.io/ui/2.0.0/channelize-prebuilt-ui.min.js";
                fjs.parentNode.insertBefore(js, fjs);
                window._chOptions = {
                      publicKey: publicKey,
                      accessToken: data.id,
                      userId: loginuserid,
                     
                      settings: {
                          displayLauncher: false,
                          allowUsersSearch: false,
                          userQueryParams: {},
                          defaultProfileImageUrl: '',
                          zIndex: 999,
                          tabs: {
                              recent : true,
                              contacts: false,
                              groups: false,
                              calls: false,
                              default: 'recent'
                          },
                          headerIcons: {
                              search: true,
                              startNew: {
                                    newConversation: false,
                                    newGroup: false
                              },
                              more: {
                                    settings: false,
                                    blockedContacts: false
                              }
                          },                         
                          themeSettings: {
                              "theme-color": '#2175f5',
                              "primary-text-color": '#4a505a',
                              "secondary-text-color": '#3a3c4c',
                              "tertiary-text-color": '#8b8b8b',
                              "headers-bg-color": '#ffffff',
                              "screens-bg-color": '#ffffff',
                              "screens-hover-color": '#0000000a'
                          }
                      },
                      onLoad: function(payload) {  
                             createChatIcon();
                             if(typeof payload!='undefined')
                             totalmsgchat=payload.totalUnreadMessageCount;
                            if(totalmsgchat>0){
                                $('#messageInit').find('.chatIcon').removeClass('dis-non').html();
                            }else{
                                $('#messageInit').find('.chatIcon').addClass('dis-non');
                            }
                            while (channelChat.length){
                                hideloading();
                                channelChat.shift().call();
                            }
                      },
                      onMessageReceived: function(message) {
                         totalmsgchat=totalmsgchat+1;
                            $('#messageInit').find('.chatIcon').removeClass('dis-non').html();
                      },       
                      onMessageRead: function(updatedTotalUnreadMsgCount, readMessageCount) {
                         totalmsgchat=updatedTotalUnreadMsgCount;
                            $('#messageInit').find('.chatIcon').removeClass('dis-non').html();
                      }
                };
                }(document, "script", "channelize-jssdk"));
        }
    },
    callChannelize:function(){
        if(typeof channelizeUI!='undefined'){
            hideloading();
            while (channelChat.length){
                channelChat.shift().call();
            }   
        }
         
    }
}
function connectFail(result,error){
    let msg = 'Request can\' be sent';
    if(typeof error!='undefined' && error.hasOwnProperty('message')){
        var msg_type = '';
        if(error.message.toLowerCase().search('connection limit') > -1)
            msg_type='limit';
        else if(error.message.toLowerCase().search('spam') > -1)
            msg_type='spam';
        if(msg_type=='limit'){
            msg = error.message;
            msg = msg.replace('.','.\n');
            if($('#modalData').html() == "")
            $('#modalData').html(getModal());
            $('#TenTimes-Modal .modal-dialog').removeClass('modal-740');
            $('#TenTimes-Modal .modal-dialog').addClass('modal-500');
            $('#TenTimes-Modal .modal-header').removeClass('text-center');
            $('#TenTimes-Modal .modal-title').html(msg);
            $('#TenTimes-Modal .modal-title').css({'font-size':'15px','text-align':'center'});
            $('#TenTimes-Modal .modal-body').remove();
            $("#TenTimes-Modal").modal("show");
        }else if(msg_type=='spam'){

        }
        if(msg_type=='limit' || msg_type=='spam'){
            switch(pageType){
            case 'about':
            case 'visitors':
                $('.sugg_button').addClass('disabled');
                $('.sugg_button').removeAttr('onclick');
                break;
            case 'profile':
                let len = $('.speaker-Connection').length;
                for(let i=0;i<len;i++){
                    if($('.speaker-Connection').eq(i).html()=='Connect'){
                        $('.speaker-Connection').eq(i).addClass('disabled');
                        $('.speaker-Connection').eq(i).removeAttr('onclick');
                    }
                }
                $('.btn_connect').addClass('disabled');
                $('.btn_connect').removeAttr('onclick');
                $('.cnntBtn2').addClass('disabled');
                $('.cnntBtn2').removeAttr('onclick');
                break;
            case 'thankyou_new':
                if($('#myConnectionListModal').css('display')=='block'){
                    let len = $('#myConnectionListModal').find('span').length;
                    for(let i=0;i<len;i++){
                        if($('#myConnectionListModal').find('span').eq(i).html()=='Connect'){
                            $('#myConnectionListModal').find('span').eq(i).addClass('disabled');
                            $('#myConnectionListModal').find('span').eq(i).removeAttr('onclick');
                        }
                    }
                }
                $('.cnntBtn2').addClass('disabled');
                    $('.cnntBtn2').removeAttr('onclick');
                break;
            default: break;
            }
        }
    }
}
$("#GautocompleteDesignation").keydown(function(e) {
    designation_autoComplete("#GautocompleteDesignation");
});
$("#GautocompleteDesignation").click(function(e) {
    designation_autoComplete("#GautocompleteDesignation");
});
$("#designation").keydown(function(e) {
    designation_autoComplete("#designation",'user_designation');
});
$("#designation").click(function(e) {
    designation_autoComplete("#designation",'user_designation');
});

function openMsg(ConnectionId){
  location.href=site_url_attend+'/dashboard/messages/'+ConnectionId;
}

// newsletter
function showChooseCategory(result){
  if (result.status == 0) return false;
  userid=result.userData.id;
  var postData={};
  postData.user=userid;
      pubindustry=[];
      unpubindustry=[];
    $.ajax({
        type: "POST",
        url: site_url_attend + "/ajax?for=showcategorylist",
        data: postData,
        success: function(data){
          var d=$.parseJSON(data);
          let Modaltitle='Please select the Category that you have interest!!';
          let ModalBody='<div id="categorySelect" class="px-10" style="    overflow: auto;">';
          for (var i = 0; i < d.category.data.length-1; i++) {
            ModalBody+='<div class="pd-5 pb-10 col-md-4 col-sm-4"><label class="indCheck" style="margin-left: 15px;"> <input type="checkbox" value="'+d.category.data[i].id+'" name="industry" style="display:none"><span class="checkboxindustry"></span></lable><span class="text-muted" data-id="'+d.category.data[i].id+'"><i class="fa '+d.category.data[i].icon+'" style="color: #ffb545;"></i> '+d.category.data[i].name+'</span></div>';
          }
          
          ModalBody+='</div><div style="text-align: -webkit-center;"><a href="javascript:void(0)" rel="nofollow" class="btn btn-orange submitCategory" style="">Submit</a></div>';
          let stylingData=Array();
          stylingData={
                  modAlign:'modTopCenter',
                  modId:'selectCategory',
                  modRadius:'10px',
                  modalSize: 'modal-lg'                 

          };
          sweetModal.initial(ModalBody,Modaltitle,stylingData);
          $('#'+stylingData.modId+' .modal-dialog').css('left','23%');
          $('#'+stylingData.modId+' .modal-title').css('text-align','-webkit-center');

          if(d.userinterest.status==1){
            for(var j=0;j<d.userinterest.data.interests.industry.length; j++){
                $('.indCheck').each(function(){
                  if($(this).find('input').val()==d.userinterest.data.interests.industry[j].value){
                      $(this).find('input').prop('checked',true);
                      $(this).find('input').click(function(){
                           if($(this).is(":checked")==true){
                              unpubindustry.splice(unpubindustry.indexOf($(this).val()),1);
                           }else{
                              unpubindustry.push($(this).val());
                           } 
                      })
                  }
                })
            }
          }

          $('.submitCategory').click(function(){
            $('#'+stylingData.modId+' #sweetModal').modal('hide');
            $('.modal-backdrop').remove();
              $('.indCheck').each(function(){
                  if($(this).find('input').is(":checked")==true){
                    pubindustry.push($(this).find('input').val());
                  }
              });
              $('#'+stylingData.modId).remove();
              if(pubindustry.length>0){
                var b={
                    source : "web",
                    user : userid,
                    action : "userInterest" ,
                    interest : "industry" , 
                    interestValue : JSON.stringify(pubindustry),
                    confirm : "1"
                };
                $.ajax({
                    url: site_url + "/ajax?for=saveCategoryList",
                    type: "POST",
                    data: b,
                    success: function() {
                      $('#selectCategory #sweetModal').modal('hide');
                      $('body').removeClass('modal-open').css('padding-right','');
                      $('.modal-backdrop').remove();
                      $('#selectCategory').remove();
                      showToast('Interest has been successfully submitted','#43C86F');
                    }
                });  
              }
              if(unpubindustry.length>0){
                  var c={
                    source : "web" ,
                    user :  userid,
                    action : "userInterest" ,
                    interest : "industry" , 
                    interestValue : JSON.stringify(unpubindustry),
                    confirm : "-1"
                };
                $.ajax({
                    url: site_url + "/ajax?for=saveCategoryList",
                    type: "POST",
                    data: c,
                    success: function(e) {
                        $('#selectCategory #sweetModal').modal('hide');
                        $('body').removeClass('modal-open').css('padding-right','');
                        $('.modal-backdrop').remove();
                        $('#selectCategory').remove();
                        showToast('Interest has been successfully submitted','#43C86F');    
                    }
                });  
              } 
          });            
        },
        error: function(data){
        }
    });
}

function loginSubsCallback(result) {
  $('#askfornewsletter #sweetModal').modal('hide');
  $('body').removeClass('modal-open').css('padding-right', '');
  $('.modal-backdrop').remove();
  $('#askfornewsletter').remove();        
  if(result.userData.verified == false) showChooseCategory(result);
}

function askfornewsletter() {
  let Modaltitle = 'Not ready to commit !';
  let ModalBody = `
    <section id="collections_box" class="border rounded-3">
      <div class="row text-center py-3 mx-0" style="border-bottom: 1px dashed grey;">
        <div class="col-3 my-auto">
          <img class="getsitecontrol-image" src="https://m2.getsitecontrol.com/gallery/images/ballicons/5-5127e085623d0c92c96cf2001bcdd7cb.svg" style="height: 46px !important;"/>
        </div>

        <div class="col-9 my-auto">
          We'll keep you in the loop on all latest &amp; top events in your industry
        </div>
      </div>

      <div class="input-group p-4">
        <input type="email" id="userEmail" class="form-control" placeholder="youremail@domain.com" aria-label="email" required>
        <span id="subscribe-newsletter" class="input-group-text btn btn-orange" role="button">SUBSCRIBE</span>
      </div>
    </section>
  `;

  let stylingData = {
    modAlign: 'modTopCenter',
    modId: 'askfornewsletter',
    modRadius: '10px'
  };

  sweetModal.initial(ModalBody, Modaltitle, stylingData);

  document.querySelector('#subscribe-newsletter').addEventListener('click', function() {
    let email = this.previousElementSibling;
    if(!validateEmail12345(email.value)) {
      email.classList.add('border-danger');
    } else {
      email.classList.remove('border-danger');
      let data = {
        'email': email.value,
        'source': 'subscribe_' + pageType + '_login',
        'action': 'follow',
        'listing_id': 1
      };

      showloading();
      hitAuth(data, 'subscribe_login', data.source, '', this);
    }
  });
}
// newsletter end


// sync user action data
function joinCommunity() {
  if (document.getElementById('join-community')) {
    let join = document.getElementById('join-community');
    join.innerHTML = `<i class="fas fa-check" aria-hidden="true"></i>&nbsp;Subscribe`;
    join.classList.remove('btn-orange');
    join.classList.add('btn-success');
    join.removeAttribute('onclick');
    join.disabled = true;
  }
}

function postSpeakerIntent(data) {
  if (data.hasOwnProperty("speaker_follow")) {
    if (document.getElementById('popular_speakers')) {
      document.querySelectorAll('#popular_speakers .xn').forEach(elem => {
        for (var i = 0; i < data.speaker_follow.length; i++) {
          if (data.speaker_follow[i].speakerId == elem.dataset.id) {
            elem.classList.remove('a-m');
            elem.classList.add('text-orange');
            elem.removeAttribute('onclick');
            elem.disabled = true;
            break;
          }
        }
      })
    }
  }
}

function postNetworkIntent(data) {
  if (data.hasOwnProperty("speaker_follow")) {
    if (document.getElementById('top_networker')) {
      document.querySelectorAll('#top_networker .xn').forEach(elem => {
        for (var i = 0; i < data.speaker_follow.length; i++) {
          if (data.speaker_follow[i].speakerId == elem.dataset.id) {
            elem.classList.remove('a-m');
            elem.classList.add('text-orange');
            elem.removeAttribute('onclick');
            elem.disabled = true;
            break;
          }
        }
      })
    }
  }
}

function postFeedIntent(data) {
  if (data.hasOwnProperty("events")) {
    if (document.getElementById('feeds')) {
      document.querySelectorAll('#feeds .xn').forEach(elem => {
        for (var i = 0; i < data.events.length; i++) {
          if (data.events[i].event == elem.dataset.id) {
            elem.classList.remove('a-m');
            elem.classList.add('text-orange');
            elem.removeAttribute('onclick');
            elem.disabled = true;
            break;
          } 
        }  
      })
    }
  }
}

function postEventIntent(data) {
  if (data.events && document.querySelectorAll('.event-card') && document.querySelectorAll('.event-card').length) {
    document.querySelectorAll('.event-card .xn').forEach(elem => {
      for (var i = 0; i < data.events.length; i++) {
        if (data.events[i].event == elem.dataset.id) {
          elem.classList.remove('a-m');
          elem.classList.add('text-orange');
          elem.removeAttribute('onclick');
          elem.disabled = true;
          break;
        }
      }
    })
  }
}

function postUserIntent(data) {
  if (data.hasOwnProperty("user_access") && odashLinkingAdd(data), data.hasOwnProperty("lisitng_follow")) {
    for (var i = 0; i < data.lisitng_follow.length; i++) {
      if (document.getElementById("listingcombo_id") && document.getElementById("listingcombo_id").value == data.lisitng_follow[i]) {
        if (document.getElementById('follow_top')) {
          let elem = document.getElementById('follow_top');
          elem.classList.remove('follows');
          elem.classList.add('follwings');
          let btn = document.querySelector('#follow_top button');
          btn.textContent = 'Following';
          btn.removeAttribute('onclick');
          btn.disabled = true;
        }

        if (document.getElementById('page-follow')) {
          let elem = document.getElementById('page-follow');
          elem.removeAttribute('onclick');
          elem.disabled = true;
        }

        if (document.querySelector('.botton_haeding')) {
          let elem = document.querySelector('.botton_haeding');
          elem.innerHTML = `<span class="left-triangle"></span>Following`;
          elem.style.width = '130px';
          elem.style.cursor = 'default';
          elem.removeAttribute('onclick');
          elem.disabled = true;
        }

        if (document.getElementById('subscribe')) {
          let elem = document.getElementById('subscribe');
          elem.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>&nbsp;Subscribed';
          elem.classList.remove('text-white');
          elem.classList.add('text-blue');
          elem.style.border = '1px solid';
          elem.style.backgroundColor = 'transparent';
          elem.removeAttribute('onclick');
          elem.disabled = true;
        }
        
        break;
      }
    }
  }
}

function followEventCheck(t) {
  $.each($("#content .box"), function() {
    if ($(this).find("h2").attr("id") && t.hasOwnProperty("events")) {
      for (a = 0; a < t.events.length; a++) {
        if (t.events[a].event == $(this).find("h2").attr("id")) {
          if ($(this).find(".fa-ticket").length > 0) {
            if(t.events[a].edition == $(this).find("h2").attr("data-edition") && 2 != t.events[a].flag) {
              if($(this).attr('data-purchase') == 'purchase' || badgeStatus(t.events[a] == "11")) {
                $(this).find(".fa-ticket").parent().html($(this).find(".fa-ticket").parent().html().replace("Get Ticket", "Download Ticket").replace("Register", "Registered")).css("color", "#fb6d01");
                $(this).find(".fa-ticket").parent().removeClass("a-m x-es-gtb").addClass("x-es-dtb").off("click").attr("onclick", "downloadPdfTimeout(this);").attr("encodeId", t.events[a].visitorId);
                $(this).find(".fa-ticket").removeClass("text-muted").addClass("fa-download").css("color", "#fb6d01").removeClass("fa-ticket");
              } else if($(this).attr('data-purchase') == 'purchase') {
                $(this).find(".fa-ticket").parent().html($(this).find(".fa-ticket").parent().html().replace("Register", "Registered")).css("color", "#fb6d01");
                $(this).find(".fa-ticket").parent().removeClass("a-m").addClass("disabled").off("click").prop("onclick", null);
                $(this).find(".fa-ticket").removeClass("text-muted").addClass("fa-check").css("color", "#fb6d01").removeClass("fa-ticket");
              }
            }
          }

          if ($(this).find(".fa-star").length > 0) {
            $(this).find(".a-m>.fa-star").removeClass("fa-star text-muted").addClass("fa-check").parent().prop("onclick", "return false;").removeClass("a-m").addClass("text-orange disabled");
          }

          if ($(this).find(".fa-bookmark-o").length > 0) {
            $(this).find(".fa-bookmark-o").removeClass("fa-bookmark-o").addClass("fa-bookmark").parent().addClass("text-orange disabled");
          }

          if ($(this).find(".atnd_modal").length > 0) {
            $(this).find(".atnd_modal").prop("onclick", null).click(function() {return !1});
          }
        }
      }
    }
  });
}

function myDataSync(data) {
  joinCommunity();
  postSpeakerIntent(data);
  postNetworkIntent(data);
  postFeedIntent(data);
  postEventIntent(data);
  postUserIntent(data);
  followEventCheck(data);
}

function send_linkMail(){
  if (document.querySelector('.link_email')) {
    let user_email = document.querySelector('.link_email').value;
    if (validateEmail_link(user_email)) {
      document.querySelector('.email_error').style.display = 'none';

      request({
        method: 'GET',
        url: `${site_url_attend}/ajax?for=applinkEmail&email=${user_email}`
      })
      .then(data => {
        if (data == 'Deactivate' || data == 'unsubscribe') {
          document.querySelector('.email_success').style.display = 'none';
          document.querySelector('.email_unsuccess').style.display = '';
          $('.email_success').css('display','none');
          $('.email_unsuccess').css('display','');
        } else {
          document.querySelector('.email_success').style.display = '';
          document.querySelector('.email_unsuccess').style.display = 'none';
        }
      })
    }
  }
}

function validateEmail_link(B) {
  if (B == "") {
    document.querySelector('.email_success').style.display = 'none';
    document.querySelector('.email_error').style.display = '';
    return false;
  }
  
  var C = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (!(C.test(B))) {
    document.querySelector('.email_success').style.display = 'none';
    document.querySelector('.email_error').style.display = '';
  }

  if (B.charAt(0) == ".") {
    document.querySelector('.email_success').style.display = 'none';
    document.querySelector('.email_error').style.display = '';
  }

  return (C.test(B) && !(B.charAt(0) == "."));
}
// sync user action data end
