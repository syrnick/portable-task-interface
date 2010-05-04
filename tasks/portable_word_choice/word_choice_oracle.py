import logging

from SimpleXMLRPCServer import CGIXMLRPCRequestHandler

from django.utils import simplejson

from google.appengine.api import memcache
from google.appengine.api import urlfetch

import traceback
import re

def FetchUrlContent(url):
  """Returns the string fetched from the given URL.

  Uses the urlfetch interface to get the contents of a given URL.  The
  memcache version will be returned if recent.

  Args:
    url: The url to fetch.

  Raises:
    LookupError: The URL was not able to be fetched.
  """
  content = memcache.get(url)
  if content:
    return content

  request = urlfetch.fetch(url)

  if request.status_code == 200:
    content = request.content
    memcache.add(url, content, 60 * 60)
    return content

  raise LookupError('Unable to fetch URL. Response code: ' +
                    str(request.status_code))



def parse_selection_submission(submission):
    selection_re=re.compile("(?P<sentence_id>.*)_selections")
    selection={}
    for k,v in submission.items():
        m = selection_re.match(k);
        if m:
          sentence_id=m.group("sentence_id");
          logging.error(v);
          word_selections=simplejson.loads(v);
          selection[sentence_id]=word_selections;
    return selection        

def compare_sentences(s1,s2):
    """Compare word selections in two sentences. 

    Return 1 if both are empty. 
    Otherwise return the fraction of words that are labeled the same. The best agreement is 1, the worst agreement is 0."""

    total_score=0;
    num_total=0;
    for k in s1:
        num_total+=1
        if k in s2:
            if s1[k]==s2[k]:
                score = 1;
            else:
                score = 0;
        else:
            score = 0;
        total_score += score;
    
    for k in s2:
        if k not in s1:
            num_total+=1

    logging.info("Scored %f out of %d" % (total_score, num_total));

    if num_total==0:
        return 1;
    return float(total_score)/float(num_total)


def compare_word_selection(selection1,selection2):
    """Compare word selections on two sentences. 

    Each sentence present only in one selection set is scored as
    0. The average agreement per sentence is reported.

    If both submissions are empty, they are in agreement.
    """

    num_extra=0;
    num_total=0;
    total_score=0;
    for k in selection1.keys():
        num_total+=1;
        if k not in selection2:
            num_extra+=1;
        else:
            score=compare_sentences(selection1[k],selection2[k]);
            logging.info("Score: %f" % score );
            total_score+=score;

    for k in selection2.keys():
        if k not in selection1:
            num_total+=1;
            num_extra+=1;

    if num_total==0:
        return 0;

    return float(total_score)/float(num_total)
    

def compare_word_selection_submissions(selection1_url,selection2_url):
  try:
    submission1=simplejson.loads(FetchUrlContent(selection1_url));
    submission2=simplejson.loads(FetchUrlContent(selection2_url));
    
    selection1=parse_selection_submission(submission1);
    selection2=parse_selection_submission(submission2);

    score = compare_word_selection(selection1,selection2);
    return score

  except Exception,e:
    logging.error('Caught exception from '+traceback.format_exc(e))                          
    logging.error('Error executing: '+str(e))                          
    raise


def main():
  handler = CGIXMLRPCRequestHandler()
  handler.register_function(compare_word_selection_submissions, 'relevant_words.quality_oracle')
  handler.register_introspection_functions()
  handler.handle_request()

        
if __name__ == "__main__":
    main()
