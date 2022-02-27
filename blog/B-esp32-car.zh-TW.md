# ESP32 遙控車 {title}
## 2021-02-22 {date}

由於COVID關係，我再開學前多了一些時間在家可以做個東西玩玩。所以就想說把之前的[Arduino
小車](6-arduino-car.zh-TW.html)重新做一遍。

![](img/espcar.jpg =100%x*)

我主要想加的功能有：
- 減低視訊延遲
- 新增音訊串流（未完成）
- 利用自製電路把馬達控制，音訊放大，電源供應等功能結合到一塊板子上

我這次又是用 ESP32 來做。ESP32 的 wifi 功能和 ESP-IDF
的各種程式很好用，尤其是我用的 ESP32-CAM 板子還自帶相機讓它很適合用在這台車上。

<center>
![](img/espcar-sch.png =100%x*)

控制版電路圖
</center>

因為我本來想要加音訊的關係，我把 ESP32-CAM 的一個 LED
拔了，然後再把相機控制線接到永遠是開著的狀態來把 GPIO32 跟 GPIO23 空出來用它們的
ADC。（不過到最後沒有時間把音訊搞好所以沒用到）。

除此之外，就是把各個部件跟 ESP32 的 IO
接腳連起來。我用了個原型板來組這個電路，實體接線有一點亂不過還能用。

音訊電路我是有再麵包板上測試過，是能把麥克風訊號放到大約 1V
左右的振幅。可是不知道為什麼到了原型板上就量不到了。由於我那時只剩幾天的時間就要出門了，
就想說先把音訊的部份放著，其他部份做好先。

馬達控制氣用的是 LD293D，透過 ESP-IDF 的 MCPWM 程式庫控制。

之前做[我的望遠鏡](/9/-telescope.zh-TW.html) 時 Solidworks
讓我打不開我自己的檔案，讓我不想用它。所以這次我用 FreeCAD
做了個架子來把整個板子立在車上。我還做了對耳朵來放麥克風，
不過後來音訊沒時間弄所以沒裝起來。

<center>
![](img/car-freecad.png =100%x*)

FreeCAD 模型
</center>

這台車軔體主要有兩個部份：一個視訊任務把相機緩衝裡的資料透過網路送出去；
一個控制任務來接受來自網路的指令然後控制馬達。這兩個任務都是用 ESP-IDF 給的 FreeRTOS
來管理。由於我覺得資造包比串流好用，網路跟指令我都用 UDP 在傳。除此之外，UDP
還有低延遲的好處。（我是希望 SCTP 能有多一點人用，要不是 LWIP
不支持的話我指令部份就用它了）。

影片的話偶爾掉幾幀沒什麼關係，所以只用 UDP 沒什麼問題。我試著把 JPEG
串流直接丟給 ffplay 居然可以直接播。（用 JPEG
格式是因為相機支持，然後又有壓縮過，所以 FPS 可以比較高）。

<center>
<iframe width="560" height="315" style="width: 100%" src="https://www.youtube.com/embed/SgkToEtFtQo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

透過 UDP 傳送的視訊
</center>

控制指令部份我用了個簡單的機制來確保小車是處於遠端控制想要的狀態。基本上就是軔體每隔
一段時間就會把自己的狀態傳送給控制端，如果控制端接收到的狀態跟它想要的狀態不一樣的話
它就會送出需要的指令來讓它變一樣。在這之外我還放了個類似看門狗的計時器來在超過一段時
間沒收到資料的情況下把所有馬達停止。這個機制在網路流量方面來看不是最有效率的，不過算
是個在 UDP 下保證指令抵達目的地的簡單辦法。

出門前最後一天我寫了個 Python 程式來當控制端。Python
有一堆有的沒的套件可以直接用，像是 `socket`、`struct`、`subprocess`
的功能就可以把從 UDP 傳來的視訊丟給 ffplay 播；`pynput` 可以不用 GUI
或是遊戲引擎就能拿到滑鼠鍵盤的輸入； 再加上 `dnspython` 可以透過 MDNS
來找到區網上的 ESP32。我只要寫個簡單的程式就可以做出控制端。不是很花俏，能用就好。

我這次主要的問題其實是用了線性穩壓器。Wifi 其實會用很多電（大約幾百毫安），然後我
又得把電池的8伏轉成3.3伏，這麼大的電壓差加上電流導致很多能源變成熱浪費掉了。這也是
為什麼我最後沒有接伺服馬達的原因。下次應該用開關式穩壓器來提供電源。

不過整體說還算是成功，跟之前 Android + Arduino
的小車比起來延遲低很多。我對於能在出門又弄一台遙控車出來還算是滿意。

程式碼、電路圖跟3D模型都有放在 [Github](https://github.com/Rio6/ESPCar) 上。
