#!/usr/bin/env python

import unittest
import xmlrpclib

srv="http://portabletasks.appspot.com"
data_srv = "http://portabletasks.appspot.com"

class RpcCall(unittest.TestCase):

    def setUp(self):
        self.srv = xmlrpclib.Server(srv+"/word_choice_oracle/")

    def test_quality_rpc_oracle(self):
        self.assertTrue("relevant_words.quality_oracle" in set(self.srv.system.listMethods()))

        # call the comparisons and compare the results
        q12=self.srv.relevant_words.quality_oracle(data_srv+"/word_choice_data/submissions/s_0001.json",data_srv+"/word_choice_data/submissions/s_0002.json")
        q21=self.srv.relevant_words.quality_oracle(data_srv+"/word_choice_data/submissions/s_0002.json",data_srv+"/word_choice_data/submissions/s_0001.json")
        q11=self.srv.relevant_words.quality_oracle(data_srv+"/word_choice_data/submissions/s_0001.json",data_srv+"/word_choice_data/submissions/s_0001.json")

        self.assertAlmostEqual(q12,0.7,3)
        self.assertAlmostEqual(q12,q21,3)
        self.assertAlmostEqual(q11,1.0,3)

if __name__ == '__main__':
    unittest.main()




