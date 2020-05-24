# RC Car with Android, Arduino, Wifi P2P {title}
## 2020-04-07 {date}

Putting another old project of mine here. This is a remote controlled car using Arduino and Wifi Direct on Android. On the car side, an Android phone forwards the commands it got from the controller to Arduino using serial connection, and returns the image data from its camera to the controller. On the controller side, it displays the images, and uses touch screen to generate the commands. The program on the Arduino parses the commands and moves the wheels accordingly.

The connection between the Android phones is established by wifi direct. The app can also fall back to use normal wifi connection, so it can still be used on older phones or over the internet (ie., controlling and viewing from the car at home from anywhere in the world). I also made my own protocol to send the commands between the devices to inprove the efficiency.

\> [Github](https://github.com/Rio6/ArduinoCar)  
\> [Video](https://drive.google.com/open?id=1fRrYWeqpyM9GWmR_WWx4t9prx3W_GbB_)

![](img/arduino-car.png =0x0)
