#!/usr/bin/env python

import sys

sentences_filename=sys.argv[1]
sentences=open(sentences_filename,'r').readlines();

for iTask in range(0,len(sentences)/5):
    task_file=open('unit_%04d.txt' % iTask,'w');
    print >>task_file,'{',
    for iSentence in range(iTask*5,min((iTask+1)*5,len(sentences))):
        print >>task_file,'"sentence%d":"%s",' % (iSentence,sentences[iSentence].strip()),
    print >>task_file,'}'
    task_file.close();
    
