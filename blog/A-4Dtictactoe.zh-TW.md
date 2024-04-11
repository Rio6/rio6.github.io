# 4D 圈圈叉叉 {title}
## 2021-02-02 {date}

<img style="display: none;" src="img/ttt.png" />

<div style="
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56%;
">
    <iframe src="https://csclub.uwaterloo.ca/~r345liu" width=400 height=300 style="
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        border: none;
    "></iframe>
</div>

[全螢幕](https://csclub.uwaterloo.ca/~r345liu)

前一陣子跟數學老師聊天的時候聊到了4D的圈圈叉叉，就想要弄個東西出來看看。雖然說網路上已經有很多人做過了，但還是想玩玩。

因為想讓遊戲容易玩，所以我用了WebGL來做。然後語言是聽說TypeScript很好用（比Javascript好用）所以用用看。用了還不錯用，這可能還是我第一次編譯失敗會讓我心情好。網站部份我讓Typescript直接輸出一個AMD bundle然後用[Almond](https://github.com/requirejs/almond)加載。伺服部份則是用Node跑編譯好的js檔。沒什麼特別的，就是不用裝幾百個Webpack/Babel套件就能寫新的語法。

做這個最有趣的當然是4D部份。WebGL剛好有辦法直接算4D矩陣跟其它有的沒的（一般是用來表示3D移動跟縮放）。不過4D中的移動做放就不能用一個矩陣表示了，得用另外的向量來表示。多出的位子放的就是放最重要的4D旋轉。

要在2D螢幕上畫4D棋盤我就先把每個點投影到`w = 0`的平面上，離越遠縮越小。然後再套用一般的3D透視矩陣來至少讓3D的部份容易看一點。

我覺得4D最好玩的就是旋轉了，在多個平面上同時旋轉最能跟腦袋說一個物品有超過3維。我這個圈圈叉叉除了有繞著`wx`, `wy`, `wz`三個平面旋轉之外，還是有一般的3D `x`, `y`旋轉來讓遊戲棋盤沒那麼暈。就當作是在把一個3D鏡頭繞著4D投影移動唄。

我另外還加了4D棋盤在3D跟2D的「切片」，所以可以用三個3D棋盤或是九個2D棋盤來表示整個遊戲。我圈跟叉用的形狀讓這個蠻容易弄的，就只要把4透視關掉，再讓每層在畫的時候把屬於那層的東西去掉就好了。這樣切是讓遊戲比較容易玩，不過我個人還是喜歡玩4D模式，訓練腦袋的4D想像力。

圈圈叉叉大部分的規則在不同維度中都一樣，比如說一次只能放一個圈或叉，而且只能放在空格之類的。比較難的是要檢查三格連成的線。4D棋盤不像2D，我不能再腦中想像棋盤上的每條線然後把他們轉化成座標索引，腦袋不夠大（4D比3D還大無限倍，而我的腦袋是3D物品）。再說每加一個維度，可以連的線就增加好幾倍。我是沒有真的去算過，不過感覺有幾百個。看了[PBS Infinite Series](https://www.youtube.com/watch?v=FwJZa-helig)找靈感後，我想說就弄個迴圈把每個格子都跑一遍，然後找到每格可以延伸成三連線的軸。比如說在`[0, 1, 2, 1]`，它的方向就是`x`跟`-z`軸（`x`是線的開始`0`，`z`是線的結尾`2`）。這些軸的組合就會是所有從這格延伸出去的方向。像是`x`跟`-z`軸的方向就會是`[1, 0, 0, 0]`, `[0, 0, -1, 0]`, `[1, 0, -1, 0]`。這些組合其實滿好找的，就是二進位數數。找到方向後就只要沿著線數圈叉就可以檢查贏家了。這整個過程其實沒什麼效率，因為有些線會被數兩次。不過這樣保持程式碼簡單，而且對圈圈叉叉來說也夠快了。

這遊戲還有多人模式（因為懶得寫四維AI）。我就再伺服上建個棋盤，然後讓玩家用Websocket把位置傳過去和接收遊戲狀態。圈圈叉叉不需要很多流量，所以可以直接把整個遊戲打包成JSON傳，也好寫。

總之，4D大概是我最喜歡的維度。它在腦袋裡很難想像，可是真的要計算又沒那麼難。然後做4D圈圈叉叉也好玩。

程式碼有放Github: [Rio6/4D-TicTacToe](https://github.com/Rio6/4D-TicTacToe).