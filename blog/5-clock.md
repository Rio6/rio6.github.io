# ESP32 Alarm Clock - ESP32 鬧鐘
## 2020-03-09

A long time ago I bought an ESP32 microcontroller. Not sure what to do with it, so it ended up being an alarm clock. It can do: Automatically adjusting time (including that annoying daylight saving time), grabbing weather data from [openweathermap.org](http://openweathermap.org/), weekly and daily alarms, auto brightness (using a photoresistor). To control it, aluminum foils are taped onto the side and connected via wires. When they touch a finger, the capacitance change can be detected by ESP32. It was coded in C

好久以前買了個ESP32，不知道要拿來幹嘛所以就變成鬧鐘了。功能有：自動連網對時、天氣顯示(使用[openweathermap.org](http://openweathermap.org/))、可按照禮拜設定的鬧鐘、自動亮度調整（用了光敏電阻）。按鈕是把鋁箔紙用膠帶貼在電線尾端然後接到ESP32的電容感應，程式碼是用C寫的。

[Github](https://github.com/Rio6/ESPClock)

![](img/clock-shelf.jpg =49%x*)
![](img/clock-front.jpg =49%x*)
![](img/clock-inside.jpg =100%x*)
