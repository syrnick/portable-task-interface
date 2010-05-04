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
}

var portable__all_loaded_handler = function()
{
    if(verbosity>5)
	{
	    $('verbose_parameters').style.display='block';
	    if(mt_mode=="input")
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
	}
    else
	{

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

    if(mt_mode !="input")
	{
	    unpack_selection_data(submission_data);
	    
	    comment_str=submission_data.get('comment','');
	    if(comment_str != "")
		{ 
		    $('Comments').value=comments_str;
		}
	}

    var now = new Date();
    $('load_time').value=now.toUTCString();
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

var word_choice__collect_data = function(){
    //Validate all values, collect selections into form strings;
    if(collect_and_validate_data()){
	return mt_submit_handler();
    }

    return false;
}