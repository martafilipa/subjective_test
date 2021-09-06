# -*- coding: utf-8 -*-

import argparse
import pathlib
import os
import sys
import random
import csv
from itertools import combinations
from glob import glob 
from collections import Counter

def check_balanced(list_i):
    list_id = [os.path.basename(x).split('_')[0] for x in list_i]
    c = Counter(list_id)
    return len(set(c.values())) == 1

def complete(list_i):
       return combinations(list_i, 2)
   
def intra(list_i):
    new_dict = {}
    for x in list_i:
        if x.split('_')[0] in new_dict:
            new_dict[x.split('_')[0]].append(x)
        else:
            new_dict[x.split('_')[0]]=[x]
    pair_list = []
    for key in new_dict:
        pair_list.extend(list(combinations(new_dict[key],2)))
    return pair_list

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-f", "--folder", nargs=1, required=True, type=pathlib.Path,
                        help = 'Path to folder containing the test images.')
    
    parser.add_argument("-n","--name", nargs=1, required=False, default="DB_csv",
                        help="CSV file name. Default = DB_csv")
    parser.add_argument("-o", "--out", nargs=1, required=False, default=".", 
                        help="Paht to folder containing CSV file. Default = .")
    parser.add_argument("-e", "--extension", required=False, default='png', 
                        help="Type of files in usage. Exammple: png, jpg, etc. Default = png")
    parser.add_argument("-m","--mode", required=False, default='complete', choices=['complete', 'intra'],
                        help="Method to create the pairs used in the assessment."\
                            "\nComplete - all images are compared with eachother."\
                            "\nIntra - images with the same reference are compared.")
    args = parser.parse_args()
    list_i = sorted(glob(os.path.join(args.folder[0], '*.' + args.extension)))
    if not list_i: 
        sys.exit("There is no files of type "+ args.extension+" in folder "+str(args.folder[0])+'.')
    if not check_balanced(list_i): 
        sys.exit("The design is not balanced, ie, the number of test images derived "\
                "from the same reference image is not uniform.\nThis application only "\
                "supports balanced designs.\nNOTE: Check if nomenclature is: "\
                "{reference id}_{other identifiers}."+args.extension)
    list_basename = [os.path.basename(x) for x in list_i]
    
    if args.mode == 'complete':
        list_pair = complete(list_basename)
    if args.mode == 'intra':
        list_pair = intra(list_basename)
    else: 
        sys.exit("TODO.")
        
    with open('test.csv', mode='w') as output:
        writer = csv.writer(output, lineterminator='\n')
        writer.writerow(['id', 'A', 'B', 'ref_A', 'ref_B'])
        for idx, pair in enumerate(list_pair):
            k = random.randint(0, 1)
            ref_pair = [x.split('_')[0] for x in pair]
            random.shuffle(list(pair))
            writer.writerow([idx, pair[k], pair[1-k], ref_pair[k], ref_pair[1-k]])       
    
if __name__ == '__main__':
    main()


