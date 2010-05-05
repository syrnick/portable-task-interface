var show_txt=function(txt){
    return txt.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br/>").replace(/ /g,"&nbsp;");
}
var show_data=function(data){
    return "";
    return data.toString();
}

var all_sentences=new Array();
var sentence_lengths=new Array();

var format_sentence=function(root,prefix,sentence,separators){
    parts=sentence.split(separators);
    var input_id=prefix+"_selections";
    var hidden_input = document.createElement('input');
    hidden_input.setAttribute("id",input_id);
    hidden_input.setAttribute("name",input_id);
    if(verbosity>5){
	hidden_input.setAttribute("type","text");
    }else{
	hidden_input.setAttribute("type","hidden");
    }
    root.appendChild(hidden_input);	
    all_sentences.push(prefix);
    sentence_lengths[prefix]=parts.length;

    for( var i=0; i<parts.length; i++)
    {
	var span_id=prefix+"_"+i+"_span";

	var word_span = document.createElement('span');
	word_span.setAttribute("id",span_id);
	word_span.addClassName("not_selected");
	word_span.innerHTML=parts[i];
	word_span.setAttribute("onclick","cycle_class($('"+span_id+"'),['not_selected','selected']);return true;");
	word_span.setAttribute("ondoubleclick","return true;")
	root.appendChild(word_span);	

	var span = document.createElement('span');
	span.innerHTML=" ";
	root.appendChild(span);	
    }

    br = document.createElement('br');
    root.appendChild(br);	

    gold_div = document.createElement('div');
    var gold_id=prefix+"_gold_explanation";
    gold_div.setAttribute("id",gold_id+"_div");
    gold_div.addClassName("gold_div");
    root.appendChild(gold_div);

    gold_div.innerHTML="Gold standar explanation:<br/>";

    var gold_textarea = document.createElement('textarea');    
    gold_textarea.setAttribute("id",gold_id);
    gold_textarea.setAttribute("name",gold_id);
    gold_textarea.setAttribute("cols",80);
    gold_div.appendChild(gold_textarea);
}

var portable__all_loaded_handler = function()
{
    if(verbosity>5)
    {
	$('verbose_parameters').style.display='block';
	if(PTI_mode=="input")
	{
	    $('parameters').innerHTML=show_data(parameters_data);
	    $('work_unit').innerHTML=show_data(work_unit_data);
	}
	else
	{
	    $('parameters').innerHTML=show_data(parameters_data);
	    $('work_unit').innerHTML=show_data(work_unit_data);
	    $('submission').innerHTML=show_data(submission_data);
	}
    }else{
    }

    word_separators=' ';
    for(var k in work_unit_data)
    {
	var sentence_div = document.createElement('div');
	sentence_div.setAttribute("id",k);
	$('sentences_root').appendChild(sentence_div);
	var sentence_hr = document.createElement('hr');
	$('sentences_root').appendChild(sentence_hr);
	format_sentence(sentence_div,k,work_unit_data[k],word_separators);
    }

    $('task_content').style.display="block";	    
    $('task_loading').style.display="none";	    
    if(PTI_mode == "display" || PTI_mode == "edit")
    {
	unpack_selection_data(submission_data);
	if(gold_mode)
	{
	    unpack_gold_data(submission_data);
	}else if(gold_done)
	{
	    unpack_gold_data(gold_data);
	}
	
	var comment_str="";
	try{
	    comment_str=str(submission_data['comment']);
	}catch(err){
	    comment_str=""
	}
	if( (comment_str != "") && (comment_str != "undefined") )
	{ 
	    $('Comments').value=comment_str;
	}
    }
    if(PTI_mode == "training")
    {
	//unpack_selection_data(submission_data);
	unpack_gold_data(gold_data);
    }

    if(gold_mode){
	$$(".gold_div").invoke("show");
    }else{
	$$(".gold_div").invoke("hide");
    }

    var now = new Date();
    $('load_time').value=now.toUTCString();
}

var unpack_selection_data=function(selection_storage){   
    selection_classes=["not_selected","selected"];
    for(var idx_sentence=0;idx_sentence<all_sentences.length;idx_sentence++)
    {
	prefix=all_sentences[idx_sentence];
	var input_id=prefix+"_selections";    
	selection_str=selection_storage[input_id];
	num_words=sentence_lengths[prefix];
	selection_data=eval("tmp_var="+selection_str+";");
   	for(var idx_word=0;idx_word< num_words;idx_word++)
	{
	    span_id = prefix+"_"+idx_word+"_span";
	    selection_id = selection_data["w"+idx_word];
	    set_active_class_id(span_id,selection_classes,selection_id);
	}
    }
}

var gold_values;

var unpack_gold_data=function(gold_storage){   
    gold_values=new Array();
    for(var idx_sentence=0;idx_sentence<all_sentences.length;idx_sentence++)
    {
	prefix=all_sentences[idx_sentence];
	var gold_id=prefix+"_gold_explanation";
	var input_id=prefix+"_selections";    

	gold_str=gold_storage[gold_id];
	selection_str=gold_storage[input_id];
	num_words=sentence_lengths[prefix];
	$(gold_id).value=gold_str;

	selection_data=eval("tmp_var="+selection_str+";");
	gold_values[prefix]=selection_data;

   	/*for(var idx_word=0;idx_word< num_words;idx_word++)
	{
	    span_id = prefix+"_"+idx_word+"_span";
	    selection_id = selection_data["w"+idx_word];
	    set_active_class_id(span_id,selection_classes,selection_id);
	}*/
    }
}


var collect_and_validate_data=function(){   
    selection_classes=["not_selected","selected"];
    for(var idx_sentence=0;idx_sentence<all_sentences.length;idx_sentence++)
    {
	prefix=all_sentences[idx_sentence];
	var input_id=prefix+"_selections";    
	num_words=sentence_lengths[prefix];
	selection_str="{";
   	for(var idx_word=0;idx_word< num_words;idx_word++)
	{
	    span_id = prefix+"_"+idx_word+"_span";
	    selection_id = get_active_class_id(span_id,selection_classes);
	    if( idx_word>0)
		selection_str=selection_str + ",";
	    
	    selection_str=selection_str + '"w'+idx_word + '":' + selection_id;
	}
	selection_str=selection_str+"}";
	$(input_id).value=selection_str;
    }
    return true;
}

var validate_against_gold=function(){   
    selection_classes=["not_selected","selected"];
    any_errors=false;

    for(var idx_sentence=0;idx_sentence<all_sentences.length;idx_sentence++)
    {
	prefix=all_sentences[idx_sentence];
	gold = gold_values[prefix];

	correct=true;
	var input_id=prefix+"_selections";    
	num_words=sentence_lengths[prefix];
	selection_str="{";
   	for(var idx_word=0;idx_word< num_words;idx_word++)
	{
	    span_id = prefix+"_"+idx_word+"_span";
	    selection_value = get_active_class_id(span_id,selection_classes);
	    gold_value = gold["w"+idx_word];
	    if( selection_value != gold_value )
	    {
		correct = false;
		$(span_id).addClassName("text_error")
	    }else{
		$(span_id).removeClassName("text_error")
	    }
	}
	if( ! correct )
	{
	    any_errors=true;
	    $(prefix).addClassName("error");
	    $(prefix+"_gold_explanation_div").show();
	}else{
	    $(prefix).removeClassName("error");
	    $(prefix+"_gold_explanation_div").hide();
	}
    }
    if( any_errors )
    {
	return false;
    }

    alert("That's right");
    return true;
}


var word_choice__collect_data = function(){
    if(PTI_mode == "training")
    {
	if(validate_against_gold())
	{
	    return PTI_submit_handler();
	}

	return false;
    }else{
	//Validate all values, collect selections into form strings;
	if(collect_and_validate_data()){
	    return PTI_submit_handler();
	}

	return false;
    }
}