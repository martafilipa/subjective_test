# Image Pairwise Comparison Assessment App

A Web Application for subjective image quality assessment using a force choice pairwise comparison design. 

## Getting Started

### Installation

- Clone this repo
- Install [NodeJS](https://nodejs.org/en/)
- Install [MongoDB Community](https://docs.mongodb.com/manual/administration/install-community/) and start service
- [Optional] Install [Compass GUI](https://www.mongodb.com/products/compass)

### Testing with provided images

In the repository directory run the following command to initiate the web server: 
````
node app.js
````
Populate the `pairs` and `trains` collections in the database. This can be done: 
- Using Compass GUI
- Using shell

#### Using Compass GUI

`Select collection > Add data > Import File` 

For the `pairs` collection select the `test_compass.csv` and for the `trains` collection select the `trains_compass.csv`. These CSV files can be found in [database](database/) folder.

Note: guarantee that data types are correct by consulting the schema [here](#preparing-the-database). 

#### Using Shell

Without the graphical interface the collections can be populated by simply running the following commands in the repo dir: 

```
mongoimport --type csv -d test -c trains --headerline --columnsHaveTypes --file ./database/trains_shell.csv
```

```
mongoimport --type csv -d test -c pairs --headerline --columnsHaveTypes --file ./database/pairs_shell.csv
```

The result should be the insertion of 456 documents in the `pairs` collection and 3 documents in the `trains` collection. 

With the server running and the database updated, try access the webpage.

## Custom Subjective Assessments

### Preparing the test images

This application targets displays of resolution greater than or equal to `1080p`. As such, the recommended test image size is `940 x 880`.

The image files are to be saved in the [public/images/test](public/images/test) folder and are to follow this naming convention: 

`{reference image ID}_{other identifiers}.{file extension}`

**Example:** `00001_HiFiC_lo.png`

### Preparing the database

The database is composed of 3 collections: 
- [sessions](database/sessions.png)
- [pairs](atabase/pairs.png)
- [trains](database/trains.png)

The `sessions` collection contains the data of each user and it's updated by the webapp during runtime. 

The `pairs` and `trains` collections on the other hand are define beforehand and are used to identify the pairs included in the test. These collections need to be populated by the user according to the desired subjective test. This is done by providing a .csv file to the database. 

The `DB_csv_creator.py` script in [database/](database/) folder provides an easy way to get the CSV file to populate the `pairs` collection for a given dataset. 

Example of usage: 

```
python ./database/DB_csv_creator.py --name pairs_shell --folder ./public/images/test \
       --database shell --mode complete --out ./database
```

Note: other functions to create the test pairs can be implemented simply adding a new `mode` option. Currently only supporting complete design (`complete`) and complete design for test material sharing the same reference image (`intra`).

Regarding the `trains` collection and its CSV files, its typically manually constructed. This is due to the fact that the examples are very few resulting in only a couple of lines in the CSV file. 

These files are used to populate the `pairs` and `trains` collections as described [here](#testing-with-provided-images).

### Other changes 

In order to add a different text to the instructions page the `index.pug` file in the [views/](views/) folder needs to be changed. 

The color scheme and other aspects of the design can be tweaked by changing the `style.css` file in the [views/](views/).
