# 自製望遠鏡 {title}
## 2020-08-16 {date}

![](img/telescope/telescope.jpg =100%x*)

學校金工課需要想個東西來做，想說來做做望遠鏡。望遠鏡我好幾年前在[吳俊輝教授的望遠鏡DIY營隊](https://www.ylib.com/scientific/activity/201311Telescopediy/index.htm)有做過，不過那次是按著已經設計好的規格把材料拼裝起來，這次我想要自己設計和計算尺寸。

因為是金工課，當然是做金屬製望遠鏡。網路上逛了逛找到了這個 [Gary Seronik 做的望遠鏡](https://garyseronik.com/a-converted-starblast-travelscope/)。看起來蠻不錯的，所以我也用了同種設計。不過他的主鏡大小只有4 1/2"，然後我前一個望遠鏡已經是114mm口徑了，所以想做個大一點的。拿張紙算算再拿個尺比比後決定用75mm口徑，焦距150mm的主鏡。[Newt for the Web](https://stellafane.org/tm/newt-web/newt-web.html) 跟 [Diagonal Off-Axis Illumination Calculator](http://www.bbastrodesigns.com/diagonal.htm) 在算尺寸時也很有用。

<center>紙上算算的過程</center>
![](img/telescope/sketch1.jpg =32%x*)
![](img/telescope/sketch0.jpg =32%x*)
![](img/telescope/sketch2.jpg =32%x*)

結構滿簡單的。管子部份用兩片鋁片捲起來後用鉚釘釘住，用個L型鋁棒接起來。主副鏡架參考了 Seronik 的設計，用 CNC 車床跟 3D 印表機做。

<div markdown=1 style="display: inline-block; width: 49%; vertical-align: top">
<center>主鏡架</center>
![](img/telescope/primary.jpg =100%x*)
</div>
<div markdown=1 style="display: inline-block; width: 49%; vertical-align: top">
<center>副鏡架</center>
![](img/telescope/secondary.jpg =100%x*)
</div>

鏡面的部份由於我沒自己磨過，也沒有器材，所以從[AgenaAstro](https://agenaastro.com/)買了一個GSO 6" f/5的主鏡加50mm副鏡。目鏡淘寶上買。

對焦器花了我比較多時間。本來我打算用3D印表機印一個以折疊方式來對焦的對焦器，可是印出來的結果太晃了很難用，而且轉盤的設計跟本沒辦法移動對焦。這時剛好遇到病毒流行學校關門，3D印表機也沒得用了，沒辦法印第二版。家裡也沒看到什麼能用的來做 Crayford 對焦器，到最後乾脆直接拿水管轉接頭來用，還算是可以用。

<div markdown=1 style="display: inline-block; width: 49%; vertical-align: top">
<center>原本想弄的</center>
![](img/telescope/focuser0.jpg =100%x*)
</div>
<div markdown=1 style="display: inline-block; width: 49%; vertical-align: top">
<center>後來弄的</center>
![](img/telescope/focuser1.jpg =100%x*)
</div>

08/20 更新：  
找到了一些水管來做 Crayford 對焦器，還不錯用。
![](img/telescope/crayford.jpg =100%x*)

2021/7/13 跟新：  
自己買了台創想的 [Ender-3 Pro](https://www.creality.com/goods-detail/ender-3-pro-3d-printer) 3D印表機，所以就花了點時間又設計了一個對焦器。模型我是用Solidworks設計，結果弄一半學校給的啟用碼過期，我連我自己花了一堆時間做的檔案都打不開。到最後我只好用遠端桌面的方式連到學校電腦完成…我覺得以後自己個人作品還是避免用這些貴得要命的產品好。

![](img/telescope/focuser_new0.jpg =49%x*)
![](img/telescope/focuser_new1.jpg =49%x*)

校准用的是眼球校對法—看起來有對齊就是有對齊。主鏡的角度用手轉幾個旋鈕就可以調整了，副鏡的弧形蜘蛛架直接用手扳到對的位子再用螺絲微調，調的時候發現副鏡座做太長了，把頂端切掉了一公分左右就差不多。

這台望遠鏡用起來還不錯。雖然我只有塑膠腳架所以東西看起來很晃，然後中間空空的部份會讓觀測受到附近光源影響，不過看土星木星月亮什麼的都滿清楚的，亮度比前一台亮，視野也比較廣。可是想拍照的話就有點麻煩了。一開始試著用網路攝影機來拍照，可是效果不太好。網路上看到有目鏡手機架這種東西，自己做了個試試還用的了。

<center>手機架</center>
![](img/telescope/phone.jpg =49%x*)
![](img/telescope/phone_mount.jpg =49%x*)

這裡放些拍到的照片。我家光害大，加上手機不夠專業所以只有太陽系內的明亮天體。用錄影的方式來收集幾百到一兩千幀圖像，然後用 [PIPP](https://sites.google.com/site/astropipp/) => [Autostakkert](https://www.autostakkert.com/) => [RegiStax](https://www.astronomie.be/registax/) => [GIMP](https://www.gimp.org/) 來把它們疊起來、加深細節、顏色平衡等等。我目前還是菜鳥所以得出的圖還是破破的（而且相機APP的解析好像沒設成最高，連月亮都糊糊的）。不過至少看的出拍的是什麼天體。直接看是可以看到很多肉眼看不到的星星，仙女座河系淡淡的一坨看得到，不過比 Neowise 彗星還淡。

<div markdown=1 style="display: inline-block; width: 49%; vertical-align: top">
<center>木星</center>
![](img/telescope/jupiter.png =100%x*)
</div>
<div markdown=1 style="display: inline-block; width: 49%; vertical-align: top">
<center>土星</center>
![](img/telescope/saturn.png =100%x*)
</div>
<div markdown=1 style="display: inline-block; width: 49%; vertical-align: top">
<center>火星</center>
![](img/telescope/mars.png =100%x*)
</div>
<div markdown=1 style="display: inline-block; width: 49%; vertical-align: top">
<center>月亮</center>
![](img/telescope/luna.jpg =100%x*)
</div>

結論：自己做望遠鏡很酷很好玩，之後再看看要不要幫它做個自動追星雲台。
