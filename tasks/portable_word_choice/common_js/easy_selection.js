function cycle_class(target_element,class_list){
  for(var i=0;i<class_list.length;i++)
    {
      if( $(target_element).hasClassName(class_list[i]))
	{
	  $(target_element).removeClassName(class_list[i]);
	  new_class=i+1;
	  if(new_class>=class_list.length)
	    {
	      new_class=0;
	    }
	  $(target_element).addClassName(class_list[new_class]);
	  return class_list[new_class];
	}
    }
  return "";
}


function set_active_class_id(target_element,class_list,new_class){
  for(var i=0;i<class_list.length;i++)
    {
      if( $(target_element).hasClassName(class_list[i]))
	{
	  $(target_element).removeClassName(class_list[i]);
	}
    }
  $(target_element).addClassName(class_list[new_class]);
}

function get_active_class_id(target_element,class_list){
  for(var i=0;i<class_list.length;i++)
    {
      if( $(target_element).hasClassName(class_list[i]))
	{
	  return i;
	}
    }
  return -1;
}
