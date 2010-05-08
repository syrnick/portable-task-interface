//
// This method Gets URL Parameters (GUP)
//
var gup=function( name )
{
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var tmpURL = window.location.href;
    var results = regex.exec( tmpURL );
    if( results == null )
	return "";
    else
      return results[1];
}

//
// This method decodes the query parameters that were URL-encoded
//
var decode= function (strToDecode)
{
    var encoded = strToDecode;
    return unescape(encoded.replace(/\+/g,  " "));
}

var PTI_mode;
var gold_mode=false;
var proxy_mode="none";
var proxy_url="";

var PTI_setup = function (){
    var now = new Date();
    $('start_time').value=now.toUTCString();

    mode_value=gup('mode');
    PTI_mode = mode_value;
        
    //
    // Check if the worker is PREVIEWING the HIT or if they've ACCEPTED the HIT
    //
    if (gup('assignmentId') == "ASSIGNMENT_ID_NOT_AVAILABLE")
    {
	// If we're previewing, disable the button and give it a helpful message
	document.getElementById('submitButton').disabled = true;
	document.getElementById('submitButton').value = "You must ACCEPT the HIT before you can submit the results.";
    }
    
    submitURL=gup("submitTo");
    if(submitURL=="")
    {
	submitURL=gup("turkSubmitTo")+"/mturk/externalSubmit";
    }
    $('PTI_form').action=decode(submitURL);
    
    if( PTI_mode == "display" )
    {
	$('submitButton').hide();
    }


    gold_parameter=gup("gold");
    if(gold_parameter=="true")
	gold_mode=true;
    
    
    document.getElementById('assignmentId').value = gup('assignmentId');
    document.getElementById('workerId').value = gup('workerId');
    document.getElementById('hitId').value = gup('hitId');
    
    passthrough=gup('passthrough');
    if(passthrough!="")
    {
	names=passthrough.split(",");
	for(var idx_name=0;idx_name<names.length;idx_name++)
	{
	    n=names[idx_name];
	    var hidden_input = document.createElement('input');
	    hidden_input.setAttribute("id",n);
	    hidden_input.setAttribute("name",n);
	    hidden_input.setAttribute("type","hidden");
	    hidden_input.setAttribute("value",gup(n));
	    $('PTI_form').appendChild(hidden_input);
	}
    }
    
}


var PTI_setup_instructions=function()
{
    instructions_URL=unescape(gup("instructionsUrl"));
    if(instructions_URL=="")
    {
	$('instructions').hide();
    }
    else{
	$('a_instructions').href=instructions_URL;
	$('instructions').show();
    }
    
    instructions_div_URL=unescape(gup("instructionsDivUrl"));
    if(instructions_div_URL != "")
    {
	var inline_instruction_updater = new Ajax.Updater($('inline_instructions_div'),PTI_get_request_url(instructions_div_URL),{method:'get'});
	//	  $('inline_instructions_parent_div').show();
    }else{
        //	  $('inline_instructions_parent_div').hide();
    }
    
}




var parameters_resp;
var work_unit_resp;
var submission_resp;
var gold_resp;

var parameters_data;
var work_unit_data;
var submission_data;
var gold_data;

var parameters_done=0;
var work_unit_done=0;
var submission_done=0;
var gold_done=0;


var all_loaded_handler;

var PTI_after_load = function()
{
    if(PTI_mode=="input")
    {
	if(work_unit_done && parameters_done)
	{
	    all_loaded_handler();
	    var now = new Date();
	    $('load_time').value=now.toUTCString();
	}
    }
    else if(PTI_mode=="display" || PTI_mode=="edit")
    {
	if(work_unit_done && parameters_done && submission_done)
	{
	    all_loaded_handler();
	    var now = new Date();
	    $('load_time').value=now.toUTCString();
	}
	
    }
    else if(PTI_mode=="training" )
    {
	if(work_unit_done && parameters_done && gold_done)
	{
	    all_loaded_handler();
	    var now = new Date();
	    $('load_time').value=now.toUTCString();
	}
	
    }
}

var PTI_onParametersLoaded=function(transport,data)
{
    if (data == null)
    {
	data=eval("tmp="+transport.responseText);
    }
    parameters_resp = transport;
    parameters_data = data;
    parameters_done=1;
    PTI_after_load();
}

var PTI_onWorkUnitLoaded=function(transport,data)
{
    if (data == null)
    {
	data=eval("tmp="+transport.responseText);
    }
    work_unit_resp = transport;
    work_unit_data = data;
    work_unit_done=1;
    PTI_after_load();
}


var PTI_onSubmissionLoaded=function(transport,data)
{
    if (data == null)
    {
	data=eval("tmp="+transport.responseText);
    }
    submission_resp = transport;
    submission_data = data;
    submission_done = 1;
    PTI_after_load();
}

var PTI_onGoldLoaded=function(transport,data)
{
    if (data == null)
    {
	data=eval("tmp="+transport.responseText);
    }
    gold_resp = transport;
    gold_data = data;
    gold_done=1;
    PTI_after_load();
}

var PTI_get_param=function (parameters,parameter_name,default_value)
{
    return parameters.get(parameter_name,default_value);
}

var PTI_get_request_url = function(target_url)
{
    if(proxy_mode=="task")
    {
	request_url=proxy_url+"?url="+target_url
    }else{
	request_url=target_url
    }
    return request_url
}

var PTI_load_task_componentes =function(mode,completion_handler)
{
    all_loaded_handler=completion_handler;
    PTI_mode=mode;
    parameters_url=decode(gup("parametersUrl"));
    if(parameters_url!="")
    {
	var upd=new Ajax.Request(PTI_get_request_url(parameters_url), 
				 {
				     method: 'get',
				     onSuccess: PTI_onParametersLoaded,
				     evalJSON:'force'
				 });
    }

    work_unit_url=decode(gup("workUnitUrl"));
    var upd=new Ajax.Request(PTI_get_request_url(work_unit_url), 
			     {
				 method: 'get',
				 onSuccess: PTI_onWorkUnitLoaded,
				 evalJSON:'force'
			     });


    if(mode=="input")
    {
    }
    else if(mode=="display" || mode=="edit" )
    {
	submission_url=unescape(gup("submissionUrl"));
	var upd=new Ajax.Request(PTI_get_request_url(submission_url), 
				 {
				     method: 'get',
				     onSuccess: PTI_onSubmissionLoaded,
				     evalJSON:'force'
				 });
    }
    else if(mode=="training")
    {
	gold_url=unescape(gup("goldUrl"));
	var upd=new Ajax.Request(PTI_get_request_url(gold_url),
				 {
				     method: 'get',
				     onSuccess: PTI_onGoldLoaded,
				     evalJSON:'force'
				 });
    }
}


var PTI_submit_handler=function (){
    var now=new Date();
    $('submit_time').value=now.toUTCString();
    return true;
}


var get_persistent_value=function (var_name,default_value){
    var Cookies = new CookieHandler();
    var stored_cookie = Cookies.getCookie('persistent_var__'+var_name); // get cookie
    if (typeof(stored_cookie) == 'undefined' || stored_cookie==null) 
    {
	stored_cookie=default_value;
    }
    return stored_cookie;
}

var set_persistent_value=function (var_name,value){
    var Cookies = new CookieHandler();
    Cookies.setCookie('persistent_var__'+var_name,value, 30*24*3600); // set cookie for 1 month
}

var disableEnterKey=function(e)
{
    var key;
    
    if(window.event)
        key = window.event.keyCode;     //IE
    else
        key = e.which;     //firefox
    
    if(key == 13)
        return false;
    else
         return true;
}
