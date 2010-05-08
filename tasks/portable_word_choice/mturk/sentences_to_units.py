#!/opt/local/bin/python
###/usr/bin/env python

import sys
import simplejson as json

sentences_filename=sys.argv[1]
sentences=open(sentences_filename,'r').readlines();

for iTask in range(0,len(sentences)/5):
    task_file=open('unit_%04d.txt' % iTask,'w');

    task_data={}
    for iSentence in range(iTask*5,min((iTask+1)*5,len(sentences))):
        task_data["sentence%d" % iSentence]=sentences[iSentence].strip()
        print sentences[iSentence].strip()

    json.dump(task_data,task_file)


    
