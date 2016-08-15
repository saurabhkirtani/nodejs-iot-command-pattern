This is a command pattern implementation in Node.JS, which is used to manage and give functionality-on-the-go to Raspberry Pis deployed across locations. Here is a workflow with an example:

1.  There are multiple Raspberry Pis deployed across locations by a company. These Pis are an integral part of an IoT solution, capturing sensor information, processing data and communicating bi-directionally with the cloud.

2.  The company intends to add functionality to the Pi in the following manner:
    -   The added functionality should be given to all the Pis deployed across all of its customers.
    -   The functionality should be added to the Pi remotely.
   An example: let's say the company W has customers X, Y and Z. The company W wants to add a new functionality to all the Pis deployed across X, Y and Z, which lets them know the amount of disk space available on the Pi.
   
### Solution
The architecture of the solution looks like this:

1.  Let's say the company (W) intends to add diskspace functionality to the Pi. Their developers will create a Node module called diskspace (which will export all the relevant data they need) and upload it to cloud storage. Each module will be stored in a separate container, and the container name will be the name of the Node module. For now, please use a storage explorer tool to push the modules to cloud. 
2.  There's a front end which sends commands the Azure IoT Hub. We send the command 'diskspace' to IoT Hub.
3.  There's a single Node.JS program which handles all the tasks. The program listens for commands from the same IoT Hub. It checks - if there's a module already available by that name, it returns the data exported by that module back to the hub. If such a module does not exist, it will download the blob from the cloud storage, store the module locally and then return the data exported by that module back to the IoT Hub.
4.  Once the Node program includes the module and returns the data, it removes the module from its cache - hence any change made locally to the module will be reflected immediately upon the next command sent to the hub remotely. Going further, we will add versioning to modules, which means, the Node program will check for an updated module with a same name from the cloud storage and then proceed further.
5.  Once the data is received by the hub, the front-end can easily capture this data and show it in an application.

A sample node module is provided in the 'sample node module' folder.