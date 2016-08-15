'use strict';

var fs = require('fs'), path = require('path');
var azure = require('azure-storage');
var Protocol = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').Client;
var Message = require("azure-iot-device").Message;

var connectionString = '<device connection string>';
var client = Client.fromConnectionString(connectionString, Protocol);
var blobService = azure.createBlobService();
        
var connectCallback = function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');

    //The magic happens here
   
    client.on('message', function (msg) {
    var r = JSON.parse(msg.data);
    client.complete(msg, printResultFor('completed'));     

     function getDirectories(srcpath, plugin_name) {
          return fs.readdirSync(srcpath).filter(function(file) {    
          return fs.statSync(path.join(srcpath, file)).isDirectory() ;
          });
      }

 var dirArray = getDirectories(__dirname + "\\node_modules"); 
 var isPresent=false;
 var searchItem=r.moduleName;
 for (var i=0; i<dirArray.length;i++)
 {
     if(dirArray[i]==searchItem)
     {
         isPresent=true;
         console.log("\n The module that you're searching for ("+ searchItem +")  exists in the system");
         returnfromModule(searchItem,r);
         break;
     }
 }
  
 if(isPresent==false)
 {
    console.log("\n The Pi does not understand this yet ("+ searchItem +")  Hold on.. we are updating the Pi");
    var container = searchItem;
    var destPath = __dirname + "\\node_modules";
    downloadBlobs(container, destPath, function () {
    console.log("download finished");
        
      var cdPath = destPath + "\\" + searchItem;
      var exec = require('child_process').exec;
      var shell = require('shelljs');
      shell.cd(cdPath);
      shell.exec('npm install');
                        
     isPresent=true;
     console.log("The module is present now");  
    
   returnfromModule(searchItem, r);
    });    
 }
   });

    client.on('error', function (err) {
      console.error(err.message);
    });

    client.on('disconnect', function () {
      clearInterval(sendInterval);
      client.removeAllListeners();
      client.connect(connectCallback);
    });
  }
};

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

function returnfromModule(searchItem, r){
      var myModule = require(searchItem);
      var result = myModule[r.method](r.requestName);      
     console.log("The new module returned this - "+ result);
     
        var data = JSON.stringify({
         Received: result
          });   
    var message = new Message(data);
    message.properties.add('myproperty', 'myvalue');
    console.log('Sending message back to the website: ' + message.getData());
    client.sendEvent(message, printResultFor('send'));    
    console.log("---------------------------------------------");
    delete require.cache[require.resolve(searchItem)]
}

function downloadBlobs(containerName, destinationDirectoryPath,func) {
  // Validate directory
  if (!fs.existsSync(destinationDirectoryPath)) {
    console.log("the path does not exist in system");
    console.log(destinationDirectoryPath + ' does not exist. Attempting to create this directory...');
    fs.mkdirSync(destinationDirectoryPath);
    console.log(destinationDirectoryPath + ' created.');
  }
 destinationDirectoryPath =   destinationDirectoryPath+'\\'+containerName;
 fs.mkdirSync(destinationDirectoryPath);
  console.log("Going to download blobs from "+containerName);
  blobService.listBlobsSegmented(containerName, null, function (error, result) {
    if (error) {
      console.log("yes there is error ");
      console.log(error);
    } else {
      var blobs = result.entries;
      var blobsDownloaded = 0;
      blobs.forEach(function (blob) {
          blobService.getBlobToLocalFile(containerName, blob.name, destinationDirectoryPath + '\\' + blob.name, function (error2) {
          blobsDownloaded++;
          if (error2) {
            console.log(error2);
          } else {
            console.log(' Blob ' + blob.name + ' download finished.');

            if (blobsDownloaded === blobs.length) {
              console.log('All files downloaded');
              func();
            }
          }
        }); 
      });
    }
  });
}

client.open(connectCallback); 