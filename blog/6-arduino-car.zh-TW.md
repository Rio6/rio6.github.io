# 用Android + Arduino + Wifi P2P控制的小車 {title}
## 2020-04-07 {date}

再找個以前做的專案放上來吧！這是個用Arduino跟Android加Wifi Direct來無線操控的Arduino小車。 車子端的Android負責把從Wifi Direct接收到的指令以Serial傳給Arduino，並把相機的影像傳回控置端。控置端會把影像顯示在螢幕上並用觸控螢幕來產生指令。Arduino上就是個按指令來動輪子的程式。

Android手機兼用Wifi Direct接在一起。當Wifi Direct不能用時，比如說手機太舊，或是想透過網際網路遙控，可以換成普通Wifi模式連線。在不同機器中間我用了個自己發明的簡單協定來傳輸指令來增加傳訊效率。

\> [Github](https://github.com/Rio6/ArduinoCar)  
\> [影片](https://drive.google.com/open?id=1fRrYWeqpyM9GWmR_WWx4t9prx3W_GbB_)

![](img/arduino-car.png =0x0)
